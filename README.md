# Meeting Card Scheduler

Schedule a meeting, build its agenda, manage attendees, and generate a
polished invitation-card PDF (with a QR code). Meetings, agenda items, and
attendees are stored in a shared Supabase Postgres database — visible to
anyone with the app's link, no login — and nothing else: no third-party
APIs, no other backend services.

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

Two required — a public Supabase project URL and its publishable
(client-safe) key. See `.env.example`. No other runtime secrets exist: no
third-party APIs, no server-side code of any kind (the Supabase client
runs directly in the browser, gated by Row Level Security policies, not by
a backend this app owns).

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable key, safe to expose client-side>
```

## Architecture

Four layers (see `lib/`), enforced by lint rule as well as convention —
UI components never call storage or the PDF/QR engine directly:

- `types/` — `Meeting`, `AgendaItem`, `Attendee` domain types.
- `lib/persistence/` — the `PersistenceAdapter`, a Supabase Postgres-backed
  save/load/list/delete/clear interface (`lib/persistence/supabase-client.ts`
  holds the only code in the repo that imports `@supabase/supabase-js`).
- `lib/store/` — `Scheduling`, the domain/state layer and its React hooks
  (`useMeetingsList`, `useMeeting`, `useAgendaItems`, `useAttendees`,
  `useClearAllData`). The **only** module allowed to call
  `PersistenceAdapter` or `lib/card`.
- `lib/card/` — `CardGeneration`: PDF layout (`@react-pdf/renderer`) and QR
  generation (`qrcode.react`), called only by `lib/store`.
- `components/` + `app/` — the UI, wired to `lib/store`'s hooks only.

## Data & privacy

Meetings live in a shared Supabase database, not per-device browser
storage — anyone with the app's link can see every meeting, agenda item,
and attendee. There is no login. Don't use this app for sensitive or
private meetings. Row Level Security is enabled on every table, but its
policies currently grant the anonymous role full read/write access, matching
this app's original no-auth design — see
`supabase/migrations/20260922041800_init.sql` for the exact policies.

The "Clear my data" action (visible on the Meetings List) deletes every
meeting this device has created or edited — tracked via a small anonymous
id list in `localStorage` (`lib/persistence/owned-meetings.ts`), not a wipe
of the whole shared database.

## Database schema & migrations

Managed with the Supabase CLI. `supabase/migrations/` is the source of
truth; apply it to a project with:

```bash
npx supabase link --project-ref <project-ref>
npx supabase db push
```

## Deployment

Deploys to Vercel on every merge to `main` (no separate staging tier — see
the project's `team.md` Deployment section for the full rationale). Set
`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the
Vercel project's Environment Variables for both Production and Preview.
