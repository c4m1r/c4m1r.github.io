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
  const welcomeText = language === 'ru' ? 'Приветствие' : (t.welcome ?? 'Welcome');

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
          {welcomeText}
        </span>
      </div>
      <div className="xp-welcome-banner__bottom-bar" />
    </div>
  );
}
