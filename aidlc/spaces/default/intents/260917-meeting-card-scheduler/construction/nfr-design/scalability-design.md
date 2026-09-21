# Scalability Design — Meeting Scheduler & Invitation Card Generator

## NFR6.1 — Concurrent-user ceiling (under 20 concurrent users)

| Design element | Approach |
|---|---|
| Scaling architecture | Vercel's default serverless auto-scaling for the Next.js deployment — no custom load balancer, no manually configured scaling policy, no minimum/maximum instance count to tune |
| Load distribution | Handled entirely by Vercel's platform-managed routing; not a design concern for this app |
| Data partitioning | Not applicable — there is no shared/cloud database to partition (FR6.1); each browser's IndexedDB store is independent and unbounded by any server-side capacity limit |
| Capacity threshold | None defined — under-20-concurrent-user traffic sits comfortably within Vercel's free/hobby-tier default limits with no risk of throttling |
| Auto-scaling rules | None custom-configured — Vercel's platform default applies as-is |

## Why no further scalability design is needed

This app's only "scaling" dimension is serving static/SSR Next.js pages to
a small, fixed internal team — there is no database connection pool, no
queue, no shared cache, and no stateful service to scale. The entire
scalability surface area collapses to "does the hosting platform's default
handle under 20 concurrent users," which it does without any custom design.

## Assumptions & Open Questions

None.
