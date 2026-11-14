/** HMAC-SHA256 signed tokens (JWT layout) for Apps Script. */
const strip = (s) => s.replace(/=+$/, '');
const enc = (obj) => strip(Utilities.base64EncodeWebSafe(Utilities.newBlob(JSON.stringify(obj)).getBytes()));
const dec = (s) => JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(s)).getDataAsString());
const sig = (data, secret) => strip(Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(data, secret)));

function seconds(expiresIn) {
  if (typeof expiresIn === 'number') return expiresIn;
  const m = /^(\d+)\s*([smhd]?)$/.exec(String(expiresIn).trim());
  if (!m) return 8 * 3600;
  return Number(m[1]) * ({ s: 1, m: 60, h: 3600, d: 86400 }[m[2] || 's']);
}

export function sign(payload, secret, opts = {}) {
  const now = Math.floor(Date.now() / 1000);
  const body = { ...payload, iat: now, exp: now + seconds(opts.expiresIn || '8h') };
  if (opts.issuer) body.iss = opts.issuer;
  const data = `${enc({ alg: 'HS256', typ: 'JWT' })}.${enc(body)}`;
  return `${data}.${sig(data, secret)}`;
}

export function verify(token, secret, opts = {}) {
  const parts = String(token || '').split('.');
  if (parts.length !== 3) throw new Error('malformed token');
  const data = `${parts[0]}.${parts[1]}`;
  if (sig(data, secret) !== parts[2]) throw new Error('invalid signature');
  const payload = dec(parts[1]);
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) throw new Error('token expired');
  if (opts.issuer && payload.iss !== opts.issuer) throw new Error('invalid issuer');
  return payload;
}

export default { sign, verify };
