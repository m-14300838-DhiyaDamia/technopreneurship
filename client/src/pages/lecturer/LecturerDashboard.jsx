import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { get } from '../../api/client.js';
import { Badge, Empty, ErrorBox, Spinner, useAsync } from '../../components/ui.jsx';
import { fmtDateTime, timeAgo } from '../../utils/format.js';

export default function LecturerDashboard() {
  const [assessmentId, setAssessmentId] = useState('');
  const { data, loading, error, reload } = useAsync(() => get(`/lecturer/dashboard${assessmentId ? `?assessment_id=${assessmentId}` : ''}`), [assessmentId]);
  const [filters, setFilters] = useState({ group: '', student: '', section: '', submission: '', marking: '', monitoring: '' });
  const nav = useNavigate();

  const rows = useMemo(() => {
    if (!data) return [];
    const f = filters; const q = f.student.toLowerCase();
    return data.students.filter((s) => (!f.group || s.group_id === f.group) && (!q || s.name.toLowerCase().includes(q) || s.matric_no.toLowerCase().includes(q))
      && (!f.section || s.component === f.section) && (!f.submission || s.attempt_status === f.submission)
      && (!f.marking || (f.marking === 'finalised' ? s.marking_status === 'finalised' : s.marking_status !== 'finalised' && ['submitted', 'auto_submitted'].includes(s.attempt_status)))
      && (!f.monitoring || (f.monitoring === 'flagged' ? s.flags > 0 : s.flags === 0)));
  }, [data, filters]);

  if (loading && !data) return <Spinner />;
  if (error) return <ErrorBox error={error} retry={reload} />;
  const { stats, assessments, groups } = data;
  const components = Array.from(new Set(data.students.map((s) => s.component).filter(Boolean)));
  const set = (k) => (e) => setFilters({ ...filters, [k]: e.target.value });

  return (
    <>
      <div className="page-head">
        <div><h1>Lecturer dashboard</h1><p>Overview of the assessment, submissions, marking and proposals.</p></div>
        <div className="row">
          <select value={assessmentId || stats.assessment?.assessment_id || ''} onChange={(e) => setAssessmentId(e.target.value)} aria-label="Assessment">
            {!assessments.length && <option value="">No assessments yet</option>}
            {assessments.map((a) => <option key={a.assessment_id} value={a.assessment_id}>{a.title} ({a.status})</option>)}
          </select>
          <button className="btn" onClick={reload}>Refresh</button>
        </div>
      </div>
      {!assessments.length && <div className="alert info">Start by <Link to="/lecturer/assessments">creating an assessment</Link>, then add questions, students and groups.</div>}
      <div className="grid grid-4 mb">
        <Stat label="Total students" value={stats.total_students} /><Stat label="Total groups" value={stats.total_groups} />
        <Stat label="Not started" value={stats.not_started} tone="" /><Stat label="In progress" value={stats.in_progress} tone="info" />
        <Stat label="Submitted" value={stats.submitted} tone="ok" /><Stat label="Not submitted" value={stats.not_submitted} tone={stats.not_submitted ? 'warn' : 'ok'} />
        <Stat label="Marking completed" value={stats.marking_completed} tone="ok" /><Stat label="Marking pending" value={stats.marking_pending} tone={stats.marking_pending ? 'warn' : 'ok'} />
        <Stat label="Proposal incomplete" value={stats.proposal_incomplete} tone="warn" /><Stat label="Proposal ready" value={stats.proposal_ready} tone="ok" />
        <Stat label="Monitoring alerts" value={stats.monitoring_alerts} tone={stats.monitoring_alerts ? 'bad' : 'ok'} />
        {stats.assessment && <div className="stat info"><div className="label">Assessment</div><div style={{ fontWeight: 700 }}>{stats.assessment.title}</div><div className="small">{stats.assessment.is_open_now ? <Badge tone="ok">Open now</Badge> : <Badge status={stats.assessment.status} />} · {stats.assessment.question_count} questions</div></div>}
      </div>

      <section className="card">
        <div className="card-head"><h3>Students</h3><span className="muted small">{rows.length} shown</span></div>
        <div className="form-row mb">
          <select value={filters.group} onChange={set('group')} aria-label="Group"><option value="">All groups</option>{groups.map((g) => <option key={g.group_id} value={g.group_id}>{g.group_name}</option>)}</select>
          <input type="search" placeholder="Search student / matric" value={filters.student} onChange={set('student')} aria-label="Student" />
          <select value={filters.section} onChange={set('section')} aria-label="Section"><option value="">All sections</option>{components.map((c) => <option key={c} value={c}>{c}</option>)}</select>
          <select value={filters.submission} onChange={set('submission')} aria-label="Submission status"><option value="">Any submission status</option><option value="not_started">Not started</option><option value="in_progress">In progress</option><option value="submitted">Submitted</option><option value="auto_submitted">Auto-submitted</option></select>
          <select value={filters.marking} onChange={set('marking')} aria-label="Marking status"><option value="">Any marking status</option><option value="pending">Marking pending</option><option value="finalised">Marking finalised</option></select>
          <select value={filters.monitoring} onChange={set('monitoring')} aria-label="Monitoring"><option value="">Any monitoring status</option><option value="flagged">Has monitoring events</option><option value="clean">No events</option></select>
        </div>
        {!rows.length ? <Empty>No students match these filters.</Empty> : (
          <div className="table-wrap"><table className="table">
            <thead><tr><th>Student</th><th>Matric</th><th>Group / Business</th><th>Component</th><th>Submission</th><th>Marks</th><th>Marking</th><th>Flags</th><th>Last activity</th><th></th></tr></thead>
            <tbody>{rows.map((s) => (
              <tr key={s.student_id} className="clickable" onClick={() => s.attempt_id && nav(`/lecturer/marking/${s.attempt_id}`)}>
                <td>{s.name}</td><td className="mono">{s.matric_no}</td><td>{s.group_name || <span className="muted">No group</span>}<div className="tiny muted">{s.business_name}</div></td>
                <td>{s.component ? <Badge tone="gold">{s.component}</Badge> : <span className="muted">—</span>}</td>
                <td><Badge status={s.attempt_status} />{s.submitted_at && <div className="tiny muted">{fmtDateTime(s.submitted_at)}</div>}</td>
                <td>{s.total_marks !== null && s.marking_status !== 'pending' ? `${s.total_marks} / ${s.max_marks}` : <span className="muted">—</span>}</td>
                <td>{['submitted', 'auto_submitted'].includes(s.attempt_status) ? <Badge status={s.marking_status} /> : <span className="muted">—</span>}</td>
                <td>{s.flags ? <Badge tone="warn">{s.flags}</Badge> : <span className="muted">0</span>}</td>
                <td className="small muted">{timeAgo(s.last_activity_at)}</td>
                <td className="actions">{s.attempt_id && <Link className="btn sm" to={`/lecturer/marking/${s.attempt_id}`} onClick={(e) => e.stopPropagation()}>Review</Link>}</td>
              </tr>))}</tbody>
          </table></div>
        )}
      </section>
    </>
  );
}

export function Stat({ label, value, tone = '' }) {
  return <div className={`stat ${tone}`}><div className="label">{label}</div><div className="value">{value ?? '—'}</div></div>;
}
