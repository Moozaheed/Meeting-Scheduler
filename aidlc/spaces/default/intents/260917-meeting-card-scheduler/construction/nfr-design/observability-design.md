# Observability Design — Meeting Scheduler & Invitation Card Generator

## NFR7.1 — Built-in-only observability

Confirmed unchanged from `observability-requirements.md`: no external
monitoring/error-tracking service, only the hosting platform's built-in
logs/dashboard and Next.js error boundaries.

## Structured Logging Design

| Log level | Emit point | Mechanism |
|---|---|---|
| ERROR | `PersistenceAdapter` catch blocks (NFR4.1), `CardGeneration.exportPdf()` catch blocks (FR5.5), the React error boundary around the card flow | `console.error(...)` — surfaces in the browser console client-side, and in Vercel's function logs for any server-rendered path |
| WARN | Graceful-degradation event (falling back to in-memory persistence state) | `console.warn(...)` |

No structured JSON logging format, correlation ID propagation, or log
shipping is designed — there is no distributed system to correlate across,
and no external log aggregator to ship to (per NFR7.1).

## Distributed Tracing

Not applicable. There are no service-to-service calls to trace — the
entire request path for any user action is either purely client-side
(scheduling, agenda, attendee, card generation) or a single Next.js
page/asset request to Vercel.

## Metrics & Dashboards

None custom-built. Vercel's own dashboard (deployment status, function
invocation counts, basic request metrics) is the sole operational
visibility — already available with no additional configuration, per
`tech-stack-decisions.md`.

## Alerting

None configured — no external alerting pipeline exists (consistent with
NFR7.1), and the low-stakes, best-effort-availability posture
(`reliability-design.md`) does not warrant one.

## SLI/SLO Tracking

No SLI/SLO tracking is designed. `reliability-requirements.md` already
establishes a best-effort availability posture with no formal SLO to
track against.

## Assumptions & Open Questions

None.
