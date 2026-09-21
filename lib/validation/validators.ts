/**
 * Shared field-level validators (rules.md BR1.3, BR3.3). Pure functions,
 * no framework or domain-model dependency, so they can be reused wherever
 * a well-formed URL or email needs checking.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** BR1.3 — well-formed URL check for Meeting.meetingLink. */
export function isWellFormedUrl(value: string): boolean {
  if (value.trim() === '') return false;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/** BR3.3 — well-formed email check for Attendee.email (and reused for Meeting.hostEmail's BR1.1 presence pairing). */
export function isWellFormedEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}
