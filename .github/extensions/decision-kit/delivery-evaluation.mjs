const metrics = ["costUsd", "deliveryMs", "reworkCount", "defectCount", "interruptions"];

function tolerance(...values) {
    return Number.EPSILON * Math.max(1, ...values.map(Math.abs)) * 8;
}

export function evaluateDeliveryOutcomes({ policy, slices }) {
    if (!policy || typeof policy.id !== "string" || !policy.id ||
        !Number.isSafeInteger(policy.fixedAt) || policy.fixedAt < 0 ||
        !["costUsd", "deliveryMs"].includes(policy.primaryMetric) ||
        !Number.isInteger(policy.minimumPerGroup) || policy.minimumPerGroup < 2 ||
        !Number.isFinite(policy.minimumImprovement) || policy.minimumImprovement <= 0 ||
        !Number.isSafeInteger(policy.followupMs) || policy.followupMs <= 0 ||
        !metrics.every((metric) => Number.isFinite(policy.maxRegression?.[metric]) &&
            policy.maxRegression[metric] >= 0)) {
        throw new Error("A fixed evaluation policy with explicit guardrail limits is required.");
    }
    if (!Array.isArray(slices)) throw new Error("Delivery slices must be an array.");
    const ids = new Set();
    for (const slice of slices) {
        if (!slice || typeof slice.id !== "string" || !slice.id || ids.has(slice.id) ||
            !["control", "nudge"].includes(slice.group) ||
            typeof slice.scopeClass !== "string" || !slice.scopeClass ||
            typeof slice.contractVersion !== "string" || !slice.contractVersion ||
            slice.policyId !== policy.id ||
            !Number.isSafeInteger(slice.startedAt) || slice.startedAt < policy.fixedAt ||
            ![true, false, null].includes(slice.acceptancePassed) ||
            ![true, false].includes(slice.scopeChanged) ||
            ![true, false].includes(slice.costIncludesKit) ||
            !metrics.every((metric) => slice[metric] === null ||
                (Number.isFinite(slice[metric]) && slice[metric] >= 0)) ||
            !(slice.followupMs === null || (Number.isSafeInteger(slice.followupMs) && slice.followupMs >= 0))) {
            throw new Error("Invalid, duplicated, or policy-incompatible delivery slice.");
        }
        ids.add(slice.id);
    }
    const groups = Object.fromEntries(["control", "nudge"].map((group) => [
        group, slices.filter((slice) => slice.group === group),
    ]));
    const blockers = [];
    if (Object.values(groups).some((group) => group.length < policy.minimumPerGroup)) {
        blockers.push("Too few slices in one or both groups.");
    }
    if (new Set(slices.map((slice) => slice.scopeClass)).size !== 1) {
        blockers.push("Compare one task class at a time.");
    }
    if (slices.some((slice) => slice.scopeChanged)) {
        blockers.push("An agreed scope changed; do not count reduced scope as an improvement.");
    }
    if (slices.some((slice) => !slice.costIncludesKit)) {
        blockers.push("Cost must include the kit, verification, and retries.");
    }
    if (slices.some((slice) => slice.acceptancePassed !== true)) {
        blockers.push("Some outcomes are failed or unverified.");
    }
    if (slices.some((slice) => slice.followupMs === null || slice.followupMs < policy.followupMs)) {
        blockers.push("The quality follow-up window is incomplete.");
    }
    const comparison = {};
    const regressions = [];
    for (const metric of metrics) {
        const averages = {};
        for (const [name, group] of Object.entries(groups)) {
            const values = group.map((slice) => slice[metric]).filter((value) => value !== null);
            // Do not silently discard incomplete or undelivered slices.
            averages[name] = values.length === group.length && values.length
                ? values.reduce((mean, value) => mean + value / values.length, 0)
                : null;
            if (!Number.isFinite(averages[name])) averages[name] = null;
        }
        const delta = averages.control === null || averages.nudge === null
            ? null : averages.nudge - averages.control;
        comparison[metric] = { ...averages, delta };
        if (delta === null) blockers.push(`Incomplete ${metric} evidence.`);
        else if (delta - policy.maxRegression[metric] >
            tolerance(averages.control, averages.nudge, policy.maxRegression[metric])) {
            regressions.push(metric);
        }
    }
    const primaryDelta = comparison[policy.primaryMetric].delta;
    const improved = primaryDelta !== null && primaryDelta < 0 &&
        policy.minimumImprovement + primaryDelta <= tolerance(
            primaryDelta, policy.minimumImprovement,
        );
    return {
        policyId: policy.id,
        counts: { control: groups.control.length, nudge: groups.nudge.length },
        comparison,
        blockers,
        regressions,
        status: blockers.length ? "insufficient-evidence"
            : regressions.length ? "guardrail-breach"
                : improved ? "promising-association" : "no-demonstrated-improvement",
        promotionAllowed: false,
        causalConclusion: "Not established. These descriptive comparisons do not prove causation or no harm.",
        nextEvidence: "Use an approved randomized slice-level experiment and uncertainty analysis before promotion.",
    };
}
