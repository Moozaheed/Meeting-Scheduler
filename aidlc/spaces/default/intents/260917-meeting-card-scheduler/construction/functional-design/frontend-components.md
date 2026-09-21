# Frontend Components — Meeting Scheduler & Invitation Card Generator

This document specifies the React component hierarchy, prop/state shapes, and data-flow wiring for the `Presentation` component (per `domain-design/components.md`). Visual design, per-component states, and accessibility detail live in `refined-mockups/interaction-spec.md`; this document focuses on hierarchy, typing, and how components call into `Scheduling` and `CardGeneration`.

## Component Hierarchy

```
App
├── MeetingsListPage                    (route: /)
│   ├── MeetingsListHeader              ("New Meeting" button)
│   ├── MeetingListRow[]                (one per stored Meeting)
│   │   └── DeleteConfirmation          (conditional, on delete click)
│   └── ClearMyDataAction               (persistent footer; owns its own default/confirming/clearing states internally, per interaction-spec.md)
└── MeetingFormPage                     (route: /meeting/new, /meeting/:id/edit)
    ├── MeetingDetailsForm              (title, date, times, timezone, link/location, host info)
    ├── AgendaBuilder
    │   └── AgendaItemRow[]
    ├── AttendeeManager
    │   └── AttendeeRow[]
    ├── LiveCardPreview                 (split-screen desktop / tab mobile, per Q2 refined-mockups)
    └── ExportButton
```

## State Ownership and Data Flow

Per the affirmed layering mandate (Q6, domain-design ADR-001/ADR-004): Presentation components never call `PersistenceAdapter` or the card-rendering libraries directly. All reads/writes go through hooks that wrap `Scheduling`; `CardGeneration` is called with plain, already-validated data only.

```
Scheduling (domain/state layer, exposed via hooks)
  useMeetingsList()          -> Meeting[] (sorted per BR4.1)
  useMeeting(id?)            -> { meeting, agendaItems, attendees, save, delete, renderPreview, exportCard }
  useAgendaItems(meetingId)  -> { items, add, edit, remove, reorder }  (BR2.1, BR2.2)
  useAttendees(meetingId)    -> { attendees, add, edit, remove }       (BR3.1, BR3.2, BR3.3)
  useClearAllData()          -> { clearAll }                          (BR6.1)

  // Scheduling is the sole caller of CardGeneration, per the affirmed
  // layering mandate — Presentation never imports CardGeneration directly.
  // renderPreview/exportCard on useMeeting() delegate internally:
  renderPreview(draftMeetingData) -> CardGeneration.renderPreview(draftMeetingData)
  exportCard(meetingData)         -> CardGeneration.exportPdf(meetingData)

CardGeneration (called only by Scheduling, with plain data and no Scheduling awareness of its own — ADR-004)
  renderPreview(draftMeetingData) -> preview render output
  exportPdf(meetingData)          -> Promise<Blob> | throws
```

### `MeetingsListPage`

| Prop/State | Type | Source |
|---|---|---|
| `meetings` | `Meeting[]` | `useMeetingsList()` |
| `isLoading` | `boolean` | hook's loading state while reading storage |
| `loadError` | `string \| null` | hook's error state (NFR4.1 degradation) |

### `MeetingListRow`

| Prop | Type | Notes |
|---|---|---|
| `meeting` | `{ id, title, date, startTime, attendeeCount }` | attendeeCount derived, not stored (matches `interaction-spec.md` § MeetingListRow) |
| `onOpen` | `(id: string) => void` | navigates to edit route |
| `onDelete` | `(id: string) => void` | calls `useMeeting(id).delete` after confirmation |

### `MeetingFormPage`

| Prop/State | Type | Notes |
|---|---|---|
| `meetingId` | `string \| undefined` | route param; absent = create mode |
| `draft` | `MeetingDraft` (see below) | local form state, initialized from `useMeeting(meetingId)` when editing |
| `validationErrors` | `Record<string, string>` | field-level errors from BR1.1–BR1.4, recalculated on blur/save |

`MeetingDraft` shape (local, pre-save form state — not persisted until valid):
```
{
  title: string
  description: string
  date: string
  startTime: string
  endTime: string
  timezone: string
  meetingLink: string
  location: string
  hostName: string
  hostRoleOrg: string
  hostEmail: string
  agendaItems: AgendaItemDraft[]
  attendees: AttendeeDraft[]
}
```

### `AgendaBuilder` / `AgendaItemRow`

| Prop | Type | Notes |
|---|---|---|
| `items` | `AgendaItemDraft[]` | from `draft.agendaItems`, ordered by `order` |
| `onAdd` / `onEdit` / `onRemove` | functions | `onAdd`/`onEdit` apply BR2.3's non-empty-topic check; mutate local draft state, persisted only on form save |
| `onMoveUp` / `onMoveDown` | `(id: string) => void` | applies BR2.2's reorder recalculation to local draft state |

**Scale handling (FR2.3):** at the affirmed soft target of up to ~50 agenda items, `AgendaItemRow` renders as a plain (non-virtualized) list — no pagination or windowing is needed at that scale, and adding it now would be premature optimization. The `items` prop's shape is unaffected either way, so virtualization (e.g. `react-window`) can be introduced later behind the same prop interface if the soft target is ever raised materially.

### `AttendeeManager` / `AttendeeRow`

| Prop | Type | Notes |
|---|---|---|
| `attendees` | `AttendeeDraft[]` | from `draft.attendees` |
| `onAdd` / `onEdit` / `onRemove` | functions | `onAdd`/`onEdit` apply BR3.4's non-empty-name check and BR3.2/BR3.3 validation against local draft state before committing |

**Scale handling (FR3.4):** same as `AgendaItemRow` above — a plain list is sufficient at the ~50-attendee soft target, with the `attendees` prop interface left unchanged for a future virtualization upgrade if ever needed.

### `LiveCardPreview`

| Prop | Type | Notes |
|---|---|---|
| `draftMeetingData` | plain object (title, agendaItems, attendees, host info, resolved QR payload per BR5.1) | passed to `Scheduling`'s `renderPreview()` (which delegates to `CardGeneration.renderPreview()` per the layering mandate — see State Ownership and Data Flow above); debounced ~300ms, refined at nfr-design to leave rendering-time headroom inside the 1s NFR1.1 budget |

### `ExportButton`

| Prop | Type | Notes |
|---|---|---|
| `meeting` | validated `Meeting` (post-save, not the draft) | only enabled once the form is valid and saved |
| `onExport` | `() => Promise<void>` | calls `Scheduling`'s `exportCard()` (which delegates to `CardGeneration.exportPdf()` per the layering mandate — never a direct call from this component); manages loading/success/error states per `interaction-spec.md` § ExportButton |

### `ClearMyDataAction`

| Prop | Type | Notes |
|---|---|---|
| `onClearAll` | `() => void` | calls `useClearAllData().clearAll()` (BR6.1); matches the single-component, single-prop shape already specified in `interaction-spec.md` § ClearMyDataAction — its confirmation step is internal state, not a separate child component |

## Interaction Flows

Full state-by-state interaction behavior (loading/empty/error/success/partial), keyboard/ARIA requirements, and responsive breakpoints for every component above are specified in `refined-mockups/interaction-spec.md` — this document does not duplicate them, only the data/prop wiring that connects those UI states to `Scheduling` and `CardGeneration`.

## Form Validation Rules

All field-level validation is BR1.1–BR1.4 (Meeting), BR2.1–BR2.2 (AgendaItem), and BR3.1–BR3.3 (Attendee) from `rules.md`. Presentation components call validation through the `Scheduling` hooks above (never re-implementing rule logic locally) so the domain/state layer remains the single source of truth for what's valid, per the affirmed layering mandate.

## Assumptions & Open Questions

None.
