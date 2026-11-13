import { useState } from 'react';
import { get, post, patch } from '../../api/client.js';
import { Alert, Badge, Empty, ErrorBox, Modal, Spinner, useAsync, useToast } from '../../components/ui.jsx';

const blank = { matric_no: '', name: '', email: '', section: '', group_id: '', component: '' };

export default function StudentManager() {
  const toast = useToast();
  const students = useAsync(() => get('/lecturer/students'));
  const groups = useAsync(() => get('/lecturer/groups'));
  const assessments = useAsync(() => get('/lecturer/assessments'));
  const [editing, setEditing] = useState(null); // null | {} (new) | student
  const [credential, setCredential] = useState(null);
  const [q, setQ] = useState('');
  const components = assessments.data?.assessments?.[0]?.components || ['Marketing', 'Product Planning', 'Financial Planning'];

  const save = async (form) => {
    try {
      if (form.student_id) { await patch(`/lecturer/students/${form.student_id}`, { name: form.name, email: form.email, section: form.section, group_id: form.group_id, component: form.component, matric_no: form.matric_no, active: form.active }); toast('Student updated', 'ok'); }
      else { const r = await post('/lecturer/students', form); setCredential({ name: r.student.name, username: r.student.matric_no, password: r.initialPassword }); toast('Student created', 'ok'); }
      setEditing(null); students.reload(); groups.reload();
    } catch (e) { toast(e.message, 'bad'); }
  };
  const resetPw = async (s) => {
    if (!window.confirm(`Reset the password for ${s.name}? The current password will stop working.`)) return;
    try { const r = await post(`/lecturer/students/${s.student_id}/reset-password`, {}); setCredential({ name: s.name, username: s.matric_no, password: r.password }); } catch (e) { toast(e.message, 'bad'); }
  };

  if (students.loading && !students.data) return <Spinner />;
  if (students.error) return <ErrorBox error={students.error} retry={students.reload} />;
  const list = students.data.students.filter((s) => !q || s.name.toLowerCase().includes(q.toLowerCase()) || s.matric_no.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <div className="page-head"><div><h1>Student management</h1><p>Create student accounts, assign groups and business components.</p></div>
        <div className="row"><input type="search" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} /><button className="btn primary" onClick={() => setEditing({ ...blank })}>+ Add student</button></div></div>
      {!list.length ? <Empty>No students yet. Add students one by one; each gets a login (username = matric number).</Empty> : (
        <div className="table-wrap"><table className="table">
          <thead><tr><th>Name</th><th>Matric No</th><th>Email</th><th>Section</th><th>Group</th><th>Component</th><th>Active</th><th></th></tr></thead>
          <tbody>{list.map((s) => (
            <tr key={s.student_id}><td>{s.name}</td><td className="mono">{s.matric_no}</td><td>{s.email || '—'}</td><td>{s.section || '—'}</td><td>{s.group_name || <span className="muted">—</span>}</td>
              <td>{s.component ? <Badge tone="gold">{s.component}</Badge> : <span className="muted">—</span>}</td><td>{s.active ? <Badge tone="ok">Active</Badge> : <Badge>Inactive</Badge>}</td>
              <td className="actions"><button className="btn sm" onClick={() => setEditing({ ...s, component: s.component || '' })}>Edit</button> <button className="btn sm ghost" onClick={() => resetPw(s)}>Reset password</button></td></tr>))}</tbody>
        </table></div>
      )}
      {editing && <StudentForm initial={editing} groups={groups.data?.groups || []} components={components} onCancel={() => setEditing(null)} onSave={save} />}
      {credential && (
        <Modal title="Login details (shown once)" onClose={() => setCredential(null)} footer={<button className="btn primary" onClick={() => setCredential(null)}>Done</button>}>
          <Alert tone="warn">Copy these details now and pass them to the student securely. They will not be shown again. The student must change the password at first login.</Alert>
          <table className="table"><tbody><tr><th>Student</th><td>{credential.name}</td></tr><tr><th>Username</th><td className="mono">{credential.username}</td></tr><tr><th>Temporary password</th><td className="mono">{credential.password}</td></tr></tbody></table>
        </Modal>
      )}
    </>
  );
}

function StudentForm({ initial, groups, components, onCancel, onSave }) {
  const [f, setF] = useState(initial);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  return (
    <Modal title={f.student_id ? `Edit ${initial.name}` : 'Add student'} onClose={onCancel}>
      <form onSubmit={async (e) => { e.preventDefault(); setBusy(true); try { await onSave(f); } finally { setBusy(false); } }}>
        <div className="form-row">
          <div className="field"><label>Matric number *</label><input value={f.matric_no} onChange={set('matric_no')} required /></div>
          <div className="field"><label>Full name *</label><input value={f.name} onChange={set('name')} required /></div>
          <div className="field"><label>Email</label><input type="email" value={f.email || ''} onChange={set('email')} /></div>
          <div className="field"><label>Section / class</label><input value={f.section || ''} onChange={set('section')} /></div>
          <div className="field"><label>Group</label><select value={f.group_id || ''} onChange={set('group_id')}><option value="">— No group —</option>{groups.map((g) => <option key={g.group_id} value={g.group_id}>{g.group_name} ({g.members.length}/4)</option>)}</select></div>
          <div className="field"><label>Business component</label><select value={f.component || ''} onChange={set('component')}><option value="">— Not assigned —</option>{components.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
          {f.student_id && <label className="check"><input type="checkbox" checked={f.active !== false} onChange={set('active')} /> Active (can log in)</label>}
        </div>
        {!f.student_id && <p className="hint">A login account is created automatically. Username = matric number. A temporary password will be shown once.</p>}
        <div className="form-actions"><button type="button" className="btn" onClick={onCancel}>Cancel</button><button className="btn primary" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button></div>
      </form>
    </Modal>
  );
}
