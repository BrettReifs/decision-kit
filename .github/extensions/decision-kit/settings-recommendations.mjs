import { settingsCatalog, settingsCoverage, settingsSources } from "./settings-catalog.mjs";

const goals = ["lower-cost", "higher-quality", "review-before-execution", "parallel-work", "restricted-network", "desktop-interaction", "custom-provider", "background-work", "project-guidance", "visual-decisions", "experimental-memory"];

export const settingsRules = [
    { id: "cost", goal: "lower-cost", choices: [["model.select", "Auto"], ["model.autoTier", "Efficiency"]], reason: "Prefer cost-focused eligible model routing; savings are not guaranteed." },
    { id: "quality", goal: "higher-quality", choices: [["model.select", "Auto"], ["model.autoTier", "Intelligence"]], reason: "Prefer capability-focused routing; validate quality and cost on the task." },
    { id: "review", goal: "review-before-execution", choices: [["session.mode", "Plan"], ["permissions.tools", "Always ask"]], reason: "Separate planning from execution and retain tool approval." },
    { id: "parallel", goal: "parallel-work", choices: [["session.execution", "worktree"], ["sandbox.enabled", true]], reason: "Separate branch work and enable process restrictions; worktrees alone do not provide security." },
    { id: "network", goal: "restricted-network", choices: [["sandbox.enabled", true], ["sandbox.internet", false], ["sandbox.localNetwork", false]], reason: "Restrict network access; providers, MCP, package installs, and tools may stop working." },
    { id: "desktop", goal: "desktop-interaction", choices: [["computer.enabled", true]], requires: ["supported-desktop", "preview-consent"], reason: "Use desktop tools only on supported local platforms with preview consent and approval." },
    { id: "provider", goal: "custom-provider", choices: [["provider.url", null], ["provider.key", null]], requires: ["preview-consent"], reason: "Configure a trusted provider in the app; enter secrets only in its credential UI." },
    { id: "background", goal: "background-work", choices: [["automation.execution", "cloud"]], requires: ["cloud-eligible", "cloud-build-verified"], reason: "Cloud automation requires access and installed-build verification: v1.1.27 removes creation despite current how-to instructions." },
    { id: "guidance", goal: "project-guidance", choices: [["instructions.project", null]], reason: "Use repository-scoped guidance rather than applying task-specific advice globally." },
    { id: "canvas", goal: "visual-decisions", choices: [["canvas.project", null]], reason: "Use a project Canvas extension for inspectable decision output." },
    { id: "memory", goal: "experimental-memory", choices: [["experiment.memory", true]], reason: "Session memory has release evidence, but insufficient configuration evidence for a recommendation." },
];

export function recommendSettings(input) {
    if (!input || typeof input !== "object" || Array.isArray(input)) throw new TypeError("Needs must be an object.");
    if (!Array.isArray(input.goals) || input.goals.some((goal) => !goals.includes(goal))) throw new TypeError("Use documented goal identifiers.");
    if (input.platform !== undefined && !["macos", "windows", "linux"].includes(input.platform)) throw new TypeError("Unsupported platform.");
    if (input.allowPreview !== undefined && typeof input.allowPreview !== "boolean") throw new TypeError("allowPreview must be boolean.");
    if (input.cloudEligible !== undefined && typeof input.cloudEligible !== "boolean") throw new TypeError("cloudEligible must be boolean.");
    if (input.cloudCreationVerified !== undefined && typeof input.cloudCreationVerified !== "boolean") throw new TypeError("cloudCreationVerified must be boolean.");
    if (input.managed !== undefined && (!input.managed || typeof input.managed !== "object" || Array.isArray(input.managed))) throw new TypeError("managed must map catalog setting IDs to effective allowed values.");
    const managed = input.managed ?? {};
    for (const [id, values] of Object.entries(managed)) {
        const setting = settingsCatalog.find((candidate) => candidate.id === id);
        if (!setting || setting.scope === "managed" || !Array.isArray(setting.values) || !Array.isArray(values) || values.some((value) => !setting.values.includes(value))) {
            throw new TypeError("managed must contain normalized non-governance setting IDs and allowed values.");
        }
    }
    const candidates = new Map();
    const blocked = [];
    for (const rule of settingsRules.filter(({ goal }) => input.goals.includes(goal))) {
        const missing = (rule.requires ?? []).filter((requirement) => (
            requirement === "preview-consent" ? input.allowPreview !== true :
            requirement === "supported-desktop" ? !["macos", "windows"].includes(input.platform) :
            requirement === "cloud-build-verified" ? input.cloudCreationVerified !== true :
            input.cloudEligible !== true
        ));
        const proposals = rule.choices.map(([id, value]) => {
            const setting = settingsCatalog.find((candidate) => candidate.id === id);
            return { id, value, component: setting.component, rule: rule.id, reason: rule.reason, sources: setting.sources.map((source) => settingsSources[source]), caveats: [...setting.caveats] };
        });
        const issues = [...missing];
        for (const proposal of proposals) {
            const setting = settingsCatalog.find(({ id }) => id === proposal.id);
            if (setting.recommendable === false) issues.push(`unverified-control:${proposal.id}`);
            if (Object.hasOwn(managed, proposal.id) && !managed[proposal.id].includes(proposal.value)) issues.push(`policy:${proposal.id}`);
        }
        if (issues.length) {
            blocked.push({ rule: rule.id, issues, proposals });
            continue;
        }
        for (const proposal of proposals) {
            const current = candidates.get(proposal.id) ?? [];
            candidates.set(proposal.id, [...current, proposal]);
        }
    }
    const recommendations = [];
    const conflicts = [];
    for (const [id, proposals] of candidates) {
        if (new Set(proposals.map(({ value }) => value)).size > 1) {
            conflicts.push({ id, proposals, reason: "Goals propose different values; choose a trade-off before applying either." });
        } else {
            recommendations.push({ ...proposals[0], rules: proposals.map(({ rule }) => rule) });
        }
    }
    // A conflicting shared setting invalidates each combination that depends on it.
    const conflictingRules = new Set(conflicts.flatMap(({ proposals }) => proposals.map(({ rule }) => rule)));
    const ready = recommendations.filter(({ rules }) => rules.some((rule) => !conflictingRules.has(rule)));
    const combinationWarnings = [];
    const reviewWarnings = [];
    if (input.goals.includes("restricted-network")) {
        reviewWarnings.push("Verify or re-enable sandboxing for the active session; a saved /sandbox off choice can survive restart and override the project default, or start a new session.");
    }
    if (input.goals.includes("restricted-network") && input.goals.includes("custom-provider")) {
        combinationWarnings.push("External providers may be unreachable with outbound networking disabled; test routing before using this combination.");
    }
    return {
        mode: "advisory", applied: false, evidence: "uncalibrated-heuristic",
        coverage: settingsCoverage,
        recommendations: ready,
        conflicts, blocked, combinationWarnings, reviewWarnings,
        requiresReview: conflicts.length > 0 || blocked.length > 0 || combinationWarnings.length > 0 || reviewWarnings.length > 0 || ready.some(({ value }) => value === null),
        caveats: [
            "No settings are read, written, or applied. No model calls or credentials are used.",
            "managed is a caller-supplied effective constraint map, not a policy discovery or enforcement engine.",
            "Unknown policy, eligibility, installed-build support, and outcome evidence must be verified before use.",
            "These heuristics do not modify Jev decisions or its confidence gate, and do not establish a best configuration.",
        ],
    };
}
