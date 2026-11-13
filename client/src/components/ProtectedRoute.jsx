import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { Spinner } from './ui.jsx';

export function ProtectedRoute({ roles, children }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  if (user.must_change_password && loc.pathname !== '/account') return <Navigate to="/account?forced=1" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={homeFor(user.role)} replace />;
  return children;
}

export const homeFor = (role) => (role === 'student' ? '/student' : role === 'admin' ? '/admin' : '/lecturer');
