import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { get, post, put } from '../../api/client.js';
import { Alert, Badge, Confirm, ErrorBox, SafeHtml, Spinner, useAsync, useToast } from '../../components/ui.jsx';
import { RichTextEditor } from '../../components/RichTextEditor.jsx';
import { AnswerView } from '../student/AssessmentPage.jsx';
import { fmtDateTime, labelize } from '../../utils/format.js';

export default function MarkingPanel() {
  const { attemptId } = useParams();
  const toast = useToast();
  const { data, loading, error, reload, setData } = useAsync(() => get(`/lecturer/attempts/${attemptId}/review`), [attemptId]);
  const [marks, setMarks] = useState({});
  const [overall, setOverall] = useState('');
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(null);

  useEffect(() => {
    if (!data) return;
    const m = {}; data.items.forEach((it) => { m[it.question.question_id] = { marks: it.answer?.marks ?? '', feedback: it.answer?.lecturer_feedback || '' }; });
    setMarks(m); setOverall(data.attempt.lecturer_feedback || ''); setDirty(false);
  }, [data]);

  if (loading && !data) return <Spinner />;
  if (error) return <ErrorBox error={error} retry={reload} />;
  const { attempt, student, assessment, items, totals, monitoring } = data;
  const submitted = ['submitted', 'auto_submitted'].includes(attempt.status);
  const finalised = attempt.marking_status === 'finalised';
  const readOnly = !submitted || finalised;
  const liveTotal = items.reduce((s, it) => s + (Number(marks[it.question.question_id]?.marks) || 0), 0);

  const save = async () => {
    setBusy(true);
    try {
      const r = await put(`/lecturer/attempts/${attemptId}/marks`, { items: items.map((it) => ({ question_id: it.question.question_id, marks: marks[it.question.question_id]?.marks === '' ? null : Number(marks[it.question.question_id]?.marks), lecturer_feedback: marks[it.question.question_id]?.feedback || '' })), lecturer_feedback: overall });
      setData(r); toast('Marks saved as draft', 'ok'); return true;
    } catch (e) { toast(e.message, 'bad'); return false; } finally { setBusy(false); }
  };
  const finalise = async () => { if (dirty && !(await save())) return; try { setData(await post(`/lecturer/attempts/${attemptId}/finalise`)); toast('Marking finalised', 'ok'); } catch (e) { toast(e.message, 'bad'); } setConfirm(null); };
  const reopenMarking = async (reason) => { try { setData(await post(`/lecturer/attempts/${attemptId}/reopen-marking`, { reason })); toast('Marking reopened', 'ok'); } catch (e) { toast(e.message, 'bad'); } setConfirm(null); };
  const reopenAttempt = async (reason) => { const mins = Number(window.prompt('Extra minutes to give the student:', '15')); if (!mins) return; try { await post(`/lecturer/attempts/${attemptId}/reopen`, { extra_minutes: mins, reason }); toast('Attempt reopened for the student', 'ok'); reload(); } catch (e) { toast(e.message, 'bad'); } setConfirm(null); };
  const setM = (qid, p) => { setMarks({ ...marks, [qid]: { ...marks[qid], ...p } }); setDirty(true); };

  return (
    <>
      <div className="page-head">
        <div><h1>{student.name} <span className="muted" style={{ fontWeight: 400 }}>· {student.matric_no}</span></h1><p>{student.group_name} · {student.business_name} · <Badge tone="gold">{attempt.component || student.component}</Badge> · {assessment.title}</p></div>
        <div className="row"><Link className="btn" to="/lecturer/marking">← All attempts</Link><Link className="btn" to={`/lecturer/reports/individual/${attemptId}`}>Individual report</Link>{student.group_id && <Link className="btn" to={`/lecturer/proposals/${assessment.assessment_id}/${student.group_id}`}>Group proposal</Link>}</div>
      </div>
      <div className="grid grid-4 mb">
        <div className="stat"><div className="label">Attempt</div><div><Badge status={attempt.status} /></div><div className="tiny muted">Started {fmtDateTime(attempt.started_at)}<br />Submitted {fmtDateTime(attempt.submitted_at)}</div></div>
        <div className="stat"><div className="label">Marking</div><div><Badge status={attempt.marking_status} /></div>{attempt.marked_at && <div className="tiny muted">Updated {fmtDateTime(attempt.marked_at)}</div>}</div>
        <div className={`stat ${finalised ? 'ok' : ''}`}><div className="label">Total</div><div className="value">{finalised ? totals.total_marks : liveTotal} <span className="small muted">/ {totals.max_marks}</span></div></div>
        <div className={`stat ${monitoring.flagged_events ? 'warn' : 'ok'}`}><div className="label">Monitoring events</div><div className="value">{monitoring.flagged_events}</div><div className="tiny muted">{monitoring.pending_review} pending review · <Link to="/lecturer/monitoring">view</Link></div></div>
      </div>
      {!submitted && <Alert tone="info">This attempt is {labelize(attempt.status)}. Marks can be entered once the student has submitted.</Alert>}
      {finalised && <Alert tone="ok">Marks are finalised and protected from accidental changes. Use "Reopen marking" to make corrections (the action is audited).</Alert>}
      {attempt.reopened_at && <Alert tone="warn">Attempt reopened on {fmtDateTime(attempt.reopened_at)}: {attempt.reopen_reason}</Alert>}

      <div className="stack">
        {items.map((it) => {
          const q = it.question; const m = marks[q.question_id] || {};
          return (
            <div className="mark-item" key={q.question_id}>
              <div className="qhead"><div><h3>Question {it.number} <span className="muted small">· {q.section} · {q.topic} · {labelize(q.question_type)}</span></h3><SafeHtml html={q.question_text} className="rich small" /></div>
                <div className="row"><label className="label">Marks</label><input className="input mark-input" type="number" min={0} max={q.marks} step="0.5" value={m.marks ?? ''} disabled={readOnly} onChange={(e) => setM(q.question_id, { marks: e.target.value })} aria-label={`Marks for question ${it.number}`} /><span className="muted">/ {q.marks}</span></div></div>
              <span className="label">Student answer {it.answer?.timestamp && <span className="muted tiny">(saved {fmtDateTime(it.answer.timestamp)})</span>}</span>
              <div className="answer-box"><AnswerView question={q} answer={it.answer?.answer} /></div>
              <span className="label">Lecturer feedback</span>
              {readOnly ? <SafeHtml html={m.feedback || '<p><em>No feedback</em></p>'} className="rich small" /> : <RichTextEditor value={m.feedback || ''} onChange={(v) => setM(q.question_id, { feedback: v })} minHeight={80} placeholder="Feedback for this answer…" />}
            </div>
          );
        })}
        <div className="card">
          <h3>Overall feedback</h3>
          {readOnly ? <SafeHtml html={overall || '<p><em>No overall feedback</em></p>'} /> : <RichTextEditor value={overall} onChange={(v) => { setOverall(v); setDirty(true); }} minHeight={100} placeholder="Overall comments for the student…" />}
        </div>
      </div>

      <div className="exam-footer no-print">
        <div className="small muted">{finalised ? 'Finalised' : dirty ? 'Unsaved changes' : 'All changes saved'} · Total {finalised ? totals.total_marks : liveTotal} / {totals.max_marks}</div>
        <div className="row">
          {submitted && !finalised && <><button className="btn" onClick={save} disabled={busy || !dirty}>Save draft</button><button className="btn success" onClick={() => setConfirm('finalise')} disabled={busy}>Finalise marking</button></>}
          {finalised && <button className="btn" onClick={() => setConfirm('reopen-marking')}>Reopen marking</button>}
          {submitted && !finalised && <button className="btn ghost" onClick={() => setConfirm('reopen-attempt')}>Reopen attempt for student</button>}
        </div>
      </div>
      {confirm === 'finalise' && <Confirm title="Finalise marking?" confirmLabel="Finalise" tone="success" onCancel={() => setConfirm(null)} onConfirm={finalise} message={`Total ${liveTotal} / ${totals.max_marks}. All questions must have a mark. Finalised marks are protected and become visible to the student once results are released.`} />}
      {confirm === 'reopen-marking' && <Confirm title="Reopen finalised marks?" confirmLabel="Reopen" tone="danger" requireText="Reason (recorded in the audit log)" onCancel={() => setConfirm(null)} onConfirm={reopenMarking} />}
      {confirm === 'reopen-attempt' && <Confirm title="Reopen this attempt for the student?" confirmLabel="Continue" tone="danger" requireText="Reason (recorded in the audit log)" onCancel={() => setConfirm(null)} onConfirm={reopenAttempt} message="The student will be able to edit and resubmit. Draft marks are kept. You will be asked how many extra minutes to give." />}
    </>
  );
}
