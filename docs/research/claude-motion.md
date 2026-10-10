# Claude Motion: research note

**Checked:** 2026-10-10  
**Scope:** Anthropic's Claude Motion feature, not every product named “Motion.”

## Short answer

“Claude Motion” most likely refers to an Anthropic feature for making animated explainers. Anthropic's help center has a page titled [Get started with Claude Motion](https://support.claude.com/en/articles/17454997-get-started-with-claude-motion), and its Claude site has a resource titled [Build live dashboards and animate explainers with Claude](https://claude.com/resources/articles/dashboards-and-motion).

I could not retrieve either page in this environment. Search summaries attributed to those pages describe short, editable animations made from prompts or supplied content, with MP4 export. Other summaries conflict on availability and implementation details. Treat the animation workflow and export details as **unverified**, not established product facts.

## What the available evidence supports

| Finding | Evidence and confidence |
|---|---|
| Anthropic has published a Claude Help Center page with “Claude Motion” in its title. | The first-party page URL and title appeared in search results. Direct page retrieval failed, so its current contents are not verified. |
| Anthropic has published a Claude resource page pairing “live dashboards” with “animate explainers.” | The first-party URL and title appeared in search results. Direct page retrieval failed, so its current contents are not verified. |
| The likely subject is an animation or explainer feature in Claude. | This is a cautious reading of the first-party page titles and their indexed summaries, not a verified description of the feature. |
| A separate Claude listing uses the name “Motion Creative Analytics.” | The [Claude marketplace listing](https://claude.com/marketplace/connectors/motion) appeared in search results. It is a different product listing and should not be treated as the animation feature. Its detailed behavior was not verified here. |

Search summaries described editing animations and exporting them as MP4 files. Because the source pages could not be read and summaries were inconsistent, these are leads for verification only. This research does **not** confirm plan eligibility, admin settings, supported inputs, editing controls, duration or resolution limits, sharing behavior, data handling, or pricing.

## API and technical status

I found no confirmed Anthropic developer documentation for a Claude Motion API. The [Claude API documentation](https://docs.anthropic.com/en/docs/intro-to-claude) is the official starting point for Anthropic's API, but I could not verify whether it documents any Motion-related interface. Do not assume that the user-facing feature has a public API, a particular file format, or a reproducible rendering pipeline.

This is a limited search result, not proof that no such API or interface exists.

## Relevance to Decision Kit

Decision Kit is a GitHub Copilot Canvas demonstration. Its documented decision path uses TypeSafe's Jev model and OpenRouter for the explanatory chat stage; the README does not identify Claude Motion as a dependency ([README](../../README.md#what-the-workbench-demonstrates), [model and API references](../../README.md#model-and-api-references)).

The renderer already uses a short CSS animation for a probability bar and reduces animation duration when the user requests reduced motion ([renderer.mjs](../../.github/extensions/decision-kit/renderer.mjs)). This is a local interface detail, not evidence of a Claude Motion integration. No product or architecture change follows from this research alone.

## Questions to resolve from the official pages

Before evaluating Claude Motion for use, confirm:

1. Which Claude plans and regions can use it, and whether an administrator must enable it.
2. What inputs it accepts and how users start a project.
3. Whether output is editable, and what “editable” means in the product.
4. Which export formats, durations, and quality settings it supports.
5. How sharing works and what happens to uploaded source material and generated work.
6. Whether there is a documented API, and what usage limits or costs apply.
7. What accessibility controls exist, including reduced-motion handling.

These points remain **unknown** from the sources I could verify.

## Sources and verification limits

- [Get started with Claude Motion — Claude Help Center](https://support.claude.com/en/articles/17454997-get-started-with-claude-motion) — first-party page surfaced by title and URL; direct retrieval failed.
- [Build live dashboards and animate explainers with Claude — Claude](https://claude.com/resources/articles/dashboards-and-motion) — first-party page surfaced by title and URL; direct retrieval failed.
- [Motion Creative Analytics — Claude marketplace](https://claude.com/marketplace/connectors/motion) — separate listing surfaced by title and URL; direct retrieval failed.
- [Claude API documentation — Anthropic](https://docs.anthropic.com/en/docs/intro-to-claude) — first-party API documentation entry point; Motion-specific API support was not verified.

The browser tools returned DNS errors for the official pages. Search-indexed descriptions were inconsistent, so this note records only the page titles, likely subject, and questions that require direct source verification. It does not use secondary articles as evidence.
