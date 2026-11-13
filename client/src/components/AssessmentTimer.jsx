import { useEffect, useState } from 'react';
import { fmtDuration } from '../utils/format.js';

/**
 * Server-controlled countdown. `deadlineAt` comes from the server; `offsetMs`
 * is (server time − browser time) measured on every server response so a wrong
 * browser clock cannot change the deadline.
 */
export function AssessmentTimer({ deadlineAt, offsetMs = 0, onExpire, running = true }) {
  const [remaining, setRemaining] = useState(() => calc(deadlineAt, offsetMs));
  useEffect(() => {
    if (!running || !deadlineAt) return undefined;
    const tick = () => {
      const r = calc(deadlineAt, offsetMs);
      setRemaining(r);
      if (r <= 0) { clearInterval(t); onExpire?.(); }
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [deadlineAt, offsetMs, running, onExpire]);
  const cls = remaining <= 60 ? 'bad' : remaining <= 5 * 60 ? 'warn' : '';
  return <div className={`timer ${cls}`} aria-live={remaining <= 60 ? 'assertive' : 'off'} aria-label="Remaining time">{fmtDuration(remaining)}</div>;
}

function calc(deadlineAt, offsetMs) {
  if (!deadlineAt) return 0;
  return Math.max(0, Math.floor((Date.parse(deadlineAt) - (Date.now() + offsetMs)) / 1000));
}
