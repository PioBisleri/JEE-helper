import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../utils/storage';
import { CHAPTERS } from '../data/chapters';
import { generateDailyChallengeQuestion } from '../utils/api';
import { parseLaTeX } from '../components/DailyChallenge';
import { useToast } from '../components/ToastContext';
import { useUser } from '../components/UserContext';
import { SkeletonQuestion } from '../components/LoadingSkeleton';
import {
  CheckIcon,
  CrossIcon,
  ClockIcon,
  TrophyIcon,
  BookIcon,
  StatsIcon,
  WarningIcon,
  ArrowRightIcon
} from '../components/Icons';

export default function DailyChallengePage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { gainXP } = useUser();

  // Cooldown & Streak check
  const [challengeHistory, setChallengeHistory] = useState([]);
  const [alreadyCompletedToday, setAlreadyCompletedToday] = useState(false);
  const [completedChallengeData, setCompletedChallengeData] = useState(null);
  const [streakCount, setStreakCount] = useState(0);

  // Time states
  const [timeLeftToMidnight, setTimeLeftToMidnight] = useState('');

  // Active Session states
  const [gameState, setGameState] = useState('landing'); // landing, loading_blueprints, playing, summary
  const [timer, setTimer] = useState(0);
  const timerIntervalRef = useRef(null);

  // Challenge questions queue
  const [blueprints, setBlueprints] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [loadingQuestion, setLoadingQuestion] = useState(false);

  // Answering states
  const [selectedOption, setSelectedOption] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // User session answers log
  const [userAnswers, setUserAnswers] = useState([]); // array of { blueprint, question, chosen, correct, timeSpent }
  const questionStartTimeRef = useRef(null);

  // Streak calculation dynamic helper
  const calculateStreak = (history) => {
    if (!history || history.length === 0) return 0;
    
    // Unique days sorted descending
    const dates = history.map(h => new Date(h.date).toDateString());
    const uniqueDates = [...new Set(dates)].map(d => new Date(d));
    uniqueDates.sort((a, b) => b - a);

    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    const lastDate = uniqueDates[0] ? uniqueDates[0].toDateString() : null;
    if (lastDate !== today && lastDate !== yesterday) {
      return 0;
    }

    let streak = 0;
    let checkDate = new Date(uniqueDates[0]);
    const uniqueSet = new Set(dates);

    while (uniqueSet.has(checkDate.toDateString())) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
    return streak;
  };

  // Cooldown countdown to midnight
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0); // Next midnight
      const diff = midnight.getTime() - now.getTime();

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeftToMidnight(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Check state on mount
  useEffect(() => {
    const history = storage.getDailyChallengeHistory() || [];
    setChallengeHistory(history);

    const streak = calculateStreak(history);
    setStreakCount(streak);

    const todayStr = new Date().toDateString();
    const todayAttempt = history.find(h => new Date(h.date).toDateString() === todayStr);

    if (todayAttempt) {
      setAlreadyCompletedToday(true);
      setCompletedChallengeData(todayAttempt);
      setGameState('summary');
    }
  }, []);

  // Timer logic for active session
  useEffect(() => {
    if (gameState === 'playing') {
      timerIntervalRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [gameState]);

  // Generate 30 Question Blueprints
  const generateBlueprints = () => {
    setGameState('loading_blueprints');
    
    // 1. Get learned concepts and mistakes
    const conceptsLearned = storage.getConceptsLearned();
    const mistakes = storage.getMistakes();
    const now = new Date();

    const getConceptScore = (concept) => {
      let score = 1;
      const learned = conceptsLearned.find(c => c.concept === concept);
      if (learned) {
        // Due for review
        if (new Date(learned.nextReview) <= now) {
          score += 5;
        }
      } else {
        // Not learned yet but chapter is active
        score += 1;
      }
      // Mistakes weight
      const mistakeCount = mistakes.filter(m => m.concept === concept).length;
      score += mistakeCount * 2;
      return score;
    };

    // 2. Select 10 questions per subject: Physics, Chemistry, Math
    // Target distributions:
    // Phys: 3 Easy, 4 Med, 3 Hard
    // Chem: 3 Easy, 4 Med, 3 Hard
    // Math: 2 Easy, 4 Med, 4 Hard
    // Total: 8 Easy, 12 Medium, 10 Hard
    const distributions = {
      physics: { easy: 3, medium: 4, hard: 3 },
      chemistry: { easy: 3, medium: 4, hard: 3 },
      math: { easy: 2, medium: 4, hard: 4 }
    };

    const finalBlueprints = [];

    Object.keys(distributions).forEach(subject => {
      const subjectChapters = CHAPTERS[subject] || [];
      
      // Determine studied chapters
      let studiedChapterIds = subjectChapters
        .filter(ch => storage.getChapterProgress(ch.id).conceptsUnlocked.length > 0)
        .map(ch => ch.id);
      
      // Fallback if none studied: use first 2 chapters
      if (studiedChapterIds.length === 0) {
        studiedChapterIds = subjectChapters.slice(0, 2).map(ch => ch.id);
      }

      // Gather concepts in studied chapters with scores
      const candidateConcepts = [];
      subjectChapters.forEach(ch => {
        if (studiedChapterIds.includes(ch.id)) {
          ch.difficulty_curve.forEach(concept => {
            candidateConcepts.push({
              concept,
              chapterId: ch.id,
              chapterName: ch.name,
              score: getConceptScore(concept)
            });
          });
        }
      });

      // Sort candidate concepts by score descending
      candidateConcepts.sort((a, b) => b.score - a.score);

      // Select concepts for Easy, Medium, Hard slots
      const selectForDifficulty = (diffLabel, count) => {
        const selected = [];
        // Take candidates, cycle through if not enough
        let idx = 0;
        while (selected.length < count && candidateConcepts.length > 0) {
          const cand = candidateConcepts[idx % candidateConcepts.length];
          selected.push({
            subject,
            chapterId: cand.chapterId,
            chapterName: cand.chapterName,
            concept: cand.concept,
            difficulty: diffLabel
          });
          idx++;
        }
        return selected;
      };

      const subDist = distributions[subject];
      finalBlueprints.push(...selectForDifficulty('easy', subDist.easy));
      finalBlueprints.push(...selectForDifficulty('medium', subDist.medium));
      finalBlueprints.push(...selectForDifficulty('hard', subDist.hard));
    });

    // Shuffle blueprints to mix subjects and difficulties
    const shuffled = finalBlueprints.sort(() => Math.random() - 0.5);
    setBlueprints(shuffled);
    setCurrentIdx(0);
    setUserAnswers([]);
    setTimer(0);
    setGameState('playing');
    loadQuestion(shuffled[0]);
  };

  // Load a single question from blueprint using OpenRouter API
  const loadQuestion = async (blueprint) => {
    setLoadingQuestion(true);
    setSelectedOption(null);
    setConfirmed(false);
    setIsCorrect(false);
    
    try {
      const q = await generateDailyChallengeQuestion(blueprint.chapterName, blueprint.concept, blueprint.difficulty);
      setCurrentQuestion(q);
      questionStartTimeRef.current = Date.now();
    } catch (e) {
      console.error(e);
      showToast('Error generating challenge question. Retrying...', 'error');
      // Retry once after 2 seconds
      setTimeout(() => loadQuestion(blueprint), 2000);
    } finally {
      setLoadingQuestion(false);
    }
  };

  const handleConfirmAnswer = () => {
    if (!selectedOption || confirmed) return;

    const correct = selectedOption === currentQuestion.answer;
    setIsCorrect(correct);
    setConfirmed(true);

    const timeSpent = Math.round((Date.now() - questionStartTimeRef.current) / 1000);
    const blueprint = blueprints[currentIdx];

    // Log answer locally
    const answerLog = {
      blueprint,
      question: currentQuestion,
      chosen: selectedOption,
      correct,
      timeSpent
    };

    setUserAnswers(prev => [...prev, answerLog]);

    // Save mistake if incorrect
    if (!correct) {
      storage.addMistake({
        concept: blueprint.concept,
        chapter: blueprint.chapterId,
        question: currentQuestion.question,
        selectedOption: selectedOption,
        answer: currentQuestion.answer,
        whyCorrect: currentQuestion.whyCorrect
      });
      showToast('Incorrect answer logged to weak spots.', 'error');
    } else {
      showToast('Correct answer! +20 XP', 'success');
      gainXP(20); // +20 XP per correct response
    }
  };

  const handleNextQuestion = () => {
    const nextIdx = currentIdx + 1;
    if (nextIdx >= blueprints.length) {
      // End of Daily Challenge
      completeChallenge();
    } else {
      setCurrentIdx(nextIdx);
      loadQuestion(blueprints[nextIdx]);
    }
  };

  const completeChallenge = () => {
    // 1. Calculate Score details
    const correctCount = userAnswers.filter(a => a.correct).length;
    const totalCount = blueprints.length;

    // 2. Save test history record in storage (stats-compatible)
    const weeklyData = storage.getWeeklyData();
    weeklyData.testHistory.push({
      date: new Date().toISOString(),
      score: correctCount,
      total: totalCount,
      subject: "Daily Challenge",
      challengeMode: true
    });
    
    // Flag weak concepts
    const wrongConcepts = [...new Set(userAnswers.filter(a => !a.correct).map(a => a.blueprint.concept))];
    weeklyData.currentWeekConcepts = [...new Set([...(weeklyData.currentWeekConcepts || []), ...wrongConcepts])];
    storage.setWeeklyData(weeklyData);

    // 3. Compile Challenge report
    const reportData = {
      date: new Date().toISOString(),
      score: correctCount,
      total: totalCount,
      timer: timer,
      answers: userAnswers
    };

    // Save to challenge history
    const history = storage.getDailyChallengeHistory() || [];
    const updatedHistory = [...history, reportData];
    storage.setDailyChallengeHistory(updatedHistory);
    
    // Update state
    setStreakCount(calculateStreak(updatedHistory));
    setCompletedChallengeData(reportData);
    setAlreadyCompletedToday(true);
    setGameState('summary');
    showToast('Daily Challenge Completed! Graph data updated.', 'success');
  };

  // Compile summary statistics
  const summaryStats = useMemo(() => {
    const data = completedChallengeData || { score: 0, total: 30, timer: 0, answers: [] };
    const correct = data.score;
    const total = data.total;
    
    let grade = 'D';
    if (correct >= 27) grade = 'S';
    else if (correct >= 24) grade = 'A';
    else if (correct >= 20) grade = 'B';
    else if (correct >= 15) grade = 'C';

    const answers = data.answers || [];
    
    // Subject breakdowns
    const subjects = { physics: { attempted: 0, correct: 0 }, chemistry: { attempted: 0, correct: 0 }, math: { attempted: 0, correct: 0 } };
    const difficulties = { easy: { attempted: 0, correct: 0 }, medium: { attempted: 0, correct: 0 }, hard: { attempted: 0, correct: 0 } };

    answers.forEach(ans => {
      const sub = ans.blueprint.subject;
      const diff = ans.blueprint.difficulty;

      if (subjects[sub]) {
        subjects[sub].attempted++;
        if (ans.correct) subjects[sub].correct++;
      }

      if (difficulties[diff]) {
        difficulties[diff].attempted++;
        if (ans.correct) difficulties[diff].correct++;
      }
    });

    const getAccuracy = (obj) => {
      return obj.attempted > 0 ? Math.round((obj.correct / obj.attempted) * 100) : 0;
    };

    return {
      score: correct,
      total: total,
      grade,
      timer: data.timer,
      subjects: {
        physics: getAccuracy(subjects.physics),
        chemistry: getAccuracy(subjects.chemistry),
        math: getAccuracy(subjects.math)
      },
      difficulties: {
        easy: getAccuracy(difficulties.easy),
        medium: getAccuracy(difficulties.medium),
        hard: getAccuracy(difficulties.hard)
      },
      wrongConcepts: answers.filter(a => !a.correct).map(a => a.blueprint.concept)
    };
  }, [completedChallengeData]);

  // Format timer
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`;
  };

  return (
    <div style={styles.page}>
      <div className="mx-auto p-6 max-w-2xl" style={styles.content}>
        
        {/* Landing Screen */}
        {gameState === 'landing' && (
          <div className="card text-center" style={styles.centerCard}>
            <TrophyIcon size={52} color="var(--warning)" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 8px 0' }}>Daily Core Challenge</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: '0 0 24px 0' }}>
              Test your comprehensive preparation. Face 30 curated questions across studied subjects: 8 easy, 12 medium, and 10 hard.
            </p>
            
            <div style={styles.rulesList}>
              <div style={styles.ruleItem}>
                <ClockIcon size={14} color="var(--accent)" />
                <span>Timer keeps ticking — speed & accuracy both count!</span>
              </div>
              <div style={styles.ruleItem}>
                <WarningIcon size={14} color="var(--warning)" />
                <span>Strict Challenge rules: No Hints or Scaffolding solutions allowed.</span>
              </div>
              <div style={styles.ruleItem}>
                <BookIcon size={14} color="var(--success)" />
                <span>Wrong concepts automatically log in your recall review deck.</span>
              </div>
            </div>

            <div style={styles.streakBadgeLarge} className="glass">
              Current Challenge Streak: <strong>{streakCount} Days</strong>
            </div>

            {alreadyCompletedToday ? (
              <div style={{ marginTop: '20px' }}>
                <div style={styles.cooldownAlert} className="glass">
                  <span>You've completed today's challenge! Next lock unlocks in:</span>
                  <strong style={styles.cooldownCountdown}>{timeLeftToMidnight}</strong>
                </div>
                <button 
                  className="btn btn-secondary w-full" 
                  style={{ marginTop: '16px' }}
                  onClick={() => setGameState('summary')}
                >
                  View Today's Diagnostic Report
                </button>
              </div>
            ) : (
              <button 
                className="btn btn-primary w-full" 
                style={{ height: '48px', fontSize: '15px', fontWeight: '700', borderRadius: '14px', marginTop: '20px' }}
                onClick={generateBlueprints}
              >
                Start Today's Challenge
              </button>
            )}
          </div>
        )}

        {/* Loading Screen */}
        {gameState === 'loading_blueprints' && (
          <div className="card text-center" style={styles.centerCard}>
            <div style={styles.loaderSpinner} />
            <h4 style={{ margin: '16px 0 6px 0' }}>Constructing Mock Challenge</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Curating questions from weak concepts and exam curriculum...</p>
          </div>
        )}

        {/* Playing Screen */}
        {gameState === 'playing' && (
          <div style={styles.activeSessionWrapper}>
            {/* Top Toolbar */}
            <div style={styles.sessionToolbar} className="glass">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={styles.qIndexCounter}>Question {currentIdx + 1} / 30</span>
                <span style={{
                  ...styles.diffLabel,
                  backgroundColor: blueprints[currentIdx]?.difficulty === 'hard' ? 'var(--danger-dim)' : blueprints[currentIdx]?.difficulty === 'medium' ? 'var(--warning-dim)' : 'var(--success-dim)',
                  color: blueprints[currentIdx]?.difficulty === 'hard' ? 'var(--danger)' : blueprints[currentIdx]?.difficulty === 'medium' ? 'var(--warning)' : 'var(--success)'
                }}>{blueprints[currentIdx]?.difficulty.toUpperCase()}</span>
              </div>
              <div style={styles.sessionTimer}>
                <ClockIcon size={14} color="var(--text-secondary)" style={{ marginRight: '6px' }} />
                <span>{formatTime(timer)}</span>
              </div>
            </div>

            {/* Question Card */}
            {loadingQuestion ? (
              <SkeletonQuestion />
            ) : currentQuestion ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={styles.sessionQuestionCard} className="card">
                  <div style={styles.chapTagsRow}>
                    <span style={styles.subjectTag}>{blueprints[currentIdx]?.subject.toUpperCase()}</span>
                    <span style={styles.chapterTag}>{blueprints[currentIdx]?.chapterName}</span>
                  </div>
                  <p style={styles.questionText}>
                    {parseLaTeX(currentQuestion.question)}
                  </p>
                </div>

                {/* Options List */}
                <div style={styles.optionsList}>
                  {Object.entries(currentQuestion.options).map(([key, val]) => {
                    const isSelected = selectedOption === key;
                    const isAns = currentQuestion.answer === key;
                    
                    let btnStyle = { ...styles.optionBtn };
                    if (isSelected) btnStyle = { ...btnStyle, ...styles.optionSelected };
                    if (confirmed) {
                      if (isAns) btnStyle = { ...btnStyle, ...styles.optionCorrect };
                      else if (isSelected) btnStyle = { ...btnStyle, ...styles.optionWrong };
                    }

                    return (
                      <button
                        key={key}
                        style={btnStyle}
                        disabled={confirmed}
                        onClick={() => setSelectedOption(key)}
                      >
                        <span style={{
                          ...styles.optionBadge,
                          backgroundColor: isSelected ? 'var(--accent)' : 'var(--bg-elevated)'
                        }}>{key}</span>
                        <span style={styles.optionVal}>{parseLaTeX(val)}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Solution Reveal */}
                {confirmed && (
                  <div style={styles.solutionBox} className="card">
                    <h5 style={{
                      color: isCorrect ? 'var(--success)' : 'var(--danger)',
                      margin: '0 0 10px 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '13px'
                    }}>
                      {isCorrect ? <CheckIcon size={16} /> : <CrossIcon size={16} />}
                      <span>{isCorrect ? 'Correct Response! +20 XP' : 'Incorrect Response'}</span>
                    </h5>
                    <p style={{ fontSize: '12px', color: 'var(--text-primary)', margin: '0 0 10px 0', lineHeight: '1.5' }}>
                      <strong>Concept:</strong> {currentQuestion.primaryConcept}
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--text-primary)', margin: 0, lineHeight: '1.5' }}>
                      <strong>Why Correct:</strong> {parseLaTeX(currentQuestion.whyCorrect)}
                    </p>
                  </div>
                )}

                {/* Bottom Navigation */}
                <div style={styles.sessionFooter}>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => {
                      if (window.confirm('Are you sure you want to quit the challenge? Your progress for today will be lost.')) {
                        setGameState('landing');
                      }
                    }}
                  >
                    Abandon
                  </button>

                  {!confirmed ? (
                    <button 
                      className="btn btn-primary"
                      disabled={!selectedOption}
                      onClick={handleConfirmAnswer}
                    >
                      Confirm Answer
                    </button>
                  ) : (
                    <button 
                      className="btn btn-primary"
                      onClick={handleNextQuestion}
                    >
                      {currentIdx >= blueprints.length - 1 ? 'Finish Challenge' : 'Next Question →'}
                    </button>
                  )}
                </div>

              </div>
            ) : null}

          </div>
        )}

        {/* Diagnostics Summary Screen */}
        {gameState === 'summary' && (
          <div className="card" style={{ padding: '24px' }}>
            
            <div style={styles.summaryTitleBlock}>
              <TrophyIcon size={36} color="var(--warning)" />
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Diagnostic Performance Card</h3>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Daily Challenge Completed</span>
              </div>
            </div>

            <div style={styles.scoreRow}>
              <div style={styles.gradeCircle}>
                <span style={styles.gradeVal}>{summaryStats.grade}</span>
                <span style={styles.gradeLabel}>Grade</span>
              </div>

              <div style={styles.scoreDetails}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={styles.scoreFraction}>{summaryStats.score}</span>
                  <span style={{ fontSize: '16px', color: 'var(--text-muted)' }}>/ {summaryStats.total} correct</span>
                </div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Total time spent: <strong>{formatTime(summaryStats.timer)}</strong>
                </span>
                <div style={styles.xpBonusBadge} className="glass">
                  +{summaryStats.score * 20} XP Earned
                </div>
              </div>
            </div>

            <hr style={styles.divider} />

            {/* Subject Breakdowns */}
            <h4 style={styles.summarySecHeader}>Subject Accuracy Breakdowns</h4>
            <div style={styles.accuracyGrid}>
              <div style={styles.accCard} className="card">
                <span style={styles.accLabel}>PHYSICS</span>
                <span style={{ ...styles.accVal, color: 'var(--accent)' }}>{summaryStats.subjects.physics}%</span>
              </div>
              <div style={styles.accCard} className="card">
                <span style={styles.accLabel}>CHEMISTRY</span>
                <span style={{ ...styles.accVal, color: 'var(--success)' }}>{summaryStats.subjects.chemistry}%</span>
              </div>
              <div style={styles.accCard} className="card">
                <span style={styles.accLabel}>MATHS</span>
                <span style={{ ...styles.accVal, color: 'var(--warning)' }}>{summaryStats.subjects.math}%</span>
              </div>
            </div>

            {/* Difficulty Accuracy */}
            <h4 style={{ ...styles.summarySecHeader, marginTop: '20px' }}>Difficulty Performance</h4>
            <div style={styles.accuracyGrid}>
              <div style={styles.accCard} className="card">
                <span style={styles.accLabel}>EASY</span>
                <span style={{ ...styles.accVal, color: 'var(--success)' }}>{summaryStats.difficulties.easy}%</span>
              </div>
              <div style={styles.accCard} className="card">
                <span style={styles.accLabel}>MEDIUM</span>
                <span style={{ ...styles.accVal, color: 'var(--warning)' }}>{summaryStats.difficulties.medium}%</span>
              </div>
              <div style={styles.accCard} className="card">
                <span style={styles.accLabel}>HARD</span>
                <span style={{ ...styles.accVal, color: 'var(--danger)' }}>{summaryStats.difficulties.hard}%</span>
              </div>
            </div>

            {/* Mistakes logged */}
            {summaryStats.wrongConcepts.length > 0 && (
              <div style={styles.mistakesSection}>
                <h4 style={{ ...styles.summarySecHeader, margin: 0 }}>Weak Spot Concepts Flagged</h4>
                <p style={{ fontSize: '10px', color: 'var(--text-muted)', margin: '2px 0 10px 0' }}>
                  These have been automatically queued in your review deck.
                </p>
                <div style={styles.wrongConceptsChips}>
                  {summaryStats.wrongConcepts.map((concept, idx) => (
                    <span key={idx} style={styles.wrongConceptChip}>
                      {concept}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div style={styles.cooldownSection}>
              <div style={styles.cooldownAlert} className="glass">
                <span>Next Challenge opens in:</span>
                <strong style={styles.cooldownCountdown}>{timeLeftToMidnight}</strong>
              </div>
            </div>

            <div style={styles.summaryFooterActions}>
              <button 
                className="btn btn-secondary" 
                onClick={() => navigate('/')}
                style={{ flex: 1 }}
              >
                Back to Dashboard
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => navigate('/revisions')}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <span>Go to Revisions</span>
                <ArrowRightIcon size={14} color="#ffffff" />
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)'
  },
  content: {
    paddingTop: '88px',
    paddingBottom: '88px'
  },
  centerCard: {
    padding: '32px 24px !important',
    backgroundColor: 'var(--bg-card)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  rulesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    alignSelf: 'stretch',
    textAlign: 'left',
    margin: '8px 0 24px 0',
    padding: '16px',
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: '16px',
    border: '1px solid var(--border-default)'
  },
  ruleItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '11px',
    color: 'var(--text-secondary)'
  },
  streakBadgeLarge: {
    padding: '10px 20px',
    borderRadius: '20px',
    fontSize: '13px',
    border: '1px solid var(--border-subtle)',
    backgroundColor: 'var(--bg-elevated)',
    color: 'var(--warning)',
    display: 'inline-block'
  },
  cooldownAlert: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '12px 18px',
    borderRadius: '16px',
    border: '1px solid var(--border-subtle)',
    backgroundColor: 'var(--bg-elevated)'
  },
  cooldownCountdown: {
    fontSize: '16px',
    fontWeight: '800',
    color: 'var(--accent-hover)',
    fontFamily: 'var(--font-mono)'
  },
  loaderSpinner: {
    width: '40px',
    height: '40px',
    border: '4px solid var(--border-default)',
    borderTopColor: 'var(--accent)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  activeSessionWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  sessionToolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 20px',
    borderRadius: '16px',
    border: '1px solid var(--border-subtle)',
    backgroundColor: 'var(--bg-card)'
  },
  qIndexCounter: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--text-primary)'
  },
  diffLabel: {
    fontSize: '9px',
    fontWeight: '800',
    padding: '2px 8px',
    borderRadius: '8px',
    letterSpacing: '0.5px'
  },
  sessionTimer: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    fontFamily: 'var(--font-mono)'
  },
  sessionQuestionCard: {
    padding: '24px !important',
    backgroundColor: 'var(--bg-card)',
    borderRadius: '20px',
    border: '1px solid var(--border-subtle)'
  },
  chapTagsRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '12px',
    alignItems: 'center'
  },
  subjectTag: {
    fontSize: '9px',
    fontWeight: '800',
    color: 'var(--accent-hover)',
    backgroundColor: 'var(--accent-dim)',
    padding: '2px 6px',
    borderRadius: '4px'
  },
  chapterTag: {
    fontSize: '10px',
    color: 'var(--text-muted)',
    fontWeight: '500'
  },
  questionText: {
    fontSize: '14px',
    lineHeight: '1.6',
    color: 'var(--text-primary)',
    margin: 0
  },
  optionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  optionBtn: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: '12px 16px',
    borderRadius: '14px',
    border: '2px solid var(--border-default)',
    backgroundColor: 'transparent',
    color: 'var(--text-primary)',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.15s'
  },
  optionSelected: {
    borderColor: 'var(--accent)',
    boxShadow: '0 0 10px var(--accent-glow)'
  },
  optionCorrect: {
    borderColor: 'var(--success)',
    backgroundColor: 'var(--success-dim)'
  },
  optionWrong: {
    borderColor: 'var(--danger)',
    backgroundColor: 'var(--danger-dim)'
  },
  optionBadge: {
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    marginRight: '14px',
    fontSize: '12px',
    color: '#ffffff'
  },
  optionVal: {
    fontSize: '13px',
    fontWeight: '400',
    flex: 1
  },
  solutionBox: {
    padding: '16px !important',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-default)',
    borderRadius: '14px'
  },
  sessionFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '8px',
    gap: '16px'
  },
  summaryTitleBlock: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px'
  },
  scoreRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '32px',
    margin: '24px 0',
    flexWrap: 'wrap'
  },
  gradeCircle: {
    width: '90px',
    height: '90px',
    borderRadius: '50%',
    backgroundColor: 'var(--bg-elevated)',
    border: '3px solid var(--accent)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 15px var(--accent-glow)'
  },
  gradeVal: {
    fontSize: '36px',
    fontWeight: '900',
    color: 'var(--accent-hover)',
    lineHeight: '1'
  },
  gradeLabel: {
    fontSize: '9px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    marginTop: '2px'
  },
  scoreDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  scoreFraction: {
    fontSize: '32px',
    fontWeight: '900',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-mono)'
  },
  xpBonusBadge: {
    padding: '6px 12px',
    backgroundColor: 'var(--warning-dim)',
    color: 'var(--warning)',
    fontSize: '11px',
    fontWeight: '700',
    borderRadius: '12px',
    border: '1px solid var(--border-subtle)',
    display: 'inline-block',
    marginTop: '6px',
    textAlign: 'center'
  },
  divider: {
    border: 'none',
    borderTop: '1px solid var(--border-subtle)',
    margin: '20px 0'
  },
  summarySecHeader: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    letterSpacing: '0.5px',
    marginBottom: '10px'
  },
  accuracyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginBottom: '10px'
  },
  accCard: {
    padding: '12px !important',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-subtle)'
  },
  accLabel: {
    fontSize: '8px',
    fontWeight: '800',
    color: 'var(--text-muted)',
    letterSpacing: '0.5px'
  },
  accVal: {
    fontSize: '16px',
    fontWeight: '900',
    marginTop: '4px',
    fontFamily: 'var(--font-mono)'
  },
  mistakesSection: {
    marginTop: '24px'
  },
  wrongConceptsChips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px'
  },
  wrongConceptChip: {
    padding: '4px 10px',
    fontSize: '10px',
    backgroundColor: 'var(--danger-dim)',
    color: 'var(--danger)',
    borderRadius: '6px',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    fontWeight: '600'
  },
  cooldownSection: {
    marginTop: '24px',
    display: 'flex',
    justifyContent: 'center'
  },
  summaryFooterActions: {
    display: 'flex',
    gap: '16px',
    marginTop: '24px'
  }
};
