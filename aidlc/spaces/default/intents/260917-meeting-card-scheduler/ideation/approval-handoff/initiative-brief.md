# Initiative Brief — Meeting Scheduler & Invitation Card Generator

## Intent & Problem Statement

Meeting planning today is scattered across manual, ad-hoc tools; this project builds one structured, self-contained web app combining meeting scheduling, an agenda builder, attendee management, and a matching invitation-card/PDF generator with a QR code, replacing that manual process with a single tool (see `../intent-capture/intent-statement.md`).

## Market Validation Summary

Not applicable — market research is out of scope for this initiative (internal tool with an already-specified feature set, not a product being validated against an unknown market).

## Feasibility & Risk Highlights

A formal feasibility stage was not run (out of scope for this custom workflow), but the approach relies on well-documented, standard client-side patterns (Next.js, a client-side PDF library, a QR library). The primary flagged risk is **client-side PDF + QR generation working reliably across browsers** — this is confirmed by the user at Approval & Handoff as the main technical risk worth extra attention during design and build (`approval-handoff-questions.md` Q2). A secondary, accepted risk is that the hosted instance has **no authentication** — reachable via an unlisted URL only, which the user confirmed is acceptable for this release (Scope Definition Q7).

## Scope Boundary

All four capability areas ship together (meeting scheduling, agenda builder, attendee management, invitation-card PDF engine), hosted as one centrally-reachable instance with per-browser-only data (no shared database). Full detail: `../scope-definition/scope-document.md` and `../scope-definition/intent-backlog.md`.

## Concept Visuals

Not applicable — rough mockups are out of scope for this custom workflow; visual design work happens later, during Refined Mockups (Inception 2.5), which remains in scope.

## Team Plan

Solo initiative — the user is the sole builder and decision-maker (`../intent-capture/stakeholder-map.md`). No formal team formation or mob composition applies.

## Scope Adjustment Since Composition

The originally composed workflow (15 of 33 stages) skipped the entire Operation phase. Getting the app actually hosted required adding deployment-pipeline and deployment-execution, which in turn required their upstream dependencies (nfr-design, infrastructure-design, environment-provisioning) per this framework's dependency rules. The workflow now runs **20 of 33 stages**. The user reviewed this expansion and confirmed they're comfortable with the added design process ahead of code generation (`approval-handoff-questions.md` Q3).

## Go/No-Go Recommendation

**Go.** The user confirmed continued agreement with the intent and scope, accepted the flagged risks, confirmed they're ready to commit time to build this now, and explicitly chose to proceed to Inception (`approval-handoff-questions.md` Q1, Q4, Q5).
