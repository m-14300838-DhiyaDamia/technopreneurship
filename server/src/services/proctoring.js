import { getStore } from '../data/index.js';
import { badRequest, notFound } from '../lib/errors.js';
import { sanitizePlain } from '../lib/sanitize.js';
import { nowIso } from '../lib/ids.js';
import { PROCTORING_EVENT_TYPES, PROCTORING_SEVERITY } from './templates.js';
import { findAttempt, incrementFlags } from './attempts.js';
import { audit } from './audit.js';

const listeners = new Set();
export function onProctoringEvent(fn) { listeners.add(fn); return () => listeners.delete(fn); }

/**
 * Record a monitoring event reported by the student's browser.
 * Events are evidence for lecturer review — never an automatic accusation.
 */
export async function recordEvent(student, { assessment_id, event_type, description, client_time }) {
  if (!PROCTORING_EVENT_TYPES.includes(event_type)) throw badRequest('Unknown monitoring event type');
  const attempt = findAttempt(assessment_id, student.student_id);
  if (!attempt) throw badRequest('No active attempt for this assessment');
  const severity = PROCTORING_SEVERITY[event_type] || 'low';
  const log = await getStore().insert('ProctoringLogs', {
    assessment_id, student_id: student.student_id, group_id: attempt.group_id, timestamp: nowIso(), event_type, severity,
    description: sanitizePlain(description).slice(0, 500) + (client_time ? ` (client time ${sanitizePlain(client_time).slice(0, 40)})` : ''),
    review_status: 'pending', reviewed_by: '', review_note: '',
  });
  if (severity !== 'info' && attempt.status === 'in_progress') await incrementFlags(attempt.attempt_id);
  for (const fn of listeners) { try { fn(log, attempt); } catch { /* ignore */ } }
  return log;
}

export function listEvents({ assessment_id, student_id, group_id, review_status, severity, limit = 500 } = {}) {
  const store = getStore();
  const students = new Map(store.list('Students').map((s) => [s.student_id, s]));
  const groups = new Map(store.list('Groups').map((g) => [g.group_id, g]));
  return store
    .find('ProctoringLogs', (l) => (!assessment_id || l.assessment_id === assessment_id) && (!student_id || l.student_id === student_id)
      && (!group_id || l.group_id === group_id) && (!review_status || l.review_status === review_status) && (!severity || l.severity === severity))
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, limit)
    .map((l) => ({ ...l, student_name: students.get(l.student_id)?.name || '', matric_no: students.get(l.student_id)?.matric_no || '', group_name: groups.get(l.group_id)?.group_name || '' }));
}

export function monitoringSummary(assessment_id, student_id) {
  const logs = getStore().find('ProctoringLogs', (l) => l.assessment_id === assessment_id && l.student_id === student_id);
  const by_type = {};
  for (const l of logs) by_type[l.event_type] = (by_type[l.event_type] || 0) + 1;
  const flagged = logs.filter((l) => l.severity !== 'info');
  return {
    total_events: logs.length, flagged_events: flagged.length, pending_review: flagged.filter((l) => l.review_status === 'pending').length,
    by_type, last_event_at: logs.map((l) => l.timestamp).sort().pop() || null,
  };
}

export async function reviewEvent(log_id, { review_status, review_note }, actor) {
  const store = getStore();
  const log = store.get('ProctoringLogs', log_id);
  if (!log) throw notFound('Monitoring event not found');
  if (!['pending', 'reviewed', 'dismissed', 'escalated'].includes(review_status)) throw badRequest('Invalid review status');
  const updated = await store.update('ProctoringLogs', log_id, { review_status, review_note: sanitizePlain(review_note).slice(0, 1000), reviewed_by: actor.user_id });
  await audit(actor, 'MONITORING_EVENT_REVIEWED', 'ProctoringLog', log_id, { review_status });
  return updated;
}

/** Data retention: delete monitoring events older than N days. Returns the count removed. */
export async function purgeOlderThan(days, actor) {
  const store = getStore();
  const cutoff = Date.now() - Number(days) * 86400000;
  const old = store.find('ProctoringLogs', (l) => Date.parse(l.timestamp) < cutoff);
  for (const l of old) await store.remove('ProctoringLogs', l.log_id);
  await audit(actor, 'MONITORING_EVENTS_PURGED', 'ProctoringLog', '', { days, removed: old.length });
  return old.length;
}
