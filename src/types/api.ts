export interface APIResponse<T> {
  data?: T;
  error?: string;
}

export interface AuthTokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface User {
  id: number;
  email?: string;
  name: string;
  google_id?: string;
  created_at?: string;
}

export interface ProfileResponse {
  name: string;
  exam_date?: string;
  preferences: Record<string, unknown>;
  onboarded: boolean;
}

export interface ChapterProgressResponse {
  chapter_id: string;
  questions_attempted: number;
  concepts_unlocked: string[];
  scaffold_history: unknown[];
  current_subtopic_index: number;
  current_difficulty_index: number;
  completed: boolean;
  unlocked_xp_rewarded: boolean;
  completed_xp_rewarded: boolean;
}

export interface ConceptResponse {
  id: number;
  concept: string;
  chapter_id?: string;
  learned_at?: string;
  review_stage: number;
  next_review?: string;
  last_reviewed?: string;
}

export interface SessionResponse {
  id: number;
  chapter_id?: string;
  chapter_name?: string;
  date?: string;
  attempted: number;
  solved_clean: number;
  concepts: string[];
  time_spent: number;
}

export interface StreakResponse {
  current: number;
  longest: number;
  last_studied?: string;
}

export interface XPResponse {
  total_xp: number;
}

export interface XPResult {
  xp: number;
  old_level: number;
  new_level: number;
  leveled_up: boolean;
}

export interface MistakeResponse {
  id: number;
  question?: string;
  chapter_id?: string;
  category?: string;
  advice?: string;
  date?: string;
}

export interface BookmarkResponse {
  id: number;
  question?: string;
  primary_concept?: string;
  chapter_id?: string;
  question_data: Record<string, unknown>;
  bookmarked_at?: string;
}

export interface NoteResponse {
  concept: string;
  text: string;
  updated_at?: string;
}

export interface AchievementResponse {
  badge_id: string;
  unlocked_at?: string;
}

export interface WeeklyResponse {
  test_history: unknown[];
  current_week_concepts: string[];
}

export interface AIConfigResponse {
  provider?: string;
  model?: string;
  has_key: boolean;
}

export interface DailyChallengeResponse {
  id: number;
  date?: string;
  questions: unknown[];
  results: Record<string, unknown>;
  score: number;
}

export interface GateAttemptResponse {
  id: number;
  chapter_id?: string;
  date?: string;
  score?: number;
  unlocked: boolean;
}
