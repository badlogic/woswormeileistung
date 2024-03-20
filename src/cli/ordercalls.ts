import * as fs from "fs";
import { Ordercall, Person, Persons, Session } from "../common/common";
import { extractSections, resolveOrdercalls } from "../server/extraction";

if (require.main === module) {
    (async () => {
        const persons = new Persons(JSON.parse(fs.readFileSync("./data/persons.json", "utf-8")) as Person[]);
        const sessions = JSON.parse(fs.readFileSync("./data/sessions.json", "utf-8")) as Session[];
        await resolveOrdercalls("./data", sessions, persons);

        /*const persons = new Persons(JSON.parse(fs.readFileSync("./data/persons.json", "utf-8")) as Person[]);
        // const baseFile = "./data/sessions/2022-11-15-XXVII-183";
        const baseFile = "./data/sessions/2003-05-07-XXII-14";
        const session = JSON.parse(fs.readFileSync(baseFile + ".json", "utf-8")) as Session;
        await extractSections(baseFile + ".html", session.period, persons);

        const sessions = JSON.parse(fs.readFileSync("./data/sessions.json", "utf-8")) as Session[];
        const ordercallsPerPerson = new Map<string, Ordercall[]>();
        for (const session of sessions) {
            for (const oc of session.orderCalls) {
                const person = persons.byId(oc.person as string)!;
                oc.person = person;
                const calls = ordercallsPerPerson.get(person.id) ?? [];
                calls.push(oc);
                ordercallsPerPerson.set(person.id, calls);
            }
        }
        const calls = Array.from(ordercallsPerPerson.values());
        const top25 = calls.sort((a, b) => b.length - a.length).splice(0, 25);
        console.log("top 25 persons by ordercalls, descending");
        for (const calls of top25) {
            const person = calls[0].person as Person;
            console.log(`[${person.parties.join(", ")}] ${person.name}: ${calls.length}`);
        }*/
    })();
}
