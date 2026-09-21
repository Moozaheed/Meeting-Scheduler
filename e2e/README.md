# E2E Suite

Playwright E2E specs (the full value-stream happy path across the desktop +
mobile browser matrix) are exercised in the `build-and-test` / `ci-pipeline`
stages (post-merge Gate 2), not in Code Generation — see
`unit-test-instructions.md`. `playwright.config.ts` at the repo root is
bootstrapped here so that stage has a ready-to-use runner configuration.
