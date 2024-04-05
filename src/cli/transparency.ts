import * as fs from "fs";
import { Person, Persons } from "../common/common";
import { fetchAndSaveHtml } from "../server/utils";
import * as cheerio from "cheerio";

(async () => {
    const persons = new Persons(JSON.parse(fs.readFileSync("./data/persons.json", "utf-8")));
    if (!fs.existsSync("./data/transparency.html")) {
        await fetchAndSaveHtml("https://www.parlament.gv.at/person/unvtrans/P9ListeNR", "./data/transparency.html");
    }

    const doc = cheerio.load(fs.readFileSync("./data/transparency.html", "utf-8"));
    const sections = doc(".unvtrans-abg").toArray();
    const transparency: { person: Person; activities: { category: string; where: string; what: string }[] }[] = [];
    for (const section of sections) {
        // Extract person
        let speakerId = "";
        const links = doc(section).find('a[href^="/WWER/PAD_"]').toArray();
        if (links.length > 0) {
            speakerId = parseInt(links[0].attribs["href"].replace("/WWER/PAD_", "").split("/")[0]).toString();
        } else {
            throw new Error("No person link found");
        }
        const person = persons.byId(speakerId);
        if (!person) {
            throw new Error("No person for id " + speakerId);
        }

        // Iterate through all children and keep track of what section we are in, as the classes assigned to
        // the <table> elements are foobar.
        const categories: ("Leitende Stellung" | "Sonstige Tätigkeiten" | "Leitende ehrenamtliche Tätigkeiten" | "Einkommenskategorie")[] = [
            "Leitende Stellung",
            "Sonstige Tätigkeiten",
            "Leitende ehrenamtliche Tätigkeiten",
            "Einkommenskategorie",
        ];
        let category: "Leitende Stellung" | "Sonstige Tätigkeiten" | "Leitende ehrenamtliche Tätigkeiten" | "Einkommenskategorie" =
            "Leitende Stellung";
        const children = doc(section.children);
        console.log("Scanning tables for " + person.name);
        const rows: { category: string; where: string; what: string }[] = [];
        for (const child of children) {
            // Check if we got a section header and store the category we are in
            const sectionHeader = doc(child).find("h4")[0];
            if (sectionHeader) {
                const headerText = doc(sectionHeader).text().trim();
                for (const cat of categories) {
                    if (headerText.startsWith(cat)) {
                        category = cat;
                        break;
                    }
                }
            }
            if (category == "Einkommenskategorie") {
                break;
            }

            // Check if this is a table and extract the rows accordingly, assigning the current
            // category to each row.
            if (child.type == "tag" && child.tagName == "table") {
                // Extract each row
                console.log("\nExtracting category " + category);
                const childRows = doc(child).find("tbody > tr").toArray();
                for (let row of childRows) {
                    let cells = Array.from(row.children);
                    if (cells.length == 3) {
                        cells.shift();
                    }
                    const where = doc(cells[0]).text().trim().replace("Dienstgeber/Rechtsträger/Unternehmen", "");
                    const what = doc(cells[1]).text().trim().replace("Leitende Tätigkeit", "").replace("Tätigkeit", "");
                    console.log(where + " >>> " + what);
                    rows.push({ category, where, what });
                }
            }
        }
        transparency.push({ person, activities: rows });
        console.log();
    }
    fs.writeFileSync("./data/transparency.json", JSON.stringify(transparency, null, 2), "utf-8");
    if (fs.existsSync("./data/transparency.csv")) {
        fs.unlinkSync("./data/transparency.csv");
    }
    fs.appendFileSync("./data/transparency.csv", "given name; family name; titles; parties; category; where; what\n", "utf-8");
    for (const p of transparency) {
        for (const activity of p.activities) {
            const row = `${p.person.givenName};${p.person.familyName};${p.person.titles.join(" ")};${p.person.parties.join(",")};${
                activity.category
            };${activity.where};${activity.what}\n`;
            fs.appendFileSync("./data/transparency.csv", row, "utf-8");
        }
    }
    console.log("Hello world");
})();
