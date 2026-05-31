import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../components/UserContext';
import { requestPermission } from '../utils/notifications';
import { storage } from '../utils/storage';
import { PROVIDERS } from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

const providerList = [
  { id: 'openrouter', name: 'OpenRouter', desc: 'Access multiple models via one API', placeholder: 'sk-or-...' },
  { id: 'openai', name: 'OpenAI', desc: 'GPT-4o, GPT-4, and more', placeholder: 'sk-...' },
  { id: 'anthropic', name: 'Anthropic', desc: 'Claude 3.5 Sonnet, Haiku', placeholder: 'sk-ant-...' },
  { id: 'gemini', name: 'Google Gemini', desc: 'Gemini 2.0 Flash and Pro', placeholder: 'AIza...' },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { updateName, updateExam, updatePrefs } = useUser();
  const [step, setStep] = useState(1);
  const [localName, setLocalName] = useState('');
  const [localExamDate, setLocalExamDate] = useState('');
  const [daysRemaining, setDaysRemaining] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [customModel, setCustomModel] = useState('');
  const [keyError, setKeyError] = useState('');

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (localName.trim()) { updateName(localName.trim()); setStep(2); }
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
    if (localExamDate) { updateExam(localExamDate); setStep(3); }
  };

  const handleAISubmit = () => {
    if (!selectedProvider) { setKeyError('Select a provider'); return; }
    if (!apiKey.trim()) { setKeyError('Enter your API key'); return; }
    setKeyError('');
    storage.setAIProvider(selectedProvider);
    storage.setAIApiKey(apiKey.trim());
    if (customModel.trim()) storage.setAIModel(customModel.trim());
    setStep(4);
  };

  const handleNotificationSetup = async (grant) => {
    if (grant) {
      const accepted = await requestPermission();
      updatePrefs({ notificationsEnabled: accepted });
    } else {
      updatePrefs({ notificationsEnabled: false });
    }
    localStorage.setItem('jeeforge_onboarded', 'true');
    navigate('/');
  };

  const activeProvider = providerList.find(p => p.id === selectedProvider);

  return (
    <div style={styles.container}>
      <div style={styles.formWidth}>

        {/* Progress Dots */}
        <div style={styles.progressRow}>
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              style={{
                ...styles.progressDot,
                backgroundColor: s <= step ? 'var(--accent)' : 'var(--bg-elevated)',
                width: s === step ? '24px' : '6px',
              }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} style={styles.step}>
              <div style={styles.brand}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--accent)' }}>
                  <polygon points="12,2 21,7 21,17 12,22 3,17 3,7" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
                  <circle cx="12" cy="12" r="2" fill="currentColor" />
                </svg>
                <span style={styles.brandName}>Nexus JEE</span>
              </div>
              <h1 style={styles.title}>Welcome</h1>
              <p style={styles.subtitle}>What should we call you?</p>
              <form onSubmit={handleNameSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input type="text" value={localName} onChange={(e) => setLocalName(e.target.value)} placeholder="Your name" style={styles.input} autoFocus />
                <button type="submit" disabled={!localName.trim()} className="btn btn-primary" style={{ width: '100%' }}>Continue</button>
              </form>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} style={styles.step}>
              <h1 style={styles.title}>Exam date</h1>
              <p style={styles.subtitle}>When is your JEE Mains target?</p>
              <form onSubmit={handleDateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input type="date" value={localExamDate} onChange={handleDateChange} style={styles.input} required />
                {daysRemaining !== null && (
                  <p style={{ fontSize: '13px', fontWeight: '600', textAlign: 'center', color: daysRemaining > 0 ? 'var(--accent)' : 'var(--danger)' }}>
                    {daysRemaining > 0 ? `${daysRemaining} days to go` : 'Date has passed'}
                  </p>
                )}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={() => setStep(1)} className="btn btn-secondary" style={{ flex: 1 }}>Back</button>
                  <button type="submit" disabled={!localExamDate} className="btn btn-primary" style={{ flex: 1 }}>Continue</button>
                </div>
              </form>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} style={styles.step}>
              <h1 style={styles.title}>AI Provider</h1>
              <p style={styles.subtitle}>Choose your AI provider and enter your API key.</p>

              {/* Provider grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                {providerList.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { setSelectedProvider(p.id); setKeyError(''); }}
                    style={{
                      ...styles.providerCard,
                      borderColor: selectedProvider === p.id ? 'var(--accent)' : 'var(--border-default)',
                      backgroundColor: selectedProvider === p.id ? 'var(--accent-dim)' : 'var(--bg-secondary)',
                    }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>{p.name}</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>{p.desc}</span>
                  </button>
                ))}
              </div>

              {/* API Key input */}
              {selectedProvider && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    {activeProvider.name} API Key
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => { setApiKey(e.target.value); setKeyError(''); }}
                    placeholder={activeProvider.placeholder}
                    style={styles.input}
                    autoFocus
                  />
                  <p style={{ fontSize: '10px', color: 'var(--text-muted)', margin: 0 }}>
                    Your key is stored locally in your browser. Never sent to our servers.
                  </p>
                </div>
              )}

              {/* Model input */}
              {selectedProvider && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    Model <span style={{ color: 'var(--text-muted)', fontWeight: '400', textTransform: 'none' }}>(optional, uses default if empty)</span>
                  </label>
                  <input
                    type="text"
                    value={customModel}
                    onChange={(e) => setCustomModel(e.target.value)}
                    placeholder={PROVIDERS[selectedProvider]?.model || 'e.g. gpt-4o'}
                    style={styles.input}
                  />
                </div>
              )}

              {keyError && <p style={{ fontSize: '12px', color: 'var(--danger)', margin: '0 0 8px' }}>{keyError}</p>}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => setStep(2)} className="btn btn-secondary" style={{ flex: 1 }}>Back</button>
                <button onClick={handleAISubmit} className="btn btn-primary" style={{ flex: 1 }}>Continue</button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} style={styles.step}>
              <h1 style={styles.title}>Stay on track</h1>
              <p style={styles.subtitle}>Get reminders for streaks, reviews, and weekly tests. No spam.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button onClick={() => handleNotificationSetup(true)} className="btn btn-primary" style={{ width: '100%' }}>Enable reminders</button>
                <button onClick={() => handleNotificationSetup(false)} className="btn btn-ghost" style={{ width: '100%' }}>Maybe later</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
  },
  formWidth: {
    width: '100%',
    maxWidth: '380px',
  },
  progressRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '6px',
    marginBottom: '40px',
  },
  progressDot: {
    height: '4px',
    borderRadius: '2px',
    transition: 'all 0.3s ease',
  },
  step: {
    display: 'flex',
    flexDirection: 'column',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '32px',
  },
  brandName: {
    fontSize: '16px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    letterSpacing: '-0.01em',
  },
  title: {
    fontSize: '28px',
    fontWeight: '800',
    marginBottom: '4px',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    marginBottom: '28px',
    textAlign: 'center',
    lineHeight: '1.5',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-default)',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-sans)',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  providerCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '12px 8px',
    borderRadius: 'var(--radius-md)',
    border: '1.5px solid var(--border-default)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    gap: '2px',
  },
};
