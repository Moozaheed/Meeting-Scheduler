import { test, expect } from '@playwright/test';

/**
 * Full value-stream happy path (team.md Gate 2): create meeting → build
 * agenda → add attendees → preview → export PDF. Runs across every
 * configured project (Chromium/Firefox/WebKit desktop + mobile-chrome/
 * mobile-safari) per playwright.config.ts — no per-browser branching
 * needed here, Playwright fans this one spec out across all 5 itself.
 *
 * Card-export assertion depth follows the affirmed lighter "didn't crash"
 * check (project.md Forbidden): we assert the success confirmation fires,
 * never parse the PDF's text/QR content.
 */

test('create a meeting, build its agenda and attendee list, preview the card, and export the PDF', async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => consoleErrors.push(`[pageerror] ${err.message}`));

  await page.goto('/');

  // Start from the Meetings List (empty on a fresh browser profile) and open the create flow.
  // Generous timeout: the whole app is a next/dynamic({ssr:false}) client-only
  // chunk (app/page.tsx), so first paint includes both the chunk download and
  // the initial IndexedDB open — cold headless starts can exceed the 5s default.
  await expect(
    page.getByTestId('meetings-list-empty').or(page.getByTestId('meetings-list')),
  ).toBeVisible({ timeout: 15_000 });
  const newMeetingLink = page
    .getByTestId('new-meeting-link')
    .or(page.getByTestId('empty-state-new-meeting-button').locator('..'));
  await newMeetingLink.first().click();
  await expect(page).toHaveURL(/\/meeting\/new/);

  // Meeting details (BR1.1/BR1.2).
  await page.getByTestId('meeting-title-input').fill('Q3 Planning Sync');
  await page.getByTestId('meeting-description-input').fill('Quarterly planning kickoff.');
  await page.getByTestId('meeting-date-input').fill('2026-11-05');
  await page.getByTestId('meeting-start-time-input').fill('10:00');
  await page.getByTestId('meeting-end-time-input').fill('11:00');
  await page.getByTestId('meeting-link-input').fill('https://meet.example.com/q3-planning');
  await page.getByTestId('host-name-input').fill('Jordan Lee');
  await page.getByTestId('host-role-org-input').fill('Program Manager, Acme Inc.');
  await page.getByTestId('host-email-input').fill('jordan.lee@example.com');

  // Agenda builder (FR2.1, BR2.2/BR2.3). Added items render as an editable
  // row (topic held in an <input value>, not plain text), so assert on the
  // row's input value rather than toContainText.
  await page.getByTestId('new-agenda-topic-input').fill('Roadmap review');
  await page.getByTestId('add-agenda-item-button').click();
  await expect(page.getByTestId('agenda-empty-state')).toHaveCount(0);
  await expect(page.locator('[data-testid^="agenda-topic-input-"]').first()).toHaveValue('Roadmap review');

  // Attendee management (FR3.1, BR3.2-3.4). Same rationale as agenda above.
  await page.getByTestId('new-attendee-name-input').fill('Alex Rivera');
  await page.getByTestId('new-attendee-email-input').fill('alex.rivera@example.com');
  await page.getByTestId('add-attendee-button').click();
  await expect(page.getByTestId('attendee-empty-state')).toHaveCount(0);
  await expect(page.locator('[data-testid^="attendee-name-input-"]').first()).toHaveValue('Alex Rivera');

  // Live card preview reflects the draft (NFR1.1) — routed through
  // Scheduling.renderPreview(), never a direct CardGeneration import.
  await expect(page.getByTestId('live-card-preview')).toBeVisible();
  await expect(page.getByTestId('live-card-preview')).toContainText('Q3 Planning Sync');

  // Save, then export the invitation card (FR5.1-FR5.3, BR5.1/BR5.2).
  await page.getByTestId('save-meeting-button').click();
  await expect(page).toHaveURL(/^http:\/\/localhost:3000\/?$/);
  await expect(page.getByTestId('meetings-list')).toContainText('Q3 Planning Sync');

  // Row testids are suffixed with the meeting's client-generated UUID
  // (entities.md), so select by the stable prefix rather than a literal id.
  await page.locator('[data-testid^="meeting-row-open-"]').first().click();
  await expect(page).toHaveURL(/\/meeting\/.+\/edit/);

  await page.getByTestId('export-pdf-button').click();
  try {
    await expect(page.getByTestId('export-success-message')).toBeVisible({ timeout: 10_000 });
  } catch (e) {
    // Surface captured console/page errors in the test report — this is
    // exactly what caught two real CSP-vs-runtime incompatibilities during
    // this stage (see build-and-test-summary.md): they never threw in
    // Vitest/jsdom, only in a real browser enforcing the CSP.
    console.log('Console/page errors at failure:', JSON.stringify(consoleErrors, null, 2));
    throw e;
  }
});
