import { useUser } from './UserContext';
import { parseLaTeX } from './DailyChallenge';
import type { Question } from '../types';
import type { CSSProperties } from 'react';

interface QuestionCardProps {
  question: Question & { _meta?: { source?: string; year?: number; paperTitle?: string } };
  hideBookmark?: boolean;
  onAnswer?: (option: string) => void;
  onStuck?: () => void;
  selectedOption?: string | null;
  isCorrect?: boolean;
  showHint?: boolean;
  hint?: string;
}

export default function QuestionCard({ question, hideBookmark = false }: QuestionCardProps) {
  const { bookmarks, addBookmark, removeBookmark } = useUser();

  if (!question) return null;

  const isSaved = bookmarks.some((b: unknown) => (b as { question?: string })?.question === question.question);
  const isPYQ = question._meta?.source === 'pyq';

  const toggleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaved) removeBookmark(question.question);
    else addBookmark(question);
  };

  return (
    <div style={styles.card} className="card">
      <div style={styles.header}>
        <div style={styles.badges}>
          <span style={styles.badge}>
            {question.primaryConcept || "JEE Concept"}
          </span>
          {isPYQ && (
            <span
              style={styles.pyqBadge}
              title={question._meta?.paperTitle ? `JEE Mains ${question._meta.year} — ${question._meta.paperTitle}` : 'Real JEE Mains question'}
            >
              PYQ {question._meta?.year ? `· ${question._meta.year}` : ''}
            </span>
          )}
        </div>
        {!hideBookmark && (
          <button style={styles.bookmarkBtn} onClick={toggleBookmark}>
            <span style={{ fontSize: '16px', color: isSaved ? 'var(--warning)' : 'var(--text-muted)', transition: 'color 0.15s' } as CSSProperties}>
              {isSaved ? '★' : '☆'}
            </span>
          </button>
        )}
      </div>
      <div className="question-text">
        {parseLaTeX(question.question)}
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  card: {
    borderRadius: 'var(--radius-lg)',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badges: {
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  badge: {
    fontSize: '10px',
    fontWeight: '700',
    color: 'var(--accent)',
    backgroundColor: 'var(--accent-dim)',
    padding: '3px 8px',
    borderRadius: 'var(--radius-sm)',
    letterSpacing: '0.02em',
  },
  pyqBadge: {
    fontSize: '10px',
    fontWeight: '700',
    color: 'var(--success, #22c55e)',
    backgroundColor: 'var(--success-dim, rgba(34, 197, 94, 0.12))',
    padding: '3px 8px',
    borderRadius: 'var(--radius-sm)',
    letterSpacing: '0.02em',
    cursor: 'help',
  },
  bookmarkBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '2px',
    display: 'flex',
    alignItems: 'center',
    outline: 'none',
  },
};
