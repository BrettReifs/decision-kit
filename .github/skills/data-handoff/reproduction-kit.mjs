import { mkdirSync, readFileSync, realpathSync, statSync, writeFileSync } from "node:fs";
import { isAbsolute, relative, resolve } from "node:path";
import { validateHandoff } from "./validate-handoff.mjs";

const object = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const text = (value) => typeof value === "string" && value.trim().length > 0;
const id = (value) => text(value) && /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(value);
const inside = (root, path) => {
    const part = relative(root, path);
    return part !== ".." && !part.startsWith("../") && !part.startsWith("..\\") && !isAbsolute(part);
};

export function scaffoldKit(destination) {
    const root = resolve(destination);
    // Reserving a new directory also refuses existing empty directories and symlinks.
    mkdirSync(root);
    mkdirSync(resolve(root, "slices"));
    const files = {
        "HANDOFF.md": `# Reproduction handoff — incomplete

This is an unfilled scaffold, not a benchmark or evidence of reproduction.
Outcome, achieved threshold, benchmark scope, and exclusions: **Unknown**.

## Slice index

| ID | Viewer | Boundary | Local handoff | Evidence |
|---|---|---|---|---|
| selected-example | Unknown | Unknown | [handoff](slices/selected-example.md) | None captured |

Select the real slices before writing their handoffs. Inventory other slices briefly
and mark them excluded. Access enforcement and UI visibility: **Unknown**.
Document shared transformations once and link them from each relevant slice.

## Port and re-evaluate

Port mappings, validation, decision gates, and output normalization deterministically
when supported by evidence. Substitute and re-evaluate the model, orchestration,
and harness-specific behavior. Do not assume candidate Foundry models are equivalent.

## Evidence and acceptance

No evidence, benchmark scores, or golden cases have been supplied.
Add sanitized cases and local code/test/trace excerpts, then define measurable
per-slice acceptance properties. Label observations, assumptions, and recommendations.
Review privacy and authorization separately; structural validation proves neither.
`,
        "slices.json": JSON.stringify([{
            id: "selected-example", viewer: "Unknown", boundary: "Unknown",
            visibilityAccess: "Unknown: distinguish UI hiding from actual access enforcement.",
            handoff: "slices/selected-example.md", evidenceIds: [],
        }], null, 2) + "\n",
        "cases.jsonl": "",
        "provenance.json": JSON.stringify({
            source: { repository: "Unknown", commit: "Unknown" },
            harness: { name: "Unknown", behavior: "Unknown" },
            model: { identifier: "Unknown", version: "Unknown", settings: "Unknown" },
            prompts: [], scripts: [], tools: [], evidence: [],
        }, null, 2) + "\n",
        "slices/selected-example.md": `# Selected boundary — incomplete

## Purpose

**Unknown:** Identify the producer → consumer and selected viewer.

## Input JSON

**Unknown:** Supply a sanitized observed input; do not invent an interface.

## Output JSON

**Unknown:** Supply a sanitized observed output.

## Field map

Unknown: trace consequential transformations and reference shared mappings once.

## Handling rules

- **Unknown:** Find evidence for validation, decision gates, failures, and access enforcement.
`,
    };
    for (const [path, content] of Object.entries(files)) {
        writeFileSync(resolve(root, path), content, { flag: "wx" });
    }
    return root;
}

export function validateKit(directory) {
    const errors = [];
    let root;
    try {
        root = realpathSync(resolve(directory));
        if (!statSync(root).isDirectory()) throw new Error();
    } catch {
        return ["Cannot read kit directory."];
    }

    function localFile(path, label) {
        if (!text(path) || isAbsolute(path) || path.includes("\\")
            || path.includes("\0") || path.split("/").includes("..") || /^[a-zA-Z]:/.test(path)) {
            errors.push(`${label}: expected a local kit-relative file path without traversal.`);
            return;
        }
        try {
            const file = resolve(root, path);
            const real = realpathSync(file);
            if (!inside(root, file) || !inside(root, real) || !statSync(real).isFile()) throw new Error();
            return real;
        } catch {
            errors.push(`${label}: file missing, not regular, or escapes the kit.`);
        }
    }

    function read(path, label) {
        const file = localFile(path, label);
        if (!file) return;
        try {
            return readFileSync(file, "utf8");
        } catch {
            errors.push(`${label}: cannot read file.`);
        }
    }

    function json(path) {
        const content = read(path, path);
        if (content === undefined) return;
        try {
            return JSON.parse(content);
        } catch {
            errors.push(`${path}: invalid JSON.`);
        }
    }

    function records(value, label, nonempty = false) {
        if (!Array.isArray(value) || (nonempty && !value.length)) {
            errors.push(`${label}: expected ${nonempty ? "a nonempty" : "an"} array.`);
            return [];
        }
        return value;
    }

    function identity(value, label, seen) {
        if (!id(value)) errors.push(`${label}: missing or invalid ID.`);
        else if (seen.has(value)) errors.push(`${label}: duplicate ID.`);
        else seen.add(value);
    }

    function requiredText(value, keys, label) {
        for (const key of keys) {
            if (!text(value[key])) errors.push(`${label}: ${key} needs text (use Unknown if not captured).`);
        }
    }

    read("HANDOFF.md", "HANDOFF.md");
    const slices = records(json("slices.json"), "slices.json", true);
    const provenance = json("provenance.json");
    const evidenceIds = new Set();
    if (!object(provenance)) {
        errors.push("provenance.json: expected an object.");
    } else {
        for (const [key, fields] of [
            ["source", ["repository", "commit"]],
            ["harness", ["name", "behavior"]],
            ["model", ["identifier", "version"]],
        ]) {
            if (!object(provenance[key])) errors.push(`provenance.${key}: expected an object.`);
            else requiredText(provenance[key], fields, `provenance.${key}`);
        }
        if (object(provenance.model) && provenance.model.settings !== "Unknown"
            && !object(provenance.model.settings)) {
            errors.push("provenance.model.settings: expected settings object or Unknown.");
        }
        for (const [index, item] of records(provenance.evidence, "provenance.evidence").entries()) {
            const label = `provenance.evidence[${index}]`;
            if (!object(item)) {
                errors.push(`${label}: expected an object.`);
                continue;
            }
            identity(item.id, label, evidenceIds);
            localFile(item.path, label);
        }
        for (const key of ["prompts", "scripts", "tools"]) {
            for (const [index, item] of records(provenance[key], `provenance.${key}`).entries()) {
                const label = `provenance.${key}[${index}]`;
                if (!object(item)) errors.push(`${label}: expected an object.`);
                else {
                    localFile(item.path, label);
                    if (item.evidenceIds !== undefined) links(item.evidenceIds, label);
                }
            }
        }
    }

    function links(value, label) {
        for (const reference of records(value, `${label}.evidenceIds`)) {
            if (!id(reference) || !evidenceIds.has(reference)) {
                errors.push(`${label}: unknown or invalid evidence ID.`);
            }
        }
    }

    const sliceIds = new Set();
    for (const [index, slice] of slices.entries()) {
        const label = `slices[${index}]`;
        if (!object(slice)) {
            errors.push(`${label}: expected an object.`);
            continue;
        }
        identity(slice.id, label, sliceIds);
        requiredText(slice, ["viewer", "boundary", "visibilityAccess"], label);
        links(slice.evidenceIds, label);
        const handoff = read(slice.handoff, `${label}.handoff`);
        if (handoff !== undefined) {
            for (const error of validateHandoff(handoff)) errors.push(`${label}.handoff: ${error}`);
        }
    }

    const caseIds = new Set();
    const golden = new Set();
    const lines = read("cases.jsonl", "cases.jsonl");
    if (lines !== undefined) {
        for (const [index, line] of lines.split(/\r?\n/).entries()) {
            if (!line.trim()) continue;
            const label = `cases.jsonl line ${index + 1}`;
            let item;
            try {
                item = JSON.parse(line);
            } catch {
                errors.push(`${label}: invalid JSON.`);
                continue;
            }
            if (!object(item)) {
                errors.push(`${label}: expected an object.`);
                continue;
            }
            identity(item.id, label, caseIds);
            if (!id(item.sliceId) || !sliceIds.has(item.sliceId)) errors.push(`${label}: missing or unknown slice ID.`);
            if (!["golden", "negative"].includes(item.kind)) errors.push(`${label}: kind must be golden or negative.`);
            if (!Object.hasOwn(item, "input")) errors.push(`${label}: missing input.`);
            const properties = records(item.expectedProperties, `${label}.expectedProperties`, true);
            if (properties.some((property) => !text(property))) errors.push(`${label}: expected properties must be nonempty text.`);
            if (item.evidenceIds !== undefined) links(item.evidenceIds, label);
            if (item.kind === "golden") golden.add(item.sliceId);
        }
    }
    for (const sliceId of sliceIds) {
        if (!golden.has(sliceId)) errors.push("Selected slice needs at least one golden case.");
    }
    return errors;
}
