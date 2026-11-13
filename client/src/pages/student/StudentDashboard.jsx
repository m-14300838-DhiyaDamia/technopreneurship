import { Link } from 'react-router-dom';
import { get } from '../../api/client.js';
import { Alert, Badge, ErrorBox, SafeHtml, Spinner, useAsync } from '../../components/ui.jsx';
import { fmtDateTime, fmtDuration } from '../../utils/format.js';

export default function StudentDashboard() {
  const { data, loading, error, reload } = useAsync(() => get('/student/dashboard'));
  if (loading) return <Spinner />;
  if (error) return <ErrorBox error={error} retry={reload} />;
  const { student, assessments } = data;
  return (
    <>
      <div className="page-head"><div><h1>Welcome, {student.name}</h1><p>Your personal assessment dashboard.</p></div></div>
      <div className="grid grid-2">
        <section className="card">
          <h3>Personal information</h3>
          <table className="table" style={{ fontSize: '.95rem' }}><tbody>
            <tr><th>Name</th><td>{student.name}</td></tr>
            <tr><th>Matric No</th><td className="mono">{student.matric_no}</td></tr>
            {student.section && <tr><th>Section</th><td>{student.section}</td></tr>}
            <tr><th>Group</th><td>{student.group_name || <span className="muted">Not assigned yet</span>}</td></tr>
            <tr><th>Business</th><td>{student.business_name || <span className="muted">—</span>}</td></tr>
            <tr><th>Business idea</th><td>{student.business_idea || <span className="muted">—</span>}</td></tr>
            <tr><th>Assigned component</th><td>{student.component ? <Badge tone="gold">{student.component}</Badge> : <span className="muted">Not assigned yet</span>}</td></tr>
          </tbody></table>
        </section>
        <section className="card">
          <h3>Assessments</h3>
          {!assessments.length && <p className="muted">No assessment is available yet.</p>}
          <div className="stack">
            {assessments.map((a) => <AssessmentCard key={a.assessment_id} a={a} student={student} />)}
          </div>
        </section>
      </div>
    </>
  );
}

function AssessmentCard({ a, student }) {
  const t = a.attempt;
  const status = t?.status || 'not_started';
  const canEnter = a.is_open_now && (!t || t.status === 'in_progress');
  const blocked = !student.group_id || !student.component;
  return (
    <div className="card flat">
      <div className="row between"><h4 style={{ margin: 0 }}>{a.title}</h4><Badge status={status} /></div>
      <p className="small muted" style={{ margin: '.25rem 0' }}>{a.course_code} {a.course_name} · {a.semester} · Duration {a.duration_minutes} min{a.camera_required ? ' · Camera required' : ''}</p>
      {a.description && <p className="small">{a.description}</p>}
      <table className="table small"><tbody>
        <tr><th>Assessment status</th><td>{a.is_open_now ? <Badge tone="ok">Open</Badge> : <Badge>{a.status === 'open' ? 'Outside time window' : a.status}</Badge>}{a.start_at && <span className="muted"> · {fmtDateTime(a.start_at)} → {fmtDateTime(a.end_at)}</span>}</td></tr>
        <tr><th>Submission</th><td>{t?.submitted_at ? `Submitted ${fmtDateTime(t.submitted_at)}${t.status === 'auto_submitted' ? ' (time expired)' : ''}` : t ? 'In progress' : 'Not started'}</td></tr>
        {t?.status === 'in_progress' && <tr><th>Remaining time</th><td className="mono">{fmtDuration(t.remaining_seconds)}</td></tr>}
        {t && ['submitted', 'auto_submitted'].includes(t.status) && <tr><th>Marks</th><td>{a.results_released && t.marking_status === 'finalised' ? <Link to={`/student/assessments/${a.assessment_id}`}>View marks and feedback</Link> : <span className="muted">Not released yet</span>}</td></tr>}
      </tbody></table>
      {blocked && a.is_open_now && !t && <Alert tone="warn">You cannot start until your lecturer assigns you to a group and a business component.</Alert>}
      <div className="row end mt-sm">
        {canEnter && !blocked && <Link className="btn primary" to={`/student/assessments/${a.assessment_id}`}>{t ? 'Continue assessment' : 'Open assessment'}</Link>}
        {t && !canEnter && <Link className="btn" to={`/student/assessments/${a.assessment_id}`}>View submission</Link>}
      </div>
    </div>
  );
}
