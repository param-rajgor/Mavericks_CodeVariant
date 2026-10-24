/** Date helpers. User-entered dates are date-only strings (YYYY-MM-DD) interpreted in local time. */

const pad = (n: number) => String(n).padStart(2, '0');

export function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export const todayStr = (now = new Date()) => toDateStr(now);

export function parseDate(s: string): Date {
  return s.length === 10 ? new Date(`${s}T12:00:00`) : new Date(s);
}

export function isValidDateStr(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(parseDate(s).getTime());
}

export function daysSince(s: string, now = new Date()): number {
  return Math.max(0, Math.floor((now.getTime() - parseDate(s).getTime()) / 86_400_000));
}

export function daysAgoStr(days: number, now = new Date()): string {
  const d = new Date(now);
  d.setDate(d.getDate() - days);
  return toDateStr(d);
}

export function timeAgo(s: string | null, now = new Date()): string {
  if (!s) return 'date unknown';
  const days = daysSince(s, now);
  if (days < 1) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) {
    const w = Math.floor(days / 7);
    return w === 1 ? '1 week ago' : `${w} weeks ago`;
  }
  if (days < 365) {
    const m = Math.floor(days / 30);
    return m === 1 ? '1 month ago' : `${m} months ago`;
  }
  const y = Math.floor(days / 365);
  return y === 1 ? '1 year ago' : `${y} years ago`;
}

export function formatDate(s: string | null): string {
  if (!s) return '—';
  return parseDate(s).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(s: string): string {
  return new Date(s).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
