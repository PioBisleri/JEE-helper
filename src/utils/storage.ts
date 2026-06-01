import type { ChapterProgress, ProgressMap, ConceptLearned, StudySession, Streak, Bookmark, NotesMap, LevelInfo } from '../types';

const SCHEMA_VERSION = 2;
const VERSION_KEY = 'jeeforge_schema_version';

function getNextReview(daysFromNow: number): string {
  return new Date(Date.now() + daysFromNow * 86400000).toISOString();
}

function ensureVersion() {
  const current = parseInt(localStorage.getItem(VERSION_KEY) || '1');
  if (current < SCHEMA_VERSION) {
    localStorage.setItem(VERSION_KEY, String(SCHEMA_VERSION));
  }
}

function safeParse<T>(key: string, fallback: T): T {
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

export function getLevelDetails(xp: number): LevelInfo {
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
  getProgress: (): ProgressMap => {
    ensureVersion();
    return safeParse<ProgressMap>('jeeforge_progress', {});
  },
  setProgress: (data: ProgressMap) => localStorage.setItem('jeeforge_progress', JSON.stringify(data)),

  getChapterProgress: (chapterId: string): ChapterProgress => {
    const p = storage.getProgress();
    return p[chapterId] || {
      questionsAttempted: 0,
      conceptsUnlocked: [],
      scaffoldHistory: [],
      currentSubtopicIndex: 0,
      currentDifficultyIndex: 0
    };
  },

  updateChapterProgress: (chapterId: string, update: Partial<ChapterProgress>) => {
    const p = storage.getProgress();
    p[chapterId] = { ...storage.getChapterProgress(chapterId), ...update };
    storage.setProgress(p);
  },

  resetChapterProgress: (chapterId: string) => {
    const p = storage.getProgress();
    if (p[chapterId]) {
      delete p[chapterId];
      storage.setProgress(p);
    }
  },

  getConceptsLearned: (): ConceptLearned[] => {
    ensureVersion();
    return safeParse<ConceptLearned[]>('jeeforge_concepts', []);
  },

  addConceptLearned: (concept: string, chapterId?: string) => {
    const existing = storage.getConceptsLearned();
    if (existing.find(e => e.concept === concept)) return;
    const entry: ConceptLearned = { concept, chapterId: chapterId || '', learnedAt: new Date().toISOString(), nextReview: getNextReview(1), reviewStage: 0 };
    existing.push(entry);
    localStorage.setItem('jeeforge_concepts', JSON.stringify(existing));
  },

  getWeeklyData: () => safeParse<{ testHistory: Array<{ date: string; score: number; total: number }>; currentWeekConcepts: string[] }>('jeeforge_weekly', { testHistory: [], currentWeekConcepts: [] }),
  setWeeklyData: (data: { testHistory: Array<{ date: string; score: number; total: number }>; currentWeekConcepts: string[] }) => localStorage.setItem('jeeforge_weekly', JSON.stringify(data)),

  getSessions: (): StudySession[] => safeParse<StudySession[]>('jeeforge_sessions', []),
  addSession: (session: Omit<StudySession, 'date'>) => {
    const sessions = storage.getSessions();
    sessions.push({ ...session, date: new Date().toISOString() } as StudySession);
    localStorage.setItem('jeeforge_sessions', JSON.stringify(sessions));
  },

  getStreak: (): Streak => safeParse<Streak>('jeeforge_streak', { current: 0, lastStudied: null, longest: 0 }),
  updateStreak: (): Streak => {
    const streak = storage.getStreak();
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (streak.lastStudied === today) return streak;
    const newCurrent = streak.lastStudied === yesterday ? streak.current + 1 : 1;
    const updated: Streak = { current: newCurrent, lastStudied: today, longest: Math.max(newCurrent, streak.longest) };
    localStorage.setItem('jeeforge_streak', JSON.stringify(updated));
    return updated;
  },

  isOnboarded: (): boolean => localStorage.getItem('jeeforge_onboarded') === 'true',
  setOnboarded: () => localStorage.setItem('jeeforge_onboarded', 'true'),

  getExamDate: (): string => localStorage.getItem('jeeforge_examdate') || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  setExamDate: (date: string) => localStorage.setItem('jeeforge_examdate', date),

  getMistakes: () => safeParse<Array<{ question: string; chapter?: string; chapterId?: string; category: string; advice: string; date?: string }>>('jeeforge_mistakes', []),
  addMistake: (mistake: { question: string; chapter?: string; chapterId?: string; category: string; advice: string }) => {
    const mistakes = storage.getMistakes();
    mistakes.push({ ...mistake, date: new Date().toISOString() });
    localStorage.setItem('jeeforge_mistakes', JSON.stringify(mistakes));
  },

  getReviewQueue: () => safeParse<Array<{ concept: string; chapterId?: string }>>('jeeforge_review', []),
  setReviewQueue: (queue: Array<{ concept: string; chapterId?: string }>) => localStorage.setItem('jeeforge_review', JSON.stringify(queue)),

  // XP System
  getXP: (): number => parseInt(localStorage.getItem('jeeforge_xp') || '0', 10),
  addXP: (amount: number) => {
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
  getBookmarks: (): Bookmark[] => safeParse<Bookmark[]>('jeeforge_bookmarks', []),
  addBookmark: (question: Bookmark) => {
    const bookmarks = storage.getBookmarks();
    if (bookmarks.find(b => b.question === question.question)) return;
    bookmarks.push({ ...question, bookmarkedAt: new Date().toISOString() });
    localStorage.setItem('jeeforge_bookmarks', JSON.stringify(bookmarks));
  },
  removeBookmark: (questionText: string) => {
    const bookmarks = storage.getBookmarks();
    const updated = bookmarks.filter(b => b.question !== questionText);
    localStorage.setItem('jeeforge_bookmarks', JSON.stringify(updated));
  },
  isBookmarked: (questionText: string) => {
    const bookmarks = storage.getBookmarks();
    return !!bookmarks.find(b => b.question === questionText);
  },

  // Notes Panel
  getNotes: (): NotesMap => safeParse<NotesMap>('jeeforge_notes', {}),
  saveNote: (concept: string, noteText: string) => {
    const notes = storage.getNotes();
    notes[concept] = {
      text: noteText,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem('jeeforge_notes', JSON.stringify(notes));
  },
  getNote: (concept: string): string => {
    const notes = storage.getNotes();
    return notes[concept] ? notes[concept].text : '';
  },

  // Settings & Preferences
  getUserName: (): string => localStorage.getItem('jeeforge_username') || 'Aspirant',
  setUserName: (name: string) => localStorage.setItem('jeeforge_username', name),
  
  getPreferences: () => safeParse<{ defaultMood: string; questionsPerSession: number; autoAdvance: boolean; notificationsEnabled: boolean; reminderTime: string; streakWarning: boolean; weeklyTestReminder: boolean }>('jeeforge_preferences', {
    defaultMood: '',
    questionsPerSession: 5,
    autoAdvance: false,
    notificationsEnabled: true,
    reminderTime: '19:00',
    streakWarning: true,
    weeklyTestReminder: true
  }),
  updatePreferences: (update: Partial<{ defaultMood: string; questionsPerSession: number; autoAdvance: boolean; notificationsEnabled: boolean; reminderTime: string; streakWarning: boolean; weeklyTestReminder: boolean }>) => {
    const current = storage.getPreferences();
    localStorage.setItem('jeeforge_preferences', JSON.stringify({ ...current, ...update }));
  },

  // Achievements
  getUnlockedAchievements: (): string[] => safeParse<string[]>('jeeforge_achievements', []),
  unlockAchievement: (badgeId: string): boolean => {
    const unlocked = storage.getUnlockedAchievements();
    if (unlocked.includes(badgeId)) return false;
    unlocked.push(badgeId);
    localStorage.setItem('jeeforge_achievements', JSON.stringify(unlocked));
    return true;
  },

  // Daily Challenge (Original single question - kept for compatibility)
  getDailyChallenge: () => safeParse<{ date: string | null; question: unknown; status: string }>('jeeforge_daily_challenge', {
    date: null,
    question: null,
    status: 'unattempted' // unattempted, correct, failed
  }),
  setDailyChallenge: (data: { date?: string | null; question?: unknown; status?: string }) => {
    const current = storage.getDailyChallenge();
    localStorage.setItem('jeeforge_daily_challenge', JSON.stringify({ ...current, ...data }));
  },

  // --- NEW FEATURES STORAGE EXTENSIONS ---

  // Revisions & Spaced Repetition history
  getConceptReviewHistory: (concept: string) => {
    const history = safeParse<Record<string, Array<{ date: string; correct: boolean; stage: number }>>>('jeeforge_review_history', {});
    return history[concept] || [];
  },
  addConceptReview: (concept: string, correct: boolean, stage: number) => {
    const history = safeParse<Record<string, Array<{ date: string; correct: boolean; stage: number }>>>('jeeforge_review_history', {});
    if (!history[concept]) history[concept] = [];
    history[concept].push({
      date: new Date().toISOString(),
      correct,
      stage
    });
    localStorage.setItem('jeeforge_review_history', JSON.stringify(history));
  },

  // Expanded Daily Challenge History (30 questions)
  getDailyChallengeHistory: () => safeParse<Array<{ date: string; score: number; total: number }>>('jeeforge_daily_challenge_history', []),
  setDailyChallengeHistory: (results: Array<{ date: string; score: number; total: number }>) => {
    localStorage.setItem('jeeforge_daily_challenge_history', JSON.stringify(results));
  },

  // AI Generated Chapter Summaries Cache
  getChapterSummaries: () => safeParse<Record<string, unknown>>('jeeforge_chapter_summaries', {}),
  setChapterSummaries: (summaries: Record<string, unknown>) => {
    localStorage.setItem('jeeforge_chapter_summaries', JSON.stringify(summaries));
  },

  // Chapter aggregate stats
  getChapterStats: (chapterId: string) => {
    const sessions = storage.getSessions().filter(s => s.chapterId === chapterId);
    const mistakes = storage.getMistakes().filter(m => m.chapter === chapterId || m.chapterId === chapterId);
    
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
  getGateAttempts: () => safeParse<Array<{ chapterId: string; date: string; score?: number; unlocked: boolean }>>('jeeforge_gate_attempts', []),
  setGateAttempts: (attempts: Array<{ chapterId: string; date: string; score?: number; unlocked: boolean }>) => {
    localStorage.setItem('jeeforge_gate_attempts', JSON.stringify(attempts));
  },
  isChapterUnlockedViaGate: (chapterId: string): boolean => {
    const attempts = storage.getGateAttempts();
    const cleanAttempt = attempts.find(a => a.chapterId === chapterId && a.unlocked === true);
    return !!cleanAttempt;
  },

  resetAll: () => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('jeeforge_'));
    keys.forEach(k => localStorage.removeItem(k));
    console.log(`[Nexus JEE] Reset ${keys.length} keys`);
  },

  // AI Provider Configuration
  getAIProvider: (): string => localStorage.getItem('jeeforge_ai_provider') || '',
  setAIProvider: (provider: string) => localStorage.setItem('jeeforge_ai_provider', provider),

  getAIApiKey: (): string => localStorage.getItem('jeeforge_ai_api_key') || '',
  setAIApiKey: (key: string) => localStorage.setItem('jeeforge_ai_api_key', key),

  getAIModel: (): string => localStorage.getItem('jeeforge_ai_model') || '',
  setAIModel: (model: string) => localStorage.setItem('jeeforge_ai_model', model),

  hasValidAIConfig: () => {
    const provider = localStorage.getItem('jeeforge_ai_provider');
    const key = localStorage.getItem('jeeforge_ai_api_key');
    return !!(provider && key);
  },
};
