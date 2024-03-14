import * as fs from "fs";
import { Person, Session } from "../common/common";
import { extractPlaques } from "../server/extraction";
import { Persons } from "../server/persons";

if (require.main === module) {
    (async () => {
        const persons = new Persons(JSON.parse(fs.readFileSync("./data/persons.json", "utf-8")) as Person[]);
        const sessions = JSON.parse(fs.readFileSync("./data/sessions.json", "utf-8")) as Session[];
        const result = await extractPlaques(persons, sessions);
        for (const person of result) {
            console.log("[" + (person.person.parties.join(", ") ?? "") + "] " + person.person.name + ": " + person.callouts.length);
        }
    })();
}
