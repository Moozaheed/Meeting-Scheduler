import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PersistenceAdapter } from '@/lib/persistence/persistence-adapter';
import { Scheduling } from '@/lib/store/scheduling-store';
import { buildMeetingRecord } from '@/lib/store/test-fixtures';

import { MeetingsListPage } from '@/components/meeting/MeetingsListPage';

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

describe('MeetingsListPage', () => {
  beforeEach(async () => {
    pushMock.mockClear();
    await Scheduling.clearAllData();
  });

  it('shows the empty state when there are no meetings', async () => {
    render(<MeetingsListPage />);

    await waitFor(() => expect(screen.getByTestId('meetings-list-empty')).toBeInTheDocument());
  });

  it('lists saved meetings sorted newest-first (BR4.1)', async () => {
    const older = buildMeetingRecord({
      meeting: {
        ...buildMeetingRecord().meeting,
        id: 'older',
        title: 'Older Meeting',
        date: '2026-09-01',
        startTime: '09:00',
      },
    });
    const newer = buildMeetingRecord({
      meeting: {
        ...buildMeetingRecord().meeting,
        id: 'newer',
        title: 'Newer Meeting',
        date: '2026-10-01',
        startTime: '09:00',
      },
    });
    await PersistenceAdapter.save(older);
    await PersistenceAdapter.save(newer);

    render(<MeetingsListPage />);

    await waitFor(() => expect(screen.getByTestId('meetings-list')).toBeInTheDocument());
    const rows = screen.getAllByRole('listitem');
    expect(rows[0]).toHaveTextContent('Newer Meeting');
    expect(rows[1]).toHaveTextContent('Older Meeting');
  });

  it('deletes a meeting after confirmation, cascading its agenda/attendees (BR4.2)', async () => {
    const user = userEvent.setup();
    const record = buildMeetingRecord({
      meeting: { ...buildMeetingRecord().meeting, id: 'to-delete', title: 'Delete Me' },
    });
    await PersistenceAdapter.save(record);

    render(<MeetingsListPage />);
    await waitFor(() => expect(screen.getByTestId('meeting-row-delete-to-delete')).toBeInTheDocument());

    await user.click(screen.getByTestId('meeting-row-delete-to-delete'));
    await user.click(screen.getByTestId('delete-confirm-button'));

    await waitFor(() => expect(screen.getByTestId('meetings-list-empty')).toBeInTheDocument());
    expect(await PersistenceAdapter.load('to-delete')).toBeNull();
  });

  it('navigates to the edit route when a meeting row is opened', async () => {
    const user = userEvent.setup();
    const record = buildMeetingRecord({
      meeting: { ...buildMeetingRecord().meeting, id: 'to-open', title: 'Open Me' },
    });
    await PersistenceAdapter.save(record);

    render(<MeetingsListPage />);
    await waitFor(() => expect(screen.getByTestId('meeting-row-open-to-open')).toBeInTheDocument());

    await user.click(screen.getByTestId('meeting-row-open-to-open'));

    expect(pushMock).toHaveBeenCalledWith('/meeting/to-open/edit');
  });

  it('clears all stored data after the "Clear my data" confirmation (BR6.1)', async () => {
    const user = userEvent.setup();
    const record = buildMeetingRecord({
      meeting: { ...buildMeetingRecord().meeting, id: 'to-clear', title: 'Clear Me' },
    });
    await PersistenceAdapter.save(record);

    render(<MeetingsListPage />);
    await waitFor(() => expect(screen.getByTestId('meeting-row-to-clear')).toBeInTheDocument());

    await user.click(screen.getByTestId('clear-my-data-button'));
    await user.click(screen.getByTestId('clear-data-confirm-button'));

    await waitFor(() => expect(screen.getByTestId('meetings-list-empty')).toBeInTheDocument());
    expect(await PersistenceAdapter.list()).toEqual([]);
  });

  it('shows a non-blocking notice and does not crash when loading meetings fails (NFR4.1)', async () => {
    const listSpy = vi.spyOn(PersistenceAdapter, 'list').mockRejectedValueOnce(new Error('storage unavailable'));

    render(<MeetingsListPage />);

    await waitFor(() => expect(screen.getByTestId('meetings-load-error')).toBeInTheDocument());
    // Degrades gracefully: the rest of the page (header, new-meeting action) still renders.
    expect(screen.getByTestId('new-meeting-button')).toBeInTheDocument();

    listSpy.mockRestore();
  });
});
