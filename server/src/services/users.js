import { getStore } from '../data/index.js';
import { hashPassword, verifyPassword } from '../auth/password.js';
import { badRequest, conflict, notFound, unauthorized } from '../lib/errors.js';
import { nowIso } from '../lib/ids.js';
import { ROLES } from '../auth/middleware.js';

const publicUser = (u) => u && ({
  user_id: u.user_id, username: u.username, role: u.role, name: u.name, email: u.email,
  student_id: u.student_id, active: u.active, must_change_password: u.must_change_password,
  created_at: u.created_at, last_login_at: u.last_login_at,
});

export function findByUsername(username) {
  const u = String(username || '').trim().toLowerCase();
  return getStore().findOne('Users', (r) => String(r.username).toLowerCase() === u);
}

export async function authenticate(username, password) {
  const user = findByUsername(username);
  const ok = user ? await verifyPassword(password, user.password_hash) : false;
  if (!user || !ok) throw unauthorized('Invalid username or password');
  if (!user.active) throw unauthorized('Your account has been deactivated. Contact your lecturer.');
  await getStore().update('Users', user.user_id, { last_login_at: nowIso() });
  return user;
}

export function listUsers() {
  return getStore().list('Users').map(publicUser).sort((a, b) => a.role.localeCompare(b.role) || a.name.localeCompare(b.name));
}

export function getUser(id) {
  const u = getStore().get('Users', id);
  if (!u) throw notFound('User not found');
  return publicUser(u);
}

export async function createUser({ username, password, role, name, email, student_id, must_change_password = true }) {
  if (!ROLES.includes(role)) throw badRequest('Invalid role');
  if (!username || !name) throw badRequest('Username and name are required');
  if (findByUsername(username)) throw conflict(`Username "${username}" already exists`);
  const password_hash = await hashPassword(password);
  const row = await getStore().insert('Users', {
    username: String(username).trim(), password_hash, role, name: String(name).trim(), email: email || '',
    student_id: student_id || '', active: true, must_change_password, created_at: nowIso(), updated_at: nowIso(),
  });
  return publicUser(row);
}

export async function updateUser(id, patch) {
  const store = getStore();
  const u = store.get('Users', id);
  if (!u) throw notFound('User not found');
  const allowed = {};
  if (patch.name !== undefined) allowed.name = String(patch.name).trim();
  if (patch.email !== undefined) allowed.email = String(patch.email).trim();
  if (patch.role !== undefined) {
    if (!ROLES.includes(patch.role)) throw badRequest('Invalid role');
    allowed.role = patch.role;
  }
  if (patch.active !== undefined) allowed.active = Boolean(patch.active);
  if (patch.username !== undefined && patch.username !== u.username) {
    if (findByUsername(patch.username)) throw conflict('Username already exists');
    allowed.username = String(patch.username).trim();
  }
  allowed.updated_at = nowIso();
  return publicUser(await store.update('Users', id, allowed));
}

export async function resetPassword(id, newPassword, { mustChange = true } = {}) {
  const store = getStore();
  if (!store.get('Users', id)) throw notFound('User not found');
  const password_hash = await hashPassword(newPassword);
  return publicUser(await store.update('Users', id, { password_hash, must_change_password: mustChange, updated_at: nowIso() }));
}

export async function changeOwnPassword(id, currentPassword, newPassword) {
  const store = getStore();
  const u = store.get('Users', id);
  if (!u) throw notFound('User not found');
  if (!(await verifyPassword(currentPassword, u.password_hash))) throw badRequest('Current password is incorrect');
  if (String(newPassword).length < 8) throw badRequest('New password must be at least 8 characters');
  const password_hash = await hashPassword(newPassword);
  await store.update('Users', id, { password_hash, must_change_password: false, updated_at: nowIso() });
}

export { publicUser };
