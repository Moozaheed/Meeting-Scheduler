# Logical Components — Meeting Scheduler & Invitation Card Generator

Per this stage's interview (Q3), the failure-domain inventory maps directly
onto the four components already defined in
`inception/domain-design/components.md`. All four are modules within one
Next.js deployment (not separately deployed services), so every isolation
boundary here is an **in-process boundary** (a React error boundary or a
try/catch translation layer), never a network/process boundary.

## Component Inventory

| Component | Failure domain | Isolation mechanism | Blast radius if it fails |
|---|---|---|---|
| Presentation | UI rendering, form state, navigation | React error boundary around the card preview/export subtree (`reliability-design.md`); standard React error boundaries elsewhere are out of this stage's scope beyond that one designed boundary | A rendering exception outside the card flow could still take down the page (no additional error boundaries designed for this release — acceptable given the low-stakes, internal-tool posture) |
| Scheduling | Meeting/agenda/attendee domain state, validation, orchestration of `PersistenceAdapter` and `CardGeneration` calls | Try/catch translation layer converting `PersistenceError` into an in-memory fallback (`reliability-design.md` NFR4.1); sole caller of `CardGeneration.renderPreview()`/`exportPdf()` on behalf of `Presentation`, per the affirmed layering mandate | A `PersistenceAdapter` or `CardGeneration` failure is contained here — neither ever propagates as an unhandled exception directly from a UI component |
| PersistenceAdapter | Browser storage (IndexedDB via `idb-keyval`) access | Every storage call catches and rethrows a typed `PersistenceError`; never lets a raw IndexedDB exception escape uncaught | Contained to `Scheduling`'s catch block — the rest of the app is unaffected |
| CardGeneration | PDF rendering (`@react-pdf/renderer`) and QR rendering (`qrcode.react`); called only by `Scheduling`, never directly by `Presentation` | React error boundary (shared with Presentation's card-flow boundary above) plus a typed `CardGenerationError` on the async export path, propagated through `Scheduling` | A rendering exception here shows the "PDF export failed — Try again" error state; the rest of the scheduling UI (list, form, agenda, attendees) remains fully functional |

## Shared Resource Identification

No shared resource exists across these four components beyond the same
in-memory JavaScript process — there is no shared database connection
pool, no shared cache, and no shared external service client. Each
component's failure domain is genuinely isolated by the boundaries above,
not merely nominally so.

## Bridge to Infrastructure Design

Because all four components deploy as one Next.js application (no
per-component infrastructure), Infrastructure Design has a single
deployment target (the Vercel project) rather than four — this component
inventory exists to inform code-level isolation (error boundaries,
try/catch translation), not infrastructure-level isolation (separate
compute, network segmentation).

## Assumptions & Open Questions

None.
