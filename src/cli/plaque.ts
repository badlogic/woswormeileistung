import * as fs from "fs";
import { Callout, Person, Session, SpeakerSection } from "../common/common";
import { Persons } from "../server/persons";

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

(async () => {
    const persons = new Persons(JSON.parse(fs.readFileSync("./data/persons.json", "utf-8")) as Person[]);
    const sessions = JSON.parse(fs.readFileSync("./data/sessions.json", "utf-8")) as Session[];
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

    const result: { person: Person; callouts: CalloutDetails[] }[] = [];
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

    fs.writeFileSync("./data/plaque.csv", toCsvString(csv), "utf-8");
    fs.writeFileSync("./data/plaque.json", JSON.stringify(result, null, 2), "utf-8");
})();
