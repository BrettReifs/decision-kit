# Decision Kit contributor guide

- Use Node.js 20 or newer and built-in APIs unless a dependency has clear value.
- Keep `extension.mjs` focused on Canvas wiring; put decision logic, providers, scenarios, and rendering in sibling modules.
- Never expose, persist, or log `OPENROUTER_API_KEY`. Provider calls stay in the extension process.
- Treat Jev output as authoritative typed data. LLM output may explain it, but must not silently alter the selected branch or confidence gate.
- Run `npm test` and `npm run check` before committing.
