import { createHash } from "node:crypto";
import { extname, isAbsolute, relative, resolve } from "node:path";

export const DELIVERY_RULE_VERSION = "polish-loop-v1";
export const DELIVERY_NUDGE =
    "Decision Kit observed repeated spacing or corner-radius edits to one file. " +
    "This is a possible polish loop, not proof of wasted work or completion. " +
    "Use the existing agreed outcome: continue if these edits address acceptance, usability, or accessibility. " +
    "Otherwise defer optional polish, verify the current slice, and take the next authorized commit or PR step. " +
    "Do not ask the user for a status report, redefine done, or publish without permission.";

const hash = (value) => createHash("sha256").update(value).digest("hex");
const spacingProperty = /^(?:margin|padding)(?:-(?:top|right|bottom|left|inline|block)(?:-(?:start|end))?)?$|^(?:gap|row-gap|column-gap|border-radius)$/;

function declarations(text) {
    if (typeof text !== "string" || text.length > 4096) return null;
    const parts = text.trim().split(";").map((part) => part.trim()).filter(Boolean);
    if (!parts.length) return null;
    const properties = [];
    for (const part of parts) {
        const match = /^([a-z-]+)\s*:\s*([0-9.%a-z+\-\s]+)$/.exec(part);
        if (!match || !spacingProperty.test(match[1])) return null;
        properties.push(match[1]);
    }
    return properties.sort().join(",");
}

export function classifyTool(input, root) {
    if (!input || !Number.isSafeInteger(input.timestamp) || input.timestamp < 0 ||
        typeof input.sessionId !== "string" || !input.sessionId || input.sessionId.length > 256 ||
        typeof input.toolName !== "string" || input.toolResult?.resultType !== "success") {
        return null;
    }
    let args = input.toolArgs;
    if (typeof args === "string") {
        try { args = JSON.parse(args); } catch { args = null; }
    }
    const event = { timestamp: input.timestamp, kind: "other", target: null };
    if (["edit", "str_replace_editor"].includes(input.toolName)) {
        event.kind = "edit";
        const path = args?.path ?? args?.file_path;
        const before = args?.old_str ?? args?.oldString;
        const after = args?.new_str ?? args?.newString;
        if (typeof path === "string" && path.length <= 4096) {
            const local = relative(root, resolve(root, path));
            const inside = local && !isAbsolute(local) && local !== ".." && !/^\.\.[\\/]/.test(local);
            if (inside && [".css", ".scss", ".html", ".mjs", ".js", ".tsx", ".jsx"].includes(extname(local))) {
                event.target = hash(local);
                const previous = declarations(before);
                if (previous && previous === declarations(after) && before !== after) {
                    event.kind = "polish";
                }
            }
        }
    } else if (["create", "apply_patch"].includes(input.toolName)) {
        event.kind = "edit";
    }
    return event;
}

export function initialDeliveryState() {
    return {
        version: DELIVERY_RULE_VERSION,
        startedAt: null,
        lastTimestamp: null,
        observations: 0,
        recent: [],
        candidateCount: 0,
        nudgeCount: 0,
        hookDurationMs: 0,
    };
}

export function observeDelivery(state, event, mode = "observe") {
    if (!["observe", "nudge", "off"].includes(mode)) throw new Error("Unknown delivery mode.");
    if (mode === "off" || !event) return { state, output: {} };
    // Ignore stale/replayed hook deliveries rather than count them as new evidence.
    if (state.lastTimestamp !== null && event.timestamp <= state.lastTimestamp) {
        return { state, output: {} };
    }
    const recent = [...state.recent, event].slice(-10);
    const next = {
        ...state,
        startedAt: state.startedAt ?? event.timestamp,
        lastTimestamp: event.timestamp,
        observations: state.observations + 1,
        recent,
    };
    const sameTarget = recent.filter((item) => item.target === event.target && item.kind === "polish");
    const candidate = event.kind === "polish" && sameTarget.length >= 3 &&
        event.timestamp - sameTarget.at(-3).timestamp <= 15 * 60_000;
    if (candidate && state.candidateCount === 0) next.candidateCount = 1;
    const output = {};
    if (candidate && mode === "nudge" && state.nudgeCount === 0) {
        next.nudgeCount = 1;
        output.additionalContext = DELIVERY_NUDGE;
    }
    return { state: next, output };
}

export function deliveryObservationReport(states) {
    return {
        ruleVersion: DELIVERY_RULE_VERSION,
        evidence: "observational",
        sessions: states.length,
        observations: states.reduce((sum, state) => sum + state.observations, 0),
        candidateSessions: states.reduce((sum, state) => sum + state.candidateCount, 0),
        nudgeOutputs: states.reduce((sum, state) => sum + state.nudgeCount, 0),
        hookDurationMs: states.reduce((sum, state) => sum + state.hookDurationMs, 0),
        deliveryCost: null,
        timeToVerifiedDeliveryMs: null,
        quality: null,
        humanAttention: null,
        conclusion: "Activity signals only. Delivery improvement and causation are not established.",
        limitations: [
            "Nudge output does not prove the host displayed it or the agent followed it.",
            "Session IDs are not delivery-slice IDs; do not use these counts as a delivery experiment.",
            "No verified contract, acceptance, cost, PR, deployment, or follow-up defect adapter is connected.",
            "Missing signals are unknown, not zero. Hook time excludes process startup.",
        ],
    };
}
