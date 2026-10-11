# GitHub Copilot app: live primary-source research

**Baseline and access date: 2026-10-11.** Research is documentation and release
inspection, not an app evaluation. No app, installer, extension, automation,
provider, or SDK was run. No dependencies or runtime settings were changed.
The coordinating researcher separately reported **71 repository tests passed**
and **`npm run check` passed**, rerun after the README-only edit on
**Node.js v22.23.3**, before this report was written. Those checks
validate repository behavior, not desktop app compatibility.

## Summary

GitHub Copilot app is a real, separately documented desktop surface built on
Copilot CLI, not a proposed name for GitHub Desktop or the GitHub website.
GitHub documents macOS, Linux, Windows, parallel sessions, local and cloud
execution, customizations, Canvas, BYOK, and the pull-request lifecycle. All
Copilot plans qualify; BYOK also permits use without a Copilot plan, but the
app still requires GitHub sign-in. Business/Enterprise app access is governed
by a separate, default-enabled policy. [S01, S02, S05]

The independently verified distribution/feedback repository is
**`github/app`**. Its README identifies that role and links release installers;
it is **not demonstrated to be the application's implementation-source
repository**. The inspected root contains documentation, flags, and support
files, not a published application build tree, and its license reserves all
rights. The latest published non-prerelease release returned by GitHub is
**v1.1.28, 2026-10-09T01:55:50Z**. [S29–S33]
The repository's `flags/feature-flags.json` is a documented global disable-only
payload, **not a local user settings file**. [S56]

Decision Kit is a strong candidate for an **Interactive, local-worktree Canvas
trial**. Do not equate a separate worktree with a security sandbox. Sandboxing
is off by default; the app's sandbox settings are separate from the CLI's.
The app defaults both internet and local-network access on, unlike the CLI's
default local-network setting. The repository's delivery hook and extension
secret-request behavior still require a real app compatibility test. [S10–S12,
R01, R02]

## Evidence labels and method

Labels used below distinguish a supported product claim from an attractive
but unproven extrapolation:

* **App-documented:** an app article, or a cross-surface source explicitly
  naming the app, owns the claim.
* **Inherited-evidence:** app docs explicitly link or import another surface's
  capability, but the detailed configuration comes from that other surface.
  Verify the particular build and execution location before relying on it.
* **CLI-only / SDK-only:** confirmed for that surface, **not an app contract**.
* **Unverified:** not established by retrieved primary evidence. This does
  not mean impossible or absent.
* **Repository evidence:** describes this checkout, not a claim of app support.

Read `AGENTS.md`, `README.md`, and an existing research note before research.
No `.github/agents` files were read. Live retrieval followed the app concept
page into its quickstart and all eight articles in the app how-to index, then
into sandbox, permissions, configuration, skills, session-data, billing, and
SDK references. Important claims cite the source register at the end.

## 1. Identity, distribution, installation, and availability

### Product and repositories

| Item | Verified finding | Evidence |
|---|---|---|
| Product identity | Desktop control surface for directing agents, GitHub work, and PR lifecycle; built on Copilot CLI | App-documented [S01] |
| Official download entry | `https://github.com/features/ai/github-app`, linked by the official quickstart | App-documented [S02, S28] |
| Distribution/support home | `https://github.com/github/app`; README explicitly offers releases, bugs, discussions, changelog | First-party repository [S29] |
| Latest published release | `v1.1.28`; published **2026-10-09 01:55:50 UTC**, `draft=false`, `prerelease=false` | GitHub release API through GitHub tools [S30] |
| Previous published releases | v1.1.27: **2026-10-07 00:28:32 UTC**; v1.1.26: **2026-10-01 21:14:28 UTC** | GitHub release listing [S30] |
| Historical release baseline | v1.0.0: **2026-06-17 15:18:35 UTC**, `prerelease=false`; independently retrieved by coordinating researcher | Published release evidence, not a GA announcement [S57] |
| Implementation source | No public app implementation repository established. A support repository and tag archives do not establish open-source application code | [S29, S32, S33] |
| Related CLI and SDK | CLI is the stated foundation; `github/copilot-sdk` is the official programmatic SDK repository, not the app source | [S01, S34] |
| Sandbox implementation | Cross-surface sandbox docs link `microsoft/mxc`; cloud sandbox uses Azure Container Apps Sandboxes. Neither is an app implementation repository | [S12] |
| Product-wide release status | Current app concept/quickstart do not label the whole app preview. Release metadata is non-prerelease, but this alone does **not** prove a GA announcement or GA date | [S01, S02, S30] |
| Feature preview status | BYOK, cloud sandboxes, computer use, and `/security-review` explicitly public preview | [S03, S05, S09, S12] |

No first-launch date, public-preview launch date, or app GA announcement/date
was verified. Repository creation dates, changelog ordering, asset timestamps,
and the release tag's commit date are not substitutes for those events.

### Platforms and installation

The app supports macOS, Linux, and Windows. Git and a GitHub account are
quickstart prerequisites. GitHub Enterprise Cloud data residency is supported
through **Use GitHub Enterprise** and a `*.ghe.com` hostname;
**GitHub Enterprise Server is not supported**. Projects can be local folders,
existing local repositories, GitHub clones, or other Git URLs, including Azure
DevOps. GitHub-native PR functions should not be presumed identical for every
non-GitHub remote. [S01, S02]

Release v1.1.28's expanded asset list was retrieved live:

| OS/architecture | Published packaging | Installation recommendation, untested |
|---|---|---|
| macOS arm64, x64 | `.dmg`, `.zip`, `.tar.gz`, signature sidecars for tarballs | Use the matching README-linked DMG; follow the installer/OS prompts |
| Windows arm64, x64 | `-setup.exe`, `.msi` | Use the matching EXE installer; MSI is also published |
| Linux arm64, x64 | `.AppImage`, `.deb`, `.rpm` | Choose the packaging matching the architecture/distribution |
| Release support | `latest.json` updater manifest; GitHub-generated tag ZIP/tar archives | Archives are not proof of app source or a source-build procedure |

These are **published asset listings**, not downloaded or signature-verified
binaries. The README only advertises Linux x64 AppImage, whereas the current
release also lists Linux arm64, DEB, and RPM. [S29, S31]

The generic OS list is not a minimum-OS, Linux-distribution, CPU/RAM, or disk
requirements matrix. Those general app minimums were not verified. Local
sandboxing has additional requirements: macOS 15+ is the documented tested
Seatbelt baseline; Linux needs bubblewrap 0.5.0+ and `slirp4netns`, with further
network prerequisites in S12; Windows needs the specified September 2026
Windows 11 updates or newer. Do not confuse these sandbox requirements with
the app's overall ability to launch. [S10–S12]

### Updating and entitlement

First-party changelog evidence confirms **General → Automatically check for
updates**: turning it off disables background checks at launch and hourly.
The **Check for updates** command-palette action checks manually and opens
General settings. These were introduced in v1.0.4 and v1.1.18 respectively.
An update-channel setting is mentioned, but its choices and default were not
verified. Do not apply `copilot update` to the desktop app: that command updates
the CLI. [S35, S26]

All plans include app availability; the repository README explicitly includes
Free and Student. BYOK can avoid requiring a Copilot plan, not GitHub identity.
Access to cloud sandboxes, cloud agent automations, particular models, or
organization resources has additional policy/plan requirements. Installing the
app does not authorize tracker writes or merge actions. [S01, S02, S05, S13,
S18, S29]

## 2. Architecture, execution, context, and development lifecycle

### Documented execution model

```text
Human → Copilot app UI → CLI-based agent runtime → permitted tools
                              ├─ local repository
                              ├─ local Git worktree + branch
                              └─ GitHub-hosted cloud sandbox

Canvas UI ⇄ extension capabilities/shared state
GitHub integration ⇄ repositories / issues / PRs / reviews / checks
Model traffic → GitHub-hosted model or configured external provider
```

This is a conceptual summary, not a reverse-engineered process diagram.
Electron/Tauri, bundled-runtime version, IPC transport, process topology,
render isolation, internal database schema, and local daemon APIs were **not**
verified. A narrow app release note does establish some SDK usage:
v1.0.4 says desktop CLI sessions can enable memory through typed
`copilot-sdk` session configuration when the Session memory experiment is
enabled. This is conditional integration evidence, not proof of the full
desktop architecture, SDK version, public extension API, or app IPC.
SDK JSON-RPC is not evidence of the app's own IPC. [S01, S06, S34, S35]

The session creation flow explicitly offers a new worktree, the local
repository, or a cloud sandbox. Therefore “every local session always creates
a worktree” is too broad even though the support README summarizes isolated
worktrees. Worktrees separate branch/files; they do not restrict a process's
access elsewhere on the computer. Shared resources, credentials, caches,
ports, and remote side effects can still conflict. [S03, S11, S29]

Cloud sandbox sessions are isolated ephemeral Linux environments, separate
from the computer and other sessions. They can be active, stopped with a
snapshot, or deleted irrecoverably. Stopping restores files, environment
variables, and in-progress state on resume. A cloud sandbox is not necessarily
the same execution product as a GitHub cloud-agent automation. [S12, S18]

### Context and collaboration

* **App-documented:** issue-started sessions include issue context; `#`
  references issues, `@` adds files, and attachments can include files/folders.
  Chats have saved conversation history but no dedicated branch/worktree.
  Models and reasoning can change during a session. [S03, S07, S08]
* **App-documented:** `/context` inspects usage; `/compact` summarizes earlier
  conversation; `/clear` resets it; `/fork` forks at the latest turn;
  `/merge-to-parent` requires a forked session. [S08]
* **App-documented:** `/fleet` runs multiple agents for one task; `/spawn`
  creates a focused child session; `/orchestrate` coordinates sessions and
  repositories. These are different from simply opening independent
  worktrees. Rubber duck provides critique using another model; the main
  agent decides how to apply it. [S03, S08, S14]
* **Release-evidence:** the coordinating researcher's v1.1.28 release API
  identifies the `/fork` restriction specifically for **WSL-host sessions**,
  where it was never supported. The retrieved repository changelog instead
  says “remote host”; these sources differ in breadth, so this report does
  not generalize the restriction to every remote-host session. The release
  also fixes child-session reasoning/context inheritance. Command availability
  is context/build dependent. [S30, S35]
* **Unverified:** exact context-window sizes per app/model, compaction
  threshold, maximum parallel agents, maximum projects, auto routing of BYOK
  models, and custom-agent child-context inheritance for every app workflow.
  Generic model tables are not an app entitlement list. [S03, S19]

### Review, commit, PR, and landing

Ordinary workspaces expose **Changes** for diffs, **Create PR**, and **PR**.
My work supports filtered issue/PR lists, CI status, Files changed, review
comments, and submitted reviews. Agents choose issue templates and follow PR
templates. Fix controls can address review comments or failing checks.
`/review` and preview `/security-review` are app-documented; neither replaces
CI, independent review, CodeQL, Dependabot, or secret scanning. [S02, S03,
S07, S08]

**Agent merge** explicitly reads the PR, works on blockers, and merges when
GitHub permits. It runs in the background, survives app restarts, and switches
off after merge. Enabling it is a meaningful authorization to mutate and land
work, not a passive CI viewer. [S07]

Writing and adding commits are supported development activities, and recent
release notes explicitly mention local commits. Exact commit UI controls,
signing policy, author/trailer defaults, push behavior, and protection-rule
interactions were not established as app contracts. Repository approval and
test requirements still apply. The CLI's `includeCoAuthoredBy` setting is
**CLI-only evidence**, not a verified app setting. [S35, S21, R01]

## 3. Configuration inventory: scope, formats, defaults, precedence

**No complete app settings-file schema was found.** Use documented UI fields
for app configuration rather than inventing JSON keys. “Not specified” below
is intentional. A referenced CLI schema is not silently promoted to app
parity. There is no verified universal “system > user > repository > prompt”
instruction hierarchy.
There is one verified **narrow** exception: v0.2.15's changelog says
`AGENTS.md`/`CLAUDE.md` repository guidance takes precedence over app general
advice when deciding in-place PR behavior for a branch workspace. This shows
app use of those files in that workflow; it does not specify full discovery,
nested-file handling, or precedence for every instruction. [S35]

### App-owned and explicitly shared configuration

| Area | Location / format / scope | Default and precedence / reload | Evidence boundary |
|---|---|---|---|
| Global instructions | Settings → Sessions → Instructions → App instructions; text; all projects/sessions | Default contents, file backing, conflict precedence, live reload not specified | App-documented [S04] |
| Project instructions | Settings → Projects → repository → Instructions; text; selected repository | Applies to every session for that repository; interaction with App instructions/files not specified | App-documented [S04] |
| `AGENTS.md` and repository instruction files | Root/nested `AGENTS.md`; `.github/copilot-instructions.md`; `.github/instructions/**/*.instructions.md`; Markdown, path-specific YAML `applyTo` | App v0.2.15 confirms AGENTS/CLAUDE guidance for in-place PR workflow and narrow precedence over app advice. CLI combines applicable files without general precedence; full app algorithm remains unspecified | App release-evidence for narrow case; CLI-only broader discovery [S16, S22, S35] |
| Personal file instructions | `~/.copilot/copilot-instructions.md`, `~/.copilot/instructions/**/*.instructions.md`; Markdown | CLI supports `COPILOT_HOME`, additional `COPILOT_CUSTOM_INSTRUCTIONS_DIRS`, `/instructions`, restart/resume reload. Do not presume these app switches | CLI-only [S16, S21] |
| Skill folders | Project `.github/skills`, `.claude/skills`, `.agents/skills`; personal `~/.copilot/skills`, `~/.agents/skills`; each contains `SKILL.md` with YAML `name`, `description`, Markdown body and optional assets | Relevant skills load as needed; app imports repository/CLI skills; app supports `/skills reload`. CLI says project same-name skill wins over personal; app dedup algorithm not separately stated | App-documented discovery; inherited-evidence schema/precedence [S04, S08, S15, S17, S21] |
| Custom agents | App picker or `/agent`; profiles are Markdown + YAML; `.github/agents/NAME.md`; org/enterprise `/agents/NAME.md` in designated `.github`/`.github-private` | Required description; tools omitted = all, `tools: []` = none; optional name/model. App-specific dedup and all frontmatter support not enumerated | App-documented feature and shared concept; detailed reference qualified [S04, S23, S24] |
| Personal custom agents | `~/.copilot/agents/*.agent.md`; project `.github/agents/*.agent.md` | CLI personal same-ID agent wins; ID based on filename, not display name; restart CLI to load | CLI-only exact precedence/reload [S21, S25] |
| MCP | Customize → MCP / Installed; repository and CLI MCP configurations automatically available | UI installs/manages servers. Exact imported file formats/order come from CLI article linked by app, below | App-documented inheritance [S04, S20] |
| Plugins / marketplaces | Customize → Plugins; marketplace chooser/settings accepts GitHub repo or Git URL | Packages may carry skills, hooks, agents, MCP, Canvas. UI confirms installation. Default marketplace list, local backing path, update defaults not specified | App-documented [S04] |
| Canvas | Project `.github/extensions/<name>/`; personal `~/.copilot/extensions/<name>/`; commonly `package.json`, `extension.mjs`, optional JSON artifacts | Shared versus personal scope explicit; right-side panel; collision precedence, lifecycle APIs and secret-request contract not specified | App-documented structure [S06] |
| Model and effort | Per-session picker / `/model`; Auto; external models after provider setup | Change any time; effort costs latency/tokens; hard-coded app default model/effort not specified | App-documented [S03, S08] |
| Auto tiers | Efficiency, Balance, Intelligence | Preferences trade cost/latency/quality; routes only eligible models; paid plans 10% model-cost discount | App-documented [S19] |
| Providers | Settings → Model providers → Add provider; provider-dependent display name, base URL, API key | Credentials in system credential store, never displayed in UI; no app file schema/endpoint auth precedence specified | App-documented, preview [S05] |
| GitHub authentication | Onboarding Sign in to GitHub / Use GitHub Enterprise | Required even with BYOK. No app PAT/env precedence or enterprise-token storage fallback established | App-documented [S02, S05] |
| Tool permissions | Settings → Sessions → Tool Permissions; `/allow-all-tools` or `/yolo`; `/reset-allowed-tools` | All-tools auto-approval is optional and can be managed-blocked. v1.1.27 keeps new untrusted local repositories on Always ask until trusted | App-documented plus release-evidence [S08, S09, S35] |
| Local sandbox switch | Project Settings → Sandbox → Sandbox new sessions; active `/sandbox on` or `off` | Off unless managed-required. Active choice survives restart, overrides project default; before-session command changes project default. Bare `/sandbox` does **not** open the CLI configuration UI in the app | App-documented [S10, S11] |
| Sandbox paths | Project Additional read/write, Additional read-only, Denied folder lists | Workspace/CWD read/write by default; more-specific denied folder stays denied; changes need restart/new session | App-documented [S11] |
| Sandbox networking | Project Outbound internet and Local network toggles | **Both on by default in app**. Linux spawned processes cannot directly reach computer localhost; in-process/proxy behavior differs | App-documented [S11, S12] |
| Sandbox credentials | Project Git credentials and GitHub CLI credentials toggles | Both on; switching off can block authenticated push/PR commands. App UI exposes fewer controls than CLI | App-documented [S11, S12] |
| Sandbox bypass | Run outside the sandbox? prompt | One-command approval or temporary session disable if policy permits. Temporary disable ends on restart/reattach; unlike saved `/sandbox off` | App-documented [S10] |
| Computer use | Settings → Computer Use; `/computer on`, `off`, `show`; local macOS/Windows | Disabled by default; tool deny beats saved/automatic approval. Always allow saved locally and shared with CLI on same computer; deleting saved approval does not revoke current session grant | App-documented, preview [S09, S27] |
| Voice dictation | Settings → Voice dictation; shortcut, OS microphone permission, downloaded local transcription model | Must configure before use; default shortcut/model not specified | App-documented [S03] |
| Session storage/sync | `~/.copilot/session-state/` and local SQLite subset; account sync | Local sessions sync by default, unshared by default; org policy can prevent sync; app delete immediately deletes synced copy too | App-documented cross-surface [S36] |
| Shared sync controls | CLI config reference `remote: "on"`/`"off"` and `remoteExport: boolean` | Defaults `"on"` and `true`; `remote="off"` disables sync/remote control; remoteSessions/CLI remote flag can still enable export over remoteExport=false | Explicit shared cross-reference, not generic settings parity [S21, S36] |
| Automations | App Automations UI; prompt, project, trigger(s), model, effort, agent; optional cloud tools | Manual/hourly/daily/weekly, local CRON, issue/PR events; cloud runs while computer off. No local configuration filename, concurrency, timezone/DST or missed-run guarantees stated | App-documented [S13] |
| Updates | General → Automatically check for updates; command palette Check for updates | Disabling background checks stops launch/hourly checks; manual still works; channel/default unspecified | Release-evidence [S35] |

### Imported CLI formats: useful evidence, not guaranteed app parity

The app explicitly imports CLI/repository MCP servers and links S20, making
these exact formats worth recording as **inherited-evidence**:

| CLI configuration | Format / exact documented behavior | App caveat |
|---|---|---|
| `~/.copilot/mcp-config.json` | JSON `mcpServers` object; local/stdio uses `type`, `command`, `args`, `env`, `tools`; HTTP/SSE uses `url`, `headers`, `tools`; default tools `*` | App import is documented; avoid raw committed secrets or assuming every transport UI behaves identically |
| `.mcp.json`, `.github/mcp.json` | `mcpServers` or bare server-name map; files toward CWD win, `.mcp.json` wins over `.github/mcp.json` in same directory, project wins over user | CLI order explicitly verified; app-specific collision and trust UI should be tested |
| MCP subprocess environment | CLI automatically inherits PATH; other variables explicitly configured in `env`; project MCP needs trusted directory | Not a statement that app GUI inherits login-shell environment |
| `.vscode/mcp.json` | CLI does **not** read it; unsupported top-level `servers` | Do not promise app import merely because VS Code supports it |
| `~/.copilot/settings.json` | JSONC, personal CLI settings; `.github/copilot/settings.json` and `.local.json` only support listed repo-overridable keys and directional merges | No verified whole-file app schema. `config.json` is CLI internal state, not current user settings |
| `~/.copilot/providers.json` | JSON `providers`/`models`; `COPILOT_PROVIDERS_CONFIG` overrides path; registry declarations take precedence over legacy `COPILOT_PROVIDER_*` | **CLI-only**, not the app's documented provider/credential storage procedure |
| CLI authentication environment | `COPILOT_GITHUB_TOKEN` > `GH_TOKEN` > `GITHUB_TOKEN`; fine-grained PAT Copilot Requests permission; no classic PAT | **CLI-only**, not app onboarding/token precedence |
| CLI logs/permissions/LSP | `~/.copilot/logs/`, `permissions-config.json`, `lsp-config.json`; linked worktrees share CLI saved permissions with main repo root | **CLI-only** paths/behavior unless explicitly shared by S36 |
| CLI custom-agent subagent option | `include-custom-instructions: true`; default subagent does not receive repository instructions | **CLI-only** exact option/default; explicitly pass this repo's constraints to app child tasks instead of assuming inheritance |
| CLI hook sources | Policy hooks, user hooks, project `.github/hooks/*.json`, inline settings hooks, plugin hooks combine; JSON version 1; timeoutSec default 30 | App plugin hooks and v1.1.27 repository hook/extension acceptance are confirmed; CLI path/event/output parity remains unverified |

Sources: [S16, S20, S21, S25, S26, S37]. CLI switches such as `COPILOT_HOME`,
`--secret-env-vars`, `--available-tools`, and `--deny-tool` should not be
presented as verified app configuration. `HTTP_PROXY`/`HTTPS_PROXY` behavior
and GUI-shell environment inheritance also remain unverified for the app.

### Organization/enterprise governance

The **app policy** is default-enabled and separate from CLI policy. Cloud
Sandbox access is a further policy, **disabled by default for organizations/
enterprises**. Cloud-agent automations have still other access gates. [S01,
S12, S13]

The managed-settings reference explicitly lists app support for:
`permissions.disableBypassPermissionsMode`, `permissions.deny`, `ask`, `allow`,
`features.computerUse`, `model`, `enabledPlugins`, `extraKnownMarketplaces`,
`strictKnownMarketplaces`, `remoteControl`, `allowedMcpServers`,
`deniedMcpServers`, and `sandbox`. This researcher's Markdown API response and
the coordinator's independently inspected **raw canonical HTML table agree**:
app **`autoTier` and `telemetry` are not supported**, while managed
`remoteControl` and both MCP allow/deny keys are supported. A simplified-page
retrieval returned different cells; raw headers/cells resolve that extraction
discrepancy. Auto tiers and `/remote` feature availability alone would not
establish managed-key support. Confirm effective enforcement on the installed
build before security rollout. [S38]

| Managed configuration | Paths / formats / default and precedence |
|---|---|
| Server-managed | Designated enterprise `.github-private` repository: `copilot/managed-settings.json`, `copilot/team-mappings.json`, `copilot/teams/*.json`; JSON; eligible keys can use `{"overridable": VALUE}`; team file replaces wrapped value |
| Native MDM | Windows `HKLM\SOFTWARE\Policies\GitHubCopilot`, REG_SZ values; macOS forced preferences `com.github.copilot`, string values; nested keys use dots and arrays/booleans use JSON text. No native Linux MDM |
| File-managed | macOS `/Library/Application Support/GitHubCopilot/managed-settings.json`; Windows `%ProgramFiles%\GitHubCopilot\managed-settings.json`; Linux `/etc/github-copilot/managed-settings.json` |
| General precedence | MDM > server-managed > file-managed > user. Sandbox and granular permission lists compose restrictively rather than simply replacing. Server policy refresh about hourly; restart/sign-in refreshes; file-based changes require client restart |
| Operation permissions | `deny > ask > allow`; managed ask requires fresh one-time human approval and cannot be satisfied by YOLO/saved approvals/hooks. Allow lists intersect across defining sources. Supported unmatched operations default to approval when rules/allow list declared |
| Permission selectors | `Shell(...)`, compatible `Bash(...)`/`PowerShell(...)`, `Read(...)`, `Edit(...)`/`Write(...)`, `Domain(...)`; exact selector semantics in S38, not arbitrary regex |
| All-tools bypass | `permissions.disableBypassPermissionsMode: "disable"` blocks app Allow all. It is a string, **not an invented Boolean** |
| Computer use | `features.computerUse: false` prevents enabling; true/omitted leaves local choice |
| MCP identity/access | App support verified against raw table. Allowlist omit = unrestricted subject to deny; empty = block except built-in defaults. Allowlists intersect; denylists union and win, except first-party built-ins are exempt. `serverName` exact; `serverCommand` exact command/arguments; `serverUrl` documented wildcards after canonicalization |
| Plugin governance | `enabledPlugins` maps `PLUGIN@MARKETPLACE` to Boolean. `strictKnownMarketplaces: []` locks down install; `extraKnownMarketplaces` adds sources; managed marketplace `autoUpdate` locks update choice |
| Remote control | App support verified against raw table. `remoteControl.mode`: disabled, requireSSO, enabled; requireSSO needs `githubDotComOrganizations`. This managed policy is distinct from app `/remote` feature availability and shared session-sync settings |
| Model | Managed `model` sets a default, not a permanent model lock; per-conversation selection remains possible |

Sources: [S38–S40]. The CLI root-ownership/symlink validation rule for
file-managed policy is not assumed to be the app's validation algorithm.
The server-managed paths above belong to the designated enterprise governance
repository; they are **not configuration files to add to Decision Kit**.

The app runtime enforces the **complete managed `sandbox` object**, including
controls absent from project UI. UI shows project-requested policy, **not**
the complete effective policy or per-key managed locks. Verified managed keys
include: [S38]

* `enabled`, `failIfUnavailable`, `allowBypass`;
* `addCurrentWorkingDirectory`, `sandboxMcpServers`, `sandboxLspServers`,
  `allowDevToolAccess`, `auth.git`, `auth.gh`;
* `userPolicy.filesystem.readwritePaths`, `readonlyPaths`, `deniedPaths`;
* `userPolicy.network.allowOutbound`, `allowLocalNetwork`, `allowedHosts`,
  `blockedHosts`, `proxy`; `userPolicy.seatbelt.keychainAccess`;
* Windows `learningMode`, default `"deny"`; `"allow"` is native-device-only,
  permits otherwise blocked filesystem/process access, and is not normal
  sandbox protection.

Managed `enabled=true` forces sandbox on; adding `failIfUnavailable=true`
blocks model/tool execution if enforcement cannot be established.
`allowBypass=false` prohibits bypass. Managed grant lists intersect by exact
path string, denials add; an empty grant list does not automatically remove
separately assembled CWD/temp access. Network blocked hosts beat allowed hosts.
Host wildcard semantics are setting-specific: sandbox `*.example.com`
does not include the root, unlike managed `Domain(...)` matching. [S38]

## 4. Capabilities, limits, billing, data, and recovery

### Capability/status/surface matrix

“Documented” is evidence status, not an assertion of GA or a successful local
test. Feature-specific preview badges do not classify the entire app.

| Capability | Status / important boundary | Surface / evidence | Sources |
|---|---|---|---|
| Editing and tool-driven tests | Documented; subject to trust, approval and sandbox | App local sessions | S01, S03, S11 |
| Parallel worktrees and child agents | Documented; worktrees are not security isolation | App sessions/orchestration | S03, S14 |
| Interactive / Plan / Autopilot | Documented; autonomous mode is not unrestricted permission | App modes | S03, S08 |
| Model selection / Auto routing | Documented; paid Auto discount and plan restrictions apply | App model UI/billing | S01, S08 |
| BYOK | Public preview; GitHub sign-in still required | App provider UI, not CLI env schema | S05 |
| Skills / custom agents / plugins | Documented; imported formats need scope qualifications | App customization; inherited skill schema | S04, S15, S17 |
| MCP servers | Documented import; no assumed universal CLI precedence | App customization; inherited CLI JSON | S04, S20 |
| Canvas extensions | Documented; runtime/network trial remains untested here | App Canvas, repo/user extension scopes | S06 |
| Review / commits / PR / agent merge | Documented; GitHub merge gates still apply | App GitHub workflow | S07 |
| Local / cloud sandbox | Documented; cloud preview, distinct defaults and execution boundary | App session UI; not coding-agent job parity | S10, S11, S12 |
| Automations | Documented; cloud requires eligible private/internal repository | App local/cloud automation UI | S13 |
| Computer use | Public preview; local macOS/Windows, off by default | App desktop tools; not Linux/cloud desktop | S09, S27 |
| Headless programmable sessions | App API unverified; deep links require confirmation | CLI/SDK-only programmatic evidence | S26, S34, S44 |

### What is supported—and what is not established

**App-documented capabilities:** direct code edits/tests with permitted tools;
parallel workspaces; Interactive, Plan, Autopilot; selectable models/effort;
Auto routing; issue/PR review/check/merge work; custom agents, plugins, skills,
MCP; Canvas; automations; session history; voice dictation; local macOS/Windows
computer use. Relevant commands and built-in skills are listed in S08/S14,
not inferred from CLI slash-command catalogs.

**Important boundaries:**

1. **Plan is not a sandbox.** Reviewing a plan and limiting tool approvals
   still matter. Autopilot is autonomous execution; the v1.0.4 changelog says
   it returns to Interactive after finishing a task. Verify current state
   rather than assuming all future prompts are autonomous. [S03, S35]
2. **Local sandboxing is lightweight OS containment, not a VM.** Remote MCP
   runs elsewhere. OS/backend limitations differ; Windows proxy controls
   rely on programs honoring proxies, unlike macOS/Linux forced proxy
   routing. App denied-path enforcement fails closed if unsupported. [S12]
3. **No general app host/secret allowlist UI is documented.** The app's
   sandbox UI only exposes paths, broad network toggles, Git/gh credential
   switches. CLI masked-environment host injection is not a verified
   user-editable app feature; managed runtime controls can be richer. [S11,
   S38]
4. **Computer use sees potentially sensitive screens.** It can click/type
   the wrong control or repeat an action after timing/window changes.
   Prefer APIs/MCP/filesystem/browser tools. No Linux or cloud desktop
   computer-use support is established. Stop/Esc interrupts; avoid Always
   allow for high-impact applications. [S09, S27]
5. **Content exclusion is app-documented for Business/Enterprise** at
   enterprise/org/repository levels: excluded files are not context.
   That is not a substitute for filesystem permission enforcement or an
   assurance that every exported log is sanitized. [S01, S41]
6. **Public code blocking is not a guarantee here.** The app concept explicitly
   warns generated code may match public code even when Block is selected.
   Review provenance/licensing. Generic model filtering statements do not
   override the app-specific warning. [S01, S42, S43]
7. **No verified app headless runner/API contract.** Deep links launch UI and
   prefill/confirm sessions or automation drafts, not an unattended execution
   API. CLI `copilot app` is a launcher/fallback. CLI `-p`, server mode, SDK
   clients, and CLI cloud startup are separate surfaces. This researcher's
   sandbox concept response requires `--cloud --experimental`; the coordinator
   retrieved `--cloud` without that flag. Experimental gating is therefore
   source/build-dependent, not an app requirement;
   CLI cloud sessions cannot combine with `-p`/`-i`. [S12, S26, S34, S44]

### Billing and resource limits

GitHub-hosted model usage is token-based AI credits: input/output/cache costs
vary by model; **1 AI credit = $0.01 USD**. The app itself recommends
`/chronicle` cost analysis and choosing capability by task. Paid plans receive
10% Auto model-cost discount. `/usage` exposes plan/rate-limit information.
Do not repeat old fixed premium-request accounting as the current universal
app billing model. [S01, S08, S19, S45, S46]

As accessed, paid individual monthly allowances are Pro **1,500** credits
($10 subscription), Pro+ **7,000** ($39), Max **20,000** ($100), split into base
and changeable flex allotment. Free/Student have an allowance but this page
does not quantify it; they access models through Auto only. These are plan
facts, not an unlimited-app entitlement. Credits reset monthly at UTC month
start and do not carry over. Business/Enterprise credits pool at their billing
entity. BYOK provider prices, rate limits, and retention terms remain a
separate external-provider concern; app docs do not promise GitHub pays those
charges. [S05, S45, S46]

Cloud sandbox billing is **separate** from AI-credit model usage:

| Meter | Live documented price | Operational consequence |
|---|---|---|
| Compute | $0.000024 / running second | Stopped sandbox has no compute charge |
| Memory | $0.000003 / allocated GiB-second | Charged allocated, not actually used memory |
| Snapshot storage | $0.005 / GiB-month | Stopped snapshot charged until deletion |

The documented $10 monthly preview entitlement ended **July 2026**; do not
budget it at this October baseline. The page still calls cloud sandboxes public
preview, so “preview status” and “free entitlement period” must not be treated
as the same date. Repository owner is billed when in a repository; the owner
picker narrative uses CLI and its exact app UI was not independently tested.
Cloud-sandbox budgets are product/SKU budgets, **not Bundled AI credits**.
Stop usage when budget limit reached can block additional usage. [S12, S47]

Cloud **automations** instead start cloud-agent sessions using Actions minutes
and AI credits billed to their creator. They are scoped to one private/internal
repository, require write access and qualifying paid plans, and are **not
available in public repositories**. Automation definitions are creator-private
and not Git-versioned, but spawned session prompts/logs are visible to people
with repository access. Writer-trigger restrictions are enabled by default.
Local automation uptime/missed schedules were not documented as guarantees.
[S13, S18]

No app-specific numeric maximum for concurrency, worktrees, storage, context,
session duration, cloud CPU/RAM allocation, or BYOK model size was verified.
S48 describes AI-credit session caps for **CLI/SDK only**; do not advertise an
app cap based on that article. Worktree disk and local model resource costs
remain real even when sandbox isolation has no additional fee.

### Logs, privacy, and recovery

Local app/CLI complete session records live under
`~/.copilot/session-state/`; SQLite stores a queryable subset. Defaults sync to
the user's GitHub account but are unshared; Business/Enterprise **Store local
sessions in the Cloud** policy must be at least View from cloud. Relevant
session data can be sent to models when generating history insights.
**App deletion removes its synced copy immediately**, unlike the CLI's
prompted choice. Archive preserves history. [S03, S36]

App `/collect-debug-logs` can create an archive **or upload a secret gist**;
`/debug` copies debug JSON; `/export-gist` exports transcript. “Secret gist”
means unlisted, not a safe secret vault. GitHub's app README warns debug logs
may contain sensitive information. Inspect and redact before sharing.
Release v1.1.28 improves archive-path notifications and fixes gist-link
reporting. App-specific log directories, redaction guarantees, retention
periods, and encryption/backups were not verified. [S08, S29, S35]

Use `/restart-session` to keep history and apply sandbox policy changes.
Sandbox unavailable has Retry sandbox; unsupported enforcement blocks the
shell instead of silently unsandboxing it. v1.1.27/v1.1.28 document coordinator
Resume/recovery fixes and setup Stop/Retry. Cloud Stop preserves snapshot;
Delete removes it irrecoverably. Git commits/PRs and reviewed backups remain
better durable handoffs than assuming an interrupted agent's memory is complete.
[S10–S12, S35]

`/chronicle reindex` is an app-listed command. Detailed CLI recovery from
`session-store.db` corruption or copied session directories is **inherited-
evidence**, not authorization to delete or edit app state manually.
Do not change files while an app/CLI process may be writing them. [S08, S21,
S36, S49]

## 5. Decision Kit recommendations and untested reproduction

### Minimal configuration examples — **UNTESTED; illustrative, not installed**

**App-documented UI profile, recommended rather than factory defaults.**
Select Interactive and a new local worktree in the session composer [S03];
choose Always ask under Settings → Sessions → Tool Permissions [S08, S35];
enable Project Settings → Sandbox → Sandbox new sessions, turn off Outbound
internet and Local network for an offline deterministic trial, and leave
additional folders empty [S11]. Keep Settings → Computer Use disabled [S09].
Do not add BYOK credentials for this trial [S05]. These are actual UI controls,
**not** invented app JSON keys. Networking must be reconsidered explicitly
for Canvas loopback and live provider work; this profile is not evidence that
Canvas works under those restrictions.

**Inherited-evidence MCP JSON.** S20 documents this schema for
`~/.copilot/mcp-config.json` and project `.mcp.json`/`.github/mcp.json`; S04
documents app import. This uses a nonfunctional reserved-domain placeholder
and no credentials. Do not install or connect it: replace it only after
reviewing a real server, data flow, tool allowlist and app import/trust behavior.
The documented `["*"]` enables every server tool, so it is not a least-privilege
production choice. No app precedence beyond explicit import is asserted.

```json
{
  "mcpServers": {
    "reviewed-placeholder": {
      "type": "http",
      "url": "https://example.com/mcp",
      "headers": {},
      "tools": ["*"]
    }
  }
}
```

**Inherited-evidence skill schema; app-supported skill discovery.** A possible
`.github/skills/decision-kit-review/SKILL.md` contains required YAML
`name`/`description` and a Markdown instruction body [S15, S17]. This is only
a report example, not a proposed additional repository file or permission
enforcement mechanism.

```markdown
---
name: decision-kit-review
description: Review Decision Kit changes without modifying files.
---
Read AGENTS.md and the requested diff. Report evidence-backed findings.
Do not change Jev branch selection or the confidence gate.
Never request, print, persist, or log OPENROUTER_API_KEY.
```

**Enterprise-managed JSON, not repository configuration.** The following
minimal subset uses exact S38 selectors and the documented string value
`"disable"`. An authorized administrator deploys it through the managed
settings locations/process above, **not** a file in Decision Kit [S38, S39].
It denies SSH-key reads and requires fresh approval for matching push
commands; it is illustrative, not a complete exfiltration or Git-command
policy. Managed selectors are enforcement; the skill prose above is not.

```json
{
  "permissions": {
    "disableBypassPermissionsMode": "disable",
    "deny": ["Read(~/.ssh/**)"],
    "ask": ["Shell(git push *)"]
  }
}
```

### Safe default for this repository

1. Start with **Interactive**, a **new local worktree**, **Always ask** tool
   permissions, and explicitly enabled local sandboxing. Keep computer use,
   all-tools auto-approval, scheduled automation, and agent merge off.
   For design ambiguity use Plan/Chats before implementation. These are
   recommendations, not claims that every control has that factory default.
2. Preserve `AGENTS.md`: Node 20+, built-in APIs, extension wiring kept thin,
   authoritative Jev branch/probabilities/gate, LLM explanatory only.
   Do not weaken the confidence threshold to make a screenshot more decisive.
3. Use **deterministic demo mode first**. Do not put
   `OPENROUTER_API_KEY` in a prompt, deep link, committed config, UI input,
   MCP header file, Canvas artifact, transcript, or log.
   BYOK config for the host model is **not** the Decision Kit provider's
   extension environment request. Do not reuse/paste the key into host
   providers merely to make the Canvas live.
4. Inspect imported skills/MCP/plugin availability before invoking them;
   discovery does not grant execution/tracker permission. Do not install
   marketplace defaults without reviewing package provenance and tools.
   No new plugin, MCP bridge, A2A layer, or dependency is presently justified.
5. A Canvas trial may need loopback access to the per-instance `127.0.0.1`
   server. Test that narrow boundary before broadening network access.
   Linux sandbox subprocess localhost restrictions are especially relevant.
   Do not disable the entire sandbox merely because a preview fails.
6. The delivery nudge is advisory and intentionally limited. Its
   `.github/hooks/decision-kit.json` `postToolUse`/`additionalContext`
   delivery is **not app-verified**. Tests of synthetic hook payloads do not
   prove app event delivery, agent receipt, or faster human delivery.
   App hook presence is not entirely unknown: v1.1.27 specifically documents
   a composer reminder to revisit repository-content review and accept hooks
   and extensions for the session. That proves an app trust workflow exists,
   not this hook's exact path/events/output compatibility. [S35, S37]
7. Before any authorized code commit, run the repository's `npm test` and
   `npm run check`, inspect diff/secret exposure, and obtain independent
   review. The report author did not run those commands or commit; the parent
   independently ran them and reported 71 passing tests and a successful
   check, as recorded in the introduction. These are repository checks, not
   desktop-app validation.
   Read tracker/triage/domain guides before relevant operations, and confirm
   ticket breakdowns before publishing. [R01, R02]

### Parallel-agent policy

Use independent app worktrees for independent changes, or `/orchestrate`
for a specifically authorized multi-session task. Give each child a narrow
file/output scope and explicitly include Jev authority, secrets, no tracker/
merge authorization, and verification requirements. Do not assume every
child receives repository instructions. Separate implementer/reviewer roles;
do not split trivial lookups into agents or have several writers modify the
same file. [S08, S14, S25]

Worktrees do not isolate model budgets, API side effects, GitHub permissions,
or preview ports. Maintain one coordinator for shared contracts and landing.
The built-in rubber duck is useful criticism, not a second authoritative
decision gate. Human review stays mandatory for low confidence or explicit
Jev review signals. [S03, R02]

The current repository is public by README evidence; **cloud automations'
private/internal restriction prevents recommending them as a verified
delivery-nudge mechanism here**. A manually reviewed local automation trial
could be considered later, after actual event/runtime compatibility and
safe stop conditions are measured. Do not create it as part of research.
[S18, R02]

### SDK research boundary

For a separate headless research harness, investigate the **official
`github/copilot-sdk`**, not desktop deep links as an API. The SDK exposes the
CLI runtime through JSON-RPC and manages/attaches to a server process.
Its current README says GA and supports TypeScript, Python, Go, .NET, Java,
Rust; Node/Python/.NET bundle the CLI, other bindings differ. Those are
SDK-only facts, not a requirement to install an SDK for existing Canvas.
[S34]

The independently retrieved SDK release records identify **v1.0.19** as latest
stable, published **2026-10-09T16:17:38Z**, and **v1.0.20-preview.2** as newest
listed preview, published **2026-10-10T02:24:48Z**. These are SDK versions,
not the app's embedded SDK/CLI versions. [S54, S55]

Investigate explicit permission handling, read-only tool allowlisting, typed
custom tools, bounded context, persisted evidence IDs, session limits, and
BYOK endpoint compatibility before approving an experiment. No harness is
implemented here. SDK-only provider `type`, `baseUrl`, `apiKey`, `wireApi`,
`bearerToken`, `bearerTokenProvider`, and callbacks are **not app config keys**.
The detailed SDK BYOK document allows bearer-token callbacks whereas its
README still says key-only/no managed identities; treat this discrepancy as a
reason to verify a pinned SDK/runtime combination. SDK BYOK can omit GitHub
authentication; **app BYOK cannot**. [S05, S34, S50]
The SDK README's prompt/allowance billing summary may also lag the live
token-based AI-credit references. Use S45/S46 for current billing economics,
and verify actual SDK usage reporting rather than importing old per-prompt
accounting. No stale CLI README model defaults or experimental-mode wording
is used to establish the app's current defaults.

### Reproducible app trial — **UNTESTED**

These are proposed manual steps for an authorized operator, not instructions
executed during this research:

1. Open the official download page or `github/app` releases. Record the
   chosen release, published timestamp, OS/architecture, and installer asset.
   Baseline comparison: v1.1.28. Install only after normal device approval.
2. Launch and sign in to GitHub; confirm app policy, account, repository
   access, billing owner, and model entitlement. Do not enable computer use.
3. Add the existing Decision Kit folder via Projects → Add project →
   Local folder or repository. Avoid cloning over or mutating the research
   checkout.
4. Set project sandbox defaults and least required paths/network/credentials;
   record requested policy and actual enforcement/errors separately.
   Select new worktree and Interactive; confirm Always ask.
5. In App/project instructions or kickoff text, explicitly require reading
   `AGENTS.md`/README, no edits/install/commit/tracker operations, synthetic
   data only, and deterministic mode. Do not assume file discovery merely
   because CLI supports `AGENTS.md`.
6. Inspect Customize → Installed/Skills/Canvas for this repository's
   customizations. If the existing extension is found, ask:
   **“Open the existing decision-kit Canvas without creating or modifying an
   extension. Use deterministic demo mode; do not request or display a key.”**
   `/create-canvas` authors a new Canvas; it is not a necessary step for
   opening this already-present one. [S06, R02]
7. Select each preset, edit only synthetic context, Run decision; inspect
   typed outcome, probability distribution, `0.72` confidence gate, explicit
   review signals, stage progression, rationale boundary, and loopback
   behavior. Record expected/actual and any denied capability.
8. Validate `run_preset`/`reset_state` schema failures and reset behavior if
   the app exposes these existing actions. Do not infer their availability
   solely from repository unit tests.
9. Only with separate approval, test the extension's documented
   `requestedEnvironmentVariables` flow using a secure host-supported
   mechanism. Record success/denial behavior without logging values.
   GUI environment loading and this exact app API remain unresolved.
   An unsuccessful live request must stay an explicit error, not fall back
   to a fixture. [R02]
10. Test the delivery hook separately with approved synthetic edits/events;
    verify agent-received `additionalContext`, session/worktree isolation,
    unsupported events, duplicate suppression, observe/off behavior.
    Do not create production feedback data or infer a causal efficiency gain.
11. Stop session, inspect diff, and preserve a sanitized evidence record.
    No PR/commit/agent merge is implied. Archive rather than delete if
    retaining evidence; review logs before any export.

Success criteria: existing Canvas opens without modification; no credential
disclosure; deterministic mode is clearly labeled; typed gate stays
authoritative; least privilege is enforced or failure is explicit; no
unauthorized side effects. Missing runtime features are recorded as unsupported
or unverified, not “fixed” through silent CLI-parity assumptions.

## 6. Maintenance, unresolved questions, and discrepancies

### Recheck checklist

- [ ] On each planned app upgrade, retrieve latest published release and
  platform assets; record stable/preview channel and exact build actually used.
- [ ] Compare current app concept/quickstart/how-tos/slash catalog against
  the prior source register; check feature-specific preview status.
- [ ] Revalidate managed-key **app support cells**, not just shared prose;
  especially autoTier/telemetry, sandbox enforcement, MCP/plugin allowlists.
- [ ] Recheck billing allowances, flex allotment, model prices, cloud meters,
  expired promotions, account owner, and stop-usage budgets.
- [ ] Re-run an authorized deterministic Canvas compatibility matrix across
  local worktree/repository and target OS; separately test cloud feasibility.
- [ ] Reverify secret requests, GUI environment inheritance, loopback access,
  hook event/output compatibility, and deny/ask behavior.
- [ ] Review synced session/privacy settings, saved desktop approvals, plugins,
  debug-export destinations, and actual retention before sharing evidence.
- [ ] Revisit concurrency, recovery, worktree storage cleanup, supported
  remote-host features, and requirements before autonomous/parallel adoption.
- [ ] Pin SDK/runtime for any separately approved harness; reconcile SDK
  README versus detailed auth docs before implementation.

### Open items

General app OS minimums/resources; product GA/launch date; app implementation
source/framework; bundled CLI version/API stability; complete app configuration
schema; app instruction-file discovery/precedence; personal-agent collision
rules; per-model/context/concurrency limits; provider discovery/tool-calling
compatibility; BYOK in cloud sessions; app token/env/proxy precedence; hooks
event coverage; Canvas extension lifecycle and secure environment API;
remote-host Canvas/terminal limitations; local automation uptime/timezone/
DST/missed-run behavior; credential/log redaction/retention; exact commit
metadata/signing; distribution signatures and update-channel defaults.

### Material discrepancies and scope corrections

| Observation | Safe interpretation |
|---|---|
| Prior `github/app` claim was unverified | Independently verified README, repository root/license, releases, and asset links now establish distribution/support identity, not source availability |
| Concept/README describe isolated worktrees, detailed session article offers local repository too | Isolation depends on execution choice; not every session has a new worktree |
| App is CLI-based but sandbox settings are explicitly separate | Never migrate all CLI config/flags/defaults blindly |
| App network defaults differ from CLI | App local network on; CLI local network off; platform restrictions still apply |
| App plugins and v1.1.27 repository acceptance explicitly mention hooks; hooks reference says CLI/cloud only | App hook presence/trust workflow confirmed; exact repository paths, events, and outputs still need verification |
| Custom-instruction support matrix lacks an app section; v0.2.15 mentions AGENTS/CLAUDE | App UI and narrow in-place PR guidance/precedence confirmed; full file discovery/modular algorithm remains unknown |
| Simplified managed-table extraction differed from raw HTML/API | Raw headers/cells independently agree: app autoTier/telemetry unsupported; remoteControl/MCP allow/deny supported. Feature availability is still distinct from policy support |
| Cloud sandbox still public preview, free entitlement ended July | October use must not assume a free $10 entitlement |
| App automation guide broad, linked cloud concept excludes public repos | Do not recommend cloud automations for public Decision Kit |
| App concept says `/chronicle cost tips`, command reference says `cost-tips` | Prefer documented command reference/current picker, record spelling discrepancy |
| App quickstart Changes versus v1.1.28 agent-thread Changes removal | Ordinary coding workspace retains Changes; agent-thread child diffs use Overview |
| Parent-retrieved v1.1.28 release API scopes `/fork` restriction to WSL; repository changelog says remote host | Record WSL restriction and source discrepancy; do not infer every remote-host session is affected |
| README Linux x64 versus release arm64/DEB/RPM too | Latest release list is broader than README links |
| Generic model content-filter prose versus app public-code warning | App-specific public-code limitation wins for this report |
| SDK README key-only auth versus detailed bearer-token callback docs | Pin and test SDK auth separately; do not port either to app without evidence |
| v1.0.4 app note mentions typed SDK memory configuration | Limited conditional desktop SDK use confirmed; does not establish full architecture or general SDK/app parity |
| SDK README prompt-allowance billing versus live token/AI-credit pricing | Treat README billing shorthand as potentially stale; use current billing references |
| Repository flags directory exists | Its global disable-only payload is not documented local configuration or an enable-feature mechanism |

### Retrieval and link-validation limitations

* The app concept HTML returned its exact title/status metadata and advertised
  GitHub's Markdown article API. Most docs were read through that API to avoid
  navigation/HTML noise; direct canonical URLs are registered below.
* The canonical concept page and every app how-to in the retrieved index
  returned live content, including Canvas, BYOK, automations, and deep links.
  App-only features are not based on cached snippets or secondary articles.
* The marketing page's simplified extraction returned only its title.
  Read-only `curl` inspection confirmed platform copy, download links,
  links to app docs, and `github/app` feedback.
* `gh.io/github-app-docs` and `gh.io/copilot-app-mac` could not resolve in
  this environment. Their redirects were **not** verified.
* The coordinating researcher reported hostname-resolution failures for
  candidate first-party blog launch, local-sandbox, and computer-use articles.
  Their proposed announcement dates were not independently established here
  and are not used as release/GA dates.
* Marketing's older `using-scheduled-workflows` docs link **did** resolve to
  `using-automations`, HTTP 200. This is a redirect, not a missing feature.
* A guessed older `/copilot/concepts/billing/copilot-billing` API path returned
  404; research switched to live linked pricing/usage references.
* Direct unauthenticated GitHub REST `releases/latest` returned 403.
  Available GitHub tools successfully returned latest/list release metadata;
  expanded asset HTML and `raw.githubusercontent.com` changelog provided
  independent readable evidence. Simplified release-page fetch showed an
  error, but read-only HTML retrieval exposed the release timestamp and assets.
* Some policy tables contain long inline SVG cells. Those were inspected
  with read-only standard `curl`/`sed`/`awk` pipelines, including the app
  column; pagination was used where necessary. No helper script was created.
  A simplified-page representation differed for four managed keys. The
  coordinator then independently inspected raw canonical HTML; its explicit
  headers/cells agreed with this researcher's re-fetched Markdown API.
  Governance conclusions use those agreeing raw/API representations, not
  the lossy simplified table.
* No installer binary/manifest contents, signatures, app process, cloud
  sandbox, SDK, extension runtime, actual credentials, or endpoint behavior
  was tested. No exhaustive link crawl or versioned docs snapshot was made.
  GitHub Docs are live and can change; source IDs denote access-date evidence,
  not a permanent release contract.

## Source register

All entries were accessed **2026-10-11**. Unless a release/version/date is
explicitly listed, the source is a live document without a verified publication
date. Canonical URLs are direct primary sources; GitHub Docs bodies were
usually retrieved with
`https://docs.github.com/api/article/body?pathname=<canonical-path>`.
Repository files were retrieved through GitHub contents tools at `main` and/or
raw URLs; the inspected `main` commit was separately resolved before recording
immutable equivalents. These pinned URL spellings are provenance references,
not a claim that every equivalent HTML URL was independently fetched.

| ID | Primary source / direct URL | Verified scope / version |
|---|---|---|
| S01 | https://docs.github.com/en/copilot/concepts/copilot-surfaces/github-copilot-app | App concept, availability, OS, feature list, exclusions/public code |
| S02 | https://docs.github.com/en/copilot/get-started/quickstart-copilot-app | Install/onboarding/projects/GHE boundaries |
| S03 | https://docs.github.com/en/copilot/how-tos/github-copilot-app/agent-sessions | Execution choices/modes/history/critique |
| S04 | https://docs.github.com/en/copilot/how-tos/github-copilot-app/customize-github-copilot-app | App instructions/imported skills/MCP/plugins/agents |
| S05 | https://docs.github.com/en/copilot/how-tos/github-copilot-app/use-byok-models | Preview BYOK/providers/credential store/GitHub sign-in |
| S06 | https://docs.github.com/en/copilot/how-tos/github-copilot-app/working-with-canvas-extensions | App Canvas workflow/scopes/structure |
| S07 | https://docs.github.com/en/copilot/how-tos/github-copilot-app/managing-issues-and-pull-requests | Reviews/templates/checks/agent merge |
| S08 | https://docs.github.com/en/copilot/reference/github-copilot-app-reference/slash-commands | App command catalog/context requirements |
| S09 | https://docs.github.com/en/copilot/concepts/agents/computer-use | Preview/default/permissions/risks |
| S10 | https://docs.github.com/en/copilot/how-tos/cloud-and-local-sandboxes/using-local-sandboxing | Explicit app subsection: on/off/bypass/restart semantics |
| S11 | https://docs.github.com/en/copilot/how-tos/cloud-and-local-sandboxes/configuring-local-sandbox-settings | App controls/defaults/platform/reload |
| S12 | https://docs.github.com/en/copilot/concepts/about-cloud-and-local-sandboxes | Explicit app/CLI differences, MXC/cloud/lifecycle/prices |
| S13 | https://docs.github.com/en/copilot/how-tos/github-copilot-app/using-automations | App local/cloud automation UI/triggers |
| S14 | https://docs.github.com/en/copilot/reference/github-copilot-app-reference/built-in-skills | App built-in skills/orchestration/pr-stack |
| S15 | https://docs.github.com/en/copilot/concepts/agents/about-agent-skills | App explicitly supported; shared skill paths |
| S16 | https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-custom-instructions | CLI instruction paths/combination/no general precedence |
| S17 | https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-skills | CLI SKILL.md schema/allowed-tools/reload details |
| S18 | https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-automations | Cloud automation private/internal/plans/privacy/billing |
| S19 | https://docs.github.com/en/copilot/concepts/models/auto-model-selection | App Auto GA/tiers/policies/discount |
| S20 | https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-mcp-servers | App-linked CLI MCP exact config/order/trust/transport |
| S21 | https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-config-dir-reference | CLI JSONC/state/provider/permission/settings; shared sync cross-reference |
| S22 | https://docs.github.com/en/copilot/reference/custom-instructions-support | Inspected support matrix; no app-specific section |
| S23 | https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-custom-agents | App use explicitly supported; profile format/levels |
| S24 | https://docs.github.com/en/copilot/reference/custom-agents-configuration | Shared profile properties/tools; surface qualification needed |
| S25 | https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/create-custom-agents-for-cli | CLI personal precedence/subagent instruction opt-in |
| S26 | https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference | CLI app launcher/update/auth/headless boundaries |
| S27 | https://docs.github.com/en/copilot/how-tos/github-copilot-app/computer-use | App enable/settings/approvals/Stop |
| S28 | https://github.com/features/ai/github-app | Official landing/download page; raw HTML inspected |
| S29 | https://github.com/github/app/blob/ba6c3e470bc877e19ab92a3afd7fc46c9f001e7e/README.md | Official public release/support home; current main observed at this commit |
| S30 | https://api.github.com/repos/github/app/releases/latest ; https://api.github.com/repos/github/app/releases?per_page=3 ; https://github.com/github/app/releases/tag/v1.1.28 | GitHub tools verified v1.1.28 latest, published 2026-10-09; direct REST retrieval restricted |
| S31 | https://github.com/github/app/releases/expanded_assets/v1.1.28 | Live asset names/URLs, not binary verification |
| S32 | https://github.com/github/app/tree/ba6c3e470bc877e19ab92a3afd7fc46c9f001e7e | Root listing inspected through GitHub contents API |
| S33 | https://github.com/github/app/blob/ba6c3e470bc877e19ab92a3afd7fc46c9f001e7e/License.md | All rights reserved, not open-source license |
| S34 | https://github.com/github/copilot-sdk | Current SDK README; GA/JSON-RPC/binding/auth claims, not app contract |
| S35 | https://github.com/github/app/blob/ba6c3e470bc877e19ab92a3afd7fc46c9f001e7e/changelog.md | v1.1.28/v1.1.27 and historical v1.1.18/v1.0.4/v0.2.15 app evidence, including conditional SDK use and narrow AGENTS precedence |
| S36 | https://docs.github.com/en/copilot/concepts/security-governance-and-network-settings/session-data | Explicit app storage/sync/sharing/deletion |
| S37 | https://docs.github.com/en/copilot/reference/hooks-reference | Explicit CLI/cloud supported surfaces; JSON/events/execution |
| S38 | https://docs.github.com/en/copilot/reference/enterprise-administrators/enterprise-managed-settings | App support cells and exact managed schema/precedence |
| S39 | https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-enterprise/use-managed-settings/get-started | Server paths/team mapping/refresh |
| S40 | https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-enterprise/use-managed-settings/deploy-managed-settings | MDM/file paths/format/deployment precedence |
| S41 | https://docs.github.com/en/copilot/concepts/context/content-exclusion | General exclusion reference, app support row |
| S42 | https://docs.github.com/en/copilot/how-tos/manage-your-account/manage-policies | Public-code policy generic behavior |
| S43 | https://docs.github.com/en/copilot/reference/ai-models/supported-models | General models/content filters; not complete app entitlement matrix |
| S44 | https://docs.github.com/en/copilot/how-tos/github-copilot-app/open-with-deep-links | App URL scheme/confirmation/parameter limits; not execution API |
| S45 | https://docs.github.com/en/copilot/reference/copilot-billing/models-and-pricing | Live token/AI-credit rates and pooling |
| S46 | https://docs.github.com/en/copilot/concepts/billing-and-usage/individuals/billing | Current paid allowances/reset/Auto discount |
| S47 | https://docs.github.com/en/billing/concepts/product-billing/cloud-and-local-sandboxes | Cloud meters/promotional end/budgets/account attribution |
| S48 | https://docs.github.com/en/copilot/tutorials/optimize-ai-usage | Efficiency guidance; session caps explicitly CLI/SDK |
| S49 | https://docs.github.com/en/copilot/how-tos/copilot-cli/use-copilot-cli/chronicle | App-linked CLI history/reindex/recovery details |
| S50 | https://raw.githubusercontent.com/github/copilot-sdk/main/docs/auth/byok.md | SDK-only exact provider fields/bearer callbacks/auth discrepancy |
| S51 | https://docs.github.com/en/copilot/how-tos/github-copilot-app | Live app how-to index; all eight listed articles followed |
| S52 | https://docs.github.com/en/copilot/reference/customization-cheat-sheet | Shared formats; matrix has no app column, not parity evidence |
| S53 | https://docs.github.com/en/copilot/reference/supported-surfaces-for-policies | Policy surface table; capability and policy support are distinct |
| S54 | https://github.com/github/copilot-sdk/releases/tag/v1.0.19 | Latest stable SDK release; 2026-10-09T16:17:38Z, prerelease=false; GitHub tools verified |
| S55 | https://github.com/github/copilot-sdk/releases/tag/v1.0.20-preview.2 | Newest listed SDK preview; 2026-10-10T02:24:48Z, prerelease=true; GitHub tools verified |
| S56 | https://github.com/github/app/blob/main/flags/feature-flags.md | Global disable-only payload; not local settings; GitHub contents API verified |
| S57 | https://github.com/github/app/releases/tag/v1.0.0 | Coordinating researcher verified release API: published 2026-06-17T15:18:35Z, prerelease=false; not a product GA declaration |
| R01 | [AGENTS.md](../../AGENTS.md) | Local contributor/permission/test requirements |
| R02 | [README.md](../../README.md) | Local Canvas/actions/environment/gate/demo/hook/workflow evidence |
| R03 | [Existing research-note convention](a2a-mcp-interoperability-2026-10-10.md) | Read for report style only; not Copilot app evidence |

Direct v1.1.28 installer URLs can be reproduced without a guessed download
host: append the selected asset name from section 1 to
`https://github.com/github/app/releases/download/v1.1.28/`, for example
`GitHub-Copilot-linux-x64.AppImage` or
`GitHub-Copilot-darwin-arm64.dmg`. Those exact links were present in S31.
