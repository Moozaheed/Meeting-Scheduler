# Decision Log — Ideation Phase

| # | Decision | Rationale | Stage |
|---|---|---|---|
| 1 | Composed a custom `meeting-card-scheduler` scope (initially 15 of 33 stages) rather than a stock scope | Local-only, zero-third-party-API, zero-cloud-database app needed full Inception design but no market research, team formation, or operations coverage | Workflow composition |
| 2 | Change Control set to `relaxed` for this intent | Solo, low-blast-radius build — recording a changed input and continuing avoids re-approval friction | Workflow composition |
| 3 | Primary problem: replace manual, ad-hoc meeting planning with one structured tool | User confirmed at Intent Capture | intent-capture |
| 4 | Target customer: a small team, hosted centrally, but each user's data stays local to their own browser (no shared database) | Resolved a real contradiction between an initial "solo local install" answer and a later "hosted for the team" answer; user confirmed the hosted interpretation | intent-capture |
| 5 | Attendees are not app users — they only receive the generated card | User confirmed | intent-capture |
| 6 | Success metric: fast create-to-PDF flow (a few minutes), no hard numeric target set yet | User confirmed; flagged by review as a follow-up for Requirements Analysis to pin down | intent-capture |
| 7 | All four feature areas (scheduling, agenda, attendees, invitation card) ship together — no deferred MVP subset | User confirmed | scope-definition |
| 8 | `.ics` calendar payload and fine visual theming deferred as Should/Could-Have, not Must-Have | User confirmed | scope-definition |
| 9 | Build sequencing: value-first, with the invitation card built after scheduling/agenda/attendee data exists | User confirmed | scope-definition |
| 10 | Hosting needs added to scope: deployment-pipeline + deployment-execution, and (per framework dependency rules) also nfr-design, infrastructure-design, and environment-provisioning | User confirmed the deployment need; the three extra stages were a structural requirement discovered when applying the change, not an independent request — user reviewed and accepted the resulting 20-stage scope | approval-handoff |
| 11 | Unlisted URL is sufficient access control for the hosted instance — no login required | User confirmed | scope-definition |
| 12 | Primary technical risk: client-side PDF/QR generation reliability across browsers | User confirmed at Approval & Handoff | approval-handoff |
| 13 | Go decision: proceed from Ideation into Inception | User confirmed, ready to commit time now | approval-handoff |

## Assumptions & Open Questions

- [assumption] The exact hosting mechanism (e.g., Vercel vs. a self-hosted server) is not yet decided — carried forward from Intent Capture, still open.
- [assumption] Whether any lightweight access control beyond the unlisted URL will be needed later is not yet decided — carried forward from Scope Definition.
- [assumption] No hard numeric success-metric target (e.g. "under 5 minutes") has been set yet — flagged by the Intent Capture review as a follow-up for Requirements Analysis.
