import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { translations } from '../../i18n/translations';
import { Power } from 'lucide-react';
import userAvatar from '../winxp/assets/user.gif';
import '../winxp/xp.css';

interface LoginScreenProps {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const { language, theme, setMode } = useApp();
  const t = translations[language].xp;

  if (theme === 'win-98') {
    return (
      <div className="min-h-screen bg-[#008080] flex items-center justify-center font-sans">
        <div className="w-96 bg-[#c0c0c0] border-2 border-white border-b-black border-r-black p-1 shadow-xl">
          <div className="bg-gradient-to-r from-[#000080] to-[#1084d0] px-2 py-1 flex justify-between items-center mb-4">
            <span className="text-white font-bold text-sm">Welcome to Windows</span>
            <button className="w-4 h-4 bg-[#c0c0c0] border border-white border-b-black border-r-black flex items-center justify-center text-[10px] font-bold leading-none">
              ✕
            </button>
          </div>

          <div className="flex gap-4 px-4 pb-4">
            <div className="w-16">
              <div className="w-12 h-12 mx-auto mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <p className="mb-4 text-sm">Type a user name and password to log on to Windows.</p>

              <div className="grid grid-cols-[80px_1fr] gap-2 items-center mb-2">
                <label className="text-sm">User name:</label>
                <input type="text" value="C4m1r" readOnly className="border-2 border-gray-400 border-b-white border-r-white px-1 text-sm" />

                <label className="text-sm">Password:</label>
                <input type="password" className="border-2 border-gray-400 border-b-white border-r-white px-1 text-sm" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 px-4 pb-2">
            <button
              onClick={onLogin}
              className="px-6 py-1 border-2 border-white border-b-black border-r-black active:border-black active:border-b-white active:border-r-white focus:outline-dashed focus:outline-1"
            >
              OK
            </button>
            <button className="px-6 py-1 border-2 border-white border-b-black border-r-black active:border-black active:border-b-white active:border-r-white">
              Cancel
            </button>
            <button
              onClick={() => setMode('grub')}
              className="px-6 py-1 border-2 border-white border-b-black border-r-black active:border-black active:border-b-white active:border-r-white"
            >
              Shut Down
            </button>
          </div>
        </div>
      </div>
    );
  }

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
      <div className="min-h-screen w-full bg-[#5a7edc] flex items-center justify-center overflow-hidden relative">
        <div className="text-center text-white flex flex-col items-center gap-6">
          <div className="text-2xl font-medium">{t.loggingIn || 'Загрузка персональных настроек...'}</div>
          <div className="w-64 h-2 bg-white/30 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full login-screen-xp">
      <div className="login-screen__container">
        <div className="login-screen__header">
          <h2 className="login-screen__title">{t.welcomeMessage || 'Для начала работы нажмите на имя пользователя'}</h2>
        </div>

        <div className="login-screen__users">
          <button onClick={handleUserClick} className="login-screen__user-card">
            <div className="login-screen__user-avatar">
              <img
                src={userAvatar}
                alt="C4m1r"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div className="login-screen__user-name">C4m1r</div>
          </button>
        </div>

        <div className="login-screen__footer">
          <button onClick={handleShutdown} className="login-screen__shutdown-btn">
            <Power size={20} />
            <span>{t.turnOffComputer || 'Выключение компьютера'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
