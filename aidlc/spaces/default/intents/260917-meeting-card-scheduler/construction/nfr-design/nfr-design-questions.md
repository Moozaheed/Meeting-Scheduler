# NFR Design — Clarifying Questions

This app has an unusually simple runtime shape: a Next.js/Vercel-hosted UI
with **no backend database and no third-party API calls at runtime** — all
scheduling, agenda, attendee, and PDF/QR logic runs client-side against
browser storage (per `tech-stack-decisions.md` and `nfr-requirements/*`).
These questions resolve how much of the standard NFR-design toolkit
(circuit breakers, caching tiers, CSRF, service-level blast-radius mapping)
genuinely applies here versus is out of scope by design.

## Q1 — Resilience patterns: circuit breakers, retries, bulkheads

The app makes no external network calls at runtime (no third-party APIs, no
backend database — `security-requirements.md` NFR5.3, `tech-stack-decisions.md`).
The only failure paths are the client-side persistence layer (IndexedDB) and
the client-side PDF/QR rendering, both already specified in
`reliability-requirements.md` (NFR4.1–NFR4.3). Should `reliability-design.md`
skip circuit-breaker/retry-with-backoff/bulkhead patterns entirely (nothing
external to protect against) and focus solely on designing the concrete
graceful-degradation mechanism for the persistence and card-generation
boundaries?

[Answer]: Yes — skip circuit-breaker/retry-with-backoff/bulkhead patterns entirely. Nothing external exists to protect against; `reliability-design.md` focuses solely on the concrete persistence and card-generation graceful-degradation mechanism (NFR4.1–NFR4.3).

## Q2 — Caching architecture

Is there any caching design needed beyond Vercel's default CDN caching of
Next.js static assets (no per-user server-side data to cache, since all
meeting data is client-only), or should `performance-design.md` explicitly
document "no custom caching layer — static asset caching via Vercel's
default CDN behavior is sufficient"?

[Answer]: No custom caching layer. `performance-design.md` documents that Vercel's default CDN static-asset caching is sufficient — no per-user server-side data exists to cache.

## Q3 — Logical component / blast-radius mapping

Should `logical-components.md` map its failure-domain inventory directly
onto the four components already defined in `domain-design/components.md`
(Presentation, Scheduling, PersistenceAdapter, CardGeneration), treating
each as its own failure domain even though they are modules within one
Next.js deployment rather than separately deployed services — i.e., "a
CardGeneration failure never takes down Scheduling" as an in-process
isolation boundary (error boundary), not a network/process boundary?

[Answer]: Yes — map failure domains onto the four existing domain-design components (Presentation, Scheduling, PersistenceAdapter, CardGeneration) as in-process isolation boundaries. E.g. a CardGeneration failure is isolated by a React error boundary, not a service/network boundary.

## Q4 — CSRF protection

There is no session/cookie-based authentication and no server-side mutating
endpoint (all data mutations are client-side writes to IndexedDB, not HTTP
requests to a backend). Should `security-design.md` mark CSRF protection as
explicitly out of scope for this reason, rather than designing a CSRF
token/SameSite-cookie mechanism that has nothing to protect?

[Answer]: Yes — mark CSRF protection explicitly out of scope in `security-design.md`. Rationale: no session/cookie-based auth and no server-side mutating endpoint exist for CSRF to protect.
