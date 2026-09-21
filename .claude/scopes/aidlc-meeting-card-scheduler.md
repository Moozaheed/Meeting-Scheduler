---
name: meeting-card-scheduler
depth: Standard
keywords: []
description: Composed workflow for the meeting-card-scheduler greenfield build
skeleton: off
change_control: relaxed
---

# meeting-card-scheduler scope

A composed, task-specific grid for this greenfield project: a focused
inception-and-construction arc without the discovery ceremony that only pays
off on a larger or higher-ambiguity initiative, and without an operation
phase that this build does not yet need. 15 of 33 stages EXECUTE.

Change Control defaults to relaxed: an input that changes after approval is
recorded and announced in one line, and the run continues — this is a
single-repo, solo-approved build where reopening every changed-file approval
would only slow delivery down, not a regulated or high-blast-radius change.

## Why these stages, why skip those

**Initialization** (workspace-scaffold, workspace-detection, state-init)
always runs — it is the bootstrap, not a scored decision.

**Ideation** keeps only what a well-described, internal-tool-shaped intent
still needs: intent-capture (pins the ask and its acceptance criteria),
scope-definition (the work has more than one axis — cards, scheduling,
persistence), and approval-handoff (the ideation→inception gate). It skips
market-research (an internal scheduling tool has no market to research),
feasibility (the approach — a card-based scheduler — is a known pattern with
no viability question to prove before committing to design), team-formation
(single-team, no cross-team coordination), and rough-mockups (folded into
refined-mockups — one focused UX pass suffices for a greenfield surface this
small; there is no need to compare divergent UX directions first).

**Inception** carries the load-bearing design work: practices-discovery
(greenfield — a new toolchain and testing posture need choosing, unlike a
brownfield change that could infer conventions from existing code),
requirements-analysis (the functional decomposition, constraints, and
out-of-scope boundary that domain-design and functional-design consume, and
which intent-capture alone does not produce), refined-mockups (this is a
user-facing card UI — the primary design surface), and domain-design (the
component/building-block shape needs deciding). It skips user-stories
(personas are simple enough that requirements-analysis's acceptance criteria
plus refined-mockups' UX narrative already cover them), units-generation,
contract-design, and delivery-planning (the work decomposes into ≤3 units
with no non-trivial dependency graph or external contract to pin — the plan
is expressed inline in domain-design rather than needing its own stages).

**Construction** runs the spine: functional-design (the business logic per
unit), nfr-requirements (the NFRs that matter — responsiveness, data
integrity — get a measurable target), code-generation (the implementation),
build-and-test (verification), and ci-pipeline (this greenfield repo has no
CI yet, so it must be set up before the suite can gate merges). It skips
nfr-design (the pinned NFR targets are single measurable thresholds closed
by the code-generation → build-and-test loop, not a multi-NFR design
problem) and infrastructure-design (no new infrastructure surface this
build introduces).

**Operation** is skipped wholesale: this build's "done" lives in the repo,
not in a deployed environment yet — no deployment pipeline, environment
provisioning, deployment execution, observability, incident-response,
performance-validation, or feedback-optimization is in scope for this pass.

## Membership

Keyword triggers: none — composed scopes are not inferable unless a human
explicitly grants keywords at the gate. Reachable via `--scope
meeting-card-scheduler`. EXECUTE: workspace-scaffold, workspace-detection,
state-init, intent-capture, scope-definition, approval-handoff,
practices-discovery, requirements-analysis, refined-mockups, domain-design,
functional-design, nfr-requirements, code-generation, build-and-test,
ci-pipeline (15 stages). SKIP: market-research, feasibility, team-formation,
rough-mockups, reverse-engineering, user-stories, units-generation,
contract-design, delivery-planning, nfr-design, infrastructure-design,
deployment-pipeline, environment-provisioning, deployment-execution,
observability-setup, incident-response, performance-validation,
feedback-optimization (18 stages).
