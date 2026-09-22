/**
 * A tiny per-browser localStorage registry of meeting ids this device has
 * created or edited — never meeting data itself, just an anonymous id set.
 *
 * Needed because the Supabase backend is shared and this app has no
 * authentication (unlisted-URL access model, unchanged from the original
 * design): without this, "Clear my data" would delete every meeting for
 * every visitor, not just this device's own. This keeps that action
 * scoped to what "my data" can still reasonably mean once storage is no
 * longer per-device — see README.md's "Data & Privacy" section.
 */
const STORAGE_KEY = 'meeting-card-scheduler:device-owned-meeting-ids';

function readIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : []);
  } catch {
    return new Set();
  }
}

function writeIds(ids: Set<string>): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // Best-effort only — losing this registry degrades "Clear my data" for
    // that one meeting, it never crashes the app or blocks a save.
  }
}

export function rememberOwnedMeeting(meetingId: string): void {
  const ids = readIds();
  ids.add(meetingId);
  writeIds(ids);
}

export function forgetOwnedMeeting(meetingId: string): void {
  const ids = readIds();
  ids.delete(meetingId);
  writeIds(ids);
}

export function listOwnedMeetingIds(): string[] {
  return [...readIds()];
}

export function clearOwnedMeetingIds(): void {
  writeIds(new Set());
}
