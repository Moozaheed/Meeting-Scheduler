'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { validateMeetingDraft } from '@/lib/store/scheduling-rules';
import { useMeeting } from '@/lib/store/scheduling-store';
import type { MeetingDraft, ValidationErrors } from '@/types/domain';

import { AgendaBuilder } from '@/components/agenda/AgendaBuilder';
import { AttendeeManager } from '@/components/attendees/AttendeeManager';
import { ExportButton } from '@/components/card/ExportButton';
import { LiveCardPreview } from '@/components/card/LiveCardPreview';
import { MeetingDetailsForm } from '@/components/meeting/MeetingDetailsForm';
import { Button } from '@/components/ui/Button';

interface MeetingFormPageProps {
  /** Route param; absent = create mode. */
  meetingId?: string;
}

type TextField = Exclude<keyof MeetingDraft, 'agendaItems' | 'attendees'>;

function emptyDraft(): MeetingDraft {
  const timezone =
    typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC';
  return {
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    timezone,
    meetingLink: '',
    location: '',
    hostName: '',
    hostRoleOrg: '',
    hostEmail: '',
    agendaItems: [],
    attendees: [],
  };
}

/** The Create/Edit Meeting screen (routes: /meeting/new, /meeting/:id/edit). */
export function MeetingFormPage({ meetingId }: MeetingFormPageProps) {
  const router = useRouter();
  const { meeting, agendaItems, attendees, isLoading, loadError, save, renderPreview, exportCard } =
    useMeeting(meetingId);

  const [draft, setDraft] = useState<MeetingDraft>(emptyDraft);
  const [touchedFields, setTouchedFields] = useState<Set<TextField>>(new Set());
  const [hasAttemptedSave, setHasAttemptedSave] = useState(false);
  const [initializedFromMeeting, setInitializedFromMeeting] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (meeting && !initializedFromMeeting) {
      setDraft({
        title: meeting.title,
        description: meeting.description,
        date: meeting.date,
        startTime: meeting.startTime,
        endTime: meeting.endTime,
        timezone: meeting.timezone,
        meetingLink: meeting.meetingLink,
        location: meeting.location,
        hostName: meeting.hostName,
        hostRoleOrg: meeting.hostRoleOrg,
        hostEmail: meeting.hostEmail,
        agendaItems: agendaItems.map(({ id, topic, speaker, durationMinutes, order }) => ({
          id,
          topic,
          speaker,
          durationMinutes,
          order,
        })),
        attendees: attendees.map(({ id, name, email, role }) => ({ id, name, email, role })),
      });
      setInitializedFromMeeting(true);
    }
  }, [meeting, agendaItems, attendees, initializedFromMeeting]);

  const errors: ValidationErrors = useMemo(() => {
    const allErrors = validateMeetingDraft(draft);
    if (hasAttemptedSave) return allErrors;
    const visible: ValidationErrors = {};
    for (const field of Object.keys(allErrors)) {
      // Keys iterated here come only from Object.keys(allErrors) itself (validateMeetingDraft's
      // own fixed set of MeetingDraft field names) — never from user-controlled input.
      // eslint-disable-next-line security/detect-object-injection
      if (touchedFields.has(field as TextField)) visible[field] = allErrors[field];
    }
    return visible;
  }, [draft, touchedFields, hasAttemptedSave]);

  const handleFieldChange = (field: TextField, value: string) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleFieldBlur = (field: TextField) => {
    setTouchedFields((prev) => new Set(prev).add(field));
  };

  const handleSave = async () => {
    setHasAttemptedSave(true);
    setIsSaving(true);
    try {
      const result = await save(draft);
      if (result.status === 'invalid') {
        setTouchedFields(new Set(Object.keys(result.errors) as TextField[]));
        return;
      }
      if (result.status === 'saved-in-memory') {
        setSaveNotice(result.notice);
        setTimeout(() => router.push('/'), 2000);
        return;
      }
      router.push('/');
    } finally {
      setIsSaving(false);
    }
  };

  if (meetingId && isLoading) {
    return (
      <div className="p-6 text-sm text-gray-500" data-testid="meeting-form-loading">
        Loading meeting…
      </div>
    );
  }

  if (meetingId && loadError) {
    return (
      <div className="p-6 text-sm text-red-600" role="alert" data-testid="meeting-form-load-error">
        {loadError}
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 p-6 lg:grid-cols-2">
      <div className="space-y-8">
        <h1 className="text-2xl font-bold text-gray-900">{meetingId ? 'Edit meeting' : 'New meeting'}</h1>

        {saveNotice && (
          <p role="status" className="rounded-md bg-amber-50 p-3 text-sm text-amber-800" data-testid="save-fallback-notice">
            {saveNotice}
          </p>
        )}

        <MeetingDetailsForm
          draft={draft}
          errors={errors}
          onFieldChange={handleFieldChange}
          onFieldBlur={handleFieldBlur}
        />

        <AgendaBuilder
          items={draft.agendaItems}
          onChange={(items) => setDraft((prev) => ({ ...prev, agendaItems: items }))}
        />

        <AttendeeManager
          attendees={draft.attendees}
          onChange={(items) => setDraft((prev) => ({ ...prev, attendees: items }))}
        />

        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={isSaving} data-testid="save-meeting-button">
            {isSaving ? 'Saving…' : 'Save meeting'}
          </Button>
          <ExportButton onExport={exportCard} disabled={!meeting} />
        </div>
      </div>

      <div className="lg:sticky lg:top-6 lg:self-start">
        <LiveCardPreview draft={draft} renderPreview={renderPreview} />
      </div>
    </div>
  );
}
