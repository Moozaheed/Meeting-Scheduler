'use client';

/**
 * Scheduling — the domain/state layer (ADR-001). Owns Meeting, AgendaItem,
 * and Attendee state and the operations on them. This is the ONLY module
 * allowed to call PersistenceAdapter or CardGeneration, per the affirmed
 * layering mandate (team.md Q6) and the fix applied at NFR Design review —
 * UI components must never import either directly.
 *
 * Exposes both a plain async facade (`Scheduling`, easily unit-tested with
 * PersistenceAdapter/CardGeneration mocked — unit-test-instructions.md) and
 * the React hooks Presentation consumes (`frontend-components.md`).
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactElement } from 'react';

import { CardGeneration, CardGenerationError } from '@/lib/card/card-generation';
import type { CardData } from '@/lib/card/card-generation';
import { PersistenceAdapter, PersistenceError } from '@/lib/persistence/persistence-adapter';
import {
  computeMeetingStatus,
  reorderAgendaItems,
  sortMeetingRecordsForList,
  validateAgendaItemTopic,
  validateAttendeeEmailFormat,
  validateAttendeeEmailUnique,
  validateAttendeeName,
  validateMeetingDraft,
} from '@/lib/store/scheduling-rules';
import type {
  AgendaItem,
  AgendaItemDraft,
  Attendee,
  AttendeeDraft,
  Meeting,
  MeetingDraft,
  MeetingRecord,
  MeetingSummary,
  ValidationErrors,
} from '@/types/domain';

export type SaveResult =
  | { status: 'invalid'; errors: ValidationErrors }
  | { status: 'saved'; meeting: Meeting }
  | { status: 'saved-in-memory'; meeting: Meeting; notice: string };

const IN_MEMORY_FALLBACK_NOTICE =
  'Your changes are saved for this browsing session only — this device’s storage is unavailable right now.';

/** Session-only records that failed real persistence (NFR4.1's in-memory fallback). Cleared by clearAllData(). */
const sessionFallbackRecords = new Map<string, MeetingRecord>();

function draftToRecord(draft: MeetingDraft, meeting: Meeting): MeetingRecord {
  const agendaItems: AgendaItem[] = draft.agendaItems.map((item) => ({
    ...item,
    meetingId: meeting.id,
  }));
  const attendees: Attendee[] = draft.attendees.map((attendee) => ({
    ...attendee,
    meetingId: meeting.id,
  }));
  return { meeting, agendaItems, attendees };
}

function recordToCardData(meeting: Meeting, agendaItems: AgendaItem[]): CardData {
  return {
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
    agendaItems: agendaItems.map((item) => ({
      id: item.id,
      topic: item.topic,
      speaker: item.speaker,
      durationMinutes: item.durationMinutes,
      order: item.order,
    })),
    meetingId: meeting.id,
  };
}

function draftToCardData(draft: MeetingDraft, meetingId: string | undefined): CardData {
  return {
    title: draft.title,
    description: draft.description,
    date: draft.date,
    startTime: draft.startTime,
    endTime: draft.endTime,
    timezone: draft.timezone,
    meetingLink: draft.meetingLink,
    location: draft.location,
    hostName: draft.hostName,
    hostRoleOrg: draft.hostRoleOrg,
    hostEmail: draft.hostEmail,
    agendaItems: draft.agendaItems.map((item) => ({
      id: item.id,
      topic: item.topic,
      speaker: item.speaker,
      durationMinutes: item.durationMinutes,
      order: item.order,
    })),
    meetingId,
  };
}

/** The Scheduling facade — plain async methods, no React dependency, the shape scheduling-store.test.ts exercises directly. */
export const Scheduling = {
  /** Save (create or edit) a Meeting. `existing` carries the id/createdAt to preserve on an edit (functional-spec Workflow 2 step 3). */
  async saveMeeting(draft: MeetingDraft, existing?: { id: string; createdAt: string }): Promise<SaveResult> {
    const errors = validateMeetingDraft(draft);
    if (Object.keys(errors).length > 0) {
      return { status: 'invalid', errors };
    }

    const meeting: Meeting = {
      id: existing?.id ?? crypto.randomUUID(),
      title: draft.title,
      description: draft.description,
      date: draft.date,
      startTime: draft.startTime,
      endTime: draft.endTime,
      timezone: draft.timezone,
      meetingLink: draft.meetingLink,
      location: draft.location,
      hostName: draft.hostName,
      hostRoleOrg: draft.hostRoleOrg,
      hostEmail: draft.hostEmail,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };
    const record = draftToRecord(draft, meeting);

    try {
      await PersistenceAdapter.save(record);
      sessionFallbackRecords.delete(meeting.id);
      return { status: 'saved', meeting };
    } catch (error) {
      if (error instanceof PersistenceError) {
        // NFR4.1 — degrade gracefully to in-memory session state with a non-blocking notice, never a crash.
        sessionFallbackRecords.set(meeting.id, record);
        return { status: 'saved-in-memory', meeting, notice: IN_MEMORY_FALLBACK_NOTICE };
      }
      throw error;
    }
  },

  /** Loads one MeetingRecord, checking the in-memory fallback first (a fallback record was never actually written to storage). */
  async loadMeetingRecord(meetingId: string): Promise<MeetingRecord | null> {
    const fallback = sessionFallbackRecords.get(meetingId);
    if (fallback) return fallback;
    return PersistenceAdapter.load(meetingId);
  },

  /** Lists every Meeting as a sorted (BR4.1), status-computed (BR7.1) summary, merging persisted and in-memory-fallback records. */
  async listMeetingSummaries(): Promise<MeetingSummary[]> {
    const persisted = await PersistenceAdapter.list();
    const persistedIds = new Set(persisted.map((record) => record.meeting.id));
    const fallbackOnly = [...sessionFallbackRecords.values()].filter(
      (record) => !persistedIds.has(record.meeting.id),
    );
    return sortMeetingRecordsForList([...persisted, ...fallbackOnly]);
  },

  /** Deletes a Meeting and (implicitly, since they're stored together) all its AgendaItems/Attendees (BR4.2). */
  async deleteMeeting(meetingId: string): Promise<void> {
    sessionFallbackRecords.delete(meetingId);
    await PersistenceAdapter.deleteOne(meetingId);
  },

  /** "Clear my data" (BR6.1, FR6.2) — wipes both persisted and in-memory-fallback records. */
  async clearAllData(): Promise<void> {
    sessionFallbackRecords.clear();
    await PersistenceAdapter.clearAll();
  },

  /** Delegates to CardGeneration for the live preview (FR5.4) — the sole caller, per the layering mandate. */
  renderPreview(draft: MeetingDraft, meetingId?: string): ReactElement {
    return CardGeneration.renderPreview(draftToCardData(draft, meetingId));
  },

  /** Delegates to CardGeneration for the PDF export (FR5.1, NFR1.2) — the sole caller. Rethrows CardGenerationError untouched; Presentation owns the retry UX. */
  async exportCard(meeting: Meeting, agendaItems: AgendaItem[]): Promise<Blob> {
    return CardGeneration.exportPdf(recordToCardData(meeting, agendaItems));
  },
};

// ---------------------------------------------------------------------------
// React hooks (frontend-components.md's hook contracts)
// ---------------------------------------------------------------------------

/** useMeetingsList() -> Meeting[] (sorted per BR4.1), with loading/error state (NFR4.1 degradation). */
export function useMeetingsList() {
  const [meetings, setMeetings] = useState<MeetingSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const summaries = await Scheduling.listMeetingSummaries();
      setMeetings(summaries);
      setLoadError(null);
    } catch (error) {
      // NFR4.1 — non-blocking notice, never a crash; keep whatever list we already had.
      setLoadError(error instanceof Error ? error.message : 'Could not load your meetings.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { meetings, isLoading, loadError, refresh };
}

/** useMeeting(id?) -> { meeting, agendaItems, attendees, save, delete, renderPreview, exportCard }. */
export function useMeeting(meetingId?: string) {
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(meetingId));
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!meetingId) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    Scheduling.loadMeetingRecord(meetingId)
      .then((record) => {
        if (cancelled) return;
        if (record) {
          setMeeting(record.meeting);
          setAgendaItems(record.agendaItems);
          setAttendees(record.attendees);
          setLoadError(null);
        } else {
          setLoadError('This meeting could not be found.');
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : 'Could not load this meeting.');
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [meetingId]);

  const save = useCallback(
    async (draft: MeetingDraft): Promise<SaveResult> => {
      const existing = meeting ? { id: meeting.id, createdAt: meeting.createdAt } : undefined;
      const result = await Scheduling.saveMeeting(draft, existing);
      if (result.status !== 'invalid') {
        setMeeting(result.meeting);
        setAgendaItems(draft.agendaItems.map((item) => ({ ...item, meetingId: result.meeting.id })));
        setAttendees(draft.attendees.map((attendee) => ({ ...attendee, meetingId: result.meeting.id })));
      }
      return result;
    },
    [meeting],
  );

  const removeMeeting = useCallback(async () => {
    if (!meeting) return;
    await Scheduling.deleteMeeting(meeting.id);
  }, [meeting]);

  const renderPreview = useCallback(
    (draft: MeetingDraft) => Scheduling.renderPreview(draft, meeting?.id),
    [meeting?.id],
  );

  const exportCard = useCallback(async () => {
    if (!meeting) {
      throw new Error('Cannot export a card before the meeting is saved.');
    }
    return Scheduling.exportCard(meeting, agendaItems);
  }, [meeting, agendaItems]);

  return {
    meeting,
    agendaItems,
    attendees,
    isLoading,
    loadError,
    save,
    deleteMeeting: removeMeeting,
    renderPreview,
    exportCard,
  };
}

/**
 * useAgendaItems(items, onChange) -> { items, add, edit, remove, moveUp, moveDown } (BR2.1, BR2.2, BR2.3).
 *
 * Operates on the Meeting form's local draft state (`draft.agendaItems`)
 * rather than reading/writing storage directly — agenda items are not
 * independently persisted, only as part of the parent Meeting's save
 * (frontend-components.md's data-flow note; the exact controlled-hook
 * signature is a UX micro-decision functional-spec.md left to Code
 * Generation).
 */
export function useAgendaItems(items: AgendaItemDraft[], onChange: (items: AgendaItemDraft[]) => void) {
  const sorted = useMemo(() => [...items].sort((a, b) => a.order - b.order), [items]);

  const add = useCallback(
    (topic: string, speaker: string, durationMinutes: number): { ok: true } | { ok: false; error: string } => {
      const error = validateAgendaItemTopic(topic);
      if (error) return { ok: false, error };
      const newItem: AgendaItemDraft = {
        id: crypto.randomUUID(),
        topic,
        speaker,
        durationMinutes,
        order: items.length,
      };
      onChange([...items, newItem]);
      return { ok: true };
    },
    [items, onChange],
  );

  /**
   * Edits are real-time, per-keystroke updates from a controlled input, so
   * (unlike `add`, a discrete submit action) `edit` never blocks the
   * underlying update — blocking would make it impossible to backspace an
   * invalid value back to a valid one. It still returns BR2.3's validation
   * message so the row can show an inline error while the value is invalid.
   */
  const edit = useCallback(
    (id: string, changes: Partial<Pick<AgendaItemDraft, 'topic' | 'speaker' | 'durationMinutes'>>) => {
      onChange(items.map((item) => (item.id === id ? { ...item, ...changes } : item)));
      if (changes.topic !== undefined) {
        const error = validateAgendaItemTopic(changes.topic);
        if (error) return { error };
      }
      return {};
    },
    [items, onChange],
  );

  const remove = useCallback(
    (id: string) => {
      onChange(
        items
          .filter((item) => item.id !== id)
          .sort((a, b) => a.order - b.order)
          .map((item, index) => ({ ...item, order: index })),
      );
    },
    [items, onChange],
  );

  const moveUp = useCallback((id: string) => onChange(reorderAgendaItems(items, id, 'up')), [items, onChange]);
  const moveDown = useCallback((id: string) => onChange(reorderAgendaItems(items, id, 'down')), [items, onChange]);

  return { items: sorted, add, edit, remove, moveUp, moveDown };
}

/**
 * useAttendees(attendees, onChange) -> { attendees, add, edit, remove } (BR3.1, BR3.2, BR3.3, BR3.4).
 * Same controlled-draft pattern as useAgendaItems above.
 */
export function useAttendees(attendees: AttendeeDraft[], onChange: (attendees: AttendeeDraft[]) => void) {
  const add = useCallback(
    (
      name: string,
      email: string,
      role: string,
    ): { ok: true } | { ok: false; field: 'name' | 'email'; error: string } => {
      const nameError = validateAttendeeName(name);
      if (nameError) return { ok: false, field: 'name', error: nameError };
      const formatError = validateAttendeeEmailFormat(email);
      if (formatError) return { ok: false, field: 'email', error: formatError };
      const duplicateError = validateAttendeeEmailUnique(attendees, email);
      if (duplicateError) return { ok: false, field: 'email', error: duplicateError };

      onChange([...attendees, { id: crypto.randomUUID(), name, email, role }]);
      return { ok: true };
    },
    [attendees, onChange],
  );

  /**
   * Edits are real-time, per-keystroke updates from a controlled input, so
   * `edit` always applies the change (never blocks) — validation is
   * exposed separately via `validateEmail`, called on blur (BR3.3's
   * explicit trigger), so a mid-typing partial email never flashes an
   * error and a user can always backspace back to a valid value.
   */
  const edit = useCallback(
    (id: string, changes: Partial<Pick<AttendeeDraft, 'name' | 'email' | 'role'>>) => {
      onChange(attendees.map((attendee) => (attendee.id === id ? { ...attendee, ...changes } : attendee)));
    },
    [attendees, onChange],
  );

  /** BR3.2 + BR3.3 — run on blur of an attendee's email field. */
  const validateEmail = useCallback(
    (id: string, email: string): string | null => {
      const formatError = validateAttendeeEmailFormat(email);
      if (formatError) return formatError;
      return validateAttendeeEmailUnique(attendees, email, id);
    },
    [attendees],
  );

  const remove = useCallback(
    (id: string) => onChange(attendees.filter((attendee) => attendee.id !== id)),
    [attendees, onChange],
  );

  return { attendees, add, edit, remove, validateEmail };
}

/** useClearAllData() -> { clearAll } (BR6.1). */
export function useClearAllData() {
  const [isClearing, setIsClearing] = useState(false);

  const clearAll = useCallback(async () => {
    setIsClearing(true);
    try {
      await Scheduling.clearAllData();
    } finally {
      setIsClearing(false);
    }
  }, []);

  return { clearAll, isClearing };
}

export { computeMeetingStatus };
/** Re-exported so Presentation can catch/inspect export failures without importing lib/card directly (the layering mandate). */
export { CardGenerationError };
