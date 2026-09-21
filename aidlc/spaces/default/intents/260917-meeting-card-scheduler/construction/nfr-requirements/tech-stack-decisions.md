# Tech Stack Decisions — Meeting Scheduler & Invitation Card Generator

This document locks the technology selections this stage's interview
resolved, on top of the stack already fixed by `requirements.md`'s
Constraints section (Next.js App Router, TypeScript, Tailwind CSS, Lucide
icons) and `domain-design/decisions.md` (four-component decomposition,
IndexedDB/localStorage for persistence).

## Hosting Platform: Vercel

| Field | Value |
|---|---|
| Selection | Vercel |
| Rationale | Zero-config deploy-on-merge for a Next.js App Router project, serverless auto-scaling that comfortably covers the under-20-concurrent-user ceiling (`scalability-requirements.md` NFR6.1) with no manual provisioning, and a free/hobby tier that fits a solo/small-team budget with no ongoing infrastructure cost |
| Alternatives rejected | Self-hosted Node/Docker (more operational overhead — TLS, process management, provisioning — for no benefit at this scale); static export + separate PDF server (unnecessary since PDF/QR generation is entirely client-side, not server-rendered) |
| Source | this stage's interview Q1 |

## PDF Rendering: `@react-pdf/renderer`

| Field | Value |
|---|---|
| Selection | `@react-pdf/renderer` |
| Rationale | Declarative, React-component-based PDF composition matches the existing component hierarchy (`frontend-components.md`) far more naturally than an imperative drawing API — `CardGeneration`'s card layout can be expressed as JSX-like components rather than manual coordinate-based drawing calls |
| Alternatives rejected | `pdfkit` (lower-level, imperative API — more manual layout code with no offsetting benefit here); `jsPDF` (also imperative; considered but the React-component fit of `@react-pdf/renderer` was preferred) |
| Source | this stage's interview Q6 |

## QR Code Generation: `qrcode.react`

| Field | Value |
|---|---|
| Selection | `qrcode.react` |
| Rationale | Renders as an SVG/canvas React component, matching `@react-pdf/renderer`'s component-based approach; the same QR payload (resolved per BR5.1) feeds both the live DOM preview and the PDF export through one consistent rendering model |
| Alternatives rejected | `qrcode` (npm) — a lower-level image/data-URI generator paired naturally with `pdfkit`/`jsPDF`, not needed once `@react-pdf/renderer` was selected |
| Source | this stage's interview Q6 |

## Browser Storage: IndexedDB via `idb-keyval`

| Field | Value |
|---|---|
| Selection | IndexedDB, accessed through the lightweight `idb-keyval` wrapper (not raw localStorage) |
| Rationale | `domain-design/decisions.md` ADR-002 already named "IndexedDB/localStorage" generically; this stage pins IndexedDB specifically because Meeting/AgendaItem/Attendee are structured, relational records that outgrow localStorage's string-only key-value model, and `idb-keyval` keeps the `PersistenceAdapter` implementation thin without pulling in a heavier ORM-style wrapper (e.g. Dexie) that this app's simple save/load/clear/list interface doesn't need |
| Alternatives rejected | Raw localStorage (string-only, awkward for structured records and the ~50-item soft scale target); Dexie (full-featured IndexedDB ORM — more capability than this app's narrow `PersistenceAdapter` interface requires) |
| Source | elaborates `domain-design/decisions.md` ADR-002; not a new open question at this stage |

## Observability Tooling: none (platform-native only)

| Field | Value |
|---|---|
| Selection | No external observability library or service — Vercel's built-in logs/dashboard and Next.js error boundaries only |
| Rationale | This stage's Q2 confirmed the zero-third-party-API-dependency constraint extends to observability tooling |
| Source | this stage's interview Q2; elaborated in `observability-requirements.md` NFR7.1 |

## Assumptions & Open Questions

None.
