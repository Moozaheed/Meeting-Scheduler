# Discovered Rules — Meeting Scheduler & Invitation Card Generator

> These entries are drawn only from human-stated hard constraints at the
> practices-discovery interview (`practices-discovery-questions.md`) —
> not every specialist proposal was promoted here, only the ones the human
> affirmed as non-negotiable rules for this project.

## Mandated

- ALWAYS route storage/card-engine access through the domain/state layer —
  never directly from a UI component (affirmed 2026-09-17, interview Q6).
- ALWAYS run secret scanning, dependency scanning, and code security lint
  checks before merge (affirmed 2026-09-17, interview Q7).
- ALWAYS squash-merge each Bolt branch into `main` as a single commit named
  by the Bolt slug (affirmed 2026-09-17, interview Q1).
- ALWAYS auto-deploy to the single hosted instance on every merge to
  `main`, with no manual confirmation step (affirmed 2026-09-17, interview
  Q5).
- ALWAYS provide a visible "clear my data" action that wipes
  IndexedDB/localStorage for that browser (affirmed 2026-09-17, interview
  Q8).

## Forbidden

- NEVER call IndexedDB/localStorage or the PDF/QR card-generation engine
  directly from a UI component — the domain/state layer is the only
  permitted caller (affirmed 2026-09-17, interview Q6).
- NEVER merge without secret scanning, dependency scanning, and code
  security lint checks having passed (affirmed 2026-09-17, interview Q7).
- NEVER write the invitation-card export tests to assert deep PDF-text or
  QR-payload content correctness — the human explicitly declined the
  quality reviewer's proposed deep-verification pattern; a lighter
  "didn't crash" check (non-empty PDF output, QR image renders, no
  exception) is the affirmed depth for this suite (affirmed 2026-09-17,
  interview Q4).
