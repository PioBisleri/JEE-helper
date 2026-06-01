import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../utils/storage';
import { CHAPTERS } from '../data/chapters';
import { markReviewed } from '../utils/spaceRepetition';
import { generateReviewQuestion } from '../utils/api';
import { parseLaTeX } from '../components/DailyChallenge';
import { useToast } from '../components/ToastContext';
import { useUser } from '../components/UserContext';
import OptionButton from '../components/OptionButton';
import { track } from '../utils/analytics';
import { SkeletonQuestion } from '../components/LoadingSkeleton';
import { 
  BookIcon, 
  RefreshIcon, 
  BookOpenIcon, 
  CheckIcon, 
  CrossIcon, 
  WarningIcon, 
  ClockIcon, 
  StatsIcon 
} from '../components/Icons';
import type { ConceptLearned } from '../types';

interface ConceptMetadata {
  subject: string;
  chapterId: string;
  chapterName: string;
}

interface ReviewQuestion {
  question: string;
  options: Record<string, string>;
  answer: string;
  whyCorrect: string;
}

interface DetailConcept extends ConceptLearned {
  history: Array<{ date: string; correct: boolean; stage: number }>;
  notes: string;
  meta: ConceptMetadata;
}

interface GroupedItem extends ConceptLearned {
  meta: ConceptMetadata;
}

const CHAPTERS_KEYS = Object.keys(CHAPTERS) as Array<keyof typeof CHAPTERS>;

export default function RevisionsPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { gainXP } = useUser();

  const [conceptsLearned, setConceptsLearned] = useState<ConceptLearned[]>([]);
  const [activeSession, setActiveSession] = useState<ConceptLearned[] | null>(null);
  const [sessionIndex, setSessionIndex] = useState(0);
  const [sessionQuestion, setSessionQuestion] = useState<ReviewQuestion | null>(null);
  
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(false);
  
  const [detailConcept, setDetailConcept] = useState<DetailConcept | null>(null);
  
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [chapterFilter, setChapterFilter] = useState('all');

  useEffect(() => {
    setConceptsLearned(storage.getConceptsLearned());
  }, [activeSession]);

  const getConceptMetadata = (conceptName: string): ConceptMetadata => {
    for (const subject of CHAPTERS_KEYS) {
      for (const chapter of CHAPTERS[subject]) {
        if (
          chapter.difficulty_curve.includes(conceptName) || 
          chapter.subtopics.some((s: string) => s.toLowerCase().includes(conceptName.toLowerCase()) || conceptName.toLowerCase().includes(s.toLowerCase()))
        ) {
          return {
            subject,
            chapterId: chapter.id,
            chapterName: chapter.name
          };
        }
      }
    }
    return {
      subject: 'physics',
      chapterId: 'unknown',
      chapterName: 'General Concepts'
    };
  };

  const dueReviews = useMemo(() => {
    const now = new Date();
    return conceptsLearned.filter(c => new Date(c.nextReview) <= now);
  }, [conceptsLearned]);

  const upcomingReviews = useMemo(() => {
    const now = new Date();
    const list = conceptsLearned.filter(c => new Date(c.nextReview) > now);
    return list.sort((a, b) => new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime());
  }, [conceptsLearned]);

  const upcomingGrouped = useMemo(() => {
    const groups: Record<string, GroupedItem[]> = {};
    upcomingReviews.forEach(item => {
      const meta = getConceptMetadata(item.concept);
      if (!groups[meta.chapterName]) {
        groups[meta.chapterName] = [];
      }
      groups[meta.chapterName].push({
        ...item,
        meta
      });
    });
    return groups;
  }, [upcomingReviews]);

  const subjectChaptersList = useMemo(() => {
    if (subjectFilter === 'all') return [];
    return (CHAPTERS as Record<string, Array<{ id: string; name: string; subtopics: string[]; difficulty_curve: string[] }>>)[subjectFilter] || [];
  }, [subjectFilter]);

  const filteredConcepts = useMemo(() => {
    return conceptsLearned.map(item => {
      const meta = getConceptMetadata(item.concept);
      const now = new Date();
      const isOverdue = new Date(item.nextReview) <= now;
      
      let status = 'active';
      if (item.reviewStage >= 3) {
        status = 'mastered';
      }
      if (isOverdue) {
        status = 'overdue';
      }

      return {
        ...item,
        meta,
        status
      };
    }).filter(c => {
      const matchSubject = subjectFilter === 'all' || c.meta.subject === subjectFilter;
      const matchChapter = chapterFilter === 'all' || c.meta.chapterId === chapterFilter;
      return matchSubject && matchChapter;
    });
  }, [conceptsLearned, subjectFilter, chapterFilter]);

  const getDaysOverdue = (nextReviewStr: string): number => {
    const diff = Date.now() - new Date(nextReviewStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  };

  const startReviewSession = async (conceptsQueue: ConceptLearned[]) => {
    if (conceptsQueue.length === 0) return;
    setActiveSession(conceptsQueue);
    setSessionIndex(0);
    track('revision_start', { conceptCount: conceptsQueue.length });
    loadSessionQuestion(conceptsQueue[0], 0);
  };

  const loadSessionQuestion = async (conceptObj: ConceptLearned, index: number) => {
    setSessionLoading(true);
    setSelectedOption(null);
    setConfirmed(false);
    setIsCorrect(false);
    
    try {
      const meta = getConceptMetadata(conceptObj.concept);
      const raw = await generateReviewQuestion(conceptObj.concept, meta.chapterName) as Record<string, unknown>;
      const q: ReviewQuestion = {
        question: raw.question as string,
        options: raw.options as Record<string, string>,
        answer: raw.answer as string,
        whyCorrect: raw.whyCorrect as string,
      };
      setSessionQuestion(q);
    } catch (e) {
      console.error(e);
      showToast('Error loading review question. Please check connection.', 'error');
      setActiveSession(null);
    } finally {
      setSessionLoading(false);
    }
  };

  const handleConfirmAnswer = () => {
    if (!selectedOption || confirmed || !sessionQuestion || !activeSession) return;

    const correct = selectedOption === sessionQuestion.answer;
    setIsCorrect(correct);
    setConfirmed(true);

    track('revision_question_answered', { isCorrect: correct });

    const conceptObj = activeSession[sessionIndex];
    markReviewed(conceptObj.concept, correct);

    if (correct) {
      gainXP(15);
      showToast('Correct! Recall stage advanced. +15 XP', 'success');
    } else {
      showToast('Incorrect. Resetting concept recall spacing.', 'error');
    }
  };

  const handleNextReview = () => {
    if (!activeSession) return;
    const nextIdx = sessionIndex + 1;
    if (nextIdx >= activeSession.length) {
      setActiveSession(null);
      setSessionQuestion(null);
      showToast('Spaced reviews session completed!', 'success');
    } else {
      setSessionIndex(nextIdx);
      loadSessionQuestion(activeSession[nextIdx], nextIdx);
    }
  };

  const handleReviewAllDue = () => {
    if (dueReviews.length === 0) {
      showToast('No reviews currently due!', 'info');
      return;
    }
    startReviewSession(dueReviews);
  };

  const handleReviewWeakConcepts = () => {
    const mistakes = storage.getMistakes();
    
    const mistakeCounts: Record<string, number> = {};
    (mistakes as Array<{ concept?: string }>).forEach(m => {
      if (m.concept) {
        mistakeCounts[m.concept] = (mistakeCounts[m.concept] || 0) + 1;
      }
    });

    const weakConcepts = conceptsLearned.filter(c => (mistakeCounts[c.concept] || 0) > 0);
    
    weakConcepts.sort((a, b) => (mistakeCounts[b.concept] || 0) - (mistakeCounts[a.concept] || 0));

    if (weakConcepts.length === 0) {
      const beginnerConcepts = conceptsLearned.filter(c => c.reviewStage === 0);
      if (beginnerConcepts.length === 0) {
        showToast('No weak concepts flagged! Reviewing all due concepts.', 'info');
        handleReviewAllDue();
      } else {
        startReviewSession(beginnerConcepts);
      }
    } else {
      startReviewSession(weakConcepts.slice(0, 10));
    }
  };

  const handleChipClick = (concept: GroupedItem & { status: string }) => {
    const reviews = storage.getConceptReviewHistory(concept.concept);
    const notes = storage.getNote(concept.concept);
    setDetailConcept({
      ...concept,
      history: reviews,
      notes
    });
  };

  return (
    <div style={styles.page}>
      <div className="mx-auto p-6 max-w-4xl" style={styles.content}>
        
        {activeSession && sessionQuestion && (
          <div style={styles.overlayContainer}>
            <div style={styles.overlayModal} className="glass">
              <div style={styles.overlayHeader}>
                <div>
                  <span style={styles.alertBadge}>ACTIVE RECALL TRAINING</span>
                  <h4 style={{ margin: '4px 0 0 0' }}>Reviewing: {activeSession[sessionIndex].concept}</h4>
                </div>
                <span style={styles.progressCounter}>
                  Question {sessionIndex + 1} of {activeSession.length}
                </span>
              </div>

              <div style={styles.overlayContent}>
                {sessionLoading ? (
                  <SkeletonQuestion />
                ) : (
                  <>
                    <div style={styles.questionCard} className="card">
                      <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.6', color: 'var(--text-primary)' }}>
                        {parseLaTeX(sessionQuestion.question)}
                      </p>
                    </div>

                    <div style={styles.optionsList}>
                      {Object.entries(sessionQuestion.options).map(([key, val]) => {
                        const isSelected = selectedOption === key;
                        const isAnswer = sessionQuestion.answer === key;
                        
                        let optionStyle: React.CSSProperties = { ...styles.optionBtn };
                        if (isSelected) optionStyle = { ...optionStyle, ...styles.optionSelected };
                        if (confirmed) {
                          if (isAnswer) optionStyle = { ...optionStyle, ...styles.optionCorrect };
                          else if (isSelected) optionStyle = { ...optionStyle, ...styles.optionWrong };
                        }

                        return (
                          <button
                            key={key}
                            style={optionStyle}
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

                    {confirmed && (
                      <div style={styles.explanationBox} className="card">
                        <h5 style={{ 
                          color: isCorrect ? 'var(--success)' : 'var(--danger)', 
                          margin: '0 0 8px 0', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px'
                        }}>
                          {isCorrect ? (
                            <>
                              <CheckIcon size={16} />
                              <span>Correct Answer!</span>
                            </>
                          ) : (
                            <>
                              <CrossIcon size={16} />
                              <span>Incorrect Answer</span>
                            </>
                          )}
                        </h5>
                        <p style={{ fontSize: '13px', color: 'var(--text-primary)', margin: 0 }}>
                          <strong>Why correct:</strong> {parseLaTeX(sessionQuestion.whyCorrect)}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div style={styles.overlayFooter}>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setActiveSession(null);
                    setSessionQuestion(null);
                  }}
                  disabled={sessionLoading}
                >
                  Quit Session
                </button>

                {!confirmed ? (
                  <button 
                    className="btn btn-primary"
                    disabled={!selectedOption || sessionLoading}
                    onClick={handleConfirmAnswer}
                  >
                    Confirm Answer
                  </button>
                ) : (
                  <button 
                    className="btn btn-primary"
                    onClick={handleNextReview}
                  >
                    {activeSession && sessionIndex >= activeSession.length - 1 ? 'Finish Session' : 'Next Review →'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div style={styles.header}>
          <h2 style={{ ...styles.pageTitle, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RefreshIcon size={24} color="var(--accent)" /> Spaced Revisions
          </h2>
          <p style={styles.pageSubtitle}>
            Train your long-term memory. Overcome the forgetting curve with targeted active recall.
          </p>
        </div>

        <div style={styles.bulkRow}>
          <div style={{ ...styles.bulkCard, borderLeft: '4px solid var(--danger)' }} className="card">
            <h4>Due Recall Queue</h4>
            <p>{dueReviews.length} concept{dueReviews.length !== 1 ? 's' : ''} currently overdue for memory verification.</p>
            <button 
              className="btn btn-primary" 
              onClick={handleReviewAllDue}
              disabled={dueReviews.length === 0}
            >
              Review All Due ({dueReviews.length})
            </button>
          </div>

          <div style={{ ...styles.bulkCard, borderLeft: '4px solid var(--warning)' }} className="card">
            <h4>Target Weak Spots</h4>
            <p>Prioritize concepts where you made the most mistakes during study blocks.</p>
            <button 
              className="btn btn-secondary" 
              onClick={handleReviewWeakConcepts}
              disabled={conceptsLearned.length === 0}
            >
              Review Weak Concepts
            </button>
          </div>
        </div>

        <div style={styles.gridContainer}>
          
          <div style={styles.leftCol}>
            
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={styles.sectionHeader}>🚨 Overdue Reviews</h3>
              {dueReviews.length === 0 ? (
                <p style={styles.emptyText}>Awesome! You have zero overdue recall reviews today.</p>
              ) : (
                <div style={styles.dueList}>
                  {dueReviews.map((item, idx) => {
                    const meta = getConceptMetadata(item.concept);
                    const overdue = getDaysOverdue(item.nextReview);

                    return (
                      <div key={idx} style={styles.dueItemCard} className="card">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={styles.dueItemConcept}>{item.concept}</span>
                          <span style={styles.dueItemChapter}>{meta.chapterName}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            ...styles.overdueBadge,
                            backgroundColor: overdue >= 3 ? 'var(--danger-dim)' : 'var(--warning-dim)',
                            color: overdue >= 3 ? 'var(--danger)' : 'var(--warning)'
                          }}>
                            {overdue === 0 ? 'Due today' : `${overdue}d overdue`}
                          </span>
                          <span style={styles.stageTag}>{item.reviewStage + 1}/4</span>
                          <button 
                            className="btn btn-primary" 
                            style={styles.inlineActionBtn}
                            onClick={() => startReviewSession([item])}
                          >
                            Review
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="card" style={{ padding: '20px', marginTop: '24px' }}>
              <h3 style={styles.sectionHeader}>📅 Upcoming Timelines</h3>
              {upcomingReviews.length === 0 ? (
                <p style={styles.emptyText}>No upcoming reviews. Start studying chapters to load memory triggers!</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {Object.keys(upcomingGrouped).map((chapterName, idx) => (
                    <div key={idx}>
                      <h4 style={styles.groupedChapterHeader}>{chapterName}</h4>
                      <div style={styles.dueList}>
                        {upcomingGrouped[chapterName].map((item: GroupedItem, cIdx: number) => {
                          const now = new Date();
                          const diff = new Date(item.nextReview).getTime() - now.getTime();
                          const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
                          
                          return (
                            <div key={cIdx} style={styles.upcomingItemCard}>
                              <span style={styles.upcomingConcept}>{item.concept}</span>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <span style={styles.stageTag}>{item.reviewStage + 1}/4</span>
                                <span style={{
                                  ...styles.overdueBadge,
                                  backgroundColor: 'var(--bg-elevated)',
                                  color: 'var(--success)'
                                }}>
                                  In {days} day{days !== 1 ? 's' : ''}
                                </span>
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

          </div>

          <div style={styles.rightCol}>
            <div className="card" style={{ padding: '20px', height: '100%' }}>
              <h3 style={styles.sectionHeader}>Memory Overview</h3>
              <p style={styles.settingDesc}>
                Visual matrix of your active vocabulary list. Green chips represent long-term concepts. Click any to review notes or logs.
              </p>

              <div style={styles.filtersRow}>
                <select 
                  style={styles.dropdown}
                  value={subjectFilter}
                  onChange={(e) => {
                    setSubjectFilter(e.target.value);
                    setChapterFilter('all');
                  }}
                >
                  <option value="all">All Subjects</option>
                  <option value="physics">Physics</option>
                  <option value="chemistry">Chemistry</option>
                  <option value="math">Mathematics</option>
                </select>

                {subjectFilter !== 'all' && (
                  <select 
                    style={styles.dropdown}
                    value={chapterFilter}
                    onChange={(e) => setChapterFilter(e.target.value)}
                  >
                    <option value="all">All Chapters</option>
                    {subjectChaptersList.map((ch: { id: string; name: string; subtopics: string[]; difficulty_curve: string[] }) => (
                      <option key={ch.id} value={ch.id}>{ch.name}</option>
                    ))}
                  </select>
                )}
              </div>

              <div style={styles.masteryGrid}>
                {filteredConcepts.map((item, idx) => {
                  let chipColor = 'var(--success)';
                  let chipBg = 'var(--success-dim)';
                  
                  if (item.status === 'active') {
                    chipColor = 'var(--accent-hover)';
                    chipBg = 'var(--accent-dim)';
                  } else if (item.status === 'overdue') {
                    chipColor = 'var(--danger)';
                    chipBg = 'var(--danger-dim)';
                  }

                  return (
                    <button
                      key={idx}
                      style={{
                        ...styles.masteryChip,
                        borderColor: chipColor,
                        backgroundColor: chipBg,
                        color: chipColor
                      }}
                      onClick={() => handleChipClick(item)}
                    >
                      {item.concept}
                      <span style={styles.chipStageTag}>{item.reviewStage + 1}/4</span>
                    </button>
                  );
                })}

                {filteredConcepts.length === 0 && (
                  <p style={styles.emptyText}>No concepts match the selected subject filters.</p>
                )}
              </div>
            </div>
          </div>

        </div>

        {detailConcept && (
          <div style={styles.drawerBackdrop} onClick={() => setDetailConcept(null)}>
            <div style={styles.drawerSheet} className="glass" onClick={(e) => e.stopPropagation()}>
              <div style={styles.drawerHeader}>
                <div>
                  <h4 style={{ margin: 0 }}>{detailConcept.concept}</h4>
                  <span style={styles.notesConceptChip}>{detailConcept.meta.chapterName} ({detailConcept.meta.subject.toUpperCase()})</span>
                </div>
                <button style={styles.closeBtn} onClick={() => setDetailConcept(null)}>✕</button>
              </div>

              <div style={styles.drawerContent}>
                
                <div style={{ marginBottom: '20px' }}>
                  <strong style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>My Notes:</strong>
                  {detailConcept.notes ? (
                    <div style={styles.notesViewer} className="card">
                      {detailConcept.notes}
                    </div>
                  ) : (
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' as const }}>No notes taken for this concept yet. Open the Study block to write key rules.</p>
                  )}
                </div>

                <div>
                  <strong style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                    Spaced Recall Performance History:
                  </strong>
                  {detailConcept.history.length === 0 ? (
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No historical reviews completed. Initial review state loaded.</p>
                  ) : (
                    <div style={styles.historyList}>
                      {detailConcept.history.map((h: { date: string; correct: boolean; stage: number }, i: number) => (
                        <div key={i} style={styles.historyRow}>
                          <span style={{ color: h.correct ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold' }}>
                            {h.correct ? '✓ Correct Recall' : '✗ Mistake'}
                          </span>
                          <span style={styles.stageTag}>Stage: {h.stage + 1}/4</span>
                          <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            {new Date(h.date).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              <div style={styles.drawerFooter}>
                <button className="btn btn-primary w-full" onClick={() => setDetailConcept(null)}>
                  Close Details
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)'
  },
  content: {
    paddingTop: '88px',
    paddingBottom: '88px'
  },
  header: {
    marginBottom: '28px'
  },
  pageTitle: {
    fontSize: '22px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    margin: 0
  },
  pageSubtitle: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    marginTop: '6px'
  },
  bulkRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
    marginBottom: '24px'
  },
  bulkCard: {
    padding: '20px !important',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    justifyContent: 'space-between',
    backgroundColor: 'var(--bg-card)'
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.2fr',
    gap: '24px',
    alignItems: 'stretch'
  },
  leftCol: {
    display: 'flex',
    flexDirection: 'column'
  },
  rightCol: {},
  sectionHeader: {
    fontSize: '15px',
    fontWeight: '700',
    margin: '0 0 16px 0',
    color: 'var(--text-primary)',
    borderBottom: '1px solid var(--border-subtle)',
    paddingBottom: '8px'
  },
  emptyText: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    textAlign: 'center',
    padding: '24px 0',
    margin: 0
  },
  dueList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  dueItemCard: {
    padding: '12px !important',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-subtle)'
  },
  dueItemConcept: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--text-primary)'
  },
  dueItemChapter: {
    fontSize: '11px',
    color: 'var(--text-muted)'
  },
  overdueBadge: {
    fontSize: '9px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '8px'
  },
  stageTag: {
    fontSize: '10px',
    fontWeight: '700',
    fontFamily: 'var(--font-mono)',
    backgroundColor: 'var(--bg-elevated)',
    color: 'var(--text-secondary)',
    padding: '2px 6px',
    borderRadius: '4px'
  },
  inlineActionBtn: {
    padding: '4px 10px',
    fontSize: '10px',
    borderRadius: '8px'
  },
  groupedChapterHeader: {
    fontSize: '12px',
    color: 'var(--accent-hover)',
    margin: '12px 0 6px 0',
    fontWeight: '700'
  },
  upcomingItemCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: '10px',
    border: '1px solid var(--border-subtle)'
  },
  upcomingConcept: {
    fontSize: '12px',
    color: 'var(--text-primary)'
  },
  settingDesc: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
    margin: '0 0 16px 0'
  },
  filtersRow: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px'
  },
  dropdown: {
    flex: 1,
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-default)',
    color: 'var(--text-primary)',
    padding: '8px 12px',
    borderRadius: '10px',
    fontSize: '12px',
    outline: 'none'
  },
  masteryGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px'
  },
  masteryChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 12px',
    borderRadius: '12px',
    border: '1px solid',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    outline: 'none'
  },
  chipStageTag: {
    fontSize: '9px',
    fontFamily: 'var(--font-mono)',
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: '1px 4px',
    borderRadius: '3px',
    color: 'currentColor'
  },
  overlayContainer: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(8, 11, 20, 0.8)',
    zIndex: 1000,
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  overlayModal: {
    zIndex: 1001,
    width: '90%',
    maxWidth: '520px',
    maxHeight: '90vh',
    overflowY: 'auto',
    borderRadius: '24px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
    border: '1px solid var(--border-subtle)',
    backgroundColor: 'var(--bg-card)'
  },
  overlayHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid var(--border-subtle)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  alertBadge: {
    color: 'var(--accent-hover)',
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '1px'
  },
  progressCounter: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)'
  },
  overlayContent: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  questionCard: {
    padding: '20px !important',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-default)',
    borderRadius: '16px'
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
    borderRadius: '12px',
    border: '2px solid var(--border-default)',
    backgroundColor: 'transparent',
    color: 'var(--text-primary)',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.15s'
  },
  optionSelected: {
    borderColor: 'var(--accent)',
    boxShadow: '0 0 8px var(--accent-glow)'
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
  explanationBox: {
    padding: '12px !important',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '12px'
  },
  overlayFooter: {
    padding: '16px 24px',
    borderTop: '1px solid var(--border-subtle)',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px'
  },
  drawerBackdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 1000,
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  drawerSheet: {
    width: '90%',
    maxWidth: '450px',
    borderRadius: '24px',
    boxShadow: '0 -10px 25px rgba(0,0,0,0.5)',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '80vh',
    border: '1px solid var(--border-subtle)',
    backgroundColor: 'var(--bg-card)'
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
    display: 'inline-block',
    fontWeight: '600'
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
    flex: 1,
    overflowY: 'auto'
  },
  notesViewer: {
    padding: '12px !important',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-subtle)',
    fontSize: '13px',
    lineHeight: '1.5',
    color: 'var(--text-primary)'
  },
  historyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  historyRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '12px',
    padding: '8px 10px',
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: '8px'
  },
  drawerFooter: {
    padding: '16px 24px',
    borderTop: '1px solid var(--border-subtle)'
  }
};
