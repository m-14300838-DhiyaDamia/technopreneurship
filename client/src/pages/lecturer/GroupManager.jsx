import { useState } from 'react';
import { Link } from 'react-router-dom';
import { get, post, patch, put, del } from '../../api/client.js';
import { Badge, Confirm, Empty, ErrorBox, Modal, Spinner, useAsync, useToast } from '../../components/ui.jsx';

export default function GroupManager() {
  const toast = useToast();
  const groups = useAsync(() => get('/lecturer/groups'));
  const students = useAsync(() => get('/lecturer/students'));
  const assessments = useAsync(() => get('/lecturer/assessments'));
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(null); // group being added to
  const [deleting, setDeleting] = useState(null);
  const components = assessments.data?.assessments?.[0]?.components || ['Marketing', 'Product Planning', 'Financial Planning'];
  const refresh = () => { groups.reload(); students.reload(); };
  const run = async (fn, msg) => { try { await fn(); if (msg) toast(msg, 'ok'); refresh(); } catch (e) { toast(e.message, 'bad'); } };

  if (groups.loading && !groups.data) return <Spinner />;
  if (groups.error) return <ErrorBox error={groups.error} retry={groups.reload} />;
  const unassigned = (students.data?.students || []).filter((s) => !s.group_id && s.active);

  return (
    <>
      <div className="page-head"><div><h1>Group management</h1><p>Each group has one business. Each member is assigned a business component; the system combines members' answers into one proposal.</p></div>
        <button className="btn primary" onClick={() => setEditing({ group_name: '', business_name: '', business_idea: '' })}>+ Create group</button></div>
      {unassigned.length > 0 && <div className="alert warn">{unassigned.length} active student(s) are not in any group: {unassigned.map((s) => s.name).join(', ')}.</div>}
      {!groups.data.groups.length ? <Empty>No groups yet.</Empty> : (
        <div className="grid grid-2">
          {groups.data.groups.map((g) => {
            const missing = components.filter((c) => !g.members.some((m) => (m.component || '').toLowerCase() === c.toLowerCase()));
            const dupes = components.filter((c) => g.members.filter((m) => (m.component || '').toLowerCase() === c.toLowerCase()).length > 1);
            return (
              <section className="card" key={g.group_id}>
                <div className="card-head"><div><h3>{g.group_name}</h3><div className="small"><strong>{g.business_name || <span className="muted">No business name</span>}</strong></div></div>
                  <div className="row"><Badge status={g.status} /><button className="btn sm" onClick={() => setEditing(g)}>Edit</button>{!g.members.length && <button className="btn sm danger" onClick={() => setDeleting(g)}>Delete</button>}</div></div>
                {g.business_idea && <p className="small muted">{g.business_idea}</p>}
                <table className="table small"><thead><tr><th>Member</th><th>Matric</th><th>Component</th><th></th></tr></thead>
                  <tbody>{g.members.map((m) => (
                    <tr key={m.student_id}><td>{m.name}</td><td className="mono">{m.matric_no}</td>
                      <td><select value={m.component || ''} onChange={(e) => run(() => put(`/lecturer/groups/${g.group_id}/members/${m.student_id}/component`, { component: e.target.value }), 'Component assigned')} aria-label={`Component for ${m.name}`}>
                        <option value="">— Not assigned —</option>{components.map((c) => <option key={c} value={c}>{c}</option>)}</select></td>
                      <td className="actions"><button className="btn sm ghost" onClick={() => window.confirm(`Remove ${m.name} from ${g.group_name}?`) && run(() => del(`/lecturer/groups/${g.group_id}/members/${m.student_id}`), 'Member removed')}>Remove</button></td></tr>))}
                    {!g.members.length && <tr><td colSpan={4} className="muted">No members yet.</td></tr>}</tbody></table>
                <div className="row between mt-sm">
                  <div className="small">{missing.length ? <span className="muted">Unassigned components: {missing.join(', ')}</span> : <Badge tone="ok">All components assigned</Badge>}{dupes.length > 0 && <div className="small" style={{ color: 'var(--warning)' }}>Duplicate component: {dupes.join(', ')}</div>}</div>
                  <button className="btn sm" disabled={g.members.length >= 4} onClick={() => setAdding(g)}>+ Add member</button>
                </div>
              </section>
            );
          })}
        </div>
      )}
      {editing && <GroupForm initial={editing} onCancel={() => setEditing(null)} onSave={async (f) => { await run(() => (f.group_id ? patch(`/lecturer/groups/${f.group_id}`, { group_name: f.group_name, business_name: f.business_name, business_idea: f.business_idea, status: f.status }) : post('/lecturer/groups', f)), f.group_id ? 'Group updated' : 'Group created'); setEditing(null); }} />}
      {adding && (
        <Modal title={`Add member to ${adding.group_name}`} onClose={() => setAdding(null)}>
          {!unassigned.length ? <p className="muted">Every active student already belongs to a group. <Link to="/lecturer/students">Add students</Link> or remove a student from another group first.</p> : (
            <AddMember students={unassigned} components={components} onAdd={async (student_id, component) => { await run(() => post(`/lecturer/groups/${adding.group_id}/members`, { student_id, component }), 'Member added'); setAdding(null); }} />)}
        </Modal>
      )}
      {deleting && <Confirm title={`Delete ${deleting.group_name}?`} tone="danger" confirmLabel="Delete" onCancel={() => setDeleting(null)} onConfirm={async () => { await run(() => del(`/lecturer/groups/${deleting.group_id}`), 'Group deleted'); setDeleting(null); }} message="This cannot be undone." />}
    </>
  );
}

function GroupForm({ initial, onCancel, onSave }) {
  const [f, setF] = useState({ status: 'active', ...initial });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <Modal title={f.group_id ? 'Edit group' : 'Create group'} onClose={onCancel}>
      <form onSubmit={(e) => { e.preventDefault(); onSave(f); }}>
        <div className="field"><label>Group name *</label><input value={f.group_name} onChange={set('group_name')} required /></div>
        <div className="field"><label>Business name</label><input value={f.business_name || ''} onChange={set('business_name')} /></div>
        <div className="field"><label>Business idea</label><textarea value={f.business_idea || ''} onChange={set('business_idea')} rows={4} /></div>
        {f.group_id && <div className="field"><label>Status</label><select value={f.status} onChange={set('status')}><option value="active">Active</option><option value="inactive">Inactive</option></select></div>}
        <div className="form-actions"><button type="button" className="btn" onClick={onCancel}>Cancel</button><button className="btn primary">Save</button></div>
      </form>
    </Modal>
  );
}

function AddMember({ students, components, onAdd }) {
  const [sid, setSid] = useState(students[0]?.student_id || '');
  const [comp, setComp] = useState('');
  return (
    <form onSubmit={(e) => { e.preventDefault(); onAdd(sid, comp); }}>
      <div className="field"><label>Student</label><select value={sid} onChange={(e) => setSid(e.target.value)}>{students.map((s) => <option key={s.student_id} value={s.student_id}>{s.name} ({s.matric_no})</option>)}</select></div>
      <div className="field"><label>Business component</label><select value={comp} onChange={(e) => setComp(e.target.value)}><option value="">— Assign later —</option>{components.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
      <div className="form-actions"><button className="btn primary">Add</button></div>
    </form>
  );
}
