---
name: data-handoff
description: Produce a short, human-readable data map and input/output handoff from any codebase or agentic prototype, with optional evidence-backed reproduction kits. Use when engineers need to integrate across a data boundary or reproduce tested behavior in another model or harness.
---

# Data handoff

Produce one short handoff per chosen integration boundary, not a schema audit.
Use plain language a junior engineer can act on. This skill has no project,
language, framework, or vendor-specific contract.

## Inspect

1. Select the boundary and name its direction, producer, and consumer. Ask which
   boundary matters if the scope is unclear; do not inventory the whole project.
2. Read the real input path, validation, transformations, output path, and relevant
   tests. Types and documentation alone do not establish runtime behavior.
3. Trace meaningful renames, derived values, dropped fields, and ambiguous fields.
   Note contradictions between code, tests, and docs rather than hiding them.
4. Separate observed behavior from assumptions and unknowns. Cite a few source
   paths and symbols or line numbers beside material observed claims.

## Draft

Use [handoff-template.md](handoff-template.md): its synthetic golden-path example
shows the exact five headings, not a contract to impose on another project.
Replace its content, not its headings. Keep exactly these sections in order:
Purpose, Input JSON, Output JSON, Field map, Handling rules.

- Purpose includes direction (producer → consumer) and what this boundary does.
- JSON is canonical. Give sanitized golden-path input and output first. Add an
  error example only when its shape is known and useful; avoid boilerplate.
- Examples are valid JSON, not schemas or placeholders. State requiredness,
  nullability, defaults, units, or other constraints in rules only when relevant.
- Map only meaningful renames, derived, dropped, or ambiguous fields. Omit obvious
  passthroughs. If none exist, write `No non-obvious mappings.` instead of a table.
- Give short actionable handling rules and unresolved decisions as bullets.
  Conventional assumptions may bridge a prototype, but label every consequential
  unsupported assumption **Assumed—confirm**. Label unknowns **Unknown** and open
  decisions **Still to decide**. Never invent an implemented guarantee.
- If an interface cannot be established, write **Unknown** in the affected
  section and say what evidence is needed. Do not invent JSON to pass validation;
  report the handoff as incomplete and its validation failure.
- Never include secrets or real personal data, even from tests or logs. Use
  synthetic values. Distinguish generated text from verified facts.
- Include relevant validation, failure, or trust rules without adding a generic
  policy checklist. Do not claim retries, retention, redaction, or security
  guarantees without evidence.
- Add YAML or TypeScript translations only if explicitly requested, inside the
  existing sections. Keep them consistent with JSON; do not infer full types from
  example values alone.

## Validate, review, deliver

From the checkout root, run the read-only validator with Node.js 20+:

```sh
node .github/skills/data-handoff/validate-handoff.mjs /absolute/path/to/handoff.md
```

Use the actual installed script path when applying this skill to another codebase.
It needs no dependencies, network, or shell preapproval configuration. Follow the
host's normal execution permissions; do not request blanket preapproval.

Fix mechanical errors. The validator checks headings/order, fenced JSON, input
and output examples, map presence, and rule bullets. It cannot prove code
interpretation, sanitization, or semantic quality.

Review with [evals.json](evals.json): score the five criteria manually or via agent
review against the inspected code. Pass at least 8/10, with no zero in JSON or
mapping. Secrets or unsupported assumptions presented as observed automatically
fail. The five small case cards are representative scenarios for review, not
executed code fixtures or proof of real behavior.

In ordinary data-only mode, deliver only the five-section handoff to engineers. Keep scores, eval cards, and
validator output outside it. Report unresolved evidence gaps rather than claiming
a complete or verified contract.

## Optional reproduction mode

When asked to hand off a benchmarked prototype to another model or harness, use
[reproduction.md](reproduction.md). Inventory slices briefly, select the needed
viewer/integration boundaries, then write separate five-section handoffs.
Keep the orientation, shared transformations, sanitized evidence, cases, and
model/harness attribution in the companion kit, not new sections in each handoff.

The optional bootstrap scaffolds an explicitly incomplete kit and validates only
mechanical structure. Port deterministic mappings, validation, and decision gates;
substitute and re-evaluate model and harness behavior. Do not create an agent or
runtime, choose a model automatically, or claim model equivalence. Preserve unknowns
and distinguish actual access enforcement from UI visibility.
