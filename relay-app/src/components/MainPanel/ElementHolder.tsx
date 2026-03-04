import { useRef, useState } from 'react';
import { ELEMENT_TYPE_LABELS } from '../../types';
import type { Element } from '../../types';
import { useRelayStore } from '../../store/useRelayStore';
import { Toggle } from '../shared/Toggle';
import { HamburgerMenu } from './HamburgerMenu';
import { ExpandModal } from '../Modals/ExpandModal';
import { PlaylistModal } from '../Modals/PlaylistModal';
import styles from './ElementHolder.module.css';

interface ElementHolderProps {
  element: Element;
}

export function ElementHolder({ element }: ElementHolderProps) {
  const updateElement = useRelayStore((s) => s.updateElement);
  const setElementActive = useRelayStore((s) => s.setElementActive);
  const duplicateElement = useRelayStore((s) => s.duplicateElement);
  const enterPlaylistMode = useRelayStore((s) => s.enterPlaylistMode);
  const exitPlaylistMode = useRelayStore((s) => s.exitPlaylistMode);

  const [menuOpen, setMenuOpen] = useState(false);
  const [expandOpen, setExpandOpen] = useState(false);
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPlaylist = element.playlistMode;
  const hasFile = !!element.fileName;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileUrl = URL.createObjectURL(file);
    const isVideo = file.type.startsWith('video/');
    updateElement(element.id, {
      fileName: file.name.toUpperCase(),
      fileUrl,
      isVideo,
      isActive: true,
    });
    e.target.value = '';
  }

  function handleRemoveFile() {
    if (isPlaylist) {
      exitPlaylistMode(element.id);
    } else {
      updateElement(element.id, {
        fileName: null,
        fileUrl: null,
        isVideo: false,
        isActive: false,
        loop: false,
      });
    }
  }

  function handleReplaceClick() {
    if (isPlaylist) {
      // Exit playlist mode, then open file picker
      exitPlaylistMode(element.id);
    }
    fileInputRef.current?.click();
  }

  function handleMakePlaylist() {
    setMenuOpen(false);
    enterPlaylistMode(element.id);
    setPlaylistOpen(true);
  }

  // Preview: in playlist mode show the first playlist item, otherwise single file
  const previewUrl = isPlaylist
    ? (element.playlist[0]?.fileUrl ?? null)
    : element.fileUrl;
  const previewIsVideo = isPlaylist
    ? (element.playlist[0]?.isVideo ?? false)
    : element.isVideo;

  return (
    <div className={`${styles.holder} ${element.isActive ? styles.active : styles.inactive}`}>
      {/* Title bar */}
      <div className={styles.titleBar}>
        <span className={styles.title}>{ELEMENT_TYPE_LABELS[element.type]}</span>
        <div className={styles.hamburgerWrap}>
          <button
            className={styles.dotsBtn}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Options"
          >
            <span /><span /><span />
          </button>
          {menuOpen && (
            <HamburgerMenu
              isActive={element.isActive}
              onSetActive={() => setElementActive(element.id, true)}
              onSetInactive={() => setElementActive(element.id, false)}
              onDuplicate={() => duplicateElement(element.id)}
              onMakePlaylist={handleMakePlaylist}
              onClose={() => setMenuOpen(false)}
            />
          )}
        </div>
      </div>

      {/* Preview area */}
      <div
        className={styles.preview}
        onClick={() => !isPlaylist && previewUrl && setExpandOpen(true)}
        style={{ cursor: !isPlaylist && previewUrl ? 'pointer' : 'default' }}
      >
        {isPlaylist && (
          <div className={styles.playlistPreview} onClick={() => setPlaylistOpen(true)}>
            {previewUrl && !previewIsVideo && (
              <img src={previewUrl} alt="" className={styles.previewImg} />
            )}
            {previewUrl && previewIsVideo && (
              <video src={previewUrl} className={styles.previewImg} muted preload="metadata" />
            )}
            <div className={styles.playlistBadge}>
              ▶ {element.playlist.length} FILE{element.playlist.length !== 1 ? 'S' : ''}
            </div>
          </div>
        )}

        {!isPlaylist && previewUrl && !previewIsVideo && (
          <>
            <img
              src={previewUrl}
              alt={element.fileName ?? ''}
              className={styles.previewImg}
            />
            <button
              className={styles.expandBtn}
              onClick={(e) => { e.stopPropagation(); setExpandOpen(true); }}
            >
              EXPAND ↗
            </button>
          </>
        )}
        {!isPlaylist && previewUrl && previewIsVideo && (
          <>
            <video
              src={previewUrl}
              className={styles.previewImg}
              muted
              preload="metadata"
            />
            <button
              className={styles.expandBtn}
              onClick={(e) => { e.stopPropagation(); setExpandOpen(true); }}
            >
              EXPAND ↗
            </button>
          </>
        )}
        {!isPlaylist && !previewUrl && !hasFile && (
          <button
            className={styles.uploadPlus}
            onClick={() => fileInputRef.current?.click()}
            title="Upload file"
          >
            +
          </button>
        )}
        {!isPlaylist && !previewUrl && hasFile && (
          <div className={styles.seedPreviewPlaceholder}>
            <span>{element.fileName}</span>
          </div>
        )}
      </div>

      {/* File info bar */}
      <div className={styles.fileBar}>
        {isPlaylist ? (
          <>
            <button
              className={styles.removeBtn}
              onClick={handleRemoveFile}
              title="Exit playlist mode"
            >
              ✕
            </button>
            <span className={`${styles.fileName} ${styles.playlistCount}`}>
              ▶ {element.playlist.length} FILE{element.playlist.length !== 1 ? 'S' : ''}
            </span>
          </>
        ) : hasFile ? (
          <>
            <button
              className={styles.removeBtn}
              onClick={handleRemoveFile}
              title="Remove file"
            >
              ✕
            </button>
            <span className={styles.fileName}>{element.fileName}</span>
          </>
        ) : (
          <span className={styles.notInUse}>NOT IN USE</span>
        )}
      </div>

      {/* Bottom action bar */}
      <div className={styles.actionBar}>
        <button
          className={`${styles.replaceBtn} ${!element.isActive ? styles.replaceBtnInactive : ''}`}
          onClick={handleReplaceClick}
        >
          + REPLACE
        </button>

        <div className={styles.loopGroup}>
          <span className={styles.loopLabel}>LOOP?</span>
          <Toggle
            checked={element.loop}
            onChange={(val) => updateElement(element.id, { loop: val })}
            disabled={isPlaylist || !element.isVideo}
          />
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className={styles.hiddenInput}
        accept="image/*,video/*"
        onChange={handleFileChange}
      />

      {expandOpen && !isPlaylist && (element.fileUrl || element.fileName) && (
        <ExpandModal
          fileUrl={element.fileUrl}
          fileName={element.fileName}
          isVideo={element.isVideo}
          onClose={() => setExpandOpen(false)}
        />
      )}

      {playlistOpen && (
        <PlaylistModal
          element={element}
          onClose={() => setPlaylistOpen(false)}
        />
      )}
    </div>
  );
}
