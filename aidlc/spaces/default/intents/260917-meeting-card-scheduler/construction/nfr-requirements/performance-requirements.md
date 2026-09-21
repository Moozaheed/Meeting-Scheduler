# Performance Requirements — Meeting Scheduler & Invitation Card Generator

Both performance targets below are client-side, single-user operations (no
concurrent-request percentile applies — see `scalability-requirements.md` for
the separate concurrent-user ceiling this stage assumes as background load
context).

## NFR1.1 — Live card preview latency

| Field | Value |
|---|---|
| Metric | Time from a form/agenda/attendee edit to the updated card preview being visible |
| Target | ≤ 1 second |
| Load condition | Single user, single browser tab; debounced per edit |
| Measurement method | Wall-clock time from the debounce trigger firing to `CardGeneration.renderPreview()`'s output committing to the DOM, measured manually in Build and Test and spot-checked via browser DevTools Performance panel |
| Source | requirements.md NFR1.1 |

**Anti-requirement guard**: "the preview updates fast" is not an acceptable restatement — the 1-second, debounce-to-render measurement above is the enforceable target.

## NFR1.2 — PDF export latency

| Field | Value |
|---|---|
| Metric | Time from clicking "Export PDF" to the browser download being triggered |
| Target | ≤ 3 seconds |
| Load condition | Single user, single browser tab; a meeting within the soft ~50-item agenda/attendee target (FR2.3, FR3.4) |
| Measurement method | Wall-clock time from click handler firing to `CardGeneration.exportPdf()`'s promise resolving, measured manually in Build and Test |
| Source | requirements.md NFR1.2 |

**Beyond the soft ~50-item target**: no hard target is set — FR2.3/FR3.4 already establish that the UI must remain usable (not hard-blocked) beyond that scale, but the 3-second export target is not guaranteed past it. This is an accepted, documented gap, not a silent omission.

## Assumptions & Open Questions

None — both targets and their measurement methods were already fixed at
requirements.md and confirmed unchanged by this stage's interview.
