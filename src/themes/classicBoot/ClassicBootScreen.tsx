import { useEffect, useRef, useState } from 'react';
import { playBootStartup } from '../bootPreload';
import { useApp } from '../../contexts/useApp';
import { useBootProgress } from './useBootProgress';
import gif98 from '../win98/assets/boot/boot_windows_logo.gif';
import gif95 from '../win98/assets/boot/windows95_loading.gif';
import gifVista from './assets/windows_vista_loading.gif';
import gif2000 from '../win2000/assets/boot/windows2000_professional_loading.gif';
import gif2000Startup from '../win2000/assets/boot/windows2000_example_startup-desktop.gif';

export type ClassicBootVariant = 'win98' | 'win95' | 'win2000' | 'vista';

/**
 * Windows 98, 95 and Vista boot as animated splashes; Windows 2000 plays its Professional
 * splash GIF with a progress bar that follows the site's real loading, filling the empty box
 * the GIF already draws.
 *
 * Each splash stays until both: its minimum play time has passed, and everything it needs has
 * loaded. A click or a key press skips it.
 */
const SPLASH: Record<ClassicBootVariant, { gif: string; gifMs: number; plays: number }> = {
  win98: { gif: gif98, gifMs: 1400, plays: 1 },
  win95: { gif: gif95, gifMs: 1400, plays: 1 },
  vista: { gif: gifVista, gifMs: 1800, plays: 3 },
  win2000: { gif: gif2000, gifMs: 0, plays: 0 },
};

/** Letterbox colour: black, set inline so no skin or body background can show through the sides. */
const LETTERBOX = { backgroundColor: '#000' } as const;

const WIN2000_MIN_MS = 1500;
/** The 2000 post-boot GIF is a single frame; it is held for this long, then logon follows. */
const WIN2000_STARTUP_MS = 2500;

interface ClassicBootScreenProps {
  variant: ClassicBootVariant;
  onComplete: () => void;
}

export function ClassicBootScreen({ variant, onComplete }: ClassicBootScreenProps) {
  const { theme } = useApp();
  const spec = SPLASH[variant];
  const minMs = variant === 'win2000' ? WIN2000_MIN_MS : spec.gifMs * spec.plays;
  const progress = useBootProgress([spec.gif]);
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

  if (variant === 'win2000') {
    // The GIF is 640x480; the 4:3 frame fits the window and black fills the rest (letterbox).
    // The GIF's own empty box sits at about x 273–437, y 436–445 of 640x480; the fill goes inside it.
    return (
      <div
        onClick={skip}
        className="fixed inset-0 flex items-center justify-center cursor-pointer select-none"
        style={LETTERBOX}
        role="progressbar"
        aria-label="Starting up"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
      >
        <div className="relative" style={{ width: 'min(100vw, calc(100vh * 4 / 3))', aspectRatio: '4 / 3' }}>
          <img src={spec.gif} alt="" className="absolute inset-0 w-full h-full" draggable={false} />
          <div className="absolute" style={{ left: '42.81%', top: '91.25%', width: '25.31%', height: '1.25%' }}>
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
      className="fixed inset-0 flex items-center justify-center cursor-pointer select-none"
        style={LETTERBOX}
    >
      <img src={spec.gif} alt="" className="w-full h-full object-contain" draggable={false} />
    </div>
  );
}

/**
 * Windows 2000's first screen after boot: a single-frame GIF letterboxed on black, held for a
 * short time (or until a click or key press), then logon follows.
 */
export function Windows2000StartupScreen({ onComplete }: { onComplete: () => void }) {
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const finished = useRef(false);

  const finish = () => {
    if (!finished.current) {
      finished.current = true;
      onCompleteRef.current();
    }
  };

  useEffect(() => {
    const timer = setTimeout(finish, WIN2000_STARTUP_MS);
    const key = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault();
        finish();
      }
    };
    window.addEventListener('keydown', key);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', key);
    };
  }, []);

  return (
    <div
      onClick={finish}
      className="fixed inset-0 flex items-center justify-center cursor-pointer select-none"
        style={LETTERBOX}
    >
      <div className="relative" style={{ width: 'min(100vw, calc(100vh * 4 / 3))', aspectRatio: '4 / 3' }}>
        <img src={gif2000Startup} alt="" className="absolute inset-0 w-full h-full" draggable={false} />
      </div>
    </div>
  );
}
