import { Router } from 'express';
import { z } from 'zod';
import { wrap, validate } from '../lib/http.js';
import { requireAuth, requireRole } from '../auth/middleware.js';
import { getStudentByUser } from '../services/students.js';
import * as attempts from '../services/attempts.js';
import { recordEvent } from '../services/proctoring.js';
import { PROCTORING_EVENT_TYPES } from '../services/templates.js';
import { config } from '../config.js';

const router = Router();
router.use(requireAuth, requireRole('student'));

/** Student dashboard: own profile + assessments visible to them. */
router.get('/dashboard', wrap(async (req, res) => {
  const student = getStudentByUser(req.user);
  res.json({
    student: {
      student_id: student.student_id, name: student.name, matric_no: student.matric_no, email: student.email, section: student.section,
      group_id: student.group_id, group_name: student.group_name, business_name: student.business_name, business_idea: student.business_idea, component: student.role,
    },
    assessments: attempts.assessmentsForStudent(student),
    course: config.course,
    server_time: new Date().toISOString(),
  });
}));

router.get('/assessments/:id', wrap(async (req, res) => {
  const student = getStudentByUser(req.user);
  res.json(await attempts.getAttemptContext(student, req.params.id));
}));

router.post('/assessments/:id/start', wrap(async (req, res) => {
  const student = getStudentByUser(req.user);
  await attempts.startAttempt(student, req.params.id);
  res.json(await attempts.getAttemptContext(student, req.params.id));
}));

router.post('/assessments/:id/answers', validate(z.object({
  answers: z.array(z.object({ question_id: z.string().min(1), answer: z.string().max(60000).nullable().optional() })).min(1).max(100),
})), wrap(async (req, res) => {
  const student = getStudentByUser(req.user);
  res.json(await attempts.saveAnswers(student, req.params.id, req.body.answers));
}));

router.post('/assessments/:id/submit', wrap(async (req, res) => {
  const student = getStudentByUser(req.user);
  await attempts.submitAttempt(student, req.params.id);
  res.json(await attempts.getAttemptContext(student, req.params.id));
}));

router.post('/assessments/:id/heartbeat', validate(z.object({ camera_status: z.string().max(40).optional() })), wrap(async (req, res) => {
  const student = getStudentByUser(req.user);
  const attempt = await attempts.recordActivity(student, req.params.id, req.body);
  res.json({ server_time: new Date().toISOString(), attempt: attempt ? attempts.publicAttempt(attempt) : null });
}));

router.post('/assessments/:id/events', validate(z.object({
  event_type: z.enum(PROCTORING_EVENT_TYPES), description: z.string().max(500).optional().default(''), client_time: z.string().max(40).optional(),
})), wrap(async (req, res) => {
  const student = getStudentByUser(req.user);
  const log = await recordEvent(student, { assessment_id: req.params.id, ...req.body });
  res.status(201).json({ log_id: log.log_id, timestamp: log.timestamp });
}));

export default router;
