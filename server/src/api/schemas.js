/**
 * Request validation schemas (zod), shared by the Express server and the
 * Google Apps Script edition so both accept exactly the same input.
 */
import { z } from 'zod';
import { ROLES } from '../auth/middleware.js';
import { ASSESSMENT_STATUSES } from '../services/assessments.js';
import { PROCTORING_EVENT_TYPES } from '../services/templates.js';

export const id = z.string().min(1).max(100);

export const login = z.object({ username: z.string().min(1).max(100), password: z.string().min(1).max(200) });
export const changePassword = z.object({ current_password: z.string().min(1), new_password: z.string().min(8).max(200) });

export const saveAnswers = z.object({
  answers: z.array(z.object({ question_id: z.string().min(1), answer: z.string().max(60000).nullable().optional() })).min(1).max(100),
});
export const heartbeat = z.object({ camera_status: z.string().max(40).optional() });
export const studentEvent = z.object({
  event_type: z.enum(PROCTORING_EVENT_TYPES), description: z.string().max(500).optional().default(''), client_time: z.string().max(40).optional(),
});

export const createStudent = z.object({
  matric_no: z.string().min(1).max(30), name: z.string().min(1).max(120), email: z.string().max(120).optional().default(''), section: z.string().max(40).optional().default(''),
  group_id: z.string().max(100).optional().default(''), component: z.string().max(60).optional().default(''), password: z.string().min(8).max(100).optional(),
});
export const updateStudent = z.object({
  matric_no: z.string().min(1).max(30).optional(), name: z.string().min(1).max(120).optional(), email: z.string().max(120).optional(), section: z.string().max(40).optional(),
  group_id: z.string().max(100).optional(), component: z.string().max(60).optional(), active: z.boolean().optional(),
});
export const resetStudentPassword = z.object({ password: z.string().min(8).max(100).optional() });

export const createGroup = z.object({ group_name: z.string().min(1).max(80), business_name: z.string().max(160).optional().default(''), business_idea: z.string().max(4000).optional().default('') });
export const updateGroup = z.object({ group_name: z.string().min(1).max(80).optional(), business_name: z.string().max(160).optional(), business_idea: z.string().max(4000).optional(), status: z.enum(['active', 'inactive']).optional() });
export const addMember = z.object({ student_id: id, component: z.string().max(60).optional() });
export const assignComponent = z.object({ component: z.string().max(60) });

export const assessment = z.object({
  title: z.string().min(1).max(160).optional(), course_code: z.string().max(20).optional(), course_name: z.string().max(120).optional(), semester: z.string().max(40).optional(),
  description: z.string().max(2000).optional(), instructions: z.string().max(20000).optional(), duration_minutes: z.number().int().optional(),
  start_at: z.string().max(40).nullable().optional(), end_at: z.string().max(40).nullable().optional(), status: z.enum(ASSESSMENT_STATUSES).optional(),
  camera_required: z.boolean().optional(), proctoring_enabled: z.boolean().optional(), results_released: z.boolean().optional(), question_mode: z.enum(['component', 'all']).optional(),
  components: z.array(z.string().max(60)).optional(),
  proposal_template: z.array(z.object({
    key: z.string().max(60).optional(), title: z.string().max(120), source: z.enum(['group', 'answers']).optional(), source_topics: z.array(z.string().max(120)).optional(), compose_fallback: z.string().max(20).optional(),
  })).optional(),
});

export const question = z.object({
  section: z.string().max(60).optional(), topic: z.string().max(120).optional(), question_text: z.string().max(20000).optional(), question_type: z.string().max(30).optional(),
  marks: z.number().optional(), time_limit: z.number().nullable().optional(), active: z.boolean().optional(), guidance: z.string().max(5000).optional(),
  options: z.array(z.object({ key: z.string().max(5).optional(), text: z.string().max(1000), correct: z.boolean().optional() })).nullable().optional(),
});
export const questionOrder = z.object({ order: z.array(id) });

export const reviewEvent = z.object({ review_status: z.enum(['pending', 'reviewed', 'dismissed', 'escalated']), review_note: z.string().max(1000).optional().default('') });

export const marks = z.object({
  items: z.array(z.object({ question_id: id, marks: z.union([z.number(), z.string(), z.null()]).optional(), lecturer_feedback: z.string().max(10000).optional() })).default([]),
  lecturer_feedback: z.string().max(10000).optional(),
});
export const reason = z.object({ reason: z.string().min(1).max(500) });
export const reopenAttempt = z.object({ extra_minutes: z.number().int(), reason: z.string().min(1).max(500) });

export const generateProposal = z.object({ reset: z.boolean().optional().default(false) });
export const editSection = z.object({ html: z.string().max(60000).nullable() });
export const proposalStatus = z.object({ status: z.enum(['reviewed', 'finalised', 'exported', 'reopen', 'notes']), notes: z.string().max(10000).optional() });
export const groupReport = z.object({ lecturer_feedback: z.string().max(10000).optional(), status: z.enum(['draft', 'reviewed', 'finalised']).optional() });

export const createUser = z.object({ username: z.string().min(3).max(60), password: z.string().min(8).max(100), role: z.enum(ROLES), name: z.string().min(1).max(120), email: z.string().max(120).optional().default('') });
export const updateUser = z.object({ name: z.string().min(1).max(120).optional(), email: z.string().max(120).optional(), role: z.enum(ROLES).optional(), active: z.boolean().optional(), username: z.string().min(3).max(60).optional() });
export const resetPassword = z.object({ password: z.string().min(8).max(100) });
export const setting = z.object({ value: z.string().max(5000) });
export const purge = z.object({ days: z.number().int().min(1).max(3650) });
