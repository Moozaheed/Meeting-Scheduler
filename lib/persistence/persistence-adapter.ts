/**
 * PersistenceAdapter — the storage boundary (ADR-002, revised for the
 * Supabase backend).
 *
 * A narrow save/load/clear/list interface backed by Supabase Postgres via
 * `lib/persistence/supabase-client.ts`. This is the ONLY module in the
 * codebase allowed to import that client wrapper — Scheduling depends on
 * this interface, never the other way around (team.md Layer boundaries).
 *
 * Never swallows an error silently: every failure path is translated into
 * a typed PersistenceError and rethrown, per reliability-design.md's
 * NFR4.1 design. The error causes below are carried over from the
 * IndexedDB-era adapter where the underlying condition still applies
 * (corrupted-data, unknown); `quota-exceeded` and the private-browsing
 * form of `storage-unavailable` no longer apply to a Postgres backend and
 * are superseded here by network/API-reachability failures, which map to
 * `storage-unavailable` instead.
 */
import {
  clearOwnedMeetingIds,
  forgetOwnedMeeting,
  listOwnedMeetingIds,
  rememberOwnedMeeting,
} from '@/lib/persistence/owned-meetings';
import {
  deleteMeetingRecord,
  selectAllMeetingRecords,
  selectMeetingRecord,
  upsertMeetingRecord,
} from '@/lib/persistence/supabase-client';
import type { MeetingRecord } from '@/types/domain';

export type PersistenceErrorCause = 'quota-exceeded' | 'corrupted-data' | 'storage-unavailable' | 'unknown';

export class PersistenceError extends Error {
  readonly code: PersistenceErrorCause;

  constructor(code: PersistenceErrorCause, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'PersistenceError';
    this.code = code;
  }
}

/** Narrows an arbitrary catch value into a typed PersistenceError. Never rethrows the raw error unwrapped. */
function toPersistenceError(error: unknown, fallbackMessage: string): PersistenceError {
  if (error instanceof PersistenceError) {
    return error;
  }

  // A network failure (offline, DNS, CORS, Supabase unreachable) throws a
  // plain TypeError from fetch, not a Postgres error object — this is the
  // Supabase-backend equivalent of the old private-browsing IndexedDB block.
  if (error instanceof TypeError) {
    return new PersistenceError('storage-unavailable', 'Could not reach the database (are you offline?).', {
      cause: error,
    });
  }

  return new PersistenceError('unknown', fallbackMessage, { cause: error });
}

/** Runtime shape-check for data read back from storage — guards against corrupted/malformed records (NFR4.1). */
function isValidMeetingRecord(value: unknown): value is MeetingRecord {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<MeetingRecord>;
  return (
    typeof candidate.meeting === 'object' &&
    candidate.meeting !== null &&
    typeof (candidate.meeting as { id?: unknown }).id === 'string' &&
    Array.isArray(candidate.agendaItems) &&
    Array.isArray(candidate.attendees)
  );
}

export const PersistenceAdapter = {
  /** Saves (creates or updates) a MeetingRecord. Throws PersistenceError on any failure. */
  async save(record: MeetingRecord): Promise<void> {
    try {
      await upsertMeetingRecord(record);
    } catch (error) {
      throw toPersistenceError(error, 'Failed to save meeting.');
    }
    rememberOwnedMeeting(record.meeting.id);
  },

  /** Loads one MeetingRecord by id, or null if not found. Throws PersistenceError if the stored value is corrupted or the database is unreachable. */
  async load(meetingId: string): Promise<MeetingRecord | null> {
    let record: MeetingRecord | null;
    try {
      record = await selectMeetingRecord(meetingId);
    } catch (error) {
      throw toPersistenceError(error, 'Failed to load meeting.');
    }

    if (record === null) {
      return null;
    }
    if (!isValidMeetingRecord(record)) {
      throw new PersistenceError('corrupted-data', `Stored data for meeting ${meetingId} is corrupted.`);
    }
    return record;
  },

  /** Lists every stored MeetingRecord. Skips (does not throw on) individual corrupted records so one bad record cannot block the whole list. */
  async list(): Promise<MeetingRecord[]> {
    let records: MeetingRecord[];
    try {
      records = await selectAllMeetingRecords();
    } catch (error) {
      throw toPersistenceError(error, 'Failed to list meetings.');
    }

    // A corrupted individual record is silently excluded from the list rather than
    // failing the whole list call — the corruption is surfaced to the caller only
    // when that specific meeting is opened via load(), where it can be handled inline.
    return records.filter(isValidMeetingRecord);
  },

  /** Deletes one MeetingRecord by id — its AgendaItems/Attendees cascade-delete at the database level (ON DELETE CASCADE, BR4.2). */
  async deleteOne(meetingId: string): Promise<void> {
    try {
      await deleteMeetingRecord(meetingId);
    } catch (error) {
      throw toPersistenceError(error, 'Failed to delete meeting.');
    }
    forgetOwnedMeeting(meetingId);
  },

  /**
   * Wipes every MeetingRecord this device has created or edited (BR6.1,
   * FR6.2) — scoped, not a wipe of the whole shared database. The backend
   * has no per-user auth (unlisted-URL access model), so "my data" is
   * approximated by a local id registry (owned-meetings.ts) rather than a
   * real ownership check; see that module's header for why this exists.
   */
  async clearAll(): Promise<void> {
    const ownedIds = listOwnedMeetingIds();
    const results = await Promise.allSettled(ownedIds.map((id) => deleteMeetingRecord(id)));
    const firstFailure = results.find((r): r is PromiseRejectedResult => r.status === 'rejected');
    if (firstFailure) {
      throw toPersistenceError(firstFailure.reason, 'Failed to clear stored data.');
    }
    clearOwnedMeetingIds();
  },
};
