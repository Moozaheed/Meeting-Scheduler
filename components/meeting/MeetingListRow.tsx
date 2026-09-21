'use client';

import { Trash2 } from 'lucide-react';
import { useState } from 'react';

import type { MeetingSummary } from '@/types/domain';

import { DeleteConfirmation } from '@/components/meeting/DeleteConfirmation';

interface MeetingListRowProps {
  meeting: MeetingSummary;
  onOpen: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
}

/** One row in the Meetings List showing a saved meeting's summary (FR4.1). */
export function MeetingListRow({ meeting, onOpen, onDelete }: MeetingListRowProps) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    await onDelete(meeting.id);
    setIsDeleting(false);
    setIsConfirmingDelete(false);
  };

  if (isConfirmingDelete) {
    return (
      <li data-testid={`meeting-row-${meeting.id}`}>
        <DeleteConfirmation
          title={meeting.title}
          onConfirm={handleConfirmDelete}
          onCancel={() => setIsConfirmingDelete(false)}
          isDeleting={isDeleting}
        />
      </li>
    );
  }

  return (
    <li
      className="group flex items-center justify-between gap-4 rounded-md border border-gray-200 p-3 hover:bg-gray-50 focus-within:ring-2 focus-within:ring-brand-500"
      data-testid={`meeting-row-${meeting.id}`}
    >
      <button
        type="button"
        onClick={() => onOpen(meeting.id)}
        aria-label={`Open ${meeting.title}, ${meeting.date}`}
        className="flex flex-1 flex-col items-start text-left sm:flex-row sm:items-center sm:justify-between"
        data-testid={`meeting-row-open-${meeting.id}`}
      >
        <span className="font-medium text-gray-900">{meeting.title}</span>
        <span className="text-sm text-gray-500">
          {meeting.date} · {meeting.startTime}–{meeting.endTime} · {meeting.attendeeCount} attendee
          {meeting.attendeeCount === 1 ? '' : 's'} ·{' '}
          <span
            className={meeting.status === 'past' ? 'text-gray-400' : 'text-brand-600'}
            data-testid={`meeting-row-status-${meeting.id}`}
          >
            {meeting.status === 'past' ? 'Past' : 'Upcoming'}
          </span>
        </span>
      </button>
      <button
        type="button"
        onClick={() => setIsConfirmingDelete(true)}
        aria-label={`Delete ${meeting.title}`}
        className="rounded p-2 text-gray-400 opacity-0 hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 focus:opacity-100"
        data-testid={`meeting-row-delete-${meeting.id}`}
      >
        <Trash2 size={16} aria-hidden="true" />
      </button>
    </li>
  );
}
