/**
 * Supabase repository functions — the ONLY module that talks to
 * `@supabase/supabase-js` directly. `persistence-adapter.ts` calls these
 * five functions and never touches the Supabase client itself, keeping the
 * same narrow-boundary shape ADR-002 already established for IndexedDB.
 *
 * Every domain field is stored and read back as `text` (see the migration
 * in `supabase/migrations/`), so no date/time type coercion happens here —
 * rows map to/from `MeetingRecord` fields directly, only switching between
 * camelCase (domain) and snake_case (Postgres column names).
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import type { AgendaItem, Attendee, Meeting, MeetingRecord } from '@/types/domain';

let client: SupabaseClient | null = null;

/** Lazily creates the singleton client on first real use — not at module import time, so importing this file never throws in an environment without the env vars set (e.g. a test file that mocks this module wholesale). */
function getClient(): SupabaseClient {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) {
      throw new Error(
        'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set — see .env.example.',
      );
    }
    client = createClient(url, anonKey);
  }
  return client;
}

interface MeetingRow {
  id: string;
  title: string;
  description: string;
  date: string;
  start_time: string;
  end_time: string;
  timezone: string;
  meeting_link: string;
  location: string;
  host_name: string;
  host_role_org: string;
  host_email: string;
  created_at: string;
}

interface AgendaItemRow {
  id: string;
  meeting_id: string;
  topic: string;
  speaker: string;
  duration_minutes: number;
  order_index: number;
}

interface AttendeeRow {
  id: string;
  meeting_id: string;
  name: string;
  email: string;
  role: string;
}

function meetingToRow(meeting: Meeting): MeetingRow {
  return {
    id: meeting.id,
    title: meeting.title,
    description: meeting.description,
    date: meeting.date,
    start_time: meeting.startTime,
    end_time: meeting.endTime,
    timezone: meeting.timezone,
    meeting_link: meeting.meetingLink,
    location: meeting.location,
    host_name: meeting.hostName,
    host_role_org: meeting.hostRoleOrg,
    host_email: meeting.hostEmail,
    created_at: meeting.createdAt,
  };
}

function rowToMeeting(row: MeetingRow): Meeting {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    date: row.date,
    startTime: row.start_time,
    endTime: row.end_time,
    timezone: row.timezone,
    meetingLink: row.meeting_link,
    location: row.location,
    hostName: row.host_name,
    hostRoleOrg: row.host_role_org,
    hostEmail: row.host_email,
    createdAt: row.created_at,
  };
}

function agendaItemToRow(item: AgendaItem): AgendaItemRow {
  return {
    id: item.id,
    meeting_id: item.meetingId,
    topic: item.topic,
    speaker: item.speaker,
    duration_minutes: item.durationMinutes,
    order_index: item.order,
  };
}

function rowToAgendaItem(row: AgendaItemRow): AgendaItem {
  return {
    id: row.id,
    meetingId: row.meeting_id,
    topic: row.topic,
    speaker: row.speaker,
    durationMinutes: row.duration_minutes,
    order: row.order_index,
  };
}

function attendeeToRow(attendee: Attendee): AttendeeRow {
  return {
    id: attendee.id,
    meeting_id: attendee.meetingId,
    name: attendee.name,
    email: attendee.email,
    role: attendee.role,
  };
}

function rowToAttendee(row: AttendeeRow): Attendee {
  return {
    id: row.id,
    meetingId: row.meeting_id,
    name: row.name,
    email: row.email,
    role: row.role,
  };
}

/** Upserts the meeting row, then replaces its agenda_items/attendees wholesale (delete-then-insert) — the same "whole record overwritten each save" semantics the previous IndexedDB adapter had. */
export async function upsertMeetingRecord(record: MeetingRecord): Promise<void> {
  const db = getClient();

  const { error: meetingError } = await db.from('meetings').upsert(meetingToRow(record.meeting));
  if (meetingError) throw meetingError;

  const { error: deleteAgendaError } = await db
    .from('agenda_items')
    .delete()
    .eq('meeting_id', record.meeting.id);
  if (deleteAgendaError) throw deleteAgendaError;

  const { error: deleteAttendeesError } = await db
    .from('attendees')
    .delete()
    .eq('meeting_id', record.meeting.id);
  if (deleteAttendeesError) throw deleteAttendeesError;

  if (record.agendaItems.length > 0) {
    const { error } = await db.from('agenda_items').insert(record.agendaItems.map(agendaItemToRow));
    if (error) throw error;
  }
  if (record.attendees.length > 0) {
    const { error } = await db.from('attendees').insert(record.attendees.map(attendeeToRow));
    if (error) throw error;
  }
}

/** Returns null when no meeting with that id exists — never throws for a plain not-found. */
export async function selectMeetingRecord(meetingId: string): Promise<MeetingRecord | null> {
  const db = getClient();

  const { data: meetingRow, error: meetingError } = await db
    .from('meetings')
    .select('*')
    .eq('id', meetingId)
    .maybeSingle();
  if (meetingError) throw meetingError;
  if (!meetingRow) return null;

  const [{ data: agendaRows, error: agendaError }, { data: attendeeRows, error: attendeeError }] = await Promise.all([
    db.from('agenda_items').select('*').eq('meeting_id', meetingId).order('order_index', { ascending: true }),
    db.from('attendees').select('*').eq('meeting_id', meetingId),
  ]);
  if (agendaError) throw agendaError;
  if (attendeeError) throw attendeeError;

  return {
    meeting: rowToMeeting(meetingRow as MeetingRow),
    agendaItems: (agendaRows ?? []).map((row) => rowToAgendaItem(row as AgendaItemRow)),
    attendees: (attendeeRows ?? []).map((row) => rowToAttendee(row as AttendeeRow)),
  };
}

export async function selectAllMeetingRecords(): Promise<MeetingRecord[]> {
  const db = getClient();

  const { data: meetingRows, error: meetingsError } = await db.from('meetings').select('*');
  if (meetingsError) throw meetingsError;
  if (!meetingRows || meetingRows.length === 0) return [];

  const [{ data: agendaRows, error: agendaError }, { data: attendeeRows, error: attendeeError }] = await Promise.all([
    db.from('agenda_items').select('*').order('order_index', { ascending: true }),
    db.from('attendees').select('*'),
  ]);
  if (agendaError) throw agendaError;
  if (attendeeError) throw attendeeError;

  return (meetingRows as MeetingRow[]).map((meetingRow) => ({
    meeting: rowToMeeting(meetingRow),
    agendaItems: ((agendaRows ?? []) as AgendaItemRow[])
      .filter((row) => row.meeting_id === meetingRow.id)
      .map(rowToAgendaItem),
    attendees: ((attendeeRows ?? []) as AttendeeRow[])
      .filter((row) => row.meeting_id === meetingRow.id)
      .map(rowToAttendee),
  }));
}

/** Deletes one meeting; agenda_items/attendees cascade at the database level (ON DELETE CASCADE, BR4.2). */
export async function deleteMeetingRecord(meetingId: string): Promise<void> {
  const db = getClient();
  const { error } = await db.from('meetings').delete().eq('id', meetingId);
  if (error) throw error;
}

/** Wipes every meeting (and, via cascade, every agenda_item/attendee) for BR6.1/FR6.2's "clear my data". */
export async function deleteAllMeetingRecords(): Promise<void> {
  const db = getClient();
  // Postgres requires a WHERE clause on a bulk delete through PostgREST;
  // `id` is always a UUID, so "not equal to the nil UUID" matches every row.
  const { error } = await db.from('meetings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (error) throw error;
}
