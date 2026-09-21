# Infrastructure Specification — Meeting Scheduler & Invitation Card Generator

## Deployment

| Facet | Choice | Rationale |
|---|---|---|
| Compute model | Serverless (Vercel platform-managed) | `tech-stack-decisions.md` already selected Vercel; zero-config Next.js App Router serverless deploy, no server to provision or patch |
| Networking topology | Vercel's managed edge network; no VPC, no custom ingress/egress configuration | The app has no backend to place behind a private network — every request is either a static/SSR page request or served entirely client-side |
| Storage strategy | None server-side; all data lives in the visitor's own browser (IndexedDB via `idb-keyval`) | `scalability-design.md`/`reliability-design.md` — no server-side data store exists to provision |
| Environments | Single production environment (the one hosted instance) + ephemeral per-PR preview deployments (this stage's Q2) + local dev via `npm run dev` — no separate staging tier | Confirmed at practices-discovery (`team.md` Deployment) and re-confirmed at this stage's Q2 |
| IaC approach | `vercel.json` (build/output config) checked into the repo, plus one-time git-linked project configuration through the Vercel dashboard/CLI — no formal IaC tool (Terraform/CDK) | Decided at this stage's Q1: a single project with nothing to provision doesn't warrant a config-as-code layer |
| Resource sizing | Vercel's default serverless function limits (memory/timeout); no custom sizing configured | `scalability-design.md` NFR6.1 — under-20-concurrent-user ceiling sits comfortably within platform defaults |
| Edge Middleware | Vercel Edge Runtime, one lightweight middleware function running on every request | `security-design.md` NFR5.4 requires a per-request CSP `script-src` nonce; Next.js's documented nonce pattern generates and injects it in middleware, which runs at the edge (low added latency, no cold-start concern distinct from the serverless functions above) before the response headers (including the nonce-bearing CSP) are finalized |

## Infrastructure Services

| Service | Role | Configuration | Notes |
|---|---|---|---|
| — | — | — | None. No database, cache, message queue, search service, or load balancer exists — every functional and NFR requirement in this project is satisfied by the client-side app plus Vercel's static/serverless hosting alone (`scalability-design.md`, `tech-stack-decisions.md`) |
| Vercel CDN | Static asset delivery | Platform default | Per `performance-design.md`'s Caching Architecture decision — no custom cache design needed |
| DNS | Domain resolution for the unlisted URL | Vercel's default `*.vercel.app` subdomain (no custom domain purchased for this release) | Consistent with NFR5.3's unlisted-URL access model; a custom domain can be added later with no infrastructure redesign |

## Shared Infrastructure

Not applicable — this is a single-unit, single-component-group deployment
(one Next.js application, no separate units or services sharing resources).

## Assumptions & Open Questions

None.
