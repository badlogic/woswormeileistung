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
