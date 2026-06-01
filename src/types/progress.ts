export interface ChapterProgress {
  questionsAttempted: number;
  conceptsUnlocked: string[];
  scaffoldHistory: unknown[];
  currentSubtopicIndex: number;
  currentDifficultyIndex: number;
  completed?: boolean;
  unlockedXpRewarded?: boolean;
  completedXpRewarded?: boolean;
}

export interface ProgressMap {
  [chapterId: string]: ChapterProgress;
}
