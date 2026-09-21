# Reliability Design — Meeting Scheduler & Invitation Card Generator

## Resilience patterns: circuit breakers, retries, bulkheads — out of scope

The app makes no external network calls at runtime (no third-party APIs,
no backend database). There is nothing external to protect against, so no
circuit-breaker, retry-with-backoff, or bulkhead pattern is designed
(decided at this stage's interview Q1). Resilience design instead focuses
entirely on the two concrete client-side failure boundaries below.

## NFR4.1 — Persistence failure: graceful degradation design

```
PersistenceAdapter.save(record)
  try:
    idb-keyval.set(key, record)
  catch (QuotaExceededError | corrupted-read | private-browsing-restriction):
    throw PersistenceError(cause)

Scheduling (caller)
  try:
    await PersistenceAdapter.save(record)
  catch (PersistenceError):
    fall back to in-memory state for this session
    surface a non-blocking notice via Presentation
    // draft form data is untouched — see NFR4.2 below
```

`PersistenceAdapter` never swallows an error silently; it always rethrows a
typed `PersistenceError` that `Scheduling` catches and translates into the
in-memory fallback. This is the one designed failover: from
IndexedDB-backed persistence to session-scoped in-memory state, with no
retry (retrying a quota-exceeded or private-browsing restriction is
pointless — the failure is not transient).

## NFR4.2 — Failed save must not lose in-progress form data

`MeetingFormPage`'s draft state (`MeetingDraft`, per
`frontend-components.md`) is owned by `Presentation`, not `Scheduling` —
a failed `PersistenceAdapter.save()` call never touches or clears it. The
draft is only replaced once a save call resolves successfully. This is a
data-flow design constraint, not a retry mechanism: the draft's lifecycle
is simply independent of the save attempt's outcome.

## NFR4.3 — Backup and recovery: none (confirmed, no design needed)

No backup/restore mechanism is designed, consistent with the accepted-risk
decision recorded in `reliability-requirements.md` NFR4.3.

## Card-generation failure design

Per the affirmed layering mandate ("the domain/state layer is the only
permitted caller" of the card-generation engine), `Scheduling` is the sole
caller of `CardGeneration.exportPdf()` — `Presentation`/`ExportButton`
never imports or calls `CardGeneration` directly, only a `Scheduling`-owned
method that delegates internally:

```
CardGeneration.exportPdf(meetingData)
  try:
    blob = await pdf(<InvitationCard {...meetingData} />).toBlob()
    return blob
  catch (renderError):
    throw CardGenerationError(renderError)

Scheduling.exportCard(meeting)          // domain/state layer — the only caller
  try:
    return await CardGeneration.exportPdf(meeting)
  catch (CardGenerationError):
    rethrow                              // Scheduling adds no recovery here; Presentation owns the retry UX

Presentation (ExportButton, via a Scheduling hook e.g. useMeeting(id).exportCard())
  try:
    blob = await exportCard(meeting)
    trigger browser download
    show "Card downloaded" confirmation
  catch (CardGenerationError):
    show "PDF export failed — Try again" with a retry action
```

A React error boundary wraps the card preview/export flow (per the
affirmed error-handling practice) so a rendering exception inside
`@react-pdf/renderer` or `qrcode.react` cannot crash the rest of the
scheduling UI — this is the isolation boundary `logical-components.md`
documents for the `CardGeneration` failure domain.

## Availability

Best-effort, no formal SLO — confirmed unchanged from
`reliability-requirements.md`; no additional design work applies beyond
Vercel's platform-managed uptime.

## Assumptions & Open Questions

None.
