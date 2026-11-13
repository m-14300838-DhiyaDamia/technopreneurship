import sanitizeHtml from 'sanitize-html';

/** Rich-text answers: allow a small, safe formatting subset. Everything else is stripped. */
const RICH = {
  allowedTags: ['p', 'br', 'b', 'strong', 'i', 'em', 'u', 's', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'blockquote',
    'table', 'thead', 'tbody', 'tr', 'th', 'td', 'sub', 'sup', 'span', 'div', 'hr'],
  allowedAttributes: { td: ['colspan', 'rowspan'], th: ['colspan', 'rowspan'] },
  allowedSchemes: [],
  disallowedTagsMode: 'discard',
  parser: { lowerCaseTags: true },
};

export function sanitizeRichText(html) {
  if (html === null || html === undefined) return '';
  return sanitizeHtml(String(html), RICH).trim();
}

/** Plain text fields: remove all tags. */
export function sanitizePlain(text) {
  if (text === null || text === undefined) return '';
  return sanitizeHtml(String(text), { allowedTags: [], allowedAttributes: {} }).trim();
}

/** Convert sanitised HTML to readable plain text (for exports / search). */
export function htmlToText(html) {
  return sanitizeHtml(String(html || '')
    .replace(/<\/(p|div|li|h[1-6]|tr|blockquote)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n'), { allowedTags: [], allowedAttributes: {} })
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
