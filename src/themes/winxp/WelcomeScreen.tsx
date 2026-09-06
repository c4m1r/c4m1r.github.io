import { useEffect, useState } from 'react';
import { useApp } from '../../contexts/useApp';
import { translations } from '../../i18n/translations';
import './xp.css';

interface WelcomeScreenProps {
  onComplete: () => void;
}

export function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const { language } = useApp();
  const t = translations[language].xp;
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setFadeIn(true);
    const timer = setTimeout(() => {
      onComplete();
    }, 1800);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="xp-welcome-banner os-shell os-winxp">
      <div className="xp-welcome-banner__top-bar" />
      <div className="xp-welcome-banner__center">
        <span
          className="xp-welcome-banner__title"
          style={{
            opacity: fadeIn ? 1 : 0,
            transition: 'opacity 300ms ease-out',
          }}
        >
          {t.welcome ? t.welcome.toLowerCase() : 'welcome'}
        </span>
      </div>
      <div className="xp-welcome-banner__bottom-bar" />
    </div>
  );
}
