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
  const [visible, setVisible] = useState(false);
  const welcomeText = language === 'ru' ? 'Приветствие' : (t.welcome ?? 'welcome');

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    const timer = window.setTimeout(onComplete, 2400);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <div className="xp-welcome-banner xp-welcome-banner--authentic os-shell os-winxp" aria-live="polite">
      <div className="xp-welcome-banner__top-bar" />
      <div className="xp-welcome-banner__center">
        <div className="xp-welcome-banner__glow" aria-hidden="true" />
        <span className={`xp-welcome-banner__title ${visible ? 'is-visible' : ''}`}>
          {welcomeText}
        </span>
      </div>
      <div className="xp-welcome-banner__bottom-bar" />
    </div>
  );
}
