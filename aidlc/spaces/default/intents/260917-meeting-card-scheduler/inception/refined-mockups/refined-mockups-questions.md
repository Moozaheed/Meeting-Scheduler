# Refined Mockups & UX Design — Questions

## Sources

- [desc] Initial description: "Initiate a full-stack local web application for a Meeting Scheduler & Invitation Card Generator with zero third-party API dependencies. [...full text carried from Intent Capture's Sources register...]"

Rough mockups and a user-flow were not produced upstream (both skipped by this workflow's composed scope), so this stage designs directly from `requirements.md` and the affirmed team practices, per this stage's own instruction not to invent the content of a missing artifact.

## Questions

### Q1. With the Meetings List requirement (FR4) now in scope, what should the app's overall navigation structure be?
- A. Meetings List is the home/landing screen; a "Create meeting" action leads into the scheduling flow; clicking a listed meeting opens it for viewing/editing
- B. The scheduling form is the landing screen (create-first); the Meetings List is a secondary view reached via navigation
- C. Not yet defined
- X. Other (please specify)

[Answer]: A. Meetings List is the home/landing screen; a "Create meeting" action leads into the scheduling flow; clicking a listed meeting opens it for viewing/editing

### Q2. For the live invitation-card preview (FR5.4), should it default to a side-by-side split-screen (form + preview) or a modal/toggle view?
Split-screen won't fit well on mobile; a toggle or stacked layout may be needed there regardless of the desktop default.

- A. Split-screen on desktop (form left, preview right); stacked with a "Preview" toggle/tab on mobile
- B. Modal/dialog preview on all screen sizes (click "Preview" to open it)
- C. Not yet defined
- X. Other (please specify)

[Answer]: A. Split-screen on desktop (form left, preview right); stacked with a "Preview" toggle/tab on mobile

### Q3. How should agenda items be added/edited — inline in the list, or via a modal per item?
- A. Inline — each agenda item is an editable row in the list (click a field to edit, drag or up/down buttons to reorder)
- B. Modal — clicking "add" or an existing item opens a small dialog to edit it
- C. Not yet defined
- X. Other (please specify)

[Answer]: A. Inline — each agenda item is an editable row in the list (click a field to edit, drag or up/down buttons to reorder)

### Q4. How should attendees be added — inline row-based list, or a modal/quick-add pattern?
- A. Inline — a simple repeating row (name, email, role) with an "add attendee" row at the bottom
- B. Modal — a small dialog to add one attendee at a time
- C. Not yet defined
- X. Other (please specify)

[Answer]: A. Inline — a simple repeating row (name, email, role) with an "add attendee" row at the bottom

### Q5. Beyond "clean typography and visual hierarchy" already noted, any specific visual style direction (color palette, tone), or should the designer choose a sensible default consistent with Tailwind + Lucide icons?
- A. Designer's choice — a clean, modern, professional look using Tailwind's default palette conventions
- B. I have a specific preference (please specify)
- X. Other (please specify)

[Answer]: A. Designer's choice — a clean, modern, professional look using Tailwind's default palette conventions

### Q6. On the Meetings List, what should each row/card show, and is there a per-meeting delete action (separate from the global "clear my data" action)?
- A. Show title, date/time, and attendee count per row; include a per-meeting delete action with a confirmation step
- B. A different set of fields or no per-meeting delete (please specify)
- X. Other (please specify)

[Answer]: A. Show title, date/time, and attendee count per row; include a per-meeting delete action with a confirmation step

## Assumptions & Open Questions

None.
