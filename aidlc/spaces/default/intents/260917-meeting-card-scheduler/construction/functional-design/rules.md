# Business Rules — Meeting Scheduler & Invitation Card Generator

```yaml
rules:
  - id: BR1.1
    statement: A Meeting must have a title, date, start time, end time, timezone, host name, and host email before it can be saved.
    category: validation
    applies_to: Meeting
    trigger: on save (create or edit)
    logic: >
      IF title is empty OR date is empty OR startTime is empty OR endTime is empty
      OR timezone is empty OR hostName is empty OR hostEmail is empty
      THEN block save and show a field-level inline error for each missing field.
    violation_behaviour: Save is blocked; the specific missing field(s) show an inline error (per the affirmed form-validation practice).
    source: FR1.1

  - id: BR1.2
    statement: A Meeting must have at least one of meetingLink or location.
    category: validation
    applies_to: Meeting
    trigger: on save (create or edit)
    logic: >
      IF meetingLink is empty AND location is empty
      THEN block save and show an inline error on both fields explaining at least one is required.
    violation_behaviour: Save is blocked with an inline error.
    source: FR1.1

  - id: BR1.3
    statement: When a meetingLink is provided, it must be a well-formed URL.
    category: validation
    applies_to: Meeting.meetingLink
    trigger: on blur of the meetingLink field
    logic: >
      IF meetingLink is non-empty AND meetingLink does not match a well-formed URL pattern
      THEN show inline error "Enter a valid URL" and block save until corrected.
    violation_behaviour: Inline field error; save blocked while invalid.
    source: FR1.2

  - id: BR1.4
    statement: endTime must be chronologically after startTime on the same date.
    category: validation
    applies_to: Meeting
    trigger: on blur of the endTime field, or on save
    logic: >
      IF endTime <= startTime (same date, same timezone)
      THEN show inline error "End time must be after start time" and block save.
    violation_behaviour: Inline field error; save blocked.
    source: FR1.1 (functional-design-questions.md Q5, Q6)

  - id: BR2.3
    statement: An AgendaItem must have a non-empty topic before it can be added or saved.
    category: validation
    applies_to: AgendaItem.topic
    trigger: on add or edit of an agenda item
    logic: >
      IF topic is empty
      THEN block the add/edit and show inline error "Topic is required".
    violation_behaviour: Add/edit blocked; inline error on the topic field.
    source: FR2.1 (functional-design review R-05)

  - id: BR2.1
    statement: A Meeting may be saved with zero AgendaItems.
    category: constraint
    applies_to: AgendaItem
    trigger: on save
    logic: "IF agendaItems.length == 0 THEN allow save (no validation error)."
    violation_behaviour: N/A — this rule permits, not blocks.
    source: FR2.2

  - id: BR2.2
    statement: Reordering an AgendaItem updates its `order` value and shifts the `order` of items between its old and new position.
    category: calculation
    applies_to: AgendaItem
    trigger: on reorder action (up/down button)
    logic: >
      WHEN an item moves from position i to position j,
      THEN reassign `order` for every item between i and j by ±1 and set the moved item's `order` to j.
    violation_behaviour: N/A — deterministic recalculation, no invalid state possible.
    source: FR2.1

  - id: BR3.4
    statement: An Attendee must have a non-empty name before it can be added or saved.
    category: validation
    applies_to: Attendee.name
    trigger: on add or edit of an attendee
    logic: >
      IF name is empty
      THEN block the add/edit and show inline error "Name is required".
    violation_behaviour: Add/edit blocked; inline error on the name field.
    source: FR3.1 (functional-design review R-05)

  - id: BR3.1
    statement: A Meeting may be saved with zero Attendees.
    category: constraint
    applies_to: Attendee
    trigger: on save
    logic: "IF attendees.length == 0 THEN allow save (no validation error)."
    violation_behaviour: N/A — this rule permits, not blocks.
    source: FR3.2

  - id: BR3.2
    statement: No two Attendees on the same Meeting may share the same email address.
    category: validation
    applies_to: Attendee
    trigger: on add or edit of an attendee's email
    logic: >
      IF the entered email (case-insensitive) already exists among this Meeting's other Attendees
      THEN block the add/edit and show inline error "This attendee is already on the list".
    violation_behaviour: Add/edit blocked; inline error on the email field.
    source: FR3.3

  - id: BR3.3
    statement: An Attendee's email must be a well-formed email address.
    category: validation
    applies_to: Attendee.email
    trigger: on blur of the attendee email field
    logic: >
      IF email does not match a well-formed email pattern
      THEN show inline error and block add/edit until corrected.
    violation_behaviour: Inline field error; add/edit blocked.
    source: FR3.1

  - id: BR4.1
    statement: The Meetings List is sorted by Meeting date/time, newest first.
    category: policy
    applies_to: Meeting (list view)
    trigger: on rendering the Meetings List
    logic: "Sort meetings by (date, startTime) descending."
    violation_behaviour: N/A — display ordering policy, not a validation rule.
    source: FR4.1 (refined-mockups/mockups.md Screen 1)

  - id: BR4.2
    statement: Deleting a Meeting also deletes all of its AgendaItems and Attendees.
    category: policy
    applies_to: Meeting, AgendaItem, Attendee
    trigger: on confirmed meeting deletion
    logic: "WHEN a Meeting is deleted THEN cascade-delete every AgendaItem and Attendee whose meetingId matches it."
    violation_behaviour: N/A — deterministic cascade, no invalid state possible.
    source: FR4.2

  - id: BR5.1
    statement: The invitation card's QR code encodes the meeting link when one is present; otherwise it encodes an in-app deep link to the meeting's details.
    category: policy
    applies_to: CardGeneration (input from Meeting)
    trigger: on card render (preview or export)
    logic: >
      IF meetingLink is non-empty THEN QR payload = meetingLink.
      ELSE QR payload = a generated in-app URL that opens this meeting's details when visited.
    violation_behaviour: N/A — deterministic selection, always resolves to a valid payload.
    source: FR5.3 (functional-design-questions.md Q2)

  - id: BR5.2
    statement: The invitation card renders at a fixed US Letter page size; there is no host-selectable dimension.
    category: policy
    applies_to: CardGeneration
    trigger: on card render (preview or export)
    logic: >
      Card layout always targets US Letter dimensions (8.5in x 11in) — chosen over A5 and
      over a host-selectable choice because it is the more common default for a
      Next.js/browser-print context, and a fixed choice avoids extra form UI and extra
      CardGeneration branching for a first release. Revisit as a Should-Have if a future
      requirement asks for A5 or host selection.
    violation_behaviour: N/A — fixed policy, no invalid state possible.
    source: FR5.2 (functional-design review R-02 — resolves the deferred decision)

  - id: BR6.1
    statement: "Clear my data" permanently removes every Meeting, AgendaItem, and Attendee from this browser's storage.
    category: policy
    applies_to: Meeting, AgendaItem, Attendee
    trigger: on confirmed "clear my data" action
    logic: "WHEN the user confirms clearing data THEN delete all stored Meeting, AgendaItem, and Attendee records for this browser."
    violation_behaviour: N/A — deterministic wipe, no invalid state possible.
    source: FR6.2

  - id: BR7.1
    statement: A Meeting's "Upcoming" vs. "Past" status is computed at render time from its date/endTime/timezone against the current time — never stored.
    category: calculation
    applies_to: Meeting (display only)
    trigger: on rendering any view that shows meeting status
    logic: >
      IF the Meeting's (date, endTime, timezone) is chronologically before the current time
      THEN display as "Past" ELSE display as "Upcoming".
    violation_behaviour: N/A — pure computation, no stored state to violate.
    source: functional-design-questions.md Q4, Q4a
```

## Rules Summary

| ID | Category | Applies To | One-Line Statement |
|---|---|---|---|
| BR1.1 | validation | Meeting | Required fields must be present to save |
| BR1.2 | validation | Meeting | At least one of meetingLink/location required |
| BR1.3 | validation | Meeting.meetingLink | Meeting link must be a well-formed URL |
| BR1.4 | validation | Meeting | endTime must be after startTime |
| BR2.1 | constraint | AgendaItem | Zero agenda items allowed |
| BR2.2 | calculation | AgendaItem | Reorder recalculates `order` values |
| BR2.3 | validation | AgendaItem.topic | Agenda item topic must be non-empty |
| BR3.1 | constraint | Attendee | Zero attendees allowed |
| BR3.2 | validation | Attendee | No duplicate attendee emails per meeting |
| BR3.3 | validation | Attendee.email | Attendee email must be well-formed |
| BR3.4 | validation | Attendee.name | Attendee name must be non-empty |
| BR4.1 | policy | Meeting (list) | Meetings List sorted newest-first |
| BR4.2 | policy | Meeting/AgendaItem/Attendee | Deleting a meeting cascades to its children |
| BR5.1 | policy | CardGeneration | QR payload falls back to an in-app link when no meeting link |
| BR5.2 | policy | CardGeneration | Card renders at a fixed US Letter size, no host selection |
| BR6.1 | policy | Meeting/AgendaItem/Attendee | "Clear my data" wipes all records |
| BR7.1 | calculation | Meeting (display) | Upcoming/Past is computed, never stored |

## Assumptions & Open Questions

None.
