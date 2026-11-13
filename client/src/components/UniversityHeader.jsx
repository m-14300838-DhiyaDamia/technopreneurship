import { useAuth } from '../auth/AuthContext.jsx';
import { Logo } from './Logo.jsx';

/** Reusable institutional header. Logos are replaceable files under /assets/images. */
export function UniversityHeader({ compact = false }) {
  const { user, meta, logout } = useAuth();
  const c = meta?.course || {};
  return (
    <header className="uni-header">
      <div className="uni-header-inner">
        <div className="uni-logos">
          <Logo name="uthm-logo" alt="UTHM" />
          {!compact && <Logo name="jtm-logo" alt="JTM" />}
          {!compact && <Logo name="pusat-pengajian-diploma-logo" alt="Pusat Pengajian Diploma" />}
        </div>
        <div className="uni-title">
          <div className="main">{(c.assessmentTitle || 'Technopreneurship Final Assessment')}</div>
          <div className="sub">
            {c.programme || 'Diploma Teknologi Maklumat (DAT)'}<br />
            {c.department || 'Jabatan Teknologi Maklumat (JTM)'} · {c.centre || 'Pusat Pengajian Diploma'}<br />
            {c.institution || 'Universiti Tun Hussein Onn Malaysia (UTHM)'}
          </div>
        </div>
        {user && (
          <div className="uni-user">
            <div>
              <strong>{user.name}</strong>
              <span className="role-pill">{user.role}</span>
            </div>
            <button className="btn sm" onClick={() => logout()}>Logout</button>
          </div>
        )}
      </div>
    </header>
  );
}
