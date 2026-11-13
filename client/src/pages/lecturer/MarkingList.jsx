import { useState } from 'react';
import { Link } from 'react-router-dom';
import { get } from '../../api/client.js';
import { Badge, Empty, ErrorBox, Spinner, useAsync } from '../../components/ui.jsx';
import { fmtDateTime } from '../../utils/format.js';

export default function MarkingList() {
  const [assessmentId, setAssessmentId] = useState('');
  const [status, setStatus] = useState('');
  const assessments = useAsync(() => get('/lecturer/assessments'));
  const aid = assessmentId || assessments.data?.assessments?.[0]?.assessment_id;
  const attempts = useAsync(() => (aid ? get(`/lecturer/attempts?assessment_id=${aid}`) : Promise.resolve({ attempts: [] })), [aid]);
  if (assessments.loading || (attempts.loading && !attempts.data)) return <Spinner />;
  if (assessments.error) return <ErrorBox error={assessments.error} retry={assessments.reload} />;
  const list = (attempts.data?.attempts || []).filter((t) => !status || (status === 'unmarked' ? ['submitted', 'auto_submitted'].includes(t.status) && t.marking_status === 'pending' : status === 'draft' ? t.marking_status === 'draft' : status === 'finalised' ? t.marking_status === 'finalised' : t.status === status));
  return (
    <>
      <div className="page-head"><div><h1>Review & marking</h1><p>Select a submitted attempt to review answers, enter marks and feedback.</p></div>
        <div className="row">
          <select value={aid || ''} onChange={(e) => setAssessmentId(e.target.value)} aria-label="Assessment">{assessments.data.assessments.map((a) => <option key={a.assessment_id} value={a.assessment_id}>{a.title}</option>)}</select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter"><option value="">All attempts</option><option value="unmarked">Submitted, not yet marked</option><option value="draft">Marking in draft</option><option value="finalised">Finalised</option><option value="in_progress">In progress</option></select>
        </div></div>
      {!list.length ? <Empty>No attempts match.</Empty> : (
        <div className="table-wrap"><table className="table"><thead><tr><th>Student</th><th>Matric</th><th>Group / Business</th><th>Component</th><th>Attempt</th><th>Submitted</th><th>Marks</th><th>Marking</th><th></th></tr></thead>
          <tbody>{list.map((t) => (
            <tr key={t.attempt_id}><td>{t.student_name}</td><td className="mono">{t.matric_no}</td><td>{t.group_name}<div className="tiny muted">{t.business_name}</div></td><td><Badge tone="gold">{t.component}</Badge></td><td><Badge status={t.status} /></td><td className="small">{fmtDateTime(t.submitted_at)}</td>
              <td>{t.marking_status !== 'pending' ? `${t.total_marks} / ${t.max_marks}` : '—'}</td><td><Badge status={t.marking_status} /></td>
              <td className="actions"><Link className="btn sm primary" to={`/lecturer/marking/${t.attempt_id}`}>{['submitted', 'auto_submitted'].includes(t.status) ? 'Review & mark' : 'View'}</Link></td></tr>))}</tbody></table></div>
      )}
    </>
  );
}
