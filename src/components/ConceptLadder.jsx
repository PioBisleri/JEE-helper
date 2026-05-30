import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { parseLaTeX } from './DailyChallenge';

export default function ConceptLadder({
  ladderData, // { ladder: [ { concept, explanation, example, videoSearchQuery } ] }
  stuckConcept,
  onCompleteLadder,
  onNextQuestion
}) {
  const [currentRung, setCurrentRung] = useState(0);
  const ladder = ladderData.ladder || [];

  const handleGotIt = () => {
    if (currentRung < ladder.length - 1) {
      setCurrentRung(currentRung + 1);
    } else {
      // Completed last rung! Trigger complete event
      onCompleteLadder();
    }
  };

  // Keyboard shortcut listener inside ConceptLadder
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'INPUT') return;
      const key = e.key.toUpperCase();

      if (key === 'ENTER' || key === ' ' || key === 'G') {
        handleGotIt();
      } else if (key === 'N') {
        if (onNextQuestion) {
          onNextQuestion();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentRung, ladder.length, onCompleteLadder, onNextQuestion]);

  const handleWatchVideo = (rung) => {
    const query = encodeURIComponent(rung.videoSearchQuery || `${rung.concept} JEE explanation`);
    window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.badge}>SCAFFOLD STEP 4</span>
        <h3 style={styles.title}>Prerequisite Concept Ladder</h3>
        <p style={styles.subtitle}>Let's build up from the basics to solve: <strong>{stuckConcept}</strong></p>
      </div>

      <div style={styles.stepperContainer}>
        {ladder.map((rung, index) => {
          const isCompleted = index < currentRung;
          const isActive = index === currentRung;
          const isLocked = index > currentRung;

          return (
            <div key={index} style={styles.stepRow}>
              {/* Stepper Line and Node indicator */}
              <div style={styles.stepperGutter}>
                <div 
                  style={{
                    ...styles.stepNode,
                    ...(isCompleted ? styles.completedNode : {}),
                    ...(isActive ? styles.activeNode : {}),
                    ...(isLocked ? styles.lockedNode : {})
                  }}
                >
                  {isCompleted ? '✓' : index + 1}
                </div>
                {index < ladder.length - 1 && (
                  <div 
                    style={{
                      ...styles.stepperLine,
                      backgroundColor: isCompleted ? 'var(--success)' : 'var(--border-subtle)'
                    }} 
                  />
                )}
              </div>

              {/* Rung Content */}
              <div style={styles.rungWrapper}>
                <motion.div
                  layout
                  transition={{ duration: 0.25 }}
                  style={{
                    ...styles.rungCard,
                    ...(isCompleted ? styles.completedCard : {}),
                    ...(isActive ? styles.activeCard : {}),
                    ...(isLocked ? styles.lockedCard : {})
                  }}
                  className="card"
                >
                  <div style={styles.rungHeader} onClick={() => {
                    // Allow toggling back to look at completed rungs
                    if (isCompleted) {
                      setCurrentRung(index);
                    }
                  }}>
                    <h4 style={{
                      ...styles.rungTitle,
                      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)'
                    }}>
                      {rung.concept}
                    </h4>
                    {isCompleted && (
                      <span style={styles.completedTag}>Reviewing</span>
                    )}
                  </div>

                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={styles.rungContent}
                      >
                        <p style={styles.explanationText}>
                          {parseLaTeX(rung.explanation)}
                        </p>

                        {rung.example && (
                          <div style={styles.exampleBox}>
                            <strong style={styles.exampleTitle}>Example:</strong>
                            <p style={styles.exampleText}>{parseLaTeX(rung.example)}</p>
                          </div>
                        )}

                        <div style={styles.actionRow}>
                          <button 
                            className="btn btn-secondary" 
                            style={styles.youtubeBtn}
                            onClick={() => handleWatchVideo(rung)}
                          >
                            Watch video
                          </button>
                          
                          <button 
                            className="btn btn-primary" 
                            style={styles.gotItBtn}
                            onClick={handleGotIt}
                          >
                            {index === ladder.length - 1 ? "Complete Ladder" : "Got it"}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            </div>
          );
        })}
      </div>

      {onNextQuestion && (
        <button 
          className="btn btn-ghost" 
          style={{ alignSelf: 'center', marginTop: '16px', color: 'var(--text-secondary)' }}
          onClick={onNextQuestion}
        >
          Skip to Next Question →
        </button>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    width: '100%'
  },
  header: {
    textAlign: 'center'
  },
  badge: {
    color: 'var(--accent-hover)',
    fontWeight: '800',
    fontSize: '11px',
    letterSpacing: '1px'
  },
  title: {
    fontSize: '18px',
    fontWeight: '700',
    margin: '4px 0'
  },
  subtitle: {
    fontSize: '13px',
    color: 'var(--text-secondary)'
  },
  stepperContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%'
  },
  stepRow: {
    display: 'flex',
    gap: '16px',
    width: '100%'
  },
  stepperGutter: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flexShrink: 0,
    width: '32px'
  },
  stepNode: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '700',
    fontFamily: 'var(--font-mono)',
    border: '2px solid'
  },
  completedNode: {
    backgroundColor: 'var(--success-dim)',
    color: 'var(--success)',
    borderColor: 'var(--success)'
  },
  activeNode: {
    backgroundColor: 'var(--accent-dim)',
    color: 'var(--accent-hover)',
    borderColor: 'var(--accent)'
  },
  lockedNode: {
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-muted)',
    borderColor: 'var(--border-subtle)'
  },
  stepperLine: {
    width: '2px',
    flexGrow: 1,
    margin: '4px 0'
  },
  rungWrapper: {
    flexGrow: 1,
    paddingBottom: '24px',
    minWidth: 0
  },
  rungCard: {
    padding: '16px !important',
    backgroundColor: 'var(--bg-card)',
    transition: 'all 0.25s ease'
  },
  completedCard: {
    borderLeft: '4px solid var(--success)',
    backgroundColor: 'rgba(16, 185, 129, 0.02)',
    cursor: 'pointer'
  },
  activeCard: {
    borderLeft: '4px solid var(--accent)',
    boxShadow: '0 0 16px var(--accent-glow)'
  },
  lockedCard: {
    opacity: 0.5,
    backgroundColor: 'rgba(17, 24, 39, 0.3)',
    pointerEvents: 'none'
  },
  rungHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  rungTitle: {
    fontSize: '14px',
    fontWeight: '700',
    margin: 0
  },
  completedTag: {
    fontSize: '10px',
    fontWeight: '600',
    color: 'var(--success)',
    padding: '2px 6px',
    backgroundColor: 'var(--success-dim)',
    borderRadius: '4px'
  },
  rungContent: {
    marginTop: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    overflow: 'hidden'
  },
  explanationText: {
    fontSize: '13px',
    color: 'var(--text-primary)',
    lineHeight: '1.5'
  },
  exampleBox: {
    padding: '12px',
    borderRadius: '10px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-subtle)'
  },
  exampleTitle: {
    fontSize: '12px',
    color: 'var(--text-secondary)'
  },
  exampleText: {
    fontSize: '13px',
    color: 'var(--text-primary)',
    marginTop: '4px',
    lineHeight: '1.4'
  },
  actionRow: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px'
  },
  youtubeBtn: {
    padding: '10px 16px',
    fontSize: '12px',
    color: '#ff0000',
    borderColor: 'rgba(255,0,0,0.15)',
    flex: 1
  },
  gotItBtn: {
    padding: '10px 16px',
    fontSize: '12px',
    flex: 1.5
  }
};
