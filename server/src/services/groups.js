import { getStore } from '../data/index.js';
import { badRequest, conflict, notFound } from '../lib/errors.js';
import { sanitizePlain } from '../lib/sanitize.js';
import { assertGroupHasSpace, syncGroupMembers, withGroup } from './students.js';

export function listGroups() {
  const store = getStore();
  const students = store.list('Students');
  return store
    .list('Groups')
    .map((g) => ({ ...g, members: students.filter((s) => s.group_id === g.group_id).map((s) => withGroup(s, g)) }))
    .sort((a, b) => a.group_name.localeCompare(b.group_name));
}

export function getGroup(id) {
  const store = getStore();
  const g = store.get('Groups', id);
  if (!g) throw notFound('Group not found');
  const members = store.find('Students', (s) => s.group_id === id).map((s) => withGroup(s, g)).sort((a, b) => a.name.localeCompare(b.name));
  return { ...g, members };
}

export async function createGroup({ group_name, business_name, business_idea }) {
  group_name = sanitizePlain(group_name);
  if (!group_name) throw badRequest('Group name is required');
  const store = getStore();
  if (store.findOne('Groups', (g) => g.group_name.toLowerCase() === group_name.toLowerCase())) throw conflict('Group name already exists');
  const g = await store.insert('Groups', {
    group_name, business_name: sanitizePlain(business_name), business_idea: sanitizePlain(business_idea), status: 'active',
  });
  return getGroup(g.group_id);
}

export async function updateGroup(id, patch) {
  const store = getStore();
  const g = store.get('Groups', id);
  if (!g) throw notFound('Group not found');
  const upd = {};
  if (patch.group_name !== undefined) {
    const name = sanitizePlain(patch.group_name);
    if (!name) throw badRequest('Group name is required');
    const other = store.findOne('Groups', (x) => x.group_name.toLowerCase() === name.toLowerCase() && x.group_id !== id);
    if (other) throw conflict('Group name already exists');
    upd.group_name = name;
  }
  if (patch.business_name !== undefined) upd.business_name = sanitizePlain(patch.business_name);
  if (patch.business_idea !== undefined) upd.business_idea = sanitizePlain(patch.business_idea);
  if (patch.status !== undefined) upd.status = ['active', 'inactive'].includes(patch.status) ? patch.status : g.status;
  await store.update('Groups', id, upd);
  return getGroup(id);
}

export async function addMember(group_id, student_id, component) {
  const store = getStore();
  if (!store.get('Groups', group_id)) throw notFound('Group not found');
  const s = store.get('Students', student_id);
  if (!s) throw notFound('Student not found');
  if (s.group_id && s.group_id !== group_id) {
    const other = store.get('Groups', s.group_id);
    throw conflict(`${s.name} is already a member of ${other?.group_name || 'another group'}. Remove them from that group first.`);
  }
  assertGroupHasSpace(group_id, student_id);
  const patch = { group_id };
  if (component !== undefined) patch.role = sanitizePlain(component);
  await store.update('Students', student_id, patch);
  await syncGroupMembers(group_id);
  return getGroup(group_id);
}

export async function removeMember(group_id, student_id) {
  const store = getStore();
  const s = store.get('Students', student_id);
  if (!s || s.group_id !== group_id) throw badRequest('Student is not a member of this group');
  await store.update('Students', student_id, { group_id: '' });
  await syncGroupMembers(group_id);
  return getGroup(group_id);
}

export async function assignComponent(group_id, student_id, component) {
  const store = getStore();
  const s = store.get('Students', student_id);
  if (!s || s.group_id !== group_id) throw badRequest('Student is not a member of this group');
  component = sanitizePlain(component);
  await store.update('Students', student_id, { role: component });
  return getGroup(group_id);
}

export async function deleteGroup(id) {
  const store = getStore();
  if (!store.get('Groups', id)) throw notFound('Group not found');
  if (store.count('Students', (s) => s.group_id === id)) throw conflict('Remove all members before deleting the group');
  if (store.count('Answers', (a) => a.group_id === id)) throw conflict('This group has assessment answers and cannot be deleted');
  await store.remove('Groups', id);
}
