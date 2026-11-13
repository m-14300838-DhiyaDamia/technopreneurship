import { Logo } from './Logo.jsx';
import { fmtDate } from '../utils/format.js';

/** Branded header/footer for printable documents (proposals and reports). */
export function DocHeader({ branding, title, subtitle }) {
  const b = branding || {};
  return (
    <>
      <div className="doc-header">
        <Logo name="uthm-logo" alt="UTHM" />
        <div className="titles">
          <div className="main">{b.assessmentTitle || 'Technopreneurship Final Assessment'}</div>
          <div>{b.programme || 'Diploma Teknologi Maklumat (DAT)'} · {b.department || 'Jabatan Teknologi Maklumat (JTM)'}</div>
          <div>{b.centre || 'Pusat Pengajian Diploma'} · {b.institution || 'Universiti Tun Hussein Onn Malaysia (UTHM)'}</div>
        </div>
        <Logo name="jtm-logo" alt="JTM" />
        <Logo name="pusat-pengajian-diploma-logo" alt="Pusat Pengajian Diploma" />
      </div>
      {title && <h1 className="doc-title">{title}</h1>}
      {subtitle && <p className="doc-subtitle">{subtitle}</p>}
    </>
  );
}

export function DocFooter({ note }) {
  return (
    <div className="doc-footer">
      {note && <div>{note}</div>}
      <div>© 2026 Dr. Rosfuzah Roslan, Diploma Teknologi Maklumat, Jabatan Teknologi Maklumat, Pusat Pengajian Diploma, Universiti Tun Hussein Onn Malaysia (UTHM). All Rights Reserved. · Printed {fmtDate(new Date().toISOString())}</div>
    </div>
  );
}

export function PrintBar({ children, onPrint }) {
  return (
    <div className="row between mb no-print">
      <div className="row">{children}</div>
      <div className="row"><span className="print-note">Use "Save as PDF" in the print dialog to export a PDF. Enable "Headers and footers" for page numbers.</span><button className="btn primary" onClick={onPrint || (() => window.print())}>Print / Export PDF</button></div>
    </div>
  );
}
