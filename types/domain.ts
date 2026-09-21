/**
 * Domain types — Meeting Scheduler & Invitation Card Generator.
 *
 * Shapes here follow `entities.md` exactly (attribute names, types,
 * optionality). Three entities, all owned by the Scheduling domain/state
 * layer: Meeting is the root record; AgendaItem and Attendee are child
 * collections keyed by `meetingId`, both optional, both cascade-deleted
 * with their parent Meeting (BR4.2).
 */

/** A single scheduled meeting with its details, agenda, and attendee list (FR6.1). */
export interface Meeting {
  /** Client-generated via crypto.randomUUID() at creation. */
  id: string;
  title: string;
  /** Optional free-text purpose/description. */
  description: string;
  /** ISO 8601 date, YYYY-MM-DD. */
  date: string;
  /** 24-hour HH:MM. */
  startTime: string;
  /** 24-hour HH:MM; must be after startTime — see BR1.4. */
  endTime: string;
  /** IANA timezone identifier, e.g. "America/New_York". */
  timezone: string;
  /** Required if location is absent — see BR1.2; must be a well-formed URL — see BR1.3. */
  meetingLink: string;
  /** Required if meetingLink is absent — see BR1.2. */
  location: string;
  hostName: string;
  /** Combined free-text role/organization field, e.g. "Product Manager, Acme Inc." */
  hostRoleOrg: string;
  hostEmail: string;
  /** ISO 8601 date-time; set once at creation, never updated. */
  createdAt: string;
}

/** One itemized agenda topic within a Meeting's agenda. */
export interface AgendaItem {
  id: string;
  meetingId: string;
  topic: string;
  speaker: string;
  durationMinutes: number;
  /** Zero-based position within the Meeting's agenda, unique per Meeting (BR2.2). */
  order: number;
}

/** One invited attendee of a Meeting. */
export interface Attendee {
  id: string;
  meetingId: string;
  name: string;
  email: string;
  role: string;
}

/** A Meeting bundled with its child records — the unit PersistenceAdapter and Scheduling operate on together. */
export interface MeetingRecord {
  meeting: Meeting;
  agendaItems: AgendaItem[];
  attendees: Attendee[];
}

/**
 * Computed, never-persisted display status (BR7.1). Re-evaluated on every
 * render from (date, endTime, timezone) against the current time.
 */
export type MeetingStatus = 'upcoming' | 'past';

/** Summary shape used by the Meetings List (FR4.1) — attendeeCount is derived, not stored. */
export interface MeetingSummary {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  timezone: string;
  attendeeCount: number;
  status: MeetingStatus;
}

/**
 * Draft (pre-save) form-state shapes owned by Presentation, per
 * `frontend-components.md`. Not persisted until valid; local `id`s are
 * generated client-side so React lists have stable keys before a save.
 */
export interface AgendaItemDraft {
  id: string;
  topic: string;
  speaker: string;
  durationMinutes: number;
  order: number;
}

export interface AttendeeDraft {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface MeetingDraft {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  timezone: string;
  meetingLink: string;
  location: string;
  hostName: string;
  hostRoleOrg: string;
  hostEmail: string;
  agendaItems: AgendaItemDraft[];
  attendees: AttendeeDraft[];
}

/** Field-level validation error map, keyed by MeetingDraft field name. */
export type ValidationErrors = Record<string, string>;
