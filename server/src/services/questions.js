import { getStore } from '../data/index.js';
import { badRequest, notFound } from '../lib/errors.js';
import { sanitizePlain, sanitizeRichText } from '../lib/sanitize.js';
import { nowIso } from '../lib/ids.js';
import { COMMON_SECTION, QUESTION_TYPES } from './templates.js';
import { getAssessment } from './assessments.js';

export function listQuestions(assessment_id, { activeOnly = false } = {}) {
  return getStore()
    .find('Questions', (q) => q.assessment_id === assessment_id && (!activeOnly || q.active))
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0) || (a.created_at || '').localeCompare(b.created_at || ''));
}

export function getQuestion(id) {
  const q = getStore().get('Questions', id);
  if (!q) throw notFound('Question not found');
  return q;
}

/**
 * Questions visible to one student: "Common" questions plus those of the
 * student's assigned component (or every question when question_mode = "all").
 */
export function questionsForStudent(assessment, component) {
  const all = listQuestions(assessment.assessment_id, { activeOnly: true });
  if (assessment.question_mode === 'all') return all;
  const comp = String(component || '').toLowerCase();
  return all.filter((q) => q.section === COMMON_SECTION || q.section.toLowerCase() === comp);
}

function clean(patch, assessment) {
  const upd = {};
  if (patch.section !== undefined) {
    const section = sanitizePlain(patch.section);
    const allowed = [COMMON_SECTION, ...assessment.components];
    if (!allowed.some((s) => s.toLowerCase() === section.toLowerCase())) throw badRequest(`Section must be one of: ${allowed.join(', ')}`);
    upd.section = allowed.find((s) => s.toLowerCase() === section.toLowerCase());
  }
  if (patch.topic !== undefined) upd.topic = sanitizePlain(patch.topic);
  if (patch.question_text !== undefined) {
    upd.question_text = sanitizeRichText(patch.question_text);
    if (!upd.question_text) throw badRequest('Question text is required');
  }
  if (patch.question_type !== undefined) {
    if (!QUESTION_TYPES.includes(patch.question_type)) throw badRequest('Invalid question type');
    upd.question_type = patch.question_type;
  }
  if (patch.marks !== undefined) {
    const n = Number(patch.marks);
    if (!Number.isFinite(n) || n < 0 || n > 1000) throw badRequest('Marks must be a number between 0 and 1000');
    upd.marks = n;
  }
  if (patch.time_limit !== undefined) {
    const n = patch.time_limit === '' || patch.time_limit === null ? null : Number(patch.time_limit);
    if (n !== null && (!Number.isFinite(n) || n < 0)) throw badRequest('Time limit must be a positive number of minutes');
    upd.time_limit = n;
  }
  if (patch.active !== undefined) upd.active = Boolean(patch.active);
  if (patch.guidance !== undefined) upd.guidance = sanitizeRichText(patch.guidance);
  if (patch.options !== undefined) {
    if (patch.options === null) upd.options = null;
    else {
      if (!Array.isArray(patch.options)) throw badRequest('Options must be a list');
      upd.options = patch.options.map((o, i) => ({
        key: sanitizePlain(o.key) || String.fromCharCode(65 + i),
        text: sanitizePlain(o.text),
        correct: Boolean(o.correct),
      })).filter((o) => o.text);
    }
  }
  return upd;
}

export async function createQuestion(assessment_id, input) {
  const assessment = getAssessment(assessment_id);
  const upd = clean({ section: COMMON_SECTION, question_type: 'long_answer', marks: 10, active: true, ...input }, assessment);
  if (!upd.question_text) throw badRequest('Question text is required');
  if (upd.question_type === 'multiple_choice' && (!upd.options || upd.options.length < 2)) throw badRequest('Multiple choice questions need at least two options');
  const existing = listQuestions(assessment_id);
  const order_index = existing.length ? Math.max(...existing.map((q) => q.order_index ?? 0)) + 1 : 1;
  return getStore().insert('Questions', { assessment_id, order_index, ...upd, created_at: nowIso(), updated_at: nowIso() });
}

export async function updateQuestion(id, patch) {
  const q = getQuestion(id);
  const assessment = getAssessment(q.assessment_id);
  const upd = clean(patch, assessment);
  const type = upd.question_type || q.question_type;
  const options = upd.options !== undefined ? upd.options : q.options;
  if (type === 'multiple_choice' && (!options || options.length < 2)) throw badRequest('Multiple choice questions need at least two options');
  return getStore().update('Questions', id, { ...upd, updated_at: nowIso() });
}

export async function reorderQuestions(assessment_id, orderedIds) {
  const store = getStore();
  const qs = listQuestions(assessment_id);
  const ids = new Set(qs.map((q) => q.question_id));
  if (!Array.isArray(orderedIds) || orderedIds.some((id) => !ids.has(id))) throw badRequest('Invalid question order');
  let i = 1;
  for (const id of orderedIds) await store.update('Questions', id, { order_index: i++ });
  for (const q of qs) if (!orderedIds.includes(q.question_id)) await store.update('Questions', q.question_id, { order_index: i++ });
  return listQuestions(assessment_id);
}

export async function deleteQuestion(id) {
  const store = getStore();
  const q = getQuestion(id);
  if (store.count('Answers', (a) => a.question_id === id)) throw badRequest('Students have answered this question. Deactivate it instead of deleting.');
  await store.remove('Questions', q.question_id);
}
