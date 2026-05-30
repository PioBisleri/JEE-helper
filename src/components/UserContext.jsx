import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { storage, getLevelDetails } from '../utils/storage';
import { useToast } from './ToastContext';
import { ACHIEVEMENTS } from '../data/achievements';
import { CHAPTERS } from '../data/chapters';
import { fireAchievementUnlock } from '../utils/notifications';
import confetti from 'canvas-confetti';

const UserContext = createContext(null);

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export function UserProvider({ children }) {
  const { showToast } = useToast();
  const [xp, setXp] = useState(0);
  const [levelInfo, setLevelInfo] = useState({ levelNumber: 1, levelName: 'JEE Aspirant', xpInLevel: 0, xpNeededForNext: 500 });
  const [name, setName] = useState('Aspirant');
  const [streak, setStreak] = useState({ current: 0, lastStudied: null, longest: 0 });
  const [examDate, setExamDate] = useState('');
  const [bookmarks, setBookmarks] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [preferences, setPreferences] = useState({});
  const [showLevelUpOverlay, setShowLevelUpOverlay] = useState(false);
  const [levelUpName, setLevelUpName] = useState('');
  
  // Chapter Completion Celebration Overlay States
  const [showChapterCompleteOverlay, setShowChapterCompleteOverlay] = useState(false);
  const [completedChapterName, setCompletedChapterName] = useState('');

  // Forward declaration of checkProgressionXP so it can be called in useEffect
  let checkProgressionXPRef = React.useRef(() => {});

  // Load initial data
  useEffect(() => {
    const loadedXp = storage.getXP();
    setXp(loadedXp);
    setLevelInfo(getLevelDetails(loadedXp));
    setName(storage.getUserName());
    setStreak(storage.getStreak());
    setExamDate(storage.getExamDate());
    setBookmarks(storage.getBookmarks());
    setAchievements(storage.getUnlockedAchievements());
    setPreferences(storage.getPreferences());
    
    // Scan for any progression updates on boot
    setTimeout(() => {
      checkProgressionXPRef.current();
    }, 500);
  }, []);

  // Check achievements after relevant events
  const runAchievementChecks = useCallback((customStats = {}) => {
    const activeStreak = storage.getStreak();
    const activeBookmarks = storage.getBookmarks();
    const activeSessions = storage.getSessions();
    const activeWeekly = storage.getWeeklyData();
    const activeConcepts = storage.getConceptsLearned();
    const activeAchievements = storage.getUnlockedAchievements();

    // Compile comprehensive stats
    const totalAttempted = activeSessions.reduce((sum, s) => sum + (s.attempted || 0), 0);
    const weeklyTestHistory = activeWeekly.testHistory?.map(h => h.score) || [];
    
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

    // Check physics / chemistry completions
    const pChapters = storage.getProgress();
    // A chapter is completed if student master all concepts (simplified logic based on concept counts or completed chapter trackers)
    const completedChaptersCount = Object.keys(pChapters).filter(id => {
      const prog = pChapters[id];
      return prog.completed || false;
    }).length;

    const completedPhysicsChapter = Object.keys(pChapters).some(id => id.startsWith('phy_') && pChapters[id].completed);
    const completedChemistryChapter = Object.keys(pChapters).some(id => id.startsWith('chem_') && pChapters[id].completed);
    const completedIntegrals = pChapters['math_09']?.completed || false;

    // Track streaks
    let maxCleanStreak = 0;
    let currentClean = 0;
    activeSessions.forEach(s => {
      // simplified calculation of clean correct question streak
      if (s.solvedClean > 0) {
        currentClean += s.solvedClean;
        maxCleanStreak = Math.max(maxCleanStreak, currentClean);
      } else {
        currentClean = 0;
      }
    });

    const statsObj = {
      streak: activeStreak,
      bookmarksCount: activeBookmarks.length,
      totalAttempted,
      weeklyTestHistory,
      studiedLate,
      studiedEarly,
      completedChaptersCount,
      completedPhysicsChapter,
      completedChemistryChapter,
      completedIntegrals,
      maxCleanStreak,
      ...customStats
    };

    ACHIEVEMENTS.forEach(badge => {
      if (!activeAchievements.includes(badge.id)) {
        if (badge.check(statsObj)) {
          const unlocked = storage.unlockAchievement(badge.id);
          if (unlocked) {
            setAchievements(prev => [...prev, badge.id]);
            showToast(`Achievement Unlocked: ${badge.title}`, 'success');
            fireAchievementUnlock(badge.title, badge.emoji);
            
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
  const checkProgressionXP = useCallback((targetChapterId = null) => {
    let xpGranted = 0;
    let completedChapter = null;
    
    const progress = storage.getProgress();
    
    Object.keys(CHAPTERS).forEach(subject => {
      const list = CHAPTERS[subject];
      list.forEach((chapter, idx) => {
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
            completedChapter = chapter;
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
    
    if (completedChapter) {
      setCompletedChapterName(completedChapter.name);
      setShowChapterCompleteOverlay(true);
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      runAchievementChecks({ totalXp: storage.getXP() });
    }
  }, [runAchievementChecks, showToast]);

  // Bind the ref so initial useEffect can call it
  checkProgressionXPRef.current = checkProgressionXP;

  const gainXP = useCallback((amount) => {
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

  const updateName = useCallback((newName) => {
    storage.setUserName(newName);
    setName(newName);
    showToast('Profile name updated', 'success');
  }, [showToast]);

  const updateExam = useCallback((date) => {
    storage.setExamDate(date);
    setExamDate(date);
    showToast('Exam date updated', 'success');
  }, [showToast]);

  const updatePrefs = useCallback((updates) => {
    storage.updatePreferences(updates);
    setPreferences(prev => ({ ...prev, ...updates }));
    showToast('Preferences saved', 'success');
  }, [showToast]);

  const addBookmark = useCallback((question) => {
    storage.addBookmark(question);
    setBookmarks(storage.getBookmarks());
    showToast('Question bookmarked', 'success');
    runAchievementChecks({ bookmarksCount: storage.getBookmarks().length });
  }, [showToast, runAchievementChecks]);

  const removeBookmark = useCallback((questionText) => {
    storage.removeBookmark(questionText);
    setBookmarks(storage.getBookmarks());
    showToast('Bookmark removed', 'warning');
  }, [showToast]);

  const updateStreakData = useCallback(() => {
    const updated = storage.updateStreak();
    setStreak(updated);
    runAchievementChecks({ streak: updated });
  }, [runAchievementChecks]);

  const triggerResetAll = useCallback(() => {
    storage.resetAll();
    // Reload page to re-initialize
    window.location.reload();
  }, []);

  return (
    <UserContext.Provider
      value={{
        xp,
        levelInfo,
        name,
        streak,
        examDate,
        bookmarks,
        achievements,
        preferences,
        gainXP,
        updateName,
        updateExam,
        updatePrefs,
        addBookmark,
        removeBookmark,
        updateStreakData,
        runAchievementChecks,
        triggerResetAll,
        checkProgressionXP
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

const celebrationStyles = {
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
