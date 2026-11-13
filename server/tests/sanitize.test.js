import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeRichText, sanitizePlain, htmlToText } from '../src/lib/sanitize.js';

test('rich text keeps formatting and strips scripts, handlers and links', () => {
  const out = sanitizeRichText('<p onclick="x">Hi <script>alert(1)</script><strong>b</strong> <a href="javascript:alert(1)">l</a><img src=x onerror=1><iframe></iframe></p>');
  assert.equal(out, '<p>Hi <strong>b</strong> l</p>');
});
test('plain text removes all tags', () => {
  assert.equal(sanitizePlain('<b>Abu</b> <script>x</script>'), 'Abu');
});
test('htmlToText produces readable text', () => {
  assert.equal(htmlToText('<p>One</p><p>Two<br>Three</p>'), 'One\nTwo\nThree');
});
