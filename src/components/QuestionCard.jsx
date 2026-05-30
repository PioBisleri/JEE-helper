import React from 'react';
import { useUser } from './UserContext';
import { parseLaTeX } from './DailyChallenge';

export default function QuestionCard({ question, hideBookmark = false }) {
  const { bookmarks, addBookmark, removeBookmark } = useUser();
  
  if (!question) return null;

  const isSaved = bookmarks.some(b => b.question === question.question);

  const toggleBookmark = (e) => {
    e.stopPropagation();
    if (isSaved) {
      removeBookmark(question.question);
    } else {
      addBookmark(question);
    }
  };

  return (
    <div style={styles.card} className="card">
      <div style={styles.header}>
        <span style={styles.conceptBadge}>
          {question.primaryConcept || "JEE Core Concept"}
        </span>
        
        {!hideBookmark && (
          <button 
            style={styles.bookmarkBtn} 
            onClick={toggleBookmark}
            title={isSaved ? "Remove Bookmark" : "Bookmark Question"}
          >
            <span style={{ 
              ...styles.bookmarkIcon,
              color: isSaved ? 'var(--warning)' : 'var(--text-secondary)'
            }}>
              {isSaved ? '★' : '☆'}
            </span>
          </button>
        )}
      </div>

      <div style={styles.questionText} className="question-text">
        {parseLaTeX(question.question)}
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: 'var(--bg-card)',
    borderColor: 'var(--border-subtle)',
    borderRadius: '16px',
    padding: '24px',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '100%',
    boxSizing: 'border-box'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  conceptBadge: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--accent-hover)',
    backgroundColor: 'var(--accent-dim)',
    padding: '4px 10px',
    borderRadius: '8px',
    letterSpacing: '0.5px'
  },
  bookmarkBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    outline: 'none'
  },
  bookmarkIcon: {
    fontSize: '20px',
    transition: 'color 0.15s'
  },
  questionText: {
    fontFamily: 'var(--font-sans)',
    fontSize: '17px',
    lineHeight: '1.7',
    fontWeight: '500',
    color: 'var(--text-primary)'
  }
};
