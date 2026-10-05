# Decision Kit contributor guide

- Use Node.js 20 or newer and built-in APIs unless a dependency has clear value.
- Keep `extension.mjs` focused on Canvas wiring; put decision logic, providers, scenarios, and rendering in sibling modules.
- Never expose, persist, or log `OPENROUTER_API_KEY`. Provider calls stay in the extension process.
- Treat Jev output as authoritative typed data. LLM output may explain it, but must not silently alter the selected branch or confidence gate.
- Run `npm test` and `npm run check` before committing.

## Agent skills

- Matt Pocock's requirements and ticketing skills are installed in `.github/skills/`. See the README's requirements and ticketing section for the source and workflow.
- Before first use, run `setup-matt-pocock-skills` with the user to confirm the issue tracker and triage labels. Do not assume those choices have been made.
- Use `wayfinder` for unresolved decisions, `grill-with-docs` to clarify requirements, `to-spec` to capture agreed requirements, and `to-tickets` to propose testable work.
- Confirm ticket breakdowns before publishing. Installing skills does not authorize issue creation, implementation, new branches, or pull requests.
- Skills do not override this guide or the host's permissions. Use available GitHub tools for tracker operations when the `gh` CLI is unavailable.
