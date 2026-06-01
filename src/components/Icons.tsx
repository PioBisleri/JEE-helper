import React from 'react';

interface IconWrapperProps {
  size?: number;
  color?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

const IconWrapper = ({ size = 20, color = 'currentColor', children, style, className }: IconWrapperProps) => (
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

export const HomeIcon = (props: Partial<IconWrapperProps>) => (
  <IconWrapper {...props}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </IconWrapper>
);

export const StatsIcon = (props: Partial<IconWrapperProps>) => (
  <IconWrapper {...props}>
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </IconWrapper>
);

export const SettingsIcon = (props: Partial<IconWrapperProps>) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </IconWrapper>
);

export const StreakIcon = (props: Partial<IconWrapperProps>) => (
  <IconWrapper {...props}>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </IconWrapper>
);

export const NoteIcon = (props: Partial<IconWrapperProps>) => (
  <IconWrapper {...props}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </IconWrapper>
);

export const KeyboardIcon = (props: Partial<IconWrapperProps>) => (
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

export const HintIcon = (props: Partial<IconWrapperProps>) => (
  <IconWrapper {...props}>
    <path d="M9 21h6" />
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17h8v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z" />
  </IconWrapper>
);

export const StuckIcon = (props: Partial<IconWrapperProps>) => (
  <IconWrapper {...props}>
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="15" />
  </IconWrapper>
);

export const WarningIcon = (props: Partial<IconWrapperProps>) => (
  <IconWrapper {...props}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </IconWrapper>
);

export const InfoIcon = (props: Partial<IconWrapperProps>) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </IconWrapper>
);

export const CheckIcon = ({ size = 20, color = 'var(--success)', ...rest }: Partial<IconWrapperProps> = {}) => (
  <IconWrapper size={size} color={color} {...rest}>
    <polyline points="20 6 9 17 4 12" />
  </IconWrapper>
);

export const CrossIcon = ({ size = 20, color = 'var(--danger)', ...rest }: Partial<IconWrapperProps> = {}) => (
  <IconWrapper size={size} color={color} {...rest}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </IconWrapper>
);

export const LockIcon = (props: Partial<IconWrapperProps>) => (
  <IconWrapper {...props}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </IconWrapper>
);

export const TrashIcon = (props: Partial<IconWrapperProps>) => (
  <IconWrapper {...props}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </IconWrapper>
);

export const TrophyIcon = ({ size = 20, color = 'var(--warning)', ...rest }: Partial<IconWrapperProps> = {}) => (
  <IconWrapper size={size} color={color} {...rest}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
    <path d="M12 2a6 6 0 0 1 6 6v5a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8a6 6 0 0 1 6-6z" />
  </IconWrapper>
);

export const StarIcon = ({ size = 20, color = 'var(--warning)', fill = 'none', ...rest }: Partial<IconWrapperProps> & { fill?: string } = {}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...rest.style }}
    className={rest.className}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export const ChevronDownIcon = (props: Partial<IconWrapperProps>) => (
  <IconWrapper {...props}>
    <polyline points="6 9 12 15 18 9" />
  </IconWrapper>
);

export const ChevronRightIcon = (props: Partial<IconWrapperProps>) => (
  <IconWrapper {...props}>
    <polyline points="9 18 15 12 9 6" />
  </IconWrapper>
);

export const RefreshIcon = (props: Partial<IconWrapperProps>) => (
  <IconWrapper {...props}>
    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
  </IconWrapper>
);

export const BookIcon = (props: Partial<IconWrapperProps>) => (
  <IconWrapper {...props}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5v-15z" />
  </IconWrapper>
);

export const GridIcon = (props: Partial<IconWrapperProps>) => (
  <IconWrapper {...props}>
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </IconWrapper>
);

export const BookOpenIcon = (props: Partial<IconWrapperProps>) => (
  <IconWrapper {...props}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </IconWrapper>
);

export const TargetIcon = (props: Partial<IconWrapperProps>) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
  </IconWrapper>
);

export const CoffeeIcon = (props: Partial<IconWrapperProps>) => (
  <IconWrapper {...props}>
    <path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 2v2M10 2v2M14 2v2" />
  </IconWrapper>
);

export const HeartbeatIcon = (props: Partial<IconWrapperProps>) => (
  <IconWrapper {...props}>
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </IconWrapper>
);

export const ClockIcon = (props: Partial<IconWrapperProps>) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </IconWrapper>
);

export const ThunderIcon = (props: Partial<IconWrapperProps>) => (
  <IconWrapper {...props}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </IconWrapper>
);

export const TestIcon = (props: Partial<IconWrapperProps>) => (
  <IconWrapper {...props}>
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
    <rect x="9" y="3" width="6" height="4" rx="1" />
    <path d="M9 14l2 2 4-4" />
  </IconWrapper>
);

export const MenuIcon = (props: Partial<IconWrapperProps>) => (
  <IconWrapper {...props}>
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </IconWrapper>
);

export const ChevronLeftIcon = (props: Partial<IconWrapperProps>) => (
  <IconWrapper {...props}>
    <polyline points="15 18 9 12 15 6" />
  </IconWrapper>
);

export const ArrowLeftIcon = (props: Partial<IconWrapperProps>) => (
  <IconWrapper {...props}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </IconWrapper>
);

export const ArrowRightIcon = (props: Partial<IconWrapperProps>) => (
  <IconWrapper {...props}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </IconWrapper>
);

export const FlameIcon = (props: Partial<IconWrapperProps>) => (
  <IconWrapper {...props}>
    <path d="M12 2c0 4-4 6-4 10a4 4 0 1 0 8 0c0-4-4-6-4-10z" />
  </IconWrapper>
);

export const LightningIcon = (props: Partial<IconWrapperProps>) => (
  <IconWrapper {...props}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </IconWrapper>
);

export const ZapIcon = (props: Partial<IconWrapperProps>) => (
  <IconWrapper {...props}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    <line x1="12" y1="2" x2="12" y2="6" />
  </IconWrapper>
);

export const LadderIcon = (props: Partial<IconWrapperProps>) => (
  <IconWrapper {...props}>
    <line x1="8" y1="4" x2="8" y2="20" />
    <line x1="16" y1="4" x2="16" y2="20" />
    <line x1="8" y1="8" x2="16" y2="8" />
    <line x1="8" y1="12" x2="16" y2="12" />
    <line x1="8" y1="16" x2="16" y2="16" />
  </IconWrapper>
);

export const MoonIcon = (props: Partial<IconWrapperProps>) => (
  <IconWrapper {...props}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </IconWrapper>
);

export const SunIcon = (props: Partial<IconWrapperProps>) => (
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

export const CenturyIcon = (props: Partial<IconWrapperProps>) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M8 12h8" />
    <path d="M12 8v8" />
  </IconWrapper>
);

export const FlaskIcon = (props: Partial<IconWrapperProps>) => (
  <IconWrapper {...props}>
    <path d="M9 3h6" />
    <path d="M10 3v7.4a2 2 0 0 1-.5 1.3L4 17a2 2 0 0 0-.5 1.5V20a1 1 0 0 0 1 1h15a1 1 0 0 0 1-1v-1.5a2 2 0 0 0-.5-1.5l-5.5-5.3a2 2 0 0 1-.5-1.3V3" />
  </IconWrapper>
);

export const MathIcon = (props: Partial<IconWrapperProps>) => (
  <IconWrapper {...props}>
    <text x="4" y="18" fontSize="16" fontFamily="serif" fontStyle="italic">∫</text>
  </IconWrapper>
);

export const MicroscopeIcon = (props: Partial<IconWrapperProps>) => (
  <IconWrapper {...props}>
    <path d="M6 18h8" />
    <path d="M3 22h18" />
    <path d="M14 22a7 7 0 1 0 0-14h-1" />
    <path d="M9 14h2" />
    <path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z" />
    <path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3" />
  </IconWrapper>
);

export const BrainIcon = (props: Partial<IconWrapperProps>) => (
  <IconWrapper {...props}>
    <path d="M9.5 2A5.5 5.5 0 0 0 4 7.5c0 1.58.67 3 1.74 4.01L12 16l6.26-4.49A5.49 5.49 0 0 0 20 7.5 5.5 5.5 0 0 0 14.5 2c-1.56 0-2.96.72-3.88 1.85A5.49 5.49 0 0 0 9.5 2z" />
    <path d="M12 16v4" />
    <path d="M8 20h8" />
  </IconWrapper>
);

export const LightbulbIcon = (props: Partial<IconWrapperProps>) => (
  <IconWrapper {...props}>
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" />
  </IconWrapper>
);

export const MedalIcon = (props: Partial<IconWrapperProps>) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="8" r="6" />
    <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" />
  </IconWrapper>
);

export const CrownIcon = (props: Partial<IconWrapperProps>) => (
  <IconWrapper {...props}>
    <path d="M2 4l3 12h14l3-12-5 4-5-4-5 4z" />
    <line x1="5" y1="20" x2="19" y2="20" />
  </IconWrapper>
);

export const ShieldIcon = (props: Partial<IconWrapperProps>) => (
  <IconWrapper {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </IconWrapper>
);

export const RocketIcon = (props: Partial<IconWrapperProps>) => (
  <IconWrapper {...props}>
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </IconWrapper>
);

export const DiamondIcon = (props: Partial<IconWrapperProps>) => (
  <IconWrapper {...props}>
    <path d="M6 3h12l4 6-10 13L2 9z" />
    <path d="M2 9h20" />
    <path d="M12 22L6 9l6-6 6 6z" />
  </IconWrapper>
);

export const GemIcon = (props: Partial<IconWrapperProps>) => (
  <IconWrapper {...props}>
    <path d="M6 3h12l4 6-10 13L2 9z" />
    <path d="M11 3l-1.5 6L12 22" />
    <path d="M13 3l1.5 6L12 22" />
  </IconWrapper>
);

export const AwardIcon = (props: Partial<IconWrapperProps>) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
  </IconWrapper>
);

export const CompassIcon = (props: Partial<IconWrapperProps>) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </IconWrapper>
);

export const MountainIcon = (props: Partial<IconWrapperProps>) => (
  <IconWrapper {...props}>
    <path d="M8 3l4 8 5-5 5 15H2z" />
  </IconWrapper>
);

export const CrosshairIcon = (props: Partial<IconWrapperProps>) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="22" y1="12" x2="18" y2="12" />
    <line x1="6" y1="12" x2="2" y2="12" />
    <line x1="12" y1="6" x2="12" y2="2" />
    <line x1="12" y1="22" x2="12" y2="18" />
  </IconWrapper>
);

export const InfinityIcon = (props: Partial<IconWrapperProps>) => (
  <IconWrapper {...props}>
    <path d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.133-8-12.739-8-4.585 0-4.585 8 0 8 5.606 0 7.644-8 12.74-8z" />
  </IconWrapper>
);

export const HeartIcon = (props: Partial<IconWrapperProps>) => (
  <IconWrapper {...props}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </IconWrapper>
);

export const CalendarIcon = (props: Partial<IconWrapperProps>) => (
  <IconWrapper {...props}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </IconWrapper>
);

export const AtomIcon = (props: Partial<IconWrapperProps>) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="12" r="1" />
    <path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5z" />
    <path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5z" />
  </IconWrapper>
);

export const SigmaIcon = (props: Partial<IconWrapperProps>) => (
  <IconWrapper {...props}>
    <path d="M18 4H6l6 8-6 8h12" />
  </IconWrapper>
);

export const PuzzleIcon = (props: Partial<IconWrapperProps>) => (
  <IconWrapper {...props}>
    <path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.61a2.404 2.404 0 0 1-1.705.707 2.402 2.402 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.402 2.402 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.23 8.77c.24-.24.581-.353.917-.303.515.077.877.528 1.073 1.01a2.5 2.5 0 1 0 3.259-3.259c-.482-.196-.933-.558-1.01-1.073-.05-.336.062-.676.303-.917l1.525-1.525A2.402 2.402 0 0 1 12 1.998c.617 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.877.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 1 1 3.237 3.237c-.464.18-.894.527-.967 1.02z" />
  </IconWrapper>
);

export const KeyIcon = (props: Partial<IconWrapperProps>) => (
  <IconWrapper {...props}>
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </IconWrapper>
);

export const FireIcon = (props: Partial<IconWrapperProps>) => (
  <IconWrapper {...props}>
    <path d="M12 2c.5 2.5 2 4.5 2 7a4 4 0 1 1-8 0c0-2.5 1.5-4.5 2-7 1 2 3 3 4 0z" />
    <path d="M12 22c3 0 6-2.5 6-6 0-3-2-5-4-7-1 2-2 4-2 6a2 2 0 1 1-4 0c0-2-1-4-2-6-2 2-4 4-4 7 0 3.5 3 6 6 6z" />
  </IconWrapper>
);

export const WaveIcon = (props: Partial<IconWrapperProps>) => (
  <IconWrapper {...props}>
    <path d="M2 12c1.5-3 3-4.5 4.5-4.5S9 9 10.5 12 13 16.5 14.5 16.5 18 15 19.5 12 22 7.5 22 12" />
  </IconWrapper>
);

interface BadgeMapEntry {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  color: string;
}

const badgeMap: Record<string, BadgeMapEntry> = {
  streak_3: { icon: FlameIcon, color: '#f97316' },
  streak_7: { icon: FlameIcon, color: '#ef4444' },
  streak_14: { icon: FireIcon, color: '#ef4444' },
  streak_30: { icon: FireIcon, color: '#dc2626' },
  streak_60: { icon: FireIcon, color: '#b91c1c' },
  streak_90: { icon: CrownIcon, color: '#f59e0b' },
  streak_180: { icon: CrownIcon, color: '#d97706' },
  streak_365: { icon: DiamondIcon, color: '#8b5cf6' },
  q_10: { icon: LightningIcon, color: '#f59e0b' },
  q_50: { icon: LightningIcon, color: '#f97316' },
  century: { icon: CenturyIcon, color: '#6366f1' },
  q_250: { icon: ZapIcon, color: '#f59e0b' },
  q_500: { icon: ZapIcon, color: '#f97316' },
  q_1000: { icon: RocketIcon, color: '#8b5cf6' },
  q_2500: { icon: RocketIcon, color: '#6366f1' },
  q_5000: { icon: InfinityIcon, color: '#ec4899' },
  xp_100: { icon: StarIcon, color: '#f59e0b' },
  xp_500: { icon: StarIcon, color: '#f97316' },
  xp_1000: { icon: MedalIcon, color: '#f59e0b' },
  xp_2500: { icon: MedalIcon, color: '#d97706' },
  xp_5000: { icon: GemIcon, color: '#8b5cf6' },
  xp_10000: { icon: DiamondIcon, color: '#ec4899' },
  level_2: { icon: ThunderIcon, color: '#22c55e' },
  level_3: { icon: ThunderIcon, color: '#3b82f6' },
  level_4: { icon: AwardIcon, color: '#f59e0b' },
  level_5: { icon: ShieldIcon, color: '#ef4444' },
  level_6: { icon: CrownIcon, color: '#f59e0b' },
  test_first: { icon: TestIcon, color: '#3b82f6' },
  test_5: { icon: TestIcon, color: '#6366f1' },
  test_10: { icon: AwardIcon, color: '#8b5cf6' },
  test_25: { icon: TrophyIcon, color: '#f59e0b' },
  perfect_week: { icon: TargetIcon, color: '#22c55e' },
  test_champion: { icon: TrophyIcon, color: '#f59e0b' },
  score_80: { icon: CrosshairIcon, color: '#22c55e' },
  score_90: { icon: CrosshairIcon, color: '#3b82f6' },
  chapter_master: { icon: BookIcon, color: '#22c55e' },
  chapters_3: { icon: BookIcon, color: '#3b82f6' },
  chapters_5: { icon: BookOpenIcon, color: '#6366f1' },
  chapters_10: { icon: BookOpenIcon, color: '#8b5cf6' },
  chapters_20: { icon: MountainIcon, color: '#f59e0b' },
  all_chapters: { icon: TrophyIcon, color: '#f59e0b' },
  physicist: { icon: AtomIcon, color: '#3b82f6' },
  all_physics: { icon: AtomIcon, color: '#6366f1' },
  chemist: { icon: FlaskIcon, color: '#22c55e' },
  all_chemistry: { icon: FlaskIcon, color: '#10b981' },
  mathematician: { icon: SigmaIcon, color: '#f59e0b' },
  all_math: { icon: SigmaIcon, color: '#d97706' },
  integrator: { icon: MathIcon, color: '#8b5cf6' },
  clean_5: { icon: CheckIcon, color: '#22c55e' },
  clean_10: { icon: CheckIcon, color: '#10b981' },
  clean_20: { icon: ShieldIcon, color: '#3b82f6' },
  clean_50: { icon: ShieldIcon, color: '#6366f1' },
  clean_100: { icon: CompassIcon, color: '#8b5cf6' },
  speed_solver: { icon: LightningIcon, color: '#f59e0b' },
  speed_10: { icon: ZapIcon, color: '#f97316' },
  speed_50: { icon: RocketIcon, color: '#ef4444' },
  daily_first: { icon: CalendarIcon, color: '#3b82f6' },
  daily_7: { icon: CalendarIcon, color: '#6366f1' },
  daily_30: { icon: AwardIcon, color: '#8b5cf6' },
  daily_perfect: { icon: TrophyIcon, color: '#f59e0b' },
  daily_25plus: { icon: TargetIcon, color: '#22c55e' },
  session_first: { icon: BookOpenIcon, color: '#3b82f6' },
  session_10: { icon: BookOpenIcon, color: '#6366f1' },
  session_50: { icon: BrainIcon, color: '#8b5cf6' },
  session_100: { icon: BrainIcon, color: '#a855f7' },
  session_250: { icon: PuzzleIcon, color: '#ec4899' },
  bookmark_1: { icon: BookOpenIcon, color: '#3b82f6' },
  bookmark_10: { icon: BookOpenIcon, color: '#6366f1' },
  bookmark_25: { icon: BookIcon, color: '#8b5cf6' },
  bookmark_50: { icon: BookIcon, color: '#a855f7' },
  note_first: { icon: NoteIcon, color: '#22c55e' },
  note_10: { icon: NoteIcon, color: '#3b82f6' },
  night_owl: { icon: MoonIcon, color: '#a855f7' },
  early_bird: { icon: SunIcon, color: '#f59e0b' },
  both_early_and_late: { icon: ClockIcon, color: '#6366f1' },
  ladder_climber: { icon: LadderIcon, color: '#818cf8' },
  ladder_10: { icon: MountainIcon, color: '#6366f1' },
  accuracy_50: { icon: TargetIcon, color: '#22c55e' },
  accuracy_70: { icon: CrosshairIcon, color: '#3b82f6' },
  accuracy_85: { icon: CrosshairIcon, color: '#6366f1' },
  accuracy_95: { icon: ShieldIcon, color: '#8b5cf6' },
  zero_mistakes_session: { icon: CheckIcon, color: '#22c55e' },
  first_correct: { icon: CheckIcon, color: '#22c55e' },
  correct_100: { icon: AwardIcon, color: '#3b82f6' },
  correct_500: { icon: AwardIcon, color: '#8b5cf6' },
  correct_1000: { icon: DiamondIcon, color: '#ec4899' },
  marathon_session: { icon: HeartbeatIcon, color: '#ef4444' },
  quiz_master: { icon: TrophyIcon, color: '#f59e0b' },
  gate_crusher: { icon: KeyIcon, color: '#22c55e' },
  gate_3: { icon: KeyIcon, color: '#f59e0b' },
  all_achievements: { icon: CrownIcon, color: '#f59e0b' },
};

export const BadgeIcon = ({ id, size = 32 }: { id: string; size?: number }) => {
  const entry = badgeMap[id] || { icon: TrophyIcon, color: 'var(--accent)' };
  const Icon = entry.icon;
  return <Icon size={size} color={entry.color} />;
};
