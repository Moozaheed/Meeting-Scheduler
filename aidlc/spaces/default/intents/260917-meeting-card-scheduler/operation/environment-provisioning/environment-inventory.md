# Environment Inventory — Meeting Scheduler & Invitation Card Generator

## Environments

| Environment | Purpose | Provisioning mechanism |
|---|---|---|
| Production (single) | The one centrally-hosted instance, reached via its Vercel-assigned URL (or a custom domain if added later) | Manual, one-time, via the Vercel dashboard/CLI — no IaC tool (`infrastructure-specification.md`'s Q1) |
| PR Preview (ephemeral) | Automatic per-PR preview for manual smoke-checking before merge | Automatic — Vercel's GitHub App integration creates/tears these down itself, no manual step per PR |
| Local development | `npm run dev` on a developer's own machine | No provisioning — `npm ci` + `npm run dev`, documented in `code-generation/README.md` |

No staging tier exists (`team.md` Deployment, unchanged since scope
definition). No AWS resources exist — no VPC, subnet, security group,
NACL, Secrets Manager entry, or Parameter Store entry to inventory,
because none were designed (`infrastructure-specification.md`).

## Manual Setup Checklist (one-time, human-performed — this stage's Q1)

This workflow has no credentials to perform these steps itself. Complete
once, outside this session, before the first merge to `main`:

1. **Create the Vercel project.** From the Vercel dashboard: "Add New Project" → import this GitHub repository. Vercel auto-detects the Next.js framework — no custom build command override needed beyond what `vercel.json` already specifies.
2. **Confirm the GitHub App integration is installed** on this repository (Vercel prompts for this during project creation) — this is what enables both the production deploy-on-merge-to-`main` trigger and automatic PR preview deployments, with no GitHub Actions secret required (`deployment-pipeline/cd-config.md`).
3. **Verify no environment variables need setting.** `.env.example` is intentionally empty — there is nothing to configure in Vercel's Environment Variables panel for this app to function (zero third-party API dependencies, no runtime secrets).
4. **(Optional) Add a custom domain**, if desired, in Vercel's Domains panel — not required; the default `*.vercel.app` subdomain satisfies NFR5.3's unlisted-URL access model as-is.
5. **Confirm branch protection on `main`** in the GitHub repository settings, requiring the four CI status checks (`gitleaks`, `lint-typecheck-test`, `codeql`, `dependency-audit`) as documented in `ci-pipeline/ci-config.md` — this is a GitHub setting, not a Vercel one, and equally has no IaC representation.

## Secrets & Parameter Store Audit

**None exist.** No `SecretsManager`/`ParameterStore` equivalent is used —
confirmed at `security-design.md` and unchanged: this app has zero runtime
secrets.

## Assumptions & Open Questions

None.
