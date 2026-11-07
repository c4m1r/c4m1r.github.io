import { useState, useRef } from 'react';
import { useApp } from '../../contexts/useApp';
import { translations } from '../../i18n/translations';
import shutdownIcon from './assets/icons/shutdown.png';
import userAvatar from './assets/user.gif';
import { XP_IDENTITY_LOGO } from './xpIdentityLogo';
import { verifyAccountPassword } from '../../domain/auth/credentials';
import './xp.css';

interface LoginScreenProps {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const { language, setMode } = useApp();
  const t = translations[language].xp;
  const isRu = language === 'ru';

  const [loggingInUser, setLoggingInUser] = useState<'c4m1r' | 'user' | null>(null);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleC4m1rClick = () => {
    if (!isPasswordOpen) {
      setIsPasswordOpen(true);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleUserClick = () => {
    setLoggingInUser('user');
    setTimeout(onLogin, 1200);
  };

  const handlePasswordSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (verifyAccountPassword('c4m1r', password)) {
      setErrorMessage('');
      setLoggingInUser('c4m1r');
      setTimeout(onLogin, 1500);
    } else {
      setErrorMessage(isRu ? 'Неверный пароль. Повторите ввод.' : 'Incorrect password. Please try again.');
      setShake(true);
      setPassword('');
      setTimeout(() => setShake(false), 500);
      inputRef.current?.focus();
    }
  };

  const handleShutdown = () => {
    setMode('poweroff');
  };

  return (
    <div className="xp-welcome-screen os-shell os-winxp">
      <div className="xp-welcome-screen__top-bar" />

      <div className="xp-welcome-screen__body">
        <div className="xp-welcome-screen__left">
          <div className="xp-welcome-screen__identity">
            <img
              src={XP_IDENTITY_LOGO}
              alt="Microsoft Windows XP"
              className="xp-welcome-screen__logo-img"
            />
          </div>
          <div className="xp-welcome-screen__instruction">
            {t.loginTitle}
          </div>
        </div>

        <div className="xp-welcome-screen__divider" aria-hidden="true" />

        <div className="xp-welcome-screen__right">
          <div
            onClick={handleC4m1rClick}
            className={`xp-welcome-screen__user-tile ${
              loggingInUser === 'c4m1r' ? 'xp-welcome-screen__user-tile--logging-in' : ''
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

              {loggingInUser === 'c4m1r' ? (
                <span className="xp-welcome-screen__user-status">{t.loggingIn}</span>
              ) : !isPasswordOpen ? (
                <span className="xp-welcome-screen__user-status">{t.loginHint}</span>
              ) : (
                <form
                  onSubmit={handlePasswordSubmit}
                  className="xp-welcome-screen__password-box"
                  onClick={(e) => e.stopPropagation()}
                >
                  <label className="xp-welcome-screen__password-label">
                    {isRu ? 'Введите пароль' : 'Type your password'}
                  </label>
                  <div className="xp-welcome-screen__password-row">
                    <input
                      ref={inputRef}
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errorMessage) setErrorMessage('');
                      }}
                      autoFocus
                      className={`xp-welcome-screen__password-input ${shake ? 'border-red-500' : ''}`}
                    />
                    <button
                      type="submit"
                      className="xp-welcome-screen__password-submit"
                      aria-label={isRu ? 'Войти' : 'Log on'}
                    >
                      <span style={{ fontSize: '12px', fontWeight: 'bold' }}>➔</span>
                    </button>
                  </div>
                  {errorMessage && (
                    <div className="xp-welcome-screen__password-error">{errorMessage}</div>
                  )}
                </form>
              )}
            </div>
          </div>

          <div
            onClick={handleUserClick}
            className={`xp-welcome-screen__user-tile ${
              loggingInUser === 'user' ? 'xp-welcome-screen__user-tile--logging-in' : ''
            }`}
          >
            <div className="xp-welcome-screen__avatar-frame">
              <img
                src={userAvatar}
                alt="User"
                className="xp-welcome-screen__avatar"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div className="xp-welcome-screen__user-details">
              <span className="xp-welcome-screen__username">User</span>
              <span className="xp-welcome-screen__user-status">
                {loggingInUser === 'user' ? t.loggingIn : t.loginHint}
              </span>
            </div>
          </div>
        </div>
      </div>

      <footer className="xp-welcome-screen__footer">
        <button
          onClick={handleShutdown}
          className="xp-welcome-screen__power-btn"
        >
          <img src={shutdownIcon} alt="" className="xp-welcome-screen__power-icon" />
          <span>{t.turnOffComputer}</span>
        </button>

        <div className="xp-welcome-screen__footer-note">
          {t.footerNote}
        </div>
      </footer>
    </div>
  );
}
