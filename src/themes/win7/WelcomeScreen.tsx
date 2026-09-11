import { useEffect, useMemo } from 'react';
import { useApp } from '../../contexts/useApp';
import { OS_EDITIONS } from '../../shells/os/osEditions';
import { WIN7_ASSETS } from './assets';

interface WelcomeScreenProps {
  onComplete: () => void;
}

const EDITION_STORAGE_KEY = 'webos-grub-editions-v1';

function getSelectedWin7Edition(): string {
  if (typeof window === 'undefined') return '';
  try {
    const selected = JSON.parse(window.sessionStorage.getItem(EDITION_STORAGE_KEY) ?? '{}') as Record<string, string>;
    const edition = OS_EDITIONS.win7.find((item) => item.id === selected.win7);
    return edition?.label ?? '';
  } catch {
    return '';
  }
}

export function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const { language } = useApp();
  const edition = useMemo(getSelectedWin7Edition, []);

  useEffect(() => {
    const timer = window.setTimeout(onComplete, 2600);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className="win7-welcome-screen os-shell os-win7"
      style={{ backgroundImage: `url(${WIN7_ASSETS.loginBackground})` }}
      aria-live="polite"
    >
      <div className="win7-welcome-screen__message">
        <video
          className="win7-welcome-screen__spinner"
          src={WIN7_ASSETS.welcomeLoadingVideo}
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
        />
        <span>{language === 'ru' ? 'Добро пожаловать' : 'Welcome'}</span>
      </div>

      <div className="win7-welcome-screen__brand" aria-label={`Windows 7${edition ? ` ${edition}` : ''}`}>
        <img src={WIN7_ASSETS.windowsLogo} alt="" />
        <span className="win7-welcome-screen__windows">Windows 7</span>
        {edition && <span className="win7-welcome-screen__edition">{edition}</span>}
      </div>
    </div>
  );
}
