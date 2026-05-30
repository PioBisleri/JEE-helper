import React from 'react';
import { useUser } from './UserContext';
import { ACHIEVEMENTS } from '../data/achievements';
import { BadgeIcon, LockIcon, TrophyIcon } from './Icons';

export default function Achievements() {
  const { achievements } = useUser();

  return (
    <div style={styles.container}>
      <h3 style={styles.sectionTitle}>
        <TrophyIcon size={20} style={{ marginRight: '8px' }} />
        Milestones & Achievements
      </h3>
      <div style={styles.grid}>
        {ACHIEVEMENTS.map((badge) => {
          const isUnlocked = achievements.includes(badge.id);

          return (
            <div 
              key={badge.id}
              style={{
                ...styles.badgeCard,
                ...(isUnlocked ? styles.unlockedCard : styles.lockedCard)
              }}
              className="card"
              title={badge.description}
            >
              <div style={styles.emojiContainer}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  filter: isUnlocked ? 'none' : 'grayscale(100%) opacity(0.3)'
                }}>
                  <BadgeIcon id={badge.id} size={24} />
                </div>
                {!isUnlocked && (
                  <div style={styles.lockIcon}>
                    <LockIcon size={10} color="var(--text-secondary)" />
                  </div>
                )}
              </div>
              <div style={styles.textContainer}>
                <h4 style={{
                  ...styles.badgeTitle,
                  color: isUnlocked ? 'var(--text-primary)' : 'var(--text-muted)'
                }}>{badge.title}</h4>
                <p style={styles.badgeDesc}>{badge.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text-primary)'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '16px'
  },
  badgeCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px !important',
    minHeight: '80px',
    position: 'relative',
    overflow: 'hidden'
  },
  unlockedCard: {
    borderColor: 'var(--accent-glow)',
    backgroundColor: 'var(--bg-card)'
  },
  lockedCard: {
    backgroundColor: 'rgba(17, 24, 39, 0.4)',
    borderColor: 'var(--border-subtle)'
  },
  emojiContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    backgroundColor: 'var(--bg-secondary)',
    flexShrink: 0
  },
  emoji: {
    fontSize: '24px'
  },
  lockIcon: {
    position: 'absolute',
    fontSize: '11px',
    bottom: '-2px',
    right: '-2px',
    backgroundColor: 'var(--bg-primary)',
    borderRadius: '50%',
    width: '16px',
    height: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid var(--border-default)'
  },
  textContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    flex: 1
  },
  badgeTitle: {
    fontSize: '14px',
    fontWeight: '700',
    margin: 0
  },
  badgeDesc: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    margin: 0,
    lineHeight: '1.3'
  }
};
