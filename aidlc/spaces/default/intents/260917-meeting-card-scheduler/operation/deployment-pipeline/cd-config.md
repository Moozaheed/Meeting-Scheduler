# CD Configuration — Meeting Scheduler & Invitation Card Generator

## Deployment Trigger

Vercel's native GitHub App integration, triggered directly by a push to
`main`. **Updated on this re-run**: `.github/workflows/ci.yml` no longer
exists (removed at `ci-pipeline` Q3 — see `ci-pipeline/quality-gates.md`),
so "independently of" is now simply accurate rather than a parallel-track
description — there is no CI pipeline running alongside the deploy at all,
gated or otherwise. `vercel.json` (build/output config) was also deleted
this session; it was never load-bearing for the deploy itself — Vercel's
GitHub App integration deploys any push to `main` regardless, falling back
to auto-detected Next.js build settings without it. The Vercel project's
own git-linked settings (configured once through the dashboard/CLI, per
`infrastructure-design`'s Q1 IaC decision) are unaffected.

`infrastructure-design/infrastructure-specification.md`'s "IaC approach"
row still names `vercel.json` as the IaC artifact — that document is
flagged stale by this session's drift (it wasn't re-run), so this
discrepancy is disclosed here rather than silently inherited.

## Environment Promotion

**None** — a single production environment, reached at the deployment's
Vercel-assigned URL (or a custom domain if added later), with PR preview
deployments as the sole non-production tier (`infrastructure-design`'s Q2).
No dev → staging → prod promotion matrix exists to configure, consistent
with the scope document's decision (no staging/production split for this
internal small-team tool).

## Feature Flags

**None** (this stage's Q1) — no feature-flag system is adopted. Nothing in
this app's shape (single deploy target, no gradual rollout, no A/B
experiments) warrants one.

## Artifact / Release Management

No artifact repository is configured — Vercel builds directly from the
`main` branch's source on every deploy; there is no separate build
artifact to version, tag, or publish to a registry (no Docker image, no
npm package). The deployed version is identified by its Vercel deployment
ID and the `main` commit SHA it was built from, both visible in the Vercel
dashboard.

## Assumptions & Open Questions

None.
