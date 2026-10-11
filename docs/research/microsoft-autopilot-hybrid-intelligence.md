# Microsoft Autopilot and hybrid intelligence

**Checked:** 2026-10-11

**Status:** Partial verification. The Scout source was retrieved directly.
The two newer announcement pages could not be retrieved.

## Summary

Microsoft uses **Autopilot** for an always-on agent experience. The retrieved
Scout page explicitly states that Microsoft Scout is now Autopilot. It links
to a newer Copilot announcement. This confirms that the AI name is official,
not just a reference to Windows device deployment. [1]

Earlier research located an October announcement about **hybrid intelligence**
in Windows. Search-indexed text described a combination of local and cloud AI.
The full page remains unavailable in this session, so that description is a
research lead, not a fully verified account of the announcement. [3]

## Announcement timeline and evidence

| Source | Date reported in earlier research | Findings | Verification |
|---|---|---|---|
| Introducing Microsoft Scout: your always-on personal agent [1] | June 2, 2026 | The current page states that Scout is now Autopilot. It describes always-on agents with their own identity and organizational controls. | Current page body retrieved directly on October 11. The body does not show a publication date; the date is in the URL and was reported by earlier research. |
| Introducing the new Copilot with Home, Code and Autopilot [2] | September 25, 2026 | Earlier search-indexed text reported that Autopilot would expand to private preview at the end of the month. | The Scout page links to this source. Direct retrieval failed. The release claim and date were not independently rechecked. |
| Building Windows for hybrid intelligence [3] | October 7, 2026 | Earlier search-indexed text described local and cloud AI working together. | Direct retrieval failed. The title, date, and description remain search-reported leads. |

These are the latest announcements located by the earlier research. This is
not an exhaustive list through October 11. A planned rollout does not prove
that access has shipped.

## What the retrieved Scout page establishes

Microsoft describes Autopilots as agents that stay active in the background
and act without a new prompt for each task. They have their own identity and
operate within permissions and policies set by the user and organization. [1]

The page describes Scout connections to Teams, Outlook, OneDrive, and
SharePoint. It also describes a desktop app that can reach a browser, local
resources, and model context protocol servers. Work IQ supplies work context.
These are Microsoft's stated capabilities, not results of tests in this
repository. [1]

Microsoft states that each agent has a governed Entra identity. Approved
resources and destinations limit access. Sensitive actions can require human
approval. The page also states that Microsoft Purview policies apply before
data is sent or written. These are vendor claims; no independent security
assessment was performed. [1]

The retrieved page describes private preview and an experimental Frontier
release. It lists Frontier enrollment, Intune policy configuration, opt-in
attestation, and a GitHub Copilot license as access requirements. This is
evidence of what the page currently says, not proof of general availability
or of the current requirements for the renamed experience. [1]

## Keep the terms separate

- **Copilot Autopilot:** The AI agent name confirmed by the Scout page. [1]
- **Hybrid intelligence:** The local/cloud AI approach reported in the Windows
  announcement's indexed text. No standalone product or complete release
  status was verified. [3]
- **Windows Autopilot:** A separate Windows device setup and deployment
  service. Its Microsoft Learn overview is listed for reference, but was not
  retrieved in this research. [4]

The sources reviewed do not establish that Copilot Autopilot depends on the
Windows hybrid intelligence architecture. Do not infer a shared release,
integration, or availability from the names.

## Verification limits

The earlier research used live-search results pointing to Microsoft sources.
This follow-up successfully retrieved the Scout page. Requests for the
September 25 and October 7 pages failed at hostname resolution. That failure
does not show that the pages are absent.

No product was installed or tested. Pricing, regions, model choices, current
preview enrollment, and general availability were not verified. Earlier
search results also mentioned Microsoft Execution Containers; this note does
not assert their release status because the original source was not read.

Before making a deployment decision, retrieve the newer announcements and
their linked setup documentation. Check actual access, supported actions,
approval rules, data handling, and release status.

## Sources

1. [Microsoft: Introducing Microsoft Scout, your always-on personal agent](https://www.microsoft.com/en-us/copilot/blog/2026/06/02/introducing-microsoft-scout-your-always-on-personal-agent/).
   Current body retrieved directly on 2026-10-11; includes the Autopilot rename
   and a link to source 2.
2. [Microsoft: Introducing the new Copilot with Home, Code and Autopilot](https://blogs.microsoft.com/blog/2026/09/25/introducing-the-new-copilot-with-home-code-and-autopilot/).
   Earlier search-reported announcement; direct retrieval failed on 2026-10-11.
3. [Windows Blog: Building Windows for hybrid intelligence](https://blogs.windows.com/windowsexperience/2026/10/07/building-windows-for-hybrid-intelligence/).
   Earlier search-reported announcement; direct retrieval failed on 2026-10-11.
4. [Microsoft Learn: Windows Autopilot overview](https://learn.microsoft.com/en-us/autopilot/overview).
   Reference for the separate device deployment service; not retrieved.
