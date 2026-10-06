import test from "node:test";
import assert from "node:assert/strict";
import {
    classifyTool, deliveryObservationReport, initialDeliveryState, observeDelivery,
} from "../.github/extensions/decision-kit/delivery.mjs";

const root = "/workspace/example";
const edit = (timestamp, overrides = {}) => ({
    sessionId: "session-1",
    timestamp,
    toolName: "edit",
    toolArgs: {
        path: `${root}/canvas.css`,
        old_str: "padding: 8px; border-radius: 4px;",
        new_str: "padding: 10px; border-radius: 6px;",
    },
    toolResult: { resultType: "success" },
    ...overrides,
});

function replay(events, mode = "nudge") {
    let state = initialDeliveryState();
    const outputs = [];
    for (const event of events) {
        const result = observeDelivery(state, classifyTool(event, root), mode);
        state = result.state;
        if (result.output.additionalContext) outputs.push(result.output.additionalContext);
    }
    return { state, outputs };
}

const cases = [
    {
        name: "repeated narrow spacing edits produce one advisory nudge",
        events: [edit(1), edit(2), edit(3), edit(4)],
        nudges: 1,
    },
    {
        name: "one or two edits are not a loop",
        events: [edit(1), edit(2)],
        nudges: 0,
    },
    {
        name: "edits spread across files are not a same-file loop",
        events: [1, 2, 3].map((timestamp) => edit(timestamp, {
            toolArgs: { ...edit(1).toolArgs, path: `${root}/${timestamp}.css` },
        })),
        nudges: 0,
    },
    {
        name: "widely separated edits do not trigger",
        events: [edit(1), edit(900_001), edit(1_800_001)],
        nudges: 0,
    },
    {
        name: "functional code changes are not polish",
        events: [1, 2, 3].map((timestamp) => edit(timestamp, {
            toolArgs: { path: `${root}/core.mjs`, old_str: "return false;", new_str: "return true;" },
        })),
        nudges: 0,
    },
    {
        name: "contrast changes are not treated as optional spacing work",
        events: [1, 2, 3].map((timestamp) => edit(timestamp, {
            toolArgs: { ...edit(1).toolArgs, old_str: "color: #777;", new_str: "color: #222;" },
        })),
        nudges: 0,
    },
    {
        name: "focus and accessibility changes are not classified as polish",
        events: [1, 2, 3].map((timestamp) => edit(timestamp, {
            toolArgs: { ...edit(1).toolArgs, old_str: "outline: none;", new_str: "outline: 2px solid;" },
        })),
        nudges: 0,
    },
    {
        name: "mixed behavior and visual replacements are excluded",
        events: [1, 2, 3].map((timestamp) => edit(timestamp, {
            toolArgs: { ...edit(1).toolArgs, new_str: "padding: 10px; display: none;" },
        })),
        nudges: 0,
    },
    {
        name: "failed edits do not count as progress",
        events: [1, 2, 3].map((timestamp) => edit(timestamp, { toolResult: { resultType: "failure" } })),
        nudges: 0,
    },
    {
        name: "replayed or out-of-order events do not increase the count",
        events: [edit(2), edit(2), edit(1)],
        nudges: 0,
    },
    {
        name: "outside-repository paths are not observed as polish",
        events: [1, 2, 3].map((timestamp) => edit(timestamp, {
            toolArgs: { ...edit(1).toolArgs, path: "../outside.css" },
        })),
        nudges: 0,
    },
    {
        name: "no-op replacements do not count as polish",
        events: [1, 2, 3].map((timestamp) => edit(timestamp, {
            toolArgs: { ...edit(1).toolArgs, new_str: edit(1).toolArgs.old_str },
        })),
        nudges: 0,
    },
    {
        name: "unsupported patch formats remain unknown",
        events: [1, 2, 3].map((timestamp) => edit(timestamp, { toolName: "apply_patch" })),
        nudges: 0,
    },
];

for (const scenario of cases) {
    test(`replay eval: ${scenario.name}`, () => {
        const result = replay(scenario.events);
        assert.equal(result.outputs.length, scenario.nudges);
        assert.equal(result.state.nudgeCount, scenario.nudges);
    });
}

test("nudges preserve uncertainty, agreed scope, and publishing permissions", () => {
    const { outputs } = replay([edit(1), edit(2), edit(3)]);
    assert.match(outputs[0], /not proof/);
    assert.match(outputs[0], /existing agreed outcome/);
    assert.match(outputs[0], /accessibility/);
    assert.match(outputs[0], /Do not ask the user for a status report/);
    assert.match(outputs[0], /publish without permission/);
});

test("observe mode records eligibility without output; off mode records nothing", () => {
    const events = [edit(1), edit(2), edit(3)];
    const observed = replay(events, "observe");
    assert.equal(observed.state.candidateCount, 1);
    assert.equal(observed.state.nudgeCount, 0);
    assert.deepEqual(observed.outputs, []);
    assert.deepEqual(replay(events, "off").state, initialDeliveryState());
});

test("hook arguments may be JSON strings; raw content is not retained", () => {
    const args = { ...edit(1).toolArgs, ignored: "private-marker" };
    const event = classifyTool(edit(1, { toolArgs: JSON.stringify(args) }), root);
    assert.equal(event.kind, "polish");
    assert.doesNotMatch(JSON.stringify(event), /private-marker|canvas\.css|padding|session-1/);
    assert.equal(classifyTool(edit(1, { toolArgs: "not JSON" }), root).kind, "edit");
    assert.equal(classifyTool(edit(-1), root), null);
});

test("only the last ten observations contribute to a candidate", () => {
    const read = (timestamp) => edit(timestamp, { toolName: "view" });
    const result = replay([edit(1), edit(2), ...Array.from({ length: 10 }, (_, i) => read(i + 3)), edit(13)]);
    assert.equal(result.outputs.length, 0);
    assert.equal(result.state.recent.length, 10);
});

test("observation reports never convert activity into delivery or causal claims", () => {
    const { state } = replay([edit(1), edit(2), edit(3)]);
    const report = deliveryObservationReport([state]);
    assert.equal(report.candidateSessions, 1);
    assert.equal(report.nudgeOutputs, 1);
    for (const key of ["deliveryCost", "timeToVerifiedDeliveryMs", "quality", "humanAttention"]) {
        assert.equal(report[key], null);
    }
    assert.equal(report.evidence, "observational");
    assert.match(report.conclusion, /not established/);
    assert.equal(deliveryObservationReport([]).sessions, 0);
});
