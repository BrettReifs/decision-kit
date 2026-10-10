# Microsoft AI Decision-1: research and evaluation guide

**Checked:** 2026-10-10  
**Status:** Model-specific capabilities remain unverified in this session.

## Summary

The user identified two primary sources for this investigation:
[Microsoft Command Line: Microsoft-Decision-1](https://commandline.microsoft.com/microsoft-decision-1-model-foundry/)
and the [Microsoft Foundry catalog entry](https://ai.azure.com/catalog/models/Microsoft-Decision-1).
I tried to retrieve both pages, along with Microsoft Learn, Azure AI Foundry,
Tech Community, and Microsoft GitHub sources. The requests failed at hostname
resolution. I could not inspect the source text or follow its links.

This is an access limit, not evidence that the model or the pages do not exist.
It also means I cannot give a source-backed account of the model's capabilities
or say when the model itself should be used. I will not infer those details
from the name, a search snippet, or a third-party summary.

## What is and is not established

| Question | Research result |
|---|---|
| Which model is under review? | The user-provided source URLs identify it as **Microsoft-Decision-1**. I could not independently inspect those pages. |
| What task does it perform? | Unknown from accessible first-party evidence. |
| What are its inputs and outputs? | Unknown. No schema or API example was retrieved. |
| What does any score or confidence mean? | Unknown. Do not treat an undocumented score as a calibrated probability. |
| What deployments, regions, versions, or prices are available? | Unknown. The Foundry catalog page was not retrievable. |
| What are its benchmarks, limits, and intended or unsuitable uses? | Unknown. No readable model card, evaluation report, or use guidance was retrieved. |

Direct fetches of the two user-provided URLs returned hostname-resolution errors:
[announcement](https://commandline.microsoft.com/microsoft-decision-1-model-foundry/)
and [catalog](https://ai.azure.com/catalog/models/Microsoft-Decision-1).
The same failure affected attempted Microsoft documentation and announcement
pages. A failed fetch does not show that a page is absent. It only prevents
verification in this session.

## How to decide whether to use it

The following is a **general due-diligence checklist**, not a claim about
Microsoft's guidance for Decision-1. Do not select it for a production or
consequential decision until first-party docs answer these questions:

1. **Task fit:** Does the documented task match the real decision? Is it
   classification, ranking, scoring, generation, or another task?
2. **Contract:** What exact fields can be sent? What exact fields come back?
   What happens on missing, malformed, or out-of-scope inputs?
3. **Output meaning:** Are outputs labels, rankings, scores, or probabilities?
   Are scores calibrated for the target population and decision threshold?
   Is abstention supported?
4. **Operating limits:** What input/context limits, languages, throughput,
   latency, rate limits, and version behavior are documented?
5. **Service fit:** Which Foundry deployment path, regions, authentication,
   pricing, data handling, and service lifecycle apply?
6. **Risk controls:** What safety, privacy, monitoring, and human-review
   guidance applies? Which uses are unsupported or prohibited?
7. **Evidence:** What datasets, baselines, metrics, sample sizes, uncertainty,
   and contamination controls support any quality or speed claims? Are the
   tests relevant to the intended use?

After these points are documented, evaluate the model against the current
baseline on representative, held-out cases. Measure decision quality, failure
types, latency, and total cost. Set human-review and fallback rules before
deployment. These are recommended evaluation steps, not verified Decision-1
features.

## Similar Microsoft work; not evidence about Decision-1

- The [Microsoft AI Decision Framework repository](https://github.com/microsoft/Microsoft-AI-Decision-Framework)
  presents a guide for choosing Microsoft AI technologies. Its README describes
  a technology-selection framework, not a model.
- Microsoft Research describes [Project Causica](https://www.microsoft.com/en-us/research/project/project_azua/)
  as work on decision optimization with causal machine learning, including
  intervention and counterfactual prediction. It links to the
  [`microsoft/causica` codebase](https://github.com/microsoft/causica). This is a
  separate research project; it does not establish Decision-1 capabilities.
- Microsoft Research's [“A Causal AI Suite for Decision-Making”](https://www.microsoft.com/en-us/research/publication/a-causal-ai-suite-for-decision-making/)
  describes open-source causal tools and libraries. The page gives a publication
  date of November 22, 2022, and an update date of August 17, 2023. It does not
  establish a model named Decision-1.

## Relevance to Decision Kit

The [Decision Kit README](../../README.md) says Jev selects the typed branch and
exposes probabilities; a separate chat model explains the bounded result and
must not change the branch or confidence gate. It also documents a `0.72`
confidence threshold and a human-review signal. Until Decision-1's task,
interface, and output semantics are verified, there is no sound basis to replace
Jev or treat Decision-1 as equivalent.

If the first-party docs support a relevant Decision-1 task, test it beside the
existing Jev path before considering a change. Compare on the same held-out
scenarios. Measure decision quality, cost, latency, and regressions in other
outcomes; preserve explicit human review for uncertain or out-of-scope cases.
The README's delivery evaluation guidance also warns that an observed
improvement is association, not proof of causation.

## Sources and limits

The Microsoft Research Causica and publication pages, the Microsoft AI Decision
Framework repository page, and the local Decision Kit README were readable in
the earlier research pass. The central Microsoft-Decision-1 announcement and
catalog contents were not readable in this session. The model-specific
questions above therefore remain open; recheck the supplied first-party pages
before using this note to make a selection or deployment decision.
