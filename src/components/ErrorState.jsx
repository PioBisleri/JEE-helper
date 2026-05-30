import React from 'react';

export default function ErrorState({ error, onRetry, isGlobal = false }) {
  if (isGlobal) {
    return (
      <div style={styles.globalContainer}>
        <div style={styles.card} className="card glass">
          <div style={styles.icon}>⚠️</div>
          <h2 style={styles.title}>Something went wrong</h2>
          <p style={styles.message}>
            {error?.message || "An unexpected error occurred in Nexus JEE. Don't worry, your progress has been saved."}
          </p>
          <button 
            style={styles.btn} 
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Reload Application
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.card} className="card">
      <div style={styles.iconMini}>⚠️</div>
      <h4 style={styles.titleMini}>Failed to load content</h4>
      <p style={styles.messageMini}>
        {error?.message || "We encountered a network error while communicating with our tutoring AI."}
      </p>
      {onRetry && (
        <button 
          style={styles.btnMini} 
          className="btn btn-secondary" 
          onClick={onRetry}
        >
          Try Again
        </button>
      )}
    </div>
  );
}

const styles = {
  globalContainer: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'var(--bg-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    boxSizing: 'border-box',
    zIndex: 99999
  },
  card: {
    maxWidth: '420px',
    width: '100%',
    padding: '32px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px'
  },
  icon: {
    fontSize: '48px',
    marginBottom: '8px'
  },
  iconMini: {
    fontSize: '32px',
    marginBottom: '4px'
  },
  title: {
    fontSize: '22px',
    fontWeight: '700',
    color: 'var(--text-primary)'
  },
  titleMini: {
    fontSize: '15px',
    fontWeight: '700',
    color: 'var(--text-primary)'
  },
  message: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
    marginBottom: '8px'
  },
  messageMini: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
    marginBottom: '8px'
  },
  btn: {
    width: '100%'
  },
  btnMini: {
    width: 'auto',
    padding: '8px 16px',
    fontSize: '12px',
    borderRadius: '8px'
  }
};
