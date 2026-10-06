import { createHash, randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
import { constants } from "node:fs";
import { lstat, mkdir, open, readdir, rename, unlink, rmdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import {
    classifyTool, DELIVERY_RULE_VERSION, deliveryObservationReport,
    initialDeliveryState, observeDelivery,
} from "./delivery.mjs";

const MAX_INPUT = 1024 * 1024;
const MAX_STATE = 16 * 1024;

function gitPath(args, cwd) {
    return execFileSync("git", args, {
        cwd, encoding: "utf8", timeout: 2000, maxBuffer: 8192,
        stdio: ["ignore", "pipe", "ignore"],
    }).trim();
}

async function readState(file) {
    const handle = await open(file, constants.O_RDONLY | constants.O_NOFOLLOW);
    try {
        const stat = await handle.stat();
        if (!stat.isFile() || stat.size > MAX_STATE) throw new Error("Invalid state.");
        const state = JSON.parse(await handle.readFile("utf8"));
        if (state.version !== DELIVERY_RULE_VERSION ||
            !["observations", "candidateCount", "nudgeCount", "hookDurationMs"].every(
                (key) => Number.isFinite(state[key]) && state[key] >= 0,
            ) || !Array.isArray(state.recent) || state.recent.length > 10 ||
            ![state.startedAt, state.lastTimestamp].every(
                (value) => value === null || (Number.isSafeInteger(value) && value >= 0),
            ) || !state.recent.every((event) =>
                Number.isSafeInteger(event.timestamp) && event.timestamp >= 0 &&
                ["polish", "edit", "other"].includes(event.kind) &&
                (event.target === null || /^[a-f0-9]{64}$/.test(event.target)))) {
            throw new Error("Invalid state.");
        }
        // Never carry unrecognized fields from disk back into a write or report.
        return {
            ...Object.fromEntries(Object.keys(initialDeliveryState()).filter((key) => key !== "recent")
                .map((key) => [key, state[key]])),
            recent: state.recent.map(({ timestamp, kind, target }) => ({ timestamp, kind, target })),
        };
    } finally {
        await handle.close();
    }
}

async function storage(cwd) {
    const root = gitPath(["rev-parse", "--show-toplevel"], cwd);
    const gitDir = gitPath(["rev-parse", "--absolute-git-dir"], root);
    const directory = join(gitDir, "decision-kit");
    await mkdir(directory, { mode: 0o700 }).catch((error) => {
        if (error.code !== "EEXIST") throw error;
    });
    const stat = await lstat(directory);
    if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error("Invalid state directory.");
    return { root, directory };
}

export async function runDeliveryHook(input, { cwd = process.cwd(), mode = "nudge" } = {}) {
    if (mode === "off") return {};
    const started = performance.now();
    // Validate the envelope before touching disk. Payload cwd is not execution authority.
    if (!classifyTool(input, resolve(cwd))) return {};
    const { root, directory } = await storage(cwd);
    const event = classifyTool(input, root);
    const key = createHash("sha256").update(input.sessionId).digest("hex");
    const file = join(directory, `${key}.json`);
    const lock = join(directory, `${key}.lock`);
    try {
        await mkdir(lock, { mode: 0o700 });
    } catch (error) {
        if (error.code === "EEXIST") return {};
        throw error;
    }
    const temporary = join(directory, `${key}.${randomUUID()}.tmp`);
    try {
        let state;
        try { state = await readState(file); } catch (error) {
            if (error.code !== "ENOENT") throw error;
            state = initialDeliveryState();
        }
        const result = observeDelivery(state, event, mode);
        if (result.state === state) return {};
        result.state.hookDurationMs += Math.max(0, Math.round(performance.now() - started));
        const handle = await open(temporary, constants.O_WRONLY | constants.O_CREAT |
            constants.O_EXCL | constants.O_NOFOLLOW, 0o600);
        try { await handle.writeFile(JSON.stringify(result.state)); } finally { await handle.close(); }
        await rename(temporary, file);
        return result.output;
    } finally {
        await unlink(temporary).catch(() => {});
        await rmdir(lock);
    }
}

export async function reportDeliveryObservations(cwd = process.cwd()) {
    const { directory } = await storage(cwd);
    const files = (await readdir(directory)).filter((name) => /^[a-f0-9]{64}\.json$/.test(name));
    const states = [];
    let unreadableSessions = 0;
    for (const file of files) {
        try { states.push(await readState(join(directory, file))); } catch { unreadableSessions++; }
    }
    return { ...deliveryObservationReport(states), unreadableSessions };
}

async function main() {
    try {
        if (process.argv[2] === "report") {
            process.stdout.write(`${JSON.stringify(await reportDeliveryObservations(), null, 2)}\n`);
            return;
        }
        if (process.argv[2] !== "postToolUse") throw new Error("Unknown command.");
        let size = 0;
        const chunks = [];
        for await (const chunk of process.stdin) {
            size += chunk.length;
            if (size > MAX_INPUT) throw new Error("Input too large.");
            chunks.push(chunk);
        }
        const input = JSON.parse(Buffer.concat(chunks).toString("utf8"));
        const output = await runDeliveryHook(input, {
            mode: process.env.DECISION_KIT_DELIVERY_MODE ?? "nudge",
        });
        process.stdout.write(`${JSON.stringify(output)}\n`);
    } catch {
        // A delivery hint must never block work or print tool payloads and credentials.
        process.stdout.write("{}\n");
        process.stderr.write("Decision Kit delivery observations unavailable; work may continue.\n");
        if (process.argv[2] === "report") process.exitCode = 1;
    }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
    await main();
}
