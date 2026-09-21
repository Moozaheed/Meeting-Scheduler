# Security Requirements — Meeting Scheduler & Invitation Card Generator

## Threat Model (STRIDE, scoped to this app's attack surface)

The app has two entry points: the public hosted URL (form inputs, browser
storage) and the generated PDF (rendered from user-entered text). There is no
backend API, no authentication, and no server-side data store — the smallest
attack surface STRIDE applies to.

| Category | Applicability | Mitigation |
|---|---|---|
| Spoofing | Low — no accounts, no sessions, no identity to spoof | N/A — no auth model exists to spoof (NFR5.3) |
| Tampering | Attendee/agenda/host text could carry malicious markup rendered into the DOM preview or the PDF | NFR5.1: escape all user-entered text at every render sink (live preview DOM, PDF text nodes) |
| Repudiation | N/A — single-browser, single-user local data with no shared audit trail requirement | Not applicable to this scope |
| Information Disclosure | Attendee/host PII stored unencrypted in browser storage (NFR5.2); the unlisted hosted URL itself, if leaked, exposes the app (not stored data, since storage is per-browser) | NFR5.2: explicit in-app disclosure statement; NFR5.3: unlisted-URL access control is the accepted, sufficient control for this internal tool |
| Denial of Service | Low — no shared backend to exhaust; a hosted-instance flood would affect Vercel's serverless layer, not any other user's data (each browser's storage is isolated) | Out of scope per this stage's Q4 decision — no rate-limiting/bot mitigation mandated; the unlisted URL and low-stakes threat model make this an accepted risk |
| Elevation of Privilege | N/A — no roles or permission levels exist in this app | Not applicable to this scope |

## NFR5.1 — Input sanitization at every render sink

| Field | Value |
|---|---|
| Requirement | All user-entered text (attendee names, agenda topics, meeting descriptions, host info) is treated as untrusted and safely escaped wherever rendered |
| Sinks covered | Live preview DOM (`LiveCardPreview`), the generated PDF (`CardGeneration.exportPdf()`) |
| Control | React's default JSX escaping for the DOM path; `@react-pdf/renderer`'s text-node API (never raw string concatenation into a drawing primitive) for the PDF path — no `dangerouslySetInnerHTML` or equivalent anywhere in this codebase |
| Source | requirements.md NFR5.1 |

## NFR5.2 — PII disclosure

| Field | Value |
|---|---|
| Requirement | Attendee and host contact information (name, email, role) is stored unencrypted in browser storage; the app carries an in-app disclosure statement saying so |
| Data classification | Confidential (attendee/host PII) per the classification tiers in `.claude/knowledge/aidlc-devsecops-agent/security-guide.md`, though encryption-at-rest is explicitly not required here — the disclosure statement is the affirmed control in place of encryption, since this is client-only local storage the user already controls |
| Placement | Disclosure statement visible before or at first data entry, per the affirmed team practice (`team.md` § PII and browser-storage disclosure) |
| Retention control | The "clear my data" action (FR6.2, `project.md` Mandated) is this project's sole active retention control for the unencrypted PII disclosed here — it lets the user remove all stored PII at will, offsetting the indefinite-retention risk of storing it unencrypted with no automatic expiry |
| Source | requirements.md NFR5.2 |

## NFR5.3 — No authentication; unlisted-URL access control

| Field | Value |
|---|---|
| Requirement | The hosted instance requires no authentication; access control is limited to an unlisted URL |
| Rationale | Internal small-team tool, no sensitive server-side data (all meeting data is per-browser local storage, not shared), consistent with the scope document's decision |
| Source | requirements.md NFR5.3 |

## NFR5.4 — HTTP security headers (new, this stage)

| Field | Value |
|---|---|
| Requirement | The hosted instance sets standard HTTP security headers on every response |
| Headers mandated | `Content-Security-Policy` with `default-src 'self'`, `script-src 'self' 'nonce-{per-request-nonce}'` (a per-request nonce, not `'unsafe-inline'`, to allow Next.js's inline hydration bootstrap script without weakening the policy), `style-src 'self' 'unsafe-inline'` (Tailwind's runtime-injected styles and `@react-pdf/renderer`'s internal styling require this; scoped to style only, not script), `img-src 'self' data:` (QR code and any data-URI image content), `font-src 'self'`, `connect-src 'self'` (no external API calls, per the zero-third-party constraint), `frame-ancestors 'none'`; plus `Strict-Transport-Security`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff` |
| Explicitly out of scope | Rate-limiting and bot mitigation — declined at this stage's Q4 as disproportionate to the low-stakes, unlisted-URL threat model |
| Implementation note | Next.js `headers()` config in `next.config.js` for the static headers; the CSP's per-request nonce requires Next.js middleware to generate and inject it (Next.js's documented nonce-based CSP pattern), verified in CI |
| Source | this stage's interview Q4 |

## Compliance

No regulatory framework (GDPR, HIPAA, SOC 2, PCI-DSS) applies: the app
processes no payment data, no health data, and serves an internal small
team with data staying in each user's own browser rather than being
collected by the operator. NFR5.2's disclosure statement is the sole privacy
control needed at this scale.

## Pipeline Security (carried from the affirmed team practice)

Secret scanning, dependency scanning, and code security lint checks are
already mandated pre-merge (`project.md` Mandated, interview Q7) — restated
here for traceability, not re-decided.

## Assumptions & Open Questions

None.
