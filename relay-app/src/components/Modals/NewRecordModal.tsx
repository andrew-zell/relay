import { useState } from 'react';
import { useRelayStore } from '../../store/useRelayStore';
import { ModalBase } from './ModalBase';
import { DateInput } from '../shared/DateInput';
import styles from './FormModal.module.css';
import { TIMES } from '../../utils/times';

interface NewRecordModalProps {
  onClose: () => void;
}

export function NewRecordModal({ onClose }: NewRecordModalProps) {
  const locations = useRelayStore((s) => s.locations);
  const addRecord = useRelayStore((s) => s.addRecord);
  const expandedLocations = useRelayStore((s) => s.expandedLocations);
  const toggleLocation = useRelayStore((s) => s.toggleLocation);

  const [clientName, setClientName] = useState('');
  const [locationId, setLocationId] = useState(locations[0]?.id ?? '');
  const [briefingType, setBriefingType] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clientName.trim()) return;
    addRecord({
      clientName: clientName.trim().toUpperCase(),
      locationId,
      briefingType: briefingType.trim().toUpperCase(),
      date,
      startTime,
      endTime,
    });
    if (!expandedLocations.has(locationId)) {
      toggleLocation(locationId);
    }
    onClose();
  }

  return (
    <ModalBase title="NEW RECORD" onClose={onClose} wide>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>RECORD NAME</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="CLIENT NAME"
              required
            />
          </div>
          <div className={styles.fieldWithAddon}>
            <label className={styles.label}>LOCATION</label>
            <div className={styles.selectWrap}>
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
              <span className={styles.selectArrow}>▼</span>
            </div>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.row}>
          <div className={styles.fieldWithAddon}>
            <label className={styles.label}>BRIEFING TYPE</label>
            <div className={styles.selectWrap}>
              <select
                value={briefingType}
                onChange={(e) => setBriefingType(e.target.value)}
              >
                <option value="">SELECT TYPE</option>
                <option value="EXECUTIVE">EXECUTIVE</option>
                <option value="PRODUCT">PRODUCT</option>
                <option value="PARTNER">PARTNER</option>
                <option value="CUSTOM">CUSTOM</option>
              </select>
              <span className={styles.selectArrow}>▼</span>
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>DATE</label>
            <DateInput value={date} onChange={setDate} />
          </div>
          <div className={styles.fieldWithAddon}>
            <label className={styles.label}>START</label>
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
                {TIMES.slice(0, -1).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <span className={styles.selectArrow}>▼</span>
            </div>
          </div>
          <div className={styles.fieldWithAddon}>
            <label className={styles.label}>END</label>
            <div className={styles.selectWrap}>
              <select value={endTime} onChange={(e) => setEndTime(e.target.value)}>
                <option value="">--</option>
                {TIMES.map((t, i) => (
                  <option
                    key={t}
                    value={t}
                    disabled={startTime ? i <= TIMES.indexOf(startTime) : false}
                  >
                    {t}
                  </option>
                ))}
              </select>
              <span className={styles.selectArrow}>▼</span>
            </div>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.actions}>
          <button type="submit" className={styles.confirmBtn}>
            + CREATE RECORD
          </button>
        </div>
      </form>
    </ModalBase>
  );
}
