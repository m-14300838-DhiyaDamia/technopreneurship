/**
 * Minimal in-memory simulation of the Google Apps Script services used by
 * Code.gs, so the bundle can be exercised with Node's test runner.
 */
import crypto from 'node:crypto';

class FakeSheet {
  constructor(name) { this.name = name; this.rows = []; this.frozen = 0; this.formats = 0; this.stats = { rangeReads: 0, bulkReads: 0, writes: 0, finds: 0 }; }
  getName() { return this.name; }
  getLastRow() { return this.rows.length; }
  getMaxRows() { return Math.max(1000, this.rows.length); }
  getLastColumn() { return Math.max(0, ...this.rows.map((r) => r.length)); }
  setFrozenRows(n) { this.frozen = n; }
  getDataRange() { return this.getRange(1, 1, this.rows.length, this.getLastColumn()); }
  getRange(row, col, numRows = 1, numCols = 1) {
    const sheet = this;
    return {
      getValues() { sheet.stats.rangeReads++; if (numRows > 50) sheet.stats.bulkReads++; const out = []; for (let r = 0; r < numRows; r++) { const src = sheet.rows[row - 1 + r] || []; out.push(Array.from({ length: numCols }, (_, c) => (src[col - 1 + c] === undefined ? '' : src[col - 1 + c]))); } return out; },
      setValues(values) { sheet.stats.writes++; values.forEach((vals, r) => { const idx = row - 1 + r; while (sheet.rows.length <= idx) sheet.rows.push([]); vals.forEach((v, c) => { sheet.rows[idx][col - 1 + c] = v; }); }); return this; },
      setNumberFormat() { sheet.formats++; return this; },
      createTextFinder(text) {
        sheet.stats.finds++;
        const needle = String(text); let entire = false;
        const scan = () => { const hits = []; for (let r = 0; r < numRows; r++) { const src = sheet.rows[row - 1 + r] || []; for (let c = 0; c < numCols; c++) { const v = src[col - 1 + c]; const sv = v === undefined || v === null ? '' : String(v); if (entire ? sv === needle : sv.includes(needle)) hits.push({ getRow: () => row + r, getColumn: () => col + c, getValue: () => v }); } } return hits; };
        const finder = { matchEntireCell(b) { entire = b; return finder; }, matchCase() { return finder; }, findAll: scan, findNext() { return scan()[0] || null; } };
        return finder;
      },
    };
  }
  appendRow(values) { this.stats.writes++; this.rows.push(values.slice()); return this; }
  deleteRow(r) { this.rows.splice(r - 1, 1); return this; }
}

export function createFakeGas() {
  const sheets = new Map();
  const props = new Map();
  const spreadsheet = {
    getSheetByName: (n) => sheets.get(n) || null,
    insertSheet: (n) => { const s = new FakeSheet(n); sheets.set(n, s); return s; },
    getSheets: () => Array.from(sheets.values()),
  };
  const blob = (data) => {
    const bytes = typeof data === 'string' ? Array.from(Buffer.from(data, 'utf8')) : Array.from(data);
    return { getBytes: () => bytes.map((b) => (b > 127 ? b - 256 : b)), getDataAsString: () => Buffer.from(bytes.map((b) => (b < 0 ? b + 256 : b))).toString('utf8') };
  };
  const toBuf = (d) => (typeof d === 'string' ? Buffer.from(d, 'utf8') : Buffer.from(Array.from(d).map((b) => (b < 0 ? b + 256 : b))));
  const signed = (buf) => Array.from(buf).map((b) => (b > 127 ? b - 256 : b));
  const g = {
    SpreadsheetApp: { getActiveSpreadsheet: () => spreadsheet },
    PropertiesService: { getScriptProperties: () => ({ getProperty: (k) => (props.has(k) ? props.get(k) : null), setProperty: (k, v) => props.set(k, v) }) },
    LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
    ContentService: { MimeType: { JSON: 'application/json' }, createTextOutput: (text) => ({ text, mime: null, setMimeType(m) { this.mime = m; return this; }, getContent() { return this.text; } }) },
    Utilities: {
      getUuid: () => crypto.randomUUID(),
      newBlob: blob,
      base64Encode: (d) => toBuf(d).toString('base64'),
      base64EncodeWebSafe: (d) => toBuf(d).toString('base64url'),
      base64DecodeWebSafe: (s) => signed(Buffer.from(s, 'base64url')),
      base64Decode: (s) => signed(Buffer.from(s, 'base64')),
      computeHmacSha256Signature: (data, key) => signed(crypto.createHmac('sha256', toBuf(key)).update(toBuf(data)).digest()),
    },
    console: { log: () => {}, error: (...a) => console.error(...a), warn: () => {} },
    Logger: { log: () => {} },
    _sheets: sheets, _props: props,
  };
  return g;
}
