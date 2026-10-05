# Issue tracker: GitHub

Issues, specifications, and decision maps live in GitHub Issues in `BrettReifs/decision-kit`.
Use available GitHub tools for tracker operations. Do not require the `gh` CLI.

## Conventions

- Read the full issue, comments, and labels before working on a ticket.
- Review proposed ticket breakdowns and blockers with the user before publishing.
- When an approved skill workflow says to publish to the tracker, create a GitHub issue.
- Use the label mapping in [triage-labels.md](triage-labels.md).
- Use the domain terms and decision records described in [domain.md](domain.md).
- Refer to issues by linked title, not by bare issue number.
- Tracker configuration does not authorize issue or label creation, feature implementation, new branches, or pull requests.

## Pull requests as a triage surface

**PRs as a request surface: no.**

## Wayfinding operations

- **Map:** One issue labelled `wayfinder:map`, with the destination, notes, decisions so far, questions not yet specified, and out-of-scope work.
- **Child ticket:** Link each decision ticket to the map as a native GitHub sub-issue. If sub-issues are unavailable, use a linked task list in the map and a `Part of` link in each ticket.
- **Type:** Use `wayfinder:research`, `wayfinder:prototype`, `wayfinder:grilling`, or `wayfinder:task` to identify the decision work.
- **Blocking:** Use native GitHub issue dependencies when supported by the host tools and tracker. Otherwise, record explicit `Blocked by` links in the ticket body. A ticket is unblocked only when all its blockers are closed. Do not confuse parent-child links with dependencies.
- **Frontier:** List the map's open child tickets, then exclude tickets with open blockers or an assignee.
- **Claim:** Assign a selected ticket to the person driving the map before starting its work.
- **Resolve:** Record the answer in a resolution comment, close the ticket, and add a linked title and short summary to the map's decisions so far.

Use available GitHub tools to read, create, update, comment on, label, assign, link, and close issues within the approved workflow. If an operation is unavailable, report the limit rather than claiming it succeeded.
