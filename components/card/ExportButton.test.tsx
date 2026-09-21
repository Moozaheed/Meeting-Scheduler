import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Scheduling } from '@/lib/store/scheduling-store';
import { buildAgendaItem, buildMeeting } from '@/lib/store/test-fixtures';

import { ExportButton } from '@/components/card/ExportButton';

/**
 * "Didn't crash" depth (project.md Forbidden): assert generation completes
 * without throwing and produces a non-empty PDF — never parse the PDF's
 * text content or decode a QR payload to assert exact data.
 */
describe('ExportButton', () => {
  it('exports a real, non-empty PDF via Scheduling.exportCard and shows a success confirmation', async () => {
    const user = userEvent.setup();
    const meeting = buildMeeting({ id: 'export-1' });
    const agendaItems = [buildAgendaItem({ meetingId: 'export-1' })];
    const exportCard = () => Scheduling.exportCard(meeting, agendaItems);

    render(<ExportButton onExport={exportCard} />);
    await user.click(screen.getByTestId('export-pdf-button'));

    await waitFor(() => expect(screen.getByTestId('export-success-message')).toBeInTheDocument(), {
      timeout: 5000,
    });
  });

  it('shows a loading state while the export is in progress', async () => {
    const user = userEvent.setup();
    let resolveExport: (blob: Blob) => void = () => undefined;
    const onExport = vi.fn(() => new Promise<Blob>((resolve) => { resolveExport = resolve; }));

    render(<ExportButton onExport={onExport} />);
    await user.click(screen.getByTestId('export-pdf-button'));

    expect(screen.getByText('Generating…')).toBeInTheDocument();
    expect(screen.getByTestId('export-pdf-button')).toBeDisabled();

    resolveExport(new Blob(['pdf-bytes'], { type: 'application/pdf' }));
    await waitFor(() => expect(screen.getByTestId('export-success-message')).toBeInTheDocument());
  });

  it('shows an actionable, retryable error banner when export fails (FR5.5) — never a silent no-op', async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const onExport = vi.fn().mockRejectedValue(new Error('render failed'));

    render(<ExportButton onExport={onExport} />);
    await user.click(screen.getByTestId('export-pdf-button'));

    await waitFor(() => expect(screen.getByTestId('export-error-banner')).toHaveTextContent('PDF export failed — Try again'));
    expect(screen.getByTestId('export-pdf-button')).not.toBeDisabled();

    // Retryable: clicking again invokes onExport a second time, not a silent no-op.
    await user.click(screen.getByTestId('export-pdf-button'));
    expect(onExport).toHaveBeenCalledTimes(2);

    consoleErrorSpy.mockRestore();
  });
});
