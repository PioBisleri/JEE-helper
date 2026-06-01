export interface Bookmark {
  question: string;
  primaryConcept?: string;
  chapterId?: string;
  bookmarkedAt?: string;
  [key: string]: unknown;
}
