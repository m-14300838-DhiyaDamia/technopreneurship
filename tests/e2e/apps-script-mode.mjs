/**
 * Browser test of the GitHub Pages + Apps Script edition.
 *   node tests/e2e/apps-script-mode.mjs
 * Serves the built client as static files (like GitHub Pages) with a config.json
 * pointing at a local HTTP server that executes the generated Code.gs inside the
 * simulated Apps Script environment (same JSON envelope, POST text/plain, redirect).
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { createFakeGas } from '../../apps-script/test/fakeGas.js';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const API_PORT = 4400; const WEB_PORT = 4401;
const out = path.join(root, 'test-results'); fs.mkdirSync(out, { recursive: true });
let failures = 0;
const ok = (c, m) => { console.log(`${c ? 'PASS' : 'FAIL'} ${m}`); if (!c) failures++; };

if (!fs.existsSync(path.join(root, 'apps-script/Code.gs'))) execSync('node apps-script/build.mjs', { cwd: root, stdio: 'inherit' });
if (!fs.existsSync(path.join(root, 'client/dist/index.html'))) execSync('npm --prefix client run build', { cwd: root, stdio: 'inherit' });

// ---- fake Apps Script web app --------------------------------------------------
const code = fs.readFileSync(path.join(root, 'apps-script/Code.gs'), 'utf8');
const gas = createFakeGas();
const sandbox = vm.createContext({ ...gas, Date, Math, JSON, Promise, Map, Set, RegExp, Error, Object, Array, String, Number, Boolean, parseInt, parseFloat, isNaN, isFinite, encodeURIComponent, decodeURIComponent, setTimeout, clearTimeout });
vm.runInContext(code, sandbox, { filename: 'Code.gs' });
sandbox.seedDemoData();
const apiServer = http.createServer((req, res) => {
  const cors = { 'Access-Control-Allow-Origin': '*' };
  if (req.method === 'GET' && req.url.startsWith('/echo')) { // Google redirects POSTs to a GET URL that returns the output
    const id = new URL(req.url, 'http://x').searchParams.get('id');
    const body = pending.get(id); pending.delete(id);
    res.writeHead(200, { ...cors, 'Content-Type': 'application/json' }); return res.end(body);
  }
  if (req.method !== 'POST') { res.writeHead(200, { ...cors, 'Content-Type': 'application/json' }); return res.end(sandbox.doGet({ parameter: {} }).getContent()); }
  let data = ''; req.on('data', (c) => { data += c; });
  req.on('end', () => {
    const output = sandbox.doPost({ postData: { contents: data } }).getContent();
    const id = Math.random().toString(36).slice(2); pending.set(id, output);
    res.writeHead(302, { ...cors, Location: `http://localhost:${API_PORT}/echo?id=${id}` }); res.end();
  });
});
const pending = new Map();
apiServer.listen(API_PORT);

// ---- static "GitHub Pages" server ------------------------------------------------
const dist = path.join(root, 'client/dist');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png' };
const webServer = http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  if (url === '/config.json') { res.writeHead(200, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ apiUrl: `http://localhost:${API_PORT}/exec`, autosaveMs: 3000, heartbeatMs: 5000, pollMs: 4000 })); }
  let file = path.join(dist, url);
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(dist, 'index.html');
  res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
webServer.listen(WEB_PORT);
const BASE = `http://localhost:${WEB_PORT}`;

const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
async function login(ctx, username) {
  const page = await ctx.newPage();
  await page.goto(`${BASE}/login`);
  await page.fill('#username', username); await page.fill('#password', 'Demo@2026'); await page.click('form button');
  await page.waitForURL((u) => !u.pathname.endsWith('/login'));
  return page;
}
try {
  const sctx = await browser.newContext({ permissions: ['camera'], viewport: { width: 1366, height: 900 } });
  const s = await login(sctx, 'DEMO-C001');
  ok((await s.locator('h1').first().innerText()).includes('Adam'), 'student login through Apps Script transport');
  await s.click('text=Open assessment'); await s.waitForSelector('text=Camera check');
  await s.click('text=Enable camera'); await s.waitForSelector('text=Camera enabled ✓');
  await s.check('input[type=checkbox]'); await s.click('text=Start assessment'); await s.waitForSelector('.exam');
  ok((await s.locator('.qbtn').count()) === 3, 'exam loaded with 3 questions');
  ok((await s.locator('text=sync every').count()) > 0, 'connection panel shows polling mode');
  await s.locator('.rte-area').click(); await s.keyboard.type('Answer written in Pages mode.');
  await s.waitForSelector('.save-state.saved', { timeout: 15000 });
  ok(true, 'auto-save confirmed via Apps Script');
  await s.evaluate(() => window.dispatchEvent(new Event('blur')));
  await s.waitForTimeout(6000); // let a heartbeat go out
  const answersSheet = gas._sheets.get('Answers').rows;
  ok(answersSheet.some((r) => r.some((c) => String(c).includes('Answer written in Pages mode.'))), 'answer stored in the simulated spreadsheet');

  const lctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const l = await login(lctx, 'lecturer');
  await l.goto(`${BASE}/lecturer/monitoring`); await l.waitForSelector('table'); await l.waitForTimeout(500);
  const row = l.locator('tr', { hasText: 'Adam' });
  ok(/in progress/i.test(await row.innerText()), 'monitoring shows in progress (polling)');
  ok((await row.innerText()).includes('LIVE'), 'presence derived from heartbeat');
  ok(await row.locator('button:has-text("View camera")').isDisabled(), 'camera view disabled in this edition');
  await l.click('.tabs button:has-text("Monitoring events")'); await l.waitForTimeout(300);
  ok((await l.locator('text=WINDOW_BLUR').count()) > 0, 'monitoring event delivered via REST fallback');
  await l.screenshot({ path: path.join(out, 'p1-monitoring-pages-mode.png'), fullPage: true });

  await s.click('text=Submit assessment'); await s.click('text=Yes, submit'); await s.waitForSelector('text=Your assessment has been submitted');
  ok(true, 'student submitted');
  await l.goto(`${BASE}/lecturer/marking`); await l.waitForSelector('table');
  await l.locator('tr', { hasText: 'Adam' }).locator('text=Review & mark').click(); await l.waitForSelector('.mark-item');
  const inputs = l.locator('.mark-input'); await inputs.nth(0).fill('6'); await inputs.nth(1).fill('5'); await inputs.nth(2).fill('4');
  await l.click('text=Save draft'); await l.waitForSelector('text=Marks saved as draft');
  ok((await l.locator('.stat .value').nth(0).innerText()).startsWith('15'), 'marks saved through Apps Script');
  await l.goto(`${BASE}/lecturer/proposals`); await l.waitForSelector('text=Group A');
  await l.locator('.card', { hasText: 'Group A' }).locator('a', { hasText: /Generate|Open proposal/ }).click(); await l.waitForSelector('.doc');
  await l.click('text=Generate proposal'); await l.waitForSelector('text=Proposal generated');
  ok((await l.locator('.doc-section').count()) === 11, 'proposal generated with 11 sections');
  await l.screenshot({ path: path.join(out, 'p2-proposal-pages-mode.png'), fullPage: true });
} catch (err) { failures++; console.error('E2E error:', err); } finally {
  await browser.close(); apiServer.close(); webServer.close();
}
console.log(failures ? `\n${failures} FAILURE(S)` : '\nALL APPS SCRIPT MODE CHECKS PASSED');
process.exit(failures ? 1 : 0);
