# Entity Model — Meeting Scheduler & Invitation Card Generator

All three entities are owned by the `Scheduling` component (see `domain-design/components.md`).

```yaml
entities:
  - name: Meeting
    description: >
      A single scheduled meeting with its details, agenda, and attendee list.
      Owned entirely within one browser's local storage (FR6.1).
    attributes:
      - name: id
        type: string (UUID v4)
        required: true
        unique: true
        constraints: [client-generated via crypto.randomUUID() at creation (Q3)]
      - name: title
        type: string
        required: true
        constraints: [min length 1, max length 200]
      - name: description
        type: string
        required: false
        constraints: [max length 2000]
      - name: date
        type: string (ISO 8601 date, YYYY-MM-DD)
        required: true
      - name: startTime
        type: string (24-hour HH:MM)
        required: true
      - name: endTime
        type: string (24-hour HH:MM)
        required: true
        constraints: [must be after startTime — see BR1.4]
      - name: timezone
        type: string (IANA timezone identifier, e.g. "America/New_York")
        required: true
        default: the browser's detected local timezone at first load
      - name: meetingLink
        type: string (URL)
        required: false
        constraints: [required if location is absent — see BR1.2; must be a well-formed URL — see BR1.3]
      - name: location
        type: string
        required: false
        constraints: [required if meetingLink is absent — see BR1.2, max length 500]
      - name: hostName
        type: string
        required: true
        constraints: [min length 1, max length 100]
      - name: hostRoleOrg
        type: string
        required: false
        constraints: [max length 200, combined free-text field per Q1 — e.g. "Product Manager, Acme Inc."]
      - name: hostEmail
        type: string (email)
        required: true
        constraints: [must be a well-formed email address]
      - name: createdAt
        type: string (ISO 8601 date-time)
        required: true
        default: the current timestamp at creation, set once and never updated
    entity_constraints:
      - "At least one of meetingLink or location must be present (BR1.2)"
      - "endTime must be chronologically after startTime on the same date (BR1.4)"
    relationships:
      - target: AgendaItem
        cardinality: one-to-many
        direction: Meeting owns AgendaItem
        cascade: deleting a Meeting deletes all its AgendaItems (BR4.2)
      - target: Attendee
        cardinality: one-to-many
        direction: Meeting owns Attendee
        cascade: deleting a Meeting deletes all its Attendees (BR4.2)

  - name: AgendaItem
    description: One itemized agenda topic within a Meeting's agenda.
    attributes:
      - name: id
        type: string (UUID v4)
        required: true
        unique: true
        constraints: [client-generated via crypto.randomUUID() at creation]
      - name: meetingId
        type: string (UUID v4)
        required: true
        references: Meeting.id
      - name: topic
        type: string
        required: true
        constraints: [min length 1, max length 200]
      - name: speaker
        type: string
        required: false
        constraints: [max length 100]
      - name: durationMinutes
        type: number (integer)
        required: true
        constraints: [minimum 1]
      - name: order
        type: number (integer)
        required: true
        constraints: [zero-based position within the Meeting's agenda, unique per Meeting]
    entity_constraints:
      - "A Meeting may have zero AgendaItems (BR2.1)"
    relationships:
      - target: Meeting
        cardinality: many-to-one
        direction: AgendaItem references Meeting
        cascade: N/A (child side)

  - name: Attendee
    description: One invited attendee of a Meeting.
    attributes:
      - name: id
        type: string (UUID v4)
        required: true
        unique: true
        constraints: [client-generated via crypto.randomUUID() at creation]
      - name: meetingId
        type: string (UUID v4)
        required: true
        references: Meeting.id
      - name: name
        type: string
        required: true
        constraints: [min length 1, max length 100]
      - name: email
        type: string (email)
        required: true
        constraints: [must be a well-formed email address, unique per Meeting — see BR3.2]
      - name: role
        type: string
        required: false
        constraints: [max length 100]
    entity_constraints:
      - "A Meeting may have zero Attendees (BR3.1)"
      - "No two Attendees on the same Meeting may share an email address (BR3.2)"
    relationships:
      - target: Meeting
        cardinality: many-to-one
        direction: Attendee references Meeting
        cascade: N/A (child side)
```

## Summary

Three entities, all owned by `Scheduling`: **Meeting** is the root record (details, timing, host info — host role/organization is a single combined field per Q1); **AgendaItem** and **Attendee** are both child collections keyed by `meetingId`, both optional (a Meeting may have zero of either), and both cascade-delete with their parent Meeting. IDs are client-generated UUIDs (Q3). A Meeting has no stored lifecycle/status field — "Upcoming" vs. "Past" is a derived, computed distinction from `date`/`endTime`/`timezone` against the current time, never persisted (Q4a).

## Assumptions & Open Questions

None.
