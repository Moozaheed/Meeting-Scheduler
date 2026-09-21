# Scope Definition & Prioritization — Questions

## Sources

- [desc] Initial description: "Initiate a full-stack local web application for a Meeting Scheduler & Invitation Card Generator with zero third-party API dependencies.\n\nScope & Core Features:\n1. Meeting Scheduling & Details:\n   - Form inputs: Meeting title, purpose/description, date, start time, end time/duration, timezone selector, meeting link (or physical location), and host profile (name, role/organization, contact email).\n   - Dynamic Agenda Builder: Add, edit, reorder, and remove itemized agenda topics with duration estimates and designated speaker names.\n   - Attendee Management: Input guest list (name, email, role/designation).\n\n2. Invitation Card Engine (PDF Export):\n   - Client-side or embedded local PDF generation (e.g., using @react-pdf/renderer or pdfkit). Strictly NO external SaaS APIs or microservices.\n   - Aesthetic Card Layout: Formatted as a sleek event card/invitation badge (dimensions: standard A5 or US Letter card).\n   - Visual Details: Clean typography, visual hierarchy, agenda timeline block, host details badge, and an auto-generated QR code (containing the meeting URL or .ics calendar payload).\n   - Live Preview: Split-screen or modal showing real-time card preview before downloading the PDF.\n\n3. Architecture & Constraints:\n   - Stack: Next.js (App Router), TypeScript, Tailwind CSS, and Lucide icons.\n   - Storage: Local browser persistence (IndexedDB / LocalStorage) or local SQLite with zero cloud database dependency.\n   - Portability: Single self-contained repository with standard npm run dev and npm run build workflows.\n\nLifecycle Guidance:\n- Run the Inception phase: Document requirements, edge cases, and component architecture inside aidlc-docs/.\n- Formulate an execution plan with discrete units of work and present the approval gate before generating code."
- [scope] Workflow-selected scope: `meeting-card-scheduler`.
- [memory:M1] `aidlc/spaces/default/memory/project.md#Corrections`: "When a request says \"zero cloud dependency\" or \"single self-contained repo\" but also implies multiple people need access, explicitly ask whether they mean centralized hosting (single deployed instance, still no shared database) before assuming a purely local, per-user install."

## Questions

### Q1. What is the minimum viable scope that delivers real value?
Given the four feature areas (meeting scheduling, agenda builder, attendee management, invitation-card PDF engine), is all of it needed for a first usable version, or could some part ship later?

- A. All four areas are needed together — a meeting isn't useful without an agenda, attendees, and a card to invite them with
- B. Scheduling + invitation card first; agenda builder and attendee management can be simplified/deferred initially
- C. Not yet defined
- X. Other (please specify)

[Answer]: A. All four areas are needed together — a meeting isn't useful without an agenda, attendees, and a card to invite them with

### Q2. Within each feature area, what's must-have vs. nice-to-have for the first version?
- A. Must-have: all form fields, agenda CRUD + reorder, attendee list, PDF export with QR code, live preview. Nice-to-have (can slip): fine-grained visual polish/theming of the card, `.ics` payload (URL-only QR is fine for v1)
- B. Must-have: everything listed in the original description exactly as specified, including the `.ics` payload — nothing is deferred
- C. Not yet defined
- X. Other (please specify)

[Answer]: A. Must-have: all form fields, agenda CRUD + reorder, attendee list, PDF export with QR code, live preview. Nice-to-have (can slip): fine-grained visual polish/theming of the card, `.ics` payload (URL-only QR is fine for v1)

### Q3. Are there dependencies between the four capability areas that affect build order?
- A. Yes — the invitation card depends on scheduling + agenda + attendee data existing first, so those three should be built before the card engine
- B. No meaningful build-order dependency — they can be built in any order and integrated at the end
- C. Not yet defined
- X. Other (please specify)

[Answer]: A. Yes — the invitation card depends on scheduling + agenda + attendee data existing first, so those three should be built before the card engine

### Q4. What sequencing preference should guide the build order?
- A. Value-first — build the parts that are most useful to see working first (e.g. get a meeting scheduled and a basic card exported early, then refine)
- B. Risk-first — tackle the riskiest/least-familiar part first (likely the client-side PDF generation + QR code engine)
- C. Not yet defined / no strong preference
- X. Other (please specify)

[Answer]: A. Value-first — build the parts that are most useful to see working first (e.g. get a meeting scheduled and a basic card exported early, then refine)

### Q5. Are there any hard deadlines tied to specific capabilities (e.g. needing the invitation-card export ready before a specific date)?
- A. Yes — there's a real deadline (please specify)
- B. No hard deadline, just the general "upcoming need" already noted at Intent Capture
- C. Not applicable
- X. Other (please specify)

[Answer]: B. No hard deadline, just the general "upcoming need" already noted at Intent Capture

### Q6. [Resolving the scope divergence flagged at Intent Capture] You confirmed you want the app hosted centrally for the team rather than run as separate local installs. The current workflow-selected scope skips the entire deployment/operations phase. Given this is a simple, static-friendly Next.js app with no cloud database, which of these should be added back into scope?

- A. Just enough to get it hosted (deployment-pipeline + deployment-execution stages — e.g. deploying to a platform like Vercel) — no environment provisioning, no observability/incident-response/performance stages, since there's no real infra or production-scale concern here
- B. Also include environment provisioning (in case a custom domain, env vars, or basic access control needs real infra setup)
- C. Full operations coverage (also add observability, incident response, performance validation) — treat this as seriously as a small production service
- X. Other (please specify)

[Answer]: A. Just enough to get it hosted (deployment-pipeline + deployment-execution stages — e.g. deploying to a platform like Vercel) — no environment provisioning, no observability/incident-response/performance stages, since there's no real infra or production-scale concern here

### Q7. Does the hosted instance need any access control (e.g. a shared password/login) so it isn't open to the public internet, or is an unlisted/obscure URL good enough for now?
- A. Unlisted URL is fine for now — no login required
- B. Needs some form of access control (please specify what — e.g. a shared password, allow-list, etc.)
- C. Not yet defined
- X. Other (please specify)

[Answer]: A. Unlisted URL is fine for now — no login required

## Assumptions & Open Questions

None.
