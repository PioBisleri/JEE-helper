import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { storage } from '../utils/storage';
import { CHAPTERS } from '../data/chapters';
import { callAI } from '../utils/api';
import { useUser } from './UserContext';
import { useToast } from './ToastContext';
import katex from 'katex';
import { StarIcon, CheckIcon, CrossIcon } from './Icons';

// Direct KaTeX rendering — bypasses react-katex for React 19 compatibility
function renderKatex(math, displayMode = false) {
  if (!math || typeof math !== 'string') return math;
  try {
    // Fix unbraced commands before rendering
    let fixed = math;
    fixed = fixed.replace(/\\text([a-zA-Z]+)/g, '\\text{$1}');
    fixed = fixed.replace(/\\vec([a-zA-Z]+)/g, '\\vec{$1}');
    const html = katex.renderToString(fixed, {
      displayMode,
      throwOnError: false,
      strict: false
    });
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  } catch (e) {
    return <span style={{ color: 'var(--danger)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>{math}</span>;
  }
}

export default function DailyChallenge() {
  const navigate = useNavigate();
  const [isCompletedToday, setIsCompletedToday] = useState(false);
  const [todayScore, setTodayScore] = useState(0);

  useEffect(() => {
    const history = storage.getDailyChallengeHistory() || [];
    const todayStr = new Date().toDateString();
    const todayAttempt = history.find(h => new Date(h.date).toDateString() === todayStr);
    
    if (todayAttempt) {
      setIsCompletedToday(true);
      setTodayScore(todayAttempt.score);
    }
  }, []);

  return (
    <>
      <div 
        style={{
          ...styles.card,
          borderLeft: '4px solid var(--warning)'
        }} 
        className="card"
        onClick={() => navigate('/daily-challenge')}
      >
        <div style={styles.badgeRow}>
          <span style={{ ...styles.challengeBadge, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <StarIcon size={12} fill="var(--warning)" />
            <span>DAILY CHALLENGE</span>
          </span>
          {isCompletedToday ? (
            <span style={{
              ...styles.statusBadge,
              backgroundColor: 'var(--success-dim)',
              color: 'var(--success)'
            }}>
              COMPLETED ({todayScore}/30)
            </span>
          ) : (
            <span style={{
              ...styles.statusBadge,
              backgroundColor: 'var(--accent-dim)',
              color: 'var(--accent-hover)'
            }}>
              UNATTEMPTED
            </span>
          )}
        </div>
        <h4 style={styles.cardTitle}>Daily Preparation Challenge</h4>
        <p style={styles.cardDesc}>
          {isCompletedToday 
            ? "You have completed today's comprehensive practice challenge. Tap to view your report card!" 
            : "Solve today's curated 30-question daily challenge to test your preparation and earn massive XP!"}
        </p>
      </div>
    </>
  );
}


// Normalize a single math string for KaTeX: fix unbraced commands
export function normalizeLatex(str) {
  if (!str) return str;
  let s = str;
  s = s.replace(/\\text([a-zA-Z]+)/g, '\\text{$1}');
  s = s.replace(/\\vec([a-zA-Z]+)/g, '\\vec{$1}');
  return s;
}

// Robust LaTeX parsing function for mixed content
export function parseLaTeX(text) {
  if (!text || typeof text !== 'string') return text;

  // Regex to match block and inline LaTeX delimiters
  const regex = /(\$\$)([\s\S]*?)\$\$|(\\\[)([\s\S]*?)\\\]|(\\\()([\s\S]*?)\\\)|(\$)([\s\S]*?)\$/g;
  
  const elements = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add any text before this match
    if (match.index > lastIndex) {
      const before = text.substring(lastIndex, match.index);
      if (before) elements.push(before);
    }
    
    // Determine which delimiter matched and extract the math content
    let mathContent = '';
    let isBlock = false;
    
    if (match[1] === '$$') {
      mathContent = match[2];
      isBlock = true;
    } else if (match[3] === '\\[') {
      mathContent = match[4];
      isBlock = true;
    } else if (match[5] === '\\(') {
      mathContent = match[6];
      isBlock = false;
    } else if (match[7] === '$') {
      mathContent = match[8];
      isBlock = false;
    }
    
    elements.push(renderKatex(mathContent, isBlock));
    
    lastIndex = regex.lastIndex;
  }
  
  // Add any remaining text after the last match
  if (lastIndex < text.length) {
    const remaining = text.substring(lastIndex);
    if (remaining) elements.push(remaining);
  }
  
  // If no elements were created, return the original text
  if (elements.length === 0) return text;
  
  // If only one element, return it directly
  if (elements.length === 1) return elements[0];
  
  // Wrap multiple elements in a fragment
  return <>{elements.map((el, i) => (typeof el === 'string' ? <span key={`txt-${i}`}>{el}</span> : el))}</>;
}

function getSubjectColor(subject) {
  if (subject === 'physics') return 'var(--accent)';
  if (subject === 'chemistry') return 'var(--success)';
  return 'var(--warning)';
}

const styles = {
  card: {
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    backgroundColor: 'var(--bg-card)',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '20px'
  },
  badgeRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  challengeBadge: {
    color: 'var(--warning)',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '1px'
  },
  statusBadge: {
    padding: '2px 8px',
    borderRadius: '8px',
    fontSize: '9px',
    fontWeight: '700'
  },
  cardTitle: {
    fontSize: '17px',
    fontWeight: '700',
    color: 'var(--text-primary)'
  },
  cardDesc: {
    fontSize: '12px',
    color: 'var(--text-secondary)'
  },
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(8, 11, 20, 0.7)',
    zIndex: 1000,
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modal: {
    zIndex: 1001,
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflowY: 'auto',
    borderRadius: '24px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
    border: '1px solid var(--border-subtle)',
    position: 'relative'
  },
  modalHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid var(--border-subtle)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    fontSize: '18px',
    cursor: 'pointer'
  },
  modalContent: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    overflowY: 'auto'
  },
  questionText: {
    fontFamily: 'var(--font-sans)',
    fontSize: '16px',
    lineHeight: '1.6',
    fontWeight: '500',
    color: 'var(--text-primary)'
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
    borderRadius: '16px',
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
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    marginRight: '12px',
    fontSize: '12px',
    color: '#ffffff'
  },
  optionVal: {
    fontSize: '14px',
    fontWeight: '400',
    flex: 1
  },
  explanationSection: {
    padding: '16px !important',
    backgroundColor: 'var(--bg-secondary)',
    marginTop: '12px'
  },
  modalFooter: {
    padding: '16px 24px',
    borderTop: '1px solid var(--border-subtle)',
    display: 'flex',
    justifyContent: 'flex-end'
  },
  confirmBtn: {
    width: '100%'
  }
};
