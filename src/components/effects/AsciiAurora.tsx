import { useEffect, useMemo, useRef } from 'react';
import { createAsciiAuroraRenderer, type AsciiAuroraOptions } from '../../lib/asciiAurora';
import './AsciiAurora.css';

export interface AsciiAuroraProps {
  className?: string;
  variant?: 'terminal' | 'ubuntu' | 'webos' | 'blog' | 'circuit' | 'cyberpunk' | 'vaporwave';
  opacity?: number;
  frameInterval?: number;
  columns?: number;
  rows?: number;
  speed?: number;
  paused?: boolean;
}

const VARIANT_OPTIONS: Record<NonNullable<AsciiAuroraProps['variant']>, Omit<AsciiAuroraOptions, 'columns' | 'rows' | 'speed'>> = {
  terminal: {
    frequency: 1.65,
    sharpness: 1.4,
    centerGap: 0.12,
    characterRamp: ' .,:;irsXA253hMHGS#9B&@',
    direction: 1,
    phaseOffset: 0.15,
  },
  ubuntu: {
    frequency: 1.35,
    sharpness: 1.1,
    centerGap: 0.18,
    characterRamp: ' .:-=+*#%@',
    direction: -1,
    phaseOffset: 0.7,
  },
  webos: {
    frequency: 1.25,
    sharpness: 0.95,
    centerGap: 0.2,
    characterRamp: ' .·:;+=xX#%@',
    direction: 1,
    phaseOffset: 0.4,
  },
  blog: {
    frequency: 1.15,
    sharpness: 0.85,
    centerGap: 0.24,
    characterRamp: '  .,:-~=+*#%@',
    direction: 1,
    phaseOffset: 0,
  },
  circuit: {
    frequency: 1.9,
    sharpness: 1.8,
    centerGap: 0.08,
    characterRamp: ' .:-=+*01#%@',
    direction: -1,
    phaseOffset: 1.1,
  },
  cyberpunk: {
    frequency: 1.55,
    sharpness: 1.25,
    centerGap: 0.14,
    characterRamp: ' .:-=+*xX#%@',
    direction: 1,
    phaseOffset: 2.1,
  },
  vaporwave: {
    frequency: 1.05,
    sharpness: 0.9,
    centerGap: 0.28,
    characterRamp: '  .:░▒▓█',
    direction: -1,
    phaseOffset: 1.6,
  },
};

function getReducedMotionPreference(): boolean {
  return typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function AsciiAurora({
  className,
  variant = 'blog',
  opacity = 0.3,
  frameInterval = 80,
  columns = 96,
  rows = 32,
  speed = 0.85,
  paused = false,
}: AsciiAuroraProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const preRef = useRef<HTMLPreElement | null>(null);

  const renderer = useMemo(() => {
    const variantOptions = VARIANT_OPTIONS[variant];
    return createAsciiAuroraRenderer({
      ...variantOptions,
      columns,
      rows,
      speed,
    });
  }, [columns, rows, speed, variant]);

  useEffect(() => {
    const pre = preRef.current;
    const root = rootRef.current;
    if (!pre || !root) return;

    let animationFrame = 0;
    let lastFrameTime = 0;
    let isVisible = true;
    let isDocumentVisible = !document.hidden;
    const safeFrameInterval = Math.max(16, frameInterval);
    const reducedMotion = getReducedMotionPreference();

    const renderFrame = (elapsedMs: number) => {
      pre.textContent = renderer(elapsedMs / 1000);
    };

    const shouldRun = () => !paused && isVisible && isDocumentVisible;

    const tick = (timestamp: number) => {
      if (!shouldRun()) {
        animationFrame = 0;
        return;
      }

      if (timestamp - lastFrameTime >= safeFrameInterval) {
        renderFrame(timestamp);
        lastFrameTime = timestamp;
      }

      animationFrame = window.requestAnimationFrame(tick);
    };

    const start = () => {
      if (reducedMotion || animationFrame || !shouldRun()) return;
      animationFrame = window.requestAnimationFrame(tick);
    };

    const stop = () => {
      if (!animationFrame) return;
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    };

    const handleVisibilityChange = () => {
      isDocumentVisible = !document.hidden;
      if (shouldRun()) {
        start();
      } else {
        stop();
      }
    };

    const observer = typeof IntersectionObserver === 'function'
      ? new IntersectionObserver(([entry]) => {
          isVisible = entry.isIntersecting;
          if (shouldRun()) {
            start();
          } else {
            stop();
          }
        })
      : null;

    renderFrame(0);

    if (!reducedMotion) {
      observer?.observe(root);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      start();
    }

    return () => {
      stop();
      observer?.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [frameInterval, paused, renderer]);

  const classes = [
    'ascii-aurora',
    `ascii-aurora--${variant}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={rootRef}
      className={classes}
      aria-hidden="true"
      style={{ '--ascii-aurora-opacity': opacity } as React.CSSProperties}
    >
      <pre ref={preRef} className="ascii-aurora__pre" aria-hidden="true" />
    </div>
  );
}
