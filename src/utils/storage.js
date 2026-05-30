const SCHEMA_VERSION = 2;
const VERSION_KEY = 'jeeforge_schema_version';

function getNextReview(daysFromNow) {
  return new Date(Date.now() + daysFromNow * 86400000).toISOString();
}

function ensureVersion() {
  const current = parseInt(localStorage.getItem(VERSION_KEY) || '1');
  if (current < SCHEMA_VERSION) {
    localStorage.setItem(VERSION_KEY, String(SCHEMA_VERSION));
  }
}

function safeParse(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
}

// XP Levels
const LEVEL_NAMES = [
  'JEE Aspirant',     // Level 1: 0 - 499
  'Problem Solver',   // Level 2: 500 - 999
  'Concept Crusher',  // Level 3: 1000 - 1499
  'Formula Master',   // Level 4: 1500 - 1999
  'JEE Warrior',      // Level 5: 2000 - 2499
  'JEE Legend'        // Level 6+: 2500+
];

export function getLevelDetails(xp) {
  const levelNumber = Math.min(Math.floor(xp / 500) + 1, LEVEL_NAMES.length);
  const levelName = LEVEL_NAMES[levelNumber - 1] || 'JEE Legend';
  const xpInLevel = xp % 500;
  const xpNeededForNext = levelNumber >= LEVEL_NAMES.length ? 0 : 500;
  return {
    levelNumber,
    levelName,
    xpInLevel,
    xpNeededForNext,
    totalXp: xp
  };
}

export const storage = {
  getProgress: () => {
    ensureVersion();
    return safeParse('jeeforge_progress', {});
  },
  setProgress: (data) => localStorage.setItem('jeeforge_progress', JSON.stringify(data)),

  getChapterProgress: (chapterId) => {
    const p = storage.getProgress();
    return p[chapterId] || {
      questionsAttempted: 0,
      conceptsUnlocked: [],
      scaffoldHistory: [],
      currentSubtopicIndex: 0,
      currentDifficultyIndex: 0
    };
  },

  updateChapterProgress: (chapterId, update) => {
    const p = storage.getProgress();
    p[chapterId] = { ...storage.getChapterProgress(chapterId), ...update };
    storage.setProgress(p);
  },

  resetChapterProgress: (chapterId) => {
    const p = storage.getProgress();
    if (p[chapterId]) {
      delete p[chapterId];
      storage.setProgress(p);
    }
  },

  getConceptsLearned: () => {
    ensureVersion();
    return safeParse('jeeforge_concepts', []);
  },

  addConceptLearned: (concept, chapterId) => {
    const existing = storage.getConceptsLearned();
    if (existing.find(e => e.concept === concept)) return;
    const entry = { concept, chapterId, learnedAt: new Date().toISOString(), nextReview: getNextReview(1), reviewStage: 0 };
    existing.push(entry);
    localStorage.setItem('jeeforge_concepts', JSON.stringify(existing));
  },

  getWeeklyData: () => safeParse('jeeforge_weekly', { testHistory: [], currentWeekConcepts: [] }),
  setWeeklyData: (data) => localStorage.setItem('jeeforge_weekly', JSON.stringify(data)),

  getSessions: () => safeParse('jeeforge_sessions', []),
  addSession: (session) => {
    const sessions = storage.getSessions();
    sessions.push({ ...session, date: new Date().toISOString() });
    localStorage.setItem('jeeforge_sessions', JSON.stringify(sessions));
  },

  getStreak: () => safeParse('jeeforge_streak', { current: 0, lastStudied: null, longest: 0 }),
  updateStreak: () => {
    const streak = storage.getStreak();
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (streak.lastStudied === today) return streak;
    const newCurrent = streak.lastStudied === yesterday ? streak.current + 1 : 1;
    const updated = { current: newCurrent, lastStudied: today, longest: Math.max(newCurrent, streak.longest) };
    localStorage.setItem('jeeforge_streak', JSON.stringify(updated));
    return updated;
  },

  isOnboarded: () => localStorage.getItem('jeeforge_onboarded') === 'true',
  setOnboarded: () => localStorage.setItem('jeeforge_onboarded', 'true'),

  getExamDate: () => localStorage.getItem('jeeforge_examdate') || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  setExamDate: (date) => localStorage.setItem('jeeforge_examdate', date),

  getMistakes: () => safeParse('jeeforge_mistakes', []),
  addMistake: (mistake) => {
    const mistakes = storage.getMistakes();
    mistakes.push({ ...mistake, date: new Date().toISOString() });
    localStorage.setItem('jeeforge_mistakes', JSON.stringify(mistakes));
  },

  getReviewQueue: () => safeParse('jeeforge_review', []),
  setReviewQueue: (queue) => localStorage.setItem('jeeforge_review', JSON.stringify(queue)),

  // XP System
  getXP: () => parseInt(localStorage.getItem('jeeforge_xp') || '0', 10),
  addXP: (amount) => {
    const currentXP = storage.getXP();
    const newXP = currentXP + amount;
    localStorage.setItem('jeeforge_xp', String(newXP));

    const oldLevel = getLevelDetails(currentXP).levelNumber;
    const newLevel = getLevelDetails(newXP).levelNumber;
    const leveledUp = newLevel > oldLevel;

    return {
      xp: newXP,
      oldLevel,
      newLevel,
      leveledUp
    };
  },

  // Bookmarks System
  getBookmarks: () => safeParse('jeeforge_bookmarks', []),
  addBookmark: (question) => {
    const bookmarks = storage.getBookmarks();
    if (bookmarks.find(b => b.question === question.question)) return;
    bookmarks.push({ ...question, bookmarkedAt: new Date().toISOString() });
    localStorage.setItem('jeeforge_bookmarks', JSON.stringify(bookmarks));
  },
  removeBookmark: (questionText) => {
    const bookmarks = storage.getBookmarks();
    const updated = bookmarks.filter(b => b.question !== questionText);
    localStorage.setItem('jeeforge_bookmarks', JSON.stringify(updated));
  },
  isBookmarked: (questionText) => {
    const bookmarks = storage.getBookmarks();
    return !!bookmarks.find(b => b.question === questionText);
  },

  // Notes Panel
  getNotes: () => safeParse('jeeforge_notes', {}),
  saveNote: (concept, noteText) => {
    const notes = storage.getNotes();
    notes[concept] = {
      text: noteText,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem('jeeforge_notes', JSON.stringify(notes));
  },
  getNote: (concept) => {
    const notes = storage.getNotes();
    return notes[concept] ? notes[concept].text : '';
  },

  // Settings & Preferences
  getUserName: () => localStorage.getItem('jeeforge_username') || 'Aspirant',
  setUserName: (name) => localStorage.setItem('jeeforge_username', name),
  
  getPreferences: () => safeParse('jeeforge_preferences', {
    defaultMood: '',
    questionsPerSession: 5,
    autoAdvance: false,
    notificationsEnabled: true,
    reminderTime: '19:00',
    streakWarning: true,
    weeklyTestReminder: true
  }),
  updatePreferences: (update) => {
    const current = storage.getPreferences();
    localStorage.setItem('jeeforge_preferences', JSON.stringify({ ...current, ...update }));
  },

  // Achievements
  getUnlockedAchievements: () => safeParse('jeeforge_achievements', []),
  unlockAchievement: (badgeId) => {
    const unlocked = storage.getUnlockedAchievements();
    if (unlocked.includes(badgeId)) return false;
    unlocked.push(badgeId);
    localStorage.setItem('jeeforge_achievements', JSON.stringify(unlocked));
    return true;
  },

  // Daily Challenge (Original single question - kept for compatibility)
  getDailyChallenge: () => safeParse('jeeforge_daily_challenge', {
    date: null,
    question: null,
    status: 'unattempted' // unattempted, correct, failed
  }),
  setDailyChallenge: (data) => {
    const current = storage.getDailyChallenge();
    localStorage.setItem('jeeforge_daily_challenge', JSON.stringify({ ...current, ...data }));
  },

  // --- NEW FEATURES STORAGE EXTENSIONS ---

  // Revisions & Spaced Repetition history
  getConceptReviewHistory: (concept) => {
    const history = safeParse('jeeforge_review_history', {});
    return history[concept] || [];
  },
  addConceptReview: (concept, correct, stage) => {
    const history = safeParse('jeeforge_review_history', {});
    if (!history[concept]) history[concept] = [];
    history[concept].push({
      date: new Date().toISOString(),
      correct,
      stage
    });
    localStorage.setItem('jeeforge_review_history', JSON.stringify(history));
  },

  // Expanded Daily Challenge History (30 questions)
  getDailyChallengeHistory: () => safeParse('jeeforge_daily_challenge_history', []),
  setDailyChallengeHistory: (results) => {
    localStorage.setItem('jeeforge_daily_challenge_history', JSON.stringify(results));
  },

  // AI Generated Chapter Summaries Cache
  getChapterSummaries: () => safeParse('jeeforge_chapter_summaries', {}),
  setChapterSummaries: (summaries) => {
    localStorage.setItem('jeeforge_chapter_summaries', JSON.stringify(summaries));
  },

  // Chapter aggregate stats
  getChapterStats: (chapterId) => {
    const sessions = storage.getSessions().filter(s => s.chapterId === chapterId);
    const mistakes = storage.getMistakes().filter(m => m.chapter === chapterId);
    
    let totalAttempted = 0;
    let totalCorrect = 0;
    let timeSpent = 0;
    
    sessions.forEach(s => {
      totalAttempted += s.attempted || 0;
      totalCorrect += s.totalCorrect || s.solvedClean || 0;
      timeSpent += s.timeSpent || 0;
    });
    
    const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
    
    return {
      totalAttempted,
      totalCorrect,
      accuracy,
      timeSpent,
      mistakeCount: mistakes.length
    };
  },

  // Early unlock gate attempts
  getGateAttempts: () => safeParse('jeeforge_gate_attempts', []),
  setGateAttempts: (attempts) => {
    localStorage.setItem('jeeforge_gate_attempts', JSON.stringify(attempts));
  },
  isChapterUnlockedViaGate: (chapterId) => {
    const attempts = storage.getGateAttempts();
    const cleanAttempt = attempts.find(a => a.chapterId === chapterId && a.unlocked === true);
    return !!cleanAttempt;
  },

  resetAll: () => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('jeeforge_'));
    keys.forEach(k => localStorage.removeItem(k));
    console.log(`[Nexus JEE] Reset ${keys.length} keys`);
  }
};
