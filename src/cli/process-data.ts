import { Persons, Session } from "../common/common";
import { extractPlaques, extractMissing, extractScreamers } from "../server/extraction";
import { processPersons } from "../server/persons";
import { processSessions } from "../server/sessions";
import * as fs from "fs";

if (require.main === module) {
    (async () => {
        const persons = new Persons(JSON.parse(fs.readFileSync("./data/persons.json", "utf-8")));
        // const sessions = JSON.parse(fs.readFileSync("./data/sessions.json", "utf-8")) as Session[];
        /// const sessionsResult = { persons, sessions };
        // console.log(">>> Extracting persons");
        // const persons = new Persons(await processPersons("./data"));
        console.log(">>> Extracting sessions");
        const sessionsResult = await processSessions(persons, "./data");
        console.log(">>> Extracting plaques");
        await extractPlaques(sessionsResult.persons, sessionsResult.sessions);
        console.log(">>> Extracting missing");
        await extractMissing(sessionsResult.persons, sessionsResult.sessions);
        console.log(">>> Extracting screamers");
        await extractScreamers(sessionsResult.persons, sessionsResult.sessions);
    })();
}
