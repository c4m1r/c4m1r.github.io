import { useEffect } from 'react';
import { useApp } from '../../contexts/useApp';
import './xp.css';

type TransitionMode = 'logoff' | 'shutdown';

interface SystemTransitionScreenProps {
  mode: TransitionMode;
  onComplete: () => void;
  duration?: number;
}

export function SystemTransitionScreen({ mode, onComplete, duration }: SystemTransitionScreenProps) {
  const { language } = useApp();
  const timeout = duration ?? (mode === 'shutdown' ? 2800 : 1800);

  useEffect(() => {
    const timer = window.setTimeout(onComplete, timeout);
    return () => window.clearTimeout(timer);
  }, [onComplete, timeout]);

  const title =
    mode === 'shutdown'
      ? language === 'ru'
        ? 'Завершение работы Windows...'
        : 'Windows is shutting down...'
      : language === 'ru'
        ? 'Завершение сеанса...'
        : 'Logging off...';

  const subtitle =
    language === 'ru' ? 'Сохранение параметров' : 'Saving your settings';

  return (
    <div className="xp-welcome-banner os-shell os-winxp">
      <div className="xp-welcome-banner__top-bar" />
      <div className="xp-welcome-banner__center" style={{ flexDirection: 'column', gap: '12px' }}>
        <span className="xp-welcome-banner__title" style={{ fontSize: '36px' }}>
          {title}
        </span>
        <span style={{ color: '#cce0ff', fontSize: '14px', fontFamily: 'Tahoma, sans-serif' }}>
          {subtitle}
        </span>
      </div>
      <div className="xp-welcome-banner__bottom-bar" />
    </div>
  );
}
