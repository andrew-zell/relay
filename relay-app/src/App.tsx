import { useState } from 'react';
import { Sidebar } from './components/Sidebar/Sidebar';
import { MainPanel } from './components/MainPanel/MainPanel';
import { BriefingPanel } from './components/BriefingPanel/BriefingPanel';
import { NewRecordModal } from './components/Modals/NewRecordModal';
import { useJanusSync } from './hooks/useJanusSync';
import relayLogo from './assets/RelayLogo.svg';
import styles from './App.module.css';

type AppView = 'main' | 'briefing';

function App() {
  useJanusSync();

  const [newRecordOpen, setNewRecordOpen] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>('main');

  return (
    <div className={styles.app}>
      {/* Topbar */}
      <header className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <img src={relayLogo} alt="Relay" className={styles.logo} />
        </div>
        <div className={styles.topbarRight}>
          <button
            className={`${styles.navBtn} ${currentView === 'briefing' ? styles.navBtnActive : ''}`}
            onClick={() => setCurrentView(currentView === 'briefing' ? 'main' : 'briefing')}
          >
            BRIEFING
          </button>
          {currentView === 'main' && (
            <button
              className={styles.newRecordBtn}
              onClick={() => setNewRecordOpen(true)}
            >
              + NEW RECORD
            </button>
          )}
        </div>
      </header>

      {/* Body */}
      <div className={styles.body}>
        {currentView === 'briefing' ? (
          <BriefingPanel />
        ) : (
          <>
            <Sidebar />
            <MainPanel />
          </>
        )}
      </div>

      {newRecordOpen && (
        <NewRecordModal onClose={() => setNewRecordOpen(false)} />
      )}
    </div>
  );
}

export default App;
