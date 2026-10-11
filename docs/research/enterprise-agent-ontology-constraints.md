# Enterprise agent projects: ontology-based classification and constraints

**Research baseline: 2026-10-11.** This report captures the completed research
on classifying agentic projects in enterprise information technology and
deciding their constraints through ontology-based templates. It does not
implement a classifier, adopt requirements, change the glossary, or authorize
execution.

## Executive conclusion

Use ontology files as **versioned, evidence-backed decision templates**, not
as permission files or proof of safety. Classify bounded workflows and their
actual capabilities, rather than product labels such as “copilot” or
“autonomous agent.”

Separate six functions:

1. **Meaning:** identify systems, data, actors, actions, and relationships.
2. **Classification:** identify the workflow's risks and applicable obligations.
3. **Validation:** check the supplied assessment against explicit requirements.
4. **Authorization:** decide whether an actor may perform a specific action.
5. **Enforcement:** prevent actions outside that authorization.
6. **Verification:** establish what executed and whether it met the outcome.

These functions require different evidence. An ontology-valid record does not
prove effective controls. A policy decision does not prove enforcement. Agent
completion text does not prove successful delivery. The distinction follows
the SHACL validation model, OPA's decision/enforcement separation, and
Microsoft's behavior-contract and control guidance. [S01, S02, S03]

## Evidence and access limits

- **Directly inspected primary sources:** W3C working-group source files,
  OPA documentation source, OWASP documentation and regression-harness source,
  and Microsoft architecture documentation source.
- **Located, not fully inspected:** NIST publication references and some final
  standards website pages. Direct website requests repeatedly failed DNS.
- **Recommendations:** the proposed record layout, classification dimensions,
  constraint gates, and evaluation design below are a synthesis. They are not
  requirements imposed by W3C, NIST, OWASP, or Microsoft.
- **No effectiveness claim:** documentation inspection is not a deployment
  evaluation, security certification, or jurisdiction-specific legal review.
- **Version limits:** the pinned SHACL working-group source predates the
  July 2017 Recommendation. Byte-identical correspondence was not established.
  First-party source branches can change; production templates need pinned
  versions and compatibility tests.

## 1. Classify workflows and actual capabilities

Use this assessment boundary:

**Project → deployment → bounded workflow → capability → concrete action**

An IT service-management product can contain three distinct workflows:
reading incidents, drafting change requests, and restarting production
services. Approval of the first does not grant authority for the third.
Microsoft recommends bounded behavior contracts and separate contracts when
actors, authority, evidence requirements, or acceptable outcomes materially
change. [S01]

### Proposed classification dimensions

| Dimension | Information to record |
|---|---|
| Purpose and affected people | Required outcome, users, affected groups, and business consequences |
| Need for agency | Why dynamic planning is needed instead of a fixed workflow |
| Data | Sensitivity, personal data, secrets, source access, retention, location, and recipients |
| Action authority | Retrieval, disclosure, communication, writing, code execution, access administration, and delegation |
| Environment | Development, test, production, asset criticality, and external reach |
| Autonomy | Suggestions, action-specific approval, bounded execution, duration, and stop conditions |
| Identity | Workload principal, initiating user, delegation, audience, scope, and expiry |
| Input trust | User input, tickets, documents, tools, memory, and other agents |
| Tool surface | Registered tools, operations, parameters, endpoints, and versions |
| Persistence and egress | Memory, logs, artifacts, destinations, retention, and isolation |
| Consequences | Confidentiality, integrity, availability, financial, and human impacts |
| Recovery | Reversibility, recovery time, and affected scope |
| Evidence | Source, collector, authority, timestamps, coverage, conflicts, and freshness |
| Operational controls | Enforcement location, approvals, budgets, emergency stop, and owner |
| Dependencies | Model, prompt, connector, topology, ontology, shapes, and policy versions |

Keep this vector visible even if a summary tier is needed for routing.
Do not use a compensatory score that lets lower cost offset unauthorized
access. “Read-only” does not mean low risk: disclosure can be irreversible.
OWASP's excessive-agency guidance identifies excessive functionality,
permissions, and autonomy as distinct causes of damaging action. [S04]

## 2. Separate the ontology-related artifacts

“Ontological files” should refer to distinct artifacts with clear roles.
Do not mix concepts, observations, policies, and prompt instructions into one
file and assume it is an executable security boundary.

| Artifact | Suitable representation | Boundary |
|---|---|---|
| Controlled terms | SKOS | Categories and labels do not grant access |
| Concepts and relationships | RDF/RDFS; OWL when formal reasoning has clear value | Missing knowledge is not automatically false |
| Assessment validation | SHACL | Conformance applies to the supplied graph |
| Evidence lineage | PROV-O | Origin and responsibility claims do not prove authenticity |
| Rights and obligations | ODRL where policy exchange is useful | Policy expression does not prevent an operation |
| Executable authorization | Existing IAM and policy engines such as OPA | A separate enforcement point must apply decisions |
| Human guidance | Markdown | Explanation is not runtime enforcement |

The standards have complementary purposes. Start with controlled terms,
explicit relationships, assessment shapes, and policy bindings. Add complex
OWL reasoning only when it solves a demonstrated problem. [S03, S06–S10]

### Technical limits

- **OWL is open-world reasoning.** A missing approval statement is not evidence
  that approval is unnecessary. Logical cardinality is not a substitute for
  required-field validation. [S09]
- **SHACL produces validation reports.** Applications must decide how to act
  on those reports; SHACL does not authorize tool execution. [S03]
- **SHACL entailment is optional.** It can be precomputed or supplied during
  processing. An unsupported declared entailment regime must produce failure.
  Pin the behavior instead of assuming all processors infer the same facts.
  [S03, section “Relationship between SHACL and RDFS inferencing”]
- **SHACL defaults do not create evidence.** `sh:defaultValue` is not a rule
  that establishes missing approval, ownership, or classification facts.
  [S03, section “Default Value”]
- **PROV describes lineage and responsibility.** Trusted collection and
  integrity checks remain necessary. A delegation description is not an
  executable grant. [S07]
- **ODRL expresses permissions, prohibitions, duties, and obligations.**
  Interpretation and enforcement need implementation. [S08]
- **OPA is a policy decision point; the harness is an enforcement point.**
  Its tool-calling guidance evaluates structured tool names and parameters.
  The sample empty-deny-set design is not a complete production default-deny
  policy. [S02]

## 3. Decide hard constraints before comparing benefits

### Proposed hard gates

Where applicable, do not proceed with the affected action when there is:

- Unauthorized data, resource, tenant, recipient, operation, or endpoint.
- Invalid or expired identity or delegation.
- Missing required approval or precondition evidence.
- An unresolved applicable policy conflict.
- Missing or stale security-critical evidence.
- An unsupported required validation or policy feature.
- Failure of a required enforcement control.
- Prohibited disclosure, code execution, or production reach.

Confidence, speed, and cost cannot compensate for these failures. A model's
confidence is not authority. Human approval complements authorization; it
does not replace it. OWASP recommends downstream authorization, narrow
tools, least privilege, and approval for high-impact actions. [S02, S04]

### Tradeoffs inside the permitted set

Compare fixed workflows versus agentic planning, narrow versus broad
retrieval, review effort versus permitted autonomy, isolation options, cost,
latency, reliability, complexity, and recovery capability only after the
hard gates pass.

A numeric threshold becomes a hard operational limit only when an authorized
owner adopts it for a defined scope. This research establishes no universal
agent confidence threshold.

### Proposed constraint record

Each constraint should include:

- Stable identity, source, version, and accountable owner.
- Applicability conditions and affected workflows/actions.
- Required evidence and freshness.
- Prohibited action, required precondition, or operational limit.
- Enforcement location and failure behavior.
- Conflict handling, tests, and review triggers.
- Authorized exception scope, approver, and expiry where exceptions are valid.

Separate legal, contractual, internal-policy, and engineering requirements.
Determine legal applicability by jurisdiction, activity, organizational role,
affected people/data, and effective date. Do not replace it with a generic
“compliance score.” No legal applicability decision was established here.

## 4. Preserve evidence states and reuse enterprise records

Use explicit states:

**Verified · asserted · unknown · disputed · stale · not applicable**

“Not applicable” needs a reviewed rationale. Missing information must not
become zero, false, or “low risk.” Preserve conflicting assertions rather
than averaging them. An ontology inconsistency, a validation failure, and
an authorization denial are different outcomes.

Reuse existing systems through versioned mappings:

| Existing source | Reuse |
|---|---|
| CMDB | Asset/service identity, owner, environment, criticality, dependencies |
| Service catalog | Approved workflows, request types, service ownership |
| Data catalog | Sensitivity, access metadata, retention, location |
| IAM | Effective principals, grants, scopes, delegation, revocation |
| Change management | Approvals, windows, recovery requirements |
| Policy and risk registers | Applicable obligations, treatments, acceptance decisions |
| Monitoring and delivery systems | Observed execution, acceptance, defects, outcomes |

This is a small semantic assessment layer, not a replacement enterprise
database. Preserve source record identifiers, field-level authority,
effective/retrieval times, versions, freshness, and discrepancies. A system
can be authoritative for one field while holding stale records.

Microsoft distinguishes ontology, mappings of enterprise records to that
ontology, and runtime evidence. Its guidance says memory must not override
authoritative records. Risk acceptance also must not be confused with proof
that a technical control works. [S01, section “Ground”]

## 5. Enforce a runtime action boundary

### Proposed action envelope

Before each consequential retrieval, disclosure, tool call, or delegation:

1. Authenticate the workload and validate relevant delegation.
2. Obtain user, tenant, resource, and policy context from trusted sources.
3. Canonicalize and validate the actual action parameters.
4. Evaluate current authorization.
5. Verify action-specific approval and preconditions.
6. Execute only through controlled enforcement points.
7. Check results and recipient restrictions.
8. Record the decision, execution, and verified outcome separately.

Bind approval to the concrete action, resource, parameters, policy version,
and expiry. A ticket or model response saying “approved by security” is not
approval evidence. Delegation must not silently expand caller authority.
Microsoft describes deterministic context propagation and checks at tool
calls and handoffs; OPA separates decisions from enforcement. [S01, S02, S11]

Use scoped credentials, constrained tools and code execution, approved
destinations, bounded retries/delegation, rate and spend limits, and recovery
checks. Authorization alone does not prove the action is correct.

OWASP documents indirect prompt injection through external content.
Tickets, retrieved files, memory, and tool descriptions must remain data,
not sources of new authority. [S05]

### Protect the template supply chain

Review and pin ontology, shape, context, policy, and mapping versions.
Restrict remote loading and executable extensions. Treat policy changes as
controlled changes, not content that an agent can adopt from a document.

JSON-LD's security guidance warns about remote-context privacy, altered
contexts, resource expansion, and malicious IRI dereferencing. It advises
vetting and caching mission-critical contexts. A URL is not proof that its
current contents are trustworthy. [S06, “Security Considerations”]

### Reclassification triggers

Reassess changes to tools, parameters, endpoints, identities, scopes, models,
prompts, data sources, memory, recipients, regions, production reach,
autonomy, approvals, topology, policies, ontology/shapes versions, or
evidence freshness. Incidents and failed evaluations also trigger review.
Prior project approval is not an evergreen grant for changed capabilities.

## 6. Synthetic enterprise cases

These cases are design tests, not documented incidents.

| Case | Main issue | Required boundary |
|---|---|---|
| Read-only HR assistant | Sensitive disclosure despite no writes | Source access checks, authorized recipients, minimization, protected memory/logs |
| Production ITSM remediation | Integrity and availability | Named operations, exact approvals, change controls, recovery/postcondition checks |
| Untrusted ticket remediation | Instructions disguised as evidence | Ticket content cannot change authority or select unrestricted execution |
| Multi-agent delegation | Privilege expansion and lost context | Authenticated handoffs, scoped delegation, fresh authorization |

## 7. Evaluate classification, enforcement, and outcomes separately

### Proposed evaluation layers

1. **Template correctness:** valid data, well-formed shapes, target coverage,
   pinned imports, supported features, missing/conflicting/stale evidence.
2. **Classification quality:** independently reviewed labels,
   underclassification, disagreement, abstention, calibration, coverage.
3. **Authorization correctness:** cross-tenant access, expired delegation,
   forged attributes, approval replay, undefined decisions, policy outages,
   direct tool bypass.
4. **Agent security:** malicious documents, poisoned tool metadata, memory
   contamination, unauthorized delegation, disclosure, cascading failures.
5. **Business outcomes:** independently verified completion, defects,
   recovery, total cost, delivery time, and review burden.

Keep **proposed**, **permitted/denied**, **approved**, **attempted**,
**executed**, and **verified** events distinct. Check actual API, identity,
data, and enforcement boundaries, including deliberately hostile model
outputs. Model refusal is not the only security test.

The inspected OWASP regression harness includes fake approval, privileged
handoff, and poisoned-tool-description scenarios. Its pinned implementation
also has important limits: approval assertions do not establish
per-invocation chronology; memory checks inspect supplied substrings;
recipient checks cover selected fields; generic secret-disclosure checking
returns `not_run`; and the MCP poisoning case has trace/fixture coverage,
not a live MCP test. Do not treat this harness as complete assurance. [S12]

Synthetic tests are regression evidence, not proof of improved delivery.
Measure cost, speed, quality, and interruptions separately. Improvement in
one must not hide harm in another. Observational comparisons establish
association, not causation; unknown outcomes must remain unknown. These
limits match Decision Kit's existing evaluation documentation. [R01]

## 8. Fit with Decision Kit

The repository's typed decision and explanatory narrative remain separate.
The confidence gate in `core.mjs` is not enterprise execution authorization.
The settings recommender is advisory and its managed constraints come from
the caller; it is not a policy discovery or enforcement engine. [R02, R03]

Any future ontology-based assessment should remain inspectable alongside
Jev's bounded result, not silently change its branch, confidence, or review
gate. A separate execution authorization result can deny an action without
rewriting the model's recommendation.

No implementation, ontology vocabulary, thresholds, or requirements are
adopted by this report. A sensible future research boundary is one bounded
enterprise workflow, its authoritative records, applicable constraints,
enforcement locations, and testable outcomes—not a complete enterprise
ontology.

## Source register

### Inspected primary sources

- **S01 — Microsoft, Agentic Behavior Engineering.** Source metadata dated
  2026-10-01. Sections “Behavior contract,” “Ground,” “Control,” and evaluation
  guidance. A proposed methodology, not an industry standard.
  [Official article](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/agentic-behavior-engineering);
  [inspected source](https://raw.githubusercontent.com/MicrosoftDocs/architecture-center/main/docs/ai-ml/guide/agentic-behavior-engineering.md).
- **S02 — OPA, Agent Tool Calling.** Policy decision point versus enforcement
  point; structured tool/parameter policy inputs.
  [Inspected source](https://github.com/open-policy-agent/opa/blob/main/docs/docs/agent-tool-calling.mdx).
- **S03 — W3C, SHACL.** Validation, entailment, and default-value sections.
  [Pinned working-group source](https://github.com/w3c/data-shapes/blob/61866d39170e028b761c8dc23addc663b5d40324/shacl/index.html);
  [published Recommendation reference](https://www.w3.org/TR/2017/REC-shacl-20170720/).
  The inspected source predates publication.
- **S04 — OWASP, LLM06:2025 Excessive Agency.**
  [Inspected official source](https://github.com/OWASP/www-project-top-10-for-large-language-model-applications/blob/main/2_0_vulns/LLM06_ExcessiveAgency.md).
- **S05 — OWASP, LLM01:2025 Prompt Injection.**
  [Inspected official source](https://github.com/OWASP/www-project-top-10-for-large-language-model-applications/blob/main/2_0_vulns/LLM01_PromptInjection.md).
- **S06 — W3C, JSON-LD 1.1 source.** Security and privacy considerations.
  [Inspected source repository](https://github.com/w3c/json-ld-syntax);
  [published specification reference](https://www.w3.org/TR/json-ld11/).
- **S07 — W3C, PROV-O starting points.** Entity, activity, agent, derivation,
  and responsibility.
  [Inspected source](https://github.com/w3c/prov/blob/master/ontology/prov-o-html-sections/description-starting-points.inc.html);
  [published specification reference](https://www.w3.org/TR/prov-o/).
- **S08 — W3C, ODRL Information Model 2.2 source.** Permissions,
  prohibitions, duties, obligations, and conflict semantics.
  [Inspected working-group source](https://github.com/w3c/poe/blob/gh-pages/model/index.html);
  [published specification reference](https://www.w3.org/TR/odrl-model/).
- **S11 — Microsoft, Considerations for Multitenant Agentic Systems.**
  Source metadata dated 2026-09-25. Identity, tool calls, handoffs,
  observability, and tenant-isolation tests.
  [Official article](https://learn.microsoft.com/en-us/azure/architecture/guide/multitenant/considerations/agentic-systems);
  [inspected source](https://raw.githubusercontent.com/MicrosoftDocs/architecture-center/main/docs/guide/multitenant/considerations/agentic-systems.md).
- **S12 — OWASP, Agent Security Regression Harness.** Pinned implementation
  `970158c10b7e36ae00f12de4ba2a41ca61acabca`. Scenario and assertion limits.
  [Repository](https://github.com/OWASP/Agent-Security-Regression-Harness);
  [inspected assertion implementation](https://github.com/OWASP/Agent-Security-Regression-Harness/blob/970158c10b7e36ae00f12de4ba2a41ca61acabca/src/agent_harness/assertions.py).

### Standards references and access gaps

- **S09 — W3C, OWL 2 Primer.** Open-world reasoning and logical modeling.
  [Reference](https://www.w3.org/TR/owl2-primer/).
  Final website full-text retrieval was unavailable.
- **S10 — W3C, SKOS Reference.** Controlled vocabularies and semantic relations.
  [Reference](https://www.w3.org/TR/skos-reference/).
  Final website full-text retrieval was unavailable.
- **NIST AI RMF 1.0:** broad voluntary risk-management reference.
  [Official publication](https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-ai-rmf-10).
- **NIST AI 600-1, Generative AI Profile:** final publication reference.
  [Official publication](https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence).
- **NIST SP 800-207, Zero Trust Architecture:**
  [Official record](https://csrc.nist.gov/pubs/sp/800/207/final).
- **NIST SP 800-162, Attribute Based Access Control:**
  [Updated-final record](https://csrc.nist.gov/pubs/sp/800/162/upd2/final).
  `upd2` must not be described as “Revision 2.”

NIST full-text verification was unavailable. These references support future
governance review, not verified clause-level claims in this report.
No search-generated quotation, ISO clause-level claim, or final OWASP
Agentic Top 10 category wording is relied on here.

### Repository evidence

Paths below are relative to the repository root for portable navigation.

- **R01:** [README evaluation limits](../../README.md#run-the-targeted-evaluations)
  and `delivery-evaluation.mjs`: separate outcome metrics, incomplete-evidence
  gates, regression checks, and no causal or automatic-promotion claim.
- **R02:** [Typed decision and narrative boundary](../../.github/extensions/decision-kit/core.mjs),
  especially `interpretJevResponse` and `buildNarrativeRequest`.
- **R03:** [Settings recommendations](../../.github/extensions/decision-kit/settings-recommendations.mjs):
  advisory results and caller-supplied managed constraints, not enforcement.
