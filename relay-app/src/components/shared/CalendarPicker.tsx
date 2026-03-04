import { useEffect, useRef, useState } from 'react';
import styles from './CalendarPicker.module.css';

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS = [
  'JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE',
  'JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER',
];

function parseValue(value: string): Date | null {
  // Expect MM/DD/YY
  const parts = value.split('/');
  if (parts.length !== 3) return null;
  const mm = parseInt(parts[0], 10);
  const dd = parseInt(parts[1], 10);
  const yy = parseInt(parts[2], 10);
  if (isNaN(mm) || isNaN(dd) || isNaN(yy)) return null;
  const year = yy < 100 ? 2000 + yy : yy;
  const d = new Date(year, mm - 1, dd);
  return isNaN(d.getTime()) ? null : d;
}

function toMDY(year: number, month: number, day: number): string {
  const mm = String(month + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  const yy = String(year).slice(-2);
  return `${mm}/${dd}/${yy}`;
}

interface CalendarPickerProps {
  value: string;
  onChange: (val: string) => void;
  onClose: () => void;
  anchorRect?: DOMRect | null;
}

export function CalendarPicker({ value, onChange, onClose, anchorRect }: CalendarPickerProps) {
  const parsed = parseValue(value);
  const now = new Date();

  const [viewYear, setViewYear] = useState(parsed?.getFullYear() ?? now.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.getMonth() ?? now.getMonth());

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [onClose]);

  const selectedDate = parsed;
  const todayYear = now.getFullYear();
  const todayMonth = now.getMonth();
  const todayDay = now.getDate();

  // Build calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const cells: Array<{ day: number; month: number; year: number; outside: boolean }> = [];

  // Previous month overflow
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const m = viewMonth === 0 ? 11 : viewMonth - 1;
    const y = viewMonth === 0 ? viewYear - 1 : viewYear;
    cells.push({ day: d, month: m, year: y, outside: true });
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, month: viewMonth, year: viewYear, outside: false });
  }

  // Next month overflow to fill 6 rows (42 cells)
  while (cells.length < 42) {
    const d = cells.length - firstDay - daysInMonth + 1;
    const m = viewMonth === 11 ? 0 : viewMonth + 1;
    const y = viewMonth === 11 ? viewYear + 1 : viewYear;
    cells.push({ day: d, month: m, year: y, outside: true });
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  function selectCell(cell: { day: number; month: number; year: number }) {
    onChange(toMDY(cell.year, cell.month, cell.day));
    onClose();
  }

  const fixedStyle: React.CSSProperties | undefined = anchorRect
    ? {
        position: 'fixed',
        top: anchorRect.bottom + 4,
        left: anchorRect.left,
        zIndex: 9999,
      }
    : undefined;

  return (
    <div className={styles.picker} ref={ref} style={fixedStyle}>
      <div className={styles.header}>
        <button className={styles.navBtn} onClick={prevMonth} type="button">◀</button>
        <span className={styles.monthLabel}>{MONTHS[viewMonth]} {viewYear}</span>
        <button className={styles.navBtn} onClick={nextMonth} type="button">▶</button>
      </div>

      <div className={styles.grid}>
        {DAYS.map((d) => (
          <div key={d} className={styles.dayHeader}>{d}</div>
        ))}
        {cells.map((cell, i) => {
          const isSelected =
            selectedDate &&
            selectedDate.getFullYear() === cell.year &&
            selectedDate.getMonth() === cell.month &&
            selectedDate.getDate() === cell.day;
          const isToday =
            todayYear === cell.year &&
            todayMonth === cell.month &&
            todayDay === cell.day;

          return (
            <button
              key={i}
              type="button"
              className={[
                styles.cell,
                cell.outside ? styles.outside : '',
                isSelected ? styles.selected : '',
                isToday && !isSelected ? styles.today : '',
              ].filter(Boolean).join(' ')}
              onClick={() => selectCell(cell)}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
