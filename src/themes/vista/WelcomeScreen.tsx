import { useEffect, useState } from 'react';
import { useApp } from '../../contexts/useApp';
import { getSessionAccount } from '../../domain/auth/session';
import { preloadThemeAssets } from '../bootPreload';
import userAvatar from '../winxp/assets/user.gif';

interface VistaWelcomeScreenProps {
  onComplete: () => void;
}

/** Shortest time the "Welcome" screen stays up, even when the media is already cached. */
const MIN_WELCOME_MS = 2400;

/**
 * Windows Vista "Welcome" screen: the logon backdrop, the signed-in user's tile and a spinning ring.
 * It holds until the theme's media is cached, so the desktop never opens half-loaded.
 */
export function VistaWelcomeScreen({ onComplete }: VistaWelcomeScreenProps) {
  const { language, theme } = useApp();
  const account = getSessionAccount();
  const [minElapsed, setMinElapsed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setMinElapsed(true), MIN_WELCOME_MS);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void preloadThemeAssets(theme).then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [theme]);

  useEffect(() => {
    if (minElapsed && ready) onComplete();
  }, [minElapsed, ready, onComplete]);

  return (
    <div className="vista-welcome os-shell os-win7 os-vista" aria-live="polite">
      <div className="vista-welcome__center">
        <div className="vista-welcome__avatar">
          {account.toLowerCase() === 'c4m1r' ? <img src={userAvatar} alt="" /> : <span>{account.slice(0, 1).toUpperCase()}</span>}
        </div>
        <div className="vista-welcome__name">{account}</div>
        <div className="vista-welcome__message">
          <span className="vista-welcome__ring" aria-hidden="true" />
          <span>{language === 'ru' ? 'Добро пожаловать' : 'Welcome'}</span>
        </div>
      </div>
    </div>
  );
}
