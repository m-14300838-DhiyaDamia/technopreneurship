/**
 * Realtime layer (Socket.IO):
 *  - students send presence heartbeats and monitoring events
 *  - lecturers receive live updates for the monitoring dashboard
 *  - WebRTC signalling so a lecturer can view ONE student's camera at a time
 *    (peer-to-peer; the server only relays SDP/ICE messages — no video passes
 *    through, and nothing is recorded)
 */
import { Server } from 'socket.io';
import { verifyToken } from '../auth/jwt.js';
import { getStore } from '../data/index.js';
import { getStudent } from '../services/students.js';
import { onAttemptChange, publicAttempt, recordActivity } from '../services/attempts.js';
import { onProctoringEvent, recordEvent } from '../services/proctoring.js';
import { PROCTORING_EVENT_TYPES } from '../services/templates.js';
import { logger } from '../lib/logger.js';

/** student_id -> { sockets:Set, camera_status, state, last_seen, assessment_id } */
const presence = new Map();
let io = null;

export function presenceSnapshot() {
  const out = {};
  for (const [id, p] of presence) out[id] = { online: p.sockets.size > 0, camera_status: p.camera_status, state: p.state, last_seen: p.last_seen, assessment_id: p.assessment_id };
  return out;
}

export function initRealtime(httpServer, corsOrigins) {
  io = new Server(httpServer, { cors: { origin: corsOrigins, credentials: false }, pingInterval: 10000, pingTimeout: 20000 });

  io.use((socket, next) => {
    try {
      const payload = verifyToken(socket.handshake.auth?.token || '');
      const user = getStore().get('Users', payload.sub);
      if (!user || !user.active) return next(new Error('unauthorized'));
      socket.data.user = { user_id: user.user_id, role: user.role, name: user.name, student_id: user.student_id || null };
      next();
    } catch {
      next(new Error('unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user;
    if (user.role === 'student') attachStudent(socket, user);
    else attachLecturer(socket, user);
  });

  onAttemptChange((attempt, reason) => {
    io.to('lecturers').emit('monitor:attempt', { attempt: { ...attempt, remaining_seconds: publicAttempt(attempt).remaining_seconds }, reason });
    if (['auto_submitted', 'reopened', 'submitted'].includes(reason)) io.to(`student:${attempt.student_id}`).emit('attempt:update', { attempt: publicAttempt(attempt), reason });
  });
  onProctoringEvent((log) => io.to('lecturers').emit('monitor:event', { event: log }));

  logger.info('Realtime (Socket.IO) ready');
  return io;
}

function attachStudent(socket, user) {
  const sid = user.student_id;
  if (!sid) { socket.disconnect(true); return; }
  socket.join(`student:${sid}`);
  const p = presence.get(sid) || { sockets: new Set(), camera_status: 'unknown', state: 'idle', last_seen: null, assessment_id: null };
  p.sockets.add(socket.id);
  p.last_seen = new Date().toISOString();
  presence.set(sid, p);
  broadcastPresence(sid);

  socket.on('student:presence', async (msg = {}) => {
    try {
      const student = getStudent(sid);
      p.camera_status = String(msg.camera_status || p.camera_status).slice(0, 40);
      p.state = String(msg.state || 'answering').slice(0, 40);
      p.last_seen = new Date().toISOString();
      p.assessment_id = msg.assessment_id || p.assessment_id;
      if (msg.assessment_id) await recordActivity(student, msg.assessment_id, { camera_status: p.camera_status });
      broadcastPresence(sid);
    } catch (err) { logger.debug('presence error', err.message); }
  });

  socket.on('student:event', async (msg = {}, ack) => {
    try {
      if (!PROCTORING_EVENT_TYPES.includes(msg.event_type)) throw new Error('Unknown event type');
      const student = getStudent(sid);
      const log = await recordEvent(student, { assessment_id: msg.assessment_id, event_type: msg.event_type, description: msg.description || '', client_time: msg.client_time });
      ack?.({ ok: true, log_id: log.log_id });
    } catch (err) { ack?.({ ok: false, error: err.message }); }
  });

  // WebRTC relay: student -> lecturer
  socket.on('webrtc:offer', ({ to, sdp }) => io.to(to).emit('webrtc:offer', { from: socket.id, student_id: sid, sdp }));
  socket.on('webrtc:ice', ({ to, candidate }) => io.to(to).emit('webrtc:ice', { from: socket.id, candidate }));
  socket.on('camera:unavailable', ({ to, reason }) => io.to(to).emit('camera:unavailable', { student_id: sid, reason }));

  socket.on('disconnect', () => {
    p.sockets.delete(socket.id);
    p.last_seen = new Date().toISOString();
    broadcastPresence(sid);
    io.to('lecturers').emit('camera:ended', { student_id: sid, reason: 'student disconnected' });
  });
}

function attachLecturer(socket, user) {
  socket.join('lecturers');
  socket.emit('monitor:snapshot', { presence: presenceSnapshot() });

  socket.on('camera:request', ({ student_id }) => {
    const p = presence.get(student_id);
    if (!p || !p.sockets.size) return socket.emit('camera:unavailable', { student_id, reason: 'Student is not connected' });
    const [target] = Array.from(p.sockets);
    io.to(target).emit('camera:request', { from: socket.id, lecturer_name: user.name });
  });
  socket.on('camera:stop', ({ student_id }) => {
    const p = presence.get(student_id);
    if (p) for (const s of p.sockets) io.to(s).emit('camera:stop', { from: socket.id });
  });
  socket.on('webrtc:answer', ({ to, sdp }) => io.to(to).emit('webrtc:answer', { from: socket.id, sdp }));
  socket.on('webrtc:ice', ({ to, candidate }) => io.to(to).emit('webrtc:ice', { from: socket.id, candidate }));
}

function broadcastPresence(student_id) {
  const p = presence.get(student_id);
  if (!p) return;
  io.to('lecturers').emit('monitor:presence', { student_id, online: p.sockets.size > 0, camera_status: p.camera_status, state: p.state, last_seen: p.last_seen, assessment_id: p.assessment_id });
}
