export interface DailyChallengeData {
  date: string | null;
  question: Question | null;
  status: 'unattempted' | 'correct' | 'failed';
}

export interface DailyChallengeHistoryEntry {
  date: string;
  score: number;
  total: number;
}

export interface DailyChallengeQuestion {
  question: string;
  options: Record<string, string>;
  answer: string;
  primaryConcept: string;
  whyCorrect: string;
  whyOthersWrong?: Record<string, string>;
  difficulty?: string;
}

// Re-export from ai.ts for convenience
import type { Question } from './ai';
