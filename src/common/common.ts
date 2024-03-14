export interface Person {
    id: string;
    name: string;
    parties: string[];
    url: string;
    imageUrl?: string;
    periods: string[];
}

export interface SpeakerSection {
    speaker: Person | string;
    text: string;
    callouts: Callout[];
    links: Link[];
}

export interface Session {
    url: string;
    period: string;
    sessionNumber: number;
    sessionLabel: string;
    date: string;
    protocolUrls: string[];
    sections: SpeakerSection[];
}

export type SessionSection = { date: string; period: string; session: number; sectionIndex: number; section: SpeakerSection };

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
