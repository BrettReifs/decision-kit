import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { scaffoldKit, validateKit } from "../.github/skills/data-handoff/reproduction-kit.mjs";

const skill = new URL("../.github/skills/data-handoff/", import.meta.url);
const script = fileURLToPath(new URL("bootstrap.mjs", skill));
const demo = readFileSync(new URL("handoff-template.md", skill), "utf8");
const cli = (...args) => spawnSync(process.execPath, [script, ...args], { encoding: "utf8" });
const save = (root, file, value) => writeFileSync(join(root, file), JSON.stringify(value));

function fixture(t) {
    const parent = mkdtempSync(join(tmpdir(), "reproduction-kit-"));
    t.after(() => rmSync(parent, { recursive: true, force: true }));
    const root = join(parent, "kit");
    scaffoldKit(root);
    const slices = ["overview", "team"].map((id) => ({
        id, viewer: `${id} viewer (synthetic)`, boundary: "Fixture → viewer",
        visibilityAccess: "UI visibility only; access enforcement Unknown.",
        handoff: `slices/${id}.md`, evidenceIds: ["fixture-note"],
    }));
    for (const slice of slices) writeFileSync(join(root, slice.handoff), demo);
    save(root, "slices.json", slices);
    writeFileSync(join(root, "synthetic-evidence.txt"), "Synthetic fixture note; no observed benchmark or security claim.");
    const provenance = {
        source: { repository: "Unknown", commit: "Unknown" },
        harness: { name: "Synthetic fixture", behavior: "Unknown" },
        model: { identifier: "Unknown", version: "Unknown", settings: "Unknown" },
        prompts: [{ path: "synthetic-evidence.txt", evidenceIds: ["fixture-note"] }],
        scripts: [], tools: [],
        evidence: [{ id: "fixture-note", path: "synthetic-evidence.txt" }],
    };
    save(root, "provenance.json", provenance);
    const cases = slices.map(({ id }) => ({
        id: `${id}-golden`, sliceId: id, kind: "golden",
        input: { request_id: "synthetic-request", ticket_text: "Synthetic ticket" },
        expectedProperties: ["request_id is unchanged", "No invented account status"],
        evidenceIds: ["fixture-note"],
    }));
    cases.push({
        id: "team-denied", sliceId: "team", kind: "negative",
        input: { viewer: "other-team" }, expectedProperties: ["Do not disclose the selected team's records"],
    });
    const saveCases = () => writeFileSync(join(root, "cases.jsonl"), cases.map((item) => JSON.stringify(item)).join("\n") + "\n");
    saveCases();
    return { root, parent, slices, provenance, cases, saveCases };
}

test("synthetic multi-viewer fixture passes module and CLI without semantic claims", (t) => {
    const { root, provenance } = fixture(t);
    assert.deepEqual(validateKit(root), []);
    provenance.model.settings = { temperature: 0 };
    save(root, "provenance.json", provenance);
    assert.deepEqual(validateKit(root), []);
    const child = cli("validate", root);
    assert.equal(child.status, 0, child.stderr);
    assert.match(child.stdout, /Kit structure valid only/);
    assert.match(child.stdout, /Not semantic correctness, verified authorization, privacy clearance, benchmark success, or reproduction fidelity/);
});

test("scaffold is explicitly incomplete and refuses all existing destinations", (t) => {
    const parent = mkdtempSync(join(tmpdir(), "reproduction-scaffold-"));
    t.after(() => rmSync(parent, { recursive: true, force: true }));
    const root = join(parent, "kit");
    const child = cli("scaffold", root);
    assert.equal(child.status, 0, child.stderr);
    assert.match(child.stdout, /Incomplete scaffold/);
    assert.match(readFileSync(join(root, "HANDOFF.md"), "utf8"), /No evidence, benchmark scores/);
    assert.equal(readFileSync(join(root, "cases.jsonl"), "utf8"), "");
    assert.ok(validateKit(root).some((error) => /golden case/.test(error)));
    assert.ok(validateKit(root).some((error) => /valid fenced json/.test(error)));
    assert.equal(cli("validate", root).status, 1);
    writeFileSync(join(root, "HANDOFF.md"), "User file");
    assert.throws(() => scaffoldKit(root), { code: "EEXIST" });
    assert.equal(cli("scaffold", root).status, 1);
    assert.equal(readFileSync(join(root, "HANDOFF.md"), "utf8"), "User file");
    assert.throws(() => scaffoldKit(parent), { code: "EEXIST" });
    const alias = join(parent, "alias");
    symlinkSync(root, alias, "dir");
    assert.throws(() => scaffoldKit(alias), { code: "EEXIST" });
});

test("malformed JSON and JSONL do not echo private content", (t) => {
    for (const file of ["slices.json", "provenance.json", "cases.jsonl"]) {
        const { root } = fixture(t);
        writeFileSync(join(root, file), '{"private-marker": invalid}');
        const errors = validateKit(root);
        assert.ok(errors.some((error) => /invalid JSON/.test(error)));
        assert.doesNotMatch(errors.join("\n"), /private-marker/);
        const child = cli("validate", root);
        assert.equal(child.status, 1);
        assert.doesNotMatch(child.stderr, /private-marker/);
    }
});

test("missing and duplicate IDs fail in every record collection", (t) => {
    for (const collection of ["slices", "cases", "evidence"]) {
        for (const missing of [true, false]) {
            const { root, slices, provenance, cases, saveCases } = fixture(t);
            const items = collection === "evidence" ? provenance.evidence : collection === "slices" ? slices : cases;
            if (missing) delete items[0].id;
            else items.push({ ...items[0] });
            save(root, "slices.json", slices);
            save(root, "provenance.json", provenance);
            saveCases();
            assert.ok(validateKit(root).some((error) => missing ? /missing or invalid ID/.test(error) : /duplicate ID/.test(error)));
        }
    }
});

test("case links, evidence links, and golden coverage are checked per slice", (t) => {
    for (const mutate of [
        ({ cases }) => { delete cases[0].sliceId; },
        ({ cases }) => { cases[0].sliceId = "absent"; },
        ({ slices }) => { slices[0].evidenceIds = ["absent"]; },
        ({ cases }) => { cases[0].evidenceIds = ["absent"]; },
        ({ provenance }) => { provenance.prompts[0].evidenceIds = ["absent"]; },
        ({ cases }) => { cases[1].kind = "negative"; },
    ]) {
        const data = fixture(t);
        mutate(data);
        save(data.root, "slices.json", data.slices);
        save(data.root, "provenance.json", data.provenance);
        data.saveCases();
        assert.notEqual(validateKit(data.root).length, 0);
    }
});

test("required fields and JSON shapes fail cleanly, with no invented defaults", (t) => {
    for (const mutate of [
        ({ cases }) => { delete cases[0].input; },
        ({ cases }) => { cases[0].expectedProperties = []; },
        ({ cases }) => { cases[0].expectedProperties = [null]; },
        ({ cases }) => { cases[0].kind = "unspecified"; },
        ({ slices }) => { delete slices[0].visibilityAccess; },
        ({ provenance }) => { delete provenance.model.settings; },
        ({ provenance }) => { delete provenance.source.commit; },
        ({ provenance }) => { provenance.harness = null; },
        ({ provenance }) => { provenance.tools = {}; },
        ({ provenance }) => { provenance.evidence = [null]; },
        ({ cases }) => { cases[0] = null; },
        ({ slices }) => { slices[0] = null; },
        ({ slices }) => { slices.length = 0; },
    ]) {
        const data = fixture(t);
        mutate(data);
        save(data.root, "slices.json", data.slices);
        save(data.root, "provenance.json", data.provenance);
        data.saveCases();
        assert.notEqual(validateKit(data.root).length, 0);
    }
    for (const file of ["slices.json", "provenance.json"]) {
        const { root } = fixture(t);
        save(root, file, null);
        assert.notEqual(validateKit(root).length, 0);
    }
});

test("missing handoffs and invalid five-section handoffs use the existing validator", (t) => {
    const { root, slices } = fixture(t);
    rmSync(join(root, slices[0].handoff));
    assert.ok(validateKit(root).some((error) => /handoff: file missing/.test(error)));
    writeFileSync(join(root, slices[0].handoff), demo + "\n## Extra\nNot allowed");
    assert.ok(validateKit(root).some((error) => /Unexpected heading/.test(error)));
    rmSync(join(root, "HANDOFF.md"));
    assert.ok(validateKit(root).some((error) => /HANDOFF.md: file missing/.test(error)));
});

test("all declared local paths reject traversal, absolute paths, and escaped symlinks", (t) => {
    for (const field of ["handoff", "evidence", "prompts", "scripts", "tools"]) {
        for (const path of ["../outside.md", "slices/../../outside.md", "/tmp/outside.md", "C:\\outside.md", "..\\outside.md", "C:outside.md", "escape.md", "escape-dir/outside.md", "slices", "missing.txt"]) {
            const { root, parent, slices, provenance } = fixture(t);
            writeFileSync(join(parent, "outside.md"), demo);
            symlinkSync(join(parent, "outside.md"), join(root, "escape.md"));
            symlinkSync(parent, join(root, "escape-dir"), "dir");
            if (field === "handoff") slices[0].handoff = path;
            else if (field === "evidence") provenance.evidence[0].path = path;
            else provenance[field] = [{ path }];
            save(root, "slices.json", slices);
            save(root, "provenance.json", provenance);
            assert.ok(validateKit(root).some((error) => /file missing|local kit-relative/.test(error)), `${field}: ${path}`);
        }
    }
});

test("top-level manifest symlinks cannot escape; in-kit symlinks can be read", (t) => {
    const { root, parent, slices } = fixture(t);
    const outside = join(parent, "outside.json");
    save(parent, "outside.json", slices);
    rmSync(join(root, "slices.json"));
    symlinkSync(outside, join(root, "slices.json"));
    assert.ok(validateKit(root).some((error) => /slices.json: file missing/.test(error)));
    rmSync(join(root, "slices.json"));
    save(root, "local-slices.json", slices);
    symlinkSync(join(root, "local-slices.json"), join(root, "slices.json"));
    assert.deepEqual(validateKit(root), []);
});

test("CLI usage errors and missing kits fail without executing files", () => {
    for (const args of [[], ["validate"], ["execute", "/tmp"], ["validate", "/tmp", "extra"], ["validate", "/nonexistent-reproduction-kit"]]) {
        const child = cli(...args);
        assert.equal(child.status, 1);
        assert.notEqual(child.stderr.trim(), "");
        assert.equal(child.stdout, "");
    }
});
