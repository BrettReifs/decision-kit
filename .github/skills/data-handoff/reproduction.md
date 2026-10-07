# Optional reproduction handoff

Use this mode only when an engineer needs to approximate a tested prototype in a
different model or harness. Ordinary data-only handoffs still have exactly five
sections. This package bootstraps the handoff, not an agent or a deployment.
It has no dependency on Decision Kit, Canvas, Copilot, or Foundry APIs.

## Discover, select, trace

1. Inventory viewers, data sources, transformations, and output boundaries briefly.
   Ask which slices the receiving engineer needs. Do not audit every field or
   publish a huge monolithic contract.
2. Give each selected viewer/integration boundary a stable slice ID. Keep excluded
   slices and unknowns in the orientation; do not imply they were benchmarked.
3. Trace each selected slice from source through validation, script/tool/model,
   normalization, and viewer output. Write its own five-section handoff with the
   existing template and validator. Leave unknown interfaces incomplete.
4. Describe shared transformations once in a local evidence note, then reference
   its evidence ID from each slice. Record included/excluded data, viewer/tenant
   scope, and **actual access enforcement versus UI hiding**. A hidden field is
   not evidence of authorization or system-wide security.
5. Tie consequential observed assertions to a code excerpt with source path,
   symbol/line range and commit, test result, or selected sanitized trace. Cite
   evidence IDs beside claims in slice rules and list them in the slice record.
   A trace establishes an observation, not necessarily its cause. Label
   recommendations, **Assumed—confirm**, **Unknown**, and **Still to decide**.

## Bootstrap and validate

Use Node.js 20+ and the installed script's actual path in another project:

```sh
node .github/skills/data-handoff/bootstrap.mjs scaffold /absolute/path/to/new-kit
node .github/skills/data-handoff/bootstrap.mjs validate /absolute/path/to/new-kit
```

The parent must already exist. The destination must not exist, even as an empty
directory or symlink. Scaffold writes with exclusive creation; it never overwrites
user files. If creation fails partway, inspect the incomplete directory before
removing it or choosing a new destination. Follow normal host permissions.

Scaffold creates `HANDOFF.md`, `slices.json`, empty `cases.jsonl`,
`provenance.json`, and one incomplete slice handoff. It supplies **no evidence,
benchmark scores, model choice, or fictional JSON interface**. Validation should
fail until real handoffs and golden cases replace the unknowns. Unknown provenance
can remain explicit; formatting checks cannot establish whether it is sufficient.

The module exports `scaffoldKit(destination)` and `validateKit(directory)` (an
array of structural errors). The CLI exits 1 on errors and 0 on successful
creation or structural validation. It makes no network calls, scrapes no source
repository, executes no supplied scripts, and chooses no model.

## Minimum kit format

`HANDOFF.md` is a short engineer-first orientation, not a sixth section in every
slice. Include the outcome, measured scope/threshold if known, slice index,
exclusions, shared transformations, run order and step owners, evidence gaps,
and next steps. Keep rubric/results outside the five-section slice handoffs.

**Port deterministically:** mappings, validation, scripted transformations,
decision/confidence gates, and output normalization supported by evidence.
**Substitute and re-evaluate:** model and its settings, orchestration, context
assembly, tool plumbing, permissions, state, and other harness-supplied behavior.
A candidate Microsoft Foundry model is a candidate to test, not an interchangeable
replacement. Record mocked steps and do not ascribe code-produced values to a model.

`slices.json` is an array of selected slices. Required fields:

```json
[
  {
    "id": "team",
    "viewer": "Team lead (synthetic example)",
    "boundary": "Ticket aggregate → team viewer",
    "visibilityAccess": "UI hides other teams. Actual server enforcement: Unknown.",
    "handoff": "slices/team.md",
    "evidenceIds": ["shared-counts"]
  }
]
```

This example describes a format, not a verified dashboard. Each `handoff` must
pass the unchanged five-section validator. Empty evidence lists are allowed:
they are evidence gaps, not verified claims.

`cases.jsonl` has one object per nonblank line. Every selected slice needs at
least one `golden` case. Add `negative` cases for consequential boundaries:
wrong viewer/tenant, denied access, invalid input, unavailable tool, or empty data.
Use distinct case IDs and testable expected properties, not exact generated prose:

```json
{"id":"team-golden","sliceId":"team","kind":"golden","input":{"viewer":"synthetic-team-a","events":[]},"expectedProperties":["The count is zero for the empty input","No other team's records appear"],"evidenceIds":["shared-counts"]}
{"id":"team-denied","sliceId":"team","kind":"negative","input":{"viewer":"synthetic-team-b","requestedTeam":"synthetic-team-a"},"expectedProperties":["No team-a records are disclosed"],"evidenceIds":[]}
```

Required: `id`, `sliceId`, `kind` (`golden` or `negative`), `input` (any JSON value),
and a nonempty array of nonempty strings in `expectedProperties`. Evidence links
are optional on cases. Properties describe acceptance tests to implement; the
validator does not execute or judge them.

`provenance.json` records what was actually tested:

```json
{
  "source": {"repository": "Unknown", "commit": "Unknown"},
  "harness": {"name": "Unknown", "behavior": "Unknown"},
  "model": {"identifier": "Unknown", "version": "Unknown", "settings": "Unknown"},
  "prompts": [],
  "scripts": [],
  "tools": [],
  "evidence": [
    {"id": "shared-counts", "path": "evidence/shared-counts.txt"}
  ]
}
```

Source repository/commit, harness name/supplied behavior, model identifier/version,
and settings are required. Use literal `Unknown` when not captured; settings may
instead be an object of known generation settings. Record tested prompt versions,
instructions, script paths/commits, tool I/O contracts, permissions and relevant
harness behavior in local sanitized captures. `prompts`, `scripts`, and `tools`
are required arrays, empty if not captured; entries use `{"path":"local/file",
"evidenceIds":["evidence-id"]}` with optional evidence IDs. No files are executed.
Explain missing artifacts in `HANDOFF.md` rather than imply an empty array means
none were used. Additional metadata is allowed but not validated.

`evidence` is a required array of `{id, path}` records. Each referenced file must
exist inside the kit. Store only selected sanitized excerpts, prompts, test
results, or traces, with enough original source locations and attribution to
inspect the claim. Include measured results and acceptance thresholds only when
supported, and distinguish baseline observations from receiving-harness reruns.
Do not copy credentials, real personal data, or indiscriminate session logs.
Privacy clearance and safe sharing require separate review.

IDs start with a letter and contain only letters, digits, `_`, or `-`. They must
be unique within slices, cases, and evidence respectively. Evidence links must
resolve to the evidence index; case slice IDs must resolve to selected slices.
All declared paths (`handoff`, evidence/artifact `path`, and top-level kit files)
are local kit-relative regular files. Absolute paths, `..` segments, backslashes,
and symlinks escaping the kit are rejected. Mirror local Markdown references in
these declared paths; arbitrary Markdown links and extra metadata are not checked.
External source URLs are attribution, not downloaded evidence.

**Structural validity is not semantic correctness, verified authorization, privacy
clearance, benchmark success, or reproduction fidelity.** Review claims against
their evidence, implement property checks, and run the chosen model/harness before
reporting per-slice results. Do not average away a failed access boundary.

## Relevant discovery checks

Use only the checks that could change this slice's outcome or expose data:
missing/null/empty values; units, freshness, timezones and aggregation denominators;
partial/stale results; retries, duplicates and idempotency; stable identity and
ordering; generated versus code-authoritative fields; refusal, timeout and parse
failure; viewer/tenant enforcement; context, tool permissions and harness state.
Keep unresolved answers visible rather than inventing universal handling rules.
