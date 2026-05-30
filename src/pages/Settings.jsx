import React, { useState } from 'react';
import { useUser } from '../components/UserContext';
import { useToast } from '../components/ToastContext';
import { storage } from '../utils/storage';
import { SettingsIcon, TargetIcon, WarningIcon, InfoIcon, NoteIcon } from '../components/Icons';

export default function Settings() {
  const { 
    name, 
    examDate, 
    preferences, 
    updateName, 
    updateExam, 
    updatePrefs, 
    triggerResetAll
  } = useUser();
  const { showToast } = useToast();

  const [localName, setLocalName] = useState(name);
  const [localExamDate, setLocalExamDate] = useState(examDate);
  const [resetConfirm, setResetConfirm] = useState('');
  const [showWipeModal, setShowWipeModal] = useState(false);

  React.useEffect(() => {
    setLocalName(name);
    setLocalExamDate(examDate);
  }, [name, examDate]);

  const handleProfileSave = (e) => {
    e.preventDefault();
    if (!localName.trim()) {
      showToast('Name cannot be empty', 'error');
      return;
    }
    updateName(localName);
    updateExam(localExamDate);
  };

  const handlePrefChange = (key, val) => {
    updatePrefs({ [key]: val });
  };

  const handleExportData = () => {
    try {
      const data = {};
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('jeeforge_') || key === 'jeeforge_schema_version') {
          data[key] = localStorage.getItem(key);
        }
      });
      
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(data, null, 2)
      )}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', `jeeforge_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('Data backup exported successfully', 'success');
    } catch (e) {
      showToast('Failed to export data', 'error');
    }
  };

  const handleResetChapters = () => {
    if (window.confirm('Are you sure you want to reset all chapter progress? This cannot be undone.')) {
      storage.setProgress({});
      showToast('Chapter progress reset successfully', 'success');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const handleWipeData = () => {
    if (resetConfirm === 'RESET') {
      triggerResetAll();
    } else {
      showToast('Type RESET to confirm deletion', 'error');
    }
  };

  return (
    <div style={styles.container} className="mx-auto p-6 max-w-3xl">
      <h2 style={{ ...styles.pageTitle, display: 'flex', alignItems: 'center', gap: '8px' }}>
        <SettingsIcon size={22} /> Settings
      </h2>
      <p style={styles.pageSubtitle}>Configure your JEE study planner and manage your data.</p>

      <div style={styles.sectionsList}>
        {/* Profile Card */}
        <form style={styles.card} className="card" onSubmit={handleProfileSave}>
          <h3 style={styles.sectionHeader}>Profile</h3>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Name</label>
            <input 
              type="text" 
              value={localName} 
              onChange={e => setLocalName(e.target.value)}
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Exam Target Date</label>
            <input 
              type="date" 
              value={localExamDate} 
              onChange={e => setLocalExamDate(e.target.value)}
              style={styles.input}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={styles.saveBtn}>
            Save
          </button>
        </form>

        {/* Study Preferences Card */}
        <div style={styles.card} className="card">
          <h3 style={styles.sectionHeader}>Study Preferences</h3>
          
          <div style={styles.rowSetting}>
            <div>
              <strong style={styles.settingTitle}>Default Mood</strong>
              <p style={styles.settingDesc}>Skip the mood selection step when launching sessions.</p>
            </div>
            <select 
              value={preferences.defaultMood || ''} 
              onChange={e => handlePrefChange('defaultMood', e.target.value)}
              style={styles.select}
            >
              <option value="">Ask every time</option>
              <option value="focused">Focused</option>
              <option value="tired">Tired</option>
              <option value="stressed">Stressed</option>
            </select>
          </div>

          <div style={styles.rowSetting}>
            <div>
              <strong style={styles.settingTitle}>Session Length</strong>
              <p style={styles.settingDesc}>Number of questions to complete before the session summary.</p>
            </div>
            <select 
              value={preferences.questionsPerSession || 5} 
              onChange={e => handlePrefChange('questionsPerSession', parseInt(e.target.value))}
              style={styles.select}
            >
              <option value={3}>3 Questions</option>
              <option value={5}>5 Questions</option>
              <option value={10}>10 Questions</option>
            </select>
          </div>

          <div style={styles.rowSetting}>
            <div>
              <strong style={styles.settingTitle}>Auto-Advance</strong>
              <p style={styles.settingDesc}>Automatically jump to the next question upon answering correctly.</p>
            </div>
            <input 
              type="checkbox" 
              checked={preferences.autoAdvance || false}
              onChange={e => handlePrefChange('autoAdvance', e.target.checked)}
              style={styles.checkbox}
            />
          </div>
        </div>

        {/* Notifications Settings Card */}
        <div style={styles.card} className="card">
          <h3 style={styles.sectionHeader}>Notifications</h3>
          
          <div style={styles.rowSetting}>
            <div>
              <strong style={styles.settingTitle}>Enable Notifications</strong>
              <p style={styles.settingDesc}>Get reminders and streak warnings on your browser.</p>
            </div>
            <input 
              type="checkbox" 
              checked={preferences.notificationsEnabled !== false}
              onChange={e => handlePrefChange('notificationsEnabled', e.target.checked)}
              style={styles.checkbox}
            />
          </div>

          {preferences.notificationsEnabled !== false && (
            <>
              <div style={styles.rowSetting}>
                <div>
                  <strong style={styles.settingTitle}>Daily Reminder Time</strong>
                  <p style={styles.settingDesc}>Hour for daily revision alert.</p>
                </div>
                <input 
                  type="time" 
                  value={preferences.reminderTime || '19:00'} 
                  onChange={e => handlePrefChange('reminderTime', e.target.value)}
                  style={styles.inputTime}
                />
              </div>

              <div style={styles.rowSetting}>
                <div>
                  <strong style={styles.settingTitle}>Streak Warning</strong>
                  <p style={styles.settingDesc}>Alert past 6 PM if you haven't studied today.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={preferences.streakWarning !== false}
                  onChange={e => handlePrefChange('streakWarning', e.target.checked)}
                  style={styles.checkbox}
                />
              </div>

              <div style={styles.rowSetting}>
                <div>
                  <strong style={styles.settingTitle}>Weekly Test Alert</strong>
                  <p style={styles.settingDesc}>Alert when the weekly mock test becomes available.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={preferences.weeklyTestReminder !== false}
                  onChange={e => handlePrefChange('weeklyTestReminder', e.target.checked)}
                  style={styles.checkbox}
                />
              </div>
            </>
          )}
        </div>

        {/* Data Management Card */}
        <div style={styles.card} className="card">
          <h3 style={styles.sectionHeader}>Data Management</h3>
          <p style={styles.settingDesc}>
            Export backups or reset your study profiles. All data is cached directly in your local browser sandbox.
          </p>
          <div style={styles.dataButtonRow}>
            <button 
              className="btn btn-secondary" 
              style={styles.flexBtn}
              onClick={handleExportData}
            >
              Export Backup (JSON)
            </button>
            <button 
              className="btn btn-secondary" 
              style={styles.flexBtn}
              onClick={handleResetChapters}
            >
              Reset Chapter Progress
            </button>
            <button 
              className="btn btn-ghost" 
              style={{ ...styles.flexBtn, color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              onClick={() => setShowWipeModal(true)}
            >
              <WarningIcon size={14} color="var(--danger)" /> Wipe All Data
            </button>
          </div>
        </div>

        {/* About App Card */}
        <div style={styles.aboutCard} className="card">
          <h3 style={styles.aboutHeader}>About Nexus JEE</h3>
          <div style={styles.aboutContent}>
            <span style={styles.aboutText}>v1.5.0</span>
            <span style={styles.aboutText}>Built with React</span>
          </div>
        </div>
      </div>

      {/* Wipe Modal */}
      {showWipeModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard} className="card">
            <h3 style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', fontSize: '16px', fontWeight: '700' }}>
              <WarningIcon size={18} color="var(--danger)" /> Permanent Data Erasure
            </h3>
            <p style={{ margin: '12px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
              This will wipe your profile: XP, streaks, levels, unlocks, and bookmarks. This cannot be undone.
            </p>
            <p style={{ fontWeight: '600', fontSize: '12px', marginBottom: '8px' }}>
              Type "RESET" to confirm:
            </p>
            <input 
              type="text" 
              value={resetConfirm}
              onChange={e => setResetConfirm(e.target.value)}
              placeholder="RESET"
              style={styles.modalInput}
            />
            <div style={styles.modalButtons}>
              <button 
                className="btn btn-secondary" 
                onClick={() => {
                  setShowWipeModal(false);
                  setResetConfirm('');
                }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                style={{ backgroundColor: 'var(--danger)' }}
                disabled={resetConfirm !== 'RESET'}
                onClick={handleWipeData}
              >
                Wipe All Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    paddingBottom: '48px'
  },
  pageTitle: {
    fontSize: '22px',
    fontWeight: '700',
    marginBottom: '4px'
  },
  pageSubtitle: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    marginBottom: '32px'
  },
  sectionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px'
  },
  card: {
    padding: '20px',
    backgroundColor: 'var(--bg-card)',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  sectionHeader: {
    fontSize: '15px',
    fontWeight: '700',
    borderBottom: '1px solid var(--border-subtle)',
    paddingBottom: '10px',
    marginBottom: '4px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-secondary)'
  },
  input: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid var(--border-default)',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-sans)',
    fontSize: '14px',
    outline: 'none'
  },
  saveBtn: {
    alignSelf: 'flex-start',
    marginTop: '8px'
  },
  rowSetting: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid var(--border-subtle)',
    gap: '16px'
  },
  settingTitle: {
    fontSize: '13px',
    color: 'var(--text-primary)'
  },
  settingDesc: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    marginTop: '2px'
  },
  select: {
    padding: '6px 10px',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-default)',
    color: 'var(--text-primary)',
    fontSize: '13px',
    outline: 'none'
  },
  checkbox: {
    width: '18px',
    height: '18px',
    accentColor: 'var(--accent)'
  },
  inputTime: {
    padding: '6px 10px',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-default)',
    color: 'var(--text-primary)',
    fontSize: '13px'
  },
  dataButtonRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  flexBtn: {
    width: '100%',
    textAlign: 'center',
    padding: '10px 16px'
  },
  aboutCard: {
    padding: '16px 20px',
    backgroundColor: 'transparent',
    border: 'none'
  },
  aboutHeader: {
    fontSize: '15px',
    fontWeight: '700',
    marginBottom: '8px',
    color: 'var(--text-secondary)'
  },
  aboutContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  aboutText: {
    fontSize: '12px',
    color: 'var(--text-secondary)'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 99999,
    backgroundColor: 'rgba(8, 11, 20, 0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalCard: {
    maxWidth: '400px',
    width: '90%',
    padding: '24px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  modalInput: {
    width: '100%',
    padding: '10px',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-default)',
    color: 'var(--text-primary)',
    textAlign: 'center',
    letterSpacing: '1px',
    fontSize: '14px',
    fontWeight: '600',
    outline: 'none',
    marginBottom: '16px'
  },
  modalButtons: {
    display: 'flex',
    gap: '12px',
    width: '100%',
    justifyContent: 'center'
  }
};
