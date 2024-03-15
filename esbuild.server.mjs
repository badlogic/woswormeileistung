#!/usr/bin/env node

import esbuild from "esbuild";

let watch = process.argv.length >= 3 && process.argv[2] == "--watch";

const config = {
    entryPoints: {
        "process-data": "src/cli/process-data.ts",
        persons: "src/cli/persons.ts",
        sessions: "src/cli/sessions.ts",
        plaque: "src/cli/plaque.ts",
        screamer: "src/cli/screamers.ts",
        missing: "src/cli/missing.ts",
        server: "src/server/server.ts",
    },
    bundle: true,
    sourcemap: true,
    platform: "node",
    external: ["fsevents"],
    outdir: "build/",
    logLevel: "info",
    minify: false,
    loader: {
        ".ttf": "dataurl",
        ".woff": "dataurl",
        ".woff2": "dataurl",
        ".eot": "dataurl",
        ".html": "text",
        ".svg": "text",
        ".css": "text",
    },
};

if (!watch) {
    console.log("Building cli tools");
    await esbuild.build(config);
} else {
    const buildContext = await esbuild.context(config);
    buildContext.watch();
}
