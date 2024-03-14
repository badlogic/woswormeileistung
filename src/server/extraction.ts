import { Missing, Person, Plaque, Screamer, Session } from "../common/common";
import { Persons } from "./persons";
import { querySpeakerSections } from "./query";
import * as fs from "fs";

export function extractMissing(persons: Persons, sessions: Session[], periods = new Set<string>()) {
    const extractPattern = (str: string): string | null => {
        const match = str.match(/Als verhindert gemeldet sind (.*?)\n/s);
        return match ? match[1] : null;
    };

    const splitters = [
        "für die heutige Sitzung insgesamt 42 Abgeordnete, ",
        "die Abgeordneten",
        "Abgeordneten ",
        "Frau Abgeordnete ",
        "der Zweite Präsident des Nationalrates",
    ];
    const result = querySpeakerSections([], [], [], [], undefined, undefined, ["Als verhindert gemeldet sind"]);
    const output: Missing[] = [];
    for (const section of result.sections) {
        if (periods.size > 0 && !periods.has(section.period)) continue;
        let rawMissing = extractPattern(section.section.text);
        if (!rawMissing) {
            console.log(">>>");
            console.log(section.date.split("T")[0] + "-" + section.period + "-" + section.session);
            console.log(section.section.text);
            console.log(">>>");
            throw new Error("Pattern did not match");
        }
        const missing = rawMissing; // .substring(0, rawMissing.lastIndexOf(".") > 0 ? rawMissing.lastIndexOf(".") : rawMissing.length);
        // Can't catch 4-5 with the following code. Exclude for now. FIXME
        let splitter: string | undefined;
        for (const s of splitters) {
            if (missing.includes(s)) {
                splitter = s;
                break;
            }
        }

        if (!splitter) {
            console.log(">>>");
            console.log(section.date.split("T")[0] + "-" + section.period + "-" + section.session);
            console.log(missing);
            console.log(">>>");
            continue;
        }

        let missingClean = missing.split(splitter)[1];

        let names = missingClean.split(", ");
        if (names[names.length - 1].includes("und")) {
            const last = names.pop()!;
            names.push(...last.split("und"));
        }
        if (names[names.length - 1].includes("sowie")) {
            const last = names.pop()!;
            names.push(...last.split("sowie"));
        }
        names = names.map((name) => name.trim().split("(")[0].trim()).filter((name) => name.length > 3 && !/^[a-zäöüß]/.test(name.charAt(0)));
        const lookup = new Map<string, Person>();
        const foundPersons = names
            .map((name) => {
                if (name.endsWith(".")) {
                    name = name.substring(0, name.length - 1);
                }
                // Special case Werner Herbert, as he clashes with Herbert Kickl
                if (name == "Herbert") {
                    name = "Werner Herbert";
                }
                let person = lookup.get(name);
                if (!person) {
                    person = persons.search(name)[0]?.person;
                }
                if (!person) {
                    console.log("Did not find person for " + name);
                    return undefined;
                }
                lookup.set(name, person);
                return { nameInText: name, ...person };
            })
            .filter((person) => person);
        output.push({ sourceText: rawMissing, date: section.date, period: section.period, session: section.session, persons: foundPersons as any });
    }
    fs.writeFileSync("data/missing.json", JSON.stringify(output, null, 2));
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
                    .replace(/\n/g, "");
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
