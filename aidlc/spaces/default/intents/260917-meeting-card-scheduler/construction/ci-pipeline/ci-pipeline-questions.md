# CI Pipeline — Clarifying Questions

Most CI decisions are already locked by `infrastructure-design/cicd-pipeline.md`
and `team.md`'s affirmed practices (GitHub Actions, trunk-based squash-merge,
the full gate sequence, Dependabot + `npm audit`, CodeQL, Gitleaks). The
remaining open items are narrow implementation choices this stage needs to
pin down to actually write the workflow files.

## Q1 — CodeQL language configuration

This is a TypeScript/JavaScript-only codebase (Next.js). Should the CodeQL
workflow use GitHub's simplest "default setup" (auto-detects languages, no
YAML query-config needed) or an "advanced setup" with an explicit
`javascript-typescript` language matrix and custom query packs?

[Answer]: Default setup — auto-detects JS/TS, zero config needed, proportionate to a single-language codebase.

## Q2 — Gitleaks CI backstop scope

`team.md` names Gitleaks as both a pre-commit hook (developer-machine,
outside this stage's scope — we can't install a local git hook from CI
config) and a CI backstop. Should the CI backstop scan the full git history
on every PR (slower, catches anything that slipped through pre-commit) or
just the PR's diff (faster, matches the pre-commit hook's own scope)?

[Answer]: PR-diff-only — fast, matches what the pre-commit hook already covers, proportionate for a project this size.

## Q3 — Gate scope, given this session's direct deletion

`team.md`/`project.md` mandate a full pre-merge gate sequence (secret scan,
lint + typecheck + unit tests with an 80% coverage floor, CodeQL SAST,
dependency audit) — `project.md`'s `## Forbidden` section states "NEVER
merge without secret scanning, dependency scanning, and code security lint
checks having passed" (affirmed 2026-09-17, interview Q7). Earlier in this
session, at your explicit request, `.github/workflows/ci.yml` and
`scheduled-audit.yml` (the files this stage had produced implementing that
exact mandate) were deleted directly, outside this stage's process. That
conflicts with the still-standing `project.md` mandate. How should this
stage's output resolve that conflict?

A. Regenerate the full gate sequence as originally designed — restores
   `ci.yml` (secret scan, lint+typecheck+test w/ 80% coverage, CodeQL,
   dependency audit) and `scheduled-audit.yml` (weekly npm audit), matching
   the still-standing `project.md` mandate.
B. Regenerate with no gates — formalizes the gate-free state from earlier in
   this session. This directly contradicts the current `project.md`
   `## Forbidden`/`## Mandated` entries, so choosing this also requires
   updating those entries (via this stage's learnings step) so the record
   matches the decision instead of contradicting it.
C. Regenerate a reduced/different gate set — specify which gates you want
   kept, dropped, or changed.
X. Other (please specify)

[Answer]: X. "remove all the gates i do not need those gates" — i.e. option B: regenerate with no gates. This also requires updating project.md's Forbidden/Mandated entries so the record matches (handled via this stage's learnings step).

## Q4 — Re-add a Gitleaks-only gate

After Q3 landed on no gates at all, the human explicitly asked (in
conversation, after independently confirming with a real Gitleaks run
against a test fixture that the tool works as expected): "only add the
gitleaks gate on the aidlc." This is unambiguous — a single, narrow
addition on top of the Q3 baseline, not a re-opening of Q3's broader
decision.

[Answer]: Add a CI workflow with exactly one job: Gitleaks secret scanning
(PR-diff scope, per Q2's already-settled scope decision). Lint, typecheck,
tests, coverage, CodeQL, and dependency audit remain removed — Q3's answer
stands for everything except secret scanning.
