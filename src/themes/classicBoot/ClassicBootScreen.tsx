import { useEffect, useRef, useState } from 'react';
import { playBootStartup } from '../bootPreload';
import { useApp } from '../../contexts/useApp';
import { useBootProgress } from './useBootProgress';
import gif98 from '../win98/assets/boot/boot_windows_logo.gif';
import gif95 from '../win98/assets/boot/windows95_loading.gif';
import gifVista from './assets/windows_vista_loading.gif';
import splash2000 from '../win2000/assets/boot/splash-professional.png';

export type ClassicBootVariant = 'win98' | 'win95' | 'win2000' | 'vista';

/**
 * Windows 98, 95 and Vista boot as animated splashes; Windows 2000 shows its base splash with a
 * progress bar that follows the site's real loading.
 *
 * Each splash stays until both: its minimum play time has passed, and everything it needs has
 * loaded. A click or a key press skips it.
 */
const SPLASH: Record<ClassicBootVariant, { gif?: string; still?: string; gifMs: number; plays: number }> = {
  win98: { gif: gif98, gifMs: 1400, plays: 1 },
  win95: { gif: gif95, gifMs: 1400, plays: 1 },
  vista: { gif: gifVista, gifMs: 1800, plays: 3 },
  win2000: { still: splash2000, gifMs: 0, plays: 0 },
};

const WIN2000_MIN_MS = 1500;

interface ClassicBootScreenProps {
  variant: ClassicBootVariant;
  onComplete: () => void;
}

export function ClassicBootScreen({ variant, onComplete }: ClassicBootScreenProps) {
  const { theme } = useApp();
  const spec = SPLASH[variant];
  const minMs = variant === 'win2000' ? WIN2000_MIN_MS : spec.gifMs * spec.plays;
  const progress = useBootProgress([spec.gif, spec.still]);
  const [minElapsed, setMinElapsed] = useState(false);
  const finished = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    playBootStartup(theme ?? 'win-98');
  }, [theme]);

  useEffect(() => {
    const timer = setTimeout(() => setMinElapsed(true), minMs);
    return () => clearTimeout(timer);
  }, [minMs]);

  useEffect(() => {
    if (minElapsed && progress >= 1 && !finished.current) {
      finished.current = true;
      onCompleteRef.current();
    }
  }, [minElapsed, progress]);

  useEffect(() => {
    const skip = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault();
        if (!finished.current) {
          finished.current = true;
          onCompleteRef.current();
        }
      }
    };
    window.addEventListener('keydown', skip);
    return () => window.removeEventListener('keydown', skip);
  }, []);

  const skip = () => {
    if (!finished.current) {
      finished.current = true;
      onCompleteRef.current();
    }
  };

  if (variant === 'win2000' && spec.still) {
    // The base splash is 640x480; the frame keeps its 4:3 shape and fits the window.
    // The progress bar sits in the box the splash already draws (about x 273–437, y 436–445).
    return (
      <div
        onClick={skip}
        className="fixed inset-0 bg-black flex items-center justify-center cursor-pointer select-none os-shell os-classic"
        role="progressbar"
        aria-label="Starting up"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
      >
        <div className="relative" style={{ width: 'min(100vw, calc(100vh * 4 / 3))', aspectRatio: '4 / 3' }}>
          <img src={spec.still} alt="" className="absolute inset-0 w-full h-full" draggable={false} />
          <div
            className="absolute"
            style={{ left: '42.97%', top: '91.25%', width: '25%', height: '1.04%' }}
          >
            <div
              className="h-full transition-[width] duration-150"
              style={{
                width: `${progress * 100}%`,
                background: 'repeating-linear-gradient(90deg, #0a246a 0 6px, transparent 6px 8px)',
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={skip}
      className="fixed inset-0 bg-black flex items-center justify-center cursor-pointer select-none os-shell os-classic"
    >
      {spec.gif && (
        <img src={spec.gif} alt="" className="w-full h-full object-contain" draggable={false} />
      )}
    </div>
  );
}
