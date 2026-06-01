export interface StudySession {
  chapterId: string;
  chapterName: string;
  date: string;
  attempted: number;
  solvedClean: number;
  totalCorrect?: number;
  concepts: string[];
  timeSpent?: number;
}
