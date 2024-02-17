import { Session, SpeakerSection, Person } from "../common/common";
import { Persons } from "./persons";

export interface Query {
    persons: string[];
    keywords: string[];
    callouts: boolean;
    file?: string;
}

export function search(persons: Persons, sessions: Session[], query: Query) {
    const personsToFind: Person[] = query.persons
        .map((person) => {
            const results = persons.search(person);
            if (results.length == 0) return undefined;
            return results[0].person;
        })
        .filter((person) => person != undefined) as Person[];

    const results: { date: string; period: string; sessionNumber: number; section: SpeakerSection }[] = [];
    for (const session of sessions) {
        const foundSections = [...session.sections];
        if (personsToFind.length > 0) {
            foundSections.length = 0;
            for (const section of session.sections) {
                for (const person of personsToFind) {
                    if (section.speaker == person.id || (query.callouts && section.callouts.some((callout) => callout.caller == person.id))) {
                        foundSections.push(section);
                    }
                }
            }
        }

        results.push(
            ...foundSections
                .filter((section) => {
                    if (query.keywords.length == 0) return true;
                    return query.keywords.some((keyword) => {
                        return (
                            section.text.toLowerCase().includes(keyword) ||
                            (query.callouts && section.callouts.some((callout) => callout.text.toLowerCase().includes(keyword)))
                        );
                    });
                })
                .map((section) => {
                    return { date: session.date, period: session.period, sessionNumber: session.sessionNumber, section };
                })
        );
    }
    for (const result of results) {
        result.section.speaker = persons.byId(result.section.speaker as string) as Person;
    }
    return results;
}
