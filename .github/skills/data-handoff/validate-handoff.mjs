import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const headings = ["Purpose", "Input JSON", "Output JSON", "Field map", "Handling rules"];

export function validateHandoff(markdown) {
    const errors = [];
    const found = [];
    const sections = new Map(headings.map((heading) => [heading, []]));
    const examples = new Map(headings.map((heading) => [heading, 0]));
    let section;
    let fence;

    for (const [index, line] of markdown.split(/\r?\n/).entries()) {
        const lineNumber = index + 1;
        if (fence) {
            const closing = line.match(/^ {0,3}(`{3,}|~{3,})[ \t]*$/);
            if (closing && closing[1][0] === fence.marker[0]
                && closing[1].length >= fence.marker.length) {
                if (fence.json) {
                    try {
                        JSON.parse(fence.lines.join("\n"));
                        if (examples.has(fence.section)) {
                            examples.set(fence.section, examples.get(fence.section) + 1);
                        }
                    } catch {
                        errors.push(`Invalid JSON block at line ${fence.line}.`);
                    }
                }
                fence = undefined;
            } else {
                fence.lines.push(line);
            }
            continue;
        }

        const opening = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
        if (opening) {
            fence = {
                marker: opening[1], json: opening[2].trim().toLowerCase() === "json",
                section, line: lineNumber, lines: [],
            };
            continue;
        }

        const heading = line.match(/^ {0,3}(#{1,6})[ \t]+(.+?)[ \t]*#*[ \t]*$/);
        if (heading) {
            if (heading[1] === "##" && headings.includes(heading[2])) {
                section = heading[2];
                found.push(section);
            } else if (heading[1] !== "#" || found.length > 0) {
                errors.push(`Unexpected heading at line ${lineNumber}; use only the five required sections.`);
                section = undefined;
            }
        } else if (sections.has(section)) {
            sections.get(section).push(line);
        }
    }

    if (fence) errors.push(`Unclosed fenced block at line ${fence.line}.`);
    if (found.join("|") !== headings.join("|")) {
        errors.push(`Required sections must appear exactly once in order: ${headings.join(", ")} (use ## headings).`);
    }
    if (!sections.get("Purpose").some((line) => line.trim())) {
        errors.push("Purpose needs a short boundary description.");
    }
    for (const heading of ["Input JSON", "Output JSON"]) {
        if (examples.get(heading) === 0) {
            errors.push(`${heading} needs at least one valid fenced json example; unknown interfaces remain incomplete.`);
        }
    }
    const map = sections.get("Field map");
    const tableRows = map.filter((line) => /^\s*\|.*\|\s*$/.test(line));
    const hasTable = tableRows.length >= 3
        && /^\s*\|(?:\s*:?-{3,}:?\s*\|)+\s*$/.test(tableRows[1]);
    if (!hasTable && !map.some((line) => /^(No non-obvious mappings\.|(?:\*\*)?Unknown\b)/.test(line.trim()))) {
        errors.push("Field map needs a table with a data row, 'No non-obvious mappings.', or an explicit Unknown.");
    }
    if (!sections.get("Handling rules").some((line) => /^\s*[-*+] +\S/.test(line))) {
        errors.push("Handling rules needs at least one nonempty rule or unresolved-decision bullet.");
    }
    return errors;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
    if (process.argv.length !== 3) {
        console.error("Usage: node validate-handoff.mjs /absolute/path/to/handoff.md");
        process.exitCode = 1;
    } else {
        try {
            const errors = validateHandoff(readFileSync(process.argv[2], "utf8"));
            if (errors.length) {
                for (const error of errors) console.error(error);
                process.exitCode = 1;
            } else {
                console.log("Handoff format valid. Code interpretation and safety still need review.");
            }
        } catch {
            console.error("Cannot read handoff file.");
            process.exitCode = 1;
        }
    }
}
