import type { Question } from '../types/ai';

const CACHE_KEY = 'jeeforge_question_cache';
// Short TTL — cache is only meant as a fallback for offline / AI failures,
// not as a primary source. 4 hours means within a single study session and
// across sessions in the same day, users always get fresh AI questions.
const MAX_AGE_MS = 4 * 60 * 60 * 1000;
const MAX_PER_CHAPTER = 60;

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
  difficulty: string,
  excludeQuestionTexts: string[] = []
): Question | null {
  const cache = getAll();
  const key = makeKey(chapterId, concept, difficulty);
  const entries = cache[key];
  if (!entries || entries.length === 0) return null;

  // Filter out already-seen / excluded questions
  const excludedSet = new Set(excludeQuestionTexts);
  const freshEntries = entries.filter(
    q => Date.now() - q.cachedAt < MAX_AGE_MS && !excludedSet.has(q.question.question)
  );
  if (freshEntries.length === 0) return null;

  // Return a random cached question for variety
  const idx = Math.floor(Math.random() * freshEntries.length);
  return freshEntries[idx].question;
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

  const chapterEntries = Object.entries(cache).filter(([k]) => k.startsWith(chapterId));
  let totalCount = chapterEntries.reduce((sum, [, v]) => sum + v.length, 0);
  if (totalCount > MAX_PER_CHAPTER) {
    for (const [k, v] of chapterEntries.sort((a, b) => {
      const oldestA = Math.min(...a[1].map(q => q.cachedAt));
      const oldestB = Math.min(...b[1].map(q => q.cachedAt));
      return oldestA - oldestB;
    })) {
      while (v.length > 0 && totalCount > MAX_PER_CHAPTER - 5) {
        v.shift();
        totalCount--;
      }
      if (v.length === 0) delete cache[k];
    }
  }

  evictOld();
  saveAll(cache);
}

export function clearCache() {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    // ignore
  }
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
