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

## Local Pre-Push Gate (Q5)

The CI `gitleaks` job above only runs **after** a push lands on `main`
(this repo's existing merge-only CI trigger). Q5 adds an earlier check,
local to each developer's machine, so a leak is caught before it ever
leaves the machine:

| File | Purpose |
|---|---|
| `.git/hooks/pre-push` | Runs before every `git push` from this clone. Full-history Gitleaks scan; blocks the push on any unreviewed finding, allows it through if clean. |
| `.git/hooks/gitleaks-bin` | Bundled Gitleaks v8.30.1 binary, so the hook works without a system-wide install. A PATH-installed `gitleaks` takes priority if present. |
| `.gitleaksignore` (repo root, tracked) | Allowlists the two findings already reviewed and accepted (the hardcoded Supabase publishable key, the fake test fixture at `secret-scan-test-fixtures/`), by exact fingerprint. Read automatically by both this hook and the CI `gitleaks` job, so the two stay consistent. |

**Local-only, by git's own design**: `.git/hooks/` is never committed or
shared — this protects pushes from this specific clone, not every clone of
this repository. A fresh clone (or a teammate's machine) would need the
hook re-installed to get the same protection; that reproducibility gap is
disclosed, not silently assumed away. `.gitleaksignore`, by contrast, IS
tracked and shared, since it governs the CI gate too.

Verified this session before recording it here: a real secret-shaped test
string (committed, then reverted) was caught and blocked the push; the two
allowlisted findings were not.

## Assumptions & Open Questions

None — Q4 and Q5 resolved the open questions this re-run needed to answer.
