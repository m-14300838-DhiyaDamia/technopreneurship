import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { get, post, patch, put, del } from '../../api/client.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import { Alert, Badge, Confirm, Empty, ErrorBox, Modal, SafeHtml, Spinner, Tabs, useAsync, useToast } from '../../components/ui.jsx';
import { RichTextEditor } from '../../components/RichTextEditor.jsx';
import { fmtDateTime, toLocalInput, labelize } from '../../utils/format.js';

export default function AssessmentManager() {
  const { id } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const list = useAsync(() => get('/lecturer/assessments'));
  const [creating, setCreating] = useState(false);

  if (list.loading && !list.data) return <Spinner />;
  if (list.error) return <ErrorBox error={list.error} retry={list.reload} />;
  const selected = id || list.data.assessments[0]?.assessment_id;

  const create = async (f) => {
    try { const r = await post('/lecturer/assessments', f); toast('Assessment created', 'ok'); setCreating(false); await list.reload(); nav(`/lecturer/assessments/${r.assessment.assessment_id}`); } catch (e) { toast(e.message, 'bad'); }
  };

  return (
    <>
      <div className="page-head"><div><h1>Assessments & questions</h1><p>Configure the assessment, its timing, components, proposal template and questions.</p></div>
        <div className="row">
          {list.data.assessments.length > 0 && <select value={selected || ''} onChange={(e) => nav(`/lecturer/assessments/${e.target.value}`)} aria-label="Assessment">{list.data.assessments.map((a) => <option key={a.assessment_id} value={a.assessment_id}>{a.title}</option>)}</select>}
          <button className="btn primary" onClick={() => setCreating(true)}>+ New assessment</button>
        </div></div>
      {!selected ? <Empty>No assessments yet. Create one to begin.</Empty> : <AssessmentDetail key={selected} id={selected} onDeleted={() => { list.reload(); nav('/lecturer/assessments'); }} onChanged={list.reload} />}
      {creating && <Modal title="New assessment" onClose={() => setCreating(false)}><AssessmentForm onSave={create} onCancel={() => setCreating(false)} /></Modal>}
    </>
  );
}

function AssessmentDetail({ id, onDeleted, onChanged }) {
  const toast = useToast();
  const { data, loading, error, reload, setData } = useAsync(() => get(`/lecturer/assessments/${id}`), [id]);
  const [tab, setTab] = useState('settings');
  const [deleting, setDeleting] = useState(false);
  if (loading && !data) return <Spinner />;
  if (error) return <ErrorBox error={error} retry={reload} />;
  const a = data.assessment;
  const update = async (patchBody, msg = 'Saved') => {
    try { const r = await patch(`/lecturer/assessments/${id}`, patchBody); setData({ ...data, assessment: r.assessment }); toast(msg, 'ok'); onChanged?.(); return true; } catch (e) { toast(e.message, 'bad'); return false; }
  };
  return (
    <>
      <section className="card mb">
        <div className="card-head"><div><h2>{a.title}</h2><div className="small muted">{a.course_code} {a.course_name} · {a.semester} · {a.duration_minutes} min · {data.questions.filter((q) => q.active).length} active questions</div></div>
          <div className="row">
            {a.is_open_now ? <Badge tone="ok">Open now</Badge> : <Badge status={a.status} />}
            {a.status !== 'open' && <button className="btn success sm" onClick={() => update({ status: 'open' }, 'Assessment opened')}>Open assessment</button>}
            {a.status === 'open' && <button className="btn danger sm" onClick={() => window.confirm('Close the assessment? Students will no longer be able to start.') && update({ status: 'closed' }, 'Assessment closed')}>Close assessment</button>}
            {a.status === 'closed' && <button className="btn sm" onClick={() => update({ status: 'draft' }, 'Back to draft')}>Back to draft</button>}
            <button className="btn sm ghost" onClick={() => setDeleting(true)}>Delete</button>
          </div></div>
        <div className="row small">
          <label className="check"><input type="checkbox" checked={a.results_released} onChange={(e) => update({ results_released: e.target.checked }, e.target.checked ? 'Results released to students (finalised marks only)' : 'Results hidden')} /> Release results to students</label>
          <span className="muted">· Students only see marks that are finalised.</span>
        </div>
      </section>
      <Tabs value={tab} onChange={setTab} tabs={[{ value: 'settings', label: 'Settings & timing' }, { value: 'questions', label: `Questions (${data.questions.length})` }, { value: 'components', label: 'Components & assignment' }, { value: 'template', label: 'Proposal template' }]} />
      {tab === 'settings' && <section className="card"><AssessmentForm initial={a} onSave={(f) => update(f, 'Settings saved')} /></section>}
      {tab === 'questions' && <QuestionManager assessment={a} questions={data.questions} reload={reload} />}
      {tab === 'components' && <ComponentsEditor assessment={a} onSave={update} />}
      {tab === 'template' && <TemplateEditor assessment={a} questions={data.questions} onSave={update} />}
      {deleting && <Confirm title="Delete this assessment?" tone="danger" confirmLabel="Delete" message="Questions will be deleted too. Assessments with student attempts cannot be deleted." onCancel={() => setDeleting(false)} onConfirm={async () => { try { await del(`/lecturer/assessments/${id}`); toast('Deleted', 'ok'); onDeleted(); } catch (e) { toast(e.message, 'bad'); setDeleting(false); } }} />}
    </>
  );
}

function AssessmentForm({ initial, onSave, onCancel }) {
  const { meta } = useAuth();
  const c = meta?.course || {};
  const [f, setF] = useState({
    title: initial?.title || c.assessmentTitle || '', course_code: initial?.course_code || c.code || '', course_name: initial?.course_name || c.name || '', semester: initial?.semester || c.semester || '',
    description: initial?.description || '', instructions: initial?.instructions || '', duration_minutes: initial?.duration_minutes || 120, start_at: toLocalInput(initial?.start_at), end_at: toLocalInput(initial?.end_at),
    camera_required: initial?.camera_required ?? true, proctoring_enabled: initial?.proctoring_enabled ?? true, question_mode: initial?.question_mode || 'component',
  });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    const body = { ...f, duration_minutes: Number(f.duration_minutes), start_at: f.start_at ? new Date(f.start_at).toISOString() : '', end_at: f.end_at ? new Date(f.end_at).toISOString() : '' };
    try { await onSave(body); } finally { setBusy(false); }
  };
  return (
    <form onSubmit={submit}>
      <div className="form-row">
        <div className="field" style={{ gridColumn: '1 / -1' }}><label>Title *</label><input value={f.title} onChange={set('title')} required /></div>
        <div className="field"><label>Course code</label><input value={f.course_code} onChange={set('course_code')} /></div>
        <div className="field"><label>Course name</label><input value={f.course_name} onChange={set('course_name')} /></div>
        <div className="field"><label>Semester</label><input value={f.semester} onChange={set('semester')} /></div>
        <div className="field"><label>Duration (minutes) *</label><input type="number" min={1} max={1440} value={f.duration_minutes} onChange={set('duration_minutes')} required /><span className="hint">Each student's timer runs from the moment they click Start, limited by the end time below.</span></div>
        <div className="field"><label>Window opens (optional)</label><input type="datetime-local" value={f.start_at} onChange={set('start_at')} /></div>
        <div className="field"><label>Window closes (optional)</label><input type="datetime-local" value={f.end_at} onChange={set('end_at')} /><span className="hint">Attempts are auto-submitted at this time even if the student's own duration has not elapsed.</span></div>
        <div className="field"><label>Question visibility</label><select value={f.question_mode} onChange={set('question_mode')}><option value="component">Common questions + questions of the student's assigned component (recommended)</option><option value="all">Every student answers every question</option></select></div>
        <div className="field" style={{ gridColumn: '1 / -1' }}><label>Short description</label><input value={f.description} onChange={set('description')} /></div>
        <div className="field" style={{ gridColumn: '1 / -1' }}><label>Instructions shown before the student starts</label><RichTextEditor value={f.instructions} onChange={(v) => setF({ ...f, instructions: v })} minHeight={140} placeholder="Instructions…" /></div>
        <label className="check"><input type="checkbox" checked={f.camera_required} onChange={set('camera_required')} /> Camera required (students must grant camera permission before starting)</label>
        <label className="check"><input type="checkbox" checked={f.proctoring_enabled} onChange={set('proctoring_enabled')} /> Record browser monitoring events (tab switch, focus loss, paste, idle…)</label>
      </div>
      <div className="form-actions">{onCancel && <button type="button" className="btn" onClick={onCancel}>Cancel</button>}<button className="btn primary" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button></div>
    </form>
  );
}

/* ---- Components ------------------------------------------------------------ */
function ComponentsEditor({ assessment, onSave }) {
  const [comps, setComps] = useState(assessment.components);
  const [draft, setDraft] = useState('');
  return (
    <section className="card">
      <h3>Business components</h3>
      <p className="small muted">Each student in a group is assigned one component. Questions are tagged with a component (or "Common" for everyone). Assign components to students in <strong>Groups</strong>.</p>
      <div className="row mb">{comps.map((c) => <span key={c} className="badge gold" style={{ fontSize: '.85rem', textTransform: 'none' }}>{c} <button className="btn ghost sm" style={{ padding: '0 .3rem' }} aria-label={`Remove ${c}`} onClick={() => setComps(comps.filter((x) => x !== c))}>✕</button></span>)}</div>
      <form className="row" onSubmit={(e) => { e.preventDefault(); if (draft.trim() && !comps.some((c) => c.toLowerCase() === draft.trim().toLowerCase())) setComps([...comps, draft.trim()]); setDraft(''); }}>
        <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="New component name" style={{ maxWidth: 280 }} /><button className="btn">Add</button>
      </form>
      <div className="form-actions"><button className="btn primary" onClick={() => onSave({ components: comps }, 'Components saved')} disabled={!comps.length}>Save components</button></div>
    </section>
  );
}

/* ---- Proposal template ----------------------------------------------------- */
function TemplateEditor({ assessment, questions, onSave }) {
  const { meta } = useAuth();
  const [t, setT] = useState(assessment.proposal_template);
  const topics = Array.from(new Set(questions.map((q) => q.topic).filter(Boolean)));
  const upd = (i, p) => setT(t.map((s, j) => (j === i ? { ...s, ...p } : s)));
  const move = (i, d) => { const n = [...t]; const [x] = n.splice(i, 1); n.splice(i + d, 0, x); setT(n); };
  return (
    <section className="card">
      <div className="card-head"><h3>Business proposal template</h3><button className="btn sm" onClick={() => setT(meta?.default_proposal_template || t)}>Reset to default</button></div>
      <p className="small muted">The group proposal is assembled section by section from the members' answers. Each section lists the <strong>question topics</strong> whose answers feed it. Topics used by current questions: {topics.length ? topics.join(', ') : 'none yet'}.</p>
      <div className="table-wrap"><table className="table"><thead><tr><th>#</th><th>Section title</th><th>Source</th><th>Source topics (comma separated)</th><th></th></tr></thead>
        <tbody>{t.map((s, i) => {
          const unmatched = s.source === 'answers' && (s.source_topics || []).filter((x) => !topics.some((tp) => tp.toLowerCase().trim() === x.toLowerCase().trim()));
          return (
            <tr key={i}><td>{i + 1}</td><td><input value={s.title} onChange={(e) => upd(i, { title: e.target.value })} /></td>
              <td><select value={s.source} onChange={(e) => upd(i, { source: e.target.value })}><option value="answers">Student answers</option><option value="group">Group record</option></select>{s.source === 'answers' && <label className="check tiny mt-sm"><input type="checkbox" checked={s.compose_fallback === 'excerpts'} onChange={(e) => upd(i, { compose_fallback: e.target.checked ? 'excerpts' : undefined })} /> Compose from excerpts if empty</label>}</td>
              <td>{s.source === 'answers' && <><input value={(s.source_topics || []).join(', ')} onChange={(e) => upd(i, { source_topics: e.target.value.split(',').map((x) => x.trim()).filter(Boolean) })} />{unmatched?.length > 0 && <div className="tiny" style={{ color: 'var(--warning)' }}>No question has topic: {unmatched.join(', ')}</div>}</>}</td>
              <td className="actions"><button className="btn sm ghost" disabled={i === 0} onClick={() => move(i, -1)}>↑</button><button className="btn sm ghost" disabled={i === t.length - 1} onClick={() => move(i, 1)}>↓</button><button className="btn sm ghost" onClick={() => setT(t.filter((_, j) => j !== i))}>✕</button></td></tr>);
        })}</tbody></table></div>
      <div className="form-actions"><button className="btn" onClick={() => setT([...t, { key: '', title: 'New section', source: 'answers', source_topics: [] }])}>+ Add section</button><button className="btn primary" onClick={() => onSave({ proposal_template: t }, 'Template saved')}>Save template</button></div>
    </section>
  );
}

/* ---- Questions --------------------------------------------------------------- */
function QuestionManager({ assessment, questions, reload }) {
  const toast = useToast();
  const { meta } = useAuth();
  const [editing, setEditing] = useState(null);
  const [preview, setPreview] = useState(null);
  const sections = [meta?.common_section || 'Common', ...assessment.components];
  const run = async (fn, msg) => { try { await fn(); if (msg) toast(msg, 'ok'); reload(); } catch (e) { toast(e.message, 'bad'); } };
  const move = (i, d) => { const ids = questions.map((q) => q.question_id); const [x] = ids.splice(i, 1); ids.splice(i + d, 0, x); run(() => put(`/lecturer/assessments/${assessment.assessment_id}/questions/order`, { order: ids })); };
  const bySection = sections.map((s) => ({ s, count: questions.filter((q) => q.section === s && q.active).length, marks: questions.filter((q) => q.section === s && q.active).reduce((a, q) => a + q.marks, 0) }));
  return (
    <>
      <section className="card mb">
        <div className="card-head"><h3>Questions</h3><button className="btn primary" onClick={() => setEditing({ section: sections[1] || sections[0], topic: '', question_text: '', question_type: 'long_answer', marks: 10, time_limit: '', active: true, options: null, guidance: '' })}>+ Add question</button></div>
        <div className="row small mb">{bySection.map((b) => <span key={b.s} className="badge" style={{ textTransform: 'none' }}>{b.s}: {b.count} q · {b.marks} marks</span>)}</div>
        {!questions.length ? <Empty>No questions yet. The same question set is shared by all groups; tag each question with a component or "Common".</Empty> : (
          <div className="table-wrap"><table className="table"><thead><tr><th>#</th><th>Section</th><th>Topic</th><th>Question</th><th>Type</th><th>Marks</th><th>Active</th><th></th></tr></thead>
            <tbody>{questions.map((q, i) => (
              <tr key={q.question_id} style={{ opacity: q.active ? 1 : .55 }}><td>{i + 1}</td><td><Badge tone={q.section === 'Common' ? 'info' : 'gold'}>{q.section}</Badge></td><td>{q.topic || <span className="muted">—</span>}</td>
                <td style={{ maxWidth: 420 }}><SafeHtml html={q.question_text} className="rich small" /></td><td className="small">{labelize(q.question_type)}</td><td>{q.marks}</td>
                <td><input type="checkbox" checked={q.active} onChange={(e) => run(() => patch(`/lecturer/questions/${q.question_id}`, { active: e.target.checked }), e.target.checked ? 'Activated' : 'Deactivated')} aria-label="Active" /></td>
                <td className="actions"><button className="btn sm ghost" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up">↑</button><button className="btn sm ghost" disabled={i === questions.length - 1} onClick={() => move(i, 1)} aria-label="Move down">↓</button> <button className="btn sm" onClick={() => setPreview(q)}>Preview</button> <button className="btn sm" onClick={() => setEditing({ ...q, time_limit: q.time_limit ?? '' })}>Edit</button> <button className="btn sm ghost" onClick={() => window.confirm('Delete this question?') && run(() => del(`/lecturer/questions/${q.question_id}`), 'Deleted')}>Delete</button></td></tr>))}</tbody></table></div>
        )}
      </section>
      {editing && <QuestionForm initial={editing} sections={sections} topics={(assessment.proposal_template || []).flatMap((s) => s.source_topics || [])} types={meta?.question_types || []} onCancel={() => setEditing(null)}
        onSave={async (f) => { const body = { ...f, marks: Number(f.marks), time_limit: f.time_limit === '' ? null : Number(f.time_limit), options: f.question_type === 'multiple_choice' ? f.options : null }; delete body.question_id; delete body.assessment_id; delete body.order_index; delete body.created_at; delete body.updated_at;
          await run(() => (f.question_id ? patch(`/lecturer/questions/${f.question_id}`, body) : post(`/lecturer/assessments/${assessment.assessment_id}/questions`, body)), 'Question saved'); setEditing(null); }} />}
      {preview && <Modal title="Question preview (as the student sees it)" size="lg" onClose={() => setPreview(null)}>
        <div className="row between"><div className="row"><Badge>{preview.section}</Badge><Badge tone="navy">{preview.marks} marks</Badge></div><span className="muted small">{preview.topic} · {labelize(preview.question_type)}</span></div>
        <SafeHtml html={preview.question_text} className="rich question-text mt" />
        {preview.options && <ul>{preview.options.map((o) => <li key={o.key}><strong>{o.key}.</strong> {o.text}{o.correct && <span className="muted tiny"> (marked correct — hidden from students)</span>}</li>)}</ul>}
        {preview.guidance && <div className="alert info small"><SafeHtml html={preview.guidance} /></div>}
      </Modal>}
    </>
  );
}

function QuestionForm({ initial, sections, topics, types, onCancel, onSave }) {
  const [f, setF] = useState(initial);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const opts = f.options || [];
  const setOpt = (i, p) => setF({ ...f, options: opts.map((o, j) => (j === i ? { ...o, ...p } : o)) });
  useEffect(() => { if (f.question_type === 'multiple_choice' && !f.options?.length) setF((x) => ({ ...x, options: [{ key: 'A', text: '' }, { key: 'B', text: '' }, { key: 'C', text: '' }, { key: 'D', text: '' }] })); }, [f.question_type]); // eslint-disable-line react-hooks/exhaustive-deps
  const uniqueTopics = Array.from(new Set(topics));
  return (
    <Modal title={f.question_id ? 'Edit question' : 'Add question'} size="lg" onClose={onCancel}>
      <form onSubmit={async (e) => { e.preventDefault(); setBusy(true); try { await onSave(f); } finally { setBusy(false); } }}>
        <div className="form-row">
          <div className="field"><label>Section (component) *</label><select value={f.section} onChange={set('section')}>{sections.map((s) => <option key={s} value={s}>{s}</option>)}</select><span className="hint">"Common" questions are answered by every student.</span></div>
          <div className="field"><label>Topic (feeds the proposal section)</label><input list="topic-list" value={f.topic || ''} onChange={set('topic')} placeholder="e.g. Marketing Strategy" /><datalist id="topic-list">{uniqueTopics.map((t) => <option key={t} value={t} />)}</datalist></div>
          <div className="field"><label>Question type</label><select value={f.question_type} onChange={set('question_type')}>{types.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
          <div className="field"><label>Marks *</label><input type="number" min={0} step="0.5" value={f.marks} onChange={set('marks')} required /></div>
          <div className="field"><label>Suggested time (minutes)</label><input type="number" min={0} value={f.time_limit} onChange={set('time_limit')} /></div>
          <label className="check"><input type="checkbox" checked={f.active !== false} onChange={set('active')} /> Active (visible to students)</label>
        </div>
        <div className="field"><label>Question text *</label><RichTextEditor value={f.question_text} onChange={(v) => setF({ ...f, question_text: v })} minHeight={160} placeholder="Write the question, case or scenario…" /></div>
        <div className="field"><label>Guidance / marking hint shown to students (optional)</label><RichTextEditor value={f.guidance || ''} onChange={(v) => setF({ ...f, guidance: v })} minHeight={90} placeholder="e.g. Include at least three points…" /></div>
        {f.question_type === 'multiple_choice' && (
          <div className="field"><label>Options</label>
            {opts.map((o, i) => <div key={i} className="row"><input style={{ width: 50 }} value={o.key} onChange={(e) => setOpt(i, { key: e.target.value.toUpperCase().slice(0, 2) })} aria-label="Key" /><input style={{ flex: 1 }} value={o.text} onChange={(e) => setOpt(i, { text: e.target.value })} placeholder={`Option ${o.key}`} /><label className="check small"><input type="checkbox" checked={!!o.correct} onChange={(e) => setOpt(i, { correct: e.target.checked })} /> Correct</label><button type="button" className="btn sm ghost" onClick={() => setF({ ...f, options: opts.filter((_, j) => j !== i) })}>✕</button></div>)}
            <button type="button" className="btn sm mt-sm" onClick={() => setF({ ...f, options: [...opts, { key: String.fromCharCode(65 + opts.length), text: '' }] })}>+ Option</button>
          </div>
        )}
        <div className="form-actions"><button type="button" className="btn" onClick={onCancel}>Cancel</button><button className="btn primary" disabled={busy}>{busy ? 'Saving…' : 'Save question'}</button></div>
      </form>
    </Modal>
  );
}
