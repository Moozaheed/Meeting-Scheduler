# Observability Requirements — Meeting Scheduler & Invitation Card Generator

No inception-level NFR category covers observability (`requirements.md`
defines Performance, Accessibility, Browser/Device Compatibility, Reliability,
and Security only) — this requirement is newly derived from this stage's own
interview (Q2) and reverse-traced in `traceability.json`.

## NFR7.1 — Built-in-only observability (no external tooling)

| Field | Value |
|---|---|
| Requirement | Observability relies solely on the hosting platform's built-in logs/console output and Next.js error boundaries — no external error-tracking or monitoring SaaS |
| Rationale | This stage's Q2 confirmed the project's "zero third-party API dependency" constraint extends to observability tooling, staying consistent with the project's zero-dependency spirit rather than treating monitoring as an exception |
| Source | this stage's interview Q2 |

### Logging

| Log Level | When to Use | Where it Goes |
|---|---|---|
| ERROR | Persistence failures (NFR4.1), PDF export failures (FR5.5), unhandled render exceptions | Browser console (client-side) and Vercel's built-in serverless function logs (any server-rendered/edge path) |
| WARN | Graceful-degradation events (e.g., falling back to in-memory state) | Browser console |
| INFO | Not required at this scale — no structured business-event logging is mandated | N/A |

No log retention policy is set: Vercel's default log retention for the
selected plan applies as-is, with no additional configuration.

### Metrics, tracing, and alerting

Not mandated. A single-instance, under-20-concurrent-user internal tool with
no external monitoring service has no metrics pipeline, distributed tracing,
or alerting to configure — Vercel's own dashboard (deployment status, function
invocation counts) is the sole operational visibility, already available with
no extra work.

## Assumptions & Open Questions

None.
