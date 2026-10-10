# Enterprise AI tokenomics and FinOps

**Research checked:** 2026-10-10  
**Scope:** Enterprise inference and agent workflows across software delivery, internal assistants, and customer-facing applications. General enterprise practice; training, fine-tuning, subscriptions, and embedded SaaS remain separate portfolios.

## Bottom line

Manage enterprise AI by **cost per accepted business outcome**, supported by request-level metering and financial reconciliation. Cheap tokens do not necessarily produce cheap outcomes.

This report records the general research delivered in the conversation. It starts independently of the earlier cryptocurrency report and excludes cryptocurrency. Microsoft is covered mainly through Azure OpenAI; Microsoft's broader enterprise portfolio requires separate research.

## Evidence and limits

Primary SDKs, API specifications, Microsoft documentation source, and FinOps specifications were inspected. Direct pricing-site retrieval failed. There is no verified live-price ranking, negotiated enterprise rate comparison, measured enterprise ROI, or account-specific compliance conclusion.

SDK fields establish accounting structure, not monetary rates. Repository documentation establishes documented mechanics, not every deployed configuration. Moving-branch sources below were inspected on the research date; they can change. FOCUS cost definitions are pinned to v1.2, without claiming that version is latest.

No enterprise invoices, contracts, payment records, representative workload benchmarks, or independently verified business outcomes were available. Equations, operating recommendations, and numerical scenarios below are analysis, not observed enterprise results.

## 1. Executive findings

1. **Usage fields differ across providers.** Reasoning, cached input, and cache writes can be subsets, separate quantities, or additional pricing meters. Normalize only after verifying the provider/model/API semantics. [P1–P6]
2. **Usage is not an invoice.** API counters do not establish complete charges for tools, storage, capacity, credits, or commitments. [P1–P9]
3. **Capacity shifts risk to utilization.** Azure's documented provisioned deployment remains billable while idle, and reservations do not themselves guarantee deployable capacity. [P8]
4. **Count the whole agent workflow.** Retries, repeated context, tools, verification, and abandoned attempts belong in attributable cost. This is a recommended accounting boundary.
5. **Do not equate alerts with enforcement.** Budget behavior remains provider/account-specific and was not directly verified here.
6. **Do not equate time freed with cash saved.** Business value needs verified outcomes, a defensible baseline, and evidence of realized benefit.

Three economic layers must remain separate:

| Layer | Measure |
|---|---|
| Request cost | Charges associated with an individual inference request |
| Operating cost | Requests plus infrastructure, tools, evaluation, people, security, and support |
| Outcome cost | Complete attributable expenditure divided by independently accepted results |

## 2. Billing comparison

“Inspected” means primary text was read. Pricing and contractual gaps are explicit.

| Provider | Inspected mechanics | Limits |
|---|---|---|
| OpenAI | Input/output totals and cache details. Reasoning and rejected prediction tokens are included in completion billing totals. [P1–P2] | Do not add reasoning to inclusive output again. Current cache-write, modality, tool, and storage rates were not verified. |
| Anthropic | Cache-creation/read counters and cache-duration details. Output total is explicitly inclusive and authoritative for billing; reasoning is a breakdown. Server-tool counters are separate. [P3–P4] | Exact input-bucket reconciliation, rates, and failed-request billing need confirmation. |
| Azure OpenAI | Standard caching and provisioned-capacity billing differ. Cache-write treatment varies by model family/deployment. Batch cancellation charges completed work. [P7–P8] | Cache savings do not eliminate capacity charges. Specify model, region, deployment, and contract. |
| AWS Bedrock | Runtime types expose input/output/total usage and cache counters. [P5] | Hosted-model billing semantics and rates remain unverified. Do not transplant direct-provider rules. |
| Google Vertex AI | Prompt count includes cached content. Candidate and thought counts are separate. Cache resources include expiration information. [P6] | The schema alone does not establish complete billed-output reconciliation or tool/cache tariffs. |

### Metering rules

- **Reasoning:** use the authoritative billed output total once. Visible answer length can understate billed generation. [P1, P3]
- **Caching:** determine whether writes replace normal input billing or add a surcharge. A write counter alone does not establish this.
- **Multimodal:** preserve model-specific image, audio, video, and text units. Do not charge both an aggregate and its component breakdowns.
- **Batch:** use verified batch rates only for eligible work. Azure documents a 24-hour target, not guaranteed completion. [P7]
- **Tools:** separate model-generated tool arguments, hosted-tool fees, and external-service charges. Anthropic exposes server-tool counters separately. [P4]
- **Failures:** missing usage after a timeout is not proof of zero charge. Verify cancellation and failed-request treatment against provider terms.

Azure documentation inspected for this research distinguishes cache-write behavior by model family, including newer families. Treat this as a dated, deployment-specific rule—not a universal Azure or OpenAI rule. [P7]

## 3. Cost model

For request j:

**Request cost = sum of verified meter quantity × corresponding rate + tools + storage + other charges.**

Use disjoint billable meters, not every available usage field. Each rate needs provider, model/version, region, deployment, tier, modality, context band where applicable, effective date, currency, and contract.

For rates per million tokens, divide token quantities by one million. Storage in token-hours cannot be substituted for storage in GB-days. Cache writes must be classified as replacement meters or surcharges before calculation.

**Cost per accepted outcome = (all attempt costs + supporting services + allocated capacity/shared costs + review/rework) / independently accepted outcomes.**

Include failed and abandoned tasks within the defined cohort. If there are no accepted outcomes, report that explicitly; do not manufacture a unit-cost value.

### Financial views

| View | Purpose |
|---|---|
| Marginal | Cost caused by one additional unit of work |
| Fully loaded | Cost including allocated platform, labor, and support |
| Cash | Actual payments/refunds and their timing |
| Billed | Invoice-based charges for the billing period |
| Effective/amortized | Cost distributed to periods and usage it covers |

FOCUS v1.2 distinguishes BilledCost from EffectiveCost. Effective cost includes applicable amortized commitments and can differ from invoice totals within a period. Original covering purchases have zero effective cost to prevent double counting. Billed cost does not prove cash was paid. [P9]

**Preserve used and unused commitments.** Report idle capacity as an explicit cost pool with an accountable owner. Include it in portfolio economics and disclose its allocation method in outcome costs.

### Deployment economics

| Option | Potential advantage | Main exposure |
|---|---|---|
| Metered API | Variable expenditure and limited infrastructure ownership | Growth, retries, rates, provider dependence |
| Provisioned service | Attractive unit cost at sustained demand | Idle capacity, commitments, headroom, spillover |
| Self-hosted | Infrastructure and serving control | Hardware/rent, labor, utilization, licensing, reliability |

Compare only after meeting equivalent acceptance, security, availability, recovery, and latency requirements. An open-weight model is not automatically an equivalent substitute.

For fixed monthly cost F, sustainable monthly capacity Q, productive utilization u, and variable unit cost v:

- Capacity unit cost = F / (u × Q) + v.
- Break-even utilization = F / [Q × (API unit cost − v)].

There is no attainable break-even if API unit cost is no greater than v, or required utilization exceeds the service-safe operating range. Measure Q using the actual workload and service requirements, not peak GPU throughput.

Owned infrastructure includes depreciation, power, facilities, labor, security, and support. Rented infrastructure uses rent instead of depreciation for those assets. Do not count both. Include redundancy and operational headroom.

## 4. FinOps operating model

The following is a recommended design, not observed enterprise practice or a universal standard.

| Owner | Responsibility |
|---|---|
| Business/product | Accepted outcomes and investment decisions |
| AI platform engineering | Metering, attribution, routing, consumption controls |
| FinOps | Allocation, forecasts, reconciliation, unit economics |
| Finance/controller | Accounting basis, financial close, payments, credits |
| Procurement | Commitments, licenses, renewal, portability, exit terms |
| Security/privacy/legal | Data and contractual eligibility |
| SRE/platform | Capacity, availability, failover, emergency containment |

Suggested cadence: continuous controls, daily provisional review, monthly financial close, and quarterly portfolio/commitment review. The Foundation describes collaboration across finance, engineering, FinOps, and business owners for allocation and forecasting. [P10]

### Attribution and reconciliation

Maintain linked records:

1. **Financial:** provider, issuer, invoice, currency, period, service, SKU, region, discounts, commitments, credits.
2. **Operational:** application, owner, environment, task, request, attempt, model, tools, status, usage, acceptance, rework.

Task/attempt identifiers are recommended application metadata, not assumed invoice fields. Preserve raw records before normalization and restrict access to sensitive tenant or user identifiers.

At close:

- Match issuer, currency, period, and data grain.
- Translate raw counters into provider-specific pricing meters.
- Apply contractual rates and adjustments once.
- Include supporting services and unused commitments.
- Prevent prepaid purchases and covered usage from being counted twice.
- Retain unexplained differences in an exception ledger.
- Document shared-cost allocation and centrally funded costs.

FOCUS supports financial normalization; it does not prove complete exports or business attribution. Verify each provider's actual delivered schema and conformance. [P9]

### Controls

Use alerts alongside recommended admission controls:

- Permitted models and serving routes.
- Input/output, attempts, tools, duration, concurrency limits.
- Retry budgets and loop detection.
- Centrally controlled credentials and restricted bypass paths.
- Circuit breakers and safe fallback.
- Estimated cost reservation before dispatch, then settlement.

A planning approximation:

**Overspend exposure ≈ burn rate × enforcement lag + remaining in-flight cost + already incurred unreported cost.**

Keep these terms non-overlapping. Cancellation need not reverse costs already incurred.

AWS, Azure, Google, and OpenAI budget documentation was discovered but not directly inspected. No universal hard-cap feature is certified here. [D1]

## 5. Scenario analysis and procurement

### Synthetic examples: not provider prices

Assume 10,000 input and 2,000 inclusive output tokens per request. Illustrative USD rates are $2/million input and $8/million output:

- One request: $0.036.
- Four requests per task: $0.144.
- At 80% task acceptance: $0.18 per accepted task.

These exclude tools, verification, labor, and shared costs.

Separate capacity assumptions: F = $6,000/month; Q = 1,000,000 equivalent tasks/month; v = $0.002/task; API alternative = $0.012/task.

- Break-even utilization: 60%.
- At 20% utilization: $0.032/task.
- At 80% utilization: $0.0095/task.

These conclusions require equivalent acceptance and service levels and complete fixed-cost accounting.

### Stress cases

| Change | Examine |
|---|---|
| Demand doubles | Capacity, rate limits, tools, acceptance |
| Cache reuse falls | Input cost and latency |
| Errors increase | Retry/fallback amplification |
| Model migrates | Idle commitments and validation |
| Credits expire | Cash growth without usage growth |
| Region becomes ineligible | Alternative route, latency, cost |
| Supplier fails | Failover, duplicate capacity, recovery |
| Review increases | Fully loaded outcome cost |

Before commitments, distinguish price discounts from capacity entitlement. Review model/region restrictions, overages, cancellation, transfer rights, minimum spend, expiry, and exit costs. Azure's documented reservation/capacity distinction is a concrete example. [P8]

## 6. Outcome scorecard and constraints

| Workload | Accepted outcome | Guardrails |
|---|---|---|
| Software delivery | Independently verified accepted change with defined follow-up | Review, defects, rollback, security |
| Internal assistant | Correctly completed business task | Corrections, factual accuracy, access compliance |
| Customer-facing | Eligible resolution/transaction meeting acceptance criteria | Recontact, escalation, refunds, harmful responses |

Report together:

- Total expenditure and cost per accepted outcome.
- Acceptance and first-pass acceptance.
- End-to-end latency, including review.
- Reliability and recovery.
- Rework and downstream defects.
- Allocation and reconciliation coverage.

Keep time freed, capacity redeployed, cash savings, and incremental margin separate. Do not count the same benefit twice.

Fix the task boundary, baseline, observation period, and acceptance before comparisons. Without credible causal evidence, label results as association, not proven ROI.

Before choosing a cheaper option, verify data classification, processing/storage locations, retention across logs/caches/tools, deletion, access controls, licensing, subprocessors, and audit rights. Public claims do not establish account-specific eligibility. Provider data-control pages were not directly inspected in this general research. [D2]

Training/fine-tuning, employee subscriptions, and embedded SaaS need separate cost and acceptance measures; do not force them into per-token accounting.

## Source register

All inspected sources below were checked on 2026-10-10. Publication dates are not established unless noted. Repository main/master links can change.

| ID | Primary source and evidence |
|---|---|
| P1 | [OpenAI completion usage](https://github.com/openai/openai-python/blob/main/src/openai/types/completion_usage.py): inspected; inclusive reasoning/rejected-prediction billing and usage breakdowns. |
| P2 | [OpenAI Responses usage](https://github.com/openai/openai-python/blob/main/src/openai/types/responses/response_usage.py): inspected; input/output and cache/reasoning counters, not prices. |
| P3 | [Anthropic usage](https://github.com/anthropics/anthropic-sdk-python/blob/main/src/anthropic/types/usage.py): inspected; authoritative inclusive output, cache counters. |
| P4 | Anthropic [cache creation](https://github.com/anthropics/anthropic-sdk-python/blob/main/src/anthropic/types/cache_creation.py) and [server tools](https://github.com/anthropics/anthropic-sdk-python/blob/main/src/anthropic/types/server_tool_usage.py): inspected; duration and tool counters, not tariffs. |
| P5 | [AWS Bedrock runtime types](https://github.com/aws/aws-sdk-go-v2/blob/main/service/bedrockruntime/types/types.go): inspected TokenUsage; model-specific pricing remains unverified. |
| P6 | Vertex [prediction API](https://github.com/googleapis/googleapis/blob/master/google/cloud/aiplatform/v1/prediction_service.proto) and [cache API](https://github.com/googleapis/googleapis/blob/master/google/cloud/aiplatform/v1/cached_content.proto): inspected; counts, modality details, traffic type, cache expiry. |
| P7 | Azure [caching](https://github.com/MicrosoftDocs/azure-ai-docs/blob/main/articles/foundry/openai/includes/how-to-prompt-caching-content.md) and [batch](https://github.com/MicrosoftDocs/azure-ai-docs/blob/main/articles/foundry/openai/includes/how-to-batch-content.md): inspected; document dates 2026-08-11 and 2026-08-14 respectively. |
| P8 | [Azure provisioned billing](https://github.com/MicrosoftDocs/azure-ai-docs/blob/main/articles/foundry/openai/includes/how-to-provisioned-throughput-billing.md): inspected; document dated 2026-05-25; capacity billing, idle deployment, reservations. |
| P9 | FOCUS v1.2 [BilledCost](https://github.com/FinOps-Open-Cost-and-Usage-Spec/FOCUS_Spec/blob/v1.2/specification/columns/billedcost.md) and [EffectiveCost](https://github.com/FinOps-Open-Cost-and-Usage-Spec/FOCUS_Spec/blob/v1.2/specification/columns/effectivecost.md): inspected pinned definitions, including used/unused commitments. |
| P10 | FinOps Foundation [allocation](https://github.com/finopsfoundation/framework/blob/main/_capabilities/cost-allocation.md) and [forecasting](https://github.com/finopsfoundation/framework/blob/main/_capabilities/forecasting.md): inspected responsibilities and collaborative forecasting. |
| D1 | Search/discovery only: [AWS budgets](https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html), [Azure budgets](https://learn.microsoft.com/en-us/azure/cost-management-billing/costs/tutorial-acm-create-budgets), [Google budgets](https://cloud.google.com/billing/docs/how-to/budgets), [OpenAI spend limits](https://developers.openai.com/api/docs/guides/spend-limits). Not evidence of universal enforcement behavior. |
| D2 | [OpenAI data controls](https://developers.openai.com/api/docs/guides/your-data): discovered, not inspected; account/endpoint retention and eligibility remain verification tasks. |

### Pricing sources attempted, not inspected

- [OpenAI pricing](https://openai.com/api/pricing/)
- [Anthropic pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- [Azure OpenAI pricing](https://azure.microsoft.com/pricing/details/cognitive-services/openai-service/)
- [Bedrock pricing](https://aws.amazon.com/bedrock/pricing/)
- [Vertex pricing](https://cloud.google.com/vertex-ai/generative-ai/pricing)

### Outstanding evidence

Dated rate cards; negotiated contracts; failed/filtered/disconnected-request billing; exact cache-write reconciliation; modality/tool tariffs; discount stacking; provider capacity commitments and spillover; real invoice reconciliation; representative self-hosting benchmarks; independently measured outcomes.

This is an accounting and operating-model foundation, not a completed live-price comparison or a defensible cheapest-provider ranking.
