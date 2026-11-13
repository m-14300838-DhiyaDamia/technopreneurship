import { RichTextEditor } from './RichTextEditor.jsx';

/** Renders the right input for a question type. Value is always a string. */
export function AnswerEditor({ question, value, onChange, disabled, onLargePaste }) {
  const q = question;
  switch (q.question_type) {
    case 'multiple_choice':
      return (
        <div className="stack" role="radiogroup" aria-label="Options">
          {(q.options || []).map((o) => (
            <label key={o.key} className={`qbtn ${value === o.key ? 'active' : ''}`} style={{ justifyContent: 'flex-start' }}>
              <input type="radio" name={q.question_id} value={o.key} checked={value === o.key} disabled={disabled} onChange={() => onChange(o.key)} />
              <strong>{o.key}.</strong> <span>{o.text}</span>
            </label>
          ))}
        </div>
      );
    case 'short_answer':
      return <textarea value={value} disabled={disabled} maxLength={5000} onChange={(e) => onChange(e.target.value)} onPaste={(e) => { const t = e.clipboardData.getData('text/plain'); if (t.length > 300) onLargePaste?.(t.length); }} placeholder="Type a concise answer…" rows={5} />;
    case 'numerical': {
      const [first, ...rest] = String(value || '').split('\n');
      const working = rest.join('\n').replace(/^\n/, '');
      return (
        <div className="stack">
          <div className="field"><label>Final answer (number)</label><input type="text" inputMode="decimal" className="input" style={{ maxWidth: 260 }} value={first} disabled={disabled} onChange={(e) => onChange(`${e.target.value}\n${working}`)} placeholder="e.g. 12500.00" /></div>
          <div className="field"><label>Working / explanation</label><textarea value={working} disabled={disabled} rows={6} onChange={(e) => onChange(`${first}\n${e.target.value}`)} onPaste={(e) => { const t = e.clipboardData.getData('text/plain'); if (t.length > 300) onLargePaste?.(t.length); }} placeholder="Show how you reached the answer" /></div>
        </div>
      );
    }
    default:
      return <RichTextEditor id={`answer-${q.question_id}`} value={value} onChange={onChange} disabled={disabled} onLargePaste={onLargePaste} minHeight={260} />;
  }
}
