# Decision Kit data handoff language

Shared language for asking engineers and data teams to transfer a prototype's data behavior. These terms distinguish the requested handoff from a query, a specification, or a conversation summary; they do not assert that any particular interface is already implemented.

## Requested handoff

**Source-to-target mapping**:
The correspondence from material input fields to output fields, including renames, derivations, aggregations, and dropped fields. It explains how data changes, not merely where it was fetched.
_Avoid_: Data map (without specifying the boundary and outputs)

**Input/output interface contract**:
The agreed expectations for data sent across a named producer-to-consumer boundary and data returned or emitted, including relevant field meanings and constraints. Examples illustrate the contract but do not establish every constraint.
_Avoid_: Schema (when the request also needs behavior and meaning)

**Data processing rules**:
The relevant instructions for validating, transforming, filtering, and handling missing data and failures at a named boundary. State viewer-specific access enforcement separately from fields merely hidden in a UI.
_Avoid_: Data handling (without naming the rules or boundary)

**Evidence-backed reproduction handoff**:
A source-to-target mapping and interface contract together with processing rules, tested model and harness provenance, scripts, benchmark cases, and traceable evidence for rebuilding and evaluating a prototype in another harness. It is a starting point for reproduction, not proof that a different model will match.
_Avoid_: Handoff (without saying whether it is for an engineer or for resuming a session)

## Scope and evidence

**Viewer slice**:
One selected viewer and output boundary documented and evaluated independently, with its visibility and access assumptions stated explicitly. It is not necessarily one implementation ticket.
_Avoid_: Ticket slice (when referring to a viewer/data boundary)

**Field-level lineage**:
The evidence trail from an output field back to the inputs and transformations that produced it. It supports a mapping but does not replace the interface contract or processing rules.
_Avoid_: Data map (when only traceability is meant)

**Source query**:
A query that retrieves or computes source data for part of a workflow. Include it as supporting evidence where relevant; it is not, by itself, the source-to-target mapping, output contract, or processing rules.
_Avoid_: Data map (when only a query is being delivered)

**Session handoff**:
A summary of current conversation or agent work so another agent can continue. It may point to a reproduction handoff but is not the durable engineering contract.
_Avoid_: Reproduction handoff (when only transferring conversation context)

## Request language

Ask for: **“A source-to-target mapping, input/output interface contract, and data processing rules for [named boundary or viewer slice], with evidence for observed behavior—not just the source query.”** For a benchmarked prototype, request an **evidence-backed reproduction handoff** as well. Mark consequential unverified details **Assumed—confirm** or **Unknown** rather than treating them as agreed behavior.
