# REA (“Reverse Engineer Anything”): research findings

**Research date:** 2026-10-10

## Summary

The project is **[morluto/rea](https://github.com/morluto/rea)**, titled “REA: Reverse Engineer Anything.” In a GitHub repository metadata snapshot taken on 2026-10-10, it had **70,401 stars, 14,768 forks, and 146 open issues**; GitHub lists its creation date as 2026-04-14. These figures establish its current scale, not its historical growth rate. ([GitHub repository API](https://api.github.com/repos/morluto/rea))

REA is a local CLI and MCP server that gives coding agents tools to inspect software artifacts and runtime behavior, return findings with evidence, and support follow-up explanation or implementation. Its scope spans JavaScript and Electron applications, websites, .NET and Android artifacts, and native binaries. ([REA README](https://github.com/morluto/rea#readme); [REA architecture map](https://github.com/morluto/rea/blob/main/docs/architecture.mermaid))

## What it does

The documented workflow is to install REA and register it with a supported agent, ask about a feature or target, then let the agent call REA through MCP or the CLI. REA returns observations and evidence; the agent uses those results to investigate or build. Setup shows proposed agent-configuration changes and asks for approval. ([REA README, setup and workflow](https://github.com/morluto/rea#quick-start); [installation guide](https://github.com/morluto/rea/blob/main/docs/installation.md))

The architecture separates CLI and MCP entry points from shared application workflows, provider adapters, contracts, domain modules, and tests. Analysis options depend on the target: static JavaScript and .NET inspection need no native analysis engine, while deep native analysis uses a provider such as Hopper, Ghidra, or IDA. Runtime capture can run or interact with a target using the user's permissions. ([REA architecture map](https://github.com/morluto/rea/blob/main/docs/architecture.mermaid); [REA README, target matrix and execution note](https://github.com/morluto/rea#what-you-can-analyze))

## Popularity and pace

GitHub metadata shows a high star and fork count for a repository created in April 2026. Recent first-party activity is also high: releases **6.1.0, 6.2.0, and 6.3.0** were published on October 9, and GitHub metadata showed the repository pushed on October 10. This supports “active and popular”; a single metadata snapshot does not, by itself, establish how quickly stars accumulated. ([GitHub repository API](https://api.github.com/repos/morluto/rea); [6.1.0 release](https://github.com/morluto/rea/releases/tag/rea-agents-6.1.0); [6.2.0 release](https://github.com/morluto/rea/releases/tag/rea-agents-6.2.0); [6.3.0 release](https://github.com/morluto/rea/releases/tag/rea-agents-6.3.0))

The 6.3.0 release also documents a breaking capture-compatibility change: some older captures and web diffs are rejected unless they contain newer evidence fields. The release notes direct users to preserve originals, recapture with the current producer, and update comparison consumers. ([6.3.0 release](https://github.com/morluto/rea/releases/tag/rea-agents-6.3.0))

## Limits and risks

The project is evolving quickly, and recent open issues report scale and host-compatibility problems. Issue [#1387](https://github.com/morluto/rea/issues/1387) reports that a large JavaScript bundle completed under 6.2.0 but aborted under 6.3.0. Issue [#1563](https://github.com/morluto/rea/issues/1563) documents a separate heap-exhaustion report for a public JavaScript package; that issue describes test conditions and a proposed follow-up, not a general performance guarantee. Issue [#1554](https://github.com/morluto/rea/issues/1554) reports that the full REA MCP tool catalog blocked ordinary Copilot CLI chat in a specific offline BYOK setup using `gpt-4.1` model metadata. The issue describes working controls with REA disabled or a different model; it does not establish a general Copilot compatibility failure. These are reports, not an independent benchmark, and should be checked against the version, host configuration, and target in use.

“Local analysis” does not mean every part of the workflow stays private: the README notes that the agent receives tool results and the model provider has its own data policy. The security policy also warns that parsing an untrusted binary delegates work to the selected analysis provider with the user's permissions. Review the exact setup plan, provider, target, and data policy before use. ([REA README, privacy FAQ](https://github.com/morluto/rea#faq); [REA security policy](https://github.com/morluto/rea/blob/main/SECURITY.md))

The current package declares Node.js `^22.19.0 || ^24.11.0 || >=26.0.0`, while Decision Kit declares Node.js `>=20`. This is a runtime consideration if REA is integrated into the project; it does not prevent running REA separately with a supported Node.js version. ([REA `package.json`](https://github.com/morluto/rea/blob/main/package.json); `/home/runner/work/decision-kit/decision-kit/package.json:6-8`)

## Relevance to Decision Kit

REA is a possible **optional developer research tool**, not a direct replacement for Decision Kit. It may help investigate an authorized, unfamiliar external application or trace a complex JavaScript dependency. Decision Kit's documented path is narrower: typed Jev output selects a branch and confidence gate, and an LLM explains that result without changing it. I found no first-party evidence that REA integrates with Decision Kit's Copilot Canvas host, so compatibility should not be assumed. ([REA README](https://github.com/morluto/rea#readme); `/home/runner/work/decision-kit/decision-kit/README.md:21-27`)

For Decision Kit's own code, source review and its existing tests are more direct than introducing another tool. If trying REA, use it separately on one authorized, non-sensitive target; check the installed version and Node.js requirement; and do not treat its findings as a substitute for source review or tests. ([REA CLI guide](https://github.com/morluto/rea/blob/main/docs/cli.md); `/home/runner/work/decision-kit/decision-kit/README.md:246-253`)
