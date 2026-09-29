# Project-Level Rules

> Project-specific specialisation and corrections. Loaded after `org.md` and
> `team.md` as strict-additive guidance; contradictions with broader policy
> are rejected. Populated by practices-discovery and the self-learning loop.
>
> Use sparingly: most teams don't need a project layer. Reach for it
> only when this specific project needs stable, durable guidance beyond the
> team practice (for example, package-specific release checks or an additional
> regression suite for a legacy component).

## Way of Working

<!-- Project-specific specialisation. Example: -->

<!-- This monorepo requires package-scoped branch names and a package owner -->

<!-- review in addition to the team's normal merge policy. -->

## Walking Skeleton

<!-- Project-specific specialisation. Example: -->

<!-- The walking skeleton must exercise the legacy service adapter as well -->

<!-- as the new service boundary. -->

## Testing Posture

<!-- Project-specific specialisation. -->

## Change Control

<!-- Project-specific. Mode: strict or relaxed. Strict here holds for every intent and cannot be changed from chat. -->

## Deployment

<!-- Project-specific specialisation. -->

## Code Style

<!-- Project-specific specialisation. -->

## Tech Stack

<!-- Technology choices locked for this project. -->

## Decided

<!-- Decisions made in earlier stages that should not be re-asked. -->

<!-- Format: DECIDED: [decision] (Stage [slug], [date]) -->

## Scope Overrides

<!-- Custom scope rules for this project. -->

## Forbidden

<!-- Populated by practices-discovery affirmation gate. -->

<!-- Format: NEVER [behavior] (affirmed [date]) -->

<!-- Example: NEVER throw exceptions across service layer boundaries (affirmed 2026-05-17) -->

- NEVER call IndexedDB/localStorage or the PDF/QR card-generation engine directly from a UI component — the domain/state layer is the only permitted caller (affirmed 2026-09-17, interview Q6).
- NEVER merge without secret scanning, dependency scanning, and code security lint checks having passed (affirmed 2026-09-17, interview Q7).
- NEVER write the invitation-card export tests to assert deep PDF-text or QR-payload content correctness — the human explicitly declined the quality reviewer's proposed deep-verification pattern; a lighter "didn't crash" check (non-empty PDF output, QR image renders, no exception) is the affirmed depth for this suite (affirmed 2026-09-17, interview Q4).
- NEVER leave a Supabase Row Level Security policy at `qual: true`
  (unrestricted — every row readable/writable by the `anon` role) on a
  table holding PII. This app's `meetings`, `agenda_items`, and
  `attendees` tables all currently violate this: every row is readable
  and writable by anyone holding the public anon key, with no per-visitor
  isolation. Verify: query `pg_policies` for the project's `public`
  schema (`select tablename, policyname, qual from pg_policies where schemaname = 'public'`) and confirm no policy's `qual` reads the
  literal `true` for a table listed as holding PII in `team.md`'s PII
  disclosure section. (identified 2026-09-29 — currently non-compliant
  on all three tables)

## Mandated

<!-- Populated by practices-discovery affirmation gate. -->

<!-- Format: ALWAYS [behavior] (affirmed [date]) -->

<!-- Example: ALWAYS use Result<T,E> for fallible operations in service layer (affirmed 2026-05-17) -->

- ALWAYS route storage/card-engine access through the domain/state layer — never directly from a UI component (affirmed 2026-09-17, interview Q6).
- ALWAYS run secret scanning, dependency scanning, and code security lint checks before merge (affirmed 2026-09-17, interview Q7).
- ALWAYS squash-merge each Bolt branch into `main` as a single commit named by the Bolt slug (affirmed 2026-09-17, interview Q1).
- ALWAYS auto-deploy to the single hosted instance on every merge to `main`, with no manual confirmation step (affirmed 2026-09-17, interview Q5).
- ALWAYS provide a visible "clear my data" action that wipes IndexedDB/localStorage for that browser (affirmed 2026-09-17, interview Q8).

## Corrections

<!-- Project-specific corrections from human feedback. -->

<!-- Format: NEVER/ALWAYS [behavior] (learned [date]) -->

- Log each decision entry (aidlc-log.ts decision) immediately before presenting its question, not after a batch of questions has already been answered, so the answer-log call always has a matching fresh human turn. (learned 2026-09-17) 
- When a request says "zero cloud dependency" or "single self-contained repo" but also implies multiple people need access, explicitly ask whether they mean centralized hosting (single deployed instance, still no shared database) before assuming a purely local, per-user install. (learned 2026-09-17) 
- The decision-logging correction from the previous stage did not fully take effect: call `aidlc-log.ts decision` for EACH individual structured question immediately before that specific question is presented (not once per batch, and not once per stage) so the matching `aidlc-log.ts answer` call always has a fresh human turn to bind to. (learned 2026-09-17) 
- When a requested scope change (recompose) fails the strict validator because it needs upstream stages too, present the full resulting dependency chain to the human for confirmation BEFORE applying it, not after — run the recompose only once that's approved. (learned 2026-09-17) 
- The invitation card renders at a fixed US Letter page size (8.5in x 11in) — no A5 option, no host-selectable dimension (decided BR5.2, resolving requirements.md FR5.2). (learned 2026-09-18) 
- Always record a reviewer's verdict receipt (aidlc-log.ts review --verdict) BEFORE editing the reviewed artifacts to apply fixes, even for an adversarial NOT-READY verdict you're about to act on immediately. Editing first invalidates the receipt against the now-changed bytes and forces reverting to the original content, recording the stale verdict, then reapplying every fix a second time. (learned 2026-09-18) 
- Asked a new Q3 (beyond the original Q1/Q2) at ci-pipeline because the prior recorded answers didn't cover "should gates exist at all" — only narrow implementation choices. The human's direct deletion of ci.yml/scheduled-audit.yml outside the framework created a real conflict with project.md's standing Forbidden/Mandated gate requirement that had to be surfaced, not silently resolved either way. (learned 2026-09-29) 
- Supersedes the CI-gate requirements recorded below: the team explicitly decided at ci-pipeline stage Q3 (2026-09-29) to run no CI-enforced quality gates — no secret scanning, dependency scanning, or code security lint checks block a merge. The Forbidden "NEVER merge without secret scanning..." and Mandated "ALWAYS run secret scanning..." entries (affirmed 2026-09-17) no longer reflect current practice; this later Corrections entry governs. Those checks remain available to run manually (see construction/ci-pipeline/quality-gates.md); nothing enforces them automatically. (learned 2026-09-29) 
- Re-run of deployment-pipeline after the ci-pipeline backward jump reset it. No new question was asked here: ci-pipeline's Q3 ("no CI-enforced gates at all") already determined the one thing that changed for this stage's own outputs — the ci.yml e2e-smoke job this stage's rollback triggers referenced no longer exists. Updated cd-config.md and rollback-runbook.md's factual claims (vercel.json, e2e-smoke references) to match current reality instead of re-asking a question already answered upstream. (learned 2026-09-29) 
- Re-run of environment-provisioning after the ci-pipeline backward jump reset it. No new question asked: struck the branch-protection checklist item referencing now-removed CI status checks and updated the vercel.json reference, rather than leaving them claiming a match that no longer holds. Cross-checked against the live GitHub repo (branch protection status queried earlier this session) rather than assuming. (learned 2026-09-29) 
- This is a re-run of ci-pipeline after its prior output (ci.yml, scheduled-audit.yml, vercel.json) was deleted directly outside the framework earlier in this session, at explicit human request. Jumped backward to this stage through `aidlc engine jump execute` rather than hand-editing state, so the deletion is now reflected through the proper workflow mechanism instead of leaving aidlc-state.md silently stale. (learned 2026-09-29) 
- Narrows the prior Corrections entry above about CI-gate requirements: as of ci-pipeline Q4 (2026-09-29, "only add the gitleaks gate"), secret scanning is active again — Gitleaks runs on every push to main, blocking on a leak. It is no longer superseded: the Forbidden "NEVER merge without secret scanning..." and Mandated "ALWAYS run secret scanning..." entries (affirmed 2026-09-17) are accurate again for secret scanning specifically. Dependency scanning and code security lint checks remain superseded (still not enforced) — see construction/ci-pipeline/quality-gates.md for the full current-state picture. (learned 2026-09-29)
