import { Library } from './Library';
import { Schedule } from './Schedule';
import styles from './Sidebar.module.css';

export function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.librarySection}>
        <div className={styles.sectionHeader}>
          <span>LIBRARY</span>
        </div>
        <Library />
      </div>
      <Schedule />
    </aside>
  );
}
