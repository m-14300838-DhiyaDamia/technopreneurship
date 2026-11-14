/** Minimal replacement for node:crypto.randomBytes used by lib/ids.js. */
function randomBytes(n) {
  const bytes = [];
  for (let i = 0; i < n; i++) bytes.push(Math.floor(Math.random() * 256));
  return {
    toString(enc) {
      if (enc === 'hex') return bytes.map((b) => b.toString(16).padStart(2, '0')).join('');
      const b64 = Utilities.base64Encode(bytes);
      return enc === 'base64url' ? b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') : b64;
    },
  };
}
export default { randomBytes };
export { randomBytes };
