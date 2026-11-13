import { getStore } from '../data/index.js';
import { badRequest, conflict, notFound } from '../lib/errors.js';
import { sanitizeRichText, sanitizePlain } from '../lib/sanitize.js';
import { nowIso } from '../lib/ids.js';
import { getAssessment } from './assessments.js';
import { questionsForStudent } from './questions.js';
import { getStudent } from './students.js';
import { getAttempt } from './attempts.js';
import { audit } from './audit.js';
import { monitoringSummary } from './proctoring.js';

/** Everything the lecturer needs to review and mark one student's attempt. */
export function getReview(attempt_id) {
  const store = getStore();
  const attempt = getAttempt(attempt_id);
  const student = getStudent(attempt.student_id);
  const assessment = getAssessment(attempt.assessment_id);
  const questions = questionsForStudent(assessment, attempt.component || student.role);
  const answers = store.find('Answers', (a) => a.assessment_id === attempt.assessment_id && a.student_id === attempt.student_id);
  const byQ = new Map(answers.map((a) => [a.question_id, a]));
  const items = questions.map((q, i) => {
    const a = byQ.get(q.question_id);
    return {
      number: i + 1, question: q,
      answer: a ? { answer_id: a.answer_id, answer: a.answer, timestamp: a.timestamp, status: a.status, marks: a.marks, lecturer_feedback: a.lecturer_feedback, marked_at: a.marked_at } : null,
    };
  });
  const max_marks = questions.reduce((s, q) => s + (q.marks || 0), 0);
  const marked = items.filter((it) => it.answer && it.answer.marks !== null && it.answer.marks !== undefined);
  const total_marks = marked.reduce((s, it) => s + Number(it.answer.marks || 0), 0);
  return {
    attempt: { ...attempt, remaining_seconds: undefined }, student, assessment: {
      assessment_id: assessment.assessment_id, title: assessment.title, course_code: assessment.course_code, course_name: assessment.course_name,
      semester: assessment.semester, results_released: assessment.results_released,
    },
    items, totals: { total_marks, max_marks, marked_count: marked.length, question_count: questions.length, all_marked: marked.length === questions.length },
    monitoring: monitoringSummary(attempt.assessment_id, attempt.student_id),
  };
}

/** Save per-question marks and feedback as a draft. Refuses to touch finalised marks. */
export async function saveMarks(attempt_id, { items = [], lecturer_feedback }, actor) {
  const store = getStore();
  const attempt = getAttempt(attempt_id);
  if (!['submitted', 'auto_submitted'].includes(attempt.status)) throw conflict('Marks can only be entered after the student has submitted');
  if (attempt.marking_status === 'finalised') throw conflict('Marks are finalised. Use "Reopen marking" before changing them.');
  const assessment = getAssessment(attempt.assessment_id);
  const student = getStudent(attempt.student_id);
  const questions = new Map(questionsForStudent(assessment, attempt.component || student.role).map((q) => [q.question_id, q]));
  const ts = nowIso();
  for (const item of items) {
    const q = questions.get(item.question_id);
    if (!q) throw badRequest('Question does not belong to this student\'s assessment');
    let marks = item.marks;
    if (marks === '' || marks === undefined) marks = null;
    if (marks !== null) {
      marks = Number(marks);
      if (!Number.isFinite(marks) || marks < 0) throw badRequest('Marks must be zero or a positive number');
      if (marks > q.marks) throw badRequest(`Marks for question "${sanitizePlain(q.topic || q.question_id)}" cannot exceed ${q.marks}`);
    }
    const feedback = item.lecturer_feedback === undefined ? undefined : sanitizeRichText(item.lecturer_feedback);
    const existing = store.findOne('Answers', (a) => a.assessment_id === attempt.assessment_id && a.student_id === attempt.student_id && a.question_id === q.question_id);
    const patch = { marks, marked_at: ts, marked_by: actor.user_id };
    if (feedback !== undefined) patch.lecturer_feedback = feedback;
    if (existing) await store.update('Answers', existing.answer_id, patch);
    else {
      await store.insert('Answers', {
        assessment_id: attempt.assessment_id, student_id: attempt.student_id, group_id: attempt.group_id, question_id: q.question_id,
        component: attempt.component, answer: '', timestamp: '', status: 'unanswered', lecturer_feedback: '', ...patch,
      });
    }
  }
  const totals = recomputeTotals(attempt, questions);
  const upd = { ...totals, marking_status: 'draft', marked_by: actor.user_id, marked_at: ts };
  if (lecturer_feedback !== undefined) upd.lecturer_feedback = sanitizeRichText(lecturer_feedback);
  await store.update('Attempts', attempt_id, upd);
  await audit(actor, 'MARKS_SAVED', 'Attempt', attempt_id, { items: items.length });
  return getReview(attempt_id);
}

function recomputeTotals(attempt, questions) {
  const answers = getStore().find('Answers', (a) => a.assessment_id === attempt.assessment_id && a.student_id === attempt.student_id);
  const total = answers.filter((a) => questions.has(a.question_id)).reduce((s, a) => s + (a.marks === null || a.marks === undefined ? 0 : Number(a.marks)), 0);
  const max = Array.from(questions.values()).reduce((s, q) => s + (q.marks || 0), 0);
  return { total_marks: total, max_marks: max };
}

export async function finaliseMarking(attempt_id, actor) {
  const review = getReview(attempt_id);
  if (!['submitted', 'auto_submitted'].includes(review.attempt.status)) throw conflict('The student has not submitted');
  if (review.attempt.marking_status === 'finalised') throw conflict('Already finalised');
  if (!review.totals.all_marked) throw badRequest(`All ${review.totals.question_count} questions must be marked before finalising (${review.totals.marked_count} marked)`);
  await getStore().update('Attempts', attempt_id, { marking_status: 'finalised', marked_by: actor.user_id, marked_at: nowIso() });
  await audit(actor, 'MARKS_FINALISED', 'Attempt', attempt_id, { total_marks: review.totals.total_marks, max_marks: review.totals.max_marks });
  return getReview(attempt_id);
}

export async function reopenMarking(attempt_id, actor, reason) {
  const attempt = getAttempt(attempt_id);
  if (attempt.marking_status !== 'finalised') throw conflict('Marking is not finalised');
  if (!sanitizePlain(reason)) throw badRequest('A reason is required to reopen finalised marks');
  await getStore().update('Attempts', attempt_id, { marking_status: 'draft' });
  await audit(actor, 'MARKING_REOPENED', 'Attempt', attempt_id, { reason: sanitizePlain(reason) });
  return getReview(attempt_id);
}

export function listAttempts({ assessment_id, group_id, status, marking_status } = {}) {
  const store = getStore();
  const students = new Map(store.list('Students').map((s) => [s.student_id, s]));
  const groups = new Map(store.list('Groups').map((g) => [g.group_id, g]));
  return store
    .find('Attempts', (t) => (!assessment_id || t.assessment_id === assessment_id) && (!group_id || t.group_id === group_id)
      && (!status || t.status === status) && (!marking_status || t.marking_status === marking_status))
    .map((t) => {
      const s = students.get(t.student_id);
      const g = groups.get(t.group_id);
      return { ...t, student_name: s?.name || '', matric_no: s?.matric_no || '', group_name: g?.group_name || '', business_name: g?.business_name || '' };
    })
    .sort((a, b) => a.group_name.localeCompare(b.group_name) || a.student_name.localeCompare(b.student_name));
}

export function getAttemptOrThrow(id) {
  const t = getStore().get('Attempts', id);
  if (!t) throw notFound('Attempt not found');
  return t;
}
