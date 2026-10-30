// Portal FFM — display helpers shared by the mock services and views.

export function iso(ms: number): string {
  return new Date(ms).toISOString();
}

/** "jordan@demo-pharmacy.example" → "j•••@demo-pharmacy.example" */
export function maskEmail(email: string): string {
  const at = email.indexOf('@');
  if (at < 1) return '•••';
  return `${email[0]}•••${email.slice(at)}`;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2026-11-26" → "26 Nov 2026" (dates in fixtures are calendar dates, not instants). */
export function formatDate(value: string | undefined): string {
  if (!value) return '';
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!m) return value;
  return `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}`;
}

/** Local wall-clock "10:42" for refresh/resend lines. */
export function formatTime(isoValue: string | null | undefined): string {
  if (!isoValue) return '';
  const d = new Date(isoValue);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
