# Agent interoperability: A2A and MCP

**Research cutoff: October 10, 2026**

This report compares the Agent2Agent (A2A) Protocol and the Model Context
Protocol (MCP), with a focus on current governance and release status, protocol
boundaries, security, and fit with Decision Kit. It uses official specifications,
project repositories, release records, governance documents, and first-party
security guidance. It does not treat planned protocol work as released behavior.

## Summary

MCP and A2A address different integration needs:

- **MCP** connects a host application or agent to server-provided tools, data
  resources, and prompts.
- **A2A** connects independent agents so they can exchange messages and
  delegate or coordinate work.

They are complementary, not competing standards. A remote agent reached over
A2A can use MCP internally to reach its own tools. A second model call inside
one application-controlled pipeline is not, by itself, agent-to-agent
delegation.

Decision Kit currently has a typed Jev decision stage followed by an
explanatory model stage. Jev's typed result and confidence gate are
authoritative. The repository also exposes schema-validated Canvas actions.
The current design has no demonstrated need for a new interoperability
protocol. Reconsider MCP if several MCP-capable hosts need a shared typed tool
or data interface. Reconsider A2A if Decision Kit must delegate to an
independently operated agent, especially across an organizational boundary or
through long-running, multi-turn work.

## Current governance and release status

### MCP

The latest stable dated specification verified for this report is
**2026-07-28**. The release record marks it stable. The specification describes
MCP as a JSON-RPC protocol between hosts, clients, and servers. Its July 2026
revision removes protocol-level sessions and the initialization handshake,
requires `server/discover`, and moves long-running Tasks to an optional
extension.

The MCP project governance document establishes MCP as a Series of LF Projects,
LLC. The Linux Foundation announced the Agentic AI Foundation (AAIF) in
December 2025, with MCP among the contributed projects. AAIF stewardship does
not make MCP and A2A one specification.

Sources: [MCP 2026-07-28 release](https://github.com/modelcontextprotocol/modelcontextprotocol/releases/tag/2026-07-28);
[MCP specification overview](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/c518f7a927cff918bce35d3522fcdb046d264d7c/docs/specification/2026-07-28/index.mdx);
[MCP changelog](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/c518f7a927cff918bce35d3522fcdb046d264d7c/docs/specification/2026-07-28/changelog.mdx);
[MCP governance](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/GOVERNANCE.md);
[Linux Foundation AAIF announcement](https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation).

### A2A

The A2A specification identifies **1.0.0** as its latest released protocol
version. The latest project release verified is **v1.0.1**, published as a
patch release in May 2026. The specification states that patch numbers do not
affect protocol compatibility; clients negotiate protocol version **1.0**.
The roadmap updated September 15, 2026 lists 1.1 enhancements as ongoing work,
so this report does not assume those changes are part of released 1.0.

A2A is an open-source project under the Linux Foundation. Its governance
document assigns technical oversight to its Technical Steering Committee
(TSC). In August 2026, A2A announced acceptance as an AAIF Growth Stage
project. The project retaining its TSC under the shared foundation reinforces
that the two protocols have separate technical processes.

Sources: [A2A v1.0.1 release](https://github.com/a2aproject/A2A/releases/tag/v1.0.1);
[A2A specification versioning](https://github.com/a2aproject/A2A/blob/12e9d2fbb9badfe98f8ab4f660697870eeb1940b/docs/specification.md#36-versioning);
[A2A roadmap](https://github.com/a2aproject/A2A/blob/12e9d2fbb9badfe98f8ab4f660697870eeb1940b/docs/roadmap.md);
[A2A governance](https://github.com/a2aproject/A2A/blob/12e9d2fbb9badfe98f8ab4f660697870eeb1940b/GOVERNANCE.md);
[A2A AAIF announcement](https://github.com/a2aproject/A2A/blob/12e9d2fbb9badfe98f8ab4f660697870eeb1940b/docs/blog/posts/a2a-joins-aaif.md).

## What interoperates

### MCP: application-to-capability integration

MCP defines a client/server protocol for an LLM host application to reach
capabilities:

- **Tools** are named operations with schemas. A client lists available tools
  and calls one with arguments. Tool definitions and results do not establish
  that an operation is safe; the host and user remain responsible for consent
  and controls.
- **Resources** identify data, such as files or schemas, by URI. Clients list
  resources and request their contents. The host decides how to present or use
  the data.
- **Prompts** are server-provided templates or workflows.

The July 2026 core protocol is stateless. `server/discover` advertises protocol
versions and capabilities; `tools/list` and `resources/list` enumerate
offerings. The server's `serverInfo` is self-reported and unverified, so it
must not be used as a security identity. MCP does not define a global
directory of independent agents.

Long-running tool work is available through the optional
`io.modelcontextprotocol/tasks` extension, not the same as making every MCP
server an autonomous peer agent. The extension describes durable task IDs,
polling, mid-task input, and cooperative cancellation. Client and server must
support the extension for it to be usable.

Sources: [MCP tools](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/c518f7a927cff918bce35d3522fcdb046d264d7c/docs/specification/2026-07-28/server/tools.mdx);
[MCP resources](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/c518f7a927cff918bce35d3522fcdb046d264d7c/docs/specification/2026-07-28/server/resources.mdx);
[MCP server discovery](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/c518f7a927cff918bce35d3522fcdb046d264d7c/docs/specification/2026-07-28/server/discover.mdx);
[MCP Tasks extension overview](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/c518f7a927cff918bce35d3522fcdb046d264d7c/docs/extensions/tasks/overview.mdx).

### A2A: agent-to-agent collaboration

A2A lets a client interact with a separate, potentially opaque agent. It does
not require either agent to expose its internal reasoning, memory, or tools.
The client sends a message containing text, files, or structured data. The
remote agent can return an immediate message or create a stateful task.

An **Agent Card** describes the agent's service endpoint, skills, capabilities,
and authentication requirements. Clients can find cards through a well-known
URI, direct configuration, or a curated registry. A2A's discovery guide says
that the protocol does not define a standard API for registries.

A task has a server-generated `taskId`; `contextId` groups related
interactions. A task can pause for `input-required` or `auth-required` and can
finish as completed, failed, canceled, or rejected. Clients can receive updates
by polling, Server-Sent Events (SSE), or push notifications when supported.
Terminal tasks do not restart; follow-up work starts a new task.

Sources: [A2A specification](https://github.com/a2aproject/A2A/blob/12e9d2fbb9badfe98f8ab4f660697870eeb1940b/docs/specification.md);
[A2A core concepts](https://github.com/a2aproject/A2A/blob/12e9d2fbb9badfe98f8ab4f660697870eeb1940b/docs/topics/key-concepts.md);
[A2A discovery](https://github.com/a2aproject/A2A/blob/12e9d2fbb9badfe98f8ab4f660697870eeb1940b/docs/topics/agent-discovery.md);
[life of a task](https://github.com/a2aproject/A2A/blob/12e9d2fbb9badfe98f8ab4f660697870eeb1940b/docs/topics/life-of-a-task.md);
[streaming and asynchronous operations](https://github.com/a2aproject/A2A/blob/12e9d2fbb9badfe98f8ab4f660697870eeb1940b/docs/topics/streaming-and-async.md).

The A2A project's own comparison calls MCP the integration layer for tools and
data and A2A the collaboration layer between independent agents. It describes
them as complementary and says they may be used together. This distinction is
about the boundary being crossed, not the complexity of the model on either
side.

Source: [A2A and MCP: detailed comparison](https://github.com/a2aproject/A2A/blob/12e9d2fbb9badfe98f8ab4f660697870eeb1940b/docs/topics/a2a-and-mcp.md).

## Cross-cutting protocol comparison

| Concern | MCP | A2A |
|---|---|---|
| **Primary relationship** | Host/client to server-provided capabilities. | Client agent to independent remote agent. |
| **Capability discovery** | `server/discover`; then list tools/resources/prompts. Server identity is self-reported, not verified. | Agent Card plus well-known URI, configured endpoint, or registry. Registry API is not standardized. |
| **Normal work unit** | A request/response operation. Long-running work can use optional Tasks extension. | Message or stateful Task with identifiers, status, messages, and artifacts. |
| **Authentication** | Optional for MCP; HTTP transport implementations should follow its OAuth-based authorization flow. STDIO should use environment credentials instead. | HTTP-layer authentication schemes are advertised in the Agent Card; clients acquire credentials out of band and send them with requests. |
| **Authorization** | MCP server validates authorization for its own resource and operation. | Receiving agent authorizes the caller and controls access to its own data and downstream operations. |
| **Asynchronous updates** | Core progress/cancellation and optional Tasks; task extension support varies. | Task polling, SSE, and optional push notifications. |
| **Tracing** | July 2026 changelog documents OpenTelemetry trace context conventions in `_meta`. | First-party enterprise guidance recommends W3C Trace Context/OpenTelemetry, task/correlation identifiers, logs, metrics, and audit events. |
| **Recovery** | July 2026 Streamable HTTP removes SSE resumability/redelivery. If a stream breaks, reissue the request with a new ID. | A2A supports reconnecting to active tasks, polling, or push, but implementations still need retry, idempotency, and event-persistence policies. |

Sources: [MCP specification overview](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/c518f7a927cff918bce35d3522fcdb046d264d7c/docs/specification/2026-07-28/index.mdx);
[MCP changelog](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/c518f7a927cff918bce35d3522fcdb046d264d7c/docs/specification/2026-07-28/changelog.mdx);
[MCP authorization](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/c518f7a927cff918bce35d3522fcdb046d264d7c/docs/specification/2026-07-28/basic/authorization/index.mdx);
[A2A enterprise guidance](https://github.com/a2aproject/A2A/blob/12e9d2fbb9badfe98f8ab4f660697870eeb1940b/docs/topics/enterprise-ready.md);
[A2A streaming guidance](https://github.com/a2aproject/A2A/blob/12e9d2fbb9badfe98f8ab4f660697870eeb1940b/docs/topics/streaming-and-async.md).

## Security, trust, and authorization propagation

### MCP

- **Trust starts with server selection.** MCP's project security policy says
  clients trust the servers they connect to. Server discovery describes
  capability; it does not authenticate the server.
- **Protect tool execution.** The specification treats tools as potentially
  powerful operations and puts consent and user-control responsibilities on
  the host. Tool descriptions or annotations from untrusted servers should not
  be treated as trusted policy.
- **Bind tokens to the target server.** For HTTP authorization, clients request
  tokens for the intended resource and servers validate that tokens were
  issued for themselves. An MCP server that calls an upstream API must not
  pass through the client's token; it needs an appropriate upstream token.
- **Protect request state.** The July 2026 multi-round-trip-request flow may
  echo opaque `requestState` through the client. If that value affects
  authorization or business logic, the server must protect its integrity and
  bind it to the authenticated principal, original request, and a short
  expiry. The server must also enforce single-use state if required.

Sources: [MCP security policy](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/SECURITY.md);
[MCP authorization security considerations](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/c518f7a927cff918bce35d3522fcdb046d264d7c/docs/specification/2026-07-28/basic/authorization/security-considerations.mdx);
[MCP multi-round-trip requests](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/c518f7a927cff918bce35d3522fcdb046d264d7c/docs/specification/2026-07-28/basic/patterns/mrtr.mdx).

### A2A

- **Authenticate the service connection.** A2A's enterprise guidance calls
  for HTTPS in production and TLS certificate validation. Authentication
  requirements are advertised by the Agent Card, but credentials are acquired
  out of band and sent at the HTTP layer.
- **Authorize every operation.** The receiving agent is responsible for
  checking each request and scoping access to tasks and data. An Agent Card
  does not grant access.
- **Treat signatures as one trust input.** A2A permits signed Agent Cards using
  JWS and requires canonicalization for signature verification. A signature
  helps verify card integrity and origin; clients must still trust the signer,
  endpoint, and authorization policy.
- **Do not infer permissions from `auth-required`.** The state says that
  additional authorization is needed. A2A does not define the resulting
  credential's scope, validity, or revocation semantics. Its guidance
  recommends out-of-band credential delivery. In-band credential exchange
  across multiple agents can expose credentials to agents in the chain.
- **Secure callbacks.** Push notifications add a server-to-client HTTP
  callback. The A2A guidance identifies SSRF and forged or repeated
  notifications as risks; implementations need webhook URL validation,
  authentication, and idempotent handling.

Sources: [A2A enterprise guidance](https://github.com/a2aproject/A2A/blob/12e9d2fbb9badfe98f8ab4f660697870eeb1940b/docs/topics/enterprise-ready.md);
[A2A specification, in-task authorization](https://github.com/a2aproject/A2A/blob/12e9d2fbb9badfe98f8ab4f660697870eeb1940b/docs/specification.md#76-in-task-authorization);
[Agent Card signing](https://github.com/a2aproject/A2A/blob/12e9d2fbb9badfe98f8ab4f660697870eeb1940b/docs/specification.md#84-agent-card-signing);
[A2A security considerations](https://github.com/a2aproject/A2A/blob/12e9d2fbb9badfe98f8ab4f660697870eeb1940b/docs/specification.md#13-security-considerations);
[A2A security policy and private reporting](https://github.com/a2aproject/A2A/blob/main/SECURITY.md).

### Advisories

The protocol specifications describe security requirements; they do not replace
review of implementation-specific advisories. No SDK or runtime has been
selected for Decision Kit, so this report does not claim that a particular SDK
version is free of advisories. Before adopting an implementation, check the
maintainer's current security advisories and version-specific fixes:
[A2A Security Advisories](https://github.com/a2aproject/A2A/security/advisories)
and [MCP Security Advisories](https://github.com/modelcontextprotocol/modelcontextprotocol/security/advisories).
The project security policies describe how to report vulnerabilities:
[A2A](https://github.com/a2aproject/A2A/blob/main/SECURITY.md) and
[MCP](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/SECURITY.md).

## Decision matrix

| Situation | Best fit | Reason |
|---|---|---|
| One application needs structured access to an API, function, database, or data source. | **MCP** | The server exposes tools or resources that the host can discover and use. |
| One agent must delegate a multi-turn or long-running goal to an independently operated agent. | **A2A** | Agent Cards, messages, task state, artifacts, and asynchronous updates are designed for peer-agent collaboration. |
| A delegated remote agent also needs standard access to its own tools or data. | **Both, at separate boundaries** | A2A connects the agents; MCP can connect each agent to its own capabilities. |
| A local single-agent flow already has typed host actions and direct provider calls. | **Neither, unless a new boundary is required** | A protocol would add discovery, compatibility, security, and operational work without a current interoperability consumer. |
| Work must persist across client disconnects. | **MCP Tasks or A2A Task, based on the endpoint's role** | MCP Tasks extend server operations; A2A Tasks track work delegated to an agent. Confirm support and recovery semantics first. |

## Fit with Decision Kit

The repository describes Decision Kit as a Canvas that uses Jev to choose a
typed branch and exposes probabilities, followed by a separate chat model that
explains the bounded result. The README says Jev remains authoritative and the
chat model must not change the branch or review requirement. ([`/home/runner/work/decision-kit/decision-kit/README.md`, lines 3–25](https://github.com/BrettReifs/decision-kit/blob/main/README.md#L3-L25))

The implementation follows that boundary. `runLiveDecision` calls Jev, parses
its response, then sends the bounded decision to the narrative model.
[`/home/runner/work/decision-kit/decision-kit/.github/extensions/decision-kit/provider.mjs`,
lines 38–56](https://github.com/BrettReifs/decision-kit/blob/main/.github/extensions/decision-kit/provider.mjs#L38-L56).
The core validates typed fields and computes confidence and human review.
[`/home/runner/work/decision-kit/decision-kit/.github/extensions/decision-kit/core.mjs`,
lines 68–117](https://github.com/BrettReifs/decision-kit/blob/main/.github/extensions/decision-kit/core.mjs#L68-L117).

The Canvas already defines JSON Schemas for `run_preset` and `reset_state`.
Its local server binds to `127.0.0.1` and uses an ephemeral port.
[`/home/runner/work/decision-kit/decision-kit/.github/extensions/decision-kit/extension.mjs`,
lines 116–169 and 173–253](https://github.com/BrettReifs/decision-kit/blob/main/.github/extensions/decision-kit/extension.mjs#L116-L169).
That host integration is not, by itself, an MCP server or an A2A endpoint.

The product's delivery nudge is also intentionally bounded: the README says it
does not change Jev decisions or grant execution permissions. Its evaluation
guidance says activity counts do not prove delivery improvement or causation.
([`/home/runner/work/decision-kit/decision-kit/README.md`, lines 60–85 and 125–157](https://github.com/BrettReifs/decision-kit/blob/main/README.md#L60-L85))

### Adoption triggers

- **Consider MCP** when multiple MCP-capable hosts need a shared, typed
  Decision Kit tool or resource interface beyond Canvas actions. Choose the
  smallest useful capability and specify caller identity, authorization,
  consent, input validation, output handling, and error behavior.
- **Consider A2A** when the product must delegate to an independently operated
  specialist agent across a team, vendor, or organization boundary. The case
  is stronger if capability discovery, multi-turn clarification, durable task
  state, or asynchronous delivery is required.
- **Consider both** only when the remote agent also needs standardized access
  to its own tools or data.
- **Keep Jev authoritative.** Treat any remote agent response as data to
  validate. It must not silently alter the selected branch, probabilities, or
  confidence/review gate.
- **Measure benefit before adding a boundary.** The README calls for evidence
  across cost, delivery time, and quality, and says current comparisons do not
  establish causation or no material harm. ([`/home/runner/work/decision-kit/decision-kit/README.md`,
  lines 125–157](https://github.com/BrettReifs/decision-kit/blob/main/README.md#L125-L157))

### Unnecessary complexity today

MCP would add a protocol endpoint, host/version compatibility, server trust,
authorization, and tool-consent responsibilities without a current external
tool or resource consumer. A2A would add remote-agent identity and discovery,
task persistence and lifecycle, authorization boundaries, retries, and
observability without a current independent agent to which Decision Kit must
delegate. A second model call in one controlled pipeline is not enough to
justify either protocol.

## Open questions before adoption

1. Which external host or service cannot use the existing Canvas actions, and
   what exact capability must cross that boundary?
2. Is the target a discrete tool/API or an independently operated agent with
   its own task lifecycle and authorization policy?
3. What scenario context may leave the current boundary? What must remain
   local?
4. Which identity, scopes, consent step, and revocation process apply to the
   caller and downstream services?
5. Must work continue across restarts? Does it need clarification, cancellation,
   streaming, or push notifications?
6. How will returned data be validated without changing Jev's decision or
   human-review gate?
7. Which trace IDs, audit events, retention rules, retry behavior, and
   idempotency guarantees are required?
8. What measured improvement would justify the added cost and risk without
   worsening delivery time, quality, or human effort?

## Research note location

No existing research-note directory or file convention was present in the
repository. This report is saved at
`/home/runner/work/decision-kit/decision-kit/docs/research/a2a-mcp-interoperability-2026-10-10.md`.
