import { useState, useRef } from 'react';
import { useRelayStore } from '../../store/useRelayStore';
import type { Participant } from '../../types';
import styles from './BriefingPanel.module.css';

const LOCATION_CODES: Record<string, string> = {
  'loc-sj': 'SJ',
  'loc-ld': 'LD',
  'loc-tk': 'TK',
  'loc-sg': 'SG',
};

export function BriefingPanel() {
  const locations = useRelayStore((s) => s.locations);
  const records = useRelayStore((s) => s.records);
  const participants = useRelayStore((s) => s.participants);
  const addParticipant = useRelayStore((s) => s.addParticipant);
  const updateParticipant = useRelayStore((s) => s.updateParticipant);
  const removeParticipant = useRelayStore((s) => s.removeParticipant);

  const [locationFilter, setLocationFilter] = useState<string>('ALL');
  const [expandedRecords, setExpandedRecords] = useState<Set<string>>(new Set());

  const filteredRecords = records.filter((r) =>
    locationFilter === 'ALL' ? true : r.locationId === locationFilter
  );

  function toggleRecord(id: string) {
    setExpandedRecords((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function getParticipantsForRecord(recordId: string) {
    return participants.filter((p) => p.recordId === recordId);
  }

  return (
    <div className={styles.panel}>
      {/* Panel header */}
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>BRIEFING MANAGEMENT</span>
        <div className={styles.filterTabs}>
          {['ALL', ...locations.map((l) => l.id)].map((id) => (
            <button
              key={id}
              className={`${styles.filterTab} ${locationFilter === id ? styles.filterTabActive : ''}`}
              onClick={() => setLocationFilter(id)}
            >
              {id === 'ALL' ? 'ALL' : LOCATION_CODES[id] ?? id}
            </button>
          ))}
        </div>
      </div>

      {/* Column headers */}
      <div className={styles.tableHeader}>
        <span className={styles.colDate}>DATE</span>
        <span className={styles.colClient}>CLIENT</span>
        <span className={styles.colType}>TYPE</span>
        <span className={styles.colTime}>TIME</span>
        <span className={styles.colLocation}>CENTER</span>
        <span className={styles.colParticipants}>PARTICIPANTS</span>
        <span className={styles.colExpand} />
      </div>

      {/* Record rows */}
      <div className={styles.recordList}>
        {filteredRecords.length === 0 && (
          <div className={styles.empty}>NO RECORDS FOUND</div>
        )}
        {filteredRecords.map((record) => {
          const location = locations.find((l) => l.id === record.locationId);
          const recordParticipants = getParticipantsForRecord(record.id);
          const isExpanded = expandedRecords.has(record.id);

          return (
            <div key={record.id} className={styles.recordGroup}>
              {/* Record row */}
              <button
                className={`${styles.recordRow} ${isExpanded ? styles.recordRowExpanded : ''}`}
                onClick={() => toggleRecord(record.id)}
              >
                <span className={styles.colDate}>{record.date || '—'}</span>
                <span className={styles.colClient}>{record.clientName}</span>
                <span className={styles.colType}>{record.briefingType}</span>
                <span className={styles.colTime}>
                  {record.startTime && record.endTime
                    ? `${record.startTime} – ${record.endTime}`
                    : record.startTime || '—'}
                </span>
                <span className={styles.colLocation}>
                  {LOCATION_CODES[record.locationId] ?? location?.name ?? '—'}
                </span>
                <span className={styles.colParticipants}>
                  {recordParticipants.length > 0 ? (
                    <span className={styles.participantBadge}>
                      {recordParticipants.length} PERSON{recordParticipants.length !== 1 ? 'S' : ''}
                    </span>
                  ) : (
                    <span className={styles.participantEmpty}>NONE</span>
                  )}
                </span>
                <span className={`${styles.colExpand} ${styles.chevron} ${isExpanded ? styles.chevronUp : ''}`}>
                  ▼
                </span>
              </button>

              {/* Participant table */}
              {isExpanded && (
                <ParticipantTable
                  recordId={record.id}
                  clientName={record.clientName}
                  participants={recordParticipants}
                  onAdd={addParticipant}
                  onUpdate={updateParticipant}
                  onRemove={removeParticipant}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Participant Table ───────────────────────────────────────────────────────

interface ParticipantTableProps {
  recordId: string;
  clientName: string;
  participants: Participant[];
  onAdd: (p: Omit<Participant, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<Omit<Participant, 'id' | 'recordId'>>) => void;
  onRemove: (id: string) => void;
}

function ParticipantTable({ recordId, clientName, participants, onAdd, onUpdate, onRemove }: ParticipantTableProps) {
  const [draft, setDraft] = useState({ name: '', email: '', position: '', company: clientName });
  const nameRef = useRef<HTMLInputElement>(null);

  function handleAdd() {
    if (!draft.name.trim()) {
      nameRef.current?.focus();
      return;
    }
    onAdd({ recordId, ...draft });
    setDraft({ name: '', email: '', position: '', company: clientName });
    nameRef.current?.focus();
  }

  return (
    <div className={styles.participantTable}>
      {/* Column headers */}
      <div className={styles.participantHeader}>
        <span className={styles.pColName}>NAME</span>
        <span className={styles.pColEmail}>EMAIL</span>
        <span className={styles.pColPosition}>POSITION</span>
        <span className={styles.pColCompany}>COMPANY</span>
        <span className={styles.pColActions} />
      </div>

      {/* Existing participants */}
      {participants.map((p) => (
        <ParticipantRow
          key={p.id}
          participant={p}
          onUpdate={onUpdate}
          onRemove={onRemove}
        />
      ))}

      {/* Add row */}
      <div className={styles.participantAddRow}>
        <input
          ref={nameRef}
          className={`${styles.pInput} ${styles.pColName}`}
          placeholder="NAME"
          value={draft.name}
          onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value.toUpperCase() }))}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <input
          className={`${styles.pInput} ${styles.pColEmail}`}
          placeholder="EMAIL"
          type="email"
          value={draft.email}
          onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <input
          className={`${styles.pInput} ${styles.pColPosition}`}
          placeholder="POSITION"
          value={draft.position}
          onChange={(e) => setDraft((d) => ({ ...d, position: e.target.value.toUpperCase() }))}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <input
          className={`${styles.pInput} ${styles.pColCompany}`}
          placeholder="COMPANY"
          value={draft.company}
          onChange={(e) => setDraft((d) => ({ ...d, company: e.target.value.toUpperCase() }))}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <span className={styles.pColActions}>
          <button className={styles.addBtn} onClick={handleAdd}>+ ADD</button>
        </span>
      </div>
    </div>
  );
}

// ─── Participant Row (editable inline) ───────────────────────────────────────

interface ParticipantRowProps {
  participant: Participant;
  onUpdate: (id: string, updates: Partial<Omit<Participant, 'id' | 'recordId'>>) => void;
  onRemove: (id: string) => void;
}

function ParticipantRow({ participant, onUpdate, onRemove }: ParticipantRowProps) {
  return (
    <div className={styles.participantRow}>
      <input
        className={`${styles.pInput} ${styles.pColName}`}
        value={participant.name}
        onChange={(e) => onUpdate(participant.id, { name: e.target.value.toUpperCase() })}
      />
      <input
        className={`${styles.pInput} ${styles.pColEmail}`}
        type="email"
        value={participant.email}
        onChange={(e) => onUpdate(participant.id, { email: e.target.value })}
      />
      <input
        className={`${styles.pInput} ${styles.pColPosition}`}
        value={participant.position}
        onChange={(e) => onUpdate(participant.id, { position: e.target.value.toUpperCase() })}
      />
      <input
        className={`${styles.pInput} ${styles.pColCompany}`}
        value={participant.company}
        onChange={(e) => onUpdate(participant.id, { company: e.target.value.toUpperCase() })}
      />
      <span className={styles.pColActions}>
        <button className={styles.removeBtn} onClick={() => onRemove(participant.id)}>✕</button>
      </span>
    </div>
  );
}
