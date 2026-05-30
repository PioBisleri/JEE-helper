import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../components/UserContext';
import { requestPermission } from '../utils/notifications';
import { motion } from 'framer-motion';
import { TargetIcon } from '../components/Icons';

export default function Onboarding() {
  const navigate = useNavigate();
  const { updateName, updateExam, updatePrefs } = useUser();
  const [step, setStep] = useState(1);
  const [localName, setLocalName] = useState('');
  const [localExamDate, setLocalExamDate] = useState('');
  const [daysRemaining, setDaysRemaining] = useState(null);

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (localName.trim()) {
      updateName(localName.trim());
      setStep(2);
    }
  };

  const handleDateChange = (e) => {
    const val = e.target.value;
    setLocalExamDate(val);
    if (val) {
      const diff = Math.ceil((new Date(val) - new Date()) / (1000 * 60 * 60 * 24));
      setDaysRemaining(diff);
    } else {
      setDaysRemaining(null);
    }
  };

  const handleDateSubmit = (e) => {
    e.preventDefault();
    if (localExamDate) {
      updateExam(localExamDate);
      setStep(3);
    }
  };

  const handleNotificationSetup = async (grant) => {
    if (grant) {
      const accepted = await requestPermission();
      updatePrefs({ notificationsEnabled: accepted });
    } else {
      updatePrefs({ notificationsEnabled: false });
    }
    
    // Onboarding complete
    localStorage.setItem('jeeforge_onboarded', 'true');
    navigate('/');
  };

  // Variants for animation
  const formVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formWidth}>
        
        {step === 1 && (
          <motion.div 
            variants={formVariants} 
            initial="hidden" 
            animate="visible"
            style={styles.aligner}
          >
            <div style={styles.logoRow}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: 'var(--accent)' }}>
                <polygon points="12,2 21,7 21,17 12,22 3,17 3,7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.15" />
                <circle cx="12" cy="12" r="3" fill="var(--accent-secondary)" />
                <circle cx="12" cy="2" r="1.5" fill="currentColor" />
                <circle cx="21" cy="7" r="1.5" fill="currentColor" />
                <circle cx="21" cy="17" r="1.5" fill="currentColor" />
                <circle cx="12" cy="22" r="1.5" fill="currentColor" />
                <circle cx="3" cy="17" r="1.5" fill="currentColor" />
                <circle cx="3" cy="7" r="1.5" fill="currentColor" />
              </svg>
              <h1 style={styles.brandTitle}>Nexus JEE</h1>
            </div>
            <p style={styles.brandTag}>Master JEE by solving, not just reading.</p>
            
            <form style={styles.card} className="card" onSubmit={handleNameSubmit}>
              <h2 style={styles.stepTitle}>What should we call you?</h2>
              <input
                type="text"
                value={localName}
                onChange={(e) => setLocalName(e.target.value)}
                placeholder="Enter your name"
                style={styles.input}
                autoFocus
              />
              <button
                type="submit"
                disabled={!localName.trim()}
                className="btn btn-primary"
                style={styles.button}
              >
                Continue →
              </button>
            </form>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            variants={formVariants} 
            initial="hidden" 
            animate="visible"
            style={styles.aligner}
          >
            <h1 style={styles.stepHeader}>Exam Blueprint</h1>
            <p style={styles.brandTag}>Help us personalize your countdown planner.</p>

            <form style={styles.card} className="card" onSubmit={handleDateSubmit}>
              <h2 style={styles.stepTitle}>When is your JEE Mains target date?</h2>
              <input
                type="date"
                value={localExamDate}
                onChange={handleDateChange}
                style={styles.input}
                required
              />
              {daysRemaining !== null && (
                <p style={{
                  ...styles.statusText,
                  color: daysRemaining > 0 ? 'var(--accent-hover)' : 'var(--danger)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}>
                  {daysRemaining > 0 ? (
                    <>
                      <TargetIcon size={16} />
                      <span>{daysRemaining} days until your exam</span>
                    </>
                  ) : (
                    'Target date has already passed!'
                  )}
                </p>
              )}
              <div style={styles.buttonGroup}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn btn-secondary"
                  style={styles.halfBtn}
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={!localExamDate}
                  className="btn btn-primary"
                  style={styles.halfBtn}
                >
                  Continue →
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            variants={formVariants} 
            initial="hidden" 
            animate="visible"
            style={styles.aligner}
          >
            <h1 style={styles.stepHeader}>Stay Consistent</h1>
            <p style={styles.brandTag}>JEE preparation requires regular habits. Let us keep you accountable.</p>

            <div style={styles.card} className="card">
              <h2 style={styles.stepTitle}>Enable study reminders?</h2>
              <p style={styles.descText}>
                We will send subtle notifications for streak updates, review schedules, and weekly test availability. No spam, ever.
              </p>
              <div style={styles.buttonCol}>
                <button
                  onClick={() => handleNotificationSetup(true)}
                  className="btn btn-primary"
                  style={styles.fullBtn}
                >
                  Allow Revision Reminders
                </button>
                <button
                  onClick={() => handleNotificationSetup(false)}
                  className="btn btn-ghost"
                  style={styles.fullBtn}
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: 'var(--bg-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    boxSizing: 'border-box'
  },
  formWidth: {
    width: '100%',
    maxWidth: '400px'
  },
  aligner: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    textAlign: 'center'
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '8px'
  },
  brandTitle: {
    fontSize: '28px',
    fontWeight: '800',
    color: 'var(--text-primary)'
  },
  brandTag: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    marginBottom: '32px'
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    padding: '32px !important',
    textAlign: 'left'
  },
  stepTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    marginBottom: '4px'
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid var(--border-default)',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-sans)',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    ':focus': {
      borderColor: 'var(--accent)'
    }
  },
  button: {
    width: '100%'
  },
  stepHeader: {
    fontSize: '24px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    marginBottom: '8px'
  },
  statusText: {
    fontSize: '13px',
    fontWeight: '600',
    textAlign: 'center',
    margin: '4px 0'
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    width: '100%'
  },
  halfBtn: {
    flex: 1
  },
  descText: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
    marginBottom: '8px'
  },
  buttonCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  fullBtn: {
    width: '100%'
  }
};
