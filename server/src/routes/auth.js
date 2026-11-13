import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { wrap, validate } from '../lib/http.js';
import { authenticate, changeOwnPassword, publicUser } from '../services/users.js';
import { signToken } from '../auth/jwt.js';
import { requireAuth } from '../auth/middleware.js';
import { audit } from '../services/audit.js';
import { getStore } from '../data/index.js';
import { config } from '../config.js';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, limit: config.isTest ? 1000 : 20, standardHeaders: true, legacyHeaders: false,
  message: { error: 'Too many login attempts. Please wait 15 minutes and try again.' },
});

router.post('/login', loginLimiter, validate(z.object({ username: z.string().min(1).max(100), password: z.string().min(1).max(200) })), wrap(async (req, res) => {
  const user = await authenticate(req.body.username, req.body.password);
  const token = signToken(user);
  await audit({ user_id: user.user_id, role: user.role, name: user.name }, 'LOGIN', 'User', user.user_id, null, req.ip);
  res.json({ token, user: publicUser(user), expires_in: config.jwtExpiresIn });
}));

router.get('/me', requireAuth, (req, res) => {
  const u = getStore().get('Users', req.user.user_id);
  res.json({ user: publicUser(u) });
});

router.post('/change-password', requireAuth, validate(z.object({ current_password: z.string().min(1), new_password: z.string().min(8).max(200) })), wrap(async (req, res) => {
  await changeOwnPassword(req.user.user_id, req.body.current_password, req.body.new_password);
  await audit(req.user, 'PASSWORD_CHANGED', 'User', req.user.user_id, null, req.ip);
  res.json({ ok: true });
}));

router.post('/logout', requireAuth, wrap(async (req, res) => {
  await audit(req.user, 'LOGOUT', 'User', req.user.user_id, null, req.ip);
  res.json({ ok: true }); // stateless tokens: the client discards the token
}));

export default router;
