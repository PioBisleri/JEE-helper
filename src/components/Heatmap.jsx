import { useState, useMemo } from 'react';
import { storage } from '../utils/storage';

export default function Heatmap() {
  const [hoveredCell, setHoveredCell] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const { cells, totalSolvedIn90 } = useMemo(() => {
    const sessions = storage.getSessions();
    const activityMap = {};
    sessions.forEach(session => {
      if (!session.date) return;
      const dateStr = new Date(session.date).toISOString().split('T')[0];
      activityMap[dateStr] = (activityMap[dateStr] || 0) + (session.attempted || 0);
    });

    const list = [];
    const now = new Date();
    let totalSolvedIn90 = 0;

    for (let i = 89; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split('T')[0];
      const count = activityMap[dateStr] || 0;
      totalSolvedIn90 += count;
      list.push({ date: dateStr, dayOfWeek: d.getDay(), count });
    }

    return { cells: list, totalSolvedIn90 };
  }, []);

  const handleMouseEnter = (e, cell) => {
    const rect = e.target.getBoundingClientRect();
    setHoveredCell(cell);
    setTooltipPos({
      x: rect.left + window.scrollX + rect.width / 2,
      y: rect.top + window.scrollY - 32
    });
  };

  const getCellColor = (count) => {
    if (count === 0) return '#161b22';
    if (count <= 2) return 'rgba(99, 102, 241, 0.15)';
    if (count <= 5) return 'rgba(99, 102, 241, 0.35)';
    if (count <= 9) return 'rgba(99, 102, 241, 0.6)';
    return 'var(--accent)';
  };

  const columns = [];
  let currentWeek = [];
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
          <h4 style={{ fontSize: '14px', fontWeight: '700', margin: 0 }}>Activity</h4>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0' }}>{totalSolvedIn90} questions in 90 days</p>
        </div>
        <div style={styles.legend}>
          <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Less</span>
          {['#161b22', 'rgba(99, 102, 241, 0.15)', 'rgba(99, 102, 241, 0.35)', 'rgba(99, 102, 241, 0.6)', 'var(--accent)'].map((c, i) => (
            <div key={i} style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: c }} />
          ))}
          <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>More</span>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <svg width="100%" height="104" viewBox="0 0 210 104" preserveAspectRatio="xMinYMin meet">
          <g>
            {columns.map((week, colIdx) => (
              <g key={colIdx} transform={`translate(${colIdx * 15}, 0)`}>
                {week.map((cell, rowIdx) => (
                  <rect
                    key={rowIdx}
                    x="0"
                    y={rowIdx * 14}
                    width="11"
                    height="11"
                    rx="2"
                    fill={getCellColor(cell.count)}
                    onMouseEnter={(e) => handleMouseEnter(e, cell)}
                    onMouseLeave={() => setHoveredCell(null)}
                    style={{ cursor: 'pointer', transition: 'fill 0.15s' }}
                  />
                ))}
              </g>
            ))}
          </g>
        </svg>
      </div>

      {hoveredCell && (
        <div style={{
          position: 'absolute',
          left: `${tooltipPos.x}px`,
          top: `${tooltipPos.y}px`,
          transform: 'translateX(-50%)',
          backgroundColor: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
          padding: '4px 8px',
          borderRadius: 'var(--radius-sm)',
          zIndex: 1000,
          pointerEvents: 'none',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
          fontSize: '10px',
          color: 'var(--text-primary)',
          whiteSpace: 'nowrap',
        }}>
          <strong>{hoveredCell.count}</strong> on {new Date(hoveredCell.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    padding: '16px !important',
    backgroundColor: 'var(--bg-card)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    position: 'relative',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '8px',
  },
  legend: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
  },
};
