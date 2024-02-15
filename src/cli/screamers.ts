import { Person, Session, SpeakerSection } from "../common/common";
import * as fs from "fs";
import { Persons } from "../server/persons";

interface ScreamerDetails {
    person: Person;
    screams: CalloutDetails[];
}

interface CalloutDetails {
    period: string;
    session: number;
    section: number;
    date: string;
    text: string;
    inReplyTo: Person;
}

(async () => {
    const persons = new Persons(JSON.parse(fs.readFileSync("./data/persons.json", "utf-8")) as Person[]);
    const sessions = JSON.parse(fs.readFileSync("./data/sessions.json", "utf-8")) as Session[];

    const screamers = new Map<string, ScreamerDetails>();
    for (const session of sessions) {
        for (let i = 0; i < session.sections.length; i++) {
            const section = session.sections[i];
            for (const callout of section.callouts) {
                if (callout.caller) {
                    let details = screamers.get(callout.caller as string);
                    if (!details) {
                        details = {
                            person: persons.byId(callout.caller as string)!,
                            screams: [],
                        };
                        screamers.set(callout.caller as string, details);
                    }
                    details.screams.push({
                        date: session.date.split("T")[0],
                        period: session.period,
                        session: session.sessionNumber,
                        section: i,
                        text: callout.text,
                        inReplyTo: persons.byId(section.speaker as string)!,
                    });
                }
            }
        }
        console.log("Loaded " + session.period + "-" + session.sessionNumber);
    }
    const result = Array.from(screamers.values()).sort((a, b) => b.screams.length - a.screams.length);
    const mostScreamedAt = new Map<string, { person: Person; screams: number }>();
    for (const r of [...result].reverse()) {
        console.log(r.person.name + " (" + r.person.parties.join(", ") + "): " + r.screams.length + " screams");
        for (const scream of r.screams) {
            let screamedAt = mostScreamedAt.get(scream.inReplyTo.id);
            if (!screamedAt) {
                screamedAt = {
                    person: scream.inReplyTo,
                    screams: 0,
                };
                mostScreamedAt.set(scream.inReplyTo.id, screamedAt);
            }
            screamedAt.screams++;
        }
    }
    for (const r of Array.from(mostScreamedAt.values()).sort((a, b) => a.screams - b.screams)) {
        console.log(r.person.name + " (" + r.person.parties.join(", ") + "): " + r.screams + " screamed at");
    }
    fs.writeFileSync("data/screamers.json", JSON.stringify(result, null, 2), "utf-8");
})();
