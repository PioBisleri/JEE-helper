import type { Question } from '../types/ai';

const CACHE_KEY = 'jeeforge_question_cache';
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const MAX_PER_CHAPTER = 200;

export interface CachedQuestion {
  question: Question;
  concept: string;
  chapterId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  cachedAt: number;
}

function makeKey(chapterId: string, concept: string, difficulty: string): string {
  return `${chapterId}::${concept}::${difficulty}`;
}

function getAll(): Record<string, CachedQuestion[]> {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAll(cache: Record<string, CachedQuestion[]>) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Storage full — evict oldest entries and retry
    evictOld();
  }
}

function evictOld() {
  const cache = getAll();
  const now = Date.now();
  for (const key of Object.keys(cache)) {
    cache[key] = cache[key].filter(q => now - q.cachedAt < MAX_AGE_MS);
    if (cache[key].length === 0) delete cache[key];
  }
  saveAll(cache);
}

export function getCachedQuestion(
  chapterId: string,
  concept: string,
  difficulty: string
): Question | null {
  const cache = getAll();
  const key = makeKey(chapterId, concept, difficulty);
  const entries = cache[key];
  if (!entries || entries.length === 0) return null;

  // Return a random cached question for variety
  const idx = Math.floor(Math.random() * entries.length);
  return entries[idx].question;
}

export function cacheQuestion(
  chapterId: string,
  concept: string,
  difficulty: string,
  question: Question
) {
  const cache = getAll();
  const key = makeKey(chapterId, concept, difficulty);
  if (!cache[key]) cache[key] = [];

  // Don't duplicate by question text
  const exists = cache[key].some(
    c => c.question.question === question.question
  );
  if (exists) return;

  cache[key].push({
    question,
    concept,
    chapterId,
    difficulty: difficulty as 'easy' | 'medium' | 'hard',
    cachedAt: Date.now(),
  });

  // Enforce per-chapter limit
  const chapterEntries = Object.entries(cache).filter(([k]) => k.startsWith(chapterId));
  let totalCount = chapterEntries.reduce((sum, [, v]) => sum + v.length, 0);
  if (totalCount > MAX_PER_CHAPTER) {
    // Remove oldest entries first
    for (const [k, v] of chapterEntries.sort((a, b) => {
      const oldestA = Math.min(...a[1].map(q => q.cachedAt));
      const oldestB = Math.min(...b[1].map(q => q.cachedAt));
      return oldestA - oldestB;
    })) {
      while (v.length > 0 && totalCount > MAX_PER_CHAPTER - 10) {
        v.shift();
        totalCount--;
      }
      if (v.length === 0) delete cache[k];
    }
  }

  evictOld();
  saveAll(cache);
}

export function getCacheStats(): { totalCached: number; byChapter: Record<string, number> } {
  const cache = getAll();
  let totalCached = 0;
  const byChapter: Record<string, number> = {};
  for (const [key, entries] of Object.entries(cache)) {
    const chapterId = key.split('::')[0];
    totalCached += entries.length;
    byChapter[chapterId] = (byChapter[chapterId] || 0) + entries.length;
  }
  return { totalCached, byChapter };
}
