**Collaborator:** aidlc-developer-agent

## Contribution

The lead draft's `## Code Style` section covers formatter/linter/naming-idiom
choices at a high level but is silent on layer boundaries, error handling,
and file/folder organization — none of the four review areas beyond
"naming" and "styling" are addressed yet. Since this is greenfield (org.md's
"defer to project-level linter config" default has no config to defer to
yet), these need to be established now rather than discovered later from
inconsistent code. The proposals below are additive to `team-practices.md`
§ Code Style and are written so the lead can fold them in directly, either
as new subsections or as an expanded Code Style section.

### Naming conventions (expanding the lead's draft)

The lead's draft states the right idioms (camelCase functions/variables,
PascalCase components/types) but doesn't cover file-naming or
domain-vocabulary consistency, both of which matter for a form-heavy,
multi-feature app like this one:

- **Files**: kebab-case for non-component files (`meeting-form.ts`,
  `qr-generator.ts`, `use-agenda-store.ts`); PascalCase filenames matching
  the exported component for component files (`MeetingForm.tsx`,
  `AgendaBuilder.tsx`) — this is the dominant Next.js/React community
  convention and keeps "find the component" trivial.
- **Hooks**: `use` prefix, camelCase (`useAttendeeList`, `useCardExport`) —
  React idiom, not a project-specific rule, but worth stating explicitly
  since this app will have several custom hooks around IndexedDB/localStorage
  persistence and PDF/QR generation state.
- **Domain vocabulary**: fix one term per concept and use it everywhere —
  code, types, UI copy, file names. The scope document already establishes
  the vocabulary (`meeting`, `agenda item`, `attendee`, `host`, `invitation
  card`); nothing in code should introduce synonyms for these (e.g. no
  `participant` alongside `attendee`, no `session` alongside `meeting`).
  This matters more than usual here because the PDF card, the form UI, and
  the persistence schema all describe the same entities and must stay in
  lockstep.
- **Types**: suffix-free domain types (`Meeting`, `AgendaItem`, `Attendee`),
  not `IMeeting`/`MeetingType` — idiomatic TypeScript, and avoids a
  Hungarian-notation habit that doesn't fit this codebase's other
  conventions.
- **Constants**: `SCREAMING_SNAKE_CASE` for true constants (card dimensions,
  storage keys, default timezone), colocated with the module that owns them
  rather than a single catch-all `constants.ts` — avoids that file becoming
  an unmaintained dumping ground as the four capability areas grow.

### Layer boundaries

This app has no backend service, but it still has real layering that needs
naming and enforcement, or the PDF/QR generation logic and the persistence
logic will end up tangled inside form components — the single biggest
technical-debt risk for a client-only app like this:

1. **UI layer** (`app/` routes + `components/`) — React components, forms,
   presentation. Reads/writes domain state via hooks only; never calls
   IndexedDB/localStorage or the PDF/QR library directly.
2. **Domain/state layer** (`lib/store/` or equivalent, e.g. Zustand/Context
   + reducer) — meeting, agenda, attendee state and the operations on them
   (add/edit/reorder/remove). Owns validation of domain invariants (e.g. an
   agenda item's duration must be positive, an attendee needs a name).
3. **Persistence layer** (`lib/persistence/`) — the IndexedDB/localStorage
   adapter. Exposes a narrow save/load/clear interface; the domain layer
   depends on this interface, never the other way around, and UI components
   never import it directly.
4. **Card-generation engine** (`lib/card/`) — PDF layout + QR generation,
   pure functions from validated domain data to a PDF/QR output. Takes
   already-validated `Meeting`/`AgendaItem[]`/`Attendee[]` as input; it does
   not read from the store or the DOM itself, which keeps it independently
   testable and reusable for the live preview vs. the actual export.

Proposed rule: **UI never talks to persistence or the card engine directly
— always through the domain/state layer.** This is the one layering rule
worth stating explicitly in `## Forbidden` / `## Mandated` once affirmed,
since it's the boundary most likely to erode under form-heavy UI pressure
("just call localStorage from the component, it's faster").

### Error handling

Construction-phase guardrails already mandate error handling at integration
boundaries and forbid silent failures; for this project the integration
boundaries are all client-side, which changes what "integration boundary"
means in practice:

- **Persistence boundary**: IndexedDB/localStorage calls must handle quota
  exceeded, storage disabled (private browsing), and corrupted/unparseable
  stored data — all three are realistic for a browser-only persistence
  layer and none of them should crash the app. Recoverable: fall back to
  in-memory state for the session and surface a non-blocking notice.
  Fatal-for-that-operation-only: a single failed save should not lose the
  in-progress form data held in component state.
- **Card-generation boundary**: PDF/QR generation was already flagged in
  the lead's draft as the primary technical risk (cross-browser
  reliability). Generation failures must be caught and surfaced to the user
  as an actionable error (e.g. "PDF export failed — try again" with a retry
  action), never a silent no-op button click. Because this runs in the
  browser main thread (or a worker, if adopted), a hung/slow generation
  should not appear indistinguishable from a crash — a loading/progress
  state during export is a UX-correctness requirement, not just polish.
- **Form validation boundary**: all four capability areas are form-heavy;
  validation errors are expected, frequent, and must be field-level and
  inline (not a single top-of-form banner), consistent with the "testable,
  verifiable" requirements quality bar from the inception phase guardrails.
- **Error boundaries**: at least one React error boundary around the card
  preview/export flow, since a rendering exception in a third-party PDF/QR
  library should not take down the whole scheduling UI the host is mid-way
  through filling in.

### File organization

Proposed structure for the Next.js App Router layout, grouped by feature
rather than by technical type, since the four capability areas are the
natural seams and each maps to a bounded piece of domain state:

```
app/
  page.tsx                  # entry / meeting creation flow
  layout.tsx
components/
  meeting/                  # scheduling form fields
  agenda/                   # agenda builder (add/edit/reorder/remove)
  attendees/                # attendee list management
  card/                     # invitation-card preview UI
  ui/                       # shared/generic UI primitives (buttons, inputs)
lib/
  store/                    # domain/state layer (§ Layer boundaries above)
  persistence/              # IndexedDB/localStorage adapter
  card/                     # PDF layout + QR generation engine
  validation/               # shared field-level validators
types/
  domain.ts                 # Meeting, AgendaItem, Attendee, Host
```

Co-locate each feature's component tests next to the component
(`MeetingForm.tsx` + `MeetingForm.test.tsx`) rather than a parallel `__tests__`
tree — keeps the test-after ordering the lead proposed (implement a layer,
then test that layer) easy to verify by directory inspection during review.

### Code style — specifics to lock, not just defer

The lead's draft correctly defers to project-level Prettier/ESLint config,
but since no config exists yet, these specific choices need to be made
once (not re-litigated file-by-file) and then encoded in `.eslintrc`/
`.prettierrc`:

- **TypeScript strict mode on** (`strict: true` in `tsconfig.json`) —
  worth stating explicitly for a greenfield project since it's much cheaper
  to start strict than to retrofit, and the domain/persistence/card-engine
  boundary above depends on trustworthy types at each layer seam.
- **`eslint-config-next`** (Next.js's own ESLint config) as the base, with
  `eslint-plugin-react-hooks` enabled — catches hook-dependency bugs that
  are especially easy to introduce in the custom persistence/card-export
  hooks described above.
- **Import ordering**: external packages, then `lib/`/`types/` absolute
  imports, then relative imports — enforced via
  `eslint-plugin-import`'s `order` rule rather than left to convention, since
  ESLint can fix this automatically on save/commit and it removes a class of
  PR nitpick.
- **No default exports** for non-page/layout files (named exports only) —
  keeps refactors and IDE auto-import reliable across the feature folders
  above; Next.js route files (`page.tsx`, `layout.tsx`) are the one
  exception since the framework requires default exports there.

## Positions

AGREE: Trunk-based development, squash-merge Bolts, and the "no long-lived
release branches" stance fit a solo-builder single-repo project cleanly —
no objection.

AGREE: Testing posture (test-after, layer-by-layer ordering, 80% coverage
floor, extra scrutiny on the PDF/QR export path and the persistence layer)
is the right shape for this app's actual risk profile.

AGREE: Deploy-on-merge to the single hosted instance, without a separate
production-approval gate, is reasonable given there is no staging/production
split in scope and no rollback/observability tooling to gate against.

OBJECT: The draft's `## Code Style` section stops at formatter/linter/naming
and doesn't address layer boundaries, error handling, or file organization
at all — for a client-side app whose entire risk surface is in how cleanly
UI, domain state, persistence, and the PDF/QR engine stay separated, these
need to be affirmed alongside Code Style rather than left implicit; see the
Contribution above for concrete proposals to fold in.
