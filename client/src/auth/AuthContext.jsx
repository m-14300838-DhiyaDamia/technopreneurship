import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { get, post, tokenStore, setUnauthorizedHandler } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async (callServer = true) => {
    if (callServer && tokenStore.get()) { try { await post('/auth/logout'); } catch { /* ignore */ } }
    tokenStore.set(null);
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => logout(false));
    (async () => {
      try { setMeta(await get('/meta')); } catch { /* server may be down; login page will show the error */ }
      if (tokenStore.get()) {
        try { const { user: u } = await get('/auth/me'); setUser(u); } catch { tokenStore.set(null); }
      }
      setLoading(false);
    })();
  }, [logout]);

  const login = useCallback(async (username, password) => {
    const data = await post('/auth/login', { username, password });
    tokenStore.set(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const refreshUser = useCallback(async () => { const { user: u } = await get('/auth/me'); setUser(u); return u; }, []);

  const value = useMemo(() => ({ user, meta, loading, login, logout, refreshUser }), [user, meta, loading, login, logout, refreshUser]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
