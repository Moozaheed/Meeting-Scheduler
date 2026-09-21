# Team Practices — Meeting Scheduler & Invitation Card Generator

> **Status: AFFIRMED.** This is a greenfield, solo-builder project with no
> existing codebase to read practices from. The practices below started as
> proposals adapted from the org-level defaults in
> `aidlc/spaces/default/memory/org.md` (single self-contained Next.js repo,
> no backend service, client-side-only PDF/QR generation, per-browser data,
> centrally hosted), were reviewed by three independent specialists
> (quality, developer, devsecops), and were confirmed, adjusted, or declined
> by the human at the practices-discovery interview
> (`practices-discovery-questions.md`). Everything below is now a settled
> team fact for this project.

## Way of Working

We use **trunk-based development**: all work merges to `main` via
short-lived feature branches (resolved within 1-2 days), avoiding long-lived
branches and the merge debt they accumulate. Confirmed as-is at interview
(Q1).

For Construction worktrees, the worktree base branch is `main` and the
merge target is `main`.

This is a single self-contained repository with no separate services or
deployment targets to fan out across, so there is no need for
environment-specific long-lived release branches — releases are gated by
the deploy pipeline itself (see Deployment below), not by branch strategy.

We **squash-merge** Bolt branches into `main`: each Bolt becomes one commit
on the trunk, named by the Bolt slug, with the full Bolt commit history
preserved on the source branch until the worktree is discarded. This keeps
`main` linear and mapped 1:1 to the delivery-planning Bolt sequence; the
audit log preserves the full event sequence regardless.

## Walking Skeleton

**Not applicable this run.** The active scope file
(`.claude/scopes/aidlc-meeting-card-scheduler.md`) declares `skeleton: off`,
so per org policy we skip the walking-skeleton ceremony entirely — the first
Bolt runs like any other Bolt, there's nothing to bootstrap first. Confirmed
at interview (Q2).

Because skeleton mode is off, the ladder prompt ("How should the remaining
Bolts run?" — continue autonomously vs. gate every Bolt) still applies at
Construction kickoff rather than after a Bolt 1 bootstrap; that choice will
be recorded as `Construction Autonomy Mode` in `aidlc-state.md` when
Construction begins.

## Testing Posture

- **Methodology**: test-after
- **Ordering**: implement each applicable testable layer (scheduling form
  and state, agenda builder CRUD/reorder logic, attendee management,
  PDF/QR card-generation engine, and the live preview), then write and run
  that layer's tests before moving to the next layer.

Confirmed at interview: write code first, then tests right after each piece
(test-after, not test-first) (Q3).

- **Coverage floor**: 80% line coverage (Q4), treated the same as the
  `mvp`/`feature`/`classic` floor in `org.md`, since this is a real shipped
  product (not a `poc`, `refactor`, or `workshop`) — enforced as a
  CI-blocking threshold via Vitest's built-in `--coverage` (v8 provider):
  `vitest run --coverage --coverage.thresholds.lines=80`.
- **Toolset** (confirmed at interview, Q3):
  - **Unit/component**: Vitest + React Testing Library +
    `@testing-library/user-event` for form/interaction tests (scheduling
    form, agenda add/edit/reorder/remove, attendee CRUD).
  - **End-to-end**: Playwright, run across a real multi-browser matrix
    (Chromium, Firefox, WebKit at minimum) to operationalize
    cross-browser-aware coverage for the card-generation risk.
  - **Static gates**: `tsc --noEmit` (type check) and ESLint, both
    CI-blocking steps alongside tests, not just editor-time checks.
- **Card-export test depth — lighter check, by explicit human decision**:
  the quality reviewer proposed a deep verification pattern for the
  card-generation path — parsing the generated PDF's text content and
  decoding the rendered QR payload to assert the exact expected data, plus
  layout/dimension snapshot checks. The human explicitly **declined** this
  deep content-verification pattern (Q4, answer B). Card-export tests
  instead use a **lighter "didn't crash" check**: assert that generation
  completes without throwing, produces a non-empty PDF output, and renders
  a QR image, across the Playwright browser matrix — without opening the
  PDF to verify its text content or decoding the QR payload to verify it
  matches the intended data. See `evidence.md` for the full traceability
  note on this declined recommendation.
- **Persistence layer**: since data is per-browser-only (no shared
  database), the persistence layer (IndexedDB/localStorage) gets its own
  dedicated test coverage for save/load/clear behavior, including:
  - the no-data/first-visit case;
  - **storage quota exceeded**;
  - **corrupted/malformed stored data on load** (must degrade gracefully to
    first-visit state, not crash);
  - **private-browsing IndexedDB restrictions** (some browsers, notably
    Safari private mode, restrict or throw on IndexedDB access — this must
    be handled, not crash the app).

  Use `fake-indexeddb` (or the jsdom `localStorage` shim, whichever the
  chosen storage abstraction uses) to unit-test save/load/clear without a
  real browser.
- **Accessibility checks**: automated accessibility checks (e.g.
  axe-core/pa11y) on the scheduling form, agenda builder, and card preview,
  run as a **non-blocking** CI check — confirmed at interview (Q9, answer
  B, combined with mobile coverage below).
- **Mobile browser coverage**: the Playwright E2E matrix also covers mobile
  browsers (attendees may open the shared card link on mobile), not
  desktop-only — confirmed at interview (Q9, answer B).
- **CI quality gates**:
  - **Gate 1 (pre-merge, blocking)**: lint + typecheck + unit/component
    tests green + coverage ≥ 80% (no decrease) + no ESLint errors + the
    security gates in `## Code Style` below.
  - **Gate 2 (post-merge to `main`, before/alongside the deploy-on-merge)**:
    Playwright E2E suite covering the full value-stream happy path (create
    meeting → build agenda → add attendees → preview → export PDF), run
    across the browser matrix (desktop + mobile) — since there's no
    separate staging tier in scope, this is effectively the pre-release
    smoke check.
  - Accessibility checks run in CI as a non-blocking signal alongside these
    gates, not as a merge-blocking gate.

## Deployment

We **deploy on merge** to the single hosted instance (e.g. Vercel or an
equivalent static/SSR-friendly host) — confirmed at interview (Q5, answer
A: auto-deploy on every merge, no manual step). There is no separate
staging/production split in scope, since the scope document defines only
one centrally-reachable instance reached via an unlisted URL with no
login/access-control layer.

Every merge-triggered deploy to that single hosted instance is the release
itself; there is no distinct manual-approval gate before a second
"production" promotion. This is a confirmed deviation from the org
default's staging/production split, appropriate for this single-instance,
solo-decision-maker project.

The deploy-on-merge decision is paired with the CI security gates below
running **before** merge (not left implicit) — secret scanning, SAST, and
dependency audit all fire as blocking pre-merge checks, since this is an
internet-facing app handling PII even without a manual deploy gate.

Deployment-pipeline and deployment-execution stages were added to this
workflow's scope specifically to support this hosting need (see
`../../ideation/approval-handoff/initiative-brief.md`); environment
provisioning, observability, incident response, and performance validation
remain out of scope per the scope document, since this isn't
production-infrastructure-grade operations.

## Code Style

We defer to project-level configuration for style, per the org default,
plus the security-relevant additions below (confirmed at interview, Q7):

- **Formatter**: Prettier, configured at the repo root (`.prettierrc`).
- **Linter**: ESLint (`eslint-config-next` as the base, with
  `eslint-plugin-react-hooks` enabled), run before merge; failures block
  the PR/Bolt.
- **Naming conventions**:
  - TypeScript/JavaScript idiomatic — camelCase for variables/functions,
    PascalCase for React components and types.
  - **Files**: kebab-case for non-component files (`meeting-form.ts`,
    `qr-generator.ts`, `use-agenda-store.ts`); PascalCase filenames
    matching the exported component for component files
    (`MeetingForm.tsx`, `AgendaBuilder.tsx`).
  - **Hooks**: `use` prefix, camelCase (`useAttendeeList`,
    `useCardExport`).
  - **Domain vocabulary**: fix one term per concept and use it everywhere
    — code, types, UI copy, file names (`meeting`, `agenda item`,
    `attendee`, `host`, `invitation card` — no synonyms such as
    `participant`/`session`).
  - **Types**: suffix-free domain types (`Meeting`, `AgendaItem`,
    `Attendee`), not `IMeeting`/`MeetingType`.
  - **Constants**: `SCREAMING_SNAKE_CASE` for true constants (card
    dimensions, storage keys, default timezone), colocated with the module
    that owns them rather than a single catch-all `constants.ts`.
- **Import ordering**: external packages, then `lib/`/`types/` absolute
  imports, then relative imports — enforced via `eslint-plugin-import`'s
  `order` rule.
- **No default exports** for non-page/layout files (named exports only);
  Next.js route files (`page.tsx`, `layout.tsx`) are the one exception
  since the framework requires default exports there.
- **Styling**: Tailwind CSS utility classes as the primary styling
  approach, consistent with the stated tech stack.
- **TypeScript strict mode**: `strict: true` in `tsconfig.json`
  (`noImplicitAny`, `strictNullChecks`) — cheaper to start strict than to
  retrofit, and the domain/persistence/card-engine boundary below depends
  on trustworthy types at each layer seam.

### Layer boundaries (confirmed at interview, Q6)

**UI never talks to persistence or the card-generation engine directly —
always through the domain/state layer.** This separation is enforced, not
optional:

1. **UI layer** (`app/` routes + `components/`) — React components, forms,
   presentation. Reads/writes domain state via hooks only; never calls
   IndexedDB/localStorage or the PDF/QR library directly.
2. **Domain/state layer** (`lib/store/` or equivalent) — meeting, agenda,
   attendee state and the operations on them (add/edit/reorder/remove).
   Owns validation of domain invariants.
3. **Persistence layer** (`lib/persistence/`) — the IndexedDB/localStorage
   adapter. Exposes a narrow save/load/clear interface; the domain layer
   depends on this interface, never the other way around, and UI
   components never import it directly.
4. **Card-generation engine** (`lib/card/`) — PDF layout + QR generation,
   pure functions from validated domain data to a PDF/QR output. Does not
   read from the store or the DOM itself, which keeps it independently
   testable and reusable for the live preview vs. the actual export.

### File organization

```
app/
  page.tsx                  # entry / meeting creation flow
  layout.tsx
components/
  meeting/                  # scheduling form fields
  agenda/                   # agenda builder (add/edit/reorder/remove)
  attendees/                # attendee list management
  card/                     # invitation-card preview UI
  ui/                       # shared/generic UI primitives (buttons, inputs)
lib/
  store/                    # domain/state layer
  persistence/              # IndexedDB/localStorage adapter
  card/                     # PDF layout + QR generation engine
  validation/                # shared field-level validators
types/
  domain.ts                 # Meeting, AgendaItem, Attendee, Host
```

Co-locate each feature's component tests next to the component
(`MeetingForm.tsx` + `MeetingForm.test.tsx`) rather than a parallel
`__tests__` tree — keeps the test-after ordering easy to verify by
directory inspection during review.

### Error handling

- **Persistence boundary**: IndexedDB/localStorage calls must handle quota
  exceeded, storage disabled (private browsing), and corrupted/unparseable
  stored data — none of them should crash the app. Recoverable: fall back
  to in-memory state for the session and surface a non-blocking notice.
  Fatal-for-that-operation-only: a single failed save must not lose the
  in-progress form data held in component state.
- **Card-generation boundary**: generation failures must be caught and
  surfaced to the user as an actionable error (e.g. "PDF export failed —
  try again" with a retry action), never a silent no-op. A loading/progress
  state during export is required so a hung/slow generation is not
  indistinguishable from a crash.
- **Form validation boundary**: validation errors are field-level and
  inline (not a single top-of-form banner).
- **Error boundaries**: at least one React error boundary around the card
  preview/export flow, so a rendering exception in a third-party PDF/QR
  library does not take down the whole scheduling UI.

### Security tooling (confirmed at interview, Q7 — all three)

- **Secret scanning**: Gitleaks as a pre-commit hook, and again in CI as the
  backstop; plus GitHub's native secret scanning as a second backstop.
  `.gitignore` excludes `.env*` (except `.env.example`) from day one. If a
  secret is ever committed: revoke/rotate immediately, then clean git
  history.
- **Dependency scanning**: Dependabot (native to GitHub, weekly) on the npm
  ecosystem for direct and transitive alerts, plus `npm audit` (or
  equivalent) in CI, failing the build on Critical/High findings with a
  known exploit, run on every PR and a scheduled weekly job. Commit the
  lockfile and use `npm ci` (not `npm install`) in CI/build.
- **Code security lint checks**: `eslint-plugin-security` (unsafe
  regex/ReDoS, `eval`, non-literal `fs`/`require`); `react/no-danger`
  (flag any `dangerouslySetInnerHTML` use — this app renders attendee
  names, agenda topics, and free-text meeting descriptions into a live
  preview, so banning raw HTML injection by default is the cheapest XSS
  control available); `eslint-plugin-no-unsanitized` if any direct DOM
  manipulation is used outside React's own escaping (e.g. inside the
  PDF/QR generation code). All enforced as CI-blocking, not warnings.
- **SAST**: GitHub CodeQL default setup as the baseline gate on every PR;
  block merge on Critical/High findings, warn on Medium.

**Confirmed CI gate sequence**: secret scan → SAST → dependency audit, all
blocking, before merge:

| Stage | Gate | Action on failure |
|---|---|---|
| Pre-commit | Gitleaks secret scan | Block commit |
| PR | ESLint (incl. security plugins) + CodeQL SAST | Block merge on Critical/High |
| PR / scheduled | `npm audit` dependency scan | Fail on Critical/High with known exploit |

### PII and browser-storage disclosure

Attendee name/email and host name/contact email are **PII**, even though
they never leave the visitor's own browser. Two points the team affirms as
conscious, disclosed decisions rather than silent assumptions:

- Browser storage (IndexedDB/localStorage) is **not encrypted at rest** in
  any way that resists a compromised or shared device — there is no
  server-side key management story for a client-only app, and building one
  would be misleading. This is documented in the app itself (e.g. a short
  line near the data: "your data stays on this device only, in plain
  browser storage — don't use it on a shared computer for sensitive
  meetings").
- Because the instance has no authentication and PII is entered into forms
  rendered by a live preview, all user-entered text is treated as
  untrusted input for rendering purposes (see `react/no-danger` above),
  even with no server round-trip.

**Confirmed product decision (Q8)**: the app includes a visible **"clear my
data"** action that wipes IndexedDB/localStorage for that browser, since
storage otherwise persists indefinitely with no retention policy next to
PII.
