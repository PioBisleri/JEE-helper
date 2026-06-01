import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../components/UserContext';
import { storage } from '../utils/storage';
import { CHAPTERS } from '../data/chapters';
import { getDueReviews } from '../utils/spaceRepetition';
import DailyChallenge from '../components/DailyChallenge';
import { motion, AnimatePresence } from 'framer-motion';
import { WarningIcon, RefreshIcon, NoteIcon, LockIcon, CheckIcon } from '../components/Icons';
import { generateGateQuestions } from '../utils/api';
import { parseLaTeX } from '../components/DailyChallenge';
import { SkeletonHome } from '../components/LoadingSkeleton';

interface GateQuestion {
  question: string;
  options: Record<string, string>;
  answer: string;
  whyCorrect: string;
}

interface GateChapter {
  id: string;
  name: string;
  subtopics: string[];
  difficulty_curve: string[];
}

type ChapterType = { id: string; name: string; subtopics: string[]; difficulty_curve: string[] };

export default function Home() {
  const navigate = useNavigate();
  const { streak, examDate, gainXP, checkProgressionXP } = useUser();
  const [activeTab, setActiveTab] = useState('physics');
  const [gateChapter, setGateChapter] = useState<GateChapter | null>(null);
  const [gateLoading, setGateLoading] = useState(false);
  const [gateQuestions, setGateQuestions] = useState<GateQuestion[]>([]);
  const [gateCurrentIdx, setGateCurrentIdx] = useState(0);
  const [gateCorrectCount, setGateCorrectCount] = useState(0);
  const [gateSelectedOption, setGateSelectedOption] = useState<string | null>(null);
  const [gateConfirmed, setGateConfirmed] = useState(false);
  const [gateError, setGateError] = useState<string | null>(null);
  const [gateCompleted, setGateCompleted] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  const examCountdown = useMemo(() => {
    if (!examDate) return { days: 0, color: 'var(--success)' };
    const diff = Math.ceil((new Date(examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    let color = 'var(--success)';
    if (diff <= 30) color = 'var(--danger)';
    else if (diff <= 60) color = 'var(--warning)';
    return { days: diff > 0 ? diff : 0, color };
  }, [examDate]);

  const stats = useMemo(() => {
    const sessions = storage.getSessions();
    const now = new Date();
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    let thisWeekQuestions = 0;
    let correctQuestions = 0;
    let attemptedQuestions = 0;

    sessions.forEach(s => {
      if (!s.date) return;
      const sDate = new Date(s.date);
      if (sDate >= startOfWeek) thisWeekQuestions += s.attempted || 0;
      correctQuestions += s.solvedClean || 0;
      attemptedQuestions += s.attempted || 0;
    });

    const accuracy = attemptedQuestions > 0 ? Math.round((correctQuestions / attemptedQuestions) * 100) : 0;
    return { thisWeekQuestions, accuracy };
  }, []);

  const conceptsLearnedCount = useMemo(() => storage.getConceptsLearned().length, []);

  const alerts = useMemo(() => {
    const dueReviews = getDueReviews().length;
    const todayStr = new Date().toDateString();
    const studiedToday = streak.lastStudied === todayStr;
    const isPast6 = new Date().getHours() >= 18;
    const streakAtRisk = !studiedToday && isPast6 && streak.current > 0;
    const weeklyTestReady = conceptsLearnedCount >= 3;
    return { dueReviews, streakAtRisk, weeklyTestReady };
  }, [streak, conceptsLearnedCount]);

  const subjectChapters = useMemo(() => {
    const list = (CHAPTERS as Record<string, ChapterType[]>)[activeTab] || [];
    return list.map((chapter: ChapterType, idx: number) => {
      const chapterProg = storage.getChapterProgress(chapter.id);
      const totalConcepts = chapter.difficulty_curve.length;
      const unlockedCount = chapterProg.conceptsUnlocked?.length || 0;
      const percent = totalConcepts > 0 ? Math.round((unlockedCount / totalConcepts) * 100) : 0;

      let isLocked = false;
      let prevChapterName = '';
      if (idx > 0) {
        const prevChapter = list[idx - 1];
        prevChapterName = prevChapter.name;
        const prevProg = storage.getChapterProgress(prevChapter.id);
        const prevTotal = prevChapter.difficulty_curve.length;
        const prevUnlocked = prevProg.conceptsUnlocked?.length || 0;
        const prevPercent = prevTotal > 0 ? (prevUnlocked / prevTotal) * 100 : 0;
        const unlockedViaGate = storage.isChapterUnlockedViaGate(chapter.id);
        if (prevPercent < 25 && !unlockedViaGate) isLocked = true;
      }

      if (percent >= 100 && !chapterProg.completed) {
        storage.updateChapterProgress(chapter.id, { completed: true });
      }

      const third = Math.ceil(list.length / 3);
      let diff = 'Beginner';
      if (idx >= 2 * third) diff = 'Advanced';
      else if (idx >= third) diff = 'Intermediate';

      return {
        ...chapter, percent, isLocked, diff,
        conceptsLearned: unlockedCount, prevChapterName,
        completed: chapterProg.completed || percent >= 100,
        unlockedViaGate: storage.isChapterUnlockedViaGate(chapter.id)
      };
    });
  }, [activeTab]);

  const handleChapterClick = (chapter: { isLocked: boolean; id: string }) => {
    if (chapter.isLocked) return;
    navigate(`/study/${activeTab}/${chapter.id}`);
  };

  const handleOpenGate = async (chapter: GateChapter) => {
    setGateChapter(chapter);
    setGateLoading(true);
    setGateQuestions([]);
    setGateCurrentIdx(0);
    setGateCorrectCount(0);
    setGateSelectedOption(null);
    setGateConfirmed(false);
    setGateCompleted(false);
    setGateError(null);

    const list = (CHAPTERS as Record<string, ChapterType[]>)[activeTab] || [];
    const idx = list.findIndex((c: ChapterType) => c.id === chapter.id);
    if (idx <= 0) { setGateError("Prerequisite chapter not found."); setGateLoading(false); return; }
    const prevChapter = list[idx - 1];

    try {
      const q = await generateGateQuestions(prevChapter.name, chapter.name) as { questions: GateQuestion[] } | null;
      if (q && q.questions && q.questions.length === 5) setGateQuestions(q.questions);
      else throw new Error("Invalid question format.");
    } catch {
      setGateError("Failed to generate prerequisite questions. Please try again.");
    } finally {
      setGateLoading(false);
    }
  };

  const handleConfirmGateAnswer = () => {
    if (!gateSelectedOption || gateConfirmed) return;
    const currentQ = gateQuestions[gateCurrentIdx];
    if (gateSelectedOption === currentQ.answer) setGateCorrectCount(prev => prev + 1);
    setGateConfirmed(true);
  };

  const handleNextGateQuestion = () => {
    const nextIdx = gateCurrentIdx + 1;
    setGateSelectedOption(null);
    setGateConfirmed(false);

    if (nextIdx >= 5) {
      const isSuccessful = gateCorrectCount === 5;
      const attempts = storage.getGateAttempts();
      const updatedAttempts = attempts.filter(a => a.chapterId !== gateChapter!.id);
      updatedAttempts.push({ chapterId: gateChapter!.id, date: new Date().toISOString(), score: gateCorrectCount, unlocked: isSuccessful });
      storage.setGateAttempts(updatedAttempts);

      if (isSuccessful) {
        gainXP(75);
        checkProgressionXP(gateChapter!.id);
      }
      setGateCompleted(true);
    } else {
      setGateCurrentIdx(nextIdx);
    }
  };

  const isGateAvailable = (chapterId: string) => {
    const attempts = storage.getGateAttempts();
    const lastAttempt = attempts.find(a => a.chapterId === chapterId);
    if (!lastAttempt) return true;
    if (lastAttempt.unlocked) return false;
    return (now - new Date(lastAttempt.date).getTime()) >= 24 * 60 * 60 * 1000;
  };

  const getGateCooldownHours = (chapterId: string) => {
    const attempts = storage.getGateAttempts();
    const lastAttempt = attempts.find(a => a.chapterId === chapterId);
    if (!lastAttempt) return 0;
    const remaining = 24 * 60 * 60 * 1000 - (now - new Date(lastAttempt.date).getTime());
    return Math.max(1, Math.ceil(remaining / (1000 * 60 * 60)));
  };

  const subjectColors: Record<string, string> = { physics: '#3b82f6', chemistry: '#10b981', math: '#f59e0b' };

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '32px' }}>
      <div className="mx-auto px-4 max-w-5xl" style={{ paddingTop: '64px' }}>

        {/* Hero Stats Banner */}
        <div style={styles.heroBanner} className="card">
          <div style={styles.heroStat}>
            <span style={styles.heroLabel}>Exam in</span>
            <span style={{ ...styles.heroValue, color: examCountdown.color }}>{examCountdown.days}<span style={styles.heroUnit}>d</span></span>
          </div>
          <div style={styles.heroDivider} />
          <div style={styles.heroStat}>
            <span style={styles.heroLabel}>Streak</span>
            <span style={{ ...styles.heroValue, color: 'var(--warning)' }}>{streak.current || 0}<span style={styles.heroUnit}>d</span></span>
          </div>
          <div style={styles.heroDivider} />
          <div style={styles.heroStat}>
            <span style={styles.heroLabel}>Concepts</span>
            <span style={styles.heroValue}>{conceptsLearnedCount}</span>
          </div>
          <div style={styles.heroDivider} />
          <div style={styles.heroStat}>
            <span style={styles.heroLabel}>This week</span>
            <span style={styles.heroValue}>{stats.thisWeekQuestions}<span style={styles.heroUnit}>q</span></span>
          </div>
          {stats.accuracy > 0 && (
            <>
              <div style={styles.heroDivider} />
              <div style={styles.heroStat}>
                <span style={styles.heroLabel}>Accuracy</span>
                <span style={{ ...styles.heroValue, color: stats.accuracy >= 70 ? 'var(--success)' : 'var(--warning)' }}>{stats.accuracy}%</span>
              </div>
            </>
          )}
        </div>

        {/* Alerts */}
        {(alerts.streakAtRisk || alerts.dueReviews > 0 || alerts.weeklyTestReady) && (
          <div style={{ marginBottom: '32px' }}>
            {alerts.streakAtRisk && (
              <div style={{ ...styles.alert, borderLeft: '2px solid var(--danger)' }}>
                <WarningIcon size={14} color="var(--danger)" />
                <span style={styles.alertText}><strong>Streak at risk.</strong> Practice today to keep it alive.</span>
                <button className="btn btn-secondary" style={styles.alertBtn} onClick={() => navigate('/study?subject=physics')}>Study</button>
              </div>
            )}
            {alerts.dueReviews > 0 && (
              <div style={{ ...styles.alert, borderLeft: '2px solid var(--warning)' }}>
                <RefreshIcon size={14} color="var(--warning)" />
                <span style={styles.alertText}><strong>{alerts.dueReviews} reviews due.</strong> Active recall keeps memories strong.</span>
                <button className="btn btn-secondary" style={styles.alertBtn} onClick={() => navigate('/study?mode=review')}>Review</button>
              </div>
            )}
            {alerts.weeklyTestReady && (
              <div style={{ ...styles.alert, borderLeft: '2px solid var(--accent)' }}>
                <NoteIcon size={14} color="var(--accent)" />
                <span style={styles.alertText}><strong>Weekly test ready.</strong> Test your understanding across concepts.</span>
                <button className="btn btn-primary" style={styles.alertBtn} onClick={() => navigate('/test')}>Start</button>
              </div>
            )}
          </div>
        )}

        {/* Daily Challenge */}
        <div style={{ marginBottom: '32px' }}>
          <DailyChallenge />
        </div>

        {/* Subject Tabs — Segmented Control */}
        <div style={styles.segmentedControl}>
          {['physics', 'chemistry', 'math'].map((sub) => (
            <button
              key={sub}
              style={{
                ...styles.segmentBtn,
                backgroundColor: activeTab === sub ? 'var(--accent)' : 'transparent',
                color: activeTab === sub ? '#fff' : 'var(--text-secondary)',
              }}
              onClick={() => setActiveTab(sub)}
            >
              {sub.charAt(0).toUpperCase() + sub.slice(1)}
            </button>
          ))}
        </div>

        {/* Chapter Grid */}
        <div style={styles.chapterGrid}>
          {subjectChapters.map((chapter: ChapterType & { percent: number; isLocked: boolean; diff: string; conceptsLearned: number; prevChapterName: string; completed: boolean; unlockedViaGate: boolean }, index: number) => (
            <motion.div
              key={chapter.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03, duration: 0.25 }}
              style={{
                ...styles.chapterCard,
                cursor: chapter.isLocked ? 'not-allowed' : 'pointer',
                opacity: chapter.isLocked ? 0.6 : 1,
              }}
              className="card"
              onClick={() => handleChapterClick(chapter)}
            >
              <div style={styles.chapterHeader}>
                <span style={styles.chapterIndex}>#{index + 1}</span>
                {chapter.completed ? (
                  <span style={{ ...styles.statusBadge, color: 'var(--success)', backgroundColor: 'var(--success-dim)' }}>
                    <CheckIcon size={10} /> Done
                  </span>
                ) : chapter.unlockedViaGate ? (
                  <span style={{ ...styles.statusBadge, color: 'var(--warning)', backgroundColor: 'var(--warning-dim)' }}>Gate</span>
                ) : (
                  <span style={{
                    ...styles.statusBadge,
                    color: chapter.diff === 'Beginner' ? 'var(--success)' : chapter.diff === 'Intermediate' ? 'var(--warning)' : 'var(--danger)',
                    backgroundColor: chapter.diff === 'Beginner' ? 'var(--success-dim)' : chapter.diff === 'Intermediate' ? 'var(--warning-dim)' : 'var(--danger-dim)'
                  }}>
                    {chapter.diff}
                  </span>
                )}
              </div>

              <h4 style={styles.chapterTitle}>{chapter.name}</h4>

              <div style={styles.progressBar}>
                <div style={{ ...styles.progressFill, width: `${chapter.percent}%`, backgroundColor: subjectColors[activeTab] }} />
              </div>

              <div style={styles.chapterMeta}>
                <span>{chapter.conceptsLearned} concepts</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{chapter.percent}%</span>
              </div>

              {chapter.isLocked && (
                    <div style={styles.lockOverlay}>
                      <div style={styles.lockContent}>
                        <div style={styles.lockIconCircle}>
                          <LockIcon size={14} color="var(--text-muted)" />
                        </div>
                        <span style={styles.lockTitle}>{chapter.name}</span>
                        <span style={styles.lockText}>Complete 25% of previous chapter to unlock</span>
                        {isGateAvailable(chapter.id) ? (
                          <button style={styles.gateBtn} onClick={(e) => { e.stopPropagation(); handleOpenGate(chapter); }}>Gate Unlock</button>
                        ) : (
                          <span style={styles.cooldownText}>Retry in {getGateCooldownHours(chapter.id)}h</span>
                        )}
                      </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Gate Modal */}
      <AnimatePresence>
        {gateChapter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={styles.backdrop}
            onClick={() => setGateChapter(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              style={styles.modal}
              className="card"
              onClick={(evt) => evt.stopPropagation()}
            >
              <div style={styles.modalHeader}>
                <div>
                  <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--warning)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Early Unlock Gate</span>
                  <h4 style={{ margin: '2px 0 0', fontSize: '16px' }}>{gateChapter.name}</h4>
                </div>
                <button style={styles.closeBtn} onClick={() => setGateChapter(null)}>×</button>
              </div>

              <div style={{ padding: '20px 24px' }}>
                {gateLoading && (
                  <div style={{ textAlign: 'center', padding: '32px 0' }}>
                    <div className="skeleton" style={{ width: '48px', height: '48px', borderRadius: '50%', margin: '0 auto 12px' }} />
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Generating questions...</span>
                  </div>
                )}

                {gateError && (
                  <div style={{ textAlign: 'center', padding: '24px 0' }}>
                    <p style={{ fontSize: '13px', color: 'var(--danger)', marginBottom: '12px' }}>{gateError}</p>
                    <button className="btn btn-secondary" onClick={() => setGateChapter(null)}>Close</button>
                  </div>
                )}

                {!gateLoading && !gateError && gateQuestions.length > 0 && !gateCompleted && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
                      <span>Q{gateCurrentIdx + 1} of 5</span>
                      <span>{gateCorrectCount} correct</span>
                    </div>

                    <div style={{ fontSize: '15px', lineHeight: '1.6', fontWeight: '500' }}>
                      {parseLaTeX(gateQuestions[gateCurrentIdx].question)}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {Object.entries(gateQuestions[gateCurrentIdx].options).map(([key, val]) => {
                        const isSelected = gateSelectedOption === key;
                        const isCorrect = gateQuestions[gateCurrentIdx].answer === key;
                        let btnStyle = { ...styles.gateOption };
                        if (isSelected) btnStyle = { ...btnStyle, borderColor: 'var(--accent)', backgroundColor: 'var(--accent-dim)' };
                        if (gateConfirmed && isCorrect) btnStyle = { ...btnStyle, borderColor: 'var(--success)', backgroundColor: 'var(--success-dim)' };
                        if (gateConfirmed && isSelected && !isCorrect) btnStyle = { ...btnStyle, borderColor: 'var(--danger)', backgroundColor: 'var(--danger-dim)' };

                        return (
                          <button key={key} style={btnStyle} disabled={gateConfirmed} onClick={() => setGateSelectedOption(key)}>
                            <span style={{
                              width: '24px', height: '24px', borderRadius: '6px',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '11px', fontWeight: '700', color: '#fff', flexShrink: 0,
                              backgroundColor: isSelected ? 'var(--accent)' : 'var(--bg-elevated)',
                              transition: 'background-color 0.15s'
                            }}>{key}</span>
                            <span style={{ fontSize: '13px', flex: 1 }}>{parseLaTeX(val)}</span>
                          </button>
                        );
                      })}
                    </div>

                    {gateConfirmed && (
                      <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)', fontSize: '13px', lineHeight: '1.5' }}>
                        <strong style={{ color: gateSelectedOption === gateQuestions[gateCurrentIdx].answer ? 'var(--success)' : 'var(--danger)' }}>
                          {gateSelectedOption === gateQuestions[gateCurrentIdx].answer ? 'Correct' : 'Incorrect'}
                        </strong>
                        <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)' }}>{parseLaTeX(gateQuestions[gateCurrentIdx].whyCorrect)}</p>
                      </div>
                    )}

                    <button
                      className="btn btn-primary w-full"
                      disabled={!gateSelectedOption}
                      onClick={!gateConfirmed ? handleConfirmGateAnswer : handleNextGateQuestion}
                    >
                      {!gateConfirmed ? 'Confirm' : gateCurrentIdx >= 4 ? 'Finish' : 'Next'}
                    </button>
                  </div>
                )}

                {gateCompleted && (
                  <div style={{ textAlign: 'center', padding: '24px 0' }}>
                    {gateCorrectCount === 5 ? (
                      <>
                        <h3 style={{ color: 'var(--success)', marginBottom: '8px' }}>Unlocked!</h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Perfect score. <strong>{gateChapter.name}</strong> is now available.</p>
                        <p style={{ color: 'var(--warning)', fontWeight: '700', marginTop: '8px' }}>+75 XP</p>
                      </>
                    ) : (
                      <>
                        <h3 style={{ color: 'var(--danger)', marginBottom: '8px' }}>{gateCorrectCount}/5 — Not enough</h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>All 5 correct required. Try again in 24 hours.</p>
                      </>
                    )}
                    <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => setGateChapter(null)}>Close</button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  heroBanner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0',
    padding: '20px 24px',
    marginBottom: '24px',
    flexWrap: 'wrap',
  },
  heroStat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    padding: '0 20px',
    flex: '1 1 auto',
    minWidth: '80px',
  },
  heroLabel: {
    fontSize: '10px',
    fontWeight: '600',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  heroValue: {
    fontSize: '24px',
    fontWeight: '800',
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-primary)',
    lineHeight: '1.1',
  },
  heroUnit: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-muted)',
    marginLeft: '1px',
  },
  heroDivider: {
    width: '1px',
    height: '32px',
    backgroundColor: 'var(--border-subtle)',
    flexShrink: 0,
  },
  alert: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    backgroundColor: 'var(--bg-card)',
    borderRadius: 'var(--radius-md)',
    marginBottom: '8px',
    border: '1px solid var(--border-subtle)',
  },
  alertText: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    flex: 1,
  },
  alertBtn: {
    padding: '5px 12px',
    fontSize: '11px',
    fontWeight: '600',
    flexShrink: 0,
  },
  segmentedControl: {
    display: 'flex',
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: 'var(--radius-md)',
    padding: '3px',
    marginBottom: '24px',
    border: '1px solid var(--border-subtle)',
  },
  segmentBtn: {
    flex: 1,
    padding: '8px 16px',
    borderRadius: 'var(--radius-sm)',
    border: 'none',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  chapterGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '12px',
  },
  chapterCard: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  },
  chapterHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chapterIndex: {
    fontSize: '11px',
    fontFamily: 'var(--font-mono)',
    fontWeight: '600',
    color: 'var(--text-muted)',
  },
  statusBadge: {
    fontSize: '10px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
  },
  chapterTitle: {
    fontSize: '15px',
    fontWeight: '700',
    margin: 0,
    lineHeight: '1.3',
  },
  progressBar: {
    width: '100%',
    height: '3px',
    backgroundColor: 'var(--bg-elevated)',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 0.5s ease-out',
  },
  chapterMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    color: 'var(--text-muted)',
    fontWeight: '500',
  },
  lockOverlay: {
    position: 'absolute',
    inset: '4px',
    backgroundColor: '#0c0c10',
    borderRadius: 'calc(var(--radius-lg) - 2px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
    border: '1px solid var(--border-subtle)',
  },
  lockContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    textAlign: 'center',
    padding: '8px 12px',
    width: '100%',
    height: '100%',
  },
  lockIconCircle: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: 'var(--bg-elevated)',
    border: '1px solid var(--border-default)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockTitle: {
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    lineHeight: '1.2',
  },
  lockText: {
    fontSize: '9px',
    fontWeight: '500',
    color: 'var(--text-muted)',
    lineHeight: '1.3',
    maxWidth: '180px',
  },
  gateBtn: {
    padding: '4px 10px',
    fontSize: '9px',
    fontWeight: '700',
    borderRadius: 'var(--radius-sm)',
    border: 'none',
    backgroundColor: 'var(--accent)',
    color: '#fff',
    cursor: 'pointer',
  },
  cooldownText: {
    fontSize: '8px',
    color: 'var(--text-muted)',
    fontWeight: '600',
    backgroundColor: 'var(--bg-elevated)',
    padding: '2px 6px',
    borderRadius: 'var(--radius-sm)',
  },
  backdrop: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 1000,
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    width: '90%',
    maxWidth: '440px',
    maxHeight: '85vh',
    overflowY: 'auto',
    borderRadius: 'var(--radius-xl)',
  },
  modalHeader: {
    padding: '16px 20px',
    borderBottom: '1px solid var(--border-subtle)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: '18px',
    cursor: 'pointer',
    lineHeight: 1,
  },
  gateOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    padding: '10px 12px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-default)',
    backgroundColor: 'transparent',
    color: 'var(--text-primary)',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
};
