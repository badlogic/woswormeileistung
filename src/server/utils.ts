import * as fs from "fs";
import * as iconv from "iconv-lite";
import { sleep } from "../utils/utils";

export async function fetchAndSaveHtml(url: string, outputPath: string): Promise<void> {
    let retries = 3;
    while (true) {
        try {
            const response = await fetch(url);
            const buffer = await response.arrayBuffer();
            let body = Buffer.from(buffer);

            const regex = /<meta.*?charset=["']*(.+?)["'>]/i;
            const matches = regex.exec(body.toString("utf-8"));
            const charset = matches && matches[1] ? matches[1].toLowerCase() : "utf-8";

            let bytes: Buffer = body;
            if (charset !== "utf-8") {
                bytes = iconv.encode(iconv.decode(body, charset), "utf-8");
            }

            fs.writeFileSync(outputPath, body);
            return;
        } catch (e) {
            retries--;
            if (retries > 0) {
                console.error("Failed to fetch url " + url + ", retrying");
                await sleep(500);
            } else throw e;
        }
    }
}
