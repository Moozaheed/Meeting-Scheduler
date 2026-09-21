'use client';

import { X } from 'lucide-react';

import type { AttendeeDraft } from '@/types/domain';

interface AttendeeRowProps {
  attendee: AttendeeDraft;
  onChange: (id: string, changes: Partial<Pick<AttendeeDraft, 'name' | 'email' | 'role'>>) => void;
  onRemove: (id: string) => void;
  emailError?: string;
}

/** One editable attendee entry (FR3.1). */
export function AttendeeRow({ attendee, onChange, onRemove, emailError }: AttendeeRowProps) {
  return (
    <div
      className="flex flex-col gap-2 rounded-md border border-gray-200 p-3 sm:flex-row sm:items-start"
      data-testid={`attendee-row-${attendee.id}`}
    >
      <div className="flex-1">
        <label htmlFor={`attendee-name-${attendee.id}`} className="sr-only">
          Name
        </label>
        <input
          id={`attendee-name-${attendee.id}`}
          type="text"
          value={attendee.name}
          onChange={(event) => onChange(attendee.id, { name: event.target.value })}
          placeholder="Name"
          className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
          data-testid={`attendee-name-input-${attendee.id}`}
        />
      </div>
      <div className="flex-1">
        <label htmlFor={`attendee-email-${attendee.id}`} className="sr-only">
          Email
        </label>
        <input
          id={`attendee-email-${attendee.id}`}
          type="email"
          value={attendee.email}
          onChange={(event) => onChange(attendee.id, { email: event.target.value })}
          placeholder="Email"
          aria-invalid={Boolean(emailError)}
          aria-describedby={emailError ? `attendee-email-error-${attendee.id}` : undefined}
          className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
          data-testid={`attendee-email-input-${attendee.id}`}
        />
        {emailError && (
          <p
            id={`attendee-email-error-${attendee.id}`}
            role="alert"
            aria-live="polite"
            className="mt-1 text-xs text-red-600"
            data-testid={`attendee-email-error-${attendee.id}`}
          >
            {emailError}
          </p>
        )}
      </div>
      <div className="w-full sm:w-36">
        <label htmlFor={`attendee-role-${attendee.id}`} className="sr-only">
          Role
        </label>
        <input
          id={`attendee-role-${attendee.id}`}
          type="text"
          value={attendee.role}
          onChange={(event) => onChange(attendee.id, { role: event.target.value })}
          placeholder="Role (optional)"
          className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
          data-testid={`attendee-role-input-${attendee.id}`}
        />
      </div>
      <button
        type="button"
        onClick={() => onRemove(attendee.id)}
        aria-label={`Remove ${attendee.name || 'attendee'}`}
        className="rounded p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600"
        data-testid={`attendee-remove-${attendee.id}`}
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
