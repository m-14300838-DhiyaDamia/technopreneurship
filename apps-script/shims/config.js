/**
 * Configuration for the Google Apps Script edition. Values come from
 * Script Properties (Project Settings → Script Properties) with sensible defaults.
 */
function prop(key, fallback) {
  try { const v = PropertiesService.getScriptProperties().getProperty(key); return v === null || v === '' ? fallback : v; } catch { return fallback; }
}
function bool(v, fallback) { if (v === undefined || v === null || v === '') return fallback; return ['1', 'true', 'yes', 'on'].includes(String(v).toLowerCase()); }

export function ensureSecret() {
  const props = PropertiesService.getScriptProperties();
  let s = props.getProperty('JWT_SECRET');
  if (!s) { s = Utilities.getUuid() + Utilities.getUuid() + Utilities.getUuid(); props.setProperty('JWT_SECRET', s); }
  return s;
}

export const config = {
  env: 'production', edition: 'apps-script', realtime: false, isProd: true, isTest: false, port: 0,
  get jwtSecret() { return ensureSecret(); },
  jwtExpiresIn: prop('JWT_EXPIRES_IN', '8h'),
  corsOrigins: [], dataStore: 'apps-script', localDataDir: '',
  sheets: { sheetId: '', serviceAccountEmail: '', privateKey: '', refreshSeconds: 0, flushMs: 0 },
  course: {
    code: prop('COURSE_CODE', 'DAT'), name: prop('COURSE_NAME', 'Technopreneurship'), assessmentTitle: prop('ASSESSMENT_TITLE', 'Technopreneurship Final Assessment'),
    semester: prop('SEMESTER', '2026/2027'), institution: prop('INSTITUTION_NAME', 'Universiti Tun Hussein Onn Malaysia (UTHM)'),
    department: prop('DEPARTMENT_NAME', 'Jabatan Teknologi Maklumat (JTM)'), centre: prop('CENTRE_NAME', 'Pusat Pengajian Diploma'), programme: prop('PROGRAMME_NAME', 'Diploma Teknologi Maklumat (DAT)'),
  },
  monitoring: {
    cameraRequiredDefault: bool(prop('CAMERA_REQUIRED_DEFAULT', 'true'), true), retentionDays: Number(prop('MONITORING_RETENTION_DAYS', '90')) || 90,
    iceServers: prop('WEBRTC_ICE_SERVERS', 'stun:stun.l.google.com:19302').split(',').map((s) => s.trim()).filter(Boolean).map((urls) => ({ urls })),
    turnUsername: prop('WEBRTC_TURN_USERNAME', ''), turnCredential: prop('WEBRTC_TURN_CREDENTIAL', ''),
  },
  demoPassword: prop('DEMO_PASSWORD', 'Demo@2026'),
  clientDistDir: '',
};
export default config;
