import { NavLink, Outlet } from 'react-router-dom';
import { UniversityHeader } from './UniversityHeader.jsx';
import { UniversityFooter } from './UniversityFooter.jsx';
import { useAuth } from '../auth/AuthContext.jsx';

const NAV = {
  student: [{ to: '/student', label: 'Dashboard' }, { to: '/account', label: 'My Account' }],
  lecturer: [
    { to: '/lecturer', label: 'Dashboard', end: true }, { to: '/lecturer/assessments', label: 'Assessments & Questions' }, { to: '/lecturer/students', label: 'Students' },
    { to: '/lecturer/groups', label: 'Groups' }, { to: '/lecturer/monitoring', label: 'Live Monitoring' }, { to: '/lecturer/marking', label: 'Review & Marking' },
    { to: '/lecturer/proposals', label: 'Business Proposals' }, { to: '/lecturer/reports', label: 'Reports' }, { to: '/account', label: 'My Account' },
  ],
  admin: [
    { to: '/admin', label: 'Administration', end: true }, { to: '/lecturer', label: 'Lecturer Dashboard', end: true }, { to: '/lecturer/assessments', label: 'Assessments & Questions' },
    { to: '/lecturer/students', label: 'Students' }, { to: '/lecturer/groups', label: 'Groups' }, { to: '/lecturer/monitoring', label: 'Live Monitoring' },
    { to: '/lecturer/marking', label: 'Review & Marking' }, { to: '/lecturer/proposals', label: 'Business Proposals' }, { to: '/lecturer/reports', label: 'Reports' }, { to: '/account', label: 'My Account' },
  ],
};

export function AppShell({ wide = false, hideNav = false }) {
  const { user } = useAuth();
  const items = NAV[user?.role] || [];
  return (
    <div className="app">
      <UniversityHeader />
      {!hideNav && user && (
        <nav className="nav" aria-label="Main navigation">
          <div className="nav-inner">
            {items.map((i) => <NavLink key={i.to} to={i.to} end={i.end}>{i.label}</NavLink>)}
          </div>
        </nav>
      )}
      <main className={`app-main${wide ? ' wide' : ''}`}><Outlet /></main>
      <UniversityFooter />
    </div>
  );
}
