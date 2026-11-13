import { useCallback, useEffect, useRef } from 'react';
import { post } from '../api/client.js';

const QUEUE_KEY = (id) => `tfa.events.${id}`;
const IDLE_MS = 5 * 60 * 1000;

/**
 * Observes browser/session events during an attempt and reports them as
 * monitoring events (evidence for the lecturer; never an accusation).
 * Events are sent over the socket when connected, else via REST, and are
 * queued in localStorage while offline.
 */
export function useProctoring({ enabled, assessmentId, socketRef }) {
  const lastSent = useRef({});
  const idleTimer = useRef(null);
  const hiddenAt = useRef(0);

  const flushQueue = useCallback(async () => {
    let queue = [];
    try { queue = JSON.parse(localStorage.getItem(QUEUE_KEY(assessmentId)) || '[]'); } catch { queue = []; }
    if (!queue.length) return;
    const remaining = [];
    for (const ev of queue) {
      try { await post(`/student/assessments/${assessmentId}/events`, ev); } catch { remaining.push(ev); }
    }
    try { localStorage.setItem(QUEUE_KEY(assessmentId), JSON.stringify(remaining)); } catch { /* ignore */ }
  }, [assessmentId]);

  const report = useCallback((event_type, description = '', { throttleMs = 0 } = {}) => {
    if (!enabled) return;
    const now = Date.now();
    if (throttleMs && now - (lastSent.current[event_type] || 0) < throttleMs) return;
    lastSent.current[event_type] = now;
    const payload = { event_type, description: String(description).slice(0, 500), client_time: new Date().toISOString() };
    const socket = socketRef?.current;
    const viaRest = () => post(`/student/assessments/${assessmentId}/events`, payload).catch(() => {
      try { const q = JSON.parse(localStorage.getItem(QUEUE_KEY(assessmentId)) || '[]'); q.push(payload); localStorage.setItem(QUEUE_KEY(assessmentId), JSON.stringify(q.slice(-200))); } catch { /* ignore */ }
    });
    if (socket?.connected) socket.timeout(4000).emit('student:event', { assessment_id: assessmentId, ...payload }, (err, ack) => { if (err || !ack?.ok) viaRest(); });
    else viaRest();
  }, [enabled, assessmentId, socketRef]);

  useEffect(() => {
    if (!enabled) return undefined;
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') { hiddenAt.current = Date.now(); report('TAB_SWITCH_DETECTED', 'The assessment tab was hidden (another tab or window became active)'); }
    };
    const onBlur = () => { if (Date.now() - hiddenAt.current > 1500) report('WINDOW_BLUR', 'The assessment window lost focus', { throttleMs: 5000 }); };
    const onFullscreen = () => report(document.fullscreenElement ? 'FULLSCREEN_ENTERED' : 'FULLSCREEN_EXIT', document.fullscreenElement ? 'Entered full screen' : 'Left full screen');
    const onOffline = () => report('CONNECTION_LOST', 'Browser reported offline');
    const onOnline = () => { report('CONNECTION_RESTORED', 'Browser reported online'); flushQueue(); };
    const resetIdle = () => {
      clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => report('LONG_IDLE_PERIOD', 'No keyboard or mouse activity for 5 minutes'), IDLE_MS);
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    document.addEventListener('fullscreenchange', onFullscreen);
    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);
    ['keydown', 'mousemove', 'mousedown', 'touchstart', 'scroll'].forEach((e) => window.addEventListener(e, resetIdle, { passive: true }));
    resetIdle();
    flushQueue();
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('fullscreenchange', onFullscreen);
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
      ['keydown', 'mousemove', 'mousedown', 'touchstart', 'scroll'].forEach((e) => window.removeEventListener(e, resetIdle));
      clearTimeout(idleTimer.current);
    };
  }, [enabled, report, flushQueue]);

  return { report };
}
