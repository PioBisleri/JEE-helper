import { useState, useMemo } from 'react';
import { storage } from '../utils/storage';
import { CHAPTERS } from '../data/chapters';
import { generateChapterSummary } from '../utils/api';
import { parseRichContent } from '../components/DailyChallenge';
import { useToast } from '../components/ToastContext';
import { useUser } from '../components/UserContext';
import {
  GridIcon,
  BookOpenIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '../components/Icons';

type Subject = keyof typeof CHAPTERS;

interface ChapterData {
  id: string;
  name: string;
  subtopics: string[];
  difficulty_curve: string[];
}

interface ChapterWithDetails extends ChapterData {
  subject: string;
  unlockedConcepts: string[];
  totalConcepts: number;
  completionPercentage: number;
  status: string;
  checkedSubtopics: string[];
  stats: {
    totalAttempted: number;
    totalCorrect: number;
    accuracy: number;
    timeSpent: number;
    mistakeCount: number;
  };
}

interface ChapterSummary {
  summary: string;
  pitfalls: string;
  prerequisites?: string;
  nextChapters?: string;
}

export default function SyllabusPage() {
  const { showToast } = useToast();
  const { gainXP } = useUser();

  const [expandedSubjects, setExpandedSubjects] = useState({
    physics: true,
    chemistry: false,
    math: false
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summariesCache, setSummariesCache] = useState<Record<string, ChapterSummary>>(() => (storage.getChapterSummaries() as Record<string, ChapterSummary>) || {});
  const [trigger, setTrigger] = useState(0);

  const toggleSubject = (subject: string) => {
    setExpandedSubjects(prev => ({
      ...prev,
      [subject]: !(prev as Record<string, boolean>)[subject]
    }));
  };

  const getChapterDetails = (chapter: ChapterData, subject: string): ChapterWithDetails => {
    const progress = storage.getChapterProgress(chapter.id) as unknown as Record<string, unknown>;
    const unlockedConcepts = (progress.conceptsUnlocked as string[]) || [];
    const totalConcepts = chapter.difficulty_curve.length;
    const completionPercentage = totalConcepts > 0 ? Math.round((unlockedConcepts.length / totalConcepts) * 100) : 0;

    let status = 'not_started';
    if (unlockedConcepts.length === totalConcepts && totalConcepts > 0) {
      status = 'completed';
    } else if (unlockedConcepts.length > 0) {
      status = 'in_progress';
    }

    const stats = storage.getChapterStats(chapter.id);

    return {
      ...chapter,
      subject,
      unlockedConcepts,
      totalConcepts,
      completionPercentage,
      status,
      checkedSubtopics: (progress.checkedSubtopics as string[]) || [],
      stats
    };
  };

  const allChaptersWithDetails = useMemo(() => {
    const _ = trigger;
    const compiled: ChapterWithDetails[] = [];
    (Object.keys(CHAPTERS) as Subject[]).forEach(subject => {
      CHAPTERS[subject].forEach(chapter => {
        compiled.push(getChapterDetails(chapter, subject));
      });
    });
    return compiled;
  }, [trigger]);

  const aggregateMetrics = useMemo(() => {
    let totalConceptsCount = 0;
    let totalUnlockedCount = 0;

    const subjectProgress: Record<Subject, { total: number; unlocked: number }> = {
      physics: { total: 0, unlocked: 0 },
      chemistry: { total: 0, unlocked: 0 },
      math: { total: 0, unlocked: 0 }
    };

    allChaptersWithDetails.forEach(ch => {
      const sub = ch.subject as Subject;
      subjectProgress[sub].total += ch.totalConcepts;
      subjectProgress[sub].unlocked += ch.unlockedConcepts.length;
      totalConceptsCount += ch.totalConcepts;
      totalUnlockedCount += ch.unlockedConcepts.length;
    });

    return {
      totalConcepts: totalConceptsCount,
      totalUnlocked: totalUnlockedCount,
      overallPercentage: totalConceptsCount > 0 ? Math.round((totalUnlockedCount / totalConceptsCount) * 100) : 0,
      subjectProgress
    };
  }, [allChaptersWithDetails]);

  const filteredChaptersBySubject = useMemo(() => {
    const groups: Record<Subject, ChapterWithDetails[]> = { physics: [], chemistry: [], math: [] };

    allChaptersWithDetails.forEach(ch => {
      const matchesSearch = ch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            ch.subtopics.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            ch.difficulty_curve.some((c: string) => c.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || ch.status === statusFilter;

      if (matchesSearch && matchesStatus) {
        groups[ch.subject as Subject].push(ch);
      }
    });

    (Object.keys(groups) as Subject[]).forEach(sub => {
      if (sortBy === 'completion_desc') {
        groups[sub].sort((a: ChapterWithDetails, b: ChapterWithDetails) => b.completionPercentage - a.completionPercentage);
      } else if (sortBy === 'concept_count_desc') {
        groups[sub].sort((a: ChapterWithDetails, b: ChapterWithDetails) => b.totalConcepts - a.totalConcepts);
      }
    });

    return groups;
  }, [allChaptersWithDetails, searchQuery, statusFilter, sortBy]);

  const handleToggleSubtopic = (chapterId: string, subtopic: string) => {
    const progress = storage.getChapterProgress(chapterId) as unknown as Record<string, unknown>;
    const checked = (progress.checkedSubtopics as string[]) || [];
    let updated: string[];
    if (checked.includes(subtopic)) {
      updated = checked.filter((s: string) => s !== subtopic);
    } else {
      updated = [...checked, subtopic];
    }
    storage.updateChapterProgress(chapterId, { checkedSubtopics: updated } as any);
    setTrigger(prev => prev + 1);
  };

  const handleFetchSummary = async (chapter: ChapterWithDetails) => {
    if (loadingSummary) return;
    setLoadingSummary(true);
    try {
      const summaryData = await generateChapterSummary(chapter.name, chapter.subject, chapter.subtopics);
      const updatedCache = {
        ...summariesCache,
        [chapter.id]: summaryData as unknown as ChapterSummary
      };
      setSummariesCache(updatedCache);
      storage.setChapterSummaries(updatedCache);
      showToast('AI Study Guide generated and cached!', 'success');
      gainXP(20);
    } catch (err) {
      console.error(err);
      showToast('Failed to generate summary. Check AI API connection.', 'error');
    } finally {
      setLoadingSummary(false);
    }
  };

  return (
    <div style={styles.page}>
      <div className="mx-auto p-6 max-w-4xl" style={styles.content}>

        {/* Header Summary */}
        <div style={styles.header}>
          <h2 style={{ ...styles.pageTitle, display: 'flex', alignItems: 'center', gap: '8px' } as React.CSSProperties}>
            <GridIcon size={24} color="var(--accent)" /> Syllabus & Analytics
          </h2>
          <p style={styles.pageSubtitle}>
            Track your topic mastery. Access detailed stats, checklists, and AI study guides for all chapters.
          </p>
        </div>

        {/* Aggregated Syllabus Metrics Cards */}
        <div style={styles.statsCardGrid} className="grid">
          <div style={styles.mainProgressCard} className="card">
            <h4 style={styles.statLabel}>OVERALL SYLLABUS COMPLETED</h4>
            <div style={styles.statValueRow}>
              <span style={styles.statLargeVal}>{aggregateMetrics.overallPercentage}%</span>
              <span style={styles.statDetailVal}>{aggregateMetrics.totalUnlocked} / {aggregateMetrics.totalConcepts} concepts</span>
            </div>
            <div style={styles.progressContainer}>
              <div style={{ ...styles.progressBar, width: `${aggregateMetrics.overallPercentage}%` }} />
            </div>
          </div>

          <div style={styles.subjectBreakdownCard} className="card">
            <h4 style={styles.statLabel}>SUBJECT BREAKDOWNS</h4>
            <div style={styles.subjectProgressList}>
              {(Object.keys(aggregateMetrics.subjectProgress) as Subject[]).map(sub => {
                const sp = aggregateMetrics.subjectProgress[sub];
                const pct = sp.total > 0 ? Math.round((sp.unlocked / sp.total) * 100) : 0;
                let colorClass = 'var(--accent)';
                if (sub === 'chemistry') colorClass = 'var(--success)';
                if (sub === 'math') colorClass = 'var(--warning)';

                return (
                  <div key={sub} style={styles.subjectProgressItem}>
                    <div style={styles.subjectProgressLabelRow}>
                      <span style={styles.subjectName}>{sub.toUpperCase()}</span>
                      <span style={styles.subjectPct}>{pct}% ({sp.unlocked}/{sp.total})</span>
                    </div>
                    <div style={styles.smallProgressContainer}>
                      <div style={{ ...styles.progressBar, width: `${pct}%`, backgroundColor: colorClass }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div style={styles.controlsRow} className="card">
          <input
            type="text"
            placeholder="Search chapters, subtopics, or concepts..."
            style={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div style={styles.filtersGroup}>
            <select
              style={styles.dropdown}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <select
              style={styles.dropdown}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="default">Syllabus Sequence</option>
              <option value="completion_desc">Completion (High → Low)</option>
              <option value="concept_count_desc">Concepts Count (High → Low)</option>
            </select>
          </div>
        </div>

        {/* Accordions by Subject */}
        <div style={styles.accordionsContainer}>
          {(Object.keys(CHAPTERS) as Subject[]).map(subject => {
            const list = filteredChaptersBySubject[subject] || [];
            const isExpanded = (expandedSubjects as Record<string, boolean>)[subject];
            const sp = aggregateMetrics.subjectProgress[subject];
            const pct = sp.total > 0 ? Math.round((sp.unlocked / sp.total) * 100) : 0;

            let colorClass = 'var(--accent)';
            if (subject === 'chemistry') colorClass = 'var(--success)';
            if (subject === 'math') colorClass = 'var(--warning)';

            return (
              <div key={subject} style={styles.accordionGroup} className="card">
                {/* Accordion Header */}
                <button style={styles.accordionHeader} onClick={() => toggleSubject(subject)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' } as React.CSSProperties}>
                    {isExpanded ? <ChevronDownIcon size={18} /> : <ChevronRightIcon size={18} />}
                    <h3 style={styles.accordionTitle}>{subject.toUpperCase()}</h3>
                    <span style={{
                      ...styles.headerPercentageBadge,
                      backgroundColor: colorClass + '22',
                      color: colorClass
                    }}>{pct}% Complete</span>
                  </div>
                  <span style={styles.accordionCount}>{list.length} chapter{list.length !== 1 ? 's' : ''} shown</span>
                </button>

                {/* Accordion Content */}
                {isExpanded && (
                  <div style={styles.accordionContent}>
                    {list.length === 0 ? (
                      <p style={styles.emptyText}>No chapters match your search filter criteria.</p>
                    ) : (
                      <div style={styles.chapterList}>
                        {list.map((ch: ChapterWithDetails) => {
                          const isChapExpanded = expandedChapter === ch.id;

                          let statusLabel = 'Not Started';
                          let statusColor = 'var(--text-muted)';
                          let statusBg = 'var(--bg-elevated)';

                          if (ch.status === 'completed') {
                            statusLabel = 'Completed';
                            statusColor = 'var(--success)';
                            statusBg = 'var(--success-dim)';
                          } else if (ch.status === 'in_progress') {
                            statusLabel = 'In Progress';
                            statusColor = 'var(--accent-hover)';
                            statusBg = 'var(--accent-dim)';
                          }

                          return (
                            <div key={ch.id} style={styles.chapterCardContainer}>
                              <div style={styles.chapterHeaderRow}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 } as React.CSSProperties}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' } as React.CSSProperties}>
                                    <h4 style={styles.chapterCardTitle}>{ch.name}</h4>
                                    <span style={{
                                      ...styles.statusBadge,
                                      color: statusColor,
                                      backgroundColor: statusBg
                                    }}>{statusLabel}</span>
                                  </div>
                                  <span style={styles.subtopicsSubtitle}>
                                    {ch.subtopics.slice(0, 3).join(', ')}
                                    {ch.subtopics.length > 3 ? '...' : ''}
                                  </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' } as React.CSSProperties}>
                                  <div style={styles.cardProgressWrapper}>
                                    <span style={styles.cardProgressText}>{ch.completionPercentage}%</span>
                                    <span style={styles.cardConceptRatio}>{ch.unlockedConcepts.length}/{ch.totalConcepts}</span>
                                  </div>
                                  <button
                                    className="btn btn-secondary"
                                    style={styles.detailsBtn}
                                    onClick={() => setExpandedChapter(isChapExpanded ? null : ch.id)}
                                  >
                                    {isChapExpanded ? 'Hide Details' : 'View Details'}
                                  </button>
                                </div>
                              </div>

                              {/* Small progress bar inside card */}
                              <div style={styles.cardProgressBarContainer}>
                                <div style={{ ...styles.cardProgressBar, width: `${ch.completionPercentage}%`, backgroundColor: colorClass }} />
                              </div>

                              {/* Expanded Chapter Details */}
                              {isChapExpanded && (
                                <div style={styles.chapterDetailsBlock} className="glass">

                                  {/* Stats Row */}
                                  <div style={styles.statsMetricsRow}>
                                    <div style={styles.metricItem}>
                                      <span style={styles.metricVal}>{ch.stats.totalAttempted}</span>
                                      <span style={styles.metricLabel}>Total Attempted</span>
                                    </div>
                                    <div style={styles.metricItem}>
                                      <span style={{
                                        ...styles.metricVal,
                                        color: ch.stats.accuracy >= 70 ? 'var(--success)' : ch.stats.accuracy >= 45 ? 'var(--warning)' : 'var(--text-primary)'
                                      }}>{ch.stats.accuracy}%</span>
                                      <span style={styles.metricLabel}>Accuracy Rate</span>
                                    </div>
                                    <div style={styles.metricItem}>
                                      <span style={{ ...styles.metricVal, color: 'var(--danger)' }}>{ch.stats.mistakeCount}</span>
                                      <span style={styles.metricLabel}>Active Mistakes</span>
                                    </div>
                                    <div style={styles.metricItem}>
                                      <span style={styles.metricVal}>{Math.round(ch.stats.timeSpent / 60)}m</span>
                                      <span style={styles.metricLabel}>Time Spent</span>
                                    </div>
                                  </div>

                                  <hr style={styles.divider} />

                                  {/* Details Double Column */}
                                  <div style={styles.doubleColGrid}>

                                    {/* Checklist column */}
                                    <div style={styles.detailsCol}>
                                      <h5 style={styles.detailsColTitle}>📋 Syllabus Checklist</h5>
                                      <p style={styles.colDescription}>Track your personal coverage of the board syllabus.</p>
                                      <div style={styles.checklist}>
                                        {ch.subtopics.map((sub: string) => {
                                          const isChecked = ch.checkedSubtopics.includes(sub);
                                          return (
                                            <label key={sub} style={styles.checkboxLabel}>
                                              <input
                                                type="checkbox"
                                                checked={isChecked}
                                                style={styles.checkboxInput}
                                                onChange={() => handleToggleSubtopic(ch.id, sub)}
                                              />
                                              <span style={{
                                                fontSize: '12px',
                                                textDecoration: isChecked ? 'line-through' : 'none',
                                                color: isChecked ? 'var(--text-muted)' : 'var(--text-primary)'
                                              }}>{sub}</span>
                                            </label>
                                          );
                                        })}
                                      </div>
                                    </div>

                                    {/* Timeline/Concept Ladder column */}
                                    <div style={styles.detailsCol}>
                                      <h5 style={styles.detailsColTitle}>🪜 Difficulty Curve</h5>
                                      <p style={styles.colDescription}>Concepts ordered from foundational to complex.</p>
                                      <div style={styles.timeline}>
                                        {ch.difficulty_curve.map((concept: string, idx: number) => {
                                          const isUnlocked = ch.unlockedConcepts.includes(concept);
                                          return (
                                            <div key={idx} style={styles.timelineItem}>
                                              <div style={styles.timelineConnector}>
                                                <div style={{
                                                  ...styles.timelineDot,
                                                  backgroundColor: isUnlocked ? 'var(--success)' : 'transparent',
                                                  borderColor: isUnlocked ? 'var(--success)' : 'var(--border-default)'
                                                }}>
                                                  {isUnlocked && <CheckIcon size={10} color="#ffffff" />}
                                                </div>
                                                {idx < ch.difficulty_curve.length - 1 && <div style={styles.timelineLine} />}
                                              </div>
                                              <div style={styles.timelineTextWrapper}>
                                                <span style={{
                                                  ...styles.timelineConceptName,
                                                  color: isUnlocked ? 'var(--text-primary)' : 'var(--text-muted)',
                                                  fontWeight: isUnlocked ? '700' : '400'
                                                }}>{concept}</span>
                                                <span style={styles.timelineConceptMeta}>Step {idx + 1}</span>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </div>

                                  <hr style={styles.divider} />

                                  {/* AI generated summary box */}
                                  <div style={styles.summaryBox}>
                                    <div style={styles.summaryHeader}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' } as React.CSSProperties}>
                                        <BookOpenIcon size={16} color="var(--accent)" />
                                        <h5 style={{ margin: 0, fontSize: '13px' }}>AI Exam Guide & Summary</h5>
                                      </div>
                                      {!summariesCache[ch.id] && (
                                        <button
                                          className="btn btn-primary"
                                          style={styles.summaryActionBtn}
                                          onClick={() => handleFetchSummary(ch)}
                                          disabled={loadingSummary}
                                        >
                                          {loadingSummary ? 'Generating Guide...' : 'Generate Study Guide (+20 XP)'}
                                        </button>
                                      )}
                                    </div>

                                    {summariesCache[ch.id] ? (
                                      <div style={styles.summaryContent}>
                                        <div style={styles.summarySection}>
                                          <strong style={styles.summarySectionTitle}>Core Theory & Formulas:</strong>
                                        <div style={styles.summarySectionText} className="rich-content">
                                          {parseRichContent(summariesCache[ch.id].summary)}
                                        </div>
                                      </div>

                                      <div style={{ ...styles.summarySection, marginTop: '16px' } as React.CSSProperties}>
                                        <strong style={{ ...styles.summarySectionTitle, color: 'var(--warning)' }}>Traps & Common Pitfalls:</strong>
                                        <div style={styles.summarySectionText} className="rich-content">
                                          {parseRichContent(summariesCache[ch.id].pitfalls)}
                                        </div>
                                        </div>

                                        <div style={styles.prereqRow}>
                                          <div>
                                            <span style={styles.prereqLabel}>PREREQUISITES:</span>
                                            <span style={styles.prereqVal}>{parseRichContent(summariesCache[ch.id].prerequisites || 'None')}</span>
                                          </div>
                                          <div style={{ marginTop: '4px' }}>
                                            <span style={styles.prereqLabel}>NEXT CHAPTERS:</span>
                                            <span style={styles.prereqVal}>{parseRichContent(summariesCache[ch.id].nextChapters || 'General Progression')}</span>
                                          </div>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                                          <button
                                            className="btn btn-secondary"
                                            style={styles.regenerateBtn}
                                            onClick={() => handleFetchSummary(ch)}
                                            disabled={loadingSummary}
                                          >
                                            {loadingSummary ? 'Regenerating...' : 'Regenerate Study Guide'}
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div style={styles.summaryPlaceholder}>
                                        <p style={{ margin: 0 }}>Unlock a deep AI-generated guide containing core formulas, derivations, exam traps, and recommendation graphs for this chapter.</p>
                                      </div>
                                    )}
                                  </div>

                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

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
  statsCardGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.2fr',
    gap: '20px',
    marginBottom: '24px'
  },
  mainProgressCard: {
    padding: '20px !important',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: 'var(--bg-card)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
  },
  statLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    letterSpacing: '1px',
    margin: '0 0 10px 0'
  },
  statValueRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '12px',
    marginBottom: '14px'
  },
  statLargeVal: {
    fontSize: '32px',
    fontWeight: '900',
    color: 'var(--accent-hover)',
    fontFamily: 'var(--font-mono)'
  },
  statDetailVal: {
    fontSize: '13px',
    color: 'var(--text-muted)'
  },
  progressContainer: {
    width: '100%',
    height: '10px',
    backgroundColor: 'var(--bg-elevated)',
    borderRadius: '6px',
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    backgroundColor: 'var(--accent)',
    borderRadius: '6px',
    transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
  },
  subjectBreakdownCard: {
    padding: '20px !important',
    backgroundColor: 'var(--bg-card)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
  },
  subjectProgressList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  subjectProgressItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  subjectProgressLabelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    fontWeight: '600'
  },
  subjectName: {
    color: 'var(--text-secondary)'
  },
  subjectPct: {
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-mono)'
  },
  smallProgressContainer: {
    width: '100%',
    height: '6px',
    backgroundColor: 'var(--bg-elevated)',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  controlsRow: {
    padding: '16px !important',
    display: 'flex',
    gap: '16px',
    marginBottom: '24px',
    flexWrap: 'wrap',
    alignItems: 'center',
    backgroundColor: 'var(--bg-card)'
  },
  searchInput: {
    flex: 2,
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-default)',
    color: 'var(--text-primary)',
    padding: '10px 16px',
    borderRadius: '12px',
    fontSize: '13px',
    outline: 'none',
    minWidth: '220px'
  },
  filtersGroup: {
    flex: 1.5,
    display: 'flex',
    gap: '12px',
    minWidth: '240px'
  },
  dropdown: {
    flex: 1,
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-default)',
    color: 'var(--text-primary)',
    padding: '10px 14px',
    borderRadius: '12px',
    fontSize: '12px',
    outline: 'none',
    cursor: 'pointer'
  },
  accordionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  accordionGroup: {
    padding: '0 !important',
    overflow: 'hidden',
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-subtle)'
  },
  accordionHeader: {
    width: '100%',
    padding: '18px 24px',
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    outline: 'none'
  },
  accordionTitle: {
    fontSize: '16px',
    fontWeight: '800',
    letterSpacing: '0.5px',
    margin: 0
  },
  headerPercentageBadge: {
    fontSize: '11px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '12px'
  },
  accordionCount: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)'
  },
  accordionContent: {
    borderTop: '1px solid var(--border-subtle)',
    padding: '20px 24px',
    backgroundColor: 'var(--bg-primary)'
  },
  emptyText: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    textAlign: 'center',
    padding: '16px 0',
    margin: 0
  },
  chapterList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  chapterCardContainer: {
    backgroundColor: 'var(--bg-card)',
    borderRadius: '16px',
    border: '1px solid var(--border-subtle)',
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    transition: 'all 0.2s ease'
  },
  chapterHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap'
  },
  chapterCardTitle: {
    fontSize: '15px',
    fontWeight: '700',
    margin: 0,
    color: 'var(--text-primary)'
  },
  statusBadge: {
    fontSize: '10px',
    fontWeight: '700',
    padding: '2px 6px',
    borderRadius: '6px'
  },
  subtopicsSubtitle: {
    fontSize: '11px',
    color: 'var(--text-secondary)'
  },
  cardProgressWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end'
  },
  cardProgressText: {
    fontSize: '14px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-mono)'
  },
  cardConceptRatio: {
    fontSize: '10px',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)'
  },
  detailsBtn: {
    padding: '6px 12px',
    fontSize: '11px',
    borderRadius: '8px'
  },
  cardProgressBarContainer: {
    width: '100%',
    height: '4px',
    backgroundColor: 'var(--bg-elevated)',
    borderRadius: '2px',
    overflow: 'hidden'
  },
  cardProgressBar: {
    height: '100%',
    borderRadius: '2px'
  },
  chapterDetailsBlock: {
    marginTop: '8px',
    borderRadius: '12px',
    padding: '16px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-default)'
  },
  statsMetricsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
    gap: '12px',
    marginBottom: '14px'
  },
  metricItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '10px',
    backgroundColor: 'var(--bg-card)',
    borderRadius: '8px',
    border: '1px solid var(--border-subtle)'
  },
  metricVal: {
    fontSize: '16px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-mono)'
  },
  metricLabel: {
    fontSize: '9px',
    color: 'var(--text-muted)',
    marginTop: '2px',
    textAlign: 'center'
  },
  divider: {
    border: 'none',
    borderTop: '1px solid var(--border-subtle)',
    margin: '12px 0'
  },
  doubleColGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    margin: '8px 0'
  },
  detailsCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  detailsColTitle: {
    fontSize: '12px',
    fontWeight: '700',
    margin: 0,
    color: 'var(--text-primary)'
  },
  colDescription: {
    fontSize: '10px',
    color: 'var(--text-muted)',
    margin: 0
  },
  checklist: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '8px'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer'
  },
  checkboxInput: {
    width: '14px',
    height: '14px',
    accentColor: 'var(--accent)',
    cursor: 'pointer'
  },
  timeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0px',
    marginTop: '8px'
  },
  timelineItem: {
    display: 'flex',
    alignItems: 'stretch',
    minHeight: '36px'
  },
  timelineConnector: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '20px',
    marginRight: '12px'
  },
  timelineDot: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    border: '2px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    backgroundColor: 'var(--bg-secondary)'
  },
  timelineLine: {
    width: '2px',
    flex: 1,
    backgroundColor: 'var(--border-default)',
    margin: '4px 0',
    zIndex: 1
  },
  timelineTextWrapper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingBottom: '8px'
  },
  timelineConceptName: {
    fontSize: '11px',
    lineHeight: '1.2'
  },
  timelineConceptMeta: {
    fontSize: '8px',
    color: 'var(--text-muted)',
    marginTop: '1px'
  },
  summaryBox: {
    backgroundColor: 'var(--bg-card)',
    borderRadius: '12px',
    border: '1px solid var(--border-subtle)',
    padding: '14px',
    marginTop: '8px'
  },
  summaryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px'
  },
  summaryActionBtn: {
    padding: '4px 10px',
    fontSize: '10px',
    borderRadius: '6px'
  },
  summaryPlaceholder: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    padding: '12px 0 0 0',
    lineHeight: '1.5'
  },
  summaryContent: {
    marginTop: '12px',
    fontSize: '12px',
    lineHeight: '1.6'
  },
  summarySection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  summarySectionTitle: {
    color: 'var(--accent-hover)',
    fontSize: '11px'
  },
  summarySectionText: {
    paddingLeft: '6px',
    borderLeft: '2px solid var(--border-default)',
    color: 'var(--text-primary)',
    whiteSpace: 'pre-line'
  },
  prereqRow: {
    marginTop: '12px',
    padding: '8px 10px',
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    fontSize: '10px',
    gap: '2px'
  },
  prereqLabel: {
    fontWeight: '700',
    color: 'var(--text-secondary)',
    marginRight: '6px',
    fontSize: '9px'
  },
  prereqVal: {
    color: 'var(--text-primary)'
  },
  regenerateBtn: {
    padding: '3px 8px',
    fontSize: '9px',
    borderRadius: '4px'
  }
};
