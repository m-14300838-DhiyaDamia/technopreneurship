/**
 * Group Business Proposal generation.
 *
 * The proposal is ASSEMBLED from the group members' individual answers. The
 * stored proposal row keeps only references (student, question, answer id) and
 * any lecturer edits per section. The original answers in the Answers worksheet
 * are never modified by proposal generation or lecturer editing, so every
 * section stays traceable to its source contribution.
 */
import { getStore } from '../data/index.js';
import { badRequest, conflict, notFound } from '../lib/errors.js';
import { sanitizeRichText, sanitizePlain, htmlToText } from '../lib/sanitize.js';
import { nowIso } from '../lib/ids.js';
import { getAssessment } from './assessments.js';
import { getGroup } from './groups.js';
import { questionsForStudent, listQuestions } from './questions.js';
import { findAttempt } from './attempts.js';
import { COMMON_SECTION, normaliseTopic } from './templates.js';
import { audit } from './audit.js';

export const PROPOSAL_STATUSES = ['draft', 'contributions_incomplete', 'ready_for_review', 'reviewed', 'finalised', 'exported'];

const escapeHtml = (s) => String(s || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function findProposal(group_id, assessment_id) {
  return getStore().findOne('BusinessProposals', (p) => p.group_id === group_id && p.assessment_id === assessment_id);
}

/** Member-by-member contribution status for a group (used by status screens and the group report). */
export function contributionStatus(group, assessment) {
  const store = getStore();
  const members = group.members.map((m) => {
    const attempt = findAttempt(assessment.assessment_id, m.student_id);
    const questions = questionsForStudent(assessment, m.role);
    const answers = store.find('Answers', (a) => a.assessment_id === assessment.assessment_id && a.student_id === m.student_id && a.answer);
    return {
      student_id: m.student_id, name: m.name, matric_no: m.matric_no, component: m.role || '(not assigned)',
      attempt_status: attempt?.status || 'not_started', submitted: Boolean(attempt && ['submitted', 'auto_submitted'].includes(attempt.status)),
      answered_count: answers.filter((a) => questions.some((q) => q.question_id === a.question_id)).length, question_count: questions.length,
      marking_status: attempt?.marking_status || 'pending', total_marks: attempt?.total_marks ?? null, max_marks: attempt?.max_marks ?? null,
    };
  });
  const submitted = members.filter((m) => m.submitted).length;
  return { members, submitted, total: members.length, complete: members.length > 0 && submitted === members.length };
}

/** Collect the contributions for every template section (live from Answers). */
function assembleSections(group, assessment) {
  const store = getStore();
  const questions = listQuestions(assessment.assessment_id, { activeOnly: true });
  const numbering = new Map(questions.map((q, i) => [q.question_id, i + 1]));
  const answers = store.find('Answers', (a) => a.assessment_id === assessment.assessment_id && a.group_id === group.group_id);
  const members = new Map(group.members.map((m) => [m.student_id, m]));

  const contributionsFor = (q) => answers
    .filter((a) => a.question_id === q.question_id && members.has(a.student_id))
    .filter((a) => {
      const m = members.get(a.student_id);
      if (assessment.question_mode === 'all' || q.section === COMMON_SECTION) return true;
      return String(m.role || '').toLowerCase() === String(q.section).toLowerCase();
    })
    .map((a) => {
      const m = members.get(a.student_id);
      return {
        answer_id: a.answer_id, student_id: a.student_id, student_name: m.name, matric_no: m.matric_no, component: m.role || '',
        group_id: group.group_id, group_name: group.group_name, question_id: q.question_id, question_number: numbering.get(q.question_id),
        question_topic: q.topic, question_section: q.section, question_text: q.question_text, answer_html: a.answer || '', answer_status: a.status, timestamp: a.timestamp,
      };
    })
    .sort((x, y) => x.student_name.localeCompare(y.student_name));

  return assessment.proposal_template.map((section) => {
    let contributions = [];
    let generated_html = '';
    let note = '';
    if (section.source === 'group') {
      generated_html = `<h3>${escapeHtml(group.business_name || 'Business name not set')}</h3>`
        + (group.business_idea ? `<p>${escapeHtml(group.business_idea)}</p>` : '<p><em>Business idea not recorded.</em></p>')
        + `<p><strong>Group:</strong> ${escapeHtml(group.group_name)}<br/><strong>Members:</strong> ${group.members.map((m) => `${escapeHtml(m.name)} (${escapeHtml(m.role || 'component not assigned')})`).join(', ')}</p>`;
      note = 'Generated from the group record (business name, business idea, members).';
    } else {
      const topics = new Set((section.source_topics || []).map(normaliseTopic));
      const matching = questions.filter((q) => topics.has(normaliseTopic(q.topic)));
      for (const q of matching) contributions.push(...contributionsFor(q));
      contributions = contributions.filter((c) => c.answer_html && htmlToText(c.answer_html));
      if (!contributions.length && section.compose_fallback === 'excerpts') {
        // Opening paragraph of each member's first contribution, clearly labelled.
        const firsts = [];
        for (const m of group.members) {
          const own = answers.filter((a) => a.student_id === m.student_id && a.answer && htmlToText(a.answer))
            .sort((a, b) => (numbering.get(a.question_id) || 0) - (numbering.get(b.question_id) || 0));
          if (own[0]) {
            const q = questions.find((qq) => qq.question_id === own[0].question_id);
            const text = htmlToText(own[0].answer).split(/\n+/)[0].slice(0, 600);
            firsts.push({ m, q, text, a: own[0] });
          }
        }
        contributions = firsts.map(({ m, q, text, a }) => ({
          answer_id: a.answer_id, student_id: m.student_id, student_name: m.name, matric_no: m.matric_no, component: m.role || '', group_id: group.group_id,
          group_name: group.group_name, question_id: q.question_id, question_number: numbering.get(q.question_id), question_topic: q.topic, question_section: q.section,
          question_text: q.question_text, answer_html: `<p>${escapeHtml(text)}</p>`, answer_status: a.status, timestamp: a.timestamp, excerpt: true,
        }));
        note = contributions.length ? 'Auto-composed from the opening paragraph of each member\'s first contribution (no question carries this topic). The lecturer may edit this section.' : 'No contributions yet.';
      } else if (!matching.length) note = `No question is mapped to this section (expected topic: ${section.source_topics.join(' / ') || 'none'}). Configure a question topic or edit the section manually.`;
      else if (!contributions.length) note = 'No contributions yet for this section.';
      generated_html = contributions.map((c) => c.answer_html).join('\n');
    }
    return { key: section.key, title: section.title, source: section.source, source_topics: section.source_topics || [], contributions, generated_html, note };
  });
}

function computedStatus(status, complete) {
  if (['reviewed', 'finalised', 'exported'].includes(status)) return status;
  return complete ? 'ready_for_review' : 'contributions_incomplete';
}

/** Full, hydrated proposal for preview/print. Lecturer edits overlay generated content. */
export function renderProposal(group_id, assessment_id) {
  const group = getGroup(group_id);
  const assessment = getAssessment(assessment_id);
  const row = findProposal(group_id, assessment_id);
  const edits = new Map(((row?.sections_json) || []).map((s) => [s.key, s]));
  const sections = assembleSections(group, assessment).map((s) => {
    const e = edits.get(s.key);
    return { ...s, edited_html: e?.edited_html || null, edited_by: e?.edited_by || null, edited_at: e?.edited_at || null, html: e?.edited_html || s.generated_html };
  });
  const contrib = contributionStatus(group, assessment);
  return {
    proposal_id: row?.proposal_id || null, group_id, assessment_id, group: { group_id, group_name: group.group_name, business_name: group.business_name, business_idea: group.business_idea },
    members: group.members.map((m) => ({ student_id: m.student_id, name: m.name, matric_no: m.matric_no, component: m.role })),
    assessment: { assessment_id, title: assessment.title, course_code: assessment.course_code, course_name: assessment.course_name, semester: assessment.semester },
    status: row ? computedStatus(row.status, contrib.complete) : 'draft', generated: Boolean(row), generated_at: row?.generated_at || null, updated_at: row?.updated_at || null,
    reviewed_by: row?.reviewed_by || null, reviewed_at: row?.reviewed_at || null, finalised_by: row?.finalised_by || null, finalised_at: row?.finalised_at || null,
    lecturer_notes: row?.lecturer_notes || '', contributions: contrib, sections,
  };
}

/** Generate (or regenerate) the stored proposal row. Lecturer edits are kept unless reset=true. */
export async function generateProposal(group_id, assessment_id, actor, { reset = false } = {}) {
  const store = getStore();
  const existing = findProposal(group_id, assessment_id);
  if (existing && ['finalised', 'exported'].includes(existing.status)) throw conflict('This proposal is finalised. Reopen it before regenerating.');
  const group = getGroup(group_id);
  const assessment = getAssessment(assessment_id);
  const sections = assembleSections(group, assessment);
  const contrib = contributionStatus(group, assessment);
  const prevEdits = new Map(((existing?.sections_json) || []).map((s) => [s.key, s]));
  const sections_json = sections.map((s) => ({
    key: s.key, title: s.title,
    contribution_refs: s.contributions.map((c) => ({ answer_id: c.answer_id, student_id: c.student_id, question_id: c.question_id, excerpt: Boolean(c.excerpt) })),
    edited_html: reset ? null : prevEdits.get(s.key)?.edited_html || null,
    edited_by: reset ? null : prevEdits.get(s.key)?.edited_by || null,
    edited_at: reset ? null : prevEdits.get(s.key)?.edited_at || null,
  }));
  const textOf = (key) => htmlToText(sections.find((s) => s.key === key)?.generated_html || '').slice(0, 40000);
  const status = computedStatus(existing?.status || 'draft', contrib.complete);
  const fields = {
    group_id, assessment_id, business_name: group.business_name, executive_summary: textOf('executive_summary'), marketing: textOf('marketing_strategy'),
    product_plan: textOf('product_plan'), operations: textOf('operations'), financial_plan: textOf('financial_plan'),
    other_sections: sections.filter((s) => !['executive_summary', 'marketing_strategy', 'product_plan', 'operations', 'financial_plan'].includes(s.key)).map((s) => ({ key: s.key, title: s.title, text: htmlToText(s.generated_html).slice(0, 4000) })),
    generated_document: `${assessment.title} — ${group.group_name} — ${group.business_name} — generated ${nowIso()} — ${sections.length} sections (full document is rendered from stored answers)`,
    status: status === 'reviewed' && !contrib.complete ? 'contributions_incomplete' : status, sections_json, generated_at: nowIso(), updated_at: nowIso(),
  };
  let row;
  if (existing) row = await store.update('BusinessProposals', existing.proposal_id, fields);
  else row = await store.insert('BusinessProposals', { ...fields, reviewed_by: '', reviewed_at: '', finalised_by: '', finalised_at: '', lecturer_notes: '' });
  await audit(actor, existing ? 'PROPOSAL_REGENERATED' : 'PROPOSAL_GENERATED', 'BusinessProposal', row.proposal_id, { group_id, assessment_id, complete: contrib.complete });
  return renderProposal(group_id, assessment_id);
}

/** Lecturer edits a section's presentation. Original answers are untouched. */
export async function editSection(group_id, assessment_id, key, html, actor) {
  const store = getStore();
  const row = findProposal(group_id, assessment_id);
  if (!row) throw notFound('Generate the proposal first');
  if (['finalised', 'exported'].includes(row.status)) throw conflict('This proposal is finalised and cannot be edited');
  const sections = Array.isArray(row.sections_json) ? row.sections_json : [];
  const idx = sections.findIndex((s) => s.key === key);
  if (idx < 0) throw badRequest('Unknown section');
  const clean = html === null || html === '' ? null : sanitizeRichText(html).slice(0, 45000);
  sections[idx] = { ...sections[idx], edited_html: clean, edited_by: clean ? actor.user_id : null, edited_at: clean ? nowIso() : null };
  await store.update('BusinessProposals', row.proposal_id, { sections_json: sections, updated_at: nowIso() });
  await audit(actor, clean ? 'PROPOSAL_SECTION_EDITED' : 'PROPOSAL_SECTION_RESET', 'BusinessProposal', row.proposal_id, { key });
  return renderProposal(group_id, assessment_id);
}

export async function setProposalStatus(group_id, assessment_id, status, actor, notes) {
  const store = getStore();
  const row = findProposal(group_id, assessment_id);
  if (!row) throw notFound('Generate the proposal first');
  const group = getGroup(group_id);
  const contrib = contributionStatus(group, getAssessment(assessment_id));
  const patch = { updated_at: nowIso() };
  if (notes !== undefined) patch.lecturer_notes = sanitizeRichText(notes);
  switch (status) {
    case 'reviewed':
      if (['finalised', 'exported'].includes(row.status)) throw conflict('Proposal is already finalised');
      patch.status = 'reviewed'; patch.reviewed_by = actor.user_id; patch.reviewed_at = nowIso(); break;
    case 'finalised':
      if (!contrib.complete) throw conflict('All members must submit before the proposal can be finalised');
      patch.status = 'finalised'; patch.finalised_by = actor.user_id; patch.finalised_at = nowIso();
      if (!row.reviewed_at) { patch.reviewed_by = actor.user_id; patch.reviewed_at = nowIso(); }
      break;
    case 'exported':
      if (!['finalised', 'exported'].includes(row.status)) throw conflict('Finalise the proposal before marking it as printed/exported');
      patch.status = 'exported'; break;
    case 'reopen':
      patch.status = computedStatus('draft', contrib.complete); patch.finalised_by = ''; patch.finalised_at = ''; break;
    case 'notes':
      break; // notes only
    default:
      throw badRequest('Unsupported status change');
  }
  await store.update('BusinessProposals', row.proposal_id, patch);
  await audit(actor, `PROPOSAL_${status.toUpperCase()}`, 'BusinessProposal', row.proposal_id, { group_id, assessment_id });
  return renderProposal(group_id, assessment_id);
}

/** Overview of every group's proposal state for an assessment. */
export function proposalOverview(assessment_id) {
  const assessment = getAssessment(assessment_id);
  const store = getStore();
  return store.list('Groups').map((g) => {
    const group = getGroup(g.group_id);
    const contrib = contributionStatus(group, assessment);
    const row = findProposal(g.group_id, assessment_id);
    return {
      group_id: g.group_id, group_name: g.group_name, business_name: g.business_name, proposal_id: row?.proposal_id || null,
      status: row ? computedStatus(row.status, contrib.complete) : 'draft', generated_at: row?.generated_at || null,
      submitted: contrib.submitted, total: contrib.total, members: contrib.members,
    };
  }).sort((a, b) => a.group_name.localeCompare(b.group_name));
}
