import { useState } from 'react';
import { useApp } from '../../contexts/useApp';
import { translations } from '../../i18n/translations';
import { Power } from 'lucide-react';
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
    setTimeout(onLogin, 1500);
  };

  const handleShutdown = () => {
    setMode('grub');
  };

  return (
    <div className="xp-welcome-screen os-shell os-winxp">
      {/* Top Accent Bar */}
      <div className="xp-welcome-screen__top-bar" />

      {/* Main Content Area */}
      <div className="xp-welcome-screen__body">
        {/* Left Half: XP Identity & Instructions */}
        <div className="xp-welcome-screen__left">
          <div className="xp-welcome-screen__identity">
            <div className="xp-welcome-screen__flag" aria-hidden="true">
              <span className="xp-flag-tile xp-flag-red" />
              <span className="xp-flag-tile xp-flag-green" />
              <span className="xp-flag-tile xp-flag-blue" />
              <span className="xp-flag-tile xp-flag-yellow" />
            </div>
            <div className="xp-welcome-screen__brand">
              <span className="xp-welcome-screen__microsoft">Microsoft</span>
              <div className="xp-welcome-screen__product">
                <span className="xp-welcome-screen__windows">Windows</span>
                <span className="xp-welcome-screen__xp">XP</span>
              </div>
            </div>
          </div>
          <div className="xp-welcome-screen__instruction">
            {t.loginTitle || 'To begin, click your user name'}
          </div>
        </div>

        {/* Vertical Blue Separator */}
        <div className="xp-welcome-screen__divider" aria-hidden="true" />

        {/* Right Half: User Card */}
        <div className="xp-welcome-screen__right">
          <button
            onClick={handleUserClick}
            disabled={isLoggingIn}
            className={`xp-welcome-screen__user-tile ${
              isLoggingIn ? 'xp-welcome-screen__user-tile--logging-in' : ''
            }`}
          >
            <div className="xp-welcome-screen__avatar-frame">
              <img
                src={userAvatar}
                alt="C4m1r"
                className="xp-welcome-screen__avatar"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div className="xp-welcome-screen__user-details">
              <span className="xp-welcome-screen__username">{t.user || 'C4m1r'}</span>
              <span className="xp-welcome-screen__user-status">
                {isLoggingIn
                  ? t.loggingIn || 'Loading your personal settings...'
                  : t.loginHint || 'Click on your user name to begin'}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Bottom Footer Bar */}
      <footer className="xp-welcome-screen__footer">
        <button
          onClick={handleShutdown}
          className="xp-welcome-screen__power-btn os-button"
        >
          <div className="xp-welcome-screen__power-icon-wrapper">
            <Power size={14} className="xp-welcome-screen__power-icon" />
          </div>
          <span>{t.turnOffComputer || 'Turn off computer'}</span>
        </button>

        <div className="xp-welcome-screen__footer-note">
          After you log on, you can add or change accounts via Control Panel.
        </div>
      </footer>
    </div>
  );
}
