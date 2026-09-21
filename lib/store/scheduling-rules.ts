/**
 * Pure business-rule functions for the Scheduling domain/state layer
 * (rules.md BR1.1–BR7.1). No React, no PersistenceAdapter, no
 * CardGeneration dependency — these are plain, independently testable
 * functions that `scheduling-store.ts` composes into its stateful API.
 */
import { isWellFormedEmail, isWellFormedUrl } from '@/lib/validation/validators';
import type {
  AgendaItemDraft,
  AttendeeDraft,
  Meeting,
  MeetingDraft,
  MeetingRecord,
  MeetingStatus,
  MeetingSummary,
  ValidationErrors,
} from '@/types/domain';

/** BR1.1, BR1.2, BR1.3, BR1.4 — the save-time gate that re-checks every Meeting rule regardless of trigger. */
export function validateMeetingDraft(draft: MeetingDraft): ValidationErrors {
  const errors: ValidationErrors = {};

  // BR1.1 — required fields.
  if (draft.title.trim() === '') errors.title = 'Title is required.';
  if (draft.date.trim() === '') errors.date = 'Date is required.';
  if (draft.startTime.trim() === '') errors.startTime = 'Start time is required.';
  if (draft.endTime.trim() === '') errors.endTime = 'End time is required.';
  if (draft.timezone.trim() === '') errors.timezone = 'Timezone is required.';
  if (draft.hostName.trim() === '') errors.hostName = 'Host name is required.';
  if (draft.hostEmail.trim() === '') errors.hostEmail = 'Host email is required.';
  else if (!isWellFormedEmail(draft.hostEmail)) errors.hostEmail = 'Enter a valid email address.';

  // BR1.2 — at least one of meetingLink or location.
  const hasLink = draft.meetingLink.trim() !== '';
  const hasLocation = draft.location.trim() !== '';
  if (!hasLink && !hasLocation) {
    errors.meetingLink = 'Provide a meeting link or a location.';
    errors.location = 'Provide a meeting link or a location.';
  }

  // BR1.3 — meetingLink, when present, must be a well-formed URL.
  if (hasLink && !isWellFormedUrl(draft.meetingLink)) {
    errors.meetingLink = 'Enter a valid URL.';
  }

  // BR1.4 — endTime must be chronologically after startTime.
  if (
    draft.startTime.trim() !== '' &&
    draft.endTime.trim() !== '' &&
    !errors.startTime &&
    !errors.endTime &&
    draft.endTime <= draft.startTime
  ) {
    errors.endTime = 'End time must be after start time.';
  }

  return errors;
}

/** BR2.3 — an AgendaItem must have a non-empty topic before it can be added or saved. */
export function validateAgendaItemTopic(topic: string): string | null {
  return topic.trim() === '' ? 'Topic is required.' : null;
}

/**
 * BR2.2 — reordering an AgendaItem updates its `order` and shifts every
 * item between its old and new position by ±1. Returns a new array with
 * `order` recalculated to match the new sequence.
 */
export function reorderAgendaItems(
  items: AgendaItemDraft[],
  itemId: string,
  direction: 'up' | 'down',
): AgendaItemDraft[] {
  const sorted = [...items].sort((a, b) => a.order - b.order);
  const index = sorted.findIndex((item) => item.id === itemId);
  if (index === -1) return items;

  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= sorted.length) return items;

  const reordered = [...sorted];
  // Both indices are bounds-checked integers derived from `sorted.length` above — never
  // user-controlled property names — so this array-element swap is not an injection sink.
  // eslint-disable-next-line security/detect-object-injection
  [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];

  return reordered.map((item, position) => ({ ...item, order: position }));
}

/** BR3.4 — an Attendee must have a non-empty name before it can be added or saved. */
export function validateAttendeeName(name: string): string | null {
  return name.trim() === '' ? 'Name is required.' : null;
}

/** BR3.3 — an Attendee's email must be a well-formed email address. */
export function validateAttendeeEmailFormat(email: string): string | null {
  return isWellFormedEmail(email) ? null : 'Enter a valid email address.';
}

/** BR3.2 — no two Attendees on the same Meeting may share an email address (case-insensitive), excluding the attendee being edited. */
export function validateAttendeeEmailUnique(
  attendees: AttendeeDraft[],
  email: string,
  excludeId?: string,
): string | null {
  const normalized = email.trim().toLowerCase();
  const isDuplicate = attendees.some(
    (attendee) => attendee.id !== excludeId && attendee.email.trim().toLowerCase() === normalized,
  );
  return isDuplicate ? 'This attendee is already on the list.' : null;
}

/** BR4.1 — Meetings List sorted by (date, startTime) descending (newest first). */
export function sortMeetingRecordsForList(records: MeetingRecord[], now: Date = new Date()): MeetingSummary[] {
  return [...records]
    .sort((a, b) => {
      const aKey = `${a.meeting.date}T${a.meeting.startTime}`;
      const bKey = `${b.meeting.date}T${b.meeting.startTime}`;
      return bKey.localeCompare(aKey);
    })
    .map(({ meeting, attendees }) => ({
      id: meeting.id,
      title: meeting.title,
      date: meeting.date,
      startTime: meeting.startTime,
      endTime: meeting.endTime,
      timezone: meeting.timezone,
      attendeeCount: attendees.length,
      status: computeMeetingStatus(meeting, now),
    }));
}

/**
 * BR7.1 — computed, never-persisted Upcoming/Past status.
 *
 * Simplification (no IANA timezone-conversion library is in the locked
 * stack per tech-stack-decisions.md): the meeting's `date`/`endTime` are
 * compared against the visitor's own local wall-clock time rather than a
 * true IANA-timezone-aware instant. This is a disclosed scoped decision,
 * not a silent approximation — a materially different comparison would
 * require adding a dependency the stack doesn't have.
 */
export function computeMeetingStatus(meeting: Pick<Meeting, 'date' | 'endTime'>, now: Date = new Date()): MeetingStatus {
  const endInstant = new Date(`${meeting.date}T${meeting.endTime}:00`);
  if (Number.isNaN(endInstant.getTime())) return 'upcoming';
  return endInstant.getTime() < now.getTime() ? 'past' : 'upcoming';
}
