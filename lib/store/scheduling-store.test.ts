import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CardGeneration } from '@/lib/card/card-generation';
import { PersistenceAdapter, PersistenceError } from '@/lib/persistence/persistence-adapter';
import {
  reorderAgendaItems,
  validateAgendaItemTopic,
  validateAttendeeEmailFormat,
  validateAttendeeEmailUnique,
  validateAttendeeName,
} from '@/lib/store/scheduling-rules';
import { Scheduling } from '@/lib/store/scheduling-store';
import {
  buildAgendaItem,
  buildAgendaItemDraft,
  buildAttendeeDraft,
  buildMeeting,
  buildMeetingDraft,
  buildMeetingRecord,
} from '@/lib/store/test-fixtures';

vi.mock('@/lib/persistence/persistence-adapter', () => {
  class MockPersistenceError extends Error {
    code: string;
    constructor(code: string, message: string) {
      super(message);
      this.name = 'PersistenceError';
      this.code = code;
    }
  }
  return {
    PersistenceAdapter: {
      save: vi.fn(),
      load: vi.fn(),
      list: vi.fn(),
      deleteOne: vi.fn(),
      clearAll: vi.fn(),
    },
    PersistenceError: MockPersistenceError,
  };
});

vi.mock('@/lib/card/card-generation', () => ({
  CardGeneration: {
    renderPreview: vi.fn(),
    exportPdf: vi.fn(),
  },
}));

describe('Scheduling (business logic)', () => {
  beforeEach(async () => {
    vi.mocked(PersistenceAdapter.save).mockReset().mockResolvedValue(undefined);
    vi.mocked(PersistenceAdapter.load).mockReset().mockResolvedValue(null);
    vi.mocked(PersistenceAdapter.list).mockReset().mockResolvedValue([]);
    vi.mocked(PersistenceAdapter.deleteOne).mockReset().mockResolvedValue(undefined);
    vi.mocked(PersistenceAdapter.clearAll).mockReset().mockResolvedValue(undefined);
    vi.mocked(CardGeneration.renderPreview).mockReset();
    vi.mocked(CardGeneration.exportPdf).mockReset();
    await Scheduling.clearAllData();
  });

  it('BR1.1-BR1.4: blocks save and returns field errors for missing/invalid Meeting fields', async () => {
    const draft = buildMeetingDraft({
      title: '',
      meetingLink: 'not-a-url',
      location: '',
      startTime: '10:00',
      endTime: '09:00',
    });

    const result = await Scheduling.saveMeeting(draft);

    expect(result.status).toBe('invalid');
    if (result.status === 'invalid') {
      expect(result.errors.title).toBeDefined();
      expect(result.errors.meetingLink).toBeDefined();
      expect(result.errors.endTime).toBeDefined();
    }
    expect(PersistenceAdapter.save).not.toHaveBeenCalled();
  });

  it('saves successfully with zero agenda items and zero attendees when required fields are valid (BR2.1, BR3.1)', async () => {
    const draft = buildMeetingDraft({ agendaItems: [], attendees: [] });

    const result = await Scheduling.saveMeeting(draft);

    expect(result.status).toBe('saved');
    expect(PersistenceAdapter.save).toHaveBeenCalledTimes(1);
  });

  it('BR2.2-BR2.3: recalculates agenda order on reorder and blocks an empty topic', () => {
    expect(validateAgendaItemTopic('')).not.toBeNull();
    expect(validateAgendaItemTopic('Kickoff')).toBeNull();

    const items = [
      buildAgendaItemDraft({ id: 'a', order: 0 }),
      buildAgendaItemDraft({ id: 'b', order: 1 }),
      buildAgendaItemDraft({ id: 'c', order: 2 }),
    ];
    const reordered = reorderAgendaItems(items, 'c', 'up');

    expect(reordered.find((item) => item.id === 'c')?.order).toBe(1);
    expect(reordered.find((item) => item.id === 'b')?.order).toBe(2);
  });

  it('BR3.2-BR3.4: blocks an empty name, a malformed email, and a duplicate email (case-insensitive)', () => {
    expect(validateAttendeeName('')).not.toBeNull();
    expect(validateAttendeeEmailFormat('not-an-email')).not.toBeNull();

    const existing = [buildAttendeeDraft({ id: 'x', email: 'dup@example.com' })];
    expect(validateAttendeeEmailUnique(existing, 'DUP@example.com')).not.toBeNull();
    expect(validateAttendeeEmailUnique(existing, 'new@example.com')).toBeNull();
  });

  it('BR4.1: lists meetings sorted by (date, startTime) descending, newest first', async () => {
    const older = buildMeetingRecord({ meeting: buildMeeting({ id: 'm1', date: '2026-09-01', startTime: '09:00' }) });
    const newer = buildMeetingRecord({ meeting: buildMeeting({ id: 'm2', date: '2026-10-01', startTime: '09:00' }) });
    vi.mocked(PersistenceAdapter.list).mockResolvedValue([older, newer]);

    const summaries = await Scheduling.listMeetingSummaries();

    expect(summaries.map((summary) => summary.id)).toEqual(['m2', 'm1']);
  });

  it('BR4.2: deleting a meeting removes its whole record (children live inside it, so deletion cascades implicitly)', async () => {
    await Scheduling.deleteMeeting('m1');

    expect(PersistenceAdapter.deleteOne).toHaveBeenCalledWith('m1');
  });

  it('BR6.1: clearAllData wipes both persisted and in-memory-fallback records', async () => {
    vi.mocked(PersistenceAdapter.save).mockRejectedValueOnce(new PersistenceError('quota-exceeded', 'full'));
    await Scheduling.saveMeeting(buildMeetingDraft());

    await Scheduling.clearAllData();

    expect(PersistenceAdapter.clearAll).toHaveBeenCalled();
    const summaries = await Scheduling.listMeetingSummaries();
    expect(summaries).toEqual([]);
  });

  it('delegates renderPreview/exportCard to CardGeneration as the sole caller', async () => {
    const fakePreviewElement = { type: 'preview' } as unknown as ReturnType<typeof CardGeneration.renderPreview>;
    vi.mocked(CardGeneration.renderPreview).mockReturnValue(fakePreviewElement);
    const draft = buildMeetingDraft();

    const preview = Scheduling.renderPreview(draft, 'meeting-1');

    expect(CardGeneration.renderPreview).toHaveBeenCalledWith(
      expect.objectContaining({ title: draft.title, meetingId: 'meeting-1' }),
    );
    expect(preview).toBe(fakePreviewElement);

    const meeting = buildMeeting({ id: 'meeting-1' });
    const agendaItems = [buildAgendaItem({ meetingId: 'meeting-1' })];
    const fakeBlob = new Blob(['pdf-bytes']);
    vi.mocked(CardGeneration.exportPdf).mockResolvedValue(fakeBlob);

    const blob = await Scheduling.exportCard(meeting, agendaItems);

    expect(CardGeneration.exportPdf).toHaveBeenCalledWith(
      expect.objectContaining({ title: meeting.title, meetingId: 'meeting-1' }),
    );
    expect(blob).toBe(fakeBlob);
  });

  it('NFR4.1/NFR4.2: falls back to in-memory session state with a notice on persistence failure, without mutating the caller\'s draft', async () => {
    vi.mocked(PersistenceAdapter.save).mockRejectedValueOnce(new PersistenceError('storage-unavailable', 'private browsing'));
    const draft = buildMeetingDraft({ title: 'Fallback meeting' });

    const result = await Scheduling.saveMeeting(draft);

    expect(result.status).toBe('saved-in-memory');
    if (result.status === 'saved-in-memory') {
      expect(result.notice).toMatch(/session/i);
    }
    expect(draft.title).toBe('Fallback meeting');

    vi.mocked(PersistenceAdapter.list).mockResolvedValue([]);
    const summaries = await Scheduling.listMeetingSummaries();
    expect(summaries.some((summary) => summary.title === 'Fallback meeting')).toBe(true);
  });
});
