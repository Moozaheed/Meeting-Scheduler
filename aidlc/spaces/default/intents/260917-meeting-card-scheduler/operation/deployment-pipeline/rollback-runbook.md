# Rollback Runbook — Meeting Scheduler & Invitation Card Generator

## Rollback Mechanism

**Vercel's native instant rollback** to any prior immutable deployment —
the sole rollback mechanism (`infrastructure-design/cicd-pipeline.md`'s
Q3, unchanged here). No custom tooling, no database migration to reverse
(all data is client-side; see `deployment-strategy.md`'s schema-drift
note for the one caveat that isn't reversible by a code rollback).

## When to Roll Back

**Updated on this re-run**: `ci.yml`'s automated `e2e-smoke` job no longer
exists — `ci-pipeline` Q3 removed all CI workflows, so there is no
automated post-merge signal to trigger a rollback anymore. Roll back when:
- A manual smoke check (below) fails after a deploy.
- A user-reported issue is traced to the most recent deploy.

Since nothing runs automatically after a merge, catching a bad deploy now
depends entirely on someone actually performing the manual smoke check or
a user noticing and reporting a problem — there is no automated backstop.

## Rollback Steps

1. **Identify the last known-good deployment.** Open the Vercel dashboard → Project → Deployments, and find the most recent deployment confirmed good by a manual smoke check (below) — there is no automated E2E run to cross-reference against anymore, so this identification is manual.
2. **Promote it to production.** In the Vercel dashboard, select that deployment → "Promote to Production" (or via CLI: `vercel rollback <deployment-url>`). This is instant — Vercel repoints production traffic to the already-built, immutable deployment; no rebuild is triggered.
3. **Verify the rollback.** Re-run the manual smoke check (below) against the production URL to confirm the rollback resolved the issue.
4. **Fix forward.** Diagnose the root cause on a new branch, fix it, and let the normal CI/CD pipeline (pre-merge gates → merge → auto-deploy) ship the fix — do not attempt to patch the rolled-back deployment directly.

## Post-Deployment Smoke Test / Health Check

No automated health-check endpoint exists (no backend API to expose one
from — the app is fully client-side). The smoke test is manual, following
the same flow as `e2e/happy-path.spec.ts`:

1. Open the production URL.
2. Confirm the Meetings List renders (not a blank page — this is exactly the failure mode the hydration bug caught during Build and Test would have caused in production had it shipped).
3. Create a test meeting, add an agenda item and an attendee, confirm the live preview updates.
4. Export the PDF and confirm the download succeeds.
5. Use "Clear my data" to remove the test meeting.

This used to mirror `ci.yml`'s automated `e2e-smoke` job as a manual
fallback; now that no automated job exists at all, this manual check is
the *only* smoke verification this project has — not a fallback for one.

## Escalation

This is a solo/small-team internal tool with no formal on-call rotation
(`scope document`, `approval-handoff/initiative-brief.md`). The project
owner (the human operating this AI-DLC workflow) is the sole escalation
point — there is no additional contact list to maintain.

## Assumptions & Open Questions

None.
