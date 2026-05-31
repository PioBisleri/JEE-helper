import { useUser } from './UserContext';
import { parseLaTeX } from './DailyChallenge';

export default function QuestionCard({ question, hideBookmark = false }) {
  const { bookmarks, addBookmark, removeBookmark } = useUser();

  if (!question) return null;

  const isSaved = bookmarks.some(b => b.question === question.question);

  const toggleBookmark = (e) => {
    e.stopPropagation();
    if (isSaved) removeBookmark(question.question);
    else addBookmark(question);
  };

  return (
    <div style={styles.card} className="card">
      <div style={styles.header}>
        <span style={styles.badge}>
          {question.primaryConcept || "JEE Concept"}
        </span>
        {!hideBookmark && (
          <button style={styles.bookmarkBtn} onClick={toggleBookmark}>
            <span style={{ fontSize: '16px', color: isSaved ? 'var(--warning)' : 'var(--text-muted)', transition: 'color 0.15s' }}>
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

const styles = {
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
  badge: {
    fontSize: '10px',
    fontWeight: '700',
    color: 'var(--accent)',
    backgroundColor: 'var(--accent-dim)',
    padding: '3px 8px',
    borderRadius: 'var(--radius-sm)',
    letterSpacing: '0.02em',
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
