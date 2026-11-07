import { useEffect, useState } from 'react';
import { useApp } from '../../contexts/useApp';
import { getOsClassName } from '../../shells/os/osClassNames';
import { THEME_ASSETS, ThemeAssetId } from './themeAssets';
import { AppleBootScreen, isAppleTheme } from '../apple/AppleSessionScreens';

interface BootScreenProps {
  onComplete: () => void;
}

export function BootScreen({ onComplete }: BootScreenProps) {
  const { theme } = useApp();
  const appleTheme = isAppleTheme(theme);
  const themeAssets = THEME_ASSETS[(theme as ThemeAssetId) ?? 'webos'] ?? THEME_ASSETS.webos;
  const osClassName = getOsClassName(theme);
  const bootLogo = themeAssets.bootLogo;
  const [progress, setProgress] = useState(0);
  const [fadeIn, setFadeIn] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  useEffect(() => {
    if (appleTheme) return;
    setFadeIn(true);
  }, [appleTheme]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ' || e.code === 'Enter' || e.code === 'Escape') {
        e.preventDefault();
        onComplete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onComplete]);

  useEffect(() => {
    if (appleTheme) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [appleTheme, onComplete]);

  if (appleTheme) {
    return <AppleBootScreen theme={theme} onComplete={onComplete} />;
  }

  if (theme === 'win2000') {
    return (
      <div
        onClick={onComplete}
        className="min-h-screen bg-white text-black flex flex-col items-center justify-center font-sans select-none cursor-pointer os-shell os-classic relative overflow-hidden"
      >
        <div className="flex flex-col items-center max-w-lg w-full px-6">
          {/* Windows 2000 Banner */}
          <div className="flex items-center gap-4 mb-10">
            <div className="w-16 h-16 grid grid-cols-2 gap-1 p-1">
              <div className="bg-[#e03f19] rounded-tl-sm shadow-sm" />
              <div className="bg-[#7fb900] rounded-tr-sm shadow-sm" />
              <div className="bg-[#00a4ef] rounded-bl-sm shadow-sm" />
              <div className="bg-[#ffba08] rounded-br-sm shadow-sm" />
            </div>
            <div className="flex flex-col">
              <div className="text-sm font-semibold tracking-wide text-gray-500 uppercase">Microsoft®</div>
              <div className="text-4xl font-black tracking-tight text-gray-900 leading-none">
                Windows<span className="font-normal text-3xl"> 2000</span>
              </div>
              <div className="text-lg font-bold text-gray-700 tracking-wider">Professional</div>
              <div className="text-[11px] text-gray-500 tracking-wide mt-1">Built on NT® Technology</div>
            </div>
          </div>

          {/* Windows 2000 Segmented Progress Bar */}
          <div className="w-80 h-5 border-2 border-[#7f9db9] bg-white p-0.5 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#1952a5] via-[#2c6fd1] to-[#1952a5] transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="text-xs text-gray-400 mt-6 tracking-wide">
            Press <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-gray-600 font-mono text-[10px]">Space</kbd> or click to skip
          </div>
        </div>

        <div className="absolute bottom-6 text-[11px] text-gray-500 font-sans">
          Copyright © 1985-1999 Microsoft Corporation
        </div>
      </div>
    );
  }

  if (theme === 'win-98') {
    return (
      <div
        onClick={onComplete}
        className="min-h-screen bg-black flex flex-col items-center justify-center font-mono os-shell os-classic cursor-pointer select-none"
      >
        <div className="text-center">
          <h1 className="text-white text-6xl font-bold mb-4">Windows<span className="text-teal-500">98</span></h1>
          <div className="w-64 h-4 border-2 border-gray-500 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-blue-800 to-blue-600"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 mt-4">
            Press Space or click to skip
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onComplete}
      className={`boot-screen boot-screen--xp os-shell os-${osClassName} cursor-pointer`}
      style={{ opacity: fadeIn ? 1 : 0 }}
    >
      <div className="boot-screen__center">
        {bootLogo && !logoFailed && (
          <img
            src={bootLogo}
            alt="Windows"
            className="boot-screen__logo"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              setLogoFailed(true);
            }}
          />
        )}
        {(logoFailed || !bootLogo) && (
          <div className="boot-screen__fallback">
            <div className="boot-screen__fallback-logo" />
            <div className="boot-screen__fallback-text">
              <span className="boot-screen__fallback-brand">Microsoft</span>
              <span className="boot-screen__fallback-product">Windows XP</span>
            </div>
          </div>
        )}
        <div className="boot-screen__loader">
          <div />
          <div />
          <div />
        </div>
      </div>

      <div className="boot-screen__copyright">Copyright © Microsoft Corporation</div>
      <div className="boot-screen__brand">
        <img src="/images/xp_loading_mslogo.jpg" alt="Microsoft" />
      </div>

      <style>{`
        .boot-screen.boot-screen--xp {
          min-height: 100vh;
          background: #000;
          color: #fff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
          font-size: 14px;
          padding: 40px 32px;
          transition: opacity 500ms linear;
          position: relative;
          overflow: hidden;
        }

        .boot-screen__center {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 48px;
          margin-bottom: 80px;
        }

        .boot-screen__logo {
          width: 400px;
          max-width: 80vw;
        }

        .boot-screen__fallback {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .boot-screen__fallback-logo {
          width: 64px;
          height: 64px;
          position: relative;
        }

        .boot-screen__fallback-logo::before,
        .boot-screen__fallback-logo::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 10px;
          background: linear-gradient(135deg, #d84141, #e7b22a 45%, #4aa048 70%, #3a6ad7);
        }

        .boot-screen__fallback-logo::after {
          inset: 10px;
          background: #fff;
          transform: rotate(45deg);
        }

        .boot-screen__fallback-text {
          display: flex;
          flex-direction: column;
          line-height: 1.1;
        }

        .boot-screen__fallback-brand {
          font-size: 36px;
          font-style: italic;
          font-weight: 600;
        }

        .boot-screen__fallback-product {
          font-size: 28px;
          font-weight: 700;
        }

        .boot-screen__loader {
          width: 180px;
          height: 26px;
          border: 2px solid #b2b2b2;
          border-radius: 8px;
          padding: 3px 1px;
          overflow: hidden;
          font-size: 0;
          display: flex;
          align-items: center;
        }

        .boot-screen__loader div {
          width: 12px;
          height: 100%;
          margin-right: 3px;
          background: linear-gradient(to bottom, #2838c7 0%, #5979ef 20%, #869ef3 45%, #5979ef 70%, #2838c7 100%);
          animation: bootLoader 1.8s linear infinite;
        }

        .boot-screen__loader div:nth-child(2) {
          animation-delay: 0.2s;
        }

        .boot-screen__loader div:nth-child(3) {
          animation-delay: 0.4s;
        }

        .boot-screen__copyright,
        .boot-screen__brand {
          position: absolute;
          bottom: 40px;
          font-family: 'Arial', sans-serif;
          font-size: 16px;
        }

        .boot-screen__copyright {
          left: 40px;
        }

        .boot-screen__brand {
          right: 40px;
        }

        .boot-screen__brand img {
          width: 120px;
          height: auto;
        }

        @keyframes bootLoader {
          0% {
            transform: translateX(-60px);
          }
          100% {
            transform: translateX(220px);
          }
        }
      `}</style>
    </div>
  );
}
