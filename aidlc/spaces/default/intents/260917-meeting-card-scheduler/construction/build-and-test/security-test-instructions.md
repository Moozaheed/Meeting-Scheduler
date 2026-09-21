# Security Test Instructions — Meeting Scheduler & Invitation Card Generator

Generated because defined NFR security requirements exist
(`security-requirements.md`, `security-design.md`) — warranted by context
per this stage's "soft guideline" allowance, given the app handles PII and
ships a hand-authored CSP.

## Dependency Scanning (executable now)

```bash
npm audit --omit=dev
```

**Result**: 0 vulnerabilities (re-verified in this stage; also the subject
of the Critical finding fixed during Code Generation's review cycle —
`next` was upgraded 14.2.35 → 16.3.5).

## Secret Scanning

Gitleaks (pre-commit hook + CI backstop, per `team.md`) is a CI-pipeline
concern — not executable as a standalone command in this stage since it
requires the Gitleaks binary and a `.gitleaks.toml`/default ruleset wired
into the pre-commit hook or CI workflow, neither of which is generated
until the CI Pipeline stage. **Deferred to `ci-pipeline`.**

## SAST (CodeQL)

GitHub CodeQL's default setup (`team.md`) requires a GitHub Actions
workflow and repository-level configuration. **Deferred to `ci-pipeline`.**
`npx eslint . --ext .ts,.tsx` (already run as part of the build gate) is
the closest local-equivalent static check available in this stage, and
passes clean — including `eslint-plugin-security`'s unsafe-regex/`eval`
checks and `react/no-danger`'s `dangerouslySetInnerHTML` ban.

## CSP Verification (executable now — and where this stage found real findings)

Unlike the deferred checks above, the CSP's actual runtime behavior is
directly testable by loading the app in a real browser and inspecting
enforcement — which this stage did, via the E2E happy-path spec plus a
throwaway diagnostic Playwright script (console/pageerror listeners) used
to investigate two failures the spec surfaced:

| What was tested | Result |
|---|---|
| CSP header is present and correctly shaped on every response | Confirmed: `Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-<per-request>' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' data:; frame-ancestors 'none'` |
| Next.js's own inline hydration scripts execute (not blocked by the nonce policy) | **Found broken, then fixed** — see `test-results.md` Loop-Back Log entry 1 |
| `@react-pdf/renderer`'s WebAssembly font-layout engine can load and compile under the CSP | **Found broken, then fixed** — see `test-results.md` Loop-Back Log entry 2 |
| No `dangerouslySetInnerHTML` anywhere in the codebase (NFR5.1) | Confirmed via `grep -r dangerouslySetInnerHTML components/ app/ lib/` — zero matches |
| Security headers present (HSTS, X-Frame-Options, X-Content-Type-Options) | Confirmed present on every response (via the same manual header inspection) |

**Why this matters as a security test, not just a functional one**: a CSP
that silently fails to let the app's own required scripts run is a
security-policy-authoring bug, exactly the kind of defect a CSP is meant
to be verified against in a real browser rather than assumed correct from
its text alone.

## Result

All executable-now checks **Met**. Two Deferred checks (secret scanning,
SAST) correctly own no verdict yet — `ci-pipeline` is the scheduled owning
stage per `infrastructure-design/cicd-pipeline.md`.

## Assumptions & Open Questions

None.
