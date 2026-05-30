import React, { useState, useMemo } from 'react';
import { storage } from '../utils/storage';

export default function Heatmap() {
  const [hoveredCell, setHoveredCell] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Get past 90 days of question activity
  const { cells, totalSolvedIn90 } = useMemo(() => {
    const sessions = storage.getSessions();
    
    // Map of date string YYYY-MM-DD -> total questions attempted
    const activityMap = {};
    sessions.forEach(session => {
      if (!session.date) return;
      const dateStr = new Date(session.date).toISOString().split('T')[0];
      const count = session.attempted || 0;
      activityMap[dateStr] = (activityMap[dateStr] || 0) + count;
    });

    const list = [];
    const now = new Date();
    let totalSolvedIn90 = 0;

    // Generate 90 days counting backwards, but we want to render it chronologically
    for (let i = 89; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split('T')[0];
      const count = activityMap[dateStr] || 0;
      totalSolvedIn90 += count;

      list.push({
        date: dateStr,
        dayOfWeek: d.getDay(),
        count
      });
    }

    return { cells: list, totalSolvedIn90 };
  }, []);

  const handleMouseEnter = (e, cell) => {
    const rect = e.target.getBoundingClientRect();
    setHoveredCell(cell);
    setTooltipPos({
      x: rect.left + window.scrollX + rect.width / 2,
      y: rect.top + window.scrollY - 36
    });
  };

  const handleMouseLeave = () => {
    setHoveredCell(null);
  };

  // Color mapper based on activity count
  const getCellColor = (count) => {
    if (count === 0) return '#161b22'; // empty cell
    if (count <= 2) return 'rgba(99, 102, 241, 0.2)';
    if (count <= 5) return 'rgba(99, 102, 241, 0.45)';
    if (count <= 9) return 'rgba(99, 102, 241, 0.75)';
    return 'var(--accent)'; // full intense indigo
  };

  // Build grid layout: 13 columns (weeks), each with 7 rows (days)
  const columns = [];
  let currentWeek = [];

  // Align cells into 7-day columns
  cells.forEach((cell, index) => {
    currentWeek.push(cell);
    if (currentWeek.length === 7 || index === cells.length - 1) {
      columns.push(currentWeek);
      currentWeek = [];
    }
  });

  return (
    <div style={styles.card} className="card">
      <div style={styles.header}>
        <div>
          <h4 style={styles.title}>Weekly Learning Consistency</h4>
          <p style={styles.subtitle}>{totalSolvedIn90} questions answered in the last 90 days</p>
        </div>
        <div style={styles.legend}>
          <span style={styles.legendText}>Less</span>
          <div style={{ ...styles.legendCell, backgroundColor: '#161b22' }} />
          <div style={{ ...styles.legendCell, backgroundColor: 'rgba(99, 102, 241, 0.2)' }} />
          <div style={{ ...styles.legendCell, backgroundColor: 'rgba(99, 102, 241, 0.45)' }} />
          <div style={{ ...styles.legendCell, backgroundColor: 'rgba(99, 102, 241, 0.75)' }} />
          <div style={{ ...styles.legendCell, backgroundColor: 'var(--accent)' }} />
          <span style={styles.legendText}>More</span>
        </div>
      </div>

      <div style={styles.heatmapWrapper}>
        <svg width="100%" height="96" viewBox="0 0 200 96" preserveAspectRatio="xMinYMin meet">
          <g>
            {columns.map((week, colIdx) => (
              <g key={colIdx} transform={`translate(${colIdx * 14}, 0)`}>
                {week.map((cell, rowIdx) => (
                  <rect
                    key={rowIdx}
                    x="0"
                    y={rowIdx * 13}
                    width="10"
                    height="10"
                    rx="2"
                    fill={getCellColor(cell.count)}
                    onMouseEnter={(e) => handleMouseEnter(e, cell)}
                    onMouseLeave={handleMouseLeave}
                    style={{ cursor: 'pointer', transition: 'fill 0.15s' }}
                  />
                ))}
              </g>
            ))}
          </g>
        </svg>
      </div>

      {/* Absolute Tooltip */}
      {hoveredCell && (
        <div 
          style={{
            ...styles.tooltip,
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`
          }}
        >
          <div style={styles.tooltipText}>
            <strong>{hoveredCell.count} questions</strong> on {new Date(hoveredCell.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
          <div style={styles.tooltipArrow} />
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    padding: '20px !important',
    backgroundColor: 'var(--bg-card)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    position: 'relative'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px'
  },
  title: {
    fontSize: '15px',
    fontWeight: '700',
    color: 'var(--text-primary)'
  },
  subtitle: {
    fontSize: '12px',
    color: 'var(--text-secondary)'
  },
  legend: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  legendText: {
    fontSize: '10px',
    color: 'var(--text-muted)'
  },
  legendCell: {
    width: '10px',
    height: '10px',
    borderRadius: '2px'
  },
  heatmapWrapper: {
    overflowX: 'auto',
    width: '100%',
    display: 'flex'
  },
  tooltip: {
    position: 'absolute',
    transform: 'translateX(-50%)',
    backgroundColor: 'var(--bg-elevated)',
    border: '1px solid var(--border-default)',
    padding: '6px 10px',
    borderRadius: '8px',
    zIndex: 1000,
    pointerEvents: 'none',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  tooltipText: {
    fontFamily: 'var(--font-sans)',
    fontSize: '11px',
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap'
  },
  tooltipArrow: {
    width: '0',
    height: '0',
    borderLeft: '5px solid transparent',
    borderRight: '5px solid transparent',
    borderTop: '5px solid var(--bg-elevated)',
    marginTop: '5px',
    position: 'absolute',
    bottom: '-5px',
    left: '50%',
    transform: 'translateX(-50%)'
  }
};
