import { useEffect, useRef, useState } from 'react';
import { useApp } from '../../contexts/useApp';
import { WIN7_ASSETS } from './assets';

interface LoginScreenProps {
  onLogin: () => void;
  onRestart: () => void;
  onShutdown: () => void;
}

export function LoginScreen({ onLogin, onRestart, onShutdown }: LoginScreenProps) {
  const { language } = useApp();
  const [showPowerMenu, setShowPowerMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isRu = language === 'ru';

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowPowerMenu(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowPowerMenu(false);
      if (event.key === 'Enter') onLogin();
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [onLogin]);

  return (
    <div
      className="win7-login-screen os-shell os-win7"
      style={{ backgroundImage: `url(${WIN7_ASSETS.loginBackground})` }}
    >
      <main className="win7-login-screen__center">
        <button
          type="button"
          className="win7-login-screen__user"
          onClick={onLogin}
          aria-label={isRu ? 'Войти в систему' : 'Log on'}
        >
          <span className="win7-login-screen__avatar-frame">
            <img src={WIN7_ASSETS.userAvatar} alt="" className="win7-login-screen__avatar" />
          </span>
          <span className="win7-login-screen__username">C4m1r</span>
          <span className="win7-login-screen__prompt">
            {isRu ? 'Нажмите для входа' : 'Click to log on'}
          </span>
        </button>
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
