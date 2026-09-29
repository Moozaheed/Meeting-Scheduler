# CI Configuration — Meeting Scheduler & Invitation Card Generator

## Decision (supersedes the prior design in this document)

**One CI workflow, one job: Gitleaks secret scanning.** This is an explicit
human decision (Q4, this stage), narrowly re-adding a single gate on top of
Q3's "no gates at all" baseline: "only add the gitleaks gate on the aidlc."
Nothing else Q3 removed — lint, typecheck, unit/component tests, CodeQL
SAST, dependency audit — comes back; Q3's answer still governs those.

This document has now had two decisions layered on it in the same session:
first the full four-gate design, then Q3's "no gates," now Q4's
"Gitleaks only." Each is disclosed here rather than silently overwritten.

## CI Tool

**GitHub Actions**, unchanged — this decision is about *what runs*, not the
platform.

## Branch Strategy

**Trunk-based development, squash-merge to `main`** (`team.md` Way of
Working, `org.md`/`project.md` Mandated) — unchanged; this decision doesn't
touch branching.

## Workflow Files

| File | Status |
|---|---|
| `.github/workflows/ci.yml` | **Present — one job: `gitleaks`.** Triggers on push to `main`; scans full git history (Q2's already-settled scope decision, reused here rather than re-litigated). |
| `.github/workflows/scheduled-audit.yml` | **Removed** — the weekly `npm audit` job is not part of Q4's scope; Q3's removal stands. |
| `.github/dependabot.yml` | **Retained** — still opens weekly dependency-update PRs; nothing else runs against them automatically. |

## Secrets Management in CI

`GITHUB_TOKEN` (auto-provisioned by GitHub Actions) is the only credential
the `gitleaks` job uses, scoped to `contents: read` only.

## Standing conflict with `project.md` (disclosed, not silently carried)

`project.md`'s `## Forbidden`/`## Mandated` entries (affirmed 2026-09-17,
interview Q7) still name the full sequence — secret scanning, dependency
scanning, AND code security lint checks — as required before merge. Q4
closes part of that gap (secret scanning now runs again) but dependency
scanning and code security lint checks remain absent. This stage's
learnings step records that partial-closure precisely, rather than either
re-asserting the full original mandate or leaving the superseding
Corrections entry from Q3 unchanged as if nothing narrowed.

## Assumptions & Open Questions

None — Q4 resolved the one open question this re-run needed to answer.
