# Infrastructure Design — Clarifying Questions

This app has no cloud infrastructure services to design (no database, cache,
queue, search, or message broker — all data lives client-side, per
`tech-stack-decisions.md`). The remaining infrastructure surface is the
Vercel deployment itself and the CI/CD pipeline around it. These questions
resolve the few genuinely open decisions in that narrow scope.

## Q1 — Infrastructure-as-Code approach

Given the entire "infrastructure" is one Vercel project (no VPC, no
compute cluster, no managed data services to provision), should this stage
specify formal IaC (e.g. Terraform's Vercel provider) for the Vercel
project configuration, or is a checked-in `vercel.json` plus Vercel's own
git-linked project settings (configured once through the dashboard/CLI)
sufficient, with no IaC tool needed?

[Answer]: `vercel.json` plus Vercel's own git-linked dashboard/CLI settings, no formal IaC tool — a single project with nothing to provision doesn't warrant a Terraform/CDK layer.

## Q2 — Preview deployments for pull requests

Vercel automatically creates a preview deployment for every PR when a repo
is git-linked, in addition to the production deploy-on-merge-to-`main`
already decided. Should this stage enable and rely on PR preview
deployments as a pre-merge manual smoke-check step, or explicitly decline
them to keep the pipeline as simple as the already-affirmed no-staging
posture implies?

[Answer]: Yes, enable and use PR preview deployments as a manual pre-merge smoke-check — it's free with the git integration already needed for deploy-on-merge and adds no pipeline complexity.

## Q3 — Rollback procedure

Vercel keeps every deployment immutable and allows instant rollback to any
prior deployment via the dashboard or CLI. Should `cicd-pipeline.md` name
this platform-native rollback as the sole rollback procedure (no custom
blue-green/canary tooling), given the app has no database migrations to
worry about un-doing (all data is client-side)?

[Answer]: Yes, Vercel's native immutable-deployment rollback (dashboard/CLI) is the sole rollback procedure — no data-migration risk exists to complicate it, so no custom blue-green/canary tooling is needed.

## Q4 — CI/CD secrets

Given zero third-party API dependencies and no database credentials, does
any CI/CD secret actually need to be provisioned (e.g. a Vercel deploy
token for GitHub Actions), or does Vercel's native GitHub App integration
handle the merge-to-deploy trigger without any secret needing to live in
GitHub Actions at all?

[Answer]: No secret is needed. Vercel's native GitHub App integration triggers the production deploy and PR previews directly; GitHub Actions only runs the pre-merge quality/security gates and needs no Vercel credential.
