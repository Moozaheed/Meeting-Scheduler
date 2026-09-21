# Quality Gates — Meeting Scheduler & Invitation Card Generator

## Gate 1 — Pre-merge (blocking, on every PR)

| Gate | Job | Criteria | Action on failure |
|---|---|---|---|
| Secret scan | `gitleaks` | Zero secrets detected in the PR's incoming commits | Block merge |
| Lint | `lint-typecheck-test` | `npx eslint . --ext .ts,.tsx` — zero errors | Block merge |
| Type check | `lint-typecheck-test` | `npx tsc --noEmit` — zero errors | Block merge |
| Unit/component tests | `lint-typecheck-test` | `npx vitest run --coverage --coverage.thresholds.lines=80` — 100% pass rate, coverage ≥ 80% | Block merge |
| SAST | `codeql` | Zero Critical/High CodeQL findings (Medium warns, does not block, per `team.md`) | Block merge on Critical/High |
| Dependency scan | `dependency-audit` | `npm audit --omit=dev --audit-level=high` exits 0 | Block merge on Critical/High with a known exploit |

All six are configured as required GitHub branch-protection status checks
on `main` (see `ci-config.md`).

## Gate 2 — Post-merge (blocking the deploy's fitness, not the merge itself)

| Gate | Job | Criteria | Action on failure |
|---|---|---|---|
| E2E happy path | `e2e-smoke` | Full value-stream flow (create → agenda → attendees → preview → export) passes on all 5 configured browser projects | Investigate; Vercel's instant rollback is the accepted mitigation (`infrastructure-design/cicd-pipeline.md`'s disclosed Gate-2-timing trade-off) — this job cannot block the Vercel deploy itself, since Vercel deploys independently and before this job can even start |

This mirrors the disclosed timing trade-off `infrastructure-design`
already recorded: because Vercel's GitHub App integration deploys directly
on push to `main`, with no GitHub Actions secret to let this workflow gate
that deploy, `e2e-smoke` necessarily runs against the already-live
deployment rather than before it goes live.

## Non-Blocking Signals

| Check | Where | Why non-blocking |
|---|---|---|
| Accessibility (axe-core/pa11y) | Not yet wired into either workflow — see Outstanding Items below | Affirmed as non-blocking per `team.md` even once added |
| CodeQL Medium-severity findings | `codeql` job | `team.md`: "warn on Medium," only Critical/High block |

## Outstanding Items

**Accessibility checks (axe-core/pa11y) are not yet wired into any CI
workflow.** `team.md` affirms them as a non-blocking CI signal, but no
axe-core/pa11y dependency exists in `package.json` yet, and no test file
runs them. This is a real gap this stage is surfacing, not silently
carrying forward — `cross-unit-traceability.md` (build-and-test) already
recorded NFR2.1 as `Deferred` to this stage, and this stage has not yet
closed that deferral. Recommended next action: add `@axe-core/playwright`
and assert `page.axe... toHaveNoViolations()`-style checks inside
`e2e/happy-path.spec.ts` (or a dedicated `e2e/accessibility.spec.ts`),
reporting results without failing the job (`continue-on-error: true` on
that check, or a separate non-required status check) — deferred to a
follow-up rather than added speculatively in this pass, since it is new
scope beyond what this stage's own produces list covers.

## Assumptions & Open Questions

None beyond the accessibility gap explicitly flagged above.
