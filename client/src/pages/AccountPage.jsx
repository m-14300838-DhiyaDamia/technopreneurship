import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { post } from '../api/client.js';
import { Alert, useToast } from '../components/ui.jsx';
import { homeFor } from '../components/ProtectedRoute.jsx';

export default function AccountPage() {
  const { user, refreshUser } = useAuth();
  const [params] = useSearchParams();
  const forced = params.get('forced') === '1' || user?.must_change_password;
  const nav = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setError(null);
    if (form.next !== form.confirm) return setError('New passwords do not match');
    if (form.next.length < 8) return setError('New password must be at least 8 characters');
    setBusy(true);
    try {
      await post('/auth/change-password', { current_password: form.current, new_password: form.next });
      const u = await refreshUser();
      toast('Password changed', 'ok');
      setForm({ current: '', next: '', confirm: '' });
      if (forced) nav(homeFor(u.role), { replace: true });
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  return (
    <div className="grid grid-2">
      <section className="card">
        <h2>My account</h2>
        <dl className="small">
          <dt className="label">Name</dt><dd>{user.name}</dd>
          <dt className="label">Username</dt><dd className="mono">{user.username}</dd>
          <dt className="label">Role</dt><dd>{user.role}</dd>
          {user.email && <><dt className="label">Email</dt><dd>{user.email}</dd></>}
        </dl>
      </section>
      <form className="card" onSubmit={submit}>
        <h2>Change password</h2>
        {forced && <Alert tone="warn">You must change your password before continuing.</Alert>}
        {error && <Alert tone="bad">{error}</Alert>}
        <div className="field"><label>Current password</label><input type="password" autoComplete="current-password" value={form.current} onChange={(e) => setForm({ ...form, current: e.target.value })} required /></div>
        <div className="field"><label>New password</label><input type="password" autoComplete="new-password" value={form.next} onChange={(e) => setForm({ ...form, next: e.target.value })} required minLength={8} /><span className="hint">At least 8 characters.</span></div>
        <div className="field"><label>Confirm new password</label><input type="password" autoComplete="new-password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} required /></div>
        <div className="form-actions"><button className="btn primary" disabled={busy}>{busy ? 'Saving…' : 'Change password'}</button></div>
      </form>
    </div>
  );
}
