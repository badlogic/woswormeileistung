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

const port = process.env.PORT ?? 3333;

let persons = new Persons([]);
let sessions: Session[] = [];

function loadData() {
    try {
        console.log("Loading data");
        persons = new Persons(JSON.parse(fs.readFileSync("/data/persons.json", "utf-8")));
        sessions = JSON.parse(fs.readFileSync("/data/sessions.json", "utf-8")) as Session[];
        console.log(`Loaded ${persons.persons.length} persons, ${sessions.length} sessions`);
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
                const result = persons.byId(id);
                if (!result) res.status(400);
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
    if (process.env.DEV) {
        if (persons.persons.length == 0) setTimeout(updateData, 0);
        else setTimeout(update, 24 * 60 * 60 * 1000);
    }
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
