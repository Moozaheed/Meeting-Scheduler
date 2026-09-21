# CI/CD Pipeline — Meeting Scheduler & Invitation Card Generator

Two platforms split responsibility: **GitHub Actions** runs every pre-merge
quality/security gate; **Vercel's native GitHub App integration** handles
every deploy (production and PR previews), triggered directly by git
events — no deploy step runs inside GitHub Actions, and no Vercel
credential is stored as a GitHub Actions secret (this stage's Q4).

## Pipeline Stages

### 1. Pre-commit (developer machine)

- Gitleaks secret-scanning hook blocks the commit if a secret is detected (`team.md` Security tooling).

### 2. Pull Request opened/updated (GitHub Actions — blocking)

Runs the CI gate sequence affirmed at practices-discovery, in order, each blocking the merge on failure:

| Stage | Gate | Action on failure |
|---|---|---|
| Lint + typecheck | ESLint (incl. `eslint-plugin-security`, `react/no-danger`, `eslint-plugin-no-unsanitized`) + `tsc --noEmit` | Block merge |
| Unit/component tests | Vitest + React Testing Library, coverage ≥ 80% (no decrease) | Block merge |
| SAST | GitHub CodeQL default setup | Block merge on Critical/High |
| Dependency scan | `npm audit` (`npm ci`, not `npm install`) | Block merge on Critical/High with known exploit |

Accessibility checks (axe-core/pa11y) also run here but are **non-blocking**, per the affirmed practice.

Dependency scanning also runs continuously outside the PR gate, per
`team.md`'s Security tooling practice: **Dependabot** (native GitHub,
weekly) raises alerts and update PRs for direct and transitive
dependencies, and a **scheduled weekly `npm audit` job** (GitHub Actions
`schedule` trigger, same failure threshold as the PR gate) catches newly
disclosed CVEs in dependencies that haven't changed since the last PR.

### 3. Pull Request preview (Vercel, automatic — parallel to step 2)

Vercel's GitHub App integration builds and deploys a preview URL for the PR automatically, with no GitHub Actions involvement. This stage's Q2 confirmed the team relies on this preview as a manual pre-merge smoke-check — not a blocking pipeline gate, just a URL available for the reviewer to open.

### 4. Merge to `main`

- Squash-merge the Bolt branch as a single commit named by the Bolt slug (`org.md`/`project.md` Mandated).
- Vercel's GitHub App integration detects the push to `main` and triggers the production deploy automatically — no manual confirmation step (`project.md` Mandated, this project's confirmed deviation from `org.md`'s staging/production-gate default).

### 5. Post-merge (GitHub Actions — after production deploy)

| Stage | Gate | Action on failure |
|---|---|---|
| E2E smoke suite | Playwright, full happy path (create meeting → build agenda → add attendees → preview → export PDF) across the desktop+mobile browser matrix (`team.md` Testing Posture Gate 2) | Investigate and fix; does not auto-rollback (see Rollback below) |

**Disclosed deviation from `team.md`'s Gate 2 timing**: `team.md` describes
Gate 2 as running "before/alongside the deploy-on-merge." Given this
stage's Q4 decision — Vercel's GitHub App triggers the production deploy
directly and independently of GitHub Actions, with no secret available to
let Actions gate or sequence it — Gate 2 necessarily runs **after** the
deploy is already live, not before it. This is an accepted risk: a broken
build can be live (though only reachable via the unlisted URL) for the
short window between deploy and the E2E suite completing. The mitigation
is Vercel's instant rollback (above), treated as the de facto response if
Gate 2 fails post-deploy — there is no way to gate a Vercel-native deploy
from GitHub Actions without introducing the deploy token this stage's Q4
explicitly declined, so this ordering is the accepted trade-off of that
decision, not an oversight.

## Deployment Strategy

Recreate-on-deploy is implicit in Vercel's serverless model — there is no
blue-green or canary strategy designed, since a stateless serverless
function redeploy has no "old instances draining" concern the way a
long-running server does.

## Rollback Procedure

Vercel's native instant rollback (dashboard or CLI) to any prior immutable
deployment is the sole rollback mechanism (this stage's Q3) — no custom
tooling. This is sufficient for **server-side** state because there are no
database migrations to undo (all data is client-side, per
`scalability-design.md`).

**Client-side schema-drift caveat**: this claim covers server-side data
only. A returning user's browser may already hold IndexedDB records written
by a newer app version (e.g. an added field on `Meeting`/`AgendaItem`/
`Attendee`); rolling the deployed code back to an older version does not
roll back that browser's stored data shape. The accepted mitigation is an
**additive-only, forward-compatible schema discipline**: new fields are
always optional with a safe default when absent, and no field is ever
removed or repurposed across a release, so an older app version reading a
newer-shaped record simply ignores fields it doesn't know about rather than
failing. This is a code-generation-time discipline to enforce, not an
infrastructure mechanism — recorded here as the accepted risk/mitigation
this stage's rollback design relies on.

## Environment Promotion

No promotion pipeline exists beyond PR preview → production, since there
is no separate staging tier (`team.md` Deployment). A PR preview is not
promoted to production directly — merging to `main` triggers an
independent production build from the merged source.

## Secrets Management in CI/CD

No CI/CD secrets are provisioned (this stage's Q4). GitHub Actions' gate
jobs run entirely against the repository's own source with no external
credential; Vercel's GitHub App integration authenticates deploys through
its own installed-app permissions, not a stored token.

## Feature Flags / Artifact Management

Not applicable — no feature-flag system is used (none of this project's
requirements call for one), and there is no build artifact to version or
publish beyond the Vercel deployment itself.

## Assumptions & Open Questions

None.
