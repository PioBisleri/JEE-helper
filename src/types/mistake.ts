export type MistakeCategory = 'conceptual_gap' | 'calculation_error' | 'misread_question' | 'distractor_trap';

export interface Mistake {
  question: string;
  chapter?: string;
  chapterId?: string;
  category: MistakeCategory;
  advice: string;
  date?: string;
}
