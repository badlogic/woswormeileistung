export interface Person {
    id: string;
    name: string;
    parties: string[];
    url: string;
    imageUrl?: string;
    periods: string[];
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

export interface Callout {
    caller?: Person | string;
    text: string;
}

export interface Link {
    label: string;
    url: string;
}

export interface SpeakerSection {
    speaker: Person | string;
    text: string;
    callouts: Callout[];
    links: Link[];
}

export const periods = new Set<string>(["XXII", "XXIII", "XXIV", "XXV", "XXVI", "XXVII"]);

// See https://www.parlament.gv.at/recherchieren/statistiken/personen-statistiken/zusammensetzung-nr
export const partiesPerPeriod = new Map<string, string[]>([
    ["XXII", ["ÖVP", "SPÖ", "FPÖ", "GRÜNE", "Ohne Klub"]],
    ["XXIII", ["ÖVP", "SPÖ", "FPÖ", "GRÜNE", "BZÖ", "Ohne Klub"]],
    ["XXIV", ["ÖVP", "SPÖ", "FPÖ", "GRÜNE", "BZÖ", "Ohne Klub"]],
    ["XXV", ["ÖVP", "SPÖ", "FPÖ", "GRÜNE", "NEOS", "STRONACH", "Ohne Klub"]],
    ["XXVI", ["ÖVP", "SPÖ", "FPÖ", "GRÜNE", "NEOS", "PILZ", "Ohne Klub"]],
    ["XXVII", ["ÖVP", "SPÖ", "FPÖ", "GRÜNE", "NEOS", "Ohne Klub"]],
]);

export function getPartiesForPeriods(periods: string[] | Iterable<string>) {
    const parties: string[] = [];
    for (const period of periods) {
        const ps = partiesPerPeriod.get(period);
        if (!ps) throw new Error("No parties for period " + period);
        parties.push(...ps!);
    }
    return parties;
}
