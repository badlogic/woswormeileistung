export interface Person {
    id: string;
    name: string;
    url: string;
    parties: string[];
    imageUrl?: string;
    periods: string[];
    givenName: string;
    familyName: string;
    titles: string[];
}

export interface SpeakerSection {
    speaker: Person | string;
    isPresident: boolean;
    text: string;
    callouts: Callout[];
    tags: string[];
    pages: number[];
}

export interface Session {
    url: string;
    period: string;
    sessionNumber: number;
    sessionLabel: string;
    date: string;
    protocolUrls: string[];
    orderCalls: Ordercall[];
    sections: SpeakerSection[];
}

export type SessionSection = { date: string; period: string; session: number; sectionIndex: number; section: SpeakerSection };

export interface Ordercall {
    person: Person | string;
    date: string;
    period: string;
    session: number;
    referenceUrls: string[];
    resolvedReferences: SessionSection[];
}

export interface Callout {
    caller?: Person | string;
    text: string;
}

// A single scream by a person directed at another
// person during the other person's speaker section.
export interface Scream {
    period: string;
    session: number;
    section: number;
    date: string;
    text: string;
    person: Person;
    direction: "from" | "to";
}

// All screams by a specific sperson
export interface Screamer {
    person: Person;
    screams: Scream[];
}

// All screams by a person directed at another
// person during the other person's speaker section.
export interface SectionScreams {
    period: string;
    session: number;
    section: number;
    date: string;
    person: Person;
    direction: "from" | "to";
    texts: string[];
}

export interface Link {
    label: string;
    url: string;
}

export interface PlaqueCallout {
    date: string;
    period: string;
    session: number;
    section: number;
    text: string;
}

export interface Plaque {
    person: Person;
    callouts: PlaqueCallout[];
}

export interface Rollcall {
    date: string;
    period: string;
    title: string;
    description: string;
    persons: Person[];
    yesVotes: (Person | undefined)[];
    noVotes: (Person | undefined)[];
    stageText: string;
    sources: string[];
    sourceSection: SessionSection;
    extractedText: string;
}

export type Missing = { sourceText: string; date: string; period: string; session: number; persons: ({ nameInText: string } & Person)[] };
export type MissingEntry = { sourceText: string; date: string; period: string; session: number; nameInText: string };
export type MissingPerson = { person: Person; missing: MissingEntry[] };

export const periods = new Set<string>(["XXII", "XXIII", "XXIV", "XXV", "XXVI", "XXVII"]);
export const periodDates = [
    { name: "XXII", dates: "20.12.2002 – 29.10.2006" },
    { name: "XXIII", dates: "30.10.2006 – 27.10.2008" },
    { name: "XXIV", dates: "28.10.2008 – 28.10.2013" },
    { name: "XXV", dates: "29.10.2013 – 08.11.2017" },
    { name: "XXVI", dates: "09.11.2017 – 22.10.2019" },
    { name: "XXVII", dates: "23.10.2019 -" },
];

// See https://www.parlament.gv.at/recherchieren/statistiken/personen-statistiken/zusammensetzung-nr
export const partiesPerPeriod = new Map<string, string[]>([
    ["XXII", ["ÖVP", "SPÖ", "FPÖ", "GRÜNE", "Ohne Klub"]],
    ["XXIII", ["ÖVP", "SPÖ", "FPÖ", "GRÜNE", "BZÖ", "Ohne Klub"]],
    ["XXIV", ["ÖVP", "SPÖ", "FPÖ", "GRÜNE", "BZÖ", "Ohne Klub"]],
    ["XXV", ["ÖVP", "SPÖ", "FPÖ", "GRÜNE", "NEOS", "STRONACH", "Ohne Klub"]],
    ["XXVI", ["ÖVP", "SPÖ", "FPÖ", "GRÜNE", "NEOS", "PILZ", "Ohne Klub"]],
    ["XXVII", ["ÖVP", "SPÖ", "FPÖ", "GRÜNE", "NEOS", "Ohne Klub"]],
]);

export const partyColors: Record<string, string> = {
    ÖVP: "98, 194, 206",
    SPÖ: "237, 27, 36",
    FPÖ: "1, 93, 166",
    GRÜNE: "132, 180, 19",
    NEOS: "233, 66, 136",
    "Ohne Klub": "124, 124, 124",
    BZÖ: "238, 127, 0",
    STRONACH: "211, 56, 54",
    PILZ: "40, 40, 40",
};

export function getPartiesForPeriods(periods: string[] | Iterable<string>) {
    const parties: string[] = [];
    for (const period of periods) {
        const ps = partiesPerPeriod.get(period);
        if (!ps) throw new Error("No parties for period " + period);
        parties.push(...ps!);
    }
    return parties;
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

    readonly familyNameChanges: Record<string, string> = {
        Vorderwinkler: "Tanzler",
        Rausch: "Rausch-Amon",
        "Belakowitsch-Jenewein": "Belakowitsch",
        "Fürntrath-Moretti": "Moretti",
        Fuhrmann: "Grünberger",
        Gartlgruber: "Schimanek",
        Gartelgruber: "Schimanek",
        Pock: "Bernhard",
        Glawischnig: "Glawischnig-Piesczek",
        Yilmaz: "Yılmaz",
        Dziedzic: "Ernst-Dziedzic",
        "Steßl-Mühlbacher": "Steßl",
        Binder: "Binder-Maier",
    };

    searchByFamilyName(name: string) {
        name = name
            .replace("- ", "-")
            .replace(/\u00AD/g, "")
            .replace(/\xa0/g, " ");

        // Handle special case of persons who've changed their last name
        if (name.includes("Strache") && name.includes("Pia")) {
            name = name.replace("Strache", "Beck");
        }
        const extracted = extractName(name);
        if (this.familyNameChanges[extracted.familyName] != undefined) {
            extracted.familyName = this.familyNameChanges[extracted.familyName];
        }
        const result = [];
        for (const person of this.persons) {
            if (extracted.familyName == person.familyName) {
                result.push(person);
            }
        }
        return { extracted, foundPersons: result };
    }

    searchByGivenAndFamilyName(name: string, period?: string) {
        let person: Person;
        let { extracted, foundPersons } = this.searchByFamilyName(name);
        if (period) foundPersons = foundPersons.filter((person) => person.periods.some((p) => p == period));
        if (foundPersons.length == 0) return undefined;
        if (foundPersons.length > 1) {
            if (extracted.givenName.trim().length > 0) {
                foundPersons = foundPersons.filter((person) => person.givenName.startsWith(extracted.givenName));
                if (foundPersons.length == 0) {
                    return undefined;
                }
                if (foundPersons.length > 1) {
                    throw new Error("Name " + name + " still ambiguous: " + foundPersons.map((person) => person.name).join(", "));
                } else {
                    person = foundPersons[0];
                }
            }
        }
        return foundPersons[0];
    }
}

export function extractName(name: string): { givenName: string; familyName: string; titles: string[] } {
    const tokens: string[] = [];
    name.split(" ").forEach((token) => {
        if (token.endsWith(",")) {
            tokens.push(token.slice(0, -1), ",");
        } else {
            tokens.push(token);
        }
    });

    const titleParts: string[] = [];
    const nameParts: string[] = [];
    let inTitleSuffix = false;
    tokens.forEach((token) => {
        token = token.trim();
        if (token.includes(".")) {
            titleParts.push(token);
        } else if (token.includes("(")) {
            titleParts[titleParts.length - 1] += " " + token;
        } else if (token.startsWith("Präsident")) {
            titleParts.push(token);
        } else if (token === ",") {
            inTitleSuffix = true;
        } else {
            if (inTitleSuffix) {
                titleParts.push(token);
            } else {
                nameParts.push(token);
            }
        }
    });

    const familyName = nameParts.pop() || "";
    const givenName = nameParts.join(" ");
    return { givenName, familyName, titles: titleParts };
}

export function personsFromSection(section: SpeakerSection, persons: Persons): Record<string, Person> {
    const sectionPersons: Record<string, Person> = {};
    const person = persons.byId(section.speaker as string);
    if (!person) throw new Error("Could not find person in section " + section.speaker);
    sectionPersons[person.id] = person;
    for (const callout of section.callouts) {
        if (callout.caller) {
            const person = persons.byId(callout.caller as string);
            if (!person) throw new Error("Could not find person in callout " + callout.caller);
            sectionPersons[person.id] = person;
        }
    }
    return sectionPersons;
}

export function personsFromSession(session: Session, persons: Persons): Record<string, Person> {
    let sessionPersons: Record<string, Person> = {};
    for (const ordercall of session.orderCalls) {
        const person = persons.byId(ordercall.person as string);
        if (!person) throw new Error("Could not find person in ordercall " + ordercall.person);
        sessionPersons[person.id] = person;
    }
    for (const section of session.sections) {
        sessionPersons = { ...sessionPersons, ...personsFromSection(section, persons) };
    }
    return sessionPersons;
}
