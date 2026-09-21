# Intent Backlog — Meeting Scheduler & Invitation Card Generator

Prioritized using MoSCoW [Q2]. Each proto-Unit below is a candidate grouping for later Units Generation (Inception 2.7); grouping is provisional and owned by that stage, not fixed here.

## Must Have

| Proto-Unit | Description | Source |
|---|---|---|
| Meeting details form | Title, purpose/description, date, start/end time or duration, timezone selector, meeting link or physical location, host profile | [desc][Q1][Q2] |
| Agenda builder | Add, edit, reorder, remove agenda topics with duration estimates and speaker names | [desc][Q1][Q2] |
| Attendee management | Guest list — name, email, role/designation | [desc][Q1][Q2] |
| Invitation card engine | Client-side PDF generation, A5/US-Letter layout, agenda timeline block, host details badge, QR code (meeting URL), live preview | [desc][Q1][Q2][Q3] |
| Hosting | One centrally-reachable deployed instance, unlisted URL, per-browser-only data (no shared DB) | [Q6][Q7] |

## Should Have

| Proto-Unit | Description | Source |
|---|---|---|
| `.ics` calendar payload | QR code encodes a downloadable `.ics` file instead of (or in addition to) a plain meeting URL | [Q2] |

## Could Have

| Proto-Unit | Description | Source |
|---|---|---|
| Card visual theming | Additional typography/color/layout polish beyond the baseline clean design | [Q2] |
| Environment provisioning | Custom domain, environment variables, or dedicated infra setup for the hosted instance | [Q6] |

## Won't Have (this release)

| Item | Reason | Source |
|---|---|---|
| Authentication / access control | Unlisted URL is sufficient for now | [Q7] |
| Observability, incident response, performance validation | No production-scale operational concern for this app | [Q6] |
| Shared/cloud database, cross-device sync | Explicitly out of scope since Intent Capture | [intent-statement] |

## Assumptions & Open Questions

None.
