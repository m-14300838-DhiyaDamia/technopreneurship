import bcrypt from 'bcryptjs';

const ROUNDS = 10;

export async function hashPassword(plain) {
  if (typeof plain !== 'string' || plain.length < 8) throw new Error('Password must be at least 8 characters');
  return bcrypt.hash(plain, ROUNDS);
}

export async function verifyPassword(plain, hash) {
  if (!hash || typeof plain !== 'string') return false;
  return bcrypt.compare(plain, hash);
}
