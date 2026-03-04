import { useState } from 'react';
import { useRelayStore } from '../../store/useRelayStore';
import { ScheduleRecordModal } from '../Modals/ScheduleRecordModal';
import styles from './Schedule.module.css';

/** Parse MM/DD/YY into a comparable Date (assumes 20xx) */
function parseDate(str: string): Date | null {
  const parts = str.split('/');
  if (parts.length !== 3) return null;
  const [mm, dd, yy] = parts.map(Number);
  if (isNaN(mm) || isNaN(dd) || isNaN(yy)) return null;
  return new Date(2000 + yy, mm - 1, dd);
}

function isUpcoming(dateStr: string): boolean {
  const d = parseDate(dateStr);
  if (!d) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d >= today;
}

export function Schedule() {
  const records = useRelayStore((s) => s.records);
  const locations = useRelayStore((s) => s.locations);
  const setActiveRecord = useRelayStore((s) => s.setActiveRecord);

  const [showModal, setShowModal] = useState(false);
  const [pastExpanded, setPastExpanded] = useState(false);

  // Only records that have a date set
  const scheduledRecords = records.filter((r) => !!r.date);

  const upcoming = scheduledRecords
    .filter((r) => isUpcoming(r.date))
    .sort((a, b) => {
      const da = parseDate(a.date);
      const db = parseDate(b.date);
      if (!da || !db) return 0;
      return da.getTime() - db.getTime();
    });

  const past = scheduledRecords
    .filter((r) => !isUpcoming(r.date))
    .sort((a, b) => {
      const da = parseDate(a.date);
      const db = parseDate(b.date);
      if (!da || !db) return 0;
      return db.getTime() - da.getTime(); // most recent past first
    });

  function EventRow({ record }: { record: typeof records[0] }) {
    const location = locations.find((l) => l.id === record.locationId);
    return (
      <div className={styles.eventRow}>
        <span className={styles.eventDate}>{record.date}</span>
        <span className={styles.eventClient}>{record.clientName}</span>
        <button
          className={styles.locationBadge}
          onClick={() => setActiveRecord(record.id)}
          title="View record elements"
        >
          {location?.name ?? '—'}
        </button>
      </div>
    );
  }

  return (
    <div className={styles.schedule}>
      <div className={styles.header}>
        <span>SCHEDULE</span>
        <button className={styles.addBtn} onClick={() => setShowModal(true)} title="Schedule Event">
          +
        </button>
      </div>

      <div className={styles.eventList}>
        {upcoming.length === 0 && past.length === 0 && (
          <div className={styles.empty}>NO EVENTS SCHEDULED</div>
        )}

        {upcoming.map((r) => <EventRow key={r.id} record={r} />)}

        {past.length > 0 && (
          <div className={styles.pastSection}>
            <button
              className={styles.pastToggle}
              onClick={() => setPastExpanded((v) => !v)}
            >
              <span>PAST EVENTS</span>
              <span className={`${styles.chevron} ${pastExpanded ? styles.chevronUp : ''}`}>▼</span>
            </button>

            {pastExpanded && (
              <div className={styles.pastList}>
                {past.map((r) => <EventRow key={r.id} record={r} />)}
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && <ScheduleRecordModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
