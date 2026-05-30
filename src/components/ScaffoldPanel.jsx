import React, { useState, useEffect } from 'react';
import OptionButton from './OptionButton';
import { parseLaTeX } from './DailyChallenge';
import { ANIMATIONS } from '../data/animations';
import AnimationPlayer from './AnimationPlayer';
import { 
  WarningIcon, 
  InfoIcon, 
  CheckIcon, 
  CrossIcon, 
  ChevronDownIcon, 
  NoteIcon 
} from './Icons';

export default function ScaffoldPanel({
  phase, // scaffold1, scaffold2, scaffold3, giveUp
  scaffoldData, // L1 sub-question or concept explanation or worked solution
  onBackToOriginal,
  onGoToPhase, // e.g. onGoToPhase('scaffold2'), onGoToPhase('ladder')
  onNextQuestion, // for skipping/giveUp
  originalConcept
}) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Common Event Handlers
  const handleOptionSelect = (key) => {
    if (confirmed) return;
    setSelectedOption(key);
  };

  const handleConfirm = () => {
    if (!selectedOption || confirmed) return;
    const question = scaffoldData;
    const correct = selectedOption === question.answer;
    setIsCorrect(correct);
    setConfirmed(true);
  };

  const handleWatchVideo = () => {
    const explanation = scaffoldData;
    const query = encodeURIComponent(explanation?.videoSearchQuery || `${originalConcept} JEE explanation`);
    window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
  };

  // Local keyboard shortcuts for ScaffoldPanel
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'INPUT') return;
      const key = e.key.toUpperCase();

      if (phase === 'scaffold1') {
        if (['A', 'B', 'C', 'D'].includes(key)) {
          if (!confirmed) {
            handleOptionSelect(key);
          }
        } else if (e.key === 'Enter') {
          if (selectedOption && !confirmed) {
            handleConfirm();
          } else if (confirmed) {
            if (isCorrect) {
              onBackToOriginal();
            } else {
              onGoToPhase('scaffold2');
            }
          }
        } else if (key === 'N') {
          if (confirmed) {
            if (isCorrect) {
              onBackToOriginal();
            } else {
              onGoToPhase('scaffold2');
            }
          } else if (onNextQuestion) {
            onNextQuestion();
          }
        }
      } else if (phase === 'scaffold2') {
        if (key === 'N' || e.key === 'Enter') {
          onGoToPhase('scaffold3');
        }
      } else if (phase === 'scaffold3') {
        if (key === 'N' || e.key === 'Enter') {
          onGoToPhase('ladder');
        }
      } else if (phase === 'giveUp') {
        if ((key === 'N' || e.key === 'Enter') && onNextQuestion) {
          onNextQuestion();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, selectedOption, confirmed, isCorrect, onBackToOriginal, onGoToPhase, onNextQuestion, scaffoldData]);

  // --- SCAFFOLD PHASE 1 ---
  if (phase === 'scaffold1') {
    const question = scaffoldData; // L1 question object

    return (
      <div style={styles.card} className="card">
        <div style={styles.scaffoldHeader}>
          <span style={styles.amberHeader}>
            SCAFFOLD STEP 1: Simpler Question <ChevronDownIcon size={14} color="var(--warning)" style={{ marginLeft: '4px' }} />
          </span>
          <span style={styles.conceptChip}>Isolating: {question.concept}</span>
        </div>

        <div style={styles.questionText}>
          {parseLaTeX(question.question)}
        </div>

        <div style={styles.optionsList}>
          {Object.entries(question.options).map(([key, val]) => (
            <OptionButton
              key={key}
              letter={key}
              value={val}
              isSelected={selectedOption === key}
              isCorrect={question.answer === key}
              isWrong={selectedOption === key && question.answer !== key}
              showAnswer={confirmed}
              disabled={confirmed}
              onClick={() => handleOptionSelect(key)}
            />
          ))}
        </div>

        {/* Confirm Button slide up */}
        {selectedOption && !confirmed && (
          <div style={styles.confirmWrapper}>
            <button
              style={styles.confirmBtn}
              className="btn btn-primary animate-fade-in"
              onClick={handleConfirm}
            >
              Confirm Answer
            </button>
          </div>
        )}

        {!confirmed && onNextQuestion && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
            <button 
              className="btn btn-ghost" 
              style={{ color: 'var(--text-secondary)', fontSize: '13px' }}
              onClick={onNextQuestion}
            >
              Skip to Next Question
            </button>
          </div>
        )}

        {confirmed && (
          <div style={styles.resultContainer}>
            {isCorrect ? (
              <div style={styles.successBlock} className="card">
                <h5 style={{ color: 'var(--success)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckIcon size={16} /> Core concept solved!
                </h5>
                <p style={styles.bridgeText}>
                  <strong>Connection: </strong> {parseLaTeX(question.bridgeExplanation)}
                </p>
                <button
                  style={{ ...styles.actionBtn, marginTop: '16px' }}
                  className="btn btn-primary"
                  onClick={onBackToOriginal}
                >
                  Try the original again →
                </button>
              </div>
            ) : (
              <div style={styles.failureBlock} className="card">
                <h5 style={{ color: 'var(--danger)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CrossIcon size={16} /> That choice is incorrect
                </h5>
                <div style={{ display: 'flex', gap: '12px', marginTop: '12px', width: '100%' }}>
                  <button
                    style={{ ...styles.actionBtn, flex: 1 }}
                    className="btn btn-primary"
                    onClick={() => onGoToPhase('scaffold2')}
                  >
                    Go to Theory (Step 2)
                  </button>
                  {onNextQuestion && (
                    <button
                      style={{ ...styles.actionBtn, flex: 1, backgroundColor: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
                      className="btn btn-secondary"
                      onClick={onNextQuestion}
                    >
                      Skip Question
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // --- SCAFFOLD STEP 2 (Theory & Worked Example) ---
  if (phase === 'scaffold2') {
    const explanation = scaffoldData; // concept explanation object

    return (
      <div style={styles.card} className="card">
        <div style={styles.scaffoldHeader}>
          <span style={styles.indigoHeader}>SCAFFOLD STEP 2: Theory & Example</span>
          <span style={styles.conceptChip}>{originalConcept}</span>
        </div>

        {/* Explanation and Analogy */}
        <div style={styles.explanationSection}>
          <p style={styles.textBody}>{parseLaTeX(explanation.explanation)}</p>
          
          <blockquote style={styles.analogyBlock}>
            <strong>Analogy: </strong> <em>{parseLaTeX(explanation.analogy)}</em>
          </blockquote>

          {/* Worked Example */}
          {explanation.example && (
            <div style={styles.exampleBox}>
              <strong style={{ color: 'var(--accent-hover)', fontSize: '13px' }}>Worked Example:</strong>
              <div style={{ marginTop: '8px', fontSize: '13px', lineHeight: '1.5', color: 'var(--text-primary)' }}>
                {parseLaTeX(explanation.example)}
              </div>
            </div>
          )}

          {/* Common Mistake Warning */}
          <div style={styles.warningBox}>
            <span style={styles.warningIcon}>
              <WarningIcon size={18} color="var(--danger)" />
            </span>
            <div>
              <strong style={{ color: 'var(--danger)', fontSize: '12px' }}>Common Mistake:</strong>
              <p style={styles.boxText}>{parseLaTeX(explanation.commonMistake)}</p>
            </div>
          </div>
        </div>

        <hr style={styles.divider} />

        <div style={styles.navRow}>
          <button 
            style={{ flex: 2 }} 
            className="btn btn-primary"
            onClick={() => onGoToPhase('scaffold3')}
          >
            Next: Watch Video Tutorial →
          </button>
          {onNextQuestion && (
            <button 
              style={{ flex: 1, backgroundColor: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }} 
              className="btn btn-secondary"
              onClick={onNextQuestion}
            >
              Skip
            </button>
          )}
        </div>
      </div>
    );
  }

  // --- SCAFFOLD STEP 3 (Video Tutorial) ---
  if (phase === 'scaffold3') {
    const explanation = scaffoldData; // concept explanation object (reused)
    const animation = ANIMATIONS[originalConcept] || null;

    return (
      <div style={styles.card} className="card">
        <div style={styles.scaffoldHeader}>
          <span style={styles.indigoHeader}>SCAFFOLD STEP 3: Video Tutorial</span>
          <span style={styles.conceptChip}>{originalConcept}</span>
        </div>

        <div style={styles.explanationSection}>
          <p style={styles.textBody}>
            Visual explanations and whiteboard lessons can help build strong physical intuition for this concept. Watch a dedicated tutor video.
          </p>

          {/* JEE Connection Info */}
          <div style={styles.infoBox}>
            <span style={styles.infoIcon}>
              <InfoIcon size={18} color="var(--accent)" />
            </span>
            <div>
              <strong style={{ color: 'var(--accent)', fontSize: '12px' }}>JEE Connection:</strong>
              <p style={styles.boxText}>{parseLaTeX(explanation.jeeConnection)}</p>
            </div>
          </div>
        </div>

        {/* Pre-rendered Manim Animation */}
        {animation && (
          <div style={{ marginBottom: '16px' }}>
            <AnimationPlayer
              path={animation.file}
              title={animation.title}
              description={`Animated visualization of ${originalConcept}`}
            />
          </div>
        )}

        <button 
          style={styles.youtubeBtn} 
          className="btn btn-secondary"
          onClick={handleWatchVideo}
        >
           Search & Watch on YouTube
        </button>

        <hr style={styles.divider} />

        <div style={styles.navRow}>
          <button 
            style={styles.halfBtn} 
            className="btn btn-secondary"
            onClick={onBackToOriginal}
          >
            I get it now — try again
          </button>
          <button 
            style={styles.halfBtn} 
            className="btn btn-primary"
            onClick={() => onGoToPhase('ladder')}
          >
            Still confused — build from basics
          </button>
        </div>

        {onNextQuestion && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
            <button 
              className="btn btn-ghost" 
              style={{ color: 'var(--text-secondary)', fontSize: '13px' }}
              onClick={onNextQuestion}
            >
              Skip to Next Question
            </button>
          </div>
        )}
      </div>
    );
  }

  // --- GIVE UP / WORKED SOLUTION ---
  if (phase === 'giveUp') {
    const solution = scaffoldData; // worked solution object

    return (
      <div style={styles.card} className="card">
        <div style={styles.scaffoldHeader}>
          <span style={styles.redHeader}>
            Worked Solution <NoteIcon size={14} color="var(--danger)" style={{ marginLeft: '4px' }} />
          </span>
          <span style={styles.conceptChip}>Reference Mode</span>
        </div>

        <div style={styles.solutionContainer}>
          <h4 style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: '16px' }}>
            Step-by-Step Derivation:
          </h4>
          
          <div style={styles.stepsList}>
            {solution.solutionSteps?.map((step, idx) => (
              <div key={idx} style={styles.stepItem}>
                <span style={styles.stepNumber}>{idx + 1}</span>
                <span style={styles.stepText}>{parseLaTeX(step)}</span>
              </div>
            ))}
          </div>

          <div style={styles.derivationBox}>
            <strong>Conclusion: </strong> {parseLaTeX(solution.finalDerivation)}
          </div>
        </div>

        <div style={styles.footerRow}>
          <button
            style={styles.confirmBtn}
            className="btn btn-primary"
            onClick={onNextQuestion}
          >
            Next Question →
          </button>
        </div>
      </div>
    );
  }

  return null;
}

const styles = {
  card: {
    backgroundColor: 'var(--bg-card)',
    borderRadius: '16px',
    padding: '24px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    boxSizing: 'border-box'
  },
  scaffoldHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '8px'
  },
  amberHeader: {
    color: 'var(--warning)',
    fontWeight: '800',
    fontSize: '15px',
    display: 'flex',
    alignItems: 'center'
  },
  indigoHeader: {
    color: 'var(--accent-hover)',
    fontWeight: '800',
    fontSize: '15px'
  },
  redHeader: {
    color: 'var(--danger)',
    fontWeight: '800',
    fontSize: '15px',
    display: 'flex',
    alignItems: 'center'
  },
  conceptChip: {
    padding: '4px 10px',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-elevated)',
    fontSize: '11px',
    fontWeight: '600',
    color: 'var(--text-secondary)'
  },
  questionText: {
    fontSize: '17px',
    fontWeight: '500',
    lineHeight: '1.7',
    fontFamily: 'var(--font-sans)',
    color: 'var(--text-primary)'
  },
  optionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  confirmWrapper: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '8px'
  },
  confirmBtn: {
    width: '100%'
  },
  resultContainer: {
    marginTop: '12px',
    width: '100%'
  },
  successBlock: {
    padding: '16px !important',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch'
  },
  failureBlock: {
    padding: '16px !important',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch'
  },
  bridgeText: {
    fontSize: '13px',
    color: 'var(--text-primary)',
    lineHeight: '1.4'
  },
  actionBtn: {
    width: '100%'
  },
  explanationSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  textBody: {
    fontSize: '14px',
    color: 'var(--text-primary)',
    lineHeight: '1.6'
  },
  analogyBlock: {
    paddingLeft: '16px',
    borderLeft: '3px solid var(--accent)',
    color: 'var(--text-secondary)',
    fontSize: '13px',
    margin: '8px 0',
    fontStyle: 'italic'
  },
  warningBox: {
    display: 'flex',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: 'var(--danger-dim)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '12px',
    alignItems: 'center'
  },
  warningIcon: {
    display: 'flex',
    alignItems: 'center'
  },
  infoBox: {
    display: 'flex',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: 'var(--accent-dim)',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    borderRadius: '12px',
    alignItems: 'center'
  },
  infoIcon: {
    display: 'flex',
    alignItems: 'center'
  },
  boxText: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    marginTop: '2px',
    lineHeight: '1.4'
  },
  divider: {
    border: 'none',
    borderTop: '1px solid var(--border-subtle)',
    margin: '8px 0'
  },
  videoSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  youtubeBtn: {
    width: '100%',
    color: '#ff0000',
    borderColor: 'rgba(255, 0, 0, 0.2)',
    ':hover': {
      backgroundColor: 'rgba(255,0,0,0.05)',
      borderColor: 'red'
    }
  },
  navRow: {
    display: 'flex',
    gap: '12px'
  },
  halfBtn: {
    flex: 1
  },
  solutionContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  stepsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  stepItem: {
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-start'
  },
  stepNumber: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: 'var(--bg-elevated)',
    color: 'var(--accent-hover)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '12px',
    flexShrink: 0
  },
  stepText: {
    fontSize: '13px',
    color: 'var(--text-primary)',
    lineHeight: '1.5',
    flex: 1
  },
  derivationBox: {
    padding: '16px',
    borderRadius: '12px',
    backgroundColor: 'var(--success-dim)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--success)',
    marginTop: '16px'
  },
  exampleBox: {
    padding: '16px',
    borderRadius: '12px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-subtle)',
    marginTop: '12px',
    textAlign: 'left'
  },
  footerRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '12px'
  }
};
