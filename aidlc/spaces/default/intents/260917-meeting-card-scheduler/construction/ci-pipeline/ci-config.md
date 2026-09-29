# CI Configuration — Meeting Scheduler & Invitation Card Generator

## Decision (supersedes the prior design in this document)

**No CI workflows are configured.** This is an explicit human decision
(Q3, this stage), made after the conflict with `project.md`'s standing
mandate was surfaced and confirmed: "remove all the gates i do not need
those gates."

This document previously described a four-gate `ci.yml` (Gitleaks,
lint+typecheck+test, CodeQL, `npm audit`) plus a weekly `scheduled-audit.yml`.
Both files were deleted directly earlier in this session (outside this
stage's process, at the same human's request) and this re-run of the stage
confirms — rather than silently re-creates — that outcome as the current
design.

## CI Tool

**GitHub Actions** remains the affirmed tool choice (unchanged from the
prior design) — this decision is about *what runs*, not the platform. No
workflow files currently exist under `.github/workflows/`.

## Branch Strategy

**Trunk-based development, squash-merge to `main`** (`team.md` Way of
Working, `org.md`/`project.md` Mandated) — unchanged. This stage's decision
does not touch branching; it only removes the automated checks that used to
run around merges.

## Workflow Files

| File | Status |
|---|---|
| `.github/workflows/ci.yml` | **Removed** — no pre-merge or post-merge gates run |
| `.github/workflows/scheduled-audit.yml` | **Removed** — no weekly scheduled `npm audit` |
| `.github/dependabot.yml` | **Retained** — still opens weekly dependency-update PRs; nothing runs against them automatically now |

## Secrets Management in CI

Not applicable — no workflow runs, so no CI-stored credentials are in use.

## Standing conflict with `project.md` (disclosed, not silently carried)

`project.md`'s `## Forbidden` section states: *"NEVER merge without secret
scanning, dependency scanning, and code security lint checks having passed"*
(affirmed 2026-09-17, interview Q7), and `## Mandated` states the same
requirement positively. This document's "no gates" decision directly
contradicts both entries. Per the human's Q3 answer, this stage's learnings
step is the mechanism that updates those `project.md` entries so the written
record matches the decision instead of contradicting it — see this stage's
`memory.md` and the learnings ritual run at this stage's approval gate.

## Assumptions & Open Questions

None — Q3 resolved the one open question this re-run needed to answer.
