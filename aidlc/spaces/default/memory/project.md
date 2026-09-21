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
- Log each decision entry (aidlc-log.ts decision) immediately before presenting its question, not after a batch of questions has already been answered, so the answer-log call always has a matching fresh human turn. (learned 2026-09-17) <!-- cid:260917-meeting-card-scheduler:intent-capture:af69cc3cef86f37aa140afd2fa07447402091b77fc78b048c5ffb3810a9bfb4d -->
- When a request says "zero cloud dependency" or "single self-contained repo" but also implies multiple people need access, explicitly ask whether they mean centralized hosting (single deployed instance, still no shared database) before assuming a purely local, per-user install. (learned 2026-09-17) <!-- cid:260917-meeting-card-scheduler:intent-capture:8fc41a39a63133053bd5b4ed420c76f54b685802911bbf41c1adff11842bc326 -->
- The decision-logging correction from the previous stage did not fully take effect: call `aidlc-log.ts decision` for EACH individual structured question immediately before that specific question is presented (not once per batch, and not once per stage) so the matching `aidlc-log.ts answer` call always has a fresh human turn to bind to. (learned 2026-09-17) <!-- cid:260917-meeting-card-scheduler:scope-definition:92e34c4b59a012f6a143c2fc95a553d7c49f960547ca23d39108072624c4c134 -->
- When a requested scope change (recompose) fails the strict validator because it needs upstream stages too, present the full resulting dependency chain to the human for confirmation BEFORE applying it, not after — run the recompose only once that's approved. (learned 2026-09-17) <!-- cid:260917-meeting-card-scheduler:approval-handoff:a93d343a830682e4a5b067f9b3dbfc98d41c0a182d77192ccbdbc4bd3072c3be -->
- The invitation card renders at a fixed US Letter page size (8.5in x 11in) — no A5 option, no host-selectable dimension (decided BR5.2, resolving requirements.md FR5.2). (learned 2026-09-18) <!-- cid:260917-meeting-card-scheduler:functional-design:dd477b252493b7822aa204cb15b8e4f123a38e141920fbb57cb9bc523cbf5c79 -->
- Always record a reviewer's verdict receipt (aidlc-log.ts review --verdict) BEFORE editing the reviewed artifacts to apply fixes, even for an adversarial NOT-READY verdict you're about to act on immediately. Editing first invalidates the receipt against the now-changed bytes and forces reverting to the original content, recording the stale verdict, then reapplying every fix a second time. (learned 2026-09-18) <!-- cid:260917-meeting-card-scheduler:functional-design:21282046d550f986351ffe0e6520c2348774197b23caded899d0e0f6c7f94dd1 -->
