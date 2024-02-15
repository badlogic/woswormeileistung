import * as cheerio from "cheerio";
import * as fs from "fs";

export type Person = {
    name: string;
    party: string;
    url: string;
    imageUrl: string;
    sideIncome: { year: string; from: number; to: number }[];
};

function extractPropertyJson(htmlContent: string): any {
    const $ = cheerio.load(htmlContent);
    let extractedJson = null;

    $("script").each((i, elem) => {
        const scriptContent = $(elem).html();
        if (scriptContent && scriptContent.includes('"data":{')) {
            const json = scriptContent
                .trim()
                .replace(
                    `import App from '/static/js/fd2d77f8.js';
    new App({
        target: document.body,
        hydrate: true,
        props: `,
                    ""
                )
                .replace(`});`, "");
            extractedJson = JSON.parse(json);
            return false; // Break the loop
        }
    });

    return extractedJson;
}

function extractEuroValues(str: string): { from: number; to: number } {
    if (str.includes("Meldefrist")) return { from: 0, to: 0 };
    if (str.includes("&nbsp;")) {
        str = str.substring(7);
    }

    const euroPattern = /(\d{1,3}(?:\.\d{3})*|über \d{1,3}(?:\.\d{3})*)/g;
    const matches = str.match(euroPattern);

    if (!matches) {
        return { from: 0, to: 0 };
    }

    const from = matches[0] === "über" ? matches[1] : matches[0];
    const to = matches.length > 1 ? matches[1] : from;

    return {
        from: from.startsWith("über") ? parseInt(from.split(" ")[1].replace(/\./g, "")) : parseInt(from.replace(/\./g, "")),
        to: to.startsWith("über") ? parseInt(to.split(" ")[1].replace(/\./g, "")) : parseInt(to.replace(/\./g, "")),
    };
}

async function main() {
    const response = await fetch(
        "https://www.parlament.gv.at/Filter/api/json/post?jsMode=EVAL&FBEZ=WFW_002&listeId=undefined&showAll=true&export=true",
        {
            method: "POST",
            body: JSON.stringify({
                STEP: ["1000"],
                NRBR: ["NR"],
                GP: ["AKT"],
                R_WF: ["FR"],
                R_PBW: ["WK"],
                M: ["M"],
                W: ["W"],
            }),
        }
    );
    if (!response.ok) {
        console.error("Could not fetch persons: " + (await response.text()));
        process.exit(-1);
    }
    const data = await response.json();
    const persons: Person[] = [];
    for (const row of data.rows) {
        persons.push({
            name: row[0],
            party: row[10],
            url: "https://www.parlament.gv.at" + row[11],
            imageUrl: "",
            sideIncome: [
                ...["2018", "2019", "2020", "2021", "2022", "2023", "2024"].map((year) => {
                    return { year, from: 0, to: 0 };
                }),
            ],
        });
    }

    for (const person of persons) {
        const response = await fetch(person.url);
        if (!response.ok) {
            console.error("Could not fetch person details for " + person.url + ": " + (await response.text()));
            process.exit(-1);
        }
        const data = extractPropertyJson(await response.text()).data.content;
        if (!data) {
            console.error("Could not parse person details for " + person.url);
            process.exit(-1);
        }
        person.imageUrl = `https://www.parlament.gv.at/${data.banner.portrait.src}`;
        const sideIncomeRaw = data.unvtrans.unvtransData.einkTable.data.rows;

        for (const row of sideIncomeRaw) {
            const year = row[0];
            const { from, to } = extractEuroValues(row[1]);
            let found = false;
            for (const sideIncome of person.sideIncome) {
                if (sideIncome.year == year) {
                    sideIncome.from = from;
                    sideIncome.to = to;
                    found = true;
                    break;
                }
            }
            if (!found) {
                console.error("Could not find side income for year " + year);
                process.exit(-1);
            }
        }
    }

    fs.writeFileSync("./data/persons.json", JSON.stringify(persons, null, 2), "utf-8");
}

async function stats() {
    const persons: Person[] = JSON.parse(fs.readFileSync("./data/persons.json", "utf-8"));
    persons.sort((a, b) => {
        return b.sideIncome[4].from - a.sideIncome[4].from + (b.sideIncome[4].to - a.sideIncome[4].to);
    });
    for (const person of persons) {
        const isOver = person.sideIncome[4].from > 0 && person.sideIncome[4].from == person.sideIncome[4].to;
        console.log(
            person.party +
                " - " +
                person.name +
                " " +
                (isOver ? "> " : "") +
                person.sideIncome[4].from +
                (!isOver ? " - " + person.sideIncome[4].to : "")
        );
    }
}

(async () => {
    fs.mkdirSync("./data/", { recursive: true });
    await main();
    await stats();
})();
