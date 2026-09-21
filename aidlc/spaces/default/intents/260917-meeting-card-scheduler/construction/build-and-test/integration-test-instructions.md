# Integration Test Instructions — Meeting Scheduler & Invitation Card Generator

This app has no backend API boundary — its only real "integration" boundary
is the full client-side value stream across `Presentation → Scheduling →
PersistenceAdapter`/`CardGeneration`, exercised end-to-end in a real browser.
Per Standard strategy, this is covered by one Playwright E2E spec (not a
separate mocked-integration layer, which would duplicate what the E2E spec
already exercises for real).

## Test Framework Setup

Playwright, configured at `playwright.config.ts` (Chromium/Firefox/WebKit
desktop + mobile-chrome/mobile-safari — NFR3.1). `webServer` builds and
starts the production server automatically before the suite runs.

```bash
npx playwright install   # one-time, downloads browser binaries
```

## How to Run

```bash
npx playwright test e2e/happy-path.spec.ts
```

Scoped to Chromium only (fast local iteration):

```bash
npx playwright test e2e/happy-path.spec.ts --project=chromium
```

## Coverage

One spec, `e2e/happy-path.spec.ts`: create meeting (FR1.1) → build agenda
(FR2.1) → add attendee (FR3.1) → live preview reflects the draft (NFR1.1,
BR5.1) → save → reopen from the Meetings List (FR4.1) → export the PDF
(FR5.1-FR5.3, BR5.2). This is the full value-stream happy path `team.md`
Gate 2 names, run across all 5 configured browser projects — no
per-browser branching needed, Playwright fans the one spec out itself.

Card-export assertion depth stays at the affirmed lighter "didn't crash"
level (`project.md` Forbidden): the spec asserts the success confirmation
appears, never parses the PDF's text or decodes the QR payload.

## Test Data Management

Each test run starts from a fresh, empty IndexedDB (a new browser context
per Playwright test) — no seed data or fixtures needed; the spec creates
its own meeting from scratch.

## Result

**53/53 unit/component tests remain green** (re-verified in this stage,
unchanged from Code Generation). **The E2E spec required two fixes to
generated application source before it could pass** — see
`build-and-test-summary.md`'s Target Verification Matrix and
`test-results.md`'s Loop-Back Log for the full diagnosis. After those
fixes, **all 5 browser projects pass** (Chromium, Firefox, WebKit,
mobile-chrome, mobile-safari).

## Assumptions & Open Questions

None.
