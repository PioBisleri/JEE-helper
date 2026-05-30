import React from 'react';
import { useUser } from './UserContext';

export default function XPBar() {
  const { levelInfo } = useUser();
  const percent = (levelInfo.xpInLevel / 500) * 100;

  return (
    <div style={styles.wrapper}>
      <div style={styles.track}>
        <div style={{ ...styles.filler, width: `${percent}%` }} />
      </div>
      <div style={styles.levelIndicator}>
        <span style={styles.levelText}>Level {levelInfo.levelNumber}</span>
        <span style={styles.xpText}>{levelInfo.xpInLevel}/500</span>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    width: '100%',
    padding: '3px 20px 4px',
    backgroundColor: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border-subtle)',
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
    zIndex: 49,
    position: 'fixed',
    top: '56px',
    left: 0,
    right: 0
  },
  levelIndicator: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '10px',
    color: 'var(--text-muted)'
  },
  levelText: {
    fontWeight: '500'
  },
  xpText: {
    fontFamily: 'var(--font-mono)',
    fontSize: '10px'
  },
  track: {
    width: '100%',
    height: '3px',
    backgroundColor: 'var(--bg-elevated)',
    borderRadius: '2px',
    overflow: 'hidden'
  },
  filler: {
    height: '100%',
    backgroundColor: 'var(--accent)',
    borderRadius: '2px',
    transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
  }
};
