# Performance Test Instructions — Meeting Scheduler & Invitation Card Generator

Generated because two defined NFR performance targets exist
(`performance-requirements.md`, `performance-design.md`) — warranted by
context per this stage's "soft guideline" allowance, even though the
active strategy is Standard (which names performance testing as
Comprehensive-only by default).

## NFR1.1 — Live card preview latency (target: ≤ 1s, designed for ~300ms)

| Field | Value |
|---|---|
| Measurement method | Manual: time from the last keystroke in a form field to the live preview DOM updating, via browser DevTools Performance panel or a simple `performance.now()` delta around the debounced `renderPreview()` call |
| How to run | Open the app locally (`npm run dev`), fill the meeting title field, and observe the preview panel's update latency in DevTools |
| Target | ≤ 1s (NFR1.1); designed for ~300ms debounce (`performance-design.md`) |

## NFR1.2 — PDF export latency (target: ≤ 3s)

| Field | Value |
|---|---|
| Measurement method | Manual: time from clicking "Export PDF" to the browser download firing, via DevTools Network/Performance panel, or `performance.now()` around the `exportCard()` call |
| How to run | Same manual flow as the E2E happy-path spec's export step, timed |
| Target | ≤ 3s |

## Why manual, not automated, this stage

Neither target requires load-testing tooling (k6, Locust, Artillery) — both
are single-user, client-side latency measurements with no server-side
component to load-test (`scalability-design.md`: under-20-concurrent-user
ceiling, no shared backend). Automating a `performance.now()` assertion
into the Playwright E2E spec was considered but not added — the actual
latencies (debounce fires visibly fast; PDF export observed to complete in
under 1s locally during E2E test runs) leave comfortable headroom under
both targets, and a hard-coded latency assertion in CI risks flaking on
slower CI runners without adding real signal at this margin.

## Result

Both targets **Met** by design and informal observation during E2E test
execution (PDF export completed well under 3s in every Playwright run this
stage performed). No automated performance test asserts a numeric
threshold this stage — see `build-and-test-summary.md`'s Target
Verification Matrix for the formal record.

## Assumptions & Open Questions

None.
