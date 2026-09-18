import { useEffect, useState } from 'react';
import { type ThemeId } from '../../contexts/appContextTypes';
import macWallpaper from '../../../eat/playground-macos-main/public/img/ui/wallpaper.jpg';
import iosWallpaper from '../../content/pictures/wallpapers/ios/ios6-background-3.png';

export function isAppleTheme(theme: ThemeId): boolean {
  return theme === 'macos-26' || theme.startsWith('ios-');
}

export function AppleBootScreen({
  theme,
  onComplete,
}: {
  theme: ThemeId;
  onComplete: () => void;
}) {
  const isMac = theme === 'macos-26';
  const [progress, setProgress] = useState(8);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setProgress((value) => {
        if (value >= 100) {
          window.clearInterval(timer);
          window.setTimeout(onComplete, 320);
          return 100;
        }
        return Math.min(100, value + (value < 70 ? 4 : 2));
      });
    }, 46);

    return () => window.clearInterval(timer);
  }, [onComplete]);

  return (
    <div className={`apple-session apple-boot-session ${isMac ? 'is-macos' : 'is-ios'}`}>
      <div className="apple-boot-session__mark" aria-label="Apple"></div>
      <div className="apple-boot-session__progress" aria-label="Boot progress">
        <span style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

export function AppleLoginScreen({
  theme,
  onLogin,
  onShutdown,
}: {
  theme: ThemeId;
  onLogin: () => void;
  onShutdown: () => void;
}) {
  const isMac = theme === 'macos-26';
  const [loggingIn, setLoggingIn] = useState(false);

  const login = () => {
    if (loggingIn) return;
    setLoggingIn(true);
    window.setTimeout(onLogin, isMac ? 680 : 420);
  };

  if (!isMac) {
    return (
      <div
        className="apple-session apple-lock-session is-ios"
        style={{ backgroundImage: `url(${iosWallpaper})` }}
      >
        <div className="apple-lock-session__clock">
          <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <small>{new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</small>
        </div>
        <button type="button" className="apple-lock-session__open" onClick={login}>
          <span className="apple-lock-session__chevron">⌃</span>
          <span>{loggingIn ? 'Opening…' : 'Swipe up to open'}</span>
        </button>
      </div>
    );
  }

  return (
    <div
      className="apple-session apple-login-session is-macos"
      style={{ backgroundImage: `url(${macWallpaper})` }}
    >
      <div className="apple-login-session__scrim" />
      <div className="apple-login-session__card">
        <div className="apple-login-session__avatar" aria-hidden="true">C</div>
        <strong>C4m1r</strong>
        <button type="button" className="apple-login-session__login" onClick={login}>
          {loggingIn ? 'Logging in…' : 'Log In'}
        </button>
      </div>
      <button type="button" className="apple-login-session__power" onClick={onShutdown} aria-label="Shut down">
        ⏻
      </button>
    </div>
  );
}

export function AppleWelcomeScreen({
  theme,
  onComplete,
}: {
  theme: ThemeId;
  onComplete: () => void;
}) {
  const isMac = theme === 'macos-26';

  useEffect(() => {
    const timer = window.setTimeout(onComplete, 720);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`apple-session apple-welcome-session ${isMac ? 'is-macos' : 'is-ios'}`}>
      <div className="apple-welcome-session__mark"></div>
      <span>{isMac ? 'macOS' : 'iOS'}</span>
    </div>
  );
}

export function AppleSystemTransitionScreen({
  theme,
  mode,
  onComplete,
  duration,
}: {
  theme: ThemeId;
  mode: 'logoff' | 'shutdown';
  onComplete: () => void;
  duration?: number;
}) {
  const isMac = theme === 'macos-26';
  const timeout = duration ?? (mode === 'shutdown' ? 1800 : 1100);

  useEffect(() => {
    const timer = window.setTimeout(onComplete, timeout);
    return () => window.clearTimeout(timer);
  }, [onComplete, timeout]);

  const label = mode === 'shutdown'
    ? isMac ? 'Shutting Down…' : 'Powering Off…'
    : isMac ? 'Logging Out…' : 'Locking…';

  return (
    <div className={`apple-session apple-transition-session ${isMac ? 'is-macos' : 'is-ios'}`}>
      <div className="apple-transition-session__mark"></div>
      <span>{label}</span>
      <div className="apple-transition-session__spinner" aria-hidden="true" />
    </div>
  );
}
