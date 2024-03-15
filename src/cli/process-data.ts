import { Persons } from "../common/common";
import { extractPlaques, extractMissing, extractScreamers } from "../server/extraction";
import { processPersons } from "../server/persons";
import { processSessions } from "../server/sessions";

if (require.main === module) {
    (async () => {
        console.log(">>> Extracting persons");
        const persons = await processPersons("./data");
        console.log(">>> Extracting sessions");
        const sessionsResult = await processSessions(new Persons(persons), "./data");
        console.log(">>> Extracting plaques");
        await extractPlaques(sessionsResult.persons, sessionsResult.sessions);
        console.log(">>> Extracting missing");
        await extractMissing(sessionsResult.persons, sessionsResult.sessions);
        console.log(">>> Extracting screamers");
        await extractScreamers(sessionsResult.persons, sessionsResult.sessions);
    })();
}
