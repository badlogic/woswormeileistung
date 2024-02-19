import { Person, Session } from "../common/common";
import { Persons } from "../server/persons";
import * as fs from "fs";
import { initQueries, querySpeakerSections } from "../server/query";

export type Missing = { missing: string; date: string; period: string; session: number; persons: ({ nameInText: string } & Person)[] };

function computeMissing(persons: Persons, sessions: Session[]) {
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
        const missing = extractPattern(section.section.text);
        if (!missing) {
            console.log(">>>");
            console.log(section.date.split("T")[0] + "-" + section.period + "-" + section.sessionNumber);
            console.log(section.section.text);
            console.log(">>>");
            throw new Error("Pattern did not match");
        }
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
            console.log(section.date.split("T")[0] + "-" + section.period + "-" + section.sessionNumber);
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
        names = names.map((name) => name.trim()).filter((name) => name.length > 3 && !/^[a-zäöüß]/.test(name.charAt(0)));
        const lookup = new Map<string, Person>();
        const foundPersons = names.map((name) => {
            const person = lookup.get(name) ?? persons.search(name)[0].person;
            lookup.set(name, person);
            return { nameInText: name, ...person };
        });
        output.push({ missing, date: section.date, period: section.period, session: section.sessionNumber, persons: foundPersons });
    }
    return output;
}

(async () => {
    const persons = new Persons(JSON.parse(fs.readFileSync("./data/persons.json", "utf-8")) as Person[]);
    const sessions = JSON.parse(fs.readFileSync("./data/sessions.json", "utf-8")) as Session[];
    initQueries(persons, sessions);
    let output = computeMissing(persons, sessions);
    fs.writeFileSync("data/missing.json", JSON.stringify(output, null, 2));
    output = JSON.parse(fs.readFileSync("data/missing.json", "utf-8")) as Missing[];

    const missingParty: Record<string, number> = {};
    const personsPerParty: Record<string, number> = {};
    const missingPersons: Record<string, number> = {};
    const missingPersonsPeriods: Record<string, number> = {};
    for (const session of output) {
        for (const person of session.persons) {
            for (const party of person.parties) {
                if (!missingParty[party]) {
                    personsPerParty[party] = 0;
                    for (const person of persons.persons) {
                        if (person.parties.some((other) => other == party)) personsPerParty[party]++;
                    }
                }
                missingParty[party] = missingParty[party] == undefined ? 1 : missingParty[party] + 1;
            }
            const personKey = (person.parties[0] ?? "parteilos") + " " + person.name;
            missingPersons[personKey] = missingPersons[personKey] == undefined ? 1 : missingPersons[personKey] + 1;
            missingPersonsPeriods[personKey] = person.periods.length;
        }
    }
    console.log("Number of absences per party (absolute)");
    console.log(
        Object.keys(missingParty)
            .map((key) => {
                return { party: key, count: missingParty[key] };
            })
            .sort((a, b) => b.count - a.count)
    );
    console.log("Number of absences per party (normalized = absolute / number of persons of party in parliament)");
    console.log(
        Object.keys(missingParty)
            .map((key) => {
                return { party: key, count: parseFloat((missingParty[key] / personsPerParty[key]).toFixed(2)) };
            })
            .sort((a, b) => b.count - a.count)
    );
    console.log("Top 25 absent persons (absolute)");
    console.log(
        Object.keys(missingPersons)
            .map((key) => {
                return { person: key, count: missingPersons[key] };
            })
            .sort((a, b) => b.count - a.count)
            .splice(0, 25)
    );
    console.log("Top 25 absent persons (normalized = absolute / number governing periods the person was in parliament )");
    console.log(
        Object.keys(missingPersons)
            .map((key) => {
                return { person: key, count: missingPersons[key] / missingPersonsPeriods[key] };
            })
            .sort((a, b) => b.count - a.count)
            .splice(0, 25)
    );
    let max = -1;
    output.forEach((session) => (max = Math.max(max, session.missing.length)));
    fs.writeFileSync("data/missing.csv", "date;count\n");
    for (const session of output) {
        fs.appendFileSync("data/missing.csv", session.date.split("T")[0] + ";" + session.persons.length + "\n");
    }
})();
