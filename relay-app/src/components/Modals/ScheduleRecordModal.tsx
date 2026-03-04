import { useState } from 'react';
import { useRelayStore } from '../../store/useRelayStore';
import { ModalBase } from './ModalBase';
import { DateInput } from '../shared/DateInput';
import styles from './FormModal.module.css';
import tabStyles from './ScheduleRecordModal.module.css';
import { TIMES } from '../../utils/times';

interface ScheduleRecordModalProps {
  onClose: () => void;
}

export function ScheduleRecordModal({ onClose }: ScheduleRecordModalProps) {
  const records = useRelayStore((s) => s.records);
  const locations = useRelayStore((s) => s.locations);
  const updateRecord = useRelayStore((s) => s.updateRecord);
  const addRecord = useRelayStore((s) => s.addRecord);
  const toggleLocation = useRelayStore((s) => s.toggleLocation);
  const expandedLocations = useRelayStore((s) => s.expandedLocations);

  const [mode, setMode] = useState<'existing' | 'new'>('existing');

  // Existing record fields
  const unscheduledRecords = records.filter((r) => !r.date);
  const [selectedRecordId, setSelectedRecordId] = useState(unscheduledRecords[0]?.id ?? records[0]?.id ?? '');
  const [existingDate, setExistingDate] = useState('');
  const [existingStart, setExistingStart] = useState('');
  const [existingEnd, setExistingEnd] = useState('');

  // New record fields
  const [clientName, setClientName] = useState('');
  const [locationId, setLocationId] = useState(locations[0]?.id ?? '');
  const [briefingType, setBriefingType] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newStart, setNewStart] = useState('');
  const [newEnd, setNewEnd] = useState('');

  function handleScheduleExisting(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedRecordId || !existingDate) return;
    updateRecord(selectedRecordId, {
      date: existingDate,
      startTime: existingStart,
      endTime: existingEnd,
    });
    onClose();
  }

  function handleCreateNew(e: React.FormEvent) {
    e.preventDefault();
    if (!clientName.trim()) return;
    addRecord({
      clientName: clientName.trim().toUpperCase(),
      locationId,
      briefingType: briefingType.trim().toUpperCase(),
      date: newDate,
      startTime: newStart,
      endTime: newEnd,
    });
    if (!expandedLocations.has(locationId)) {
      toggleLocation(locationId);
    }
    onClose();
  }

  return (
    <ModalBase title="SCHEDULE EVENT" onClose={onClose} wide>
      <div className={tabStyles.tabs}>
        <button
          className={`${tabStyles.tab} ${mode === 'existing' ? tabStyles.tabActive : ''}`}
          onClick={() => setMode('existing')}
        >
          EXISTING RECORD
        </button>
        <button
          className={`${tabStyles.tab} ${mode === 'new' ? tabStyles.tabActive : ''}`}
          onClick={() => setMode('new')}
        >
          NEW RECORD
        </button>
      </div>

      {mode === 'existing' && (
        <form onSubmit={handleScheduleExisting} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>RECORD</label>
            <div className={styles.selectWrap}>
              <select
                value={selectedRecordId}
                onChange={(e) => setSelectedRecordId(e.target.value)}
                required
              >
                {records.map((r) => {
                  const loc = locations.find((l) => l.id === r.locationId);
                  return (
                    <option key={r.id} value={r.id}>
                      {r.clientName} — {loc?.name ?? ''}
                      {r.date ? ` (${r.date})` : ' (UNSCHEDULED)'}
                    </option>
                  );
                })}
              </select>
              <span className={styles.selectArrow}>▼</span>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>DATE</label>
              <DateInput value={existingDate} onChange={setExistingDate} />
            </div>
            <div className={styles.fieldWithAddon}>
              <label className={styles.label}>START TIME</label>
              <div className={styles.selectWrap}>
                <select
                  value={existingStart}
                  onChange={(e) => {
                    setExistingStart(e.target.value);
                    if (existingEnd && TIMES.indexOf(existingEnd) <= TIMES.indexOf(e.target.value)) {
                      setExistingEnd('');
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
                <select value={existingEnd} onChange={(e) => setExistingEnd(e.target.value)}>
                  <option value="">--</option>
                  {TIMES.map((t, i) => (
                    <option key={t} value={t} disabled={existingStart ? i <= TIMES.indexOf(existingStart) : false}>
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
            <button type="submit" className={styles.confirmBtn}>+ ADD TO SCHEDULE</button>
          </div>
        </form>
      )}

      {mode === 'new' && (
        <form onSubmit={handleCreateNew} className={styles.form}>
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
                <select value={locationId} onChange={(e) => setLocationId(e.target.value)}>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
                <span className={styles.selectArrow}>▼</span>
              </div>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.fieldWithAddon}>
              <label className={styles.label}>BRIEFING TYPE</label>
              <div className={styles.selectWrap}>
                <select value={briefingType} onChange={(e) => setBriefingType(e.target.value)}>
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
              <DateInput value={newDate} onChange={setNewDate} />
            </div>
            <div className={styles.fieldWithAddon}>
              <label className={styles.label}>START</label>
              <div className={styles.selectWrap}>
                <select
                  value={newStart}
                  onChange={(e) => {
                    setNewStart(e.target.value);
                    if (newEnd && TIMES.indexOf(newEnd) <= TIMES.indexOf(e.target.value)) {
                      setNewEnd('');
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
              <label className={styles.label}>END</label>
              <div className={styles.selectWrap}>
                <select value={newEnd} onChange={(e) => setNewEnd(e.target.value)}>
                  <option value="">--</option>
                  {TIMES.map((t, i) => (
                    <option key={t} value={t} disabled={newStart ? i <= TIMES.indexOf(newStart) : false}>
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
            <button type="submit" className={styles.confirmBtn}>+ CREATE &amp; SCHEDULE</button>
          </div>
        </form>
      )}
    </ModalBase>
  );
}
