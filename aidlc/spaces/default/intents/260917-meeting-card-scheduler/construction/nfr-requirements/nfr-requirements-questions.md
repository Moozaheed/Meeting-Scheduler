# NFR Requirements — Clarifying Questions

These questions resolve gaps in `requirements.md`'s NFR1–NFR5 that need quantified
targets, a named tech-stack choice, or a scoping decision before
`performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`,
`reliability-requirements.md`, `observability-requirements.md`, and
`tech-stack-decisions.md` can be written.

## Q1 — Hosting platform for the single centrally-hosted instance

`requirements.md`'s Assumptions section leaves "the exact hosting mechanism (e.g.,
Vercel vs. a self-hosted server)" open. This determines the deploy-on-merge
mechanism, the PDF-export function timeout margin against the ~3s target
(NFR1.2), and whether "zero cloud database" is trivially satisfied by the
platform's own model.

[Answer]: Vercel (serverless functions, zero-config Next.js App Router deploy-on-merge, generous free tier for a small team).

## Q2 — Scope of the "zero third-party API/SaaS dependency" constraint for observability tooling

The project constraint is "zero third-party API dependencies" for the app's
core features (scheduling, card generation). Observability tooling (error
tracking, uptime monitoring) is a different concern from the app's runtime
features. Does the zero-third-party-dependency constraint extend to
observability/monitoring tooling too (so only built-in platform logs/console
output are allowed), or may the team adopt a lightweight external monitoring
service for the hosted instance?

[Answer]: The zero-third-party-API constraint extends to observability tooling. Rely on the hosting platform's built-in logs/console output and Next.js error boundaries only — no external error-tracking SaaS.

## Q3 — Reliability target and data-loss posture

All meeting data lives in browser storage only (no server-side database —
NFR/BR6.1). Two related items:
- **3a.** Is there a specific uptime/availability SLO for the hosted
  instance, or is "best-effort, no formal SLA" the right target for an
  internal small-team tool with no staging/production split?
- **3b.** Since a user clearing their browser data or switching browsers
  permanently loses their meetings, is that an accepted risk with no
  backup/export feature, or should NFR Requirements flag an export/import
  (backup) capability as a Should-Have for a future iteration?

[Answer]: Best-effort uptime, no formal SLA, for this internal small-team tool. Browser-data loss (user clears storage or switches browsers) is an accepted, undocumented risk — no export/import backup feature.

## Q4 — Security posture for the unlisted, unauthenticated hosted URL

NFR5.3 already establishes no authentication, access limited to an unlisted
URL. Beyond the already-affirmed secret scanning / dependency scanning /
security lint gates (`project.md`), should this stage mandate specific HTTP
security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options) and any
basic rate-limiting/bot-mitigation on the hosted instance, or is that
out of scope given the low-stakes, unlisted-URL threat model?

[Answer]: Mandate standard HTTP security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options). No rate-limiting/bot mitigation — the unlisted URL plus already-affirmed scanning gates are the primary controls for this low-stakes internal tool.

## Q5 — Expected concurrent-user ceiling

`requirements.md` describes a small team using one centrally-hosted instance.
What's the expected concurrent-user ceiling this stage should design against
(e.g., "under 20 concurrent users, no need for auto-scaling or load
balancing")? This sets the load assumption the performance and scalability
requirements are measured against.

[Answer]: Design for under 20 concurrent users, matching a small internal team. No auto-scaling or load-balancing NFR needed — a single serverless/static instance comfortably covers this load.

## Q6 — PDF and QR-code library selection

The original project description named `@react-pdf/renderer` or `pdfkit` as
example options for client-side PDF generation, without settling on one, and
named no specific QR-code library. Which should `tech-stack-decisions.md`
name as the selected libraries for PDF rendering and QR-code generation?

[Answer]: `@react-pdf/renderer` for PDF rendering (declarative, React-component-based layout fits the Next.js codebase) and `qrcode.react` for QR-code generation (SVG/canvas React component, shared payload feeds both live preview and PDF export).
