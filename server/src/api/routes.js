/**
 * The complete API as a framework-neutral route table (see router.js).
 */
import * as S from './schemas.js';
import { created, STAFF } from './router.js';
import { config } from '../config.js';
import { nowIso } from '../lib/ids.js';
import { badRequest } from '../lib/errors.js';
import { sanitizePlain } from '../lib/sanitize.js';
import { getStore } from '../data/index.js';
import { signToken } from '../auth/jwt.js';
import * as users from '../services/users.js';
import * as students from '../services/students.js';
import * as groups from '../services/groups.js';
import * as assessments from '../services/assessments.js';
import * as questions from '../services/questions.js';
import * as attempts from '../services/attempts.js';
import * as marking from '../services/marking.js';
import * as proctoring from '../services/proctoring.js';
import * as proposals from '../services/proposals.js';
import * as reports from '../services/reports.js';
import { audit } from '../services/audit.js';
import { QUESTION_TYPES, QUESTION_TYPE_LABELS, PROCTORING_EVENT_TYPES, DEFAULT_COMPONENTS, DEFAULT_PROPOSAL_TEMPLATE, COMMON_SECTION } from '../services/templates.js';

export const SETTING_KEYS = {
  privacy_notice: 'Text shown to students before camera access is requested',
  monitoring_retention_days: 'Days to keep monitoring events (used by the purge action)',
  allow_video_recording: 'Reserved: video recording is NOT implemented; live metadata only',
  institution_name: 'Institution name override', department_name: 'Department name override', centre_name: 'Centre name override', programme_name: 'Programme name override',
  course_code: 'Course code override', course_name: 'Course name override', semester: 'Semester override',
};

const r = (method, path, auth, handler, extra = {}) => ({ method, path, auth, handler, ...extra });
const studentOf = (ctx) => students.getStudentByUser(ctx.user);

export const routes = [
  // ---- Public --------------------------------------------------------------
  r('GET', '/health', 'none', () => ({ ok: true, time: nowIso() })),
  r('GET', '/meta', 'none', () => ({
    course: config.course, server_time: nowIso(),
    question_types: QUESTION_TYPES.map((v) => ({ value: v, label: QUESTION_TYPE_LABELS[v] })),
    proctoring_event_types: PROCTORING_EVENT_TYPES, default_components: DEFAULT_COMPONENTS, default_proposal_template: DEFAULT_PROPOSAL_TEMPLATE, common_section: COMMON_SECTION,
    data_store: config.dataStore, edition: config.edition, realtime: config.realtime,
    ice_servers: config.monitoring.iceServers.map((s) => (config.monitoring.turnUsername && String(s.urls).startsWith('turn') ? { ...s, username: config.monitoring.turnUsername, credential: config.monitoring.turnCredential } : s)),
    monitoring_retention_days: Number(getStore().get('Settings', 'monitoring_retention_days')?.value) || config.monitoring.retentionDays,
    privacy_notice: getStore().get('Settings', 'privacy_notice')?.value || '',
  })),
  r('GET', '/meta/time', 'none', () => ({ server_time: nowIso(), epoch_ms: Date.now() })),

  // ---- Auth ----------------------------------------------------------------
  r('POST', '/auth/login', 'none', async (ctx) => {
    const user = await users.authenticate(ctx.body.username, ctx.body.password);
    await audit({ user_id: user.user_id, role: user.role, name: user.name }, 'LOGIN', 'User', user.user_id, null, ctx.ip);
    return { token: signToken(user), user: users.publicUser(user), expires_in: config.jwtExpiresIn };
  }, { schema: S.login, rateLimit: 'login' }),
  r('GET', '/auth/me', 'any', (ctx) => ({ user: users.publicUser(getStore().get('Users', ctx.user.user_id)) })),
  r('POST', '/auth/change-password', 'any', async (ctx) => {
    await users.changeOwnPassword(ctx.user.user_id, ctx.body.current_password, ctx.body.new_password);
    await ctx.audit('PASSWORD_CHANGED', 'User', ctx.user.user_id);
    return { ok: true };
  }, { schema: S.changePassword }),
  r('POST', '/auth/logout', 'any', async (ctx) => { await ctx.audit('LOGOUT', 'User', ctx.user.user_id); return { ok: true }; }),

  // ---- Student -------------------------------------------------------------
  r('GET', '/student/dashboard', ['student'], (ctx) => {
    const s = studentOf(ctx);
    return {
      student: { student_id: s.student_id, name: s.name, matric_no: s.matric_no, email: s.email, section: s.section, group_id: s.group_id, group_name: s.group_name, business_name: s.business_name, business_idea: s.business_idea, component: s.role },
      assessments: attempts.assessmentsForStudent(s), course: config.course, server_time: nowIso(),
    };
  }),
  r('GET', '/student/assessments/:id', ['student'], (ctx) => attempts.getAttemptContext(studentOf(ctx), ctx.params.id)),
  r('POST', '/student/assessments/:id/start', ['student'], async (ctx) => { const s = studentOf(ctx); await attempts.startAttempt(s, ctx.params.id); return attempts.getAttemptContext(s, ctx.params.id); }),
  r('POST', '/student/assessments/:id/answers', ['student'], (ctx) => attempts.saveAnswers(studentOf(ctx), ctx.params.id, ctx.body.answers), { schema: S.saveAnswers }),
  r('POST', '/student/assessments/:id/submit', ['student'], async (ctx) => { const s = studentOf(ctx); await attempts.submitAttempt(s, ctx.params.id); return attempts.getAttemptContext(s, ctx.params.id); }),
  r('POST', '/student/assessments/:id/heartbeat', ['student'], async (ctx) => {
    const attempt = await attempts.recordActivity(studentOf(ctx), ctx.params.id, ctx.body);
    return { server_time: nowIso(), attempt: attempt ? attempts.publicAttempt(attempt) : null };
  }, { schema: S.heartbeat }),
  r('POST', '/student/assessments/:id/events', ['student'], async (ctx) => {
    const log = await proctoring.recordEvent(studentOf(ctx), { assessment_id: ctx.params.id, ...ctx.body });
    return created({ log_id: log.log_id, timestamp: log.timestamp });
  }, { schema: S.studentEvent }),

  // ---- Lecturer: dashboard ---------------------------------------------------
  r('GET', '/lecturer/dashboard', STAFF, (ctx) => {
    const assessment_id = ctx.query.assessment_id || assessments.listAssessments()[0]?.assessment_id || null;
    return { stats: reports.dashboardStats(assessment_id), students: reports.studentStatusList(assessment_id), assessments: assessments.listAssessments(), groups: groups.listGroups() };
  }),

  // ---- Lecturer: students -----------------------------------------------------
  r('GET', '/lecturer/students', STAFF, (ctx) => ({ students: students.listStudents({ group_id: ctx.query.group_id }) })),
  r('POST', '/lecturer/students', STAFF, async (ctx) => {
    const result = await students.createStudent(ctx.body);
    await ctx.audit('STUDENT_CREATED', 'Student', result.student.student_id, { matric_no: result.student.matric_no });
    return created(result);
  }, { schema: S.createStudent }),
  r('PATCH', '/lecturer/students/:id', STAFF, async (ctx) => {
    const s = await students.updateStudent(ctx.params.id, ctx.body);
    await ctx.audit('STUDENT_UPDATED', 'Student', s.student_id, ctx.body);
    return { student: s };
  }, { schema: S.updateStudent }),
  r('POST', '/lecturer/students/:id/reset-password', STAFF, async (ctx) => {
    const password = await students.resetStudentPassword(ctx.params.id, ctx.body.password);
    await ctx.audit('STUDENT_PASSWORD_RESET', 'Student', ctx.params.id);
    return { password };
  }, { schema: S.resetStudentPassword }),

  // ---- Lecturer: groups -------------------------------------------------------
  r('GET', '/lecturer/groups', STAFF, () => ({ groups: groups.listGroups() })),
  r('GET', '/lecturer/groups/:id', STAFF, (ctx) => ({ group: groups.getGroup(ctx.params.id) })),
  r('POST', '/lecturer/groups', STAFF, async (ctx) => { const g = await groups.createGroup(ctx.body); await ctx.audit('GROUP_CREATED', 'Group', g.group_id, { group_name: g.group_name }); return created({ group: g }); }, { schema: S.createGroup }),
  r('PATCH', '/lecturer/groups/:id', STAFF, async (ctx) => { const g = await groups.updateGroup(ctx.params.id, ctx.body); await ctx.audit('GROUP_UPDATED', 'Group', g.group_id, ctx.body); return { group: g }; }, { schema: S.updateGroup }),
  r('DELETE', '/lecturer/groups/:id', STAFF, async (ctx) => { await groups.deleteGroup(ctx.params.id); await ctx.audit('GROUP_DELETED', 'Group', ctx.params.id); return { ok: true }; }),
  r('POST', '/lecturer/groups/:id/members', STAFF, async (ctx) => { const g = await groups.addMember(ctx.params.id, ctx.body.student_id, ctx.body.component); await ctx.audit('GROUP_MEMBER_ADDED', 'Group', g.group_id, ctx.body); return { group: g }; }, { schema: S.addMember }),
  r('DELETE', '/lecturer/groups/:id/members/:student_id', STAFF, async (ctx) => { const g = await groups.removeMember(ctx.params.id, ctx.params.student_id); await ctx.audit('GROUP_MEMBER_REMOVED', 'Group', g.group_id, { student_id: ctx.params.student_id }); return { group: g }; }),
  r('PUT', '/lecturer/groups/:id/members/:student_id/component', STAFF, async (ctx) => { const g = await groups.assignComponent(ctx.params.id, ctx.params.student_id, ctx.body.component); await ctx.audit('COMPONENT_ASSIGNED', 'Student', ctx.params.student_id, ctx.body); return { group: g }; }, { schema: S.assignComponent }),

  // ---- Lecturer: assessments & questions -----------------------------------------
  r('GET', '/lecturer/assessments', STAFF, () => ({ assessments: assessments.listAssessments() })),
  r('GET', '/lecturer/assessments/:id', STAFF, (ctx) => ({ assessment: assessments.getAssessment(ctx.params.id), questions: questions.listQuestions(ctx.params.id) })),
  r('POST', '/lecturer/assessments', STAFF, async (ctx) => { const a = await assessments.createAssessment(ctx.body, ctx.user); await ctx.audit('ASSESSMENT_CREATED', 'Assessment', a.assessment_id, { title: a.title }); return created({ assessment: a }); }, { schema: S.assessment }),
  r('PATCH', '/lecturer/assessments/:id', STAFF, async (ctx) => { const a = await assessments.updateAssessment(ctx.params.id, ctx.body); await ctx.audit('ASSESSMENT_UPDATED', 'Assessment', a.assessment_id, Object.keys(ctx.body)); return { assessment: a }; }, { schema: S.assessment }),
  r('DELETE', '/lecturer/assessments/:id', STAFF, async (ctx) => { await assessments.deleteAssessment(ctx.params.id); await ctx.audit('ASSESSMENT_DELETED', 'Assessment', ctx.params.id); return { ok: true }; }),
  r('GET', '/lecturer/assessments/:id/questions', STAFF, (ctx) => ({ questions: questions.listQuestions(ctx.params.id) })),
  r('POST', '/lecturer/assessments/:id/questions', STAFF, async (ctx) => { const q = await questions.createQuestion(ctx.params.id, ctx.body); await ctx.audit('QUESTION_CREATED', 'Question', q.question_id, { section: q.section, topic: q.topic }); return created({ question: q }); }, { schema: S.question }),
  r('PUT', '/lecturer/assessments/:id/questions/order', STAFF, async (ctx) => { const qs = await questions.reorderQuestions(ctx.params.id, ctx.body.order); await ctx.audit('QUESTIONS_REORDERED', 'Assessment', ctx.params.id); return { questions: qs }; }, { schema: S.questionOrder }),
  r('PATCH', '/lecturer/questions/:id', STAFF, async (ctx) => { const q = await questions.updateQuestion(ctx.params.id, ctx.body); await ctx.audit('QUESTION_UPDATED', 'Question', q.question_id, Object.keys(ctx.body)); return { question: q }; }, { schema: S.question }),
  r('DELETE', '/lecturer/questions/:id', STAFF, async (ctx) => { await questions.deleteQuestion(ctx.params.id); await ctx.audit('QUESTION_DELETED', 'Question', ctx.params.id); return { ok: true }; }),

  // ---- Lecturer: monitoring -------------------------------------------------------
  r('GET', '/lecturer/assessments/:id/monitoring', STAFF, async (ctx) => {
    await attempts.sweepExpiredAttempts();
    return { students: reports.studentStatusList(ctx.params.id), events: proctoring.listEvents({ assessment_id: ctx.params.id, limit: 200 }), server_time: nowIso() };
  }),
  r('GET', '/lecturer/monitoring/events', STAFF, (ctx) => ({ events: proctoring.listEvents({ ...ctx.query, limit: Math.min(Number(ctx.query.limit) || 500, 2000) }) })),
  r('PATCH', '/lecturer/monitoring/events/:id', STAFF, async (ctx) => ({ event: await proctoring.reviewEvent(ctx.params.id, ctx.body, ctx.user) }), { schema: S.reviewEvent }),

  // ---- Lecturer: attempts, review, marking ------------------------------------------
  r('GET', '/lecturer/attempts', STAFF, async (ctx) => { await attempts.sweepExpiredAttempts(); return { attempts: marking.listAttempts(ctx.query) }; }),
  r('GET', '/lecturer/attempts/:id/review', STAFF, (ctx) => marking.getReview(ctx.params.id)),
  r('PUT', '/lecturer/attempts/:id/marks', STAFF, (ctx) => marking.saveMarks(ctx.params.id, ctx.body, ctx.user), { schema: S.marks }),
  r('POST', '/lecturer/attempts/:id/finalise', STAFF, (ctx) => marking.finaliseMarking(ctx.params.id, ctx.user)),
  r('POST', '/lecturer/attempts/:id/reopen-marking', STAFF, (ctx) => marking.reopenMarking(ctx.params.id, ctx.user, ctx.body.reason), { schema: S.reason }),
  r('POST', '/lecturer/attempts/:id/reopen', STAFF, async (ctx) => ({ attempt: await attempts.reopenAttempt(ctx.params.id, ctx.user, ctx.body) }), { schema: S.reopenAttempt }),

  // ---- Lecturer: proposals -----------------------------------------------------------
  r('GET', '/lecturer/assessments/:id/proposals', STAFF, (ctx) => ({ proposals: proposals.proposalOverview(ctx.params.id) })),
  r('GET', '/lecturer/assessments/:id/proposals/:group_id', STAFF, (ctx) => ({ proposal: proposals.renderProposal(ctx.params.group_id, ctx.params.id) })),
  r('POST', '/lecturer/assessments/:id/proposals/:group_id/generate', STAFF, async (ctx) => ({ proposal: await proposals.generateProposal(ctx.params.group_id, ctx.params.id, ctx.user, ctx.body) }), { schema: S.generateProposal }),
  r('PUT', '/lecturer/assessments/:id/proposals/:group_id/sections/:key', STAFF, async (ctx) => ({ proposal: await proposals.editSection(ctx.params.group_id, ctx.params.id, ctx.params.key, ctx.body.html, ctx.user) }), { schema: S.editSection }),
  r('POST', '/lecturer/assessments/:id/proposals/:group_id/status', STAFF, async (ctx) => ({ proposal: await proposals.setProposalStatus(ctx.params.group_id, ctx.params.id, ctx.body.status, ctx.user, ctx.body.notes) }), { schema: S.proposalStatus }),

  // ---- Lecturer: reports --------------------------------------------------------------
  r('GET', '/lecturer/reports/individual/:attempt_id', STAFF, async (ctx) => { const rep = reports.individualReport(ctx.params.attempt_id); await ctx.audit('INDIVIDUAL_REPORT_VIEWED', 'Attempt', ctx.params.attempt_id); return rep; }),
  r('GET', '/lecturer/reports/group/:assessment_id/:group_id', STAFF, (ctx) => reports.groupReport(ctx.params.group_id, ctx.params.assessment_id)),
  r('PUT', '/lecturer/reports/group/:assessment_id/:group_id', STAFF, (ctx) => reports.saveGroupReport(ctx.params.group_id, ctx.params.assessment_id, ctx.body, ctx.user), { schema: S.groupReport }),
  r('GET', '/lecturer/audit', STAFF, (ctx) => ({ logs: getStore().list('AuditLogs').sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, Math.min(Number(ctx.query.limit) || 200, 1000)) })),

  // ---- Admin ------------------------------------------------------------------------------
  r('GET', '/admin/users', ['admin'], () => ({ users: users.listUsers() })),
  r('POST', '/admin/users', ['admin'], async (ctx) => {
    if (ctx.body.role === 'student') throw badRequest('Create student accounts from the lecturer Student Manager so a student profile is linked');
    const u = await users.createUser({ ...ctx.body, must_change_password: true });
    await ctx.audit('USER_CREATED', 'User', u.user_id, { role: u.role, username: u.username });
    return created({ user: u });
  }, { schema: S.createUser }),
  r('PATCH', '/admin/users/:id', ['admin'], async (ctx) => {
    if (ctx.params.id === ctx.user.user_id && (ctx.body.active === false || (ctx.body.role && ctx.body.role !== 'admin'))) throw badRequest('You cannot deactivate or demote your own account');
    const u = await users.updateUser(ctx.params.id, ctx.body);
    await ctx.audit('USER_UPDATED', 'User', u.user_id, ctx.body);
    return { user: u };
  }, { schema: S.updateUser }),
  r('POST', '/admin/users/:id/reset-password', ['admin'], async (ctx) => { const u = await users.resetPassword(ctx.params.id, ctx.body.password); await ctx.audit('USER_PASSWORD_RESET', 'User', u.user_id); return { user: u }; }, { schema: S.resetPassword }),
  r('GET', '/admin/settings', ['admin'], () => ({
    settings: getStore().list('Settings'), keys: SETTING_KEYS,
    env: { data_store: config.dataStore, edition: config.edition, sheet_id_configured: Boolean(config.sheets.sheetId), service_account: config.sheets.serviceAccountEmail ? config.sheets.serviceAccountEmail.replace(/^(.{3}).+(@.+)$/, '$1***$2') : '', retention_days_default: config.monitoring.retentionDays },
  })),
  r('PUT', '/admin/settings/:key', ['admin'], async (ctx) => {
    const key = ctx.params.key;
    if (!SETTING_KEYS[key]) throw badRequest('Unknown setting key');
    const store = getStore();
    const value = sanitizePlain(ctx.body.value);
    const existing = store.get('Settings', key);
    const row = existing ? await store.update('Settings', key, { value, updated_at: nowIso(), updated_by: ctx.user.user_id }) : await store.insert('Settings', { key, value, updated_at: nowIso(), updated_by: ctx.user.user_id });
    await ctx.audit('SETTING_UPDATED', 'Setting', key);
    return { setting: row };
  }, { schema: S.setting }),
  r('GET', '/admin/audit', ['admin'], (ctx) => {
    const limit = Math.min(Number(ctx.query.limit) || 500, 5000);
    const logs = getStore().list('AuditLogs').filter((l) => (!ctx.query.action || l.action === ctx.query.action) && (!ctx.query.actor_id || l.actor_id === ctx.query.actor_id)).sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, limit);
    return { logs };
  }),
  r('POST', '/admin/retention/purge-monitoring', ['admin'], async (ctx) => ({ removed: await proctoring.purgeOlderThan(ctx.body.days, ctx.user) }), { schema: S.purge }),
  r('GET', '/admin/health', ['admin'], () => ({ ok: true, data_store: config.dataStore, counts: Object.fromEntries(['Users', 'Students', 'Groups', 'Assessments', 'Questions', 'Attempts', 'Answers', 'ProctoringLogs', 'BusinessProposals', 'GroupReports', 'AuditLogs'].map((t) => [t, getStore().count(t)])) })),
];
