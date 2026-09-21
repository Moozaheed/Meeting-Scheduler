# Requirements Analysis — Questions

## Sources

- [desc] Initial description: "Initiate a full-stack local web application for a Meeting Scheduler & Invitation Card Generator with zero third-party API dependencies. [...full text carried from Intent Capture's Sources register...]"

## Questions

### Q1. Is there a list/dashboard of previously created meetings, or does each visit start a fresh single-meeting creation flow with nothing saved for later browsing?
This wasn't explicit in the original description or any earlier stage. It affects whether the app needs a "my meetings" view at all.

- A. Yes — a list of meetings created in this browser, so the host can revisit, edit, or re-export a past meeting's card
- B. No — each session is a fresh, one-off meeting creation; nothing is listed for later browsing (though it's still saved to browser storage per the persistence practice already affirmed)
- C. Not yet defined
- X. Other (please specify)

[Answer]: A. Yes — a list of meetings created in this browser, so the host can revisit, edit, or re-export a past meeting's card

### Q2. The success metric from Intent Capture was "a few minutes" with no hard number — should Requirements Analysis pin a specific target (e.g., "under 5 minutes from opening the app to a downloaded PDF")?
- A. Yes — under 5 minutes end-to-end
- B. Yes, but a different number (please specify)
- C. Leave it qualitative — no hard number needed
- X. Other (please specify)

[Answer]: A. Yes — under 5 minutes end-to-end

### Q3. Are there limits on agenda items or attendees per meeting (e.g., a maximum count), or is it unbounded?
- A. No hard limit — the UI should handle a reasonably large number gracefully (say, up to 50 of each) but not hard-block beyond that
- B. Yes, a specific limit is needed (please specify)
- C. Not yet defined
- X. Other (please specify)

[Answer]: A. No hard limit — the UI should handle a reasonably large number gracefully (say, up to 50 of each) but not hard-block beyond that

### Q4. Which meeting-detail fields are strictly required to create a meeting, versus optional?
The original description lists title, purpose/description, date, start/end time or duration, timezone, meeting link OR physical location, and host name/role/email.

- A. Required: title, date, start time, end time or duration, timezone, and at least one of meeting link/physical location, and host name + email. Optional: purpose/description, host role/organization
- B. Everything listed is required, nothing optional
- C. A different required/optional split (please specify)
- X. Other (please specify)

[Answer]: A. Required: title, date, start time, end time or duration, timezone, and at least one of meeting link/physical location, and host name + email. Optional: purpose/description, host role/organization

### Q5. How should duplicate attendee emails, or a meeting created with zero agenda items or zero attendees, be handled?
- A. Allow zero agenda items and zero attendees (both are optional groupings, not required to create a meeting); silently dedupe or block a duplicate attendee email with a validation message
- B. Require at least one agenda item and one attendee before the meeting can be created
- C. Not yet defined
- X. Other (please specify)

[Answer]: A. Allow zero agenda items and zero attendees (both are optional groupings, not required to create a meeting); block a duplicate attendee email with a validation message

### Q6. What's an acceptable performance target for generating and previewing the invitation card PDF?
- A. Live preview updates within ~1 second of an edit; full PDF export completes within ~3 seconds
- B. A different target (please specify)
- C. No specific target — "reasonably responsive" is enough
- X. Other (please specify)

[Answer]: A. Live preview updates within ~1 second of an edit; full PDF export completes within ~3 seconds

### Q7. What accessibility standard should the non-blocking automated accessibility checks (already affirmed in team practices) target?
- A. WCAG 2.1 Level AA
- B. WCAG 2.1 Level A (lighter bar)
- C. No specific standard — just run the automated checks and see what they flag
- X. Other (please specify)

[Answer]: A. WCAG 2.1 Level AA

### Q8. Does the meeting link field need any validation (e.g., must be a valid URL), or is it free text?
- A. Validate as a URL when a meeting link is entered (vs. a physical location, which stays free text)
- B. Free text, no validation
- C. Not yet defined
- X. Other (please specify)

[Answer]: A. Validate as a URL when a meeting link is entered (vs. a physical location, which stays free text)

## Assumptions & Open Questions

None.
