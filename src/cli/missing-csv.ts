import * as fs from "fs";
import { Missing, Person } from "../common/common";

type MissingPersonEntry = {
    id: string;
    name: string;
    parties: string[];
    nameInText: string;
    sourceText: string;
    date: string;
    period: string;
    session: number;
    pages: number[];
};

(async () => {
    const missing = JSON.parse(fs.readFileSync("./data/missing.json", "utf-8")) as Missing[];
    const entries: MissingPersonEntry[] = [];
    for (const row of missing) {
        const base = {
            sourceText: row.sourceText.replaceAll(";", " "),
            date: row.date.split("T")[0],
            period: row.period,
            session: row.session,
            pages: row.pages,
        };
        for (const person of row.persons) {
            if (person.nameInText == "Schellhorn; Neubauer") continue;
            const entry: MissingPersonEntry = {
                id: person.id,
                name: person.name,
                parties: person.parties,
                nameInText: person.nameInText,
                ...base,
            };
            entries.push(entry);
            entries;
        }
    }

    entries.sort((a, b) => {
        if (a.id == b.id) return b.date.localeCompare(a.date);
        return b.id.localeCompare(a.id);
    });

    fs.writeFileSync("./data/missing-cvs.json", JSON.stringify(entries, null, 2), "utf-8");
    if (fs.existsSync("./data/missing.csv")) {
        fs.unlinkSync("./data/missing.csv");
    }
    const header = "id;name;parties;nameInText;sourceText;date;period;session;pages";
    fs.appendFileSync("./data/missing.csv", header + "\n");

    for (const entry of entries) {
        const row = `${entry.id};${entry.name};${entry.parties};${entry.nameInText};${entry.sourceText};${entry.date};${entry.period};${entry.session};${entry.pages}`;
        fs.appendFileSync("./data/missing.csv", row + "\n", "utf-8");
    }
})();
