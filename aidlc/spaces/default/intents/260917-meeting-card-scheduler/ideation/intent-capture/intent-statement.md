# Intent Statement — Meeting Scheduler & Invitation Card Generator

## Problem Statement

Meeting planning today is scattered across manual, ad-hoc tools (spreadsheets, documents, email threads) for scheduling details, agendas, and attendee lists, with invitation/agenda materials produced separately and inconsistently [desc][Q1]. This project builds one structured, self-contained web app that combines meeting scheduling (date/time/timezone/location/host details), an agenda builder, attendee management, and a matching invitation-card/PDF generator with a QR code, replacing that manual, ad-hoc process with a single tool [desc][Q1].

## Target Customer

The primary users are members of a small team, each of whom creates and manages their own meetings; the app is hosted as one centrally-deployed instance the whole team visits in a browser, but each user's meeting data lives only in their own browser session — there is no shared database or cross-device sync [Q2][Q11][Q10]. Attendees are not users of the app: they only ever receive the generated invitation card/PDF (or its QR-encoded meeting link/`.ics` payload) and do not interact with the app itself [Q5][desc].

## Success Metrics

Success is a fast, low-friction path from meeting creation to a finished invitation: a user should be able to enter a meeting's details, build its agenda, add attendees, and export a polished invitation-card PDF in a few minutes [Q3]. No further quantitative metric (adoption count, time saved versus a prior tool, etc.) has been defined yet.

## Initiative Trigger

There is an actual upcoming need for this tool — it is being built to support a real, near-term set of meetings/events rather than as a speculative or exploratory project [Q4].

## Initial Scope Signal

**Workflow-selected scope**: `meeting-card-scheduler` [scope] — a custom, focused-to-standard plan (15 of 33 stages) built for a local-first, zero-third-party-API, zero-cloud-database app: full Inception-phase requirements/design documentation, a construction spine (functional design, code, tests, CI), and every deployment/operations-phase stage skipped.

**User-confirmed product boundary**: The user confirmed the core feature scope (scheduling, agenda builder, attendee management, invitation-card PDF engine with QR code, Next.js/TypeScript/Tailwind stack, browser-local or local-SQLite storage) matches [desc], but diverges from the workflow-selected scope on one point: the app should be **hosted centrally for the team** rather than run purely as a locally-cloned, per-user repository [Q9][Q11]. This still keeps zero shared/cloud database — each visitor's data stays in their own browser [Q10] — but it does mean the delivered scope needs *some* deployment coverage (getting one instance running somewhere the team can reach), which the currently-selected `meeting-card-scheduler` scope skips entirely. This divergence is flagged here for resolution at Scope Definition, the next stage, which owns adjusting the in-scope stage list. [assumption] Until Scope Definition confirms it, treat "some lightweight hosting/deployment coverage should be added back to scope" as an open scope decision rather than a settled requirement.

## Assumptions & Open Questions

- [assumption] The exact hosting mechanism (e.g., a simple static/Vercel-style deploy vs. a self-hosted server) has not been decided — Q9/Q10 establish only that centralized hosting with per-browser-only data is wanted, not a specific hosting approach.
- [assumption] Whether any authentication/access control is needed for the hosted instance (so only the intended team can reach it) has not been asked or confirmed.
