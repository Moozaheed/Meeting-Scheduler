# Stakeholder Map — Meeting Scheduler & Invitation Card Generator

## Key Stakeholders

| Stakeholder | Interest | Decision-Maker / Influencer | Source |
|---|---|---|---|
| The user (host/team member) | Wants a fast, self-contained way to schedule meetings, build agendas, manage attendees, and produce a polished invitation card/PDF without paid tools or manual busywork | Decision-maker — sole authority over scope and priority | [Q1][Q6] |
| Other team members (secondary users) | Each creates and manages their own meetings through the same centrally-hosted app instance; their meeting data stays private to their own browser session | Influencer only — not a formal decision-maker for scope | [Q2][Q11][Q10] |
| Meeting attendees | Receive the generated invitation card (PDF) containing meeting details, agenda, host info, and a QR code (meeting link or `.ics` payload); do not use the app directly | Not a decision-maker or influencer — passive recipients | [Q5][desc] |

## Decision-Makers vs. Influencers

The user is the sole decision-maker for scope and priority on this project — there is no shared or delegated decision authority [Q6]. Other team members who use the hosted app are influencers at most (their usage patterns may surface future requests) but hold no formal say over scope [Q2][Q11].

## Communication Requirements

No periodic reporting or communication cadence is required — this is run informally, with no stakeholder expecting scheduled updates [Q7].

## Assumptions & Open Questions

None.
