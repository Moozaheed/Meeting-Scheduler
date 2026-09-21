# Security Design — Meeting Scheduler & Invitation Card Generator

## Authentication / Authorization Architecture

None — NFR5.3 establishes no authentication for this hosted instance;
access control is the unlisted URL alone. No login flow, session, or
authorization model is designed here.

## CSRF Protection: explicitly out of scope

There is no session/cookie-based authentication and no server-side
mutating endpoint — every data mutation (create/edit/delete meeting,
agenda item, attendee) is a client-side write to IndexedDB, not an HTTP
request to a backend. A CSRF token or `SameSite` cookie mechanism has
nothing to protect against, so none is designed (decided at this stage's
interview Q4).

## Input Validation & XSS Protection Design

| Layer | Mechanism |
|---|---|
| Form input | Field-level inline validation per BR1.1–BR3.4 (`rules.md`), enforced in the `Scheduling` domain/state layer, never re-implemented in `Presentation` |
| DOM rendering | React's default JSX escaping renders all user-entered text (attendee names, agenda topics, meeting descriptions) — no `dangerouslySetInnerHTML` anywhere in the codebase (enforced by the `react/no-danger` rule from `eslint-plugin-react`, per the affirmed team practice) |
| PDF rendering | `@react-pdf/renderer`'s `<Text>` component nodes only — text content is passed as component children (React-escaped), never concatenated into a raw drawing/string primitive |

## Encryption Design

| Concern | Design |
|---|---|
| In transit | TLS terminated at Vercel's edge (automatic, no custom certificate management needed) |
| At rest | None — browser storage (IndexedDB via `idb-keyval`) is not encrypted; the in-app disclosure statement (NFR5.2) is the affirmed control in place of encryption for this client-only app |

## HTTP Security Headers

Configured via Next.js `headers()` in `next.config.js`:

| Header | Value | Purpose |
|---|---|---|
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' 'nonce-{per-request}'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'` | Restrict resource loading to same-origin plus the specific exceptions Next.js hydration (script nonce) and Tailwind/`@react-pdf/renderer` (inline styles) require |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Force HTTPS on repeat visits |
| `X-Frame-Options` | `DENY` | Prevent clickjacking (no legitimate embedding use case) |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME-sniffing attacks |

The `script-src` nonce is generated per-request in Next.js middleware and
injected into the response, following Next.js's documented nonce-based CSP
pattern — this closes the implementability gap the adversarial review
raised against the nfr-requirements stage's CSP requirement (NFR5.4).

## Secrets Management

No runtime secrets exist for this app (no API keys, no database
credentials — zero third-party API dependency). CI/CD secrets (if any, e.g.
a Vercel deploy token) are managed through the CI platform's own secrets
store, never committed to the repository, per the affirmed team practice
(`.gitignore` excludes `.env*`).

## Audit Logging

None designed — no server-side mutations occur, so there is nothing to
audit-log server-side. Client-side actions are not logged beyond the
browser's own devtools, consistent with the "built-in-only observability"
decision (NFR7.1, `observability-design.md`).

## Compliance Controls

No regulatory framework applies (established in `security-requirements.md`).
The sole active control is the "clear my data" action (FR6.2), which lets
the user remove all disclosed, unencrypted PII (attendee/host names and
emails) from their own browser at will.

## Assumptions & Open Questions

None.
