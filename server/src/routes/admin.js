import { Router } from 'express';
import { z } from 'zod';
import { wrap, validate } from '../lib/http.js';
import { requireAuth, requireRole, ROLES } from '../auth/middleware.js';
import { auditFromReq } from '../services/audit.js';
import * as users from '../services/users.js';
import { purgeOlderThan } from '../services/proctoring.js';
import { getStore } from '../data/index.js';
import { config } from '../config.js';
import { nowIso } from '../lib/ids.js';
import { sanitizePlain } from '../lib/sanitize.js';
import { badRequest } from '../lib/errors.js';

const router = Router();
router.use(requireAuth, requireRole('admin'));

router.get('/users', (_req, res) => res.json({ users: users.listUsers() }));
router.post('/users', validate(z.object({ username: z.string().min(3).max(60), password: z.string().min(8).max(100), role: z.enum(ROLES), name: z.string().min(1).max(120), email: z.string().max(120).optional().default('') })), wrap(async (req, res) => {
  if (req.body.role === 'student') throw badRequest('Create student accounts from the lecturer Student Manager so a student profile is linked');
  const u = await users.createUser({ ...req.body, must_change_password: true });
  await auditFromReq(req, 'USER_CREATED', 'User', u.user_id, { role: u.role, username: u.username });
  res.status(201).json({ user: u });
}));
router.patch('/users/:id', validate(z.object({ name: z.string().min(1).max(120).optional(), email: z.string().max(120).optional(), role: z.enum(ROLES).optional(), active: z.boolean().optional(), username: z.string().min(3).max(60).optional() })), wrap(async (req, res) => {
  if (req.params.id === req.user.user_id && (req.body.active === false || (req.body.role && req.body.role !== 'admin'))) throw badRequest('You cannot deactivate or demote your own account');
  const u = await users.updateUser(req.params.id, req.body);
  await auditFromReq(req, 'USER_UPDATED', 'User', u.user_id, req.body);
  res.json({ user: u });
}));
router.post('/users/:id/reset-password', validate(z.object({ password: z.string().min(8).max(100) })), wrap(async (req, res) => {
  const u = await users.resetPassword(req.params.id, req.body.password);
  await auditFromReq(req, 'USER_PASSWORD_RESET', 'User', u.user_id);
  res.json({ user: u });
}));

// ---- Settings (key/value) ------------------------------------------------------
export const SETTING_KEYS = {
  privacy_notice: 'Text shown to students before camera access is requested',
  monitoring_retention_days: 'Days to keep monitoring events (used by the purge action)',
  allow_video_recording: 'Reserved: video recording is NOT implemented; live metadata only',
  institution_name: 'Institution name override', department_name: 'Department name override', centre_name: 'Centre name override', programme_name: 'Programme name override',
  course_code: 'Course code override', course_name: 'Course name override', semester: 'Semester override',
};
router.get('/settings', (_req, res) => {
  const rows = getStore().list('Settings');
  res.json({ settings: rows, keys: SETTING_KEYS, env: { data_store: config.dataStore, sheet_id_configured: Boolean(config.sheets.sheetId), service_account: config.sheets.serviceAccountEmail ? config.sheets.serviceAccountEmail.replace(/^(.{3}).+(@.+)$/, '$1***$2') : '', retention_days_default: config.monitoring.retentionDays } });
});
router.put('/settings/:key', validate(z.object({ value: z.string().max(5000) })), wrap(async (req, res) => {
  const key = req.params.key;
  if (!SETTING_KEYS[key]) throw badRequest('Unknown setting key');
  const store = getStore();
  const value = sanitizePlain(req.body.value);
  const existing = store.get('Settings', key);
  const row = existing ? await store.update('Settings', key, { value, updated_at: nowIso(), updated_by: req.user.user_id }) : await store.insert('Settings', { key, value, updated_at: nowIso(), updated_by: req.user.user_id });
  await auditFromReq(req, 'SETTING_UPDATED', 'Setting', key);
  res.json({ setting: row });
}));

// ---- Audit logs and retention ------------------------------------------------
router.get('/audit', (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 500, 5000);
  const logs = getStore().list('AuditLogs').filter((l) => (!req.query.action || l.action === req.query.action) && (!req.query.actor_id || l.actor_id === req.query.actor_id))
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, limit);
  res.json({ logs });
});
router.post('/retention/purge-monitoring', validate(z.object({ days: z.number().int().min(1).max(3650) })), wrap(async (req, res) => {
  const removed = await purgeOlderThan(req.body.days, req.user);
  res.json({ removed });
}));

router.get('/health', (_req, res) => {
  const store = getStore();
  res.json({ ok: true, data_store: config.dataStore, counts: Object.fromEntries(['Users', 'Students', 'Groups', 'Assessments', 'Questions', 'Attempts', 'Answers', 'ProctoringLogs', 'BusinessProposals', 'GroupReports', 'AuditLogs'].map((t) => [t, store.count(t)])) });
});

export default router;
