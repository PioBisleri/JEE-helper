import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../utils/storage';
import katex from 'katex';
import { StarIcon } from './Icons';

function renderKatex(math: string, displayMode = false): React.ReactNode {
  if (!math || typeof math !== 'string') return math;
  try {
    let fixed = math;
    fixed = fixed.replace(/\\text([a-zA-Z]+)/g, '\\text{$1}');
    fixed = fixed.replace(/\\vec([a-zA-Z]+)/g, '\\vec{$1}');
    const html = katex.renderToString(fixed, {
      displayMode,
      throwOnError: false,
      strict: false
    });
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  } catch {
    return <span style={{ color: 'var(--danger)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>{math}</span>;
  }
}

function wrapBareLatex(text: string): string {
  if (!text || typeof text !== 'string') return text;
  let s = text;

  const placeholders: string[] = [];
  s = s.replace(/(\$\$[\s\S]*?\$\$|\$[^$]+\$)/g, (match) => {
    const idx = placeholders.length;
    placeholders.push(match);
    return `__PH${idx}__`;
  });

  s = s.replace(/(\\\([\s\S]*?\\\))/g, (match) => {
    const idx = placeholders.length;
    placeholders.push(match);
    return `__PH${idx}__`;
  });

  s = s.replace(/\\(frac|sqrt|vec|hat|bar|dot|overline|underline|text|mathrm|mathbf|operatorname)\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g, (match) => `$${match}$`);

  s = s.replace(/\\(vec|hat|bar|dot|ddot|tilde)\s*([a-zA-Z])/g, '$\\$1{$2}$');

  s = s.replace(/\\(alpha|beta|gamma|delta|epsilon|theta|lambda|mu|pi|sigma|omega|phi|psi|chi|rho|tau|nu|xi|zeta|eta|iota|kappa|Delta|Gamma|Theta|Lambda|Xi|Pi|Sigma|Upsilon|Phi|Psi|Omega|infty|partial|nabla|rightarrow|leftarrow|leftrightarrow|cdot|times|div|pm|mp|leq|geq|neq|approx|equiv|sim|propto|subset|supset|cap|cup|forall|exists|neg|perp|parallel|angle)(?![a-zA-Z])/g, '$\\$1$');

  s = s.replace(/\\\[([\s\S]*?)\\\]/g, (_, eq) => `$$${eq.trim()}$$`);

  s = s.replace(/__PH(\d+)__/g, (_, idx) => placeholders[parseInt(idx)]);

  return s;
}

export function parseRichContent(text: string): React.ReactNode {
  if (!text || typeof text !== 'string') return text;

  let processed = text
    .replace(/\\n/g, '\n')
    .replace(/\\r\\n/g, '\n')
    .replace(/\\r/g, '\n')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');

  const mathBlocks: string[] = [];
  processed = processed.replace(/(\$\$[\s\S]*?\$\$|\$[^$]+\$)/g, (match) => {
    const idx = mathBlocks.length;
    mathBlocks.push(match);
    return `__MATH${idx}__`;
  });

  processed = processed.replace(/(\\\([\s\S]*?\\\))/g, (match) => {
    const idx = mathBlocks.length;
    mathBlocks.push(match);
    return `__MATH${idx}__`;
  });

  processed = processed.replace(/^### (.+)$/gm, '<h5>$1</h5>');
  processed = processed.replace(/^## (.+)$/gm, '<h4>$1</h4>');
  processed = processed.replace(/^# (.+)$/gm, '<h3>$1</h3>');
  processed = processed.replace(/^> (.+)$/gm, '<quote>$1</quote>');

  processed = processed.replace(/__MATH(\d+)__/g, (_, idx) => mathBlocks[parseInt(idx)]);

  processed = wrapBareLatex(processed);

  const lines = processed.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} style={{ margin: '4px 0 8px 0', paddingLeft: '20px' }}>
          {listItems.map((item, i) => (
            <li key={i} style={{ marginBottom: '3px', lineHeight: '1.6', fontSize: '13px' }}>
              {parseInlineContent(item)}
            </li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      continue;
    }

    if (/^[-*]\s/.test(trimmed) || /^\d+\.\s/.test(trimmed)) {
      const itemText = trimmed.replace(/^[-*]\s+/, '').replace(/^\d+\.\s+/, '');
      listItems.push(itemText);
      continue;
    }

    flushList();

    if (trimmed.startsWith('<h3>') || trimmed.startsWith('<h4>') || trimmed.startsWith('<h5>')) {
      const content = trimmed.replace(/<\/?h[345]>/g, '');
      elements.push(
        <div key={`h-${elements.length}`} style={{ marginTop: '12px', marginBottom: '4px' }}>
          {parseInlineContent(content)}
        </div>
      );
      continue;
    }

    if (trimmed.startsWith('<quote>')) {
      const content = trimmed.replace(/<\/?quote>/g, '');
      elements.push(
        <div key={`q-${elements.length}`} style={{
          borderLeft: '2px solid var(--accent)',
          paddingLeft: '12px',
          margin: '6px 0',
          color: 'var(--text-secondary)',
          fontStyle: 'italic',
          fontSize: '13px'
        }}>
          {parseInlineContent(content)}
        </div>
      );
      continue;
    }

    elements.push(
      <div key={`p-${elements.length}`} style={{ marginBottom: '4px', lineHeight: '1.6', fontSize: '13px' }}>
        {parseInlineContent(trimmed)}
      </div>
    );
  }

  flushList();

  if (elements.length === 0) return text;
  return <>{elements}</>;
}

function parseInlineContent(text: string): React.ReactNode {
  if (!text) return text;

  let s = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  const parts: React.ReactNode[] = [];
  const tagRegex = /<strong>([\s\S]*?)<\/strong>/g;
  let lastIndex = 0;
  let match;

  while ((match = tagRegex.exec(s)) !== null) {
    if (match.index > lastIndex) {
      parts.push(parseLaTeX(s.substring(lastIndex, match.index)));
    }
    parts.push(<strong key={`b-${parts.length}`} style={{ fontWeight: '700' }}>{parseLaTeX(match[1])}</strong>);
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < s.length) {
    parts.push(parseLaTeX(s.substring(lastIndex)));
  }

  if (parts.length === 0) return parseLaTeX(s);
  if (parts.length === 1) return parts[0];
  return <>{parts}</>;
}

export default function DailyChallenge() {
  const navigate = useNavigate();
  const [isCompletedToday, setIsCompletedToday] = useState(false);
  const [todayScore, setTodayScore] = useState(0);

  useEffect(() => {
    const history = storage.getDailyChallengeHistory() || [];
    const todayStr = new Date().toDateString();
    const todayAttempt = history.find((h: { date: string; score: number }) => new Date(h.date).toDateString() === todayStr);
    
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


export function normalizeLatex(str: string): string {
  if (!str) return str;
  let s = str;
  s = s.replace(/\\text([a-zA-Z]+)/g, '\\text{$1}');
  s = s.replace(/\\vec([a-zA-Z]+)/g, '\\vec{$1}');
  return s;
}

export function parseLaTeX(text: string): React.ReactNode {
  if (!text || typeof text !== 'string') return text;

  const regex = /(\$\$)([\s\S]*?)\$\$|(\\\[)([\s\S]*?)\\\]|(\\\()([\s\S]*?)\\\)|(\$)([\s\S]*?)\$/g;
  
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const before = text.substring(lastIndex, match.index);
      if (before) elements.push(before);
    }
    
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
  
  if (lastIndex < text.length) {
    const remaining = text.substring(lastIndex);
    if (remaining) elements.push(remaining);
  }
  
  if (elements.length === 0) return text;
  
  if (elements.length === 1) return elements[0];
  
  return <>{elements.map((el, i) => (typeof el === 'string' ? <span key={`txt-${i}`}>{el}</span> : el))}</>;
}

const styles: Record<string, React.CSSProperties> = {
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
