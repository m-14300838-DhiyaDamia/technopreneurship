import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { SheetsStore } from '../src/data/sheetsStore.js';
import { TABLES } from '../src/data/schema.js';

/** In-memory fake of the Google Sheets v4 API surface used by SheetsStore. */
function fakeSheetsApi({ existing = [] } = {}) {
  const sheets = new Map(existing.map((t, i) => [t, { sheetId: i + 1, rows: [TABLES[t].columns.slice()] }]));
  const calls = [];
  const name = (range) => range.match(/^'?([^'!]+)'?(!|$)/)[1];
  return {
    calls, sheets,
    spreadsheets: {
      get: async () => ({ data: { sheets: Array.from(sheets, ([title, s]) => ({ properties: { title, sheetId: s.sheetId } })) } }),
      batchUpdate: async ({ requestBody }) => {
        calls.push(['batchUpdate', requestBody]);
        const replies = [];
        for (const r of requestBody.requests) {
          if (r.addSheet) { const id = sheets.size + 100; sheets.set(r.addSheet.properties.title, { sheetId: id, rows: [] }); replies.push({ addSheet: { properties: { title: r.addSheet.properties.title, sheetId: id } } }); }
          if (r.deleteDimension) { const s = Array.from(sheets.values()).find((x) => x.sheetId === r.deleteDimension.range.sheetId); s.rows.splice(r.deleteDimension.range.startIndex, 1); replies.push({}); }
        }
        return { data: { replies } };
      },
      values: {
        get: async ({ range }) => { const s = sheets.get(name(range)); return { data: { values: range.endsWith('!A:A') ? s.rows.map((r) => [r[0]]) : s.rows } }; },
        update: async ({ range, requestBody }) => { calls.push(['update', range]); sheets.get(name(range)).rows[0] = requestBody.values[0]; return {}; },
        batchUpdate: async ({ requestBody }) => { calls.push(['valuesBatchUpdate', requestBody.data.length]); for (const d of requestBody.data) { const row = Number(d.range.match(/!A(\d+)/)[1]); sheets.get(name(d.range)).rows[row - 1] = d.values[0]; } return {}; },
        append: async ({ range, requestBody }) => { calls.push(['append', name(range), requestBody.values.length]); const s = sheets.get(name(range)); const start = s.rows.length + 1; s.rows.push(...requestBody.values); return { data: { updates: { updatedRange: `'${name(range)}'!A${start}:Z${s.rows.length}` } } }; },
      },
    },
  };
}

function makeStore(api) {
  const store = new SheetsStore({ sheetId: 'sheet', serviceAccountEmail: 'x@y', privateKey: 'k', flushMs: 5, refreshSeconds: 0 });
  store.auth.authorize = async () => {};
  store.api = api;
  return store;
}

describe('SheetsStore', () => {
  test('creates missing worksheets with headers and loads existing rows', async () => {
    const api = fakeSheetsApi({ existing: ['Students'] });
    api.sheets.get('Students').rows.push(['stu_1', 'A1', 'Abu', '', 'grp_1', 'Marketing', 'DAT', '', 'TRUE']);
    const store = makeStore(api);
    await store.init();
    assert.equal(api.sheets.size, Object.keys(TABLES).length, 'all worksheets exist');
    assert.deepEqual(api.sheets.get('Groups').rows[0], TABLES.Groups.columns);
    const s = store.get('Students', 'stu_1');
    assert.equal(s.name, 'Abu');
    assert.equal(s.active, true, 'TRUE coerced to boolean');
  });

  test('batches writes: many updates -> one batchUpdate, inserts -> one append per table, row index tracked', async () => {
    const api = fakeSheetsApi({ existing: Object.keys(TABLES) });
    const store = makeStore(api);
    await store.init();
    const a = await store.insert('Answers', { student_id: 's1', answer: '<p>one</p>', marks: 7 });
    const b = await store.insert('Answers', { student_id: 's2', answer: 'two' });
    await store.flush();
    assert.deepEqual(api.calls.filter((c) => c[0] === 'append'), [['append', 'Answers', 2]]);
    assert.equal(store.rowIndex.Answers.get(a.answer_id), 2);
    assert.equal(store.rowIndex.Answers.get(b.answer_id), 3);
    api.calls.length = 0;
    for (let i = 0; i < 50; i++) await store.update('Answers', a.answer_id, { answer: `v${i}` });
    await store.update('Answers', b.answer_id, { answer: 'final' });
    await store.flush();
    const batches = api.calls.filter((c) => c[0] === 'valuesBatchUpdate');
    assert.equal(batches.length, 1, 'coalesced into a single API call');
    assert.equal(batches[0][1], 2, 'one range per changed row');
    const headers = api.sheets.get('Answers').rows[0];
    assert.equal(api.sheets.get('Answers').rows[1][headers.indexOf('answer')], 'v49');
    assert.equal(api.sheets.get('Answers').rows[1][headers.indexOf('marks')], '7');
  });

  test('remove deletes the row and re-indexes', async () => {
    const api = fakeSheetsApi({ existing: Object.keys(TABLES) });
    const store = makeStore(api);
    await store.init();
    const g1 = await store.insert('Groups', { group_name: 'A' });
    const g2 = await store.insert('Groups', { group_name: 'B' });
    await store.flush();
    await store.remove('Groups', g1.group_id);
    await store.flush();
    assert.equal(api.sheets.get('Groups').rows.length, 2);
    assert.equal(store.rowIndex.Groups.get(g2.group_id), 2, 'B moved up to row 2');
    await store.update('Groups', g2.group_id, { business_name: 'Biz' });
    await store.flush();
    assert.equal(api.sheets.get('Groups').rows[1][2], 'Biz');
  });

  test('json columns round-trip and refresh does not clobber pending writes', async () => {
    const api = fakeSheetsApi({ existing: Object.keys(TABLES) });
    const store = makeStore(api);
    await store.init();
    const a = await store.insert('Assessments', { title: 'T', components: ['X', 'Y'], camera_required: true, duration_minutes: 90 });
    await store.refreshAll(); // pending insert must survive
    assert.ok(store.get('Assessments', a.assessment_id));
    await store.flush();
    await store.refreshAll();
    const r = store.get('Assessments', a.assessment_id);
    assert.deepEqual(r.components, ['X', 'Y']);
    assert.equal(r.camera_required, true);
    assert.equal(r.duration_minutes, 90);
  });
});
