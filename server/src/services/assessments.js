import { getStore } from '../data/index.js';
import { badRequest, notFound } from '../lib/errors.js';
import { sanitizePlain, sanitizeRichText } from '../lib/sanitize.js';
import { nowIso } from '../lib/ids.js';
import { config } from '../config.js';
import { DEFAULT_COMPONENTS, DEFAULT_PROPOSAL_TEMPLATE } from './templates.js';

export const ASSESSMENT_STATUSES = ['draft', 'scheduled', 'open', 'closed'];

export function listAssessments() {
  return getStore().list('Assessments').map(decorate).sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
}

export function getAssessment(id) {
  const a = getStore().get('Assessments', id);
  if (!a) throw notFound('Assessment not found');
  return decorate(a);
}

export function decorate(a) {
  return {
    ...a,
    components: Array.isArray(a.components) && a.components.length ? a.components : DEFAULT_COMPONENTS,
    proposal_template: Array.isArray(a.proposal_template) && a.proposal_template.length ? a.proposal_template : DEFAULT_PROPOSAL_TEMPLATE,
    question_mode: a.question_mode || 'component',
    is_open_now: isOpenNow(a),
    server_time: nowIso(),
  };
}

/** Students may start/continue only while the assessment is open and inside the time window. */
export function isOpenNow(a, now = Date.now()) {
  if (a.status !== 'open') return false;
  if (a.start_at && Date.parse(a.start_at) > now) return false;
  if (a.end_at && Date.parse(a.end_at) <= now) return false;
  return true;
}

function validateTemplate(t) {
  if (!Array.isArray(t)) throw badRequest('Proposal template must be a list of sections');
  return t.map((s, i) => {
    const title = sanitizePlain(s.title);
    if (!title) throw badRequest(`Template section ${i + 1} needs a title`);
    return {
      key: sanitizePlain(s.key) || title.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''),
      title,
      source: s.source === 'group' ? 'group' : 'answers',
      source_topics: Array.isArray(s.source_topics) ? s.source_topics.map(sanitizePlain).filter(Boolean) : [],
      compose_fallback: s.compose_fallback === 'excerpts' ? 'excerpts' : undefined,
    };
  });
}

function clean(patch) {
  const upd = {};
  if (patch.title !== undefined) upd.title = sanitizePlain(patch.title);
  if (patch.course_code !== undefined) upd.course_code = sanitizePlain(patch.course_code);
  if (patch.course_name !== undefined) upd.course_name = sanitizePlain(patch.course_name);
  if (patch.semester !== undefined) upd.semester = sanitizePlain(patch.semester);
  if (patch.description !== undefined) upd.description = sanitizePlain(patch.description);
  if (patch.instructions !== undefined) upd.instructions = sanitizeRichText(patch.instructions);
  if (patch.duration_minutes !== undefined) {
    const n = Number(patch.duration_minutes);
    if (!Number.isInteger(n) || n < 1 || n > 24 * 60) throw badRequest('Duration must be between 1 and 1440 minutes');
    upd.duration_minutes = n;
  }
  for (const k of ['start_at', 'end_at']) {
    if (patch[k] !== undefined) {
      if (patch[k] === '' || patch[k] === null) upd[k] = '';
      else {
        const d = new Date(patch[k]);
        if (Number.isNaN(d.getTime())) throw badRequest(`${k} is not a valid date/time`);
        upd[k] = d.toISOString();
      }
    }
  }
  if (patch.status !== undefined) {
    if (!ASSESSMENT_STATUSES.includes(patch.status)) throw badRequest('Invalid status');
    upd.status = patch.status;
  }
  if (patch.camera_required !== undefined) upd.camera_required = Boolean(patch.camera_required);
  if (patch.proctoring_enabled !== undefined) upd.proctoring_enabled = Boolean(patch.proctoring_enabled);
  if (patch.results_released !== undefined) upd.results_released = Boolean(patch.results_released);
  if (patch.question_mode !== undefined) {
    if (!['component', 'all'].includes(patch.question_mode)) throw badRequest('question_mode must be "component" or "all"');
    upd.question_mode = patch.question_mode;
  }
  if (patch.components !== undefined) {
    if (!Array.isArray(patch.components)) throw badRequest('components must be a list');
    const comps = patch.components.map(sanitizePlain).filter(Boolean);
    if (!comps.length) throw badRequest('At least one component is required');
    if (new Set(comps.map((c) => c.toLowerCase())).size !== comps.length) throw badRequest('Component names must be unique');
    upd.components = comps;
  }
  if (patch.proposal_template !== undefined) upd.proposal_template = validateTemplate(patch.proposal_template);
  return upd;
}

export async function createAssessment(input, actor) {
  const upd = clean(input);
  if (!upd.title) throw badRequest('Title is required');
  const row = await getStore().insert('Assessments', {
    course_code: config.course.code, course_name: config.course.name, semester: config.course.semester,
    duration_minutes: 120, status: 'draft', camera_required: config.monitoring.cameraRequiredDefault, proctoring_enabled: true,
    question_mode: 'component', components: DEFAULT_COMPONENTS, proposal_template: DEFAULT_PROPOSAL_TEMPLATE, results_released: false,
    ...upd, created_by: actor?.user_id || '', created_at: nowIso(), updated_at: nowIso(),
  });
  return decorate(row);
}

export async function updateAssessment(id, patch) {
  const store = getStore();
  const a = store.get('Assessments', id);
  if (!a) throw notFound('Assessment not found');
  const upd = clean(patch);
  if (upd.start_at && upd.end_at && Date.parse(upd.end_at) <= Date.parse(upd.start_at)) throw badRequest('End time must be after start time');
  return decorate(await store.update('Assessments', id, { ...upd, updated_at: nowIso() }));
}

export async function deleteAssessment(id) {
  const store = getStore();
  if (!store.get('Assessments', id)) throw notFound('Assessment not found');
  if (store.count('Attempts', (t) => t.assessment_id === id)) throw badRequest('This assessment already has student attempts and cannot be deleted. Close it instead.');
  for (const q of store.find('Questions', (q) => q.assessment_id === id)) await store.remove('Questions', q.question_id);
  await store.remove('Assessments', id);
}
