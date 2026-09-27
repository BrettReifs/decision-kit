import {
    buildJevRequest,
    buildNarrativeRequest,
    interpretJevResponse,
    parseNarrativeResponse,
} from "./core.mjs";

const DECISIONS_URL = "https://openrouter.ai/api/alpha/decisions";
const CHAT_URL = "https://openrouter.ai/api/v1/chat/completions";

async function postJson(url, body, apiKey, stage) {
    const startedAt = performance.now();
    const response = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://github.com/BrettReifs/decision-kit",
            "X-Title": "Decision Kit",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30_000),
    });
    const text = await response.text();
    let payload;
    try {
        payload = JSON.parse(text);
    } catch {
        throw new Error(`${stage} returned a non-JSON response (${response.status}).`);
    }
    if (!response.ok) {
        const message = payload?.error?.message || payload?.message || `HTTP ${response.status}`;
        throw new Error(`${stage} failed: ${message}`);
    }
    return { payload, latencyMs: Math.round(performance.now() - startedAt) };
}

export async function runLiveDecision({ scenario, context, apiKey, onProgress }) {
    onProgress("jev", "Jev is evaluating three typed questions.");
    const jev = await postJson(DECISIONS_URL, buildJevRequest({ scenario, context }), apiKey, "Jev");
    const decision = interpretJevResponse(jev.payload);

    onProgress("llm", "The LLM is explaining the bounded result.");
    const llm = await postJson(
        CHAT_URL,
        buildNarrativeRequest({ scenario, context, decision }),
        apiKey,
        "LLM",
    );
    const narrative = parseNarrativeResponse(llm.payload);
    return {
        mode: "live",
        decision: { ...decision, latencyMs: jev.latencyMs },
        narrative: { ...narrative, latencyMs: llm.latencyMs },
    };
}

const DEMO_ANSWERS = Object.freeze({
    incident: {
        branch: ["rollback", 0.86, { rollback: 0.86, contain: 0.1, investigate: 0.04 }],
        urgency: [1.92, 0.94],
        review: 0.18,
    },
    feature: {
        branch: ["search", 0.69, { search: 0.69, export: 0.27, themes: 0.04 }],
        urgency: [1.31, 0.78],
        review: 0.38,
    },
    escalation: {
        branch: ["legal", 0.61, { legal: 0.61, engineering: 0.35, success: 0.04 }],
        urgency: [1.87, 0.92],
        review: 0.91,
    },
});

export async function runDemoDecision({ scenario, context, onProgress }) {
    onProgress("jev", "Demo mode is replaying a deterministic typed result.");
    await new Promise((resolve) => setTimeout(resolve, 260));
    const preset = DEMO_ANSWERS[scenario.id];
    const response = {
        model: "~typesafe/jev-latest (deterministic demo)",
        provider: "Decision Kit demo fixture",
        answers: {
            branch: {
                type: "choice",
                choice: preset.branch[0],
                confidence: preset.branch[1],
                probabilities: preset.branch[2],
            },
            urgency: {
                type: "score",
                score: preset.urgency[0],
                confidence: preset.urgency[1],
                probabilities: { 0: 0.03, 1: 0.12, 2: 0.85 },
                legend: Object.fromEntries(scenario.scoreLegend.map((label, index) => [index, label])),
            },
            human_review: { type: "noul", noul: preset.review },
        },
    };
    const decision = interpretJevResponse(response);

    onProgress("llm", "Demo mode is composing a deterministic bounded explanation.");
    await new Promise((resolve) => setTimeout(resolve, 320));
    const branchLabel = scenario.options[decision.chosenBranch];
    const branchClause = branchLabel.replace(/[.!?]+$/, "");
    const narrative = decision.requiresHumanReview
        ? {
              rationale: `Jev selected “${branchClause},” but the confidence gate or review signal requires a person to validate the evidence before action.`,
              nextSteps: [
                  "Assign an accountable reviewer.",
                  "Verify the missing or ambiguous evidence.",
                  "Record the final disposition in the audit trail.",
              ],
          }
        : {
              rationale: `Jev selected “${branchClause}” with confidence above the configured gate. The recommendation remains bounded by the supplied context.`,
              nextSteps: [
                  "Confirm the current context is still accurate.",
                  `Execute: ${branchLabel}`,
                  "Observe the outcome and record any changed evidence.",
              ],
          };
    return {
        mode: "demo",
        decision: { ...decision, latencyMs: 260 },
        narrative: { ...narrative, model: "deterministic demo narrative", latencyMs: 320 },
        demoNotice:
            "No OpenRouter credential is available. These labeled fixture results demonstrate the workflow and are not live model output.",
        contextDigest: `${context.length} characters evaluated`,
    };
}
