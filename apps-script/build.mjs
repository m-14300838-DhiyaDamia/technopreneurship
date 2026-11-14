/**
 * Bundles the shared server code + Apps Script shims into one file: apps-script/Code.gs
 *   node apps-script/build.mjs
 *
 * - Node-only modules (config, data store, logger, crypto, bcrypt, jsonwebtoken,
 *   sanitize-html) are swapped for Apps Script implementations in ./shims.
 * - async/await is removed from our own modules: Apps Script has no event loop
 *   for doPost, and every "async" operation in the shared code is synchronous
 *   once the store writes directly to the sheet.
 * - Output targets ES2019, which the Apps Script V8 runtime supports.
 */
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import esbuild from 'esbuild';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const shim = (name) => path.join(here, 'shims', name);

const redirects = [
  { filter: /(^|[\\/])config\.js$/, from: /server[\\/]src[\\/]/, to: shim('config.js') },
  { filter: /[\\/]data[\\/]index\.js$/, to: shim('store.js') },
  { filter: /[\\/]lib[\\/]logger\.js$/, to: shim('logger.js') },
];
const packages = { 'node:crypto': shim('crypto.js'), crypto: shim('crypto.js'), bcryptjs: shim('bcryptjs.js'), jsonwebtoken: shim('jsonwebtoken.js'), 'sanitize-html': shim('sanitize-html.js') };

const plugin = {
  name: 'apps-script-shims',
  setup(build) {
    build.onResolve({ filter: /.*/ }, (args) => {
      if (packages[args.path]) return { path: packages[args.path] };
      if (args.path.startsWith('.')) {
        const full = path.resolve(args.resolveDir, args.path);
        for (const r of redirects) if (r.filter.test(full) && (!r.from || r.from.test(full))) return { path: r.to };
      }
      return undefined;
    });
    // Strip async/await from our own code (not from node_modules).
    build.onLoad({ filter: /[\\/](server[\\/]src|apps-script[\\/](src|shims))[\\/].*\.js$/ }, (args) => {
      let src = fs.readFileSync(args.path, 'utf8');
      src = src
        .replace(/\basync\s+(?=function\b)/g, '')
        .replace(/\basync\s*(?=\()/g, '')
        .replace(/\basync\s+(?=[A-Za-z_$][\w$]*\s*(?:=>|\())/g, '')
        .replace(/\bawait\s+/g, '');
      return { contents: src, loader: 'js' };
    });
  },
};

const result = await esbuild.build({
  entryPoints: [path.join(here, 'src/main.js')],
  bundle: true, format: 'iife', globalName: 'TFA', platform: 'neutral', target: ['es2019'],
  mainFields: ['module', 'main'], conditions: ['import', 'default'],
  write: false, plugins: [plugin], legalComments: 'none', minify: false, treeShaking: true,
  define: { 'process.env.NODE_ENV': '"production"' },
});
const banner = `/**
 * TECHNOPRENEURSHIP FINAL ASSESSMENT MANAGEMENT SYSTEM — Google Apps Script edition
 * Generated file: do not edit by hand. Rebuild with "node apps-script/build.mjs".
 * Paste the whole file into Extensions → Apps Script of your Google Sheet, then
 * run setup() once and deploy as a Web App (Execute as: Me, Access: Anyone).
 */
`;
const footer = `
// ---- Apps Script entry points (must be top-level functions) ----
function doGet(e) { return TFA.doGet(e); }
function doPost(e) { return TFA.doPost(e); }
function setup() { return TFA.setup(); }
function seedDemoData() { return TFA.seedDemoData(); }
`;
const code = banner + result.outputFiles[0].text + footer;
fs.writeFileSync(path.join(here, 'Code.gs'), code);
fs.writeFileSync(path.join(here, 'appsscript.json'), JSON.stringify({
  timeZone: 'Asia/Kuala_Lumpur', exceptionLogging: 'STACKDRIVER', runtimeVersion: 'V8',
  webapp: { executeAs: 'USER_DEPLOYING', access: 'ANYONE_ANONYMOUS' },
}, null, 2));
console.log(`Wrote apps-script/Code.gs (${(code.length / 1024).toFixed(0)} KB)`);
