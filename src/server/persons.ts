import * as fs from "fs";
import { periods } from "../common/common";
import { Person } from "../common/common";
import { sleep } from "../utils/utils";

function extractSpanInnerText(html: string) {
    const regex = /<span[^>]*>(.*?)<\/span>/g;
    let matches;
    const innerTexts = [];

    while ((matches = regex.exec(html)) !== null) {
        innerTexts.push(matches[1]);
    }

    return innerTexts;
}

const cache = new Map<string, { parties: string[]; imageUrl: string | undefined }>();
export async function getMetadata(personId: string) {
    if (cache.has(personId)) return cache.get(personId)!;
    let retries = 3;

    while (true) {
        try {
            const response = await fetch(`https://parlament.gv.at/person/${personId}?json=true`);
            if (!response.ok) {
                throw new Error(await response.text());
            }
            const json = await response.json();
            const str = JSON.stringify(json).toLowerCase();
            const parties = new Set<string>();
            if (str.includes("spö")) parties.add("SPÖ");
            if (str.includes("övp")) parties.add("ÖVP");
            if (str.includes("grüne")) parties.add("GRÜNE");
            if (str.includes("fpö")) parties.add("FPÖ");
            if (str.includes("Klub der Freiheitlichen Partei Österreichs")) parties.add("FPÖ");
            if (str.includes("bzö")) parties.add("BZÖ");
            if (str.includes("neos")) parties.add("NEOS");
            if (str.includes("stronach")) parties.add("STRONACH");

            const metadata = {
                parties: Array.from(parties),
                imageUrl: json.content?.biografie?.portrait?.src ?? json.content?.banner?.portrait?.src,
            };
            cache.set(personId, metadata);
            return metadata;
        } catch (e) {
            retries--;
            if (retries > 0) {
                console.error("Failed to fetch person metadata for " + personId + ", retrying", e);
                await sleep(500);
            } else throw e;
        }
    }
}

export async function processPersons(baseDir: string) {
    cache.clear();
    if (baseDir.endsWith("/")) {
        baseDir = baseDir.slice(0, -1);
    }
    if (!fs.existsSync(baseDir)) {
        fs.mkdirSync(baseDir, { recursive: true });
    }

    const response = await fetch(
        "https://www.parlament.gv.at/Filter/api/json/post?jsMode=EVAL&FBEZ=WFW_004&listeId=undefined&showAll=true&export=true",
        {
            method: "POST",
            body: JSON.stringify({
                NRBR: ["NR"],
                R_WF: ["FR"],
                R_BW: ["BL"],
                M: ["M"],
                W: ["W"],
            }),
        }
    );
    if (!response.ok) {
        throw new Error(await response.text());
    }
    const rawData = await response.json();
    const persons: Person[] = [];
    const seenParties = new Set<string>();
    for (const row of rawData.rows) {
        const personPeriods = extractSpanInnerText(row[4]);
        let foundPeriod = personPeriods.some((p) => periods.has(p));
        if (!foundPeriod) {
            continue;
        }
        const parties = extractSpanInnerText(row[3])
            .map((party) => {
                switch (party) {
                    case "F":
                        return ["FPÖ"];
                    case "F-BZÖ":
                        return ["BZÖ"];
                    case "NEOS-LIF":
                        return ["NEOS"];
                    case "OK":
                        return ["Ohne Klub"];
                    case "JETZT":
                        return ["PILZ"];
                    default:
                        return [party];
                }
            })
            .flat();
        parties.forEach((party) => seenParties.add(party));
        const id = row[0];
        const response = await fetch(`https://parlament.gv.at/person/${id}?json=true`);
        if (!response.ok) {
            throw new Error(await response.text());
        }
        const json = await response.json();
        const imageUrl = json.content?.biografie?.portrait?.src ?? json.content?.banner?.portrait?.src;
        persons.push({
            id,
            name: json.content?.headingbox?.title.replace(/\u00AD/g, "").replace(/\n/g, "") ?? row[2].replace(/\u00AD/g, "").replace(/\n/g, ""),
            parties: Array.from(new Set<string>(parties)).sort(),
            periods: personPeriods.sort(),
            url: "https://parlament.gv.at/person/" + id,
            imageUrl: imageUrl ? "https://parlament.gv.at" + imageUrl : undefined,
        });

        // special case...
        if (row[2].includes("Gartelgruber")) {
            persons.push({
                id,
                name: "Carmen Gartelgruber",
                parties: Array.from(new Set<string>(parties)).sort(),
                periods: personPeriods.sort(),
                url: "https://parlament.gv.at/person/" + id,
                imageUrl: imageUrl ? "https://parlament.gv.at" + imageUrl : undefined,
            });
        }
        console.log("Processed " + persons.length + "/" + rawData.rows.length + " persons");
    }
    fs.writeFileSync(`${baseDir}/persons.json`, JSON.stringify(persons, null, 2), "utf-8");
    return persons;
}

export class Persons {
    idToPerson = new Map<string, Person>();
    idToNameParts = new Map<string, string[]>();

    constructor(public persons: Person[]) {
        this.addAll(this.persons);
    }

    addAll(persons: Person[]) {
        for (const person of persons) {
            this.add(person);
        }
    }

    add(person: Person) {
        if (this.idToPerson.has(person.id)) {
            return;
        }
        this.idToPerson.set(person.id, person);
        const nameParts = person.name
            .toLowerCase()
            .replace(/ı/g, "i") // Replace dotless 'ı' with 'i'
            .split(",")[0]
            .split(/\s+/)
            .filter((part) => !part.includes("("))
            .map((part) => [...part.split("-"), part])
            .flat();
        this.idToNameParts.set(person.id, nameParts);
    }

    byId(id: string) {
        return this.idToPerson.get(id);
    }

    private static levenshtein(a: string, b: string): number {
        const matrix = [];

        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) == a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
                }
            }
        }

        return matrix[b.length][a.length];
    }

    /*search(query: string, period?: string) {
        const normalizedQuery = query
            .toLowerCase()
            .replace(/ı/g, "i") // Replace dotless 'ı' with 'i'
            .split(/\s+/)
            .filter((part) => part);

        const persons = period ? this.persons.filter((p) => p.periods.includes(period)) : this.persons;
        const scoredNames = persons.map((person) => {
            const nameParts = this.idToNameParts.get(person.id)!;
            const score = normalizedQuery.reduce((acc, queryPart) => {
                // Find the best match for each query part in name parts
                const partScores = nameParts.map((namePart) => Persons.levenshtein(queryPart, namePart));
                const bestMatch = Math.min(...partScores);
                return acc + bestMatch;
            }, 0);
            return { person, score };
        });

        // Sort by total score (sum of best matches for all query parts), then by name length for similarly scored names
        scoredNames.sort((a, b) => a.score - b.score || a.person.name.length - b.person.name.length);
        return scoredNames.slice(0, 5);
    }*/

    search(query: string, period?: string) {
        const normalizedQuery = query
            .toLowerCase()
            .replace(/ı/g, "i") // Replace dotless 'ı' with 'i'
            .split(/\s+/)
            .filter((part) => part);

        const persons = period ? this.persons.filter((p) => p.periods.includes(period)) : this.persons;
        const scoredNames = persons.map((person) => {
            const nameParts = this.idToNameParts.get(person.id)!;
            let score = 0;
            let lastIndex = -1;

            for (const queryPart of normalizedQuery) {
                // Initialize high score for comparison; lower scores are better
                let bestMatchScore = Infinity;
                let bestMatchIndex = -1;

                for (let i = lastIndex + 1; i < nameParts.length; i++) {
                    const currentScore = Persons.levenshtein(queryPart, nameParts[i]);
                    if (currentScore < bestMatchScore) {
                        bestMatchScore = currentScore;
                        bestMatchIndex = i;
                    }
                }

                // Update score and last index if a match was found
                if (bestMatchIndex !== -1) {
                    score += bestMatchScore;
                    lastIndex = bestMatchIndex;
                } else {
                    // If no match was found in the remaining name parts, penalize heavily
                    score += 100;
                }
            }

            return { person, score };
        });

        // Sort by total score, then by name length for similarly scored names
        scoredNames.sort((a, b) => a.score - b.score || a.person.name.length - b.person.name.length);
        return scoredNames.slice(0, 5);
    }
}
