import * as fs from "fs";
import * as cheerio from "cheerio";
import { fetchAndSaveHtml, fetchAndSaveJSON } from "./utils";
import { getMetadata } from "./persons";
import { Callout, Ordercall, Person, Persons, Session, SpeakerSection, extractName, periods } from "../common/common";

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
        batch = batch.filter((session) => session.protocolUrls.some((url) => url.endsWith(".html")));
        const filesAndUrls = batch.map((session) => {
            const url = session.protocolUrls.find((url) => url.endsWith(".html"))!;
            const file = `${baseDir}/sessions/` + session.date.split("T")[0] + "-" + session.period + "-" + session.sessionNumber + ".html";
            const jsonUrl = `https://www.parlament.gv.at/gegenstand/${session.period}/NRSITZ/${session.sessionNumber}?json=true`;
            const jsonFile =
                `${baseDir}/sessions/` + session.date.split("T")[0] + "-" + session.period + "-" + session.sessionNumber + ".json.original";
            return { file, url, jsonFile, jsonUrl, session };
        });

        // Fetch .html files
        let promises = filesAndUrls.map((url) => {
            if (fs.existsSync(url.file)) return Promise.resolve();
            return fetchAndSaveHtml(url.url, url.file);
        });
        await Promise.all(promises);

        // Fetch session JSONs from parliament site, not ours
        promises = filesAndUrls.map((url) => {
            if (fs.existsSync(url.jsonFile)) return Promise.resolve();
            return fetchAndSaveJSON(url.jsonUrl, url.jsonFile);
        });
        await Promise.all(promises);

        for (const session of filesAndUrls) {
            await extractSections(session.session, session.file, persons);
        }

        processed += batch.length;
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
    fs.writeFileSync(`${baseDir}/persons.json`, JSON.stringify(persons.persons, null, 2), "utf-8");
    fs.writeFileSync(`${baseDir}/sessions.json`, JSON.stringify(sessions, null, 2), "utf-8");
    return { sessions, persons };
}

function extractCallouts(text: string, period: string, persons: Persons) {
    const callouts: Callout[] = [];
    const regex = /\(.*?\)/g;
    const matches = text.match(regex) ?? [];
    for (const match of matches) {
        ("Abg. Loacker begibt sich zum Redner:innenpult, um die Tafel zu lesen.");
        const calloutText = match.replace("(", "").replace(")", "").replace(":innen", "innen").trim();
        const parts = calloutText.split("–").map((part) => part.trim().replace(/\n/g, " "));
        for (const part of parts) {
            if (!/\s/.test(part)) continue;

            if (part.startsWith("Abg. ")) {
                const caller = part.split(":")[0];
                const call = part.split(":")[1]?.trim();
                if (!call) {
                    if (!/\s/.test(part.replace("Abg. ", ""))) {
                        continue;
                    }
                    callouts.push({
                        text: part
                            .trim()
                            .replace(/\u00AD/g, "")
                            .replace(/\xa0/g, " "),
                    });
                } else {
                    // Fix typos in protocol...
                    const name = caller
                        .trim()
                        .replace("Diemek", "Deimek")
                        .replace("Dei- mek", "Deimek")
                        .replace("Wes-ten", "Westen")
                        .replace("Westentaler", "Westenthaler")
                        .replace("Künsberg-Sarre", "Sarre")
                        .replace("Höbarth", "Höbart")
                        .replace("haberzettl", "Haberzettl")
                        .replace("Petzer", "Petzner")
                        .replace("Grilltisch", "Grillitsch")
                        .replace("Buchner", "Bucher")
                        .replace("Räd- ler", "Rädler")
                        .replace("Dr. graf", "Dr. Graf")
                        .replace("Baumgarnter-Gabitzer", "Baumgartner-Gabitzer")
                        .replace("Spingelegger", "Spindelegger")
                        .replace("Mag. Hans Moser", "Mag. Johann Moser")
                        .replace("Dr. Paritk-Pablé", "Dr. Partik-Pablé")
                        .replace("- ", "-")
                        .replace(/\u00AD/g, "")
                        .replace(/\xa0/g, " ")
                        .trim();

                    const person = persons.searchByGivenAndFamilyName(name, period);

                    if (!person) {
                        console.log("\nCould not find caller '" + name + "'\n" + part + "\n");
                        callouts.push({
                            text: part
                                .trim()
                                .replace(/\u00AD/g, "")
                                .replace(/\xa0/g, " "),
                        });
                        continue;
                    }

                    callouts.push({
                        caller: person,
                        text: call
                            .trim()
                            .replace(/\u00AD/g, "")
                            .replace(/\xa0/g, " "),
                    });
                }
            } else {
                if (part.trim().length < 4) continue;
                callouts.push({
                    text: part
                        .trim()
                        .replace(/\u00AD/g, "")
                        .replace(/\xa0/g, " "),
                });
            }
        }
    }
    return callouts;
}

function mergeSubsequentNewlines(input: string): string {
    return input.replace(/\n{3,}/g, "\n\n");
}

function removePageHeader(input: string): string {
    input = mergeSubsequentNewlines(input);
    const pattern = /\n\nNationalrat.*? \/ Seite \d+\n\n/gs;
    return input.replace(pattern, "\n\n");
}

function extractLinks(el: cheerio.Cheerio<cheerio.Element>): { label: string; url: string }[] {
    const links: { label: string; url: string }[] = [];
    el.find("a").each((index, element) => {
        const $element = cheerio.load(element.cloneNode(true));
        const label = $element.text().trim();
        const url = element.attribs["href"] ?? "";
        if (url.startsWith("/WWER/")) return;
        if (label.length > 0 && url.length > 0) {
            links.push({ label, url: "https://parlament.gv.at" + url });
        }
    });
    return links;
}

export async function extractSections(session: Session, filePath: string, persons: Persons) {
    const htmlContent = fs.readFileSync(filePath, "utf-8");
    if (htmlContent.includes("Word 97")) {
        console.log("Can not parse Word 97 created file " + filePath + ", skipping");
        return;
    }
    const $ = cheerio.load(htmlContent);
    const sections: SpeakerSection[] = [];

    let commentsWithDelimiter = $("*")
        .contents()
        .filter((_, el) => el.type === "comment" && el.data.includes("�"));

    let commentCount = 1;
    commentsWithDelimiter.each((index, comment) => {
        commentCount++;
        if (commentCount % 2 == 0) return;

        let current = $(comment).parent();
        while (current.length && !current.is("p")) {
            current = current.parent();
        }

        if (current.length == 0) return;

        const speaker = current
            .find('a[href^="/WWER/"]')
            .text()
            .trim()
            .replace(/\u00AD/g, "")
            .replace(/\xa0/g, " ")
            .replace(/\n/g, " ");
        const isSessionPresident = current.find("b").text().includes("Präsident");
        const aTag = current.find('a[href^="/WWER/"]');
        const speakerUrl = "https://parlament.gv.at/" + aTag.attr("href");
        const links = extractLinks(current);

        let sectionText = current
            .text()
            .trim()
            .replace(/\n/g, " ")
            .replace(/\u00AD/g, "")
            .replace(/\xa0/g, " ");
        const callouts = extractCallouts(sectionText, session.period, persons);
        const colonIndex = sectionText.indexOf(":");
        if (colonIndex > 0) {
            sectionText = sectionText.substring(colonIndex + 1).trim();
        }
        current = current.next();

        while (current.length) {
            const hasDelimiterComment = current.contents().filter((_, el) => el.type === "comment" && el.data.includes("�")).length > 0;
            if (hasDelimiterComment) {
                break;
            }
            const currentText = current
                .text()
                .trim()
                .replace(/\n/g, " ")
                .replace(/\u00AD/g, "")
                .replace(/\xa0/g, " ");
            sectionText += "\n\n" + currentText;
            callouts.push(...extractCallouts(currentText, session.period, persons));
            links.push(...extractLinks(current));
            current = current.next();
        }

        if (speaker && sectionText) {
            const extractId = (url: string): string =>
                url
                    .split("/")
                    .find((part) => part.startsWith("PAD_") && part)
                    ?.substring(4) || "";
            const speakerId = parseInt(extractId(speakerUrl)).toString();
            let person = persons.byId(speakerId)!;
            const nameParts = extractName(speaker);
            if (!person) {
                person = {
                    id: speakerId,
                    parties: [],
                    periods: [session.period],
                    name: speaker,
                    givenName: nameParts.givenName,
                    familyName: nameParts.familyName,
                    titles: nameParts.titles,
                    url: "https://parlament.gv.at/person/" + speakerId,
                };
            }
            sections.push({ speaker: person, isSessionPresident, text: removePageHeader(sectionText), callouts, links });
        }
    });

    session.sections = sections;
    await postProcess(session);
    const orderCalls = extractOrdercalls(session, persons, filePath);
    session.orderCalls = orderCalls;
    fs.writeFileSync(filePath.replace(".html", ".json"), JSON.stringify(session, null, 2), "utf-8");
}

function extractOrdercalls(session: Session, persons: Persons, htmlFilePath: string) {
    const originalJson = JSON.parse(fs.readFileSync(htmlFilePath.replace(".html", ".json.original"), "utf-8"));
    const stages = (originalJson.content as any[]).find((item) => Array.isArray(item.stages))?.stages;
    const sessionKey = session.date.split("T")[0] + "-" + session.period + "-" + session.sessionNumber;
    if (!stages) {
        console.log("Could not find stages for session " + sessionKey + ", either missing entirely or still being processed by parliament.");
        return [];
    } else {
        const orderCalls: Ordercall[] = [];
        for (const stage of stages) {
            if (stage.text?.includes("Ordnungsruf erteilt")) {
                const matches = stage.text.match(/\/person\/(\d+)/);
                if (!matches) {
                    console.log("Could not extract person ID from ordercall '" + stage.text + "', " + sessionKey);
                    continue;
                }
                const personId = matches[1];
                if (!personId) {
                    console.log("Could not extract person ID from ordercall '" + stage.text + "', " + sessionKey);
                    continue;
                }
                const person = persons.byId(personId);
                if (!person) {
                    console.log("Could not find person with ID " + personId + " for ordercall '" + stage.text + "', " + sessionKey);
                    continue;
                }

                let speechUrl: string | undefined;
                let ordercallUrl: string | undefined;
                if (Array.isArray(stage.fsth)) {
                    if (stage.fsth.length >= 2) {
                        ordercallUrl = "https://parlament.gv.at/" + stage.fsth[0].url;
                        speechUrl = "https://parlament.gv.at/" + stage.fsth[1].url;
                        if (!ordercallUrl || !speechUrl) {
                            console.log("WTF 2");
                        }
                    } else {
                        ordercallUrl = "https://parlament.gv.at/" + stage.fsth[0].url;
                    }
                } else {
                    console.log("No proper sources found for order call for " + person.name + ", " + sessionKey);
                }

                orderCalls.push({
                    date: session.date,
                    period: session.period,
                    session: session.sessionNumber,
                    speechUrl,
                    ordercallUrl,
                    person: person,
                });
            }
        }
        return orderCalls;
    }
}

async function postProcess(session: Session) {
    const partyless = new Map<string, Person>();
    const idsToImageUrls = new Map<string, string>();
    const idsToParties = new Map<string, string[]>();
    const sections = session.sections;
    // party-less speakers aren found in persons, so we need to fetch their
    // party affiliation and image url separately.
    for (const section of sections) {
        if (typeof section.speaker == "string") throw new Error("Section speaker given as id, this should not happen");
        if (section.speaker.parties.length == 0) {
            section.speaker.url = "https://parlament.gv.at/person/" + section.speaker.id;
            if (idsToImageUrls.has(section.speaker.id) && idsToParties.has(section.speaker.id)) {
                section.speaker.imageUrl = idsToImageUrls.get(section.speaker.id);
                section.speaker.parties = idsToParties.get(section.speaker.id)!;
            } else {
                const metadata = await getMetadata(section.speaker.id);
                if (metadata.imageUrl) {
                    idsToImageUrls.set(section.speaker.id, "https://parlament.gv.at" + metadata.imageUrl);
                    section.speaker.imageUrl = "https://parlament.gv.at" + metadata.imageUrl;
                }
                if (metadata.parties) {
                    idsToParties.set(section.speaker.id, metadata.parties);
                    section.speaker.parties = metadata.parties;
                }
            }
            partyless.set(section.speaker.id, section.speaker);
        }
    }
}
