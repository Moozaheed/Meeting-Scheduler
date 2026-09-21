# Accessibility Checklist — Meeting Scheduler & Invitation Card Generator

Target: WCAG 2.1 Level AA (NFR2.1, confirmed at Requirements Analysis Q7), checked via automated tooling (axe-core/pa11y) as a non-blocking CI signal per the affirmed team practice, with mobile browser coverage also affirmed.

## Perceivable

- [ ] All non-decorative icons (Lucide) have accessible text alternatives (`aria-label` or adjacent visible text) — delete, reorder, and add icons are never icon-only with no label.
- [ ] Text contrast meets 4.5:1 (normal text) / 3:1 (large text, UI components) against the Tailwind neutral/primary palette chosen in `design-system-mapping.md`.
- [ ] Validation errors and the "duplicate attendee" / "invalid URL" messages are never conveyed by color alone — paired with icon + text (per FR1.2, FR3.3).
- [ ] The invitation card PDF's text is real, selectable text (not rasterized/image-only), so it remains perceivable via PDF-reader accessibility tools.

## Operable

- [ ] All interactive elements (form fields, agenda/attendee row buttons, Export, Delete, reorder buttons) are reachable and operable via keyboard alone — no mouse-only interaction, per the mandated non-drag reorder alternative (FR2.1).
- [ ] Visible focus indicator (≥2px outline, 3:1 contrast) on every interactive element across all screens.
- [ ] Logical tab order follows the visual layout on both the Meetings List and the Create/Edit Meeting screens, in both desktop split-screen and mobile stacked layouts.
- [ ] Modal/inline delete confirmation traps focus while open and returns focus correctly on close/cancel (per `interaction-spec.md` § DeleteConfirmation).
- [ ] The "Clear my data" confirmation dialog (`interaction-spec.md` § ClearMyDataAction) is keyboard-operable and its higher-stakes wording is read in full by screen readers, not truncated.
- [ ] Touch targets meet the 44×44px minimum (mobile), including the per-row delete icon and reorder buttons.
- [ ] No time limits on form completion; the "Export PDF" loading state has no forced timeout that discards user input.

## Understandable

- [ ] Every form field has a visible `<label>`, not a placeholder-only label (per FR1.1's required/optional fields).
- [ ] Required fields are marked; per the UX guide's convention, mark optional fields (description, host role) rather than marking every required one individually.
- [ ] Error messages are specific and actionable: "Enter a valid URL" (not "Invalid input"), "This attendee is already on the list" (not "Error").
- [ ] Navigation (Meetings List ↔ Create/Edit Meeting) is consistent in position and labeling across all screens.
- [ ] Page `lang` attribute declared (English, per the resolved conversation language).
- [ ] The PII/browser-storage disclosure statement (NFR5.2) is present as real, always-visible text on the Meetings List footer — not an icon-only indicator, not a one-time dismissible toast.

## Robust

- [ ] Semantic HTML used throughout: `<button>` for actions, `<ul>`/`<li>` for the Meetings List and agenda/attendee lists, `<label for>` associations, heading levels (`h1`–`h3`) used in logical, non-skipping order.
- [ ] ARIA used only where native HTML cannot express the semantics (per the accessibility guide's "native first" rule) — e.g., `aria-live` regions for the export status and validation errors, `role="alertdialog"` for the delete confirmation if implemented as a modal.
- [ ] Automated axe-core/pa11y scan runs in CI as a non-blocking signal (per the affirmed team practice) across the Meetings List, Create/Edit Meeting form, and card preview.

## Testing Approach (maps to the affirmed team practice)

1. Automated scan (axe-core/pa11y) in CI — non-blocking, flags issues for review.
2. Manual keyboard walkthrough of the full create-meeting → export flow before each release.
3. Screen reader spot-check (VoiceOver or NVDA) on the Meetings List and Create/Edit Meeting screens, given no dedicated accessibility specialist role exists on this solo project.
4. Zoom testing at 200%/400% on both desktop and mobile layouts.

## Assumptions & Open Questions

None.
