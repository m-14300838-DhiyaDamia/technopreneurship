import { getStore } from '../data/index.js';
import { notFound } from '../lib/errors.js';
import { sanitizeRichText } from '../lib/sanitize.js';
import { nowIso } from '../lib/ids.js';
import { config } from '../config.js';
import { getAssessment } from './assessments.js';
import { getGroup, listGroups } from './groups.js';
import { getReview, listAttempts } from './marking.js';
import { findAttempt } from './attempts.js';
import { contributionStatus, findProposal, proposalOverview } from './proposals.js';
import { listStudents } from './students.js';
import { listQuestions } from './questions.js';
import { audit } from './audit.js';

export function branding() {
  return { ...config.course, generated_at: nowIso() };
}

/** Individual Student Assessment Report (data; the client renders/prints it). */
export function individualReport(attempt_id) {
  const review = getReview(attempt_id);
  return { ...review, branding: branding(), report_type: 'individual' };
}

/** Group report: members, components, submission + marking + proposal status. */
export function groupReport(group_id, assessment_id) {
  const group = getGroup(group_id);
  const assessment = getAssessment(assessment_id);
  const contrib = contributionStatus(group, assessment);
  const proposal = findProposal(group_id, assessment_id);
  const stored = getStore().findOne('GroupReports', (r) => r.group_id === group_id && r.assessment_id === assessment_id);
  const marked = contrib.members.filter((m) => m.total_marks !== null && m.total_marks !== undefined && m.marking_status !== 'pending');
  const sum = marked.reduce((s, m) => s + Number(m.total_marks || 0), 0);
  const maxSum = marked.reduce((s, m) => s + Number(m.max_marks || 0), 0);
  const overview = proposalOverview(assessment_id).find((p) => p.group_id === group_id);
  return {
    report_type: 'group', branding: branding(), report_id: stored?.report_id || null,
    group: { group_id, group_name: group.group_name, business_name: group.business_name, business_idea: group.business_idea },
    assessment: { assessment_id, title: assessment.title, course_code: assessment.course_code, course_name: assessment.course_name, semester: assessment.semester },
    members: contrib.members, submission: { submitted: contrib.submitted, total: contrib.total, complete: contrib.complete },
    marking: { marked_count: marked.length, finalised_count: contrib.members.filter((m) => m.marking_status === 'finalised').length, total_group_score: sum, max_group_score: maxSum,
      average_percentage: maxSum ? Math.round((sum / maxSum) * 1000) / 10 : null },
    proposal: { status: overview?.status || 'draft', generated_at: proposal?.generated_at || null, reviewed_at: proposal?.reviewed_at || null, finalised_at: proposal?.finalised_at || null },
    lecturer_feedback: stored?.lecturer_feedback || '', status: stored?.status || 'draft', reviewed_by: stored?.reviewed_by || null, reviewed_at: stored?.reviewed_at || null, updated_at: stored?.updated_at || null,
  };
}

/** Persist the group report row (feedback + snapshot of totals/statuses). */
export async function saveGroupReport(group_id, assessment_id, { lecturer_feedback, status }, actor) {
  const store = getStore();
  const data = groupReport(group_id, assessment_id);
  const existing = store.findOne('GroupReports', (r) => r.group_id === group_id && r.assessment_id === assessment_id);
  const row = {
    group_id, assessment_id, business_name: data.group.business_name,
    members: data.members.map((m) => ({ student_id: m.student_id, name: m.name, matric_no: m.matric_no, component: m.component, total_marks: m.total_marks, max_marks: m.max_marks, marking_status: m.marking_status, attempt_status: m.attempt_status })),
    submission_status: data.submission.complete ? 'complete' : `${data.submission.submitted}/${data.submission.total} submitted`,
    proposal_status: data.proposal.status, total_group_score: data.marking.total_group_score,
    lecturer_feedback: lecturer_feedback === undefined ? (existing?.lecturer_feedback || '') : sanitizeRichText(lecturer_feedback),
    generated_document: `Group report — ${data.group.group_name} — ${data.assessment.title} — ${nowIso()}`,
    reviewed_by: actor.user_id, reviewed_at: nowIso(), status: ['draft', 'reviewed', 'finalised'].includes(status) ? status : existing?.status || 'draft',
    generated_at: existing?.generated_at || nowIso(), updated_at: nowIso(),
  };
  const saved = existing ? await store.update('GroupReports', existing.report_id, row) : await store.insert('GroupReports', row);
  await audit(actor, 'GROUP_REPORT_SAVED', 'GroupReport', saved.report_id, { group_id, assessment_id, status: saved.status });
  return groupReport(group_id, assessment_id);
}

/** Lecturer dashboard counters. */
export function dashboardStats(assessment_id) {
  const store = getStore();
  const students = listStudents({ active: true });
  const groups = listGroups();
  const attempts = assessment_id ? listAttempts({ assessment_id }) : [];
  const byStudent = new Map(attempts.map((t) => [t.student_id, t]));
  const submitted = attempts.filter((t) => ['submitted', 'auto_submitted'].includes(t.status));
  const inProgress = attempts.filter((t) => t.status === 'in_progress');
  const notStarted = students.filter((s) => !byStudent.has(s.student_id));
  const proposals = assessment_id ? proposalOverview(assessment_id) : [];
  const pendingFlags = assessment_id ? store.count('ProctoringLogs', (l) => l.assessment_id === assessment_id && l.severity !== 'info' && l.review_status === 'pending') : 0;
  const assessment = assessment_id ? getAssessment(assessment_id) : null;
  return {
    assessment: assessment ? { assessment_id, title: assessment.title, status: assessment.status, is_open_now: assessment.is_open_now, question_count: listQuestions(assessment_id, { activeOnly: true }).length } : null,
    total_students: students.length, total_groups: groups.length, not_started: notStarted.length, in_progress: inProgress.length, submitted: submitted.length,
    not_submitted: students.length - submitted.length, marking_completed: submitted.filter((t) => t.marking_status === 'finalised').length,
    marking_pending: submitted.filter((t) => t.marking_status !== 'finalised').length,
    proposal_incomplete: proposals.filter((p) => ['draft', 'contributions_incomplete'].includes(p.status)).length,
    proposal_ready: proposals.filter((p) => ['ready_for_review', 'reviewed', 'finalised', 'exported'].includes(p.status)).length,
    monitoring_alerts: pendingFlags, server_time: nowIso(),
  };
}

/** Flattened per-student status list used by the dashboard table and filters. */
export function studentStatusList(assessment_id) {
  const store = getStore();
  const students = listStudents({ active: true });
  const flagsByStudent = new Map();
  if (assessment_id) for (const l of store.find('ProctoringLogs', (l) => l.assessment_id === assessment_id && l.severity !== 'info')) {
    flagsByStudent.set(l.student_id, (flagsByStudent.get(l.student_id) || 0) + 1);
  }
  return students.map((s) => {
    const t = assessment_id ? findAttempt(assessment_id, s.student_id) : null;
    return {
      student_id: s.student_id, name: s.name, matric_no: s.matric_no, group_id: s.group_id, group_name: s.group_name, business_name: s.business_name, component: s.role,
      attempt_id: t?.attempt_id || null, attempt_status: t?.status || 'not_started', marking_status: t?.marking_status || 'pending', total_marks: t?.total_marks ?? null, max_marks: t?.max_marks ?? null,
      camera_status: t?.camera_status || 'unknown', last_activity_at: t?.last_activity_at || null, submitted_at: t?.submitted_at || null, deadline_at: t?.deadline_at || null,
      started_at: t?.started_at || null, flags: flagsByStudent.get(s.student_id) || 0,
    };
  });
}

export function requireGroup(group_id) {
  if (!getStore().get('Groups', group_id)) throw notFound('Group not found');
}
