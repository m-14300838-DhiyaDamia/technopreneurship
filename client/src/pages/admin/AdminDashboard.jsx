import { useState } from 'react';
import { get, post, patch, put } from '../../api/client.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import { Alert, Badge, Empty, ErrorBox, Modal, Spinner, Tabs, useAsync, useToast } from '../../components/ui.jsx';
import { fmtDateTime } from '../../utils/format.js';

export default function AdminDashboard() {
  const [tab, setTab] = useState('users');
  return (
    <>
      <div className="page-head"><div><h1>Administration</h1><p>Users, roles, system configuration, Google Sheets status, privacy and audit logs.</p></div></div>
      <Tabs value={tab} onChange={setTab} tabs={[{ value: 'users', label: 'Users & roles' }, { value: 'settings', label: 'Configuration & privacy' }, { value: 'audit', label: 'Audit logs' }]} />
      {tab === 'users' && <Users />}
      {tab === 'settings' && <Settings />}
      {tab === 'audit' && <Audit />}
    </>
  );
}

function Users() {
  const toast = useToast();
  const { user: me } = useAuth();
  const { data, loading, error, reload } = useAsync(() => get('/admin/users'));
  const [creating, setCreating] = useState(false);
  const [f, setF] = useState({ username: '', password: '', role: 'lecturer', name: '', email: '' });
  if (loading) return <Spinner />;
  if (error) return <ErrorBox error={error} retry={reload} />;
  const run = async (fn, msg) => { try { await fn(); toast(msg, 'ok'); reload(); } catch (e) { toast(e.message, 'bad'); } };
  return (
    <>
      <div className="row between mb"><span className="muted small">{data.users.length} accounts. Student accounts are created from the lecturer's Student Manager.</span><button className="btn primary" onClick={() => setCreating(true)}>+ Add staff user</button></div>
      <div className="table-wrap"><table className="table"><thead><tr><th>Name</th><th>Username</th><th>Role</th><th>Email</th><th>Active</th><th>Last login</th><th></th></tr></thead>
        <tbody>{data.users.map((u) => (
          <tr key={u.user_id}><td>{u.name}</td><td className="mono">{u.username}</td>
            <td>{u.user_id === me.user_id ? <Badge tone="navy">{u.role}</Badge> : <select value={u.role} onChange={(e) => run(() => patch(`/admin/users/${u.user_id}`, { role: e.target.value }), 'Role updated')} aria-label="Role"><option value="student">student</option><option value="lecturer">lecturer</option><option value="admin">admin</option></select>}</td>
            <td>{u.email || '—'}</td><td><input type="checkbox" checked={u.active} disabled={u.user_id === me.user_id} onChange={(e) => run(() => patch(`/admin/users/${u.user_id}`, { active: e.target.checked }), e.target.checked ? 'Activated' : 'Deactivated')} aria-label="Active" /></td>
            <td className="small">{fmtDateTime(u.last_login_at)}</td>
            <td className="actions"><button className="btn sm" onClick={() => { const pw = window.prompt(`New password for ${u.username} (min 8 characters):`); if (pw) run(() => post(`/admin/users/${u.user_id}/reset-password`, { password: pw }), 'Password reset'); }}>Reset password</button></td></tr>))}</tbody></table></div>
      {creating && <Modal title="Add staff user" onClose={() => setCreating(false)}>
        <form onSubmit={async (e) => { e.preventDefault(); await run(() => post('/admin/users', f), 'User created'); setCreating(false); setF({ username: '', password: '', role: 'lecturer', name: '', email: '' }); }}>
          <div className="form-row">
            <div className="field"><label>Full name *</label><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required /></div>
            <div className="field"><label>Username *</label><input value={f.username} onChange={(e) => setF({ ...f, username: e.target.value })} required minLength={3} /></div>
            <div className="field"><label>Temporary password *</label><input type="text" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} required minLength={8} /></div>
            <div className="field"><label>Role</label><select value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}><option value="lecturer">Lecturer</option><option value="admin">Administrator</option></select></div>
            <div className="field"><label>Email</label><input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
          </div>
          <div className="form-actions"><button type="button" className="btn" onClick={() => setCreating(false)}>Cancel</button><button className="btn primary">Create</button></div>
        </form></Modal>}
    </>
  );
}

function Settings() {
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(() => get('/admin/settings'));
  const [vals, setVals] = useState({});
  const [days, setDays] = useState(90);
  if (loading) return <Spinner />;
  if (error) return <ErrorBox error={error} retry={reload} />;
  const current = Object.fromEntries(data.settings.map((s) => [s.key, s.value]));
  const save = async (key) => { try { await put(`/admin/settings/${key}`, { value: vals[key] ?? current[key] ?? '' }); toast('Saved', 'ok'); reload(); } catch (e) { toast(e.message, 'bad'); } };
  return (
    <div className="grid grid-2">
      <section className="card">
        <h3>Data store & Google Sheets</h3>
        <table className="table small"><tbody>
          <tr><th>Active data store</th><td><Badge tone={data.env.data_store === 'sheets' ? 'ok' : 'warn'}>{data.env.data_store}</Badge></td></tr>
          <tr><th>Google Sheet configured</th><td>{data.env.sheet_id_configured ? 'Yes' : 'No'}</td></tr>
          <tr><th>Service account</th><td className="mono">{data.env.service_account || '—'}</td></tr>
        </tbody></table>
        <p className="small muted">Google credentials are read from environment variables on the server only (see README → Google Sheets setup). They are never shown here or sent to the browser.</p>
      </section>
      <section className="card">
        <h3>Privacy & data retention</h3>
        <div className="field"><label>Additional privacy notice text shown to students</label><textarea rows={4} value={vals.privacy_notice ?? current.privacy_notice ?? ''} onChange={(e) => setVals({ ...vals, privacy_notice: e.target.value })} /><div className="form-actions"><button className="btn sm" onClick={() => save('privacy_notice')}>Save</button></div></div>
        <div className="field"><label>Monitoring event retention (days)</label><input type="number" min={1} value={vals.monitoring_retention_days ?? current.monitoring_retention_days ?? data.env.retention_days_default} onChange={(e) => setVals({ ...vals, monitoring_retention_days: e.target.value })} /><div className="form-actions"><button className="btn sm" onClick={() => save('monitoring_retention_days')}>Save</button></div></div>
        <h4>Purge old monitoring events</h4>
        <div className="row"><input type="number" min={1} value={days} onChange={(e) => setDays(e.target.value)} style={{ maxWidth: 120 }} /><span className="small">days and older</span>
          <button className="btn danger sm" onClick={async () => { if (!window.confirm(`Permanently delete monitoring events older than ${days} days?`)) return; try { const r = await post('/admin/retention/purge-monitoring', { days: Number(days) }); toast(`${r.removed} event(s) removed`, 'ok'); } catch (e) { toast(e.message, 'bad'); } }}>Purge</button></div>
        <Alert tone="info" className="mt">Video recording is not implemented: camera monitoring is live status and an optional live view only. Nothing is stored except event metadata.</Alert>
      </section>
      <section className="card">
        <h3>Course identity overrides</h3>
        <p className="small muted">Defaults come from the server environment (.env). Values set here are stored in the Settings worksheet for reference.</p>
        {['institution_name', 'department_name', 'centre_name', 'programme_name', 'course_code', 'course_name', 'semester'].map((k) => (
          <div className="field" key={k}><label>{data.keys[k]}</label><div className="row"><input value={vals[k] ?? current[k] ?? ''} onChange={(e) => setVals({ ...vals, [k]: e.target.value })} /><button className="btn sm" onClick={() => save(k)}>Save</button></div></div>))}
      </section>
    </div>
  );
}

function Audit() {
  const [action, setAction] = useState('');
  const { data, loading, error, reload } = useAsync(() => get(`/admin/audit?limit=500${action ? `&action=${action}` : ''}`), [action]);
  if (loading && !data) return <Spinner />;
  if (error) return <ErrorBox error={error} retry={reload} />;
  const actions = Array.from(new Set(data.logs.map((l) => l.action))).sort();
  return (
    <>
      <div className="row mb"><select value={action} onChange={(e) => setAction(e.target.value)} aria-label="Action"><option value="">All actions</option>{actions.map((a) => <option key={a} value={a}>{a}</option>)}</select><button className="btn" onClick={reload}>Refresh</button><span className="muted small">{data.logs.length} entries</span></div>
      {!data.logs.length ? <Empty>No audit entries.</Empty> : (
        <div className="table-wrap"><table className="table"><thead><tr><th>Time</th><th>Actor</th><th>Role</th><th>Action</th><th>Entity</th><th>Details</th><th>IP</th></tr></thead>
          <tbody>{data.logs.map((l) => <tr key={l.log_id}><td className="small nowrap">{fmtDateTime(l.timestamp)}</td><td>{l.actor_name}</td><td><Badge>{l.actor_role}</Badge></td><td className="mono small">{l.action}</td><td className="small">{l.entity_type} <span className="muted mono tiny">{l.entity_id}</span></td><td className="small" style={{ maxWidth: 360, wordBreak: 'break-word' }}>{l.details}</td><td className="tiny muted">{l.ip}</td></tr>)}</tbody></table></div>
      )}
    </>
  );
}
