export interface ConceptLearned {
  concept: string;
  chapterId: string;
  learnedAt: string;
  nextReview: string;
  reviewStage: number;
  lastReviewed?: string;
}

export interface ConceptWithId extends ConceptLearned {
  id: number;
}
