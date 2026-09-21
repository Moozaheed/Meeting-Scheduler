# Interaction Specification — Meeting Scheduler & Invitation Card Generator

Component-level specifications using the component-spec-template format. Requirement IDs cited inline.

---

## MeetingListRow

| Field | Value |
|---|---|
| Component | MeetingListRow |
| Description | One row in the Meetings List showing a saved meeting's summary |
| Category | display |

### States

| State | Description | Trigger |
|---|---|---|
| default | Shows title, date/time, attendee count | page load |
| hover | Slight background highlight, delete icon becomes visible | mouseover |
| focus | Keyboard focus ring on the row (activates on Enter to open) | Tab key |
| loading | N/A (rows render from already-fetched local data) | — |
| deleting | Row shows a confirm/cancel inline control | delete icon clicked |

### Props / Inputs

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| meeting | object | yes | — | `{ id, title, date, startTime, attendeeCount }` (FR4.1) |
| onOpen | function | yes | — | Navigates to the edit view for this meeting |
| onDelete | function | yes | — | Removes the meeting after confirmation (FR4.2) |

### Responsive Behaviour

| Breakpoint | Behaviour |
|---|---|
| mobile (<768px) | Stacks title/date/count vertically within the row; delete icon always visible (no hover state on touch) |
| tablet (768–1024px) | Single-line row, as desktop |
| desktop (>1024px) | Single-line row: title left, date/time + count right-aligned |

### Accessibility

| Requirement | Implementation |
|---|---|
| ARIA role | `listitem` within a `list` (or a `<li>` in a native `<ul>`) |
| Keyboard interaction | Tab to focus, Enter to open, Delete key triggers the same confirm flow as the delete icon |
| Label / aria-label | Row itself: `aria-label="Open {title}, {date}"` |
| Contrast ratio | WCAG AA (4.5:1 text, 3:1 UI components) (NFR2.1) |
| Screen reader | Announces title, date, attendee count in reading order |
| Focus management | On delete-confirm, focus moves to the confirm control; after deletion, focus moves to the next row or the "New Meeting" button if the list is now empty |

---

## AgendaItemRow

| Field | Value |
|---|---|
| Component | AgendaItemRow |
| Description | One editable agenda item within the agenda builder (Q3) |
| Category | input |

### States

| State | Description | Trigger |
|---|---|---|
| default | Topic, speaker, duration fields shown with saved values | page load / after add |
| focus | Active field highlighted | click/Tab into a field |
| error | Invalid duration (e.g. non-numeric or negative) shown inline | validation failure on blur |
| removing | Row fades/collapses on remove | remove (✕) clicked |

### Props / Inputs

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| item | object | yes | — | `{ id, topic, speaker, durationMinutes, order }` (FR2.1) |
| onChange | function | yes | — | Updates the item's fields |
| onRemove | function | yes | — | Removes this item (FR2.1) |
| onMoveUp / onMoveDown | function | yes | — | Reorders without drag, for keyboard/non-mouse users (FR2.1) |

### Responsive Behaviour

| Breakpoint | Behaviour |
|---|---|
| mobile (<768px) | Fields stack vertically within the row card |
| tablet (768–1024px) | Fields in a single row, narrower widths |
| desktop (>1024px) | Fields in a single row: topic (wide), speaker, duration, reorder buttons, remove |

### Accessibility

| Requirement | Implementation |
|---|---|
| ARIA role | Native `<input>`/`<button>` elements within a labeled group |
| Keyboard interaction | Tab between fields; reorder buttons are real `<button>` elements (Enter/Space to activate) — the up/down buttons are the mandated non-drag alternative (FR2.1) |
| Label / aria-label | Each field has a visible `<label>` ("Topic", "Speaker", "Duration (minutes)") |
| Contrast ratio | WCAG AA (NFR2.1) |
| Screen reader | Reorder buttons announce "Move '{topic}' up/down, position {n} of {total}" |
| Focus management | After remove, focus moves to the next item's topic field, or the "Add agenda item" button if none remain |

---

## AttendeeRow

| Field | Value |
|---|---|
| Component | AttendeeRow |
| Description | One editable attendee entry (Q4) |
| Category | input |

### States

| State | Description | Trigger |
|---|---|---|
| default | Name, email, role fields shown | page load / after add |
| error-duplicate | Email field shows "This attendee is already on the list" | blur with a duplicate email (FR3.3) |
| error-invalid-email | Email field shows a format error | blur with a malformed email |

### Props / Inputs

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| attendee | object | yes | — | `{ id, name, email, role }` (FR3.1) |
| onChange | function | yes | — | Updates fields; validates email on blur |
| onRemove | function | yes | — | Removes this attendee (FR3.1) |

### Responsive Behaviour

| Breakpoint | Behaviour |
|---|---|
| mobile (<768px) | Fields stack vertically within the row card |
| desktop (>1024px) | Single-line row: name, email, role, remove |

### Accessibility

| Requirement | Implementation |
|---|---|
| ARIA role | Native form elements |
| Keyboard interaction | Tab between fields; remove is a real `<button>` |
| Label / aria-label | Visible labels for Name, Email, Role |
| Contrast ratio | WCAG AA (NFR2.1) |
| Screen reader | Duplicate/invalid-email errors announced via `aria-live="polite"` region tied to the field (`aria-describedby`) |
| Focus management | Error message does not steal focus; focus stays on the field until corrected |

---

## LiveCardPreview

| Field | Value |
|---|---|
| Component | LiveCardPreview |
| Description | Renders the current form state as a preview of the invitation card (FR5.4) |
| Category | display |

### States

| State | Description | Trigger |
|---|---|---|
| empty | Placeholder card: "Fill in the details to see your card" | no title/date yet |
| default | Live-updating preview reflecting current form values | any field change, debounced |
| updating | Brief visual pulse/transition on change (no loading spinner needed — this is synchronous client-side rendering) | field change |

### Props / Inputs

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| meetingDraft | object | yes | — | The in-progress form state |

### Responsive Behaviour

| Breakpoint | Behaviour |
|---|---|
| mobile (<768px) | Shown under a "Preview" tab, full width |
| desktop (>1024px) | Right panel of the split-screen layout (Q2) |

### Accessibility

| Requirement | Implementation |
|---|---|
| ARIA role | `role="img"`-equivalent container with a text summary alternative, or a fully semantic region (heading + text) so screen readers get the same information sighted users get, not just a visual card |
| Keyboard interaction | Not directly interactive; the underlying form is |
| Label / aria-label | `aria-label="Invitation card preview"` region landmark |
| Contrast ratio | WCAG AA applies to the preview's own text (NFR2.1) |
| Screen reader | Updates are NOT announced live (would be too chatty on every keystroke); the region is simply re-read if the user navigates into it |
| Focus management | N/A — non-interactive display region |

### Performance

Updates within ~1 second of a field change (NFR1.1).

---

## ExportButton

| Field | Value |
|---|---|
| Component | ExportButton |
| Description | Triggers PDF generation and download (FR5.1) |
| Category | input |

### States

| State | Description | Trigger |
|---|---|---|
| default | "Export PDF" label, enabled once required fields are valid | form loaded |
| disabled | Required fields incomplete/invalid | validation state |
| loading | Spinner + "Generating…" label, button disabled | click |
| success | Brief inline "Card downloaded" confirmation, auto-dismiss ~5s | export completes |
| error | Inline "PDF export failed — Try again" banner above the button | export throws/fails |

### Props / Inputs

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| meetingDraft | object | yes | — | The data to render into the PDF |
| onExport | function | yes | — | Triggers the card-generation engine (NFR1.2) |

### Accessibility

| Requirement | Implementation |
|---|---|
| ARIA role | Native `<button>` |
| Keyboard interaction | Enter/Space to activate |
| Label / aria-label | "Export PDF" (or "Generating card…" while loading, via `aria-live`) |
| Contrast ratio | WCAG AA (NFR2.1) |
| Screen reader | Loading/success/error states announced via an `aria-live="polite"` region near the button |
| Focus management | Focus remains on the button through the loading state; on error, focus is not force-moved, so the user can immediately retry |

---

## DeleteConfirmation

| Field | Value |
|---|---|
| Component | DeleteConfirmation |
| Description | Inline or small-dialog confirmation before removing a meeting from the list (Q6, FR4.2) |
| Category | feedback |

### States

| State | Description | Trigger |
|---|---|---|
| open | "Delete '{title}'? This can't be undone." with Confirm/Cancel | delete icon clicked on a MeetingListRow |
| confirming | Brief disabled state while the delete completes | Confirm clicked |

### Accessibility

| Requirement | Implementation |
|---|---|
| ARIA role | `role="alertdialog"` if implemented as a modal, or an inline `aria-live="assertive"` region if inline |
| Keyboard interaction | Escape cancels; Enter activates the focused button; focus is trapped within the confirmation if modal |
| Label / aria-label | Dialog labeled by its own heading text |
| Contrast ratio | WCAG AA (NFR2.1) |
| Screen reader | Announced immediately on open |
| Focus management | Focus moves to the Confirm/Cancel control on open; returns to the triggering row (or the next row, if deleted) on close |

---

## ClearMyDataAction

| Field | Value |
|---|---|
| Component | ClearMyDataAction |
| Description | Persistent Meetings List footer action that wipes all locally stored meeting data for the current browser (FR6.2, mandated `ALWAYS`) |
| Category | feedback |

### States

| State | Description | Trigger |
|---|---|---|
| default | "Clear my data" link/button + adjacent disclosure sentence, always visible | page load |
| confirming | Confirmation control shown: "Clear all your data? This deletes every meeting stored in this browser and can't be undone." with Cancel/Confirm | "Clear my data" clicked |
| clearing | Brief disabled state while storage is wiped | Confirm clicked |

### Props / Inputs

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| onClearAll | function | yes | — | Wipes IndexedDB/localStorage for this browser and returns the Meetings List to its empty state (FR6.2) |

### Responsive Behaviour

| Breakpoint | Behaviour |
|---|---|
| mobile (<768px) | Footer text and action stack vertically, full width |
| desktop (>1024px) | Disclosure text left, "Clear my data" action right, single line |

### Accessibility

| Requirement | Implementation |
|---|---|
| ARIA role | `role="alertdialog"` for the confirmation step (same pattern as `DeleteConfirmation`, but its own instance — never reuses or is confused with the per-meeting delete dialog) |
| Keyboard interaction | Tab to focus the action, Enter/Space to open confirmation; Escape cancels; Enter on Confirm activates |
| Label / aria-label | "Clear my data" is real visible text, not icon-only |
| Contrast ratio | WCAG AA (4.5:1 text, 3:1 UI components) (NFR2.1) |
| Screen reader | Confirmation dialog announced immediately on open; its higher-stakes wording ("every meeting… can't be undone") is read in full, not truncated |
| Focus management | Focus moves to the confirmation dialog on open; on cancel, returns to the "Clear my data" action; on confirm, moves to the Meetings List's empty-state "New Meeting" button once the list re-renders empty |

### PII Disclosure Text (static, NFR5.2)

The exact affirmed wording, always visible in the Meetings List footer (not dismissible, not shown only once): "Your data stays on this device only, in plain browser storage — don't use it on a shared computer for sensitive meetings." A shorter variant, "Stored only on this device," appears near the host-email field on the Create/Edit Meeting screen.

## Assumptions & Open Questions

None.
