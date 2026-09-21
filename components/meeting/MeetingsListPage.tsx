'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Scheduling, useMeetingsList } from '@/lib/store/scheduling-store';

import { ClearMyDataAction } from '@/components/meeting/ClearMyDataAction';
import { MeetingListRow } from '@/components/meeting/MeetingListRow';
import { Button } from '@/components/ui/Button';

/** The Meetings List (route: /) — FR4.1. */
export function MeetingsListPage() {
  const router = useRouter();
  const { meetings, isLoading, loadError, refresh } = useMeetingsList();

  const handleDelete = async (id: string) => {
    await Scheduling.deleteMeeting(id);
    await refresh();
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Your meetings</h1>
        <Link href="/meeting/new" data-testid="new-meeting-link">
          <Button data-testid="new-meeting-button">
            <Plus size={16} aria-hidden="true" /> New Meeting
          </Button>
        </Link>
      </header>

      {loadError && (
        <p role="status" className="rounded-md bg-amber-50 p-3 text-sm text-amber-800" data-testid="meetings-load-error">
          {loadError} Showing what we can.
        </p>
      )}

      {isLoading ? (
        <p className="text-sm text-gray-500" data-testid="meetings-list-loading">
          Loading your meetings…
        </p>
      ) : meetings.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center" data-testid="meetings-list-empty">
          <p className="text-gray-500">No meetings yet.</p>
          <Link href="/meeting/new" className="mt-3 inline-block">
            <Button data-testid="empty-state-new-meeting-button">
              <Plus size={16} aria-hidden="true" /> New Meeting
            </Button>
          </Link>
        </div>
      ) : (
        <ul className="space-y-2" data-testid="meetings-list" aria-label="Meetings">
          {meetings.map((meeting) => (
            <MeetingListRow
              key={meeting.id}
              meeting={meeting}
              onOpen={(id) => router.push(`/meeting/${id}/edit`)}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}

      <ClearMyDataAction onCleared={refresh} />
    </div>
  );
}
