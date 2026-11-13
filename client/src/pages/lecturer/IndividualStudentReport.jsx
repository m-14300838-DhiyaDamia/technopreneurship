import { Link, useParams } from 'react-router-dom';
import { get } from '../../api/client.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import { Badge, ErrorBox, SafeHtml, Spinner, useAsync } from '../../components/ui.jsx';
import { DocFooter, DocHeader, PrintBar } from '../../components/DocHeader.jsx';
import { AnswerView } from '../student/AssessmentPage.jsx';
import { fmtDateTime, labelize } from '../../utils/format.js';

export default function IndividualStudentReport() {
  const { attemptId } = useParams();
  const { meta } = useAuth();
  const { data, loading, error, reload } = useAsync(() => get(`/lecturer/reports/individual/${attemptId}`), [attemptId]);
  if (loading) return <Spinner />;
  if (error) return <ErrorBox error={error} retry={reload} />;
  const { student, attempt, assessment, items, totals, monitoring } = data;
  const pct = totals.max_marks ? Math.round((totals.total_marks / totals.max_marks) * 1000) / 10 : null;
  return (
    <>
      <PrintBar><Link className="btn" to="/lecturer/reports">← Reports</Link><Link className="btn" to={`/lecturer/marking/${attemptId}`}>Marking</Link>{attempt.marking_status !== 'finalised' && <Badge tone="warn">Marks not finalised — report is provisional</Badge>}</PrintBar>
      <article className="doc">
        <DocHeader branding={meta?.course} title="Individual Student Assessment Report" subtitle={`${assessment.title} · ${assessment.course_code} ${assessment.course_name} · Semester ${assessment.semester}`} />
        <div className="doc-meta">
          <div><span>Student name</span>{student.name}</div><div><span>Matric number</span>{student.matric_no}</div>
          <div><span>Group</span>{student.group_name || '—'}</div><div><span>Business</span>{student.business_name || '—'}</div>
          <div><span>Assigned component</span>{attempt.component || student.component || '—'}</div><div><span>Attempt status</span>{labelize(attempt.status)}</div>
          <div><span>Started</span>{fmtDateTime(attempt.started_at)}</div><div><span>Submitted</span>{fmtDateTime(attempt.submitted_at)}{attempt.status === 'auto_submitted' ? ' (time expired)' : ''}</div>
          <div><span>Marking status</span>{labelize(attempt.marking_status)}</div><div><span>Total mark</span><strong style={{ fontSize: '1.2rem' }}>{totals.total_marks} / {totals.max_marks}{pct !== null ? ` (${pct}%)` : ''}</strong></div>
        </div>
        {items.map((it) => (
          <section className="doc-section" key={it.question.question_id}>
            <h2>Question {it.number} <span className="small muted" style={{ fontWeight: 400 }}>· {it.question.section} · {it.question.topic}</span></h2>
            <SafeHtml html={it.question.question_text} className="rich small" />
            <div className="answer-box"><strong className="small">Student answer</strong><AnswerView question={it.question} answer={it.answer?.answer} /></div>
            <div className="row between"><strong>Marks: {it.answer?.marks ?? '—'} / {it.question.marks}</strong></div>
            {it.answer?.lecturer_feedback && <div className="small"><strong>Lecturer feedback:</strong><SafeHtml html={it.answer.lecturer_feedback} className="rich small" /></div>}
          </section>
        ))}
        {attempt.lecturer_feedback && <section className="doc-section"><h2>Overall feedback</h2><SafeHtml html={attempt.lecturer_feedback} /></section>}
        <section className="doc-section">
          <h2>Monitoring summary</h2>
          <p className="small">{monitoring.flagged_events} monitoring event(s) recorded ({monitoring.pending_review} pending lecturer review). Events are observable browser/session signals for lecturer review and do not by themselves indicate misconduct.</p>
          {Object.keys(monitoring.by_type).length > 0 && <ul className="small">{Object.entries(monitoring.by_type).map(([k, v]) => <li key={k}>{k.replace(/_/g, ' ')}: {v}</li>)}</ul>}
        </section>
        <div className="row between small mt"><div>Lecturer signature: ______________________</div><div>Date: ______________</div></div>
        <DocFooter note={`Report generated ${fmtDateTime(data.branding.generated_at)}. Marking status: ${labelize(attempt.marking_status)}.`} />
      </article>
    </>
  );
}
