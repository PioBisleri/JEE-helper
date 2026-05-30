export const ACHIEVEMENTS = [
  {
    id: "streak_7",
    title: "On Fire",
    icon: "FlameIcon",
    description: "Reach a 7-day learning streak",
    check: (stats) => (stats.streak?.current >= 7)
  },
  {
    id: "speed_solver",
    title: "Speed Solver",
    icon: "LightningIcon",
    description: "Answer any question correctly in under 30 seconds",
    check: (stats) => !!stats.hasSpeedSolve
  },
  {
    id: "ladder_climber",
    title: "Ladder Climber",
    icon: "LadderIcon",
    description: "Complete a full concept ladder stepper in study session",
    check: (stats) => !!stats.completedLadder
  },
  {
    id: "chapter_master",
    title: "Chapter Master",
    icon: "BookIcon",
    description: "Complete any full chapter (master 100% of concepts)",
    check: (stats) => (stats.completedChaptersCount > 0)
  },
  {
    id: "perfect_week",
    title: "Perfect Week",
    icon: "TargetIcon",
    description: "Score 10/10 on a weekly test",
    check: (stats) => stats.weeklyTestHistory?.some(score => score >= 10)
  },
  {
    id: "night_owl",
    title: "Night Owl",
    icon: "MoonIcon",
    description: "Complete a study session after 10:00 PM",
    check: (stats) => !!stats.studiedLate
  },
  {
    id: "early_bird",
    title: "Early Bird",
    icon: "SunIcon",
    description: "Complete a study session before 7:00 AM",
    check: (stats) => !!stats.studiedEarly
  },
  {
    id: "century",
    title: "Century",
    icon: "CenturyIcon",
    description: "Attempt 100 questions in total",
    check: (stats) => (stats.totalAttempted >= 100)
  },
  {
    id: "chemist",
    title: "Chemist",
    icon: "FlaskIcon",
    description: "Complete any Chemistry chapter (100% concepts)",
    check: (stats) => !!stats.completedChemistryChapter
  },
  {
    id: "integrator",
    title: "Integrator",
    icon: "MathIcon",
    description: "Complete the Integrals chapter (100% concepts)",
    check: (stats) => !!stats.completedIntegrals
  },
  {
    id: "physicist",
    title: "Physicist",
    icon: "MicroscopeIcon",
    description: "Complete any Physics chapter (100% concepts)",
    check: (stats) => !!stats.completedPhysicsChapter
  },
  {
    id: "streak_30",
    title: "Consistent",
    icon: "RefreshIcon",
    description: "Reach a 30-day learning streak",
    check: (stats) => (stats.streak?.current >= 30)
  },
  {
    id: "test_champion",
    title: "Test Champion",
    icon: "TrophyIcon",
    description: "Score a perfect 10/10 on any weekly mock test",
    check: (stats) => stats.weeklyTestHistory?.some(score => score >= 10)
  },
  {
    id: "independent",
    title: "Independent",
    icon: "LightbulbIcon",
    description: "Answer 20 questions in a row with zero hints or scaffolding",
    check: (stats) => (stats.maxCleanStreak >= 20)
  },
  {
    id: "bookworm",
    title: "Bookworm",
    icon: "BookOpenIcon",
    description: "Save 50 bookmarked questions",
    check: (stats) => (stats.bookmarksCount >= 50)
  }
];
