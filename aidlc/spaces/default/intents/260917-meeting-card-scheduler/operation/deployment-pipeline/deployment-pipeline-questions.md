# Deployment Pipeline — Clarifying Questions

Deployment strategy, rollback mechanism, and the absence of environment
promotion gates were already fully decided at `infrastructure-design`
(Vercel's native git integration deploys directly on merge to `main`; no
staging tier; Vercel's instant rollback is the sole rollback mechanism).
One genuinely open item remains for this stage.

## Q1 — Feature flag strategy

This is a single-release, zero-third-party-dependency app with no phased
rollout, canary, or A/B-testing need (`scalability-design.md`,
`reliability-design.md`). Should this stage explicitly record "no feature
flag system" as the decision, or is there a case for one given the app's
small size?

[Answer]: No feature flag system — explicitly recorded as a deliberate decision. Nothing in this app's shape (single deploy target, no gradual rollout, no experiments) warrants the added complexity.
