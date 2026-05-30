import React from 'react';

// Common SVG Wrapper
const IconWrapper = ({ size = 20, color = 'currentColor', children, style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    className={className}
  >
    {children}
  </svg>
);

export const HomeIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </IconWrapper>
);

export const StatsIcon = (props) => (
  <IconWrapper {...props}>
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </IconWrapper>
);

export const SettingsIcon = (props) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </IconWrapper>
);

export const StreakIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </IconWrapper>
);

export const NoteIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </IconWrapper>
);

export const KeyboardIcon = (props) => (
  <IconWrapper {...props}>
    <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
    <line x1="6" y1="8" x2="6" y2="8" />
    <line x1="10" y1="8" x2="10" y2="8" />
    <line x1="14" y1="8" x2="14" y2="8" />
    <line x1="18" y1="8" x2="18" y2="8" />
    <line x1="6" y1="12" x2="6" y2="12" />
    <line x1="10" y1="12" x2="10" y2="12" />
    <line x1="14" y1="12" x2="14" y2="12" />
    <line x1="18" y1="12" x2="18" y2="12" />
    <line x1="7" y1="16" x2="17" y2="16" />
  </IconWrapper>
);

export const HintIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M9 21h6" />
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17h8v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z" />
  </IconWrapper>
);

export const StuckIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="15" />
  </IconWrapper>
);

export const WarningIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </IconWrapper>
);

export const InfoIcon = (props) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </IconWrapper>
);

export const CheckIcon = ({ size = 20, color = 'var(--success)' }) => (
  <IconWrapper size={size} color={color}>
    <polyline points="20 6 9 17 4 12" />
  </IconWrapper>
);

export const CrossIcon = ({ size = 20, color = 'var(--danger)' }) => (
  <IconWrapper size={size} color={color}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </IconWrapper>
);

export const LockIcon = (props) => (
  <IconWrapper {...props}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </IconWrapper>
);

export const TrashIcon = (props) => (
  <IconWrapper {...props}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </IconWrapper>
);

export const TrophyIcon = ({ size = 20, color = 'var(--warning)' }) => (
  <IconWrapper size={size} color={color}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
    <path d="M12 2a6 6 0 0 1 6 6v5a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8a6 6 0 0 1 6-6z" />
  </IconWrapper>
);

export const StarIcon = ({ size = 20, color = 'var(--warning)', fill = 'none' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export const ChevronDownIcon = (props) => (
  <IconWrapper {...props}>
    <polyline points="6 9 12 15 18 9" />
  </IconWrapper>
);

export const ChevronRightIcon = (props) => (
  <IconWrapper {...props}>
    <polyline points="9 18 15 12 9 6" />
  </IconWrapper>
);

export const RefreshIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
  </IconWrapper>
);

export const BookIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5v-15z" />
  </IconWrapper>
);

export const GridIcon = (props) => (
  <IconWrapper {...props}>
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </IconWrapper>
);

export const BookOpenIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </IconWrapper>
);

// dynamic badge icons mapping
export const BadgeIcon = ({ id, size = 32 }) => {
  const color = 'var(--accent)';
  
  switch (id) {
    case 'streak_7':
      return (
        <IconWrapper size={size} color="var(--warning)">
          <path d="M12 2c-2.33 3.67-4 6.33-4 8.5a4 4 0 0 0 8 0c0-2.17-1.67-4.83-4-8.5z" />
          <path d="M12 22a8 8 0 0 0 8-8c0-3.33-3-6-8-12-5 6-8 8.67-8 12a8 8 0 0 0 8 8z" />
        </IconWrapper>
      );
    case 'streak_30':
      return (
        <IconWrapper size={size} color="var(--warning)">
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
          <path d="M12 6v6l4 2" />
        </IconWrapper>
      );
    case 'speed_solver':
      return (
        <IconWrapper size={size} color="#f59e0b">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </IconWrapper>
      );
    case 'ladder_climber':
      return (
        <IconWrapper size={size} color="#818cf8">
          <path d="M6 20h12M6 16h12M6 12h12M6 8h12M6 4h12" strokeWidth="3" />
          <line x1="6" y1="2" x2="6" y2="22" strokeWidth="3" />
          <line x1="18" y1="2" x2="18" y2="22" strokeWidth="3" />
        </IconWrapper>
      );
    case 'chapter_master':
      return (
        <IconWrapper size={size} color="var(--success)">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5v-15z" />
        </IconWrapper>
      );
    case 'perfect_week':
    case 'test_champion':
      return (
        <IconWrapper size={size} color="#f59e0b">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </IconWrapper>
      );
    case 'night_owl':
      return (
        <IconWrapper size={size} color="#a855f7">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </IconWrapper>
      );
    case 'early_bird':
      return (
        <IconWrapper size={size} color="#f59e0b">
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          <circle cx="12" cy="12" r="4" />
        </IconWrapper>
      );
    case 'century':
      return (
        <IconWrapper size={size} color="var(--accent-hover)">
          <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5" />
          <text x="50%" y="62%" textAnchor="middle" stroke="none" fill="currentColor" fontSize="8" fontWeight="bold" fontFamily="var(--font-mono)">100</text>
        </IconWrapper>
      );
    case 'chemist':
      return (
        <IconWrapper size={size} color="var(--success)">
          <path d="M10 2h4M12 2v10M6 22h12L12 12 6 22z" />
          <line x1="8.5" y1="18" x2="15.5" y2="18" />
        </IconWrapper>
      );
    case 'integrator':
      return (
        <IconWrapper size={size} color="var(--warning)">
          <path d="M16 4c-2 0-3 2-3 4v8c0 2-1 4-3 4M8 20c2 0 3-2 3-4V8c0-2 1-4 3-4" strokeWidth="2.5" />
        </IconWrapper>
      );
    case 'physicist':
      return (
        <IconWrapper size={size} color="var(--accent)">
          <ellipse cx="12" cy="12" rx="3" ry="9" transform="rotate(30 12 12)" />
          <ellipse cx="12" cy="12" rx="3" ry="9" transform="rotate(90 12 12)" />
          <ellipse cx="12" cy="12" rx="3" ry="9" transform="rotate(150 12 12)" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        </IconWrapper>
      );
    case 'independent':
      return (
        <IconWrapper size={size} color="var(--accent-hover)">
          <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .3 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
          <path d="M9 18h6M10 21h4" />
        </IconWrapper>
      );
    case 'bookworm':
      return (
        <IconWrapper size={size} color="#818cf8">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5a2.5 2.5 0 0 1-2.5-2.5" />
          <path d="M6 6h10M6 10h10" />
        </IconWrapper>
      );
    default:
      return <TrophyIcon size={size} color={color} />;
  }
};

export const TargetIcon = (props) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
  </IconWrapper>
);

export const CoffeeIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 2v2M10 2v2M14 2v2" />
  </IconWrapper>
);

export const HeartbeatIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </IconWrapper>
);

export const ClockIcon = (props) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </IconWrapper>
);

export const ThunderIcon = (props) => (
  <IconWrapper {...props}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </IconWrapper>
);

export const TestIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
    <rect x="9" y="3" width="6" height="4" rx="1" />
    <path d="M9 14l2 2 4-4" />
  </IconWrapper>
);

export const MenuIcon = (props) => (
  <IconWrapper {...props}>
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </IconWrapper>
);

export const ChevronLeftIcon = (props) => (
  <IconWrapper {...props}>
    <polyline points="15 18 9 12 15 6" />
  </IconWrapper>
);

export const ArrowLeftIcon = (props) => (
  <IconWrapper {...props}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </IconWrapper>
);

export const ArrowRightIcon = (props) => (
  <IconWrapper {...props}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </IconWrapper>
);

export const FlameIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M12 2c0 4-4 6-4 10a4 4 0 1 0 8 0c0-4-4-6-4-10z" />
  </IconWrapper>
);

export const LightningIcon = (props) => (
  <IconWrapper {...props}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </IconWrapper>
);

export const LadderIcon = (props) => (
  <IconWrapper {...props}>
    <line x1="8" y1="4" x2="8" y2="20" />
    <line x1="16" y1="4" x2="16" y2="20" />
    <line x1="8" y1="8" x2="16" y2="8" />
    <line x1="8" y1="12" x2="16" y2="12" />
    <line x1="8" y1="16" x2="16" y2="16" />
  </IconWrapper>
);

export const MoonIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </IconWrapper>
);

export const SunIcon = (props) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </IconWrapper>
);

export const CenturyIcon = (props) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M8 12h8" />
    <path d="M12 8v8" />
  </IconWrapper>
);

export const FlaskIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M9 3h6" />
    <path d="M10 3v7.4a2 2 0 0 1-.5 1.3L4 17a2 2 0 0 0-.5 1.5V20a1 1 0 0 0 1 1h15a1 1 0 0 0 1-1v-1.5a2 2 0 0 0-.5-1.5l-5.5-5.3a2 2 0 0 1-.5-1.3V3" />
  </IconWrapper>
);

export const MathIcon = (props) => (
  <IconWrapper {...props}>
    <text x="4" y="18" fontSize="16" fontFamily="serif" fontStyle="italic">∫</text>
  </IconWrapper>
);

export const MicroscopeIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M6 18h8" />
    <path d="M3 22h18" />
    <path d="M14 22a7 7 0 1 0 0-14h-1" />
    <path d="M9 14h2" />
    <path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z" />
    <path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3" />
  </IconWrapper>
);

export const LightbulbIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" />
  </IconWrapper>
);
