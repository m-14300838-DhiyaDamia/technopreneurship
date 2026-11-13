#!/usr/bin/env node
/**
 * One-time Google Sheets setup check.
 *   npm run sheets:setup
 * Reads .env, connects with the service account, creates any missing
 * worksheets with the correct header rows, and prints a summary.
 * It never deletes or modifies existing data rows.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const serverDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(serverDir, '..', '.env') });
dotenv.config({ path: path.join(serverDir, '.env') });

const { SheetsStore } = await import('../src/data/sheetsStore.js');
const { TABLES } = await import('../src/data/schema.js');

const sheetId = process.env.GOOGLE_SHEET_ID;
const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const key = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n').replace(/^"|"$/g, '');
if (!sheetId || !email || !key) {
  console.error('Missing GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY in .env (see .env.example).');
  process.exit(1);
}
console.log(`Connecting to spreadsheet ${sheetId.slice(0, 8)}… as ${email}`);
const store = new SheetsStore({ sheetId, serviceAccountEmail: email, privateKey: key, refreshSeconds: 0 });
try {
  await store.init();
} catch (err) {
  console.error('\nCould not access the spreadsheet:', err.message);
  console.error('Checklist: 1) the spreadsheet ID is correct, 2) the sheet is SHARED with the service-account email as Editor, 3) the Google Sheets API is enabled in the Google Cloud project, 4) the private key was copied completely.');
  process.exit(1);
}
console.log('\nWorksheets ready:');
for (const t of Object.keys(TABLES)) console.log(`  ${t.padEnd(18)} ${String(store.count(t)).padStart(5)} rows   columns: ${store.headers[t].length}`);
console.log('\nGoogle Sheets setup is complete. Start the server with DATA_STORE=sheets.');
if (!store.count('Users')) console.log('No users yet: the server will create a bootstrap "admin" account on first start and print its password in the log.');
await store.close();
