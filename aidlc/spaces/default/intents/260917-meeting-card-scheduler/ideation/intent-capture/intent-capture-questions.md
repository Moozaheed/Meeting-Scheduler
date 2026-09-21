# Intent Capture & Framing — Questions

## Sources

- [desc] Initial description: "Initiate a full-stack local web application for a Meeting Scheduler & Invitation Card Generator with zero third-party API dependencies.\n\nScope & Core Features:\n1. Meeting Scheduling & Details:\n   - Form inputs: Meeting title, purpose/description, date, start time, end time/duration, timezone selector, meeting link (or physical location), and host profile (name, role/organization, contact email).\n   - Dynamic Agenda Builder: Add, edit, reorder, and remove itemized agenda topics with duration estimates and designated speaker names.\n   - Attendee Management: Input guest list (name, email, role/designation).\n\n2. Invitation Card Engine (PDF Export):\n   - Client-side or embedded local PDF generation (e.g., using @react-pdf/renderer or pdfkit). Strictly NO external SaaS APIs or microservices.\n   - Aesthetic Card Layout: Formatted as a sleek event card/invitation badge (dimensions: standard A5 or US Letter card).\n   - Visual Details: Clean typography, visual hierarchy, agenda timeline block, host details badge, and an auto-generated QR code (containing the meeting URL or .ics calendar payload).\n   - Live Preview: Split-screen or modal showing real-time card preview before downloading the PDF.\n\n3. Architecture & Constraints:\n   - Stack: Next.js (App Router), TypeScript, Tailwind CSS, and Lucide icons.\n   - Storage: Local browser persistence (IndexedDB / LocalStorage) or local SQLite with zero cloud database dependency.\n   - Portability: Single self-contained repository with standard npm run dev and npm run build workflows.\n\nLifecycle Guidance:\n- Run the Inception phase: Document requirements, edge cases, and component architecture inside aidlc-docs/.\n- Formulate an execution plan with discrete units of work and present the approval gate before generating code."
- [scope] Workflow-selected scope: `meeting-card-scheduler`.

## Questions

### Q1. What business problem is this app meant to solve for you?
The description lists features but not the underlying pain point — is this about replacing a manual/paper process for planning meetings and invitations, avoiding paid scheduling tools, or something else?

- A. Replace manual/ad-hoc meeting planning (spreadsheets, docs, email) with one structured tool
- B. Avoid recurring cost/lock-in of SaaS scheduling and design tools (e.g. Calendly + Canva)
- C. Need for privacy/offline use — no data should leave the local machine
- D. Not yet defined
- X. Other (please specify)

[Answer]: A. Replace manual/ad-hoc meeting planning (spreadsheets, docs, email) with one structured tool

### Q2. Who is the primary user (customer) of this application?
This shapes whether the app is a single-user personal tool or something used by a small team.

- A. Just me — a personal tool for my own meetings
- B. A small team/organization where multiple people create meetings, but each installs/runs their own local copy
- C. Not yet defined
- X. Other (please specify)

[Answer]: B. A small team/organization where multiple people create meetings, but each installs/runs their own local copy

### Q3. What does success look like for this project?
The description doesn't state a measurable outcome. What would tell you this project worked?

- A. I can create a meeting with agenda + attendees and export a polished invitation PDF in under a few minutes
- B. It fully replaces whatever tool/process I use today for scheduling and invitations
- C. Not yet defined / no specific metric — "it works and looks good" is enough
- X. Other (please specify)

[Answer]: A. I can create a meeting with agenda + attendees and export a polished invitation PDF in under a few minutes

### Q4. What's prompting this project now?
Is there a specific trigger — an upcoming need, frustration with an existing tool, a learning exercise, or something else?

- A. I need this for an actual upcoming set of meetings/events
- B. Ongoing frustration with existing scheduling/invitation tools (cost, complexity, or lack of local/offline support)
- C. This is a learning/portfolio project
- D. Not yet defined
- X. Other (please specify)

[Answer]: A. I need this for an actual upcoming set of meetings/events

### Q5. Besides yourself as the builder/host, are there other stakeholders whose needs this must account for (e.g. attendees viewing the card, a team that might reuse this)?
- A. No other stakeholders — attendees only ever receive the generated PDF/card, they don't use the app itself
- B. Yes — other people may also run/use the app themselves (not just receive cards)
- C. Not identified yet
- X. Other (please specify)

[Answer]: A. No other stakeholders — attendees only ever receive the generated PDF/card, they don't use the app itself

### Q6. Who decides scope and priority for this project going forward?
- A. Just me — I'm the sole decision-maker for scope and priorities
- B. Shared with someone else (a collaborator, team, or stakeholder)
- C. Not applicable
- X. Other (please specify)

[Answer]: A. Just me — I'm the sole decision-maker for scope and priorities

### Q7. Are there any communication or reporting requirements (e.g. progress updates to someone else) as this is built?
- A. None — this is a solo project, no reporting needed
- B. Yes — periodic updates are expected (specify to whom and how often)
- C. Not applicable
- X. Other (please specify)

[Answer]: A. None — this is a solo project, no reporting needed

### Q8. The workflow was started with a custom `meeting-card-scheduler` scope (15 of 33 stages: full requirements/design documentation in the Inception phase, then build + test, skipping market research, team formation, and all deployment/operations stages since this is a local-only, zero-dependency app). Does that match your intended product boundary?
- A. Yes, that matches — this stays a local-only tool with no deployment/hosting concerns
- B. No — I do want some deployment/operations coverage after all (please specify what)
- C. Not yet defined
- X. Other (please specify)

[Answer]: B. No — I do want some deployment/operations coverage after all (please specify what)

### Q9. [Follow-up to Q8] You said you want some deployment/operations coverage after all — what specifically? (This app is local-only per your description: Next.js, browser storage, zero cloud dependencies.)

- A. Simple prod build/run docs — just clear instructions for running the production build locally (`npm run build && npm start`), no hosting, no pipeline, no cloud infra
- B. Share with teammates via hosting — actually deploy it somewhere (e.g. Vercel/a shared server) so teammates can access it without each running their own local copy
- C. Packaged distributable — package it so teammates can each run it locally without setting up a dev environment (e.g. a simple installer or Docker image), still no cloud dependency
- X. Other (please specify)

[Answer]: B. Share with teammates via hosting — actually deploy it somewhere (e.g. Vercel/a shared server) so teammates can access it without each running their own local copy

### Q10. [Follow-up to Q9] Your original description called for zero cloud dependencies and a single self-contained local repo, but you now want it hosted so teammates can share it. If it's hosted centrally, should meeting data be shared/synced across users, or does each person still only see their own locally-stored data (via their own browser)?

- A. Still per-browser only — host the app centrally (so nobody installs it locally), but each visitor's data still lives only in their own browser, no shared database, no cross-device sync
- B. Shared across users — meetings/agendas should be visible to the whole team, which requires a real shared database instead of per-browser local storage
- C. Not sure yet / keep simple for now — keep the current zero-cloud, local-storage design as the MVP; treat hosting/sharing as a later concern
- X. Other (please specify)

[Answer]: A. Still per-browser only — host the app centrally (so nobody installs it locally), but each visitor's data still lives only in their own browser, no shared database, no cross-device sync

### Q11. [Contradiction check against Q2] Q2 was answered as "small team, each installs/runs their own local copy," but Q9/Q10 describe hosting it centrally instead of installing locally. Which is accurate?

- A. Hosted centrally for the team — one deployed instance teammates all visit in a browser; nobody installs or runs it locally (each still keeps their own data via browser storage)
- B. Each runs their own local copy — every teammate clones the repo and runs `npm run dev`/`build` on their own machine; no shared hosting needed
- X. Other (please specify)

[Answer]: A. Hosted centrally for the team — one deployed instance teammates all visit in a browser; nobody installs or runs it locally (each still keeps their own data via browser storage)

## Assumptions & Open Questions

None.

## Assumption Confirmation

The intent statement carries two assumptions that were not directly asked about:
- [assumption] The exact hosting mechanism (e.g., a simple static/Vercel-style deploy vs. a self-hosted server) has not been decided.
- [assumption] Whether any authentication/access control is needed for the hosted instance has not been decided.

A. Accept assumptions
B. Convert to follow-up questions

[Answer]: A. Accept assumptions
