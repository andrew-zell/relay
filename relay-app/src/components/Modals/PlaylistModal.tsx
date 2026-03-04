import { useRef } from 'react';
import { useRelayStore } from '../../store/useRelayStore';
import type { Element } from '../../types';
import { ELEMENT_TYPE_LABELS } from '../../types';
import { ModalBase } from './ModalBase';
import styles from './PlaylistModal.module.css';

interface PlaylistModalProps {
  element: Element;
  onClose: () => void;
}

export function PlaylistModal({ element, onClose }: PlaylistModalProps) {
  const addToPlaylist = useRelayStore((s) => s.addToPlaylist);
  const removeFromPlaylist = useRelayStore((s) => s.removeFromPlaylist);
  const reorderPlaylist = useRelayStore((s) => s.reorderPlaylist);
  const exitPlaylistMode = useRelayStore((s) => s.exitPlaylistMode);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentElement = useRelayStore((s) =>
    s.elements.find((el) => el.id === element.id)
  ) ?? element;

  function handleFileAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileUrl = URL.createObjectURL(file);
    const isVideo = file.type.startsWith('video/');
    addToPlaylist(element.id, {
      fileName: file.name.toUpperCase(),
      fileUrl,
      isVideo,
    });
    e.target.value = '';
  }

  function handleExitPlaylistMode() {
    exitPlaylistMode(element.id);
    onClose();
  }

  const playlist = currentElement.playlist;

  return (
    <ModalBase title={`PLAYLIST — ${ELEMENT_TYPE_LABELS[element.type]}`} onClose={onClose} wide>
      <div className={styles.container}>
        <p className={styles.hint}>
          FILES BELOW WILL PLAY IN SEQUENCE ON THE {ELEMENT_TYPE_LABELS[element.type]} DISPLAY.
        </p>

        {playlist.length === 0 && (
          <div className={styles.empty}>NO FILES IN PLAYLIST YET</div>
        )}

        <div className={styles.list}>
          {playlist.map((file, i) => (
            <div key={file.id} className={styles.fileRow}>
              <div className={styles.reorderBtns}>
                <button
                  type="button"
                  className={styles.reorderBtn}
                  disabled={i === 0}
                  onClick={() => reorderPlaylist(element.id, i, i - 1)}
                  title="Move up"
                >
                  ▲
                </button>
                <button
                  type="button"
                  className={styles.reorderBtn}
                  disabled={i === playlist.length - 1}
                  onClick={() => reorderPlaylist(element.id, i, i + 1)}
                  title="Move down"
                >
                  ▼
                </button>
              </div>

              <span className={styles.index}>{String(i + 1).padStart(2, '0')}</span>

              {file.fileUrl && !file.isVideo && (
                <img src={file.fileUrl} alt={file.fileName} className={styles.thumb} />
              )}
              {file.fileUrl && file.isVideo && (
                <div className={styles.videoThumb}>▶</div>
              )}
              {!file.fileUrl && (
                <div className={styles.videoThumb}>◼</div>
              )}

              <span className={styles.fileName}>{file.fileName}</span>
              <span className={styles.fileType}>{file.isVideo ? 'VIDEO' : 'IMAGE'}</span>

              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => removeFromPlaylist(element.id, file.id)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className={styles.addRow}>
          <button
            type="button"
            className={styles.addBtn}
            onClick={() => fileInputRef.current?.click()}
          >
            + ADD FILE TO PLAYLIST
          </button>
        </div>

        <div className={styles.exitRow}>
          <button
            type="button"
            className={styles.exitBtn}
            onClick={handleExitPlaylistMode}
          >
            ✕ EXIT PLAYLIST MODE
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          style={{ display: 'none' }}
          onChange={handleFileAdd}
        />
      </div>
    </ModalBase>
  );
}
