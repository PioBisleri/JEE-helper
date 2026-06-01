import React, { Suspense, useEffect, useState, useMemo, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { storage } from './utils/storage';
import { getDueReviews } from './utils/spaceRepetition';
import { CHAPTERS } from './data/chapters';
import { checkAndFireReminder } from './utils/notifications';
import { ToastProvider } from './components/ToastContext';
import { ToastContainer } from './components/Toast';
import { UserProvider, useUser } from './components/UserContext';
import { track } from './utils/analytics';
import XPBar from './components/XPBar';
import FormulaSheet from './components/FormulaSheet';
import ErrorState from './components/ErrorState';
import { StreakIcon, SettingsIcon, HomeIcon, StatsIcon, TestIcon, BookIcon, GridIcon } from './components/Icons';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[Nexus JEE ErrorBoundary]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorState error={this.state.error} onRetry={() => this.setState({ hasError: false, error: null })} isGlobal={true} />;
    }
    return this.props.children;
  }
}

function RequireOnboarding({ children }: { children: React.ReactNode }) {
  const onboarded = storage.isOnboarded();
  if (!onboarded) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function RequireNotOnboarded({ children }: { children: React.ReactNode }) {
  const onboarded = storage.isOnboarded();
  return !onboarded ? <>{children}</> : <Navigate to="/" replace />;
}

const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.15 } }
};

// Search Icon
const SearchIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

// Bell Icon
const BellIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

// Search Overlay
interface SearchOverlayProps {
  onClose: () => void;
  navigate: (path: string) => void;
}

function SearchOverlay({ onClose, navigate }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const matches: Array<{ type: string; name: string; subject?: string; chapter?: string; id: string; path: string }> = [];

    (Object.keys(CHAPTERS) as Array<keyof typeof CHAPTERS>).forEach(subject => {
      CHAPTERS[subject].forEach(chapter => {
        if (chapter.name.toLowerCase().includes(q)) {
          matches.push({
            type: 'chapter',
            name: chapter.name,
            subject,
            id: chapter.id,
            path: `/study/${subject}/${chapter.id}`,
          });
        }
        (chapter.subtopics || []).forEach((sub: string) => {
          const name = sub;
          if (name && name.toLowerCase().includes(q)) {
            matches.push({
              type: 'concept',
              name,
              chapter: chapter.name,
              subject,
              id: chapter.id,
              path: `/study/${subject}/${chapter.id}`,
            });
          }
        });
      });
    });

    return matches.slice(0, 12);
  }, [query]);

  const subjectColors: Record<string, string> = { physics: '#3b82f6', chemistry: '#10b981', math: '#f59e0b' };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      style={searchStyles.backdrop}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: -12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.97 }}
        transition={{ duration: 0.18 }}
        style={searchStyles.modal}
        onClick={e => e.stopPropagation()}
      >
        <div style={searchStyles.inputRow}>
          <SearchIcon size={16} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search chapters, concepts..."
            style={searchStyles.input}
            onKeyDown={e => { if (e.key === 'Escape') onClose(); }}
          />
          <span style={searchStyles.escHint}>ESC</span>
        </div>

        {query.trim() && results.length > 0 && (
          <div style={searchStyles.resultsList}>
            {results.map((r, i) => (
              <button
                key={i}
                style={searchStyles.resultItem}
                onClick={() => { navigate(r.path); onClose(); }}
              >
                <div style={{ ...searchStyles.subjectDot, backgroundColor: subjectColors[r.subject || ''] }} />
                <div style={searchStyles.resultText}>
                  <span style={searchStyles.resultName}>{r.name}</span>
                  <span style={searchStyles.resultMeta}>
                    {r.type === 'chapter' ? `${r.subject} · Chapter` : `${r.chapter} · Concept`}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {query.trim() && results.length === 0 && (
          <div style={searchStyles.empty}>No results for "{query}"</div>
        )}
      </motion.div>
    </motion.div>
  );
}

const searchStyles: Record<string, React.CSSProperties> = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 9000,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingTop: 'env(safe-area-inset-top, 80px)',
    paddingBottom: 'env(safe-area-inset-bottom, 16px)',
    backdropFilter: 'blur(4px)',
  },
  modal: {
    width: '92%',
    maxWidth: '440px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    maxHeight: '70vh',
    display: 'flex',
    flexDirection: 'column',
  },
  inputRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    borderBottom: '1px solid var(--border-subtle)',
    color: 'var(--text-muted)',
  },
  input: {
    flex: 1,
    background: 'none',
    border: 'none',
    outline: 'none',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-sans)',
    fontSize: '14px',
  },
  escHint: {
    fontSize: '10px',
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-muted)',
    padding: '2px 6px',
    borderRadius: '4px',
    border: '1px solid var(--border-default)',
  },
  resultsList: {
    overflowY: 'auto',
    padding: '4px',
  },
  resultItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    padding: '8px 12px',
    borderRadius: 'var(--radius-sm)',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background-color 0.1s',
  },
  subjectDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  resultText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
    minWidth: 0,
  },
  resultName: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  resultMeta: {
    fontSize: '10px',
    color: 'var(--text-muted)',
    textTransform: 'capitalize',
  },
  empty: {
    padding: '20px 16px',
    textAlign: 'center',
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
};

function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { streak, name, levelInfo, user, logout } = useUser();

  useEffect(() => {
    track('page_view', { path: location.pathname });
  }, [location.pathname]);

  const [searchOpen, setSearchOpen] = useState(false);
  const [showAiBanner, setShowAiBanner] = useState(() => !storage.hasValidAIConfig());
  const dueCount = getDueReviews().length;

  const initials = name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2) || 'A';

  const navItems = [
    { path: '/', icon: HomeIcon, label: 'Home' },
    { path: '/revisions', icon: BookIcon, label: 'Revisions' },
    { path: '/test', icon: TestIcon, label: 'Tests' },
    { path: '/syllabus', icon: GridIcon, label: 'Syllabus' },
    { path: '/stats', icon: StatsIcon, label: 'Stats' },
  ];

  return (
    <div className="app-container">
      <nav className="navbar" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--accent)' }}>
              <polygon points="12,2 21,7 21,17 12,22 3,17 3,7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1" />
              <circle cx="12" cy="12" r="2" fill="currentColor" />
            </svg>
            <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>Nexus JEE</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Streak */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
            <StreakIcon size={11} color="var(--warning)" />
            <span style={{ fontSize: '11px', fontWeight: '600', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{streak.current || 0}</span>
          </div>

          {/* Level Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--accent-dim)', border: '1px solid rgba(99, 102, 241, 0.15)' }}>
            <span style={{ fontSize: '10px', fontWeight: '700', fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>L{levelInfo.levelNumber}</span>
          </div>

          {/* Search */}
          <button
            onClick={() => setSearchOpen(true)}
            title="Search"
            style={navBtnStyle}
          >
            <SearchIcon size={15} />
          </button>

          {/* Notifications Bell */}
          <button
            onClick={() => navigate('/revisions')}
            title={dueCount > 0 ? `${dueCount} reviews due` : 'Notifications'}
            style={{ ...navBtnStyle, position: 'relative' }}
          >
            <BellIcon size={15} />
            {dueCount > 0 && (
              <span style={{
                position: 'absolute', top: '-2px', right: '-2px',
                width: '14px', height: '14px', borderRadius: '50%',
                backgroundColor: 'var(--danger)', color: '#fff',
                fontSize: '8px', fontWeight: '700', fontFamily: 'var(--font-mono)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {dueCount > 9 ? '9+' : dueCount}
              </span>
            )}
          </button>

          {/* Settings */}
          <button
            onClick={() => navigate('/settings')}
            title="Settings"
            style={navBtnStyle}
          >
            <SettingsIcon size={15} />
          </button>

          {/* Avatar */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => {
                if (user) {
                  // If logged in, show logout option
                  if (window.confirm('Log out of your account?')) {
                    logout();
                    navigate('/auth');
                  }
                }
              }}
              style={{
                width: '26px', height: '26px', borderRadius: '50%',
                backgroundColor: 'var(--accent)', color: '#ffffff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '10px', fontWeight: '700', border: 'none', cursor: 'pointer',
                padding: 0,
              }}
              title={user ? `Logged in as ${user.email || user.name} (click to logout)` : initials}
            >
              {initials}
            </button>
          </div>
        </div>
      </nav>

      {showAiBanner && (
        <div style={{
          backgroundColor: 'var(--warning-bg, #fef3c7)',
          borderBottom: '1px solid var(--warning, #f59e0b)',
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          fontSize: '12px',
        }}>
          <span style={{ color: 'var(--text-primary)' }}>
            ⚠️ No AI API key configured. AI-powered features (questions, summaries, hints) are disabled.
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => navigate('/settings')}
              style={{
                background: 'var(--accent)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-sm, 4px)',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Add API Key
            </button>
            <button
              onClick={() => setShowAiBanner(false)}
              style={{
                background: 'transparent',
                color: 'var(--text-muted)',
                border: 'none',
                fontSize: '14px',
                cursor: 'pointer',
                padding: '0 4px',
              }}
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <XPBar />

      <div className="sidebar-nav">
        {navItems.map(({ path, icon: Icon, label }) => (
          <Link
            key={path}
            to={path}
            className={`sidebar-nav-item ${location.pathname === path ? 'active' : ''}`}
          >
            <Icon size={16} />
            <span className="sidebar-nav-label">{label}</span>
          </Link>
        ))}
      </div>

      <main className="main-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageTransition}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ minHeight: '100%' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <div className="bottom-nav" style={{ backgroundColor: 'var(--bg-primary)' }}>
        {[
          { path: '/', icon: HomeIcon, label: 'Home' },
          { path: '/revisions', icon: BookIcon, label: 'Revisions' },
          { path: '/test', icon: TestIcon, label: 'Tests' },
          { path: '/syllabus', icon: GridIcon, label: 'Syllabus' },
          { path: '/stats', icon: StatsIcon, label: 'Stats' },
        ].map(({ path, icon: Icon, label }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`bottom-nav-item ${location.pathname === path ? 'active' : ''}`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <FormulaSheet />

      <AnimatePresence>
        {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} navigate={navigate} />}
      </AnimatePresence>
    </div>
  );
}

const navBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '4px',
  display: 'flex',
  alignItems: 'center',
  color: 'var(--text-muted)',
  borderRadius: '6px',
  transition: 'color 0.15s',
  position: 'relative',
};

const PageFallback = () => (
  <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div className="skeleton" style={{ width: '100%', maxWidth: '360px', height: '120px', borderRadius: 'var(--radius-lg)' }} />
  </div>
);

const Home = React.lazy(() => import('./pages/Home'));
const Study = React.lazy(() => import('./pages/Study'));
const TestPage = React.lazy(() => import('./pages/TestPage'));
const StatsPage = React.lazy(() => import('./pages/StatsPage'));
const Onboarding = React.lazy(() => import('./pages/Onboarding'));
const Settings = React.lazy(() => import('./pages/Settings'));
const RevisionsPage = React.lazy(() => import('./pages/RevisionsPage'));
const SyllabusPage = React.lazy(() => import('./pages/SyllabusPage'));
const DailyChallengePage = React.lazy(() => import('./pages/DailyChallengePage'));
const Auth = React.lazy(() => import('./pages/Auth'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));

export default function App() {
  useEffect(() => {
    checkAndFireReminder();
  }, []);

  return (
    <ErrorBoundary>
      <ToastProvider>
        <UserProvider>
          <ToastContainer />

          <BrowserRouter>
            <Routes>
              <Route
                path="/auth"
                element={
                  <Suspense fallback={<PageFallback />}><Auth /></Suspense>
                }
              />

              <Route
                path="/forgot-password"
                element={
                  <Suspense fallback={<PageFallback />}><ForgotPassword /></Suspense>
                }
              />

              <Route
                path="/onboarding"
                element={
                  <RequireNotOnboarded>
                    <Suspense fallback={<PageFallback />}><Onboarding /></Suspense>
                  </RequireNotOnboarded>
                }
              />

              <Route
                path="/study/:subject/:chapterId"
                element={
                  <RequireOnboarding>
                    <Suspense fallback={<PageFallback />}><Study /></Suspense>
                  </RequireOnboarding>
                }
              />

              <Route element={<RequireOnboarding><MainLayout /></RequireOnboarding>}>
                <Route path="/" element={<Suspense fallback={<PageFallback />}><Home /></Suspense>} />
                <Route path="/revisions" element={<Suspense fallback={<PageFallback />}><RevisionsPage /></Suspense>} />
                <Route path="/test" element={<Suspense fallback={<PageFallback />}><TestPage /></Suspense>} />
                <Route path="/syllabus" element={<Suspense fallback={<PageFallback />}><SyllabusPage /></Suspense>} />
                <Route path="/stats" element={<Suspense fallback={<PageFallback />}><StatsPage /></Suspense>} />
                <Route path="/settings" element={<Suspense fallback={<PageFallback />}><Settings /></Suspense>} />
                <Route path="/daily-challenge" element={<Suspense fallback={<PageFallback />}><DailyChallengePage /></Suspense>} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>

        </UserProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
