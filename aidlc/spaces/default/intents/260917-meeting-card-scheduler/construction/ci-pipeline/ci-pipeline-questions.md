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
