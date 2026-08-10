import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../contexts/useApp';
import { translations } from '../i18n/translations';
import { enabledOsBootProfiles } from '../shells/os/osProfiles';
import { type OsBootProfile } from '../shells/os/osTypes';

export function GrubMenu() {
  const { setMode, setTheme, language } = useApp();
  const t = translations[language].grub;

  const defaultIndex = Math.max(
    0,
    enabledOsBootProfiles.findIndex((p) => p.defaultSelected)
  );

  const [selectedIndex, setSelectedIndex] = useState(defaultIndex);
  const [countdown, setCountdown] = useState(3);
  const [autobootActive, setAutobootActive] = useState(true);

  const getProfileLabel = useCallback(
    (profile: OsBootProfile) => {
      if (profile.id === 'site') return t.blogSite || profile.label;
      if (profile.id === 'terminal') return t.terminal || profile.label;
      if (profile.id === 'webos') return t.webos || profile.label;
      return profile.label;
    },
    [t.blogSite, t.terminal, t.webos]
  );

  const handleBoot = useCallback(
    (profile: OsBootProfile) => {
      if (profile.theme) {
        setTheme(profile.theme);
      }
      setMode(profile.mode);
    },
    [setMode, setTheme]
  );

  useEffect(() => {
    if (!autobootActive) return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      handleBoot(enabledOsBootProfiles[selectedIndex]);
    }
  }, [autobootActive, countdown, handleBoot, selectedIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      if (key === 'arrowup' || key === 'w') {
        e.preventDefault();
        setAutobootActive(false);
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : enabledOsBootProfiles.length - 1));
      } else if (key === 'arrowdown' || key === 's') {
        e.preventDefault();
        setAutobootActive(false);
        setSelectedIndex((prev) => (prev < enabledOsBootProfiles.length - 1 ? prev + 1 : 0));
      } else if (key === 'enter') {
        e.preventDefault();
        handleBoot(enabledOsBootProfiles[selectedIndex]);
      }
    };

    const handleTouchStart = () => {
      setAutobootActive(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
    };
  }, [handleBoot, selectedIndex]);

  return (
    <div className="min-h-screen bg-black text-white font-mono p-8 flex flex-col">
      <div className="mb-8">
        <div className="text-gray-400">{t.title || 'GRUB Boot Loader'}</div>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-2xl">
        <div className="space-y-1 mb-8">
          {enabledOsBootProfiles.map((profile, index) => (
            <div
              key={profile.id}
              className={`px-4 py-2 cursor-pointer select-none ${
                index === selectedIndex
                  ? 'bg-white text-black'
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
              onClick={() => {
                setSelectedIndex(index);
                setAutobootActive(false);
                handleBoot(profile);
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                setSelectedIndex(index);
                setAutobootActive(false);
                handleBoot(profile);
              }}
              style={{
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {getProfileLabel(profile)}
            </div>
          ))}
        </div>

        {autobootActive && (
          <div className="text-gray-400 mb-4">
            {(t.autoboot || 'Автозагрузка через {seconds} сек...').replace(
              '{seconds}',
              countdown.toString()
            )}
          </div>
        )}

        <div className="text-gray-400 whitespace-pre-line text-sm">
          {t.hint || 'Используйте стрелки ↑↓ для выбора, Enter для загрузки'}
        </div>
      </div>
    </div>
  );
}
