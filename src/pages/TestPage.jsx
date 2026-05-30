import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../utils/storage';
import { generateWeeklyTest, callAI } from '../utils/api';
import { CHAPTERS } from '../data/chapters';
import { useUser } from '../components/UserContext';
import { useToast } from '../components/ToastContext';
import OptionButton from '../components/OptionButton';
import { SkeletonQuestion } from '../components/LoadingSkeleton';
import { parseLaTeX } from '../components/DailyChallenge';
import { NoteIcon, ClockIcon, StatsIcon, ThunderIcon, WarningIcon } from '../components/Icons';
import { motion } from 'framer-motion';

async function generateTestQuestionsBatch(subject, chapters, count, difficulty = 'medium') {
  const prompt = `Generate a batch of ${count} multiple choice questions for JEE Mains.
Subject: ${subject}
Chapters: ${chapters.join(', ') || 'General'}
Difficulty: ${difficulty}

Return ONLY this JSON schema:
{
  "questions": [
    {
      "question": "question text in LaTeX ($ for inline math)",
      "options": { "A": "option A text", "B": "option B text", "C": "option C text", "D": "option D text" },
      "answer": "A or B or C or D",
      "primaryConcept": "specific concept name tested",
      "whyCorrect": "one clear explanation sentence",
      "difficulty": "${difficulty}"
    }
  ]
}`;
  const result = await callAI(prompt);
  return result.questions || [];
}

export default function TestPage() {
  const navigate = useNavigate();
  const { gainXP, name } = useUser();
  const { showToast } = useToast();

  const conceptsLearned = useMemo(() => storage.getConceptsLearned(), []);

  // Configuration Phase States
  const [testPhase, setTestPhase] = useState('config'); // config, loading, testing, completed
  const [configTab, setConfigTab] = useState('sim'); // sim, custom
  const [simType, setSimType] = useState('pcm'); // pcm, phy, chem, math
  
  // Custom Practice States
  const [customSubject, setCustomSubject] = useState('physics');
  const [selectedChapters, setSelectedChapters] = useState({});
  const [customQCount, setCustomQCount] = useState(10);
  const [customDifficulty, setCustomDifficulty] = useState('medium');
  const [isTimerEnabled, setIsTimerEnabled] = useState(true);

  // Loading Progress
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [totalQuestionsToLoad, setTotalQuestionsToLoad] = useState(0);

  // Test Execution States
  const [test, setTest] = useState(null);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { qIndex: selectedLetter }
  const [flaggedQuestions, setFlaggedQuestions] = useState({}); // { qIndex: boolean }
  const [timeLeft, setTimeLeft] = useState(0);
  const [testDuration, setTestDuration] = useState(0); // overall duration
  
  // Results States
  const [score, setScore] = useState(0);
  const [grade, setGrade] = useState('D');
  const [resultsList, setResultsList] = useState([]);
  const [weakTips, setWeakTips] = useState({});
  const [tipsLoading, setTipsLoading] = useState(false);

  // Count up animation score
  const [animatedScore, setAnimatedScore] = useState(0);

  // Initialize all chapters as selected when subject changes
  useEffect(() => {
    const chapters = CHAPTERS[customSubject] || [];
    const initial = {};
    chapters.forEach(ch => {
      initial[ch.id] = true;
    });
    setSelectedChapters(initial);
  }, [customSubject]);

  // Chapter togglers
  const toggleChapter = (id) => {
    setSelectedChapters(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSelectAllChapters = () => {
    const chapters = CHAPTERS[customSubject] || [];
    const updated = { ...selectedChapters };
    chapters.forEach(ch => {
      updated[ch.id] = true;
    });
    setSelectedChapters(updated);
  };

  const handleClearAllChapters = () => {
    const chapters = CHAPTERS[customSubject] || [];
    const updated = { ...selectedChapters };
    chapters.forEach(ch => {
      updated[ch.id] = false;
    });
    setSelectedChapters(updated);
  };

  // Timer runner
  useEffect(() => {
    if (testPhase !== 'testing') return;
    if (configTab === 'custom' && !isTimerEnabled) return; // No timer in practice mode

    if (timeLeft <= 0) {
      handleSubmitTest();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [testPhase, timeLeft, configTab, isTimerEnabled]);

  // Format countdown minutes and seconds
  const formatCountdown = (secs) => {
    if (secs < 0) return '0:00';
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const startTestLoading = async (subjectParamsList) => {
    setTestPhase('loading');
    setLoadingProgress(0);
    
    // Calculate total questions to generate
    const totalQs = subjectParamsList.reduce((acc, curr) => acc + curr.count, 0);
    setTotalQuestionsToLoad(totalQs);

    try {
      const allQuestions = [];
      
      for (const param of subjectParamsList) {
        const { subject, chapters, count, difficulty } = param;
        let generatedForSubject = 0;
        
        while (generatedForSubject < count) {
          const batchSize = Math.min(5, count - generatedForSubject);
          const batch = await generateTestQuestionsBatch(subject, chapters, batchSize, difficulty);
          allQuestions.push(...batch);
          generatedForSubject += batchSize;
          setLoadingProgress(allQuestions.length);
        }
      }
      
      if (simType === 'pcm' && configTab === 'sim') {
        // Shuffle the mixed PCM mock exam questions
        allQuestions.sort(() => Math.random() - 0.5);
      }

      setTest({ questions: allQuestions });
      
      // Set test duration
      let durationSeconds = 0;
      if (configTab === 'sim') {
        durationSeconds = simType === 'pcm' ? 180 * 60 : 60 * 60;
      } else {
        durationSeconds = isTimerEnabled ? customQCount * 2 * 60 : 9999 * 60;
      }

      setTimeLeft(durationSeconds);
      setTestDuration(durationSeconds);
      setAnswers({});
      setFlaggedQuestions({});
      setCurrentQIdx(0);
      setTestPhase('testing');
    } catch (err) {
      showToast('Error generating mock test questions. Please try again.', 'error');
      setTestPhase('config');
    }
  };

  const handleStartTest = () => {
    if (configTab === 'sim') {
      if (simType === 'pcm') {
        const physicsChs = CHAPTERS.physics.map(c => c.name);
        const chemistryChs = CHAPTERS.chemistry.map(c => c.name);
        const mathChs = CHAPTERS.math.map(c => c.name);
        
        startTestLoading([
          { subject: 'physics', chapters: physicsChs, count: 25, difficulty: 'medium' },
          { subject: 'chemistry', chapters: chemistryChs, count: 25, difficulty: 'medium' },
          { subject: 'math', chapters: mathChs, count: 25, difficulty: 'medium' }
        ]);
      } else {
        const subjectName = simType === 'phy' ? 'physics' : (simType === 'chem' ? 'chemistry' : 'math');
        const subjectChs = CHAPTERS[subjectName].map(c => c.name);
        startTestLoading([
          { subject: subjectName, chapters: subjectChs, count: 25, difficulty: 'medium' }
        ]);
      }
    } else {
      // Custom Practice Test
      const activeChapters = CHAPTERS[customSubject]
        ?.filter(c => selectedChapters[c.id])
        .map(c => c.name) || [];
      
      if (activeChapters.length === 0) {
        showToast('Please select at least one chapter to practice!', 'warning');
        return;
      }

      startTestLoading([
        { subject: customSubject, chapters: activeChapters, count: customQCount, difficulty: customDifficulty }
      ]);
    }
  };

  const handleSelectOption = (letter) => {
    setAnswers(prev => ({
      ...prev,
      [currentQIdx]: letter
    }));
  };

  const toggleFlag = () => {
    setFlaggedQuestions(prev => ({
      ...prev,
      [currentQIdx]: !prev[currentQIdx]
    }));
  };

  async function handleSubmitTest() {
    if (!test) return;

    let correctCount = 0;
    const items = test.questions.map((q, idx) => {
      const chosen = answers[idx];
      const correct = chosen === q.answer;
      if (correct) correctCount++;

      return {
        question: q.question,
        concept: q.primaryConcept,
        difficulty: q.difficulty,
        chosen: chosen || '—',
        correctAnswer: q.answer,
        correct,
        whyCorrect: q.whyCorrect
      };
    });

    setResultsList(items);
    setScore(correctCount);
    
    // Performance Grade Calculation
    const totalQCount = test.questions.length;
    const ratio = correctCount / totalQCount;
    let computedGrade = 'D';
    if (ratio >= 0.95) computedGrade = 'S';
    else if (ratio >= 0.8) computedGrade = 'A';
    else if (ratio >= 0.6) computedGrade = 'B';
    else if (ratio >= 0.4) computedGrade = 'C';
    setGrade(computedGrade);

    setTestPhase('completed');

    // Trigger score increment animation
    let count = 0;
    const interval = setInterval(() => {
      if (count < correctCount) {
        count++;
        setAnimatedScore(count);
      } else {
        clearInterval(interval);
      }
    }, 1500 / Math.max(correctCount, 1));

    // Save test history record in storage
    const weeklyData = storage.getWeeklyData();
    const isSimulation = configTab === 'sim';
    const displaySubject = isSimulation ? `Simulation (${simType.toUpperCase()})` : `Custom (${customSubject.toUpperCase()})`;
    weeklyData.testHistory.push({
      date: new Date().toISOString(),
      score: correctCount,
      total: totalQCount,
      subject: displaySubject,
      challengeMode: isSimulation
    });
    
    // Flag weak concepts
    const wrongConcepts = [...new Set(items.filter(i => !i.correct).map(i => i.concept))];
    weeklyData.currentWeekConcepts = [...new Set([...(weeklyData.currentWeekConcepts || []), ...wrongConcepts])];
    storage.setWeeklyData(weeklyData);

    // XP calculation: +20 XP per correct response. Simulation gives 1.5x.
    const multiplier = isSimulation ? 1.5 : 1.0;
    const xpWon = Math.round(correctCount * 20 * multiplier);
    gainXP(xpWon);

    // Generate revision tips for weak concepts
    if (wrongConcepts.length > 0) {
      setTipsLoading(true);
      try {
        const prompt = `Generate revision tips for these weak JEE concepts: ${wrongConcepts.join(', ')}.
Return ONLY this JSON schema mapping concepts to a one-sentence tip:
{
  "tips": {
    "conceptName": "one sentence action revision advice"
  }
}`;
        const data = await callAI(prompt);
        setWeakTips(data.tips || {});
      } catch (e) {
        console.warn('Failed to load weak tips:', e);
      } finally {
        setTipsLoading(false);
      }
    }
  }

  // Sort wrong first for results table
  const sortedResults = useMemo(() => {
    return [...resultsList].sort((a, b) => {
      if (a.correct === b.correct) return 0;
      return a.correct ? 1 : -1; // incorrect first
    });
  }, [resultsList]);

  // Score color shift mapper
  const getScoreColor = () => {
    const totalQCount = test?.questions.length || 10;
    const ratio = score / totalQCount;
    if (ratio >= 0.7) return 'var(--success)';
    if (ratio >= 0.4) return 'var(--warning)';
    return 'var(--danger)';
  };

  // --- CONFIG PHASE VIEW ---
  if (testPhase === 'config') {
    return (
      <div style={styles.page}>
        <div className="main-content mx-auto p-6 max-w-2xl">
          <h2 style={{ ...styles.pageTitle, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <NoteIcon size={24} /> Mock & Practice Exams
          </h2>
          <p style={styles.pageSubtitle}>Attempt full JEE mock papers or customize practicing from specific topics.</p>

          {/* Sub-tabs for Config Type */}
          <div style={styles.configTabsRow}>
            <button
              style={{
                ...styles.configTabBtn,
                borderBottom: configTab === 'sim' ? '3px solid var(--accent)' : 'none',
                color: configTab === 'sim' ? 'var(--text-primary)' : 'var(--text-secondary)'
              }}
              onClick={() => setConfigTab('sim')}
            >
              JEE Exam Simulation
            </button>
            <button
              style={{
                ...styles.configTabBtn,
                borderBottom: configTab === 'custom' ? '3px solid var(--accent)' : 'none',
                color: configTab === 'custom' ? 'var(--text-primary)' : 'var(--text-secondary)'
              }}
              onClick={() => setConfigTab('custom')}
            >
              Custom Practice Test
            </button>
          </div>

          {configTab === 'sim' ? (
            <div style={styles.card} className="card">
              <h3 style={styles.cardSectionHeader}>Select Simulation Paper</h3>
              <p style={styles.settingDesc}>Simulate the strict environment of JEE Mains. Navigation is free, hints are locked, and grading is calibrated to exam standard.</p>
              
              <div style={styles.simSelectorGrid}>
                {[
                  { id: 'pcm', label: 'Full PCM Paper', desc: '75 Qs | 180 Mins | Physics, Chem & Math' },
                  { id: 'phy', label: 'Physics Mock', desc: '25 Qs | 60 Mins | Physics only' },
                  { id: 'chem', label: 'Chemistry Mock', desc: '25 Qs | 60 Mins | Chemistry only' },
                  { id: 'math', label: 'Mathematics Mock', desc: '25 Qs | 60 Mins | Math only' }
                ].map(item => (
                  <div
                    key={item.id}
                    style={{
                      ...styles.simCard,
                      border: simType === item.id ? '2px solid var(--accent)' : '1px solid var(--border-default)',
                      boxShadow: simType === item.id ? '0 0 12px var(--accent-glow)' : 'none'
                    }}
                    onClick={() => setSimType(item.id)}
                  >
                    <strong style={{ color: 'var(--text-primary)' }}>{item.label}</strong>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>{item.desc}</span>
                  </div>
                ))}
              </div>

              <div style={styles.cautionBox}>
                <span style={styles.cautionIcon}>⚠️</span>
                <div>
                  <strong style={{ color: 'var(--danger)', fontSize: '13px' }}>CAUTION: Exam Simulation Mode</strong>
                  <p style={styles.cautionText}>Zero scaffolding helps. Zero hints available. Free question navigation allowed. Timer auto-submits.</p>
                </div>
              </div>

              <button 
                className="btn btn-primary" 
                style={styles.beginBtn}
                onClick={handleStartTest}
              >
                Launch Mock Exam
              </button>
            </div>
          ) : (
            <div style={styles.card} className="card">
              <h3 style={styles.cardSectionHeader}>1. Choose Subject</h3>
              <div style={styles.subjectSelectorContainer}>
                {['physics', 'chemistry', 'math'].map(sub => (
                  <button
                    key={sub}
                    style={{
                      ...styles.subjectTab,
                      backgroundColor: customSubject === sub ? 'var(--accent)' : 'transparent',
                      borderColor: customSubject === sub ? 'var(--accent)' : 'var(--border-default)',
                      color: customSubject === sub ? '#030508' : 'var(--text-secondary)',
                      boxShadow: customSubject === sub ? '0 0 10px var(--accent-glow)' : 'none'
                    }}
                    onClick={() => setCustomSubject(sub)}
                  >
                    {sub.toUpperCase()}
                  </button>
                ))}
              </div>

              <h3 style={{ ...styles.cardSectionHeader, marginTop: '16px' }}>2. Select Chapters</h3>
              <div style={styles.chapterHelperRow}>
                <button className="btn btn-ghost" style={styles.ghostLink} onClick={handleSelectAllChapters}>Select All</button>
                <button className="btn btn-ghost" style={styles.ghostLink} onClick={handleClearAllChapters}>Clear All</button>
              </div>

              <div style={styles.chaptersScrollContainer}>
                {(CHAPTERS[customSubject] || []).map(ch => (
                  <label key={ch.id} style={styles.chapterCheckboxLabel}>
                    <input
                      type="checkbox"
                      checked={!!selectedChapters[ch.id]}
                      onChange={() => toggleChapter(ch.id)}
                      style={styles.checkbox}
                    />
                    <span style={{ fontSize: '13px', marginLeft: '8px', color: 'var(--text-primary)' }}>{ch.name}</span>
                  </label>
                ))}
              </div>

              <h3 style={{ ...styles.cardSectionHeader, marginTop: '16px' }}>3. Practice Config</h3>
              
              <div style={styles.configControlsGrid}>
                {/* Question Count */}
                <div style={styles.controlGroup}>
                  <label style={styles.controlLabel}>Questions</label>
                  <div style={styles.optionsRowPills}>
                    {[5, 10, 15, 20, 25, 30].map(cnt => (
                      <button
                        key={cnt}
                        style={{
                          ...styles.pillBtn,
                          backgroundColor: customQCount === cnt ? 'var(--accent)' : 'var(--bg-secondary)',
                          borderColor: customQCount === cnt ? 'var(--accent)' : 'var(--border-default)',
                          color: customQCount === cnt ? '#030508' : 'var(--text-primary)'
                        }}
                        onClick={() => setCustomQCount(cnt)}
                      >
                        {cnt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty */}
                <div style={styles.controlGroup}>
                  <label style={styles.controlLabel}>Difficulty</label>
                  <div style={styles.optionsRowPills}>
                    {['easy', 'medium', 'hard'].map(diff => (
                      <button
                        key={diff}
                        style={{
                          ...styles.pillBtn,
                          textTransform: 'capitalize',
                          backgroundColor: customDifficulty === diff ? 'var(--accent)' : 'var(--bg-secondary)',
                          borderColor: customDifficulty === diff ? 'var(--accent)' : 'var(--border-default)',
                          color: customDifficulty === diff ? '#030508' : 'var(--text-primary)'
                        }}
                        onClick={() => setCustomDifficulty(diff)}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Timer Toggle */}
                <div style={styles.optionRowCustom}>
                  <div>
                    <strong>Time limit constraint</strong>
                    <p style={styles.settingDesc}>Allows 2 minutes per question. Disabling turns off the countdown timer completely.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isTimerEnabled}
                    onChange={e => setIsTimerEnabled(e.target.checked)}
                    style={styles.checkbox}
                  />
                </div>
              </div>

              <button
                className="btn btn-primary"
                style={styles.beginBtn}
                onClick={handleStartTest}
              >
                Launch Practice Test
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- LOADING TEST VIEW ---
  if (testPhase === 'loading') {
    const percent = totalQuestionsToLoad > 0 ? Math.round((loadingProgress / totalQuestionsToLoad) * 100) : 0;
    return (
      <div style={styles.page}>
        <div className="main-content mx-auto p-6 max-w-lg" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Compiling and calibrating your personalized mock test...
          </p>
          <div style={styles.progressBarContainer}>
            <div style={{ ...styles.progressBarFiller, width: `${percent}%` }} />
          </div>
          <span style={{ fontSize: '13px', marginTop: '12px', color: 'var(--accent-hover)', fontFamily: 'var(--font-mono)' }}>
            Generating Questions: {loadingProgress} / {totalQuestionsToLoad} ({percent}%)
          </span>
        </div>
      </div>
    );
  }

  // --- TESTING PHASE VIEW ---
  if (testPhase === 'testing' && test) {
    const question = test.questions[currentQIdx];
    const isPulsing = timeLeft < 120; // 2 mins
    const isRed = timeLeft < 300; // 5 mins

    return (
      <div style={styles.testingPage}>
        {/* Fixed Header */}
        <div style={styles.fixedTestHeader} className="glass">
          <div style={styles.testHeaderRow}>
            <span style={styles.testTitleText}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                {configTab === 'sim' ? (
                  <>
                    <ThunderIcon size={14} color="var(--warning)" />
                    <span>JEE Simulation</span>
                  </>
                ) : (
                  <>
                    <NoteIcon size={14} />
                    <span>Practice Test</span>
                  </>
                )}
                <span>({configTab === 'sim' ? simType.toUpperCase() : customSubject.toUpperCase()})</span>
              </span>
            </span>
            <div style={{
              ...styles.timerBox,
              color: isRed ? 'var(--danger)' : 'var(--accent-hover)',
              animation: isPulsing ? 'pulse 1s infinite' : 'none'
            }}>
              <ClockIcon size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
              {(!isTimerEnabled && configTab === 'custom') ? 'Practice Mode' : formatCountdown(timeLeft)}
            </div>
            <button className="btn btn-secondary" style={styles.submitTestBtn} onClick={handleSubmitTest}>
              Submit Test
            </button>
          </div>

          {/* Navigator dots */}
          <div style={styles.navigatorDots}>
            {test.questions.map((_, idx) => {
              const isAnswered = answers[idx] !== undefined;
              const isCurrent = idx === currentQIdx;
              const isFlagged = flaggedQuestions[idx];

              return (
                <button
                  key={idx}
                  onClick={() => setCurrentQIdx(idx)}
                  style={{
                    ...styles.navNode,
                    ...(isAnswered ? styles.navNodeAnswered : {}),
                    ...(isCurrent ? styles.navNodeCurrent : {}),
                    ...(isFlagged ? styles.navNodeFlagged : {})
                  }}
                >
                  {isFlagged && <span style={styles.flagDot} />}
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Solver Body */}
        <div style={styles.solverBody} className="mx-auto p-4 max-w-lg w-full">
          <div style={styles.card} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={styles.difficultyChip}>Question {currentQIdx + 1} ({question.difficulty})</span>
              <button 
                style={{
                  ...styles.flagBtn,
                  color: flaggedQuestions[currentQIdx] ? 'var(--warning)' : 'var(--text-secondary)'
                }}
                onClick={toggleFlag}
              >
                🚩 {flaggedQuestions[currentQIdx] ? 'Flagged for Review' : 'Flag for Review'}
              </button>
            </div>

            <div style={styles.questionText}>
              {parseLaTeX(question.question)}
            </div>
          </div>

          {/* Options */}
          <div style={styles.optionsCol}>
            {Object.entries(question.options).map(([key, val]) => (
              <OptionButton
                key={key}
                letter={key}
                value={val}
                isSelected={answers[currentQIdx] === key}
                showAnswer={false}
                onClick={() => handleSelectOption(key)}
              />
            ))}
          </div>

          {/* Free navigation footer row */}
          <div style={styles.navigationRow}>
            <button
              className="btn btn-secondary"
              style={styles.navActionBtn}
              disabled={currentQIdx === 0}
              onClick={() => setCurrentQIdx(currentQIdx - 1)}
            >
              ← Previous
            </button>
            <button
              className="btn btn-secondary"
              style={styles.navActionBtn}
              disabled={currentQIdx === test.questions.length - 1}
              onClick={() => setCurrentQIdx(currentQIdx + 1)}
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- RESULTS PHASE VIEW ---
  if (testPhase === 'completed' && test) {
    const isChallenge = configTab === 'sim';
    const totalQCount = test.questions.length;
    const accuracyPct = Math.round((score / totalQCount) * 100);

    return (
      <div style={styles.page}>
        <div className="main-content mx-auto p-6 max-w-3xl">
          <h2 style={styles.pageTitle}>Test Performance Card</h2>
          <p style={styles.pageSubtitle}>Detailed diagnostic report of your knowledge verification session.</p>

          <div style={styles.resultsHeroGrid}>
            
            {/* Animated Score card */}
            <div style={styles.scoreSummaryCard} className="card glass">
              <span style={styles.gradeBanner}>Grade: {grade}</span>
              <div style={{ ...styles.largeScore, color: getScoreColor() }}>
                {animatedScore} <span style={{ fontSize: '24px', color: 'var(--text-secondary)' }}>/ {totalQCount}</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                Questions correctly answered ({accuracyPct}% accuracy)
              </p>
              <div style={styles.scoreBarContainer}>
                <div style={{
                  ...styles.scoreBarFiller,
                  width: `${accuracyPct}%`,
                  backgroundColor: getScoreColor()
                }} />
              </div>
            </div>

            {/* Share / Verification card */}
            <div style={styles.shareCard} className="card">
              <span style={styles.shareHeader}>Nexus JEE Mock Certificate</span>
              <div style={styles.shareGrid}>
                <div style={styles.shareItem}>
                  <span style={styles.shareLabel}>Name</span>
                  <span style={styles.shareVal}>{name}</span>
                </div>
                <div style={styles.shareItem}>
                  <span style={styles.shareLabel}>Test Type</span>
                  <span style={styles.shareVal}>{isChallenge ? 'Challenge Mode' : 'Standard Simulation'}</span>
                </div>
                <div style={styles.shareItem}>
                  <span style={styles.shareLabel}>Performance</span>
                  <span style={styles.shareVal}>{score} / {totalQCount} (Grade {grade})</span>
                </div>
                <div style={styles.shareItem}>
                  <span style={styles.shareLabel}>XP Gained</span>
                  <span style={styles.shareVal} className="mono-text">+{Math.round(score * 20 * (isChallenge ? 1.5 : 1))} XP</span>
                </div>
              </div>
              <p style={styles.shareFooter}>Generated securely by Nexus JEE Engine.</p>
            </div>

          </div>

          {/* Weak concepts advice section */}
          {resultsList.some(r => !r.correct) && (
            <div style={styles.card} className="card" style={{ marginTop: '24px' }}>
              <h3 style={{ ...styles.cardSectionHeader, color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <WarningIcon size={18} color="var(--warning)" /> Target Weak Concepts
              </h3>
              <p style={styles.settingDesc} style={{ marginBottom: '16px' }}>
                We flagged the following concepts for spaced recall repetition. Focus on these tips:
              </p>
              {tipsLoading ? (
                <div className="skeleton" style={{ height: '60px', width: '100%' }} />
              ) : (
                <div style={styles.weakTipsList}>
                  {Object.entries(weakTips).map(([concept, tip], idx) => (
                    <div key={idx} style={styles.tipCard} className="card">
                      <strong>{concept}</strong>
                      <p style={styles.tipText}>{tip}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Concept Breakdown Table */}
          <div style={styles.card} className="card" style={{ marginTop: '24px' }}>
            <h3 style={{ ...styles.cardSectionHeader, display: 'flex', alignItems: 'center', gap: '8px' }}><StatsIcon size={18} /> Concept Breakdown (Incorrect First)</h3>
            <div style={styles.tableScroll}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableRowHeader}>
                    <th style={styles.th}>Result</th>
                    <th style={styles.th}>Concept Tested</th>
                    <th style={styles.th}>Difficulty</th>
                    <th style={styles.th}>Answer (Yours / Correct)</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedResults.map((res, i) => (
                    <tr key={i} style={styles.tr}>
                      <td style={styles.td}>
                        <span style={{
                          fontWeight: 'bold',
                          color: res.correct ? 'var(--success)' : 'var(--danger)'
                        }}>
                          {res.correct ? '✓ Correct' : '✗ Incorrect'}
                        </span>
                      </td>
                      <td style={styles.td}>{res.concept}</td>
                      <td style={{ ...styles.td, textTransform: 'capitalize' }}>{res.difficulty}</td>
                      <td style={styles.td}>{res.chosen} / {res.correctAnswer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <button 
            className="btn btn-primary w-full" 
            style={{ marginTop: '24px' }}
            onClick={() => navigate('/')}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return null;
}

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: 'var(--bg-primary)',
    paddingBottom: '48px'
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: '800',
    marginBottom: '4px'
  },
  pageSubtitle: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    marginBottom: '28px'
  },
  card: {
    padding: '24px !important',
    backgroundColor: 'var(--bg-card)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  cardSectionHeader: {
    fontSize: '15px',
    fontWeight: '700',
    borderBottom: '1px solid var(--border-subtle)',
    paddingBottom: '10px'
  },
  subjectSelectorContainer: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  subjectTab: {
    padding: '10px 16px',
    borderRadius: '10px',
    border: '1px solid var(--border-default)',
    backgroundColor: 'transparent',
    color: 'var(--text-secondary)',
    fontWeight: '600',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.15s'
  },
  activeSubjectTab: {
    backgroundColor: 'var(--accent)',
    borderColor: 'var(--accent)',
    color: '#ffffff',
    boxShadow: '0 0 10px var(--accent-glow)'
  },
  conceptSummaryLabel: {
    fontSize: '12px',
    color: 'var(--text-secondary)'
  },
  conceptTagsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '12px'
  },
  conceptTag: {
    padding: '4px 10px',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-subtle)',
    fontSize: '11px',
    color: 'var(--text-primary)'
  },
  conceptTagMore: {
    padding: '4px 10px',
    borderRadius: '8px',
    backgroundColor: 'var(--accent-dim)',
    color: 'var(--accent-hover)',
    fontSize: '11px',
    fontWeight: '600'
  },
  optionRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '16px',
    borderBottom: '1px solid var(--border-subtle)'
  },
  settingDesc: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    marginTop: '4px',
    lineHeight: '1.4'
  },
  checkbox: {
    width: '18px',
    height: '18px',
    accentColor: 'var(--accent)'
  },
  cautionBox: {
    display: 'flex',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: 'var(--danger-dim)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '12px'
  },
  cautionIcon: {
    fontSize: '18px'
  },
  cautionText: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    marginTop: '2px',
    lineHeight: '1.4'
  },
  beginBtn: {
    width: '100%',
    marginTop: '8px'
  },
  warnText: {
    fontSize: '11px',
    color: 'var(--danger)',
    textAlign: 'center'
  },
  testingPage: {
    minHeight: '100vh',
    backgroundColor: 'var(--bg-primary)',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative'
  },
  fixedTestHeader: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    padding: '12px 24px 8px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    borderBottom: '1px solid var(--border-subtle)'
  },
  testHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  testTitleText: {
    fontSize: '14px',
    fontWeight: '700'
  },
  timerBox: {
    fontSize: '16px',
    fontWeight: '700',
    fontFamily: 'var(--font-mono)'
  },
  submitTestBtn: {
    padding: '8px 16px',
    fontSize: '12px',
    backgroundColor: 'var(--success)',
    color: '#ffffff',
    border: 'none',
    ':hover': {
      backgroundColor: '#16a34a'
    }
  },
  navigatorDots: {
    display: 'flex',
    gap: '6px',
    overflowX: 'auto',
    paddingBottom: '4px',
    justifyContent: 'flex-start'
  },
  navNode: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    border: '1px solid var(--border-default)',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-secondary)',
    fontSize: '11px',
    fontWeight: '700',
    fontFamily: 'var(--font-mono)',
    cursor: 'pointer',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  navNodeAnswered: {
    backgroundColor: 'var(--accent)',
    borderColor: 'var(--accent)',
    color: '#ffffff'
  },
  navNodeCurrent: {
    borderColor: 'var(--text-primary)',
    boxShadow: '0 0 0 2px var(--accent-glow)'
  },
  navNodeFlagged: {
    borderColor: 'var(--warning) !important'
  },
  flagDot: {
    position: 'absolute',
    top: '-2px',
    right: '-2px',
    width: '8px',
    height: '8px',
    backgroundColor: 'var(--warning)',
    borderRadius: '50%'
  },
  solverBody: {
    paddingTop: '110px',
    paddingBottom: '32px',
    flex: 1
  },
  difficultyChip: {
    fontSize: '11px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    backgroundColor: 'var(--bg-elevated)',
    padding: '2px 8px',
    borderRadius: '6px'
  },
  flagBtn: {
    background: 'none',
    border: 'none',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  questionText: {
    fontSize: '16px',
    fontWeight: '500',
    lineHeight: '1.6',
    color: 'var(--text-primary)'
  },
  optionsCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '20px'
  },
  navigationRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    marginTop: '24px'
  },
  navActionBtn: {
    flex: 1
  },
  resultsHeroGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
    alignItems: 'stretch'
  },
  scoreSummaryCard: {
    padding: '32px !important',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '12px',
    justifyContent: 'center'
  },
  gradeBanner: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--warning)',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  largeScore: {
    fontSize: '56px',
    fontWeight: '800',
    fontFamily: 'var(--font-mono)',
    lineHeight: '1'
  },
  scoreBarContainer: {
    width: '100%',
    height: '6px',
    backgroundColor: 'var(--bg-elevated)',
    borderRadius: '3px',
    overflow: 'hidden',
    marginTop: '8px'
  },
  scoreBarFiller: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)'
  },
  shareCard: {
    padding: '24px !important',
    backgroundColor: 'var(--bg-card)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    border: '1px solid var(--accent-glow)'
  },
  shareHeader: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--accent-hover)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '1px solid var(--border-subtle)',
    paddingBottom: '8px',
    marginBottom: '12px'
  },
  shareGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '12px'
  },
  shareItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px'
  },
  shareLabel: {
    color: 'var(--text-secondary)'
  },
  shareVal: {
    fontWeight: '600',
    color: 'var(--text-primary)'
  },
  shareFooter: {
    fontSize: '10px',
    color: 'var(--text-muted)',
    textAlign: 'center',
    marginTop: '8px',
    borderTop: '1px solid var(--border-subtle)',
    paddingTop: '8px'
  },
  weakTipsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  tipCard: {
    padding: '16px !important',
    backgroundColor: 'var(--bg-secondary)',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  tipText: {
    fontSize: '12px',
    color: 'var(--text-primary)',
    lineHeight: '1.4'
  },
  tableScroll: {
    overflowX: 'auto',
    width: '100%'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left'
  },
  tableRowHeader: {
    borderBottom: '1px solid var(--border-default)'
  },
  th: {
    padding: '10px 12px',
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase'
  },
  tr: {
    borderBottom: '1px solid var(--border-subtle)',
    ':hover': {
      backgroundColor: 'var(--bg-secondary)'
    }
  },
  td: {
    padding: '12px',
    fontSize: '12px',
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap'
  },
  configTabsRow: {
    display: 'flex',
    borderBottom: '1px solid var(--border-subtle)',
    marginBottom: '20px',
    gap: '24px'
  },
  configTabBtn: {
    background: 'none',
    border: 'none',
    padding: '12px 4px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '14px',
    letterSpacing: '0.5px'
  },
  simSelectorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    margin: '16px 0'
  },
  simCard: {
    padding: '16px',
    borderRadius: '12px',
    backgroundColor: 'var(--bg-secondary)',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.2s'
  },
  chapterHelperRow: {
    display: 'flex',
    gap: '12px',
    marginBottom: '8px'
  },
  ghostLink: {
    padding: '4px 8px',
    fontSize: '11px',
    color: 'var(--accent-hover)',
    background: 'none',
    border: 'none',
    cursor: 'pointer'
  },
  chaptersScrollContainer: {
    maxHeight: '200px',
    overflowY: 'auto',
    border: '1px solid var(--border-subtle)',
    borderRadius: '12px',
    padding: '12px',
    backgroundColor: 'var(--bg-secondary)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '16px'
  },
  chapterCheckboxLabel: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    userSelect: 'none'
  },
  configControlsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    margin: '16px 0'
  },
  controlGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  controlLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-secondary)'
  },
  optionsRowPills: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  pillBtn: {
    padding: '6px 16px',
    borderRadius: '20px',
    border: '1px solid var(--border-default)',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    transition: 'all 0.15s'
  },
  optionRowCustom: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '12px',
    borderTop: '1px solid var(--border-subtle)'
  },
  progressBarContainer: {
    width: '100%',
    height: '8px',
    backgroundColor: 'var(--bg-elevated)',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  progressBarFiller: {
    height: '100%',
    backgroundColor: 'var(--accent)',
    borderRadius: '4px',
    transition: 'width 0.3s ease'
  }
};
