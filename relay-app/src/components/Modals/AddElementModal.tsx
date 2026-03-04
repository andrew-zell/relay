import { useRef, useState } from 'react';
import { useRelayStore } from '../../store/useRelayStore';
import { ALL_ELEMENT_TYPES, ELEMENT_TYPE_LABELS } from '../../types';
import type { ElementType } from '../../types';
import { ModalBase } from './ModalBase';
import styles from './FormModal.module.css';

interface AddElementModalProps {
  recordId: string;
  onClose: () => void;
}

export function AddElementModal({ recordId, onClose }: AddElementModalProps) {
  const addElement = useRelayStore((s) => s.addElement);
  const [elementType, setElementType] = useState<ElementType>('SHOWCASE_INTERIOR');
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(f: File) {
    setFile(f);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFileSelect(f);
  }

  function handleConfirm() {
    const fileUrl = file ? URL.createObjectURL(file) : null;
    const isVideo = file ? file.type.startsWith('video/') : false;
    addElement({
      recordId,
      type: elementType,
      isActive: !!file,
      loop: false,
      playlistMode: false,
      fileName: file ? file.name.toUpperCase() : null,
      fileUrl,
      isVideo,
      playlist: [],
    });
    onClose();
  }

  return (
    <ModalBase title="ADD ELEMENT" onClose={onClose}>
      <div className={styles.form}>
        {/* Drop zone */}
        <div
          className={`${styles.dropZone} ${dragging ? styles.dropZoneActive : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {file ? (
            <div className={styles.dropZoneContent}>
              <span className={styles.dropZoneIcon}>✓</span>
              <span className={styles.dropZoneText}>{file.name.toUpperCase()}</span>
            </div>
          ) : (
            <div className={styles.dropZoneContent}>
              <span className={styles.dropZoneText}>DRAG & DROP OR</span>
              <button
                type="button"
                className={styles.browseBtn}
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              >
                + BROWSE
              </button>
            </div>
          )}
        </div>

        {file && (
          <div className={styles.filePreviewRow}>
            <span className={styles.filePreviewName}>{file.name.toUpperCase()}</span>
            <button className={styles.removeFileBtn} onClick={() => setFile(null)}>✕</button>
          </div>
        )}

        {/* Element type */}
        <div className={styles.field}>
          <label className={styles.label}>ELEMENT TYPE</label>
          <div className={styles.selectWrap}>
            <select
              value={elementType}
              onChange={(e) => setElementType(e.target.value as ElementType)}
            >
              {ALL_ELEMENT_TYPES.map((t) => (
                <option key={t} value={t}>{ELEMENT_TYPE_LABELS[t]}</option>
              ))}
            </select>
            <span className={styles.selectArrow}>▼</span>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.actions}>
          <button className={styles.confirmBtn} onClick={handleConfirm}>
            CONFIRM
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          style={{ display: 'none' }}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); e.target.value = ''; }}
        />
      </div>
    </ModalBase>
  );
}
