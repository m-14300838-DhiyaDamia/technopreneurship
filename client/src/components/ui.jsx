import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import DOMPurify from 'dompurify';
import { STATUS_TONE, labelize } from '../utils/format.js';

export const Spinner = () => <div className="spinner" role="status" aria-label="Loading" />;
export const Empty = ({ children }) => <div className="empty">{children}</div>;

export function Badge({ status, tone, children }) {
  const t = tone ?? STATUS_TONE[status] ?? '';
  return <span className={`badge ${t}`}>{children ?? labelize(status)}</span>;
}

export function Alert({ tone = 'info', title, children, className = '' }) {
  return <div className={`alert ${tone} ${className}`} role={tone === 'bad' ? 'alert' : 'status'}>{title && <h4>{title}</h4>}{children}</div>;
}

/** Sanitised rich-text rendering (server also sanitises; this is defence in depth). */
export function SafeHtml({ html, className = 'rich', as: Tag = 'div' }) {
  const clean = useMemo(() => DOMPurify.sanitize(html || '', { USE_PROFILES: { html: true }, FORBID_TAGS: ['style', 'img', 'svg', 'math', 'a'], FORBID_ATTR: ['style', 'onerror', 'onclick'] }), [html]);
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: clean }} />;
}

export function Modal({ title, onClose, children, size = '', footer }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className={`modal ${size}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head"><h3>{title}</h3>{onClose && <button className="btn ghost sm" onClick={onClose} aria-label="Close">✕</button>}</div>
        {children}
        {footer && <div className="form-actions">{footer}</div>}
      </div>
    </div>
  );
}

export function Confirm({ title = 'Please confirm', message, confirmLabel = 'Confirm', tone = 'primary', onConfirm, onCancel, requireText, children }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const ok = !requireText || text.trim().length > 0;
  return (
    <Modal title={title} onClose={onCancel} footer={<>
      <button className="btn" onClick={onCancel} disabled={busy}>Cancel</button>
      <button className={`btn ${tone}`} disabled={!ok || busy} onClick={async () => { setBusy(true); try { await onConfirm(text); } finally { setBusy(false); } }}>{busy ? 'Working…' : confirmLabel}</button>
    </>}>
      {message && <p>{message}</p>}
      {children}
      {requireText && <div className="field"><label>{requireText}</label><input value={text} onChange={(e) => setText(e.target.value)} autoFocus /></div>}
    </Modal>
  );
}

const ToastCtx = createContext(() => {});
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((message, tone = '') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), tone === 'bad' ? 7000 : 4000);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toasts" aria-live="polite">{toasts.map((t) => <div key={t.id} className={`toast ${t.tone}`}>{t.message}</div>)}</div>
    </ToastCtx.Provider>
  );
}
export const useToast = () => useContext(ToastCtx);

/** Small async-data hook with reload. */
export function useAsync(fn, deps = []) {
  const [state, setState] = useState({ loading: true, data: null, error: null });
  const fnRef = useRef(fn); fnRef.current = fn;
  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try { const data = await fnRef.current(); setState({ loading: false, data, error: null }); return data; } catch (error) { setState({ loading: false, data: null, error }); return null; }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  return { ...state, reload: load, setData: (d) => setState((s) => ({ ...s, data: typeof d === 'function' ? d(s.data) : d })) };
}

export function ErrorBox({ error, retry }) {
  if (!error) return null;
  return <Alert tone="bad" title="Something went wrong">{error.message} {retry && <button className="btn sm" onClick={retry} style={{ marginLeft: '.5rem' }}>Retry</button>}</Alert>;
}

export function Tabs({ tabs, value, onChange }) {
  return <div className="tabs" role="tablist">{tabs.map((t) => <button key={t.value} role="tab" aria-selected={value === t.value} className={value === t.value ? 'active' : ''} onClick={() => onChange(t.value)}>{t.label}</button>)}</div>;
}
