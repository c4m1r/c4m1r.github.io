import { useState, useRef } from 'react';
import { useApp } from '../../contexts/useApp';
import { getOsClassName } from '../../shells/os/osClassNames';
import { translations } from '../../i18n/translations';
import { Power, ArrowRight } from 'lucide-react';
import userAvatar from '../winxp/assets/user.gif';
import '../winxp/xp.css';
import { AppleLoginScreen, isAppleTheme } from '../apple/AppleSessionScreens';
import { verifyAccountPassword } from '../../domain/auth/credentials';

interface LoginScreenProps {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const { language, theme, setMode } = useApp();
  const t = translations[language].xp;
  const osClassName = getOsClassName(theme);
  const isRu = language === 'ru';

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isPasswordPromptOpen, setIsPasswordPromptOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [selectedUser98, setSelectedUser98] = useState<'c4m1r' | 'user'>('c4m1r');
  const [errorMessage, setErrorMessage] = useState('');
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
      setIsLoggingIn(true);
      setTimeout(onLogin, 1500);
    } else {
      triggerError();
    }
  };

  const handleUserClick = () => {
    if (!isPasswordPromptOpen) {
      setIsPasswordPromptOpen(true);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleShutdown = () => {
    setMode('poweroff');
  };

  if (isAppleTheme(theme)) {
    return (
      <AppleLoginScreen
        theme={theme}
        onLogin={onLogin}
        onShutdown={() => setMode('poweroff')}
      />
    );
  }

  if (theme === 'win2000') {
    return (
      <div className="min-h-screen bg-[#3a6ea5] flex items-center justify-center font-sans os-shell os-classic select-none">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (selectedUser98 === 'user') {
              onLogin();
            } else if (verifyAccountPassword('c4m1r', password)) {
              onLogin();
            } else {
              triggerError();
            }
          }}
          className="w-[420px] bg-[#c0c0c0] border-2 border-white border-b-black border-r-black p-1 shadow-2xl os-window"
        >
          <div className="bg-gradient-to-r from-[#000080] via-[#1084d0] to-[#000080] px-2 py-1 flex justify-between items-center mb-3 os-titlebar">
            <span className="text-white font-bold text-sm tracking-wide os-titlebar-title">Log On to Windows</span>
            <div className="os-titlebar-controls">
              <button
                type="button"
                onClick={() => setMode('poweroff')}
                className="w-4 h-4 bg-[#c0c0c0] border border-white border-b-black border-r-black flex items-center justify-center text-[10px] font-bold leading-none os-button"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="bg-white border border-gray-400 mx-2 mb-3 p-3 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Microsoft®</div>
              <div className="text-xl font-black text-gray-900 leading-tight">Windows<span className="font-normal text-lg"> 2000</span></div>
              <div className="text-xs font-bold text-gray-700">Professional</div>
              <div className="text-[9px] text-gray-500 mt-0.5">Built on NT® Technology</div>
            </div>
            <div className="w-10 h-10 grid grid-cols-2 gap-0.5 p-0.5">
              <div className="bg-[#e03f19] rounded-tl-sm" />
              <div className="bg-[#7fb900] rounded-tr-sm" />
              <div className="bg-[#00a4ef] rounded-bl-sm" />
              <div className="bg-[#ffba08] rounded-br-sm" />
            </div>
          </div>

          <div className="px-4 pb-4">
            <div className="grid grid-cols-[90px_1fr] gap-2 items-center mb-2">
              <label className="text-sm font-medium text-gray-800">User name:</label>
              <select
                value={selectedUser98}
                onChange={(e) => {
                  setSelectedUser98(e.target.value as 'c4m1r' | 'user');
                  setErrorMessage('');
                }}
                className="border-2 border-gray-400 border-b-white border-r-white px-2 py-0.5 text-sm os-input bg-white text-gray-900"
              >
                <option value="c4m1r">C4m1r</option>
                <option value="user">User</option>
              </select>

              <label className="text-sm font-medium text-gray-800">Password:</label>
              <input
                ref={inputRef}
                type="password"
                disabled={selectedUser98 === 'user'}
                placeholder={selectedUser98 === 'user' ? (isRu ? 'Без пароля' : 'No password') : ''}
                value={selectedUser98 === 'user' ? '' : password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                autoFocus={selectedUser98 === 'c4m1r'}
                className={`border-2 border-gray-400 border-b-white border-r-white px-2 py-0.5 text-sm os-input ${
                  selectedUser98 === 'user' ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-900'
                } ${shake ? 'border-red-600 bg-red-50' : ''}`}
              />

              <label className="text-sm font-medium text-gray-800">Log on to:</label>
              <div className="text-sm text-gray-700 bg-gray-100 px-2 py-0.5 border border-gray-300">
                (this computer)
              </div>
            </div>

            {errorMessage && (
              <div className="text-red-700 text-xs mt-1 font-semibold">{errorMessage}</div>
            )}
          </div>

          <div className="flex justify-end gap-2 px-4 pb-2">
            <button
              type="submit"
              className="px-6 py-1 border-2 border-white border-b-black border-r-black active:border-black active:border-b-white active:border-r-white focus:outline-dashed focus:outline-1 font-medium text-sm os-button"
            >
              OK
            </button>
            <button
              type="button"
              onClick={() => {
                setPassword('');
                setErrorMessage('');
              }}
              className="px-6 py-1 border-2 border-white border-b-black border-r-black active:border-black active:border-b-white active:border-r-white font-medium text-sm os-button"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => setMode('poweroff')}
              className="px-6 py-1 border-2 border-white border-b-black border-r-black active:border-black active:border-b-white active:border-r-white font-medium text-sm os-button"
            >
              Shut Down...
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (theme === 'win-98') {
    return (
      <div className="min-h-screen bg-[#008080] flex items-center justify-center font-sans os-shell os-classic">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (selectedUser98 === 'user') {
              onLogin();
            } else if (verifyAccountPassword('c4m1r', password)) {
              onLogin();
            } else {
              triggerError();
            }
          }}
          className="w-96 bg-[#c0c0c0] border-2 border-white border-b-black border-r-black p-1 shadow-xl os-window"
        >
          <div className="bg-gradient-to-r from-[#000080] to-[#1084d0] px-2 py-1 flex justify-between items-center mb-4 os-titlebar">
            <span className="text-white font-bold text-sm os-titlebar-title">Welcome to Windows</span>
            <div className="os-titlebar-controls">
              <button
                type="button"
                onClick={() => setMode('poweroff')}
                className="w-4 h-4 bg-[#c0c0c0] border border-white border-b-black border-r-black flex items-center justify-center text-[10px] font-bold leading-none os-button"
              >
                ✕
              </button>
            </div>
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
                <select
                  value={selectedUser98}
                  onChange={(e) => {
                    setSelectedUser98(e.target.value as 'c4m1r' | 'user');
                    setErrorMessage('');
                  }}
                  className="border-2 border-gray-400 border-b-white border-r-white px-1 text-sm os-input bg-white text-gray-800"
                >
                  <option value="c4m1r">C4m1r</option>
                  <option value="user">User</option>
                </select>

                <label className="text-sm">Password:</label>
                <input
                  ref={inputRef}
                  type="password"
                  disabled={selectedUser98 === 'user'}
                  placeholder={selectedUser98 === 'user' ? (isRu ? 'Без пароля' : 'No password') : ''}
                  value={selectedUser98 === 'user' ? '' : password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  autoFocus={selectedUser98 === 'c4m1r'}
                  className={`border-2 border-gray-400 border-b-white border-r-white px-1 text-sm os-input ${
                    selectedUser98 === 'user' ? 'bg-gray-100 text-gray-400' : ''
                  } ${shake ? 'border-red-600 bg-red-50' : ''}`}
                />
              </div>
              {errorMessage && (
                <div className="text-red-700 text-xs mt-1 font-semibold">{errorMessage}</div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 px-4 pb-2">
            <button
              type="submit"
              className="px-6 py-1 border-2 border-white border-b-black border-r-black active:border-black active:border-b-white active:border-r-white focus:outline-dashed focus:outline-1 os-button"
            >
              OK
            </button>
            <button
              type="button"
              onClick={() => {
                setPassword('');
                setErrorMessage('');
              }}
              className="px-6 py-1 border-2 border-white border-b-black border-r-black active:border-black active:border-b-white active:border-r-white os-button"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => setMode('poweroff')}
              className="px-6 py-1 border-2 border-white border-b-black border-r-black active:border-black active:border-b-white active:border-r-white os-button"
            >
              Shut Down
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (isLoggingIn) {
    return (
      <div className={`min-h-screen w-full bg-[#5a7edc] flex items-center justify-center overflow-hidden relative os-shell os-${osClassName}`}>
        <div className="text-center text-white flex flex-col items-center gap-6">
          <div className="text-2xl font-medium">{t.loggingIn || 'Загрузка персональных настроек...'}</div>
          <div className="w-64 h-2 bg-white/30 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
        </div>
      </div>
    );
  }

  // WebOS theme: Strictly account C4m1r protected by password (as specified: "но не в последнюю WebOS ОС-тему")
  return (
    <div className={`min-h-screen w-full login-screen-xp os-shell os-${osClassName}`}>
      <div className="login-screen__container">
        <div className="login-screen__header">
          <h2 className="login-screen__title">{t.welcomeMessage || 'Для начала работы нажмите на имя пользователя'}</h2>
        </div>

        <div className="login-screen__users">
          <div
            className={`login-screen__user-card os-button p-4 rounded-xl flex flex-col items-center gap-3 transition-all ${
              isPasswordPromptOpen ? 'bg-white/20 ring-2 ring-white/50' : 'hover:bg-white/10'
            }`}
          >
            <button
              type="button"
              onClick={handleUserClick}
              className="flex flex-col items-center gap-2 cursor-pointer focus:outline-none"
            >
              <div className="login-screen__user-avatar w-20 h-20 rounded-lg overflow-hidden border-2 border-amber-300 shadow-md">
                <img
                  src={userAvatar}
                  alt="C4m1r"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <div className="login-screen__user-name text-white font-bold text-lg drop-shadow">C4m1r</div>
            </button>

            {isPasswordPromptOpen && (
              <form onSubmit={handlePasswordSubmit} className="flex flex-col items-center gap-2 w-full max-w-[200px] mt-1">
                <span className="text-xs text-blue-100 font-medium">
                  {isRu ? 'Введите пароль' : 'Type your password'}
                </span>
                <div className="flex items-center gap-1.5 w-full">
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
                    className={`flex-1 px-2.5 py-1 text-sm bg-white text-gray-900 rounded border outline-none shadow-inner transition-colors ${
                      errorMessage ? 'border-red-500 bg-red-50' : 'border-blue-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-400'
                    } ${shake ? 'border-red-600 animate-shake' : ''}`}
                  />
                  <button
                    type="submit"
                    aria-label={isRu ? 'Войти' : 'Log on'}
                    className="w-7 h-7 bg-green-600 hover:bg-green-500 active:bg-green-700 text-white rounded flex items-center justify-center shadow transition-colors cursor-pointer"
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>
                {errorMessage && (
                  <span className="text-xs text-red-200 bg-red-900/70 px-2 py-0.5 rounded text-center">
                    {errorMessage}
                  </span>
                )}
              </form>
            )}
          </div>
        </div>

        <div className="login-screen__footer">
          <button onClick={handleShutdown} className="login-screen__shutdown-btn os-button">
            <Power size={20} />
            <span>{t.turnOffComputer || 'Выключение компьютера'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
