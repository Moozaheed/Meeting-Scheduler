# Requirements — Meeting Scheduler & Invitation Card Generator

## Intent Analysis

The goal is to replace manual, ad-hoc meeting planning (spreadsheets, docs, email) with one structured, self-contained tool that takes a host from "I need to schedule a meeting" to "attendees have a polished invitation card" in under 5 minutes, without any third-party APIs, cloud database, or per-user local install — the app is hosted centrally for a small team, but each user's data stays local to their own browser.

## Functional Requirements

### FR1. Meeting Scheduling & Details
- **FR1.1** — The host can create a meeting with: title, purpose/description (optional), date, start time, end time or duration, timezone selector, a meeting link or a physical location (at least one required), and host profile (name and contact email required; role/organization optional). (Q4)
- **FR1.2** — When a meeting link is entered, it must be validated as a well-formed URL before the meeting can be saved; a physical location remains free text with no format validation. (Q8)
- **FR1.3** — The host can edit a previously created meeting's details.

### FR2. Dynamic Agenda Builder
- **FR2.1** — The host can add, edit, reorder, and remove agenda items, each with a topic, a duration estimate, and a designated speaker name.
- **FR2.2** — A meeting may have zero agenda items; the agenda builder is not required to create a meeting. (Q5)
- **FR2.3** — The UI must remain usable with a large number of agenda items (soft target: up to ~50) without hard-blocking beyond that. (Q3)

### FR3. Attendee Management
- **FR3.1** — The host can add, edit, and remove attendees, each with a name (required), email (required), and role/designation (optional).
- **FR3.2** — A meeting may have zero attendees; attendee management is not required to create a meeting. (Q5)
- **FR3.3** — Adding an attendee with an email already present on the same meeting's attendee list must be blocked with a validation message — no duplicate attendee emails within one meeting. (Q5)
- **FR3.4** — The UI must remain usable with a large number of attendees (soft target: up to ~50) without hard-blocking beyond that. (Q3)

### FR4. Meetings List
- **FR4.1** — The app provides a list of meetings previously created in the current browser, so the host can revisit, edit, or re-export any past meeting's invitation card. (Q1) [Note: this requirement was not present in the original request or any prior-stage artifact; it originates from this stage's Q1, per the Inception-phase traceability rule requiring new requirements to document their origin.]
- **FR4.2** — Deleting a meeting from the list removes it from browser storage.

### FR5. Invitation Card Engine (PDF Export)
- **FR5.1** — The app generates a client-side PDF invitation card with no external SaaS APIs or microservices, using clean typography, a visual hierarchy, an agenda timeline block, and a host-details badge.
- **FR5.2** — The card is formatted to either standard A5 or US Letter dimensions (host-selectable or a fixed default — resolved at Functional Design).
- **FR5.3** — The card includes an auto-generated QR code containing the meeting URL (or an `.ics` calendar payload, deferred as Should-Have per the scope document).
- **FR5.4** — The app shows a live, split-screen or modal preview of the card before the host downloads the PDF, reflecting edits as they're made.
- **FR5.5** — Card generation failures are caught and surfaced to the user as an actionable, retryable error — never a silent no-op — consistent with the affirmed error-handling practice.

### FR6. Data Persistence & Clear My Data
- **FR6.1** — All meeting, agenda, and attendee data is stored locally in the visitor's own browser (IndexedDB/LocalStorage or local SQLite) with no shared or cloud database — each visitor's data is private to their own browser session.
- **FR6.2** — The app provides a visible "clear my data" action that wipes all locally stored meeting data for that browser, per the affirmed team practice.

## Non-Functional Requirements

### NFR1. Performance
- **NFR1.1** — The live card preview reflects an edit within approximately 1 second. (Q6)
- **NFR1.2** — A full PDF export completes within approximately 3 seconds. (Q6)

### NFR2. Accessibility
- **NFR2.1** — The scheduling form, agenda builder, attendee management, and card preview target WCAG 2.1 Level AA, checked via automated tooling (axe-core/pa11y) as a non-blocking CI signal per the affirmed team practice. (Q7)

### NFR3. Browser & Device Compatibility
- **NFR3.1** — The app must function correctly across Chromium, Firefox, and WebKit browser engines, including their mobile variants, since attendees may open a shared card link on mobile and the affirmed E2E test matrix covers both desktop and mobile.

### NFR4. Reliability & Data Integrity
- **NFR4.1** — Persistence failures (storage quota exceeded, corrupted stored data, private-browsing storage restrictions) must degrade gracefully to an in-memory session state with a non-blocking notice, never a crash, per the affirmed error-handling practice.
- **NFR4.2** — A single failed save must not lose in-progress form data held in component state.

### NFR5. Security & Privacy
- **NFR5.1** — All user-entered text (attendee names, agenda topics, meeting descriptions) must be treated as untrusted input and safely escaped wherever it is rendered — the live preview DOM and the generated PDF — per the affirmed security-tooling practice (no raw HTML injection).
- **NFR5.2** — Attendee and host contact information is disclosed to the user as PII stored unencrypted in browser storage, with an in-app disclosure statement, per the affirmed team practice.
- **NFR5.3** — The hosted instance requires no authentication; access control is limited to an unlisted URL, consistent with the scope document's decision.

## Constraints

- **Technical**: Next.js (App Router), TypeScript, Tailwind CSS, Lucide icons; zero third-party API dependencies; zero cloud database; client-side-only PDF/QR generation. [desc]
- **Business**: Solo decision-maker; no budget/resourcing process beyond the host's own time. [approval-handoff]
- **Organizational**: Single self-contained repository; deploy-on-merge to one centrally-hosted instance with no staging/production split. [team-practices]

## Assumptions

- [assumption] The exact hosting mechanism (e.g., Vercel vs. a self-hosted server) is not yet decided — carried forward from Intent Capture, still open.
- [assumption] Whether any lightweight access control beyond the unlisted URL will be needed later is not yet decided — carried forward from Scope Definition.
- [assumption] The card's A5 vs. US Letter sizing (fixed default vs. host-selectable) is left open for Functional Design to resolve (FR5.2).
- [assumption] Whether the `.ics` QR payload (Should-Have) ships in the first release or a later iteration is not yet decided — deferred per the scope document's MoSCoW prioritization.

## Out of Scope

- `.ics` calendar payload in the QR code for the first release (Should-Have, deferred per intent-backlog.md).
- Fine-grained visual theming/polish of the invitation card beyond the baseline clean design (Could-Have).
- Authentication/access control beyond the unlisted URL.
- Environment provisioning, observability, incident response, and performance validation beyond the targets stated in NFR1 (per the scope document's deployment-scope decision).
- Shared/cloud database or cross-device data sync.

## Open Questions

- No hard numeric threshold has been set for how large "a large number" of agenda items/attendees can grow before the soft ~50 guidance (FR2.3, FR3.4) needs revisiting — flagged for Functional Design if it becomes a real constraint.
- The exact A5 vs. US Letter card-sizing UX (fixed vs. selectable) is deferred to Functional Design (see Assumptions).

## Traceability

Every functional and non-functional requirement above traces to either the original project description ([desc]), a confirmed answer in this stage's `requirements-analysis-questions.md` (cited inline by question number), or an upstream Ideation/Practices-Discovery artifact (scope-document.md, intent-backlog.md, team-practices.md), per the Inception-phase traceability rule.
