import { Persons, processPersons } from "../server/persons";
import { processSessions } from "../server/sessions";

if (require.main === module) {
    (async () => {
        const persons = await processPersons("./data");
        await processSessions(new Persons(persons), "./data");
    })();
}
