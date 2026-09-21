# Unit Test Instructions — Meeting Scheduler & Invitation Card Generator

Zero-Unit stage-level instructions (this project has no per-Unit split —
one implementation pass covers the whole app).

## Test Framework Setup

- **Unit/component**: Vitest (jsdom environment) + React Testing Library + `@testing-library/jest-dom` + `@testing-library/user-event`.
- **Persistence mocking**: `fake-indexeddb` (registered globally in `vitest.setup.ts`) so `idb-keyval`-backed `PersistenceAdapter` tests run without a real browser.
- **E2E**: Playwright, configured for Chromium/Firefox/WebKit plus mobile viewports (`team.md` NFR3.1). E2E is exercised in Build and Test, not in this stage — this stage's scope is unit/component only, per Standard strategy's "unit tests plus integration tests for key boundaries."
- **Coverage**: Vitest's built-in v8 coverage provider, threshold `lines: 80` (CI-blocking, per `team.md`).

## How to Run THIS STAGE's Tests

Exact, scoped commands — never the bare `npm test` (Build and Test runs
every stage's commands, so an unscoped command would rerun the whole suite
repeatedly):

```bash
npx vitest run --coverage --coverage.thresholds.lines=80
```

Scoped to an individual layer during development (still exact paths, not a
bare project-wide filter):

```bash
npx vitest run lib/persistence/persistence-adapter.test.ts
npx vitest run lib/store/scheduling-store.test.ts
npx vitest run components/meeting/MeetingDetailsForm.test.tsx components/agenda/AgendaBuilder.test.tsx components/attendees/AttendeeManager.test.tsx components/card/LiveCardPreview.test.tsx components/card/ExportButton.test.tsx components/meeting/MeetingsListPage.test.tsx
```

## Expected Coverage Targets

- **Line coverage**: ≥ 80% overall (CI-blocking, `team.md`).
- **Per-component target (Standard strategy)**: 5–8 tests per component, covering key behavior — not an exhaustive combinatorial suite.

## Component Test Plan

| Component/module | Test count target | Key cases |
|---|---|---|
| `persistence-adapter.test.ts` | 6–8 | first-visit/no-data, save/load/clear round-trip, list, quota-exceeded, corrupted stored data, private-browsing restriction |
| `scheduling-store.test.ts` | 8 | BR1.1–BR1.4 field validation (save-time gate), BR2.1–BR2.3 agenda rules, BR3.1–BR3.4 attendee rules, BR4.1 sort order, BR4.2 cascade delete, BR6.1 clear-all, `exportCard`/`renderPreview` delegation, persistence-failure in-memory fallback (NFR4.1/4.2) |
| `MeetingDetailsForm.test.tsx` | 6 | required-field inline errors (BR1.1), link-or-location requirement (BR1.2), URL format blur validation (BR1.3), end-after-start blur validation (BR1.4), save with valid data, edit pre-fill |
| `AgendaBuilder.test.tsx` | 6 | add with topic, add blocked on empty topic (BR2.3), edit, remove, reorder recalculates order (BR2.2), zero-items allowed (BR2.1) |
| `AttendeeManager.test.tsx` | 6 | add with name+email, add blocked on empty name (BR3.4), duplicate-email blocked (BR3.2), malformed-email blocked on blur (BR3.3), remove, zero-attendees allowed (BR3.1) |
| `LiveCardPreview.test.tsx` + `ExportButton.test.tsx` | 6 | preview updates on debounce, QR payload resolution (BR5.1: link vs. deep-link fallback), export success (non-empty PDF, no thrown exception — lighter depth per `project.md` Forbidden), export failure shows retry action, loading state during export, error boundary catches a rendering exception |
| `MeetingsListPage.test.tsx` | 6 | empty state, populated list sorted newest-first (BR4.1), delete with confirmation cascades (BR4.2), open navigates to edit, clear-my-data confirmation wipes storage (BR6.1), persistence-load-error non-blocking notice (NFR4.1) |

Total: approximately 38–46 tests, within the Standard strategy's 5–8-per-component band across 7 components/modules.

## Mocking / Stubbing Guidance

- `PersistenceAdapter` tests mock nothing beyond `fake-indexeddb` itself — they exercise the real `idb-keyval` calls against the fake database.
- `scheduling-store.test.ts` mocks `PersistenceAdapter` and `CardGeneration` (both already have narrow, typed interfaces per `frontend-components.md`) to isolate business-logic assertions from their real implementations.
- Component tests mock `Scheduling`'s hooks (`useMeeting`, `useAgendaItems`, etc.) via RTL's standard render-with-providers pattern, or exercise the real hooks against a mocked `PersistenceAdapter`/`CardGeneration` for closer-to-integration coverage where the test plan calls for it (e.g. `MeetingsListPage`'s populated-list case).
- `qrcode.react` and `@react-pdf/renderer` are exercised for real in `LiveCardPreview`/`ExportButton` tests (not mocked) — the "didn't crash" depth requires the real render path to actually run, per `project.md` Forbidden.

## Test Data Management

- Factory functions in `lib/store/test-fixtures.ts` (not a separate package — small enough to colocate) build a default valid `Meeting`/`AgendaItem`/`Attendee` with all-required-fields-present, overridable per test via spread syntax.
- No shared mutable fixture state between tests — `fake-indexeddb`'s database is reset (`indexedDB = new IDBFactory()` or equivalent) in `beforeEach`.

## Assumptions & Open Questions

None.
