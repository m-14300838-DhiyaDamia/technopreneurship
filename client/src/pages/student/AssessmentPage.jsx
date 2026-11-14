import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { get, post, ApiError, runtime } from '../../api/client.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import { useSocket } from '../../hooks/useSocket.js';
import { useCamera, useFaceDetection } from '../../hooks/useCamera.js';
import { useProctoring } from '../../hooks/useProctoring.js';
import { AssessmentTimer } from '../../components/AssessmentTimer.jsx';
import { AnswerEditor } from '../../components/AnswerEditor.jsx';
import { PrivacyNotice } from '../../components/PrivacyNotice.jsx';
import { Alert, Badge, Confirm, ErrorBox, SafeHtml, Spinner, useToast } from '../../components/ui.jsx';
import { fmtDateTime, labelize } from '../../utils/format.js';

const DRAFT_KEY = (a, s) => `tfa.drafts.${a}.${s}`;
const AUTOSAVE_MS = 2000;

export default function AssessmentPage() {
  const { id: assessmentId } = useParams();
  const { user, meta } = useAuth();
  const toast = useToast();
  const [ctx, setCtx] = useState(null);
  const [error, setError] = useState(null);
  const [offsetMs, setOffsetMs] = useState(0);
  const load = useCallback(async () => {
    try {
      const data = await get(`/student/assessments/${assessmentId}`);
      setOffsetMs(Date.parse(data.server_time) - Date.now());
      setCtx(data); setError(null);
      return data;
    } catch (e) { setError(e); return null; }
  }, [assessmentId]);
  useEffect(() => { load(); }, [load]);
  // Without a realtime server, poll occasionally so a lecturer's "reopen" is noticed.
  const attemptStatus = ctx?.assessment?.attempt?.status || 'none';
  useEffect(() => {
    if (runtime.mode !== 'apps-script' || attemptStatus === 'in_progress') return undefined;
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, [attemptStatus, load]);

  if (error) return <ErrorBox error={error} retry={load} />;
  if (!ctx) return <Spinner />;
  const attempt = ctx.assessment.attempt;
  if (!attempt) return <PreStart ctx={ctx} meta={meta} onStarted={load} />;
  if (attempt.status !== 'in_progress') return <SubmittedView ctx={ctx} />;
  return <ExamRoom key={attempt.attempt_id} ctx={ctx} user={user} meta={meta} offsetMs={offsetMs} reload={load} toast={toast} />;
}

/* -------------------------------------------------------------------------- */
function PreStart({ ctx, meta, onStarted }) {
  const a = ctx.assessment;
  const cam = useCamera();
  const videoRef = useRef(null);
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  useEffect(() => { if (videoRef.current && cam.stream) videoRef.current.srcObject = cam.stream; }, [cam.stream]);
  const cameraOk = !a.camera_required || cam.status === 'active';
  const start = async () => {
    setBusy(true); setErr(null);
    try { await post(`/student/assessments/${a.assessment_id}/start`); cam.stop(); await onStarted(); } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };
  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }} className="stack">
      <div className="page-head"><div><h1>{a.title}</h1><p>{a.course_code} {a.course_name} · {a.semester} · Duration: {a.duration_minutes} minutes</p></div><Link className="btn" to="/student">← Dashboard</Link></div>
      <section className="card">
        <h3>Your details</h3>
        <div className="grid grid-3 small">
          <div><span className="label">Name</span><br />{ctx.student.name}</div>
          <div><span className="label">Matric No</span><br /><span className="mono">{ctx.student.matric_no}</span></div>
          <div><span className="label">Group</span><br />{ctx.student.group_name}</div>
          <div><span className="label">Business</span><br />{ctx.student.business_name}</div>
          <div><span className="label">Assigned component</span><br /><Badge tone="gold">{ctx.student.component}</Badge></div>
          <div><span className="label">Questions</span><br />{ctx.questions.length}</div>
        </div>
      </section>
      {a.instructions && <section className="card"><h3>Instructions</h3><SafeHtml html={a.instructions} /></section>}
      <PrivacyNotice cameraRequired={a.camera_required} proctoringEnabled={a.proctoring_enabled} retentionDays={meta?.monitoring_retention_days} customText={meta?.privacy_notice} />
      {a.camera_required && (
        <section className="card">
          <h3>Camera check</h3>
          <p className="small">Camera access is required for this assessment. Click the button and allow camera access in your browser.</p>
          <div className="grid grid-2">
            <video ref={videoRef} className="cam-preview" autoPlay muted playsInline />
            <div className="stack">
              <div>Status: <Badge tone={cam.status === 'active' ? 'ok' : cam.status === 'idle' || cam.status === 'requesting' ? '' : 'bad'}>{labelize(cam.status)}</Badge></div>
              {cam.error && <p className="small muted">{cam.error}</p>}
              {cam.status === 'denied' && <Alert tone="warn">Camera access was blocked. Click the camera icon in your browser's address bar, allow access, then try again.</Alert>}
              {cam.status === 'unsupported' && <Alert tone="bad">This browser cannot access a camera. Please use a recent version of Chrome, Edge or Firefox.</Alert>}
              <button className="btn primary" onClick={cam.request} disabled={cam.status === 'requesting' || cam.status === 'unsupported'}>{cam.status === 'active' ? 'Camera enabled ✓' : 'Enable camera'}</button>
            </div>
          </div>
        </section>
      )}
      <section className="card">
        <label className="check"><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} /> I have read the monitoring and privacy notice and I am ready to start. The timer starts when I click Start.</label>
        {!a.is_open_now && <Alert tone="warn" className="mt">This assessment is not open at the moment.</Alert>}
        {err && <Alert tone="bad" className="mt">{err}</Alert>}
        <div className="form-actions"><button className="btn gold lg" disabled={!agree || !cameraOk || !a.is_open_now || busy} onClick={start}>{busy ? 'Starting…' : 'Start assessment'}</button></div>
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
function SubmittedView({ ctx }) {
  const a = ctx.assessment; const t = a.attempt;
  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }} className="stack">
      <div className="page-head"><div><h1>{a.title}</h1><p>Submission record</p></div><Link className="btn" to="/student">← Dashboard</Link></div>
      <Alert tone={t.status === 'auto_submitted' ? 'warn' : 'ok'} title={t.status === 'auto_submitted' ? 'Submitted automatically when time expired' : 'Your assessment has been submitted'}>
        Submitted at {fmtDateTime(t.submitted_at)}. Your answers are locked. {ctx.results ? 'Your marks are shown below.' : 'Marks and feedback will appear here once your lecturer releases them.'}
      </Alert>
      {ctx.results && (
        <section className="card">
          <div className="card-head"><h3>Results</h3><strong style={{ fontSize: '1.3rem' }}>{ctx.results.total_marks} / {ctx.results.max_marks}</strong></div>
          {ctx.results.lecturer_feedback && <><h4>Overall feedback</h4><SafeHtml html={ctx.results.lecturer_feedback} /></>}
        </section>
      )}
      {ctx.questions.map((q, i) => {
        const ans = ctx.answers.find((x) => x.question_id === q.question_id);
        const r = ctx.results?.per_question.find((x) => x.question_id === q.question_id);
        return (
          <section className="card" key={q.question_id}>
            <div className="row between"><h4>Question {i + 1} <span className="muted small">· {q.topic}</span></h4>{r && <Badge tone="navy">{r.marks ?? '—'} / {q.marks}</Badge>}</div>
            <SafeHtml html={q.question_text} className="rich question-text" />
            <div className="answer-box"><AnswerView question={q} answer={ans?.answer} /></div>
            {r?.lecturer_feedback && <><span className="label">Lecturer feedback</span><SafeHtml html={r.lecturer_feedback} /></>}
          </section>
        );
      })}
    </div>
  );
}

export function AnswerView({ question, answer }) {
  if (!answer) return <em className="muted">No answer given.</em>;
  if (question.question_type === 'multiple_choice') { const o = (question.options || []).find((x) => x.key === answer); return <span><strong>{answer}.</strong> {o?.text || ''}</span>; }
  if (['short_answer', 'numerical'].includes(question.question_type)) return <div style={{ whiteSpace: 'pre-wrap' }}>{answer}</div>;
  return <SafeHtml html={answer} />;
}

/* -------------------------------------------------------------------------- */
function ExamRoom({ ctx, user, meta, offsetMs, reload, toast }) {
  const a = ctx.assessment; const attempt = a.attempt; const student = ctx.student;
  const questions = ctx.questions;
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState(() => mergeDrafts(ctx, student));
  const dirty = useRef(new Set(Object.keys(answers).filter((k) => answers[k].dirty)));
  const [saveState, setSaveState] = useState({ state: 'idle', at: attempt.last_saved_at, message: '' });
  const [locked, setLocked] = useState(false);
  const [lockReason, setLockReason] = useState('');
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [viewer, setViewer] = useState(null); // lecturer currently viewing camera
  const timer = useRef(null);
  const saving = useRef(false);
  const { socketRef, connected, realtime } = useSocket(true);
  const [netOnline, setNetOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
  useEffect(() => {
    const on = () => setNetOnline(true); const off = () => setNetOnline(false);
    window.addEventListener('online', on); window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);
  const cam = useCamera();
  const videoRef = useRef(null);
  const pcRef = useRef(null);
  const { report } = useProctoring({ enabled: a.proctoring_enabled, assessmentId: a.assessment_id, socketRef });

  // ---- camera lifecycle --------------------------------------------------
  useEffect(() => { if (a.camera_required && cam.status === 'idle') cam.request(); }, [a.camera_required]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (videoRef.current) videoRef.current.srcObject = cam.stream || null; }, [cam.stream]);
  const prevCam = useRef(cam.status);
  useEffect(() => {
    const prev = prevCam.current; prevCam.current = cam.status;
    if (!a.camera_required || prev === cam.status) return;
    if (cam.status === 'active') report('CAMERA_ENABLED', 'Camera became active');
    else if (cam.status === 'denied') report('CAMERA_PERMISSION_REVOKED', 'Camera permission is denied or was revoked');
    else if (cam.status === 'disconnected') report('CAMERA_DISCONNECTED', 'Camera stream ended unexpectedly');
    else if (cam.status === 'idle' && prev === 'active') report('CAMERA_DISABLED', 'Camera was turned off');
  }, [cam.status, a.camera_required, report]);
  const face = useFaceDetection(videoRef, a.camera_required && cam.status === 'active', useCallback((n) => {
    if (n === 0) report('FACE_NOT_DETECTED', 'No face detected in camera frame', { throttleMs: 60000 });
    else if (n > 1) report('MULTIPLE_FACES_DETECTED', `${n} faces detected in camera frame`, { throttleMs: 60000 });
  }, [report]));

  // ---- presence + socket events --------------------------------------------
  useEffect(() => {
    const s = socketRef.current; if (!s) return undefined;
    const presence = () => s.emit('student:presence', { assessment_id: a.assessment_id, camera_status: a.camera_required ? cam.status : 'not_required', state: locked ? 'locked' : 'answering' });
    presence();
    const t = setInterval(presence, 15000);
    const onUpdate = ({ attempt: upd, reason }) => {
      if (reason === 'auto_submitted') { setLocked(true); setLockReason('Time expired. Your saved answers were submitted automatically.'); setTimeout(reload, 1500); }
      if (reason === 'reopened' || (upd?.status === 'in_progress' && locked)) { toast('Your lecturer has reopened your attempt', 'ok'); reload(); }
    };
    const onCameraRequest = async ({ from, lecturer_name }) => {
      const stream = cam.streamRef.current;
      if (!stream) { s.emit('camera:unavailable', { to: from, reason: 'Student camera is not active' }); return; }
      try {
        pcRef.current?.close();
        const pc = new RTCPeerConnection({ iceServers: meta?.ice_servers || [{ urls: 'stun:stun.l.google.com:19302' }] });
        pcRef.current = pc;
        stream.getTracks().forEach((tr) => pc.addTrack(tr, stream));
        pc.onicecandidate = (e) => e.candidate && s.emit('webrtc:ice', { to: from, candidate: e.candidate });
        pc.onconnectionstatechange = () => { if (['failed', 'closed', 'disconnected'].includes(pc.connectionState)) setViewer(null); };
        const offer = await pc.createOffer(); await pc.setLocalDescription(offer);
        s.emit('webrtc:offer', { to: from, sdp: pc.localDescription });
        setViewer(lecturer_name || 'Lecturer');
      } catch (err) { s.emit('camera:unavailable', { to: from, reason: err.message }); }
    };
    const onAnswer = async ({ sdp }) => { try { await pcRef.current?.setRemoteDescription(sdp); } catch { /* ignore */ } };
    const onIce = async ({ candidate }) => { try { await pcRef.current?.addIceCandidate(candidate); } catch { /* ignore */ } };
    const onStop = () => { pcRef.current?.close(); pcRef.current = null; setViewer(null); };
    s.on('attempt:update', onUpdate); s.on('camera:request', onCameraRequest); s.on('webrtc:answer', onAnswer); s.on('webrtc:ice', onIce); s.on('camera:stop', onStop);
    return () => { clearInterval(t); s.off('attempt:update', onUpdate); s.off('camera:request', onCameraRequest); s.off('webrtc:answer', onAnswer); s.off('webrtc:ice', onIce); s.off('camera:stop', onStop); };
  }, [socketRef, connected, a.assessment_id, a.camera_required, cam.status, locked, reload, toast, meta, cam.streamRef]);
  useEffect(() => () => { pcRef.current?.close(); }, []);

  // ---- heartbeat (REST fallback + time resync) ------------------------------
  const [deadline, setDeadline] = useState(attempt.deadline_at);
  const [offset, setOffset] = useState(offsetMs);
  useEffect(() => {
    const beat = async () => {
      try {
        const r = await post(`/student/assessments/${a.assessment_id}/heartbeat`, { camera_status: a.camera_required ? cam.status : 'not_required' });
        setOffset(Date.parse(r.server_time) - Date.now());
        if (r.attempt?.deadline_at) setDeadline(r.attempt.deadline_at);
        if (r.attempt && r.attempt.status !== 'in_progress') { setLocked(true); setLockReason('This attempt has been submitted.'); setTimeout(reload, 1000); }
      } catch { /* offline: ignore */ }
    };
    const t = setInterval(beat, runtime.heartbeatMs);
    return () => clearInterval(t);
  }, [a.assessment_id, a.camera_required, cam.status, reload]);

  // ---- answers, drafts and auto-save -------------------------------------------
  const persistDrafts = useCallback((map) => {
    try { localStorage.setItem(DRAFT_KEY(a.assessment_id, student.student_id), JSON.stringify(Object.fromEntries(Object.entries(map).map(([k, v]) => [k, { answer: v.answer, updated: v.updated }])))); } catch { /* ignore */ }
  }, [a.assessment_id, student.student_id]);

  const flush = useCallback(async () => {
    if (saving.current || locked) return;
    const ids = Array.from(dirty.current);
    if (!ids.length) return;
    saving.current = true; setSaveState((s) => ({ ...s, state: 'saving' }));
    try {
      const payload = ids.map((qid) => ({ question_id: qid, answer: answersRef.current[qid]?.answer ?? '' }));
      const r = await post(`/student/assessments/${a.assessment_id}/answers`, { answers: payload });
      ids.forEach((qid) => { if (answersRef.current[qid]?.answer === payload.find((p) => p.question_id === qid).answer) dirty.current.delete(qid); });
      setAnswers((m) => { const n = { ...m }; ids.forEach((qid) => { if (n[qid] && !dirty.current.has(qid)) n[qid] = { ...n[qid], dirty: false, saved: r.server_time }; }); return n; });
      setSaveState({ state: 'saved', at: r.server_time, message: '' });
      setOffset(Date.parse(r.server_time) - Date.now());
    } catch (err) {
      if (err instanceof ApiError && (err.code === 'TIME_EXPIRED' || err.code === 'LOCKED')) { setLocked(true); setLockReason(err.message); setTimeout(reload, 1500); }
      else setSaveState({ state: 'error', at: null, message: err.status === 0 ? 'Offline — answers are kept on this device and will sync when the connection returns.' : err.message });
    } finally { saving.current = false; }
  }, [a.assessment_id, locked, reload]);
  const answersRef = useRef(answers); answersRef.current = answers;

  const setAnswer = (qid, value) => {
    if (locked) return;
    setAnswers((m) => { const n = { ...m, [qid]: { answer: value, dirty: true, updated: Date.now() } }; persistDrafts(n); return n; });
    dirty.current.add(qid);
    setSaveState((s) => ({ ...s, state: 'dirty' }));
    clearTimeout(timer.current);
    timer.current = setTimeout(flush, runtime.autosaveMs || AUTOSAVE_MS);
  };
  useEffect(() => { // retry loop for failed saves / reconnection
    const t = setInterval(() => { if (dirty.current.size && !saving.current) flush(); }, 10000);
    const online = () => flush();
    window.addEventListener('online', online);
    return () => { clearInterval(t); window.removeEventListener('online', online); clearTimeout(timer.current); };
  }, [flush]);
  useEffect(() => { if (dirty.current.size) flush(); }, []); // sync drafts restored from this device // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const warn = (e) => { if (dirty.current.size) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, []);

  const onExpire = useCallback(async () => { setLocked(true); setLockReason('Time is up. Saving your latest answers…'); await flush(); setTimeout(reload, 1200); }, [flush, reload]);

  const submit = async () => {
    clearTimeout(timer.current);
    await flush();
    if (dirty.current.size) { toast('Some answers could not be saved. Check your connection and try again.', 'bad'); setConfirmSubmit(false); return; }
    try { await post(`/student/assessments/${a.assessment_id}/submit`); try { localStorage.removeItem(DRAFT_KEY(a.assessment_id, student.student_id)); } catch { /* ignore */ } cam.stop(); await reload(); }
    catch (err) { toast(err.message, 'bad'); setConfirmSubmit(false); }
  };

  const q = questions[index];
  const answered = questions.filter((qq) => (answers[qq.question_id]?.answer || '').trim()).length;
  const camTone = !a.camera_required ? '' : cam.status === 'active' ? 'ok' : 'bad';

  return (
    <>
      {viewer && <div className="viewing-banner mb">👁 {viewer} is currently viewing your camera feed (live only, not recorded).</div>}
      {locked && <Alert tone="warn" title="Attempt locked">{lockReason}</Alert>}
      <div className="exam">
        <aside className="exam-nav card">
          <h4>Questions</h4>
          <div className="qlist">
            {questions.map((qq, i) => {
              const st = answers[qq.question_id];
              return <button key={qq.question_id} className={`qbtn ${i === index ? 'active' : ''}`} onClick={() => setIndex(i)}><span>Q{i + 1} <span className="muted tiny">{qq.topic}</span></span><span className={`state ${st?.dirty ? 'dirty' : (st?.answer || '').trim() ? 'answered' : ''}`} /></button>;
            })}
          </div>
          <p className="tiny muted mt-sm">{answered} of {questions.length} answered. Grey = empty, amber = unsaved, green = saved.</p>
        </aside>

        <section className="card" aria-live="polite">
          {q ? (
            <>
              <div className="row between"><h3>Question {index + 1} of {questions.length}</h3><div className="row"><Badge>{q.section}</Badge><Badge tone="navy">{q.marks} marks</Badge></div></div>
              <p className="small muted">Topic: {q.topic} · {labelize(q.question_type)}{q.time_limit ? ` · Suggested time ${q.time_limit} min` : ''}</p>
              <SafeHtml html={q.question_text} className="rich question-text" />
              {q.guidance && <div className="alert info small"><SafeHtml html={q.guidance} /></div>}
              <div className="mt">
                <AnswerEditor question={q} value={answers[q.question_id]?.answer || ''} disabled={locked} onChange={(v) => setAnswer(q.question_id, v)} onLargePaste={(n) => report('LARGE_PASTE_DETECTED', `Pasted ${n} characters into Q${index + 1}`)} />
              </div>
            </>
          ) : <p>No questions have been assigned to your component yet.</p>}
        </section>

        <aside className="exam-side">
          <div className="card">
            <span className="label">Remaining time</span>
            <AssessmentTimer deadlineAt={deadline} offsetMs={offset} onExpire={onExpire} running={!locked} />
            <p className="tiny muted" style={{ textAlign: 'center', margin: 0 }}>Server-controlled timer</p>
          </div>
          <div className="card small">
            <div><strong>{student.name}</strong></div>
            <div className="mono">{student.matric_no}</div>
            <div className="muted">{student.group_name} · {student.business_name}</div>
            <div className="mt-sm"><Badge tone="gold">{student.component}</Badge></div>
          </div>
          <div className="card small">
            <div className="row between"><span className="label">Camera</span><Badge tone={camTone}>{a.camera_required ? labelize(cam.status) : 'Not required'}</Badge></div>
            {a.camera_required && <>
              <video ref={videoRef} className="cam-preview mt-sm" autoPlay muted playsInline />
              {cam.status !== 'active' && <button className="btn sm block mt-sm" onClick={cam.request}>Re-enable camera</button>}
              <p className="tiny muted mt-sm">Live status only. {face.supported ? 'Face presence check active.' : 'Face detection is not supported by this browser.'}</p>
            </>}
          </div>
          <div className="card small">
            <div className="row between"><span className="label">Connection</span><span><span className={`dot ${(realtime ? connected : netOnline) ? 'live' : 'off'}`} /> {realtime ? (connected ? 'Online' : 'Reconnecting…') : (netOnline ? `Online · sync every ${Math.round(runtime.autosaveMs / 1000)}s` : 'Offline')}</span></div>
            <div className="row between mt-sm"><span className="label">Status</span><Badge status={locked ? 'submitted' : 'in_progress'}>{locked ? 'Locked' : 'In progress'}</Badge></div>
          </div>
        </aside>
      </div>

      <div className="exam-footer">
        <div className="row">
          <button className="btn" onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0}>← Previous</button>
          <button className="btn" onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))} disabled={index >= questions.length - 1}>Next →</button>
        </div>
        <SaveStatus s={saveState} />
        <div className="row">
          <button className="btn" onClick={flush} disabled={locked || saveState.state === 'saving' || !dirty.current.size}>Save now</button>
          <button className="btn gold" onClick={() => setConfirmSubmit(true)} disabled={locked}>Submit assessment</button>
        </div>
      </div>

      {confirmSubmit && (
        <Confirm title="Submit your assessment?" confirmLabel="Yes, submit" tone="gold" onCancel={() => setConfirmSubmit(false)} onConfirm={submit}
          message={`You have answered ${answered} of ${questions.length} questions. After submitting you will not be able to change your answers.`}>
          {answered < questions.length && <Alert tone="warn">{questions.length - answered} question(s) have no answer.</Alert>}
        </Confirm>
      )}
    </>
  );
}

function SaveStatus({ s }) {
  const map = { idle: ['', s.at ? `Last saved ${fmtDateTime(s.at)}` : 'Not saved yet'], dirty: ['saving', 'Unsaved changes…'], saving: ['saving', 'Saving…'], saved: ['saved', `Saved ${new Date(s.at).toLocaleTimeString()}`], error: ['error', s.message || 'Save failed'] };
  const [cls, text] = map[s.state] || ['', ''];
  return <span className={`save-state ${cls}`} role="status">{text}</span>;
}

/** Merge server answers with locally kept drafts (newer local drafts win and are re-synced). */
function mergeDrafts(ctx, student) {
  const map = {};
  for (const a of ctx.answers) map[a.question_id] = { answer: a.answer || '', dirty: false, saved: a.timestamp, updated: Date.parse(a.timestamp) || 0 };
  try {
    const local = JSON.parse(localStorage.getItem(DRAFT_KEY(ctx.assessment.assessment_id, student.student_id)) || '{}');
    for (const [qid, d] of Object.entries(local)) {
      if (!ctx.questions.some((q) => q.question_id === qid)) continue;
      const serverUpdated = map[qid]?.updated || 0;
      if (d.updated > serverUpdated && d.answer !== map[qid]?.answer) map[qid] = { answer: d.answer, dirty: true, updated: d.updated };
    }
  } catch { /* ignore */ }
  return map;
}
