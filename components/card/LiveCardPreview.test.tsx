import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Scheduling } from '@/lib/store/scheduling-store';
import { buildMeetingDraft } from '@/lib/store/test-fixtures';

import { LiveCardPreview } from '@/components/card/LiveCardPreview';

/**
 * These tests exercise the real qrcode.react + @react-pdf/renderer render
 * path (Scheduling.renderPreview is not mocked here), at the affirmed
 * "didn't crash" depth — no PDF-text or QR-payload content assertions
 * (project.md Forbidden).
 */
describe('LiveCardPreview', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('updates the preview after the ~300ms debounce with a real Scheduling.renderPreview render', async () => {
    const draft = buildMeetingDraft({ title: 'Debounced Title' });
    render(<LiveCardPreview draft={draft} renderPreview={(d) => Scheduling.renderPreview(d)} />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(350);
    });

    await waitFor(() => expect(screen.getByTestId('live-card-preview-card')).toBeInTheDocument());
    expect(screen.getByText('Debounced Title')).toBeInTheDocument();
  });

  it('resolves and renders a QR code for both the meeting-link and in-app deep-link fallback payloads (BR5.1)', async () => {
    const withLink = buildMeetingDraft({ title: 'Has Link', meetingLink: 'https://example.com/join' });
    const { rerender } = render(
      <LiveCardPreview draft={withLink} renderPreview={(d) => Scheduling.renderPreview(d)} />,
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(350);
    });
    await waitFor(() => expect(screen.getByTestId('live-card-preview-qr')).toBeInTheDocument());

    const withoutLink = buildMeetingDraft({ title: 'No Link', meetingLink: '', location: 'Room 1' });
    rerender(<LiveCardPreview draft={withoutLink} renderPreview={(d) => Scheduling.renderPreview(d)} />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(350);
    });
    await waitFor(() => expect(screen.getByTestId('live-card-preview-qr')).toBeInTheDocument());
  });

  it('catches a rendering exception in the preview subtree via its error boundary, without crashing the rest of the UI', async () => {
    const ThrowingPreview = () => {
      throw new Error('boom');
    };
    // Silence the expected console.error from React's own error-boundary logging for this test.
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    render(<LiveCardPreview draft={buildMeetingDraft()} renderPreview={() => <ThrowingPreview />} />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(350);
    });

    await waitFor(() => expect(screen.getByTestId('card-error-boundary-fallback')).toBeInTheDocument());

    consoleErrorSpy.mockRestore();
  });
});
