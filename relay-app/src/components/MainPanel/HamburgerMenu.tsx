import { useEffect, useRef } from 'react';
import styles from './HamburgerMenu.module.css';

interface HamburgerMenuProps {
  isActive: boolean;
  onSetActive: () => void;
  onSetInactive: () => void;
  onDuplicate: () => void;
  onMakePlaylist: () => void;
  onClose: () => void;
}

export function HamburgerMenu({
  isActive,
  onSetActive,
  onSetInactive,
  onDuplicate,
  onMakePlaylist,
  onClose,
}: HamburgerMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  return (
    <div className={styles.menu} ref={ref}>
      <div className={styles.menuHeader}>
        <span className={styles.dots}>
          <span />
          <span />
          <span />
        </span>
      </div>
      <div className={styles.menuBody}>
        <button className={styles.menuItem} onClick={() => { onMakePlaylist(); onClose(); }}>
          MAKE PLAYLIST
        </button>
        <div className={styles.divider}>--------------</div>
        {isActive ? (
          <button className={styles.menuItem} onClick={() => { onSetInactive(); onClose(); }}>
            SET INACTIVE
          </button>
        ) : (
          <button className={styles.menuItem} onClick={() => { onSetActive(); onClose(); }}>
            SET ACTIVE
          </button>
        )}
        <div className={styles.divider}>--------------</div>
        <button className={styles.menuItem} onClick={() => { onDuplicate(); onClose(); }}>
          DUPLICATE
        </button>
      </div>
    </div>
  );
}
