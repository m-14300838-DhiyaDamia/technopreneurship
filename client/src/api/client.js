/**
 * API client with two transports:
 *  - "node":        same-origin JSON API at /api (Node/Express edition), token in the
 *                   Authorization header.
 *  - "apps-script": every call is a POST to the Google Apps Script Web App URL with
 *                   { method, path, body, token } as a text/plain JSON body (no custom
 *                   headers, so no CORS preflight); the HTTP status travels inside the
 *                   JSON envelope because Apps Script always answers 200.
 *
 * The transport is chosen from /config.json (apiUrl set → apps-script).
 * The login token lives in sessionStorage (cleared when the tab closes).
 */
const TOKEN_KEY = 'tfa.token';
const BASE_URL = (import.meta.env.BASE_URL || '/');
export const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export const runtime = {
  mode: 'node', apiUrl: '', loaded: false,
  autosaveMs: 2000, heartbeatMs: 30000, pollMs: 30000,
};

export async function loadRuntimeConfig() {
  try {
    const res = await fetch(`${BASE_URL}config.json?v=${Date.now()}`, { cache: 'no-store' });
    if (res.ok) {
      const cfg = await res.json();
      const url = String(cfg.apiUrl || import.meta.env.VITE_APPS_SCRIPT_URL || '').trim();
      if (url) { runtime.mode = 'apps-script'; runtime.apiUrl = url; }
      const n = (v, d) => (Number(v) > 0 ? Number(v) : d);
      const defaults = runtime.mode === 'apps-script' ? { autosaveMs: 6000, heartbeatMs: 20000, pollMs: 15000 } : { autosaveMs: 2000, heartbeatMs: 30000, pollMs: 30000 };
      runtime.autosaveMs = n(cfg.autosaveMs, defaults.autosaveMs);
      runtime.heartbeatMs = n(cfg.heartbeatMs, defaults.heartbeatMs);
      runtime.pollMs = n(cfg.pollMs, defaults.pollMs);
    }
  } catch { /* keep defaults */ }
  runtime.loaded = true;
  return runtime;
}

export const tokenStore = {
  get: () => { try { return sessionStorage.getItem(TOKEN_KEY); } catch { return null; } },
  set: (t) => { try { t ? sessionStorage.setItem(TOKEN_KEY, t) : sessionStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ } },
};

export class ApiError extends Error {
  constructor(status, message, body) { super(message); this.status = status; this.body = body; this.code = body?.code; }
}

let onUnauthorized = null;
export function setUnauthorizedHandler(fn) { onUnauthorized = fn; }

const NETWORK_ERROR = () => new ApiError(0, 'Cannot reach the server. Check your internet connection.', { network: true });

async function viaNode(path, method, body, signal) {
  const headers = { Accept: 'application/json' };
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  let res;
  try { res = await fetch(`${API_BASE}/api${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), signal }); } catch { throw NETWORK_ERROR(); }
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = { error: text }; }
  return { status: res.status, data };
}

async function viaAppsScript(path, method, body, signal) {
  let res;
  try {
    res = await fetch(runtime.apiUrl, { method: 'POST', redirect: 'follow', signal, body: JSON.stringify({ method, path, body: body ?? {}, token: tokenStore.get() || '' }) });
  } catch { throw NETWORK_ERROR(); }
  const text = await res.text();
  let env;
  try { env = JSON.parse(text); } catch { throw new ApiError(502, 'The Apps Script URL did not return JSON. Check config.json and the deployment (Execute as: Me, Access: Anyone).', { raw: text.slice(0, 200) }); }
  if (env && typeof env.status === 'number') return { status: env.status, data: env.body };
  return { status: res.ok ? 200 : res.status, data: env };
}

export async function api(path, { method = 'GET', body, signal } = {}) {
  const { status, data } = runtime.mode === 'apps-script' ? await viaAppsScript(path, method, body, signal) : await viaNode(path, method, body, signal);
  if (status < 200 || status >= 300) {
    if (status === 401 && onUnauthorized && !path.startsWith('/auth/login')) onUnauthorized();
    throw new ApiError(status, data?.error || `Request failed (${status})`, data);
  }
  return data;
}

export const get = (p, o) => api(p, { ...o, method: 'GET' });
export const post = (p, body, o) => api(p, { ...o, method: 'POST', body: body ?? {} });
export const put = (p, body, o) => api(p, { ...o, method: 'PUT', body });
export const patch = (p, body, o) => api(p, { ...o, method: 'PATCH', body });
export const del = (p, o) => api(p, { ...o, method: 'DELETE' });
