import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { UniversityHeader } from '../components/UniversityHeader.jsx';
import { UniversityFooter } from '../components/UniversityFooter.jsx';
import { Alert } from '../components/ui.jsx';
import { homeFor } from '../components/ProtectedRoute.jsx';

export default function LoginPage() {
  const { login, meta } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      const user = await login(username.trim(), password);
      nav(user.must_change_password ? '/account?forced=1' : loc.state?.from || homeFor(user.role), { replace: true });
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  return (
    <div className="app">
      <UniversityHeader />
      <main className="app-main login-wrap">
        <form className="card login-card" onSubmit={submit} noValidate>
          <h1>Sign in</h1>
          <p className="muted small" style={{ textAlign: 'center' }}>Students sign in with their matric number. Lecturers and administrators use their staff username.</p>
          {!meta && <Alert tone="warn">The server could not be reached. The sign-in may fail until the backend is running.</Alert>}
          {error && <Alert tone="bad">{error}</Alert>}
          <div className="field"><label htmlFor="username">Matric number / username</label><input id="username" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} required autoFocus /></div>
          <div className="field"><label htmlFor="password">Password</label><input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
          <button className="btn primary block lg" disabled={busy || !username || !password}>{busy ? 'Signing in…' : 'Sign in'}</button>
          {meta?.data_store === 'local' && <p className="tiny muted mt" style={{ textAlign: 'center' }}>Running on the local demo data store.</p>}
        </form>
      </main>
      <UniversityFooter />
    </div>
  );
}
