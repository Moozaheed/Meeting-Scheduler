# Scalability Requirements — Meeting Scheduler & Invitation Card Generator

No inception-level NFR category covers scalability (`requirements.md` defines
Performance, Accessibility, Browser/Device Compatibility, Reliability, and
Security only) — this requirement is newly derived from this stage's own
interview (Q5) and reverse-traced in `traceability.json`.

## NFR6.1 — Concurrent-user ceiling

| Field | Value |
|---|---|
| Requirement | The hosted instance is designed for under 20 concurrent users |
| Current baseline | New project, no production traffic yet |
| Growth model | Flat — a fixed small internal team, no growth projection driving this decision |
| Scaling approach | None required: a single Vercel serverless deployment (per `tech-stack-decisions.md`) comfortably covers this ceiling with its default auto-scaling, with no explicit load-balancing or capacity-planning NFR needed |
| Cost constraint | Stays within Vercel's free/hobby tier at this scale |
| Degradation policy | Not defined — out of proportion to a ceiling this low; if traffic materially exceeds 20 concurrent users, revisit this requirement rather than pre-building headroom now |
| Source | this stage's interview Q5 |

## Data-volume scalability

Not applicable: there is no shared or cloud database to scale (FR6.1). Each
browser's local storage scales independently with that browser's own data,
bounded only by the browser's storage quota — a per-user concern already
covered by NFR4.1's graceful-degradation requirement, not a scalability
concern for the hosted instance.

## Assumptions & Open Questions

None.
