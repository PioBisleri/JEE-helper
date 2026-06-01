import type React from 'react';

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

export function SkeletonHome() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px' }}>
      {/* Subject tabs */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton" style={{ width: '80px', height: '32px', borderRadius: 'var(--radius-full)' }} />
        ))}
      </div>
      {/* Chapter cards */}
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="card" style={{ padding: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div className="skeleton" style={{ width: '70%', height: '14px' }} />
            <div className="skeleton" style={{ width: '40%', height: '10px' }} />
          </div>
          <div className="skeleton" style={{ width: '60px', height: '24px', borderRadius: 'var(--radius-full)' }} />
        </div>
      ))}
    </div>
  );
}

export function SkeletonStatsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px' }}>
      {/* Stat cards row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="card" style={{ padding: '16px' }}>
            <div className="skeleton" style={{ width: '50%', height: '10px', marginBottom: '8px' }} />
            <div className="skeleton" style={{ width: '70%', height: '24px', marginBottom: '4px' }} />
            <div className="skeleton" style={{ width: '40%', height: '10px' }} />
          </div>
        ))}
      </div>
      {/* Chart area */}
      <div className="card" style={{ padding: '16px', height: '200px' }}>
        <div className="skeleton" style={{ width: '40%', height: '14px', marginBottom: '12px' }} />
        <div className="skeleton" style={{ width: '100%', height: '160px', borderRadius: '8px' }} />
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
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
