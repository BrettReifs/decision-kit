# AI harness antipatterns to avoid

**Research date:** 2026-10-11

## Summary

An AI harness is the code around a model that manages tools, context, permissions, retries, and evaluation. Its purpose should be to support verified delivery, not to increase agent activity.

The findings below separate documented behavior, empirical results, and recommendations. Most evidence comes from the official OpenAI Agents SDK documentation and examples. These describe that SDK; they are not guarantees about every harness. Recommendations are analysis, not measured improvements to Decision Kit.

## Antipatterns

| Antipattern | Evidence | Recommended boundary |
|---|---|---|
| **Model orchestration for predictable work** | OpenAI describes code-led orchestration as more predictable in speed, cost, and performance. Its parallelization guidance applies to independent tasks. [P1] | Keep known prerequisites and routing in code. Use model discretion where the decision is genuinely open-ended. This is engineering guidance, not proof that simpler orchestration always wins. |
| **Delegation without clear ownership** | The SDK distinguishes agents used as tools, where the manager retains control, from handoffs, where another agent becomes active. [P1] | Specify who owns the final result and whether delegation transfers control or only performs a bounded task. |
| **Assuming parallel agents are isolated** | Nested agents used as tools share application context rather than receiving isolated application-state copies by default. [P2] | Verify state-sharing behavior. Use isolated worker state and controlled merges when workers must be independent. Conflict risk is an inference from these semantics, not a measured failure rate. |
| **Unlimited history or blind summarization** | Runtime context is not automatically sent to the model. Relevant data can be exposed through tools or retrieval. Resent conversation history increases subsequent input-token usage; an official example demonstrates automatic compaction. [P2–P4] | Select relevant evidence. Test that compaction preserves constraints, identifiers, pending work, and evidence references. These sources do not establish an optimal context size or quantify context degradation. |
| **Prompts treated as permission controls** | SDK input guardrails run for the first agent and output guardrails for the final-output agent. Tool guardrails have separate coverage. Tool visibility does not authorize model-generated arguments or resource access. [P2, P5] | Enforce authorization at the protected operation. Check coverage for each tool and delegation surface; a prompt is not an access-control boundary. |
| **Safety checks that finish after side effects** | Parallel input guardrails can let the agent execute tools before cancellation. Blocking mode completes input validation before agent execution. [P5] | Complete required checks before consequential actions. Cancellation is not rollback, and correct ordering does not prove that the checker detects every unsafe request. |
| **Approval for everything, or approval that lasts too broadly** | Approvals can be conditional per call. Sticky approval applies to future calls of the same tool identity within the run. Deserialized approval state does not authenticate reviewers or snapshots. [P6] | Gate by risk and arguments. Keep reusable approvals narrow. Store approval state on the server and authorize each transition. Reduced friction is a recommendation, not a measured approval-fatigue result. |
| **“Retry until the judge passes”** | An official judge example uses an outer loop with an explicit round cap only in automatic-demo mode. A bounded agent call does not itself bound that outer loop. [P7] | Bound the whole workflow by attempts, wall time, spend, and lack of progress. Return an explicit incomplete outcome when a limit fires. This is source inspection, not a documented runaway incident. |
| **Convincing narration or one successful run counted as dependable success** | Original τ-bench evaluates resulting database state and required outputs. Its historical airline results report GPT-4o tool calling at Pass¹ 0.420 versus Pass⁴ 0.200. [P8–P9] | Verify state changes and acceptance independently. Test repeated-run consistency. Pass⁴ concerns success across four attempts, not fourth-attempt accuracy. Historical models, simulated users, and now-outdated tasks do not establish present-day or Decision Kit performance. |
| **Raw traces treated as harmless and complete accounting** | SDK usage is per run, and adapter reporting can be incomplete. Traces can capture model and tool inputs and outputs. The official redaction example warns that registering a separate processor leaves the default exporter active. [P3, P10–P11] | Minimize retained data and verify export paths. Account for all attempts, delegates, tools, verification, and infrastructure within the chosen cost boundary. Missing usage is unknown, not zero; token totals alone are not total delivery cost. |

## Relevance to Decision Kit

These are project-specific conclusions from the existing implementation and documentation, not results of a live experiment:

- **Keep observation passive.** The delivery hook requires no self-report, feedback form, model call, or API key. It issues at most one advisory reminder per session. Do not turn an advisory signal into mandatory status sessions. Preserve approval requirements for consequential actions. [R1]
- **Keep heuristics uncertain.** Repeated spacing or corner-radius edits can indicate a possible polish loop. They do not prove wasted work or completion. Necessary usability and accessibility work remains in scope. [R1–R2]
- **Keep typed decisions and explanations separate.** Jev selects the branch and review gate. LLM narration must not silently replace them. This boundary does not, by itself, prove that a selected branch is correct or that its confidence is calibrated. [R3]
- **Measure delivery, not activity.** Nudge counts do not prove receipt, compliance, attention saved, or better outcomes. Keep unknown metrics as `null`, include incomplete slices, and check cost, elapsed time, quality, and interruptions separately. [R4–R5]
- **Do not claim causation from descriptive comparisons.** The current evaluator reports association and never authorizes automatic promotion. Randomized experiments and uncertainty analysis remain future evidence requirements. [R4–R5]

The current design already respects several of these boundaries. The main evidence gap is passive measurement of real delivery outcomes, not a demonstrated need for more agents, tools, or model calls. [R4]

## Evidence limits

- Primary documentation and source were inspected during the conversation research. This report records those findings; it adds no workload benchmark or live-host test.
- The evidence set is SDK-heavy. Direct retrieval of additional engineering posts and paper pages failed; unverified search summaries were excluded.
- Sources on moving `main` branches can change. The research date does not make these links immutable.
- Recommendations do not establish prompt-injection resistance, calibrated confidence, lower cost, faster delivery, or no quality regression.
- No source establishes that Decision Kit's nudge causes less waste or better delivered value.

## Primary sources

- **P1:** [OpenAI Agents SDK: multi-agent orchestration](https://github.com/openai/openai-agents-python/blob/main/docs/multi_agent.md)
- **P2:** [OpenAI Agents SDK: local and model context](https://github.com/openai/openai-agents-python/blob/main/docs/context.md)
- **P3:** [OpenAI Agents SDK: usage accounting](https://github.com/openai/openai-agents-python/blob/main/docs/usage.md)
- **P4:** [OpenAI: compaction session example](https://github.com/openai/openai-agents-python/blob/main/examples/memory/compaction_session_example.py)
- **P5:** [OpenAI Agents SDK: guardrail coverage and execution modes](https://github.com/openai/openai-agents-python/blob/main/docs/guardrails.md)
- **P6:** [OpenAI Agents SDK: approvals and server-owned state](https://github.com/openai/openai-agents-python/blob/main/docs/human_in_the_loop.md)
- **P7:** [OpenAI: LLM-as-a-judge loop example](https://github.com/openai/openai-agents-python/blob/main/examples/agent_patterns/llm_as_a_judge.py)
- **P8:** [Original τ-bench repository and airline results](https://github.com/sierra-research/tau-bench#airline)
- **P9:** [Original τ-bench outcome evaluator](https://github.com/sierra-research/tau-bench/blob/main/tau_bench/envs/base.py)
- **P10:** [OpenAI Agents SDK: tracing](https://github.com/openai/openai-agents-python/blob/main/docs/tracing.md)
- **P11:** [OpenAI: trace-redaction example](https://github.com/openai/openai-agents-python/blob/main/examples/basic/trace_redaction.py)

## Repository evidence

- **R1:** `/home/runner/work/decision-kit/decision-kit/README.md:58-97`
- **R2:** `/home/runner/work/decision-kit/decision-kit/.github/extensions/decision-kit/delivery.mjs:4-10`
- **R3:** `/home/runner/work/decision-kit/decision-kit/README.md:21-27`
- **R4:** `/home/runner/work/decision-kit/decision-kit/README.md:125-157`
- **R5:** `/home/runner/work/decision-kit/decision-kit/.github/extensions/decision-kit/delivery-evaluation.mjs:40-96`
