import { Person, Persons } from "../common/common";
import { processSessions } from "../server/sessions";
import * as fs from "fs";

if (require.main === module) {
    (async () => {
        const persons = new Persons(JSON.parse(fs.readFileSync("./data/persons.json", "utf-8")) as Person[]);
        await processSessions(persons, "./data");
    })();
}
