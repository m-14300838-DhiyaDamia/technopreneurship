import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { setup } from './helpers.js';

describe('Technopreneurship assessment API', () => {
  let ctx, L, S, A, aid, groupA, groupB;
  const byName = (list, n) => list.find((x) => (x.student_name || x.name || '').startsWith(n));

  before(async () => {
    ctx = await setup();
    L = ctx.as(await ctx.login('lecturer'));
    S = ctx.as(await ctx.login('DEMO-C001')); // Adam, Group C, Marketing
    A = ctx.as(await ctx.login('admin'));
    aid = ctx.seed.assessment.assessment_id;
    groupA = ctx.seed.groups[0].group.group_id;
    groupB = ctx.seed.groups[1].group.group_id;
  });

  test('authentication: wrong password, missing token, role checks', async () => {
    assert.equal((await ctx.agent.post('/api/auth/login').send({ username: 'lecturer', password: 'nope' })).status, 401);
    assert.equal((await ctx.agent.get('/api/student/dashboard')).status, 401);
    assert.equal((await S.get('/lecturer/students')).status, 403);
    assert.equal((await L.get('/admin/users')).status, 403);
    assert.equal((await A.get('/admin/users')).status, 200);
    assert.equal((await L.get('/student/dashboard')).status, 403);
  });

  test('student dashboard shows group, business and assigned component', async () => {
    const r = await S.get('/student/dashboard');
    assert.equal(r.status, 200);
    assert.equal(r.body.student.component, 'Marketing');
    assert.equal(r.body.student.group_name, 'Group C');
    assert.equal(r.body.assessments[0].attempt, null);
  });

  test('student attempt: start, component-only questions, save (sanitised), lock after submit', async () => {
    const start = await S.post(`/assessments/${aid}/start`.replace('/assessments', '/student/assessments'));
    assert.equal(start.status, 200);
    assert.ok(start.body.assessment.attempt.remaining_seconds > 7000);
    assert.deepEqual(new Set(start.body.questions.map((q) => q.section)), new Set(['Marketing']));
    const qid = start.body.questions[0].question_id;
    const other = ctx.seed.questions.find((q) => q.section === 'Financial Planning').question_id;
    const save = await S.post(`/student/assessments/${aid}/answers`, { answers: [{ question_id: qid, answer: '<p>Hi <script>alert(1)</script><b>x</b> <img src=x onerror=1></p>' }] });
    assert.equal(save.status, 200);
    const c = await S.get(`/student/assessments/${aid}`);
    assert.equal(c.body.answers[0].answer, '<p>Hi <b>x</b> </p>');
    assert.equal((await S.post(`/student/assessments/${aid}/answers`, { answers: [{ question_id: other, answer: 'x' }] })).status, 403);
    assert.equal((await S.post(`/student/assessments/${aid}/events`, { event_type: 'TAB_SWITCH_DETECTED' })).status, 201);
    assert.equal((await S.post(`/student/assessments/${aid}/events`, { event_type: 'CHATGPT_DETECTED' })).status, 400);
    const sub = await S.post(`/student/assessments/${aid}/submit`);
    assert.equal(sub.body.assessment.attempt.status, 'submitted');
    const late = await S.post(`/student/assessments/${aid}/answers`, { answers: [{ question_id: qid, answer: 'late' }] });
    assert.equal(late.status, 409);
    assert.equal(late.body.code, 'LOCKED');
    assert.equal(c.body.results, null, 'results hidden before release');
  });

  test('timer: expired attempts are auto-submitted on the server', async () => {
    const H = ctx.as(await ctx.login('DEMO-C002')); // Hakim
    const start = await H.post(`/student/assessments/${aid}/start`);
    const attemptId = start.body.assessment.attempt.attempt_id;
    await ctx.store.update('Attempts', attemptId, { deadline_at: new Date(Date.now() - 1000).toISOString() });
    const save = await H.post(`/student/assessments/${aid}/answers`, { answers: [{ question_id: start.body.questions[0].question_id, answer: 'too late' }] });
    assert.equal(save.status, 409);
    assert.equal(save.body.code, 'TIME_EXPIRED');
    const c = await H.get(`/student/assessments/${aid}`);
    assert.equal(c.body.assessment.attempt.status, 'auto_submitted');
    assert.equal(c.body.assessment.attempt.remaining_seconds, 0);
  });

  test('lecturer dashboard counters and monitoring list', async () => {
    const d = await L.get(`/lecturer/dashboard?assessment_id=${aid}`);
    assert.equal(d.body.stats.total_students, 9);
    assert.equal(d.body.stats.total_groups, 3);
    assert.equal(d.body.stats.submitted, 7); // 5 seeded + Adam + Hakim(auto)
    const m = await L.get(`/lecturer/assessments/${aid}/monitoring`);
    assert.equal(byName(m.body.students, 'Adam').flags, 1);
    assert.ok(m.body.events.some((e) => e.event_type === 'TAB_SWITCH_DETECTED'));
  });

  test('marking: per-question marks, totals, max validation, finalise protection, reopen with audit', async () => {
    const list = await L.get(`/lecturer/attempts?assessment_id=${aid}&status=submitted`);
    const att = byName(list.body.attempts, 'Abu').attempt_id;
    const rv = await L.get(`/lecturer/attempts/${att}/review`);
    const q = rv.body.items.map((i) => i.question.question_id);
    assert.equal(rv.body.totals.max_marks, 30);
    const m = await L.put(`/lecturer/attempts/${att}/marks`, { items: [{ question_id: q[0], marks: 8, lecturer_feedback: 'Good' }, { question_id: q[1], marks: 9 }, { question_id: q[2], marks: 7 }], lecturer_feedback: 'Well done' });
    assert.equal(m.status, 200);
    assert.equal(m.body.totals.total_marks, 24);
    assert.equal(m.body.attempt.marking_status, 'draft');
    assert.equal((await L.put(`/lecturer/attempts/${att}/marks`, { items: [{ question_id: q[0], marks: 11 }] })).status, 400);
    assert.equal((await L.post(`/lecturer/attempts/${att}/finalise`)).body.attempt.marking_status, 'finalised');
    assert.equal((await L.put(`/lecturer/attempts/${att}/marks`, { items: [{ question_id: q[0], marks: 5 }] })).status, 409);
    assert.equal((await L.post(`/lecturer/attempts/${att}/reopen`, { extra_minutes: 5, reason: 'x' })).status, 409, 'cannot reopen attempt while marks finalised');
    assert.equal((await L.post(`/lecturer/attempts/${att}/reopen-marking`, { reason: 'correction' })).body.attempt.marking_status, 'draft');
    await L.post(`/lecturer/attempts/${att}/finalise`);
    const audit = await L.get('/lecturer/audit?limit=20');
    assert.ok(audit.body.logs.some((l) => l.action === 'MARKING_REOPENED'));
    // marks stay linked to the correct student
    const stored = ctx.store.find('Answers', (a) => a.question_id === q[0] && a.marks === 8);
    assert.equal(stored.length, 1);
    assert.equal(stored[0].student_id, ctx.seed.groups[0].members[0].student_id);
  });

  test('results visible to the student only when released AND finalised', async () => {
    const Abu = ctx.as(await ctx.login('DEMO-A001'));
    assert.equal((await Abu.get(`/student/assessments/${aid}`)).body.results, null);
    await L.patch(`/lecturer/assessments/${aid}`, { results_released: true });
    const r = await Abu.get(`/student/assessments/${aid}`);
    assert.equal(r.body.results.total_marks, 24);
    const Ali = ctx.as(await ctx.login('DEMO-A002')); // not marked yet
    assert.equal((await Ali.get(`/student/assessments/${aid}`)).body.results, null);
  });

  test('proposal: generation, traceability, status rules, edits preserve originals', async () => {
    const p = (await L.post(`/lecturer/assessments/${aid}/proposals/${groupA}/generate`)).body.proposal;
    assert.equal(p.status, 'ready_for_review');
    assert.equal(p.sections.length, 11);
    for (const s of p.sections.filter((x) => x.source === 'answers')) {
      assert.ok(s.contributions.length > 0, `${s.title} has contributions`);
      for (const c of s.contributions) { assert.equal(c.group_id, groupA); assert.ok(c.student_name && c.question_number); }
    }
    const mk = p.sections.find((s) => s.key === 'marketing_strategy');
    assert.equal(mk.contributions[0].student_name, 'Abu (DEMO)');
    const before = ctx.store.get('Answers', mk.contributions[0].answer_id).answer;
    const e = (await L.put(`/lecturer/assessments/${aid}/proposals/${groupA}/sections/marketing_strategy`, { html: '<p>Edited</p>' })).body.proposal;
    assert.equal(e.sections.find((s) => s.key === 'marketing_strategy').html, '<p>Edited</p>');
    assert.equal(ctx.store.get('Answers', mk.contributions[0].answer_id).answer, before, 'original answer untouched');
    const pb = (await L.post(`/lecturer/assessments/${aid}/proposals/${groupB}/generate`)).body.proposal;
    assert.equal(pb.status, 'contributions_incomplete');
    assert.equal((await L.post(`/lecturer/assessments/${aid}/proposals/${groupB}/status`, { status: 'finalised' })).status, 409);
    assert.equal((await L.post(`/lecturer/assessments/${aid}/proposals/${groupA}/status`, { status: 'finalised' })).body.proposal.status, 'finalised');
    assert.equal((await L.put(`/lecturer/assessments/${aid}/proposals/${groupA}/sections/marketing_strategy`, { html: '<p>x</p>' })).status, 409);
    assert.equal((await L.post(`/lecturer/assessments/${aid}/proposals/${groupA}/generate`)).status, 409);
    // no cross-group leakage
    const ov = (await L.get(`/lecturer/assessments/${aid}/proposals`)).body.proposals;
    assert.equal(ov.find((g) => g.group_id === groupA).submitted, 3);
    assert.equal(pb.sections.every((s) => s.contributions.every((c) => c.group_id === groupB)), true);
  });

  test('reports: individual and group', async () => {
    const list = await L.get(`/lecturer/attempts?assessment_id=${aid}`);
    const att = byName(list.body.attempts, 'Abu').attempt_id;
    const ir = await L.get(`/lecturer/reports/individual/${att}`);
    assert.equal(ir.body.report_type, 'individual');
    assert.equal(ir.body.totals.total_marks, 24);
    const gr = await L.put(`/lecturer/reports/group/${aid}/${groupA}`, { lecturer_feedback: '<p>Great team</p>', status: 'reviewed' });
    assert.equal(gr.body.marking.total_group_score, 24);
    assert.equal(gr.body.status, 'reviewed');
    assert.equal(gr.body.submission.complete, true);
  });

  test('group management: conflicts and limits', async () => {
    const sid = ctx.seed.groups[2].members[0].student_id; // Adam in Group C
    const r = await L.post(`/lecturer/groups/${groupA}/members`, { student_id: sid });
    assert.equal(r.status, 409);
    const g = (await L.post('/lecturer/groups', { group_name: 'Group D', business_name: 'Test' })).body.group;
    assert.equal((await L.post('/lecturer/groups', { group_name: 'group d' })).status, 409);
    assert.equal((await L.delete(`/lecturer/groups/${g.group_id}`)).status, 200);
    assert.equal((await L.delete(`/lecturer/groups/${groupA}`)).status, 409, 'cannot delete group with members');
  });

  test('questions: create, validate, reorder, cannot delete answered', async () => {
    const q = await L.post(`/lecturer/assessments/${aid}/questions`, { section: 'Common', topic: 'Executive Summary', question_text: '<p>Summarise</p>', question_type: 'multiple_choice', marks: 5, options: [{ key: 'A', text: 'Yes', correct: true }] });
    assert.equal(q.status, 400, 'MCQ needs two options');
    const ok = await L.post(`/lecturer/assessments/${aid}/questions`, { section: 'Common', topic: 'Executive Summary', question_text: '<p>Summarise</p>', question_type: 'short_answer', marks: 5 });
    assert.equal(ok.status, 201);
    assert.equal((await L.post(`/lecturer/assessments/${aid}/questions`, { section: 'Nope', question_text: 'x' })).status, 400);
    const answered = ctx.seed.questions[0].question_id;
    assert.equal((await L.delete(`/lecturer/questions/${answered}`)).status, 400);
    const ids = (await L.get(`/lecturer/assessments/${aid}/questions`)).body.questions.map((x) => x.question_id).reverse();
    const re = await L.put(`/lecturer/assessments/${aid}/questions/order`, { order: ids });
    assert.equal(re.body.questions[0].question_id, ids[0]);
    assert.equal((await L.delete(`/lecturer/questions/${ok.body.question.question_id}`)).status, 200);
  });

  test('admin: users, settings, retention purge', async () => {
    const u = await A.post('/admin/users', { username: 'lect2', password: 'Password123', role: 'lecturer', name: 'Second Lecturer' });
    assert.equal(u.status, 201);
    assert.equal((await A.post('/admin/users', { username: 'lect2', password: 'Password123', role: 'lecturer', name: 'dup' })).status, 409);
    const me = (await A.get('/auth/me')).body.user.user_id;
    assert.equal((await A.patch(`/admin/users/${me}`, { active: false })).status, 400);
    assert.equal((await A.put('/admin/settings/privacy_notice', { value: 'Extra notice' })).status, 200);
    assert.equal((await ctx.agent.get('/api/meta')).body.privacy_notice, 'Extra notice');
    const purge = await A.post('/admin/retention/purge-monitoring', { days: 3650 });
    assert.equal(purge.body.removed, 0);
  });
});
