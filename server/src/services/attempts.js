import { getStore } from '../data/index.js';
import { badRequest, conflict, forbidden, notFound } from '../lib/errors.js';
import { sanitizePlain, sanitizeRichText } from '../lib/sanitize.js';
import { nowIso } from '../lib/ids.js';
import { getAssessment, isOpenNow } from './assessments.js';
import { questionsForStudent } from './questions.js';
import { audit } from './audit.js';

export const ATTEMPT_STATUSES = ['in_progress', 'submitted', 'auto_submitted'];

/** Callbacks the realtime layer registers to learn about state changes. */
const listeners = new Set();
export function onAttemptChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }
function emit(attempt, reason) { for (const fn of listeners) { try { fn(attempt, reason); } catch { /* ignore */ } } }

export function findAttempt(assessment_id, student_id) {
  return getStore().findOne('Attempts', (t) => t.assessment_id === assessment_id && t.student_id === student_id);
}

export function getAttempt(id) {
  const t = getStore().get('Attempts', id);
  if (!t) throw notFound('Attempt not found');
  return t;
}

export function remainingSeconds(attempt, now = Date.now()) {
  if (!attempt || attempt.status !== 'in_progress' || !attempt.deadline_at) return 0;
  return Math.max(0, Math.floor((Date.parse(attempt.deadline_at) - now) / 1000));
}

export function isExpired(attempt, now = Date.now()) {
  return attempt?.status === 'in_progress' && attempt.deadline_at && Date.parse(attempt.deadline_at) <= now;
}

/** Student-facing list of assessments (not drafts) with their own attempt summary. */
export function assessmentsForStudent(student) {
  const store = getStore();
  return store
    .find('Assessments', (a) => a.status !== 'draft')
    .map((a) => {
      const full = getAssessment(a.assessment_id);
      const attempt = findAttempt(a.assessment_id, student.student_id);
      return summariseForStudent(full, attempt);
    })
    .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
}

export function summariseForStudent(assessment, attempt) {
  const a = assessment;
  return {
    assessment_id: a.assessment_id, title: a.title, course_code: a.course_code, course_name: a.course_name, semester: a.semester,
    description: a.description, instructions: a.instructions, duration_minutes: a.duration_minutes, start_at: a.start_at, end_at: a.end_at,
    status: a.status, is_open_now: a.is_open_now, camera_required: a.camera_required, proctoring_enabled: a.proctoring_enabled,
    results_released: a.results_released, created_at: a.created_at, server_time: nowIso(),
    attempt: attempt ? publicAttempt(attempt) : null,
  };
}

export function publicAttempt(t) {
  return {
    attempt_id: t.attempt_id, status: t.status, started_at: t.started_at, deadline_at: t.deadline_at, submitted_at: t.submitted_at,
    last_saved_at: t.last_saved_at, last_activity_at: t.last_activity_at, camera_status: t.camera_status,
    remaining_seconds: remainingSeconds(t), marking_status: t.marking_status, reopened_at: t.reopened_at,
  };
}

/** Start (or resume) an attempt. Deadline is computed on the server. */
export async function startAttempt(student, assessment_id) {
  const store = getStore();
  const assessment = getAssessment(assessment_id);
  let attempt = findAttempt(assessment_id, student.student_id);
  if (attempt) {
    await autoSubmitIfExpired(attempt);
    return getAttempt(attempt.attempt_id);
  }
  if (!isOpenNow(assessment)) throw forbidden('This assessment is not open at the moment');
  if (!student.group_id) throw forbidden('You have not been assigned to a group yet. Please contact your lecturer.');
  if (assessment.question_mode === 'component' && !student.role) {
    throw forbidden('You have not been assigned a business component yet. Please contact your lecturer.');
  }
  const now = Date.now();
  let deadline = now + assessment.duration_minutes * 60 * 1000;
  if (assessment.end_at) deadline = Math.min(deadline, Date.parse(assessment.end_at));
  attempt = await store.insert('Attempts', {
    assessment_id, student_id: student.student_id, group_id: student.group_id, component: student.role || '',
    status: 'in_progress', started_at: new Date(now).toISOString(), deadline_at: new Date(deadline).toISOString(),
    last_activity_at: nowIso(), camera_status: 'unknown', flags_count: 0, marking_status: 'pending',
  });
  await audit({ user_id: student.student_id, role: 'student', name: student.name }, 'ATTEMPT_STARTED', 'Attempt', attempt.attempt_id, { assessment_id });
  emit(attempt, 'started');
  return attempt;
}

/** Everything the student assessment screen needs. */
export async function getAttemptContext(student, assessment_id) {
  const assessment = getAssessment(assessment_id);
  let attempt = findAttempt(assessment_id, student.student_id);
  if (attempt) attempt = (await autoSubmitIfExpired(attempt)) || attempt;
  const questions = questionsForStudent(assessment, student.role).map((q) => studentQuestion(q));
  const answers = attempt
    ? getStore().find('Answers', (a) => a.assessment_id === assessment_id && a.student_id === student.student_id)
        .map((a) => ({ question_id: a.question_id, answer: a.answer, timestamp: a.timestamp, status: a.status }))
    : [];
  const canSeeMarks = assessment.results_released && attempt && ['submitted', 'auto_submitted'].includes(attempt.status) && attempt.marking_status === 'finalised';
  return {
    assessment: summariseForStudent(assessment, attempt),
    student: {
      student_id: student.student_id, name: student.name, matric_no: student.matric_no, group_id: student.group_id,
      group_name: student.group_name, business_name: student.business_name, business_idea: student.business_idea, component: student.role,
    },
    questions,
    answers,
    results: canSeeMarks ? resultsForStudent(student, assessment_id, attempt) : null,
    server_time: nowIso(),
  };
}

/** Strip anything a student must not see (e.g. correct MCQ option). */
export function studentQuestion(q) {
  return {
    question_id: q.question_id, section: q.section, topic: q.topic, question_text: q.question_text, question_type: q.question_type,
    marks: q.marks, time_limit: q.time_limit, order_index: q.order_index, guidance: q.guidance,
    options: Array.isArray(q.options) ? q.options.map((o) => ({ key: o.key, text: o.text })) : null,
  };
}

function resultsForStudent(student, assessment_id, attempt) {
  const answers = getStore().find('Answers', (a) => a.assessment_id === assessment_id && a.student_id === student.student_id);
  return {
    total_marks: attempt.total_marks, max_marks: attempt.max_marks, lecturer_feedback: attempt.lecturer_feedback, marked_at: attempt.marked_at,
    per_question: answers.map((a) => ({ question_id: a.question_id, marks: a.marks, lecturer_feedback: a.lecturer_feedback })),
  };
}

function sanitizeAnswer(question, raw) {
  if (raw === null || raw === undefined) return '';
  switch (question.question_type) {
    case 'multiple_choice': {
      const key = sanitizePlain(raw);
      const keys = (question.options || []).map((o) => o.key);
      if (key && !keys.includes(key)) throw badRequest('Invalid option selected');
      return key;
    }
    case 'numerical': // final value on the first line, optional working below (plain text)
    case 'short_answer':
      return sanitizePlain(raw).slice(0, 5000);
    default:
      return sanitizeRichText(raw).slice(0, 45000); // keep below the Google Sheets 50,000-character cell limit
  }
}

/**
 * Save a batch of answers (the client debounces and sends several at once).
 * Returns per-question save confirmations.
 */
export async function saveAnswers(student, assessment_id, items) {
  const store = getStore();
  const assessment = getAssessment(assessment_id);
  const attempt = findAttempt(assessment_id, student.student_id);
  if (!attempt) throw badRequest('Start the assessment before saving answers');
  if (await autoSubmitIfExpired(attempt)) throw conflict('Time has expired. Your latest saved answers were submitted automatically.', { code: 'TIME_EXPIRED' });
  if (attempt.status !== 'in_progress') throw conflict('This attempt has been submitted and is locked', { code: 'LOCKED' });
  if (!Array.isArray(items) || !items.length) throw badRequest('No answers provided');
  if (items.length > 100) throw badRequest('Too many answers in one request');
  const visible = new Map(questionsForStudent(assessment, student.role).map((q) => [q.question_id, q]));
  const saved = [];
  const ts = nowIso();
  for (const item of items) {
    const q = visible.get(item.question_id);
    if (!q) throw forbidden('You cannot answer this question');
    const answer = sanitizeAnswer(q, item.answer);
    const existing = store.findOne('Answers', (a) => a.assessment_id === assessment_id && a.student_id === student.student_id && a.question_id === q.question_id);
    if (existing) {
      if (existing.answer !== answer) await store.update('Answers', existing.answer_id, { answer, timestamp: ts, status: 'draft' });
    } else {
      await store.insert('Answers', {
        assessment_id, student_id: student.student_id, group_id: attempt.group_id, question_id: q.question_id, component: attempt.component,
        answer, timestamp: ts, status: 'draft', marks: null, lecturer_feedback: '',
      });
    }
    saved.push({ question_id: q.question_id, timestamp: ts });
  }
  const updated = await store.update('Attempts', attempt.attempt_id, { last_saved_at: ts, last_activity_at: ts });
  emit(updated, 'saved');
  return { saved, server_time: ts, remaining_seconds: remainingSeconds(updated) };
}

async function markAnswersSubmitted(attempt) {
  const store = getStore();
  const answers = store.find('Answers', (a) => a.assessment_id === attempt.assessment_id && a.student_id === attempt.student_id);
  for (const a of answers) if (a.status !== 'submitted') await store.update('Answers', a.answer_id, { status: 'submitted' });
}

export async function submitAttempt(student, assessment_id) {
  const store = getStore();
  const attempt = findAttempt(assessment_id, student.student_id);
  if (!attempt) throw badRequest('No attempt to submit');
  if (attempt.status !== 'in_progress') throw conflict('This attempt has already been submitted');
  await markAnswersSubmitted(attempt);
  const updated = await store.update('Attempts', attempt.attempt_id, {
    status: 'submitted', submitted_at: nowIso(), last_activity_at: nowIso(), marking_status: 'pending',
  });
  await audit({ user_id: student.student_id, role: 'student', name: student.name }, 'ATTEMPT_SUBMITTED', 'Attempt', attempt.attempt_id, { assessment_id });
  emit(updated, 'submitted');
  return updated;
}

/** Returns the updated attempt if it was auto-submitted, otherwise null. */
export async function autoSubmitIfExpired(attempt) {
  if (!isExpired(attempt)) return null;
  const store = getStore();
  await markAnswersSubmitted(attempt);
  const updated = await store.update('Attempts', attempt.attempt_id, {
    status: 'auto_submitted', submitted_at: attempt.deadline_at, marking_status: 'pending',
  });
  await audit(null, 'ATTEMPT_AUTO_SUBMITTED', 'Attempt', attempt.attempt_id, { assessment_id: attempt.assessment_id, student_id: attempt.student_id });
  emit(updated, 'auto_submitted');
  return updated;
}

/** Periodic sweep so expired attempts close even if the student's browser is gone. */
export async function sweepExpiredAttempts() {
  const expired = getStore().find('Attempts', (t) => isExpired(t));
  for (const t of expired) await autoSubmitIfExpired(t);
  return expired.length;
}

/** Lecturer-only: unlock a submitted attempt and give additional time. */
export async function reopenAttempt(attempt_id, actor, { extra_minutes, reason }) {
  const store = getStore();
  const attempt = getAttempt(attempt_id);
  if (attempt.status === 'in_progress') throw conflict('This attempt is already in progress');
  if (attempt.marking_status === 'finalised') throw conflict('Marks for this attempt are finalised. Reopen marking first.');
  const mins = Number(extra_minutes);
  if (!Number.isInteger(mins) || mins < 1 || mins > 600) throw badRequest('Extra minutes must be between 1 and 600');
  if (!sanitizePlain(reason)) throw badRequest('A reason is required to reopen an attempt');
  const answers = store.find('Answers', (a) => a.assessment_id === attempt.assessment_id && a.student_id === attempt.student_id);
  for (const a of answers) await store.update('Answers', a.answer_id, { status: 'draft' });
  const updated = await store.update('Attempts', attempt_id, {
    status: 'in_progress', deadline_at: new Date(Date.now() + mins * 60000).toISOString(), submitted_at: '',
    reopened_by: actor.user_id, reopened_at: nowIso(), reopen_reason: sanitizePlain(reason),
  });
  await audit(actor, 'ATTEMPT_REOPENED', 'Attempt', attempt_id, { extra_minutes: mins, reason: sanitizePlain(reason) });
  emit(updated, 'reopened');
  return updated;
}

/**
 * Presence/heartbeat from the student client. Writes are throttled using the
 * stored last_activity_at (stateless, so it also works in Apps Script where every
 * request is a fresh execution).
 */
export async function recordActivity(student, assessment_id, { camera_status } = {}) {
  const attempt = findAttempt(assessment_id, student.student_id);
  if (!attempt || attempt.status !== 'in_progress') return attempt;
  const cam = camera_status ? sanitizePlain(camera_status).slice(0, 40) : attempt.camera_status;
  const changed = cam !== attempt.camera_status;
  const last = attempt.last_activity_at ? Date.parse(attempt.last_activity_at) : 0;
  if (!changed && Date.now() - last < 40000) return attempt; // throttle writes
  const updated = await getStore().update('Attempts', attempt.attempt_id, { last_activity_at: nowIso(), camera_status: cam });
  emit(updated, 'activity');
  return updated;
}

export async function incrementFlags(attempt_id) {
  const store = getStore();
  const t = store.get('Attempts', attempt_id);
  if (!t) return null;
  const updated = await store.update('Attempts', attempt_id, { flags_count: (t.flags_count || 0) + 1 });
  emit(updated, 'flag');
  return updated;
}
