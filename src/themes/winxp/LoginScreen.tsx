import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { translations } from '../../i18n/translations';
import { Power } from 'lucide-react';
import userAvatar from './assets/avatars/profile.gif';
import avatar1 from './assets/avatars/user1.png';
import avatar2 from './assets/avatars/user2.png';
import avatar3 from './assets/avatars/user3.png';
import avatar4 from './assets/avatars/user4.png';
import xpLogo from './assets/boot/boot-windows-logo.png';
import './xp.css';

interface LoginScreenProps {
  onLogin: () => void;
}

const USERS = [
  { name: 'Jennifer', status: 'Click on your user name to begin', avatar: avatar1 },
  { name: 'Billy Bob', status: '4 programs running', avatar: avatar2 },
  { name: 'Jason', status: 'Standard user', avatar: avatar3 },
  { name: 'Connor', status: 'Type your password', avatar: avatar4 },
  { name: 'Albert', status: 'Administrator', avatar: userAvatar },
];

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const { language, setMode } = useApp();
  const t = translations[language].xp;
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleUserClick = () => {
    setIsLoggingIn(true);
    setTimeout(onLogin, 2000);
  };

  const handleShutdown = () => {
    setMode('grub');
  };

  if (isLoggingIn) {
    return (
      <div className="xp-login-modern xp-login-modern--loading">
        <div className="xp-login-modern__panel xp-login-modern__panel--loading">
          <div className="xp-login-modern__loading-ring" />
          <div className="xp-login-modern__loading-text">
            {t.loggingIn || 'Loading your personal settings…'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="xp-login-modern xp-login-modern--main">
      <div className="xp-login-modern__background" />
      <div className="xp-login-modern__content">
        <div className="xp-login-modern__hero">
          <img src={xpLogo} alt="Windows XP" className="xp-login-modern__hero-logo" />
          <h1 className="xp-login-modern__hero-title">Windows <span>XP</span></h1>
          <p className="xp-login-modern__hero-desc">
            {t.welcomeMessage || 'To begin, click your user name'}
          </p>
          <div className="xp-login-modern__hero-sub">
            <span>Welcome</span>
            <small>{t.loginHint || 'Click on your user name to begin'}</small>
          </div>
        </div>

        <div className="xp-login-modern__separator" aria-hidden="true" />

        <div className="xp-login-modern__panel">
          <div className="xp-login-modern__panel-header">
            <span className="xp-login-modern__panel-title">Select a user</span>
            <button
              onClick={handleShutdown}
              className="xp-login-modern__power-btn xp-login-modern__power-btn--inline"
            >
              <Power size={14} className="xp-login-modern__power-icon" />
              <span>{t.turnOffComputer || 'Turn off computer'}</span>
            </button>
          </div>

          <div className="xp-login-modern__users">
            {USERS.map((user) => (
              <button
                key={user.name}
                onClick={handleUserClick}
                className={`xp-login-modern__user-card ${
                  user.name === 'Connor' ? 'xp-login-modern__user-card--active' : ''
                }`}
              >
                <div className="xp-login-modern__avatar-frame">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="xp-login-modern__avatar"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <div className="xp-login-modern__user-info">
                  <span className="xp-login-modern__username">{user.name}</span>
                  <span className="xp-login-modern__user-status">{user.status}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="xp-login-modern__panel-footer">
            <p className="xp-login-modern__panel-note">
              After you log on, you can add or change accounts via Control Panel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

