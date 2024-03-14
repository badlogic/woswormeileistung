import { Person, Session, SessionSection, SpeakerSection } from "../common/common";
import { Persons } from "./persons";

let personsDb: Persons = new Persons([]);
let sessionsDb: Session[] = [];

export const isAllDigits = (str: string): boolean => /^\d+$/.test(str);

export function initQueries(_persons: Persons, _sessions: Session[]) {
    console.log("Initializing query system");
    personsDb = _persons;
    sessionsDb = _sessions;
}

export function queryPersons(persons: string[]) {
    const result = new Map<string, Person>();
    for (const person of persons) {
        let p: Person | undefined;
        if (isAllDigits(person)) {
            p = personsDb.byId(person);
        } else {
            p = personsDb.search(person)[0].person ?? undefined;
        }
        if (p) {
            result.set(p.id, p);
        }
    }
    return result;
}

export function querySpeakerSections(
    periods: string[],
    sessions: number[],
    parties: string[],
    persons: string[],
    fromDate: Date | undefined,
    toDate: Date | undefined,
    keywords: string[]
): { persons: Person[]; sections: SessionSection[] } {
    let periodsLookup = new Set<string>(periods);
    let sessionsLookup = new Set<number>(sessions);
    let personLookup = queryPersons(persons);
    let partiesLookup = new Set<string>(parties);

    let filteredSessions = periods.length > 0 ? sessionsDb.filter((session) => periodsLookup.has(session.period)) : [...sessionsDb];
    filteredSessions = fromDate ? filteredSessions.filter((session) => new Date(session.date) >= fromDate) : filteredSessions;
    filteredSessions = toDate ? filteredSessions.filter((session) => new Date(session.date) >= toDate) : filteredSessions;

    const resultSections: SessionSection[] = [];
    const resultPersons = new Map<string, Person>();
    for (const session of filteredSessions) {
        if (sessions.length > 0 && !sessionsLookup.has(session.sessionNumber)) continue;
        for (let i = 0; i < session.sections.length; i++) {
            const section = session.sections[i];
            const speaker = personsDb.byId(section.speaker as string)!;

            if (parties.length > 0 && !speaker.parties.some((party) => partiesLookup.has(party))) continue;
            if (persons.length > 0 && !personLookup.has(speaker?.id)) continue;
            if (keywords.length > 0 && !keywords.some((keyword) => section.text.includes(keyword))) continue;

            resultPersons.set(speaker.id, speaker);
            resultSections.push({
                date: session.date,
                period: session.period,
                session: session.sessionNumber,
                sectionIndex: i,
                section: section,
            });
        }
    }
    return { persons: Array.from(resultPersons.values()), sections: Array.from(resultSections.values()) };
}
