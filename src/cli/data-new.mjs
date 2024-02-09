import { PdfReader } from "pdfreader";
import * as fs from "fs";

const listSentinels = ["LEITENDE", "SONSTIGE", "Liste gemäß", "Näheres bei:"];
const ranges = {
    2013: [
        { from: 1, to: 1000 },
        { from: 1001, to: 3500 },
        { from: 3501, to: 7000 },
        { from: 7001, to: 10000 },
        { from: 10000, to: null },
    ],
    2014: [
        { from: 1, to: 1000 },
        { from: 1001, to: 3500 },
        { from: 3501, to: 7000 },
        { from: 7001, to: 10000 },
        { from: 10000, to: null },
    ],
    2015: [
        { from: 1, to: 1000 },
        { from: 1001, to: 3500 },
        { from: 3501, to: 7000 },
        { from: 7001, to: 10000 },
        { from: 10000, to: null },
    ],
    2016: [
        { from: 1, to: 1000 },
        { from: 1001, to: 3500 },
        { from: 3501, to: 7000 },
        { from: 7001, to: 10000 },
        { from: 10000, to: null },
    ],
    2017: [
        { from: 1, to: 1000 },
        { from: 1001, to: 3500 },
        { from: 3501, to: 7000 },
        { from: 7001, to: 10000 },
        { from: 10000, to: null },
    ],
    2018: [
        { from: 1, to: 1000 },
        { from: 1001, to: 3500 },
        { from: 3501, to: 7000 },
        { from: 7001, to: 10000 },
        { from: 10000, to: null },
    ],
    2019: [
        { from: 1, to: 1000 },
        { from: 1001, to: 3500 },
        { from: 3501, to: 7000 },
        { from: 7001, to: 10000 },
        { from: 10000, to: null },
    ],
};

async function readPdfText(file) {
    return new Promise((resolve, reject) => {
        const reader = new PdfReader(null);
        let text = "";
        reader.parseFileItems(file, (err, item) => {
            if (err) {
                console.error("error:", err);
                reject(err);
            } else if (!item) {
                resolve(text);
            } else if (item.text) {
                if (item.text == "Liste gemäß § 9 Bezügebegrenzungs-") {
                    item.text = "Liste gemäß § 9 Bezügebegrenzungs-BVG";
                }
                text += item.text + "\n";
            }
        });
    });
}

(async () => {
    const files = fs.readdirSync("data");
    for (let file of files) {
        if (!file.endsWith(".pdf")) continue;
        file = "data/" + file;
        const text = await readPdfText(file);
        const items = text
            .split("Liste gemäß § 9 Bezügebegrenzungs-BVG")
            .filter((item) => item.trim().length > 0)
            .map((item) => item.trim());

        const results = [];
        for (const item of items) {
            const lines = item.split("\n").filter((item) => item != "(i)");
            const name = lines[3];
            const sideIncome = [];
            const executivePositions = [];
            const otherPositions = [];
            const volunteerPositions = [];

            // side income
            {
                let idx = lines.indexOf("EINKOMMENSKATEGORIE");
                if (idx < 0) idx = lines.indexOf("EINKOMMENSKATEGORI");
                if (idx >= 0) {
                    while (true) {
                        let line = lines[idx++];
                        if (listSentinels.some((sentinel) => line.startsWith(sentinel))) {
                            break;
                        }
                        if (/^\d{4}: \d/.test(line)) {
                            const year = line.split(":")[0];
                            const category = parseInt(line.split(":")[1]);
                            const range = ranges[year][category - 1];
                            if (!range) console.error("Could not find range for year " + year);
                            sideIncome.push({ year, category, range });
                        }
                    }
                }
            }

            // executive positions
            {
                let idx = lines.indexOf(
                    "LEITENDE STELLUNG IN AKTIENGESELLSCHAFT, GESELLSCHAFT MIT BESCHRÄNKTER HAFTUNG, STIFTUNG ODER SPARKASSE - § 6 Abs. 2 Z 1"
                );
                if (idx >= 0) {
                    idx++;
                    while (true) {
                        let line = lines[idx++].trim();
                        if (listSentinels.some((sentinel) => line.startsWith(sentinel))) {
                            break;
                        }

                        if (line.startsWith("Rechtsträger") || line.startsWith("Leitende Stellung") || line.startsWith("Ablauf der Meldefrist")) {
                            continue;
                        }
                        if (line.startsWith("*") || (line.startsWith("(") && executivePositions.length > 0)) {
                            executivePositions[executivePositions.length - 1] += " " + line;
                        } else {
                            executivePositions.push(line);
                        }
                    }
                }
            }

            // other positions
            {
                let idx = lines.indexOf("SONSTIGE TÄTIGKEITEN, AUS DENEN VERMÖGENSVORTEILE ERZIELT WERDEN - § 6 Abs. 2 Z 2");
                if (idx >= 0) {
                    idx++;
                    while (true) {
                        let line = lines[idx++].trim();
                        if (listSentinels.some((sentinel) => line.startsWith(sentinel))) {
                            break;
                        }

                        if (
                            line.startsWith("Dienstgeber/Rechtsträger/Unternehmen") ||
                            line.startsWith("lit.") ||
                            line.startsWith("Tätigkeit") ||
                            line.startsWith("Ablauf der Meldefrist:")
                        ) {
                            continue;
                        }
                        if (line.trim().length == 1) {
                            continue;
                        }
                        if (line.startsWith("*") || (line.startsWith("(") && otherPositions.length > 0)) {
                            otherPositions[otherPositions.length - 1] += " " + line;
                        } else {
                            otherPositions.push(line);
                        }
                    }
                }
            }

            // other positions
            {
                let idx = lines.indexOf("LEITENDE EHRENAMTLICHE TÄTIGKEITEN (keine Vermögensvorteile) - § 6 Abs. 2 Z 3");
                if (idx >= 0) {
                    idx++;
                    while (idx < lines.length) {
                        let line = lines[idx++].trim();
                        if (listSentinels.some((sentinel) => line.startsWith(sentinel))) {
                            break;
                        }

                        if (line.startsWith("Rechtsträger") || line.startsWith("Leitende Tätigkeit") || line.startsWith("Ablauf der Meldefrist:")) {
                            continue;
                        }
                        if (line.endsWith("(i")) {
                            break;
                        }
                        if (line.trim().length == 1) {
                            continue;
                        }
                        if (line.startsWith("*") || (line.startsWith("(") && volunteerPositions.length > 0)) {
                            volunteerPositions[volunteerPositions.length - 1] += " " + line;
                        } else {
                            volunteerPositions.push(line);
                        }
                    }
                }
            }

            const result = {
                name,
                sideIncome,
                executivePositions: executivePositions.filter((pos) => pos != "keine"),
                otherPositions: otherPositions.filter((pos) => pos != "keine"),
                volunteerPositions: volunteerPositions.filter((pos) => pos != "keine"),
            };
            if (results.length > 0 && results[results.length - 1].name == result.name) {
                const prev = results[results.length - 1];
                prev.executivePositions.push(...result.executivePositions);
                prev.otherPositions.push(...result.otherPositions);
                prev.volunteerPositions.push(...result.volunteerPositions);
            } else {
                results.push(result);
            }
        }

        fs.writeFileSync(file.replace("pdf", "txt"), text, "utf-8");
        fs.writeFileSync(file.replace("pdf", "json"), JSON.stringify(results, null, 2), "utf-8");
        console.log("Processed " + file);
    }
})();
