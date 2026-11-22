import { useEffect, useState } from 'react';
import { XP_IDENTITY_LOGO } from './xpIdentityLogo';
import { useApp } from '../../contexts/useApp';
import { playBootStartup } from '../bootPreload';

interface BootScreenProps {
  onComplete: () => void;
}

export function BootScreen({ onComplete }: BootScreenProps) {
  const [fadeIn, setFadeIn] = useState(false);
  const { theme } = useApp();

  useEffect(() => {
    playBootStartup(theme ?? 'win-xp');
  }, [theme]);

  useEffect(() => {
    setFadeIn(true);
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.code === 'Space' || e.key === 'Enter' || e.key === 'Escape') {
        onComplete();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onComplete]);

  return (
    <div
      onClick={onComplete}
      className="xp-boot-screen os-shell os-winxp cursor-pointer select-none"
      style={{ opacity: fadeIn ? 1 : 0 }}
    >
      <div className="xp-boot-screen__center">
        <div className="xp-boot-screen__identity">
          <img
            src={XP_IDENTITY_LOGO}
            alt="Microsoft Windows XP"
            className="xp-boot-screen__logo-img"
          />
        </div>

        <div className="xp-boot-screen__loader" aria-label="Loading">
          <div className="xp-boot-screen__loader-bar">
            <div className="xp-boot-screen__block" />
            <div className="xp-boot-screen__block" />
            <div className="xp-boot-screen__block" />
          </div>
        </div>
      </div>

      <div className="xp-boot-screen__copyright">Copyright © Microsoft Corporation</div>
    </div>
  );
}
