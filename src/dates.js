// Dates are stored as plain "YYYY-MM-DD" strings to avoid timezone bugs.
const pad = (n) => String(n).padStart(2, '0');

export const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayISO = () => toISO(new Date());

export function parseISO(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDaysISO(iso, n) {
  const d = parseISO(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
}

export const formatLong = (iso) =>
  parseISO(iso).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

export function formatDue(iso) {
  const today = todayISO();
  if (iso === today) return 'Today';
  if (iso === addDaysISO(today, 1)) return 'Tomorrow';
  return parseISO(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
