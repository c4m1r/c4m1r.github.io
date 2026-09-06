import { useState } from 'react';
import { useApp } from '../../contexts/useApp';
import { translations } from '../../i18n/translations';
import bootLogo from './assets/boot/boot-windows-logo.png';
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
    setTimeout(onLogin, 1500);
  };

  const handleShutdown = () => {
    setMode('grub');
  };

  const footerNote = language === 'ru'
    ? 'После входа в систему вы можете добавить или изменить учетные записи в Панели управления.'
    : 'After you log on, you can add or change accounts in Control Panel.';

  const loginTitleText = t.loginTitle || (language === 'ru' ? 'Чтобы начать, щелкните свое имя пользователя' : 'To begin, click your user name');

  return (
    <div className="xp-welcome-screen os-shell os-winxp">
      {/* Top Accent Bar */}
      <div className="xp-welcome-screen__top-bar" />

      {/* Main Content Area */}
      <div className="xp-welcome-screen__body">
        {/* Left Half: XP Identity & Instructions */}
        <div className="xp-welcome-screen__left">
          <div className="xp-welcome-screen__identity">
            <img
              src={bootLogo}
              alt="Microsoft Windows XP"
              className="xp-welcome-screen__logo-img"
            />
          </div>
          <div className="xp-welcome-screen__instruction">
            {loginTitleText}
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
                  ? t.loggingIn || (language === 'ru' ? 'Загрузка личных параметров...' : 'Loading your personal settings...')
                  : t.loginHint || (language === 'ru' ? 'Выберите имя пользователя для начала работы' : 'Click on your user name to begin')}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Bottom Footer Bar */}
      <footer className="xp-welcome-screen__footer">
        <button
          onClick={handleShutdown}
          className="xp-welcome-screen__power-btn"
        >
          <img src={shutdownIcon} alt="" className="xp-welcome-screen__power-icon" />
          <span>{t.turnOffComputer || (language === 'ru' ? 'Выключение компьютера' : 'Turn off computer')}</span>
        </button>

        <div className="xp-welcome-screen__footer-note">
          {footerNote}
        </div>
      </footer>
    </div>
  );
}
