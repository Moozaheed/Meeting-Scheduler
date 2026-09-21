# Domain Design — Questions

## Sources

- [desc] Initial description: "Initiate a full-stack local web application for a Meeting Scheduler & Invitation Card Generator with zero third-party API dependencies. [...full text carried from Intent Capture's Sources register...]"

The affirmed team practices (`team.md`) already mandate a four-layer architecture (UI → domain/state → persistence, and a separate card-generation engine), so this stage's questions largely confirm how that maps onto discrete Domain Design components rather than exploring alternatives from scratch.

## Questions

### Q1. Does a four-component decomposition matching the affirmed layers make sense: a Scheduling domain component (owns Meeting/Agenda/Attendee data and business rules), a Persistence adapter component (browser storage), a Card Generation engine component (PDF/QR), and a Presentation component (UI orchestration)?
- A. Yes — that four-way split matches the mandated layering exactly
- B. A different split (please specify)
- X. Other (please specify)

[Answer]: A. Yes — that four-way split matches the mandated layering exactly

### Q2. Should the Persistence adapter be its own distinct component, or folded into the Scheduling domain component as an internal implementation detail?
Trade-off: as its own component, it's independently testable and swappable (e.g. if IndexedDB is later replaced by local SQLite, per the original description's alternative). Folded in, there's one fewer boundary to maintain for a small app.

- A. Keep Persistence as its own component — independent testability and the swap-to-SQLite option matter here
- B. Fold it into the Scheduling domain component — simpler for this app's size
- X. Other (please specify)

[Answer]: A. Keep Persistence as its own component — independent testability and the swap-to-SQLite option matter here

### Q3. Is the host's information (name, role, email) its own entity with an identity/lifecycle of its own, or just embedded attributes on each Meeting?
There's no host directory/list across meetings in the requirements — each meeting just records who's hosting it.

- A. Embedded attributes on Meeting — no separate Host entity, since hosts aren't tracked or reused across meetings
- B. A separate Host entity (please specify why — e.g. planning to reuse host profiles across meetings later)
- X. Other (please specify)

[Answer]: A. Embedded attributes on Meeting — no separate Host entity, since hosts aren't tracked or reused across meetings

### Q4. Should the Card Generation engine depend directly on the Scheduling domain component, or should Scheduling hand it already-validated plain data (no direct dependency)?
The affirmed practice states the card engine "does not read from the store or the DOM itself" — this question confirms the dependency direction in the component catalogue.

- A. No direct dependency — Presentation reads validated data from Scheduling and passes it as plain data into Card Generation, which has no awareness of Scheduling's existence
- B. Card Generation depends on Scheduling directly (please specify why)
- X. Other (please specify)

[Answer]: A. No direct dependency — Presentation reads validated data from Scheduling and passes it as plain data into Card Generation, which has no awareness of Scheduling's existence

## Assumptions & Open Questions

None.
