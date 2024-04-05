import * as fs from "fs";
import * as cheerio from "cheerio";
import { fetchAndSaveHtml, fetchAndSaveJSON } from "./utils";
import { getMetadata } from "./persons";
import { Callout, Ordercall, Person, Persons, Session, SpeakerSection, extractName, periods } from "../common/common";
import { extractCallouts, extractOrdercalls, extractSections, resolveOrdercalls } from "./extraction";

interface RawSessions {
    pages: number;
    count: number;
    header: { label: string }[];
    rows: any[][];
}

export async function processSessions(
    persons: Persons,
    baseDir: string,
    extractSectionsFn: (filePath: string, period: string, persons: Persons) => Promise<SpeakerSection[]> = extractSections
) {
    if (baseDir.endsWith("/")) {
        baseDir = baseDir.slice(0, -1);
    }
    if (!fs.existsSync(baseDir)) {
        fs.mkdirSync(baseDir, { recursive: true });
    }

    const response = await fetch("https://www.parlament.gv.at/Filter/api/filter/data/211?js=eval&showAll=true&export=true", {
        method: "POST",
        body: JSON.stringify({
            NBVS: ["NRSITZ"],
        }),
    });
    if (!response.ok) {
        console.error(await response.text());
        process.exit(-1);
    }

    const rawSessions = (await response.json()) as RawSessions;
    rawSessions.rows.sort((a, b) => (b[9] as string).localeCompare(a[9] as string));

    const sessions: Session[] = [];
    for (const row of rawSessions.rows) {
        if (!periods.has(row[2])) {
            continue;
        }

        const urlRegex = /href="([^"]+)"/g;
        const urls: string[] = [];
        let match: RegExpExecArray | null;

        while ((match = urlRegex.exec(row[10])) !== null) {
            const url = match[1];
            if (url.endsWith(".html") || url.endsWith(".pdf")) {
                urls.push("https://parlament.gv.at" + url);
            }
        }

        if (!urls.some((url) => url.endsWith(".html"))) {
            console.log("No final protocol for session " + row[9].split("T")[0] + "-" + row[2] + "-" + row[4]);
            continue;
        }

        const session: Session = {
            url: "https://parlament.gv.at" + row[1],
            date: row[9],
            period: row[2],
            sessionNumber: row[4],
            sessionLabel: row[5],
            protocolUrls: urls,
            orderCalls: [],
            sections: [],
        };
        sessions.push(session);
    }

    sessions.sort((a: Session, b: Session) => {
        if (a.period == b.period) return b.sessionNumber - a.sessionNumber;
        return b.date.localeCompare(a.date);
    });

    // Delete all old .json files, we reprocess the .html files if they are
    // already on disk
    if (fs.existsSync(`${baseDir}/sessions`)) {
        fs.readdirSync(`${baseDir}/sessions`)
            .filter((file) => file.endsWith(".json"))
            .map((file) => fs.rmSync(`${baseDir}/sessions/${file}`));
    } else {
        fs.mkdirSync(`${baseDir}/sessions`, { recursive: true });
    }

    // Create metadata objects with file and url paths. Ignore sessions without protocol URL pointing to .html
    const sessionInfos = sessions
        .map((session) => {
            const htmlUrl = session.protocolUrls.find((url) => url.endsWith(".html"))!;
            const htmlFile = `${baseDir}/sessions/` + session.date.split("T")[0] + "-" + session.period + "-" + session.sessionNumber + ".html";
            const jsonUrl = `https://www.parlament.gv.at/gegenstand/${session.period}/NRSITZ/${session.sessionNumber}?json=true`;
            const jsonFile =
                `${baseDir}/sessions/` + session.date.split("T")[0] + "-" + session.period + "-" + session.sessionNumber + ".json.original";
            return { htmlFile, htmlUrl, jsonFile, jsonUrl, session };
        })
        .filter((item) => item.htmlUrl);

    const toProcess = [...sessionInfos];
    let processed = 0;
    while (toProcess.length > 0) {
        // Parlament server has the most aggressive fucking rate limiting I've ever seen.
        // All we are doing here is fetching the static HTML content of parlament session
        // stenography protocols. Those should be CDN'ed up the wazoo. Nope...
        let batch = toProcess.splice(0, 5);
        const batchSize = batch.length;
        batch = batch.filter((session) => session.session.protocolUrls.some((url) => url.endsWith(".html")));

        // Fetch .html files
        let promises = batch.map((url) => {
            if (fs.existsSync(url.htmlFile)) return Promise.resolve();
            return fetchAndSaveHtml(url.htmlUrl, url.htmlFile);
        });
        await Promise.all(promises);

        // Fetch session JSONs from parliament site, not ours
        promises = batch.map((url) => {
            if (fs.existsSync(url.jsonFile)) return Promise.resolve();
            return fetchAndSaveJSON(url.jsonUrl, url.jsonFile);
        });
        await Promise.all(promises);

        for (const session of batch) {
            session.session.sections = await extractSectionsFn(session.htmlFile, session.session.period, persons);
            fs.writeFileSync(session.htmlFile.replace(".html", ".json"), JSON.stringify(session.session, null, 2), "utf-8");
        }

        processed += batchSize;
        console.log("Processed " + processed + "/" + sessionInfos.length + " protocols");
    }

    // Second pass. We now have all sessions and their sections, and resolved speakers.
    // However, the speakers may lack periods assigned to them. Let's assign them based
    // on when they spoke.
    for (const session of sessionInfos) {
        for (const section of session.session.sections) {
            const person = section.speaker as Person;
            if (person.periods == undefined) {
                person.periods = [];
            }
            if (!person.periods.includes(session.session.period)) {
                person.periods.push(session.session.period);
                person.periods.sort();
            }
        }
    }

    // Third pass. We've now collected all speakers, including those not returned by the
    // "parlamentarier seit 1918" API endpoint. We can now extract:
    // 1. callouts (relies on Persons instance to lookup based on name)
    // 2. ordercalls (also relies on Persons instance)
    // 3. reolve ordercalls (requires all sections to be known and persons)
    console.log(">>> Extracting callouts");
    for (const session of sessionInfos) {
        for (const section of session.session.sections) {
            section.callouts = await extractCallouts(section.text, session.session.period, persons);
        }
    }
    console.log(">>> Extracting ordercalls");
    for (const session of sessionInfos) {
        session.session.orderCalls = await extractOrdercalls(session.jsonFile, session.session, persons);
    }
    console.log(">>> Resolving ordercalls to sections");
    await resolveOrdercalls(baseDir, sessions, persons);

    // Merge the parliament folks with folks that may not have been in the parliament
    // list, and replace speaker objects with their ids to conserve space.
    const newPersons = new Map<string, Person>();
    for (const person of persons.persons) {
        newPersons.set(person.id, person);
    }
    for (const session of sessions) {
        for (const ordercall of session.orderCalls) {
            ordercall.person = (ordercall.person as Person).id;
        }
        for (const section of session.sections) {
            if (typeof section.speaker == "string") throw new Error("Section speaker given as id, this should not happen");
            if (!newPersons.has(section.speaker.id)) {
                newPersons.set(section.speaker.id, section.speaker);
            }
            section.speaker = section.speaker.id;
            for (const callout of section.callouts) {
                if (callout.caller) {
                    if (typeof callout.caller == "string") throw new Error("Callout caller given as id, this should not happen");
                    if (!newPersons.has(callout.caller.id)) {
                        newPersons.set(callout.caller.id, callout.caller);
                    }
                    callout.caller = callout.caller.id;
                }
            }
        }
    }

    persons = new Persons(Array.from(newPersons.values()));
    fs.writeFileSync(`${baseDir}/persons.json`, JSON.stringify(persons.persons, null, 2), "utf-8");
    fs.writeFileSync(`${baseDir}/sessions.json`, JSON.stringify(sessions, null, 2), "utf-8");
    return { sessions, persons };
}
