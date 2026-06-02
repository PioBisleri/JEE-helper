/**
 * Frontend client for the JEE Mains PYQ backend service.
 *
 * The backend loads a 24MB pickle with 14k+ real JEE Mains questions
 * (vendored from HostServer001/jee_mains_pyqs_data_base v007).
 *
 * Each returned `Question` matches the same shape as AI-generated
 * questions (src/types/ai.ts), so Study.tsx can drop them in as if
 * they came from the AI.
 */
import { api } from '../services/apiClient';
import type { Question } from '../types/ai';

export interface PYQMeta {
  source: 'pyq';
  question_id: string;
  year: number;
  exam: string;
  paperTitle: string;
  type: string;
  isImgQuestion: boolean;
}

export interface PYQQuestion extends Question {
  _meta: PYQMeta;
}

export interface PYQChapterInfo {
  id: string;
  name: string;
  subject: string;
  total_questions: number;
}

export interface PYQStatus {
  available: boolean;
  chapters?: number;
  total_questions?: number;
  error?: string | null;
}

export interface PYQFetchOptions {
  topic?: string;
  year?: number;
  nYears?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  limit?: number;
  excludeQuestionIds?: string[];
}

export const pyqApi = {
  /**
   * Check whether the PYQ database is loaded and ready on the backend.
   * Returns `{ available: false }` if not yet loaded or if the download
   * failed (e.g. cold-start with no network).
   */
  async getStatus(): Promise<PYQStatus> {
    return api.get<PYQStatus>('/api/pyq/status');
  },

  /** List all available PYQ chapters grouped by subject. */
  async listChapters(): Promise<{ chapters: PYQChapterInfo[] }> {
    return api.get<{ chapters: PYQChapterInfo[] }>('/api/pyq/chapters');
  },

  /** List topics for a single chapter. */
  async listTopics(chapter: string): Promise<{ chapter: string; topics: string[] }> {
    return api.get<{ chapter: string; topics: string[] }>('/api/pyq/topics', {
      params: { chapter },
    });
  },

  /**
   * Get up to `limit` questions from a chapter matching the given filters.
   * Use this for batch loading (queue generation).
   */
  async getByChapter(chapter: string, opts: PYQFetchOptions = {}): Promise<{
    chapter: string;
    count: number;
    questions: PYQQuestion[];
  }> {
    const params: Record<string, string> = { chapter };
    if (opts.topic) params.topic = opts.topic;
    if (opts.year !== undefined) params.year = String(opts.year);
    if (opts.nYears !== undefined) params.n_years = String(opts.nYears);
    if (opts.difficulty) params.difficulty = opts.difficulty;
    if (opts.limit) params.limit = String(opts.limit);
    if (opts.excludeQuestionIds && opts.excludeQuestionIds.length > 0) {
      params.exclude = opts.excludeQuestionIds.join(',');
    }
    return api.get('/api/pyq/by-chapter', { params });
  },

  /**
   * Get a single random question from a chapter matching the given filters.
   * Use this as a single-question source.
   */
  async getRandom(chapter: string, opts: Omit<PYQFetchOptions, 'limit'> = {}): Promise<{
    chapter: string;
    question: PYQQuestion;
  }> {
    const params: Record<string, string> = { chapter };
    if (opts.topic) params.topic = opts.topic;
    if (opts.year !== undefined) params.year = String(opts.year);
    if (opts.nYears !== undefined) params.n_years = String(opts.nYears);
    if (opts.difficulty) params.difficulty = opts.difficulty;
    if (opts.excludeQuestionIds && opts.excludeQuestionIds.length > 0) {
      params.exclude = opts.excludeQuestionIds.join(',');
    }
    return api.get('/api/pyq/random', { params });
  },
};

/**
 * Map a Nexus JEE chapter id (e.g. "current_electricity") to a PYQ
 * chapter id (e.g. "current-electricity"). Falls back to slugifying
 * the input if no explicit mapping is registered.
 */
const CHAPTER_ID_MAP: Record<string, string> = {
  // Physics
  current_electricity: 'current-electricity',
  electromagnetic_waves: 'electromagnetic-waves',
  optics: 'optics',
  // Chemistry
  alcohols_phenols_ethers: 'alcohols-phenols-and-ethers',
  aldehydes_ketones_carboxylic: 'aldehydes-ketones-and-carboxylic-acids',
  // Mathematics
  trigonometric_ratios: 'trigonometric-ratio-and-identites',
  differential_equations: 'differential-equations',
  // Add more as we discover the mappings
};

export function getPYQChapterId(nexusChapterId: string): string | null {
  return CHAPTER_ID_MAP[nexusChapterId] ?? slugifyPYQId(nexusChapterId);
}

function slugifyPYQId(id: string): string {
  return id.toLowerCase().replace(/_/g, '-').replace(/\s+/g, '-');
}
