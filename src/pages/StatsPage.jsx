import { useState, useMemo, useEffect } from 'react';
import { storage } from '../utils/storage';
import { getConceptReviewStatus } from '../utils/spaceRepetition';
import { CHAPTERS } from '../data/chapters';
import Heatmap from '../components/Heatmap';
import AchievementsList from '../components/Achievements';
import { useUser } from '../components/UserContext';
import { useToast } from '../components/ToastContext';
import { parseLaTeX } from '../components/DailyChallenge';
import { StatsIcon } from '../components/Icons';
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, ReferenceLine, Legend
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const CHAPTER_LOOKUP = {};
Object.keys(CHAPTERS).forEach(sub => {
  CHAPTERS[sub].forEach(ch => {
    CHAPTER_LOOKUP[ch.id] = { name: ch.name, subject: sub };
  });
});

export default function StatsPage() {
  const { bookmarks, removeBookmark } = useUser();
  const { showToast } = useToast();

  const progress = useMemo(() => storage.getProgress(), []);
  const sessions = useMemo(() => storage.getSessions(), []);
  const mistakes = useMemo(() => storage.getMistakes(), []);
  const weeklyData = useMemo(() => storage.getWeeklyData(), []);
  const conceptsLearned = useMemo(() => storage.getConceptsLearned(), []);

  const [activeSubjectTab, setActiveSubjectTab] = useState('physics');
  const [selectedMistakeCategory, setSelectedMistakeCategory] = useState('all');
  const [selectedConcept, setSelectedConcept] = useState(null);
  const [showMethodologyTip, setShowMethodologyTip] = useState(false);

  const totalAttempted = useMemo(() => sessions.reduce((sum, s) => sum + (s.attempted || 0), 0), [sessions]);
  const totalSolvedClean = useMemo(() => sessions.reduce((sum, s) => sum + (s.solvedClean || 0), 0), [sessions]);
  const totalSessions = sessions.length;

  const predictedRange = useMemo(() => {
    if (totalAttempted === 0) return { low: 0, high: 0, text: 'No solve history yet.' };
    const solveRate = totalSolvedClean / totalAttempted;
    const rawScore = totalAttempted * 6.6 * solveRate;
    return {
      low: Math.min(300, Math.max(0, Math.floor(rawScore * 0.85))),
      high: Math.min(300, Math.max(0, Math.ceil(rawScore * 1.15))),
      text: `Based on ${totalSessions} sessions, ${totalAttempted} solves`
    };
  }, [totalAttempted, totalSolvedClean, totalSessions]);

  const gaugePercent = useMemo(() => ((predictedRange.low + predictedRange.high) / 2 / 300) * 100, [predictedRange]);

  const [arcOffset, setArcOffset] = useState(250);
  useEffect(() => {
    const offset = 250 - (gaugePercent / 100) * 250;
    const timer = setTimeout(() => setArcOffset(offset), 300);
    return () => clearTimeout(timer);
  }, [gaugePercent]);

  const mistakeChartData = useMemo(() => {
    const counts = { conceptual_gap: 0, calculation_error: 0, misread_question: 0, distractor_trap: 0 };
    mistakes.forEach(m => { if (m.category in counts) counts[m.category]++; });
    return Object.entries(counts).filter(([, v]) => v > 0).map(([k, v]) => ({ id: k, name: k.replace(/_/g, ' ').toUpperCase(), value: v }));
  }, [mistakes]);

  const MISTAKE_COLORS = { conceptual_gap: 'var(--danger)', calculation_error: 'var(--warning)', misread_question: 'var(--accent)', distractor_trap: '#a855f7' };

  const filteredMistakes = useMemo(() => {
    const list = selectedMistakeCategory === 'all' ? mistakes : mistakes.filter(m => m.category === selectedMistakeCategory);
    return list.slice(-8).reverse();
  }, [mistakes, selectedMistakeCategory]);

  const masteryChartData = useMemo(() => {
    return (CHAPTERS[activeSubjectTab] || []).map(ch => {
      let clean = 0, scaffolded = 0;
      sessions.forEach(s => {
        if (s.chapterId === ch.id) {
          clean += s.solvedClean || 0;
          scaffolded += ((s.attempted || 0) - (s.solvedClean || 0));
        }
      });
      return {
        name: ch.name.substring(0, 12) + (ch.name.length > 12 ? '...' : ''),
        Clean: clean,
        Scaffolded: Math.max(0, scaffolded),
      };
    });
  }, [activeSubjectTab, progress, sessions]);

  const testHistoryData = useMemo(() => {
    return (weeklyData.testHistory || []).slice(-6).map((t, idx) => ({ name: `T${idx + 1}`, Score: t.score }));
  }, [weeklyData]);

  const bookmarksGrouped = useMemo(() => {
    const groups = {};
    bookmarks.forEach(b => {
      const chapterId = b.chapterId || 'other';
      if (!groups[chapterId]) groups[chapterId] = { chapterName: CHAPTER_LOOKUP[chapterId]?.name || 'Bookmarked', subject: CHAPTER_LOOKUP[chapterId]?.subject || 'mixed', list: [] };
      groups[chapterId].list.push(b);
    });
    return Object.values(groups);
  }, [bookmarks]);

  const [expandedSessionIdx, setExpandedSessionIdx] = useState(null);

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '48px' }}>
      <div className="mx-auto px-4 max-w-4xl" style={{ paddingTop: '64px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <StatsIcon size={22} /> Analytics
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '32px' }}>Performance insights and diagnostic data.</p>

        {/* Predicted Score + Test History */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          <div className="card" style={{ textAlign: 'center', cursor: 'pointer', padding: '24px' }} onClick={() => setShowMethodologyTip(!showMethodologyTip)}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 8px' }}>Projected Score</h3>
            <svg width="140" height="80" viewBox="0 0 100 60">
              <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="var(--bg-elevated)" strokeWidth="7" strokeLinecap="round" />
              <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="var(--accent)" strokeWidth="7" strokeLinecap="round" strokeDasharray="250" strokeDashoffset={arcOffset} style={{ transition: 'stroke-dashoffset 0.8s ease-out' }} />
              <text x="50" y="44" textAnchor="middle" fill="var(--text-primary)" fontSize="12" fontWeight="bold" fontFamily="var(--font-mono)">{predictedRange.low}–{predictedRange.high}</text>
              <text x="50" y="56" textAnchor="middle" fill="var(--text-muted)" fontSize="6">MAX 300</text>
            </svg>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '4px 0 0' }}>{predictedRange.text}</p>
            <AnimatePresence>
              {showMethodologyTip && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '8px', lineHeight: '1.4' }}>
                  Linear model of solving accuracy scaled to JEE 300 marks.
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 8px' }}>Test Scores</h3>
            {testHistoryData.length === 0 ? (
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>No tests yet</p>
            ) : (
              <div style={{ height: '120px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={testHistoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={9} />
                    <YAxis domain={[0, 15]} stroke="var(--text-muted)" fontSize={9} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '8px', fontSize: '11px' }} />
                    <ReferenceLine y={7} stroke="var(--success)" strokeDasharray="3 3" />
                    <Line type="monotone" dataKey="Score" stroke="var(--accent)" strokeWidth={2} dot={{ fill: 'var(--accent)', r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '0 0 24px' }} />

        {/* Heatmap */}
        <div style={{ marginBottom: '24px' }}>
          <Heatmap />
        </div>

        {/* Mistake DNA */}
        <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 12px' }}>Mistake DNA</h3>
          {mistakeChartData.length === 0 ? (
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>No mistakes recorded.</p>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ height: '140px', width: '140px', flexShrink: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={mistakeChartData} cx="50%" cy="50%" innerRadius={40} outerRadius={55} paddingAngle={4} dataKey="value"
                      onClick={(e) => { if (e?.id) setSelectedMistakeCategory(prev => prev === e.id ? 'all' : e.id); }}>
                      {mistakeChartData.map((entry, idx) => (
                        <Cell key={idx} fill={MISTAKE_COLORS[entry.id]} style={{ cursor: 'pointer', opacity: selectedMistakeCategory === 'all' || selectedMistakeCategory === entry.id ? 1 : 0.35 }} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                {Object.entries(MISTAKE_COLORS).map(([id, color]) => (
                  <button key={id} onClick={() => setSelectedMistakeCategory(prev => prev === id ? 'all' : id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 8px', borderRadius: '6px', border: selectedMistakeCategory === id ? `1px solid ${color}` : '1px solid transparent', backgroundColor: selectedMistakeCategory === id ? 'var(--bg-elevated)' : 'transparent', cursor: 'pointer', background: 'none', width: '100%', textAlign: 'left' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: color, flexShrink: 0 }} />
                    <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-primary)', textTransform: 'uppercase' }}>{id.replace(/_/g, ' ')}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {mistakes.length > 0 && (
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filteredMistakes.map((m, i) => (
                <div key={i} style={{ padding: '10px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '9px', fontWeight: '700', color: MISTAKE_COLORS[m.category] || 'var(--accent)', textTransform: 'uppercase' }}>{m.category?.replace(/_/g, ' ')}</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{new Date(m.date).toLocaleDateString()}</span>
                  </div>
                  <p style={{ color: 'var(--text-primary)', margin: 0, lineHeight: '1.4' }}>{parseLaTeX(m.question)}</p>
                  {m.advice && <p style={{ margin: '4px 0 0', color: 'var(--warning)', fontSize: '11px' }}>💡 {m.advice}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Concept Tree */}
        <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 12px' }}>Concept Map</h3>
          {conceptsLearned.length === 0 ? (
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>No concepts yet. Start studying!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingLeft: '12px', borderLeft: '1px solid var(--border-subtle)' }}>
              {Object.entries(
                conceptsLearned.reduce((acc, c) => {
                  const chName = CHAPTER_LOOKUP[c.chapterId]?.name || 'Other';
                  if (!acc[chName]) acc[chName] = [];
                  acc[chName].push(c);
                  return acc;
                }, {})
              ).map(([chapterName, list], idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '-17px', marginBottom: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent)' }} />
                    <span style={{ fontSize: '13px', fontWeight: '700' }}>{chapterName}</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', paddingLeft: '12px' }}>
                    {list.map((c, cIdx) => {
                      const reviewInfo = getConceptReviewStatus(c);
                      return (
                        <div key={cIdx} onClick={() => setSelectedConcept(c)}
                          style={{ padding: '4px 10px', borderRadius: 'var(--radius-sm)', border: `1px solid ${reviewInfo.badgeColor}`, backgroundColor: reviewInfo.badgeDimColor, fontSize: '11px', cursor: 'pointer', display: 'flex', gap: '4px', alignItems: 'center' }}>
                          <span style={{ fontWeight: '600' }}>{c.concept}</span>
                          <span style={{ fontSize: '9px', opacity: 0.7 }}>({reviewInfo.label})</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Concept Modal */}
        <AnimatePresence>
          {selectedConcept && (
            <>
              <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 9999 }} onClick={() => setSelectedConcept(null)} />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10000, width: '90%', maxWidth: '320px', padding: '20px', borderRadius: 'var(--radius-xl)', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px', marginBottom: '12px' }}>
                  <h4 style={{ margin: 0, fontSize: '14px' }}>Concept Details</h4>
                  <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '14px' }} onClick={() => setSelectedConcept(null)}>×</button>
                </div>
                <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px', lineHeight: '1.5' }}>
                  <p><strong>Concept:</strong> {selectedConcept.concept}</p>
                  <p><strong>Chapter:</strong> {CHAPTER_LOOKUP[selectedConcept.chapterId]?.name || 'General'}</p>
                  <p><strong>Learned:</strong> {new Date(selectedConcept.learnedAt).toLocaleDateString()}</p>
                  <p><strong>Review Stage:</strong> {selectedConcept.reviewStage || 0}/4</p>
                  <p><strong>Next Review:</strong> {new Date(selectedConcept.nextReview).toLocaleDateString()}</p>
                </div>
                <button className="btn btn-secondary w-full" style={{ marginTop: '12px', fontSize: '12px' }} onClick={() => setSelectedConcept(null)}>Close</button>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Chapter Mastery */}
        <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', margin: 0 }}>Chapter Mastery</h3>
            <div style={{ display: 'flex', gap: '3px', backgroundColor: 'var(--bg-secondary)', padding: '2px', borderRadius: 'var(--radius-sm)' }}>
              {['physics', 'chemistry', 'math'].map(sub => (
                <button key={sub} style={{ border: 'none', borderRadius: '6px', padding: '3px 8px', color: activeSubjectTab === sub ? '#fff' : 'var(--text-muted)', backgroundColor: activeSubjectTab === sub ? 'var(--accent)' : 'transparent', fontSize: '10px', fontWeight: '700', cursor: 'pointer' }} onClick={() => setActiveSubjectTab(sub)}>
                  {sub.substring(0, 4).toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div style={{ height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={masteryChartData} margin={{ left: -10, right: 10 }}>
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={8} />
                <YAxis stroke="var(--text-muted)" fontSize={9} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '8px', fontSize: '11px' }} />
                <Legend iconSize={6} wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="Clean" stackId="a" fill="var(--success)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Scaffolded" stackId="a" fill="var(--warning)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Achievements */}
        <div style={{ marginBottom: '24px' }}>
          <AchievementsList />
        </div>

        {/* Sessions */}
        <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 12px' }}>Recent Sessions</h3>
          {sessions.length === 0 ? (
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>No sessions yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {sessions.slice(-8).reverse().map((session, idx) => {
                const isExpanded = expandedSessionIdx === idx;
                return (
                  <div key={idx} style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: 'var(--bg-secondary)', cursor: 'pointer', fontSize: '13px' }}
                      onClick={() => setExpandedSessionIdx(isExpanded ? null : idx)}>
                      <div>
                        <strong style={{ fontSize: '12px' }}>{session.chapterName || 'Session'}</strong>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginLeft: '8px' }}>{new Date(session.date).toLocaleDateString()}</span>
                      </div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{isExpanded ? '▼' : '▶'}</span>
                    </div>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          style={{ backgroundColor: 'rgba(17, 17, 19, 0.4)', overflow: 'hidden' }}>
                          <div style={{ padding: '12px 14px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <p><strong>Attempted:</strong> {session.attempted} · <strong>Correct:</strong> {session.solvedClean}</p>
                            {session.concepts?.length > 0 && <p><strong>Concepts:</strong> {session.concepts.join(', ')}</p>}
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

        {/* Bookmarks */}
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 12px' }}>Bookmarks</h3>
          {bookmarksGrouped.length === 0 ? (
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>No bookmarks yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {bookmarksGrouped.map((group, gIdx) => (
                <div key={gIdx}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <div style={{ width: '3px', height: '12px', borderRadius: '2px', backgroundColor: group.subject === 'physics' ? 'var(--accent)' : group.subject === 'chemistry' ? 'var(--success)' : 'var(--warning)' }} />
                    <strong style={{ fontSize: '12px' }}>{group.chapterName}</strong>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {group.list.map((b, bIdx) => (
                      <div key={bIdx} style={{ padding: '10px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)', fontSize: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontSize: '9px', fontWeight: '700', color: 'var(--accent)' }}>{b.primaryConcept}</span>
                          <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '10px', cursor: 'pointer' }}
                            onClick={() => { removeBookmark(b.question); showToast('Removed', 'warning'); }}>✕</button>
                        </div>
                        <p style={{ margin: 0, lineHeight: '1.4', color: 'var(--text-primary)' }}>{parseLaTeX(b.question)}</p>
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
