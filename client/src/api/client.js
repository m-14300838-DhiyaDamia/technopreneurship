/**
 * Minimal API client. The login token is kept in sessionStorage (cleared when
 * the tab closes) and sent as a Bearer header. Header-based tokens are not
 * exposed to CSRF, and rich-text output is sanitised server-side and again
 * client-side with DOMPurify before rendering.
 */
const TOKEN_KEY = 'tfa.token';
export const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export const tokenStore = {
  get: () => { try { return sessionStorage.getItem(TOKEN_KEY); } catch { return null; } },
  set: (t) => { try { t ? sessionStorage.setItem(TOKEN_KEY, t) : sessionStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ } },
};

export class ApiError extends Error {
  constructor(status, message, body) { super(message); this.status = status; this.body = body; this.code = body?.code; }
}

let onUnauthorized = null;
export function setUnauthorizedHandler(fn) { onUnauthorized = fn; }

export async function api(path, { method = 'GET', body, signal } = {}) {
  const headers = { Accept: 'application/json' };
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  let res;
  try {
    res = await fetch(`${API_BASE}/api${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), signal });
  } catch (err) {
    throw new ApiError(0, 'Cannot reach the server. Check your internet connection.', { network: true, cause: err });
  }
  let data = null;
  const text = await res.text();
  try { data = text ? JSON.parse(text) : null; } catch { data = { error: text }; }
  if (!res.ok) {
    if (res.status === 401 && onUnauthorized && !path.startsWith('/auth/login')) onUnauthorized();
    throw new ApiError(res.status, data?.error || `Request failed (${res.status})`, data);
  }
  return data;
}

export const get = (p, o) => api(p, { ...o, method: 'GET' });
export const post = (p, body, o) => api(p, { ...o, method: 'POST', body: body ?? {} });
export const put = (p, body, o) => api(p, { ...o, method: 'PUT', body });
export const patch = (p, body, o) => api(p, { ...o, method: 'PATCH', body });
export const del = (p, o) => api(p, { ...o, method: 'DELETE' });
