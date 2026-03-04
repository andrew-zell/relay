import { useState } from 'react';
import { Sidebar } from './components/Sidebar/Sidebar';
import { MainPanel } from './components/MainPanel/MainPanel';
import { NewRecordModal } from './components/Modals/NewRecordModal';
import relayLogo from './assets/RelayLogo.svg';
import styles from './App.module.css';

function App() {
  const [newRecordOpen, setNewRecordOpen] = useState(false);

  return (
    <div className={styles.app}>
      {/* Topbar */}
      <header className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <img src={relayLogo} alt="Relay" className={styles.logo} />
        </div>
        <div className={styles.topbarRight}>
          <button
            className={styles.newRecordBtn}
            onClick={() => setNewRecordOpen(true)}
          >
            + NEW RECORD
          </button>
        </div>
      </header>

      {/* Body */}
      <div className={styles.body}>
        <Sidebar />
        <MainPanel />
      </div>

      {newRecordOpen && (
        <NewRecordModal onClose={() => setNewRecordOpen(false)} />
      )}
    </div>
  );
}

export default App;
