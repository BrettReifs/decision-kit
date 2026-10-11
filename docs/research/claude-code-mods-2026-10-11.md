# Claude Code Mods: research and Decision Kit opportunities

**Checked:** 2026-10-11  
**Scope:** Claude Code Mods as inspiration for work in Decision Kit's existing Copilot host. This is not a proposal to add Claude Code support.

## Executive summary

Claude Code Mods are real. Anthropic uses “mod” for a Claude Code plugin whose behavior is implemented with function hooks. The first-party source verifies the TypeScript implementation claim. The October 1, 2026 release is also verified, but the public proposal and early source examples appeared earlier: September 3 and September 9. The API is described as early access and may change.

Mods illustrate an event-chain model: modules register functions for host events, and handlers can call a continuation to pass control through the chain. In Claude Code, built-in and community examples use this model for panes, session displays, policy, and tool behavior. These examples show what the Claude Code runtime can do; they do not establish that the same hooks, ordering, or UI are available to Copilot extensions.

The user’s goal is to make Decision Kit users more confident in delivery outcomes: faster verified delivery, lower token or cost spend, and fewer regressions or rework. The strongest transferable ideas are compact progress visibility, a trustworthy review surface, and measured delivery evidence. The current repository has a Canvas, a passive post-tool hook, and an outcome evaluator, but no connected verified-delivery or token-spend evidence adapter. Therefore, neither a dashboard nor an “alive gauge” should display a success claim until its data source and meaning are clear.

Evidence of mod use cases is not the same as evidence of ecosystem popularity. Dated examples and commits show active implementation; stars, forks, issue reactions, and demos do not establish installs, active use, repeat use, productivity gains, or social virality. No reliable install/activity dataset or post with more than 100,000 views or shares was verified.

## Terminology and verified timeline

| Date | Finding | Evidence |
|---|---|---|
| 2026-09-03 | A public proposal introduced TypeScript function hooks for Claude Code, including event handling and UI changes. | [Anthropic Claude Code issue #91870](https://github.com/anthropics/claude-code/issues/91870), created September 3. |
| 2026-09-09 | The issue update names the feature “Claude Mods,” describes a mod as a plugin using function hooks, and links to initial built-in source. | [Issue #91870](https://github.com/anthropics/claude-code/issues/91870), September 9 update. |
| 2026-10-01 | The issue says “We’re live”; Claude Code release `v2.1.287` lists “Added Claude Mods.” | [Issue #91870](https://github.com/anthropics/claude-code/issues/91870); [release v2.1.287](https://github.com/anthropics/claude-code/releases/tag/v2.1.287). |
| Current source as checked 2026-10-11 | A mod is a plugin with a hooks module and a `register(on, options)` entry. The source lists `sec-default`, `diff`, `telemetry`, and `agents-md`; it calls the API early access and warns it may change between releases. | [Anthropic built-in mods README](https://github.com/anthropics/claude-code/blob/main/mods/README.md). |

The release and first-party source substantiate the launch and TypeScript/function-hook claims. “Mods” should not be presented as a new package format independent of plugins: a mod is a plugin that uses function hooks.

## Capability distinctions

| Mechanism | Role shown by first-party sources | Difference from a mod |
|---|---|---|
| **Mods / function hooks** | A plugin registers functions against Claude Code events. The chain uses a continuation (`next`); built-in examples also render UI and observe or affect events. | This is the specific Claude Code plugin pattern that is the subject of this report. Its event names, ordering, and UI runtime are Claude-specific. |
| **Plugins** | Packaging and distribution for commands, agents, skills, hooks, MCP configuration, and other content. | Broader container; a plugin need not use function hooks and therefore need not be a mod. |
| **Skills** | Reusable agent instructions and workflows. | Instructions are not event middleware or a UI extension by themselves. Decision Kit also documents skills as workflow instructions, separate from its Canvas ([README](/home/runner/work/decision-kit/decision-kit/README.md:159-184)). |
| **Classic hooks** | A separate, configured event-hook surface in Claude Code; the function-hook source also refers to `classic.*` events. | Do not equate a classic configured hook with a TypeScript function-hook module. The documentation site could not be retrieved in this research, so detailed classic-hook guarantees are not assessed. |
| **MCP** | External tools and service integrations; Claude Code plugins can package MCP configuration. | MCP is not, by itself, an event-chain middleware or UI-rendering mechanism. |
| **Copilot extension and hooks** | Decision Kit uses the Copilot SDK Canvas and a Copilot `postToolUse` command hook. | Separate host and runtime. Claude Code mods cannot be assumed to load in, or run directly inside, this application. |

Sources: [Claude Code mods README](https://github.com/anthropics/claude-code/blob/main/mods/README.md), [Claude Code plugins README](https://github.com/anthropics/claude-code/blob/main/plugins/README.md), [Claude Code hooks docs](https://code.claude.com/docs/en/hooks). The docs host was not directly retrievable; distinctions above rely on accessible first-party source and are not a complete API comparison.

## Ranked use cases and evidence

The trend window below begins on the verified public release date, **October 1–11, 2026**. Ranking reflects repeated, dated demonstrations and repository activity—not a measured popularity score. Evidence strength describes support for the existence of the example, not its adoption or outcomes.

| Rank | Use case | Dated evidence and signal | Evidence strength and limitation |
|---|---|---|---|
| **1** | **Session and work visibility:** context, cost, agent activity, permission states, progress, and edit review | Anthropic’s built-in [`/diff`](https://github.com/anthropics/claude-code/tree/main/mods/diff) displays changed files and hunks. The [Anthropic playground](https://github.com/anthropics/claude-code-playground/tree/main/claude-code/mods) includes `replay-theater` and `token-weather`. Community [Flightdeck](https://github.com/scasella/claude-flightdeck) documents a session dashboard and dated October 2 implementation/demo commits. The [hamzafer collection](https://github.com/hamzafer/claude-code-mods) added context, cache, usage, and agent-monitoring features in October 5–7 commits. | **Strong for demonstrated capability; moderate for repeated exploration.** Does not show installs or sustained use. Its October 11 star/fork count is cumulative and is not a growth rate. |
| **2** | **Safety and review gates:** pause or inspect risky commands, preserve policy, review permissions | First-party `sec-default` is a built-in policy mod. The [playground](https://github.com/anthropics/claude-code-playground/tree/main/claude-code/mods) includes `blast-radius`. Community [Ultra Mod](https://github.com/mertkayacs/ultramod) documents command guards, secret protection, and test-related checks. | **Strong for implemented examples; moderate for repeated exploration.** The examples do not establish safe coverage of all commands or environments. A false sense of protection is a material risk. |
| **3** | **Workflow UI:** terminal panels, status lines, turn replay, and test/progress displays | First-party `/diff`, `replay-theater`, and `token-weather` show the interaction pattern. Community collections show additional panels and status displays. | **Strong for demos; weak for adoption.** Demo presence does not show that users retain or repeatedly use the UI. |

### Signals that do not prove a trend

- Issue [#91870](https://github.com/anthropics/claude-code/issues/91870) had 253 comments and 224 reactions when retrieved on October 11. This is engagement with a broad feature discussion, not evidence that one use case is preferred or used.
- A repository search on October 11 surfaced new mod projects and catalogues. Repository creation, stars, forks, and update timestamps are cumulative or point-in-time signals. They cannot be treated as install counts, active users, repeat use, or recent growth.
- Dated commits indicate development activity. READMEs and screenshots indicate claimed or demonstrated capability. Neither establishes measured reductions in cost/time or rework.
- The user-specified virality indicator—more than 100,000 views or shares—was not verified for a mod-related social post. No social platform metrics were available in the inspected primary sources.

**Conclusion:** The clearest short-window implementation themes are observability and review UI, with safety controls also recurring. These are measured as examples and project activity only; current adoption and viral popularity remain unverified.

## Function-hook ordering and terminal UI lessons

Claude Code's proposal describes function hooks as a continuation chain. A handler can inspect an event, pass it to the next handler, and inspect or transform the returned result. Registration order therefore affects which handler wraps the others: the issue's September 9 update says the first registered plugin wraps the rest, and that managed `prepend` and `append` tiers let administrators place policy before or after user plugins. The built-in `sec-default` example uses that outer position to preserve managed policy while passing other behavior through. [Issue #91870](https://github.com/anthropics/claude-code/issues/91870) · [`sec-default` README](https://github.com/anthropics/claude-code/blob/main/mods/sec-default/README.md)

For a terminal UI, two useful patterns are visible in first-party and community examples:

- **Compose rather than replace:** a UI hook can call the continuation, then add its own row or panel around the result. The community `claude-code-mods` README documents stacked `AbovePrompt` rows and warns that ordering follows plugin load order. This avoids one extension silently removing another extension's UI, but still requires a clear layout contract. [Collection README](https://github.com/hamzafer/claude-code-mods)
- **Separate observation from authority:** a dashboard can render session facts such as tool activity, context, permission checks, or diffs, while policy and approval remain separate. Flightdeck explicitly describes itself as observe-only; `sec-default` demonstrates a distinct policy layer. A UI gauge should label estimates and derived values, not imply that display order itself provides control or trust. [Flightdeck README](https://github.com/scasella/claude-flightdeck) · [`sec-default` README](https://github.com/anthropics/claude-code/blob/main/mods/sec-default/README.md)

**Transfer to Decision Kit:** adopt explicit sequencing and UI composition as design principles, not Claude's `next`, tier, or event APIs. Keep the typed Jev result authoritative; make the human-review gate an explicit boundary; let visualization consume a read-only result and verified delivery events. Copilot hook ordering and rendering contracts still need first-party confirmation before relying on them.

## Decision Kit architecture and current evidence boundaries

The repository is a Copilot Canvas demonstration, not a Claude Code extension:

- `extension.mjs` creates the Canvas, defines validated actions, starts an HTTP server on loopback with an ephemeral port, and joins the Copilot SDK session. It requests `OPENROUTER_API_KEY` through the host environment-variable flow. [/home/runner/work/decision-kit/decision-kit/.github/extensions/decision-kit/extension.mjs:1-6,108-170,173-253]
- `core.mjs` validates scenario/context input, creates Jev `choice`, `score`, and `noul` questions, validates typed answers, then applies a 0.72 confidence threshold and explicit human-review signal. It builds a separate narrative request that must not alter the Jev result. [/home/runner/work/decision-kit/decision-kit/.github/extensions/decision-kit/core.mjs:3-19,22-52,68-118,120-146]
- `provider.mjs` calls Jev and then a chat completion through OpenRouter. Without a key, it uses deterministic, labeled demo output. [/home/runner/work/decision-kit/decision-kit/.github/extensions/decision-kit/provider.mjs:8-23,38-56,58-131]
- `scenarios.mjs` provides incident response, feature prioritization, and customer escalation presets. [/home/runner/work/decision-kit/decision-kit/.github/extensions/decision-kit/scenarios.mjs:1-55]
- `renderer.mjs` presents the scenario, editable context, decision stages, typed output, review status, and audit details; it receives server updates over Server-Sent Events. It already includes a reduced-motion rule. [/home/runner/work/decision-kit/decision-kit/.github/extensions/decision-kit/renderer.mjs:95-107,112-129,160-210]
- `.github/hooks/decision-kit.json` configures a Copilot `postToolUse` command. `delivery.mjs` classifies a narrow repeated-spacing/radius edit pattern and can return advisory `additionalContext`; this is not a pre-action blocker or a general-purpose event middleware. [/home/runner/work/decision-kit/decision-kit/.github/hooks/decision-kit.json:1-14] [/home/runner/work/decision-kit/decision-kit/.github/extensions/decision-kit/delivery.mjs:28-58,74-99]
- `delivery-hook.mjs` stores bounded observations under Git metadata, with hashed session and file identifiers. Its report leaves delivery cost, verified delivery time, quality, and human attention as `null`. [/home/runner/work/decision-kit/decision-kit/.github/extensions/decision-kit/delivery-hook.mjs:51-60,63-98,100-109] [/home/runner/work/decision-kit/decision-kit/.github/extensions/decision-kit/delivery.mjs:101-121]
- `delivery-evaluation.mjs` compares cost, delivery time, rework, defects, and interruptions. It rejects incomplete evidence, labels promising results as association, and disables automatic promotion. [/home/runner/work/decision-kit/decision-kit/.github/extensions/decision-kit/delivery-evaluation.mjs:1-16,59-97]
- `package.json` requires Node.js 20 or newer and defines `npm test` and `npm run check`; it declares no package dependencies. The extension imports `@github/copilot-sdk/extension`, so its availability is supplied by the host rather than declared here. [/home/runner/work/decision-kit/decision-kit/package.json:1-15] [/home/runner/work/decision-kit/decision-kit/.github/extensions/decision-kit/extension.mjs:1-2]

## Opportunity map for the existing Copilot host

| Pattern inspired by Mods | Existing boundary and expected value | Dependencies, risk, effort, compatibility |
|---|---|---|
| **Compact delivery/status gauge** | Extend the Canvas’s current state and SSE rendering to show verified stages and outcomes. Make unknown evidence visibly unknown. This can help users inspect progress without turning activity into a completion claim. | Uses current Canvas and server. **Low–medium effort.** Main risk is implying verified delivery when only a tool event or agent message exists. Copilot-host compatible; no Claude runtime required. |
| **Decision and review surface** | Present Jev’s branch, probabilities, confidence, urgency, and human-review requirement with the separate LLM narrative clearly marked as explanatory. | Uses current core and renderer. **Low effort.** Must preserve Jev authority and the human gate. Copilot-host compatible. |
| **Delivery outcome dashboard** | Feed the existing evaluator with trusted acceptance, total token/cost, delivery-state, rework, defect, and follow-up evidence; display each measure with its source and coverage. | Requires new passive evidence adapters. **Medium–high effort.** Risks include privacy, incomplete host events, and false attribution. Measure outcomes separately; faster delivery must not conceal regressions. |
| **Function-hook ordering** | Use a deliberate ordering principle: observe and record facts, apply established policy/gates, then render explanatory UI. Keep the ordering explicit and testable. | This is a design principle, not a port of Claude’s `next` API. Copilot hook order and interruption semantics must be checked in Copilot’s own documentation before relying on them. |
| **Cross-host or Claude mod support** | Not needed for the stated goal. Claude examples can inform interaction design only. | Do not add Claude Code as a dependency or assume module/API/runtime compatibility. |

## Three prioritized proof-of-concept proposals

### 1. Evidence-aware delivery gauge

Build a compact Canvas status display from existing run events, then add verified outcome fields only when trusted adapters exist.

**Acceptance criteria**

- Each displayed item names its evidence source and distinguishes measured, inferred, pending, and unknown values.
- A tool observation or model completion alone never means “delivered.”
- Missing cost, token, acceptance, or follow-up evidence stays unknown; it is never changed to zero.
- The display does not change Jev’s branch, confidence, or review gate.
- Tests cover empty, in-progress, complete, failed, and incomplete-evidence states.

### 2. Typed-decision trust panel

Refine the existing output so users can inspect the authoritative typed choice and review gate before reading the separate explanation.

**Acceptance criteria**

- The UI shows branch, probabilities, confidence, threshold, urgency, and human-review status from the typed decision.
- The narrative is labeled explanatory and cannot change or override those fields.
- Low confidence or an explicit review signal always requires human review.
- Tests cover both review conditions and malformed provider responses.

### 3. Passive delivery outcome measurement

Connect trusted acceptance/delivery/cost/follow-up evidence to the existing evaluator. Keep observation separate from causal evaluation.

**Acceptance criteria**

- No self-report or feedback session is required.
- The policy is fixed before comparison; all enrolled slices, including incomplete ones, remain represented.
- Total cost/token use and verified delivery time are reported alongside rework, defects, and interruptions.
- Scope changes and incomplete follow-up block a positive result.
- Reports describe association only; no automatic promotion or causal claim is made.

## Unresolved questions

1. Which Copilot SDK events can provide reliable token usage, task start, verified acceptance, delivery, and follow-up defect data?
2. Can these facts be gathered passively without retaining prompts, source text, raw paths, credentials, or more session data than necessary?
3. What definition of “faster delivery” should be used: commitment-to-verified-delivery elapsed time, active work time, or both?
4. Which token measure is available and comparable across provider calls and retry paths? Should the dashboard show tokens, spend, or both?
5. What thresholds and follow-up period define “no material regression” for a given task class?
6. Which social posts or platform reports, if any, can verify the 100,000-view/share virality threshold? This research found no suitable first-party metrics.
7. What Copilot host ordering guarantees apply to multiple hooks or extensions? Claude Code’s registration-order continuation model cannot answer this.

## Sources and verification limits

### Primary sources

- [Claude Code issue #91870](https://github.com/anthropics/claude-code/issues/91870) — proposal, terminology update, early source, and launch discussion.
- [Claude Code v2.1.287 release](https://github.com/anthropics/claude-code/releases/tag/v2.1.287) — release entry for Claude Mods.
- [Claude Code built-in mods README](https://github.com/anthropics/claude-code/blob/main/mods/README.md) — module shape, built-in examples, testing notes, and early-access/API-change warning.
- First-party examples: [`diff`](https://github.com/anthropics/claude-code/tree/main/mods/diff), [`sec-default`](https://github.com/anthropics/claude-code/tree/main/mods/sec-default), [`telemetry`](https://github.com/anthropics/claude-code/tree/main/mods/telemetry), and [`agents-md`](https://github.com/anthropics/claude-code/tree/main/mods/agents-md).
- [Claude Code plugin README](https://github.com/anthropics/claude-code/blob/main/plugins/README.md) — plugin contents and distribution model.
- [Anthropic Claude Code playground mods](https://github.com/anthropics/claude-code-playground/tree/main/claude-code/mods) — example mods and demos.
- Community implementation evidence: [hamzafer/claude-code-mods](https://github.com/hamzafer/claude-code-mods), [scasella/claude-flightdeck](https://github.com/scasella/claude-flightdeck), and [mertkayacs/ultramod](https://github.com/mertkayacs/ultramod).
- [Claude Code hooks documentation](https://code.claude.com/docs/en/hooks) — first-party reference for the separate configured-hooks surface.

### Limits

The GitHub source, releases, READMEs, and dated commit metadata were available. Anthropic’s documentation site could not be directly retrieved in this research session. Community README claims are treated as descriptions/demos, not independent validation. No verified data was found for installs, active users, repeated use, measured delivery outcomes, or social reach above 100,000 views/shares. The October 1–11 window is short and cannot establish a durable trend.
