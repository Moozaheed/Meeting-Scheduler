**Collaborator:** aidlc-quality-agent

## Contribution

Assessment scope: testing posture, coverage tooling, CI quality gates, test/code patterns, and interview gaps for a greenfield Next.js/TypeScript app with no backend, client-side-only PDF/QR generation, and per-browser storage. No existing codebase or CI to inspect (confirmed against `evidence.md`), so everything below is a proposal to fold into `team-practices.md`'s Testing Posture section, sized to the workflow's Standard test-strategy volume (5-8 tests/component, unit+integration, pyramid ~75/20/5 per `testing-guide.md`).

### 1. Concrete tooling (the draft's biggest gap)

`team-practices.md`'s Testing Posture section states a methodology, an 80% coverage floor, and a test-type emphasis, but names no actual framework or CI enforcement mechanism. Code Generation and CI Pipeline cannot act on "80% coverage" without a tool. Proposed, standard for this stack:

- **Unit/component**: Vitest (fast, native ESM/TS, first-class Next.js/Vite ecosystem support) + React Testing Library + `@testing-library/user-event` for form/interaction tests (scheduling form, agenda add/edit/reorder/remove, attendee CRUD).
- **Coverage**: Vitest's built-in `--coverage` (v8 provider) reporting line + branch coverage; enforce the 80% line-coverage floor as a CI-blocking threshold (`vitest run --coverage --coverage.thresholds.lines=80`), consistent with the "Build and Test verifies defined coverage floors ... may not be weakened" mandate in `org.md`.
- **End-to-end**: Playwright, run across a real multi-browser matrix (Chromium, Firefox, WebKit at minimum) — this is not just a generic E2E choice, it directly operationalizes the draft's "cross-browser-aware test coverage" language for the card-generation risk, since Playwright can drive the actual download/render path per engine rather than one browser standing in for all.
- **Static gates**: `tsc --noEmit` (type check) and ESLint, both already implied by Code Style but should be explicit CI-blocking steps alongside tests, not just editor-time checks.

### 2. The load-bearing test pattern the draft is missing: verifying rendered output, not just that generation didn't throw

The initiative brief names the top technical risk as "client-side PDF + QR generation working reliably across browsers," and this task brief calls out "encoding errors, layout bugs that only show in the rendered PDF" specifically. A test that only asserts "PDF generation did not throw" does not catch either failure mode. Propose the card-generation layer's tests explicitly include:

- **PDF content assertions**: after generating the card, parse the resulting PDF (e.g. `pdf-parse` or `pdfjs-dist` text extraction) and assert the expected text is present and correctly encoded — meeting title, agenda items in the correct order, host name/contact, date/time formatted for the selected timezone. This catches silent encoding corruption (special characters, non-Latin names) that a "no exception thrown" test cannot.
- **QR payload verification**: decode the QR code rendered into the card (via a decode library such as `jsqr` against the rendered canvas/image, or decoding the QR image extracted from the PDF) and assert the payload matches the intended URL exactly — this is the only way to catch a QR that renders visually but encodes the wrong or truncated data.
- **Layout/dimension checks**: assert the exported PDF's page size matches the selected A5/US-Letter target and that content stays within printable margins — at minimum a snapshot/pixel-diff (Playwright's built-in screenshot comparison) of the live preview for both layouts, since "looks right in preview but clips on export" is a plausible failure mode distinct from content correctness.
- **Cross-browser matrix for this suite specifically**: given this is the named top risk, weight the pyramid locally — the card-generation module warrants a higher integration/E2E proportion than the 75/20/5 default elsewhere in the app, run against all three Playwright browser engines rather than a single default.

### 3. Persistence-layer test pattern

Agree with and extend the draft's proposal that IndexedDB/localStorage gets its own coverage. Concretely:

- Use `fake-indexeddb` (or jsdom's `localStorage` shim, whichever the chosen storage abstraction uses) to unit-test save/load/clear without a real browser.
- Explicit edge cases beyond the draft's "no-data/first-visit case": storage quota exceeded, corrupted/malformed stored JSON on load (should degrade to first-visit state, not crash), and private-browsing mode where IndexedDB is unavailable or throws in some browsers (Safari private mode has known IndexedDB restrictions) — this matters here because it is the same class of "only fails in a specific browser" risk as the PDF/QR concern, just in the persistence layer instead of the export layer.

### 4. CI quality gates (maps to `testing-guide.md`'s three-gate model, sized to this project)

- **Gate 1 (pre-merge, blocking)**: lint + typecheck + unit/component tests green + coverage ≥ 80% (no decrease) + no ESLint errors.
- **Gate 2 (post-merge to `main`, before/alongside the deploy-on-merge)**: Playwright E2E suite covering the full value-stream happy path (create meeting → build agenda → add attendees → preview → export PDF), run across the browser matrix — since there's no separate staging tier in scope, this effectively becomes the pre-release smoke check rather than a later-stage gate.
- **Gate 3**: given the scope document explicitly excludes performance-validation and observability, a full "Release Readiness" gate (per the generic template) doesn't map cleanly here — recommend folding its one applicable item (no open P0/P1 defects) into Gate 2 rather than standing up a separate ceremony, and treating accessibility as noted below rather than a blocking release gate unless the team wants otherwise.

### 5. Security-adjacent test note (client-only architecture)

No backend/API means the standard SAST/DAST/contract-test items in `testing-guide.md` mostly don't apply here (flagging this so the lead doesn't feel obligated to add Pact-style contract tests or a dependency-scanning gate sized for a service architecture). What does still apply, scaled down: a dependency vulnerability scan (`npm audit` or equivalent) in CI, and a lightweight input-sanitization check if any user-entered text (agenda items, attendee names) is ever rendered via `dangerouslySetInnerHTML` or otherwise interpolated into markup rather than rendered as PDF text/React children — this project has no auth to test, but XSS via a stored meeting/agenda field rendered back into the DOM is still in-scope risk surface even with per-browser-only storage.

### 6. Gaps requiring human interview resolution

1. **Framework confirmation**: Vitest+RTL+Playwright proposed above — confirm or substitute (e.g. Jest instead of Vitest) at interview; nothing about this stack is dictated by prior stages.
2. **Coverage enforcement mechanics**: confirm CI provider (GitHub Actions is the de facto default for this shape of project, but nothing upstream states it — deployment-pipeline stage will need this answer too) and whether coverage threshold failure should hard-block merge or just warn.
3. **Accessibility testing**: not mentioned anywhere in the draft, the scope document, or the initiative brief, yet the app is reachable at a public (if unlisted) URL with no login. Recommend at minimum an automated axe-core/pa11y pass on the scheduling form, agenda builder, and card preview as a non-blocking CI check to start; confirm with the team whether this should be blocking.
4. **Visual/pixel-diff tolerance**: if screenshot comparison is adopted for the card layout, confirm acceptable diff tolerance and how font-rendering differences across OS/CI runners will be handled (a common source of flaky visual tests) — recommend pinning fonts explicitly in the card renderer rather than relying on system fonts, both for test stability and to avoid host-dependent PDF output.
5. **Browser/device matrix scope**: confirm whether mobile Safari/Chrome need coverage (attendees may open the shared card link on mobile) or whether the E2E matrix stays desktop-only for v1 — this affects both Playwright config and the QR/PDF risk assessment.

## Positions

AGREE: Test-after methodology and layer-by-layer ordering are appropriate for a solo greenfield build with no prior test suite to react to.
AGREE: 80% line-coverage floor mapped from the `mvp`/`feature`/`classic` org default is the right anchor given this ships as a real product, not a `poc`/`refactor`/`workshop`.
AGREE: Proposing dedicated persistence-layer (IndexedDB/localStorage) test coverage, including the no-data/first-visit case, is the right call for a per-browser-only data model — see §3 for the edge cases I'd add.
AGREE: Deploy-on-merge-to-the-single-instance as the release event (no separate production gate) is a reasonable fit given the scope document's single-hosted-instance decision, and Gate 2 above can serve as the pre-release check in place of a manual approval step.
OBJECT: The Testing Posture section names an 80% coverage floor and a "cross-browser-aware" emphasis for card-generation but specifies no concrete framework, coverage tool, or CI enforcement mechanism — as written it isn't actionable for Code Generation or CI Pipeline; §1 above proposes a specific stack to close this gap at the interview.
OBJECT: The card-generation risk callout stops at "cross-browser-aware test coverage" without naming the verification technique that actually catches the named risk (silent encoding errors, layout-only-visible-in-render bugs) — a test that only checks "PDF generation didn't throw" would pass while shipping a corrupted card; §2 proposes decoding the rendered PDF text and QR payload as the load-bearing pattern, not just exercising the generation call.
OBJECT: No mention of accessibility testing anywhere in the draft, despite the org `testing-guide.md` default release gate including automated a11y checks and this app being reachable at a public (unlisted) URL with no auth barrier — propose surfacing this as an explicit interview question rather than leaving it silently out of scope (see §6.3).
