import { useState } from 'react';
import { useRelayStore } from '../../store/useRelayStore';
import type { RelayRecord } from '../../types';
import { ModalBase } from './ModalBase';
import { DateInput } from '../shared/DateInput';
import styles from './FormModal.module.css';
import { TIMES } from '../../utils/times';

interface EditScheduleModalProps {
  record: RelayRecord;
  onClose: () => void;
}

export function EditScheduleModal({ record, onClose }: EditScheduleModalProps) {
  const updateRecord = useRelayStore((s) => s.updateRecord);

  const [date, setDate] = useState(record.date ?? '');
  const [startTime, setStartTime] = useState(record.startTime ?? '');
  const [endTime, setEndTime] = useState(record.endTime ?? '');

  const isScheduled = !!record.date;

  function handleSave() {
    if (!date) return;
    updateRecord(record.id, { date, startTime, endTime });
    onClose();
  }

  function handleRemove() {
    updateRecord(record.id, { date: '', startTime: '', endTime: '' });
    onClose();
  }

  return (
    <ModalBase title="EDIT SCHEDULE" onClose={onClose}>
      <div className={styles.form}>
        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>DATE</label>
            <DateInput value={date} onChange={setDate} />
          </div>
          <div className={styles.fieldWithAddon}>
            <label className={styles.label}>START TIME</label>
            <div className={styles.selectWrap}>
              <select
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  if (endTime && TIMES.indexOf(endTime) <= TIMES.indexOf(e.target.value)) {
                    setEndTime('');
                  }
                }}
              >
                <option value="">--</option>
                {TIMES.slice(0, -1).map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <span className={styles.selectArrow}>▼</span>
            </div>
          </div>
          <div className={styles.fieldWithAddon}>
            <label className={styles.label}>END TIME</label>
            <div className={styles.selectWrap}>
              <select value={endTime} onChange={(e) => setEndTime(e.target.value)}>
                <option value="">--</option>
                {TIMES.map((t, i) => (
                  <option key={t} value={t} disabled={startTime ? i <= TIMES.indexOf(startTime) : false}>
                    {t}
                  </option>
                ))}
              </select>
              <span className={styles.selectArrow}>▼</span>
            </div>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.actions} style={{ gap: 10, display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className={styles.confirmBtn} onClick={handleSave}>
            {isScheduled ? 'SAVE CHANGES' : '+ ADD TO SCHEDULE'}
          </button>
          {isScheduled && (
            <button
              className={styles.confirmBtn}
              style={{ background: 'var(--mid)', color: 'var(--dark)' }}
              onClick={handleRemove}
            >
              REMOVE FROM SCHEDULE
            </button>
          )}
        </div>
      </div>
    </ModalBase>
  );
}
