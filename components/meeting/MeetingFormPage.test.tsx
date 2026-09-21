import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PersistenceAdapter, PersistenceError } from '@/lib/persistence/persistence-adapter';
import { Scheduling } from '@/lib/store/scheduling-store';
import { buildMeetingRecord } from '@/lib/store/test-fixtures';

import { MeetingFormPage } from '@/components/meeting/MeetingFormPage';

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

async function fillRequiredFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByTestId('meeting-title-input'), 'Sprint Review');
  await user.type(screen.getByTestId('meeting-date-input'), '2026-10-05');
  await user.type(screen.getByTestId('meeting-start-time-input'), '09:00');
  await user.type(screen.getByTestId('meeting-end-time-input'), '10:00');
  await user.type(screen.getByTestId('meeting-location-input'), 'Room 2');
  await user.clear(screen.getByTestId('host-name-input'));
  await user.type(screen.getByTestId('host-name-input'), 'Sam Host');
  await user.clear(screen.getByTestId('host-email-input'));
  await user.type(screen.getByTestId('host-email-input'), 'sam@example.com');
}

describe('MeetingFormPage', () => {
  beforeEach(async () => {
    pushMock.mockClear();
    await Scheduling.clearAllData();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('saves a valid new meeting and navigates back to the Meetings List', async () => {
    const user = userEvent.setup();
    render(<MeetingFormPage />);

    await fillRequiredFields(user);
    await user.click(screen.getByTestId('save-meeting-button'));

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/'));
    const saved = await PersistenceAdapter.list();
    expect(saved).toHaveLength(1);
    expect(saved[0].meeting.title).toBe('Sprint Review');
  });

  it('shows a field error only after that field has been blurred (progressive validation, BR1.1)', async () => {
    const user = userEvent.setup();
    render(<MeetingFormPage />);

    expect(screen.queryByTestId('meeting-title-error')).not.toBeInTheDocument();

    await user.click(screen.getByTestId('meeting-title-input'));
    await user.tab();

    expect(screen.getByTestId('meeting-title-error')).toBeInTheDocument();
    expect(screen.queryByTestId('host-email-error')).not.toBeInTheDocument();
  });

  it('pre-fills the form from an existing meeting when editing', async () => {
    const record = buildMeetingRecord({
      meeting: { ...buildMeetingRecord().meeting, id: 'edit-me', title: 'Existing Meeting', location: 'HQ' },
    });
    await PersistenceAdapter.save(record);

    render(<MeetingFormPage meetingId="edit-me" />);

    await waitFor(() => expect(screen.getByTestId('meeting-title-input')).toHaveValue('Existing Meeting'));
    expect(screen.getByTestId('meeting-location-input')).toHaveValue('HQ');
  });

  it('shows the in-memory session-fallback notice and still returns to the list when persistence fails (NFR4.1)', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const saveSpy = vi
      .spyOn(PersistenceAdapter, 'save')
      .mockRejectedValueOnce(new PersistenceError('quota-exceeded', 'full'));
    const user = userEvent.setup({ delay: null });

    render(<MeetingFormPage />);
    await fillRequiredFields(user);
    await user.click(screen.getByTestId('save-meeting-button'));

    await waitFor(() => expect(screen.getByTestId('save-fallback-notice')).toBeInTheDocument());

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2100);
    });
    expect(pushMock).toHaveBeenCalledWith('/');

    saveSpy.mockRestore();
    vi.useRealTimers();
  });

  it('disables the Export PDF button until the meeting has been saved', async () => {
    render(<MeetingFormPage />);

    expect(screen.getByTestId('export-pdf-button')).toBeDisabled();
  });
});
