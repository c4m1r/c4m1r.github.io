import { useEffect } from 'react';
import { useApp } from '../../contexts/useApp';
import './xp.css';

interface WelcomeScreenProps {
  onComplete: () => void;
}

export function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const { language } = useApp();

  useEffect(() => {
    const timer = window.setTimeout(onComplete, 2200);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  const welcomeText = language === 'ru' ? 'приветствие' : 'welcome';

  return (
    <div className="xp-welcome-banner os-shell os-winxp" role="status" aria-live="polite">
      <div className="xp-welcome-banner__upper" />
      <div className="xp-welcome-banner__center">
        <div className="xp-welcome-banner__glow" aria-hidden="true" />
        <span className="xp-welcome-banner__title">{welcomeText}</span>
      </div>
      <div className="xp-welcome-banner__lower" />
    </div>
  );
}
