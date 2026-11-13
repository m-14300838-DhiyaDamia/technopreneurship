import { getStore } from '../data/index.js';
import { badRequest, conflict, notFound } from '../lib/errors.js';
import { createUser, findByUsername, resetPassword } from './users.js';
import { sanitizePlain } from '../lib/sanitize.js';
import { config } from '../config.js';
import { nowIso } from '../lib/ids.js';

export function listStudents({ group_id, active } = {}) {
  const store = getStore();
  const groups = new Map(store.list('Groups').map((g) => [g.group_id, g]));
  return store
    .list('Students')
    .filter((s) => (group_id ? s.group_id === group_id : true) && (active === undefined ? true : s.active === active))
    .map((s) => withGroup(s, groups.get(s.group_id)))
    .sort((a, b) => (a.group_name || '').localeCompare(b.group_name || '') || a.name.localeCompare(b.name));
}

export function withGroup(s, g) {
  return {
    ...s,
    component: s.role,
    group_name: g?.group_name || '',
    business_name: g?.business_name || '',
    business_idea: g?.business_idea || '',
  };
}

export function getStudent(id) {
  const store = getStore();
  const s = store.get('Students', id);
  if (!s) throw notFound('Student not found');
  return withGroup(s, s.group_id ? store.get('Groups', s.group_id) : null);
}

export function getStudentByUser(user) {
  if (!user?.student_id) throw notFound('No student profile is linked to this account');
  return getStudent(user.student_id);
}

function findByMatric(matric) {
  const m = String(matric || '').trim().toLowerCase();
  return getStore().findOne('Students', (s) => String(s.matric_no).toLowerCase() === m);
}

/**
 * Create a student profile and the matching login account (username = matric number).
 * Returns { student, initialPassword } — the password is shown once to the lecturer.
 */
export async function createStudent({ matric_no, name, email, section, group_id, component, password }) {
  const store = getStore();
  matric_no = sanitizePlain(matric_no).toUpperCase();
  name = sanitizePlain(name);
  if (!matric_no || !name) throw badRequest('Matric number and name are required');
  if (findByMatric(matric_no)) throw conflict(`A student with matric number ${matric_no} already exists`);
  if (findByUsername(matric_no)) throw conflict(`A login with username ${matric_no} already exists`);
  if (group_id && !store.get('Groups', group_id)) throw badRequest('Group does not exist');
  const student = await store.insert('Students', {
    matric_no, name, email: sanitizePlain(email), group_id: group_id || '', role: sanitizePlain(component) || '',
    course_code: config.course.code, section: sanitizePlain(section), active: true,
  });
  const initialPassword = password || generatePassword();
  await createUser({ username: matric_no, password: initialPassword, role: 'student', name, email, student_id: student.student_id });
  if (group_id) await syncGroupMembers(group_id);
  return { student: getStudent(student.student_id), initialPassword };
}

export async function updateStudent(id, patch) {
  const store = getStore();
  const s = store.get('Students', id);
  if (!s) throw notFound('Student not found');
  const upd = {};
  if (patch.name !== undefined) upd.name = sanitizePlain(patch.name);
  if (patch.email !== undefined) upd.email = sanitizePlain(patch.email);
  if (patch.section !== undefined) upd.section = sanitizePlain(patch.section);
  if (patch.component !== undefined) upd.role = sanitizePlain(patch.component);
  if (patch.active !== undefined) upd.active = Boolean(patch.active);
  if (patch.matric_no !== undefined) {
    const m = sanitizePlain(patch.matric_no).toUpperCase();
    const other = findByMatric(m);
    if (other && other.student_id !== id) throw conflict('Matric number already in use');
    upd.matric_no = m;
  }
  const oldGroup = s.group_id;
  if (patch.group_id !== undefined && patch.group_id !== s.group_id) {
    if (patch.group_id && !store.get('Groups', patch.group_id)) throw badRequest('Group does not exist');
    if (patch.group_id) assertGroupHasSpace(patch.group_id, id);
    upd.group_id = patch.group_id || '';
  }
  await store.update('Students', id, upd);
  // keep the linked login account in sync
  const user = store.findOne('Users', (u) => u.student_id === id);
  if (user) {
    const userPatch = { updated_at: nowIso() };
    if (upd.name) userPatch.name = upd.name;
    if (upd.email !== undefined) userPatch.email = upd.email;
    if (upd.matric_no) userPatch.username = upd.matric_no;
    if (upd.active !== undefined) userPatch.active = upd.active;
    await store.update('Users', user.user_id, userPatch);
  }
  if (upd.group_id !== undefined) {
    if (oldGroup) await syncGroupMembers(oldGroup);
    if (upd.group_id) await syncGroupMembers(upd.group_id);
  }
  return getStudent(id);
}

export async function resetStudentPassword(id, password) {
  const store = getStore();
  const user = store.findOne('Users', (u) => u.student_id === id);
  if (!user) throw notFound('Login account not found for this student');
  const pw = password || generatePassword();
  await resetPassword(user.user_id, pw, { mustChange: true });
  return pw;
}

export function assertGroupHasSpace(group_id, excludingStudentId) {
  const members = getStore().find('Students', (s) => s.group_id === group_id && s.student_id !== excludingStudentId && s.active);
  if (members.length >= 4) throw conflict('A group may have at most 4 members');
}

/** Mirror Students.group_id into Groups.student_1..student_4 (the spec's denormalised view). */
export async function syncGroupMembers(group_id) {
  const store = getStore();
  const g = store.get('Groups', group_id);
  if (!g) return;
  const members = store.find('Students', (s) => s.group_id === group_id).sort((a, b) => a.name.localeCompare(b.name));
  const patch = {};
  for (let i = 0; i < 4; i++) patch[`student_${i + 1}`] = members[i]?.student_id || '';
  await store.update('Groups', group_id, patch);
}

export function generatePassword() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let s = '';
  for (let i = 0; i < 10; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `${s}!`;
}
