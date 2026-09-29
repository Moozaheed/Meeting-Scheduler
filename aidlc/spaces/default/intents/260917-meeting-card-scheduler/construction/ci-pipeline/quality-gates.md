# Quality Gates — Meeting Scheduler & Invitation Card Generator

## Decision (supersedes the prior design in this document)

**No quality gates are configured**, pre-merge or post-merge. This document
previously defined a Gate 1 (secret scan, lint, type check, unit/component
tests + 80% coverage, SAST, dependency scan — all blocking) and a Gate 2
(E2E happy path, post-merge). Both are removed per the explicit human
decision recorded in this stage's Q3 (`ci-pipeline-questions.md`):
"remove all the gates i do not need those gates."

## Current State

| Gate                                | Status                                                                                                                                       |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Secret scan (Gitleaks)              | Removed                                                                                                                                      |
| Lint (`eslint`)                   | Removed as a CI gate — the command (`npm run lint`) still exists and can be run manually                                                  |
| Type check (`tsc --noEmit`)       | Removed as a CI gate — still runnable manually                                                                                              |
| Unit/component tests + 80% coverage | Removed as a CI gate —`npm run test:coverage` still exists and can be run manually                                                        |
| SAST (CodeQL)                       | Removed                                                                                                                                      |
| Dependency scan (`npm audit`)     | Removed, including the weekly scheduled job                                                                                                  |
| E2E happy path (Playwright)         | Not in CI (already the case before this stage — see`code-summary.md`/`test-results.md`); `npm run test:e2e` remains runnable manually |
| Accessibility (axe-core/pa11y)      | Never configured — moot now that no CI workflow exists to host it                                                                           |

None of the above run automatically on any PR, push, or schedule. Every
check listed as "runnable manually" requires someone to actually run it;
nothing enforces that it happens before a merge or a deploy.

## What this means in practice

- Merges to `main` are unchecked — no lint, type, test, coverage, secret, or
  vulnerability gate blocks anything.
- Vercel's own build/deploy (outside this stage's scope) still runs
  independently on push to `main` and is the only thing that would surface a
  build-breaking error, since `npm run build` failing there would fail the
  deploy — but that is a build check, not a quality or security gate.
- Dependabot (`dependabot.yml`) still opens dependency-update PRs weekly,
  but nothing now runs against them automatically; merging one is exactly as
  unchecked as any other change.

## Standing conflict with `project.md` (disclosed, not silently carried)

This "no gates" state directly contradicts `project.md`'s `## Forbidden`
entry — *"NEVER merge without secret scanning, dependency scanning, and code
security lint checks having passed"* (affirmed 2026-09-17, interview Q7) —
and the mirroring `## Mandated` entry. Per the human's Q3 answer, this
stage's learnings step updates those two `project.md` entries so the written
record matches this decision rather than contradicting it.

## Assumptions & Open Questions

None.
