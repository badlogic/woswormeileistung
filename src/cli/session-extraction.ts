import * as fs from "fs";
import { Person, Persons, Session } from "../common/common";
import { extractOrdercalls, extractSections, extractSectionsNew, resolveOrdercalls } from "../server/extraction";

(async () => {
    const persons = new Persons(JSON.parse(fs.readFileSync("./data/persons.json", "utf-8")) as Person[]);
    // const baseFile = "2016-09-21-XXV-144";
    // const baseFile = "2023-07-06-XXVII-224";
    // const baseFile = "2008-09-12-XXIII-71";
    // const baseFile = "2004-11-11-XXII-84";
    // const baseFile = "2003-01-23-XXII-3";
    // const baseFile = "2016-11-09-XXV-150";
    // const baseFile = "2023-05-12-XXVII-211";
    // const baseFile = "2021-03-25-XXVII-91";
    // const baseFile = "2023-07-06-XXVII-224";
    // const baseFile = "2022-04-05-XXVII-152";
    // const baseFile = "2023-07-05-XXVII-222";
    // const baseFile = "2003-06-10-XXII-20";
    // const baseFile = "2019-09-25-XXVI-89";
    // const period = baseFile.split("-")[3];
    // const sessionNumber = baseFile.split("-")[4];
    // const sections = await extractSections(`./data/sessions/${baseFile}.html`, period, persons);
    // const sectionsNew = await extractSectionsNew(`./data/sessions/${baseFile}.html`, period, persons);

    for (const file of fs.readdirSync("./data/sessions/")) {
        if (file.endsWith(".html")) {
            console.log("processing " + file);
            const sectionsNew = await extractSectionsNew(`./data/sessions/${file}`, "XXX", persons);
        }
    }
    /*const session: Session = {
        date: baseFile.split("X")[0],
        period,
        sessionNumber: parseInt(sessionNumber),
        sessionLabel: sessionNumber,
        orderCalls: [],
        protocolUrls: [],
        sections,
        url: "",
    };
    session.orderCalls = await extractOrdercalls(`./data/sessions/${baseFile}.json.original`, session, persons);
    await resolveOrdercalls("./data", [session], persons);*/

    /*const session = JSON.parse(fs.readFileSync(`./data/sessions/${baseFile}.json`, "utf-8")) as Session;
    const oldSections = session.sections.map((item) => {
        return { speaker: (item.speaker as Person).id, text: item.text, isPresident: item.isPresident };
    });
    console.log(`${session.sections.length}, ${sections.length}`);
    for (let i = 0; i < Math.min(oldSections.length, sections.length); i++) {
        const newSection = sections[i];
        const oldSection = oldSections[i];

        if ((newSection.speaker as Person).id != oldSection.speaker) {
            console.log("Section " + i + ": person IDs differ, " + newSection.speaker + " != " + oldSection.speaker);
        }
    }*/
})();
