import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../utils/storage';
import { callAI } from '../utils/api';
import { CHAPTERS } from '../data/chapters';
import { useUser } from '../components/UserContext';
import { useToast } from '../components/ToastContext';
import OptionButton from '../components/OptionButton';
import { parseLaTeX } from '../components/DailyChallenge';
import { NoteIcon, ClockIcon, ThunderIcon, WarningIcon } from '../components/Icons';

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
  const { gainXP } = useUser();
  const { showToast } = useToast();

  const [testPhase, setTestPhase] = useState('config');
  const [configTab, setConfigTab] = useState('sim');
  const [simType, setSimType] = useState('pcm');
  const [customSubject, setCustomSubject] = useState('physics');
  const [selectedChapters, setSelectedChapters] = useState(() => {
    const chapters = CHAPTERS['physics'] || [];
    const initial = {};
    chapters.forEach(ch => { initial[ch.id] = true; });
    return initial;
  });
  const [customQCount, setCustomQCount] = useState(10);
  const [customDifficulty, setCustomDifficulty] = useState('medium');
  const [isTimerEnabled, setIsTimerEnabled] = useState(true);

  const [loadingProgress, setLoadingProgress] = useState(0);
  const [totalQuestionsToLoad, setTotalQuestionsToLoad] = useState(0);

  const [test, setTest] = useState(null);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);

  const [score, setScore] = useState(0);
  const [grade, setGrade] = useState('D');
  const [resultsList, setResultsList] = useState([]);
  const [weakTips, setWeakTips] = useState({});
  const [tipsLoading, setTipsLoading] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);

  const toggleChapter = (id) => setSelectedChapters(prev => ({ ...prev, [id]: !prev[id] }));

  useEffect(() => {
    if (testPhase !== 'testing') return;
    if (configTab === 'custom' && !isTimerEnabled) return;
    if (timeLeft <= 0) { handleSubmitTest(); return; }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [testPhase, timeLeft, configTab, isTimerEnabled]);

  const formatCountdown = (secs) => {
    if (secs < 0) return '0:00';
    const mins = Math.floor(secs / 60);
    return `${mins}:${(secs % 60).toString().padStart(2, '0')}`;
  };

  const startTestLoading = async (subjectParamsList) => {
    setTestPhase('loading');
    setLoadingProgress(0);
    const totalQs = subjectParamsList.reduce((acc, curr) => acc + curr.count, 0);
    setTotalQuestionsToLoad(totalQs);

    try {
      const allQuestions = [];
      for (const param of subjectParamsList) {
        let generated = 0;
        while (generated < param.count) {
          const batchSize = Math.min(5, param.count - generated);
          const batch = await generateTestQuestionsBatch(param.subject, param.chapters, batchSize, param.difficulty);
          allQuestions.push(...batch);
          generated += batchSize;
          setLoadingProgress(allQuestions.length);
        }
      }
      if (simType === 'pcm' && configTab === 'sim') allQuestions.sort(() => Math.random() - 0.5);

      setTest({ questions: allQuestions });
      let durationSeconds = 0;
      if (configTab === 'sim') durationSeconds = simType === 'pcm' ? 180 * 60 : 60 * 60;
      else durationSeconds = isTimerEnabled ? customQCount * 2 * 60 : 9999 * 60;

      setTimeLeft(durationSeconds);
      setAnswers({});
      setFlaggedQuestions({});
      setCurrentQIdx(0);
      setTestPhase('testing');
    } catch {
      showToast('Error generating questions. Please try again.', 'error');
      setTestPhase('config');
    }
  };

  const handleStartTest = () => {
    if (configTab === 'sim') {
      if (simType === 'pcm') {
        startTestLoading([
          { subject: 'physics', chapters: CHAPTERS.physics.map(c => c.name), count: 25, difficulty: 'medium' },
          { subject: 'chemistry', chapters: CHAPTERS.chemistry.map(c => c.name), count: 25, difficulty: 'medium' },
          { subject: 'math', chapters: CHAPTERS.math.map(c => c.name), count: 25, difficulty: 'medium' }
        ]);
      } else {
        const sub = simType === 'phy' ? 'physics' : simType === 'chem' ? 'chemistry' : 'math';
        startTestLoading([{ subject: sub, chapters: CHAPTERS[sub].map(c => c.name), count: 25, difficulty: 'medium' }]);
      }
    } else {
      const active = CHAPTERS[customSubject]?.filter(c => selectedChapters[c.id]).map(c => c.name) || [];
      if (!active.length) { showToast('Select at least one chapter.', 'warning'); return; }
      startTestLoading([{ subject: customSubject, chapters: active, count: customQCount, difficulty: customDifficulty }]);
    }
  };

  const handleSelectOption = (letter) => setAnswers(prev => ({ ...prev, [currentQIdx]: letter }));
  const toggleFlag = () => setFlaggedQuestions(prev => ({ ...prev, [currentQIdx]: !prev[currentQIdx] }));

  async function handleSubmitTest() {
    if (!test) return;
    let correctCount = 0;
    const items = test.questions.map((q, idx) => {
      const chosen = answers[idx];
      const correct = chosen === q.answer;
      if (correct) correctCount++;
      return { question: q.question, concept: q.primaryConcept, difficulty: q.difficulty, chosen: chosen || '—', correctAnswer: q.answer, correct, whyCorrect: q.whyCorrect };
    });

    setResultsList(items);
    setScore(correctCount);
    const ratio = correctCount / test.questions.length;
    let computedGrade = 'D';
    if (ratio >= 0.95) computedGrade = 'S';
    else if (ratio >= 0.8) computedGrade = 'A';
    else if (ratio >= 0.6) computedGrade = 'B';
    else if (ratio >= 0.4) computedGrade = 'C';
    setGrade(computedGrade);
    setTestPhase('completed');

    let count = 0;
    const interval = setInterval(() => {
      if (count < correctCount) { count++; setAnimatedScore(count); }
      else clearInterval(interval);
    }, 1500 / Math.max(correctCount, 1));

    const weeklyData = storage.getWeeklyData();
    const isSimulation = configTab === 'sim';
    weeklyData.testHistory.push({ date: new Date().toISOString(), score: correctCount, total: test.questions.length, subject: isSimulation ? `Sim (${simType.toUpperCase()})` : `Custom (${customSubject.toUpperCase()})`, challengeMode: isSimulation });

    const wrongConcepts = [...new Set(items.filter(i => !i.correct).map(i => i.concept))];
    weeklyData.currentWeekConcepts = [...new Set([...(weeklyData.currentWeekConcepts || []), ...wrongConcepts])];
    storage.setWeeklyData(weeklyData);

    const multiplier = isSimulation ? 1.5 : 1.0;
    gainXP(Math.round(correctCount * 20 * multiplier));

    if (wrongConcepts.length > 0) {
      setTipsLoading(true);
      try {
        const prompt = `Generate revision tips for these weak JEE concepts: ${wrongConcepts.join(', ')}.
Return ONLY this JSON schema mapping concepts to a one-sentence tip:
{ "tips": { "conceptName": "one sentence action revision advice" } }`;
        const data = await callAI(prompt);
        setWeakTips(data.tips || {});
      } catch { /* ignore */ }
      finally { setTipsLoading(false); }
    }
  }

  const sortedResults = useMemo(() => [...resultsList].sort((a, b) => (a.correct === b.correct ? 0 : a.correct ? 1 : -1)), [resultsList]);

  const getScoreColor = () => {
    const ratio = score / (test?.questions.length || 10);
    return ratio >= 0.7 ? 'var(--success)' : ratio >= 0.4 ? 'var(--warning)' : 'var(--danger)';
  };

  // ─── CONFIG PHASE ───
  if (testPhase === 'config') {
    return (
      <div style={{ minHeight: '100vh', paddingBottom: '48px' }}>
        <div className="mx-auto px-4 max-w-2xl" style={{ paddingTop: '64px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <NoteIcon size={22} /> Mock & Practice
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '28px' }}>Full JEE simulations or topic-specific practice.</p>

          {/* Tab selector */}
          <div style={styles.segmentedControl}>
            <button style={{ ...styles.segmentBtn, backgroundColor: configTab === 'sim' ? 'var(--accent)' : 'transparent', color: configTab === 'sim' ? '#fff' : 'var(--text-secondary)' }} onClick={() => setConfigTab('sim')}>Exam Simulation</button>
            <button style={{ ...styles.segmentBtn, backgroundColor: configTab === 'custom' ? 'var(--accent)' : 'transparent', color: configTab === 'custom' ? '#fff' : 'var(--text-secondary)' }} onClick={() => setConfigTab('custom')}>Custom Practice</button>
          </div>

          {configTab === 'sim' ? (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0 }}>Select paper type</h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
                {[
                  { id: 'pcm', label: 'Full PCM', desc: '75 Qs · 180 min' },
                  { id: 'phy', label: 'Physics', desc: '25 Qs · 60 min' },
                  { id: 'chem', label: 'Chemistry', desc: '25 Qs · 60 min' },
                  { id: 'math', label: 'Math', desc: '25 Qs · 60 min' },
                ].map(item => (
                  <div
                    key={item.id}
                    onClick={() => setSimType(item.id)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: simType === item.id ? '1.5px solid var(--accent)' : '1px solid var(--border-default)',
                      backgroundColor: simType === item.id ? 'var(--accent-dim)' : 'var(--bg-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{item.label}</strong>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0' }}>{item.desc}</p>
                  </div>
                ))}
              </div>

              <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--danger-dim)', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
                  <strong style={{ color: 'var(--danger)' }}>Exam mode:</strong> No hints, no scaffolding. Timer auto-submits.
                </p>
              </div>

              <button className="btn btn-primary w-full" onClick={handleStartTest}>Launch Exam</button>
            </div>
          ) : (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Subject */}
              <div>
                <label style={styles.label}>Subject</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {['physics', 'chemistry', 'math'].map(sub => (
                    <button key={sub} style={{ ...styles.pillBtn, backgroundColor: customSubject === sub ? 'var(--accent)' : 'var(--bg-secondary)', color: customSubject === sub ? '#fff' : 'var(--text-secondary)', borderColor: customSubject === sub ? 'var(--accent)' : 'var(--border-default)' }} onClick={() => setCustomSubject(sub)}>
                      {sub.charAt(0).toUpperCase() + sub.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chapters */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={styles.label}>Chapters</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-ghost" style={{ padding: '0', fontSize: '11px' }} onClick={() => { const u = {}; CHAPTERS[customSubject]?.forEach(c => u[c.id] = true); setSelectedChapters(u); }}>All</button>
                    <button className="btn btn-ghost" style={{ padding: '0', fontSize: '11px' }} onClick={() => { const u = {}; CHAPTERS[customSubject]?.forEach(c => u[c.id] = false); setSelectedChapters(u); }}>None</button>
                  </div>
                </div>
                <div style={{ maxHeight: '160px', overflowY: 'auto', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '8px', backgroundColor: 'var(--bg-secondary)' }}>
                  {(CHAPTERS[customSubject] || []).map(ch => (
                    <label key={ch.id} style={{ display: 'flex', alignItems: 'center', padding: '4px 0', cursor: 'pointer', fontSize: '13px', color: 'var(--text-primary)' }}>
                      <input type="checkbox" checked={!!selectedChapters[ch.id]} onChange={() => toggleChapter(ch.id)} style={{ width: '14px', height: '14px', accentColor: 'var(--accent)', marginRight: '8px' }} />
                      {ch.name}
                    </label>
                  ))}
                </div>
              </div>

              {/* Config */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={styles.label}>Questions</label>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {[5, 10, 15, 20, 25].map(cnt => (
                      <button key={cnt} style={{ ...styles.miniPill, backgroundColor: customQCount === cnt ? 'var(--accent)' : 'var(--bg-secondary)', color: customQCount === cnt ? '#fff' : 'var(--text-secondary)' }} onClick={() => setCustomQCount(cnt)}>{cnt}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={styles.label}>Difficulty</label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {['easy', 'medium', 'hard'].map(diff => (
                      <button key={diff} style={{ ...styles.miniPill, textTransform: 'capitalize', backgroundColor: customDifficulty === diff ? 'var(--accent)' : 'var(--bg-secondary)', color: customDifficulty === diff ? '#fff' : 'var(--text-secondary)' }} onClick={() => setCustomDifficulty(diff)}>{diff}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
                <div>
                  <strong style={{ fontSize: '13px' }}>Timer</strong>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '1px 0 0' }}>2 min per question</p>
                </div>
                <input type="checkbox" checked={isTimerEnabled} onChange={e => setIsTimerEnabled(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: 'var(--accent)' }} />
              </div>

              <button className="btn btn-primary w-full" onClick={handleStartTest}>Launch Practice</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── LOADING ───
  if (testPhase === 'loading') {
    const percent = totalQuestionsToLoad > 0 ? Math.round((loadingProgress / totalQuestionsToLoad) * 100) : 0;
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>Generating questions...</p>
          <div style={{ width: '200px', height: '4px', backgroundColor: 'var(--bg-elevated)', borderRadius: '2px', overflow: 'hidden', margin: '0 auto 12px' }}>
            <div style={{ height: '100%', backgroundColor: 'var(--accent)', borderRadius: '2px', width: `${percent}%`, transition: 'width 0.3s ease' }} />
          </div>
          <span style={{ fontSize: '12px', color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{loadingProgress}/{totalQuestionsToLoad}</span>
        </div>
      </div>
    );
  }

  // ─── TESTING ───
  if (testPhase === 'testing' && test) {
    const question = test.questions[currentQIdx];
    const isPulsing = timeLeft < 120;
    const isRed = timeLeft < 300;

    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
        {/* Fixed Header */}
        <div style={styles.testHeader} className="glass">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {configTab === 'sim' ? <ThunderIcon size={12} color="var(--warning)" /> : <NoteIcon size={12} />}
              {configTab === 'sim' ? `Sim ${simType.toUpperCase()}` : `Practice ${customSubject.charAt(0).toUpperCase() + customSubject.slice(1)}`}
            </span>
            <span style={{ fontSize: '14px', fontWeight: '700', fontFamily: 'var(--font-mono)', color: isRed ? 'var(--danger)' : 'var(--text-secondary)', animation: isPulsing ? 'pulse 1s infinite' : 'none' }}>
              <ClockIcon size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
              {(!isTimerEnabled && configTab === 'custom') ? '∞' : formatCountdown(timeLeft)}
            </span>
            <button className="btn btn-secondary" style={{ padding: '5px 12px', fontSize: '11px' }} onClick={handleSubmitTest}>Submit</button>
          </div>

          {/* Nav dots */}
          <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingTop: '4px' }}>
            {test.questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQIdx(idx)}
                style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  border: `1px solid ${idx === currentQIdx ? 'var(--accent)' : flaggedQuestions[idx] ? 'var(--warning)' : 'var(--border-default)'}`,
                  backgroundColor: answers[idx] !== undefined ? 'var(--accent)' : 'var(--bg-secondary)',
                  color: answers[idx] !== undefined ? '#fff' : 'var(--text-muted)',
                  fontSize: '10px', fontWeight: '700', fontFamily: 'var(--font-mono)',
                  cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative',
                }}
              >
                {idx + 1}
                {flaggedQuestions[idx] && <span style={{ position: 'absolute', top: '-1px', right: '-1px', width: '5px', height: '5px', backgroundColor: 'var(--warning)', borderRadius: '50%' }} />}
              </button>
            ))}
          </div>
        </div>

        {/* Question Body */}
        <div style={{ paddingTop: '100px', paddingBottom: '32px', flex: 1 }} className="mx-auto px-4 max-w-lg w-full">
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>Q{currentQIdx + 1} · {question.difficulty}</span>
              <button style={{ background: 'none', border: 'none', fontSize: '11px', fontWeight: '600', color: flaggedQuestions[currentQIdx] ? 'var(--warning)' : 'var(--text-muted)', cursor: 'pointer' }} onClick={toggleFlag}>
                🚩 {flaggedQuestions[currentQIdx] ? 'Flagged' : 'Flag'}
              </button>
            </div>
            <div style={{ fontSize: '15px', fontWeight: '500', lineHeight: '1.6' }}>
              {parseLaTeX(question.question)}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
            {Object.entries(question.options).map(([key, val]) => (
              <OptionButton key={key} letter={key} value={val} isSelected={answers[currentQIdx] === key} showAnswer={false} onClick={() => handleSelectOption(key)} />
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginTop: '20px' }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} disabled={currentQIdx === 0} onClick={() => setCurrentQIdx(currentQIdx - 1)}>← Prev</button>
            <button className="btn btn-secondary" style={{ flex: 1 }} disabled={currentQIdx === test.questions.length - 1} onClick={() => setCurrentQIdx(currentQIdx + 1)}>Next →</button>
          </div>
        </div>
      </div>
    );
  }

  // ─── RESULTS ───
  if (testPhase === 'completed' && test) {
    const totalQCount = test.questions.length;
    const accuracyPct = Math.round((score / totalQCount) * 100);
    const isSimulation = configTab === 'sim';

    return (
      <div style={{ minHeight: '100vh', paddingBottom: '48px' }}>
        <div className="mx-auto px-4 max-w-3xl" style={{ paddingTop: '64px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '4px' }}>Results</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '28px' }}>Your performance breakdown.</p>

          {/* Score Hero */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '24px' }}>
            <div className="card" style={{ textAlign: 'center', padding: '32px 24px' }}>
              <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--warning)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Grade {grade}</span>
              <div style={{ fontSize: '48px', fontWeight: '800', fontFamily: 'var(--font-mono)', color: getScoreColor(), lineHeight: '1.1', margin: '8px 0' }}>
                {animatedScore}<span style={{ fontSize: '20px', color: 'var(--text-muted)' }}>/{totalQCount}</span>
              </div>
              <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--bg-elevated)', borderRadius: '2px', overflow: 'hidden', marginTop: '8px' }}>
                <div style={{ height: '100%', backgroundColor: getScoreColor(), borderRadius: '2px', width: `${accuracyPct}%`, transition: 'width 1s ease' }} />
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>{accuracyPct}% accuracy</p>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  ['Type', isSimulation ? 'Exam Simulation' : 'Practice'],
                  ['Score', `${score}/${totalQCount}`],
                  ['XP Earned', `+${Math.round(score * 20 * (isSimulation ? 1.5 : 1))}`],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                    <span style={{ fontWeight: '600' }}>{value}</span>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '12px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
                Nexus JEE
              </p>
            </div>
          </div>

          {/* Weak Tips */}
          {resultsList.some(r => !r.correct) && (
            <div className="card" style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <WarningIcon size={14} color="var(--warning)" /> Weak Areas
              </h3>
              {tipsLoading ? (
                <div className="skeleton" style={{ height: '48px', width: '100%' }} />
              ) : (
                Object.entries(weakTips).map(([concept, tip], idx) => (
                  <div key={idx} style={{ padding: '10px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)', fontSize: '12px' }}>
                    <strong style={{ color: 'var(--accent)' }}>{concept}</strong>
                    <p style={{ margin: '2px 0 0', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{tip}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Breakdown Table */}
          <div className="card" style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 12px' }}>Question Breakdown</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
                    <th style={{ padding: '8px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '600', fontSize: '10px', textTransform: 'uppercase' }}>Result</th>
                    <th style={{ padding: '8px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '600', fontSize: '10px', textTransform: 'uppercase' }}>Concept</th>
                    <th style={{ padding: '8px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '600', fontSize: '10px', textTransform: 'uppercase' }}>Your / Correct</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedResults.map((res, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '8px', color: res.correct ? 'var(--success)' : 'var(--danger)', fontWeight: '600' }}>{res.correct ? '✓' : '✗'}</td>
                      <td style={{ padding: '8px', color: 'var(--text-primary)' }}>{res.concept}</td>
                      <td style={{ padding: '8px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{res.chosen} / {res.correctAnswer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <button className="btn btn-primary w-full" style={{ marginTop: '8px' }} onClick={() => navigate('/')}>Back to Dashboard</button>
        </div>
      </div>
    );
  }

  return null;
}

const styles = {
  segmentedControl: {
    display: 'flex',
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: 'var(--radius-md)',
    padding: '3px',
    marginBottom: '20px',
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
  label: {
    fontSize: '11px',
    fontWeight: '600',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
    display: 'block',
    marginBottom: '6px',
  },
  pillBtn: {
    padding: '6px 14px',
    borderRadius: 'var(--radius-full)',
    border: '1px solid var(--border-default)',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    transition: 'all 0.15s',
  },
  miniPill: {
    padding: '4px 10px',
    borderRadius: 'var(--radius-full)',
    border: '1px solid var(--border-default)',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: '600',
    transition: 'all 0.15s',
  },
  testHeader: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    padding: '10px 16px 6px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    borderBottom: '1px solid var(--border-subtle)',
    backgroundColor: 'var(--bg-primary)',
  },
};
