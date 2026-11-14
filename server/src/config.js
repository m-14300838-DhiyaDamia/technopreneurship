import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Accept a .env file in the project root or in server/ (whichever exists; both are git-ignored).
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

function bool(v, fallback = false) {
  if (v === undefined || v === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(v).toLowerCase());
}
function num(v, fallback) {
  const n = Number(v);
  return Number.isFinite(n) && v !== '' && v !== undefined ? n : fallback;
}

const env = process.env;
const isProd = env.NODE_ENV === 'production';
const isTest = env.NODE_ENV === 'test';

if (isProd && (!env.JWT_SECRET || env.JWT_SECRET.length < 32 || env.JWT_SECRET.startsWith('change-me'))) {
  throw new Error('JWT_SECRET must be set to a long random value in production (see .env.example)');
}

export const config = {
  env: env.NODE_ENV || 'development',
  edition: 'node',
  realtime: true, // Socket.IO available (false in the Apps Script edition)
  isProd,
  isTest,
  port: num(env.PORT, 4000),
  jwtSecret: env.JWT_SECRET || 'dev-only-insecure-secret-change-me',
  jwtExpiresIn: env.JWT_EXPIRES_IN || '8h',
  corsOrigins: (env.CORS_ORIGIN || 'http://localhost:5173').split(',').map((s) => s.trim()).filter(Boolean),
  dataStore: (env.DATA_STORE || 'local').toLowerCase(),
  localDataDir: path.resolve(path.join(__dirname, '..'), env.LOCAL_DATA_DIR || './data-local'),
  sheets: {
    sheetId: env.GOOGLE_SHEET_ID || '',
    serviceAccountEmail: env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '',
    privateKey: (env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n').replace(/^"|"$/g, ''),
    refreshSeconds: num(env.SHEETS_REFRESH_SECONDS, 60),
    flushMs: num(env.SHEETS_FLUSH_MS, 2500),
  },
  course: {
    code: env.COURSE_CODE || 'DAT',
    name: env.COURSE_NAME || 'Technopreneurship',
    assessmentTitle: env.ASSESSMENT_TITLE || 'Technopreneurship Final Assessment',
    semester: env.SEMESTER || '2026/2027',
    institution: env.INSTITUTION_NAME || 'Universiti Tun Hussein Onn Malaysia (UTHM)',
    department: env.DEPARTMENT_NAME || 'Jabatan Teknologi Maklumat (JTM)',
    centre: env.CENTRE_NAME || 'Pusat Pengajian Diploma',
    programme: env.PROGRAMME_NAME || 'Diploma Teknologi Maklumat (DAT)',
  },
  monitoring: {
    cameraRequiredDefault: bool(env.CAMERA_REQUIRED_DEFAULT, true),
    retentionDays: num(env.MONITORING_RETENTION_DAYS, 90),
    iceServers: (env.WEBRTC_ICE_SERVERS || 'stun:stun.l.google.com:19302')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((urls) => ({ urls })),
    turnUsername: env.WEBRTC_TURN_USERNAME || '',
    turnCredential: env.WEBRTC_TURN_CREDENTIAL || '',
  },
  demoPassword: env.DEMO_PASSWORD || 'Demo@2026',
  clientDistDir: path.resolve(__dirname, '../../client/dist'),
};

export default config;
