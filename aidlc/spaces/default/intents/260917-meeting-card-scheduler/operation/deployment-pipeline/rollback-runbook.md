# Rollback Runbook — Meeting Scheduler & Invitation Card Generator

## Rollback Mechanism

**Vercel's native instant rollback** to any prior immutable deployment —
the sole rollback mechanism (`infrastructure-design/cicd-pipeline.md`'s
Q3, unchanged here). No custom tooling, no database migration to reverse
(all data is client-side; see `deployment-strategy.md`'s schema-drift
note for the one caveat that isn't reversible by a code rollback).

## When to Roll Back

Roll back when:
- The post-merge E2E smoke job (`ci.yml`'s `e2e-smoke`) fails on `main` after a deploy already went live (the accepted timing trade-off documented in `infrastructure-design/cicd-pipeline.md` and `ci-pipeline/quality-gates.md` — this job cannot block the Vercel deploy itself).
- A manual smoke check (below) fails after a deploy.
- A user-reported issue is traced to the most recent deploy.

## Rollback Steps

1. **Identify the last known-good deployment.** Open the Vercel dashboard → Project → Deployments, and find the most recent deployment that passed its post-merge E2E smoke job (cross-reference the commit SHA against the GitHub Actions run history for `e2e-smoke`).
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

This mirrors `ci.yml`'s automated `e2e-smoke` job — the manual version
exists for the case where a human needs to verify production directly
(e.g. immediately after a manual rollback, before the next CI run).

## Escalation

This is a solo/small-team internal tool with no formal on-call rotation
(`scope document`, `approval-handoff/initiative-brief.md`). The project
owner (the human operating this AI-DLC workflow) is the sole escalation
point — there is no additional contact list to maintain.

## Assumptions & Open Questions

None.
