# CD Configuration — Meeting Scheduler & Invitation Card Generator

## Deployment Trigger

Vercel's native GitHub App integration, triggered directly by a push to
`main` — independently of the `.github/workflows/ci.yml` pipeline
(`infrastructure-design/cicd-pipeline.md`; re-confirmed unchanged here). No
new CD configuration file is needed beyond what already exists:
`vercel.json` (build/output config, written at Code Generation) and the
Vercel project's own git-linked settings (configured once through the
dashboard/CLI, per `infrastructure-design`'s Q1 IaC decision — no formal
IaC tool for a single project with nothing else to provision).

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
