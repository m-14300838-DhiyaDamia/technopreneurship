/**
 * Runs the generated Code.gs inside a simulated Apps Script environment and
 * drives the same workflows as the server API tests through doPost().
 *   node --test apps-script/test/apps.test.js   (after node apps-script/build.mjs)
 */
import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createFakeGas } from './fakeGas.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const code = fs.readFileSync(path.join(here, '..', 'Code.gs'), 'utf8');

function boot() {
  const gas = createFakeGas();
  const sandbox = vm.createContext({ ...gas, Date, Math, JSON, Promise, Map, Set, RegExp, Error, TypeError, RangeError, Object, Array, String, Number, Boolean, Symbol, parseInt, parseFloat, isNaN, isFinite, encodeURIComponent, decodeURIComponent, setTimeout, clearTimeout });
  vm.runInContext(code, sandbox, { filename: 'Code.gs' });
  const call = (method, path, body, token) => {
    const out = sandbox.doPost({ postData: { contents: JSON.stringify({ method, path, body, token }) } });
    return JSON.parse(out.getContent());
  };
  return { sandbox, gas, call };
}

describe('Apps Script edition (simulated)', () => {
  let env, call, LT, ST, AT, aid, groupA, groupB;
  const login = (u, p = 'Demo@2026') => { const r = call('POST', '/auth/login', { username: u, password: p }); assert.equal(r.status, 200, r.body.error); return r.body.token; };
  const byName = (list, n) => list.find((x) => (x.student_name || x.name || '').startsWith(n));

  before(() => {
    env = boot(); call = env.call;
    const msg = env.sandbox.seedDemoData();
    assert.match(msg, /DEMO data created/);
    LT = login('lecturer'); ST = login('DEMO-C001'); AT = login('admin');
    aid = call('GET', '/lecturer/assessments', {}, LT).body.assessments[0].assessment_id;
    const groups = call('GET', '/lecturer/groups', {}, LT).body.groups;
    groupA = groups.find((g) => g.group_name === 'Group A').group_id;
    groupB = groups.find((g) => g.group_name === 'Group B').group_id;
  });

  test('worksheets created with header rows and text format', () => {
    for (const t of ['Users', 'Students', 'Groups', 'Assessments', 'Questions', 'Attempts', 'Answers', 'ProctoringLogs', 'BusinessProposals', 'GroupReports', 'AuditLogs', 'Settings']) {
      const sh = env.gas._sheets.get(t);
      assert.ok(sh, `${t} sheet exists`);
      assert.equal(sh.rows[0][0].endsWith('_id') || sh.rows[0][0] === 'key', true);
    }
    assert.equal(env.gas._sheets.get('Students').rows.length, 10); // header + 9 DEMO students
    assert.ok(env.gas._props.get('JWT_SECRET'));
  });

  test('doGet health and meta', () => {
    const h = JSON.parse(env.sandbox.doGet({ parameter: {} }).getContent());
    assert.equal(h.body.edition, 'apps-script');
    const m = JSON.parse(env.sandbox.doGet({ parameter: { action: 'meta' } }).getContent());
    assert.equal(m.body.realtime, false);
    assert.equal(m.body.course.code, 'DAT');
  });

  test('authentication and roles', () => {
    assert.equal(call('POST', '/auth/login', { username: 'lecturer', password: 'wrong' }).status, 401);
    assert.equal(call('GET', '/student/dashboard').status, 401);
    assert.equal(call('GET', '/lecturer/students', {}, ST).status, 403);
    assert.equal(call('GET', '/admin/users', {}, LT).status, 403);
    assert.equal(call('GET', '/nope', {}, LT).status, 404);
    assert.equal(call('GET', '/auth/me', {}, 'garbage.token.x').status, 401);
  });

  test('student flow: start, save sanitised answer, events, submit, lock', () => {
    const dash = call('GET', '/student/dashboard', {}, ST).body;
    assert.equal(dash.student.component, 'Marketing');
    const start = call('POST', `/student/assessments/${aid}/start`, {}, ST);
    assert.equal(start.status, 200, start.body.error);
    assert.ok(start.body.assessment.attempt.remaining_seconds > 7000);
    assert.equal(start.body.questions.length, 3);
    const qid = start.body.questions[0].question_id;
    const save = call('POST', `/student/assessments/${aid}/answers`, { answers: [{ question_id: qid, answer: '<p onclick="x">Hi <script>alert(1)</script><strong>b</strong> <a href="javascript:alert(1)">l</a><img src=x onerror=1></p>' }] }, ST);
    assert.equal(save.status, 200, save.body.error);
    const ctx = call('GET', `/student/assessments/${aid}`, {}, ST).body;
    assert.equal(ctx.answers[0].answer, '<p>Hi <strong>b</strong> l</p>');
    assert.equal(call('POST', `/student/assessments/${aid}/answers`, { answers: [{ question_id: 'q_other', answer: 'x' }] }, ST).status, 403);
    assert.equal(call('POST', `/student/assessments/${aid}/events`, { event_type: 'TAB_SWITCH_DETECTED', description: 'hidden' }, ST).status, 201);
    assert.equal(call('POST', `/student/assessments/${aid}/events`, { event_type: 'CHATGPT_DETECTED' }, ST).status, 400);
    const hb = call('POST', `/student/assessments/${aid}/heartbeat`, { camera_status: 'active' }, ST);
    assert.equal(hb.body.attempt.camera_status, 'active');
    const sub = call('POST', `/student/assessments/${aid}/submit`, {}, ST);
    assert.equal(sub.body.assessment.attempt.status, 'submitted');
    const late = call('POST', `/student/assessments/${aid}/answers`, { answers: [{ question_id: qid, answer: 'late' }] }, ST);
    assert.equal(late.status, 409); assert.equal(late.body.code, 'LOCKED');
    // persisted in the sheet
    const answers = env.gas._sheets.get('Answers').rows;
    assert.ok(answers.some((r) => r.includes('<p>Hi <strong>b</strong> l</p>')));
  });

  test('timer expiry is enforced server-side', () => {
    const HT = login('DEMO-C002');
    const start = call('POST', `/student/assessments/${aid}/start`, {}, HT).body;
    const attemptId = start.assessment.attempt.attempt_id;
    const sh = env.gas._sheets.get('Attempts');
    const header = sh.rows[0]; const col = header.indexOf('deadline_at'); const idc = header.indexOf('attempt_id');
    const row = sh.rows.find((r) => r[idc] === attemptId); row[col] = new Date(Date.now() - 1000).toISOString();
    const save = call('POST', `/student/assessments/${aid}/answers`, { answers: [{ question_id: start.questions[0].question_id, answer: 'late' }] }, HT);
    assert.equal(save.status, 409); assert.equal(save.body.code, 'TIME_EXPIRED');
    assert.equal(call('GET', `/student/assessments/${aid}`, {}, HT).body.assessment.attempt.status, 'auto_submitted');
  });

  test('monitoring list and dashboard', () => {
    const m = call('GET', `/lecturer/assessments/${aid}/monitoring`, {}, LT).body;
    assert.equal(byName(m.students, 'Adam').flags, 1);
    assert.equal(byName(m.students, 'Adam').camera_status, 'active');
    const d = call('GET', `/lecturer/dashboard?assessment_id=${aid}`, {}, LT).body;
    assert.equal(d.stats.total_students, 9);
    assert.equal(d.stats.submitted, 7);
  });

  test('marking with protection and audit', () => {
    const att = byName(call('GET', `/lecturer/attempts?assessment_id=${aid}&status=submitted`, {}, LT).body.attempts, 'Abu').attempt_id;
    const q = call('GET', `/lecturer/attempts/${att}/review`, {}, LT).body.items.map((i) => i.question.question_id);
    const m = call('PUT', `/lecturer/attempts/${att}/marks`, { items: [{ question_id: q[0], marks: 8, lecturer_feedback: 'Good' }, { question_id: q[1], marks: 9 }, { question_id: q[2], marks: 7 }], lecturer_feedback: 'Well done' }, LT);
    assert.equal(m.status, 200, m.body.error); assert.equal(m.body.totals.total_marks, 24);
    assert.equal(call('PUT', `/lecturer/attempts/${att}/marks`, { items: [{ question_id: q[0], marks: 11 }] }, LT).status, 400);
    assert.equal(call('POST', `/lecturer/attempts/${att}/finalise`, {}, LT).body.attempt.marking_status, 'finalised');
    assert.equal(call('PUT', `/lecturer/attempts/${att}/marks`, { items: [{ question_id: q[0], marks: 5 }] }, LT).status, 409);
    assert.equal(call('POST', `/lecturer/attempts/${att}/reopen-marking`, { reason: 'fix' }, LT).body.attempt.marking_status, 'draft');
    call('POST', `/lecturer/attempts/${att}/finalise`, {}, LT);
    assert.ok(call('GET', '/lecturer/audit?limit=30', {}, LT).body.logs.some((l) => l.action === 'MARKING_REOPENED'));
    const Abu = login('DEMO-A001');
    assert.equal(call('GET', `/student/assessments/${aid}`, {}, Abu).body.results, null);
    call('PATCH', `/lecturer/assessments/${aid}`, { results_released: true }, LT);
    assert.equal(call('GET', `/student/assessments/${aid}`, {}, Abu).body.results.total_marks, 24);
  });

  test('proposal generation, traceability and status rules', () => {
    const p = call('POST', `/lecturer/assessments/${aid}/proposals/${groupA}/generate`, {}, LT);
    assert.equal(p.status, 200, p.body.error);
    assert.equal(p.body.proposal.status, 'ready_for_review');
    assert.equal(p.body.proposal.sections.length, 11);
    for (const s of p.body.proposal.sections.filter((x) => x.source === 'answers')) assert.ok(s.contributions.length > 0, s.title);
    const e = call('PUT', `/lecturer/assessments/${aid}/proposals/${groupA}/sections/marketing_strategy`, { html: '<p>Edited</p>' }, LT).body.proposal;
    assert.equal(e.sections.find((s) => s.key === 'marketing_strategy').html, '<p>Edited</p>');
    assert.equal(call('POST', `/lecturer/assessments/${aid}/proposals/${groupB}/generate`, {}, LT).body.proposal.status, 'contributions_incomplete');
    assert.equal(call('POST', `/lecturer/assessments/${aid}/proposals/${groupB}/status`, { status: 'finalised' }, LT).status, 409);
    assert.equal(call('POST', `/lecturer/assessments/${aid}/proposals/${groupA}/status`, { status: 'finalised' }, LT).body.proposal.status, 'finalised');
    const stored = env.gas._sheets.get('BusinessProposals').rows;
    assert.equal(stored.length, 3); // header + 2
  });

  test('reports, admin settings and meta privacy notice', () => {
    const gr = call('PUT', `/lecturer/reports/group/${aid}/${groupA}`, { lecturer_feedback: '<p>Great</p>', status: 'reviewed' }, LT).body;
    assert.equal(gr.marking.total_group_score, 24);
    const att = byName(call('GET', `/lecturer/attempts?assessment_id=${aid}`, {}, LT).body.attempts, 'Abu').attempt_id;
    assert.equal(call('GET', `/lecturer/reports/individual/${att}`, {}, LT).body.totals.total_marks, 24);
    assert.equal(call('PUT', '/admin/settings/privacy_notice', { value: 'Extra' }, AT).status, 200);
    assert.equal(call('GET', '/meta').body.privacy_notice, 'Extra');
    const u = call('POST', '/admin/users', { username: 'lect2', password: 'Password123', role: 'lecturer', name: 'Second' }, AT);
    assert.equal(u.status, 201);
    assert.equal(login('lect2', 'Password123').length > 20, true);
  });

  test('setup() on a fresh spreadsheet creates admin; second run is idempotent', () => {
    const fresh = boot();
    const msg = fresh.sandbox.setup();
    const pw = /password: (\S+)/.exec(msg)[1];
    assert.equal(fresh.call('POST', '/auth/login', { username: 'admin', password: pw }).status, 200);
    assert.match(fresh.sandbox.setup(), /already exist/);
    assert.match(fresh.sandbox.seedDemoData(), /already contains users/);
  });
});
