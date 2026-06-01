export interface TestHistoryEntry {
  date: string;
  score: number;
  total: number;
  subject?: string;
  challengeMode?: boolean;
}

export interface WeeklyData {
  testHistory: TestHistoryEntry[];
  currentWeekConcepts: string[];
}
