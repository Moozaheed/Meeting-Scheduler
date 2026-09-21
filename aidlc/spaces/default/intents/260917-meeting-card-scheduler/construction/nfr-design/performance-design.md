# Performance Design — Meeting Scheduler & Invitation Card Generator

## Caching Architecture

**No custom caching layer.** Vercel's default CDN caching of Next.js static
assets (the app shell, JS bundles, fonts) is sufficient — there is no
per-user server-side data to cache, since every meeting/agenda/attendee
record lives only in the visitor's own browser storage (decided at this
stage's interview Q2). No cache-aside, write-through, or TTL policy is
designed here because there is nothing server-side and shared to cache.

## NFR1.1 — Live card preview latency (≤ 1s)

| Design element | Approach |
|---|---|
| Debounce | `LiveCardPreview` debounces `draftMeetingData` changes at ~300ms (well under the 1s budget) before calling `Scheduling.renderPreview(draft)` — the domain/state layer's delegating method, which internally calls `CardGeneration.renderPreview()` per the affirmed layering mandate — so rapid keystrokes don't trigger a render on every character. This revises `frontend-components.md`'s earlier "~1s per NFR1.1" figure down to ~300ms to leave rendering-time headroom inside the 1s NFR1.1 budget. |
| Rendering path | `qrcode.react` renders the QR as an SVG (no image round-trip); `@react-pdf/renderer`'s preview is rendered to a lightweight in-DOM representation, not a full PDF re-render, for the live preview — only the actual export (NFR1.2) produces the full PDF blob |
| Resource pooling | No connection/resource pool applies — this is synchronous in-browser rendering, not a pooled remote resource |

## NFR1.2 — PDF export latency (≤ 3s)

| Design element | Approach |
|---|---|
| Async processing | `CardGeneration.exportPdf()` runs `@react-pdf/renderer`'s `pdf().toBlob()` call, which is inherently async (browser main-thread rendering); a loading/progress state is shown per the affirmed error-handling practice so a 1–3s wait isn't mistaken for a hang |
| Scope boundary | Within the soft ~50-item agenda/attendee target (FR2.3, FR3.4); no pagination or lazy-loading is designed into the PDF renderer since typical meetings are well under that scale |
| Resource pooling | N/A — single client-side render, not a pooled remote resource |

## Performance Budget Summary

| Budget | Target | Enforced by |
|---|---|---|
| Live preview update | ≤ 1s | Debounce + lightweight preview render path (above) |
| PDF export | ≤ 3s | Async `@react-pdf/renderer` render, within the ~50-item scale target |
| Static asset delivery | Vercel CDN default | No custom cache design (Q2) |

## Assumptions & Open Questions

None.
