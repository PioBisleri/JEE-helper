import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { storage } from '../utils/storage';
import { useUser } from '../components/UserContext';
import { motion, AnimatePresence } from 'framer-motion';
import { track } from '../utils/analytics';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
          renderButton: (element: HTMLElement, config: { theme: string; size: string; text: string; shape: string }) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const NexusLogo = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--accent)' }}>
    <polygon points="12,2 21,7 21,17 12,22 3,17 3,7" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
  </svg>
);

export default function Auth() {
  const navigate = useNavigate();
  const { setAuth } = useUser();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (clientId && window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleResponse,
        });
        if (googleButtonRef.current) {
          window.google.accounts.id.renderButton(googleButtonRef.current, {
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            shape: 'rectangular',
          });
        }
      }
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleGoogleResponse = async (response: { credential: string }) => {
    setError('');
    setLoading(true);
    try {
      const result = await authService.googleAuth(response.credential);
      track('auth_google');
      await setAuth(result.access_token);
      const onboarded = storage.isOnboarded();
      if (onboarded) {
        navigate('/');
      } else {
        navigate('/onboarding');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Email and password are required');
      return;
    }

    if (mode === 'signup' && !name.trim()) {
      setError('Name is required for sign up');
      return;
    }

    setLoading(true);
    try {
      let result;
      if (mode === 'login') {
        result = await authService.login(email, password);
        track('auth_login');
      } else {
        result = await authService.register(email, password, name);
        track('auth_signup');
      }
      // Update auth state in context so Settings shows the user is logged in
      await setAuth(result.access_token);
      const onboarded = storage.isOnboarded();
      if (onboarded) {
        navigate('/');
      } else {
        navigate('/onboarding');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Allow offline usage without auth
    track('auth_skip');
    navigate('/onboarding');
  };

  return (
    <div style={styles.container}>
      <div style={styles.card} className="card">
        {/* Logo */}
        <div style={styles.logoSection}>
          <NexusLogo />
          <h1 style={styles.title}>Nexus JEE</h1>
          <p style={styles.subtitle}>
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </p>
        </div>

        {/* Google Sign-In */}
        <div style={styles.googleSection}>
          <div ref={googleButtonRef} style={styles.googleButtonWrapper} />
          {!import.meta.env.VITE_GOOGLE_CLIENT_ID && (
            <p style={styles.googleUnavailable}>Google Sign-In not configured</p>
          )}
        </div>

        {/* Divider */}
        <div style={styles.divider}>
          <div style={styles.dividerLine} />
          <span style={styles.dividerText}>or</span>
          <div style={styles.dividerLine} />
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {mode === 'signup' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={styles.inputGroup}
            >
              <label style={styles.label}>Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                style={styles.input}
                autoFocus
              />
            </motion.div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={styles.input}
              autoFocus={mode === 'login'}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={styles.input}
            />
            {mode === 'login' && (
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer', textAlign: 'right', padding: 0, marginTop: '4px' }}
              >
                Forgot password?
              </button>
            )}
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={styles.error}
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={styles.submitBtn}
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        {/* Toggle mode */}
        <div style={styles.toggleSection}>
          <p style={styles.toggleText}>
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
          </p>
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
            className="btn btn-ghost"
            style={styles.toggleBtn}
          >
            {mode === 'login' ? 'Sign Up' : 'Log In'}
          </button>
        </div>

        {/* Skip for now */}
        <div style={styles.skipSection}>
          <button
            onClick={handleSkip}
            className="btn btn-ghost"
            style={styles.skipBtn}
          >
            Skip for now (offline mode)
          </button>
        </div>
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
  card: {
    width: '100%',
    maxWidth: '380px',
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  logoSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '800',
    margin: 0,
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    margin: 0,
  },
  googleSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  googleButtonWrapper: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
  googleUnavailable: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    margin: 0,
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: 'var(--border-subtle)',
  },
  dividerText: {
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid var(--border-default)',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-sans)',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  error: {
    fontSize: '12px',
    color: 'var(--danger)',
    margin: 0,
    textAlign: 'center',
  },
  submitBtn: {
    width: '100%',
    padding: '12px',
    marginTop: '8px',
  },
  toggleSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  toggleText: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    margin: 0,
  },
  toggleBtn: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--accent)',
    padding: '4px 8px',
  },
  skipSection: {
    display: 'flex',
    justifyContent: 'center',
    paddingTop: '8px',
    borderTop: '1px solid var(--border-subtle)',
  },
  skipBtn: {
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
};
