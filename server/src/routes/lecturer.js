import { Router } from 'express';
import { z } from 'zod';
import { wrap, validate } from '../lib/http.js';
import { requireAuth, requireStaff } from '../auth/middleware.js';
import { auditFromReq } from '../services/audit.js';
import * as students from '../services/students.js';
import * as groups from '../services/groups.js';
import * as assessments from '../services/assessments.js';
import * as questions from '../services/questions.js';
import * as attempts from '../services/attempts.js';
import * as marking from '../services/marking.js';
import * as proctoring from '../services/proctoring.js';
import * as proposals from '../services/proposals.js';
import * as reports from '../services/reports.js';
import { getStore } from '../data/index.js';

const router = Router();
router.use(requireAuth, requireStaff);

const id = z.string().min(1).max(100);

// ---- Dashboard -------------------------------------------------------------
router.get('/dashboard', wrap(async (req, res) => {
  const assessment_id = req.query.assessment_id || assessments.listAssessments()[0]?.assessment_id || null;
  res.json({ stats: reports.dashboardStats(assessment_id), students: reports.studentStatusList(assessment_id), assessments: assessments.listAssessments(), groups: groups.listGroups() });
}));

// ---- Students --------------------------------------------------------------
router.get('/students', (req, res) => res.json({ students: students.listStudents({ group_id: req.query.group_id }) }));
router.post('/students', validate(z.object({
  matric_no: z.string().min(1).max(30), name: z.string().min(1).max(120), email: z.string().max(120).optional().default(''), section: z.string().max(40).optional().default(''),
  group_id: z.string().max(100).optional().default(''), component: z.string().max(60).optional().default(''), password: z.string().min(8).max(100).optional(),
})), wrap(async (req, res) => {
  const result = await students.createStudent(req.body);
  await auditFromReq(req, 'STUDENT_CREATED', 'Student', result.student.student_id, { matric_no: result.student.matric_no });
  res.status(201).json(result);
}));
router.patch('/students/:id', validate(z.object({
  matric_no: z.string().min(1).max(30).optional(), name: z.string().min(1).max(120).optional(), email: z.string().max(120).optional(), section: z.string().max(40).optional(),
  group_id: z.string().max(100).optional(), component: z.string().max(60).optional(), active: z.boolean().optional(),
})), wrap(async (req, res) => {
  const s = await students.updateStudent(req.params.id, req.body);
  await auditFromReq(req, 'STUDENT_UPDATED', 'Student', s.student_id, req.body);
  res.json({ student: s });
}));
router.post('/students/:id/reset-password', validate(z.object({ password: z.string().min(8).max(100).optional() })), wrap(async (req, res) => {
  const password = await students.resetStudentPassword(req.params.id, req.body.password);
  await auditFromReq(req, 'STUDENT_PASSWORD_RESET', 'Student', req.params.id);
  res.json({ password });
}));

// ---- Groups ----------------------------------------------------------------
router.get('/groups', (_req, res) => res.json({ groups: groups.listGroups() }));
router.get('/groups/:id', (req, res) => res.json({ group: groups.getGroup(req.params.id) }));
router.post('/groups', validate(z.object({ group_name: z.string().min(1).max(80), business_name: z.string().max(160).optional().default(''), business_idea: z.string().max(4000).optional().default('') })), wrap(async (req, res) => {
  const g = await groups.createGroup(req.body);
  await auditFromReq(req, 'GROUP_CREATED', 'Group', g.group_id, { group_name: g.group_name });
  res.status(201).json({ group: g });
}));
router.patch('/groups/:id', validate(z.object({ group_name: z.string().min(1).max(80).optional(), business_name: z.string().max(160).optional(), business_idea: z.string().max(4000).optional(), status: z.enum(['active', 'inactive']).optional() })), wrap(async (req, res) => {
  const g = await groups.updateGroup(req.params.id, req.body);
  await auditFromReq(req, 'GROUP_UPDATED', 'Group', g.group_id, req.body);
  res.json({ group: g });
}));
router.delete('/groups/:id', wrap(async (req, res) => {
  await groups.deleteGroup(req.params.id);
  await auditFromReq(req, 'GROUP_DELETED', 'Group', req.params.id);
  res.json({ ok: true });
}));
router.post('/groups/:id/members', validate(z.object({ student_id: id, component: z.string().max(60).optional() })), wrap(async (req, res) => {
  const g = await groups.addMember(req.params.id, req.body.student_id, req.body.component);
  await auditFromReq(req, 'GROUP_MEMBER_ADDED', 'Group', g.group_id, req.body);
  res.json({ group: g });
}));
router.delete('/groups/:id/members/:student_id', wrap(async (req, res) => {
  const g = await groups.removeMember(req.params.id, req.params.student_id);
  await auditFromReq(req, 'GROUP_MEMBER_REMOVED', 'Group', g.group_id, { student_id: req.params.student_id });
  res.json({ group: g });
}));
router.put('/groups/:id/members/:student_id/component', validate(z.object({ component: z.string().max(60) })), wrap(async (req, res) => {
  const g = await groups.assignComponent(req.params.id, req.params.student_id, req.body.component);
  await auditFromReq(req, 'COMPONENT_ASSIGNED', 'Student', req.params.student_id, req.body);
  res.json({ group: g });
}));

// ---- Assessments -----------------------------------------------------------
const assessmentSchema = z.object({
  title: z.string().min(1).max(160).optional(), course_code: z.string().max(20).optional(), course_name: z.string().max(120).optional(), semester: z.string().max(40).optional(),
  description: z.string().max(2000).optional(), instructions: z.string().max(20000).optional(), duration_minutes: z.number().int().optional(),
  start_at: z.string().max(40).nullable().optional(), end_at: z.string().max(40).nullable().optional(), status: z.enum(assessments.ASSESSMENT_STATUSES).optional(),
  camera_required: z.boolean().optional(), proctoring_enabled: z.boolean().optional(), results_released: z.boolean().optional(), question_mode: z.enum(['component', 'all']).optional(),
  components: z.array(z.string().max(60)).optional(), proposal_template: z.array(z.object({
    key: z.string().max(60).optional(), title: z.string().max(120), source: z.enum(['group', 'answers']).optional(), source_topics: z.array(z.string().max(120)).optional(), compose_fallback: z.string().max(20).optional(),
  })).optional(),
});
router.get('/assessments', (_req, res) => res.json({ assessments: assessments.listAssessments() }));
router.get('/assessments/:id', (req, res) => res.json({ assessment: assessments.getAssessment(req.params.id), questions: questions.listQuestions(req.params.id) }));
router.post('/assessments', validate(assessmentSchema), wrap(async (req, res) => {
  const a = await assessments.createAssessment(req.body, req.user);
  await auditFromReq(req, 'ASSESSMENT_CREATED', 'Assessment', a.assessment_id, { title: a.title });
  res.status(201).json({ assessment: a });
}));
router.patch('/assessments/:id', validate(assessmentSchema), wrap(async (req, res) => {
  const a = await assessments.updateAssessment(req.params.id, req.body);
  await auditFromReq(req, 'ASSESSMENT_UPDATED', 'Assessment', a.assessment_id, Object.keys(req.body));
  res.json({ assessment: a });
}));
router.delete('/assessments/:id', wrap(async (req, res) => {
  await assessments.deleteAssessment(req.params.id);
  await auditFromReq(req, 'ASSESSMENT_DELETED', 'Assessment', req.params.id);
  res.json({ ok: true });
}));

// ---- Questions -------------------------------------------------------------
const questionSchema = z.object({
  section: z.string().max(60).optional(), topic: z.string().max(120).optional(), question_text: z.string().max(20000).optional(), question_type: z.string().max(30).optional(),
  marks: z.number().optional(), time_limit: z.number().nullable().optional(), active: z.boolean().optional(), guidance: z.string().max(5000).optional(),
  options: z.array(z.object({ key: z.string().max(5).optional(), text: z.string().max(1000), correct: z.boolean().optional() })).nullable().optional(),
});
router.get('/assessments/:id/questions', (req, res) => res.json({ questions: questions.listQuestions(req.params.id) }));
router.post('/assessments/:id/questions', validate(questionSchema), wrap(async (req, res) => {
  const q = await questions.createQuestion(req.params.id, req.body);
  await auditFromReq(req, 'QUESTION_CREATED', 'Question', q.question_id, { section: q.section, topic: q.topic });
  res.status(201).json({ question: q });
}));
router.put('/assessments/:id/questions/order', validate(z.object({ order: z.array(id) })), wrap(async (req, res) => {
  const qs = await questions.reorderQuestions(req.params.id, req.body.order);
  await auditFromReq(req, 'QUESTIONS_REORDERED', 'Assessment', req.params.id);
  res.json({ questions: qs });
}));
router.patch('/questions/:id', validate(questionSchema), wrap(async (req, res) => {
  const q = await questions.updateQuestion(req.params.id, req.body);
  await auditFromReq(req, 'QUESTION_UPDATED', 'Question', q.question_id, Object.keys(req.body));
  res.json({ question: q });
}));
router.delete('/questions/:id', wrap(async (req, res) => {
  await questions.deleteQuestion(req.params.id);
  await auditFromReq(req, 'QUESTION_DELETED', 'Question', req.params.id);
  res.json({ ok: true });
}));

// ---- Monitoring ------------------------------------------------------------
router.get('/assessments/:id/monitoring', wrap(async (req, res) => {
  await attempts.sweepExpiredAttempts();
  res.json({ students: reports.studentStatusList(req.params.id), events: proctoring.listEvents({ assessment_id: req.params.id, limit: 200 }), server_time: new Date().toISOString() });
}));
router.get('/monitoring/events', (req, res) => res.json({ events: proctoring.listEvents({ ...req.query, limit: Math.min(Number(req.query.limit) || 500, 2000) }) }));
router.patch('/monitoring/events/:id', validate(z.object({ review_status: z.enum(['pending', 'reviewed', 'dismissed', 'escalated']), review_note: z.string().max(1000).optional().default('') })), wrap(async (req, res) => {
  res.json({ event: await proctoring.reviewEvent(req.params.id, req.body, req.user) });
}));

// ---- Attempts, review and marking -------------------------------------------
router.get('/attempts', wrap(async (req, res) => {
  await attempts.sweepExpiredAttempts();
  res.json({ attempts: marking.listAttempts(req.query) });
}));
router.get('/attempts/:id/review', (req, res) => res.json(marking.getReview(req.params.id)));
router.put('/attempts/:id/marks', validate(z.object({
  items: z.array(z.object({ question_id: id, marks: z.union([z.number(), z.string(), z.null()]).optional(), lecturer_feedback: z.string().max(10000).optional() })).default([]),
  lecturer_feedback: z.string().max(10000).optional(),
})), wrap(async (req, res) => res.json(await marking.saveMarks(req.params.id, req.body, req.user))));
router.post('/attempts/:id/finalise', wrap(async (req, res) => res.json(await marking.finaliseMarking(req.params.id, req.user))));
router.post('/attempts/:id/reopen-marking', validate(z.object({ reason: z.string().min(1).max(500) })), wrap(async (req, res) => res.json(await marking.reopenMarking(req.params.id, req.user, req.body.reason))));
router.post('/attempts/:id/reopen', validate(z.object({ extra_minutes: z.number().int(), reason: z.string().min(1).max(500) })), wrap(async (req, res) => {
  res.json({ attempt: await attempts.reopenAttempt(req.params.id, req.user, req.body) });
}));

// ---- Proposals --------------------------------------------------------------
router.get('/assessments/:id/proposals', (req, res) => res.json({ proposals: proposals.proposalOverview(req.params.id) }));
router.get('/assessments/:id/proposals/:group_id', (req, res) => res.json({ proposal: proposals.renderProposal(req.params.group_id, req.params.id) }));
router.post('/assessments/:id/proposals/:group_id/generate', validate(z.object({ reset: z.boolean().optional().default(false) })), wrap(async (req, res) => {
  res.json({ proposal: await proposals.generateProposal(req.params.group_id, req.params.id, req.user, req.body) });
}));
router.put('/assessments/:id/proposals/:group_id/sections/:key', validate(z.object({ html: z.string().max(60000).nullable() })), wrap(async (req, res) => {
  res.json({ proposal: await proposals.editSection(req.params.group_id, req.params.id, req.params.key, req.body.html, req.user) });
}));
router.post('/assessments/:id/proposals/:group_id/status', validate(z.object({ status: z.enum(['reviewed', 'finalised', 'exported', 'reopen', 'notes']), notes: z.string().max(10000).optional() })), wrap(async (req, res) => {
  res.json({ proposal: await proposals.setProposalStatus(req.params.group_id, req.params.id, req.body.status, req.user, req.body.notes) });
}));

// ---- Reports ----------------------------------------------------------------
router.get('/reports/individual/:attempt_id', wrap(async (req, res) => {
  const r = reports.individualReport(req.params.attempt_id);
  await auditFromReq(req, 'INDIVIDUAL_REPORT_VIEWED', 'Attempt', req.params.attempt_id);
  res.json(r);
}));
router.get('/reports/group/:assessment_id/:group_id', (req, res) => res.json(reports.groupReport(req.params.group_id, req.params.assessment_id)));
router.put('/reports/group/:assessment_id/:group_id', validate(z.object({ lecturer_feedback: z.string().max(10000).optional(), status: z.enum(['draft', 'reviewed', 'finalised']).optional() })), wrap(async (req, res) => {
  res.json(await reports.saveGroupReport(req.params.group_id, req.params.assessment_id, req.body, req.user));
}));

// ---- Audit (read-only for lecturers; admins manage via /admin) ----------------
router.get('/audit', (req, res) => {
  const logs = getStore().list('AuditLogs').sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, Math.min(Number(req.query.limit) || 200, 1000));
  res.json({ logs });
});

export default router;
