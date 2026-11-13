import { useState } from 'react';
import { Link } from 'react-router-dom';
import { get } from '../../api/client.js';
import { Badge, Empty, ErrorBox, Spinner, Tabs, useAsync } from '../../components/ui.jsx';

export default function ReportsPage() {
  const [assessmentId, setAssessmentId] = useState('');
  const [tab, setTab] = useState('individual');
  const assessments = useAsync(() => get('/lecturer/assessments'));
  const aid = assessmentId || assessments.data?.assessments?.[0]?.assessment_id;
  const attempts = useAsync(() => (aid ? get(`/lecturer/attempts?assessment_id=${aid}`) : Promise.resolve({ attempts: [] })), [aid]);
  const groups = useAsync(() => get('/lecturer/groups'));
  if (assessments.loading || attempts.loading || groups.loading) return <Spinner />;
  if (assessments.error) return <ErrorBox error={assessments.error} retry={assessments.reload} />;
  return (
    <>
      <div className="page-head"><div><h1>Reports</h1><p>Two distinct outputs: the <strong>Individual Student Assessment Report</strong> and the <strong>Group Business Proposal</strong>, plus the <strong>Group Report</strong> summarising each group's status.</p></div>
        <select value={aid || ''} onChange={(e) => setAssessmentId(e.target.value)} aria-label="Assessment">{assessments.data.assessments.map((a) => <option key={a.assessment_id} value={a.assessment_id}>{a.title}</option>)}</select></div>
      <Tabs value={tab} onChange={setTab} tabs={[{ value: 'individual', label: 'Individual student reports' }, { value: 'group', label: 'Group reports & proposals' }]} />
      {tab === 'individual' && (!attempts.data?.attempts.length ? <Empty>No attempts yet.</Empty> : (
        <div className="table-wrap"><table className="table"><thead><tr><th>Student</th><th>Matric</th><th>Group</th><th>Component</th><th>Attempt</th><th>Marking</th><th>Total</th><th></th></tr></thead>
          <tbody>{attempts.data.attempts.map((t) => <tr key={t.attempt_id}><td>{t.student_name}</td><td className="mono">{t.matric_no}</td><td>{t.group_name}</td><td><Badge tone="gold">{t.component}</Badge></td><td><Badge status={t.status} /></td><td><Badge status={t.marking_status} /></td><td>{t.marking_status !== 'pending' ? `${t.total_marks} / ${t.max_marks}` : '—'}</td><td className="actions"><Link className="btn sm primary" to={`/lecturer/reports/individual/${t.attempt_id}`}>Open report</Link></td></tr>)}</tbody></table></div>))}
      {tab === 'group' && (!groups.data?.groups.length ? <Empty>No groups yet.</Empty> : (
        <div className="table-wrap"><table className="table"><thead><tr><th>Group</th><th>Business</th><th>Members</th><th></th></tr></thead>
          <tbody>{groups.data.groups.map((g) => <tr key={g.group_id}><td>{g.group_name}</td><td>{g.business_name}</td><td className="small">{g.members.map((m) => m.name).join(', ')}</td><td className="actions"><Link className="btn sm primary" to={`/lecturer/reports/group/${aid}/${g.group_id}`}>Group report</Link> <Link className="btn sm" to={`/lecturer/proposals/${aid}/${g.group_id}`}>Business proposal</Link></td></tr>)}</tbody></table></div>))}
    </>
  );
}
