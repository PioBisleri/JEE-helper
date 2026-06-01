import { parseLaTeX } from './DailyChallenge';
import type { CSSProperties } from 'react';

interface OptionButtonProps {
  letter: string;
  value: string;
  isSelected: boolean;
  isCorrect: boolean;
  isWrong: boolean;
  showAnswer: boolean;
  disabled: boolean;
  onClick: () => void;
}

export default function OptionButton({
  letter,
  value,
  isSelected,
  isCorrect,
  isWrong,
  showAnswer,
  disabled,
  onClick
}: OptionButtonProps) {
  const getButtonStyles = (): CSSProperties => {
    let base: CSSProperties = { ...styles.btn };

    if (isSelected && !showAnswer) {
      base = { ...base, borderColor: 'var(--accent)', backgroundColor: 'var(--accent-dim)' };
    }

    if (showAnswer) {
      if (isSelected && isWrong) {
        base = { ...base, borderColor: 'var(--danger)', backgroundColor: 'var(--danger-dim)' };
      } else if (isCorrect) {
        base = { ...base, borderColor: 'var(--success)', backgroundColor: 'var(--success-dim)' };
      }
    }

    return base;
  };

  const getBadgeStyles = (): CSSProperties => {
    let base: CSSProperties = { ...styles.badge };
    if (isSelected && !showAnswer) {
      base = { ...base, backgroundColor: 'var(--accent)' };
    } else if (showAnswer) {
      if (isSelected && isWrong) {
        base = { ...base, backgroundColor: 'var(--danger)' };
      } else if (isCorrect) {
        base = { ...base, backgroundColor: 'var(--success)' };
      }
    }
    return base;
  };

  const showCheckmark = showAnswer && isCorrect;
  const showCross = showAnswer && isSelected && isWrong;
  const showLetter = !showCheckmark && !showCross;

  return (
    <button style={getButtonStyles()} disabled={disabled} onClick={onClick}>
      <span style={getBadgeStyles()}>
        {showCross && '✗'}
        {showCheckmark && '✓'}
        {showLetter && letter}
      </span>
      <span style={styles.text}>{parseLaTeX(value)}</span>
    </button>
  );
}

const styles: Record<string, CSSProperties> = {
  btn: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: '14px 16px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-default)',
    backgroundColor: 'var(--bg-card)',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-sans)',
    textAlign: 'left',
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'all 0.15s ease',
    outline: 'none',
    boxSizing: 'border-box',
  },
  badge: {
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '12px',
    color: '#ffffff',
    backgroundColor: 'var(--bg-elevated)',
    marginRight: '12px',
    flexShrink: 0,
    transition: 'background-color 0.15s',
  },
  text: {
    fontSize: '14px',
    fontWeight: '500',
    lineHeight: '1.5',
    flex: 1,
  },
};
