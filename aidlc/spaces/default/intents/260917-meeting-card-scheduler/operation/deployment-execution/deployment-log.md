# Deployment Log — Meeting Scheduler & Invitation Card Generator

## Outcome: Live production deployment executed

The human directed this stage to perform a real deployment rather than
document one as Deferred (see `deployment-execution-questions.md`'s Q1
answer), and supplied the exact git remote to use. The steps below were
actually run in this session.

## Steps Executed

1. **Git repository initialized and pushed.** The workspace had zero
   commits and no remote configured. Ran:
   - `git add -A` (481 files: the full AI-DLC workspace record plus the
     generated application source — `.env*` other than `.env.example`
     stayed excluded per `.gitignore`; no secrets present to leak)
   - `git commit -m "Initial commit: Meeting Scheduler & Invitation Card Generator"`
   - `git branch -M main`
   - `git remote add origin git@github.com:Mozahad1563/meeting-scheduler.git`
   - `git push -u origin main`
   Pushed successfully to the pre-existing (empty) GitHub repository.

2. **Vercel project created.** `npx vercel link --yes` created
   `mozahed-s-projects/meeting-card-scheduler`, auto-detecting the Next.js
   framework and `vercel.json`'s build settings.

3. **GitHub App auto-connect failed — permissions mismatch (partial gap, flagged).**
   Vercel's own attempt to link the GitHub repository for deploy-on-merge
   failed: `Error: You need admin or write access to the repository
   "meeting-scheduler" to link it. (400)`. The Vercel account
   (`mozahed-s-projects`) and the GitHub account that owns the pushed repo
   (`Mozahad1563`, reached via SSH) are not yet connected through Vercel's
   GitHub App authorization — this is exactly the manual step
   `environment-inventory.md`'s checklist (item 2) anticipated needing a
   human to complete from the Vercel/GitHub UI, which neither the CLI nor
   this session can grant on its own. **This means deploy-on-merge is NOT
   yet wired up** — see "Outstanding Manual Step" below.

4. **Direct production deployment via CLI (bypassing the git integration).**
   Since a CLI-triggered deploy doesn't require the GitHub App link, ran
   `npx vercel --prod --yes`. Build completed successfully (Next.js
   16.3.5, Turbopack, `npm run build` — TypeScript check and static-page
   generation both passed) and the deployment went live:
   - Production URL (stable alias): **https://meeting-card-scheduler.vercel.app**
   - Deployment-specific URL: `https://meeting-card-scheduler-f6rwzabfb-mozahed-s-projects.vercel.app`
   - Deployment ID: `dpl_DLNVxVpUJocjn4BEmLCyM3rMgB3v`
   - `readyState`: `READY`, `target`: `production`

## Outstanding Manual Step (carried forward, not resolved by this session)

**Connect the Vercel project to the GitHub repository** via the Vercel
dashboard (Project → Settings → Git → Connect Git Repository), authorizing
the Vercel GitHub App for `Mozahad1563/meeting-scheduler` from an account
with admin access to that repo. Until this is done:
- Every future deploy requires a manual `vercel --prod` from a machine
  with Vercel CLI access — `cd-config.md`'s "deploy on every push to
  `main`" behavior is not yet active.
- PR preview deployments (also `cd-config.md`) do not yet happen
  automatically either.

This is a one-time dashboard authorization outside this workflow's reach,
consistent with why `environment-provisioning` already flagged it as a
manual, human-performed step (no credentials for cross-account GitHub App
authorization exist in this session).

## Database Migrations

Not applicable — no database exists (`tech-stack-decisions.md`).

## Assumptions & Open Questions

None.
