import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { storage, getLevelDetails } from '../utils/storage';
import { authService } from '../services/authService';
import { syncManager } from '../services/syncManager';
import { useToast } from './ToastContext';
import { track } from '../utils/analytics';
import { ACHIEVEMENTS } from '../data/achievements';
import { CHAPTERS } from '../data/chapters';
import { fireAchievementUnlock } from '../utils/notifications';
import confetti from 'canvas-confetti';
import type { Chapter, ChaptersData } from '../types';

interface User {
  id: number;
  email?: string;
  name: string;
}

interface UserContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  xp: number;
  levelInfo: { levelNumber: number; levelName: string; xpInLevel: number; xpNeededForNext: number; totalXp: number };
  name: string;
  streak: { current: number; lastStudied: string | null; longest: number };
  examDate: string;
  bookmarks: unknown[];
  achievements: string[];
  preferences: Record<string, unknown>;
  showLevelUpOverlay: boolean;
  levelUpName: string;
  showChapterCompleteOverlay: boolean;
  completedChapterName: string;
  gainXP: (amount: number) => void;
  updateName: (name: string) => void;
  updateExam: (date: string) => void;
  updatePrefs: (updates: Record<string, unknown>) => void;
  addBookmark: (question: unknown) => void;
  removeBookmark: (questionText: string) => void;
  updateStreakData: () => void;
  runAchievementChecks: (customStats?: Record<string, unknown>) => void;
  triggerResetAll: () => void;
  checkProgressionXP: (targetChapterId?: string | null) => void;
  logout: () => void;
  setAuth: (token: string) => Promise<void>;
}

const UserContext = createContext<UserContextValue | null>(null);

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { showToast } = useToast();

  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => authService.isAuthenticated());
  const [isLoading, setIsLoading] = useState(true);

  const [xp, setXp] = useState(0);
  const [levelInfo, setLevelInfo] = useState({ levelNumber: 1, levelName: 'JEE Aspirant', xpInLevel: 0, xpNeededForNext: 500, totalXp: 0 });
  const [name, setName] = useState('Aspirant');
  const [streak, setStreak] = useState<{ current: number; lastStudied: string | null; longest: number }>({ current: 0, lastStudied: null, longest: 0 });
  const [examDate, setExamDate] = useState('');
  const [bookmarks, setBookmarks] = useState<unknown[]>([]);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [preferences, setPreferences] = useState<Record<string, unknown>>({});
  const [showLevelUpOverlay, setShowLevelUpOverlay] = useState(false);
  const [levelUpName, setLevelUpName] = useState('');
  const [showChapterCompleteOverlay, setShowChapterCompleteOverlay] = useState(false);
  const [completedChapterName, setCompletedChapterName] = useState('');

  let checkProgressionXPRef = React.useRef<(id?: string | null) => void>(() => {});

  // Load initial data - try backend first, fallback to localStorage
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        if (isAuthenticated) {
          // Try loading from backend
          const me = await authService.getMe();
          setUser(me);
          setName(me.name);

          const profile = await syncManager.fetchProfile();
          setExamDate(profile.exam_date || '');
          setPreferences(profile.preferences || {});

          const xpData = await syncManager.fetchXP();
          setXp(xpData.total_xp);
          setLevelInfo(getLevelDetails(xpData.total_xp));

          const streakData = await syncManager.fetchStreak();
          setStreak({ current: streakData.current, lastStudied: streakData.last_studied || null, longest: streakData.longest });

          const bookmarksData = await syncManager.fetchBookmarks();
          setBookmarks(bookmarksData);

          const achievementsData = await syncManager.fetchAchievements();
          setAchievements(achievementsData.map(a => a.badge_id));
        } else {
          // Offline mode - load from localStorage
          const loadedXp = storage.getXP();
          setXp(loadedXp);
          setLevelInfo(getLevelDetails(loadedXp));
          setName(storage.getUserName());
          setStreak(storage.getStreak());
          setExamDate(storage.getExamDate());
          setBookmarks(storage.getBookmarks());
          setAchievements(storage.getUnlockedAchievements());
          setPreferences(storage.getPreferences());
        }
      } catch (err) {
        // Backend unavailable - fallback to localStorage
        console.warn('Backend unavailable, using localStorage:', err);
        const loadedXp = storage.getXP();
        setXp(loadedXp);
        setLevelInfo(getLevelDetails(loadedXp));
        setName(storage.getUserName());
        setStreak(storage.getStreak());
        setExamDate(storage.getExamDate());
        setBookmarks(storage.getBookmarks());
        setAchievements(storage.getUnlockedAchievements());
        setPreferences(storage.getPreferences());
      } finally {
        setIsLoading(false);
        setTimeout(() => {
          checkProgressionXPRef.current();
        }, 500);
      }
    }
    loadData();
  }, [isAuthenticated]);

  // Check achievements after relevant events
  const runAchievementChecks = useCallback((customStats: Record<string, unknown> = {}) => {
    const activeStreak = storage.getStreak();
    const activeBookmarks = storage.getBookmarks();
    const activeSessions = storage.getSessions();
    const activeWeekly = storage.getWeeklyData();
    const activeConcepts = storage.getConceptsLearned();
    const activeAchievements = storage.getUnlockedAchievements();

    // Compile comprehensive stats
    const totalAttempted = activeSessions.reduce((sum, s) => sum + (s.attempted || 0), 0);
    const totalCorrect = activeSessions.reduce((sum, s) => sum + (s.solvedClean || 0), 0);
    const weeklyTestHistory = activeWeekly.testHistory || [];
    const overallAccuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
    
    // Check late/early studying
    let studiedLate = false;
    let studiedEarly = false;
    activeSessions.forEach(s => {
      if (s.date) {
        const hour = new Date(s.date).getHours();
        if (hour >= 22) studiedLate = true;
        if (hour < 7) studiedEarly = true;
      }
    });

    // Check physics / chemistry / math completions
    const pChapters = storage.getProgress();
    const completedChaptersCount = Object.keys(pChapters).filter(id => pChapters[id].completed).length;
    const completedPhysicsChapter = Object.keys(pChapters).some(id => id.startsWith('phy_') && pChapters[id].completed);
    const completedChemistryChapter = Object.keys(pChapters).some(id => id.startsWith('chem_') && pChapters[id].completed);
    const completedMathChapter = Object.keys(pChapters).some(id => id.startsWith('math_') && pChapters[id].completed);
    const completedIntegrals = pChapters['math_09']?.completed || false;
    const completedPhysicsChapters = Object.keys(pChapters).filter(id => id.startsWith('phy_') && pChapters[id].completed).length;
    const completedChemistryChapters = Object.keys(pChapters).filter(id => id.startsWith('chem_') && pChapters[id].completed).length;
    const completedMathChapters = Object.keys(pChapters).filter(id => id.startsWith('math_') && pChapters[id].completed).length;

    // Track clean streaks
    let maxCleanStreak = 0;
    let currentClean = 0;
    activeSessions.forEach(s => {
      if (s.solvedClean > 0) {
        currentClean += s.solvedClean;
        maxCleanStreak = Math.max(maxCleanStreak, currentClean);
      } else {
        currentClean = 0;
      }
    });

    // Notes count
    const notes = storage.getNotes();
    const notesCount = Object.keys(notes).length;

    // Session stats
    const totalSessions = activeSessions.length;
    const longestSession = activeSessions.reduce((max, s) => Math.max(max, s.attempted || 0), 0);

    // XP and level
    const totalXp = storage.getXP();
    const levelInfo = getLevelDetails(totalXp);

    const statsObj = {
      streak: activeStreak,
      bookmarksCount: activeBookmarks.length,
      totalAttempted,
      totalCorrect,
      totalSessions,
      longestSession,
      overallAccuracy,
      weeklyTestHistory: weeklyTestHistory.map(h => h.score),
      studiedLate,
      studiedEarly,
      completedChaptersCount,
      completedPhysicsChapter,
      completedChemistryChapter,
      completedMathChapter,
      completedIntegrals,
      completedPhysicsChapters,
      completedChemistryChapters,
      completedMathChapters,
      maxCleanStreak,
      notesCount,
      totalXp,
      level: levelInfo.levelNumber,
      totalAchievementsUnlocked: activeAchievements.length,
      ...customStats
    };

    ACHIEVEMENTS.forEach(badge => {
      if (!activeAchievements.includes(badge.id)) {
        if (badge.check(statsObj)) {
          const unlocked = storage.unlockAchievement(badge.id);
          if (unlocked) {
            setAchievements(prev => [...prev, badge.id]);
            showToast(`Achievement Unlocked: ${badge.title}`, 'success');
            fireAchievementUnlock(badge.title, badge.emoji || badge.icon);
            
            // Pop some minor confetti for achievement
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.8 }
            });
          }
        }
      }
    });
  }, [showToast]);

  // Dynamically checks and awards Progression XP (+50 for Unlock, +100 for Completion)
  const checkProgressionXP = useCallback((targetChapterId: string | null = null) => {
    let xpGranted = 0;
    const completedChapterRef: { chapter: Chapter | null } = { chapter: null };
    
    const progress = storage.getProgress();
    
    (Object.keys(CHAPTERS) as (keyof ChaptersData)[]).forEach(subject => {
      const list = CHAPTERS[subject];
      list.forEach((chapter: Chapter, idx: number) => {
        const chapterProg = progress[chapter.id] || {
          questionsAttempted: 0,
          conceptsUnlocked: [],
          completed: false
        };
        
        // 1. Determine if chapter N is unlocked
        let isUnlocked = false;
        if (idx === 0) {
          isUnlocked = true;
        } else {
          const prevChapter = list[idx - 1];
          const prevProg = progress[prevChapter.id] || {};
          const prevTotal = prevChapter.difficulty_curve.length;
          const prevUnlocked = prevProg.conceptsUnlocked?.length || 0;
          const prevPercent = prevTotal > 0 ? (prevUnlocked / prevTotal) * 100 : 0;
          
          if (prevPercent >= 25 || storage.isChapterUnlockedViaGate(chapter.id)) {
            isUnlocked = true;
          }
        }
        
        // Award XP for first unlock
        if (isUnlocked && !chapterProg.unlockedXpRewarded) {
          xpGranted += 50;
          chapterProg.unlockedXpRewarded = true;
          storage.updateChapterProgress(chapter.id, { unlockedXpRewarded: true });
        }
        
        // 2. Determine if chapter N is complete (100% of difficulty_curve mastered)
        const totalConcepts = chapter.difficulty_curve.length;
        const unlockedCount = chapterProg.conceptsUnlocked?.length || 0;
        const isCompleted = totalConcepts > 0 && unlockedCount === totalConcepts;
        
        if (isCompleted && !chapterProg.completedXpRewarded) {
          xpGranted += 100;
          chapterProg.completedXpRewarded = true;
          chapterProg.completed = true;
          storage.updateChapterProgress(chapter.id, { completedXpRewarded: true, completed: true });
          
          if (!targetChapterId || targetChapterId === chapter.id) {
            completedChapterRef.chapter = chapter;
          }
        }
      });
    });
    
    if (xpGranted > 0) {
      const result = storage.addXP(xpGranted);
      setXp(result.xp);
      const details = getLevelDetails(result.xp);
      setLevelInfo(details);
      
      if (result.leveledUp) {
        setLevelUpName(details.levelName);
        setShowLevelUpOverlay(true);
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
        showToast(`Level Up! You are now a ${details.levelName}`, 'success');
        setTimeout(() => setShowLevelUpOverlay(false), 2500);
      } else {
        showToast(`+${xpGranted} XP Progression Bonus!`, 'success');
      }
    }
    
    if (completedChapterRef.chapter) {
      setCompletedChapterName(completedChapterRef.chapter.name);
      setShowChapterCompleteOverlay(true);
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      runAchievementChecks({ totalXp: storage.getXP() });
    }
  }, [runAchievementChecks, showToast]);

  // Bind the ref so initial useEffect can call it
  checkProgressionXPRef.current = checkProgressionXP;

  const gainXP = useCallback((amount: number) => {
    const result = storage.addXP(amount);
    setXp(result.xp);
    const details = getLevelDetails(result.xp);
    setLevelInfo(details);

    if (result.leveledUp) {
      setLevelUpName(details.levelName);
      setShowLevelUpOverlay(true);
      
      // Fire massive level-up confetti
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });

      showToast(`Level Up! You are now a ${details.levelName}`, 'success');
      
      // Auto-dismiss celebration overlay after 2.5 seconds
      setTimeout(() => {
        setShowLevelUpOverlay(false);
      }, 2500);
    } else {
      showToast(`+${amount} XP Gained`, 'info');
    }

    // Check achievements with updated XP stats
    runAchievementChecks({ totalXp: result.xp });
  }, [showToast, runAchievementChecks]);

  const updateName = useCallback((newName: string) => {
    storage.setUserName(newName);
    setName(newName);
    showToast('Profile name updated', 'success');
  }, [showToast]);

  const updateExam = useCallback((date: string) => {
    storage.setExamDate(date);
    setExamDate(date);
    showToast('Exam date updated', 'success');
  }, [showToast]);

  const updatePrefs = useCallback((updates: Record<string, unknown>) => {
    storage.updatePreferences(updates);
    setPreferences(prev => ({ ...prev, ...updates }));
    showToast('Preferences saved', 'success');
  }, [showToast]);

  const addBookmark = useCallback((question: unknown) => {
    storage.addBookmark(question as Parameters<typeof storage.addBookmark>[0]);
    setBookmarks(storage.getBookmarks());
    showToast('Question bookmarked', 'success');
    runAchievementChecks({ bookmarksCount: storage.getBookmarks().length });
  }, [showToast, runAchievementChecks]);

  const removeBookmark = useCallback((questionText: string) => {
    storage.removeBookmark(questionText);
    setBookmarks(storage.getBookmarks());
    showToast('Bookmark removed', 'warning');
  }, [showToast]);

  const updateStreakData = useCallback(() => {
    const updated = storage.updateStreak();
    setStreak(updated);
    runAchievementChecks({ streak: updated });
  }, [runAchievementChecks, showToast]);

  const triggerResetAll = useCallback(() => {
    storage.resetAll();
    window.location.reload();
  }, []);

  const logout = useCallback(() => {
    track('auth_logout');
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    // Clear all state
    setXp(0);
    setLevelInfo({ levelNumber: 1, levelName: 'JEE Aspirant', xpInLevel: 0, xpNeededForNext: 500, totalXp: 0 });
    setName('Aspirant');
    setStreak({ current: 0, lastStudied: null, longest: 0 });
    setExamDate('');
    setBookmarks([]);
    setAchievements([]);
    setPreferences({});
  }, []);

  // Called by Auth page after successful login/register
  const setAuth = useCallback(async (_token: string) => {
    setIsAuthenticated(true);
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        xp,
        levelInfo,
        name,
        streak,
        examDate,
        bookmarks,
        achievements,
        preferences,
        showLevelUpOverlay,
        levelUpName,
        showChapterCompleteOverlay,
        completedChapterName,
        gainXP,
        updateName,
        updateExam,
        updatePrefs,
        addBookmark,
        removeBookmark,
        updateStreakData,
        runAchievementChecks,
        triggerResetAll,
        checkProgressionXP,
        logout,
        setAuth,
      }}
    >
      {children}

      {/* Level Up Celebration Overlay */}
      {showLevelUpOverlay && (
        <div style={celebrationStyles.overlay}>
          <div style={celebrationStyles.content} className="glass">
            <span style={celebrationStyles.badge}>LEVEL UP</span>
            <h1 style={celebrationStyles.title}>{levelInfo.levelNumber}</h1>
            <p style={celebrationStyles.subtitle}>You have advanced to</p>
            <h2 style={celebrationStyles.levelName}>{levelUpName}</h2>
            <div style={celebrationStyles.barContainer}>
              <div style={celebrationStyles.barFiller}></div>
            </div>
            <p style={celebrationStyles.footer}>Keep solving to reach the next tier!</p>
          </div>
        </div>
      )}

      {/* Chapter Complete Celebration Overlay */}
      {showChapterCompleteOverlay && (
        <div style={celebrationStyles.overlay}>
          <div style={celebrationStyles.content} className="glass">
            <span style={celebrationStyles.badge}>CHAPTER COMPLETE</span>
            <h1 style={{ ...celebrationStyles.title, color: 'var(--success)', textShadow: '0 0 20px rgba(16, 185, 129, 0.4)' }}>100%</h1>
            <p style={celebrationStyles.subtitle}>You have mastered all concepts in</p>
            <h2 style={celebrationStyles.levelName}>{completedChapterName}</h2>
            <p style={{ ...celebrationStyles.footer, fontSize: '14px', color: 'var(--warning)', fontWeight: 'bold' }}>+100 XP Completion Bonus!</p>
            <button 
              className="btn btn-primary" 
              style={{ marginTop: '20px', width: '150px' }} 
              onClick={() => setShowChapterCompleteOverlay(false)}
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </UserContext.Provider>
  );
}

const celebrationStyles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 99999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(8, 11, 20, 0.95)'
  },
  content: {
    padding: '40px',
    borderRadius: '24px',
    textAlign: 'center',
    maxWidth: '450px',
    width: '90%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxShadow: '0 0 40px var(--accent-glow)',
    border: '1px solid var(--accent)'
  },
  badge: {
    color: 'var(--warning)',
    fontWeight: '800',
    letterSpacing: '2px',
    fontSize: '14px',
    marginBottom: '16px'
  },
  title: {
    fontFamily: 'var(--font-mono)',
    fontSize: '72px',
    lineHeight: '1',
    color: 'var(--accent)',
    textShadow: '0 0 20px var(--accent-glow)',
    marginBottom: '8px'
  },
  subtitle: {
    color: 'var(--text-secondary)',
    fontSize: '16px',
    marginBottom: '8px'
  },
  levelName: {
    fontSize: '28px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    marginBottom: '24px'
  },
  barContainer: {
    width: '100%',
    height: '8px',
    borderRadius: '4px',
    backgroundColor: 'var(--bg-elevated)',
    overflow: 'hidden',
    marginBottom: '20px'
  },
  barFiller: {
    height: '100%',
    width: '100%',
    backgroundColor: 'var(--accent)',
    boxShadow: '0 0 10px var(--accent)'
  },
  footer: {
    fontSize: '12px',
    color: 'var(--text-muted)'
  }
};
