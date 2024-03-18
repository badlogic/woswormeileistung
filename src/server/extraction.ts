import {
    Callout,
    Missing,
    Ordercall,
    Person,
    Persons,
    Plaque,
    Screamer,
    Session,
    SessionSection,
    SpeakerSection,
    extractName,
} from "../common/common";
import { initQueries, querySpeakerSections } from "../common/query";
import * as fs from "fs";
import * as cheerio from "cheerio";
import { getMetadata, getPerson } from "./persons";
import { fetchAndSaveHtml } from "./utils";

export function extractSectionText(doc: cheerio.CheerioAPI, section: cheerio.Element, scanToMark = false) {
    const children = doc(section.children);
    let text = "";
    let html = "";
    let speaker: string | undefined = undefined;
    let inPageBreak = false;
    const pages: number[] = [];
    const tags: string[] = [];
    let foundMark = false;

    // Walk through all child nodes of the section and extract
    // page(s), tags, and general transcript text.
    for (const child of children) {
        let childText = doc(child)
            .text()
            .trim()
            .replace(/\u00AD/g, "")
            .replace(/\xa0/g, " ")
            .replace(/\n/g, " ")
            .replace(/\s+/g, " ");
        let childHtml = doc.html(child);
        if (childHtml == null) {
            continue;
        }
        childHtml = childHtml.trim();

        // Page extraction
        // Pages are delimited by <hr>...<hr>, inside of which there's a
        // string "Sizung / Seite <pageNumber>"
        if (childHtml.startsWith("<hr>")) {
            inPageBreak = !inPageBreak;
            continue;
        }
        if (inPageBreak) {
            const match = childText.match(/Seite (\d+)/);
            const pageNumber = match ? parseInt(match[1], 10) : -1;
            // Assign the page to the current section if we got a
            // page number.
            if (pageNumber >= 1) {
                pages.push(pageNumber);
            }
            continue;
        }

        // Tag extraction
        // Record any <a name=""> values. Needed to resolve some ordercalls
        if (childHtml.toLowerCase().includes("<a name=")) {
            const aTags = doc(child).find("a").toArray();
            for (const aTag of aTags) {
                const aName = aTag.attribs["name"];
                if (aName) {
                    tags.push(aName);
                }
            }
        }

        // Some sections start with parts of the index before they get to the first speaker
        // need to scan until the first mark.
        if (scanToMark && !foundMark) {
            if (!childHtml.includes("<!--�-->")) continue;
            foundMark = true;
        }

        // Speaker extraction
        if (!speaker) {
            const aTags = doc(child).find('a[href^="/WWER/PAD_"]').toArray();
            if (aTags.length > 0) {
                speaker = parseInt(aTags[0].attribs["href"].replace("/WWER/PAD_", "").split("/")[0]).toString();
            }
        }

        html += childHtml;
        if (childText.length > 0) {
            text += childText + "\n\n";
        }
    }
    text = text.trim();
    return { speaker, text, html, pages, tags };
}

export function extractSpeakerFromHtml(sectionHtml: string, period: string, persons: Persons, filePath: string) {
    let speaker: string | undefined = undefined;
    let foundCandidate: any = null;
    let foundHtml: string = "";
    const regex = /<!--�-->(.*?)<!--�-->/gs;
    const matches = sectionHtml.match(regex);
    foundCandidate = matches ? matches[0].replace(/<!--�-->/g, "").trim() : undefined;
    if (foundCandidate) {
        foundCandidate = foundCandidate.replace(/<i>.*?<\/i>/g, "");
        // <b><span style="display:none"><!--�--></span>Abgeordnete Dipl.-Ing. (FH) Martha Bißmann</b> (ohne Klubzugehörigkeit)<i> (zur Ge­schäftsbehandlung)</i><
        foundCandidate = cheerio.load(foundCandidate).text().trim();
        foundCandidate = foundCandidate
            .replace(/\u00AD/g, "")
            .replace(/\xa0/g, " ")
            .replace(/\n/g, " ")
            .replace(/\s+/g, " ");
        if (foundCandidate.includes(" und ")) {
            foundCandidate = foundCandidate.split(" und ")[1];
        }
        foundHtml = sectionHtml;
    }

    if (foundCandidate) {
        let personText = foundCandidate;

        // special cases
        let localPeriod: string | undefined = period;
        const specialCases = [
            ["Dr. Georg Mayer", "Mag. Dr. Georg Mayer"],
            ["Dkfm. Dr. Hannes Bauer", "Dipl.-Kfm. Dr. Hannes Bauer"],
            ["Martha Bißmann", "Martha Bißmann"],
        ];
        for (const specialCase of specialCases) {
            if (personText.includes(specialCase[0])) {
                personText = specialCase[1];
                localPeriod = undefined;
                break;
            }
        }
        // console.log("Found candidate: " + personText, extractName(personText));
        // console.log("HTML:\n" + foundHtml);

        let { extracted, foundPersons } = persons.searchByFamilyName(personText);
        if (foundPersons.length > 1 && localPeriod) foundPersons = foundPersons.filter((person) => person.periods.some((p) => p == localPeriod));

        if (foundPersons.length == 0) {
            console.log("No person found for name " + foundCandidate + "\n" + filePath + "\nHTML:\n" + foundHtml.substring(0, 512));
        } else if (foundPersons.length == 1) {
            speaker = foundPersons[0].id;
        } else {
            foundPersons = foundPersons.filter((person) => {
                const missedTitles = new Set<string>(extracted.titles.map((title) => title.replace(/\([^)]*\)/g, "").trim()));
                for (const title of person.titles) {
                    missedTitles.delete(title);
                }
                return missedTitles.size == 0;
            });
            if (foundPersons.length == 1) {
                speaker = foundPersons[0].id;
            } else {
                console.log(
                    "Name '" + foundCandidate + "' is ambiguous\n" + "\n" + filePath + "\nHTML:\n" + foundHtml.substring(0, 512),
                    foundPersons
                );
            }
        }
    }
    return speaker;
}

export async function extractSections(filePath: string, period: string, persons: Persons) {
    const html = fs.readFileSync(filePath, "utf8");
    const doc = cheerio.load(html);

    const speakerSections: SpeakerSection[] = [];
    let sections = doc('div[class^="WordSection"]');
    if (sections.length == 0) {
        sections = doc('div[class^="Section"]');
    }

    let lastPage = -1;
    for (const section of sections) {
        const extractionResult = extractSectionText(doc, section, speakerSections.length == 0);
        const { text, html, pages, tags } = extractionResult;
        let speaker = extractionResult.speaker;

        // Scan to the first section with a <!--�--> in it, that's where the speeches start
        if (speakerSections.length == 0 && !html.includes("<!--�-->")) {
            if (pages.length > 0) lastPage = pages[pages.length - 1];
            continue;
        }

        // Try to extract speaker via <a href="/WWER/PAD_">
        if (html.includes("<!--�-->")) {
            // Speaker not marked via <a href="/WWER/PAD_", need to try to extract them
            // from the section's child nodes again. The node containing the name is
            // always between two "<!--�-->" inside <b>. We extract the person name string
            // best we can, then use persons to lookup a candidate person.
            if (!speaker) {
                speaker = extractSpeakerFromHtml(html, period, persons, filePath);
            }
        }

        // No speaker in section? merge text, pages, tags with previous section.
        if (!speaker) {
            if (speakerSections.length > 0) {
                const currSection = speakerSections[speakerSections.length - 1];
                const callouts = extractCallouts(text, period, persons);
                currSection.text += "\n\n" + text.trim();
                currSection.callouts.push(...callouts);
                currSection.pages.push(...pages);
                currSection.tags.push(...tags);
                if (currSection.pages.length > 0) {
                    lastPage = currSection.pages[currSection.pages.length - 1];
                }
            } else {
                console.log("\n>>>>");
                console.log("No speaker candidate found for section " + section.attribs["class"] + " (" + filePath + ")");
                console.log(html.substring(0, 512));
                console.log(">>>>\n");
            }
        } else {
            let fullSpeaker = persons.byId(speaker);
            if (!fullSpeaker) {
                fullSpeaker = await getPerson(speaker);
                if (!fullSpeaker) throw new Error("Could not find speaker for id " + speaker + ", " + filePath);
                persons.add(fullSpeaker);
            }

            // FIXME persons might not have all persons in it yet. Consider
            // extracting callouts after all sections (and their speakers) have
            // been extracted.
            const callouts = extractCallouts(text, period, persons);

            const speakerSection = {
                speaker: fullSpeaker,
                isPresident: text.split(":")[0].includes("Präsident"),
                text: text.trim(),
                callouts,
                pages,
                tags,
            };
            // Add the last page before this section started
            if (lastPage > 0) speakerSection.pages.unshift(lastPage);

            // Updated the last page
            if (speakerSection.pages.length > 0) {
                lastPage = speakerSection.pages[speakerSection.pages.length - 1];
            }
            speakerSections.push(speakerSection);
        }
    }

    // Fill in the first page for any sections that do not have
    // a page assigned.
    /*let firstPage = -1;
    if (speakerSections.length > 0) {
        if (speakerSections[0].pages.length > 0) {
            firstPage = speakerSections[0].pages[0];
        }
    }
    if (firstPage > 0) {
        for (const section of speakerSections) {
            if (section.pages.length == 0) {
                section.pages.push(firstPage);
            } else {
                section.pages.unshift(firstPage);
                break;
            }
        }
    }*/

    return speakerSections;
}

export function extractCallouts(text: string, period: string, persons: Persons) {
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

export function extractOrdercalls(jsonFilepath: string, session: Session, persons: Persons) {
    const originalJson = JSON.parse(fs.readFileSync(jsonFilepath, "utf-8"));
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

                const referenceUrls: string[] = [];
                if (Array.isArray(stage.fsth)) {
                    for (const reference of stage.fsth) {
                        referenceUrls.push("https://parlament.gv.at" + reference.url);
                    }
                } else {
                    console.log("No proper sources found for order call for " + person.name + ", " + sessionKey);
                }

                orderCalls.push({
                    date: session.date,
                    period: session.period,
                    session: session.sessionNumber,
                    referenceUrls,
                    resolvedReferences: [],
                    person: person,
                });
            }
        }
        return orderCalls;
    }
}

export async function resolveOrdercalls(sessions: Session[], persons: Persons) {
    const extractPeriodSessionHash = (text: string) => {
        let hash = text.split("#")[1];
        const tokens = text.replace("https://parlament.gv.at/", "").split("/");
        if (!hash) {
            const last = tokens[tokens.length - 1];
            if (last.startsWith("SEITE_") && last.endsWith(".html")) {
                hash = last;
            }
        }
        return { period: tokens[1], sessionNumber: tokens[3], hash: hash };
    };

    const lookup = new Map<string, Session>();
    sessions.forEach((session) => lookup.set(session.period + "-" + session.sessionNumber, session));

    let numCalls = 0;
    let allCalls: Ordercall[] = [];
    for (const session of sessions) {
        if (session.orderCalls.length > 0) {
            numCalls += session.orderCalls.length;
            for (const ordercall of session.orderCalls) {
                allCalls.push(ordercall);
                const resolvedCalls: SessionSection[] = [];
                const ordercallKey =
                    " for person " + ordercall.person + " " + ordercall.date.split("T")[0] + "-" + ordercall.period + "-" + ordercall.session;
                const speakerFull = persons.byId(ordercall.person as string);
                for (const reference of ordercall.referenceUrls) {
                    const result = extractPeriodSessionHash(reference);
                    const { period, sessionNumber, hash } = result;
                    const refSession = lookup.get(period + "-" + sessionNumber);
                    if (!refSession) {
                        console.log("Could not resolve ordercall reference " + reference + " " + ordercallKey);
                        continue;
                    }
                    const refSessionSections: SessionSection[] = refSession.sections.map((section, index) => {
                        const refSection: SessionSection = {
                            date: refSession.date,
                            period: refSession.period,
                            session: refSession.sessionNumber,
                            sectionIndex: index,
                            section,
                        };
                        return refSection;
                    });

                    // New style reference, e.g. 'https://parlament.gv.at/dokument/XXVII/NRSITZ/224/A_-_14_52_17_00301068.html'
                    if (!hash) {
                        const html = await fetchAndSaveHtml(reference, "tmp.html");
                        const htmlDoc = cheerio.load(html);
                        const refSections = htmlDoc('div[class^="WordSection"]').toArray();
                        if (refSections.length == 0) {
                            console.log("Could not resolve ordercall reference " + reference + ordercallKey);
                            continue;
                        }
                        let speaker: string | undefined;
                        let text: string | undefined;
                        for (const refSection of refSections) {
                            const aTags = htmlDoc(refSection).find('a[href^="/WWER/PAD_"]').toArray();
                            if (aTags.length > 0) {
                                speaker = parseInt(aTags[0].attribs["href"].replace("/WWER/PAD_", "").split("/")[0]).toString();
                            }
                            text = htmlDoc(refSection).text();
                            break;
                        }

                        if (speaker && text) {
                            const candidates = refSessionSections.filter((s) => (s.section.speaker as string) == speaker);
                            text = text.split(":")[1];
                            text = text
                                .trim()
                                .replace(/\u00AD/g, "")
                                .replace(/\xa0/g, " ")
                                .replace(/\n/g, " ")
                                .replace(/\s+/g, " ");
                            let found: SessionSection | undefined;
                            for (const candidate of candidates) {
                                const candidateText = candidate.section.text
                                    .trim()
                                    .replace(/\u00AD/g, "")
                                    .replace(/\xa0/g, " ")
                                    .replace(/\n/g, " ")
                                    .replace(/\s+/g, " ");
                                if (candidateText.includes(text)) {
                                    found = candidate;
                                    break;
                                }
                            }
                            if (!found) {
                                console.log("Could not resolve ordercall reference " + reference + ordercallKey);
                            } else {
                                resolvedCalls.push();
                            }
                        } else {
                            console.log("Could not resolve ordercall reference " + reference + ordercallKey);
                            continue;
                        }
                    } else {
                        // old style tag like RU_XXX, TEXTOBJ_XXX, etc.
                        if (!hash.endsWith(".html")) {
                            const tag = hash;
                            let found = false;
                            for (let i = 0; i < refSessionSections.length; i++) {
                                const section = refSessionSections[i];
                                if (section.section.tags.includes(tag)) {
                                    const first = section;
                                    const second = refSessionSections[i + 1];
                                    if (!resolvedCalls.some((s) => s.section.text == first.section.text)) {
                                        resolvedCalls.push(first);
                                    }
                                    if (!first.section.isPresident && !first.section.text.includes("Ordnungsruf")) {
                                        if (!resolvedCalls.some((s) => s.section.text == second.section.text)) {
                                            resolvedCalls.push(second);
                                        }
                                    }
                                    found = true;
                                }
                            }
                            if (!found) {
                                console.log("Could not resolve ordercall reference " + reference + ordercallKey);
                            }
                        } else {
                            // Even older style Seite_xxx.html or SEITE_xxx.html
                            const page = parseInt(hash.toLowerCase().replace("seite_", "").replace(".html", ""));
                            const candidates: SessionSection[] = [];
                            let alreadyFound = false;
                            const sectionsOnPage = refSessionSections.filter((section) => section.section.pages.includes(page));
                            for (const section of sectionsOnPage) {
                                const isPresidentOrdnungsruf = section.section.isPresident && section.section.text.includes("Ordnungsruf");
                                const isOrContainsSpeaker =
                                    !section.section.isPresident &&
                                    (section.section.speaker == ordercall.person || section.section.text.includes(speakerFull!.familyName));
                                if (isPresidentOrdnungsruf || isOrContainsSpeaker) {
                                    if (!resolvedCalls.some((res) => res?.section.text == section.section.text)) {
                                        let first = section;
                                        candidates.push(first);
                                    } else {
                                        alreadyFound = true;
                                    }
                                }
                                if (isPresidentOrdnungsruf) break;
                            }
                            if (candidates.length == 0 && !alreadyFound) {
                                console.log("Could not resolve ordercall reference " + reference + ordercallKey);
                            } else {
                                resolvedCalls.push(...candidates);
                            }
                        }
                    }
                }
                ordercall.resolvedReferences = resolvedCalls.filter(
                    (s) =>
                        (!s.section.isPresident && (s.section.speaker == ordercall.period || s.section.text.includes(speakerFull!.familyName))) ||
                        (s.section.isPresident && s.section.text.includes("Ordnungsruf"))
                );
            }
        }
    }
    fs.writeFileSync("./data/ordercalls.json", JSON.stringify(allCalls, null, 2), "utf-8");
}

export function extractMissing(persons: Persons, sessions: Session[], periods = new Set<string>()) {
    const extractPattern = (str: string): string | null => {
        const match = str.match(/[Vv]erhindert gemeldet:?(.*?)\n/s);
        return match ? match[1] : null;
    };

    const splitters = [
        "für die heutige Sitzung insgesamt 42 Abgeordnete, nämlich ",
        "die Abgeordneten",
        "Abgeordneten ",
        "Frau Abgeordnete ",
        "der Zweite Präsident des Nationalrates",
        "ist eine ganze Reihe von Abgeordneten:",
        "en Abgeordneten bekannt geben: Das sind die Abgeordneten ",
        "ist für die heutige Sitzung Herr ",
        "ist die Abgeordnete ",
        "ist Herr Abgeordneter ",
        " ist Abgeordnete ",
        "ist Abgeordnete ",
        " – und zwar für diese Sitzung –:",
    ];
    initQueries(persons, sessions);
    const result = querySpeakerSections([], [], [], [], undefined, undefined, `+"verhindert gemeldet"`);
    const output: Missing[] = [];
    const cleanOutput: string[] = [];
    const titles = new Set<string>([
        "Ing. Mag",
        "MMSc BA",
        "MA MLS",
        "Ing. Mag",
        "Ing. Mag.",
        "BEd BEd.",
        "BEd BEd",
        "Dipl.-Kffr",
        "Dipl.-Kffr.",
        "MBA MSc.",
        "MBA MSc",
        "Mag.",
        "Bakk.",
        "BEd.",
        "MBA.",
        "MES.",
        "Dipl.-Ing.",
        "LL.M.",
        "PMM.",
        "M.A.I.S",
        "Dipl.-Ing.in",
        "Dipl.-Kfm.",
    ]);
    try {
        for (const section of result.sections) {
            if (periods.size > 0 && !periods.has(section.period)) continue;
            if (!section.section.isPresident) {
                console.log(">>>");
                console.log("[Not president]");
                console.log(section.date.split("T")[0] + "-" + section.period + "-" + section.session);
                console.log(section.section.text.substring(0, 512));
                console.log(">>>");
                console.log();
            }
            let rawMissing = extractPattern(section.section.text);
            if (!rawMissing) {
                console.log("[Pattern not found]");
                console.log(">>>");
                console.log(section.date.split("T")[0] + "-" + section.period + "-" + section.session);
                console.log(section.section.text.substring(0, 512));
                console.log(">>>");
                console.log();
                // throw new Error("Pattern did not match");
                continue;
            }
            const missing = rawMissing;
            let splitter: string | undefined;
            for (const s of splitters) {
                if (missing.includes(s)) {
                    splitter = s;
                    break;
                }
            }

            if (!splitter) {
                console.log(">>>");
                console.log("[Splitter not found]");
                console.log(section.date.split("T")[0] + "-" + section.period + "-" + section.session);
                console.log(missing);
                console.log(">>>");
                console.log();
                continue;
            }

            let missingClean = missing.split(splitter)[1];
            cleanOutput.push(missingClean);

            let rawNames = missingClean.split(", ");
            let names: string[] = [];
            for (const name of rawNames) {
                if (name.includes("und")) {
                    names.push(...name.split("und"));
                } else if (name.includes("sowie")) {
                    names.push(...name.split("sowie"));
                } else {
                    names.push(name);
                }
            }

            names = names.map((name) => name.trim().split("(")[0].trim()).filter((name) => name.length > 3 && !/^[a-zäöüß]/.test(name.charAt(0)));
            names = names.filter((name) => !titles.has(name));
            cleanOutput.push(names.join("|"));
            const foundPersons = names
                .map((name) => {
                    name = name.trim();
                    if (name.endsWith(".")) {
                        name = name.substring(0, name.length - 1);
                    }
                    if (name.startsWith("Frau")) name = name.replace("Frau", "");
                    if (name.startsWith("Herr")) name = name.replace("Herr", "");

                    const person = persons.searchByGivenAndFamilyName(name, section.period);
                    if (!person) {
                        console.log("!!! Could not find person for " + name);
                        console.log();
                        return undefined;
                    }
                    return { nameInText: name, ...person };
                })
                .filter((person) => person);
            output.push({
                sourceText: rawMissing,
                date: section.date,
                period: section.period,
                session: section.session,
                persons: foundPersons as any,
            });
        }
        fs.writeFileSync("data/missing.json", JSON.stringify(output, null, 2));
    } finally {
        fs.writeFileSync("data/missing-clean.json", JSON.stringify(cleanOutput, null, 2));
    }
    return output;
}

function extractCalloutName(text: string): string {
    if (text.includes("Van der Bellen")) {
        text = text.replace("Van der Bellen", "Van Der Bellen");
    }
    // Ensure to remove the initial "Abg." to start processing the name parts
    const withoutPrefix = text.replace(/^Abg\.\s+/, "");
    const tokens = withoutPrefix.split(/\s+/);
    const nameTokens: string[] = [];

    for (const token of tokens) {
        // Use the regex with the 'u' flag for Unicode support
        if (/^(\p{Lu}|[(])/u.test(token) || token == ",") {
            nameTokens.push(token.replace(/,$/, ""));
            if (token.endsWith(",")) break;
        } else {
            break;
        }
    }

    // Join the collected name parts, ensuring to trim any trailing commas
    return nameTokens
        .filter((token) => !(token.includes(".") || token.includes("(") || token == "MA" || token == "BSc" || token == "MSc"))
        .join(" ")
        .replace(/,$/, "");
}

interface CalloutDetails {
    period: string;
    session: number;
    section: number;
    date: string;
    text: string;
}

export async function extractPlaques(persons: Persons, sessions: Session[]) {
    const plaques = new Map<string, CalloutDetails[]>();
    for (const session of sessions) {
        for (let i = 0; i < session.sections.length; i++) {
            const section = session.sections[i];
            const speaker = persons.byId(section.speaker as string)!;
            for (const callout of section.callouts) {
                callout.text = callout.text
                    .trim()
                    .replace(/\u00AD/g, "")
                    .replace(/\n/g, " ");
                callout.text = callout.text.replace("Der Redner ", "Abg. " + speaker.name + " ");
                callout.text = callout.text.replace("der Redner ", "Abg. " + speaker.name + " ");
                callout.text = callout.text.replace("Der Abgeordnete ", "Abg. " + speaker.name + " ");
                callout.text = callout.text.replace("der Abgeordnete ", "Abg. " + speaker.name + " ");
                callout.text = callout.text.replace("Die Rednerin ", "Abg. " + speaker.name + " ");
                callout.text = callout.text.replace("die Rednerin ", "Abg. " + speaker.name + " ");
                callout.text = callout.text.replace("Die Abgeordnete ", "Abg. " + speaker.name + " ");
                callout.text = callout.text.replace("die Abgeordnete ", "Abg. " + speaker.name + " ");
                callout.text = callout.text.replace(/\u00AD/g, "");

                if (callout.text.startsWith("eine Tafel")) {
                    callout.text = "Abg. " + speaker.name + ", " + callout.text;
                }
                if (
                    !callout.caller &&
                    callout.text.startsWith("Abg.") &&
                    (callout.text.includes("Tafel") ||
                        callout.text.includes("Taferl") ||
                        callout.text.includes("Schild") ||
                        callout.text.includes("Schautafel") ||
                        callout.text.includes("Schaumgummihand"))
                ) {
                    const name = extractCalloutName(callout.text);
                    const person = persons.searchByGivenAndFamilyName(name, session.period);
                    if (!person) {
                        console.log("Could not find person for name " + name + ", taferl " + callout.text);
                        continue;
                    }
                    let callouts = plaques.get(person.id);
                    if (!callouts) {
                        callouts = [];
                        plaques.set(person.id, callouts);
                    }
                    callouts.push({
                        date: session.date.split("T")[0],
                        period: session.period,
                        session: session.sessionNumber,
                        section: i,
                        text: callout.text,
                    });
                }
            }
        }
    }

    const result: Plaque[] = [];
    const csv: { name: string; party: string; plaques: number }[] = [];
    for (const key of plaques.keys()) {
        const callouts = plaques.get(key)!.sort((a, b) => b.date.localeCompare(a.date));
        const person = persons.byId(key)!;
        const parties = person.parties.filter((party) => party != "Ohne Klub" && party != "LIF");
        result.push({ person, callouts });
        csv.push({ name: person.name, party: parties.length > 0 ? parties[parties.length - 1] : "", plaques: callouts.length });
    }
    result.sort((a, b) => b.callouts.length - a.callouts.length);
    csv.sort((a, b) => b.plaques - a.plaques);

    const toCsvString = (data: { name: string; party: string; plaques: number }[]): string => {
        const csvLines = data.map((obj) => `${obj.name};${obj.party};${obj.plaques}`);
        // Adding a header row
        csvLines.unshift("Name;Party;Plaques");
        return csvLines.join("\n");
    };

    fs.writeFileSync("./data/plaques.csv", toCsvString(csv), "utf-8");
    fs.writeFileSync("./data/plaques.json", JSON.stringify(result, null, 2), "utf-8");
    return result;
}

export async function extractScreamers(persons: Persons, sessions: Session[]) {
    const screamers = new Map<string, Screamer>();
    for (const session of sessions) {
        for (let i = 0; i < session.sections.length; i++) {
            const section = session.sections[i];
            for (const callout of section.callouts) {
                if (callout.caller) {
                    let details = screamers.get(callout.caller as string);
                    if (!details) {
                        details = {
                            person: persons.byId(callout.caller as string)!,
                            screams: [],
                        };
                        screamers.set(callout.caller as string, details);
                    }
                    details.screams.push({
                        date: session.date.split("T")[0],
                        period: session.period,
                        session: session.sessionNumber,
                        section: i,
                        text: callout.text,
                        person: persons.byId(section.speaker as string)!,
                        direction: "to",
                    });
                }
            }
        }
    }
    const result = Array.from(screamers.values()).sort((a, b) => b.screams.length - a.screams.length);
    fs.writeFileSync("data/screamers.json", JSON.stringify(result, null, 2), "utf-8");
    return result;
}

export async function resolveUnknownSpeakers(session: Session) {
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
