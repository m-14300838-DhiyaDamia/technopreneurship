import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export function signToken(user) {
  return jwt.sign(
    { sub: user.user_id, role: user.role, name: user.name, student_id: user.student_id || null },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn, issuer: 'tfa' },
  );
}

export function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret, { issuer: 'tfa' });
}
