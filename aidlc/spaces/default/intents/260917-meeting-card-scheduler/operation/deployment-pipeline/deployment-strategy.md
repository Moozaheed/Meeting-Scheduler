# Deployment Strategy — Meeting Scheduler & Invitation Card Generator

## Strategy: Recreate-on-deploy (Vercel serverless default)

No blue/green, canary, or rolling strategy is designed — confirmed at
`infrastructure-design/cicd-pipeline.md` and unchanged here. A stateless
serverless redeploy has no "old instances draining" concern the way a
long-running server does; Vercel atomically switches routing to the new
immutable deployment once the build succeeds.

## Why Not Canary/Blue-Green

| Consideration | This app |
|---|---|
| Traffic volume | Under 20 concurrent users (`scalability-design.md` NFR6.1) — too low to benefit from gradual traffic shifting |
| Statefulness | Fully stateless server-side (all data is client-side browser storage, `tech-stack-decisions.md`) — no server-side session/data migration risk a canary would mitigate |
| Blast radius if broken | Contained to a single unlisted-URL internal tool, not a public production service with paying users |
| Monitoring maturity | Vercel's built-in dashboard only, no external monitoring (`observability-design.md` NFR7.1) — a canary strategy needs real-time health metrics to decide whether to proceed, which this project deliberately doesn't have |

Given all four factors, the added complexity of canary/blue-green
buys nothing this project's risk profile needs.

## Traffic-Shifting Criteria / Abort Conditions

Not applicable — there is no gradual traffic shift to define criteria for.
The full cutover happens atomically on every successful build.

## Database Migration During Deployment

Not applicable in the traditional sense (no server-side database exists).
The equivalent concern — client-side IndexedDB schema drift across app
versions — was already addressed at `infrastructure-design/cicd-pipeline.md`'s
"Client-side schema-drift caveat": an additive-only, forward-compatible
schema discipline (new fields optional with safe defaults, never
removed/repurposed) is the accepted mitigation, enforced at code-generation
time, not by this deployment strategy.

## Deployment Windows / Freeze Periods

None defined — deploy-on-merge with no manual gate is the affirmed practice
(`project.md` Mandated); introducing freeze windows would contradict that
decision without a stated reason to.

## Assumptions & Open Questions

None.
