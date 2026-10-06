import test from "node:test";
import assert from "node:assert/strict";
import { evaluateDeliveryOutcomes } from "../.github/extensions/decision-kit/delivery-evaluation.mjs";

const policy = {
    id: "policy-1",
    fixedAt: 100,
    primaryMetric: "deliveryMs",
    minimumPerGroup: 2,
    minimumImprovement: 100,
    followupMs: 1000,
    maxRegression: { costUsd: 0, deliveryMs: 0, reworkCount: 0, defectCount: 0, interruptions: 0 },
};

function records() {
    return ["control", "control", "nudge", "nudge"].map((group, index) => ({
        id: `slice-${index}`, group, policyId: policy.id, scopeClass: "small-ui-fix",
        contractVersion: "v1", startedAt: 101, scopeChanged: false, costIncludesKit: true,
        costUsd: group === "control" ? 2 : 1,
        deliveryMs: group === "control" ? 1000 : 800,
        acceptancePassed: true, reworkCount: 0, defectCount: 0, interruptions: 0,
        followupMs: 1000,
    }));
}

test("cheaper and faster with unchanged quality remains an association, not a causal claim", () => {
    const report = evaluateDeliveryOutcomes({ policy, slices: records() });
    assert.equal(report.status, "promising-association");
    assert.equal(report.comparison.deliveryMs.delta, -200);
    assert.equal(report.comparison.costUsd.delta, -1);
    assert.equal(report.promotionAllowed, false);
    assert.match(report.causalConclusion, /do not prove/);
});

for (const metric of ["costUsd", "deliveryMs", "reworkCount", "defectCount", "interruptions"]) {
    test(`an improvement cannot hide a ${metric} guardrail breach`, () => {
        const slices = records();
        slices[2][metric] = 10_000;
        const report = evaluateDeliveryOutcomes({ policy, slices });
        assert.equal(report.status, "guardrail-breach");
        assert.ok(report.regressions.includes(metric));
        assert.equal(report.promotionAllowed, false);
    });
}

for (const [field, value] of [
    ["costUsd", null], ["deliveryMs", null], ["defectCount", null],
    ["interruptions", null], ["acceptancePassed", null], ["acceptancePassed", false],
    ["scopeChanged", true], ["costIncludesKit", false], ["followupMs", 0],
    ["scopeClass", "different-task-class"],
]) {
    test(`incomplete or incompatible ${field} cannot establish improvement`, () => {
        const slices = records();
        slices[2][field] = value;
        const report = evaluateDeliveryOutcomes({ policy, slices });
        assert.equal(report.status, "insufficient-evidence");
        assert.equal(report.counts.nudge, 2);
        assert.equal(report.promotionAllowed, false);
    });
}

test("small samples, unchanged performance, and regressions have distinct results", () => {
    assert.equal(evaluateDeliveryOutcomes({ policy, slices: records().slice(0, 3) }).status, "insufficient-evidence");
    const slices = records().map((slice) => ({ ...slice, deliveryMs: 1000 }));
    assert.equal(evaluateDeliveryOutcomes({ policy, slices }).status, "no-demonstrated-improvement");
});

test("policies must precede slices and records cannot be duplicated", () => {
    const slices = records();
    assert.throws(() => evaluateDeliveryOutcomes({ policy: { ...policy, fixedAt: 200 }, slices }));
    assert.throws(() => evaluateDeliveryOutcomes({ policy, slices: [...slices, slices[0]] }));
    assert.throws(() => evaluateDeliveryOutcomes({ policy: { ...policy, maxRegression: {} }, slices }));
    assert.throws(() => evaluateDeliveryOutcomes({ policy, slices: [{ ...slices[0], policyId: "other" }] }));
});

test("equal fractional costs in different orders do not breach a zero-regression guardrail", () => {
    const slices = ["control", "nudge"].flatMap((group) =>
        (group === "control" ? [0.3, 0.2, 0.1] : [0.1, 0.2, 0.3]).map((costUsd, index) => ({
            ...records()[group === "control" ? 0 : 2],
            id: `${group}-${index}`, costUsd,
        })),
    );
    const report = evaluateDeliveryOutcomes({ policy, slices });
    assert.equal(report.status, "promising-association");
    slices[3].costUsd += 0.000001;
    assert.equal(evaluateDeliveryOutcomes({ policy, slices }).status, "guardrail-breach");
});

test("numerical tolerance cannot label unchanged large values as an improvement", () => {
    const slices = records().map((slice) => ({ ...slice, deliveryMs: 1e20 }));
    assert.equal(evaluateDeliveryOutcomes({ policy, slices }).status, "no-demonstrated-improvement");
});
