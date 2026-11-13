import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Camera status values reported to the server:
 *  idle | requesting | active | denied | unavailable | disconnected | unsupported
 */
export function useCamera() {
  const [status, setStatus] = useState(typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia ? 'idle' : 'unsupported');
  const [error, setError] = useState(null);
  const streamRef = useRef(null);
  const [stream, setStream] = useState(null);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null; setStream(null);
    setStatus((s) => (s === 'unsupported' ? s : 'idle'));
  }, []);

  const request = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) { setStatus('unsupported'); return null; }
    setStatus('requesting'); setError(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }, audio: false });
      streamRef.current = s; setStream(s); setStatus('active');
      s.getVideoTracks().forEach((track) => {
        track.addEventListener('ended', () => { setStatus('disconnected'); streamRef.current = null; setStream(null); });
        track.addEventListener('mute', () => setStatus('disconnected'));
        track.addEventListener('unmute', () => setStatus('active'));
      });
      return s;
    } catch (err) {
      setError(err.message);
      setStatus(err.name === 'NotAllowedError' || err.name === 'SecurityError' ? 'denied' : err.name === 'NotFoundError' ? 'unavailable' : 'denied');
      return null;
    }
  }, []);

  // Detect permission revocation where the Permissions API supports it.
  useEffect(() => {
    let perm;
    (async () => {
      try {
        perm = await navigator.permissions?.query({ name: 'camera' });
        if (!perm) return;
        perm.onchange = () => { if (perm.state === 'denied') { setStatus('denied'); streamRef.current?.getTracks().forEach((t) => t.stop()); streamRef.current = null; setStream(null); } };
      } catch { /* not supported */ }
    })();
    return () => { if (perm) perm.onchange = null; };
  }, []);

  useEffect(() => () => streamRef.current?.getTracks().forEach((t) => t.stop()), []);

  return { status, error, stream, streamRef, request, stop };
}

/**
 * Face detection using the browser Shape Detection API (window.FaceDetector).
 * Most browsers do not ship it; when unavailable `supported` is false and no
 * events are produced. We never guess.
 */
export function useFaceDetection(videoRef, enabled, onResult, intervalMs = 8000) {
  const supported = typeof window !== 'undefined' && 'FaceDetector' in window;
  useEffect(() => {
    if (!supported || !enabled) return undefined;
    let detector;
    try { detector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 3 }); } catch { return undefined; }
    const timer = setInterval(async () => {
      const v = videoRef.current;
      if (!v || v.readyState < 2) return;
      try { const faces = await detector.detect(v); onResult(faces.length); } catch { /* ignore frame errors */ }
    }, intervalMs);
    return () => clearInterval(timer);
  }, [supported, enabled, videoRef, onResult, intervalMs]);
  return { supported };
}
