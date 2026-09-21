# Build Instructions — Meeting Scheduler & Invitation Card Generator

## Dependency Installation

```bash
npm ci
```

Uses the committed `package-lock.json` for reproducible installs (per
`team.md`'s security tooling practice — `npm ci`, never `npm install`, in
CI/build). No `postinstall` scripts requiring network access beyond the npm
registry itself.

## Environment Setup

No environment variables or local services are required to build or run
this app — it has zero third-party API dependencies and no backend
database (`tech-stack-decisions.md`). `.env.example` exists but is
intentionally empty (no runtime secrets exist, per `security-design.md`).

| Prerequisite | Version |
|---|---|
| Node.js | 20.x or later (Next.js 16 requirement) |
| npm | 10.x or later (bundled with Node 20+) |

## Build Commands

```bash
npx tsc --noEmit          # type check
npx eslint . --ext .ts,.tsx   # lint (includes the layering-mandate and security lint rules)
npm run build              # production build (Next.js 16, Turbopack)
```

## Build Verification

Expected output from `npm run build`:
- `✓ Compiled successfully`
- 4 routes generated: `/`, `/_not-found`, `/meeting/[id]/edit` (dynamic), `/meeting/new`
- `ƒ Proxy (Middleware)` present, confirming `proxy.ts`'s CSP-nonce middleware is active

**Actual verified output** (this stage, re-run independently of Code Generation's own claim):
```
▲ Next.js 16.3.5 (Turbopack)
✓ Compiled successfully in 338ms
  Finished TypeScript in 1772ms
✓ Generating static pages using 6 workers (4/4) in 439ms

Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /meeting/[id]/edit
└ ○ /meeting/new

ƒ Proxy (Middleware)
```
`npx tsc --noEmit` — clean, exit 0. `npx eslint . --ext .ts,.tsx` — clean, exit 0.

## Local Development

```bash
npm run dev
```

## Troubleshooting Common Build Issues

| Symptom | Cause | Fix |
|---|---|---|
| `@react-pdf/renderer` SSR/prerender crash | Its Node/CJS build is not SSR-safe under Next's server bundle | Already mitigated: the 3 route entry points use `next/dynamic(..., { ssr: false })` — do not remove this |
| ESLint "plugin react-hooks uniquely" error | `eslint-config-next` bundles its own `eslint-plugin-react-hooks`, colliding with a separately pinned version | Keep the project's own `eslint-plugin-react-hooks` pin in sync with the version `eslint-config-next` bundles (currently `^5.2.0`) |
| `params` type error on the dynamic edit route | Next.js 15+ made route `params` a `Promise` | Already handled via React's `use(params)` in `app/meeting/[id]/edit/page.tsx` — do not revert to a plain destructure |

## Assumptions & Open Questions

None.
