import bodyParser from "body-parser";
import * as chokidar from "chokidar";
import compression from "compression";
import cors from "cors";
import express from "express";
import * as fs from "fs";
import * as http from "http";
import WebSocket, { WebSocketServer } from "ws";
import { Missing, MissingPerson, Persons, Plaque, Scream, Screamer, SectionScreams, Session, SessionSection } from "../common/common";
import { processPersons } from "./persons";
import { initQueries, isAllDigits, querySpeakerSections } from "../common/query";
import { processSessions } from "./sessions";

const port = process.env.PORT ?? 3333;

export let persons = new Persons([]);
export let sessions: Session[] = [];
export let sessionsById: Map<string, Session> = new Map();
export let plaques: Map<string, Plaque> = new Map();
export let missingPerPerson: Map<string, MissingPerson> = new Map();
export let screamsFromPerson: Map<string, SectionScreams[]> = new Map();
export let screamsAtPerson: Map<string, SectionScreams[]> = new Map();

function toArray(queryParam: string[] | string | any | undefined): string[] {
    if (queryParam == undefined) return [];
    if (typeof queryParam == "string") return [queryParam];
    if (Array.isArray(queryParam)) return queryParam;
    throw new Error("Unknown query parameter type");
}

function loadData() {
    try {
        // persons and sessions
        console.log("Loading data");
        const newPersons = new Persons(JSON.parse(fs.readFileSync("/data/persons.json", "utf-8")));
        const newSessions = JSON.parse(fs.readFileSync("/data/sessions.json", "utf-8")) as Session[];
        console.log(`Loaded ${newPersons.persons.length} persons, ${newSessions.length} sessions`);
        initQueries(newPersons, newSessions);
        persons = newPersons;
        sessions = newSessions;
        for (const session of sessions) {
            sessionsById.set(session.period + "-" + session.sessionNumber, session);
        }

        // plaques
        console.log("Computing plaque data ");
        const plaquesRaw = JSON.parse(fs.readFileSync("/data/plaques.json", "utf-8")) as Plaque[];
        plaques = new Map<string, Plaque>();
        for (const plaque of plaquesRaw) {
            plaques.set(plaque.person.id, plaque);
        }

        // missing
        console.log("Computing missing persons data");
        const missingRaw = JSON.parse(fs.readFileSync("/data/missing.json", "utf-8")) as Missing[];
        missingPerPerson = new Map<string, MissingPerson>();
        for (const missing of missingRaw) {
            for (const person of missing.persons) {
                const missingPerson = missingPerPerson.get(person.id) ?? { person, missing: [] };
                missingPerson.missing.push({
                    sourceText: missing.sourceText,
                    period: missing.period,
                    session: missing.session,
                    date: missing.date,
                    nameInText: person.nameInText,
                });
                missingPerPerson.set(person.id, missingPerson);
            }
        }

        // screamers
        console.log("Computing screamers data");
        const screamersRaw = JSON.parse(fs.readFileSync("/data/screamers.json", "utf-8")) as Screamer[];
        const screamsAtPersonRaw = new Map<string, Scream[]>();
        screamsFromPerson = new Map<string, SectionScreams[]>();
        for (const screamer of screamersRaw) {
            const screamsPerSection = new Map<string, SectionScreams>();
            for (const scream of screamer.screams) {
                const sectionKey = scream.period + "-" + scream.session + "-" + scream.section;
                const sectionScreams: SectionScreams = screamsPerSection.get(sectionKey) ?? {
                    period: scream.period,
                    session: scream.session,
                    section: scream.section,
                    date: scream.date,
                    person: scream.person,
                    direction: "to",
                    texts: [],
                };
                sectionScreams.texts.push(scream.text);
                screamsPerSection.set(sectionKey, sectionScreams);

                const screamsAt = screamsAtPersonRaw.get(scream.person.id) ?? [];
                screamsAt.push({
                    period: scream.period,
                    session: scream.session,
                    section: scream.section,
                    date: scream.date,
                    text: scream.text,
                    person: screamer.person,
                    direction: "from",
                });
                screamsAtPersonRaw.set(scream.person.id, screamsAt);
            }
            screamsFromPerson.set(screamer.person.id, Array.from(screamsPerSection.values()));
        }
        screamsAtPerson = new Map<string, SectionScreams[]>();
        for (const screamedAt of screamsAtPersonRaw.keys()) {
            const screamsPerSection = new Map<string, SectionScreams>();
            const screams = screamsAtPersonRaw.get(screamedAt)!;
            for (const scream of screams) {
                const sectionKey = scream.person.id + "-" + scream.period + "-" + scream.session + "-" + scream.section;
                const sectionScreams: SectionScreams = screamsPerSection.get(sectionKey) ?? {
                    period: scream.period,
                    session: scream.session,
                    section: scream.section,
                    date: scream.date,
                    person: scream.person,
                    direction: scream.direction,
                    texts: [],
                };
                sectionScreams.texts.push(scream.text);
                screamsPerSection.set(sectionKey, sectionScreams);
            }
            screamsAtPerson.set(
                screamedAt,
                Array.from(screamsPerSection.values()).sort((a, b) => {
                    if (a.date != b.date) return b.date.localeCompare(a.date);
                    if (a.session != b.session) return b.session - a.session;
                    return b.section - a.section;
                })
            );
        }
    } catch (e) {
        console.error("Could not load data", e);
        persons = new Persons([]);
        sessions = [];
    }
}

async function updateData() {
    try {
        const persons = new Persons(await processPersons("/data"));
        processSessions(persons, "/data");
    } catch (e) {
        console.error("Could not update data", e);
    }
}

(async () => {
    const app = express();
    app.set("json spaces", 2);
    app.use(cors());
    app.use(compression());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.get("/api/persons/:id?", (req, res) => {
        try {
            const id = req.params.id;
            if (!id) {
                res.json(persons.persons);
            } else {
                if (isAllDigits(id)) {
                    const person = persons.byId(id);
                    if (!person) throw new Error();
                    return res.json([{ person, score: 1 }]);
                }

                const result = persons.search(id);
                if (!result) {
                    res.status(400).json({});
                    return;
                }
                for (const r of result) {
                    r.score = r.score == 0 ? 1 : 1 / (r.score + 1);
                }
                res.json(result);
            }
        } catch (e) {
            console.error("Could not return persons for id " + req.params.id);
            res.status(400).json({ error: "Could not return persons for id " + req.params.id });
        }
    });

    app.get("/api/sessions/:period?/:session?", (req, res) => {
        try {
            const period = req.params.period;
            const sessionNumber = req.params.session ? parseInt(req.params.session) : undefined;
            if (!period) {
                res.json(sessions);
            } else {
                if (!sessionNumber) {
                    const result = sessions.filter((session) => session.period == period);
                    if (!result) res.status(400);
                    res.json(result);
                } else {
                    const result = sessions.filter((session) => session.period == period && session.sessionNumber == sessionNumber);
                    if (!result) res.status(400);
                    res.json(result);
                }
            }
        } catch (e) {
            console.error("Could not return sessions for period " + req.params.period + ", session number " + req.params.session);
            res.status(400).json({ error: "Could not return sessions for period " + req.params.period + ", session number " + req.params.session });
        }
    });

    app.get("/api/sections", (req, res) => {
        try {
            const start = performance.now();
            const periods = toArray(req.query.period);
            const sessions = toArray(req.query.session).map((session) => parseInt(session));
            const parties = toArray(req.query.party);
            const persons = toArray(req.query.person);
            const fromDate = req.query.from ? new Date(req.query.from as string) : undefined;
            const toDate = req.query.to ? new Date(req.query.to as string) : undefined;
            const query = (req.query.query as string) ?? "";
            const result = querySpeakerSections(periods, sessions, parties, persons, fromDate, toDate, query);
            const uniquePeriods = new Set<string>();
            const uniqueSessions = new Set<string>();
            for (const section of result.sections) {
                uniquePeriods.add(section.period);
                uniqueSessions.add(section.period + "-" + section.session);
            }
            const counts = {
                periods: uniquePeriods.size,
                sessions: uniqueSessions.size,
                sections: result.sections.length,
                persons: result.persons.length,
            };

            res.json({ took: ((performance.now() - start) / 1000).toFixed(3), counts, ...result });
        } catch (e) {
            const params = JSON.stringify(req.query, null, 2);
            console.error("Could not answer query, params:\n" + params, e);
            res.status(400).json({ error: "Could not answer query, params:\n" + params });
        }
    });

    app.get("/api/section/:period/:session/:section", async (req, res) => {
        try {
            const period = req.params.period as string;
            const sessionNumber = req.params.session as string;
            const sectionIndex = parseInt(req.params.section as string);
            const session = sessionsById.get(period + "-" + sessionNumber);
            if (!session) throw new Error();
            const section = session.sections[sectionIndex];
            if (!section) throw new Error();
            const person = persons.byId(section.speaker as string);
            if (!person) throw new Error();
            const sessionSection: SessionSection = {
                date: session.date,
                period,
                session: session.sessionNumber,
                sectionIndex,
                section: {
                    ...section,
                    speaker: person,
                },
            };
            res.json(sessionSection);
        } catch (e) {
            console.error("Could not get section", e);
            res.status(400).json({ error: "Could not get section" });
        }
    });

    app.get("/api/plaques/:id", async (req, res) => {
        try {
            const plaque = plaques.get(req.params.id as string);
            if (!plaque) {
                res.json([]);
                return;
            }
            res.json(plaque.callouts);
        } catch (e) {
            console.error("Could not get plaques for person " + req.params.id, e);
            res.status(400).json({ error: "Could not get plaques for person " + req.params.id });
        }
    });

    app.get("/api/missing/:id", async (req, res) => {
        try {
            const missingPerson = missingPerPerson.get(req.params.id as string);
            const person = persons.idToPerson.get(req.params.id as string);
            if (!person) throw new Error();
            if (!missingPerson) {
                res.json({ person, missing: [] });
                return;
            }
            res.json(missingPerson);
        } catch (e) {
            console.error("Could not get abscence information for person " + req.params.id, e);
            res.status(400).json({ error: "Could not get abscence information for person " + req.params.id });
        }
    });

    app.get("/api/screams/:id", async (req, res) => {
        try {
            const screams = screamsFromPerson.get(req.params.id as string) ?? [];
            res.json(screams);
        } catch (e) {
            console.error("Could not get screams from person " + req.params.id, e);
            res.status(400).json({ error: "Could not get screams from person " + req.params.id });
        }
    });

    app.get("/api/screamsat/:id", async (req, res) => {
        try {
            const screams = screamsAtPerson.get(req.params.id as string) ?? [];
            res.json(screams);
        } catch (e) {
            console.error("Could not get screams at person " + req.params.id, e);
            res.status(400).json({ error: "Could not get screams at person " + req.params.id });
        }
    });

    app.get("/api/reload", async (req, res) => {
        try {
            await loadData();
            res.json({ message: "OK" });
        } catch (e) {
            console.error("Could not reload data", e);
            res.status(400).json({ error: "Could not reload data" });
        }
    });

    const server = http.createServer(app);
    server.listen(port, async () => {
        console.log(`App listening on port ${port}`);
    });

    setupLiveReload(server);
    loadData();
    /*const update = () => {
        updateData();
        setTimeout(update, 24 * 60 * 60 * 1000);
    };
    if (persons.persons.length == 0) setTimeout(updateData, 0);
    else setTimeout(update, 24 * 60 * 60 * 1000);*/
})();

function setupLiveReload(server: http.Server) {
    const wss = new WebSocketServer({ server });
    const clients: Set<WebSocket> = new Set();
    wss.on("connection", (ws: WebSocket) => {
        clients.add(ws);
        ws.on("close", () => {
            clients.delete(ws);
        });
    });

    chokidar.watch("html/", { ignored: /(^|[\/\\])\../, ignoreInitial: true }).on("all", (event, path) => {
        clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(`File changed: ${path}`);
            }
        });
    });
    console.log("Initialized live-reload");
}
