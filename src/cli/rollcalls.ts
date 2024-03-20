import { Person, Persons, Session } from "../common/common";
import { extractRollCalls } from "../server/extraction";
import * as fs from "fs";

(async () => {
    const persons = new Persons(JSON.parse(fs.readFileSync("./data/persons.json", "utf-8")) as Person[]);
    const sessions = JSON.parse(fs.readFileSync("./data/sessions.json", "utf-8")) as Session[];
    await extractRollCalls("./data", persons, sessions);
})();
