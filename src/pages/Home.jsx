import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../components/UserContext';
import { storage } from '../utils/storage';
import { CHAPTERS } from '../data/chapters';
import { getDueReviews } from '../utils/spaceRepetition';
import DailyChallenge from '../components/DailyChallenge';
import { motion, AnimatePresence } from 'framer-motion';
import { WarningIcon, RefreshIcon, NoteIcon, LockIcon, CheckIcon, CrossIcon } from '../components/Icons';
import { generateGateQuestions } from '../utils/api';
import { parseLaTeX } from '../components/DailyChallenge';

export default function Home() {
  const navigate = useNavigate();
  const { streak, examDate, name, achievements, gainXP, checkProgressionXP } = useUser();
  const [activeTab, setActiveTab] = useState('physics');
  const [gateChapter, setGateChapter] = useState(null);
  const [gateLoading, setGateLoading] = useState(false);
  const [gateQuestions, setGateQuestions] = useState([]);
  const [gateCurrentIdx, setGateCurrentIdx] = useState(0);
  const [gateCorrectCount, setGateCorrectCount] = useState(0);
  const [gateSelectedOption, setGateSelectedOption] = useState(null);
  const [gateConfirmed, setGateConfirmed] = useState(false);
  const [gateError, setGateError] = useState(null);
  const [gateCompleted, setGateCompleted] = useState(false);

  const initials = useMemo(() => {
    if (!name) return 'A';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }, [name]);

  const examCountdown = useMemo(() => {
    if (!examDate) return { days: 0, color: 'var(--success)' };
    const diff = Math.ceil((new Date(examDate) - new Date()) / (1000 * 60 * 60 * 24));
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
      if (sDate >= startOfWeek) {
        thisWeekQuestions += s.attempted || 0;
      }
      correctQuestions += s.solvedClean || 0;
      attemptedQuestions += s.attempted || 0;
    });

    const accuracy = attemptedQuestions > 0 ? Math.round((correctQuestions / attemptedQuestions) * 100) : 80;

    return { thisWeekQuestions, accuracy };
  }, []);

  const conceptsLearnedCount = useMemo(() => {
    return storage.getConceptsLearned().length;
  }, []);

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
    const list = CHAPTERS[activeTab] || [];
    return list.map((chapter, idx) => {
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

        if (prevPercent < 25 && !unlockedViaGate) {
          isLocked = true;
        }
      }

      if (percent >= 100 && !chapterProg.completed) {
        storage.updateChapterProgress(chapter.id, { completed: true });
      }

      const third = Math.ceil(list.length / 3);
      let diff = 'Beginner';
      if (idx >= 2 * third) diff = 'Advanced';
      else if (idx >= third) diff = 'Intermediate';

      return {
        ...chapter,
        percent,
        isLocked,
        diff,
        conceptsLearned: unlockedCount,
        prevChapterName,
        completed: chapterProg.completed || percent >= 100,
        unlockedViaGate: storage.isChapterUnlockedViaGate(chapter.id)
      };
    });
  }, [activeTab]);

  const handleChapterClick = (chapter) => {
    if (chapter.isLocked) {
      showToast('Master at least 25% of the previous chapter to unlock!', 'warning');
      return;
    }
    navigate(`/study/${activeTab}/${chapter.id}`);
  };

  const handleOpenGate = async (chapter) => {
    setGateChapter(chapter);
    setGateLoading(true);
    setGateQuestions([]);
    setGateCurrentIdx(0);
    setGateCorrectCount(0);
    setGateSelectedOption(null);
    setGateConfirmed(false);
    setGateCompleted(false);
    setGateError(null);

    const list = CHAPTERS[activeTab] || [];
    const idx = list.findIndex(c => c.id === chapter.id);
    if (idx <= 0) {
      setGateError("Prerequisite chapter not found.");
      setGateLoading(false);
      return;
    }
    const prevChapter = list[idx - 1];

    try {
      const q = await generateGateQuestions(prevChapter.name, chapter.name);
      if (q && q.questions && q.questions.length === 5) {
        setGateQuestions(q.questions);
      } else {
        throw new Error("Invalid question format returned.");
      }
    } catch (e) {
      console.error(e);
      setGateError("Failed to generate prerequisite questions. Please check connection and try again.");
    } finally {
      setGateLoading(false);
    }
  };

  const handleConfirmGateAnswer = () => {
    if (!gateSelectedOption || gateConfirmed) return;
    const currentQ = gateQuestions[gateCurrentIdx];
    const isCorrect = gateSelectedOption === currentQ.answer;
    if (isCorrect) {
      setGateCorrectCount(prev => prev + 1);
    }
    setGateConfirmed(true);
  };

  const handleNextGateQuestion = () => {
    const nextIdx = gateCurrentIdx + 1;
    setGateSelectedOption(null);
    setGateConfirmed(false);

    if (nextIdx >= 5) {
      const isSuccessful = gateCorrectCount === 5;
      const attempts = storage.getGateAttempts();
      const updatedAttempts = attempts.filter(a => a.chapterId !== gateChapter.id);
      updatedAttempts.push({
        chapterId: gateChapter.id,
        date: new Date().toISOString(),
        score: gateCorrectCount,
        unlocked: isSuccessful
      });
      storage.setGateAttempts(updatedAttempts);

      if (isSuccessful) {
        gainXP(75);
        checkProgressionXP(gateChapter.id);
      }

      setGateCompleted(true);
    } else {
      setGateCurrentIdx(nextIdx);
    }
  };

  const isGateAvailable = (chapterId) => {
    const attempts = storage.getGateAttempts();
    const lastAttempt = attempts.find(a => a.chapterId === chapterId);
    if (!lastAttempt) return true;
    if (lastAttempt.unlocked) return false;
    const diff = Date.now() - new Date(lastAttempt.date).getTime();
    return diff >= 24 * 60 * 60 * 1000;
  };

  const getGateCooldownHours = (chapterId) => {
    const attempts = storage.getGateAttempts();
    const lastAttempt = attempts.find(a => a.chapterId === chapterId);
    if (!lastAttempt) return 0;
    const diff = Date.now() - new Date(lastAttempt.date).getTime();
    const remaining = 24 * 60 * 60 * 1000 - diff;
    return Math.max(1, Math.ceil(remaining / (1000 * 60 * 60)));
  };

  return (
    <div style={styles.page}>
      <div className="mx-auto p-6 max-w-5xl" style={styles.content}>

        {/* Hero Stats Row */}
        <div style={styles.statsRow}>
          <div style={styles.statCard} className="card">
            <span style={styles.statLabel}>Days to Exam</span>
            <span style={{ ...styles.statNum, color: examCountdown.color }}>
              {examCountdown.days}
            </span>
            <span style={styles.statSubText}>Target Exam Date</span>
          </div>

          <div style={styles.statCard} className="card">
            <span style={styles.statLabel}>Concepts Mastered</span>
            <span style={styles.statNum}>{conceptsLearnedCount}</span>
            <span style={styles.statSubText}>Active memory retention</span>
          </div>

          <div style={styles.statCard} className="card">
            <span style={styles.statLabel}>Weekly Solves</span>
            <span style={styles.statNum}>{stats.thisWeekQuestions}</span>
            <span style={styles.statSubText}>Solved questions this week</span>
          </div>

          <div style={styles.statCard} className="card">
            <span style={styles.statLabel}>Weekly Accuracy</span>
            <span style={styles.statNum}>{stats.accuracy}%</span>
            <span style={styles.statSubText}>Correct choice ratios</span>
          </div>
        </div>

        {/* Alerts Section */}
        <div style={styles.alertsContainer}>
          {alerts.streakAtRisk && (
            <div style={{ ...styles.alertCard, borderLeft: '3px solid var(--danger)', backgroundColor: 'rgba(239, 68, 68, 0.06)' }} className="card">
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <WarningIcon size={16} color="var(--danger)" style={{ marginRight: '6px' }} />
                <span><strong>Streak at Risk!</strong> You haven't practiced today and it is past 6:00 PM.</span>
              </span>
              <button className="btn btn-secondary" style={styles.alertBtnSec} onClick={() => navigate(`/study?subject=${activeTab}`)}>
                Study Now
              </button>
            </div>
          )}

          {alerts.dueReviews > 0 && (
            <div style={{ ...styles.alertCard, borderLeft: '3px solid var(--warning)', backgroundColor: 'rgba(245, 158, 11, 0.06)' }} className="card">
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <RefreshIcon size={16} color="var(--warning)" style={{ marginRight: '6px' }} />
                <span><strong>Spaced Reviews Due:</strong> {alerts.dueReviews} concept{alerts.dueReviews > 1 ? 's are' : ' is'} due for active recall training.</span>
              </span>
              <button className="btn btn-secondary" style={styles.alertBtnSec} onClick={() => navigate('/study?mode=review')}>
                Start Reviews
              </button>
            </div>
          )}

          {alerts.weeklyTestReady && (
            <div style={{ ...styles.alertCard, borderLeft: '3px solid var(--accent)', backgroundColor: 'rgba(99, 102, 241, 0.06)' }} className="card">
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <NoteIcon size={16} color="var(--accent)" style={{ marginRight: '6px' }} />
                <span><strong>Weekly Test Ready:</strong> Test your understanding across all concepts studied this week.</span>
              </span>
              <button className="btn btn-primary" style={styles.alertBtn} onClick={() => navigate('/test')}>
                Start Test
              </button>
            </div>
          )}
        </div>

        {/* Daily Challenge Card */}
        <DailyChallenge />

        {/* Subject Tabs */}
        <div style={styles.tabsRow}>
          <div style={styles.tabsContainer}>
            {['physics', 'chemistry', 'math'].map((sub) => {
              const isActive = activeTab === sub;
              return (
                <button
                  key={sub}
                  style={styles.tabBtn}
                  onClick={() => setActiveTab(sub)}
                >
                  <span style={{
                    ...styles.tabText,
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)'
                  }}>
                    {sub.toUpperCase()}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="slidingUnderline"
                      style={styles.slidingUnderline}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Chapter Grid */}
        <div style={styles.chaptersGrid}>
          {subjectChapters.map((chapter, index) => {
            const subjectColor = getSubjectColor(activeTab);

            return (
              <motion.div
                key={chapter.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                style={{
                  ...styles.chapterCard,
                  ...(chapter.isLocked ? styles.lockedCard : {})
                }}
                className="card"
                onClick={() => handleChapterClick(chapter)}
              >
                <div style={styles.chapterCardHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={styles.chapterNumber}>Chapter {index + 1}</span>
                    {chapter.unlockedViaGate && (
                      <span style={{
                        ...styles.difficultyBadge,
                        color: '#f59e0b',
                        backgroundColor: 'rgba(245, 158, 11, 0.15)',
                        fontSize: '9px',
                        fontWeight: '700',
                        padding: '1px 6px'
                      }}>
                        Gate Unlocked
                      </span>
                    )}
                  </div>
                  {chapter.completed ? (
                    <span style={{
                      ...styles.difficultyBadge,
                      color: 'var(--success)',
                      backgroundColor: 'rgba(16, 185, 129, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '10px',
                      fontWeight: '700'
                    }}>
                      <span>Completed</span>
                    </span>
                  ) : (
                    <span style={{
                      ...styles.difficultyBadge,
                      color: getDifficultyColor(chapter.diff),
                      backgroundColor: `${getDifficultyColor(chapter.diff)}22`
                    }}>
                      {chapter.diff}
                    </span>
                  )}
                </div>

                <h4 style={styles.chapterTitle}>{chapter.name}</h4>

                <div style={styles.chapterProgressRow}>
                  <div style={styles.progressRingWrapper}>
                    <svg width="40" height="40" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="var(--bg-elevated)"
                        strokeWidth="2.5"
                      />
                      <motion.path
                        initial={{ strokeDasharray: '0, 100' }}
                        animate={{ strokeDasharray: `${chapter.percent}, 100` }}
                        transition={{ duration: 0.8, delay: index * 0.05 }}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke={subjectColor}
                        strokeWidth="2.5"
                        strokeDasharray={`${chapter.percent}, 100`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span style={styles.progressRingText}>{chapter.percent}%</span>
                  </div>

                  <div style={styles.progressTextCol}>
                    <span style={styles.conceptsUnlockedText}>
                      {chapter.conceptsLearned} concepts mastered
                    </span>
                    <span style={styles.subtopicsCountText}>
                      {chapter.subtopics?.length || 0} subtopics
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: '8px', width: '100%' }}>
                  <div style={styles.horizontalProgressBarBg}>
                    <div
                      style={{
                        ...styles.horizontalProgressBarFiller,
                        width: `${chapter.percent}%`,
                        backgroundColor: subjectColor
                      }}
                    />
                  </div>
                </div>

                {chapter.isLocked && (
                  <div style={styles.lockOverlay} onClick={(e) => e.stopPropagation()}>
                    <div style={styles.lockContent}>
                      <div style={styles.lockIconContainer}>
                        <LockIcon size={18} color="var(--text-secondary)" />
                      </div>
                      <span style={styles.lockText}>Unlock at 25% of {chapter.prevChapterName}</span>
                      {isGateAvailable(chapter.id) ? (
                        <button
                          className="btn btn-primary"
                          style={styles.unlockEarlyBtn}
                          onClick={() => handleOpenGate(chapter)}
                        >
                          Unlock Early
                        </button>
                      ) : (
                        <span style={styles.cooldownText}>Retry Gate in {getGateCooldownHours(chapter.id)}h</span>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

      </div>

      {/* Early Chapter Unlock Gate Modal */}
      <AnimatePresence>
        {gateChapter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={gateStyles.backdrop}
            onClick={() => setGateChapter(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={gateStyles.modal}
              className="glass"
              onClick={(e) => e.stopPropagation()}
            >
              <div style={gateStyles.modalHeader}>
                <div>
                  <span style={gateStyles.challengeBadge}>EARLY UNLOCK GATE</span>
                  <h4 style={{ margin: '4px 0 0 0' }}>Unlock: {gateChapter.name}</h4>
                </div>
                <button style={gateStyles.closeBtn} onClick={() => setGateChapter(null)}>x</button>
              </div>

              <div style={gateStyles.modalContent}>
                {gateLoading && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '40px 0' }}>
                    <div className="skeleton" style={{ width: '80px', height: '80px', borderRadius: '50%' }} />
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Generating 5 prerequisite questions from previous chapter...</span>
                  </div>
                )}

                {gateError && (
                  <div style={{ color: 'var(--danger)', textAlign: 'center', padding: '20px 0' }}>
                    <WarningIcon size={32} color="var(--danger)" style={{ marginBottom: '12px' }} />
                    <p style={{ fontSize: '14px', fontWeight: 'bold' }}>{gateError}</p>
                    <button className="btn btn-secondary" style={{ marginTop: '16px' }} onClick={() => setGateChapter(null)}>Close</button>
                  </div>
                )}

                {!gateLoading && !gateError && gateQuestions.length > 0 && !gateCompleted && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <span>Question {gateCurrentIdx + 1} of 5</span>
                      <span>{gateCorrectCount} correct so far</span>
                    </div>

                    <div style={gateStyles.questionText}>
                      {parseLaTeX(gateQuestions[gateCurrentIdx].question)}
                    </div>

                    <div style={gateStyles.optionsList}>
                      {Object.entries(gateQuestions[gateCurrentIdx].options).map(([key, val]) => {
                        const isSelected = gateSelectedOption === key;
                        const isCorrect = gateQuestions[gateCurrentIdx].answer === key;

                        let optionStyle = { ...gateStyles.optionBtn };
                        if (isSelected) optionStyle = { ...optionStyle, ...gateStyles.optionSelected };
                        if (gateConfirmed) {
                          if (isCorrect) optionStyle = { ...optionStyle, ...gateStyles.optionCorrect };
                          else if (isSelected) optionStyle = { ...optionStyle, ...gateStyles.optionWrong };
                        }

                        return (
                          <button
                            key={key}
                            style={optionStyle}
                            disabled={gateConfirmed}
                            onClick={() => setGateSelectedOption(key)}
                          >
                            <span style={{
                              ...gateStyles.optionBadge,
                              backgroundColor: isSelected ? 'var(--accent)' : 'var(--bg-elevated)'
                            }}>{key}</span>
                            <span style={gateStyles.optionVal}>{parseLaTeX(val)}</span>
                          </button>
                        );
                      })}
                    </div>

                    {gateConfirmed && (
                      <div style={gateStyles.explanationSection} className="card">
                        <h5 style={{
                          color: gateSelectedOption === gateQuestions[gateCurrentIdx].answer ? 'var(--success)' : 'var(--danger)',
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '14px'
                        }}>
                          {gateSelectedOption === gateQuestions[gateCurrentIdx].answer ? (
                            <>
                              <CheckIcon size={16} />
                              <span>Correct!</span>
                            </>
                          ) : (
                            <>
                              <CrossIcon size={16} />
                              <span>Incorrect</span>
                            </>
                          )}
                        </h5>
                        <p style={{ fontSize: '13px', color: 'var(--text-primary)', margin: 0 }}>
                          <strong>Explanation:</strong> {parseLaTeX(gateQuestions[gateCurrentIdx].whyCorrect)}
                        </p>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                      {!gateConfirmed ? (
                        <button
                          className="btn btn-primary w-full"
                          disabled={!gateSelectedOption}
                          onClick={handleConfirmGateAnswer}
                        >
                          Confirm Answer
                        </button>
                      ) : (
                        <button
                          className="btn btn-primary w-full"
                          onClick={handleNextGateQuestion}
                        >
                          {gateCurrentIdx >= 4 ? 'Finish challenge' : 'Next Question'}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {gateCompleted && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px', padding: '20px 0' }}>
                    {gateCorrectCount === 5 ? (
                      <>
                        <h2 style={{ color: 'var(--success)', fontSize: '28px', margin: 0 }}>Challenge Cleared!</h2>
                        <p style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                          Perfect score! You got <strong>5/5</strong> correct. <strong>{gateChapter.name}</strong> is now unlocked early!
                        </p>
                        <span style={{ color: 'var(--warning)', fontWeight: 'bold' }}>+75 XP Awarded!</span>
                      </>
                    ) : (
                      <>
                        <h2 style={{ color: 'var(--danger)', fontSize: '24px', margin: 0 }}>Almost there!</h2>
                        <p style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                          You got <strong>{gateCorrectCount}/5</strong> correct. You must answer all 5 correctly to unlock early.
                        </p>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          Review the previous chapter and try again in 24 hours.
                        </p>
                      </>
                    )}
                    <button className="btn btn-primary" style={{ minWidth: '120px', marginTop: '12px' }} onClick={() => setGateChapter(null)}>
                      Close Gate
                    </button>
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

function getSubjectColor(subject) {
  if (subject === 'physics') return '#3b82f6';
  if (subject === 'chemistry') return '#10b981';
  return '#f59e0b';
}

function getDifficultyColor(diff) {
  if (diff === 'Beginner') return 'var(--success)';
  if (diff === 'Intermediate') return 'var(--warning)';
  return 'var(--danger)';
}

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: 'var(--bg-primary)',
    position: 'relative'
  },
  content: {
    paddingTop: '88px',
    paddingBottom: '32px'
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
    overflowX: 'auto',
    whiteSpace: 'nowrap'
  },
  statCard: {
    backgroundColor: 'rgba(6, 10, 20, 0.5)',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid var(--border-subtle)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    transition: 'all 0.25s ease'
  },
  statLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  statNum: {
    fontSize: '20px',
    fontWeight: '700',
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-primary)'
  },
  statSubText: {
    fontSize: '11px',
    color: 'var(--text-muted)'
  },
  alertsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '24px'
  },
  alertCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px !important',
    fontSize: '13px',
    flexWrap: 'wrap',
    gap: '12px'
  },
  alertBtn: {
    padding: '6px 14px',
    fontSize: '12px'
  },
  alertBtnSec: {
    padding: '6px 14px',
    fontSize: '12px',
    borderColor: 'var(--warning)',
    color: 'var(--warning)',
    backgroundColor: 'transparent'
  },
  tabsRow: {
    borderBottom: '1px solid var(--border-subtle)',
    marginBottom: '24px'
  },
  tabsContainer: {
    display: 'flex',
    gap: '32px'
  },
  tabBtn: {
    position: 'relative',
    padding: '10px 20px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  tabText: {
    fontSize: '14px',
    fontWeight: '700',
    letterSpacing: '0.5px'
  },
  slidingUnderline: {
    position: 'absolute',
    bottom: '0',
    left: '10%',
    right: '10%',
    height: '2px',
    background: 'var(--accent)',
    borderRadius: '2px 2px 0 0'
  },
  chaptersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px'
  },
  chapterCard: {
    cursor: 'pointer',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    minHeight: '160px',
    position: 'relative',
    overflow: 'hidden'
  },
  chapterCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  chapterNumber: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    fontWeight: '600',
    fontFamily: 'var(--font-mono)'
  },
  difficultyBadge: {
    fontSize: '10px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '6px'
  },
  chapterTitle: {
    fontSize: '16px',
    fontWeight: '700',
    lineHeight: '1.4',
    margin: 0
  },
  chapterProgressRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  progressRingWrapper: {
    position: 'relative',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  progressRingText: {
    position: 'absolute',
    fontSize: '9px',
    fontWeight: '700',
    fontFamily: 'var(--font-mono)'
  },
  progressTextCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  conceptsUnlockedText: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-primary)'
  },
  subtopicsCountText: {
    fontSize: '11px',
    color: 'var(--text-muted)'
  },
  lockedCard: {
    cursor: 'not-allowed'
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(8, 11, 20, 0.7)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10
  },
  lockIconContainer: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '4px'
  },
  lockContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    textAlign: 'center',
    padding: '12px'
  },
  lockText: {
    fontSize: '11px',
    fontWeight: '600',
    color: 'var(--text-secondary)'
  },
  unlockEarlyBtn: {
    padding: '6px 12px',
    fontSize: '11px',
    fontWeight: '700',
    borderRadius: '8px',
    marginTop: '4px',
    cursor: 'pointer',
    backgroundColor: 'var(--accent)',
    color: '#030508',
    border: 'none'
  },
  cooldownText: {
    fontSize: '10px',
    color: 'var(--text-muted)',
    fontWeight: '600',
    backgroundColor: 'var(--bg-elevated)',
    padding: '4px 8px',
    borderRadius: '8px'
  },
  horizontalProgressBarBg: {
    width: '100%',
    height: '4px',
    backgroundColor: 'var(--bg-elevated)',
    borderRadius: '2px',
    overflow: 'hidden'
  },
  horizontalProgressBarFiller: {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 0.5s ease-out'
  }
};

const gateStyles = {
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(8, 11, 20, 0.75)',
    zIndex: 1000,
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modal: {
    zIndex: 1001,
    width: '90%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflowY: 'auto',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.4)',
    border: '1px solid var(--border-subtle)',
    position: 'relative'
  },
  modalHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid var(--border-subtle)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  challengeBadge: {
    color: 'var(--warning)',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '1px'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    fontSize: '18px',
    cursor: 'pointer'
  },
  modalContent: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    overflowY: 'auto'
  },
  questionText: {
    fontFamily: 'var(--font-sans)',
    fontSize: '15px',
    lineHeight: '1.6',
    fontWeight: '500',
    color: 'var(--text-primary)'
  },
  optionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  optionBtn: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid var(--border-default)',
    backgroundColor: 'transparent',
    color: 'var(--text-primary)',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.15s'
  },
  optionSelected: {
    borderColor: 'var(--accent)',
    backgroundColor: 'rgba(99, 102, 241, 0.08)'
  },
  optionCorrect: {
    borderColor: 'var(--success)',
    backgroundColor: 'rgba(16, 185, 129, 0.08)'
  },
  optionWrong: {
    borderColor: 'var(--danger)',
    backgroundColor: 'rgba(239, 68, 68, 0.08)'
  },
  optionBadge: {
    width: '26px',
    height: '26px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    marginRight: '12px',
    fontSize: '11px',
    color: '#ffffff'
  },
  optionVal: {
    fontSize: '13px',
    fontWeight: '400',
    flex: 1
  },
  explanationSection: {
    padding: '12px !important',
    backgroundColor: 'var(--bg-secondary)',
    marginTop: '8px'
  }
};
