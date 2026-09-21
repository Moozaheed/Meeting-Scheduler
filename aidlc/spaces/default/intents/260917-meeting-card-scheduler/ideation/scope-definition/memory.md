<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->
- 2026-09-17T12:22:17Z — repeated the intent-capture batching deviation despite persisting a project.md correction about it: logged the mode-choice decision correctly right before presenting it, but batched the substantive Q1-Q7 answers across two AskUserQuestion calls before attempting to log their decisions, so those `QUESTION_ANSWERED` audit rows are missing (the questions file itself has every answer recorded correctly). Next run: for stages with multiple structured-question batches, call `aidlc-log.ts decision` immediately before each individual AskUserQuestion tool call, not once per stage.
- 2026-09-17T12:22:17Z — mid-stage, the user's answer to an unrelated question (the learnings free-text note at the end of Intent Capture) contained a full new-work request (a Git automation script + CI/CD pipelines). Recognized it as unrelated new work rather than persisting it as a learning, offered a second intent per the new-work-routing protocol, confirmed the scope (`infra`) with the user before creating it, created the intent (`260917-git-cicd-automation`), then switched the active-intent cursor back to `meeting-card-scheduler` to resume this stage in the same session.

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
