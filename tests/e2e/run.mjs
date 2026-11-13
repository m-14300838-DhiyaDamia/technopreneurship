/**
 * End-to-end browser test (Playwright + Chromium).
 *   node tests/e2e/run.mjs
 * Seeds demo data into a temporary local store, starts the server on port 4300
 * serving the built client, then drives the student, lecturer and monitoring flows.
 * Screenshots are written to test-results/.
 */
import { spawn, execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const PORT = 4300; const BASE = `http://localhost:${PORT}`;
const out = path.join(root, 'test-results'); fs.mkdirSync(out, { recursive: true });
const dataDir = path.join(root, 'server', 'data-e2e');
const env = { ...process.env, PORT: String(PORT), DATA_STORE: 'local', LOCAL_DATA_DIR: dataDir, NODE_ENV: 'test', JWT_SECRET: 'e2e-test-secret-e2e-test-secret-e2e-test-secret', DEMO_PASSWORD: 'Demo@2026' };
const PW = 'Demo@2026';
let failures = 0;
const ok = (c, m) => { console.log(`${c ? 'PASS' : 'FAIL'} ${m}`); if (!c) failures++; };

if (!fs.existsSync(path.join(root, 'client/dist/index.html'))) { console.log('Building client…'); execSync('npm --prefix client run build', { cwd: root, stdio: 'inherit' }); }
try { await fetch(`${BASE}/api/health`); console.error(`Port ${PORT} is already in use. Stop the other server first.`); process.exit(1); } catch { /* port free */ }
fs.rmSync(dataDir, { recursive: true, force: true });
execSync('node src/demo/seed.js', { cwd: path.join(root, 'server'), env, stdio: 'ignore' });
const server = spawn('node', ['src/index.js'], { cwd: path.join(root, 'server'), env, stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 1500));

const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
const shot = (page, name) => page.screenshot({ path: path.join(out, `${name}.png`), fullPage: true });
async function login(ctx, username) {
  const page = await ctx.newPage();
  await page.goto(`${BASE}/login`);
  await page.fill('#username', username); await page.fill('#password', PW); await page.click('button[type=submit], form button');
  await page.waitForURL((u) => !u.pathname.endsWith('/login'));
  return page;
}

try {
  // ---------------- Student workflow -------------------------------------------
  const sctx = await browser.newContext({ permissions: ['camera'], viewport: { width: 1366, height: 900 } });
  const s = await login(sctx, 'DEMO-C001');
  ok(await s.locator('h1').first().innerText().then((t) => t.includes('Adam')), 'student dashboard shows name');
  ok(await s.locator('text=Marketing').count() > 0, 'student dashboard shows assigned component');
  await shot(s, '01-student-dashboard');
  await s.click('text=Open assessment');
  await s.waitForSelector('text=Camera check');
  await s.click('text=Enable camera');
  await s.waitForSelector('text=Camera enabled ✓', { timeout: 10000 });
  await s.check('input[type=checkbox]');
  await shot(s, '02-student-prestart');
  await s.click('text=Start assessment');
  await s.waitForSelector('.exam');
  ok((await s.locator('.qbtn').count()) === 3, 'exam shows 3 questions for the Marketing component');
  ok(/\d:\d\d/.test(await s.locator('.timer').innerText()), 'server timer displayed');
  await s.locator('.rte-area').click();
  await s.keyboard.type('Our target market is UTHM staff drivers. ');
  await s.waitForSelector('.save-state.saved', { timeout: 10000 });
  ok(true, 'auto-save confirmed');
  await shot(s, '03-student-exam');
  // proctoring: simulate window blur
  await s.evaluate(() => window.dispatchEvent(new Event('blur')));
  await s.click('text=Next →');
  await s.locator('.rte-area').click(); await s.keyboard.type('Marketing strategy: campus booths and social media.');
  await s.click('text=Save now');
  await s.waitForSelector('.save-state.saved', { timeout: 10000 });
  // Reload page: answers persist
  await s.reload(); await s.waitForSelector('.exam');
  ok((await s.locator('.qbtn .state.answered').count()) === 2, 'two answers persisted after reload');

  // ---------------- Lecturer live monitoring ------------------------------------
  const lctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const l = await login(lctx, 'lecturer');
  await l.waitForSelector('text=Lecturer dashboard');
  await shot(l, '04-lecturer-dashboard');
  await l.goto(`${BASE}/lecturer/monitoring`);
  await l.waitForSelector('table');
  await l.waitForTimeout(1500);
  const adamRow = l.locator('tr', { hasText: 'Adam' });
  ok((await adamRow.innerText()).includes('LIVE'), 'monitoring shows Adam LIVE');
  ok(/in progress/i.test(await adamRow.innerText()), 'monitoring shows in progress');
  await shot(l, '05-monitoring');
  await l.click('.tabs button:has-text("Monitoring events")');
  await l.waitForTimeout(500);
  ok((await l.locator('text=WINDOW_BLUR').count()) > 0, 'WINDOW_BLUR event listed');
  await shot(l, '06-monitoring-events');
  await l.click('.tabs button:has-text("Status table")');
  await adamRow.locator('text=View camera').click();
  await l.waitForTimeout(4000);
  const camState = await l.locator('.modal p').last().innerText();
  const live = await l.evaluate(() => { const v = document.querySelector('.modal video'); return v && v.srcObject && v.srcObject.getVideoTracks().length > 0 && v.videoWidth > 0; });
  ok(live || camState.startsWith('Live'), `lecturer receives live WebRTC camera stream (${camState})`);
  const banner = await s.locator('.viewing-banner').count();
  ok(banner > 0, 'student sees "lecturer is viewing" banner');
  await shot(l, '07-camera-view');
  await l.click('.modal button[aria-label=Close]');

  // ---------------- Student submit -------------------------------------------------
  await s.click('text=Submit assessment');
  await s.waitForSelector('text=Submit your assessment?');
  await s.click('text=Yes, submit');
  await s.waitForSelector('text=Your assessment has been submitted');
  ok(true, 'student submitted');
  await shot(s, '08-student-submitted');

  // ---------------- Lecturer marking ------------------------------------------------
  await l.goto(`${BASE}/lecturer/marking`);
  await l.waitForSelector('table');
  await l.locator('tr', { hasText: 'Adam' }).locator('text=Review & mark').click();
  await l.waitForSelector('.mark-item');
  const inputs = l.locator('.mark-input');
  await inputs.nth(0).fill('8'); await inputs.nth(1).fill('7'); await inputs.nth(2).fill('0');
  await l.locator('.mark-item .rte-area').first().click(); await l.keyboard.type('Good identification of the segment.');
  await l.click('text=Save draft');
  await l.waitForSelector('text=Marks saved as draft');
  ok((await l.locator('.stat .value').nth(0).innerText()).startsWith('15'), 'total recomputed to 15');
  await l.click('.exam-footer button:has-text("Finalise marking")');
  await l.click('.modal .form-actions button:has-text("Finalise")');
  await l.waitForSelector('text=Marks are finalised');
  ok(true, 'marking finalised');
  await shot(l, '09-marking-finalised');

  // ---------------- Proposal ----------------------------------------------------------
  await l.goto(`${BASE}/lecturer/proposals`);
  await l.waitForSelector('text=Group A');
  await l.locator('.card', { hasText: 'Group A' }).locator('a', { hasText: /Generate|Open proposal/ }).click();
  await l.waitForSelector('.doc');
  await l.click('text=Generate proposal');
  await l.waitForSelector('text=Proposal generated');
  ok((await l.locator('.source-tag', { hasText: 'Source: Abu' }).count()) > 0, 'proposal sections traceable to Abu');
  ok((await l.locator('.doc-section').count()) === 11, '11 template sections rendered');
  await l.locator('.doc-section', { hasText: 'Marketing Strategy' }).locator('button', { hasText: 'Edit' }).click();
  await l.waitForSelector('.modal .rte-area');
  await l.locator('.modal .rte-area').click(); await l.keyboard.press('Control+End'); await l.keyboard.type(' [Lecturer formatting note]');
  await l.click('text=Save section');
  await l.waitForSelector('text=Section saved');
  ok((await l.locator('text=Edited by lecturer').count()) > 0, 'lecturer edit flagged, original preserved');
  await l.click('.card button:has-text("Finalise")');
  await l.click('.modal .form-actions button:has-text("Finalise")');
  await l.waitForSelector('text=Proposal Finalised');
  await shot(l, '10-proposal');
  await l.emulateMedia({ media: 'print' });
  await l.screenshot({ path: path.join(out, '11-proposal-print.png'), fullPage: true });
  await l.emulateMedia({ media: 'screen' });

  // ---------------- Reports --------------------------------------------------------------
  await l.goto(`${BASE}/lecturer/reports`);
  await l.waitForSelector('table');
  await l.locator('tr', { hasText: 'Adam' }).locator('text=Open report').click();
  await l.waitForSelector('text=Individual Student Assessment Report');
  ok((await l.locator('.doc').innerText()).includes('15 / 30'), 'individual report shows total 15 / 30');
  await shot(l, '12-individual-report');
  await l.goto(`${BASE}/lecturer/reports`);
  await l.click('.tabs button:has-text("Group reports")');
  await l.locator('tr', { hasText: 'Group A' }).locator('text=Group report').click();
  await l.waitForSelector('text=Members and individual components');
  await shot(l, '13-group-report');

  // ---------------- Student sees results after release ----------------------------------
  await l.goto(`${BASE}/lecturer/assessments`);
  await l.waitForSelector('text=Release results to students');
  await l.locator('label:has-text("Release results to students") input').click();
  await l.waitForSelector('text=Results released');
  await s.goto(`${BASE}/student/assessments/${new URL(s.url()).pathname.split('/').pop()}`);
  await s.waitForSelector('text=Results');
  ok((await s.locator('.doc, .card').allInnerTexts()).join(' ').includes('15 / 30'), 'student sees released finalised marks');
  await shot(s, '14-student-results');

  // ---------------- Access control --------------------------------------------------------
  const r = await s.goto(`${BASE}/lecturer`); await s.waitForTimeout(800);
  ok(new URL(s.url()).pathname.startsWith('/student'), 'student redirected away from lecturer pages');

  // ---------------- Admin ------------------------------------------------------------------
  const actx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const a = await login(actx, 'admin');
  await a.waitForSelector('text=Administration');
  await a.click('.tabs button:has-text("Audit logs")');
  await a.waitForSelector('td:has-text("MARKS_FINALISED")');
  ok(true, 'admin audit log shows MARKS_FINALISED');
  await shot(a, '15-admin-audit');
} catch (err) {
  failures++; console.error('E2E error:', err);
} finally {
  await browser.close();
  await new Promise((r) => { server.on('exit', r); server.kill('SIGTERM'); setTimeout(r, 5000); });
  fs.rmSync(dataDir, { recursive: true, force: true });
}
console.log(failures ? `\n${failures} FAILURE(S)` : '\nALL E2E CHECKS PASSED');
process.exit(failures ? 1 : 0);
