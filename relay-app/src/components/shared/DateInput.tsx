import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CalendarPicker } from './CalendarPicker';
import styles from './DateInput.module.css';

interface DateInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export function DateInput({ value, onChange, placeholder = 'MM/DD/YY' }: DateInputProps) {
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  function handleToggle() {
    if (anchorRect) {
      setAnchorRect(null);
    } else {
      const rect = wrapRef.current?.getBoundingClientRect() ?? null;
      setAnchorRect(rect);
    }
  }

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <div className={styles.inputRow}>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={styles.input}
        />
        <button
          type="button"
          className={styles.calBtn}
          onClick={handleToggle}
          title="Pick date"
        >
          ▦
        </button>
      </div>

      {anchorRect && createPortal(
        <CalendarPicker
          value={value}
          onChange={(v) => { onChange(v); setAnchorRect(null); }}
          onClose={() => setAnchorRect(null)}
          anchorRect={anchorRect}
        />,
        document.body
      )}
    </div>
  );
}
