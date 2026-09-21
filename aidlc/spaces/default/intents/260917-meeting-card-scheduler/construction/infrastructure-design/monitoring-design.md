# Monitoring Design — Meeting Scheduler & Invitation Card Generator

This implements `observability-design.md`'s NFR7.1 "built-in-only
observability" decision on Vercel's platform.

## Metrics & KPIs

| Metric | Source | Threshold | Why it matters |
|---|---|---|---|
| Deployment status | Vercel dashboard | N/A (informational) | Confirms the last merge-triggered deploy succeeded |
| Function invocation count | Vercel dashboard | N/A (informational) | Basic traffic visibility, no custom threshold set |
| Build duration | Vercel dashboard | N/A (informational) | Surfaces build regressions over time |

No custom metrics pipeline, business metrics, or RED/USE-method
instrumentation is designed — consistent with `observability-design.md`'s
decision that no external monitoring tooling is used.

## Alerts

| Alert | Condition | Severity | Routes to |
|---|---|---|---|
| — | — | — | None configured. No external alerting pipeline exists (`observability-design.md` NFR7.1); the best-effort availability posture (`reliability-design.md`) does not warrant one, and Vercel's dashboard is checked manually rather than pushing alerts |

## SLIs / SLOs

| SLI | SLO target | Measurement window |
|---|---|---|
| — | — | None defined. `reliability-requirements.md`/`reliability-design.md` set a best-effort availability posture with no formal SLO to track against |

## Logs & Tracing

- **Log aggregation**: None beyond Vercel's built-in function logs (retained per the platform's default retention for the selected plan) and the browser console for client-side `console.error`/`console.warn` calls (`observability-design.md`).
- **Tracing**: Not applicable — no distributed system exists to trace across; every request path is either a single client-side operation or one Next.js page/asset request to Vercel.
- **Dashboards**: Vercel's own dashboard is the sole operational visibility; no custom dashboard is built.

## Assumptions & Open Questions

None.
