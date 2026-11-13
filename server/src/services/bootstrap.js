import { getStore } from '../data/index.js';
import { createUser } from './users.js';
import { logger } from '../lib/logger.js';
import crypto from 'node:crypto';

/**
 * If the Users worksheet is completely empty, create a first administrator so the
 * lecturer can log in and configure the system. The password is printed ONCE in
 * the server log and must be changed at first login.
 */
export async function ensureBootstrapAdmin() {
  const store = getStore();
  if (store.count('Users')) return null;
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD || `Admin-${crypto.randomBytes(6).toString('base64url')}`;
  const user = await createUser({ username: 'admin', password, role: 'admin', name: 'System Administrator', must_change_password: true });
  logger.warn('=====================================================================');
  logger.warn(' No users found. A bootstrap administrator account was created:');
  logger.warn(`   username: admin    password: ${password}`);
  logger.warn(' Login now and change this password immediately.');
  logger.warn('=====================================================================');
  return user;
}
