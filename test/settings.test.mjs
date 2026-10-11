import test from "node:test";
import assert from "node:assert/strict";
import { listSettings, settingsCatalog, settingsComponents, settingsCoverage, settingsSources } from "../.github/extensions/decision-kit/settings-catalog.mjs";
import { recommendSettings, settingsRules } from "../.github/extensions/decision-kit/settings-recommendations.mjs";

test("catalog IDs, components, source links, and rule choices are consistent", () => {
    assert.equal(new Set(settingsCatalog.map(({ id }) => id)).size, settingsCatalog.length);
    assert.equal(settingsComponents.flatMap(({ settings }) => settings).length, settingsCatalog.length);
    assert.equal(settingsCoverage.complete, false);
    for (const setting of settingsCatalog) {
        assert.ok(setting.location);
        assert.ok(setting.sources.length);
        for (const source of setting.sources) assert.equal(new URL(settingsSources[source]).protocol, "https:");
        if (Array.isArray(setting.values) && setting.default !== null) assert.ok(setting.values.includes(setting.default));
    }
    for (const rule of settingsRules) {
        for (const [id, value] of rule.choices) {
            const setting = settingsCatalog.find((candidate) => candidate.id === id);
            assert.ok(setting, id);
            if (Array.isArray(setting.values) && value !== null) assert.ok(setting.values.includes(value), id);
        }
    }
});

test("index can be filtered and searched without mutating catalog entries", () => {
    const experiments = listSettings({ status: "experimental" });
    assert.ok(experiments.some(({ id }) => id === "experiment.threads"));
    assert.ok(listSettings({ component: "accessibility" }).length > 10);
    const found = listSettings({ query: "Session memory" });
    found[0].label = "changed";
    assert.equal(listSettings({ query: "Session memory" })[0].label, "Session memory");
    assert.equal(listSettings({ component: "missing" }).length, 0);
});

test("recommendation caveats cannot mutate the catalog or later search results", () => {
    const result = recommendSettings({ goals: ["parallel-work"] });
    result.recommendations.find(({ id }) => id === "session.execution").caveats.push("mutable-marker");
    assert.equal(settingsCatalog.find(({ id }) => id === "session.execution").caveats.includes("mutable-marker"), false);
    assert.equal(listSettings({ query: "mutable-marker" }).length, 0);
});

test("cost classifier returns an advisory combination without changing inputs", () => {
    const needs = { goals: ["lower-cost"] };
    const result = recommendSettings(needs);
    assert.equal(result.applied, false);
    assert.equal(result.evidence, "uncalibrated-heuristic");
    assert.deepEqual(result.recommendations.map(({ id, value }) => [id, value]), [["model.select", "Auto"], ["model.autoTier", "Efficiency"]]);
    assert.deepEqual(needs, { goals: ["lower-cost"] });
});

test("competing cost and quality goals withhold the whole dependent combination", () => {
    const result = recommendSettings({ goals: ["lower-cost", "higher-quality", "project-guidance"] });
    assert.equal(result.conflicts[0].id, "model.autoTier");
    assert.deepEqual(result.recommendations.map(({ id }) => id), ["instructions.project"]);
    assert.equal(result.requiresReview, true);
});

test("network restrictions are a sandboxed combination", () => {
    const result = recommendSettings({ goals: ["restricted-network"] });
    assert.deepEqual(result.recommendations.map(({ id, value }) => [id, value]), [
        ["sandbox.enabled", true], ["sandbox.internet", false], ["sandbox.localNetwork", false],
    ]);
    assert.match(result.reviewWarnings[0], /active session/i);
    assert.match(result.reviewWarnings[0], /new session/i);
    assert.equal(result.requiresReview, true);
});

test("a managed constraint blocks the entire combination", () => {
    const result = recommendSettings({ goals: ["restricted-network"], managed: { "sandbox.internet": [true] } });
    assert.equal(result.recommendations.length, 0);
    assert.ok(result.blocked[0].issues.includes("policy:sandbox.internet"));
});

test("cross-component dependencies produce review warnings", () => {
    const result = recommendSettings({ goals: ["restricted-network", "custom-provider"], allowPreview: true });
    assert.equal(result.combinationWarnings.length, 1);
    assert.equal(result.requiresReview, true);
});

test("preview consent, platform, and cloud eligibility are explicit gates", () => {
    for (const needs of [
        { goals: ["desktop-interaction"], platform: "linux", allowPreview: true },
        { goals: ["desktop-interaction"], platform: "macos" },
        { goals: ["background-work"] },
        { goals: ["custom-provider"] },
    ]) assert.equal(recommendSettings(needs).recommendations.length, 0);
    assert.equal(recommendSettings({ goals: ["desktop-interaction"], platform: "windows", allowPreview: true }).recommendations.length, 1);
    assert.equal(recommendSettings({ goals: ["background-work"], cloudEligible: true }).recommendations.length, 0);
    assert.equal(recommendSettings({ goals: ["background-work"], cloudEligible: true, cloudCreationVerified: true }).recommendations.length, 1);
});

test("experiments remain indexed but unverified controls are never recommended", () => {
    const result = recommendSettings({ goals: ["experimental-memory"], allowPreview: true });
    assert.equal(result.recommendations.length, 0);
    assert.ok(result.blocked[0].issues.includes("unverified-control:experiment.memory"));
    assert.equal(settingsCatalog.find(({ id }) => id === "flags.global").recommendable, false);
});

test("provider recommendations neither accept nor return secret values", () => {
    const result = recommendSettings({ goals: ["custom-provider"], allowPreview: true });
    assert.ok(result.recommendations.every(({ value }) => value === null));
    assert.equal(result.requiresReview, true);
});

test("invalid input and policy values fail rather than enabling a setting", () => {
    for (const input of [null, [], {}, { goals: ["made-up"] }, { goals: [], allowPreview: "true" }, { goals: [], cloudEligible: 1 }, { goals: [], managed: { unknown: [true] } }, { goals: [], managed: { "sandbox.internet": ["false"] } }]) {
        assert.throws(() => recommendSettings(input), TypeError);
    }
    assert.deepEqual(recommendSettings({ goals: [] }).recommendations, []);
});

test("raw managed governance keys cannot be accepted and silently ignored", () => {
    assert.throws(() => recommendSettings({
        goals: ["desktop-interaction"], platform: "windows", allowPreview: true,
        managed: { "managed.features.computerUse": [false] },
    }), TypeError);
    const result = recommendSettings({
        goals: ["desktop-interaction"], platform: "windows", allowPreview: true,
        managed: { "computer.enabled": [false] },
    });
    assert.equal(result.recommendations.length, 0);
    assert.ok(result.blocked[0].issues.includes("policy:computer.enabled"));
});
