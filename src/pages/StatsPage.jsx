import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage, getLevelDetails } from '../utils/storage';
import { getConceptReviewStatus } from '../utils/spaceRepetition';
import { CHAPTERS } from '../data/chapters';
import Heatmap from '../components/Heatmap';
import AchievementsList from '../components/Achievements';
import { useUser } from '../components/UserContext';
import { useToast } from '../components/ToastContext';
import { parseLaTeX } from '../components/DailyChallenge';
import { StatsIcon, HintIcon } from '../components/Icons';
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, 
  Tooltip, ResponsiveContainer, 
  LineChart, Line, CartesianGrid, ReferenceLine, Legend 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// Lookup: chapterId -> name & subject
const CHAPTER_LOOKUP = {};
Object.keys(CHAPTERS).forEach(sub => {
  CHAPTERS[sub].forEach(ch => {
    CHAPTER_LOOKUP[ch.id] = { name: ch.name, subject: sub };
  });
});

export default function StatsPage() {
  const navigate = useNavigate();
  const { bookmarks, removeBookmark, name } = useUser();
  const { showToast } = useToast();

  const progress = useMemo(() => storage.getProgress(), []);
  const sessions = useMemo(() => storage.getSessions(), []);
  const mistakes = useMemo(() => storage.getMistakes(), []);
  const weeklyData = useMemo(() => storage.getWeeklyData(), []);
  const conceptsLearned = useMemo(() => storage.getConceptsLearned(), []);

  // UI tabs
  const [activeSubjectTab, setActiveSubjectTab] = useState('physics');
  const [selectedMistakeCategory, setSelectedMistakeCategory] = useState('all'); // all, conceptual_gap, etc.
  const [selectedConcept, setSelectedConcept] = useState(null); // for concept details modal
  const [showMethodologyTip, setShowMethodologyTip] = useState(false);

  // ─── Score Prediction (Arc Gauge) ───
  const totalAttempted = useMemo(() => sessions.reduce((sum, s) => sum + (s.attempted || 0), 0), [sessions]);
  const totalSolvedClean = useMemo(() => sessions.reduce((sum, s) => sum + (s.solvedClean || 0), 0), [sessions]);
  const totalSessions = sessions.length;

  const predictedRange = useMemo(() => {
    if (totalAttempted === 0) return { low: 0, high: 0, text: 'No solve history available yet.' };
    const solveRate = totalSolvedClean / totalAttempted;
    const rawScore = totalAttempted * 6.6 * solveRate;
    const low = Math.min(300, Math.max(0, Math.floor(rawScore * 0.85)));
    const high = Math.min(300, Math.max(0, Math.ceil(rawScore * 1.15)));
    return {
      low,
      high,
      text: `Based on ${totalSessions} sessions and ${totalAttempted} solves.`
    };
  }, [totalAttempted, totalSolvedClean, totalSessions]);

  // Arc gauge calculation
  const gaugePercent = useMemo(() => {
    const avgScore = (predictedRange.low + predictedRange.high) / 2;
    return (avgScore / 300) * 100;
  }, [predictedRange]);

  // Animated arc on mount
  const [arcOffset, setArcOffset] = useState(250);
  useEffect(() => {
    // 250 is full dasharray, calculate offset
    const circumference = 250;
    const offset = circumference - (gaugePercent / 100) * circumference;
    const timer = setTimeout(() => {
      setArcOffset(offset);
    }, 300);
    return () => clearTimeout(timer);
  }, [gaugePercent]);

  // ─── Mistake DNA (Donut Chart) ───
  const mistakeChartData = useMemo(() => {
    const counts = { conceptual_gap: 0, calculation_error: 0, misread_question: 0, distractor_trap: 0 };
    mistakes.forEach(m => {
      if (counts.hasOwnProperty(m.category)) counts[m.category]++;
    });
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([k, v]) => ({
        id: k,
        name: k.replace(/_/g, ' ').toUpperCase(),
        value: v
      }));
  }, [mistakes]);

  const MISTAKE_COLORS = {
    conceptual_gap: 'var(--danger)',
    calculation_error: 'var(--warning)',
    misread_question: 'var(--accent)',
    distractor_trap: '#a855f7'
  };

  // Filtered mistakes list
  const filteredMistakes = useMemo(() => {
    if (selectedMistakeCategory === 'all') return mistakes.slice(-10).reverse();
    return mistakes.filter(m => m.category === selectedMistakeCategory).slice(-10).reverse();
  }, [mistakes, selectedMistakeCategory]);

  // ─── Chapter Mastery Stacked Bar Chart ───
  const masteryChartData = useMemo(() => {
    const chaptersList = CHAPTERS[activeSubjectTab] || [];
    return chaptersList.map(ch => {
      const p = progress[ch.id] || {};
      const attempted = p.questionsAttempted || 0;
      
      // Calculate solves based on session logs for that chapter
      let clean = 0;
      let scaffolded = 0;
      sessions.forEach(s => {
        if (s.chapterId === ch.id) {
          clean += s.solvedClean || 0;
          scaffolded += ((s.attempted || 0) - (s.solvedClean || 0));
        }
      });

      return {
        name: ch.name.substring(0, 16) + (ch.name.length > 16 ? '...' : ''),
        Attempted: attempted,
        Clean: clean,
        Scaffolded: Math.max(0, scaffolded)
      };
    });
  }, [activeSubjectTab, progress, sessions]);

  // ─── Weekly Test History ───
  const testHistoryData = useMemo(() => {
    const list = weeklyData.testHistory || [];
    return list.slice(-6).map((t, idx) => ({
      name: `Test ${idx + 1}`,
      Score: t.score
    }));
  }, [weeklyData]);

  // ─── Bookmarks Organized by Chapter ───
  const bookmarksGrouped = useMemo(() => {
    const groups = {};
    bookmarks.forEach(b => {
      const chapterId = b.chapterId || 'other';
      if (!groups[chapterId]) {
        groups[chapterId] = {
          chapterName: CHAPTER_LOOKUP[chapterId]?.name || 'Bookmarked Questions',
          subject: CHAPTER_LOOKUP[chapterId]?.subject || 'mixed',
          list: []
        };
      }
      groups[chapterId].list.push(b);
    });
    return Object.values(groups);
  }, [bookmarks]);

  // --- Session replay accordions state ---
  const [expandedSessionIdx, setExpandedSessionIdx] = useState(null);

  return (
    <div style={styles.page}>
      <div className="main-content mx-auto p-6 max-w-4xl">
        <h2 style={{ ...styles.pageTitle, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <StatsIcon size={24} /> Performance Analytics
        </h2>
        <p style={styles.pageSubtitle}>Diagnostic stats, mastery models, and weak point tips.</p>

        {/* Grid Section 1: Predicted Score + Test History */}
        <div style={styles.grid2Col}>
          
          {/* Predicted Score Card */}
          <div style={styles.predictedCard} className="card" onClick={() => setShowMethodologyTip(!showMethodologyTip)}>
            <h3 style={styles.cardHeader}>Projected Score</h3>
            
            <div style={styles.gaugeContainer}>
              <svg width="160" height="100" viewBox="0 0 100 60">
                {/* Background arc */}
                <path
                  d="M 10 50 A 40 40 0 0 1 90 50"
                  fill="none"
                  stroke="var(--bg-elevated)"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                {/* Foreground colored arc */}
                <path
                  d="M 10 50 A 40 40 0 0 1 90 50"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="250"
                  strokeDashoffset={arcOffset}
                  style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                />
                <text x="50" y="46" textAnchor="middle" fill="var(--text-primary)" fontSize="13" fontWeight="bold" fontFamily="var(--font-mono)">
                  {predictedRange.low}–{predictedRange.high}
                </text>
                <text x="50" y="58" textAnchor="middle" fill="var(--text-secondary)" fontSize="7">
                  MAX 300
                </text>
              </svg>
            </div>
            
            <p style={styles.predictedDesc}>{predictedRange.text}</p>
            <span style={styles.methodologyLink}>Methodology (Tap to view)</span>
            
            <AnimatePresence>
              {showMethodologyTip && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  style={styles.methodologyTip}
                >
                  We calculate a linear model of your active correct solving accuracy across all chapters, scaling the 300 marks of JEE based on clean solved weightings.
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Test scores history chart */}
          <div style={styles.card} className="card">
            <h3 style={styles.cardHeader}>Weekly Test Scores</h3>
            {testHistoryData.length === 0 ? (
              <p style={styles.noData}>Take weekly tests to plot history.</p>
            ) : (
              <div style={{ height: '140px', width: '100%', marginTop: '12px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={testHistoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                    <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={10} />
                    <YAxis domain={[0, 15]} stroke="var(--text-secondary)" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-strong)' }} />
                    <ReferenceLine y={7} stroke="var(--success)" strokeDasharray="3 3" label={{ value: 'Target 7/10', fill: 'var(--success)', fontSize: 9 }} />
                    <ReferenceLine y={5} stroke="var(--danger)" strokeDasharray="3 3" label={{ value: 'Cutoff 5/10', fill: 'var(--danger)', fontSize: 9 }} />
                    <Line type="monotone" dataKey="Score" stroke="var(--accent)" strokeWidth={2} dot={{ fill: 'var(--accent)' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        <hr style={styles.divider} />

        {/* Section 2: Heatmap activity grid */}
        <div style={{ marginBottom: '24px' }}>
          <Heatmap />
        </div>

        {/* Section 3: Mistake DNA Donut & Table */}
        <div style={styles.card} className="card" style={{ marginBottom: '24px' }}>
          <h3 style={styles.cardHeader}>Mistake DNA</h3>
          <p style={styles.pageSubtitle}>Diagnostic categories mapping why you got questions wrong.</p>

          {mistakeChartData.length === 0 ? (
            <p style={styles.noData}>No mistakes recorded yet. Clean streak intact!</p>
          ) : (
            <div style={styles.mistakeGrid}>
              <div style={{ height: '160px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mistakeChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={4}
                      dataKey="value"
                      onClick={(e) => {
                        if (e && e.id) {
                          setSelectedMistakeCategory(prev => prev === e.id ? 'all' : e.id);
                        }
                      }}
                    >
                      {mistakeChartData.map((entry, idx) => (
                        <Cell 
                          key={idx} 
                          fill={MISTAKE_COLORS[entry.id]} 
                          style={{ 
                            cursor: 'pointer',
                            opacity: selectedMistakeCategory === 'all' || selectedMistakeCategory === entry.id ? 1 : 0.4
                          }} 
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend boxes */}
              <div style={styles.legendCol}>
                {Object.entries(MISTAKE_COLORS).map(([id, color]) => (
                  <button
                    key={id}
                    onClick={() => setSelectedMistakeCategory(prev => prev === id ? 'all' : id)}
                    style={{
                      ...styles.legendItem,
                      border: selectedMistakeCategory === id ? `1px solid ${color}` : '1px solid transparent',
                      backgroundColor: selectedMistakeCategory === id ? 'var(--bg-elevated)' : 'transparent'
                    }}
                  >
                    <div style={{ ...styles.legendIndicator, backgroundColor: color }} />
                    <span style={styles.legendLabel}>{id.replace(/_/g, ' ')}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* List of filtered mistakes */}
          {mistakes.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <strong style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Recent Mistakes Log ({selectedMistakeCategory === 'all' ? 'All categories' : selectedMistakeCategory.replace(/_/g, ' ')}):
              </strong>
              <div style={styles.mistakesTable}>
                {filteredMistakes.map((m, i) => (
                  <div key={i} style={styles.mistakeRow} className="card">
                    <div style={styles.mistakeMetaRow}>
                      <span style={{
                        ...styles.mistakeTag,
                        color: MISTAKE_COLORS[m.category] || 'var(--accent)',
                        backgroundColor: `${MISTAKE_COLORS[m.category] || 'var(--accent)'}15`
                      }}>{m.category?.replace(/_/g, ' ')}</span>
                      <span style={styles.dateText}>{new Date(m.date).toLocaleDateString()}</span>
                    </div>
                    <p style={styles.mistakeQuestion}>{parseLaTeX(m.question)}</p>
                    {m.advice && (
                      <p style={{ ...styles.mistakeAdvice, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <HintIcon size={14} color="var(--warning)" />
                        <strong>Tip:</strong> {m.advice}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Section 4: Concept Map Visual Tree */}
        <div style={styles.card} className="card" style={{ marginBottom: '24px' }}>
          <h3 style={styles.cardHeader}>Visual Concept Map</h3>
          <p style={styles.pageSubtitle}>Curriculum nodes branch showing spaced repetition statuses.</p>

          {conceptsLearned.length === 0 ? (
            <p style={styles.noData}>No concepts learned yet. Start study mode!</p>
          ) : (
            <div style={styles.conceptTreeContainer}>
              {/* Simplistic visual node hierarchy grouped by chapter */}
              {Object.entries(
                conceptsLearned.reduce((acc, c) => {
                  const chName = CHAPTER_LOOKUP[c.chapterId]?.name || 'Other';
                  if (!acc[chName]) acc[chName] = [];
                  acc[chName].push(c);
                  return acc;
                }, {})
              ).map(([chapterName, list], idx) => (
                <div key={idx} style={styles.treeChapterNode}>
                  <div style={styles.treeChapterHeader}>
                    <div style={styles.connectorDot} />
                    <span style={styles.treeChapterTitle}>{chapterName}</span>
                  </div>
                  
                  <div style={styles.treeConceptsList}>
                    {list.map((c, cIdx) => {
                      const reviewInfo = getConceptReviewStatus(c);
                      return (
                        <div 
                          key={cIdx} 
                          style={styles.treeConceptItem}
                          onClick={() => setSelectedConcept(c)}
                        >
                          <span style={styles.conceptLeafLine} />
                          <div 
                            style={{
                              ...styles.conceptLeaf,
                              borderColor: reviewInfo.badgeColor,
                              backgroundColor: reviewInfo.badgeDimColor
                            }}
                          >
                            <span style={{ fontWeight: '500' }}>{c.concept}</span>
                            <span style={{ fontSize: '9px', opacity: 0.8 }}>({reviewInfo.label})</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Concept details popup modal */}
        <AnimatePresence>
          {selectedConcept && (
            <>
              <div style={styles.modalBackdrop} onClick={() => setSelectedConcept(null)} />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={styles.conceptModal}
                className="card glass"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                  <h4 style={{ margin: 0 }}>Concept Recall Stats</h4>
                  <button style={styles.closeBtn} onClick={() => setSelectedConcept(null)}>✕</button>
                </div>
                <div style={styles.modalBody}>
                  <p><strong>Concept:</strong> {selectedConcept.concept}</p>
                  <p><strong>Chapter:</strong> {CHAPTER_LOOKUP[selectedConcept.chapterId]?.name || 'General'}</p>
                  <p><strong>Learned At:</strong> {new Date(selectedConcept.learnedAt).toLocaleString()}</p>
                  <p><strong>Spaced Interval Stage:</strong> Stage {selectedConcept.reviewStage || 0} / 4</p>
                  <p><strong>Next Active Review:</strong> {new Date(selectedConcept.nextReview).toLocaleDateString()}</p>
                </div>
                <button className="btn btn-secondary w-full" onClick={() => setSelectedConcept(null)}>
                  Close
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Section 5: Chapter Mastery Bar Charts */}
        <div style={styles.card} className="card" style={{ marginBottom: '24px' }}>
          <div style={styles.masteryHeader}>
            <h3 style={styles.cardHeader}>Chapter Solves Mastery</h3>
            <div style={styles.selectorSub}>
              {['physics', 'chemistry', 'math'].map(sub => (
                <button
                  key={sub}
                  style={{
                    ...styles.subFilterBtn,
                    backgroundColor: activeSubjectTab === sub ? 'var(--accent)' : 'transparent'
                  }}
                  onClick={() => setActiveSubjectTab(sub)}
                >
                  {sub.toUpperCase().substring(0, 4)}
                </button>
              ))}
            </div>
          </div>

          <div style={{ height: '240px', width: '100%', marginTop: '16px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={masteryChartData} margin={{ left: -10, right: 10 }}>
                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={9} />
                <YAxis stroke="var(--text-secondary)" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-strong)' }} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="Clean" stackId="a" fill="var(--success)" />
                <Bar dataKey="Scaffolded" stackId="a" fill="var(--warning)" />
                <Bar dataKey="Attempted" stroke="var(--accent)" fill="none" strokeWidth={1.5} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Section 6: Achievements grids */}
        <div style={{ marginBottom: '24px' }}>
          <AchievementsList />
        </div>

        {/* Section 7: Session Replays Accordions */}
        <div style={styles.card} className="card" style={{ marginBottom: '24px' }}>
          <h3 style={styles.cardHeader}>Recent Sessions & Notes</h3>
          {sessions.length === 0 ? (
            <p style={styles.noData}>No sessions logged yet.</p>
          ) : (
            <div style={styles.accordionContainer}>
              {sessions.slice(-10).reverse().map((session, idx) => {
                const isExpanded = expandedSessionIdx === idx;
                const sessionDate = new Date(session.date).toLocaleDateString();

                return (
                  <div key={idx} style={styles.accordionGroup}>
                    <div 
                      style={styles.accordionBar}
                      onClick={() => setExpandedSessionIdx(isExpanded ? null : idx)}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <strong>{session.chapterName || 'General Session'}</strong>
                        <span style={styles.dateText}>{sessionDate}</span>
                      </div>
                      <span>{isExpanded ? '▼' : '▶'}</span>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          style={styles.accordionExpand}
                        >
                          <div style={styles.sessionDetailsBox}>
                            <p><strong>Attempted questions:</strong> {session.attempted}</p>
                            <p><strong>Clean correct solves:</strong> {session.solvedClean}</p>
                            {session.concepts && session.concepts.length > 0 && (
                              <p>
                                <strong>Concepts learned: </strong>
                                {session.concepts.join(', ')}
                              </p>
                            )}

                            {/* Revision Note written in this concept */}
                            {session.concepts?.map((c, nIdx) => {
                              const note = storage.getNote(c);
                              if (!note) return null;
                              return (
                                <div key={nIdx} style={styles.noteBox} className="card">
                                  <strong>📝 Notes on {c}:</strong>
                                  <p style={{ marginTop: '4px', fontStyle: 'italic' }}>{note}</p>
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bookmarks Section */}
        <div style={styles.card} className="card">
          <h3 style={styles.cardHeader}>Bookmarks Organiser</h3>
          <p style={styles.pageSubtitle}>Saved questions for review and repetition.</p>

          {bookmarksGrouped.length === 0 ? (
            <p style={styles.noData}>No bookmarked questions saved yet.</p>
          ) : (
            <div style={styles.bookmarksWrapper}>
              {bookmarksGrouped.map((group, gIdx) => (
                <div key={gIdx} style={styles.bookmarkChapterBlock}>
                  <div style={styles.bookmarkChapterHeader}>
                    <span style={{
                      ...styles.subjectTagIndicator,
                      backgroundColor: getSubjectColor(group.subject)
                    }} />
                    <strong>{group.chapterName}</strong>
                  </div>

                  <div style={styles.bookmarkedQuestionsList}>
                    {group.list.map((b, bIdx) => (
                      <div key={bIdx} style={styles.bookmarkItem} className="card">
                        <div style={styles.bookmarkItemHeader}>
                          <span style={styles.bookmarkConceptChip}>{b.primaryConcept}</span>
                          <button 
                            style={styles.removeBookmarkBtn}
                            onClick={() => {
                              removeBookmark(b.question);
                              showToast('Removed question bookmark', 'warning');
                            }}
                          >
                            🗑 Delete
                          </button>
                        </div>
                        <p style={styles.bookmarkQuestionText}>{parseLaTeX(b.question)}</p>
                        
                        {/* Options preview */}
                        <div style={styles.optionsPreview}>
                          {Object.entries(b.options).map(([key, val]) => (
                            <div 
                              key={key} 
                              style={{
                                ...styles.optionPreviewItem,
                                border: b.answer === key ? '1px solid var(--success)' : '1px solid var(--border-subtle)',
                                backgroundColor: b.answer === key ? 'var(--success-dim)' : 'transparent'
                              }}
                            >
                              <strong>{key}: </strong> {parseLaTeX(val)}
                            </div>
                          ))}
                        </div>

                        <button 
                          className="btn btn-secondary w-full"
                          style={{ marginTop: '12px', fontSize: '11px', padding: '6px 12px' }}
                          onClick={() => {
                            // Navigate to chapter study mode
                            navigate(`/study/${group.subject}/${b.chapterId}`);
                          }}
                        >
                          Practice Chapter Concept again →
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function getSubjectColor(subject) {
  if (subject === 'physics') return 'var(--accent)';
  if (subject === 'chemistry') return 'var(--success)';
  return 'var(--warning)';
}

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: 'var(--bg-primary)',
    paddingBottom: '80px'
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: '800',
    marginBottom: '4px'
  },
  pageSubtitle: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    marginBottom: '20px'
  },
  grid2Col: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
    marginBottom: '24px'
  },
  predictedCard: {
    padding: '24px !important',
    backgroundColor: 'var(--bg-card)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    cursor: 'pointer'
  },
  cardHeader: {
    fontSize: '15px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: 0
  },
  gaugeContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '12px'
  },
  predictedDesc: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    marginTop: '8px'
  },
  methodologyLink: {
    fontSize: '10px',
    color: 'var(--accent-hover)',
    fontWeight: '700',
    marginTop: '8px',
    textDecoration: 'underline'
  },
  methodologyTip: {
    padding: '8px 12px',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-secondary)',
    fontSize: '10px',
    color: 'var(--text-secondary)',
    marginTop: '10px',
    lineHeight: '1.4',
    border: '1px solid var(--border-subtle)'
  },
  card: {
    padding: '24px !important',
    backgroundColor: 'var(--bg-card)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  noData: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    textAlign: 'center',
    padding: '20px 0'
  },
  divider: {
    border: 'none',
    borderTop: '1px solid var(--border-subtle)',
    margin: '16px 0 24px 0'
  },
  mistakeGrid: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
    marginTop: '12px'
  },
  legendCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 12px',
    borderRadius: '10px',
    cursor: 'pointer',
    background: 'none',
    width: '100%',
    textAlign: 'left'
  },
  legendIndicator: {
    width: '12px',
    height: '12px',
    borderRadius: '3px',
    flexShrink: 0
  },
  legendLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  mistakesTable: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '12px'
  },
  mistakeRow: {
    padding: '16px !important',
    backgroundColor: 'var(--bg-secondary)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  mistakeMetaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  mistakeTag: {
    fontSize: '10px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '6px',
    textTransform: 'uppercase'
  },
  dateText: {
    fontSize: '11px',
    color: 'var(--text-muted)'
  },
  mistakeQuestion: {
    fontSize: '13px',
    color: 'var(--text-primary)',
    lineHeight: '1.4'
  },
  mistakeAdvice: {
    fontSize: '12px',
    color: 'var(--warning)',
    marginTop: '4px'
  },
  conceptTreeContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    padding: '12px 0 0 12px',
    borderLeft: '1px solid var(--border-subtle)'
  },
  treeChapterNode: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    position: 'relative'
  },
  treeChapterHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    left: '-17px',
    position: 'relative'
  },
  connectorDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: 'var(--accent)',
    boxShadow: '0 0 6px var(--accent-glow)'
  },
  treeChapterTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--text-primary)'
  },
  treeConceptsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    paddingLeft: '12px'
  },
  treeConceptItem: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer'
  },
  conceptLeafLine: {
    width: '16px',
    height: '1px',
    backgroundColor: 'var(--border-subtle)'
  },
  conceptLeaf: {
    padding: '6px 12px',
    borderRadius: '8px',
    border: '1px solid',
    fontSize: '12px',
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    transition: 'transform 0.15s',
    ':hover': {
      transform: 'translateX(4px)'
    }
  },
  modalBackdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(8, 11, 20, 0.6)',
    zIndex: 9999
  },
  conceptModal: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 10000,
    width: '90%',
    maxWidth: '360px',
    padding: '24px !important',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    fontSize: '16px',
    cursor: 'pointer'
  },
  modalBody: {
    fontSize: '13px',
    color: 'var(--text-primary)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    lineHeight: '1.4'
  },
  masteryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-subtle)',
    paddingBottom: '8px'
  },
  selectorSub: {
    display: 'flex',
    gap: '4px',
    backgroundColor: 'var(--bg-secondary)',
    padding: '3px',
    borderRadius: '8px'
  },
  subFilterBtn: {
    border: 'none',
    borderRadius: '6px',
    padding: '4px 8px',
    color: '#ffffff',
    fontSize: '9px',
    fontWeight: '700',
    cursor: 'pointer'
  },
  accordionContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  accordionGroup: {
    border: '1px solid var(--border-subtle)',
    borderRadius: '12px',
    overflow: 'hidden'
  },
  accordionBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: 'var(--bg-secondary)',
    cursor: 'pointer',
    fontSize: '13px'
  },
  accordionExpand: {
    backgroundColor: 'rgba(13, 17, 23, 0.4)',
    overflow: 'hidden'
  },
  sessionDetailsBox: {
    padding: '16px',
    fontSize: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  noteBox: {
    marginTop: '12px',
    backgroundColor: 'var(--bg-elevated)',
    padding: '12px !important'
  },
  bookmarksWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  bookmarkChapterBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  bookmarkChapterHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: 'var(--text-primary)'
  },
  subjectTagIndicator: {
    width: '4px',
    height: '14px',
    borderRadius: '2px'
  },
  bookmarkedQuestionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  bookmarkItem: {
    padding: '16px !important',
    backgroundColor: 'var(--bg-secondary)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  bookmarkItemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  bookmarkConceptChip: {
    fontSize: '10px',
    fontWeight: '700',
    color: 'var(--accent-hover)',
    backgroundColor: 'var(--accent-dim)',
    padding: '2px 8px',
    borderRadius: '6px'
  },
  removeBookmarkBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: '11px',
    cursor: 'pointer',
    ':hover': {
      color: 'var(--danger)'
    }
  },
  bookmarkQuestionText: {
    fontSize: '14px',
    color: 'var(--text-primary)',
    lineHeight: '1.5'
  },
  optionsPreview: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
    marginTop: '8px'
  },
  optionPreviewItem: {
    padding: '6px 10px',
    borderRadius: '8px',
    fontSize: '11px',
    color: 'var(--text-secondary)'
  }
};
