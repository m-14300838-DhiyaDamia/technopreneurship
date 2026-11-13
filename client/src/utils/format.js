export function fmtDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString('en-MY', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
export function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-MY', { day: '2-digit', month: 'long', year: 'numeric' });
}
export function fmtDuration(seconds) {
  const s = Math.max(0, Math.floor(seconds || 0));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return `${h > 0 ? `${h}:` : ''}${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}
export function timeAgo(iso) {
  if (!iso) return '—';
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 10) return 'just now';
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h ago`;
  return fmtDateTime(iso);
}
export function toLocalInput(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
export const labelize = (s) => String(s || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export const STATUS_TONE = {
  not_started: '', in_progress: 'info', submitted: 'ok', auto_submitted: 'warn', pending: '', draft: 'warn', finalised: 'ok',
  contributions_incomplete: 'warn', ready_for_review: 'info', reviewed: 'ok', exported: 'navy', open: 'ok', closed: 'bad', scheduled: 'info',
  active: 'ok', inactive: '', escalated: 'bad', dismissed: '', low: '', medium: 'warn', high: 'bad', info: 'info',
};
