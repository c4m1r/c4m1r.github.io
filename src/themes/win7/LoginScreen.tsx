import { useEffect, useRef, useState } from 'react';
import { useApp } from '../../contexts/useApp';
import { WIN7_ASSETS } from './assets';
import { verifyAccountPassword } from '../../domain/auth/credentials';

interface LoginScreenProps {
  onLogin: () => void;
  onRestart: () => void;
  onShutdown: () => void;
}

export function LoginScreen({ onLogin, onRestart, onShutdown }: LoginScreenProps) {
  const { language } = useApp();
  const [showPowerMenu, setShowPowerMenu] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [shake, setShake] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isRu = language === 'ru';

  const triggerError = () => {
    setErrorMessage(isRu ? 'Неверный пароль. Повторите попытку.' : 'Incorrect password. Please try again.');
    setShake(true);
    setPassword('');
    setTimeout(() => setShake(false), 500);
    inputRef.current?.focus();
  };

  const handlePasswordSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (verifyAccountPassword('c4m1r', password)) {
      setErrorMessage('');
      onLogin();
    } else {
      triggerError();
    }
  };

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowPowerMenu(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowPowerMenu(false);
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  return (
    <div
      className="win7-login-screen os-shell os-win7"
      style={{ backgroundImage: `url(${WIN7_ASSETS.loginBackground})` }}
    >
      <main className="win7-login-screen__center">
        <div className="flex items-start justify-center gap-12 flex-wrap">
          {/* Account 1: User (Password-free, default) */}
          <div className="flex flex-col items-center">
            <button
              type="button"
              className="win7-login-screen__user"
              onClick={onLogin}
              aria-label={isRu ? 'Войти как User' : 'Log on as User'}
            >
              <span className="win7-login-screen__avatar-frame">
                <img src={WIN7_ASSETS.userAvatar} alt="" className="win7-login-screen__avatar" />
              </span>
              <span className="win7-login-screen__username">User</span>
              <span className="win7-login-screen__prompt">
                {isRu ? 'Вход без пароля' : 'Click to log on'}
              </span>
            </button>
          </div>
          {/* Account 2: C4m1r (Protected by password) */}
          <div className="flex flex-col items-center">
            <button
              type="button"
              className="win7-login-screen__user"
              onClick={() => {
                if (!isPasswordOpen) {
                  setIsPasswordOpen(true);
                  setTimeout(() => inputRef.current?.focus(), 50);
                }
              }}
              aria-label={isRu ? 'Войти в систему' : 'Log on'}
            >
              <span className="win7-login-screen__avatar-frame">
                <img src={WIN7_ASSETS.userAvatar} alt="" className="win7-login-screen__avatar" />
              </span>
              <span className="win7-login-screen__username">C4m1r</span>
              {!isPasswordOpen && (
                <span className="win7-login-screen__prompt">
                  {isRu ? 'Нажмите для входа' : 'Click to log on'}
                </span>
              )}
            </button>

            {isPasswordOpen && (
              <form onSubmit={handlePasswordSubmit} className="flex flex-col items-center gap-2 mt-2">
                <div className="flex items-center gap-1.5">
                  <input
                    ref={inputRef}
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder={isRu ? 'Пароль' : 'Password'}
                    autoFocus
                    className={`px-3 py-1 text-sm bg-white/90 text-gray-900 rounded-sm border border-gray-400 outline-none shadow-inner w-44 transition-all focus:bg-white focus:border-blue-500 ${
                      shake ? 'border-red-500 bg-red-50' : ''
                    }`}
                  />
                  <button
                    type="submit"
                    aria-label={isRu ? 'Войти' : 'Log on'}
                    className="w-7 h-7 bg-blue-600/80 hover:bg-blue-600 active:bg-blue-700 text-white rounded-full flex items-center justify-center border border-white/50 shadow cursor-pointer transition-colors"
                  >
                    <span className="text-xs">➔</span>
                  </button>
                </div>
                {errorMessage && (
                  <span className="text-xs text-white bg-red-900/80 px-2 py-0.5 rounded shadow">
                    {errorMessage}
                  </span>
                )}
              </form>
            )}
          </div>

        </div>
      </main>

      <footer className="win7-login-screen__footer">
        <div className="win7-login-screen__brand" aria-label="Windows 7">
          <img src={WIN7_ASSETS.windowsLogo} alt="" />
          <span>Windows 7</span>
        </div>

        <div className="win7-login-screen__power" ref={menuRef}>
          {showPowerMenu && (
            <div className="win7-login-screen__power-menu" role="menu">
              <button type="button" role="menuitem" onClick={onRestart}>
                {isRu ? 'Перезагрузка' : 'Restart'}
              </button>
              <button type="button" role="menuitem" onClick={onShutdown}>
                {isRu ? 'Завершение работы' : 'Shut down'}
              </button>
            </div>
          )}
          <button
            type="button"
            className="win7-login-screen__power-button"
            onClick={() => setShowPowerMenu((current) => !current)}
            aria-expanded={showPowerMenu}
            aria-label={isRu ? 'Параметры завершения работы' : 'Power options'}
          >
            <img src={WIN7_ASSETS.shutdownIcon} alt="" />
          </button>
        </div>
      </footer>
    </div>
  );
}
