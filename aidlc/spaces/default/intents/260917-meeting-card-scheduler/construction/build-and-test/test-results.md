# Test Results — Meeting Scheduler & Invitation Card Generator

## Build Status

**Success.** `npx tsc --noEmit` clean, `npx eslint . --ext .ts,.tsx` clean
(0 errors, 0 warnings), `npm run build` succeeds (Next.js 16.3.5,
Turbopack) — all 4 routes generate, `ƒ Proxy (Middleware)` active.

## Unit/Component Test Results

| Metric | Value |
|---|---|
| Test files | 9 |
| Tests | 53 |
| Passed | 53 |
| Failed | 0 |
| Skipped | 0 |
| Line coverage | 93.7% (floor: 80%) |
| Branch coverage | 81.57% |
| Function coverage | 86% |

Unchanged from Code Generation's own results — re-verified independently
in this stage, not just re-asserted.

## Integration (E2E) Test Results

| Project | Result |
|---|---|
| chromium | Passed |
| firefox | Passed |
| webkit | Passed |
| mobile-chrome | Passed |
| mobile-safari | Passed |

**5/5 browser projects passed** — but only after two in-stage fixes to
generated application source; see the Loop-Back Log below for the full
diagnosis. The first several runs of `e2e/happy-path.spec.ts` failed for
reasons the 53 unit/component tests never surfaced, because Vitest's
jsdom environment does not enforce a CSP the way a real browser does.

## Security Test Results

`npm audit --omit=dev`: 0 vulnerabilities. CSP runtime verification: see
`security-test-instructions.md` — both findings below were CSP-related and
are now resolved. Secret scanning and SAST are Deferred to `ci-pipeline`
(see `security-test-instructions.md`).

## Performance Test Results

Both NFR1.1 (≤1s preview) and NFR1.2 (≤3s export) observed **Met** during
manual and E2E-incidental timing — see `performance-test-instructions.md`.

## Coverage Report

See the Unit/Component table above; full per-file breakdown available via
`npx vitest run --coverage` (already captured in `code-generation/code-summary.md`
and re-confirmed unchanged here).

## Loop-Back Log

### Loop-back 1 — 2026-09-21T13:30:00Z

**Diagnosis**: `e2e/happy-path.spec.ts` failed at the very first assertion
(waiting for the Meetings List to render). A diagnostic Playwright script
with console/pageerror listeners revealed the root cause: Next.js's own
inline hydration bootstrap scripts (`(self.__next_f=...).push(...)`, etc.)
carry no `nonce` attribute, so the CSP's `script-src 'self' 'nonce-<per-request>'`
directive blocks every one of them — the app never hydrates in any real
browser, a defect none of the 53 jsdom-based unit/component tests could
have caught, since jsdom does not enforce CSP.

**Root-cause stage**: `nfr-design` (the CSP design was approved there) /
`code-generation` (the generated `app/layout.tsx` never actually read the
nonce via Next.js's `headers()`-based automatic-nonce-propagation API,
which is what activates Next's own inline-script nonce injection — the
design was sound, the generated code didn't wire it up).

**Planned fix**: Make `app/layout.tsx` an async Server Component that
reads `(await headers()).get('x-nonce')` — merely reading it is what
triggers Next.js's automatic nonce application to every script/style tag
it renders for that request, per Next's documented CSP pattern.

**Estimated impact**: Low effort (one file, ~10 lines), zero cost, low
risk — a purely additive read with no behavior change to anything else.
One side effect: every route becomes dynamically rendered (`ƒ` instead of
`○` in the build output) rather than statically prerendered, since a
per-request nonce is inherently incompatible with static prerendering.
This is an unavoidable, inherent trade-off of nonce-based CSP, not a
regression — the app has no server-rendered data to lose the benefit of
static generation for in the first place (`tech-stack-decisions.md`).

**Fix applied**: `app/layout.tsx` updated as planned. Rebuilt, re-ran the
diagnostic script — hydration confirmed working, no CSP console errors,
list page renders real content.

### Loop-back 2 — 2026-09-21T13:38:00Z

**Diagnosis**: With hydration fixed, the E2E spec progressed through
meeting creation, agenda, attendees, and save, then failed at PDF export.
Console capture showed `@react-pdf/renderer`'s internal WebAssembly
font-layout engine failing to load: the browser blocked a `connect` to a
`data:` URI (the WASM binary, embedded as a data URI) under
`connect-src 'self'`, and — after upgrading `@react-pdf/renderer` from
3.4.4 to 4.9.0 to get past an initial obscure "hasOwnProperty" error that
turned out to be the same underlying CSP block surfacing differently on
the older version — a second, clearer CSP violation: `WebAssembly.instantiate()`
requires `'wasm-unsafe-eval'` in `script-src`, which the CSP did not grant.

**Root-cause stage**: `code-generation` (the tech-stack decision to use
`@react-pdf/renderer` was correct and remains unchanged; its runtime
dependency on WebAssembly for font layout was not accounted for when the
CSP was authored at `nfr-requirements`/`nfr-design`, since neither NFR
stage's design work exercised the library against a real CSP-enforcing
browser — a gap this stage's E2E testing exists specifically to catch).

**Planned fix**: Two narrow CSP additions in `proxy.ts`: `'wasm-unsafe-eval'`
in `script-src` (browser-scoped to WebAssembly compilation only — does
NOT grant JS `eval()`/`Function()` the way `'unsafe-eval'` would) and
`data:` in `connect-src` (permits fetching the same-page-embedded WASM
data URI only, not third-party origins). Also upgrade `@react-pdf/renderer`
to the latest version (4.9.0) for a clearer failure mode and to pick up
any bundler-compatibility fixes since 3.4.4.

**Estimated impact**: Low effort (one file for the CSP change, one
dependency bump), zero cost. Risk: `'wasm-unsafe-eval'` is deliberately
scoped by browsers to be narrower than `'unsafe-eval'` — it does not
weaken protection against script-injection XSS, only permits WebAssembly
modules to compile, which this app already needs for a library its own
tech-stack decision locked in. The `@react-pdf/renderer` major-version
bump (3.x → 4.x) carries standard major-bump API-change risk, mitigated by
re-running the full unit/component suite (unchanged: 53/53, 93.7%) and the
full E2E matrix (5/5) after the bump.

**Fix applied**: `proxy.ts`'s CSP updated as planned; `@react-pdf/renderer`
upgraded to 4.9.0. Rebuilt, re-ran `npx vitest run --coverage` (53/53,
93.7%, unchanged) and the full 5-project Playwright matrix — all passed.

## Target Verification Matrix

| Target ID | Source | Expected | Actual | Evidence | Owning Stage | Verdict |
|---|---|---|---|---|---|---|
| coverage-floor | team.md Testing Posture | ≥80% line coverage | 93.7% | `npx vitest run --coverage` output above | build-and-test | Met |
| test-suite-green | code-generation-plan.md Testing Contract | 53/53 unit/component tests pass | 53/53 pass | `npx vitest run` output above | build-and-test | Met |
| NFR1.1 | performance-requirements.md / performance-design.md | Live preview updates ≤1s (designed ~300ms) | Observed well under target | Manual/E2E-incidental timing, `performance-test-instructions.md` | build-and-test | Met |
| NFR1.2 | performance-requirements.md | PDF export ≤3s | Observed well under target | Manual/E2E-incidental timing, `performance-test-instructions.md` | build-and-test | Met |
| NFR2.1 | requirements.md | Automated accessibility (axe-core/pa11y), non-blocking | Not yet configured | N/A — tooling not added until CI Pipeline | ci-pipeline | Unverified (deferred, owning stage scheduled) |
| NFR3.1 | requirements.md | Cross-browser (Chromium/Firefox/WebKit + mobile) | 5/5 projects pass | `npx playwright test` output above | build-and-test | Met |
| NFR4.1 | reliability-requirements.md | Persistence failures degrade gracefully | Covered by persistence-adapter.test.ts (9 tests) | Vitest output | build-and-test | Met |
| NFR4.2 | reliability-requirements.md | Failed save retains draft | Covered by MeetingFormPage.test.tsx | Vitest output | build-and-test | Met |
| NFR5.1 | security-requirements.md | User input safely escaped, no raw HTML injection | 0 `dangerouslySetInnerHTML` matches; `react/no-danger` lint rule armed | `grep` + ESLint output | build-and-test | Met |
| NFR5.4 | security-requirements.md / security-design.md | CSP headers + per-request nonce enforced and functional | Verified via E2E — required 2 fixes, now correct (see Loop-Back Log) | Loop-back 1 and 2 above | build-and-test | Met |
| npm-audit-prod | security-design.md | 0 Critical/High production vulnerabilities | 0 vulnerabilities | `npm audit --omit=dev` output | build-and-test | Met |
| secret-scan | team.md Security tooling | Gitleaks pre-commit + CI backstop configured | Not yet configured | N/A — tooling not added until CI Pipeline | ci-pipeline | Unverified (deferred, owning stage scheduled) |
| sast | team.md Security tooling | CodeQL default setup on every PR | Not yet configured | N/A — tooling not added until CI Pipeline | ci-pipeline | Unverified (deferred, owning stage scheduled) |

Three targets are `Unverified` but explicitly **deferred with an owning
stage scheduled** (`ci-pipeline`, next in this workflow's execution plan) —
per Step 9's failure predicate, a deferred target with a scheduled owner is
not itself a stage failure; only an owner-less deferral or a genuine `Not
Met` would be. All other applicable targets are `Met`.

## Assumptions & Open Questions

None.
