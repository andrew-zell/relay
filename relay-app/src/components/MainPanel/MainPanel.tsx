import { useEffect, useRef, useState } from 'react';
import { useRelayStore } from '../../store/useRelayStore';
import { ALL_ELEMENT_TYPES } from '../../types';
import { ElementHolder } from './ElementHolder';
import { AddElementModal } from '../Modals/AddElementModal';
import { EditScheduleModal } from '../Modals/EditScheduleModal';
import styles from './MainPanel.module.css';

export function MainPanel() {
  const activeRecordId = useRelayStore((s) => s.activeRecordId);
  const records = useRelayStore((s) => s.records);
  const locations = useRelayStore((s) => s.locations);
  const elements = useRelayStore((s) => s.elements);
  const duplicateRecord = useRelayStore((s) => s.duplicateRecord);
  const copyRecordToLocation = useRelayStore((s) => s.copyRecordToLocation);
  const expandedLocations = useRelayStore((s) => s.expandedLocations);
  const toggleLocation = useRelayStore((s) => s.toggleLocation);

  const [addElementOpen, setAddElementOpen] = useState(false);
  const [editScheduleOpen, setEditScheduleOpen] = useState(false);
  const [copyToOpen, setCopyToOpen] = useState(false);
  const [pendingLocationId, setPendingLocationId] = useState<string | null>(null);
  const copyToRef = useRef<HTMLDivElement>(null);

  const record = records.find((r) => r.id === activeRecordId);
  const location = record ? locations.find((l) => l.id === record.locationId) : null;
  const otherLocations = locations.filter((l) => l.id !== record?.locationId);

  const recordElements = record
    ? elements.filter((el) => el.recordId === record.id)
    : [];

  const orderedElements = ALL_ELEMENT_TYPES.flatMap((type) =>
    recordElements.filter((el) => el.type === type)
  );

  // Close copy-to dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (copyToRef.current && !copyToRef.current.contains(e.target as Node)) {
        setCopyToOpen(false);
        setPendingLocationId(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleCopyConfirm() {
    if (!record || !pendingLocationId) return;
    copyRecordToLocation(record.id, pendingLocationId);
    if (!expandedLocations.has(pendingLocationId)) {
      toggleLocation(pendingLocationId);
    }
    setCopyToOpen(false);
    setPendingLocationId(null);
  }

  if (!record) {
    return (
      <main className={styles.panel}>
        <div className={styles.empty}>
          <p>SELECT A RECORD FROM THE LIBRARY</p>
          <p className={styles.emptyHint}>CLICK ELEMENTS ↗ TO VIEW ELEMENT HOLDERS</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.panel}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.headerTitle}>
            {location?.name ?? ''} | {record.clientName}
          </span>
          {record.date && (
            <span className={styles.headerMeta}>
              {record.date}
              {record.startTime && ` · ${record.startTime}`}
              {record.endTime && ` – ${record.endTime}`}
            </span>
          )}
        </div>

        <div className={styles.headerActions}>
          <button
            className={styles.headerBtn}
            onClick={() => setEditScheduleOpen(true)}
          >
            EDIT SCHEDULE
          </button>

          <button
            className={styles.headerBtn}
            onClick={() => duplicateRecord(record.id)}
          >
            DUPLICATE RECORD
          </button>

          <div className={styles.copyToWrap} ref={copyToRef}>
            <button
              className={`${styles.headerBtn} ${copyToOpen ? styles.headerBtnActive : ''}`}
              onClick={() => { setCopyToOpen((o) => !o); setPendingLocationId(null); }}
            >
              COPY TO ▾
            </button>

            {copyToOpen && (
              <div className={styles.copyToDropdown}>
                {otherLocations.length === 0 ? (
                  <div className={styles.copyToEmpty}>NO OTHER LOCATIONS</div>
                ) : (
                  <>
                    {otherLocations.map((loc) => (
                      <button
                        key={loc.id}
                        className={`${styles.copyToItem} ${pendingLocationId === loc.id ? styles.copyToItemSelected : ''}`}
                        onClick={() => setPendingLocationId(loc.id)}
                      >
                        {loc.name}
                      </button>
                    ))}

                    {pendingLocationId && (
                      <div className={styles.copyToWarning}>
                        <p className={styles.copyToWarningText}>
                          ⚠ Screen dimensions between centers may be different. Please ensure you adjust accordingly.
                        </p>
                        <div className={styles.copyToWarningActions}>
                          <button className={styles.copyToConfirmBtn} onClick={handleCopyConfirm}>
                            CONFIRM
                          </button>
                          <button className={styles.copyToCancelBtn} onClick={() => setPendingLocationId(null)}>
                            CANCEL
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sub-header */}
      <div className={styles.subHeader}>
        <span className={styles.elementsLabel}>ELEMENTS</span>
        <button
          className={styles.addElementBtn}
          onClick={() => setAddElementOpen(true)}
        >
          + ADD ELEMENT
        </button>
      </div>

      {/* Element grid */}
      <div className={styles.grid}>
        {orderedElements.map((el) => (
          <ElementHolder key={el.id} element={el} />
        ))}
        {orderedElements.length === 0 && (
          <div className={styles.noElements}>
            <p>NO ELEMENTS YET</p>
            <button
              className={styles.addFirstBtn}
              onClick={() => setAddElementOpen(true)}
            >
              + ADD ELEMENT
            </button>
          </div>
        )}
      </div>

      {addElementOpen && (
        <AddElementModal
          recordId={record.id}
          onClose={() => setAddElementOpen(false)}
        />
      )}

      {editScheduleOpen && (
        <EditScheduleModal
          record={record}
          onClose={() => setEditScheduleOpen(false)}
        />
      )}
    </main>
  );
}
