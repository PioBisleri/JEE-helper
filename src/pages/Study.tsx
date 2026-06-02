import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CHAPTERS } from '../data/chapters';
import { storage } from '../utils/storage';
import {
  generateQuestion,
  generateScaffoldL1,
  generateConceptExplanation,
  generateConceptLadder,
  generateHint,
  generateSessionSummary,
  classifyMistake,
  generateReviewQuestion,
  generateWorkedSolution
} from '../utils/api';
import { pyqApi, getPYQChapterId, type PYQQuestion } from '../utils/pyqApi';
import { markReviewed, getDueReviews } from '../utils/spaceRepetition';
import { getCachedQuestion as getCachedQ } from '../utils/questionCache';
import { logger } from '../utils/logger';
import { useUser } from '../components/UserContext';
import { useToast } from '../components/ToastContext';
import { SkeletonQuestion } from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import QuestionCard from '../components/QuestionCard';
import OptionButton from '../components/OptionButton';
import ScaffoldPanel from '../components/ScaffoldPanel';
import ConceptLadder from '../components/ConceptLadder';
import {
  TargetIcon,
  CoffeeIcon,
  HeartbeatIcon,
  HintIcon,
  StuckIcon,
  NoteIcon,
  KeyboardIcon,
  TrophyIcon,
  StatsIcon,
  CheckIcon,
  CrossIcon,
  ClockIcon,
  ChevronRightIcon
} from '../components/Icons';
import { track } from '../utils/analytics';
import { motion, AnimatePresence } from 'framer-motion';
import { parseLaTeX } from '../components/DailyChallenge';
import type { Question, ReviewQuestionResponse, SessionSummaryResponse, ConceptLadderResponse, HintResponse } from '../types/ai';

interface SessionHistoryEntry {
  question: Question;
  userAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
  scaffoldUsed: boolean;
}

export default function Study() {
  const { subject, chapterId } = useParams();
  const navigate = useNavigate();
  const { gainXP, preferences: rawPreferences, checkProgressionXP } = useUser();
  const preferences = rawPreferences as unknown as { defaultMood?: string; questionsPerSession?: number; autoAdvance?: boolean; pyqEnabled?: boolean; pyqRatio?: number };
  const { showToast } = useToast();

  const chapter = CHAPTERS[subject as keyof typeof CHAPTERS]?.find((c: { id: string }) => c.id === chapterId);

  // Core Phases: mood, review, question, scaffold1, scaffold2, ladder, giveUp, correct, summary
  const [phase, setPhase] = useState('mood');
  const [mood, setMood] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  
  // Scaffold cache states
  const [scaffoldL1Data, setScaffoldL1Data] = useState<Record<string, unknown> | null>(null);
  const [scaffoldL2Data, setScaffoldL2Data] = useState<Record<string, unknown> | null>(null);
  const [ladderData, setLadderData] = useState<Record<string, unknown> | null>(null);
  const [workedSolutionData, setWorkedSolutionData] = useState<Record<string, unknown> | null>(null);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Answer selection flow
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Hints
  const [hintText, setHintText] = useState('');
  const [showHintPanel, setShowHintPanel] = useState(false);
  const [hintUsedInQuestion, setHintUsedInQuestion] = useState(false);
  const [scaffoldTriggered, setScaffoldTriggered] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);

  // Session Stats (5-question block)
  const [blockQuestionIndex, setBlockQuestionIndex] = useState(0); // 0 to 4
  const [sessionHistory, setSessionHistory] = useState<SessionHistoryEntry[]>(() => {
    // Restore session history from localStorage on mount so Previous/Next
    // works even after a page refresh, not just within a single render cycle.
    if (typeof window === 'undefined') return [];
    try {
      const key = `nexus_study_history_${window.location.pathname}`;
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw) as SessionHistoryEntry[];
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch {
      // ignore
    }
    return [];
  }); // tracks { question, userAnswer, isCorrect, timeSpent, scaffoldUsed }
  // Ref mirror of sessionHistory so navigation handlers never see a stale value
  const sessionHistoryRef = useRef<SessionHistoryEntry[]>(sessionHistory);
  // Pre-generated question queue — AI generates a batch up front so the timer
  // only ticks when a question is actually on screen (not while the user waits
  // for the network/AI to produce the next one).
  const [questionQueue, setQuestionQueue] = useState<Question[]>([]);
  const questionQueueRef = useRef<Question[]>([]);
  const batchInFlightRef = useRef<boolean>(false);
  const [sessionStats, setSessionStats] = useState({
    attempted: 0,
    solvedClean: 0,
    scaffoldedConcepts: [] as string[],
    newConcepts: [] as string[]
  });
  
  // Clean solves tracker (to level up chapter difficulty)
  const [cleanSolvesInRow, setCleanSolvesInRow] = useState(0);

  // Spaced reviews in this session
  const [reviewQueue, setReviewQueue] = useState<{ concept: string; chapterId: string; learnedAt: string; nextReview: string; reviewStage: number; lastReviewed?: string }[]>([]);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [reviewQuestion, setReviewQuestion] = useState<ReviewQuestionResponse | null>(null);

  // Notes drawer
  const [showNotesDrawer, setShowNotesDrawer] = useState(false);
  const [noteText, setNoteText] = useState('');

  // Keyboard shortcut drawer
  const [showShortcutTooltip, setShowShortcutTooltip] = useState(false);

  // XP Gains float indicator
  const [xpFloater, setXpFloater] = useState<string | null>(null);

  // Accordion for wrong answers explanations
  const [showWrongAccordion, setShowWrongAccordion] = useState(false);

  // Timers
  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const questionStartTimeRef = useRef(Date.now());
  const autoAdvanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Listen to network status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Clear any pending auto-advance timeout on unmount
  useEffect(() => {
    return () => {
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current);
        autoAdvanceTimeoutRef.current = null;
      }
      // Don't clear session history on unmount — let it persist so
      // Previous/Next works even after a brief re-mount. handleEndSession
      // clears it explicitly when the user actually leaves.
    };
  }, []);

  // Prefetch questions for this chapter into cache
  useEffect(() => {
    if (!chapter || isOffline) return;
    const prefetch = async () => {
      try {
        const { getCachedQuestion, cacheQuestion: cacheQ } = await import('../utils/questionCache');
        const { callAI, PROVIDERS } = await import('../utils/api');
        const { storage: store } = await import('../utils/storage');

        // Only prefetch if we have an API key configured
        const apiKey = store.getAIApiKey();
        if (!apiKey) return;

        // Prefetch first 3 difficulty points from the chapter
        const pointsToPrefetch = chapter.difficulty_curve.slice(0, 3);
        for (const point of pointsToPrefetch) {
          const existing = getCachedQuestion(chapter.id, point, 'medium');
          if (!existing) {
            // Generate and cache (fire and forget — don't block the UI)
            generateQuestion(chapter, point, [], 'focused').catch(() => {});
          }
        }
      } catch {
        // Prefetch is best-effort
      }
    };
    prefetch();
  }, [chapter, isOffline]);

  // Format Timer output
  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer runner — only ticks while the user actually has a question to
  // attempt. Pauses during mood selection, summary, when no question is
  // loaded, when the AI is generating a batch, and after the user has
  // confirmed their answer (waiting for them to hit Next).
  const shouldTimerRun = useMemo(() => {
    if (phase === 'mood' || phase === 'summary') return false;
    if (isLoading) return false;
    if (!currentQuestion) return false;
    if (confirmed) return false; // waiting on Next click, not actively solving
    return true;
  }, [phase, isLoading, currentQuestion, confirmed]);

  useEffect(() => {
    if (shouldTimerRun) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    } else if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [shouldTimerRun]);

  // Handle shortcut mappings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid firing when user is typing in notes panel
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'INPUT')) return;

      const key = e.key.toUpperCase();
      
      // Escape closes panels
      if (e.key === 'Escape') {
        setShowHintPanel(false);
        setShowNotesDrawer(false);
        return;
      }

      // Keyboard mapping based on phase
      if (phase === 'question' && currentQuestion) {
        if (['A', 'B', 'C', 'D'].includes(key)) {
          if (!confirmed) {
            setSelectedOption(key);
            showToast(`Selected Option ${key}`, 'info');
          }
        } else if (e.key === 'Enter') {
          if (selectedOption && !confirmed) {
            handleConfirmAnswer();
          } else if (confirmed) {
            handleNextQuestion();
          }
        } else if (e.key === 'ArrowLeft') {
          handlePreviousQuestion();
        } else if (e.key === 'ArrowRight') {
          if (confirmed || blockQuestionIndex < sessionHistory.length) {
            handleNextQuestion();
          }
        } else if (key === 'H') {
          if (!confirmed) {
            handleTriggerHint();
          }
        } else if (key === 'S') {
          handleTriggerStuck();
        }
      } else if (phase === 'correct') {
        if (e.key === 'Enter' || e.key === 'ArrowRight') {
          handleNextQuestion();
        }
      } else if (phase === 'review' && reviewQuestion) {
        if (['A', 'B', 'C', 'D'].includes(key)) {
          if (!confirmed) {
            handleReviewAnswer(key);
          }
        } else if ((e.key === 'Enter' || e.key === 'ArrowRight') && confirmed) {
          handleReviewNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, currentQuestion, selectedOption, confirmed, reviewQuestion, reviewIndex, reviewQueue, blockQuestionIndex, sessionHistory]);

  // Load Note for current concept
  useEffect(() => {
    if (currentQuestion?.primaryConcept) {
      setNoteText(storage.getNote(currentQuestion.primaryConcept));
    }
  }, [currentQuestion]);

  // Mirror sessionHistory into a ref so navigation handlers always see the
  // latest value (handles stale closure issues in async callbacks), and
  // persist it to localStorage so Previous/Next survives a page refresh.
  useEffect(() => {
    sessionHistoryRef.current = sessionHistory;
    if (typeof window !== 'undefined') {
      try {
        const key = `nexus_study_history_${window.location.pathname}`;
        localStorage.setItem(key, JSON.stringify(sessionHistory));
      } catch {
        // Storage full or unavailable — fail silently
      }
    }
  }, [sessionHistory]);

  // Mirror the question queue into a ref so async callbacks see the latest value
  useEffect(() => {
    questionQueueRef.current = questionQueue;
  }, [questionQueue]);

  // Reset answer states
  const resetQuestionState = () => {
    setSelectedOption(null);
    setConfirmed(false);
    setIsCorrect(false);
    setHintText('');
    setShowHintPanel(false);
    setHintUsedInQuestion(false);
    setScaffoldTriggered(false);
    setWrongAttempts(0);
    setShowWrongAccordion(false);
    questionStartTimeRef.current = Date.now();
  };

  // ─── API LOADERS ───

  // Fetch a batch of PYQ questions from the backend. Returns a list of
  // Question objects (matching the AI Question schema) or [] on failure.
  // Used when preferences.pyqEnabled is true.
  const fetchPYQBatch = useCallback(async (size: number, currentMood?: string): Promise<Question[]> => {
    if (!chapter || isOffline) return [];
    const pyqChapterId = getPYQChapterId(chapter.id || chapter.name);
    if (!pyqChapterId) return [];
    const seenIds = [
      ...sessionHistoryRef.current.map(h => (h.question as PYQQuestion)._meta?.question_id).filter(Boolean) as string[],
      ...questionQueueRef.current.map(q => (q as unknown as PYQQuestion)._meta?.question_id).filter(Boolean) as string[],
    ];
    // Map Nexus difficulty → PYQ difficulty. Default to medium.
    const progress = storage.getChapterProgress(chapter.id);
    const difficultyIndex = Math.min(progress.currentDifficultyIndex, chapter.difficulty_curve.length - 1);
    const difficultyPoint = chapter.difficulty_curve[difficultyIndex] || 'medium';
    const pyqDifficulty = /easy|easy/i.test(difficultyPoint)
      ? 'easy'
      : /hard|hard/i.test(difficultyPoint)
      ? 'hard'
      : 'medium';

    try {
      const res = await pyqApi.getByChapter(pyqChapterId, {
        difficulty: pyqDifficulty,
        limit: size,
        excludeQuestionIds: seenIds,
      });
      return (res.questions || []) as unknown as Question[];
    } catch (err) {
      logger.warn(`PYQ fetch failed: ${err instanceof Error ? err.message : String(err)}`);
      return [];
    }
  }, [chapter, isOffline]);

  // Should this batch slot use a PYQ? Uses pyqRatio (0..1) — default 0.5
  // (half PYQs, half AI). Returns true for the first pyqRatio*batchSize
  // slots, false for the rest. Stable per-call so the user gets a
  // predictable mix in each batch.
  const shouldUsePYQForBatchSlot = (slotIndex: number, batchSize: number): boolean => {
    // Default ON when preference is undefined (matches Settings default)
    if (preferences.pyqEnabled === false) return false;
    if (!chapter) return false;
    const pyqChapterId = getPYQChapterId(chapter.id || chapter.name);
    if (!pyqChapterId) return false;
    const ratio = preferences.pyqRatio ?? 0.5;
    return slotIndex < Math.ceil(batchSize * ratio);
  };

  // Refill the question queue by generating BATCH_SIZE questions in parallel.
  // Caller awaits this for the first batch; subsequent refills are fire-and-forget
  // so the user never waits. Idempotent: safe to call multiple times.
  const refillQueue = useCallback(async (currentMood?: string): Promise<Question[]> => {
    if (!chapter || isOffline) return [];
    if (batchInFlightRef.current) return [];
    batchInFlightRef.current = true;
    try {
      const BATCH_SIZE = 3;
      const progress = storage.getChapterProgress(chapterId!);
      const difficultyIndex = Math.min(progress.currentDifficultyIndex, chapter.difficulty_curve.length - 1);
      const difficultyPoint = chapter.difficulty_curve[difficultyIndex];
      const conceptsLearned = storage.getConceptsLearned().map(c => c.concept);
      const seenTexts = [
        ...sessionHistoryRef.current.map(h => h.question.question),
        ...questionQueueRef.current.map(q => (q as unknown as { question?: string }).question || ''),
      ].filter(Boolean);

      // Distinct variation hints per batch slot — without this, the model
      // tends to return near-identical questions for identical prompts
      // (low temperature + parallel calls = same answer 3x).
      const VARIATION_HINTS = [
        'This is variation #1. Pick a numerical problem with a specific, non-trivial scenario.',
        'This is variation #2. Pick a conceptual/theoretical angle, not a numerical one. Use a different sub-topic or applied context than you would for a typical question on this concept.',
        'This is variation #3. Pick a graph/visualization-based or application-based question. Use distinctly different numbers/context than a standard example.',
      ];

      // Split batch slots between PYQ and AI based on user preference.
      // PYQ slots are grouped at the start (deterministic per call) so
      // the user gets a predictable mix each batch.
      const slots = Array.from({ length: BATCH_SIZE }, (_, i) => ({
        usePYQ: shouldUsePYQForBatchSlot(i, BATCH_SIZE),
        variationHint: VARIATION_HINTS[i % VARIATION_HINTS.length],
      }));
      const pyqCount = slots.filter(s => s.usePYQ).length;
      const aiCount = BATCH_SIZE - pyqCount;

      // Fire PYQ fetch (single call gets all PYQs at once) and AI calls in parallel
      const [pyqQuestions, aiResults] = await Promise.all([
        pyqCount > 0 ? fetchPYQBatch(pyqCount, currentMood) : Promise.resolve([] as Question[]),
        Promise.allSettled(
          slots.filter(s => !s.usePYQ).map(s =>
            generateQuestion(chapter, difficultyPoint, conceptsLearned, currentMood || mood || 'focused', {
              excludeQuestionTexts: seenTexts,
              variationHint: s.variationHint,
            })
          )
        ),
      ]);

      const aiFulfilled = (aiResults as PromiseSettledResult<Record<string, unknown>>[])
        .filter((r): r is PromiseFulfilledResult<Record<string, unknown>> => r.status === 'fulfilled')
        .map(r => r.value as unknown as Question)
        .filter(q => q && q.question && q.options);

      // Combine PYQ + AI in slot order (PYQ first if any, then AI)
      let slotCursor = 0;
      const ordered: Question[] = [];
      for (let i = 0; i < pyqCount && slotCursor < pyqQuestions.length; i++) {
        ordered.push(pyqQuestions[slotCursor++]);
      }
      for (const q of aiFulfilled) ordered.push(q);

      // Dedupe by question text — the AI can still occasionally return the
      // same response, and we never want to show the same question twice in
      // a row.
      const seenInBatch = new Set<string>();
      const questions: Question[] = [];
      for (const q of ordered) {
        const text = (q.question || '').trim();
        if (text && !seenInBatch.has(text) && !seenTexts.includes(text)) {
          seenInBatch.add(text);
          questions.push(q);
        }
      }

      if (questions.length > 0) {
        setQuestionQueue(prev => [...prev, ...questions]);
        questionQueueRef.current = [...questionQueueRef.current, ...questions];
      }
      return questions;
    } catch {
      return [];
    } finally {
      batchInFlightRef.current = false;
    }
  }, [chapter, chapterId, mood, isOffline, fetchPYQBatch, preferences.pyqEnabled, preferences.pyqRatio]);

  // Single-question generator — fallback when the batch dedup leaves us
  // empty (e.g. all 3 parallel calls returned the same response despite
  // variation hints). Tries PYQ first if enabled, then AI with a fresh
  // variation hint.
  const generateSingle = useCallback(async (currentMood?: string): Promise<Question | null> => {
    if (!chapter || isOffline) return null;
    try {
      // Try PYQ first (instant, no AI cost)
      if (preferences.pyqEnabled !== false) {
        const pyqQuestions = await fetchPYQBatch(1, currentMood);
        if (pyqQuestions.length > 0) return pyqQuestions[0];
      }
      // Fall back to AI
      const progress = storage.getChapterProgress(chapterId!);
      const difficultyIndex = Math.min(progress.currentDifficultyIndex, chapter.difficulty_curve.length - 1);
      const difficultyPoint = chapter.difficulty_curve[difficultyIndex];
      const conceptsLearned = storage.getConceptsLearned().map(c => c.concept);
      const seenTexts = [
        ...sessionHistoryRef.current.map(h => h.question.question),
        ...questionQueueRef.current.map(q => (q as unknown as { question?: string }).question || ''),
      ].filter(Boolean);
      const VARIATION_HINTS = [
        'Use a fresh, unusual angle — maybe an application, derivation, or proof-based question.',
        'Use a different numeric scale, units, or scenario than typical. Pick values that aren\'t round numbers.',
        'Test the concept from a graph/diagram-based or qualitative perspective instead of pure calculation.',
      ];
      const hint = VARIATION_HINTS[Math.floor(Math.random() * VARIATION_HINTS.length)];
      const result = await generateQuestion(chapter, difficultyPoint, conceptsLearned, currentMood || mood || 'focused', {
        excludeQuestionTexts: seenTexts,
        variationHint: hint,
      });
      if (result && result.question && result.options) {
        return result as unknown as Question;
      }
      return null;
    } catch {
      return null;
    }
  }, [chapter, chapterId, mood, isOffline, fetchPYQBatch, preferences.pyqEnabled]);

  // ─── PREFETCH FULL SESSION BATCH (for "Keep Going" or test-like flows) ─
  // Generates a full batch of `count` unique questions upfront, using
  // all available sources in priority order:
  //   1. PYQ (real JEE Mains questions, default ~50% of batch) — overshoot
  //      request so dedup doesn't leave us short
  //   2. AI-generated (parallel calls with variation hints)
  //   3. AI retry rounds (if still short, sequential with fresh hints)
  //   4. Local cache (offline / AI-failure fallback)
  // Returns up to `count` unique questions. The caller is responsible for
  // handling the case where fewer than `count` were generated.
  // `onProgress` is called after each phase completes so the UI can show
  // a live progress bar (e.g. "Generating 3/5…").
  const prefetchSessionQuestions = useCallback(async (
    count: number,
    currentMood?: string,
    onProgress?: (loaded: number) => void,
  ): Promise<Question[]> => {
    if (!chapter) return [];
    const VARIATION_HINTS = [
      'Pick a numerical problem with a specific, non-trivial scenario.',
      'Pick a conceptual/theoretical angle, not a numerical one. Use a different sub-topic or applied context than you would for a typical question on this concept.',
      'Pick a graph/visualization-based or application-based question. Use distinctly different numbers/context than a standard example.',
      'Pick a question that requires multi-step reasoning, not a single formula application.',
      'Pick a question with an unusual or counterintuitive setup that still has a clean answer.',
      'Pick a problem where the answer is a clean integer or simple fraction, not a complex expression.',
      'Pick a conceptual question that tests understanding, not a calculation.',
    ];

    const seen = new Set<string>();
    const result: Question[] = [];
    const pushIfNew = (q: Question | null | undefined): boolean => {
      if (!q || !q.question || !q.options) return false;
      const text = (q.question || '').trim();
      if (!text || seen.has(text)) return false;
      seen.add(text);
      result.push(q);
      return true;
    };

    // Source mix — overshoot from PYQ by 50% to absorb dedup losses, and
    // always make sure AI covers the rest of the count regardless of
    // ratio. If PYQ shortfalls (chapter id unknown, chapter has few
    // questions), AI fills the gap.
    const usePYQ = preferences.pyqEnabled !== false;
    const ratio = preferences.pyqRatio ?? 0.5;
    const pyqTarget = usePYQ ? Math.ceil(count * ratio * 1.5) : 0;
    const aiTarget = count;

    // Compute difficulty point
    const progress = storage.getChapterProgress(chapter.id);
    const difficultyIndex = Math.min(progress.currentDifficultyIndex, chapter.difficulty_curve.length - 1);
    const difficultyPoint = chapter.difficulty_curve[difficultyIndex] || 'medium';
    const conceptsLearned = storage.getConceptsLearned().map(c => c.concept);

    // ── 1. PYQ BATCH (single API call, excludes seen IDs) ──
    if (pyqTarget > 0) {
      try {
        const pyqQuestions = await fetchPYQBatch(pyqTarget, currentMood);
        for (const q of pyqQuestions) {
          if (result.length >= count) break;
          pushIfNew(q);
        }
        onProgress?.(result.length);
      } catch (err) {
        logger.warn(`Prefetch: PYQ fetch failed: ${err instanceof Error ? err.message : String(err)}`);
        onProgress?.(result.length);
      }
    }

    // ── 2. AI BATCH (parallel with variation hints) ──
    // Always target `count` from AI alone, so we have a full batch even
    // if PYQ returned nothing. Dedup will keep only the unique ones.
    if (!isOffline) {
      const aiNeeded = Math.max(0, count - result.length);
      if (aiNeeded > 0) {
        const slots = Array.from({ length: aiNeeded }, (_, i) => ({
          variationHint: VARIATION_HINTS[i % VARIATION_HINTS.length],
        }));
        const results = await Promise.allSettled(
          slots.map(s => generateQuestion(
            chapter,
            difficultyPoint,
            conceptsLearned,
            currentMood || mood || 'focused',
            { excludeQuestionTexts: Array.from(seen), variationHint: s.variationHint }
          ))
        );
        for (const r of results) {
          if (result.length >= count) break;
          if (r.status === 'fulfilled') {
            pushIfNew(r.value as unknown as Question);
          }
        }
        onProgress?.(result.length);
      }

      // ── 3. AI RETRY (sequential, fresh hints) if still short ──
      // Up to 2 more rounds, 1 question per round, to top up.
      let retryRound = 0;
      while (result.length < count && retryRound < 2 && !isOffline) {
        retryRound++;
        try {
          const hint = VARIATION_HINTS[(result.length + retryRound) % VARIATION_HINTS.length];
          const q = await generateQuestion(
            chapter,
            difficultyPoint,
            conceptsLearned,
            currentMood || mood || 'focused',
            { excludeQuestionTexts: Array.from(seen), variationHint: hint }
          );
          pushIfNew(q as unknown as Question);
          onProgress?.(result.length);
        } catch (err) {
          logger.warn(`Prefetch: AI retry ${retryRound} failed: ${err instanceof Error ? err.message : String(err)}`);
        }
      }
    }

    // ── 4. CACHE FALLBACK (offline / AI / PYQ all short) ──
    if (result.length < count) {
      // Try each difficulty point in the chapter's curve until we have enough
      const points = chapter.difficulty_curve;
      for (let i = 0; i < points.length && result.length < count; i++) {
        const point = points[(difficultyIndex + i) % points.length];
        // Try a few times per point — getCachedQ is random, so calling
        // it multiple times with an updated exclude list can find more
        for (let n = 0; n < 3 && result.length < count; n++) {
          const cached = getCachedQ(chapter.id, point, 'medium', Array.from(seen));
          if (cached && pushIfNew(cached as unknown as Question)) continue;
          break; // no more cached for this point
        }
      }
      onProgress?.(result.length);
    }

    return result;
  }, [chapter, mood, isOffline, preferences.pyqEnabled, preferences.pyqRatio]);

  const loadQuestion = useCallback(async (currentMood?: string) => {
    if (!chapter || isOffline) return;

    // Safety net: if we already have a history entry for the current index
    // (e.g. the user navigated Previous then Next), restore it instead of
    // calling the AI again. The ref is always up-to-date.
    const existing = sessionHistoryRef.current[blockQuestionIndex];
    if (existing) {
      setCurrentQuestion(existing.question);
      setSelectedOption(existing.userAnswer);
      setConfirmed(true);
      setIsCorrect(existing.isCorrect);
      setScaffoldTriggered(existing.scaffoldUsed);
      setPhase('question');
      return;
    }

    // Try the pre-generated queue first — instant, no waiting on the AI
    const fromQueue = questionQueueRef.current[0];
    if (fromQueue) {
      setQuestionQueue(prev => prev.slice(1));
      questionQueueRef.current = questionQueueRef.current.slice(1);
      setCurrentQuestion(fromQueue);
      resetQuestionState();
      setPhase('question');
      // Background-refill if the queue is getting low (don't make the user wait)
      if (questionQueueRef.current.length < 2 && !batchInFlightRef.current) {
        refillQueue(currentMood).catch(() => {});
      }
      return;
    }

    // Queue is empty (mid-session: prefetch didn't generate enough).
    // Show a "Generating next question…" state and use prefetchSessionQuestions
    // for a more robust attempt (overshoot from PYQ, AI retry, cache fallback).
    // Only show the error toast if even prefetchSessionQuestions can't
    // produce a question after multiple sources.
    setIsLoading(true);
    setError(null);
    try {
      const questions = await prefetchSessionQuestions(1, currentMood);
      if (questions.length > 0) {
        setCurrentQuestion(questions[0]);
        resetQuestionState();
        setPhase('question');
        // Trigger a background refill to repopulate the queue
        if (!batchInFlightRef.current) {
          refillQueue(currentMood).catch(() => {});
        }
      } else {
        // Last-resort: try a single AI call with a random variation hint
        const single = await generateSingle(currentMood);
        if (single) {
          setCurrentQuestion(single);
          resetQuestionState();
          setPhase('question');
          if (!batchInFlightRef.current) {
            refillQueue(currentMood).catch(() => {});
          }
        } else {
          setError(new Error('Could not generate questions'));
          showToast('Error generating AI question', 'error');
        }
      }
    } catch (err) {
      setError(err);
      showToast('Error generating AI question', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [chapter, chapterId, mood, isOffline, blockQuestionIndex, refillQueue, generateSingle, prefetchSessionQuestions]);

  const loadSpacedReviews = useCallback(async () => {
    if (isOffline) return;
    setIsLoading(true);
    setError(null);
    try {
      const due = getDueReviews();
      if (due.length === 0) {
        loadQuestion();
        return;
      }
      setReviewQueue(due);
      setReviewIndex(0);

      const firstDue = due[0];
      const seenTexts = sessionHistory.map(h => h.question.question).filter(Boolean);
      const q = await generateReviewQuestion(firstDue.concept, chapter?.name || '', {
        excludeQuestionTexts: seenTexts,
      });
      setReviewQuestion(q as unknown as ReviewQuestionResponse);
      resetQuestionState();
      setPhase('review');
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [chapter, loadQuestion, isOffline]);

  // Skip mood screen if default is preferred
  useEffect(() => {
    if (preferences.defaultMood) {
      const defaultM = preferences.defaultMood;
      setMood(defaultM);
      const due = getDueReviews();
      if (due.length > 0) {
        loadSpacedReviews();
      } else {
        loadQuestion(defaultM);
      }
    }
  }, [preferences.defaultMood, loadQuestion, loadSpacedReviews]);

  // Handle manual mood click
  const handleMoodSelect = (selectedMood: string) => {
    setMood(selectedMood);
    track('study_session_start', { mood: selectedMood });
    const due = getDueReviews();
    if (due.length > 0) {
      loadSpacedReviews();
    } else {
      loadQuestion(selectedMood);
    }
  };

  // ─── ANSWER VERIFICATION ───

  const handleConfirmAnswer = () => {
    if (!selectedOption || confirmed || !currentQuestion) return;

    const correct = selectedOption === currentQuestion.answer;
    setIsCorrect(correct);
    setConfirmed(true);

    track('study_question_answered', { isCorrect: correct, chapterId: chapterId || '' });

    const timeSpent = Math.ceil((Date.now() - questionStartTimeRef.current) / 1000);
    const isSpeedSolve = correct && timeSpent < 30;

    // Log the action to session history immediately
    const historyEntry: SessionHistoryEntry = {
      question: currentQuestion,
      userAnswer: selectedOption,
      isCorrect: correct,
      timeSpent: timeSpent,
      scaffoldUsed: scaffoldTriggered
    };
    // Use the ref so the index is always the current one (no stale closure)
    const idx = blockQuestionIndex;
    // Update the ref synchronously so handleNextQuestion can read the
    // latest history even if it's called in the same React batch.
    const nextHistory = [...sessionHistoryRef.current];
    nextHistory[idx] = historyEntry;
    sessionHistoryRef.current = nextHistory;
    setSessionHistory(nextHistory);

    // Update sessions statistics
    setSessionStats(prev => ({
      ...prev,
      attempted: prev.attempted + 1
    }));

    if (correct) {
      // Determine XP gains
      let xpEarned = 15; // clean correct
      if (scaffoldTriggered) {
        xpEarned = 5; // correct after scaffold 2
      } else if (hintUsedInQuestion) {
        xpEarned = 10; // correct after hint
      }

      setXpFloater(`+${xpEarned} XP`);
      gainXP(xpEarned);

      // Add concept to learned database
      if (currentQuestion.primaryConcept) {
        storage.addConceptLearned(currentQuestion.primaryConcept, chapterId!);
        
        // Save the concept to chapter's conceptsUnlocked array
        const chapterProg = storage.getChapterProgress(chapterId!);
        const existingConcepts = chapterProg.conceptsUnlocked || [];
        if (!existingConcepts.includes(currentQuestion.primaryConcept)) {
          const updatedConcepts = [...existingConcepts, currentQuestion.primaryConcept];
          storage.updateChapterProgress(chapterId!, { conceptsUnlocked: updatedConcepts });
          // Check/award unlock and completion XP progression bonuses
          checkProgressionXP(chapterId!);
        }

        setSessionStats(prev => ({
          ...prev,
          newConcepts: [...new Set([...prev.newConcepts, currentQuestion!.primaryConcept])]
        }));
      }

      // Increment clean solvers streak
      const newCleanStreak = scaffoldTriggered ? 0 : cleanSolvesInRow + 1;
      setCleanSolvesInRow(newCleanStreak);

      // Level difficulty in chapter up if 3 clean in a row
      const progress = storage.getChapterProgress(chapterId!);
      let newDiffIndex = progress.currentDifficultyIndex;
      if (newCleanStreak >= 3) {
        newDiffIndex = Math.min(newDiffIndex + 1, chapter!.difficulty_curve.length - 1);
        setCleanSolvesInRow(0);
        showToast('Difficulty level increased!', 'success');
      }

      storage.updateChapterProgress(chapterId!, {
        questionsAttempted: progress.questionsAttempted + 1,
        currentDifficultyIndex: newDiffIndex
      });

      // Update streak
      storage.updateStreak();

      setSessionStats(prev => ({
        ...prev,
        solvedClean: prev.solvedClean + (scaffoldTriggered ? 0 : 1)
      }));

      // Trigger XP floating timer
      setTimeout(() => setXpFloater(null), 1200);

      // Check auto-advance preference
      if (preferences.autoAdvance) {
        // Clear any pending auto-advance from a previous question
        if (autoAdvanceTimeoutRef.current) {
          clearTimeout(autoAdvanceTimeoutRef.current);
        }
        autoAdvanceTimeoutRef.current = setTimeout(() => {
          autoAdvanceTimeoutRef.current = null;
          handleNextQuestion();
        }, 2500);
      }
    } else {
      setWrongAttempts(prev => prev + 1);
      setCleanSolvesInRow(0);

      // Log mistake to history
      storage.addMistake({
        question: currentQuestion.question,
        chapter: chapterId,
        category: 'conceptual_gap',
        advice: currentQuestion.whyCorrect
      });

      // Classify error type in background
      classifyMistake(
        currentQuestion.question,
        currentQuestion.answer,
        selectedOption,
        ''
      ).catch(() => {});
    }
  };

  const handlePreviousQuestion = () => {
    // Cancel any pending auto-advance so it doesn't fire with stale state
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }
    if (blockQuestionIndex > 0) {
      const prevIdx = blockQuestionIndex - 1;
      setBlockQuestionIndex(prevIdx);

      // Restore the state from sessionHistory — use ref for the latest value
      const hist = sessionHistoryRef.current[prevIdx];
      if (hist) {
        setCurrentQuestion(hist.question);
        setSelectedOption(hist.userAnswer);
        setConfirmed(true);
        setIsCorrect(hist.isCorrect);
        setScaffoldTriggered(hist.scaffoldUsed);
        setPhase('question');
      }
    }
  };

  const handleNextQuestion = () => {
    // Cancel any pending auto-advance so it doesn't fire with stale state
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }
    const nextIdx = blockQuestionIndex + 1;
    const totalCountLimit = preferences.questionsPerSession || 5;

    if (nextIdx >= totalCountLimit) {
      triggerSessionSummary();
    } else {
      setBlockQuestionIndex(nextIdx);

      // Restore from sessionHistory if the user already answered this question
      // — use the ref to avoid stale closure issues. The ref is always
      // up-to-date because handleConfirmAnswer updates it synchronously.
      const hist = sessionHistoryRef.current[nextIdx];
      if (hist) {
        setCurrentQuestion(hist.question);
        setSelectedOption(hist.userAnswer);
        setConfirmed(true);
        setIsCorrect(hist.isCorrect);
        setScaffoldTriggered(hist.scaffoldUsed);
        setPhase('question');
      } else {
        // No history — pull from the pre-generated queue (instant), and
        // trigger a background refill so the queue stays warm.
        const fromQueue = questionQueueRef.current[0];
        if (fromQueue) {
          setQuestionQueue(prev => prev.slice(1));
          questionQueueRef.current = questionQueueRef.current.slice(1);
          setCurrentQuestion(fromQueue);
          resetQuestionState();
          setPhase('question');
          if (questionQueueRef.current.length < 2 && !batchInFlightRef.current) {
            refillQueue().catch(() => {});
          }
        } else {
          loadQuestion();
        }
      }
    }
  };

  // ─── SPACED REVIEWS ───

  const handleReviewAnswer = (option: string) => {
    if (selectedOption) return;
    setSelectedOption(option);
    if (!reviewQuestion) return;
    const correct = option === reviewQuestion.answer;
    setIsCorrect(correct);
    setConfirmed(true);

    markReviewed(reviewQueue[reviewIndex].concept, correct);
  };

  const handleReviewNext = async () => {
    const nextIdx = reviewIndex + 1;
    if (nextIdx < reviewQueue.length) {
      setReviewIndex(nextIdx);
      setIsLoading(true);
      try {
        const nextReviewObj = reviewQueue[nextIdx];
        const seenTexts = sessionHistory.map(h => h.question.question).filter(Boolean);
        const q = await generateReviewQuestion(nextReviewObj.concept, chapter?.name || '', {
          excludeQuestionTexts: seenTexts,
        });
        setReviewQuestion(q as unknown as ReviewQuestionResponse);
        resetQuestionState();
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Completed spaced reviews, launch normal chapter question loop
      showToast('Spaced reviews completed!', 'success');
      loadQuestion();
    }
  };

  // ─── HINT DRAWER ───

  const handleTriggerHint = async () => {
    if (showHintPanel || !currentQuestion) return;
    setShowHintPanel(true);
    setHintUsedInQuestion(true);
    track('study_hint_used');
    
    if (!hintText) {
      try {
        const h = await generateHint(
          currentQuestion.question,
          selectedOption || 'none',
          currentQuestion.primaryConcept
        );
        setHintText((h as unknown as HintResponse).hint);
      } catch (e) {
        setHintText("Focus on resolving variable relations first.");
      }
    }
  };

  // ─── SCAFFOLD ENGINE ───

  const handleTriggerStuck = async () => {
    if (!currentQuestion) return;
    setIsLoading(true);
    setScaffoldTriggered(true);
    track('study_scaffold_triggered');
    
    // Add scaffold concept to tracking
    if (currentQuestion.primaryConcept) {
      setSessionStats(prev => ({
        ...prev,
        scaffoldedConcepts: [...new Set([...prev.scaffoldedConcepts, currentQuestion!.primaryConcept])]
      }));
    }

    try {
      const l1 = await generateScaffoldL1(
        currentQuestion.question,
        currentQuestion.primaryConcept,
        chapter!.name
      );
      setScaffoldL1Data(l1 as Record<string, unknown>);
      resetQuestionState();
      setPhase('scaffold1');
    } catch (e) {
      showToast('Error generating scaffold elements', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToScaffoldPhase = async (targetPhase: string) => {
    if (targetPhase === 'scaffold3') {
      setPhase('scaffold3');
      return;
    }
    if (!currentQuestion) return;
    setIsLoading(true);
    try {
      if (targetPhase === 'scaffold2') {
        const exp = await generateConceptExplanation(
          currentQuestion.primaryConcept,
          chapter!.name
        );
        setScaffoldL2Data(exp as Record<string, unknown>);
        setPhase('scaffold2');
      } else if (targetPhase === 'ladder') {
        const lad = await generateConceptLadder(
          currentQuestion.primaryConcept,
          chapter!.name
        );
        setLadderData(lad as Record<string, unknown>);
        setPhase('ladder');
      }
    } catch (e) {
      showToast('Error transitioning scaffold levels', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteLadder = () => {
    // Add ladder reward XP
    gainXP(12);
    showToast('Ladder Completed! Try original question.', 'success');
    
    // Return user to original question
    setPhase('question');
    resetQuestionState();
  };

  const handleShowWorkedSolution = async () => {
    if (!currentQuestion) return;
    setIsLoading(true);
    try {
      const sol = await generateWorkedSolution(currentQuestion.question);
      setWorkedSolutionData(sol as Record<string, unknown>);
      setPhase('giveUp');
    } catch (e) {
      showToast('Failed to load step-by-step solution', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── SESSION SUMMARY ───

  const triggerSessionSummary = async () => {
    setIsLoading(true);
    try {
      const sum = await generateSessionSummary({
        attempted: sessionStats.attempted,
        solvedClean: sessionStats.solvedClean,
        scaffoldedConcepts: sessionStats.scaffoldedConcepts,
        newConcepts: sessionStats.newConcepts,
        chapterName: chapter!.name
      });
      setScaffoldL1Data(sum as Record<string, unknown>); // cache summary data
      setPhase('summary');
    } catch (e) {
      setScaffoldL1Data({ summary: 'Well done! A solid effort in completing today\'s question loop.', advice: 'Maintain your consistency by reviewing your formulas tomorrow.' });
      setPhase('summary');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndSession = () => {
    track('study_session_end');
    // Save note for current concept if notes drawer is populated
    if (currentQuestion?.primaryConcept && noteText.trim()) {
      storage.saveNote(currentQuestion.primaryConcept, noteText);
    }

    // Save study session to storage with totalCorrect and timeSpent details
    storage.addSession({
      chapterId: chapter!.id,
      chapterName: chapter!.name,
      attempted: sessionStats.attempted,
      solvedClean: sessionStats.solvedClean,
      totalCorrect: sessionHistory.filter(h => h.isCorrect).length,
      timeSpent: timerSeconds,
      concepts: sessionStats.newConcepts
    });

    // Clear the persisted session history so the next session starts clean
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`nexus_study_history_${window.location.pathname}`);
      } catch {
        // ignore
      }
    }

    navigate('/');
  };

  // Handle Note writing
  const handleSaveNote = () => {
    if (currentQuestion?.primaryConcept) {
      storage.saveNote(currentQuestion.primaryConcept, noteText);
      showToast('Revision note saved successfully', 'success');
      setShowNotesDrawer(false);
    }
  };

  // Safe quit prompt
  const handleBackPrompt = () => {
    if (sessionStats.attempted > 0 && phase !== 'summary') {
      if (window.confirm('End study session? Current progress will be logged.')) {
        handleEndSession();
      }
    } else {
      navigate('/');
    }
  };

  // Continue a finished session with a fresh batch of questions. Unlike
  // handleEndSession, this does NOT save to history or navigate away.
  // Pre-generates a full batch of fresh questions using all available
  // sources (PYQ + AI + cache) — mirrors the test-generation pattern
  // in TestPage so the user gets a guaranteed-fresh set of questions
  // every time they tap "Keep Going".
  //
  // IMPORTANT: we generate the new questions FIRST, then clear old
  // state. If generation fails, the user stays on the summary screen
  // with their previous session intact and can retry.
  const [keepGoingProgress, setKeepGoingProgress] = useState<{ loaded: number; total: number } | null>(null);

  const handleKeepGoing = async () => {
    if (!chapter) return;
    const total = preferences.questionsPerSession || 5;
    setKeepGoingProgress({ loaded: 0, total });

    // Generate first — if this throws or returns 0, the old session
    // remains intact and the user can try again.
    let questions: Question[] = [];
    try {
      questions = await prefetchSessionQuestions(total, undefined, (loaded) => {
        setKeepGoingProgress({ loaded, total });
      });
    } catch (err) {
      logger.error(`Keep Going: prefetch threw: ${err instanceof Error ? err.message : String(err)}`);
    }

    if (questions.length === 0) {
      showToast('Could not generate new questions. Please check your connection and try again.', 'error');
      setKeepGoingProgress(null);
      return; // Keep old state intact so user can retry
    }

    // We have new questions — NOW clear old state so the safety net in
    // loadQuestion / handleNextQuestion doesn't restore old answers.
    setSessionHistory([]);
    sessionHistoryRef.current = [];
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`nexus_study_history_${window.location.pathname}`);
      } catch {
        // ignore
      }
    }
    // Reset per-question UI state
    setCurrentQuestion(null);
    setSelectedOption(null);
    setConfirmed(false);
    setIsCorrect(false);
    setScaffoldTriggered(false);
    setHintText('');
    setShowHintPanel(false);
    setHintUsedInQuestion(false);
    setWrongAttempts(0);
    setShowWrongAccordion(false);
    setXpFloater(null);
    // Reset session-level stats, index, and timer
    setBlockQuestionIndex(0);
    setSessionStats({ attempted: 0, solvedClean: 0, scaffoldedConcepts: [], newConcepts: [] });
    setTimerSeconds(0);

    // First question goes to currentQuestion, rest go in the queue
    const [first, ...rest] = questions;
    setCurrentQuestion(first);
    setQuestionQueue(rest);
    questionQueueRef.current = rest;
    resetQuestionState();
    setPhase('question');
    setKeepGoingProgress({ loaded: questions.length, total });

    // Clear progress after a short delay so user sees "X/Y" briefly
    setTimeout(() => setKeepGoingProgress(null), 1200);
  };

  if (!chapter) {
    return (
      <div style={styles.errorScreen}>
        <p style={{ color: 'var(--text-secondary)' }}>Curriculum chapter not found.</p>
        <button className="btn btn-secondary" onClick={() => navigate('/')}>Return Home</button>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      
      {/* Top Header Panel */}
      <div style={styles.topHeader}>
        <div style={styles.topRow}>
          <button style={styles.backBtn} onClick={handleBackPrompt}>
            ← Exit
          </button>
          <h4 style={styles.chapterTitleText}>{chapter.name}</h4>
          <span style={styles.sessionTimer}><ClockIcon size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />{formatTimer(timerSeconds)}</span>
        </div>

        {/* Progress dots bar */}
        {phase !== 'mood' && phase !== 'summary' && (
          <div style={styles.progressDotsContainer}>
            {Array.from({ length: preferences.questionsPerSession || 5 }).map((_, idx: number) => {
              const isAnswered = sessionHistory[idx] !== undefined;
              const isCurrent = idx === blockQuestionIndex;
              
              let dotBg = 'var(--bg-elevated)'; // unanswered (empty)
              let dotBorder = 'none';
              
              if (isCurrent) {
                dotBg = 'var(--text-primary)'; // highlighted
                dotBorder = '1px solid var(--accent)';
              } else if (isAnswered) {
                dotBg = 'var(--accent)'; // answered (filled)
              }
              
              return (
                <div
                  key={idx}
                  style={{
                    ...styles.dot,
                    backgroundColor: dotBg,
                    border: dotBorder
                  }}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Offline banner warning */}
      {isOffline && (
        <div style={styles.offlineBanner}>
          You're offline — showing cached content. Reconnect to generate new questions.
        </div>
      )}

      {/* Main Core Container */}
      <div style={styles.mainScrollable} className="mx-auto p-4 max-w-lg w-full">
        
        {isLoading && <SkeletonQuestion />}
        
        {!!error && !isLoading && (
          <ErrorState 
            error={error instanceof Error ? error : null} 
            onRetry={() => {
              if (phase === 'review') loadSpacedReviews();
              else loadQuestion();
            }} 
          />
        )}

        {!isLoading && !error && (
          <AnimatePresence mode="wait">
            
            {/* Phase: Mood Selection */}
            {phase === 'mood' && (
              <motion.div
                key="mood"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={styles.moodAlign as React.CSSProperties}
              >
                <h3 style={styles.moodHeadline}>Choose your learning load:</h3>
                <div style={styles.moodGrid}>
                  <div style={styles.moodCard} className="card" onClick={() => handleMoodSelect('focused')}>
                    <span style={{ ...styles.moodEmoji, color: 'var(--accent)' }}><TargetIcon size={32} /></span>
                    <strong>Focused</strong>
                    <p style={styles.moodDesc}>Full difficulty. Standard exam caliber problems.</p>
                  </div>
                  <div style={styles.moodCard} className="card" onClick={() => handleMoodSelect('tired')}>
                    <span style={{ ...styles.moodEmoji, color: 'var(--warning)' }}><CoffeeIcon size={32} /></span>
                    <strong>Tired</strong>
                    <p style={styles.moodDesc}>Lighter mathematical calculations. Concept focus.</p>
                  </div>
                  <div style={styles.moodCard} className="card" onClick={() => handleMoodSelect('stressed')}>
                    <span style={{ ...styles.moodEmoji, color: 'var(--danger)' }}><HeartbeatIcon size={32} /></span>
                    <strong>Stressed</strong>
                    <p style={styles.moodDesc}>We'll start easy to rebuild your confidence.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Phase: Spaced Repetition Reviews */}
            {phase === 'review' && reviewQuestion && (
              <motion.div
                key="review"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <div style={styles.reviewHeader} className="card">
                  <span style={styles.reviewBadge}>REVISION CHALLENGE</span>
                  <h4 style={{ margin: '4px 0' }}>{reviewQueue[reviewIndex]?.concept}</h4>
                  <span style={styles.reviewCount}>Review {reviewIndex + 1} of {reviewQueue.length}</span>
                </div>
                
                <div style={{ marginTop: '16px' }}>
                  <QuestionCard question={reviewQuestion} hideBookmark={true} />
                </div>

                <div style={styles.optionsCol}>
                  {Object.entries(reviewQuestion.options).map(([key, val]: [string, string]) => (
                    <OptionButton
                      key={key}
                      letter={key}
                      value={val}
                      isSelected={selectedOption === key}
                      isCorrect={reviewQuestion.answer === key}
                      isWrong={selectedOption === key && reviewQuestion.answer !== key}
                      showAnswer={confirmed}
                      disabled={confirmed}
                      onClick={() => handleReviewAnswer(key)}
                    />
                  ))}
                </div>

                {confirmed && (
                  <div style={styles.reviewFooter}>
                    <button className="btn btn-primary w-full" onClick={handleReviewNext}>
                      {reviewIndex >= reviewQueue.length - 1 ? 'Start Session →' : 'Next Review →'}
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Phase: Main Question Solver */}
            {phase === 'question' && currentQuestion && (
              <motion.div
                key="question"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                style={styles.solveContainer as React.CSSProperties}
              >
                <QuestionCard question={currentQuestion} />

                {/* Options List */}
                <div style={styles.optionsCol}>
                  {Object.entries(currentQuestion.options).map(([key, val]: [string, string]) => (
                    <OptionButton
                      key={key}
                      letter={key}
                      value={val}
                      isSelected={selectedOption === key}
                      isCorrect={currentQuestion.answer === key}
                      isWrong={selectedOption === key && currentQuestion.answer !== key}
                      showAnswer={confirmed}
                      disabled={confirmed}
                      onClick={() => setSelectedOption(key)}
                    />
                  ))}
                </div>

                {/* Floating XP Indicator */}
                {xpFloater && (
                  <div style={styles.xpFloaterContainer as React.CSSProperties}>
                    <div className="xp-float-notification">{xpFloater}</div>
                  </div>
                )}

                {/* Confirmed / Post-Submit Controls */}
                {confirmed && (
                  <div style={styles.resultBox}>
                    {isCorrect ? (
                      <div style={styles.correctOverlay} className="card">
                        <div style={styles.checkmarkCentered}>
                          <svg className="svg-checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                            <circle className="svg-checkmark__circle" cx="26" cy="26" r="25" fill="none" />
                            <path className="svg-checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                          </svg>
                        </div>
                        <p style={styles.explanationText}>
                          <strong>Why Correct: </strong>{parseLaTeX(currentQuestion!.whyCorrect)}
                        </p>

                        {/* Collapsible reasoning block */}
                        <div style={styles.accordionHeader} onClick={() => setShowWrongAccordion(!showWrongAccordion)}>
                          <span>Why other options were incorrect {showWrongAccordion ? '−' : '+'}</span>
                        </div>
                        
                        {showWrongAccordion && (
                          <div style={styles.accordionBody}>
                            {Object.entries(currentQuestion!.whyOthersWrong || {}).map(([key, reason]: [string, string]) => (
                              <div key={key} style={styles.accordionItem}>
                                <strong style={{ color: 'var(--danger)' }}>{key}: </strong>
                                <span>{parseLaTeX(reason)}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <button 
                          style={{ width: '100%', marginTop: '16px' }} 
                          className="btn btn-primary"
                          onClick={handleNextQuestion}
                        >
                          Next Question →
                        </button>
                      </div>
                    ) : (
                      <div style={styles.incorrectOverlay} className="card">
                        <h4 style={{ color: 'var(--danger)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                          <CrossIcon size={20} /> That choice is incorrect
                        </h4>

                        {currentQuestion!.whyOthersWrong?.[selectedOption!] && (
                          <p style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '16px', lineHeight: '1.5', textAlign: 'left', padding: '10px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: '6px', borderLeft: '3px solid var(--danger)' }}>
                            <strong>Why it is incorrect: </strong>{parseLaTeX(currentQuestion!.whyOthersWrong![selectedOption!])}
                          </p>
                        )}

                        <div style={{ display: 'flex', gap: '12px', marginTop: '16px', justifyContent: 'stretch' }}>
                          <button 
                            className="btn btn-ghost"
                            style={{ flex: 1, border: '1px solid var(--accent)', color: 'var(--accent)' }}
                            onClick={handleTriggerStuck}
                          >
                            <StuckIcon size={14} style={{ marginRight: '6px' }} /> Simplify (S)
                          </button>
                          <button 
                            className="btn btn-primary"
                            style={{ flex: 1 }}
                            onClick={handleNextQuestion}
                          >
                            Next Question (N) →
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Helper buttons below card */}
                {!confirmed && (
                  <div style={styles.helperActions}>
                    <button className="btn btn-ghost" style={styles.ghostBtn} onClick={handleTriggerHint}>
                      <HintIcon size={14} style={{ marginRight: '6px' }} /> Hint
                    </button>
                    <button className="btn btn-ghost" style={styles.ghostBtn} onClick={handleTriggerStuck}>
                      <StuckIcon size={14} style={{ marginRight: '6px' }} /> I'm stuck
                    </button>
                  </div>
                )}

                {/* Confirm Button + Previous/Next — wrapped in a single footer
                    container so the layout is identical on mobile and PC. The
                    footer lives in the document flow (not fixed) and scrolls
                    naturally with the question card. */}
                <div style={styles.questionFooter}>
                  {/* Confirm Button — only when an option is selected and not yet
                      confirmed. Sits ABOVE the Previous/Next row. */}
                  {selectedOption && !confirmed && (
                    <motion.div
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                    >
                      <button
                        style={styles.confirmInlineButton}
                        className="btn btn-primary"
                        onClick={handleConfirmAnswer}
                      >
                        Confirm Selection
                      </button>
                    </motion.div>
                  )}

                  {/* Previous / Next Navigation Row */}
                  <div style={styles.navRow}>
                    <button
                      className="btn btn-secondary"
                      style={styles.navButton}
                      disabled={blockQuestionIndex === 0}
                      onClick={handlePreviousQuestion}
                    >
                      ← Previous
                    </button>
                    <button
                      className="btn btn-primary"
                      style={styles.navButton}
                      disabled={!confirmed && blockQuestionIndex >= sessionHistory.length}
                      onClick={handleNextQuestion}
                    >
                      Next →
                    </button>
                  </div>
                </div>

              </motion.div>
            )}

            {/* Phase: Scaffolding Panel level 1, 2, 3 */}
            {(phase === 'scaffold1' || phase === 'scaffold2' || phase === 'scaffold3') && (
              <motion.div
                key="scaffolds"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <ScaffoldPanel
                  phase={phase}
                  scaffoldData={phase === 'scaffold1' ? (scaffoldL1Data || {}) : (scaffoldL2Data || {})}
                  onBackToOriginal={() => {
                    setPhase('question');
                    resetQuestionState();
                  }}
                  onGoToPhase={handleGoToScaffoldPhase}
                  onNextQuestion={handleNextQuestion}
                  originalConcept={currentQuestion?.primaryConcept || ''}
                />
              </motion.div>
            )}

            {/* Phase: Ladder Stepper */}
            {phase === 'ladder' && ladderData && (
              <motion.div
                key="ladder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ConceptLadder
                  ladderData={ladderData as unknown as ConceptLadderResponse}
                  stuckConcept={currentQuestion?.primaryConcept || ''}
                  onCompleteLadder={handleCompleteLadder}
                  onNextQuestion={handleNextQuestion}
                />
              </motion.div>
            )}

            {/* Phase: Give Up / Solution */}
            {phase === 'giveUp' && workedSolutionData && (
              <motion.div
                key="giveup"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ScaffoldPanel
                  phase="giveUp"
                  scaffoldData={workedSolutionData}
                  onBackToOriginal={() => {
                    setPhase('question');
                    resetQuestionState();
                  }}
                  onGoToPhase={handleGoToScaffoldPhase}
                  onNextQuestion={handleNextQuestion}
                  originalConcept={currentQuestion?.primaryConcept || ''}
                />
              </motion.div>
            )}

            {/* Phase: Block End Summary */}
            {phase === 'summary' && scaffoldL1Data && (
              <motion.div
                key="summary"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={styles.summaryContainer as React.CSSProperties}
                className="card"
              >
                <h2 style={{ fontSize: '20px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <StatsIcon size={20} color="var(--accent)" /> Session Block Complete
                </h2>
                
                {/* Stats tags */}
                <div style={styles.summaryStatsGrid}>
                  <div style={styles.summaryStatItem} className="card">
                    <span style={styles.sumNum}>{sessionStats.attempted}</span>
                    <span style={styles.sumLabel}>Attempted</span>
                  </div>
                  <div style={styles.summaryStatItem} className="card">
                    <span style={styles.sumNum}>{sessionStats.solvedClean}</span>
                    <span style={styles.sumLabel}>Clean Solves</span>
                  </div>
                  <div style={styles.summaryStatItem} className="card">
                    <span style={styles.sumNum}>{sessionStats.newConcepts.length}</span>
                    <span style={styles.sumLabel}>Mastered</span>
                  </div>
                </div>

                <div style={styles.aiSummarySection}>
                  <strong style={{ color: 'var(--accent-hover)', fontSize: '13px' }}>AI Tutor Summary:</strong>
                  <p style={styles.summaryText}>{(scaffoldL1Data as unknown as SessionSummaryResponse).summary}</p>
                </div>

                <div style={styles.aiAdviceSection}>
                  <strong style={{ color: 'var(--warning)', fontSize: '13px' }}>Study Advice:</strong>
                  <p style={styles.summaryText}>{(scaffoldL1Data as unknown as SessionSummaryResponse).advice}</p>
                </div>

                {/* Detailed Questions Attempted Breakdown */}
                <div style={{ marginTop: '12px', width: '100%' }}>
                  <strong style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Question Breakdown:</strong>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                    {sessionHistory.map((item: SessionHistoryEntry, idx: number) => (
                      <div key={idx} className="card" style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
                          <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Question {idx + 1}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.question.primaryConcept} • {item.timeSpent}s</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {item.scaffoldUsed && (
                            <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--warning)', backgroundColor: 'var(--warning-dim)', padding: '2px 6px', borderRadius: '6px' }}>
                              Scaffolded
                            </span>
                          )}
                          <span style={{ color: item.isCorrect ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold', fontSize: '13px' }}>
                            {item.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={styles.summaryButtons}>
                  <button className="btn btn-secondary" style={styles.halfBtn} onClick={handleEndSession}>
                    End Session
                  </button>
                  <button
                    className="btn btn-primary"
                    style={{ ...styles.halfBtn, opacity: keepGoingProgress ? 0.6 : 1 }}
                    onClick={handleKeepGoing}
                    disabled={!!keepGoingProgress}
                  >
                    {keepGoingProgress
                      ? keepGoingProgress.loaded >= keepGoingProgress.total
                        ? 'Ready!'
                        : `Generating ${keepGoingProgress.loaded}/${keepGoingProgress.total}…`
                      : 'Keep Going'}
                  </button>
                </div>

                {keepGoingProgress && keepGoingProgress.loaded < keepGoingProgress.total && (
                  <div style={{ marginTop: '12px', width: '100%', textAlign: 'center' }}>
                    <div style={styles.keepGoingBar}>
                      <div
                        style={{
                          ...styles.keepGoingBarFill,
                          width: `${Math.round((keepGoingProgress.loaded / Math.max(1, keepGoingProgress.total)) * 100)}%`,
                        }}
                      />
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
                      Pulling fresh questions from PYQs, AI, and your local cache…
                    </p>
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        )}
      </div>

      {/* Floating Bottom Bar (Note writing & shortcuts) */}
      {phase !== 'mood' && phase !== 'summary' && (
        <div style={styles.bottomTabBar} className="glass">
          <div style={styles.bottomRow}>
            <button 
              style={styles.actionTabBtn}
              onClick={() => {
                setShowNotesDrawer(true);
                // Preload note
                if (currentQuestion?.primaryConcept) {
                  setNoteText(storage.getNote(currentQuestion.primaryConcept));
                }
              }}
            >
              <NoteIcon size={14} style={{ marginRight: '6px' }} /> Note
            </button>

            {/* Worked solution option if user fails in question phase */}
            {confirmed && !isCorrect && phase === 'question' && (
              <button 
                style={{ ...styles.actionTabBtn, color: 'var(--danger)' }}
                onClick={handleShowWorkedSolution}
              >
                Worked Solution
              </button>
            )}

            <button 
              style={styles.actionTabBtn}
              onClick={() => setShowShortcutTooltip(!showShortcutTooltip)}
            >
              <KeyboardIcon size={14} style={{ marginRight: '6px' }} /> Shortcuts
            </button>
          </div>
        </div>
      )}

      {/* Slide-up Notes Drawer */}
      <AnimatePresence>
        {showNotesDrawer && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={styles.drawerBackdrop as React.CSSProperties}
              onClick={() => setShowNotesDrawer(false)}
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              style={styles.drawerSheet as React.CSSProperties}
              className="glass"
            >
              <div style={styles.drawerHeader}>
                <div>
                  <h4 style={{ margin: 0 }}>My Concept Notes</h4>
                  <span style={styles.notesConceptChip}>Concept: {currentQuestion?.primaryConcept || 'General'}</span>
                </div>
                <button style={styles.closeBtn} onClick={() => setShowNotesDrawer(false)}>✕</button>
              </div>

              <div style={styles.drawerContent}>
                <textarea
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  placeholder="Type your own notes here to capture your understanding. Formulas, shortcuts, traps to avoid, etc."
                  style={styles.notesTextArea}
                />
              </div>

              <div style={styles.drawerFooter}>
                <button className="btn btn-secondary" style={styles.halfBtn} onClick={() => setShowNotesDrawer(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" style={styles.halfBtn} onClick={handleSaveNote}>
                  Save Note
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Keyboard Shortcuts Dialog */}
      <AnimatePresence>
        {showShortcutTooltip && (
          <>
            <div style={styles.drawerBackdrop as React.CSSProperties} onClick={() => setShowShortcutTooltip(false)} />
            <div style={styles.shortcutCard} className="card glass">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <strong style={{ fontSize: '14px' }}>Keyboard Shortcuts</strong>
                <button style={styles.closeBtn} onClick={() => setShowShortcutTooltip(false)}>✕</button>
              </div>
              <div style={styles.shortcutRows}>
                <div style={styles.shortcutRow}>
                  <span>Select options</span>
                  <span style={styles.shortTag}>A / B / C / D</span>
                </div>
                <div style={styles.shortcutRow}>
                  <span>Confirm option selection</span>
                  <span style={styles.shortTag}>Enter</span>
                </div>
                <div style={styles.shortcutRow}>
                  <span>Show AI hints</span>
                  <span style={styles.shortTag}>H</span>
                </div>
                <div style={styles.shortcutRow}>
                  <span>Trigger Scaffold flow</span>
                  <span style={styles.shortTag}>S</span>
                </div>
                <div style={styles.shortcutRow}>
                  <span>Proceed / Skip question</span>
                  <span style={styles.shortTag}>N</span>
                </div>
                <div style={styles.shortcutRow}>
                  <span>Dismiss overlays/drawers</span>
                  <span style={styles.shortTag}>Esc</span>
                </div>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Slide-up AI Hints drawer */}
      <AnimatePresence>
        {showHintPanel && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={styles.drawerBackdrop as React.CSSProperties}
              onClick={() => setShowHintPanel(false)}
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              style={styles.hintSheet as React.CSSProperties}
              className="card glass"
            >
              <div style={styles.hintHeader}>
                <strong style={{ color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <HintIcon size={16} color="var(--warning)" /> Revision Hint
                </strong>
                <button style={styles.closeBtn} onClick={() => setShowHintPanel(false)}>✕</button>
              </div>
              <p style={styles.hintContentText}>
                {hintText || "Analyzing your error pattern... Generating helpful hints..."}
              </p>
              <button className="btn btn-secondary w-full" onClick={() => setShowHintPanel(false)}>
                Dismiss Hint
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: 'var(--bg-primary)',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative'
  },
  errorScreen: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px'
  },
  topHeader: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '64px',
    backgroundColor: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border-subtle)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    zIndex: 90,
    padding: '8px 24px 0 24px'
  },
  topRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    height: '40px'
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    fontSize: '13px',
    cursor: 'pointer',
    fontFamily: 'var(--font-sans)',
    fontWeight: '600'
  },
  chapterTitleText: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '220px'
  },
  sessionTimer: {
    fontFamily: 'var(--font-mono)',
    fontSize: '13px',
    color: 'var(--text-secondary)'
  },
  progressDotsContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '6px',
    width: '100%',
    paddingBottom: '6px'
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    transition: 'all 0.3s ease'
  },
  offlineBanner: {
    position: 'fixed',
    top: '64px',
    left: 0,
    right: 0,
    backgroundColor: 'var(--warning-dim)',
    borderBottom: '1px solid var(--warning)',
    color: 'var(--warning)',
    textAlign: 'center',
    padding: '6px 16px',
    fontSize: '11px',
    fontWeight: '600',
    zIndex: 89
  },
  mainScrollable: {
    paddingTop: '80px',
    paddingBottom: '88px',
    flex: 1
  },
  moodAlign: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: '16px',
    marginTop: '24px'
  },
  moodHeadline: {
    fontSize: '16px',
    fontWeight: '700',
    textAlign: 'center'
  },
  moodGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  moodCard: {
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '24px',
    gap: '8px',
    transition: 'all 0.2s'
  },
  moodEmoji: {
    fontSize: '32px'
  },
  moodDesc: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    lineHeight: '1.4'
  },
  reviewHeader: {
    padding: '16px',
    backgroundColor: 'var(--warning-dim)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center'
  },
  reviewBadge: {
    fontSize: '10px',
    fontWeight: '700',
    color: 'var(--warning)',
    letterSpacing: '1px'
  },
  reviewCount: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    marginTop: '2px'
  },
  optionsCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '20px'
  },
  reviewFooter: {
    marginTop: '20px',
    width: '100%'
  },
  solveContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    position: 'relative'
  },
  xpFloaterContainer: {
    position: 'absolute',
    top: '30%',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 99
  },
  confirmInlineButton: {
    width: '100%',
    height: '48px',
    fontSize: '15px',
    fontWeight: 600,
    marginBottom: '12px'
  },
  questionFooter: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    marginTop: '20px',
    gap: '12px'
  },
  navRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    width: '100%'
  },
  navButton: {
    flex: 1,
    height: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px'
  },
  resultBox: {
    marginTop: '16px',
    width: '100%'
  },
  correctOverlay: {
    padding: '24px',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch'
  },
  checkmarkCentered: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '16px'
  },
  explanationText: {
    fontSize: '13px',
    color: 'var(--text-primary)',
    lineHeight: '1.5',
    textAlign: 'center'
  },
  accordionHeader: {
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    textAlign: 'center',
    padding: '8px 0',
    marginTop: '16px',
    borderTop: '1px solid var(--border-subtle)',
    userSelect: 'none'
  },
  accordionBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '12px',
    borderRadius: '12px',
    backgroundColor: 'var(--bg-secondary)',
    marginTop: '8px'
  },
  accordionItem: {
    fontSize: '11px',
    color: 'var(--text-primary)',
    lineHeight: '1.4'
  },
  incorrectOverlay: {
    padding: '24px',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  crossIcon: {
    fontSize: '32px',
    color: 'var(--danger)',
    marginBottom: '8px',
    lineHeight: '1'
  },
  wrongButtonsRow: {
    display: 'flex',
    gap: '12px',
    width: '100%',
    marginTop: '16px'
  },
  flexBtn: {
    flex: 1
  },
  helperActions: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '16px'
  },
  ghostBtn: {
    padding: '8px 16px',
    fontSize: '13px'
  },
  bottomTabBar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: '56px',
    borderTop: '1px solid var(--border-subtle)',
    zIndex: 90
  },
  bottomRow: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: '100%',
    maxWidth: '512px',
    margin: '0 auto'
  },
  actionTabBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    fontFamily: 'var(--font-sans)',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    height: '100%',
    padding: '0 16px',
    display: 'flex',
    alignItems: 'center'
  },
  drawerBackdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 1000,
    backdropFilter: 'blur(3px)'
  },
  drawerSheet: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1001,
    borderTopLeftRadius: '24px',
    borderTopRightRadius: '24px',
    boxShadow: '0 -10px 25px rgba(0,0,0,0.5)',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '60vh',
    maxWidth: '512px',
    margin: '0 auto'
  },
  drawerHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid var(--border-subtle)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  notesConceptChip: {
    fontSize: '11px',
    color: 'var(--accent-hover)',
    marginTop: '4px',
    display: 'inline-block'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    fontSize: '16px',
    cursor: 'pointer'
  },
  drawerContent: {
    padding: '20px 24px',
    flex: 1
  },
  notesTextArea: {
    width: '100%',
    height: '180px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-default)',
    borderRadius: '12px',
    padding: '16px',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-sans)',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    resize: 'none'
  },
  drawerFooter: {
    padding: '16px 24px',
    borderTop: '1px solid var(--border-subtle)',
    display: 'flex',
    gap: '12px'
  },
  halfBtn: {
    flex: 1
  },
  shortcutCard: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 1001,
    width: '90%',
    maxWidth: '360px',
    padding: '20px'
  },
  shortcutRows: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  shortcutRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '12px'
  },
  shortTag: {
    fontFamily: 'var(--font-mono)',
    backgroundColor: 'var(--bg-elevated)',
    border: '1px solid var(--border-default)',
    padding: '2px 6px',
    borderRadius: '4px',
    color: 'var(--text-primary)'
  },
  hintSheet: {
    position: 'fixed',
    bottom: '24px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '90%',
    maxWidth: '480px',
    zIndex: 1001,
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
    border: '1px solid var(--warning-dim)'
  },
  hintHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  hintContentText: {
    fontSize: '13px',
    lineHeight: '1.5',
    color: 'var(--text-primary)'
  },
  summaryContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    padding: '28px',
    backgroundColor: 'var(--bg-card)',
    marginTop: '16px'
  },
  summaryStatsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px'
  },
  summaryStatItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '12px',
    textAlign: 'center',
    gap: '4px'
  },
  sumNum: {
    fontFamily: 'var(--font-mono)',
    fontSize: '22px',
    fontWeight: '700',
    color: 'var(--text-primary)'
  },
  sumLabel: {
    fontSize: '10px',
    color: 'var(--text-secondary)'
  },
  aiSummarySection: {
    padding: '16px',
    borderRadius: '12px',
    backgroundColor: 'var(--accent-dim)',
    border: '1px solid rgba(99, 102, 241, 0.2)'
  },
  aiAdviceSection: {
    padding: '16px',
    borderRadius: '12px',
    backgroundColor: 'var(--warning-dim)',
    border: '1px solid rgba(245, 158, 11, 0.2)'
  },
  summaryText: {
    fontSize: '13px',
    color: 'var(--text-primary)',
    lineHeight: '1.5',
    marginTop: '6px'
  },
  summaryButtons: {
    display: 'flex',
    gap: '12px',
    marginTop: '12px'
  },
  keepGoingBar: {
    width: '100%',
    height: '6px',
    borderRadius: '3px',
    backgroundColor: 'var(--bg-secondary)',
    overflow: 'hidden',
  },
  keepGoingBarFill: {
    height: '100%',
    backgroundColor: 'var(--accent)',
    transition: 'width 0.3s ease-out',
  }
};
