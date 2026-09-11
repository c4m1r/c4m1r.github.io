import { useState, useEffect, useCallback, useMemo } from 'react';
import { useApp } from '../contexts/useApp';
import { translations } from '../i18n/translations';
import { enabledOsBootProfiles } from '../shells/os/osProfiles';
import { getEditionsForProfile } from '../shells/os/osEditions';
import {
  isWindowsBuildTextEnabled,
  setWindowsBuildTextEnabled,
  supportsWindowsBuildText,
} from '../shells/os/osBootOptions';
import { type OsBootProfile } from '../shells/os/osTypes';

const EDITION_STORAGE_KEY = 'webos-grub-editions-v1';
const FAKE_COUNTDOWN_TICK_MS = 330;

function loadEditionSelection(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.sessionStorage.getItem(EDITION_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

export function GrubMenu() {
  const { setMode, setTheme, language } = useApp();
  const t = translations[language].grub;
  const isRu = language === 'ru';

  const defaultIndex = Math.max(0, enabledOsBootProfiles.findIndex((p) => p.defaultSelected));
  const [selectedIndex, setSelectedIndex] = useState(defaultIndex);
  const [countdown, setCountdown] = useState(3);
  const [autobootActive, setAutobootActive] = useState(true);
  const [editionProfileId, setEditionProfileId] = useState<string | null>(null);
  const [editionIndex, setEditionIndex] = useState(0);
  const [selectedEditions, setSelectedEditions] = useState<Record<string, string>>(loadEditionSelection);
  const [, refreshBuildOption] = useState(0);

  const selectedProfile = enabledOsBootProfiles[selectedIndex];
  const selectedProfileEditions = useMemo(
    () => getEditionsForProfile(String(selectedProfile?.id ?? '')),
    [selectedProfile]
  );
  const editionMenuItems = useMemo(
    () => getEditionsForProfile(editionProfileId ?? ''),
    [editionProfileId]
  );
  const buildTextSupported = supportsWindowsBuildText(selectedProfile?.theme);
  const buildTextEnabled = isWindowsBuildTextEnabled(selectedProfile?.theme);

  const getProfileLabel = useCallback(
    (profile: OsBootProfile) => {
      let base = profile.label;
      if (profile.id === 'site') base = t.blogSite || profile.label;
      else if (profile.id === 'terminal') base = t.terminal || profile.label;
      else if (profile.id === 'webos') base = t.webos || profile.label;

      const editions = getEditionsForProfile(String(profile.id));
      if (editions.length === 0) return base;

      const selectedEditionId = selectedEditions[String(profile.id)];
      const selectedEdition = editions.find((edition) => edition.id === selectedEditionId);
      return `${base}${selectedEdition ? ` ${selectedEdition.label}` : ''} *`;
    },
    [selectedEditions, t.blogSite, t.terminal, t.webos]
  );

  const handleBoot = useCallback(
    (profile: OsBootProfile) => {
      if (profile.theme) setTheme(profile.theme);
      setMode(profile.mode);
    },
    [setMode, setTheme]
  );

  const openEditionMenu = useCallback(() => {
    if (!selectedProfile || selectedProfileEditions.length === 0) return;
    setAutobootActive(false);
    setEditionProfileId(String(selectedProfile.id));
    const currentId = selectedEditions[String(selectedProfile.id)];
    const currentIndex = selectedProfileEditions.findIndex((edition) => edition.id === currentId);
    setEditionIndex(currentIndex >= 0 ? currentIndex : 0);
  }, [selectedEditions, selectedProfile, selectedProfileEditions]);

  const chooseEdition = useCallback(() => {
    if (!editionProfileId || editionMenuItems.length === 0) return;
    const edition = editionMenuItems[editionIndex];
    const next = { ...selectedEditions, [editionProfileId]: edition.id };
    setSelectedEditions(next);
    try {
      window.sessionStorage.setItem(EDITION_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Session storage may be unavailable in hardened/private browser modes.
    }
    setEditionProfileId(null);
  }, [editionIndex, editionMenuItems, editionProfileId, selectedEditions]);

  const toggleBuildText = useCallback(() => {
    const theme = selectedProfile?.theme;
    if (!theme || !supportsWindowsBuildText(theme)) return;
    setAutobootActive(false);
    setWindowsBuildTextEnabled(theme, !isWindowsBuildTextEnabled(theme));
    refreshBuildOption((current) => current + 1);
  }, [selectedProfile]);

  useEffect(() => {
    if (!autobootActive || editionProfileId) return;
    const timer = window.setInterval(() => {
      setCountdown((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          handleBoot(enabledOsBootProfiles[selectedIndex]);
          return 0;
        }
        return current - 1;
      });
    }, FAKE_COUNTDOWN_TICK_MS);
    return () => window.clearInterval(timer);
  }, [autobootActive, editionProfileId, handleBoot, selectedIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      if (editionProfileId) {
        if (key === 'arrowup' || key === 'w') {
          e.preventDefault();
          setEditionIndex((prev) => (prev > 0 ? prev - 1 : editionMenuItems.length - 1));
        } else if (key === 'arrowdown' || key === 's') {
          e.preventDefault();
          setEditionIndex((prev) => (prev < editionMenuItems.length - 1 ? prev + 1 : 0));
        } else if (key === 'enter') {
          e.preventDefault();
          chooseEdition();
        } else if (key === 'escape' || key === 'e') {
          e.preventDefault();
          setEditionProfileId(null);
        }
        return;
      }

      if (key === 'arrowup' || key === 'w') {
        e.preventDefault();
        setAutobootActive(false);
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : enabledOsBootProfiles.length - 1));
      } else if (key === 'arrowdown' || key === 's') {
        e.preventDefault();
        setAutobootActive(false);
        setSelectedIndex((prev) => (prev < enabledOsBootProfiles.length - 1 ? prev + 1 : 0));
      } else if (key === 'e' && selectedProfileEditions.length > 0) {
        e.preventDefault();
        openEditionMenu();
      } else if (key === 'b' && buildTextSupported) {
        e.preventDefault();
        toggleBuildText();
      } else if (key === 'enter') {
        e.preventDefault();
        setAutobootActive(false);
        handleBoot(enabledOsBootProfiles[selectedIndex]);
      }
    };

    const handleTouchStart = () => setAutobootActive(false);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
    };
  }, [
    buildTextSupported,
    chooseEdition,
    editionMenuItems.length,
    editionProfileId,
    handleBoot,
    openEditionMenu,
    selectedIndex,
    selectedProfileEditions.length,
    toggleBuildText,
  ]);

  if (editionProfileId) {
    const profile = enabledOsBootProfiles.find((item) => String(item.id) === editionProfileId);
    return (
      <div className="min-h-screen bg-black text-white font-mono p-8 flex flex-col">
        <div className="mb-8 text-gray-400">GNU GRUB - {isRu ? 'выбор редакции' : 'edition selection'}</div>
        <div className="flex-1 flex flex-col justify-center max-w-3xl">
          <div className="mb-5 text-lg">{profile?.label ?? editionProfileId} *</div>
          <div className="space-y-1 mb-8">
            {editionMenuItems.map((edition, index) => (
              <button
                key={edition.id}
                type="button"
                className={`block w-full text-left px-4 py-2 font-mono ${index === editionIndex ? 'bg-white text-black' : 'bg-black text-white hover:bg-gray-800'}`}
                onMouseEnter={() => setEditionIndex(index)}
                onClick={() => {
                  setEditionIndex(index);
                  const next = { ...selectedEditions, [editionProfileId]: edition.id };
                  setSelectedEditions(next);
                  try {
                    window.sessionStorage.setItem(EDITION_STORAGE_KEY, JSON.stringify(next));
                  } catch {
                    // Ignore storage failures and keep the selection for this render.
                  }
                  setEditionProfileId(null);
                }}
              >
                {isRu ? `${edition.labelRu} (${edition.label})` : edition.label}
              </button>
            ))}
          </div>
          <div className="text-gray-400 text-sm">
            {isRu ? '↑↓ - выбор, Enter - применить редакцию, Esc/E - назад' : '↑↓ - select, Enter - apply edition, Esc/E - back'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono p-8 flex flex-col">
      <div className="mb-8"><div className="text-gray-400">{t.title || 'GRUB Boot Loader'}</div></div>
      <div className="flex-1 flex flex-col justify-center max-w-2xl">
        <div className="space-y-1 mb-8">
          {enabledOsBootProfiles.map((profile, index) => (
            <div
              key={profile.id}
              className={`px-4 py-2 cursor-pointer select-none ${index === selectedIndex ? 'bg-white text-black' : 'bg-black text-white hover:bg-gray-800'}`}
              onClick={() => { setSelectedIndex(index); setAutobootActive(false); handleBoot(profile); }}
              onTouchStart={(e) => { e.preventDefault(); setSelectedIndex(index); setAutobootActive(false); handleBoot(profile); }}
              style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
            >
              {getProfileLabel(profile)}
            </div>
          ))}
        </div>

        {selectedProfileEditions.length > 0 && (
          <div className="text-amber-300 mb-4 text-sm">
            {isRu ? 'Нажмите E для выбора редакции' : 'Press E to choose an edition'}
          </div>
        )}

        {buildTextSupported && (
          <button
            type="button"
            onClick={toggleBuildText}
            className="mb-4 w-fit bg-transparent p-0 text-left font-mono text-sm text-cyan-300 hover:text-cyan-200"
          >
            {isRu
              ? `B - текст сборки на рабочем столе: ${buildTextEnabled ? 'включен' : 'выключен'}`
              : `B - desktop build text: ${buildTextEnabled ? 'on' : 'off'}`}
          </button>
        )}

        {autobootActive && (
          <div className="text-gray-400 mb-4">
            {(t.autoboot || 'Автозагрузка через {seconds} сек...').replace('{seconds}', countdown.toString())}
          </div>
        )}

        <div className="text-gray-400 whitespace-pre-line text-sm">
          {t.hint || 'Используйте стрелки ↑↓ для выбора, Enter для загрузки'}
        </div>
      </div>
    </div>
  );
}