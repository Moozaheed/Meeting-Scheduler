**Collaborator:** aidlc-devsecops-agent

## Contribution

Reviewed for: lint/format rules, SAST/DAST, secret and dependency scanning, and supply-chain controls. This is greenfield with no existing repo/CI to inspect, so everything below is a proposal for what SHOULD be established, sized to the project's actual attack surface: a Next.js/TypeScript/Tailwind client-side-only app (no backend service, no third-party API keys, no cloud database), but **publicly hosted** at an unlisted URL with **no authentication**, and it stores **PII in the browser** (attendee names/emails, host name/contact email). "No backend" reduces some risk classes but does not remove the need for a security baseline — the client bundle runs unmodified in every visitor's browser, and the deployed instance is reachable by anyone who has or guesses the URL.

`team-practices.md`'s `## Code Style` section defers entirely to project-level linter/formatter config, per the org default. Correctly so for style — but org.md also requires agents to "flag what security-relevant lint/scan tooling should be set up" when no config exists yet, and the current draft doesn't do that anywhere. The items below fill that gap; the lead should fold them into `## Code Style` (lint additions) and add a new subsection (or a `## Security Tooling` heading) under `team-practices.md` covering SAST/DAST/secrets/dependencies, since none of the five org-default sections the draft mirrors has a natural home for it.

### 1. Data classification (frames everything else)

Per the security-guide's data tiers, attendee name/email and host name/contact email are **Confidential (PII)**, even though they never leave the visitor's own browser. Two consequences the draft should state explicitly:
- Browser storage (IndexedDB/localStorage) is **not encrypted at rest** by the browser in any way that resists a compromised or shared device — there is no server-side key management story here, and building one would be misleading "security theatre" for a client-only app. Recommend documenting this as an accepted, disclosed limitation (e.g., a short line in the app's own UI or README: "your data stays on this device only, in plain browser storage — don't use it on a shared computer for sensitive meetings") rather than pretending otherwise.
- Because the instance has no authentication and PII is entered into forms rendered by a live preview, treat **all user-entered text as untrusted input** even with no server round-trip — it still gets rendered into the DOM preview and embedded into the generated PDF, so injection/XSS risk is real without a backend.

### 2. Lint/format rules (security-relevant additions)

The base ESLint/Prettier/TypeScript setup the draft proposes is fine for style; add these for security, since nothing is configured yet:
- **TypeScript `strict: true`** (`noImplicitAny`, `strictNullChecks`) in `tsconfig.json` — catches type-confusion bugs that commonly underlie injection and null-deref issues before they reach runtime.
- **`eslint-plugin-security`** — lightweight pattern-based rules (unsafe regex/ReDoS, `eval`, non-literal `fs`/`require`) as a fast pre-commit/CI check.
- **`eslint-plugin-react` / `eslint-plugin-jsx-a11y` security-relevant rules**, specifically `react/no-danger` (flag any `dangerouslySetInnerHTML` use) — this app renders attendee names, agenda topics, and free-text meeting descriptions into a live preview; banning raw HTML injection by default is the cheapest XSS control available.
- **`eslint-plugin-no-unsanitized`** if any direct DOM manipulation is used outside React's own escaping (e.g., inside the PDF/QR generation code, which may touch canvas or raw string building).
- Enforce these as **CI-blocking**, not warnings, consistent with org.md's linter-blocks-PR policy — there's no existing config to defer to yet, so this stage is the right place to set the floor.

### 3. SAST

Org.md's own knowledge base suggests Amazon CodeGuru Security as a first option — flagging that it does **not** fit this stack (CodeGuru Reviewer covers Java and Python, not JS/TS). Recommend instead:
- **GitHub CodeQL default setup** (native, zero-config, free for the repo) as the baseline SAST gate on every PR — good fit for a solo builder who wants strong coverage without pipeline-authoring overhead.
- **Semgrep** (`p/javascript`, `p/typescript`, `p/react`, `p/nextjs` rulesets) as a second pass if the team wants faster, more customizable feedback than CodeQL alone; both can coexist as a PR check.
- Gate: block merge on Critical/High findings, warn on Medium — same severity model as the org default's SAST gate, just scoped to a tool that actually covers TypeScript/React.

### 4. DAST

No traditional API surface to attack (no backend), but the app is still a **public, unauthenticated web page** — DAST here is about configuration/exposure, not business-logic abuse:
- Run an **OWASP ZAP baseline (passive) scan** against the deployed URL after each deploy to staging/the single hosted instance — checks for missing security headers, information disclosure (exposed source maps, verbose error pages), mixed content, and clickjacking exposure (missing `X-Frame-Options`/`frame-ancestors`).
- Do **not** run an active/attacking ZAP scan against the single public production-equivalent instance without a separate ephemeral environment — there's no staging/production split in scope (per `scope-document.md`), so an active scan would hit the only instance real (if future) visitors use.
- Explicitly confirm during Domain/Contract Design that **no Next.js API routes or Server Actions exist** — if one gets added later (e.g. for a "share by email" feature), that silently reintroduces a backend and this entire security posture (authn/authz, rate limiting, input validation, secret management) needs to be revisited. Flag this as a standing check, not a one-time assumption.

### 5. Secret scanning

The project has no third-party API keys today, which lowers exposure — but this should be enforced, not assumed, and it can change (analytics, fonts, a future email-share feature):
- **Gitleaks** as a pre-commit hook (solo builder — cheap to add, catches accidental key commits before they ever reach `main`) and again in CI as the backstop for any hook that gets skipped or bypassed.
- Rely on **GitHub's native secret scanning** as a second backstop (assuming the repo is hosted on GitHub) — zero setup cost.
- `.gitignore` must exclude `.env*` (except `.env.example`) from day one, since there's no existing config to inherit this from.
- If a secret is ever committed: revoke/rotate immediately (e.g., a Vercel deploy token), then clean git history — same as the org-level default practice.

### 6. Dependency vulnerability scanning & supply chain

This is the highest-leverage control for this project's actual risk profile: the PDF and QR generation libraries run **client-side, in every visitor's browser, unsandboxed**. A vulnerable or malicious version of either library is not a "server compromise" risk here — it's a **direct-to-every-visitor** risk (e.g., a compromised QR-generation package running arbitrary JS in the visitor's browser alongside the PII-filled form). Treat client bundle dependencies as first-class attack surface, not an afterthought:
- **Dependabot** (native to GitHub, zero-config) enabled on the npm ecosystem, weekly, for both direct and transitive dependency alerts.
- **`npm audit` (or `pnpm audit`/equivalent) in CI**, failing the build on Critical/High findings with a known exploit — run on every PR and on a scheduled weekly job (catches newly disclosed CVEs in already-merged dependencies).
- **Commit the lockfile** (`package-lock.json` / `pnpm-lock.yaml`) and use `npm ci` (not `npm install`) in CI/build, so builds are reproducible and can't silently pull a newer, unreviewed transitive version.
- Prefer **`--ignore-scripts`** for CI installs where feasible, or at minimum review any dependency (especially the PDF/QR libraries and their transitive deps) that ships `postinstall` scripts — a common supply-chain attack vector (npm package takeover/typosquatting) that matters more here precisely because there's no backend team to catch a compromised build downstream.
- No SBOM requirement is necessary at this project's scale (per org's greenfield/solo shape), but generating one (e.g. via `npx @cyclonedx/cyclonedx-npm`) is a low-cost option if the team wants supply-chain transparency for a public-facing tool.

### 7. Security headers & CI gates (fills the gap left by "no backend")

Because the app is reachable by anyone with the URL and has no auth layer, the browser-level security headers are effectively the whole perimeter. Set these in `next.config.js` `headers()` from the first deploy, not retrofitted later:
- `Content-Security-Policy` (start restrictive: `default-src 'self'`, tighten for whatever PDF/QR/font CDN sources are actually used — prefer self-hosting those over external CDNs to avoid a CSP exception and a subresource-integrity gap).
- `X-Frame-Options: DENY` / `frame-ancestors 'none'` — prevents the unauthenticated form from being framed and clickjacked.
- `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (deny camera/mic/geolocation — none are used).
- HTTPS/HSTS comes for free on Vercel-class hosts; confirm it's not disabled.
- Proposed CI gate sequence for this project's shape (adapted from the org's security-gates table, minus the IaC/container rows that don't apply — there's no infrastructure-as-code or container image in scope):

| Stage | Gate | Action on failure |
|---|---|---|
| Pre-commit | Gitleaks secret scan | Block commit |
| PR | ESLint (incl. security plugins) + CodeQL/Semgrep SAST | Block merge on Critical/High |
| PR / scheduled | `npm audit` dependency scan | Fail on Critical/High with known exploit |
| Post-deploy | ZAP baseline scan against the hosted URL | Alert (ticket), not auto-block, given single-instance hosting |

### 8. PII-specific product control

Recommend the team add a visible **"clear my data"** action in the app itself (wipes IndexedDB/localStorage for that browser). Browser storage otherwise persists indefinitely with no retention policy, which sits awkwardly next to PII (host/attendee emails) even absent a named compliance framework in this project's scope. This is a product/UX decision for the team to affirm, not a hard block — flagging it here so it's a conscious choice rather than an oversight.

## Positions

AGREE: Trunk-based development, squash-merge Bolts, and the `main`-only worktree strategy in `## Way of Working` — no security implication, no objection.

AGREE: The Testing Posture's proposed cross-browser-aware coverage for the PDF/QR export path and dedicated persistence-layer (IndexedDB/localStorage) tests are the right call — recommend the lead also add an explicit test asserting user-entered text (attendee name, agenda topic, meeting description) is safely escaped in both the live preview DOM and the generated PDF, since that's the project's one real injection surface.

OBJECT: `## Code Style` defers entirely to project-level linter/formatter config and states nothing about security-relevant lint or scan tooling, even though none exists yet and org.md explicitly calls for agents to flag this gap — the draft should fold in the lint/SAST/secret/dependency items from this contribution rather than leaving `## Code Style` silent on security.

OBJECT: `## Deployment` proposes deploy-on-merge straight to the single public, unauthenticated hosted instance with no automated security gate mentioned anywhere in the draft (no secret scan, no dependency audit, no SAST check named before merge) — for an internet-facing app handling PII, the deploy-on-merge decision itself is reasonable given the single-instance shape, but it should be paired with the CI gates in section 7 above running *before* that merge, not left implicit.

OBJECT: Neither `team-practices.md` nor `evidence.md` classifies the attendee/host data as PII or names the "browser storage is unencrypted at rest" residual risk anywhere — this should be stated explicitly (see section 1) so the team affirms it as a conscious, disclosed limitation rather than an implicit assumption nobody wrote down.
