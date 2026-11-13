import { useState } from 'react';
import { Link } from 'react-router-dom';
import { get, post } from '../../api/client.js';
import { Badge, Empty, ErrorBox, Spinner, useAsync, useToast } from '../../components/ui.jsx';
import { fmtDateTime } from '../../utils/format.js';

export default function ProposalsOverview() {
  const toast = useToast();
  const [assessmentId, setAssessmentId] = useState('');
  const assessments = useAsync(() => get('/lecturer/assessments'));
  const aid = assessmentId || assessments.data?.assessments?.[0]?.assessment_id;
  const props = useAsync(() => (aid ? get(`/lecturer/assessments/${aid}/proposals`) : Promise.resolve({ proposals: [] })), [aid]);
  if (assessments.loading || (props.loading && !props.data)) return <Spinner />;
  if (assessments.error) return <ErrorBox error={assessments.error} retry={assessments.reload} />;
  const generateAll = async () => {
    let n = 0;
    for (const p of props.data.proposals) { if (!['finalised', 'exported'].includes(p.status)) { try { await post(`/lecturer/assessments/${aid}/proposals/${p.group_id}/generate`, {}); n++; } catch (e) { toast(`${p.group_name}: ${e.message}`, 'bad'); } } }
    toast(`${n} proposal(s) generated`, 'ok'); props.reload();
  };
  return (
    <>
      <div className="page-head"><div><h1>Group business proposals</h1><p>Each proposal is assembled from the group members' individual answers. Original answers are never changed.</p></div>
        <div className="row"><select value={aid || ''} onChange={(e) => setAssessmentId(e.target.value)} aria-label="Assessment">{assessments.data.assessments.map((a) => <option key={a.assessment_id} value={a.assessment_id}>{a.title}</option>)}</select><button className="btn" onClick={generateAll}>Generate / refresh all</button></div></div>
      {!props.data?.proposals.length ? <Empty>No groups yet.</Empty> : (
        <div className="grid grid-3">{props.data.proposals.map((p) => (
          <section className="card" key={p.group_id}>
            <div className="card-head"><div><h3>{p.group_name}</h3><div className="small"><strong>{p.business_name}</strong></div></div><Badge status={p.status} /></div>
            <div className="small mb"><strong>{p.submitted}/{p.total} submitted</strong></div>
            <ul className="small" style={{ margin: '0 0 .75rem 1rem', padding: 0 }}>{p.members.map((m) => <li key={m.student_id}>{m.submitted ? '✓' : '✗'} {m.component} <span className="muted">— {m.name}</span></li>)}</ul>
            {p.generated_at && <div className="tiny muted mb">Generated {fmtDateTime(p.generated_at)}</div>}
            <div className="row end"><Link className="btn sm primary" to={`/lecturer/proposals/${aid}/${p.group_id}`}>{p.proposal_id ? 'Open proposal' : 'Generate & preview'}</Link><Link className="btn sm" to={`/lecturer/reports/group/${aid}/${p.group_id}`}>Group report</Link></div>
          </section>))}</div>
      )}
    </>
  );
}
