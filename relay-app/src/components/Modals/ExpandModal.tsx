import { useEffect } from 'react';
import styles from './ExpandModal.module.css';

interface ExpandModalProps {
  fileUrl: string | null;
  fileName: string | null;
  isVideo: boolean;
  onClose: () => void;
}

export function ExpandModal({ fileUrl, fileName, isVideo, onClose }: ExpandModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className={styles.overlay} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <span className={styles.fileName}>{fileName ?? 'PREVIEW'}</span>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div className={styles.content}>
          {fileUrl && !isVideo && (
            <img src={fileUrl} alt={fileName ?? ''} className={styles.media} />
          )}
          {fileUrl && isVideo && (
            <video src={fileUrl} controls className={styles.media} autoPlay />
          )}
          {!fileUrl && (
            <div className={styles.noPreview}>NO PREVIEW AVAILABLE</div>
          )}
        </div>
      </div>
    </div>
  );
}
