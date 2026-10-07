import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { scaffoldKit, validateKit } from "./reproduction-kit.mjs";

export function main(args) {
    if (args.length !== 2 || !["scaffold", "validate"].includes(args[0])) {
        console.error("Usage: node bootstrap.mjs scaffold|validate /absolute/path/to/kit");
        return 1;
    }
    try {
        if (args[0] === "scaffold") {
            scaffoldKit(args[1]);
            console.log("Incomplete scaffold created. Supply real boundaries, sanitized evidence, and golden cases before validation.");
            return 0;
        }
        const errors = validateKit(args[1]);
        if (errors.length) {
            for (const error of errors) console.error(error);
            return 1;
        }
        console.log("Kit structure valid only. Not semantic correctness, verified authorization, privacy clearance, benchmark success, or reproduction fidelity.");
        return 0;
    } catch {
        console.error("Cannot complete kit operation. Scaffold requires a new directory with an existing parent; no existing files are overwritten.");
        return 1;
    }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
    process.exitCode = main(process.argv.slice(2));
}
