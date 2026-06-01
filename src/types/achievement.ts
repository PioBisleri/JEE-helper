export interface Achievement {
  id: string;
  title: string;
  icon: string;
  description: string;
  emoji?: string;
  check: (stats: AchievementStats) => boolean;
}

export interface AchievementStats {
  streak: { current: number; longest: number; lastStudied: string | null };
  bookmarksCount: number;
  totalAttempted: number;
  totalCorrect: number;
  totalSessions: number;
  longestSession: number;
  overallAccuracy: number;
  weeklyTestHistory: number[];
  studiedLate: boolean;
  studiedEarly: boolean;
  completedChaptersCount: number;
  completedPhysicsChapter: boolean;
  completedChemistryChapter: boolean;
  completedMathChapter: boolean;
  completedIntegrals: boolean;
  completedPhysicsChapters: number;
  completedChemistryChapters: number;
  completedMathChapters: number;
  maxCleanStreak: number;
  notesCount: number;
  totalXp: number;
  level: number;
  totalAchievementsUnlocked: number;
  [key: string]: unknown;
}
