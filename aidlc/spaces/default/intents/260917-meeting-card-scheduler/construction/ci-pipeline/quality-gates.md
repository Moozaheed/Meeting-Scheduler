# Quality Gates — Meeting Scheduler & Invitation Card Generator

## Decision (supersedes the prior design in this document)

**One quality gate is configured: secret scanning (Gitleaks).** This
document has been through three decisions in the same session:

1. Originally: a full Gate 1 (secret scan, lint, type check, unit/component
   tests + 80% coverage, SAST, dependency scan — all blocking) and Gate 2
   (E2E happy path, post-merge).
2. Q3 (`ci-pipeline-questions.md`): "remove all the gates i do not need
   those gates" — removed everything.
3. Q4 (this re-run): "only add the gitleaks gate on the aidlc" — re-added
   secret scanning specifically, nothing else.

## Current State

| Gate | Status |
|---|---|
| Secret scan (Gitleaks) | **Active — blocking.** Runs on every push to `main`, full git history. |
| Lint (`eslint`) | Removed as a CI gate (Q3, unchanged by Q4) — `npm run lint` still runnable manually |
| Type check (`tsc --noEmit`) | Removed as a CI gate (Q3, unchanged by Q4) — still runnable manually |
| Unit/component tests + 80% coverage | Removed as a CI gate (Q3, unchanged by Q4) — `npm run test:coverage` still runnable manually |
| SAST (CodeQL) | Removed (Q3, unchanged by Q4) |
| Dependency scan (`npm audit`) | Removed, including the weekly scheduled job (Q3, unchanged by Q4) |
| E2E happy path (Playwright) | Not in CI (already the case before this session) — `npm run test:e2e` remains runnable manually |
| Accessibility (axe-core/pa11y) | Never configured |

## What this means in practice

- **Secret leaks are caught** on every push to `main` — a committed
  credential now blocks that push's CI run (`exit 1` from Gitleaks), same
  as before Q3.
- Everything else is still unchecked: lint, type, test, coverage,
  SAST, and dependency-vulnerability issues can merge to `main` freely.
- The app itself is no longer deployed anywhere (a separate, later
  decision this session: the hosted Vercel deployment was abandoned
  entirely — see `deployment-execution/deployment-execution-questions.md`
  Q1 — this project runs local-dev-only now, `npm run dev`). There is no
  longer a live build/deploy step downstream of a push at all, gated or
  not.
- Dependabot (`dependabot.yml`) still opens dependency-update PRs weekly;
  merging one only triggers the Gitleaks scan, nothing else.

## Standing conflict with `project.md` (disclosed, not silently carried)

`project.md`'s `## Forbidden`/`## Mandated` entries (affirmed 2026-09-17,
interview Q7) name three required checks: secret scanning, dependency
scanning, and code security lint checks. Q4 closes the gap for one of the
three (secret scanning); dependency scanning and code security lint checks
remain absent. This stage's learnings step records that partial state
precisely — not a full re-affirmation of the original mandate, and not an
unchanged copy of Q3's "everything is superseded" note either.

## Assumptions & Open Questions

None — Q4 resolved the one open question this re-run needed to answer.
