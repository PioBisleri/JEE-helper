import React, { useRef, useState } from 'react';
import { parseLaTeX } from './DailyChallenge';
import { ClockIcon } from './Icons';
import type { CSSProperties } from 'react';

interface AnimationPlayerProps {
  path: string;
  title: string;
  description?: string;
  onClose?: () => void;
}

export default function AnimationPlayer({ path, title, description, onClose }: AnimationPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(false);

  const handleSpeedChange = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => setError(true));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if ((videoRef.current as HTMLVideoElement & { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen) {
        (videoRef.current as HTMLVideoElement & { webkitRequestFullscreen: () => Promise<void> }).webkitRequestFullscreen();
      }
    }
  };

  return (
    <div style={styles.container} className="card glass">
      <div style={styles.header}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' } as CSSProperties}>
          <span style={styles.animBadge}>JEE NATIVE EXPLANATION</span>
          <h4 style={styles.title}>{title}</h4>
        </div>
        {onClose && (
          <button style={styles.closeBtn} onClick={onClose} title="Close Player">✕</button>
        )}
      </div>

      <div style={styles.videoWrapper}>
        {error ? (
          <div style={styles.errorBox}>
            <WarningIcon size={32} color="var(--danger)" />
            <p style={{ margin: '8px 0 0 0', fontSize: '12px' } as CSSProperties}>Failed to load native webm animation.</p>
            <a href={path} download style={styles.downloadLink}>Download Video File</a>
          </div>
        ) : (
          <video
            ref={videoRef}
            src={path}
            playsInline
            controls
            style={styles.video}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onError={() => setError(true)}
          />
        )}
      </div>

      {/* Custom Premium Controls Bar */}
      <div style={styles.controlsBar}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' } as CSSProperties}>
          <button style={styles.playBtn} onClick={togglePlay}>
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button style={styles.speedLabelBtn} onClick={handleFullscreen}>
             Fullscreen
          </button>
        </div>

        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' } as CSSProperties}>
          <ClockIcon size={12} color="var(--text-secondary)" style={{ marginRight: '4px' } as CSSProperties} />
          <span style={styles.speedText}>Speed:</span>
          {[0.5, 1, 1.5, 2].map((speed) => (
            <button
              key={speed}
              style={{
                ...styles.speedBtn,
                backgroundColor: playbackSpeed === speed ? 'var(--accent)' : 'var(--bg-elevated)',
                color: playbackSpeed === speed ? '#ffffff' : 'var(--text-primary)'
              }}
              onClick={() => handleSpeedChange(speed)}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>

      {description && (
        <div style={styles.descriptionBox}>
          <p style={styles.descriptionText}>{parseLaTeX(description)}</p>
        </div>
      )}
    </div>
  );
}

// Simple local warning icon to avoid circular references
const WarningIcon = ({ size = 20, color = 'var(--danger)', style }: { size?: number; color?: string; style?: CSSProperties }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', ...style } as CSSProperties}
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const styles: Record<string, CSSProperties> = {
  container: {
    padding: '0 !important',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '1px solid var(--border-subtle)',
    backgroundColor: 'var(--bg-card)',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    padding: '12px 16px',
    borderBottom: '1px solid var(--border-subtle)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'var(--bg-secondary)'
  },
  animBadge: {
    fontSize: '8px',
    fontWeight: '800',
    color: 'var(--accent-hover)',
    letterSpacing: '1px'
  },
  title: {
    margin: 0,
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--text-primary)'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    fontSize: '16px',
    cursor: 'pointer',
    padding: '4px'
  },
  videoWrapper: {
    position: 'relative',
    width: '100%',
    backgroundColor: '#000000',
    aspectRatio: '16/9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'contain'
  },
  errorBox: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    color: 'var(--text-secondary)'
  },
  downloadLink: {
    marginTop: '12px',
    fontSize: '11px',
    color: 'var(--accent-hover)',
    textDecoration: 'underline',
    fontWeight: '600'
  },
  controlsBar: {
    padding: '10px 16px',
    backgroundColor: 'var(--bg-secondary)',
    borderTop: '1px solid var(--border-subtle)',
    borderBottom: '1px solid var(--border-subtle)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px'
  },
  playBtn: {
    padding: '6px 12px',
    fontSize: '11px',
    borderRadius: '6px',
    backgroundColor: 'var(--bg-elevated)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-default)',
    cursor: 'pointer',
    fontWeight: '600'
  },
  speedLabelBtn: {
    padding: '6px 12px',
    fontSize: '11px',
    borderRadius: '6px',
    backgroundColor: 'var(--bg-elevated)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-default)',
    cursor: 'pointer',
    fontWeight: '600'
  },
  speedText: {
    fontSize: '10px',
    color: 'var(--text-muted)',
    fontWeight: '600'
  },
  speedBtn: {
    padding: '3px 8px',
    fontSize: '10px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '700',
    fontFamily: 'var(--font-mono)'
  },
  descriptionBox: {
    padding: '12px 16px',
    backgroundColor: 'var(--bg-card)'
  },
  descriptionText: {
    margin: 0,
    fontSize: '11px',
    lineHeight: '1.5',
    color: 'var(--text-secondary)'
  }
};
