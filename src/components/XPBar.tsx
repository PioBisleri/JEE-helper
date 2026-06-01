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

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    width: '100%',
    padding: '2px 16px 3px',
    backgroundColor: 'var(--bg-primary)',
    borderBottom: '1px solid var(--border-subtle)',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    zIndex: 49,
    position: 'fixed',
    top: '52px',
    left: 0,
    right: 0
  },
  levelIndicator: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '9px',
    color: 'var(--text-muted)'
  },
  levelText: {
    fontWeight: '600'
  },
  xpText: {
    fontFamily: 'var(--font-mono)',
    fontSize: '9px'
  },
  track: {
    width: '100%',
    height: '2px',
    backgroundColor: 'var(--bg-elevated)',
    borderRadius: '1px',
    overflow: 'hidden'
  },
  filler: {
    height: '100%',
    backgroundColor: 'var(--accent)',
    borderRadius: '1px',
    transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
  }
};
