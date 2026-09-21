/**
 * Plain data contract CardGeneration accepts — deliberately independent of
 * the Meeting/AgendaItem/Attendee domain types (ADR-004: CardGeneration
 * has no dependency on Scheduling and no awareness it exists). Scheduling
 * maps its own domain records into this shape before calling in.
 */
export interface CardAgendaItem {
  id: string;
  topic: string;
  speaker: string;
  durationMinutes: number;
  order: number;
}

export interface CardData {
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
  agendaItems: CardAgendaItem[];
  /** Present only once the Meeting has been saved; used for the BR5.1 deep-link QR fallback. */
  meetingId?: string;
}

/** Thrown by CardGeneration when a preview or export render fails (never swallowed — reliability-design.md). */
export class CardGenerationError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'CardGenerationError';
  }
}

/**
 * BR5.1 — resolves the QR payload: the meeting link when present, else an
 * in-app deep link to the meeting's details. Shared by both renderPreview
 * and exportPdf so preview and export always encode the same payload.
 *
 * `meetingId` is absent for a not-yet-saved draft's live preview (a Meeting
 * only receives an id at save time — functional-spec.md Workflow 1 step 5);
 * in that case the deep link falls back to the generic "new meeting" route,
 * the closest available in-app destination until the meeting has an id of
 * its own.
 */
export function resolveQrPayload(meetingLink: string, meetingId: string | undefined, origin: string): string {
  if (meetingLink.trim() !== '') {
    return meetingLink;
  }
  return meetingId ? `${origin}/meeting/${meetingId}/edit` : `${origin}/meeting/new`;
}

/** Resolves the current origin for building an in-app deep link, safe outside a browser context too. */
export function getAppOrigin(): string {
  return typeof window !== 'undefined' && window.location ? window.location.origin : '';
}
