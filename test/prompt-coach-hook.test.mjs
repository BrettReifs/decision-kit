import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtemp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { reportPromptCoachObservations } from "../.github/extensions/decision-kit/prompt-coach-hook.mjs";

const script = fileURLToPath(
    new URL("../.github/extensions/decision-kit/prompt-coach-hook.mjs", import.meta.url),
);

async function repository(t) {
    const cwd = await mkdtemp(join(tmpdir(), "prompt-coach-test-"));
    t.after(() => rm(cwd, { recursive: true, force: true }));
    execFileSync("git", ["init", "--quiet", cwd]);
    return cwd;
}

function mockJevResponse(chosenClass, probability = 0.95, confidence = 0.88) {
    const probabilities = {
        aligned: 0.01,
        unclear: 0.01,
        scope_expansion: 0.01,
        reuse_check: 0.01,
        checkpoint_first: 0.01,
    };
    probabilities[chosenClass] = probability;
    return JSON.stringify({
        answers: {
            intervention: {
                type: "choice",
                choice: chosenClass,
                confidence,
                probabilities,
            },
        },
        usage: { cost: 0.0003 },
    });
}

function promptInput(sessionId, promptText, timestamp = Date.now()) {
    return {
        timestamp,
        sessionId,
        userPrompt: promptText,
    };
}

test("hook abstains silently when contract is missing or ambiguous", async (t) => {
    const cwd = await repository(t);
    const child = spawnSync(process.execPath, [script, "userPromptSubmitted"], {
        cwd,
        input: JSON.stringify(promptInput("session-1", "Add a shiny new feature")),
        encoding: "utf8",
        env: {
            ...process.env,
            DECISION_KIT_PROMPT_COACH_OPT_IN: "true",
            OPENROUTER_API_KEY: "mock-key",
            DECISION_KIT_TEST_MOCK_JEV: mockJevResponse("scope_expansion", 0.95),
        },
    });

    assert.equal(child.status, 0);
    assert.equal(child.stdout.trim(), "{}");
    assert.equal(child.stderr, "");

    // Ambiguous contract (missing acceptance)
    await mkdir(join(cwd, ".decision-kit"), { recursive: true });
    await writeFile(
        join(cwd, ".decision-kit", "contract.json"),
        JSON.stringify({ outcome: "Feature X", phase: "implement" }),
    );

    const child2 = spawnSync(process.execPath, [script, "userPromptSubmitted"], {
        cwd,
        input: JSON.stringify(promptInput("session-1", "Add a shiny new feature")),
        encoding: "utf8",
        env: {
            ...process.env,
            DECISION_KIT_PROMPT_COACH_OPT_IN: "true",
            OPENROUTER_API_KEY: "mock-key",
            DECISION_KIT_TEST_MOCK_JEV: mockJevResponse("scope_expansion", 0.95),
        },
    });

    assert.equal(child2.status, 0);
    assert.equal(child2.stdout.trim(), "{}");
    assert.equal(child2.stderr, "");
});

test("hook abstains silently when not opted in or API key is missing", async (t) => {
    const cwd = await repository(t);
    await mkdir(join(cwd, ".decision-kit"), { recursive: true });
    await writeFile(
        join(cwd, ".decision-kit", "contract.json"),
        JSON.stringify({
            outcome: "Build coach",
            phase: "implement",
            acceptance: "Unit tests pass",
            optIn: false,
        }),
    );

    // No opt-in
    const childNoOpt = spawnSync(process.execPath, [script, "userPromptSubmitted"], {
        cwd,
        input: JSON.stringify(promptInput("session-1", "Add another dashboard")),
        encoding: "utf8",
        env: {
            ...process.env,
            OPENROUTER_API_KEY: "mock-key",
            DECISION_KIT_TEST_MOCK_JEV: mockJevResponse("scope_expansion", 0.95),
        },
    });
    assert.equal(childNoOpt.status, 0);
    assert.equal(childNoOpt.stdout.trim(), "{}");
    assert.equal(childNoOpt.stderr, "");

    // Opted in but missing API key
    const childNoKey = spawnSync(process.execPath, [script, "userPromptSubmitted"], {
        cwd,
        input: JSON.stringify(promptInput("session-1", "Add another dashboard")),
        encoding: "utf8",
        env: {
            ...process.env,
            DECISION_KIT_PROMPT_COACH_OPT_IN: "true",
            OPENROUTER_API_KEY: "",
            DECISION_KIT_TEST_MOCK_JEV: mockJevResponse("scope_expansion", 0.95),
        },
    });
    assert.equal(childNoKey.status, 0);
    assert.equal(childNoKey.stdout.trim(), "{}");
    assert.equal(childNoKey.stderr, "");
});

test("drift warning emits advisory to stderr without mutating prompt (stdout is {})", async (t) => {
    const cwd = await repository(t);
    await mkdir(join(cwd, ".decision-kit"), { recursive: true });
    await writeFile(
        join(cwd, ".decision-kit", "contract.json"),
        JSON.stringify({
            outcome: "Build coach",
            phase: "implement",
            acceptance: "Unit tests pass",
            optIn: true,
        }),
    );

    const child = spawnSync(process.execPath, [script, "userPromptSubmitted"], {
        cwd,
        input: JSON.stringify(promptInput("session-1", "Also build an entire web dashboard")),
        encoding: "utf8",
        env: {
            ...process.env,
            OPENROUTER_API_KEY: "mock-key",
            DECISION_KIT_TEST_MOCK_JEV: mockJevResponse("scope_expansion", 0.94, 0.89),
        },
    });

    assert.equal(child.status, 0);
    assert.equal(child.stdout.trim(), "{}");
    assert.match(child.stderr, /\[Decision Kit Prompt Coach\] Scope Warning: scope_expansion/);
    assert.match(child.stderr, /model probability estimate: 0\.94/);
    assert.match(child.stderr, /Jev confidence: 0\.89/);
});

test("intentional scope change updates contract and avoids warning", async (t) => {
    const cwd = await repository(t);
    await mkdir(join(cwd, ".decision-kit"), { recursive: true });
    const contractPath = join(cwd, ".decision-kit", "contract.json");

    await writeFile(
        contractPath,
        JSON.stringify({
            outcome: "Build coach",
            phase: "implement",
            acceptance: "Tests pass",
            optIn: true,
        }),
    );

    // Initial drift prompt
    const child1 = spawnSync(process.execPath, [script, "userPromptSubmitted"], {
        cwd,
        input: JSON.stringify(promptInput("session-1", "Pivot and create reporting dashboard")),
        encoding: "utf8",
        env: {
            ...process.env,
            OPENROUTER_API_KEY: "mock-key",
            DECISION_KIT_TEST_MOCK_JEV: mockJevResponse("scope_expansion", 0.95),
        },
    });
    assert.match(child1.stderr, /Scope Warning: scope_expansion/);

    // User updates contract intentionally
    await writeFile(
        contractPath,
        JSON.stringify({
            outcome: "Create reporting dashboard",
            phase: "implement",
            acceptance: "Dashboard renders metrics",
            optIn: true,
        }),
    );

    // Prompt is now aligned
    const child2 = spawnSync(process.execPath, [script, "userPromptSubmitted"], {
        cwd,
        input: JSON.stringify(promptInput("session-1", "Render metrics in dashboard view")),
        encoding: "utf8",
        env: {
            ...process.env,
            OPENROUTER_API_KEY: "mock-key",
            DECISION_KIT_TEST_MOCK_JEV: mockJevResponse("aligned", 0.98),
        },
    });
    assert.equal(child2.status, 0);
    assert.equal(child2.stdout.trim(), "{}");
    assert.equal(child2.stderr, "");
});

test("legitimate accessibility, security, and test investigations remain quiet", async (t) => {
    const cwd = await repository(t);
    await mkdir(join(cwd, ".decision-kit"), { recursive: true });
    await writeFile(
        join(cwd, ".decision-kit", "contract.json"),
        JSON.stringify({
            outcome: "Deliver feature",
            phase: "implement",
            acceptance: "All checks pass",
            optIn: true,
        }),
    );

    for (const prompt of [
        "Check screen reader accessibility for this component",
        "Perform a security vulnerability review of the inputs",
        "Run unit tests to verify failure cases",
    ]) {
        const child = spawnSync(process.execPath, [script, "userPromptSubmitted"], {
            cwd,
            input: JSON.stringify(promptInput("session-legit", prompt)),
            encoding: "utf8",
            env: {
                ...process.env,
                OPENROUTER_API_KEY: "mock-key",
                DECISION_KIT_TEST_MOCK_JEV: mockJevResponse("aligned", 0.97),
            },
        });
        assert.equal(child.status, 0);
        assert.equal(child.stdout.trim(), "{}");
        assert.equal(child.stderr, "");
    }
});

test("cooldown window suppresses subsequent warnings within the session", async (t) => {
    const cwd = await repository(t);
    await mkdir(join(cwd, ".decision-kit"), { recursive: true });
    await writeFile(
        join(cwd, ".decision-kit", "contract.json"),
        JSON.stringify({
            outcome: "Deliver feature",
            phase: "implement",
            acceptance: "Checks pass",
            optIn: true,
        }),
    );

    // Turn 1: warning
    const turn1 = spawnSync(process.execPath, [script, "userPromptSubmitted"], {
        cwd,
        input: JSON.stringify(promptInput("sess-cd", "Add an external microservice", 100)),
        encoding: "utf8",
        env: {
            ...process.env,
            OPENROUTER_API_KEY: "mock-key",
            DECISION_KIT_TEST_MOCK_JEV: mockJevResponse("scope_expansion", 0.95),
        },
    });
    assert.match(turn1.stderr, /Scope Warning/);

    // Turn 2: in cooldown -> quiet
    const turn2 = spawnSync(process.execPath, [script, "userPromptSubmitted"], {
        cwd,
        input: JSON.stringify(promptInput("sess-cd", "Also build another library", 200)),
        encoding: "utf8",
        env: {
            ...process.env,
            OPENROUTER_API_KEY: "mock-key",
            DECISION_KIT_TEST_MOCK_JEV: mockJevResponse("reuse_check", 0.95),
        },
    });
    assert.equal(turn2.stdout.trim(), "{}");
    assert.equal(turn2.stderr, "");
});

test("sessions and worktrees are isolated", async (t) => {
    const cwd = await repository(t);
    await mkdir(join(cwd, ".decision-kit"), { recursive: true });
    await writeFile(
        join(cwd, ".decision-kit", "contract.json"),
        JSON.stringify({
            outcome: "Deliver feature",
            phase: "implement",
            acceptance: "Checks pass",
            optIn: true,
        }),
    );

    // Session A triggers warning
    const childA = spawnSync(process.execPath, [script, "userPromptSubmitted"], {
        cwd,
        input: JSON.stringify(promptInput("session-A", "Build microservice")),
        encoding: "utf8",
        env: {
            ...process.env,
            OPENROUTER_API_KEY: "mock-key",
            DECISION_KIT_TEST_MOCK_JEV: mockJevResponse("scope_expansion", 0.95),
        },
    });
    assert.match(childA.stderr, /Scope Warning/);

    // Session B triggers warning independently (not blocked by Session A's cooldown)
    const childB = spawnSync(process.execPath, [script, "userPromptSubmitted"], {
        cwd,
        input: JSON.stringify(promptInput("session-B", "Build microservice")),
        encoding: "utf8",
        env: {
            ...process.env,
            OPENROUTER_API_KEY: "mock-key",
            DECISION_KIT_TEST_MOCK_JEV: mockJevResponse("scope_expansion", 0.95),
        },
    });
    assert.match(childB.stderr, /Scope Warning/);
});

test("lock contention fails open immediately without hanging", async (t) => {
    const cwd = await repository(t);
    await mkdir(join(cwd, ".decision-kit"), { recursive: true });
    await writeFile(
        join(cwd, ".decision-kit", "contract.json"),
        JSON.stringify({
            outcome: "Deliver feature",
            phase: "implement",
            acceptance: "Checks pass",
            optIn: true,
        }),
    );

    // Create a mock held lock directory
    const { createHash } = await import("node:crypto");
    const sessionKey = createHash("sha256").update("contended-session").digest("hex");
    const lockDir = join(cwd, ".git", "decision-kit", "prompt-coach", `${sessionKey}.lock`);
    await mkdir(lockDir, { recursive: true });

    const child = spawnSync(process.execPath, [script, "userPromptSubmitted"], {
        cwd,
        input: JSON.stringify(promptInput("contended-session", "Build extra stuff")),
        encoding: "utf8",
        env: {
            ...process.env,
            OPENROUTER_API_KEY: "mock-key",
            DECISION_KIT_TEST_MOCK_JEV: mockJevResponse("scope_expansion", 0.95),
        },
    });

    assert.equal(child.status, 0);
    assert.equal(child.stdout.trim(), "{}");
    assert.equal(child.stderr, "");
});

test("privacy verification: state files contain only content-free metadata", async (t) => {
    const cwd = await repository(t);
    await mkdir(join(cwd, ".decision-kit"), { recursive: true });
    await writeFile(
        join(cwd, ".decision-kit", "contract.json"),
        JSON.stringify({
            outcome: "UltraSecretProjectName",
            phase: "implement",
            acceptance: "SecretAcceptanceCriterion",
            optIn: true,
        }),
    );

    const sensitivePrompt = "VerySensitiveCustomerPromptContent";
    const child = spawnSync(process.execPath, [script, "userPromptSubmitted"], {
        cwd,
        input: JSON.stringify(promptInput("privacy-session", sensitivePrompt)),
        encoding: "utf8",
        env: {
            ...process.env,
            OPENROUTER_API_KEY: "sk-super-secret-key-12345",
            DECISION_KIT_TEST_MOCK_JEV: mockJevResponse("scope_expansion", 0.95),
        },
    });

    assert.equal(child.status, 0);

    const dir = join(cwd, ".git", "decision-kit", "prompt-coach");
    const files = await readdir(dir);
    assert.ok(files.some((f) => f.endsWith(".json")));

    for (const f of files.filter((name) => name.endsWith(".json"))) {
        const content = await readFile(join(dir, f), "utf8");
        assert.doesNotMatch(content, /UltraSecretProjectName/);
        assert.doesNotMatch(content, /SecretAcceptanceCriterion/);
        assert.doesNotMatch(content, /VerySensitiveCustomerPromptContent/);
        assert.doesNotMatch(content, /sk-super-secret-key/);
    }
});

test("report subcommand outputs JSON metrics across sessions", async (t) => {
    const cwd = await repository(t);
    await mkdir(join(cwd, ".decision-kit"), { recursive: true });
    await writeFile(
        join(cwd, ".decision-kit", "contract.json"),
        JSON.stringify({
            outcome: "Feature",
            phase: "implement",
            acceptance: "Passes",
            optIn: true,
        }),
    );

    spawnSync(process.execPath, [script, "userPromptSubmitted"], {
        cwd,
        input: JSON.stringify(promptInput("session-rep", "Prompt 1")),
        encoding: "utf8",
        env: {
            ...process.env,
            OPENROUTER_API_KEY: "mock-key",
            DECISION_KIT_TEST_MOCK_JEV: mockJevResponse("aligned", 0.95),
        },
    });

    const reportChild = spawnSync(process.execPath, [script, "report"], {
        cwd,
        encoding: "utf8",
    });
    assert.equal(reportChild.status, 0);
    const parsed = JSON.parse(reportChild.stdout);
    assert.equal(parsed.sessions, 1);
    assert.equal(parsed.totalDecisions, 1);
    assert.equal(parsed.classDistribution.aligned, 1);
});
