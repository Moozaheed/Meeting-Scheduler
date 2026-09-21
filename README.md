# Meeting Card Scheduler

Schedule a meeting, build its agenda, manage attendees, and generate a
polished invitation-card PDF (with a QR code) — all without a backend.
Every meeting, agenda item, and attendee lives only in your own browser's
storage; nothing is sent to a server or a third-party API.

## Prerequisites

- Node.js 18.18+ (Node 22 is what this project was built and tested with)
- npm

## Getting started

```bash
npm ci
npm run dev
```

Open http://localhost:3000.

## Available scripts

| Script | What it does |
|---|---|
| `npm run dev` | Starts the Next.js dev server |
| `npm run build` | Production build (`next build`) |
| `npm run start` | Serves the production build (`next start`), run after `build` |
| `npm run lint` | ESLint (`next lint`) — includes the security-focused plugins |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Runs the unit/component test suite once (Vitest) |
| `npm run test:watch` | Vitest in watch mode |
| `npm run test:coverage` | Unit/component tests with the 80% line-coverage gate |
| `npm run test:e2e` | Playwright end-to-end suite (desktop + mobile browser matrix) |

## Environment variables

None required. See `.env.example` — this app has zero runtime secrets by
design (no third-party APIs, no server-side database).

## Architecture

Four layers (see `lib/`), enforced by lint rule as well as convention —
UI components never call storage or the PDF/QR engine directly:

- `types/` — `Meeting`, `AgendaItem`, `Attendee` domain types.
- `lib/persistence/` — the `PersistenceAdapter`, an IndexedDB-backed
  (`idb-keyval`) save/load/list/delete/clear interface.
- `lib/store/` — `Scheduling`, the domain/state layer and its React hooks
  (`useMeetingsList`, `useMeeting`, `useAgendaItems`, `useAttendees`,
  `useClearAllData`). The **only** module allowed to call
  `PersistenceAdapter` or `lib/card`.
- `lib/card/` — `CardGeneration`: PDF layout (`@react-pdf/renderer`) and QR
  generation (`qrcode.react`), called only by `lib/store`.
- `components/` + `app/` — the UI, wired to `lib/store`'s hooks only.

## Data & privacy

Your data stays on this device only, in plain browser storage — it is
**not encrypted**. Don't use this app for sensitive meetings on a shared
computer. Use the "Clear my data" action (visible on the Meetings List) to
wipe everything stored in this browser at any time.

## Deployment

Deploys to Vercel on every merge to `main` (no separate staging tier — see
the project's `team.md` Deployment section for the full rationale).
