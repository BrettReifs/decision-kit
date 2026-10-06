import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtemp, readdir, readFile, rm, mkdir, writeFile, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
    reportDeliveryObservations, runDeliveryHook,
} from "../.github/extensions/decision-kit/delivery-hook.mjs";

const script = fileURLToPath(new URL("../.github/extensions/decision-kit/delivery-hook.mjs", import.meta.url));

async function repository(t) {
    const cwd = await mkdtemp(join(tmpdir(), "decision-kit-test-"));
    t.after(() => rm(cwd, { recursive: true, force: true }));
    execFileSync("git", ["init", "--quiet", cwd]);
    return cwd;
}

function input(cwd, timestamp, sessionId = "session") {
    return {
        cwd, timestamp, sessionId, toolName: "edit",
        toolArgs: { path: join(cwd, "canvas.css"), old_str: "padding: 8px;", new_str: "padding: 9px;" },
        toolResult: { resultType: "success", textResultForLlm: "sensitive-result-marker" },
    };
}

test("hook persists bounded content-free state and suppresses repeat nudges across processes", async (t) => {
    const cwd = await repository(t);
    for (const timestamp of [1, 2, 3, 4]) {
        const child = spawnSync(process.execPath, [script, "postToolUse"], {
            cwd, input: JSON.stringify(input(cwd, timestamp)), encoding: "utf8",
            env: { ...process.env, DECISION_KIT_DELIVERY_MODE: "nudge" },
        });
        assert.equal(child.status, 0, child.stderr);
        assert.equal(Boolean(JSON.parse(child.stdout).additionalContext), timestamp === 3);
    }
    const dir = join(cwd, ".git", "decision-kit");
    const files = await readdir(dir);
    assert.equal(files.length, 1);
    const stored = await readFile(join(dir, files[0]), "utf8");
    assert.doesNotMatch(stored, /sensitive-result-marker|canvas\.css|padding|old_str|toolArgs/);
    const report = await reportDeliveryObservations(cwd);
    assert.equal(report.observations, 4);
    assert.equal(report.nudgeOutputs, 1);
    assert.equal(report.unreadableSessions, 0);
    assert.equal(execFileSync("git", ["status", "--porcelain"], { cwd, encoding: "utf8" }), "");
});

test("repositories and sessions are isolated; payload cwd cannot redirect storage", async (t) => {
    const a = await repository(t);
    const b = await repository(t);
    await runDeliveryHook({ ...input(a, 1), cwd: b }, { cwd: a });
    await runDeliveryHook(input(a, 2, "second-session"), { cwd: a });
    assert.equal((await reportDeliveryObservations(a)).sessions, 2);
    assert.equal((await reportDeliveryObservations(b)).sessions, 0);
});

test("off mode creates no state and observe mode emits no nudge", async (t) => {
    const cwd = await repository(t);
    await runDeliveryHook(input(cwd, 1), { cwd, mode: "off" });
    await assert.rejects(readdir(join(cwd, ".git", "decision-kit")), { code: "ENOENT" });
    for (const timestamp of [1, 2, 3]) {
        assert.deepEqual(await runDeliveryHook(input(cwd, timestamp), { cwd, mode: "observe" }), {});
    }
    const report = await reportDeliveryObservations(cwd);
    assert.equal(report.candidateSessions, 1);
    assert.equal(report.nudgeOutputs, 0);
});

test("malformed and oversized inputs fail open without echoing payloads", async (t) => {
    const cwd = await repository(t);
    for (const payload of ["private-input-marker", "x".repeat(1024 * 1024 + 1)]) {
        const child = spawnSync(process.execPath, [script, "postToolUse"], {
            cwd, input: payload, encoding: "utf8",
        });
        assert.equal(child.status, 0);
        assert.deepEqual(JSON.parse(child.stdout), {});
        assert.doesNotMatch(child.stderr, /private-input-marker|SyntaxError/);
    }
});

test("corrupt state is reported as missing, not silently reset to trigger another nudge", async (t) => {
    const cwd = await repository(t);
    await runDeliveryHook(input(cwd, 1), { cwd });
    const dir = join(cwd, ".git", "decision-kit");
    const [file] = await readdir(dir);
    await writeFile(join(dir, file), "not JSON");
    await assert.rejects(runDeliveryHook(input(cwd, 2), { cwd }));
    const report = await reportDeliveryObservations(cwd);
    assert.equal(report.sessions, 0);
    assert.equal(report.unreadableSessions, 1);
    assert.deepEqual(await readdir(dir), [file]);
});

test("symlinked storage and state cannot overwrite another file", async (t) => {
    const cwd = await repository(t);
    const outside = await mkdtemp(join(tmpdir(), "decision-kit-outside-"));
    t.after(() => rm(outside, { recursive: true, force: true }));
    const dir = join(cwd, ".git", "decision-kit");
    await symlink(outside, dir);
    await assert.rejects(runDeliveryHook(input(cwd, 1), { cwd }));
    assert.deepEqual(await readdir(outside), []);
    await rm(dir);
    await runDeliveryHook(input(cwd, 1), { cwd });
    const [file] = await readdir(dir);
    const target = join(outside, "keep");
    await writeFile(target, "unchanged");
    await rm(join(dir, file));
    await symlink(target, join(dir, file));
    await assert.rejects(runDeliveryHook(input(cwd, 2), { cwd }));
    assert.equal(await readFile(target, "utf8"), "unchanged");
});

test("concurrent observations do not duplicate a nudge or corrupt state", async (t) => {
    const cwd = await repository(t);
    await runDeliveryHook(input(cwd, 1), { cwd });
    await runDeliveryHook(input(cwd, 2), { cwd });
    const results = await Promise.all(
        Array.from({ length: 5 }, () => runDeliveryHook(input(cwd, 3), { cwd })),
    );
    assert.equal(results.filter((result) => result.additionalContext).length, 1);
    const report = await reportDeliveryObservations(cwd);
    assert.equal(report.nudgeOutputs, 1);
    assert.equal(report.observations, 3);
});

test("a held lock skips rather than blocks work", async (t) => {
    const cwd = await repository(t);
    await runDeliveryHook(input(cwd, 1), { cwd });
    const dir = join(cwd, ".git", "decision-kit");
    const [file] = await readdir(dir);
    await mkdir(join(dir, file.replace(".json", ".lock")));
    assert.deepEqual(await runDeliveryHook(input(cwd, 2), { cwd }), {});
});
