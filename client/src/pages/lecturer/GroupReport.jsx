import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { get, put } from '../../api/client.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import { Badge, ErrorBox, SafeHtml, Spinner, useAsync, useToast } from '../../components/ui.jsx';
import { DocFooter, DocHeader, PrintBar } from '../../components/DocHeader.jsx';
import { RichTextEditor } from '../../components/RichTextEditor.jsx';
import { fmtDateTime, labelize } from '../../utils/format.js';

export default function GroupReport() {
  const { assessmentId, groupId } = useParams();
  const { meta } = useAuth();
  const toast = useToast();
  const { data, loading, error, reload, setData } = useAsync(() => get(`/lecturer/reports/group/${assessmentId}/${groupId}`), [assessmentId, groupId]);
  const [feedback, setFeedback] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (data) setFeedback(data.lecturer_feedback || ''); }, [data?.report_id, data?.updated_at]); // eslint-disable-line react-hooks/exhaustive-deps
  if (loading && !data) return <Spinner />;
  if (error) return <ErrorBox error={error} retry={reload} />;
  const r = data;
  const save = async (status) => { setBusy(true); try { setData(await put(`/lecturer/reports/group/${assessmentId}/${groupId}`, { lecturer_feedback: feedback, status })); toast('Group report saved', 'ok'); } catch (e) { toast(e.message, 'bad'); } finally { setBusy(false); } };
  return (
    <>
      <PrintBar><Link className="btn" to="/lecturer/reports">← Reports</Link><Link className="btn" to={`/lecturer/proposals/${assessmentId}/${groupId}`}>Business proposal</Link><Badge status={r.status} /></PrintBar>
      <section className="card mb no-print">
        <h3>Lecturer feedback for the group</h3>
        <RichTextEditor value={feedback} onChange={setFeedback} minHeight={100} placeholder="Feedback on the group's overall work and proposal…" disabled={r.status === 'finalised'} />
        <div className="form-actions">
          {r.status === 'finalised' ? <button className="btn" disabled={busy} onClick={() => save('reviewed')}>Reopen group report</button> : <>
            <button className="btn" disabled={busy} onClick={() => save('draft')}>Save draft</button><button className="btn" disabled={busy} onClick={() => save('reviewed')}>Save as reviewed</button><button className="btn success" disabled={busy} onClick={() => save('finalised')}>Finalise group report</button></>}
        </div>
      </section>
      <article className="doc">
        <DocHeader branding={meta?.course} title="Group Report" subtitle={`${r.assessment.title} · ${r.assessment.course_code} ${r.assessment.course_name} · Semester ${r.assessment.semester}`} />
        <div className="doc-meta">
          <div><span>Group</span>{r.group.group_name}</div><div><span>Business name</span><strong>{r.group.business_name}</strong></div>
          <div style={{ gridColumn: '1 / -1' }}><span>Business idea</span>{r.group.business_idea || '—'}</div>
          <div><span>Submission status</span>{r.submission.complete ? 'Complete' : `${r.submission.submitted}/${r.submission.total} submitted`}</div><div><span>Proposal status</span>{labelize(r.proposal.status)}</div>
          <div><span>Total group score</span><strong>{r.marking.total_group_score} / {r.marking.max_group_score}{r.marking.average_percentage !== null ? ` (${r.marking.average_percentage}%)` : ''}</strong></div><div><span>Marking</span>{r.marking.finalised_count}/{r.members.length} finalised</div>
        </div>
        <section className="doc-section">
          <h2>Members and individual components</h2>
          <table className="table"><thead><tr><th>Member</th><th>Matric</th><th>Component</th><th>Submission</th><th>Answered</th><th>Marking</th><th>Individual mark</th></tr></thead>
            <tbody>{r.members.map((m) => <tr key={m.student_id}><td>{m.name}</td><td className="mono">{m.matric_no}</td><td>{m.component}</td><td>{labelize(m.attempt_status)}</td><td>{m.answered_count}/{m.question_count}</td><td>{labelize(m.marking_status)}</td><td>{m.total_marks !== null && m.marking_status !== 'pending' ? `${m.total_marks} / ${m.max_marks}` : '—'}</td></tr>)}</tbody></table>
          <p className="tiny muted">Total group score is the sum of the members' individual marks that have been entered. Individual marks remain linked to each student.</p>
        </section>
        <section className="doc-section">
          <h2>Business proposal status</h2>
          <p>Status: <strong>{labelize(r.proposal.status)}</strong>{r.proposal.generated_at && <> · generated {fmtDateTime(r.proposal.generated_at)}</>}{r.proposal.reviewed_at && <> · reviewed {fmtDateTime(r.proposal.reviewed_at)}</>}{r.proposal.finalised_at && <> · finalised {fmtDateTime(r.proposal.finalised_at)}</>}</p>
          <ul className="small">{r.members.map((m) => <li key={m.student_id}>{m.submitted ? '✓' : '✗'} {m.component} — {m.name}</li>)}</ul>
        </section>
        <section className="doc-section"><h2>Lecturer feedback</h2>{r.lecturer_feedback ? <SafeHtml html={r.lecturer_feedback} /> : <p className="muted"><em>No feedback recorded yet.</em></p>}</section>
        <DocFooter note={`Group report ${labelize(r.status)}${r.reviewed_at ? ` · last saved ${fmtDateTime(r.reviewed_at)}` : ''}. This report summarises group status; it does not replace the Individual Student Assessment Report or the Group Business Proposal.`} />
      </article>
    </>
  );
}
