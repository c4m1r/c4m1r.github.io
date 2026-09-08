import { useEffect } from 'react';
import { useApp } from '../../contexts/useApp';
import { WIN7_ASSETS } from './assets';

interface SystemTransitionScreenProps {
  mode: 'logoff' | 'shutdown';
  onComplete: () => void;
}

export function SystemTransitionScreen({ mode, onComplete }: SystemTransitionScreenProps) {
  const { language } = useApp();
  const isRu = language === 'ru';

  useEffect(() => {
    const timer = window.setTimeout(onComplete, mode === 'shutdown' ? 2200 : 1600);
    return () => window.clearTimeout(timer);
  }, [mode, onComplete]);

  return (
    <div
      className="win7-transition-screen os-shell os-win7"
      style={{ backgroundImage: `url(${WIN7_ASSETS.loginBackground})` }}
      role="status"
      aria-live="polite"
    >
      <img src={WIN7_ASSETS.windowsLogo} alt="" className="win7-transition-screen__logo" />
      <div className="win7-transition-screen__message">
        {mode === 'shutdown'
          ? (isRu ? 'Завершение работы...' : 'Shutting down...')
          : (isRu ? 'Выход из системы...' : 'Logging off...')}
      </div>
      <div className="win7-transition-screen__spinner" aria-hidden="true" />
    </div>
  );
}
