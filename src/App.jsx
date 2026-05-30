import React, { Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { storage } from './utils/storage';
import { checkAndFireReminder } from './utils/notifications';
import { ToastProvider, useToast } from './components/ToastContext';
import { ToastContainer } from './components/Toast';
import { UserProvider, useUser } from './components/UserContext';
import XPBar from './components/XPBar';
import FormulaSheet from './components/FormulaSheet';
import ErrorState from './components/ErrorState';
import { StreakIcon, SettingsIcon, HomeIcon, StatsIcon, TestIcon, MenuIcon, BookIcon, GridIcon } from './components/Icons';

// Global React Error Boundary for recovery from app crashes
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[Nexus JEE ErrorBoundary]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorState error={this.state.error} isGlobal={true} />;
    }
    return this.props.children;
  }
}

// Onboarding guards
function RequireOnboarding({ children }) {
  const onboarded = storage.isOnboarded();
  return onboarded ? children : <Navigate to="/onboarding" replace />;
}

function RequireNotOnboarded({ children }) {
  const onboarded = storage.isOnboarded();
  return !onboarded ? children : <Navigate to="/" replace />;
}

// Unified portal layout containing shared navbar, XPBar, Navigation bars, and Formula sheet
function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { streak, name } = useUser();

  const [sidebarOpen, setSidebarOpen] = React.useState(() => {
    const saved = localStorage.getItem('sidebar_open');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const toggleSidebar = () => {
    setSidebarOpen(prev => {
      const next = !prev;
      localStorage.setItem('sidebar_open', JSON.stringify(next));
      return next;
    });
  };

  const initials = name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2) || 'A';

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <nav className="navbar glass">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center',
              color: 'var(--text-muted)',
              padding: '4px'
            }} 
            onClick={toggleSidebar} 
            title="Toggle Sidebar"
          >
            <MenuIcon size={18} />
          </button>
          <div 
            onClick={() => navigate('/')} 
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: 'var(--accent)' }}>
              <polygon points="12,2 21,7 21,17 12,22 3,17 3,7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1" />
              <circle cx="12" cy="12" r="2" fill="currentColor" />
            </svg>
            <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>JEE Forge</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '20px', backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
          <StreakIcon size={12} color="var(--warning)" />
          <span style={{ fontSize: '12px', fontWeight: '500', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{streak.current || 0}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }} onClick={() => navigate('/settings')} title="Settings">
            <SettingsIcon size={16} />
          </button>
          <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: 'var(--accent)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '600' }}>
            {initials}
          </div>
        </div>
      </nav>

      {/* Global XP Level indicator below navbar */}
      <XPBar />

      {/* Desktop Sidebar Nav Panel */}
      <div className={`sidebar-nav ${sidebarOpen ? 'expanded' : 'collapsed'}`}>
        <Link to="/" className={`sidebar-nav-item ${location.pathname === '/' ? 'active' : ''}`}>
          <HomeIcon size={16} />
          {sidebarOpen && <span style={{ marginLeft: '10px' }}>Home</span>}
        </Link>
        <Link to="/revisions" className={`sidebar-nav-item ${location.pathname === '/revisions' ? 'active' : ''}`}>
          <BookIcon size={16} />
          {sidebarOpen && <span style={{ marginLeft: '10px' }}>Revisions</span>}
        </Link>
        <Link to="/test" className={`sidebar-nav-item ${location.pathname === '/test' ? 'active' : ''}`}>
          <TestIcon size={16} />
          {sidebarOpen && <span style={{ marginLeft: '10px' }}>Tests</span>}
        </Link>
        <Link to="/syllabus" className={`sidebar-nav-item ${location.pathname === '/syllabus' ? 'active' : ''}`}>
          <GridIcon size={16} />
          {sidebarOpen && <span style={{ marginLeft: '10px' }}>Syllabus</span>}
        </Link>
        <Link to="/stats" className={`sidebar-nav-item ${location.pathname === '/stats' ? 'active' : ''}`}>
          <StatsIcon size={16} />
          {sidebarOpen && <span style={{ marginLeft: '10px' }}>Stats</span>}
        </Link>
        <Link to="/settings" className={`sidebar-nav-item ${location.pathname === '/settings' ? 'active' : ''}`}>
          <SettingsIcon size={16} />
          {sidebarOpen && <span style={{ marginLeft: '10px' }}>Settings</span>}
        </Link>
      </div>

      {/* Main Outlet */}
      <main className={`main-content ${sidebarOpen ? 'expanded' : 'collapsed'}`}>
        <Outlet />
      </main>

      {/* Mobile Bottom Tab Navigator */}
      <div className="bottom-nav glass">
        <button onClick={() => navigate('/')} className={`bottom-nav-item ${location.pathname === '/' ? 'active' : ''}`}>
          <HomeIcon size={18} />
          <span>Home</span>
        </button>
        <button onClick={() => navigate('/revisions')} className={`bottom-nav-item ${location.pathname === '/revisions' ? 'active' : ''}`}>
          <BookIcon size={18} />
          <span>Revisions</span>
        </button>
        <button onClick={() => navigate('/test')} className={`bottom-nav-item ${location.pathname === '/test' ? 'active' : ''}`}>
          <TestIcon size={18} />
          <span>Tests</span>
        </button>
        <button onClick={() => navigate('/stats')} className={`bottom-nav-item ${location.pathname === '/stats' ? 'active' : ''}`}>
          <StatsIcon size={18} />
          <span>Stats</span>
        </button>
        <button onClick={() => navigate('/settings')} className={`bottom-nav-item ${location.pathname === '/settings' ? 'active' : ''}`}>
          <SettingsIcon size={18} />
          <span>Settings</span>
        </button>
      </div>

      {/* Floating formulae drawer sheet */}
      <FormulaSheet />
    </div>
  );
}

// Styles for layouts
const layoutStyles = {
  streakBadge: {
    fontSize: '13px',
    fontWeight: '600',
    backgroundColor: 'var(--bg-elevated)',
    padding: '6px 12px',
    borderRadius: '20px',
    border: '1px solid var(--border-subtle)',
    color: 'var(--text-primary)'
  },
  gearBtn: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center'
  },
  avatarCircle: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: 'var(--accent)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: '700',
    boxShadow: '0 0 10px var(--accent-glow)'
  }
};

const PageFallback = () => (
  <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyCentert: 'center' }} className="flex justify-center items-center">
    <div className="skeleton" style={{ width: '100%', maxWidth: '400px', height: '140px', borderRadius: '16px' }} />
  </div>
);

// Lazy loading all pages for performance and code-splitting
const Home = React.lazy(() => import('./pages/Home'));
const Study = React.lazy(() => import('./pages/Study'));
const TestPage = React.lazy(() => import('./pages/TestPage'));
const StatsPage = React.lazy(() => import('./pages/StatsPage'));
const Onboarding = React.lazy(() => import('./pages/Onboarding'));
const Settings = React.lazy(() => import('./pages/Settings'));
const RevisionsPage = React.lazy(() => import('./pages/RevisionsPage'));
const SyllabusPage = React.lazy(() => import('./pages/SyllabusPage'));
const DailyChallengePage = React.lazy(() => import('./pages/DailyChallengePage'));

export default function App() {
  // Fire daily study reminders checking
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
              {/* Onboarding outside app portal layout */}
              <Route 
                path="/onboarding" 
                element={
                  <RequireNotOnboarded>
                    <Suspense fallback={<PageFallback />}><Onboarding /></Suspense>
                  </RequireNotOnboarded>
                } 
                className="onboarding-route"
              />

              {/* Study Mode outside layout */}
              <Route 
                path="/study/:subject/:chapterId" 
                element={
                  <RequireOnboarding>
                    <Suspense fallback={<PageFallback />}><Study /></Suspense>
                  </RequireOnboarding>
                } 
              />

              {/* Portal routes wrapped in shared MainLayout navigation */}
              <Route element={<RequireOnboarding><MainLayout /></RequireOnboarding>}>
                <Route path="/" element={<Suspense fallback={<PageFallback />}><Home /></Suspense>} />
                <Route path="/revisions" element={<Suspense fallback={<PageFallback />}><RevisionsPage /></Suspense>} />
                <Route path="/test" element={<Suspense fallback={<PageFallback />}><TestPage /></Suspense>} />
                <Route path="/syllabus" element={<Suspense fallback={<PageFallback />}><SyllabusPage /></Suspense>} />
                <Route path="/stats" element={<Suspense fallback={<PageFallback />}><StatsPage /></Suspense>} />
                <Route path="/settings" element={<Suspense fallback={<PageFallback />}><Settings /></Suspense>} />
                <Route path="/daily-challenge" element={<Suspense fallback={<PageFallback />}><DailyChallengePage /></Suspense>} />
              </Route>

              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>

        </UserProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
