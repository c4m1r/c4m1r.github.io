import { useState } from 'react';
import { useApp } from '../../contexts/useApp';
import { translations } from '../../i18n/translations';
import windowsMark from './assets/windows.png';
import shutdownIcon from './assets/icons/shutdown.png';
import userAvatar from './assets/user.gif';
import './xp.css';

interface LoginScreenProps {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const { language, setMode } = useApp();
  const t = translations[language].xp;
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleUserClick = () => {
    setIsLoggingIn(true);
    window.setTimeout(onLogin, 900);
  };

  return (
    <div className="xp-welcome-screen os-shell os-winxp">
      <div className="xp-welcome-screen__top-bar" />
      <div className="xp-welcome-screen__body">
        <div className="xp-welcome-screen__left">
          <div className="xp-welcome-screen__identity xp-welcome-screen__identity--authentic" aria-label="Microsoft Windows XP">
            <img src={windowsMark} alt="" className="xp-welcome-screen__windows-mark" />
            <div className="xp-welcome-screen__wordmark">
              <span className="xp-welcome-screen__microsoft">Microsoft</span>
              <span className="xp-welcome-screen__windows-text">Windows<span className="xp-welcome-screen__xp-mark">xp</span></span>
            </div>
          </div>
          <div className="xp-welcome-screen__instruction">{t.loginTitle}</div>
        </div>
        <div className="xp-welcome-screen__divider" aria-hidden="true" />
        <div className="xp-welcome-screen__right">
          <button onClick={handleUserClick} disabled={isLoggingIn} className={`xp-welcome-screen__user-tile ${isLoggingIn ? 'xp-welcome-screen__user-tile--logging-in' : ''}`}>
            <div className="xp-welcome-screen__avatar-frame">
              <img src={userAvatar} alt="C4m1r" className="xp-welcome-screen__avatar" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
            </div>
            <div className="xp-welcome-screen__user-details">
              <span className="xp-welcome-screen__username">{t.user || 'C4m1r'}</span>
              <span className="xp-welcome-screen__user-status">{isLoggingIn ? t.loggingIn : t.loginHint}</span>
            </div>
          </button>
        </div>
      </div>
      <footer className="xp-welcome-screen__footer">
        <button onClick={() => setMode('grub')} className="xp-welcome-screen__power-btn">
          <img src={shutdownIcon} alt="" className="xp-welcome-screen__power-icon" />
          <span>{t.turnOffComputer}</span>
        </button>
        <div className="xp-welcome-screen__footer-note">{t.footerNote}</div>
      </footer>
    </div>
  );
}
