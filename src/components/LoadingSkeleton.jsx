import React from 'react';

export function SkeletonQuestion() {
  return (
    <div style={styles.card} className="card">
      <div style={{ ...styles.block, width: '30%', height: '20px', marginBottom: '16px' }} className="skeleton" />
      <div style={{ ...styles.block, width: '90%', height: '18px', marginBottom: '8px' }} className="skeleton" />
      <div style={{ ...styles.block, width: '80%', height: '18px', marginBottom: '24px' }} className="skeleton" />
      
      <div style={styles.optionsContainer}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={styles.optionBlock} className="skeleton" />
        ))}
      </div>
      
      <div style={styles.footer}>
        <div style={{ ...styles.block, width: '20%', height: '36px' }} className="skeleton" />
        <div style={{ ...styles.block, width: '20%', height: '36px' }} className="skeleton" />
      </div>
    </div>
  );
}

export function SkeletonChapter() {
  return (
    <div style={{ ...styles.card, padding: '20px' }} className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ ...styles.block, width: '60%', height: '18px' }} className="skeleton" />
        <div style={{ ...styles.block, width: '20%', height: '18px' }} className="skeleton" />
      </div>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%' }} className="skeleton" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ ...styles.block, width: '70%', height: '14px' }} className="skeleton" />
          <div style={{ ...styles.block, width: '40%', height: '12px' }} className="skeleton" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div style={styles.card} className="card">
      <div style={{ ...styles.block, width: '40%', height: '16px', marginBottom: '12px' }} className="skeleton" />
      <div style={{ ...styles.block, width: '70%', height: '36px', marginBottom: '8px' }} className="skeleton" />
      <div style={{ ...styles.block, width: '50%', height: '12px' }} className="skeleton" />
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: 'var(--bg-card)',
    borderRadius: '16px',
    padding: '24px',
    width: '100%',
    boxSizing: 'border-box'
  },
  block: {
    borderRadius: '6px'
  },
  optionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '24px'
  },
  optionBlock: {
    width: '100%',
    height: '48px',
    borderRadius: '16px'
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between'
  }
};
