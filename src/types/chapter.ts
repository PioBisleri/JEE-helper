export interface Subtopic {
  name: string;
  description?: string;
}

export interface Chapter {
  id: string;
  name: string;
  subtopics: string[];
  difficulty_curve: string[];
}

export type Subject = 'physics' | 'chemistry' | 'math';

export interface ChaptersData {
  physics: Chapter[];
  chemistry: Chapter[];
  math: Chapter[];
}
