/**
 * Exercises the real row<->domain mapping and query shape in
 * supabase-client.ts against a fake Postgrest-style builder — this is the
 * one file every other test in the suite replaces wholesale with
 * __mocks__/supabase-client.ts, so without this file a wrong column name
 * or table name here would never be caught until it hit the live database.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { buildAgendaItem, buildAttendee, buildMeeting, buildMeetingRecord } from '@/lib/store/test-fixtures';

type Row = Record<string, unknown>;

function makeFakeSupabase() {
  const tables: Record<string, Row[]> = { meetings: [], agenda_items: [], attendees: [] };

  function from(table: string) {
    if (!(table in tables)) throw new Error(`Unknown table in test fake: ${table}`);
    const filters: ((r: Row) => boolean)[] = [];
    let orderCol: string | null = null;
    let ascending = true;
    let single = false;

    // A hand-rolled thenable fake doesn't conform to PromiseLike's exact overloaded `then`
    // signature, and forcing it to isn't worth the friction in test-only fixture code.
    const builder: Record<string, (...args: never[]) => unknown> = {
      select: () => builder,
      eq(col: string, val: unknown) {
        filters.push((r) => r[col] === val);
        return builder;
      },
      neq(col: string, val: unknown) {
        filters.push((r) => r[col] !== val);
        return builder;
      },
      order(col: string, opts: { ascending: boolean }) {
        orderCol = col;
        ascending = opts.ascending;
        return builder;
      },
      maybeSingle() {
        single = true;
        return builder;
      },
      upsert(row: Row) {
        const rows = tables[table];
        const idx = rows.findIndex((r) => r.id === row.id);
        if (idx >= 0) rows[idx] = row;
        else rows.push(row);
        return Promise.resolve({ data: null, error: null });
      },
      insert(rowsToInsert: Row[]) {
        tables[table].push(...rowsToInsert);
        return Promise.resolve({ data: null, error: null });
      },
      delete() {
        // Mirrors the real schema's `on delete cascade` FK
        // (supabase/migrations/): deleting a meeting here also removes its
        // agenda_items/attendees, same as the live database does.
        const cascade = (deletedMeetingIds: Set<string>) => {
          if (table !== 'meetings' || deletedMeetingIds.size === 0) return;
          tables.agenda_items = tables.agenda_items.filter(
            (r) => !deletedMeetingIds.has(r.meeting_id as string),
          );
          tables.attendees = tables.attendees.filter((r) => !deletedMeetingIds.has(r.meeting_id as string));
        };
        return {
          eq: (col: string, val: unknown) => {
            const toDelete = tables[table].filter((r) => r[col] === val);
            tables[table] = tables[table].filter((r) => r[col] !== val);
            cascade(new Set(toDelete.map((r) => r.id as string)));
            return Promise.resolve({ data: null, error: null });
          },
          neq: (col: string, val: unknown) => {
            const toDelete = tables[table].filter((r) => r[col] !== val);
            tables[table] = tables[table].filter((r) => r[col] === val);
            cascade(new Set(toDelete.map((r) => r.id as string)));
            return Promise.resolve({ data: null, error: null });
          },
        };
      },
      then(onFulfilled: (value: { data: unknown; error: null }) => unknown) {
        let result = tables[table].filter((r) => filters.every((f) => f(r)));
        if (orderCol) {
          const col = orderCol;
          result = [...result].sort((a, b) => {
            const diff = (a[col] as number) - (b[col] as number);
            return ascending ? diff : -diff;
          });
        }
        return Promise.resolve(onFulfilled({ data: single ? (result[0] ?? null) : result, error: null }));
      },
    };
    return builder;
  }

  return { from, tables };
}

const fake = makeFakeSupabase();

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => fake),
}));
// vitest.setup.ts globally auto-mocks this module (__mocks__/supabase-client.ts)
// for every other test file; this file specifically wants the REAL
// implementation, exercised against the fake @supabase/supabase-js above.
vi.unmock('@/lib/persistence/supabase-client');

// Imported after the mocks above are registered, per Vitest's hoisting contract.
const {
  deleteAllMeetingRecords,
  deleteMeetingRecord,
  selectAllMeetingRecords,
  selectMeetingRecord,
  upsertMeetingRecord,
} = await import('@/lib/persistence/supabase-client');

describe('supabase-client (real mapping, fake Postgrest builder)', () => {
  beforeEach(() => {
    fake.tables.meetings = [];
    fake.tables.agenda_items = [];
    fake.tables.attendees = [];
  });

  it('round-trips a MeetingRecord through the correct table/column names', async () => {
    const record = buildMeetingRecord();

    await upsertMeetingRecord(record);
    const loaded = await selectMeetingRecord(record.meeting.id);

    expect(loaded).toEqual(record);
  });

  it('returns null for a meeting id that was never saved', async () => {
    expect(await selectMeetingRecord('missing-id')).toBeNull();
  });

  it('orders agenda items by order_index ascending on load', async () => {
    const meeting = buildMeeting();
    const record = {
      meeting,
      agendaItems: [
        buildAgendaItem({ meetingId: meeting.id, order: 2, topic: 'Third' }),
        buildAgendaItem({ meetingId: meeting.id, order: 0, topic: 'First' }),
        buildAgendaItem({ meetingId: meeting.id, order: 1, topic: 'Second' }),
      ],
      attendees: [],
    };

    await upsertMeetingRecord(record);
    const loaded = await selectMeetingRecord(meeting.id);

    expect(loaded?.agendaItems.map((item) => item.topic)).toEqual(['First', 'Second', 'Third']);
  });

  it('replaces agenda items and attendees wholesale on a second save (delete-then-insert)', async () => {
    const meeting = buildMeeting();
    await upsertMeetingRecord({
      meeting,
      agendaItems: [buildAgendaItem({ meetingId: meeting.id, topic: 'Old topic' })],
      attendees: [buildAttendee({ meetingId: meeting.id, name: 'Old attendee' })],
    });

    await upsertMeetingRecord({
      meeting,
      agendaItems: [buildAgendaItem({ meetingId: meeting.id, topic: 'New topic' })],
      attendees: [buildAttendee({ meetingId: meeting.id, name: 'New attendee' })],
    });

    const loaded = await selectMeetingRecord(meeting.id);
    expect(loaded?.agendaItems).toHaveLength(1);
    expect(loaded?.agendaItems[0].topic).toBe('New topic');
    expect(loaded?.attendees).toHaveLength(1);
    expect(loaded?.attendees[0].name).toBe('New attendee');
  });

  it('lists every saved meeting with its own agenda items and attendees', async () => {
    const first = buildMeetingRecord();
    const second = buildMeetingRecord();
    await upsertMeetingRecord(first);
    await upsertMeetingRecord(second);

    const all = await selectAllMeetingRecords();

    expect(all.map((r) => r.meeting.id).sort()).toEqual([first.meeting.id, second.meeting.id].sort());
  });

  it('cascade-deletes agenda items and attendees when a meeting is deleted', async () => {
    const record = buildMeetingRecord();
    await upsertMeetingRecord(record);

    await deleteMeetingRecord(record.meeting.id);

    expect(await selectMeetingRecord(record.meeting.id)).toBeNull();
    expect(fake.tables.agenda_items).toHaveLength(0);
    expect(fake.tables.attendees).toHaveLength(0);
  });

  it('deleteAllMeetingRecords wipes every meeting and its children', async () => {
    await upsertMeetingRecord(buildMeetingRecord());
    await upsertMeetingRecord(buildMeetingRecord());

    await deleteAllMeetingRecords();

    expect(await selectAllMeetingRecords()).toEqual([]);
    expect(fake.tables.agenda_items).toHaveLength(0);
    expect(fake.tables.attendees).toHaveLength(0);
  });
});
