# Architecture Decision Records — Domain Design

## ADR-001: Four-component decomposition following the affirmed layering mandate

### Status
Accepted

### Context
The team's practices-discovery interview (Q6) already affirmed a strict layering rule: UI never talks to persistence or the card-generation engine directly, always through the domain/state layer. This mandate, combined with the requirements' four functional areas (scheduling/agenda/attendees, invitation-card generation, data persistence, and the UI itself), leaves little genuine ambiguity about where component boundaries should fall.

### Decision
Decompose the system into four components: Presentation (UI), Scheduling (domain/state — owns Meeting, AgendaItem, Attendee), PersistenceAdapter (browser storage), and CardGeneration (PDF/QR rendering). This was confirmed directly with the human (domain-design-questions.md Q1) rather than presented as a trade-off, since the affirmed layering mandate already determined the shape.

### Consequences
**Positive**: the component boundaries map 1:1 onto the already-affirmed file-organization structure (`components/`, `lib/store/`, `lib/persistence/`, `lib/card/`), so Functional Design and Code Generation have no ambiguity about where new logic belongs. **Negative**: none identified — this is the only shape consistent with the team's own mandated layering rule.

### Alternatives Rejected
None presented — with the layering mandate already affirmed as a hard constraint (not a preference), no other decomposition was viable enough to warrant a trade-off comparison at the gate.

---

## ADR-002: PersistenceAdapter is a separate component, not folded into Scheduling

### Status
Accepted

### Context
A small, single-repo app could reasonably fold browser-storage code directly into the domain/state layer as an implementation detail, reducing the number of boundaries to maintain. However, the original project description names local SQLite as an explicit alternative to IndexedDB/LocalStorage ("Local browser persistence (IndexedDB / LocalStorage) or local SQLite"), meaning the storage mechanism itself may change later.

### Decision
Keep PersistenceAdapter as its own component with a narrow save/load/clear/list interface that Scheduling depends on, rather than folding storage code directly into Scheduling.

### Consequences
**Positive**: Scheduling can be unit-tested against a fake/in-memory PersistenceAdapter without touching real browser storage; if the team later swaps IndexedDB/localStorage for local SQLite, only PersistenceAdapter's internals change — Scheduling's contract is untouched. **Negative**: one additional component boundary and interface to maintain, which is measurable overhead for an app this size.

### Alternatives Rejected
**Option A — Fold into Scheduling**: pros: fewer boundaries, less indirection for a small app; cons: couples business-rule tests to real (or heavily mocked) browser storage APIs, and a future storage-engine swap would require refactoring inside Scheduling rather than replacing one component. Rejected per the human's explicit choice (domain-design-questions.md Q2) — the swap-to-SQLite option and independent testability were judged worth the extra boundary.

---

## ADR-003: Host information is embedded on Meeting, not modeled as a separate entity

### Status
Accepted

### Context
Domain-Driven Design distinguishes entities (identity + lifecycle of their own) from value objects (defined by their attributes, embedded in an owning entity). The requirements capture host name, role, and contact email per meeting, with no requirement or user need to browse, reuse, or manage hosts independently across meetings.

### Decision
Model host information (name, role, email) as embedded attributes on the Meeting entity, not as a separate Host entity with its own identifier.

### Consequences
**Positive**: simpler schema — no host-management CRUD, no host-to-meeting relationship to maintain; matches how the requirements actually describe the data (host info travels with the meeting). **Negative**: if a future requirement needs to reuse host profiles across meetings (e.g., autofill from a saved host), this would require a later schema migration to extract Host into its own entity.

### Alternatives Rejected
**Option — separate Host entity**: pros: would support host reuse/autofill across meetings if that becomes a future requirement; cons: adds a CRUD surface and a Meeting→Host relationship with no current requirement driving it — premature for this scope. Rejected per the human's explicit choice (domain-design-questions.md Q3) — no current need to track or reuse hosts across meetings.

---

## ADR-004: CardGeneration has no dependency on Scheduling

### Status
Accepted

### Context
The affirmed team practice states the card-generation engine "does not read from the store or the DOM itself, which keeps it independently testable and reusable for the live preview vs. the actual export" — but this stage still needed to confirm the dependency direction explicitly for the component catalogue, since Presentation could in principle have let CardGeneration read from Scheduling directly to reduce prop-passing.

### Decision
CardGeneration takes already-validated plain data as input from Presentation; it has no dependency on Scheduling and no awareness that Scheduling exists.

### Consequences
**Positive**: CardGeneration can be tested and even reused (e.g., in a future context outside this app) with plain fixture data, with no need to construct or mock Scheduling state; the live preview and the actual PDF export both funnel through the same pure-function input contract. **Negative**: Presentation must explicitly read from Scheduling and pass data down — a small amount of extra wiring compared to letting CardGeneration reach into Scheduling directly.

### Alternatives Rejected
**Option — direct dependency**: pros: less prop-passing in Presentation; cons: couples the rendering engine to the domain/state layer's shape, undermining its independent testability and reusability. Rejected per the human's explicit choice (domain-design-questions.md Q4) and consistent with the already-affirmed practice.
