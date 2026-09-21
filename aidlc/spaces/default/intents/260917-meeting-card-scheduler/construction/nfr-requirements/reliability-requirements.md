# Reliability Requirements — Meeting Scheduler & Invitation Card Generator

## NFR4.1 — Graceful degradation on persistence failure

| Field | Value |
|---|---|
| Requirement | Persistence failures (storage quota exceeded, corrupted stored data, private-browsing storage restrictions) degrade gracefully to an in-memory session state with a non-blocking notice — never a crash |
| Fault-tolerance mechanism | `PersistenceAdapter` catches every storage-layer error and surfaces it to `Scheduling`, which falls back to in-memory state for the remainder of the session rather than propagating the exception |
| Source | requirements.md NFR4.1 |

## NFR4.2 — In-progress form data survives a failed save

| Field | Value |
|---|---|
| Requirement | A single failed save must not lose in-progress form data held in component state |
| Mechanism | `MeetingFormPage`'s draft state (`MeetingDraft`) is never cleared or overwritten until a save actually succeeds; a failed save leaves the draft exactly as the host left it |
| Source | requirements.md NFR4.2 |

## NFR4.3 — Backup and recovery: none (new, this stage)

| Field | Value |
|---|---|
| Requirement | No backup/export/import capability exists for browser-stored meeting data |
| RTO / RPO | Not defined — there is nothing to recover from, since there is no server-side copy of any meeting data to restore from |
| Accepted risk | A user clearing their browser data, switching browsers, or switching devices permanently loses their meetings. This is an explicit, accepted risk for this release, not an oversight |
| Future option | An export/import (backup) capability was considered and explicitly declined as a Should-Have for this release at this stage's interview (Q3) — revisit only if a future requirement demands it |
| Source | this stage's interview Q3 |

## Availability target

| Term | Value |
|---|---|
| SLO | Best-effort — no formal uptime target is set for this internal small-team tool |
| SLA | None — no external contractual commitment exists; there is no customer-facing agreement to honor |
| Rationale | Affirmed project deployment practice (`project.md` Mandated: auto-deploy to the single hosted instance on every merge to `main`, no manual confirmation step, no staging/production split) already signals a low-ceremony operational posture; a formal SLO would be disproportionate overhead for an internal tool with this risk profile |
| Source | this stage's interview Q3 |

## Assumptions & Open Questions

None.
