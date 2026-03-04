import { useState } from 'react';
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

  const [addElementOpen, setAddElementOpen] = useState(false);
  const [editScheduleOpen, setEditScheduleOpen] = useState(false);

  const record = records.find((r) => r.id === activeRecordId);
  const location = record ? locations.find((l) => l.id === record.locationId) : null;

  const recordElements = record
    ? elements.filter((el) => el.recordId === record.id)
    : [];

  // Group elements by type to show in order, with duplicates
  const orderedElements = ALL_ELEMENT_TYPES.flatMap((type) =>
    recordElements.filter((el) => el.type === type)
  );

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
          <div className={styles.headerMetaRow}>
            {record.date && (
              <span className={styles.headerMeta}>
                {record.date}
                {record.startTime && ` · ${record.startTime}`}
                {record.endTime && ` – ${record.endTime}`}
              </span>
            )}
            <button
              className={styles.editScheduleBtn}
              onClick={() => setEditScheduleOpen(true)}
            >
              EDIT SCHEDULE
            </button>
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
