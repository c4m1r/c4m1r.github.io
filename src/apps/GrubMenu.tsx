import { useCallback, useEffect, useMemo, useState } from 'react';
import { useApp } from '../contexts/useApp';
import { translations } from '../i18n/translations';
import { enabledOsBootProfiles } from '../shells/os/osProfiles';
import { type OsBootProfile } from '../shells/os/osTypes';
import {
  editionLabel,
  getEditionFamily,
  getSelectedEdition,
  OS_EDITIONS,
  setSelectedEdition,
  type EditionFamilyId,
} from '../shells/os/osEditions';

const AUTOBOOT_TOTAL_MS = 1000;
const AUTOBOOT_TICK_MS = Math.floor(AUTOBOOT_TOTAL_MS / 3);

export function GrubMenu() {
  const { setMode, setTheme, language } = useApp();
  const t = translations[language].grub;

  const defaultIndex = Math.max(
    0,
    enabledOsBootProfiles.findIndex((p) => p.defaultSelected),
  );

  const [selectedIndex, setSelectedIndex] = useState(defaultIndex);
  const [countdown, setCountdown] = useState(3);
  const [autobootActive, setAutobootActive] = useState(true);
  const [editionFamily, setEditionFamily] = useState<EditionFamilyId | null>(null);
  const [editionIndex, setEditionIndex] = useState(0);
  const [editionRevision, setEditionRevision] = useState(0);

  const selectedProfile = enabledOsBootProfiles[selectedIndex];
  const selectedFamily = getEditionFamily(selectedProfile?.id ?? '');

  const getProfileLabel = useCallback(
    (profile: OsBootProfile) => {
      if (profile.id === 'site') return t.blogSite || profile.label;
      if (profile.id === 'terminal') return t.terminal || profile.label;
      if (profile.id === 'webos') return t.webos || profile.label;

      const family = getEditionFamily(profile.id);
      if (!family) return profile.label;
      const selectedEdition = getSelectedEdition(family);
      return `${profile.label} ${editionLabel(selectedEdition, language)} *`;
    },
    [language, t.blogSite, t.terminal, t.webos, editionRevision],
  );

  const handleBoot = useCallback(
    (profile: OsBootProfile) => {
      if (profile.theme) setTheme(profile.theme);
      setMode(profile.mode);
    },
    [setMode, setTheme],
  );

  const cancelAutoboot = useCallback(() => {
    setAutobootActive(false);
  }, []);

  const openEditionMenu = useCallback((family: EditionFamilyId) => {
    cancelAutoboot();
    const current = getSelectedEdition(family);
    const currentIndex = OS_EDITIONS[family].findIndex((item) => item.id === current.id);
    setEditionIndex(Math.max(0, currentIndex));
    setEditionFamily(family);
  }, [cancelAutoboot]);

  const selectEdition = useCallback((family: EditionFamilyId, index: number) => {
    const editions = OS_EDITIONS[family];
    const selected = editions[index];
    if (!selected) return;
    setSelectedEdition(family, selected.id);
    setEditionRevision((value) => value + 1);
    setEditionFamily(null);
  }, []);

  useEffect(() => {
    if (!autobootActive || editionFamily) return;

    setCountdown(3);
    const tick2 = window.setTimeout(() => setCountdown(2), AUTOBOOT_TICK_MS);
    const tick1 = window.setTimeout(() => setCountdown(1), AUTOBOOT_TICK_MS * 2);
    const boot = window.setTimeout(() => {
      handleBoot(enabledOsBootProfiles[selectedIndex]);
    }, AUTOBOOT_TOTAL_MS);

    return () => {
      window.clearTimeout(tick2);
      window.clearTimeout(tick1);
      window.clearTimeout(boot);
    };
  }, [autobootActive, editionFamily, handleBoot, selectedIndex]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      if (editionFamily) {
        const editions = OS_EDITIONS[editionFamily];
        if (key === 'arrowup' || key === 'w') {
          event.preventDefault();
          setEditionIndex((current) => (current > 0 ? current - 1 : editions.length - 1));
        } else if (key === 'arrowdown' || key === 's') {
          event.preventDefault();
          setEditionIndex((current) => (current < editions.length - 1 ? current + 1 : 0));
        } else if (key === 'enter') {
          event.preventDefault();
          selectEdition(editionFamily, editionIndex);
        } else if (key === 'escape' || key === 'backspace') {
          event.preventDefault();
          setEditionFamily(null);
        }
        return;
      }

      if (key === 'arrowup' || key === 'w') {
        event.preventDefault();
        cancelAutoboot();
        setSelectedIndex((current) => (current > 0 ? current - 1 : enabledOsBootProfiles.length - 1));
      } else if (key === 'arrowdown' || key === 's') {
        event.preventDefault();
        cancelAutoboot();
        setSelectedIndex((current) => (current < enabledOsBootProfiles.length - 1 ? current + 1 : 0));
      } else if (key === 'e' && selectedFamily) {
        event.preventDefault();
        openEditionMenu(selectedFamily);
      } else if (key === 'enter') {
        event.preventDefault();
        cancelAutoboot();
        handleBoot(enabledOsBootProfiles[selectedIndex]);
      }
    };

    const handlePointer = () => cancelAutoboot();

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handlePointer);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handlePointer);
    };
  }, [cancelAutoboot, editionFamily, editionIndex, handleBoot, openEditionMenu, selectEdition, selectedFamily, selectedIndex]);

  const editionHint = useMemo(() => {
    if (!selectedFamily || editionFamily) return null;
    if (language === 'ru') return 'Нажмите E для выбора редакции';
    return 'Press E to choose an edition';
  }, [editionFamily, language, selectedFamily]);

  if (editionFamily) {
    const editions = OS_EDITIONS[editionFamily];
    const profileName = editionFamily === 'win7' ? 'Windows 7' : editionFamily === 'win8' ? 'Windows 8' : 'Windows 8.1';
    return (
      <div className="min-h-screen bg-black text-white font-mono p-8 flex flex-col">
        <div className="mb-8 text-gray-400">{t.title || 'GRUB Boot Loader'}</div>
        <div className="flex-1 flex flex-col justify-center max-w-3xl">
          <div className="mb-4 text-white">
            {language === 'ru' ? `Выберите редакцию ${profileName}` : `Choose ${profileName} edition`}
          </div>
          <div className="space-y-1 mb-8">
            {editions.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className={`block w-full text-left px-4 py-2 font-mono ${index === editionIndex ? 'bg-white text-black' : 'bg-black text-white hover:bg-gray-800'}`}
                onMouseEnter={() => setEditionIndex(index)}
                onClick={() => selectEdition(editionFamily, index)}
              >
                {editionLabel(item, language)}
              </button>
            ))}
          </div>
          <div className="text-gray-400 whitespace-pre-line text-sm">
            {language === 'ru'
              ? '↑↓ - выбор, Enter - применить редакцию, Esc - вернуться в GRUB'
              : '↑↓ - select, Enter - apply edition, Esc - return to GRUB'}
          </div>
        </div>
      </div>
    );
  }

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
              className={`px-4 py-2 cursor-pointer select-none ${index === selectedIndex ? 'bg-white text-black' : 'bg-black text-white hover:bg-gray-800'}`}
              onMouseEnter={() => {
                setSelectedIndex(index);
                cancelAutoboot();
              }}
              onClick={() => {
                setSelectedIndex(index);
                cancelAutoboot();
                handleBoot(profile);
              }}
              onTouchStart={(event) => {
                event.preventDefault();
                setSelectedIndex(index);
                cancelAutoboot();
                handleBoot(profile);
              }}
              style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
            >
              {getProfileLabel(profile)}
            </div>
          ))}
        </div>

        {autobootActive && (
          <div className="text-gray-400 mb-4">
            {(t.autoboot || 'Автозагрузка через {seconds} сек...').replace('{seconds}', countdown.toString())}
          </div>
        )}

        {editionHint && <div className="text-yellow-300 mb-2 text-sm">{editionHint}</div>}

        <div className="text-gray-400 whitespace-pre-line text-sm">
          {t.hint || 'Используйте стрелки ↑↓ для выбора, Enter для загрузки'}
        </div>
      </div>
    </div>
  );
}
