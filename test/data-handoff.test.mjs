import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { validateHandoff } from "../.github/skills/data-handoff/validate-handoff.mjs";

const skill = new URL("../.github/skills/data-handoff/", import.meta.url);
const template = new URL("handoff-template.md", skill);
const golden = readFileSync(template, "utf8");
const script = fileURLToPath(new URL("validate-handoff.mjs", skill));

test("synthetic golden path passes module and documented CLI", () => {
    assert.deepEqual(validateHandoff(golden), []);
    const child = spawnSync(process.execPath, [script, fileURLToPath(template)], { encoding: "utf8" });
    assert.equal(child.status, 0, child.stderr);
    assert.match(child.stdout, /Code interpretation and safety still need review/);
});

test("malformed JSON reports location without echoing data", () => {
    const errors = validateHandoff(golden.replace('"request_id": "req-demo-123",', '"request_id": "private-marker" invalid,'));
    assert.ok(errors.some((error) => /Invalid JSON block at line/.test(error)));
    assert.doesNotMatch(errors.join("\n"), /private-marker/);
});

test("missing, duplicate, extra, and out-of-order sections fail", () => {
    for (const draft of [
        golden.replace("## Purpose", "Purpose"),
        golden.replace("## Field map", "## Purpose"),
        golden.replace("## Input JSON", "## TEMP").replace("## Output JSON", "## Input JSON").replace("## TEMP", "## Output JSON"),
        `${golden}\n## Audit\nNot a core section.`,
    ]) {
        assert.notEqual(validateHandoff(draft).length, 0);
    }
});

test("both input and output need JSON examples; unknowns are not invented", () => {
    for (const heading of ["Input JSON", "Output JSON"]) {
        const draft = golden.replace(new RegExp("(## " + heading + "\\s+)```json[\\s\\S]*?```"), "$1Unknown: wire format not established.");
        assert.ok(validateHandoff(draft).some((error) => error.startsWith(`${heading} needs`)));
    }
});

test("missing map rows and empty handling rules fail; explicit no-map is valid", () => {
    const noMap = golden.replace(/(\#\# Field map\n)[\s\S]*?(?=\#\# Handling rules)/, "$1\nNo non-obvious mappings.\n\n");
    assert.deepEqual(validateHandoff(noMap), []);
    assert.ok(validateHandoff(noMap.replace("No non-obvious mappings.", "")).some((error) => error.startsWith("Field map needs")));
    assert.ok(validateHandoff(golden.replace(/\| `ticket_text`.*\n/, "")).some((error) => error.startsWith("Field map needs")));
    assert.ok(validateHandoff(golden.split("## Handling rules")[0] + "## Handling rules\n- ").some((error) => error.startsWith("Handling rules needs")));
});

test("Markdown fences support tildes, long backticks, indentation, CRLF, and literal headings", () => {
    for (const marker of ["~~~", "````"]) {
        const draft = golden.replaceAll("```", marker).replaceAll("\n", "\r\n");
        assert.deepEqual(validateHandoff(draft), []);
    }
    assert.deepEqual(validateHandoff(golden.replaceAll("```", "   ```")), []);
    assert.deepEqual(validateHandoff(`${golden}\n~~~text\n## Not a section\n~~~\n`), []);
    assert.ok(validateHandoff(golden.replace(/```\n\n## Field map/, "``\n\n## Field map")).some((error) => /Unclosed fenced block/.test(error)));
});

test("every fenced JSON example is checked, including optional errors", () => {
    const draft = golden.replace("## Field map", "```json\n{ invalid }\n```\n\n## Field map");
    assert.ok(validateHandoff(draft).some((error) => /Invalid JSON block/.test(error)));
});

test("CLI misuse, unreadable files, and invalid handoffs exit nonzero", () => {
    for (const args of [[], [fileURLToPath(new URL("missing.md", skill))], [script]]) {
        const child = spawnSync(process.execPath, [script, ...args], { encoding: "utf8" });
        assert.equal(child.status, 1);
        assert.notEqual(child.stderr.trim(), "");
        assert.equal(child.stdout, "");
    }
});
