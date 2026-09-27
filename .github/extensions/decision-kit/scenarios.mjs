export const SCENARIOS = Object.freeze({
    incident: {
        id: "incident",
        label: "Incident response",
        eyebrow: "Operations",
        prompt: "Choose the safest immediate response to a production incident.",
        context:
            "Checkout errors rose to 18% after the 15:20 UTC deployment. Enterprise customers are affected. Rollback is available and takes four minutes. The on-call engineer has not found evidence of data loss.",
        options: {
            rollback: "Roll back the latest deployment and verify recovery.",
            investigate: "Keep the release live while the on-call engineer investigates.",
            contain: "Disable checkout and route traffic to a maintenance experience.",
        },
        scoreLegend: [
            "Monitor during business hours",
            "Respond in the current on-call shift",
            "Act immediately",
        ],
    },
    feature: {
        id: "feature",
        label: "Feature prioritization",
        eyebrow: "Product",
        prompt: "Choose the next product investment based on bounded evidence.",
        context:
            "The team has six engineer-weeks. Search improvements affect 42% of weekly active users and have 31 corroborated requests. Bulk export affects 9% of users, including the two largest renewal risks. Theme customization has 86 votes but no measured retention signal.",
        options: {
            search: "Improve search relevance and filtering.",
            export: "Build bulk export for enterprise workflows.",
            themes: "Add workspace theme customization.",
        },
        scoreLegend: [
            "Weak evidence",
            "Meaningful evidence",
            "Strong evidence",
        ],
    },
    escalation: {
        id: "escalation",
        label: "Customer escalation",
        eyebrow: "Customer success",
        prompt: "Choose the owner and review level for a sensitive escalation.",
        context:
            "A regulated healthcare customer reports intermittent audit-log gaps. Reproduction is incomplete. Their renewal is in 21 days, legal has not assessed notification obligations, and support promised an update within two hours.",
        options: {
            engineering: "Engineering incident commander owns the response.",
            success: "Customer success manages the response with normal support.",
            legal: "Legal and security jointly own the response.",
        },
        scoreLegend: [
            "Standard support handling",
            "Cross-functional review",
            "Executive escalation",
        ],
    },
});

export function getScenario(id) {
    const scenario = SCENARIOS[id];
    if (!scenario) {
        throw new Error(`Unknown scenario: ${id}`);
    }
    return scenario;
}

export function scenarioSummaries() {
    return Object.values(SCENARIOS).map(({ id, label, eyebrow, prompt, context }) => ({
        id,
        label,
        eyebrow,
        prompt,
        context,
    }));
}
