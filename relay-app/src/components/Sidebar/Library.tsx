import { useRelayStore } from '../../store/useRelayStore';
import styles from './Library.module.css';

export function Library() {
  const locations = useRelayStore((s) => s.locations);
  const records = useRelayStore((s) => s.records);
  const expandedLocations = useRelayStore((s) => s.expandedLocations);
  const expandedRecords = useRelayStore((s) => s.expandedRecords);
  const activeRecordId = useRelayStore((s) => s.activeRecordId);
  const toggleLocation = useRelayStore((s) => s.toggleLocation);
  const toggleRecord = useRelayStore((s) => s.toggleRecord);
  const setActiveRecord = useRelayStore((s) => s.setActiveRecord);

  return (
    <div className={styles.library}>
      {locations.map((loc) => {
        const isOpen = expandedLocations.has(loc.id);
        const locRecords = records
          .filter((r) => r.locationId === loc.id)
          .sort((a, b) => a.clientName.localeCompare(b.clientName));

        return (
          <div key={loc.id} className={styles.locationGroup}>
            <button
              className={styles.locationRow}
              onClick={() => toggleLocation(loc.id)}
            >
              <span className={styles.locationName}>{loc.name}</span>
              <span className={`${styles.chevron} ${isOpen ? styles.chevronUp : ''}`}>
                ▼
              </span>
            </button>

            {isOpen && (
              <div className={styles.recordList}>
                {locRecords.map((rec) => {
                  const isExpanded = expandedRecords.has(rec.id);
                  const isActive = activeRecordId === rec.id;

                  return (
                    <div key={rec.id} className={styles.recordGroup}>
                      <button
                        className={`${styles.recordRow} ${isActive ? styles.recordRowActive : ''}`}
                        onClick={() => toggleRecord(rec.id)}
                      >
                        <span className={styles.recordToggle}>
                          {isExpanded ? '−' : '+'}
                        </span>
                        <span className={styles.recordName}>{rec.clientName}</span>
                      </button>

                      {isExpanded && (
                        <div className={styles.dateList}>
                          <div className={styles.dateRow}>
                            <span className={styles.dateText}>
                              {rec.date || 'UNSCHEDULED'}
                            </span>
                            <button
                              className={`${styles.elementsBtn} ${isActive ? styles.elementsBtnActive : ''}`}
                              onClick={() => setActiveRecord(rec.id)}
                            >
                              ELEMENTS ↗
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
