# Design System Mapping — Meeting Scheduler & Invitation Card Generator

No pre-existing design system exists for this greenfield project (confirmed team practice: Tailwind CSS utility classes, no separate CSS-in-JS convention). This document establishes the design tokens and component mapping the app will use, per the designer's choice affirmed at Q5.

## Visual Direction

Clean, modern, professional look using Tailwind's default palette conventions (Q5) — no custom brand identity requested. Lucide icons for all iconography, per the stated tech stack.

## Design Tokens

| Token | Value | Usage |
|---|---|---|
| Primary color | Tailwind `blue-600` / `blue-700` (hover) | Primary buttons, links, active nav state |
| Neutral scale | Tailwind `slate-50`…`slate-900` | Backgrounds, borders, body text |
| Error color | Tailwind `red-600` | Validation errors, delete actions |
| Success color | Tailwind `green-600` | Success toasts/confirmations |
| Spacing scale | Tailwind default (4px increments: `1`=4px … `12`=48px) | All layout spacing, per the wireframing guide's uniform spacing rule |
| Font | Tailwind default sans stack (`font-sans`) | All UI text |
| Card font (PDF) | A print-safe embedded font, pinned explicitly (not system-dependent) | Invitation card PDF only — avoids host-dependent rendering differences (per practices-discovery's font-pinning note) |
| Border radius | Tailwind `rounded-md` (buttons, inputs), `rounded-lg` (cards) | Consistent rounding across interactive and container elements |

## Component Library Mapping

| UI Need | Component | Notes |
|---|---|---|
| Buttons (primary/secondary/destructive) | Native `<button>` + Tailwind classes | Primary = solid blue; secondary = outline/ghost; destructive (delete) = red |
| Form inputs | Native `<input>`/`<select>`/`<textarea>` + Tailwind classes | No custom form library required for this scope |
| Icons | Lucide React icon set | Per the stated tech stack (Trash, Plus, ChevronUp/Down for reorder, Calendar, MapPin, Link) |
| Toasts/inline confirmations | Custom lightweight component (no library) | Auto-dismiss ~5s per the UX guide's feedback pattern |
| Delete confirmation | Custom lightweight modal or inline pattern | See `interaction-spec.md` § DeleteConfirmation |
| Tabs (mobile Details/Preview) | Custom lightweight tab component | Two-tab use case does not warrant a full tab library |

## Layout Grid

- Mobile-first, Tailwind's default breakpoints (`sm`, `md`, `lg`, `xl`), aligned to the affirmed responsive breakpoint strategy: mobile <768px, tablet 768–1024px, desktop >1024px.
- Max content width on large desktop: `max-w-5xl` centered, to avoid stretching form/list content too wide (per the wireframing guide's large-desktop guidance).

## Assumptions & Open Questions

None.
