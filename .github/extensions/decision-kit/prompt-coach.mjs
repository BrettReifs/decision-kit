export const COACH_RULE_VERSION = "prompt-coach-v1";
export const DEFAULT_THRESHOLD = 0.90;
export const DEFAULT_COOLDOWN_TURNS = 3;

export const COACH_CLASSES = Object.freeze([
    "aligned",
    "unclear",
    "scope_expansion",
    "reuse_check",
    "checkpoint_first",
]);

export const WARNING_CLASSES = Object.freeze([
    "scope_expansion",
    "reuse_check",
    "checkpoint_first",
]);

export const WARNING_TEMPLATES = Object.freeze({
    scope_expansion:
        "This adds a new deliverable beyond the active task contract. Finish this increment, defer the extra, or explicitly update the contract.",
    reuse_check:
        "This proposes adding a new implementation without checking existing work. Search for an existing implementation before adding another.",
    checkpoint_first:
        "This starts further work while the current increment may be unverified or uncommitted. Verify and checkpoint the current increment before continuing.",
});

export function validateTaskContract(contract) {
    if (!contract || typeof contract !== "object" || Array.isArray(contract)) {
        return null;
    }

    const outcome = typeof contract.outcome === "string" ? contract.outcome.trim() : "";
    if (!outcome) return null;

    const phase = typeof contract.phase === "string" ? contract.phase.trim() : "";
    if (!phase) return null;

    const rawAcceptance =
        contract.acceptance ?? contract.acceptanceCriterion ?? contract.acceptance_criteria ?? contract.acceptanceCheck;
    const acceptance = typeof rawAcceptance === "string" ? rawAcceptance.trim() : "";
    if (!acceptance) return null;

    const rawNonGoals = contract.nonGoals ?? contract.non_goals ?? [];
    let nonGoals = [];
    if (Array.isArray(rawNonGoals)) {
        nonGoals = rawNonGoals.filter((item) => typeof item === "string" && item.trim().length > 0).map((item) => item.trim());
    } else if (typeof rawNonGoals === "string" && rawNonGoals.trim()) {
        nonGoals = [rawNonGoals.trim()];
    }

    const optIn = Boolean(
        contract.optIn || contract.openrouterOptIn || contract.allowRemoteEval,
    );

    return {
        outcome,
        phase,
        acceptance,
        nonGoals,
        optIn,
    };
}

export function initialPromptCoachState() {
    return {
        version: COACH_RULE_VERSION,
        startedAt: null,
        lastTimestamp: null,
        turns: 0,
        lastWarningTurn: null,
        decisionsCount: 0,
        warningCount: 0,
        hookDurationMs: 0,
        recentDecisions: [],
    };
}

export function formatWarning({ chosenClass, probability, confidence }) {
    const template = WARNING_TEMPLATES[chosenClass];
    if (!template) return "";

    const probStr = typeof probability === "number" ? probability.toFixed(2) : "unknown";
    const confStr = typeof confidence === "number" ? confidence.toFixed(2) : "unknown";

    return `[Decision Kit Prompt Coach] Scope Warning: ${chosenClass} (model probability estimate: ${probStr}, Jev confidence: ${confStr}). ${template}`;
}

export function evaluatePromptCoachDecision(
    state,
    decision,
    {
        mode = "nudge",
        threshold = DEFAULT_THRESHOLD,
        cooldownTurns = DEFAULT_COOLDOWN_TURNS,
    } = {},
) {
    if (!["observe", "nudge", "off"].includes(mode)) {
        throw new Error("Unknown coach mode.");
    }

    if (mode === "off" || !decision) {
        return { state, warning: null };
    }

    const turn = (state.turns || 0) + 1;
    const isWarningClass = WARNING_CLASSES.includes(decision.chosenClass);
    const probability = Number.isFinite(decision.probability) ? decision.probability : 0;
    const clearsThreshold = probability >= threshold;
    const inCooldown =
        state.lastWarningTurn !== null &&
        turn - state.lastWarningTurn <= cooldownTurns;

    const shouldWarn = mode === "nudge" && isWarningClass && clearsThreshold && !inCooldown;
    const warning = shouldWarn ? formatWarning(decision) : null;

    const timestamp = Number.isSafeInteger(decision.timestamp) ? decision.timestamp : Date.now();

    const decisionRecord = {
        timestamp,
        turn,
        chosenClass: decision.chosenClass,
        probability,
        confidence: Number.isFinite(decision.confidence) ? decision.confidence : 0,
        warningEmitted: shouldWarn,
        latencyMs: Number.isFinite(decision.latencyMs) ? Math.max(0, Math.round(decision.latencyMs)) : 0,
        cost: Number.isFinite(decision.cost) ? decision.cost : null,
    };

    const recentDecisions = [
        ...(Array.isArray(state.recentDecisions) ? state.recentDecisions.slice(-9) : []),
        decisionRecord,
    ];

    const updatedState = {
        version: COACH_RULE_VERSION,
        startedAt: state.startedAt ?? timestamp,
        lastTimestamp: timestamp,
        turns: turn,
        lastWarningTurn: shouldWarn ? turn : state.lastWarningTurn,
        decisionsCount: (state.decisionsCount || 0) + 1,
        warningCount: (state.warningCount || 0) + (shouldWarn ? 1 : 0),
        hookDurationMs: (state.hookDurationMs || 0) + (decision.hookDurationMs || 0),
        recentDecisions,
    };

    return { state: updatedState, warning };
}

export function coachObservationReport(states) {
    let totalTurns = 0;
    let totalDecisions = 0;
    let totalWarnings = 0;
    let totalHookDurationMs = 0;
    const classDistribution = Object.fromEntries(COACH_CLASSES.map((c) => [c, 0]));

    for (const state of states) {
        if (!state || typeof state !== "object") continue;
        totalTurns += state.turns || 0;
        totalDecisions += state.decisionsCount || 0;
        totalWarnings += state.warningCount || 0;
        totalHookDurationMs += state.hookDurationMs || 0;
        if (Array.isArray(state.recentDecisions)) {
            for (const dec of state.recentDecisions) {
                if (dec.chosenClass && dec.chosenClass in classDistribution) {
                    classDistribution[dec.chosenClass]++;
                }
            }
        }
    }

    return {
        sessions: states.length,
        totalTurns,
        totalDecisions,
        totalWarnings,
        totalHookDurationMs,
        classDistribution,
    };
}
