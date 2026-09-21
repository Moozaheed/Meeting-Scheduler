# Evidence — Meeting Scheduler & Invitation Card Generator

## Sources

This is a **greenfield project**: there is no existing codebase, no prior
git history, and no CI/deployment configuration in this repository to
inspect for actual practices. The application-code directory tree does not
exist yet — nothing has been generated beyond this workflow's own
`aidlc/` and `.claude/` scaffolding. Reverse-engineering or scanning for
in-repo evidence was therefore not possible and was not attempted.

In the absence of any codebase evidence, the five org-level default
sections were used as the **suggested-default source** for the
`team-practices.md` draft, per this stage's guidance to treat them as
proposals rather than established team facts. The sections consulted, from
`aidlc/spaces/default/memory/org.md`:

1. `## Way of Working` — trunk-based development, short-lived feature
   branches, `main` as worktree base/merge target, squash-merge Bolts.
2. `## Walking Skeleton` — skeleton-Bolt-first policy, gated on the active
   scope file's `skeleton:` flag, plus the post-Bolt-1 ladder prompt.
3. `## Testing Posture` — default Methodology/Ordering fields, scope-based
   coverage floors, and the rule that Build and Test may not weaken defined
   floors.
4. `## Deployment` — deploy-on-merge to staging with a separate manual
   production-approval gate.
5. `## Code Style` — deferral to project-level formatter/linter
   configuration, with agents checking the linter config before suggesting
   style rules of their own.

## Additional context consulted

Beyond `org.md`, the following upstream artifacts from this intent's own
Ideation phase were read to adapt the org defaults to this specific
project's shape (single self-contained Next.js repo, no backend service,
client-side-only PDF/QR generation, per-browser data, centrally hosted, no
authentication):

- `../../ideation/approval-handoff/initiative-brief.md` — confirms the
  client-side PDF/QR reliability risk, the no-authentication decision, and
  that deployment-pipeline/deployment-execution stages were added
  specifically to support central hosting.
- `../../ideation/scope-definition/scope-document.md` — confirms the single
  hosted instance (no staging/production split), per-browser-only data (no
  shared database), and the four in-scope capability areas.
- `aidlc-state.md` (this intent's record) — confirms the active scope name
  (`meeting-card-scheduler`, a custom composed scope rather than one of the
  org default's named scope floors), Depth = Standard, and Test Strategy =
  Standard.
- `.claude/scopes/aidlc-meeting-card-scheduler.md` — confirms
  `skeleton: off` for this workflow, which is why `## Walking Skeleton` in
  `team-practices.md` is marked not applicable.

No market research, user feedback, or external documentation was consulted
— none is relevant to internal engineering-practice drafting, and this
stage's own guardrails (inception phase rules) call for grounding
architecture/process claims in project evidence rather than speculation.

## Assumptions & Open Questions

None.

## Interview Resolution

The nine open points flagged "to confirm at interview" in the draft were
resolved by the human at the practices-discovery interview
(`practices-discovery-questions.md`). Three independent specialist
contributions (`contributions/aidlc-quality-agent.md`,
`contributions/aidlc-developer-agent.md`,
`contributions/aidlc-devsecops-agent.md`) were folded into the interview
questions before the human answered, so every specialist recommendation
reached the human for confirmation, adjustment, or rejection rather than
being silently adopted or silently dropped. Summary, by question:

- **Q1 (branching/squash-merge)**: confirmed as-is, no change from the
  org default.
- **Q2 (walking skeleton)**: confirmed skip, consistent with the active
  scope file's `skeleton: off`.
- **Q3 (testing style/toolset)**: confirmed test-after methodology and the
  quality reviewer's proposed toolset (Vitest + React Testing Library +
  Playwright across Chromium/Firefox/WebKit).
- **Q4 (coverage depth for card export) — a specialist recommendation the
  human explicitly declined**: the quality reviewer proposed a deep
  verification pattern for the card-generation path — parsing the
  generated PDF's extracted text and decoding the rendered QR payload to
  assert the exact expected content, plus layout/dimension snapshot
  checks (see `contributions/aidlc-quality-agent.md` §2). The human chose
  option B instead: keep the 80% overall coverage floor, but use only a
  lighter "didn't crash" check for card export — no PDF-text extraction,
  no QR-payload decoding assertions. This is recorded as a `NEVER` entry
  in `discovered-rules.md` and reflected in `team-practices.md` §
  Testing Posture, so the declined recommendation stays traceable rather
  than silently disappearing.
- **Q5 (deploy on merge)**: confirmed auto-deploy on every merge, no
  manual step, consistent with the draft's proposal and both the developer
  and devsecops reviewers' agreement.
- **Q6 (layering — UI never bypasses domain/state)**: confirmed and
  enforced, adopting the developer reviewer's proposed layer boundaries
  (UI → domain/state → persistence / card-engine) in full.
- **Q7 (security tooling — secret scanning, dependency scanning, code
  security lint checks)**: confirmed all three, adopting the devsecops
  reviewer's proposed tooling (Gitleaks, Dependabot/`npm audit`,
  `eslint-plugin-security`/`react/no-danger`/CodeQL) and CI gate sequence
  (secret scan → SAST → dependency audit) in full.
- **Q8 ("clear my data" button)**: confirmed, adopting the devsecops
  reviewer's proposed PII-specific product control.
- **Q9 (accessibility + mobile browser coverage)**: confirmed both —
  non-blocking automated accessibility checks and mobile browser coverage
  in the Playwright E2E matrix, extending beyond the desktop-only /
  accessibility-only option the quality reviewer had flagged as an open
  gap.

No specialist recommendation was adopted without appearing in the
interview, and no human answer was overridden in favor of a specialist's
recommendation — per this stage's integration rule, the human's answer is
final in every case, including the one case (Q4) where it declined a
specialist's proposal.
