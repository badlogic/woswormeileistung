import { processPersons } from "../server/persons";

if (require.main === module) {
    (async () => {
        await processPersons("./data");
    })();
}
