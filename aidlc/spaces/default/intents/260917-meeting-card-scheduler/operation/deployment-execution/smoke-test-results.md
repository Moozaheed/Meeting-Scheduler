# Smoke Test Results — Meeting Scheduler & Invitation Card Generator

## Verdict: PASS

Ran the full value-stream happy path from `rollback-runbook.md`'s manual
smoke-test checklist against the live production URL
(https://meeting-card-scheduler.vercel.app), using a one-off Playwright
script adapted from `e2e/happy-path.spec.ts` (same steps, pointed at the
production URL instead of `localhost:3000`; deleted after this run — not
part of the committed CI suite).

## Steps Verified

| Step | Result |
|---|---|
| Open production URL; Meetings List renders (not blank) | Pass — the exact failure mode the hydration/CSP-nonce bug (`build-and-test/test-results.md`) would have caused in production had it shipped unfixed |
| Create a meeting (title, description, date/time, link, host details) | Pass |
| Add an agenda item; row renders with the entered topic | Pass |
| Add an attendee; row renders with the entered name | Pass |
| Live card preview updates to reflect the draft | Pass |
| Save meeting; returns to Meetings List showing the new entry | Pass |
| Open the saved meeting | Pass |
| Export the invitation card PDF; success confirmation appears, no console/page errors | Pass — confirms the WASM/CSP fix (`'wasm-unsafe-eval'`, `connect-src data:`) holds under Vercel's real edge middleware, not just a local build |
| "Clear my data" action | Pass |

Zero console errors or page errors were captured during the run — the
console/pageerror listener carried over from `e2e/happy-path.spec.ts`
specifically to catch a silent CSP violation, per `test-results.md`'s
Loop-Back Log, found none.

## Multi-Browser / Mobile Coverage

This production smoke run used Chromium only (one project, one pass) —
narrower than `playwright.config.ts`'s full 5-project CI matrix
(Chromium/Firefox/WebKit + mobile-chrome/mobile-safari), which already
exercises the full matrix against a local build in
`ci-pipeline/quality-gates.md`'s Gate 2. This stage's smoke check exists
to catch environment-specific issues a local build cannot (real CSP
headers from Vercel's edge middleware, real network conditions) — the
cross-browser regression surface is already covered pre-merge, not
re-covered here.

## Assumptions & Open Questions

None.
