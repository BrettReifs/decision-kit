# Domain documents

This repository uses a single-context layout:

- `GLOSSARY.md` at the repository root for agreed domain terms.
- `docs/adr/` for architecture decision records.

## Reading rules

Before exploring an area, read the glossary and any decision records that apply to it.
If they do not exist, proceed without creating placeholders.
Use the glossary's terms in specifications, ticket titles, tests, and discussions.
If a proposal conflicts with a recorded decision, state the conflict before proceeding.

## Writing rules

Create or update domain documents only when terms or decisions have been agreed with the user.
Use `domain-modeling`, usually through `grill-with-docs`, to record those agreements.
Use its bundled glossary and architecture decision formats.
Do not treat open questions or agent assumptions as agreed requirements.
