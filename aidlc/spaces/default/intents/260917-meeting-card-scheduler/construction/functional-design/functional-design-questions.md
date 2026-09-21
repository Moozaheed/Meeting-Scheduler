# Functional Design — Questions

## Sources

- [desc] Initial description: "Initiate a full-stack local web application for a Meeting Scheduler & Invitation Card Generator with zero third-party API dependencies. [...full text carried from Intent Capture's Sources register...]"

This is a zero-unit workflow (Units Generation was skipped), so this stage runs once for the whole app rather than per-unit, working from `requirements.md` and `domain-design/components.md` directly. Most business logic is already well-specified by prior stages; the questions below cover the genuine gaps flagged along the way plus the implementation-agnostic details (ID strategy, exact field types) functional design is meant to pin down.

## Questions

### Q1. [Carried from the Domain Design review, R-01] Should host "role" and "organization" be one combined free-text field, or two separate fields on the Meeting entity?
The original description says "role/organization" and the card mockup shows a combined "[Host org / name badge]".

- A. One combined free-text field (e.g. "Product Manager, Acme Inc.") — simplest, matches the "/" in the original phrasing
- B. Two separate optional fields (role and organization)
- X. Other (please specify)

[Answer]: A. One combined free-text field (e.g. "Product Manager, Acme Inc.") — simplest, matches the "/" in the original phrasing

### Q2. [Carried from the Requirements Analysis review, R-01] What should the invitation card's QR code encode when a meeting has only a physical location (no meeting link)?
- A. Encode a generated deep-link URL to the meeting's details within the app itself (so scanning it opens the meeting info in-browser), even when there's no external meeting link
- B. Omit the QR code entirely when there's no meeting link — physical-location-only meetings show no QR code on the card
- C. Encode the physical location as plain text in the QR payload (so a scan reveals the address as text, not a link)
- X. Other (please specify)

[Answer]: A. Encode a generated deep-link URL to the meeting's details within the app itself (so scanning it opens the meeting info in-browser), even when there's no external meeting link

### Q3. What ID strategy should Meeting, AgendaItem, and Attendee records use?
- A. Client-generated UUIDs (e.g. `crypto.randomUUID()`), assigned at creation time in the browser
- B. A different strategy (please specify)
- X. Other (please specify)

[Answer]: A. Client-generated UUIDs (e.g. `crypto.randomUUID()`), assigned at creation time in the browser

### Q4. Does a Meeting have any lifecycle/status beyond just existing (e.g. draft vs. finalized), or is it always a single, complete record once created?
- A. No lifecycle — a Meeting is always a complete record; there's no draft/published distinction
- B. Yes, there's a lifecycle (please specify the states)
- X. Other (please specify)

[Answer]: B. Yes, there's a lifecycle (please specify the states)

### Q4a. [Follow-up to Q4] What lifecycle states should a Meeting have?

- A. Upcoming / Past — derived automatically from the meeting's date/time (no manual status field); purely a display distinction, not a stored state
- B. Draft / Finalized — a manually-set status the host toggles
- X. Other (please specify)

[Answer]: A. Upcoming / Past — derived automatically from the meeting's date/time (no manual status field); purely a display distinction, not a stored state

### Q5. What format should the meeting date/time be stored and reasoned about in — a single combined date-time value per field, or separate date and time fields?
- A. Separate date, startTime, and endTime (or duration) fields, stored alongside an IANA timezone string (e.g. `America/New_York`) — matches how the form is laid out
- B. Combined ISO 8601 date-time values (please specify how timezone is handled)
- X. Other (please specify)

[Answer]: A. Separate date, startTime, and endTime (or duration) fields, stored alongside an IANA timezone string (e.g. `America/New_York`) — matches how the form is laid out

### Q6. When end time and duration are both meaningful (per FR1.1's "end time/duration"), should the form capture an explicit end time, a duration in minutes, or let the host choose either?
- A. Capture an explicit end time (the form asks for start and end time; duration is just end minus start, not separately stored)
- B. Capture duration in minutes instead of an end time
- C. Let the host choose either, and derive the other
- X. Other (please specify)

[Answer]: A. Capture an explicit end time (the form asks for start and end time; duration is just end minus start, not separately stored)

### Q7. For agenda item duration and the overall meeting time, should the app warn (non-blocking) if agenda item durations add up to more than the meeting's total duration, or is that left entirely to the host with no validation?
- A. No validation — durations are informational only, no cross-check against the meeting's total time
- B. Show a non-blocking warning if agenda durations exceed the meeting's total duration
- X. Other (please specify)

[Answer]: A. No validation — durations are informational only, no cross-check against the meeting's total time

## Assumptions & Open Questions

None.
