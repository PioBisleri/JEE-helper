import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from './ToastContext';
import { CheckIcon, CrossIcon, WarningIcon, InfoIcon } from './Icons';

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div style={styles.container}>
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            style={{
              ...styles.toast,
              ...styles[toast.type]
            }}
            onClick={() => removeToast(toast.id)}
          >
            <span style={styles.icon}>{getIcon(toast.type)}</span>
            <span style={styles.message}>{toast.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function getIcon(type) {
  switch (type) {
    case 'success': return <CheckIcon size={14} color="var(--success)" />;
    case 'error': return <CrossIcon size={14} color="var(--danger)" />;
    case 'warning': return <WarningIcon size={14} color="var(--warning)" />;
    case 'info': return <InfoIcon size={14} color="var(--accent)" />;
    default: return null;
  }
}

const styles = {
  container: {
    position: 'fixed',
    top: '16px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    alignItems: 'center',
    pointerEvents: 'none',
    width: '100%',
    maxWidth: '360px',
    padding: '0 16px'
  },
  toast: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 16px',
    borderRadius: '10px',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    cursor: 'pointer',
    pointerEvents: 'auto',
    width: '100%',
    border: '1px solid'
  },
  success: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: 'rgba(34, 197, 94, 0.2)'
  },
  error: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.2)'
  },
  warning: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.2)'
  },
  info: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderColor: 'rgba(99, 102, 241, 0.2)'
  },
  icon: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0
  },
  message: {
    fontSize: '13px',
    fontWeight: '500',
    color: 'var(--text-primary)',
    flex: 1
  }
};
