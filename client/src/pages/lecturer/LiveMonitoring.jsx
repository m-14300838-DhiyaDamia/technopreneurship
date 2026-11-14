import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { get, patch, runtime } from '../../api/client.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import { useSocket } from '../../hooks/useSocket.js';
import { Alert, Badge, Empty, ErrorBox, Modal, Spinner, Tabs, useAsync, useToast } from '../../components/ui.jsx';
import { fmtDateTime, fmtDuration, labelize, timeAgo } from '../../utils/format.js';

export default function LiveMonitoring() {
  const [assessmentId, setAssessmentId] = useState('');
  const assessments = useAsync(() => get('/lecturer/assessments'));
  const aid = assessmentId || assessments.data?.assessments?.[0]?.assessment_id;
  const mon = useAsync(() => (aid ? get(`/lecturer/assessments/${aid}/monitoring`) : Promise.resolve(null)), [aid]);
  const [presence, setPresence] = useState({});
  const [liveEvents, setLiveEvents] = useState([]);
  const [view, setView] = useState('table');
  const [camStudent, setCamStudent] = useState(null);
  const [filter, setFilter] = useState('');
  const { socketRef, connected, realtime } = useSocket(true);
  const [, setTick] = useState(0);

  useEffect(() => { const t = setInterval(() => setTick((x) => x + 1), 1000); return () => clearInterval(t); }, []);
  useEffect(() => { const t = setInterval(() => mon.reload(), runtime.pollMs); return () => clearInterval(t); }, [mon.reload]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const s = socketRef.current; if (!s) return undefined;
    const onSnap = ({ presence: p }) => setPresence(p || {});
    const onPresence = (p) => setPresence((m) => ({ ...m, [p.student_id]: p }));
    const onAttempt = ({ attempt }) => mon.setData((d) => (d ? { ...d, students: d.students.map((st) => (st.student_id === attempt.student_id ? { ...st, attempt_id: attempt.attempt_id, attempt_status: attempt.status, deadline_at: attempt.deadline_at, last_activity_at: attempt.last_activity_at, camera_status: attempt.camera_status, submitted_at: attempt.submitted_at, marking_status: attempt.marking_status } : st)) } : d));
    const onEvent = ({ event }) => { setLiveEvents((e) => [event, ...e].slice(0, 100)); if (event.severity !== 'info') mon.setData((d) => (d ? { ...d, students: d.students.map((st) => (st.student_id === event.student_id ? { ...st, flags: (st.flags || 0) + 1 } : st)) } : d)); };
    s.on('monitor:snapshot', onSnap); s.on('monitor:presence', onPresence); s.on('monitor:attempt', onAttempt); s.on('monitor:event', onEvent);
    return () => { s.off('monitor:snapshot', onSnap); s.off('monitor:presence', onPresence); s.off('monitor:attempt', onAttempt); s.off('monitor:event', onEvent); };
  }, [socketRef, connected]); // eslint-disable-line react-hooks/exhaustive-deps

  const rows = useMemo(() => {
    if (!mon.data) return [];
    const q = filter.toLowerCase();
    // Without a realtime server, presence is derived from the heartbeat stored on the attempt.
    const derived = (s) => (realtime ? undefined : { online: s.attempt_status === 'in_progress' && s.last_activity_at && Date.now() - Date.parse(s.last_activity_at) < 90000, camera_status: s.camera_status, state: 'answering', last_seen: s.last_activity_at });
    return mon.data.students.map((s) => ({ ...s, live: presence[s.student_id] || derived(s) })).filter((s) => !q || s.name.toLowerCase().includes(q) || (s.group_name || '').toLowerCase().includes(q))
      .sort((a, b) => Number(b.attempt_status === 'in_progress') - Number(a.attempt_status === 'in_progress') || (a.group_name || '').localeCompare(b.group_name || ''));
  }, [mon.data, presence, filter, realtime]);

  if (assessments.loading) return <Spinner />;
  if (assessments.error) return <ErrorBox error={assessments.error} retry={assessments.reload} />;
  if (!aid) return <Empty>Create an assessment first.</Empty>;
  const events = [...liveEvents, ...(mon.data?.events || [])].filter((e, i, arr) => arr.findIndex((x) => x.log_id === e.log_id) === i).slice(0, 150);
  const active = rows.filter((r) => r.attempt_status === 'in_progress').length;

  return (
    <>
      <div className="page-head"><div><h1>Live assessment monitoring</h1><p>{active} student(s) currently answering · {realtime ? <>Live updates {connected ? <Badge tone="ok">connected</Badge> : <Badge tone="bad">reconnecting</Badge>}</> : <Badge tone="info">Refreshes every {Math.round(runtime.pollMs / 1000)} s</Badge>}</p></div>
        <div className="row">
          <select value={aid} onChange={(e) => setAssessmentId(e.target.value)} aria-label="Assessment">{assessments.data.assessments.map((a) => <option key={a.assessment_id} value={a.assessment_id}>{a.title}</option>)}</select>
          <input type="search" placeholder="Filter by name or group" value={filter} onChange={(e) => setFilter(e.target.value)} />
          <button className="btn" onClick={mon.reload}>Refresh</button>
        </div></div>
      <Alert tone="info">Monitoring events are <strong>potential monitoring events</strong> for your review, not automatic findings of misconduct. A browser cannot see other devices, screens or applications; see the README for limitations.</Alert>
      <Tabs value={view} onChange={setView} tabs={[{ value: 'table', label: 'Status table' }, { value: 'grid', label: 'Camera status grid' }, { value: 'events', label: `Monitoring events (${events.length})` }]} />
      {mon.loading && !mon.data ? <Spinner /> : mon.error ? <ErrorBox error={mon.error} retry={mon.reload} /> : (
        <>
          {view === 'table' && (
            <div className="table-wrap"><table className="table"><thead><tr><th>Student</th><th>Matric</th><th>Group</th><th>Business</th><th>Connection</th><th>Camera</th><th>Assessment status</th><th>Time remaining</th><th>Last activity</th><th>Flags</th><th></th></tr></thead>
              <tbody>{rows.map((s) => <Row key={s.student_id} s={s} realtime={realtime} onCamera={() => setCamStudent(s)} />)}</tbody></table></div>
          )}
          {view === 'grid' && (
            <div className="mon-grid">{rows.filter((r) => r.attempt_status === 'in_progress' || r.live?.online).map((s) => (
              <div key={s.student_id} className="mon-card" onClick={() => realtime && setCamStudent(s)} role="button" tabIndex={0} title={realtime ? 'Open live camera view' : 'Camera status only in this edition'}>
                <div className="row between"><span className="name">{s.name}</span><span className={`dot ${s.live?.online ? 'live' : 'off'}`} /></div>
                <div className="meta">{s.group_name} · {s.component}</div>
                <div className="row mt-sm"><CamBadge status={s.live?.camera_status || s.camera_status} /><Badge status={s.attempt_status} /></div>
                <div className="meta mt-sm">{s.attempt_status === 'in_progress' ? `⏱ ${fmtDuration((Date.parse(s.deadline_at) - Date.now()) / 1000)}` : ''} {s.flags ? `· ${s.flags} flag(s)` : ''}</div>
              </div>))}
              {!rows.some((r) => r.attempt_status === 'in_progress' || r.live?.online) && <Empty>No student is currently active.</Empty>}
            </div>
          )}
          {view === 'events' && <EventsTable events={events} onReviewed={(ev) => { setLiveEvents((l) => l.map((x) => (x.log_id === ev.log_id ? ev : x))); mon.setData((d) => (d ? { ...d, events: d.events.map((x) => (x.log_id === ev.log_id ? ev : x)) } : d)); }} />}
        </>
      )}
      {camStudent && <CameraViewer student={camStudent} socketRef={socketRef} onClose={() => setCamStudent(null)} />}
    </>
  );
}

function Row({ s, realtime, onCamera }) {
  const remaining = s.attempt_status === 'in_progress' && s.deadline_at ? Math.max(0, (Date.parse(s.deadline_at) - Date.now()) / 1000) : null;
  return (
    <tr>
      <td>{s.name}</td><td className="mono">{s.matric_no}</td><td>{s.group_name || '—'}</td><td className="small">{s.business_name}</td>
      <td><span className={`dot ${s.live?.online ? 'live' : 'off'}`} /> {s.live?.online ? 'LIVE' : 'Offline'}</td>
      <td><CamBadge status={s.live?.camera_status || s.camera_status} /></td>
      <td><Badge status={s.attempt_status} />{s.attempt_status === 'in_progress' && s.live?.state && <span className="tiny muted"> · {labelize(s.live.state)}</span>}</td>
      <td className="mono">{remaining !== null ? fmtDuration(remaining) : '—'}</td>
      <td className="small muted">{timeAgo(s.live?.last_seen || s.last_activity_at)}</td>
      <td>{s.flags ? <Badge tone="warn">{s.flags} flag{s.flags > 1 ? 's' : ''}</Badge> : <span className="muted">0 flags</span>}</td>
      <td className="actions"><button className="btn sm" onClick={onCamera} disabled={!realtime || !s.live?.online} title={realtime ? '' : 'Live camera view needs the Node realtime server; this edition shows camera status only'}>View camera</button> {s.attempt_id && <Link className="btn sm ghost" to={`/lecturer/marking/${s.attempt_id}`}>Answers</Link>}</td>
    </tr>
  );
}

export function CamBadge({ status }) {
  const tone = status === 'active' ? 'ok' : ['denied', 'disconnected', 'unavailable', 'unsupported'].includes(status) ? 'bad' : status === 'not_required' ? '' : 'warn';
  return <Badge tone={tone}>{status === 'active' ? 'Camera on' : labelize(status || 'unknown')}</Badge>;
}

function EventsTable({ events, onReviewed }) {
  const toast = useToast();
  const [sev, setSev] = useState('');
  const review = async (ev, review_status) => {
    const note = review_status === 'escalated' ? window.prompt('Note for this event (optional):') || '' : '';
    try { const r = await patch(`/lecturer/monitoring/events/${ev.log_id}`, { review_status, review_note: note }); onReviewed({ ...ev, ...r.event }); } catch (e) { toast(e.message, 'bad'); }
  };
  const list = events.filter((e) => !sev || e.severity === sev);
  return (
    <>
      <div className="row mb"><select value={sev} onChange={(e) => setSev(e.target.value)} aria-label="Severity"><option value="">All severities</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option><option value="info">Info</option></select><span className="muted small">{list.length} events (latest 150)</span></div>
      {!list.length ? <Empty>No monitoring events.</Empty> : (
        <div className="table-wrap"><table className="table"><thead><tr><th>Time</th><th>Student</th><th>Group</th><th>Event</th><th>Severity</th><th>Description</th><th>Review</th><th></th></tr></thead>
          <tbody>{list.map((e) => (
            <tr key={e.log_id}><td className="small nowrap">{fmtDateTime(e.timestamp)}</td><td>{e.student_name}<div className="tiny mono muted">{e.matric_no}</div></td><td>{e.group_name}</td><td className="mono small">{e.event_type}</td><td><Badge status={e.severity} /></td><td className="small">{e.description}{e.review_note && <div className="tiny muted">Note: {e.review_note}</div>}</td><td><Badge status={e.review_status} /></td>
              <td className="actions">{e.review_status === 'pending' && e.severity !== 'info' && <><button className="btn sm" onClick={() => review(e, 'reviewed')}>Reviewed</button> <button className="btn sm ghost" onClick={() => review(e, 'dismissed')}>Dismiss</button> <button className="btn sm ghost" onClick={() => review(e, 'escalated')}>Escalate</button></>}</td></tr>))}</tbody></table></div>
      )}
    </>
  );
}

/** One-to-one live view of a student's camera over WebRTC. Nothing is recorded. */
function CameraViewer({ student, socketRef, onClose }) {
  const { meta } = useAuth();
  const videoRef = useRef(null);
  const pcRef = useRef(null);
  const [state, setState] = useState('Requesting camera from student…');
  const [failed, setFailed] = useState(false);

  const stop = useCallback(() => { socketRef.current?.emit('camera:stop', { student_id: student.student_id }); pcRef.current?.close(); pcRef.current = null; }, [socketRef, student.student_id]);

  useEffect(() => {
    const s = socketRef.current; if (!s) { setState('Not connected to the realtime server'); setFailed(true); return undefined; }
    let from = null;
    const onOffer = async ({ from: f, student_id, sdp }) => {
      if (student_id !== student.student_id) return;
      from = f;
      try {
        const pc = new RTCPeerConnection({ iceServers: meta?.ice_servers || [{ urls: 'stun:stun.l.google.com:19302' }] });
        pcRef.current = pc;
        pc.ontrack = (e) => { if (videoRef.current) videoRef.current.srcObject = e.streams[0]; setState('Live'); };
        pc.onicecandidate = (e) => e.candidate && s.emit('webrtc:ice', { to: from, candidate: e.candidate });
        pc.onconnectionstatechange = () => { if (pc.connectionState === 'failed') { setState('Connection failed. A TURN server may be required on this network (see README).'); setFailed(true); } else if (pc.connectionState === 'disconnected') setState('Student disconnected'); };
        await pc.setRemoteDescription(sdp);
        const answer = await pc.createAnswer(); await pc.setLocalDescription(answer);
        s.emit('webrtc:answer', { to: from, sdp: pc.localDescription });
        setState('Connecting…');
      } catch (err) { setState(`Error: ${err.message}`); setFailed(true); }
    };
    const onIce = async ({ candidate }) => { try { await pcRef.current?.addIceCandidate(candidate); } catch { /* ignore */ } };
    const onUnavailable = ({ student_id, reason }) => { if (student_id === student.student_id) { setState(`Camera unavailable: ${reason}`); setFailed(true); } };
    const onEnded = ({ student_id }) => { if (student_id === student.student_id) setState('Student disconnected'); };
    s.on('webrtc:offer', onOffer); s.on('webrtc:ice', onIce); s.on('camera:unavailable', onUnavailable); s.on('camera:ended', onEnded);
    s.emit('camera:request', { student_id: student.student_id });
    const timeout = setTimeout(() => setState((st) => (st.startsWith('Requesting') ? 'No response from the student browser (it may be offline or the camera is off).' : st)), 12000);
    return () => { clearTimeout(timeout); s.off('webrtc:offer', onOffer); s.off('webrtc:ice', onIce); s.off('camera:unavailable', onUnavailable); s.off('camera:ended', onEnded); stop(); };
  }, [socketRef, student.student_id, meta, stop]);

  return (
    <Modal title={`Live camera — ${student.name}`} size="lg" onClose={onClose}>
      <p className="small muted">{student.matric_no} · {student.group_name} · {student.component}. The student sees a notice that you are viewing. Live view only; nothing is recorded.</p>
      <video ref={videoRef} className="video-box" autoPlay playsInline muted />
      <p className={`small mt-sm ${failed ? '' : 'muted'}`} style={failed ? { color: 'var(--danger)' } : undefined}>{state}</p>
    </Modal>
  );
}
