import * as fs from "fs";
import { Person, Persons, Session, getPartiesForPeriods } from "../common/common";
import { extractMissing } from "../server/extraction";
import { initQueries } from "../common/query";

if (require.main === module) {
    (async () => {
        const persons = new Persons(JSON.parse(fs.readFileSync("./data/persons.json", "utf-8")) as Person[]);
        const sessions = JSON.parse(fs.readFileSync("./data/sessions.json", "utf-8")) as Session[];
        initQueries(persons, sessions);
        const periods = new Set<string>([]);
        const possibleParties = new Set<string>(getPartiesForPeriods(periods.values()));
        if (possibleParties.size > 0) {
            for (const person of persons.persons) {
                person.parties = person.parties.filter((party) => possibleParties.has(party));
            }
        }
        let output = extractMissing("./data/", persons, sessions, periods);

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
                            if (periods.size > 0 && !person.periods.some((period) => periods.has(period))) continue;
                            if (person.parties.some((other) => other == party)) personsPerParty[party]++;
                        }
                    }
                    missingParty[party] = missingParty[party] == undefined ? 1 : missingParty[party] + 1;
                }
                const personKey = (person.parties[0] ?? "parteilos") + " " + person.name;
                missingPersons[personKey] = missingPersons[personKey] == undefined ? 1 : missingPersons[personKey] + 1;
                missingPersonsPeriods[personKey] = periods.size == 0 ? person.periods.length : periods.size;
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
        fs.writeFileSync("data/missing.csv", "date;count\n");
        for (const session of output) {
            fs.appendFileSync("data/missing.csv", session.date.split("T")[0] + ";" + session.persons.length + "\n");
        }
    })();
}
