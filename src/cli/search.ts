import { Person, Session, SpeakerSection } from "../common/common";
import { Persons } from "../server/persons";
import * as fs from "fs";
import { Query, search } from "../server/search";

function parseArguments(args: string[]): Query {
    const persons: string[] = [];
    const keywords: string[] = [];
    let file: string | undefined;
    let callouts = true;

    for (let i = 0; i < args.length; i++) {
        if (args[i] === "-p" && args[i + 1] && args[i + 1][0] !== "-") {
            persons.push(args[i + 1]);
        } else if (args[i] === "-k" && args[i + 1] && args[i + 1][0] !== "-") {
            keywords.push(args[i + 1].toLowerCase());
        } else if (args[i] === "-f" && args[i + 1] && args[i + 1][0] !== "-") {
            file = args[i + 1];
        } else if (args[i] == "-nc") {
            callouts = false;
        }
    }

    return { persons, keywords, callouts, file };
}

(async () => {
    const persons = new Persons(JSON.parse(fs.readFileSync("./data/persons.json", "utf-8")) as Person[]);
    const sessions = JSON.parse(fs.readFileSync("./data/sessions.json", "utf-8")) as Session[];

    const query = parseArguments(process.argv);
    const start = performance.now();
    const results = search(persons, sessions, query);

    if (query.file) {
        fs.writeFileSync(query.file, JSON.stringify(results, null, 2));
    }

    console.log(`Took: ${((performance.now() - start) / 1000).toFixed(2)} secs`);
    console.log("Found: " + results.length + " speaker sections");
})();
