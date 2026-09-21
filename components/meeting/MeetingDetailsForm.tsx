'use client';

import type { ChangeEvent } from 'react';

import type { MeetingDraft, ValidationErrors } from '@/types/domain';

import { FieldError } from '@/components/ui/FieldError';

type TextField = Exclude<keyof MeetingDraft, 'agendaItems' | 'attendees'>;

interface MeetingDetailsFormProps {
  draft: MeetingDraft;
  errors: ValidationErrors;
  onFieldChange: (field: TextField, value: string) => void;
  onFieldBlur: (field: TextField) => void;
}

/**
 * Meeting details fields (FR1.1). Field-level inline validation (BR1.1's
 * required-field checks and BR1.2's link-or-location pairing are re-checked
 * together at save time; BR1.3/BR1.4 also validate on blur).
 */
export function MeetingDetailsForm({ draft, errors, onFieldChange, onFieldBlur }: MeetingDetailsFormProps) {
  const change = (field: TextField) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    onFieldChange(field, event.target.value);
  const blur = (field: TextField) => () => onFieldBlur(field);

  return (
    <fieldset className="space-y-4" data-testid="meeting-details-form">
      <legend className="text-lg font-semibold text-gray-900">Meeting details</legend>

      <div>
        <label htmlFor="meeting-title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          id="meeting-title"
          type="text"
          value={draft.title}
          onChange={change('title')}
          onBlur={blur('title')}
          aria-describedby={errors.title ? 'meeting-title-error' : undefined}
          aria-invalid={Boolean(errors.title)}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          data-testid="meeting-title-input"
        />
        <FieldError id="meeting-title-error" message={errors.title} />
      </div>

      <div>
        <label htmlFor="meeting-description" className="block text-sm font-medium text-gray-700">
          Purpose / description (optional)
        </label>
        <textarea
          id="meeting-description"
          value={draft.description}
          onChange={change('description')}
          onBlur={blur('description')}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          data-testid="meeting-description-input"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="meeting-date" className="block text-sm font-medium text-gray-700">
            Date
          </label>
          <input
            id="meeting-date"
            type="date"
            value={draft.date}
            onChange={change('date')}
            onBlur={blur('date')}
            aria-describedby={errors.date ? 'meeting-date-error' : undefined}
            aria-invalid={Boolean(errors.date)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            data-testid="meeting-date-input"
          />
          <FieldError id="meeting-date-error" message={errors.date} />
        </div>
        <div>
          <label htmlFor="meeting-start-time" className="block text-sm font-medium text-gray-700">
            Start time
          </label>
          <input
            id="meeting-start-time"
            type="time"
            value={draft.startTime}
            onChange={change('startTime')}
            onBlur={blur('startTime')}
            aria-describedby={errors.startTime ? 'meeting-start-time-error' : undefined}
            aria-invalid={Boolean(errors.startTime)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            data-testid="meeting-start-time-input"
          />
          <FieldError id="meeting-start-time-error" message={errors.startTime} />
        </div>
        <div>
          <label htmlFor="meeting-end-time" className="block text-sm font-medium text-gray-700">
            End time
          </label>
          <input
            id="meeting-end-time"
            type="time"
            value={draft.endTime}
            onChange={change('endTime')}
            onBlur={blur('endTime')}
            aria-describedby={errors.endTime ? 'meeting-end-time-error' : undefined}
            aria-invalid={Boolean(errors.endTime)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            data-testid="meeting-end-time-input"
          />
          <FieldError id="meeting-end-time-error" message={errors.endTime} />
        </div>
      </div>

      <div>
        <label htmlFor="meeting-timezone" className="block text-sm font-medium text-gray-700">
          Timezone
        </label>
        <input
          id="meeting-timezone"
          type="text"
          value={draft.timezone}
          onChange={change('timezone')}
          onBlur={blur('timezone')}
          aria-describedby={errors.timezone ? 'meeting-timezone-error' : undefined}
          aria-invalid={Boolean(errors.timezone)}
          placeholder="America/New_York"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          data-testid="meeting-timezone-input"
        />
        <FieldError id="meeting-timezone-error" message={errors.timezone} />
      </div>

      <div>
        <label htmlFor="meeting-link" className="block text-sm font-medium text-gray-700">
          Meeting link
        </label>
        <input
          id="meeting-link"
          type="url"
          value={draft.meetingLink}
          onChange={change('meetingLink')}
          onBlur={blur('meetingLink')}
          aria-describedby={errors.meetingLink ? 'meeting-link-error' : undefined}
          aria-invalid={Boolean(errors.meetingLink)}
          placeholder="https://…"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          data-testid="meeting-link-input"
        />
        <FieldError id="meeting-link-error" message={errors.meetingLink} />
      </div>

      <div>
        <label htmlFor="meeting-location" className="block text-sm font-medium text-gray-700">
          Location
        </label>
        <input
          id="meeting-location"
          type="text"
          value={draft.location}
          onChange={change('location')}
          onBlur={blur('location')}
          aria-describedby={errors.location ? 'meeting-location-error' : undefined}
          aria-invalid={Boolean(errors.location)}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          data-testid="meeting-location-input"
        />
        <FieldError id="meeting-location-error" message={errors.location} />
        <p className="mt-1 text-xs text-gray-500">At least a meeting link or a location is required.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="host-name" className="block text-sm font-medium text-gray-700">
            Host name
          </label>
          <input
            id="host-name"
            type="text"
            value={draft.hostName}
            onChange={change('hostName')}
            onBlur={blur('hostName')}
            aria-describedby={errors.hostName ? 'host-name-error' : undefined}
            aria-invalid={Boolean(errors.hostName)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            data-testid="host-name-input"
          />
          <FieldError id="host-name-error" message={errors.hostName} />
        </div>
        <div>
          <label htmlFor="host-role-org" className="block text-sm font-medium text-gray-700">
            Role / organization (optional)
          </label>
          <input
            id="host-role-org"
            type="text"
            value={draft.hostRoleOrg}
            onChange={change('hostRoleOrg')}
            onBlur={blur('hostRoleOrg')}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            data-testid="host-role-org-input"
          />
        </div>
      </div>

      <div>
        <label htmlFor="host-email" className="block text-sm font-medium text-gray-700">
          Host contact email
        </label>
        <input
          id="host-email"
          type="email"
          value={draft.hostEmail}
          onChange={change('hostEmail')}
          onBlur={blur('hostEmail')}
          aria-describedby={errors.hostEmail ? 'host-email-error' : undefined}
          aria-invalid={Boolean(errors.hostEmail)}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          data-testid="host-email-input"
        />
        <FieldError id="host-email-error" message={errors.hostEmail} />
        <p className="mt-1 text-xs text-gray-500">Stored only on this device.</p>
      </div>
    </fieldset>
  );
}
