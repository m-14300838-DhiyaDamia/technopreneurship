/**
 * Allow-list HTML sanitiser for Apps Script (sanitize-html is not available).
 * Keeps allowed tags, drops every attribute except those explicitly allowed,
 * removes dangerous elements together with their content. The browser applies
 * DOMPurify again before rendering (defence in depth).
 */
const DROP_WITH_CONTENT = new Set(['script', 'style', 'textarea', 'option', 'noscript', 'iframe', 'object', 'embed', 'svg', 'math', 'template', 'title']);
const VOID = new Set(['br', 'hr', 'img', 'input', 'meta', 'link', 'area', 'base', 'col', 'wbr', 'source', 'track']);
const TOKEN = /<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g;
const ATTR = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;

function escapeText(s) {
  return s.replace(/<(?![a-zA-Z/!])/g, '&lt;').replace(/<$/g, '&lt;');
}

export default function sanitizeHtml(input, opts = {}) {
  const allowed = new Set((opts.allowedTags || []).map((t) => t.toLowerCase()));
  const allowedAttrs = opts.allowedAttributes || {};
  const src = String(input ?? '');
  let out = '';
  let last = 0;
  let skipUntil = null; // tag name whose content is being dropped
  const open = [];
  let m;
  TOKEN.lastIndex = 0;
  while ((m = TOKEN.exec(src))) {
    const text = src.slice(last, m.index);
    if (!skipUntil) out += escapeText(text);
    last = TOKEN.lastIndex;
    const raw = m[0];
    const name = (m[1] || '').toLowerCase();
    if (!name) continue; // comment / CDATA dropped
    const closing = raw.startsWith('</');
    if (skipUntil) { if (closing && name === skipUntil) skipUntil = null; continue; }
    if (DROP_WITH_CONTENT.has(name)) { if (!closing && !raw.endsWith('/>')) skipUntil = name; continue; }
    if (!allowed.has(name)) continue; // tag removed, content kept
    if (closing) {
      if (open.includes(name)) { while (open.length) { const t = open.pop(); out += `</${t}>`; if (t === name) break; } }
      continue;
    }
    const attrs = [];
    const permitted = new Set([...(allowedAttrs['*'] || []), ...(allowedAttrs[name] || [])]);
    let a;
    ATTR.lastIndex = 0;
    while ((a = ATTR.exec(m[2] || ''))) {
      const an = a[1].toLowerCase();
      if (!permitted.has(an)) continue;
      const av = (a[2] ?? a[3] ?? a[4] ?? '').replace(/"/g, '&quot;');
      if (/^\s*(javascript|data|vbscript):/i.test(av)) continue;
      attrs.push(`${an}="${av}"`);
    }
    out += `<${name}${attrs.length ? ` ${attrs.join(' ')}` : ''}>`;
    if (!VOID.has(name) && !raw.endsWith('/>')) open.push(name);
  }
  if (!skipUntil) out += escapeText(src.slice(last));
  while (open.length) out += `</${open.pop()}>`;
  return out;
}
