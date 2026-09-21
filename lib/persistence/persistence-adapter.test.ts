import * as idbKeyval from 'idb-keyval';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PersistenceAdapter, PersistenceError } from '@/lib/persistence/persistence-adapter';
import { buildMeetingRecord } from '@/lib/store/test-fixtures';

vi.mock('idb-keyval', async (importOriginal) => {
  const actual = await importOriginal<typeof idbKeyval>();
  return {
    ...actual,
    set: vi.fn(actual.set),
    get: vi.fn(actual.get),
  };
});

describe('PersistenceAdapter', () => {
  beforeEach(async () => {
    // idb-keyval memoizes its database connection on first use, so
    // per-test isolation is achieved with a real clear rather than by
    // swapping out the global `indexedDB` (see vitest.setup.ts).
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

  it('throws a quota-exceeded PersistenceError when the underlying store rejects with QuotaExceededError', async () => {
    vi.mocked(idbKeyval.set).mockRejectedValueOnce(new DOMException('quota exceeded', 'QuotaExceededError'));

    const attempt = PersistenceAdapter.save(buildMeetingRecord());

    await expect(attempt).rejects.toBeInstanceOf(PersistenceError);
    await expect(attempt.catch((e) => e)).resolves.toMatchObject({ code: 'quota-exceeded' });
  });

  it('throws a storage-unavailable PersistenceError on a private-browsing-style restriction', async () => {
    vi.mocked(idbKeyval.set).mockRejectedValueOnce(new DOMException('restricted', 'SecurityError'));

    const attempt = PersistenceAdapter.save(buildMeetingRecord());

    await expect(attempt).rejects.toBeInstanceOf(PersistenceError);
    await expect(attempt.catch((e) => e)).resolves.toMatchObject({ code: 'storage-unavailable' });
  });

  it('throws a corrupted-data PersistenceError when a stored value does not match the expected shape', async () => {
    vi.mocked(idbKeyval.get).mockResolvedValueOnce({ not: 'a meeting record' });

    const attempt = PersistenceAdapter.load('some-id');

    await expect(attempt).rejects.toBeInstanceOf(PersistenceError);
    await expect(attempt.catch((e) => e)).resolves.toMatchObject({ code: 'corrupted-data' });
  });
});
