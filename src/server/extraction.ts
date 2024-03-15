import { Missing, Person, Persons, Plaque, Screamer, Session } from "../common/common";
import { querySpeakerSections } from "../common/query";
import * as fs from "fs";

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
            if (!section.section.isSessionPresident) {
                console.log(">>>");
                console.log("[Not president]");
                console.log(section.date.split("T")[0] + "-" + section.period + "-" + section.session);
                console.log(section.section.text);
                console.log(">>>");
                console.log();
            }
            let rawMissing = extractPattern(section.section.text);
            if (!rawMissing) {
                console.log("[Pattern not found]");
                console.log(">>>");
                console.log(section.date.split("T")[0] + "-" + section.period + "-" + section.session);
                console.log(section.section.text);
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

                    let person: Person;
                    let { extracted, foundPersons } = persons.searchByFamilyNameAndTitles(name);
                    foundPersons = foundPersons.filter((person) => person.periods.some((period) => period == section.period));
                    if (foundPersons.length > 1) {
                        //console.log(
                        //    "More than one person found for name " + name,
                        //    foundPersons.map((person) => person.name)
                        //);
                        if (extracted.givenName.trim().length > 0) {
                            //console.log("Trying to resolve via given name " + extracted.givenName);
                            foundPersons = foundPersons.filter((person) => person.givenName.startsWith(extracted.givenName));
                            if (foundPersons.length == 0) {
                                throw new Error("No match via given name possible. Giving up on name " + name);
                            }
                            if (foundPersons.length > 1) {
                                throw new Error("Name " + name + " still ambiguous: " + foundPersons.map((person) => person.name).join(", "));
                            } else {
                                // console.log("Resolved as " + foundPersons[0].name);
                                person = foundPersons[0];
                            }
                        }
                        // console.log();
                    }
                    person = foundPersons[0];

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

function extractName(text: string): string {
    // Ensure to remove the initial "Abg." to start processing the name parts
    const withoutPrefix = text.replace(/^Abg\.\s+/, "");
    const tokens = withoutPrefix.split(/\s+/);
    const nameTokens: string[] = [];

    for (const token of tokens) {
        // Use the regex with the 'u' flag for Unicode support
        if (/^(\p{Lu}|[(])/u.test(token)) {
            nameTokens.push(token.replace(/,$/, ""));
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
                    (callout.text.includes("Tafel") || callout.text.includes("Taferl") || callout.text.includes("Schild"))
                ) {
                    const name = extractName(callout.text);
                    const person = persons.search(name)[0].person;
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
