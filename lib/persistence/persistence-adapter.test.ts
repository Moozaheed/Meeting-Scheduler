import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PersistenceAdapter, PersistenceError } from '@/lib/persistence/persistence-adapter';
import * as supabaseClient from '@/lib/persistence/supabase-client';
import { buildMeetingRecord } from '@/lib/store/test-fixtures';

describe('PersistenceAdapter', () => {
  beforeEach(async () => {
    // Per-test isolation against the in-memory fake Supabase client
    // (see lib/persistence/__mocks__/supabase-client.ts, vitest.setup.ts).
    await PersistenceAdapter.clearAll();
  });

  it('returns null on load for a meeting that has never been saved (first-visit case)', async () => {
    const result = await PersistenceAdapter.load('never-saved-id');
    expect(result).toBeNull();
  });

  it('returns an empty list when nothing has been saved yet', async () => {
    const result = await PersistenceAdapter.list();
    expect(result).toEqual([]);
  });

  it('saves and loads a MeetingRecord round-trip', async () => {
    const record = buildMeetingRecord();
    await PersistenceAdapter.save(record);

    const loaded = await PersistenceAdapter.load(record.meeting.id);
    expect(loaded).toEqual(record);
  });

  it('lists every saved MeetingRecord', async () => {
    const first = buildMeetingRecord();
    const second = buildMeetingRecord();
    await PersistenceAdapter.save(first);
    await PersistenceAdapter.save(second);

    const listed = await PersistenceAdapter.list();
    expect(listed).toHaveLength(2);
    expect(listed.map((r) => r.meeting.id).sort()).toEqual([first.meeting.id, second.meeting.id].sort());
  });

  it('deletes one MeetingRecord without affecting others', async () => {
    const first = buildMeetingRecord();
    const second = buildMeetingRecord();
    await PersistenceAdapter.save(first);
    await PersistenceAdapter.save(second);

    await PersistenceAdapter.deleteOne(first.meeting.id);

    expect(await PersistenceAdapter.load(first.meeting.id)).toBeNull();
    expect(await PersistenceAdapter.load(second.meeting.id)).toEqual(second);
  });

  it('clearAll wipes every stored MeetingRecord (BR6.1)', async () => {
    await PersistenceAdapter.save(buildMeetingRecord());
    await PersistenceAdapter.save(buildMeetingRecord());

    await PersistenceAdapter.clearAll();

    expect(await PersistenceAdapter.list()).toEqual([]);
  });

  it('throws a storage-unavailable PersistenceError when the database is unreachable (offline)', async () => {
    vi.spyOn(supabaseClient, 'upsertMeetingRecord').mockRejectedValueOnce(new TypeError('Failed to fetch'));

    const attempt = PersistenceAdapter.save(buildMeetingRecord());

    await expect(attempt).rejects.toBeInstanceOf(PersistenceError);
    await expect(attempt.catch((e) => e)).resolves.toMatchObject({ code: 'storage-unavailable' });
  });

  it('throws a corrupted-data PersistenceError when a stored value does not match the expected shape', async () => {
    vi.spyOn(supabaseClient, 'selectMeetingRecord').mockResolvedValueOnce({ not: 'a meeting record' } as never);

    const attempt = PersistenceAdapter.load('some-id');

    await expect(attempt).rejects.toBeInstanceOf(PersistenceError);
    await expect(attempt.catch((e) => e)).resolves.toMatchObject({ code: 'corrupted-data' });
  });
});
