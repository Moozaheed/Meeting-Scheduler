# Code Summary — Meeting Scheduler & Invitation Card Generator

Zero-Unit stage-level summary. Full source-file list (56 files) is in
`source-manifest.json`; this document covers what was built, why, and how
it was verified.

## Files Created (by plan step)

- **Step 1 — Project skeleton/config**: `package.json`, `tsconfig.json`, `next.config.js`, `proxy.ts` (renamed from `middleware.ts` in Revision 1 — Next.js 16 deprecates the `middleware` filename/export in favor of `proxy`), `tailwind.config.ts`, `postcss.config.js`, `.eslintrc.json`, `.prettierrc`, `vercel.json`, `.gitignore` (appended to the existing AI-DLC block).
- **Step 2 — Test runner**: `vitest.config.ts`, `vitest.setup.ts`, `playwright.config.ts`, `e2e/README.md`.
- **Step 3/4 — Data model/persistence**: `types/domain.ts`, `lib/persistence/persistence-adapter.ts` + `.test.ts` (9 tests).
- **Step 6/7 — Business logic**: `lib/validation/validators.ts`, `lib/store/scheduling-rules.ts`, `lib/store/scheduling-store.ts` (facade + hooks), `lib/store/test-fixtures.ts`, `lib/store/scheduling-store.test.ts` (9 tests).
- **Step 9/10 — Frontend**: `lib/card/{card-data.ts, qr-vector.tsx, invitation-card-pdf.tsx, invitation-card-preview.tsx, card-generation.tsx}`; `components/ui/{Button, FieldError}.tsx`; `components/meeting/{MeetingDetailsForm, MeetingFormPage, MeetingsListPage, MeetingListRow, DeleteConfirmation, ClearMyDataAction}.tsx` + 4 test files; `components/agenda/{AgendaBuilder, AgendaItemRow}.tsx` + test; `components/attendees/{AttendeeManager, AttendeeRow}.tsx` + test; `components/card/{CardErrorBoundary, LiveCardPreview, ExportButton}.tsx` + 2 test files; `app/{layout.tsx, globals.css, page.tsx, meeting/new/page.tsx, meeting/[id]/edit/page.tsx}`.
- **Step 11**: `.env.example`, `README.md`.

Steps 5 and 8 produced no files, correctly — Step 5 (Repository/data access) is folded into Step 3/4's `PersistenceAdapter` per ADR-002, and Step 8 (API/endpoint) is not applicable since this app has no backend API.

## Key Implementation Decisions

- **QR code inside the PDF without a second QR library**: `@react-pdf/renderer` cannot mount a real DOM `<svg>`, so `lib/card/qr-vector.tsx` renders `qrcode.react`'s `QRCodeSVG` via `renderToStaticMarkup` and re-embeds its `<path d>` geometry inside react-pdf's `<Svg>/<Path>` — same payload, same geometry, no new dependency. Keeps `tech-stack-decisions.md`'s locked library choice intact.
- **Client-only rendering for the three route entry points**: `app/page.tsx` and the two form routes use `next/dynamic(..., { ssr: false })` because `@react-pdf/renderer`'s Node/CJS build is not SSR-safe under Next's server bundle — this caused a real prerender crash during Step 9/10, now fixed. Consistent with this app having no server-rendered data at all (everything is client-side per `tech-stack-decisions.md`).
- **`useAgendaItems`/`useAttendees` hook signature**: `(items, onChange)` rather than `(meetingId)`, since agenda/attendee data lives in `MeetingFormPage`'s local draft until save — an explicit UX micro-decision `functional-spec.md` left open for Code Generation to resolve.
- **Per-keystroke edit never blocks; only discrete add blocks**: a real-time `edit()` call never enforces BR2.3/BR3.2–3.4 (blocking mid-edit would make backspacing an agenda topic or attendee email impossible); only the discrete `add()` action enforces those rules, matching the validation-timing intent in `rules.md`.
- **Layering mandate enforced by lint, not just convention**: `.eslintrc.json` bans `components/**`/`app/**` from importing `lib/persistence/*`, `lib/card/*`, `@react-pdf/renderer`, or `qrcode.react` directly — turning the NFR-design review's layering fix into an automated, CI-blocking guarantee rather than a documentation-only rule.
- **BR7.1 Upcoming/Past status uses local wall-clock comparison**, not full IANA timezone conversion — no timezone-conversion library is in the locked tech stack. Disclosed inline in code comments as a known simplification, not a silent gap.
- **`lib/card/card-generation.ts` → `.tsx`**: renamed from the plan's literal `.ts` path because the module needs JSX (`@react-pdf/renderer` components) — a minor file-extension deviation from the plan text, not a scope change.

## Test Coverage Summary (actual, verified — not claimed)

| Check | Result |
|---|---|
| `npx tsc --noEmit` | Clean |
| `npx eslint . --ext .ts,.tsx` | 0 errors, 0 warnings |
| `npm run build` | Succeeds; all 4 routes generate |
| `npx vitest run --coverage --coverage.thresholds.lines=80` | **53/53 tests pass**, exit 0 |
| Line coverage | **93.7%** (threshold 80%, not weakened) |

Per-file test counts: `persistence-adapter` 9, `scheduling-store` 9,
`MeetingDetailsForm` 6, `AgendaBuilder` 6, `AttendeeManager` 6,
`LiveCardPreview` 3, `ExportButton` 3, `MeetingsListPage` 6,
`MeetingFormPage` 5 — 53 total, within the Standard strategy's 5–8-per-component
band (with `MeetingFormPage` added beyond the originally planned component
list, see Deviations below).

## Deviations From the Plan (all disclosed, none silent)

1. `lib/card/card-generation.ts` written as `.tsx` (needs JSX) instead of the plan's literal `.ts` path.
2. `next/dynamic({ ssr: false })` added at the three route entry points — required to fix a genuine SSR crash from `@react-pdf/renderer`'s Node build, discovered during implementation, not anticipated at planning time.
3. Added `MeetingFormPage.test.tsx` (5 tests) beyond `unit-test-instructions.md`'s named component list — `MeetingFormPage` had 0% coverage and real untested logic (draft-state wiring, save/navigate flow) that the planned test set didn't reach; adding it closes a genuine gap rather than expanding scope for its own sake.
4. **[Corrected in Revision 1 — 2026-09-21]** This item originally claimed all `npm audit` findings were dev-tooling-only. That claim was **wrong**: an adversarial architecture review independently ran `npm audit --omit=dev` and found a **Critical** unauthenticated-RCE-class vulnerability in the pinned production dependency `next@14.2.35` and a **High** vulnerability in its production `postcss` dependency — both direct/transitive **production-path** findings, not dev tooling. The human, presented with the finding, chose to upgrade rather than accept the risk. The correct account:

   - **Before**: `next@14.2.35` (with a bundled `postcss@8.4.31`), production-path Critical + High findings confirmed by `npm audit --omit=dev`.
   - **npm's own recommended fix** (`npm audit --omit=dev --json`, re-verified independently): `next@16.3.5` — a semver-major jump (14.x → 16.x). The intermediate 14.x/15.x line does not clear the finding; only 16.3.5 (and later) does.
   - **After**: `next` upgraded to `16.3.5`; its bundled `postcss` resolved to `8.5.23` (the top-level `postcss` devDependency was already `8.5.28`, already unaffected). Re-run of `npm audit --omit=dev` now reports **0 vulnerabilities** (previously 1 critical, 1 high). Full audit output re-verified as part of this correction, not just re-asserted.
   - The 11 pre-existing findings under `vitest`/`@vitest/coverage-v8`/`vite`/`esbuild`/`@vitest/mocker`/`vite-node` (3 moderate, 1 high, 2 critical in the *dev-inclusive* `npm audit` — 6 packages, not 11 as originally miscounted) remain genuinely **dev-tooling-only** — confirmed again post-upgrade via `npm audit --omit=dev` returning zero findings while the dev-inclusive audit still lists them. They are unrelated to `next`/`postcss` and unaffected by this revision; the CI Pipeline stage still owns the decision on that separate, pre-existing toolchain-upgrade question.

5. **[Added in Revision 1]** Next.js 15/16 migration changes required in application code, beyond the `package.json` version bump, to keep the app working correctly on `next@16.3.5` (verified via `tsc --noEmit`, `eslint`, `next build`, and the full test suite, all green — see Revision 1 in `code-generation-plan.md`'s Loop-Back Log):
   - `app/meeting/[id]/edit/page.tsx` — Next.js 15+ passes route `params` as a `Promise` even into Client Component pages. Since this page is `'use client'` (it wraps a `next/dynamic({ ssr: false })` import) and therefore can't itself be `async`, it now unwraps `params` with React's `use()` hook per the officially documented "Synchronous Page" migration pattern, instead of destructuring `params.id` directly.
   - `middleware.ts` renamed to `proxy.ts`, with the exported `middleware` function renamed to `proxy` — Next.js 16 deprecates the `middleware` filename/export in favor of `proxy`; the CSP-nonce generation and header-injection logic itself is unchanged (it only used Web-standard `crypto.getRandomValues`/`btoa`, available under the `nodejs` runtime that `proxy.ts` now runs on — the `edge` runtime is no longer selectable here, but this middleware never required it). `source-manifest.json` and `traceability.json` (NFR5.4's target) were updated to reference the new filename.
   - `next.config.js`'s `headers()` config shape and `next/dynamic({ ssr: false })` usage at the three route entry points (`app/page.tsx`, `app/meeting/new/page.tsx`, `app/meeting/[id]/edit/page.tsx`) were both re-verified against the Next.js 16 upgrade guide and require **no changes** — the config-object shape for `headers()` is unchanged, and `ssr: false` inside a Client Component's `next/dynamic()` call remains the correct, still-supported pattern (only using it from a Server Component is disallowed, which this app never does).
   - `package.json`'s `lint` script changed from `next lint` to `eslint . --ext .ts,.tsx` — the `next lint` command was removed entirely in Next.js 16.
   - `eslint-config-next` bumped `14.2.35` → `15.5.9` (the latest release still compatible with ESLint 8 and the team's affirmed `.eslintrc.json`/legacy-config toolchain — `eslint-config-next@16.x` requires ESLint ≥9 and its flat-config format, which is a materially different toolchain migration the team has not affirmed and which was judged out of scope for a security-driven revision). This surfaced one further fix: `eslint-config-next@15.5.9` bundles its own `eslint-plugin-react-hooks@5.2.0`, which collided with the project's separately pinned `eslint-plugin-react-hooks@^4.6.2` ("ESLint couldn't determine the plugin 'react-hooks' uniquely"); resolved by bumping the project's own `eslint-plugin-react-hooks` to `^5.2.0` so npm dedupes to a single copy.
   - `react`/`react-dom` were deliberately **left at `^18.3.1`** rather than bumped to React 19 — `next@16.3.5`'s own `peerDependencies` explicitly accept `react`/`react-dom` `^18.2.0` (not just `^19.0.0`), and the app's pinned `@react-pdf/renderer@^3.4.4`/`qrcode.react@^3.1.0` only declare React 16–18 as supported peers (their React-19-supporting releases are new major versions with their own migration surface). Bumping React would have forced an unrelated, unverified major upgrade of the card-generation engine — a real functional risk outside a security patch's scope — for no required gain, since the app builds, type-checks, lints, and passes its full test suite unchanged on React 18.3.1 under `next@16.3.5`.
   - `tsconfig.json` was auto-updated by the Next.js 16 build tooling itself (not hand-edited): `jsx` changed from `"preserve"` to `"react-jsx"` (mandatory — Next.js 16 uses the React automatic JSX runtime) and `include` gained `.next/dev/types/**/*.ts` (Next.js 16's separate `next dev`/`next build` output directories). All prior `strict`/`noImplicitAny`/`strictNullChecks` settings are untouched; `tsc --noEmit` is clean.

## Assumptions & Open Questions

None — the one open item from the original write-up (the `npm audit` dev-tooling findings) was re-verified as still dev-tooling-only during this correction and remains explicitly handed to CI Pipeline, not left ambiguous. The item this correction actually fixes (the production-path `next`/`postcss` findings) is now resolved and confirmed via a fresh `npm audit --omit=dev` run, not left ambiguous either.
