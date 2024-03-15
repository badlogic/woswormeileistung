import { Person, Persons, Session, SessionSection } from "./common";

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

const lowercaseSectionCache = new Map<string, string>();

export function querySpeakerSections(
    periods: string[],
    sessions: number[],
    parties: string[],
    persons: string[],
    fromDate: Date | undefined,
    toDate: Date | undefined,
    query: string
): { queryTokens: string[]; persons: Person[]; sections: SessionSection[] } {
    let periodsLookup = new Set<string>(periods);
    let sessionsLookup = new Set<number>(sessions);
    let personLookup = queryPersons(persons);
    let partiesLookup = new Set<string>(parties);

    let filteredSessions = periods.length > 0 ? sessionsDb.filter((session) => periodsLookup.has(session.period)) : [...sessionsDb];
    filteredSessions = fromDate ? filteredSessions.filter((session) => new Date(session.date) >= fromDate) : filteredSessions;
    filteredSessions = toDate ? filteredSessions.filter((session) => new Date(session.date) >= toDate) : filteredSessions;

    const resultSections: SessionSection[] = [];
    const resultPersons = new Map<string, Person>();
    const preparedQuery = prepareQuery(query);
    for (const session of filteredSessions) {
        if (sessions.length > 0 && !sessionsLookup.has(session.sessionNumber)) continue;
        for (let i = 0; i < session.sections.length; i++) {
            const section = session.sections[i];
            const speaker = personsDb.byId(section.speaker as string)!;
            const sectionKey = session.date + "-" + session.sessionNumber + "-" + i;
            let text = lowercaseSectionCache.get(sectionKey);
            if (!text) {
                text = section.text.toLowerCase();
                lowercaseSectionCache.set(sectionKey, text);
            }

            if (parties.length > 0 && !speaker.parties.some((party) => partiesLookup.has(party))) continue;
            if (persons.length > 0 && !personLookup.has(speaker?.id)) continue;
            if (preparedQuery.tokens.length > 0 && !matchesQuery(preparedQuery, text, false)) continue;

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
    const queryTokens: string[] = [...preparedQuery.must.values(), ...preparedQuery.optional.values()];
    return { queryTokens, persons: Array.from(resultPersons.values()), sections: Array.from(resultSections.values()) };
}

export interface PreparedQuery {
    tokens: string[];
    must: Set<string>;
    mustNot: Set<string>;
    optional: Set<string>;
}

export function prepareQuery(query: string): PreparedQuery {
    query = query.trim();
    if (query.length == 0)
        return {
            tokens: [],
            must: new Set<string>(),
            mustNot: new Set<string>(),
            optional: new Set<string>(),
        };
    const regex = /\+?"[^"]+"|-"[^"]+"|\S+/g;
    const rawTokens = query.match(regex) || [];
    const tokens = rawTokens.map((token) => (token.startsWith('"') && token.endsWith('"') ? token.substring(1, token.length - 1) : token));

    const preparedQuery = {
        tokens,
        must: new Set<string>(),
        mustNot: new Set<string>(),
        optional: new Set<string>(),
    };
    for (let token of preparedQuery.tokens) {
        token = token.toLowerCase();

        if (token.startsWith("+") && token.length >= 2) {
            let finalToken = token.substring(1);
            finalToken = finalToken.startsWith('"') && finalToken.endsWith('"') ? finalToken.substring(1, finalToken.length - 1) : finalToken;
            preparedQuery.must.add(finalToken);
        } else if (token.startsWith("-") && token.length >= 2) {
            let finalToken = token.substring(1);
            finalToken = finalToken.startsWith('"') && finalToken.endsWith('"') ? finalToken.substring(1, finalToken.length - 1) : finalToken;
            preparedQuery.mustNot.add(finalToken);
        } else if (token.length >= 2) {
            let finalToken = token;
            finalToken = finalToken.startsWith('"') && finalToken.endsWith('"') ? finalToken.substring(1, finalToken.length - 1) : finalToken;
            preparedQuery.optional.add(finalToken);
        }
    }
    return preparedQuery;
}

export function matchesQuery(query: PreparedQuery, text: string, lowerCase = true) {
    const { mustNot, must, optional } = query;
    if (lowerCase) text = text.toLowerCase();
    if (mustNot.size > 0 && Array.from(mustNot.values()).some((token) => text.includes(token))) return false;
    if (must.size > 0 && Array.from(must.values()).every((token) => text.includes(token))) return true;
    if (optional.size > 0 && Array.from(optional.values()).some((token) => text.includes(token))) return true;
    return false;
}
