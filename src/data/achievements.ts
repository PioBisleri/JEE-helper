import type { Achievement } from '../types';

export const ACHIEVEMENTS: Achievement[] = [
  // ─── Streaks ───
  { id: "streak_3", title: "Getting Started", icon: "FlameIcon", description: "Reach a 3-day learning streak", check: (s) => (s.streak?.current >= 3) },
  { id: "streak_7", title: "On Fire", icon: "FlameIcon", description: "Reach a 7-day learning streak", check: (s) => (s.streak?.current >= 7) },
  { id: "streak_14", title: "Dedicated", icon: "FlameIcon", description: "Reach a 14-day learning streak", check: (s) => (s.streak?.current >= 14) },
  { id: "streak_30", title: "Consistent", icon: "FlameIcon", description: "Reach a 30-day learning streak", check: (s) => (s.streak?.current >= 30) },
  { id: "streak_60", title: "Unstoppable", icon: "FlameIcon", description: "Reach a 60-day learning streak", check: (s) => (s.streak?.current >= 60) },
  { id: "streak_90", title: "Iron Will", icon: "FlameIcon", description: "Reach a 90-day learning streak", check: (s) => (s.streak?.current >= 90) },
  { id: "streak_180", title: "Half-Year Hero", icon: "FlameIcon", description: "Reach a 180-day learning streak", check: (s) => (s.streak?.current >= 180) },
  { id: "streak_365", title: "Year of Learning", icon: "FlameIcon", description: "Reach a 365-day learning streak", check: (s) => (s.streak?.current >= 365) },

  // ─── Question Milestones ───
  { id: "q_10", title: "First Steps", icon: "LightningIcon", description: "Attempt 10 questions", check: (s) => (s.totalAttempted >= 10) },
  { id: "q_50", title: "Half Century", icon: "LightningIcon", description: "Attempt 50 questions", check: (s) => (s.totalAttempted >= 50) },
  { id: "century", title: "Century", icon: "CenturyIcon", description: "Attempt 100 questions", check: (s) => (s.totalAttempted >= 100) },
  { id: "q_250", title: "Quarter Grand", icon: "LightningIcon", description: "Attempt 250 questions", check: (s) => (s.totalAttempted >= 250) },
  { id: "q_500", title: "Half Thousand", icon: "LightningIcon", description: "Attempt 500 questions", check: (s) => (s.totalAttempted >= 500) },
  { id: "q_1000", title: "Thousand Club", icon: "LightningIcon", description: "Attempt 1,000 questions", check: (s) => (s.totalAttempted >= 1000) },
  { id: "q_2500", title: "Relentless", icon: "LightningIcon", description: "Attempt 2,500 questions", check: (s) => (s.totalAttempted >= 2500) },
  { id: "q_5000", title: "Question Machine", icon: "LightningIcon", description: "Attempt 5,000 questions", check: (s) => (s.totalAttempted >= 5000) },

  // ─── XP Milestones ───
  { id: "xp_100", title: "XP Beginner", icon: "StarIcon", description: "Earn 100 XP", check: (s) => (s.totalXp >= 100) },
  { id: "xp_500", title: "XP Hunter", icon: "StarIcon", description: "Earn 500 XP", check: (s) => (s.totalXp >= 500) },
  { id: "xp_1000", title: "XP Collector", icon: "StarIcon", description: "Earn 1,000 XP", check: (s) => (s.totalXp >= 1000) },
  { id: "xp_2500", title: "XP Grinder", icon: "StarIcon", description: "Earn 2,500 XP", check: (s) => (s.totalXp >= 2500) },
  { id: "xp_5000", title: "XP Legend", icon: "StarIcon", description: "Earn 5,000 XP", check: (s) => (s.totalXp >= 5000) },
  { id: "xp_10000", title: "XP Titan", icon: "StarIcon", description: "Earn 10,000 XP", check: (s) => (s.totalXp >= 10000) },

  // ─── Level Achievements ───
  { id: "level_2", title: "Level Up!", icon: "ThunderIcon", description: "Reach Level 2 (Problem Solver)", check: (s) => (s.level >= 2) },
  { id: "level_3", title: "Rising Star", icon: "ThunderIcon", description: "Reach Level 3 (Concept Crusher)", check: (s) => (s.level >= 3) },
  { id: "level_4", title: "Formula Master", icon: "ThunderIcon", description: "Reach Level 4 (Formula Master)", check: (s) => (s.level >= 4) },
  { id: "level_5", title: "JEE Warrior", icon: "ThunderIcon", description: "Reach Level 5 (JEE Warrior)", check: (s) => (s.level >= 5) },
  { id: "level_6", title: "JEE Legend", icon: "ThunderIcon", description: "Reach Level 6 (JEE Legend)", check: (s) => (s.level >= 6) },

  // ─── Test Scores ───
  { id: "test_first", title: "Test Taker", icon: "TestIcon", description: "Complete your first mock test", check: (s) => (s.weeklyTestHistory?.length >= 1) },
  { id: "test_5", title: "Test Regular", icon: "TestIcon", description: "Complete 5 mock tests", check: (s) => (s.weeklyTestHistory?.length >= 5) },
  { id: "test_10", title: "Test Veteran", icon: "TestIcon", description: "Complete 10 mock tests", check: (s) => (s.weeklyTestHistory?.length >= 10) },
  { id: "test_25", title: "Test Master", icon: "TestIcon", description: "Complete 25 mock tests", check: (s) => (s.weeklyTestHistory?.length >= 25) },
  { id: "perfect_week", title: "Perfect Score", icon: "TargetIcon", description: "Score 10/10 on a weekly test", check: (s) => s.weeklyTestHistory?.some((t: number) => t === 10) },
  { id: "test_champion", title: "Test Champion", icon: "TrophyIcon", description: "Score perfect on 5 different tests", check: (s) => { const perfects = s.weeklyTestHistory?.filter((t: number) => t === 10) || []; return perfects.length >= 5; } },
  { id: "score_80", title: "High Scorer", icon: "TargetIcon", description: "Score 80% or above on any test", check: (s) => s.weeklyTestHistory?.some((t: number) => t >= 8) },
  { id: "score_90", title: "Excellence", icon: "TargetIcon", description: "Score 90% or above on any test", check: (s) => s.weeklyTestHistory?.some((t: number) => t >= 9) },

  // ─── Chapter Mastery ───
  { id: "chapter_master", title: "Chapter Master", icon: "BookIcon", description: "Complete any chapter (100% concepts)", check: (s) => (s.completedChaptersCount >= 1) },
  { id: "chapters_3", title: "Multi-Chapter", icon: "BookIcon", description: "Complete 3 chapters", check: (s) => (s.completedChaptersCount >= 3) },
  { id: "chapters_5", title: "Chapter Collector", icon: "BookIcon", description: "Complete 5 chapters", check: (s) => (s.completedChaptersCount >= 5) },
  { id: "chapters_10", title: "Chapter Hunter", icon: "BookIcon", description: "Complete 10 chapters", check: (s) => (s.completedChaptersCount >= 10) },
  { id: "chapters_20", title: "Chapter Vanquisher", icon: "BookIcon", description: "Complete 20 chapters", check: (s) => (s.completedChaptersCount >= 20) },
  { id: "all_chapters", title: "Syllabus Conqueror", icon: "TrophyIcon", description: "Complete all 42 chapters", check: (s) => (s.completedChaptersCount >= 42) },
  { id: "physicist", title: "Physicist", icon: "MicroscopeIcon", description: "Complete any Physics chapter", check: (s) => !!s.completedPhysicsChapter },
  { id: "all_physics", title: "Physics Master", icon: "MicroscopeIcon", description: "Complete all 15 Physics chapters", check: (s) => (s.completedPhysicsChapters >= 15) },
  { id: "chemist", title: "Chemist", icon: "FlaskIcon", description: "Complete any Chemistry chapter", check: (s) => !!s.completedChemistryChapter },
  { id: "all_chemistry", title: "Chemistry Master", icon: "FlaskIcon", description: "Complete all 12 Chemistry chapters", check: (s) => (s.completedChemistryChapters >= 12) },
  { id: "mathematician", title: "Mathematician", icon: "MathIcon", description: "Complete any Math chapter", check: (s) => !!s.completedMathChapter },
  { id: "all_math", title: "Math Master", icon: "MathIcon", description: "Complete all 15 Math chapters", check: (s) => (s.completedMathChapters >= 15) },
  { id: "integrator", title: "Integrator", icon: "MathIcon", description: "Complete the Integrals chapter", check: (s) => !!s.completedIntegrals },

  // ─── Clean Solving (No Hints/Scaffolds) ───
  { id: "clean_5", title: "Clean Start", icon: "CheckIcon", description: "Answer 5 questions in a row without hints", check: (s) => (s.maxCleanStreak >= 5) },
  { id: "clean_10", title: "Clean Streak", icon: "CheckIcon", description: "Answer 10 questions in a row without hints", check: (s) => (s.maxCleanStreak >= 10) },
  { id: "clean_20", title: "Independent", icon: "LightbulbIcon", description: "Answer 20 questions in a row without hints", check: (s) => (s.maxCleanStreak >= 20) },
  { id: "clean_50", title: "Self-Reliant", icon: "LightbulbIcon", description: "Answer 50 questions in a row without hints", check: (s) => (s.maxCleanStreak >= 50) },
  { id: "clean_100", title: "Flawless", icon: "LightbulbIcon", description: "Answer 100 questions in a row without hints", check: (s) => (s.maxCleanStreak >= 100) },

  // ─── Speed ───
  { id: "speed_solver", title: "Speed Solver", icon: "LightningIcon", description: "Answer any question correctly in under 30 seconds", check: (s) => !!s.hasSpeedSolve },
  { id: "speed_10", title: "Quick Thinker", icon: "LightningIcon", description: "Solve 10 questions in under 30 seconds each", check: (s) => ((s as Record<string, unknown>).speedSolves as number) >= 10 },
  { id: "speed_50", title: "Lightning Fast", icon: "LightningIcon", description: "Solve 50 questions in under 30 seconds each", check: (s) => ((s as Record<string, unknown>).speedSolves as number) >= 50 },

  // ─── Daily Challenge ───
  { id: "daily_first", title: "Daily Starter", icon: "TargetIcon", description: "Complete your first daily challenge", check: (s) => ((s as Record<string, unknown>).dailyChallengesCompleted as number) >= 1 },
  { id: "daily_7", title: "Daily Devotee", icon: "TargetIcon", description: "Complete 7 daily challenges", check: (s) => ((s as Record<string, unknown>).dailyChallengesCompleted as number) >= 7 },
  { id: "daily_30", title: "Daily Warrior", icon: "TargetIcon", description: "Complete 30 daily challenges", check: (s) => ((s as Record<string, unknown>).dailyChallengesCompleted as number) >= 30 },
  { id: "daily_perfect", title: "Daily Perfect", icon: "TrophyIcon", description: "Score 30/30 on a daily challenge", check: (s) => ((s as Record<string, unknown>).dailyChallengeBest as number) >= 30 },
  { id: "daily_25plus", title: "Daily Ace", icon: "TargetIcon", description: "Score 25+ on a daily challenge", check: (s) => ((s as Record<string, unknown>).dailyChallengeBest as number) >= 25 },

  // ─── Sessions ───
  { id: "session_first", title: "First Session", icon: "BookOpenIcon", description: "Complete your first study session", check: (s) => (s.totalSessions >= 1) },
  { id: "session_10", title: "Regular Learner", icon: "BookOpenIcon", description: "Complete 10 study sessions", check: (s) => (s.totalSessions >= 10) },
  { id: "session_50", title: "Session Veteran", icon: "BookOpenIcon", description: "Complete 50 study sessions", check: (s) => (s.totalSessions >= 50) },
  { id: "session_100", title: "Session Master", icon: "BookOpenIcon", description: "Complete 100 study sessions", check: (s) => (s.totalSessions >= 100) },
  { id: "session_250", title: "Session Legend", icon: "BookOpenIcon", description: "Complete 250 study sessions", check: (s) => (s.totalSessions >= 250) },

  // ─── Bookmarks & Notes ───
  { id: "bookmark_1", title: "First Bookmark", icon: "BookOpenIcon", description: "Save your first bookmarked question", check: (s) => (s.bookmarksCount >= 1) },
  { id: "bookmark_10", title: "Bookmark Collector", icon: "BookOpenIcon", description: "Save 10 bookmarked questions", check: (s) => (s.bookmarksCount >= 10) },
  { id: "bookmark_25", title: "Bookmark Hoarder", icon: "BookOpenIcon", description: "Save 25 bookmarked questions", check: (s) => (s.bookmarksCount >= 25) },
  { id: "bookmark_50", title: "Bookworm", icon: "BookOpenIcon", description: "Save 50 bookmarked questions", check: (s) => (s.bookmarksCount >= 50) },
  { id: "note_first", title: "Note Taker", icon: "NoteIcon", description: "Write your first revision note", check: (s) => (s.notesCount >= 1) },
  { id: "note_10", title: "Note Writer", icon: "NoteIcon", description: "Write 10 revision notes", check: (s) => (s.notesCount >= 10) },

  // ─── Time of Day ───
  { id: "night_owl", title: "Night Owl", icon: "MoonIcon", description: "Study after 10:00 PM", check: (s) => !!s.studiedLate },
  { id: "early_bird", title: "Early Bird", icon: "SunIcon", description: "Study before 7:00 AM", check: (s) => !!s.studiedEarly },
  { id: "both_early_and_late", title: "Around the Clock", icon: "ClockIcon", description: "Study both before 7 AM and after 10 PM", check: (s) => !!s.studiedEarly && !!s.studiedLate },

  // ─── Ladder & Scaffolding ───
  { id: "ladder_climber", title: "Ladder Climber", icon: "LadderIcon", description: "Complete a concept ladder in study", check: (s) => !!s.completedLadder },
  { id: "ladder_10", title: "Ladder Master", icon: "LadderIcon", description: "Complete 10 concept ladders", check: (s) => ((s as Record<string, unknown>).laddersCompleted as number) >= 10 },

  // ─── Accuracy ───
  { id: "accuracy_50", title: "Half Right", icon: "TargetIcon", description: "Maintain 50%+ overall accuracy", check: (s) => (s.overallAccuracy >= 50) },
  { id: "accuracy_70", title: "Sharp Shooter", icon: "TargetIcon", description: "Maintain 70%+ overall accuracy", check: (s) => (s.overallAccuracy >= 70) },
  { id: "accuracy_85", title: "Precision Master", icon: "TargetIcon", description: "Maintain 85%+ overall accuracy", check: (s) => (s.overallAccuracy >= 85) },
  { id: "accuracy_95", title: "Near Perfect", icon: "TargetIcon", description: "Maintain 95%+ overall accuracy", check: (s) => (s.overallAccuracy >= 95) },

  // ─── Mistake-Free ───
  { id: "zero_mistakes_session", title: "Clean Sweep", icon: "CheckIcon", description: "Complete a session with zero mistakes", check: (s) => !!s.zeroMistakeSession },

  // ─── Special / Fun ───
  { id: "first_correct", title: "First Blood", icon: "CheckIcon", description: "Answer your first question correctly", check: (s) => (s.totalCorrect >= 1) },
  { id: "correct_100", title: "Century of Correct", icon: "CheckIcon", description: "Answer 100 questions correctly", check: (s) => (s.totalCorrect >= 100) },
  { id: "correct_500", title: "Five Hundred", icon: "CheckIcon", description: "Answer 500 questions correctly", check: (s) => (s.totalCorrect >= 500) },
  { id: "correct_1000", title: "Thousand Correct", icon: "CheckIcon", description: "Answer 1,000 questions correctly", check: (s) => (s.totalCorrect >= 1000) },
  { id: "marathon_session", title: "Marathon", icon: "HeartbeatIcon", description: "Complete 20+ questions in a single session", check: (s) => (s.longestSession >= 20) },
  { id: "quiz_master", title: "Quiz Master", icon: "TrophyIcon", description: "Get 10/10 on 3 different tests", check: (s) => { const perfects = s.weeklyTestHistory?.filter((t: number) => t === 10) || []; return perfects.length >= 3; } },
  { id: "gate_crusher", title: "Gate Crusher", icon: "LockIcon", description: "Unlock a chapter via the gate challenge", check: (s) => ((s as Record<string, unknown>).gateUnlocks as number) >= 1 },
  { id: "gate_3", title: "Gate Breaker", icon: "LockIcon", description: "Unlock 3 chapters via gate challenges", check: (s) => ((s as Record<string, unknown>).gateUnlocks as number) >= 3 },
  { id: "all_achievements", title: "Completionist", icon: "TrophyIcon", description: "Unlock all other achievements", check: (s) => (s.totalAchievementsUnlocked >= 79) },
];
