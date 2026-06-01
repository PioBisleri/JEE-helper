import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { motion, AnimatePresence } from 'framer-motion';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'email' | 'code' | 'done'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError('Enter your email'); return; }
    setError('');
    setLoading(true);
    try {
      await authService.forgotPassword(email.trim());
      setStep('code');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) { setError('Enter the reset code'); return; }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    setError('');
    setLoading(true);
    try {
      await authService.resetPassword(email.trim(), code.trim(), newPassword);
      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formWidth}>
        <div style={styles.brand}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--accent)' }}>
            <polygon points="12,2 21,7 21,17 12,22 3,17 3,7" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
            <circle cx="12" cy="12" r="2" fill="currentColor" />
          </svg>
          <span style={styles.brandName}>Nexus JEE</span>
        </div>

        <AnimatePresence mode="wait">
          {step === 'email' && (
            <motion.div key="email" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} style={styles.step}>
              <h1 style={styles.title}>Reset Password</h1>
              <p style={styles.subtitle}>Enter your email and we'll send you a reset code.</p>
              <form onSubmit={handleSendCode} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  style={styles.input}
                  autoFocus
                  required
                />
                {error && <p style={styles.error}>{error}</p>}
                <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%' }}>
                  {loading ? 'Sending...' : 'Send Reset Code'}
                </button>
              </form>
              <button onClick={() => navigate('/auth')} style={styles.backLink}>Back to login</button>
            </motion.div>
          )}

          {step === 'code' && (
            <motion.div key="code" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} style={styles.step}>
              <h1 style={styles.title}>Enter Code</h1>
              <p style={styles.subtitle}>Enter the 6-digit code sent to <strong>{email}</strong></p>
              <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="000000"
                  style={{ ...styles.input, textAlign: 'center', fontSize: '24px', letterSpacing: '8px', fontFamily: 'var(--font-mono)' }}
                  maxLength={6}
                  autoFocus
                  required
                />
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="New password (min 6 chars)"
                  style={styles.input}
                  required
                />
                {error && <p style={styles.error}>{error}</p>}
                <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%' }}>
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
              <button onClick={() => { setStep('email'); setError(''); }} style={styles.backLink}>Use a different email</button>
            </motion.div>
          )}

          {step === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} style={styles.step}>
              <h1 style={styles.title}>Password Reset</h1>
              <p style={styles.subtitle}>Your password has been updated successfully.</p>
              <button onClick={() => navigate('/auth')} className="btn btn-primary" style={{ width: '100%' }}>
                Log In
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: 'var(--bg-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  formWidth: {
    width: '100%',
    maxWidth: '380px',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '32px',
  },
  brandName: {
    fontSize: '16px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    letterSpacing: '-0.01em',
  },
  step: {
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    fontSize: '28px',
    fontWeight: '800',
    marginBottom: '4px',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    marginBottom: '28px',
    textAlign: 'center',
    lineHeight: '1.5',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-default)',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-sans)',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  error: {
    fontSize: '12px',
    color: 'var(--danger)',
    margin: 0,
  },
  backLink: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: '13px',
    cursor: 'pointer',
    textAlign: 'center',
    marginTop: '16px',
    padding: '8px',
  },
};
