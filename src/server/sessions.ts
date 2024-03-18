import * as fs from "fs";
import * as cheerio from "cheerio";
import { fetchAndSaveHtml, fetchAndSaveJSON } from "./utils";
import { getMetadata } from "./persons";
import { Callout, Ordercall, Person, Persons, Session, SpeakerSection, extractName, periods } from "../common/common";
import { extractCallouts, extractOrdercalls, extractSections, resolveOrdercalls, resolveUnknownSpeakers } from "./extraction";

interface RawSessions {
    pages: number;
    count: number;
    header: { label: string }[];
    rows: any[][];
}

export async function processSessions(persons: Persons, baseDir: string) {
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

        const session: Session = {
            url: "https://parlament.gv.at" + row[1],
            period: row[2],
            sessionNumber: row[4],
            sessionLabel: row[5],
            date: row[9],
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

    const toProcess = [...sessions];
    let processed = 0;
    while (toProcess.length > 0) {
        // Parlament server has the most aggressive fucking rate limiting I've ever seen.
        // All we are doing here is fetching the static HTML content of parlament session
        // stenography protocols. Those should be CDN'ed up the wazoo. Nope...
        let batch = toProcess.splice(0, 5);
        const batchSize = batch.length;
        batch = batch.filter((session) => session.protocolUrls.some((url) => url.endsWith(".html")));
        const filesAndUrls = batch.map((session) => {
            const htmlUrl = session.protocolUrls.find((url) => url.endsWith(".html"))!;
            const htmlFile = `${baseDir}/sessions/` + session.date.split("T")[0] + "-" + session.period + "-" + session.sessionNumber + ".html";
            const jsonUrl = `https://www.parlament.gv.at/gegenstand/${session.period}/NRSITZ/${session.sessionNumber}?json=true`;
            const jsonFile =
                `${baseDir}/sessions/` + session.date.split("T")[0] + "-" + session.period + "-" + session.sessionNumber + ".json.original";
            return { htmlFile, htmlUrl, jsonFile, jsonUrl, session };
        });

        // Fetch .html files
        let promises = filesAndUrls.map((url) => {
            if (fs.existsSync(url.htmlFile)) return Promise.resolve();
            return fetchAndSaveHtml(url.htmlUrl, url.htmlFile);
        });
        await Promise.all(promises);

        // Fetch session JSONs from parliament site, not ours
        promises = filesAndUrls.map((url) => {
            if (fs.existsSync(url.jsonFile)) return Promise.resolve();
            return fetchAndSaveJSON(url.jsonUrl, url.jsonFile);
        });
        await Promise.all(promises);

        for (const session of filesAndUrls) {
            session.session.sections = await extractSections(session.htmlFile, session.session.period, persons);
            session.session.orderCalls = await extractOrdercalls(session.jsonFile, session.session, persons);
            await resolveUnknownSpeakers(session.session);
            fs.writeFileSync(session.htmlFile.replace(".html", ".json"), JSON.stringify(session.session, null, 2), "utf-8");
        }

        processed += batchSize;
        console.log("Processed " + processed + "/" + sessions.length + " protocols");
    }

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
    await resolveOrdercalls(sessions, persons);
    fs.writeFileSync(`${baseDir}/persons.json`, JSON.stringify(persons.persons, null, 2), "utf-8");
    fs.writeFileSync(`${baseDir}/sessions.json`, JSON.stringify(sessions, null, 2), "utf-8");
    return { sessions, persons };
}
