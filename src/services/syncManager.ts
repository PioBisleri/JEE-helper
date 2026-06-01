import { api, isOnline } from './apiClient';
import { storage } from '../utils/storage';
import type {
  ChapterProgressResponse,
  ConceptResponse,
  SessionResponse,
  StreakResponse,
  XPResponse,
  XPResult,
  MistakeResponse,
  BookmarkResponse,
  NoteResponse,
  AchievementResponse,
  WeeklyResponse,
  AIConfigResponse,
  DailyChallengeResponse,
  GateAttemptResponse,
  ProfileResponse,
} from '../types';

interface PendingSync {
  id: string;
  method: string;
  path: string;
  body?: unknown;
  timestamp: string;
}

const PENDING_SYNC_KEY = 'nexus_pending_sync';

function getPendingSync(): PendingSync[] {
  try {
    const raw = localStorage.getItem(PENDING_SYNC_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function addPendingSync(entry: PendingSync) {
  const pending = getPendingSync();
  pending.push(entry);
  localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(pending));
}

function clearPendingSync() {
  localStorage.removeItem(PENDING_SYNC_KEY);
}

async function syncPending() {
  const pending = getPendingSync();
  if (pending.length === 0) return;

  const remaining: PendingSync[] = [];
  for (const entry of pending) {
    try {
      await api[entry.method.toLowerCase() as 'get' | 'post' | 'put' | 'delete'](entry.path, entry.body as Record<string, unknown>);
    } catch {
      remaining.push(entry);
    }
  }

  if (remaining.length === 0) {
    clearPendingSync();
  } else {
    localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(remaining));
  }
}

function syncedGet<T>(path: string, fallback: T, transform?: (data: unknown) => T): () => T {
  return () => {
    if (isOnline()) {
      api.get(path).then(data => {
        const transformed = transform ? transform(data) : data as T;
        // Cache in localStorage for offline
      }).catch(() => {});
    }
    return fallback;
  };
}

function syncedPut<T>(path: string, body: unknown): () => void {
  return () => {
    if (isOnline()) {
      api.put(path, body).catch(() => {
        addPendingSync({ id: crypto.randomUUID(), method: 'PUT', path, body, timestamp: new Date().toISOString() });
      });
    }
  };
}

function syncedPost<T>(path: string, body: unknown): () => void {
  return () => {
    if (isOnline()) {
      api.post(path, body).catch(() => {
        addPendingSync({ id: crypto.randomUUID(), method: 'POST', path, body, timestamp: new Date().toISOString() });
      });
    }
  };
}

export const syncManager = {
  syncPending,

  async syncAll() {
    if (!isOnline()) return;
    await syncPending();
  },

  // Profile
  async fetchProfile(): Promise<ProfileResponse> {
    return api.get<ProfileResponse>('/api/profile');
  },

  async updateProfile(data: { name?: string; exam_date?: string; preferences?: Record<string, unknown>; onboarded?: boolean }) {
    return api.put<ProfileResponse>('/api/profile', data);
  },

  // Progress
  async fetchProgress(): Promise<ChapterProgressResponse[]> {
    return api.get<ChapterProgressResponse[]>('/api/progress');
  },

  async updateProgress(chapterId: string, data: Record<string, unknown>) {
    return api.put<ChapterProgressResponse>(`/api/progress/${chapterId}`, data);
  },

  // Concepts
  async fetchConcepts(): Promise<ConceptResponse[]> {
    return api.get<ConceptResponse[]>('/api/concepts');
  },

  async addConcept(concept: string, chapterId?: string) {
    return api.post<ConceptResponse>('/api/concepts', { concept, chapter_id: chapterId });
  },

  async updateConcept(id: number, data: { review_stage?: number; next_review?: string; last_reviewed?: string }) {
    return api.put<ConceptResponse>(`/api/concepts/${id}`, data);
  },

  // Sessions
  async fetchSessions(): Promise<SessionResponse[]> {
    return api.get<SessionResponse[]>('/api/sessions');
  },

  async addSession(data: { chapter_id?: string; chapter_name?: string; attempted: number; solved_clean: number; concepts: string[]; time_spent?: number }) {
    return api.post<SessionResponse>('/api/sessions', data);
  },

  // Streak
  async fetchStreak(): Promise<StreakResponse> {
    return api.get<StreakResponse>('/api/streak');
  },

  async updateStreak() {
    return api.post<StreakResponse>('/api/streak');
  },

  // XP
  async fetchXP(): Promise<XPResponse> {
    return api.get<XPResponse>('/api/xp');
  },

  async addXP(amount: number): Promise<XPResult> {
    return api.post<XPResult>('/api/xp', { amount });
  },

  // Mistakes
  async fetchMistakes(): Promise<MistakeResponse[]> {
    return api.get<MistakeResponse[]>('/api/mistakes');
  },

  async addMistake(data: { question?: string; chapter_id?: string; category?: string; advice?: string }) {
    return api.post<MistakeResponse>('/api/mistakes', data);
  },

  // Bookmarks
  async fetchBookmarks(): Promise<BookmarkResponse[]> {
    return api.get<BookmarkResponse[]>('/api/bookmarks');
  },

  async addBookmark(data: { question: string; primary_concept?: string; chapter_id?: string; question_data?: Record<string, unknown> }) {
    return api.post<BookmarkResponse>('/api/bookmarks', data);
  },

  async removeBookmark(id: number) {
    return api.delete(`/api/bookmarks/${id}`);
  },

  // Notes
  async fetchNotes(): Promise<NoteResponse[]> {
    return api.get<NoteResponse[]>('/api/notes');
  },

  async upsertNote(concept: string, text: string) {
    return api.put<NoteResponse>(`/api/notes/${encodeURIComponent(concept)}`, { text });
  },

  // Achievements
  async fetchAchievements(): Promise<AchievementResponse[]> {
    return api.get<AchievementResponse[]>('/api/achievements');
  },

  async unlockAchievement(badgeId: string) {
    return api.post<AchievementResponse>(`/api/achievements/${badgeId}`);
  },

  // Weekly
  async fetchWeekly(): Promise<WeeklyResponse> {
    return api.get<WeeklyResponse>('/api/weekly');
  },

  async updateWeekly(data: { test_history?: unknown[]; current_week_concepts?: string[] }) {
    return api.put<WeeklyResponse>('/api/weekly', data);
  },

  // AI Config
  async fetchAIConfig(): Promise<AIConfigResponse> {
    return api.get<AIConfigResponse>('/api/ai-config');
  },

  async updateAIConfig(data: { provider?: string; api_key?: string; model?: string }) {
    return api.put<AIConfigResponse>('/api/ai-config', data);
  },

  // AI Proxy
  async generateAI(prompt: string, systemPrompt?: string): Promise<Record<string, unknown>> {
    const result = await api.post<{ result: Record<string, unknown> }>('/api/ai/generate', { prompt, system_prompt: systemPrompt });
    return result.result;
  },

  // Daily Challenge
  async fetchDailyChallenge(): Promise<DailyChallengeResponse | null> {
    return api.get<DailyChallengeResponse>('/api/daily-challenge');
  },

  async submitDailyChallenge(data: { questions: unknown[]; results: Record<string, unknown>; score: number }) {
    return api.post<DailyChallengeResponse>('/api/daily-challenge', data);
  },

  // Gate Attempts
  async fetchGateAttempts(): Promise<GateAttemptResponse[]> {
    return api.get<GateAttemptResponse[]>('/api/gate-attempts');
  },

  async addGateAttempt(data: { chapter_id: string; score?: number; unlocked: boolean }) {
    return api.post<GateAttemptResponse>('/api/gate-attempts', data);
  },

  // Migration
  async importBackup(backup: Record<string, string>) {
    return api.post('/api/migrate', { backup });
  },
};
