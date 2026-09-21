'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';

import { useAttendees } from '@/lib/store/scheduling-store';
import type { AttendeeDraft } from '@/types/domain';

import { AttendeeRow } from '@/components/attendees/AttendeeRow';
import { Button } from '@/components/ui/Button';

interface AttendeeManagerProps {
  attendees: AttendeeDraft[];
  onChange: (attendees: AttendeeDraft[]) => void;
}

/**
 * Attendee management (FR3.1) — add/edit/remove attendees. A Meeting may
 * have zero attendees (BR3.1); duplicate emails within one meeting are
 * blocked (BR3.3, BR3.2 checked together on add and on email blur).
 */
export function AttendeeManager({ attendees, onChange }: AttendeeManagerProps) {
  const { attendees: list, add, edit, remove, validateEmail } = useAttendees(attendees, onChange);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('');
  const [addError, setAddError] = useState<{ field: 'name' | 'email'; message: string } | undefined>(undefined);
  const [emailErrors, setEmailErrors] = useState<Record<string, string | undefined>>({});

  const handleAdd = () => {
    const result = add(newName, newEmail, newRole);
    if (!result.ok) {
      setAddError({ field: result.field, message: result.error });
      return;
    }
    setAddError(undefined);
    setNewName('');
    setNewEmail('');
    setNewRole('');
  };

  return (
    <div className="space-y-3" data-testid="attendee-manager">
      <h3 className="text-lg font-semibold text-gray-900">Attendees</h3>

      {list.length === 0 && (
        <p className="text-sm text-gray-500" data-testid="attendee-empty-state">
          No attendees yet — attendee management is optional.
        </p>
      )}

      <div className="space-y-2">
        {list.map((attendee) => (
          <AttendeeRow
            key={attendee.id}
            attendee={attendee}
            onChange={(id, changes) => {
              edit(id, changes);
              if (changes.email !== undefined) {
                setEmailErrors((prev) => ({ ...prev, [id]: undefined }));
              }
            }}
            onRemove={remove}
            emailError={emailErrors[attendee.id]}
          />
        ))}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <div className="flex-1">
          <label htmlFor="new-attendee-name" className="sr-only">
            New attendee name
          </label>
          <input
            id="new-attendee-name"
            type="text"
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            placeholder="Name"
            aria-invalid={addError?.field === 'name'}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            data-testid="new-attendee-name-input"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="new-attendee-email" className="sr-only">
            New attendee email
          </label>
          <input
            id="new-attendee-email"
            type="email"
            value={newEmail}
            onChange={(event) => setNewEmail(event.target.value)}
            onBlur={() => {
              if (newEmail.trim() === '') return;
              const error = validateEmail('', newEmail);
              setAddError(error ? { field: 'email', message: error } : undefined);
            }}
            placeholder="Email"
            aria-invalid={addError?.field === 'email'}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            data-testid="new-attendee-email-input"
          />
        </div>
        <div className="w-full sm:w-36">
          <label htmlFor="new-attendee-role" className="sr-only">
            New attendee role
          </label>
          <input
            id="new-attendee-role"
            type="text"
            value={newRole}
            onChange={(event) => setNewRole(event.target.value)}
            placeholder="Role (optional)"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            data-testid="new-attendee-role-input"
          />
        </div>
        <Button variant="secondary" onClick={handleAdd} data-testid="add-attendee-button">
          <Plus size={16} aria-hidden="true" /> Add attendee
        </Button>
      </div>
      {addError && (
        <p role="alert" className="text-xs text-red-600" data-testid="new-attendee-error">
          {addError.message}
        </p>
      )}
    </div>
  );
}
