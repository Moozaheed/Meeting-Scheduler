# CI Configuration — Meeting Scheduler & Invitation Card Generator

## CI Tool

**GitHub Actions** — already the affirmed choice (`team.md` Security
tooling, `infrastructure-design/cicd-pipeline.md`). No CodePipeline/Jenkins
alternative was considered; this was locked well before this stage.

## Branch Strategy

**Trunk-based development, squash-merge to `main`** (`team.md` Way of
Working, `org.md`/`project.md` Mandated). Workflows trigger on `pull_request`
into `main` (pre-merge gates) and `push` to `main` (post-merge Gate 2 E2E).
No `develop`/`release/*` branches exist to configure.

## Workflow Files (written to the repository)

| File | Purpose |
|---|---|
| `.github/workflows/ci.yml` | Pre-merge gates (Gitleaks, lint+typecheck+unit tests, CodeQL, `npm audit`) on every PR; post-merge E2E smoke suite on push to `main` |
| `.github/workflows/scheduled-audit.yml` | Weekly `npm audit` job, independent of PR activity (`team.md`: "a scheduled weekly job") |
| `.github/dependabot.yml` | Weekly Dependabot PRs for npm direct/transitive dependency updates, dev-dependencies grouped into one PR to reduce noise |

## Job Design

`ci.yml`'s four pre-merge jobs (`gitleaks`, `lint-typecheck-test`,
`codeql`, `dependency-audit`) run **in parallel**, not the sequential order
`team.md`'s table lists them in — GitHub branch protection requiring all
four as required status checks achieves the same blocking guarantee with
faster feedback (`cicd-patterns.md`: "Fast pipelines, fast feedback...
Parallelize independent stages"). The table's ordering describes gate
*severity/category*, not a mandated execution sequence — none of the four
checks depends on another's output.

The `e2e-smoke` job is gated behind `lint-typecheck-test` succeeding first
(`needs:`) and only runs on push to `main` (post-merge), matching Gate 2's
definition exactly.

## Secrets Management in CI

**None required** — confirmed at `infrastructure-design` (this stage's Q4
there) and unchanged here: Vercel's native GitHub App integration deploys
independently of these workflows, with no deploy token stored as a GitHub
Actions secret. `GITHUB_TOKEN` (auto-provisioned by GitHub Actions) is the
only credential any job uses, scoped to `contents: read` /
`security-events: write` only.

## Branch Protection (to configure once, outside this stage's file output)

Recommended required status checks on `main`, configured through the
GitHub repository settings UI (not expressible as a committed file):
`gitleaks`, `lint-typecheck-test`, `codeql`, `dependency-audit`. This
completes the "blocking" half of the gates this stage's workflow files
implement — a check that reports a failure only blocks a merge once it is
marked required in branch protection.

## Assumptions & Open Questions

None.
