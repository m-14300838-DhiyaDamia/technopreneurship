/**
 * Password hashing for Apps Script (bcrypt is unavailable). PBKDF2-style:
 * HMAC-SHA256 iterated over a random salt. Format: pbkdf2$<iterations>$<salt>$<hash>.
 * Hashes created by the Node edition (bcrypt "$2a$…") cannot be verified here.
 * Functions return plain values: the bundle strips async/await from the shared code.
 */
const ITERATIONS = 2000;
const b64 = (bytes) => Utilities.base64Encode(bytes);
const bytesOf = (s) => Utilities.newBlob(s).getBytes();

function derive(password, saltB64, iterations) {
  let block = Utilities.computeHmacSha256Signature(bytesOf(`${saltB64}:${password}`), bytesOf(saltB64));
  const acc = block.slice();
  for (let i = 1; i < iterations; i++) {
    block = Utilities.computeHmacSha256Signature(block, bytesOf(saltB64));
    for (let j = 0; j < acc.length; j++) acc[j] ^= block[j];
  }
  return b64(acc);
}

function hash(plain) {
  const salt = b64(Array.from({ length: 16 }, () => Math.floor(Math.random() * 256)));
  return `pbkdf2$${ITERATIONS}$${salt}$${derive(plain, salt, ITERATIONS)}`;
}

function compare(plain, stored) {
  if (typeof stored !== 'string' || !stored.startsWith('pbkdf2$')) return false;
  const [, iter, salt, expected] = stored.split('$');
  const actual = derive(plain, salt, Number(iter));
  if (actual.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < actual.length; i++) diff |= actual.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

export default { hash, compare };
export { hash, compare };
