import bodyParser from "body-parser";
import * as chokidar from "chokidar";
import compression from "compression";
import cors from "cors";
import express from "express";
import * as fs from "fs";
import * as http from "http";
import WebSocket, { WebSocketServer } from "ws";
import { Persons, processPersons } from "./persons";
import { Session } from "../common/common";
import { processSessions } from "./sessions";
import { initQueries, isAllDigits, querySpeakerSections } from "./query";

const port = process.env.PORT ?? 3333;

export let persons = new Persons([]);
export let sessions: Session[] = [];

function toArray(queryParam: string[] | string | any | undefined): string[] {
    if (queryParam == undefined) return [];
    if (typeof queryParam == "string") return [queryParam];
    if (Array.isArray(queryParam)) return queryParam;
    throw new Error("Unknown query parameter type");
}

function loadData() {
    try {
        console.log("Loading data");
        persons = new Persons(JSON.parse(fs.readFileSync("/data/persons.json", "utf-8")));
        sessions = JSON.parse(fs.readFileSync("/data/sessions.json", "utf-8")) as Session[];
        console.log(`Loaded ${persons.persons.length} persons, ${sessions.length} sessions`);
        initQueries(persons, sessions);
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
            const keywords = toArray(req.query.keyword);
            const result = querySpeakerSections(periods, sessions, parties, persons, fromDate, toDate, keywords);
            if (req.query.stats == "true") {
                const periods = new Set<string>();
                const sessions = new Set<string>();
                for (const section of result.sections) {
                    periods.add(section.period);
                    sessions.add(section.period + "-" + section.sessionNumber);
                }
                res.json({
                    took: ((performance.now() - start) / 1000).toFixed(3),
                    persons: result.persons,
                    periods: Array.from(periods.values()),
                    sessions: Array.from(sessions.values()),
                    counts: {
                        periods: periods.size,
                        sessions: sessions.size,
                        sections: result.sections.length,
                        persons: result.persons.length,
                    },
                });
            } else {
                res.json({ took: ((performance.now() - start) / 1000).toFixed(3), ...result });
            }
        } catch (e) {
            const params = JSON.stringify(req.query, null, 2);
            console.error("Could not answer query, params:\n" + params, e);
            res.status(400).json({ error: "Could not answer query, params:\n" + params });
        }
    });

    const server = http.createServer(app);
    server.listen(port, async () => {
        console.log(`App listening on port ${port}`);
    });

    setupLiveReload(server);
    loadData();
    const update = () => {
        updateData();
        setTimeout(update, 24 * 60 * 60 * 1000);
    };

    if (persons.persons.length == 0) setTimeout(updateData, 0);
    else setTimeout(update, 24 * 60 * 60 * 1000);
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
