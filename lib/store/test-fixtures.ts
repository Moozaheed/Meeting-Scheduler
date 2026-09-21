/**
 * Test-data factories (unit-test-instructions.md's Test Data Management).
 * Each factory builds a default, all-required-fields-present valid record,
 * overridable per test via spread syntax. Not a separate package — small
 * enough to colocate per that same instruction.
 */
import type {
  AgendaItem,
  AgendaItemDraft,
  Attendee,
  AttendeeDraft,
  Meeting,
  MeetingDraft,
  MeetingRecord,
} from '@/types/domain';

let sequence = 0;
function nextId(prefix: string): string {
  sequence += 1;
  return `${prefix}-${sequence}`;
}

export function buildMeeting(overrides: Partial<Meeting> = {}): Meeting {
  return {
    id: nextId('meeting'),
    title: 'Q3 Planning Sync',
    description: 'Quarterly planning discussion.',
    date: '2026-10-01',
    startTime: '09:00',
    endTime: '10:00',
    timezone: 'America/New_York',
    meetingLink: 'https://example.com/join/q3-planning',
    location: '',
    hostName: 'Alex Host',
    hostRoleOrg: 'Product Manager, Acme Inc.',
    hostEmail: 'alex@example.com',
    createdAt: '2026-09-01T12:00:00.000Z',
    ...overrides,
  };
}

export function buildAgendaItem(overrides: Partial<AgendaItem> = {}): AgendaItem {
  return {
    id: nextId('agenda'),
    meetingId: 'meeting-1',
    topic: 'Review roadmap',
    speaker: 'Alex Host',
    durationMinutes: 15,
    order: 0,
    ...overrides,
  };
}

export function buildAttendee(overrides: Partial<Attendee> = {}): Attendee {
  return {
    id: nextId('attendee'),
    meetingId: 'meeting-1',
    name: 'Jordan Attendee',
    email: 'jordan@example.com',
    role: 'Engineer',
    ...overrides,
  };
}

export function buildAgendaItemDraft(overrides: Partial<AgendaItemDraft> = {}): AgendaItemDraft {
  return {
    id: nextId('agenda-draft'),
    topic: 'Review roadmap',
    speaker: 'Alex Host',
    durationMinutes: 15,
    order: 0,
    ...overrides,
  };
}

export function buildAttendeeDraft(overrides: Partial<AttendeeDraft> = {}): AttendeeDraft {
  return {
    id: nextId('attendee-draft'),
    name: 'Jordan Attendee',
    email: 'jordan@example.com',
    role: 'Engineer',
    ...overrides,
  };
}

export function buildMeetingDraft(overrides: Partial<MeetingDraft> = {}): MeetingDraft {
  return {
    title: 'Q3 Planning Sync',
    description: 'Quarterly planning discussion.',
    date: '2026-10-01',
    startTime: '09:00',
    endTime: '10:00',
    timezone: 'America/New_York',
    meetingLink: 'https://example.com/join/q3-planning',
    location: '',
    hostName: 'Alex Host',
    hostRoleOrg: 'Product Manager, Acme Inc.',
    hostEmail: 'alex@example.com',
    agendaItems: [],
    attendees: [],
    ...overrides,
  };
}

export function buildMeetingRecord(overrides: Partial<MeetingRecord> = {}): MeetingRecord {
  const meeting = overrides.meeting ?? buildMeeting();
  return {
    meeting,
    agendaItems: overrides.agendaItems ?? [buildAgendaItem({ meetingId: meeting.id })],
    attendees: overrides.attendees ?? [buildAttendee({ meetingId: meeting.id })],
  };
}
