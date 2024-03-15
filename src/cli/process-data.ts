import { Persons } from "../common/common";
import { extractPlaques, extractMissing, extractScreamers } from "../server/extraction";
import { processPersons } from "../server/persons";
import { processSessions } from "../server/sessions";

if (require.main === module) {
    (async () => {
        const persons = await processPersons("./data");
        const sessionsResult = await processSessions(new Persons(persons), "./data");
        await extractPlaques(sessionsResult.persons, sessionsResult.sessions);
        await extractMissing(sessionsResult.persons, sessionsResult.sessions);
        await extractScreamers(sessionsResult.persons, sessionsResult.sessions);
    })();
}
