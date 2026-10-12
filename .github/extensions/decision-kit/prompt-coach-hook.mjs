import { createHash, randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
import { constants } from "node:fs";
import { lstat, mkdir, open, readdir, readFile, rename, unlink, rmdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import {
    COACH_CLASSES,
    COACH_RULE_VERSION,
    DEFAULT_COOLDOWN_TURNS,
    DEFAULT_THRESHOLD,
    coachObservationReport,
    evaluatePromptCoachDecision,
    initialPromptCoachState,
    validateTaskContract,
} from "./prompt-coach.mjs";
import { callCoachJev } from "./prompt-coach-provider.mjs";

const MAX_INPUT = 64 * 1024;
const MAX_STATE = 16 * 1024;

function gitPath(args, cwd) {
    return execFileSync("git", args, {
        cwd,
        encoding: "utf8",
        timeout: 2000,
        maxBuffer: 8192,
        stdio: ["ignore", "pipe", "ignore"],
    }).trim();
}

async function storage(cwd) {
    const root = gitPath(["rev-parse", "--show-toplevel"], cwd);
    const gitDir = gitPath(["rev-parse", "--absolute-git-dir"], root);
    const directory = join(gitDir, "decision-kit", "prompt-coach");
    await mkdir(directory, { mode: 0o700, recursive: true }).catch((error) => {
        if (error.code !== "EEXIST") throw error;
    });
    const stat = await lstat(directory);
    if (!stat.isDirectory() || stat.isSymbolicLink()) {
        throw new Error("Invalid state directory.");
    }
    return { root, gitDir, directory };
}

async function readContract(root, gitDir, explicitPath) {
    const candidates = [];
    if (explicitPath) candidates.push(resolve(root, explicitPath));
    candidates.push(join(root, ".decision-kit", "contract.json"));
    candidates.push(join(gitDir, "decision-kit", "contract.json"));
    candidates.push(join(root, "contract.json"));

    for (const file of candidates) {
        try {
            const handle = await open(file, constants.O_RDONLY | constants.O_NOFOLLOW);
            try {
                const stat = await handle.stat();
                if (!stat.isFile() || stat.size > MAX_INPUT) continue;
                const text = await handle.readFile("utf8");
                const parsed = JSON.parse(text);
                const validated = validateTaskContract(parsed);
                if (validated) return validated;
            } finally {
                await handle.close();
            }
        } catch {
            // Check next candidate
        }
    }
    return null;
}

async function readState(file) {
    const handle = await open(file, constants.O_RDONLY | constants.O_NOFOLLOW);
    try {
        const stat = await handle.stat();
        if (!stat.isFile() || stat.size > MAX_STATE) throw new Error("Invalid state.");
        const state = JSON.parse(await handle.readFile("utf8"));
        if (
            state.version !== COACH_RULE_VERSION ||
            !Number.isSafeInteger(state.turns) ||
            state.turns < 0 ||
            !Number.isSafeInteger(state.decisionsCount) ||
            state.decisionsCount < 0 ||
            !Number.isSafeInteger(state.warningCount) ||
            state.warningCount < 0 ||
            !Number.isSafeInteger(state.hookDurationMs) ||
            state.hookDurationMs < 0 ||
            !(state.lastWarningTurn === null || Number.isSafeInteger(state.lastWarningTurn)) ||
            !(state.startedAt === null || Number.isSafeInteger(state.startedAt)) ||
            !(state.lastTimestamp === null || Number.isSafeInteger(state.lastTimestamp)) ||
            !Array.isArray(state.recentDecisions) ||
            state.recentDecisions.length > 10 ||
            !state.recentDecisions.every(
                (d) =>
                    Number.isSafeInteger(d.timestamp) &&
                    Number.isSafeInteger(d.turn) &&
                    COACH_CLASSES.includes(d.chosenClass) &&
                    typeof d.probability === "number" &&
                    typeof d.confidence === "number" &&
                    typeof d.warningEmitted === "boolean",
            )
        ) {
            throw new Error("Invalid state.");
        }
        return {
            version: state.version,
            startedAt: state.startedAt,
            lastTimestamp: state.lastTimestamp,
            turns: state.turns,
            lastWarningTurn: state.lastWarningTurn,
            decisionsCount: state.decisionsCount,
            warningCount: state.warningCount,
            hookDurationMs: state.hookDurationMs,
            recentDecisions: state.recentDecisions.map((d) => ({
                timestamp: d.timestamp,
                turn: d.turn,
                chosenClass: d.chosenClass,
                probability: d.probability,
                confidence: d.confidence,
                warningEmitted: d.warningEmitted,
                latencyMs: d.latencyMs ?? 0,
                cost: d.cost ?? null,
            })),
        };
    } finally {
        await handle.close();
    }
}

export async function runPromptCoachHook(
    input,
    {
        cwd = process.cwd(),
        mode = "nudge",
        threshold = DEFAULT_THRESHOLD,
        cooldownTurns = DEFAULT_COOLDOWN_TURNS,
        apiKey = process.env.OPENROUTER_API_KEY,
        optIn,
        timeoutMs = 2500,
        fetchFn = globalThis.fetch,
        contractPath,
    } = {},
) {
    if (mode === "off") return { output: {} };
    const started = performance.now();

    const timestamp = input?.timestamp;
    const sessionId = input?.sessionId;
    const promptText = input?.userPrompt ?? input?.prompt;

    if (
        !Number.isSafeInteger(timestamp) ||
        timestamp < 0 ||
        typeof sessionId !== "string" ||
        !sessionId ||
        sessionId.length > 256 ||
        typeof promptText !== "string" ||
        !promptText.trim()
    ) {
        return { output: {} };
    }

    let storageInfo;
    try {
        storageInfo = await storage(cwd);
    } catch {
        return { output: {} };
    }
    const { root, gitDir, directory } = storageInfo;

    const contract = await readContract(root, gitDir, contractPath);
    if (!contract) {
        return { output: {}, abstained: true, reason: "missing_contract" };
    }

    const isOptedIn = Boolean(
        optIn ??
            (contract.optIn ||
                process.env.DECISION_KIT_PROMPT_COACH_OPT_IN === "true" ||
                process.env.DECISION_KIT_OPENROUTER_OPT_IN === "true"),
    );
    if (!isOptedIn) {
        return { output: {}, abstained: true, reason: "not_opted_in" };
    }

    if (!apiKey) {
        return { output: {}, abstained: true, reason: "missing_api_key" };
    }

    const key = createHash("sha256").update(sessionId).digest("hex");
    const file = join(directory, `${key}.json`);
    const lock = join(directory, `${key}.lock`);

    try {
        await mkdir(lock, { mode: 0o700 });
    } catch (error) {
        if (error.code === "EEXIST") return { output: {} };
        return { output: {} };
    }

    const temporary = join(directory, `${key}.${randomUUID()}.tmp`);
    try {
        let state;
        try {
            state = await readState(file);
        } catch (error) {
            if (error.code !== "ENOENT") {
                return { output: {} };
            }
            state = initialPromptCoachState();
        }

        let decision;
        try {
            decision = await callCoachJev({
                contract,
                prompt: promptText,
                apiKey,
                timeoutMs,
                fetchFn,
            });
        } catch {
            return { output: {} };
        }

        const elapsedMs = Math.max(0, Math.round(performance.now() - started));
        const evaluation = evaluatePromptCoachDecision(
            state,
            {
                ...decision,
                timestamp,
                hookDurationMs: elapsedMs,
            },
            {
                mode,
                threshold,
                cooldownTurns,
            },
        );

        const handle = await open(
            temporary,
            constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW,
            0o600,
        );
        try {
            await handle.writeFile(JSON.stringify(evaluation.state));
        } finally {
            await handle.close();
        }
        await rename(temporary, file);

        return {
            output: {},
            warning: evaluation.warning,
            chosenClass: decision.chosenClass,
            probability: decision.probability,
            confidence: decision.confidence,
        };
    } finally {
        await unlink(temporary).catch(() => {});
        await rmdir(lock).catch(() => {});
    }
}

export async function reportPromptCoachObservations(cwd = process.cwd()) {
    const { directory } = await storage(cwd);
    let files = [];
    try {
        files = (await readdir(directory)).filter((name) => /^[a-f0-9]{64}\.json$/.test(name));
    } catch {
        return { ...coachObservationReport([]), unreadableSessions: 0 };
    }

    const states = [];
    let unreadableSessions = 0;
    for (const file of files) {
        try {
            states.push(await readState(join(directory, file)));
        } catch {
            unreadableSessions++;
        }
    }
    return { ...coachObservationReport(states), unreadableSessions };
}

async function main() {
    try {
        if (process.argv[2] === "report") {
            process.stdout.write(
                `${JSON.stringify(await reportPromptCoachObservations(), null, 2)}\n`,
            );
            return;
        }
        if (process.argv[2] !== "userPromptSubmitted") {
            process.stdout.write("{}\n");
            return;
        }
        let size = 0;
        const chunks = [];
        for await (const chunk of process.stdin) {
            size += chunk.length;
            if (size > MAX_INPUT) {
                process.stdout.write("{}\n");
                return;
            }
            chunks.push(chunk);
        }
        let input;
        try {
            input = JSON.parse(Buffer.concat(chunks).toString("utf8"));
        } catch {
            process.stdout.write("{}\n");
            return;
        }

        const result = await runPromptCoachHook(input, {
            mode: process.env.DECISION_KIT_PROMPT_COACH_MODE ?? "nudge",
        });

        if (result?.warning) {
            process.stderr.write(`${result.warning}\n`);
        }
        process.stdout.write("{}\n");
    } catch {
        // Fail open: always output {} and exit 0
        process.stdout.write("{}\n");
    }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
    await main();
}
