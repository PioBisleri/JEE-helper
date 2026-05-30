import React, { useState, useEffect } from 'react';
import { parseLaTeX } from './DailyChallenge';

export default function OptionButton({ 
  letter, 
  value, 
  isSelected, 
  isCorrect, 
  isWrong, 
  showAnswer, 
  disabled, 
  onClick 
}) {
  const [delayedCorrectHighlight, setDelayedCorrectHighlight] = useState(false);

  // Reveal correct answer shortly after confirmation if wrong option was selected
  useEffect(() => {
    if (showAnswer) {
      if (isWrong) {
        // chosen wrong, reveal correct answer after 600ms
        const timer = setTimeout(() => {
          setDelayedCorrectHighlight(true);
        }, 600);
        return () => clearTimeout(timer);
      } else if (isCorrect) {
        // chosen correct, immediately highlight it
        setDelayedCorrectHighlight(true);
      }
    } else {
      setDelayedCorrectHighlight(false);
    }
  }, [showAnswer, isWrong, isCorrect]);

  // Determine button styles based on state
  const getButtonStyles = () => {
    let base = { ...styles.btn };
    
    if (isSelected && !showAnswer) {
      base = { ...base, ...styles.selected };
    }

    if (showAnswer) {
      if (isSelected && isWrong) {
        base = { ...base, ...styles.wrong };
      } else if (isCorrect && delayedCorrectHighlight) {
        base = { ...base, ...styles.correct, ...styles.pulseAnimation };
      }
    }

    return base;
  };

  const getBadgeStyles = () => {
    let base = { ...styles.badge };
    if (isSelected && !showAnswer) {
      base = { ...base, backgroundColor: 'var(--accent)' };
    } else if (showAnswer) {
      if (isSelected && isWrong) {
        base = { ...base, backgroundColor: 'var(--danger)' };
      } else if (isCorrect && delayedCorrectHighlight) {
        base = { ...base, backgroundColor: 'var(--success)' };
      }
    }
    return base;
  };

  return (
    <button
      style={getButtonStyles()}
      disabled={disabled}
      onClick={onClick}
    >
      <span style={getBadgeStyles()}>
        {showAnswer && isSelected && isWrong && '✗'}
        {showAnswer && isCorrect && delayedCorrectHighlight && '✓'}
        {!(showAnswer && (isCorrect && delayedCorrectHighlight || isSelected && isWrong)) && letter}
      </span>
      <span style={styles.text}>{parseLaTeX(value)}</span>
    </button>
  );
}

const styles = {
  btn: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: '16px 20px',
    borderRadius: '16px',
    border: '2px solid var(--border-default)',
    backgroundColor: 'var(--bg-card)',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-sans)',
    textAlign: 'left',
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'all 0.15s ease-in-out',
    outline: 'none',
    boxSizing: 'border-box'
  },
  selected: {
    borderColor: 'var(--accent)',
    backgroundColor: 'var(--bg-card-hover)',
    boxShadow: '0 0 0 1px var(--accent-glow)'
  },
  correct: {
    borderColor: 'var(--success)',
    backgroundColor: 'var(--success-dim)'
  },
  wrong: {
    borderColor: 'var(--danger)',
    backgroundColor: 'var(--danger-dim)'
  },
  pulseAnimation: {
    // Pulse animation applied using standard CSS keyframes
    animation: 'correct-pulse 1.2s ease-out infinite'
  },
  badge: {
    width: '32px',
    height: '32px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '13px',
    color: '#ffffff',
    backgroundColor: 'var(--bg-elevated)',
    marginRight: '16px',
    flexShrink: 0,
    transition: 'background-color 0.15s'
  },
  text: {
    fontSize: '15px',
    fontWeight: '500',
    lineHeight: '1.5',
    flex: 1
  }
};
