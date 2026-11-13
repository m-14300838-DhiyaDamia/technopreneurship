import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { get, post, put } from '../../api/client.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import { Alert, Badge, Confirm, ErrorBox, Modal, SafeHtml, Spinner, useAsync, useToast } from '../../components/ui.jsx';
import { RichTextEditor } from '../../components/RichTextEditor.jsx';
import { DocFooter, DocHeader, PrintBar } from '../../components/DocHeader.jsx';
import { fmtDate, fmtDateTime, labelize } from '../../utils/format.js';

export default function ProposalPage() {
  const { assessmentId, groupId } = useParams();
  const { meta } = useAuth();
  const toast = useToast();
  const { data, loading, error, reload, setData } = useAsync(() => get(`/lecturer/assessments/${assessmentId}/proposals/${groupId}`), [assessmentId, groupId]);
  const [editing, setEditing] = useState(null);
  const [showSources, setShowSources] = useState(true);
  const [confirm, setConfirm] = useState(null);
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const p = data?.proposal;
  useEffect(() => { if (p) setNotes(p.lecturer_notes || ''); }, [p?.proposal_id]); // eslint-disable-line react-hooks/exhaustive-deps

  const act = async (fn, msg) => { setBusy(true); try { const r = await fn(); setData(r); if (msg) toast(msg, 'ok'); } catch (e) { toast(e.message, 'bad'); } finally { setBusy(false); setConfirm(null); } };
  if (loading && !data) return <Spinner />;
  if (error) return <ErrorBox error={error} retry={reload} />;
  const locked = ['finalised', 'exported'].includes(p.status);
  const generate = (reset = false) => act(() => post(`/lecturer/assessments/${assessmentId}/proposals/${groupId}/generate`, { reset }), reset ? 'Regenerated (edits discarded)' : p.generated ? 'Proposal regenerated' : 'Proposal generated');
  const setStatus = (status) => act(() => post(`/lecturer/assessments/${assessmentId}/proposals/${groupId}/status`, { status, notes }), status === 'reopen' ? 'Proposal reopened' : `Proposal ${labelize(status)}`);
  const print = async () => { window.print(); if (p.status === 'finalised') setStatus('exported'); };

  return (
    <>
      <div className="page-head no-print">
        <div><h1>Business proposal · {p.group.group_name}</h1><p>{p.group.business_name} · {p.contributions.submitted}/{p.contributions.total} members submitted · <Badge status={p.status} /></p></div>
        <div className="row"><Link className="btn" to="/lecturer/proposals">← All proposals</Link><Link className="btn" to={`/lecturer/reports/group/${assessmentId}/${groupId}`}>Group report</Link></div>
      </div>
      <section className="card mb no-print">
        <div className="row between">
          <div className="row">
            {!p.generated && <button className="btn primary" onClick={() => generate(false)} disabled={busy}>Generate proposal</button>}
            {p.generated && !locked && <button className="btn" onClick={() => generate(false)} disabled={busy}>Regenerate (keep my edits)</button>}
            {p.generated && !locked && p.sections.some((s) => s.edited_html) && <button className="btn ghost" onClick={() => setConfirm('reset')} disabled={busy}>Regenerate & discard edits</button>}
            {p.generated && !['reviewed', 'finalised', 'exported'].includes(p.status) && <button className="btn" onClick={() => setStatus('reviewed')} disabled={busy}>Mark as reviewed</button>}
            {p.generated && !locked && <button className="btn success" onClick={() => setConfirm('finalise')} disabled={busy || !p.contributions.complete}>Finalise</button>}
            {locked && <button className="btn ghost" onClick={() => setConfirm('reopen')} disabled={busy}>Reopen proposal</button>}
          </div>
          <label className="check small"><input type="checkbox" checked={showSources} onChange={(e) => setShowSources(e.target.checked)} /> Show source tags</label>
        </div>
        {!p.contributions.complete && <Alert tone="warn" className="mt">Contributions incomplete: {p.contributions.members.filter((m) => !m.submitted).map((m) => `${m.name} (${m.component})`).join(', ')} have not submitted. The proposal can be previewed but not finalised.</Alert>}
        <div className="row mt-sm small">{p.contributions.members.map((m) => <span key={m.student_id} className={`badge ${m.submitted ? 'ok' : 'bad'}`} style={{ textTransform: 'none' }}>{m.submitted ? '✓' : '✗'} {m.component} — {m.name}</span>)}</div>
        {p.generated && <div className="field mt"><label>Lecturer notes (internal, not printed)</label><textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} disabled={locked} onBlur={() => notes !== (p.lecturer_notes || '') && !locked && act(() => post(`/lecturer/assessments/${assessmentId}/proposals/${groupId}/status`, { status: 'notes', notes }), 'Notes saved')} /></div>}
      </section>

      {p.generated && <PrintBar onPrint={print}><span className="small muted">Generated {fmtDateTime(p.generated_at)}{p.updated_at && ` · updated ${fmtDateTime(p.updated_at)}`}{p.finalised_at && ` · finalised ${fmtDateTime(p.finalised_at)}`}</span></PrintBar>}

      <article className="doc">
        <DocHeader branding={meta?.course} title="Group Business Proposal" subtitle={`${p.assessment.title} · ${p.assessment.course_code} ${p.assessment.course_name} · Semester ${p.assessment.semester}`} />
        <div className="doc-meta">
          <div><span>Group</span>{p.group.group_name}</div><div><span>Business name</span><strong>{p.group.business_name || '—'}</strong></div>
          <div><span>Date</span>{fmtDate(p.finalised_at || p.generated_at || new Date().toISOString())}</div><div><span>Status</span>{labelize(p.status)}</div>
          <div style={{ gridColumn: '1 / -1' }}><span>Group members</span>{p.members.map((m) => `${m.name} (${m.matric_no}) — ${m.component || 'component not assigned'}`).join('; ')}</div>
        </div>
        {!p.generated && <Alert tone="info" className="no-print">This is a live preview assembled from the current answers. Click <strong>Generate proposal</strong> to save a proposal record that you can review, edit and finalise.</Alert>}
        {p.sections.map((s, i) => (
          <section className="doc-section" key={s.key}>
            <div className="row between"><h2>{i + 1}. {s.title}</h2>{p.generated && !locked && <button className="btn sm no-print" onClick={() => setEditing(s)}>{s.edited_html ? 'Edit (modified)' : 'Edit'}</button>}</div>
            {s.edited_html && showSources && <div className="source-tag">Edited by lecturer {s.edited_at ? fmtDateTime(s.edited_at) : ''} — original student answers are unchanged</div>}
            {s.html ? <SafeHtml html={s.html} /> : <p className="muted"><em>{s.note || 'No content.'}</em></p>}
            {showSources && s.contributions.length > 0 && (
              <div className="row">{s.contributions.map((c) => <span key={c.answer_id} className="source-tag">Source: {c.student_name} · {c.group_name} · Question {c.question_number} ({c.question_topic}){c.excerpt ? ' · excerpt' : ''} · {c.answer_status}</span>)}</div>
            )}
            {showSources && s.note && s.html && <div className="source-tag">{s.note}</div>}
          </section>
        ))}
        <DocFooter note="This proposal was assembled from the individual assessment answers of the group members listed above. Each section is traceable to its source contribution." />
      </article>

      {editing && <SectionEditor section={editing} onClose={() => setEditing(null)} onSave={async (html) => { await act(() => put(`/lecturer/assessments/${assessmentId}/proposals/${groupId}/sections/${editing.key}`, { html }), html === null ? 'Section reset to generated content' : 'Section saved'); setEditing(null); }} />}
      {confirm === 'reset' && <Confirm title="Regenerate and discard lecturer edits?" tone="danger" confirmLabel="Regenerate" onCancel={() => setConfirm(null)} onConfirm={() => generate(true)} message="All lecturer edits to section content will be removed and the proposal rebuilt from the students' current answers." />}
      {confirm === 'finalise' && <Confirm title="Finalise this proposal?" tone="success" confirmLabel="Finalise" onCancel={() => setConfirm(null)} onConfirm={() => setStatus('finalised')} message="Finalised proposals cannot be edited or regenerated unless reopened. Printing a finalised proposal marks it as Printed / Exported." />}
      {confirm === 'reopen' && <Confirm title="Reopen this finalised proposal?" tone="danger" confirmLabel="Reopen" onCancel={() => setConfirm(null)} onConfirm={() => setStatus('reopen')} message="The proposal returns to its review state. This action is recorded in the audit log." />}
    </>
  );
}

function SectionEditor({ section, onClose, onSave }) {
  const [html, setHtml] = useState(section.html || '');
  const [busy, setBusy] = useState(false);
  return (
    <Modal title={`Edit section: ${section.title}`} size="lg" onClose={onClose} footer={<>
      {section.edited_html && <button className="btn ghost" disabled={busy} onClick={async () => { setBusy(true); await onSave(null); }}>Reset to generated content</button>}
      <button className="btn" onClick={onClose} disabled={busy}>Cancel</button>
      <button className="btn primary" disabled={busy} onClick={async () => { setBusy(true); await onSave(html); }}>{busy ? 'Saving…' : 'Save section'}</button>
    </>}>
      <Alert tone="info">You are editing the presentation of this section only. The students' original answers remain stored and traceable.</Alert>
      <RichTextEditor value={html} onChange={setHtml} minHeight={320} />
      {section.contributions.length > 0 && <details className="mt small"><summary>Original contributions ({section.contributions.length})</summary>{section.contributions.map((c) => <div key={c.answer_id} className="answer-box"><div className="source-tag">{c.student_name} · Q{c.question_number} {c.question_topic}</div><SafeHtml html={c.answer_html} /></div>)}</details>}
    </Modal>
  );
}
