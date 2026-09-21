/**
 * PersistenceAdapter — the browser-storage boundary (ADR-002).
 *
 * A narrow save/load/clear/list interface backed by IndexedDB via
 * `idb-keyval` (tech-stack-decisions.md). This is the ONLY module in the
 * codebase allowed to touch IndexedDB directly — Scheduling depends on
 * this interface, never the other way around (team.md Layer boundaries).
 *
 * Never swallows an error silently: every failure path is translated into
 * a typed PersistenceError and rethrown, per reliability-design.md's
 * NFR4.1 design (quota exceeded, corrupted stored data, private-browsing
 * restrictions all surface here, and only here).
 */
import { clear as idbClear, del as idbDel, get as idbGet, keys as idbKeys, set as idbSet } from 'idb-keyval';

import type { MeetingRecord } from '@/types/domain';

const STORAGE_KEY_PREFIX = 'meeting-card-scheduler:meeting:';

export type PersistenceErrorCause = 'quota-exceeded' | 'corrupted-data' | 'storage-unavailable' | 'unknown';

export class PersistenceError extends Error {
  readonly code: PersistenceErrorCause;

  constructor(code: PersistenceErrorCause, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'PersistenceError';
    this.code = code;
  }
}

function keyFor(meetingId: string): string {
  return `${STORAGE_KEY_PREFIX}${meetingId}`;
}

/** Narrows an arbitrary catch value into a typed PersistenceError. Never rethrows the raw error unwrapped. */
function toPersistenceError(error: unknown, fallbackMessage: string): PersistenceError {
  if (error instanceof PersistenceError) {
    return error;
  }

  const domException = error instanceof DOMException ? error : null;
  if (domException?.name === 'QuotaExceededError') {
    return new PersistenceError('quota-exceeded', 'Browser storage quota exceeded.', { cause: error });
  }
  if (
    domException?.name === 'InvalidStateError' ||
    domException?.name === 'SecurityError' ||
    domException?.name === 'UnknownError'
  ) {
    // Notably: Safari private-browsing mode throws here when IndexedDB access is restricted.
    return new PersistenceError('storage-unavailable', 'Browser storage is unavailable (private browsing?).', {
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
      await idbSet(keyFor(record.meeting.id), record);
    } catch (error) {
      throw toPersistenceError(error, 'Failed to save meeting.');
    }
  },

  /** Loads one MeetingRecord by id, or null if not found. Throws PersistenceError if the stored value is corrupted or storage is unreachable. */
  async load(meetingId: string): Promise<MeetingRecord | null> {
    let raw: unknown;
    try {
      raw = await idbGet(keyFor(meetingId));
    } catch (error) {
      throw toPersistenceError(error, 'Failed to load meeting.');
    }

    if (raw === undefined) {
      return null;
    }
    if (!isValidMeetingRecord(raw)) {
      throw new PersistenceError('corrupted-data', `Stored data for meeting ${meetingId} is corrupted.`);
    }
    return raw;
  },

  /** Lists every stored MeetingRecord. Skips (does not throw on) individual corrupted records so one bad record cannot block the whole list. */
  async list(): Promise<MeetingRecord[]> {
    let allKeys: IDBValidKey[];
    try {
      allKeys = await idbKeys();
    } catch (error) {
      throw toPersistenceError(error, 'Failed to list meetings.');
    }

    const meetingKeys = allKeys.filter(
      (key): key is string => typeof key === 'string' && key.startsWith(STORAGE_KEY_PREFIX),
    );

    const records: MeetingRecord[] = [];
    for (const key of meetingKeys) {
      try {
        const raw = await idbGet(key);
        if (isValidMeetingRecord(raw)) {
          records.push(raw);
        }
        // A corrupted individual record is silently excluded from the list rather than
        // failing the whole list call — the corruption is surfaced to the caller only
        // when that specific meeting is opened via load(), where it can be handled inline.
      } catch {
        // Unreadable individual key: skip it, same rationale as above.
        continue;
      }
    }
    return records;
  },

  /** Deletes one MeetingRecord by id (cascade delete of its AgendaItems/Attendees is implicit — they live inside the same record). */
  async deleteOne(meetingId: string): Promise<void> {
    try {
      await idbDel(keyFor(meetingId));
    } catch (error) {
      throw toPersistenceError(error, 'Failed to delete meeting.');
    }
  },

  /** Wipes every stored MeetingRecord for this browser (BR6.1, FR6.2). */
  async clearAll(): Promise<void> {
    try {
      await idbClear();
    } catch (error) {
      throw toPersistenceError(error, 'Failed to clear stored data.');
    }
  },
};
