import { useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';

const clean = (html) => DOMPurify.sanitize(html || '', { USE_PROFILES: { html: true }, FORBID_TAGS: ['style', 'img', 'svg', 'math', 'a', 'script'], FORBID_ATTR: ['style'] });

/**
 * Lightweight rich-text editor (bold, italic, underline, lists, headings).
 * Emits sanitised HTML. Large pastes are reported through onLargePaste so the
 * assessment page can record a monitoring event.
 */
export function RichTextEditor({ value, onChange, placeholder = 'Type your answer here…', disabled = false, onLargePaste, minHeight = 220, id }) {
  const ref = useRef(null);
  const lastValue = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    if (value !== lastValue.current && ref.current.innerHTML !== (value || '')) {
      ref.current.innerHTML = clean(value || '');
      lastValue.current = value;
    }
  }, [value]);

  const emit = () => {
    const html = clean(ref.current.innerHTML);
    const normalised = html === '<br>' || html === '<div><br></div>' ? '' : html;
    lastValue.current = normalised;
    onChange(normalised);
  };

  const exec = (cmd, arg) => { if (disabled) return; ref.current.focus(); document.execCommand(cmd, false, arg); emit(); };

  const onPaste = (e) => {
    e.preventDefault();
    const html = e.clipboardData.getData('text/html');
    const text = e.clipboardData.getData('text/plain');
    const content = html ? clean(html) : text.split(/\n{2,}/).map((p) => `<p>${p.replace(/</g, '&lt;').replace(/\n/g, '<br>')}</p>`).join('');
    if (text.length > 300) onLargePaste?.(text.length);
    document.execCommand('insertHTML', false, content);
    emit();
  };

  return (
    <div className="rte">
      <div className="rte-toolbar" role="toolbar" aria-label="Formatting">
        <button type="button" title="Bold" onClick={() => exec('bold')} disabled={disabled}><b>B</b></button>
        <button type="button" title="Italic" onClick={() => exec('italic')} disabled={disabled}><i>I</i></button>
        <button type="button" title="Underline" onClick={() => exec('underline')} disabled={disabled}><u>U</u></button>
        <button type="button" title="Heading" onClick={() => exec('formatBlock', 'h3')} disabled={disabled}>H</button>
        <button type="button" title="Paragraph" onClick={() => exec('formatBlock', 'p')} disabled={disabled}>¶</button>
        <button type="button" title="Bullet list" onClick={() => exec('insertUnorderedList')} disabled={disabled}>• List</button>
        <button type="button" title="Numbered list" onClick={() => exec('insertOrderedList')} disabled={disabled}>1. List</button>
        <button type="button" title="Remove formatting" onClick={() => exec('removeFormat')} disabled={disabled}>Clear</button>
      </div>
      <div id={id} ref={ref} className="rte-area" style={{ minHeight }} contentEditable={!disabled} suppressContentEditableWarning data-placeholder={placeholder}
        onInput={emit} onBlur={emit} onPaste={onPaste} role="textbox" aria-multiline="true" aria-disabled={disabled} spellCheck />
    </div>
  );
}
