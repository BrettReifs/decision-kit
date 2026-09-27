import test from "node:test";
import assert from "node:assert/strict";
import {
    buildJevRequest,
    buildNarrativeRequest,
    interpretJevResponse,
    validateRunInput,
} from "../.github/extensions/decision-kit/core.mjs";
import { getScenario } from "../.github/extensions/decision-kit/scenarios.mjs";

function response(overrides = {}) {
    return {
        model: "typesafe/jev-test",
        answers: {
            branch: {
                type: "choice",
                choice: "rollback",
                confidence: 0.9,
                probabilities: { rollback: 0.9, investigate: 0.1 },
            },
            urgency: {
                type: "score",
                score: 1.8,
                confidence: 0.88,
                probabilities: { 0: 0.02, 1: 0.16, 2: 0.82 },
            },
            human_review: { type: "noul", noul: 0.1 },
            ...overrides,
        },
    };
}

test("shapes one Jev request with choice, score, and noul questions", () => {
    const scenario = getScenario("incident");
    const request = buildJevRequest({ scenario, context: scenario.context });
    assert.equal(request.questions.branch.type, "choice");
    assert.equal(request.questions.urgency.type, "score");
    assert.equal(request.questions.human_review.type, "noul");
    assert.equal(request.model, "~typesafe/jev-latest");
});

test("routes low-confidence decisions to human review", () => {
    const result = interpretJevResponse(
        response({
            branch: {
                type: "choice",
                choice: "rollback",
                confidence: 0.61,
                probabilities: { rollback: 0.61, investigate: 0.39 },
            },
        }),
    );
    assert.equal(result.requiresHumanReview, true);
    assert.ok(result.components.includes("human-review"));
    assert.ok(!result.components.includes("recommended-action"));
});

test("routes explicit review signals to a human even at high confidence", () => {
    const result = interpretJevResponse(response({ human_review: { type: "noul", noul: 0.8 } }));
    assert.equal(result.requiresHumanReview, true);
});

test("rejects malformed provider responses", () => {
    assert.throws(
        () => interpretJevResponse({ answers: { branch: { type: "choice" } } }),
        /Malformed provider response/,
    );
    assert.throws(
        () =>
            interpretJevResponse(
                response({
                    branch: {
                        type: "choice",
                        choice: "rollback",
                        confidence: 1.2,
                        probabilities: { rollback: 1 },
                    },
                }),
            ),
        /probability/,
    );
});

test("validates scenarios and context bounds", () => {
    assert.throws(() => validateRunInput({ scenarioId: "unknown", context: "A".repeat(30) }));
    assert.throws(() => validateRunInput({ scenarioId: "incident", context: "too short" }));
    const valid = validateRunInput({
        scenarioId: "feature",
        context: "Enough specific context to support a typed decision.",
    });
    assert.equal(valid.scenario.id, "feature");
});

test("narrative prompt preserves the typed decision and human gate", () => {
    const scenario = getScenario("incident");
    const decision = interpretJevResponse(response({ human_review: { type: "noul", noul: 0.9 } }));
    const request = buildNarrativeRequest({ scenario, context: scenario.context, decision });
    const supplied = JSON.parse(request.messages[1].content);
    assert.equal(supplied.jevDecision.chosenBranch, "rollback");
    assert.match(supplied.instruction, /Do not state that an action is approved/);
});
