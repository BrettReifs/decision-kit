import { getScenario } from "./scenarios.mjs";

export const JEV_MODEL = process.env.OPENROUTER_JEV_MODEL || "~typesafe/jev-latest";
export const LLM_MODEL = process.env.OPENROUTER_LLM_MODEL || "openai/gpt-4.1-mini";
export const CONFIDENCE_THRESHOLD = 0.72;

export function validateRunInput(input) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
        throw new Error("Run input must be an object.");
    }
    const scenario = getScenario(input.scenarioId);
    const context = typeof input.context === "string" ? input.context.trim() : "";
    if (context.length < 20) {
        throw new Error("Context must contain at least 20 characters.");
    }
    if (context.length > 12_000) {
        throw new Error("Context must be 12,000 characters or fewer.");
    }
    return { scenario, context };
}

export function buildJevRequest({ scenario, context }) {
    return {
        model: JEV_MODEL,
        state: {
            scenario: scenario.label,
            objective: scenario.prompt,
            context,
        },
        questions: {
            branch: {
                type: "choice",
                instructions: "Which branch best fits the evidence and objective?",
                criteria: scenario.options,
            },
            urgency: {
                type: "score",
                instructions: "How urgently should the chosen branch be reviewed or executed?",
                criteria: scenario.scoreLegend,
            },
            human_review: {
                type: "noul",
                instructions:
                    "Does ambiguity, risk, or missing evidence require a human to review this decision before action?",
                criteria: {
                    true: "Human judgment is required before acting.",
                    false: "The evidence supports proceeding within the stated guardrails.",
                },
            },
        },
    };
}

function finiteProbability(value, field) {
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 1) {
        throw new Error(`Malformed provider response: ${field} must be a probability.`);
    }
    return value;
}

function finiteScore(value) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
        throw new Error("Malformed provider response: urgency.score must be numeric.");
    }
    return value;
}

export function interpretJevResponse(response, threshold = CONFIDENCE_THRESHOLD) {
    const answers = response?.answers;
    const branch = answers?.branch;
    const urgency = answers?.urgency;
    const humanReview = answers?.human_review;
    if (
        branch?.type !== "choice" ||
        typeof branch.choice !== "string" ||
        !branch.probabilities ||
        urgency?.type !== "score" ||
        humanReview?.type !== "noul"
    ) {
        throw new Error("Malformed provider response: expected branch, urgency, and human_review answers.");
    }

    const branchConfidence = finiteProbability(branch.confidence, "branch.confidence");
    const urgencyConfidence = finiteProbability(urgency.confidence, "urgency.confidence");
    const reviewProbability = finiteProbability(humanReview.noul, "human_review.noul");
    const score = finiteScore(urgency.score);
    const probabilities = Object.fromEntries(
        Object.entries(branch.probabilities).map(([key, value]) => [
            key,
            finiteProbability(value, `branch.probabilities.${key}`),
        ]),
    );
    if (!(branch.choice in probabilities)) {
        throw new Error("Malformed provider response: chosen branch is absent from probabilities.");
    }

    const confidence = Math.min(branchConfidence, urgencyConfidence);
    const requiresHumanReview = confidence < threshold || reviewProbability >= 0.5;
    const components = ["confidence-gate", "audit-trace"];
    if (score >= 1.25) components.unshift("urgency-signal");
    if (Object.keys(probabilities).length > 1) components.push("option-distribution");
    components.push(requiresHumanReview ? "human-review" : "recommended-action");

    return {
        chosenBranch: branch.choice,
        probabilities,
        confidence,
        threshold,
        score,
        scoreLegend: urgency.legend ?? {},
        reviewProbability,
        requiresHumanReview,
        components,
        providerModel: response.model ?? JEV_MODEL,
        provider: response.provider ?? "TypeSafe via OpenRouter",
        usage: response.usage ?? null,
    };
}

export function buildNarrativeRequest({ scenario, context, decision }) {
    const authority = decision.requiresHumanReview
        ? "Route to human review. Do not state that an action is approved."
        : "Recommend the selected branch, while preserving the stated confidence and guardrails.";
    return {
        model: LLM_MODEL,
        temperature: 0.2,
        max_tokens: 320,
        messages: [
            {
                role: "system",
                content:
                    "You explain a typed decision. Jev is authoritative. Do not change its branch, probability, score, confidence, or review gate. Return JSON with rationale (string) and nextSteps (array of 2-4 short strings).",
            },
            {
                role: "user",
                content: JSON.stringify({
                    objective: scenario.prompt,
                    sourceContext: context,
                    jevDecision: decision,
                    instruction: authority,
                }),
            },
        ],
        response_format: { type: "json_object" },
    };
}

export function parseNarrativeResponse(response) {
    const content = response?.choices?.[0]?.message?.content;
    if (typeof content !== "string") {
        throw new Error("Malformed LLM response: message content is missing.");
    }
    let parsed;
    try {
        parsed = JSON.parse(content);
    } catch {
        throw new Error("Malformed LLM response: expected JSON content.");
    }
    if (
        typeof parsed.rationale !== "string" ||
        !Array.isArray(parsed.nextSteps) ||
        parsed.nextSteps.length < 1 ||
        parsed.nextSteps.some((step) => typeof step !== "string")
    ) {
        throw new Error("Malformed LLM response: rationale and nextSteps are required.");
    }
    return {
        rationale: parsed.rationale.trim(),
        nextSteps: parsed.nextSteps.slice(0, 4).map((step) => step.trim()),
        model: response.model ?? LLM_MODEL,
    };
}
