import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FORMULAS } from '../data/formulas';
import { CHAPTERS } from '../data/chapters';
import katex from 'katex';
import { parseLaTeX } from './DailyChallenge';
import { findAnimation } from '../data/animations';
import AnimationPlayer from './AnimationPlayer';




// Direct KaTeX rendering for formula sheet
function SafeMath({ latex }) {
  if (!latex) return null;
  let html = '';
  let hasError = false;
  try {
    let fixed = latex;
    fixed = fixed.replace(/\\text([a-zA-Z]+)/g, '\\text{$1}');
    fixed = fixed.replace(/\\vec([a-zA-Z]+)/g, '\\vec{$1}');
    html = katex.renderToString(fixed, {
      displayMode: false,
      throwOnError: false,
      strict: false
    });
  } catch {
    hasError = true;
  }

  if (hasError) {
    return <span style={{ color: 'var(--danger)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{latex}</span>;
  }
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function FormulaSheet() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [activeAnim, setActiveAnim] = useState(null);

  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const result = [];

    const subjects = ['physics', 'chemistry', 'math'];
    subjects.forEach(sub => {
      if (selectedSubject !== 'all' && selectedSubject !== sub) return;

      const chaptersList = CHAPTERS[sub] || [];
      chaptersList.forEach(chapter => {
        const chapterFormulas = FORMULAS[chapter.id] || [];

        const matchedFormulas = chapterFormulas.filter(f =>
          f.name.toLowerCase().includes(query) ||
          f.desc.toLowerCase().includes(query) ||
          chapter.name.toLowerCase().includes(query)
        );

        if (matchedFormulas.length > 0) {
          result.push({
            subject: sub,
            chapterName: chapter.name,
            formulas: matchedFormulas
          });
        }
      });
    });

    return result;
  }, [searchQuery, selectedSubject]);


  return (
    <>
      {/* Floating Button */}
      <button 
        style={styles.floatingBtn} 
        onClick={() => setIsOpen(true)}
        title="Formula Quick-Reference"
      >
        <span style={styles.btnIcon}>π</span>
      </button>

      {/* Slide-up Bottom Sheet */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={styles.backdrop}
              onClick={() => setIsOpen(false)}
            />

            {/* Bottom Sheet */}
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              style={styles.sheet}
              className="glass"
            >
              {/* Header */}
              <div style={styles.header}>
                <div style={styles.headerTitleRow}>
                  <h3 style={styles.title}>Formula Quick-Reference</h3>
                  <button style={styles.closeBtn} onClick={() => setIsOpen(false)}>✕</button>
                </div>
                
                {/* Search Bar */}
                <input 
                  type="text" 
                  placeholder="Search formulas or chapters..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={styles.searchInput}
                />

                {/* Tabs */}
                <div style={styles.tabs}>
                  {['all', 'physics', 'chemistry', 'math'].map((sub) => (
                    <button
                      key={sub}
                      style={{
                        ...styles.tab,
                        ...(selectedSubject === sub ? styles.activeTab : {})
                      }}
                      onClick={() => setSelectedSubject(sub)}
                    >
                      {sub.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Formula List Scroll Area */}
              <div style={styles.scrollArea}>
                {filteredData.length === 0 ? (
                  <div style={styles.noResults}>
                    <p style={{ color: 'var(--text-secondary)' }}>No formulas found matching "{searchQuery}"</p>
                  </div>
                ) : (
                  filteredData.map((group, index) => (
                    <div key={index} style={styles.chapterGroup}>
                      <div style={styles.chapterHeader}>
                        <span style={{
                          ...styles.subjectTag,
                          backgroundColor: getSubjectColor(group.subject)
                        }} />
                        <h4 style={styles.chapterTitle}>{group.chapterName}</h4>
                      </div>
                      
                      <div style={styles.formulasGrid}>
                        {group.formulas.map((f, fIdx) => {
                            const anim = findAnimation(f.name);
                            return (
                            <div key={fIdx} style={styles.formulaCard} className="card">
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                                <div style={styles.formulaName}>{f.name}</div>
                              </div>
                              <div style={styles.mathBlock}>
                                <SafeMath latex={f.latex} />
                              </div>
                              <div style={styles.formulaDesc}>{parseLaTeX(f.desc)}</div>
                              {anim && (
                                <button
                                  style={styles.visBtn}
                                  onClick={() => setActiveAnim(anim)}
                                >
                                   Show Visualization
                                </button>
                              )}
                            </div>
                            );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Animation Player Overlay */}
      {activeAnim && (
        <div style={styles.playerOverlay} onClick={() => setActiveAnim(null)}>
          <div style={styles.playerModal} onClick={(e) => e.stopPropagation()}>
            <AnimationPlayer
              path={activeAnim.file}
              title={activeAnim.title}
              onClose={() => setActiveAnim(null)}
            />
          </div>
        </div>
      )}
    </>
  );
}

function getSubjectColor(subject) {
  if (subject === 'physics') return 'var(--accent)';
  if (subject === 'chemistry') return 'var(--success)';
  return 'var(--warning)';
}

const styles = {
  floatingBtn: {
    position: 'fixed',
    bottom: '80px',
    right: '24px',
    width: '56px',
    height: '56px',
    borderRadius: '28px',
    backgroundColor: 'var(--accent)',
    border: 'none',
    boxShadow: '0 4px 20px var(--accent-glow)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    color: '#ffffff',
    transition: 'transform 0.15s ease, background-color 0.15s ease',
    outline: 'none'
  },
  btnIcon: {
    fontSize: '24px',
    fontWeight: 'bold',
    fontFamily: 'var(--font-mono)'
  },
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 1000,
    backdropFilter: 'blur(4px)'
  },
  sheet: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: '80vh',
    zIndex: 1001,
    borderTopLeftRadius: '24px',
    borderTopRightRadius: '24px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 -10px 25px rgba(0, 0, 0, 0.5)',
    maxWidth: '800px',
    margin: '0 auto'
  },
  header: {
    padding: '24px 24px 12px 24px',
    borderBottom: '1px solid var(--border-subtle)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  headerTitleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    fontSize: '18px',
    fontWeight: '700'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '4px'
  },
  searchInput: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-default)',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-sans)',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    ':focus': {
      borderColor: 'var(--accent)'
    }
  },
  tabs: {
    display: 'flex',
    gap: '8px'
  },
  tab: {
    padding: '6px 12px',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-elevated)',
    color: 'var(--text-secondary)',
    border: 'none',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s'
  },
  activeTab: {
    backgroundColor: 'var(--accent)',
    color: '#ffffff',
    boxShadow: '0 0 8px var(--accent-glow)'
  },
  scrollArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px'
  },
  noResults: {
    textAlign: 'center',
    padding: '48px 0'
  },
  chapterGroup: {
    marginBottom: '32px'
  },
  chapterHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px'
  },
  subjectTag: {
    width: '4px',
    height: '16px',
    borderRadius: '2px'
  },
  chapterTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: 'var(--text-primary)'
  },
  formulasGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px'
  },
  formulaCard: {
    padding: '16px !important',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    minHeight: '120px'
  },
  formulaName: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-secondary)'
  },
  mathBlock: {
    padding: '8px 0',
    fontSize: '15px',
    overflowX: 'auto',
    overflowY: 'hidden',
    color: 'var(--text-primary)',
    display: 'flex',
    justifyContent: 'center'
  },
  formulaDesc: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    lineHeight: '1.4'
  },
  visBtn: {
    marginTop: '8px',
    padding: '6px 12px',
    borderRadius: '8px',
    border: '1px solid var(--accent)',
    backgroundColor: 'transparent',
    color: 'var(--accent)',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s',
    width: '100%',
    textAlign: 'center'
  },
  playerOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(8, 11, 20, 0.85)',
    zIndex: 10000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(8px)'
  },
  playerModal: {
    width: '90%',
    maxWidth: '800px',
    maxHeight: '80vh'
  }
};
