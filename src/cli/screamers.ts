import * as fs from "fs";
import { Person, Persons, Session } from "../common/common";
import { extractScreamers } from "../server/extraction";

if (require.main === module) {
    (async () => {
        const persons = new Persons(JSON.parse(fs.readFileSync("./data/persons.json", "utf-8")) as Person[]);
        const sessions = JSON.parse(fs.readFileSync("./data/sessions.json", "utf-8")) as Session[];
        const result = await extractScreamers("./data", persons, sessions);
        console.log("Top 25 screamers");
        for (let i = 0; i < 10; i++) {
            const screamer = result[i];
            console.log("[" + screamer.person.parties.join(", ") + "] " + screamer.person.name + ": " + screamer.screams.length);
        }

        const mostScreamedAt = new Map<string, { person: Person; screams: number }>();
        for (const r of [...result].reverse()) {
            console.log(r.person.name + " (" + r.person.parties.join(", ") + "): " + r.screams.length + " screams");
            for (const scream of r.screams) {
                let screamedAt = mostScreamedAt.get(scream.person.id);
                if (!screamedAt) {
                    screamedAt = {
                        person: scream.person,
                        screams: 0,
                    };
                    mostScreamedAt.set(scream.person.id, screamedAt);
                }
                screamedAt.screams++;
            }
        }
        console.log("Top 25 screamed at");
        for (const r of Array.from(mostScreamedAt.values())
            .sort((a, b) => b.screams - a.screams)
            .splice(0, 25)) {
            console.log(r.person.name + " (" + r.person.parties.join(", ") + "): " + r.screams + "x screamed at");
        }
    })();
}
