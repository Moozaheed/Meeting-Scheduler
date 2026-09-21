# Refined Mockups — Meeting Scheduler & Invitation Card Generator

Mid-to-high fidelity screen designs, described textually (no image assets in this workflow). Every screen documents its five states — empty, loading, success, error, partial — per the design-agent's wireframing guide. Requirement IDs (FR/NFR) are cited inline.

## Screen 1 — Meetings List (home) [Q1]

```
┌──────────────────────────────────────────────────────┐
│  Meeting Scheduler                    [+ New Meeting] │
├──────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────┐  │
│  │ Sprint Planning              Sep 22, 10:00 AM   │  │
│  │ 5 attendees                          [Delete 🗑] │  │
│  ├────────────────────────────────────────────────┤  │
│  │ Client Kickoff                Sep 24, 2:00 PM   │  │
│  │ 3 attendees                          [Delete 🗑] │  │
│  └────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────┤
│  Your data stays on this device only, in plain        │
│  browser storage — don't use it on a shared computer   │
│  for sensitive meetings.              [Clear my data]  │
└──────────────────────────────────────────────────────┘
```

- **Clear my data** (FR6.2, mandated `ALWAYS`): a persistent footer action on the Meetings List, always visible (not hidden in a menu), using the affirmed team-practice wording verbatim as an adjacent disclosure line (NFR5.2). Clicking it opens a confirmation step distinct from the per-meeting delete confirmation, because the blast radius is different — it wipes every meeting, not one: "Clear all your data? This deletes every meeting stored in this browser and can't be undone." with Cancel / Confirm. On confirm, all meetings are removed and the list returns to its Empty state.
- **PII disclosure placement** (NFR5.2): the same footer sentence above is shown on the Meetings List at all times (not just on first visit and not dismissible), since it is a standing disclosure about how the app handles data, not a one-time notice. The Create/Edit Meeting screen does not repeat the full sentence but shows a shorter reminder near the host-email field: "Stored only on this device."

- **Success**: cards/rows listed newest-first; each shows title, date/time, attendee count (FR4.1, Q6).
- **Empty**: illustration + "No meetings yet. Create your first one." + primary "New Meeting" CTA (FR4.1).
- **Loading**: skeleton rows (3 placeholder cards) while browser storage is read.
- **Error**: inline banner "Couldn't load your meetings — [Retry]" if persistence read fails (NFR4.1).
- **Partial**: long titles truncate with ellipsis + full text on hover/focus; 1 meeting vs. 50+ meetings both render without layout breakage (FR2.3/FR3.4 soft-limit spirit applied to the list too).
- **Delete confirmation**: clicking "Delete" opens a small inline/modal confirmation ("Delete 'Sprint Planning'? This can't be undone.") before removing from storage (FR4.2, Q6).

## Screen 2 — Create / Edit Meeting

Reached via "New Meeting" from the list, or by clicking an existing meeting to edit (Q1). Split-screen layout on desktop (form left, live card preview right); on mobile, the form and a "Preview" tab/toggle stack vertically (Q2, NFR3.1).

```
Desktop (≥1024px):
┌─────────────────────────────┬────────────────────────┐
│ Meeting Details              │  [Live Card Preview]   │
│ ─────────────                │  ┌──────────────────┐ │
│ Title *        [___________] │  │  <rendered card>  │ │
│ Description    [___________] │  │                    │ │
│ Date *         [___________] │  └──────────────────┘ │
│ Start / End *  [___] – [___] │                        │
│ Timezone *     [dropdown ▾]  │                        │
│ Link / Location * [_______]  │                        │
│ Host name *    [___________] │                        │
│ Host role      [___________] │                        │
│ Host email *   [___________] │                        │
│                               │                        │
│ Agenda                       │                        │
│  1. [topic] [speaker] [dur] ⠿ │                        │
│  + Add agenda item            │                        │
│                               │                        │
│ Attendees                     │                        │
│  [name] [email] [role]  ✕     │                        │
│  + Add attendee                │                        │
│                               │                        │
│           [Cancel]  [Export PDF]                      │
└─────────────────────────────┴────────────────────────┘

Mobile (<768px): Form full-width; [Details] [Preview] tabs above content.
```

- **Fields** (FR1.1, Q4 required/optional split): required fields marked `*`. Title, date, start, end/duration, timezone, host name, host email, and at least one of link/location are required; description and host role are optional.
- **Meeting link validation**: entering a link shows inline "Enter a valid URL" error on blur if malformed (FR1.2, per the inline-validation-on-blur pattern).
- **Agenda item row** (Q3, FR2.1): topic (text), speaker (text), duration (number, minutes), reorder via up/down buttons (⠿ icon) — no drag-only interaction, per accessibility requirement for a non-drag alternative. Remove via a trailing ✕. Zero agenda items is a valid state — an empty "No agenda items yet" hint replaces the list (FR2.2).
- **Attendee row** (Q4, FR3.1): name (text), email (text, validated on blur), role (text, optional). Adding a duplicate email shows an inline error "This attendee is already on the list" and the row is not added (FR3.3). Zero attendees is valid — an empty hint replaces the list (FR3.2).
- **Empty state**: a brand-new meeting form starts with all fields blank, zero agenda items, zero attendees, and the preview panel shows a placeholder card ("Fill in the details to see your card").
- **Loading**: "Export PDF" button shows a spinner + "Generating…" label while the PDF is produced (NFR1.2); the button is disabled during this state to prevent double-submission.
- **Error**: card-generation failure shows an inline banner above the preview — "PDF export failed — [Try again]" — never a silent no-op (per the affirmed error-handling practice); the form data is preserved.
- **Success**: after export, a brief toast/inline confirmation ("Card downloaded") appears near the Export button, auto-dismissing after ~5s.
- **Partial**: very long titles/agenda topics wrap gracefully in both the form and the card preview rather than overflowing; a meeting with 50 agenda items/attendees scrolls within its own list panel rather than pushing the whole page (FR2.3, FR3.4).

## Screen 3 — Invitation Card (rendered content, FR5.1–FR5.4)

The card that both the live preview and the exported PDF render:

```
┌───────────────────────────────┐
│  [Host org / name badge]       │
│                                 │
│  Sprint Planning                │
│  Sep 22, 2026 · 10:00–11:00 AM │
│  (America/New_York)             │
│  📍 Conference Room B / 🔗 link │
│                                 │
│  Agenda                        │
│  10:00  Kickoff — Alex (10m)   │
│  10:10  Deep dive — Sam (30m)  │
│  10:40  Q&A — All (10m)        │
│                                 │
│  Hosted by: Alex Rivera         │
│  alex@example.com               │
│                                 │
│              [QR code]          │
└───────────────────────────────┘
```

- Clean typography and visual hierarchy (title largest, agenda as a timeline block, host details as a distinct badge) per the original description's aesthetic requirement (FR5.1).
- Card renders at A5 or US Letter dimensions — exact default vs. host-selectable choice deferred to Functional Design (requirements.md open item).
- QR code encodes the meeting URL when a link is present; behavior when only a physical location is given is an open item flagged by the requirements-analysis review (R-01) for Functional Design to resolve (FR5.3).
- If a field is empty (e.g., no description, no agenda items, no attendees), that section of the card is omitted entirely rather than shown blank — an empty agenda section does not render a heading with nothing under it.
- Loading and error states for card generation are owned entirely by the `ExportButton` component (see `interaction-spec.md`), not duplicated on this screen — this is a deliberate choice, since the card content itself doesn't change shape while exporting; only the trigger control does.

## Assumptions & Open Questions

None.
