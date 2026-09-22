/**
 * In-memory fake of `supabase-client.ts`'s five repository functions —
 * the Supabase-backend equivalent of what `fake-indexeddb` gave the
 * previous IndexedDB adapter: every test in the suite exercises the real
 * `PersistenceAdapter` logic against something that behaves like the real
 * backend (cascade delete, ordering, upsert-replaces-children), without a
 * network call. Registered globally in `vitest.setup.ts` via `vi.mock`, so
 * no individual test file needs to know this exists.
 */
import type { AgendaItem, Attendee, Meeting, MeetingRecord } from '@/types/domain';

const meetings = new Map<string, Meeting>();
const agendaItems = new Map<string, AgendaItem>();
const attendees = new Map<string, Attendee>();

export async function upsertMeetingRecord(record: MeetingRecord): Promise<void> {
  meetings.set(record.meeting.id, { ...record.meeting });

  for (const [id, item] of agendaItems) {
    if (item.meetingId === record.meeting.id) agendaItems.delete(id);
  }
  for (const [id, attendee] of attendees) {
    if (attendee.meetingId === record.meeting.id) attendees.delete(id);
  }
  for (const item of record.agendaItems) agendaItems.set(item.id, { ...item });
  for (const attendee of record.attendees) attendees.set(attendee.id, { ...attendee });
}

export async function selectMeetingRecord(meetingId: string): Promise<MeetingRecord | null> {
  const meeting = meetings.get(meetingId);
  if (!meeting) return null;
  return {
    meeting: { ...meeting },
    agendaItems: [...agendaItems.values()]
      .filter((item) => item.meetingId === meetingId)
      .sort((a, b) => a.order - b.order)
      .map((item) => ({ ...item })),
    attendees: [...attendees.values()].filter((a) => a.meetingId === meetingId).map((a) => ({ ...a })),
  };
}

export async function selectAllMeetingRecords(): Promise<MeetingRecord[]> {
  const records: MeetingRecord[] = [];
  for (const meeting of meetings.values()) {
    records.push((await selectMeetingRecord(meeting.id))!);
  }
  return records;
}

export async function deleteMeetingRecord(meetingId: string): Promise<void> {
  meetings.delete(meetingId);
  for (const [id, item] of agendaItems) {
    if (item.meetingId === meetingId) agendaItems.delete(id);
  }
  for (const [id, attendee] of attendees) {
    if (attendee.meetingId === meetingId) attendees.delete(id);
  }
}

export async function deleteAllMeetingRecords(): Promise<void> {
  meetings.clear();
  agendaItems.clear();
  attendees.clear();
}
