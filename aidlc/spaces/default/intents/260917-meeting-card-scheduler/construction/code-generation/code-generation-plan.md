# Code Generation Plan — Meeting Scheduler & Invitation Card Generator

Zero-Unit stage-level plan (this project has no Units Generation output — a
custom, single-component-group scope). All application code is generated in
one implementation pass covering the full app.

## Testing Contract

```json
{
  "version": 1,
  "methodology": "test-after",
  "source": "team",
  "ordering": "implement each applicable testable layer (scheduling form",
  "scope": "meeting-card-scheduler",
  "test_strategy": "standard",
  "project_type": "greenfield",
  "applicable_notes": [
    {
      "layer": "org",
      "text": "We treat tests as a first-class deliverable in every Bolt. The specific\nmethodology (TDD, BDD, ATDD, or classic test-after) is affirmed at\npractices-discovery and recorded in `team.md` under this heading with explicit\n`Methodology` and `Ordering` fields; Code Generation resolves those fields\nindependently from coverage, tooling, and scope notes.\n\nWhen no posture has been affirmed, our default per scope is:\n- **Methodology**: test-after\n- **Ordering**: implement each applicable testable layer, then write and run\n  that layer's tests.\n- `mvp`, `enterprise`, `feature`, `infra`, `classic` add an 80% line-coverage\n  floor and CI execution before merge.\n- `bugfix`, `security-patch` add a targeted regression for the specific\n  bug/vulnerability and require the existing suite to remain green.\n- `express` uses the Minimal strategy: requirement-driven unit tests (one per\n  requirement, with a happy-path floor per component); existing tests remain\n  green.\n- `poc`, `refactor`, `workshop` add no extra new-test floor and require the\n  existing suite to remain green.\n\nThe active `Test Strategy` still applies in every scope and determines test\nvolume/types. Scope floors are additive; they never reduce or replace the\nselected strategy.\n\nBuild and Test verifies defined coverage floors and affirmed quality targets;\nthey may not be weakened to make a step pass.\n\nAffirm a stricter posture in `team.md` if the team commits to one."
    },
    {
      "layer": "team",
      "text": "- **Methodology**: test-after\n- **Ordering**: implement each applicable testable layer (scheduling form\n  and state, agenda builder CRUD/reorder logic, attendee management,\n  PDF/QR card-generation engine, and the live preview), then write and run\n  that layer's tests before moving to the next layer.\n\nConfirmed at interview: write code first, then tests right after each piece\n(test-after, not test-first) (Q3).\n\n- **Coverage floor**: 80% line coverage (Q4), treated the same as the\n  `mvp`/`feature`/`classic` floor in `org.md`, since this is a real shipped\n  product (not a `poc`, `refactor`, or `workshop`) — enforced as a\n  CI-blocking threshold via Vitest's built-in `--coverage` (v8 provider):\n  `vitest run --coverage --coverage.thresholds.lines=80`.\n- **Toolset** (confirmed at interview, Q3):\n  - **Unit/component**: Vitest + React Testing Library +\n    `@testing-library/user-event` for form/interaction tests (scheduling\n    form, agenda add/edit/reorder/remove, attendee CRUD).\n  - **End-to-end**: Playwright, run across a real multi-browser matrix\n    (Chromium, Firefox, WebKit at minimum) to operationalize\n    cross-browser-aware coverage for the card-generation risk.\n  - **Static gates**: `tsc --noEmit` (type check) and ESLint, both\n    CI-blocking steps alongside tests, not just editor-time checks.\n- **Card-export test depth — lighter check, by explicit human decision**:\n  the quality reviewer proposed a deep verification pattern for the\n  card-generation path — parsing the generated PDF's text content and\n  decoding the rendered QR payload to assert the exact expected data, plus\n  layout/dimension snapshot checks. The human explicitly **declined** this\n  deep content-verification pattern (Q4, answer B). Card-export tests\n  instead use a **lighter \"didn't crash\" check**: assert that generation\n  completes without throwing, produces a non-empty PDF output, and renders\n  a QR image, across the Playwright browser matrix — without opening the\n  PDF to verify its text content or decoding the QR payload to verify it\n  matches the intended data. See `evidence.md` for the full traceability\n  note on this declined recommendation.\n- **Persistence layer**: since data is per-browser-only (no shared\n  database), the persistence layer (IndexedDB/localStorage) gets its own\n  dedicated test coverage for save/load/clear behavior, including:\n  - the no-data/first-visit case;\n  - **storage quota exceeded**;\n  - **corrupted/malformed stored data on load** (must degrade gracefully to\n    first-visit state, not crash);\n  - **private-browsing IndexedDB restrictions** (some browsers, notably\n    Safari private mode, restrict or throw on IndexedDB access — this must\n    be handled, not crash the app).\n\n  Use `fake-indexeddb` (or the jsdom `localStorage` shim, whichever the\n  chosen storage abstraction uses) to unit-test save/load/clear without a\n  real browser.\n- **Accessibility checks**: automated accessibility checks (e.g.\n  axe-core/pa11y) on the scheduling form, agenda builder, and card preview,\n  run as a **non-blocking** CI check — confirmed at interview (Q9, answer\n  B, combined with mobile coverage below).\n- **Mobile browser coverage**: the Playwright E2E matrix also covers mobile\n  browsers (attendees may open the shared card link on mobile), not\n  desktop-only — confirmed at interview (Q9, answer B).\n- **CI quality gates**:\n  - **Gate 1 (pre-merge, blocking)**: lint + typecheck + unit/component\n    tests green + coverage ≥ 80% (no decrease) + no ESLint errors + the\n    security gates in `## Code Style` below.\n  - **Gate 2 (post-merge to `main`, before/alongside the deploy-on-merge)**:\n    Playwright E2E suite covering the full value-stream happy path (create\n    meeting → build agenda → add attendees → preview → export PDF), run\n    across the browser matrix (desktop + mobile) — since there's no\n    separate staging tier in scope, this is effectively the pre-release\n    smoke check.\n  - Accessibility checks run in CI as a non-blocking signal alongside these\n    gates, not as a merge-blocking gate."
    }
  ],
  "obligations": {
    "strategy": "standard",
    "strategy_volume": [
      "Five to eight tests per component.",
      "Unit tests plus integration tests for key boundaries.",
      "Add E2E, performance, or security tests when requirements demand them."
    ],
    "scope_floor": [
      "Keep the existing test suite green.",
      "This scope adds no extra new-test floor beyond the selected test strategy."
    ],
    "combination_rule": "Apply every selected-strategy obligation and every scope-floor obligation; neither replaces the other, and a targeted scope regression may add the narrowest necessary test type beyond the strategy default."
  },
  "plan_profile": {
    "methodology": "test-after",
    "runner_step": "Bootstrap the minimal test runner/configuration and record the exact unit-scoped command.",
    "runner_ready_before_first_test": true,
    "testable_layers": [
      "Data model / database behavior",
      "Repository / data access",
      "Business logic",
      "API / endpoint",
      "Frontend behavior"
    ],
    "steps": [
      "Project structure and production configuration skeleton.",
      "Bootstrap the minimal test runner/configuration and record the exact unit-scoped command.",
      "Data model / database behavior - implement.",
      "Data model / database behavior - write and run its tests after implementation.",
      "Repository / data access - implement.",
      "Repository / data access - write and run its tests after implementation.",
      "Business logic - implement.",
      "Business logic - write and run its tests after implementation.",
      "API / endpoint - implement.",
      "API / endpoint - write and run its tests after implementation.",
      "Frontend behavior - implement.",
      "Frontend behavior - write and run its tests after implementation.",
      "Environment/build configuration.",
      "Documentation and traceability."
    ]
  },
  "input_sha256": "sha256:e70f61276266acbae55e91cf536133270ed02e46b264b56818decbbf60307127",
  "contract_sha256": "sha256:9d043f76218536d09a2f0b8e6588948f2e253857f9f78a946c3a13fdb92dfc98"
}
```

## Layer Mapping (adapting `plan_profile.steps` to this app's architecture)

Per `domain-design/decisions.md` ADR-001 and `team.md`'s affirmed layer
boundaries, this app has four layers, not a classic API-backed stack:

| Testing-Contract layer | This app's equivalent | Why |
|---|---|---|
| Data model / database behavior | `types/domain.ts` (Meeting/AgendaItem/Attendee) + `lib/persistence/` (`PersistenceAdapter`, IndexedDB via `idb-keyval`) | The "database" is client-side IndexedDB; `entities.md` is the data model |
| Repository / data access | Folded into `lib/persistence/` above — this app has no separate repository layer distinct from the persistence adapter (a narrow save/load/clear/list interface already fills that role, per ADR-002) | Avoids inventing a redundant abstraction layer ADR-002 already decided against |
| Business logic | `lib/store/` (`Scheduling` domain/state layer: validation, CRUD, ordering, the sole caller of `PersistenceAdapter` and `CardGeneration`) | Matches `rules.md`'s BR1.1–BR7.1 and `frontend-components.md`'s hook contracts |
| API / endpoint | **Not applicable** — this app has no backend API; every operation is a client-side call into `Scheduling` | Confirmed by `tech-stack-decisions.md`/`infrastructure-specification.md`: zero third-party APIs, no server-side data layer |
| Frontend behavior | `components/`, `app/` routes (Presentation) + `lib/card/` (`CardGeneration`: `@react-pdf/renderer` + `qrcode.react`) | Matches `frontend-components.md`'s component hierarchy |

## Plan Steps

- [x] **Step 1 — Project structure and production configuration skeleton.** Next.js 14 App Router + TypeScript project (`create-next-app` shape, not the CLI itself): `package.json`, `tsconfig.json` (`strict: true`), `next.config.js` (static security headers per `security-design.md`: CSP static directives, HSTS, X-Frame-Options, X-Content-Type-Options), `middleware.ts` (per-request CSP `script-src` nonce injection per `security-design.md`/`infrastructure-specification.md`'s Edge Middleware row), `tailwind.config.ts` + `postcss.config.js`, `.eslintrc.json` (`eslint-config-next` + `eslint-plugin-react-hooks` + `eslint-plugin-security` + `react/no-danger` + `eslint-plugin-no-unsanitized` + `eslint-plugin-import` order rule, per `team.md` Code Style), `.prettierrc`, `vercel.json`, `.gitignore` (excludes `.env*` except `.env.example`), directory skeleton (`app/`, `components/{meeting,agenda,attendees,card,ui}/`, `lib/{store,persistence,card,validation}/`, `types/`).
- [x] **Step 2 — Bootstrap the minimal test runner/configuration.** `vitest.config.ts` (jsdom environment, `@testing-library/jest-dom` matchers, v8 coverage provider with `coverage.thresholds.lines: 80`), `vitest.setup.ts`, `playwright.config.ts` (Chromium/Firefox/WebKit + mobile viewports per `team.md`). Record the exact unit-scoped run command in `unit-test-instructions.md` before any test-first work — this project is test-after, so this step establishes the runner ahead of Step 3's implement-then-test cadence, not a TDD Red step.
- [x] **Step 3 — Data model / database behavior: implement.** `types/domain.ts` (Meeting, AgendaItem, Attendee interfaces per `entities.md`); `lib/persistence/persistence-adapter.ts` (`idb-keyval`-backed `save`/`load`/`clear`/`list`, typed `PersistenceError`, quota/corrupted-data/private-browsing handling per `reliability-design.md` NFR4.1).
- [x] **Step 4 — Data model / database behavior: tests.** `lib/persistence/persistence-adapter.test.ts` using `fake-indexeddb` — first-visit/no-data case, save/load/clear round-trip, quota-exceeded, corrupted stored data, private-browsing restriction (all per `team.md`'s Persistence layer test list). Maps to NFR4.1.
- [ ] **Step 5 — Repository / data access.** No separate step — covered by Step 3/4 (`PersistenceAdapter` fills this role per the Layer Mapping table above; ADR-002).
- [x] **Step 6 — Business logic: implement.** `lib/store/scheduling-store.ts` and hooks (`useMeetingsList`, `useMeeting`, `useAgendaItems`, `useAttendees`, `useClearAllData`) per `frontend-components.md`'s hook contracts; field/entity validation implementing BR1.1–BR3.4; ordering/cascade logic (BR2.2, BR4.1, BR4.2); `renderPreview`/`exportCard` delegating methods that are the sole caller of `CardGeneration` (per the NFR-design review fix); PersistenceError → in-memory-fallback translation (NFR4.1); MeetingDraft ownership independent of save outcome (NFR4.2).
- [x] **Step 7 — Business logic: tests.** `lib/store/scheduling-store.test.ts` — BR1.1–BR1.4 validation, BR2.1–BR2.3 agenda rules, BR3.1–BR3.4 attendee rules, BR4.1 sort order, BR4.2 cascade delete, BR6.1 clear-all, the `exportCard`/`renderPreview` delegation contract, persistence-failure fallback.
- [ ] **Step 8 — API / endpoint.** Not applicable — no backend API exists (see Layer Mapping table). No step generated.
- [x] **Step 9 — Frontend behavior: implement.** `lib/card/card-generation.ts` (`renderPreview`/`exportPdf` using `@react-pdf/renderer` at fixed US Letter dimensions per BR5.2, `qrcode.react` for the BR5.1 QR payload); `components/meeting/MeetingDetailsForm.tsx`; `components/agenda/AgendaBuilder.tsx` + `AgendaItemRow.tsx`; `components/attendees/AttendeeManager.tsx` + `AttendeeRow.tsx`; `components/card/LiveCardPreview.tsx` (debounced ~300ms per `performance-design.md`) + `ExportButton.tsx` (calls `Scheduling.exportCard()`, never `CardGeneration` directly) + a React error boundary around the card preview/export subtree (`reliability-design.md`); `components/meeting/MeetingsListPage.tsx`, `MeetingListRow.tsx`, `DeleteConfirmation.tsx`, `ClearMyDataAction.tsx`; `app/page.tsx`, `app/meeting/new/page.tsx`, `app/meeting/[id]/edit/page.tsx`, `app/layout.tsx` (includes the PII/browser-storage disclosure statement per `team.md`). `data-testid` attributes on every interactive element.
- [x] **Step 10 — Frontend behavior: tests.** Component tests (Vitest + RTL + `user-event`) for `MeetingDetailsForm`, `AgendaBuilder`, `AttendeeManager`, `LiveCardPreview`/`ExportButton`, `MeetingsListPage` — form validation display, add/edit/reorder/remove interactions, export loading/success/error states, empty-list state. Card-export tests use the lighter "didn't crash" depth (non-empty PDF, QR renders, no exception — per `project.md` Forbidden) rather than deep PDF-text/QR-payload assertions.
- [x] **Step 11 — Environment/build configuration.** `.env.example` (empty — no runtime secrets exist per `security-design.md`); `README.md` (`npm run dev`/`npm run build` instructions); confirm `npm run build` succeeds with zero type errors.
- [ ] **Step 12 — Documentation and traceability.** `code-summary.md`, `source-manifest.json`, `traceability.json` (this stage's own completion artifacts, produced after generation per Step 5 of the stage protocol, not part of the developer-agent's delegated work).

## Story-to-Code-Step Traceability

This project has no User Stories stage (FR/BR-numbered requirements were
used throughout instead of a story map). Traceability below maps
`requirements.md` FRs and `rules.md` BRs directly to plan steps.

| Requirement / Rule | Plan Step(s) |
|---|---|
| FR1.1–FR1.3 (meeting scheduling & details), BR1.1–BR1.4 | Steps 3, 6, 7, 9, 10 |
| FR2.1–FR2.3 (agenda builder), BR2.1–BR2.3 | Steps 3, 6, 7, 9, 10 |
| FR3.1–FR3.4 (attendee management), BR3.1–BR3.4 | Steps 3, 6, 7, 9, 10 |
| FR4.1–FR4.2 (meetings list), BR4.1–BR4.2 | Steps 6, 7, 9, 10 |
| FR5.1–FR5.5 (invitation card engine), BR5.1–BR5.2, NFR1.1–NFR1.2 | Steps 6, 7, 9, 10 |
| FR6.1–FR6.2 (persistence & clear-my-data), BR6.1 | Steps 3, 4, 6, 7, 9 |
| NFR2.1 (accessibility) | Step 9 (semantic HTML, ARIA, keyboard support per `interaction-spec.md`) |
| NFR3.1 (browser/device compatibility) | Step 2 (Playwright multi-browser + mobile config) |
| NFR4.1–NFR4.3 (reliability) | Steps 3, 4, 6, 7 |
| NFR5.1–NFR5.4 (security) | Steps 1 (headers/middleware), 6 (input handling), 9 (React escaping) |
| NFR6.1 (scalability) | Step 1 (no code change — platform default, documented not implemented) |
| NFR7.1 (observability) | Step 6 (`console.error`/`console.warn` per `observability-design.md`) |
| BR7.1 (Upcoming/Past computed status) | Step 6 (pure function), Step 9 (display) |

## Loop-Back Log

### Revision 1 (adversarial code review, iteration 1, NOT-READY)

The architecture reviewer independently ran the build/test suite and found
it green as reported (53/53 tests, 93.7% coverage), but caught a Critical
finding: `code-summary.md` claimed all `npm audit` findings were
dev-tooling-only, but `npm audit --omit=dev` shows a Critical
unauthenticated-RCE vulnerability in the pinned production `next@14.2.35`
dependency and a High file-disclosure vulnerability in `postcss` — both
direct production dependencies, not dev tooling. The human, presented with
the finding, chose to upgrade rather than accept the risk.

- [x] **Revision Step 1** — **Actual outcome (revised from the plan below): no 14.x/15.x patch clears the vulnerability range — `npm audit`'s own recommended fix required a semver-major jump.** Upgraded `next` from `14.2.35` to `16.3.5` (across Next.js 15 and 16) and its transitive `postcss` to a resolved version, in `package.json`; ran `npm install` to regenerate `package-lock.json`. (Original plan text, superseded: ~~Upgrade `next` (14.2.35 → latest patched 14.x) and `postcss` (^8.4.47 → latest patched)~~.) See `code-summary.md` deviation-4/5 for the full before/after account and the associated Next.js 15/16 code migration this major jump required.
- [x] **Revision Step 2** — Re-ran `npx tsc --noEmit`, `npx eslint . --ext .ts,.tsx`, `npm run build`, and `npx vitest run --coverage --coverage.thresholds.lines=80` to confirm the major-version upgrade introduced no regressions — all clean, 53/53 tests still passing at 93.7% coverage.
- [x] **Revision Step 3** — Re-run `npm audit --omit=dev` to confirm the Critical/High production findings are resolved.
- [x] **Revision Step 4** — Correct `code-summary.md`'s deviation-4 entry to accurately state that the `next`/`postcss` vulnerabilities were production-path (not dev-tooling-only) and have been resolved by the version upgrade, with the before/after `npm audit` result.
- [x] **Revision Step 5** — Update `source-manifest.json` and `traceability.json` only if any new/changed files result (expected: `package.json`, `package-lock.json` already listed as part of the original Step 1 write; `code-summary.md` is a stage artifact, not application source, so no source-manifest change is expected).

## Assumptions & Open Questions

None.
