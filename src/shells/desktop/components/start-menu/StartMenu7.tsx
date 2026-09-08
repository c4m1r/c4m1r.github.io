import { useMemo, useState } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import { useApp } from '../../../../contexts/useApp';
import { appRegistry } from '../../appRegistry';
import { THEME_ASSETS } from '../../../../themes/webos/themeAssets';

export interface StartMenu7Props {
  onClose: () => void;
  onLaunchApp?: (appId: string) => void;
  onOpenPath?: (path: string) => void;
  onSystemCommand?: (command: 'logoff' | 'shutdown') => void;
  onHover?: () => void;
}

type Win7MenuEntry = {
  id: string;
  label: string;
  appId?: string;
  path?: string;
  icon?: string;
  disabled?: boolean;
};

// The UI presents Windows 7 library names, while the shared virtual filesystem
// still stores the user's content under its historical XP-era paths. Keeping the
// adapter here preserves all existing files without duplicating or migrating data.
const DOCUMENTS_PATH = 'C:\\Documents and Settings\\C4m1r\\My Documents';
const PICTURES_PATH = 'C:\\Documents and Settings\\C4m1r\\My Documents\\My Pictures';
const MUSIC_PATH = 'C:\\Documents and Settings\\C4m1r\\My Documents\\My Music';

export function StartMenu7({
  onClose,
  onLaunchApp,
  onOpenPath,
  onSystemCommand,
  onHover,
}: StartMenu7Props) {
  const { language } = useApp();
  const isRu = language === 'ru';
  const assets = THEME_ASSETS.win7;
  const [query, setQuery] = useState('');

  const programs: Win7MenuEntry[] = useMemo(() => [
    {
      id: 'internet-explorer',
      label: appRegistry['internet-explorer']?.title[language] ?? 'Internet Explorer',
      appId: 'internet-explorer',
      icon: assets.internetExplorerIcon,
    },
    {
      id: 'outlook',
      label: appRegistry.outlook?.title[language] ?? 'Outlook Express',
      appId: 'outlook',
      icon: assets.mailIcon,
    },
    {
      id: 'windows-media-player',
      label: appRegistry['windows-media-player']?.title[language] ?? 'Windows Media Player',
      appId: 'windows-media-player',
      icon: assets.mediaPlayerIcon,
    },
    {
      id: 'winamp',
      label: 'Winamp',
      appId: 'winamp',
      icon: assets.winampIcon,
    },
    {
      id: 'projects-grid',
      label: appRegistry['projects-grid']?.title[language] ?? (isRu ? 'Мои проекты' : 'My Projects'),
      appId: 'projects-grid',
      icon: assets.projectsIcon,
    },
    {
      id: 'paint',
      label: appRegistry.paint?.title[language] ?? 'Paint',
      appId: 'paint',
      icon: assets.paintIcon,
    },
    {
      id: 'calculator',
      label: appRegistry.calculator?.title[language] ?? (isRu ? 'Калькулятор' : 'Calculator'),
      appId: 'calculator',
      icon: assets.calculatorIcon,
    },
    {
      id: 'notepad',
      label: appRegistry.notepad?.title[language] ?? (isRu ? 'Блокнот' : 'Notepad'),
      appId: 'notepad',
      icon: assets.notepadIcon,
    },
  ], [assets, isRu, language]);

  const filteredPrograms = programs.filter((program) =>
    program.label.toLocaleLowerCase(language).includes(query.trim().toLocaleLowerCase(language)),
  );

  const places: Win7MenuEntry[] = [
    {
      id: 'documents',
      label: isRu ? 'Документы' : 'Documents',
      path: DOCUMENTS_PATH,
      icon: assets.placesIcons.myDocuments ?? assets.folderIcon,
    },
    {
      id: 'pictures',
      label: isRu ? 'Изображения' : 'Pictures',
      path: PICTURES_PATH,
      icon: assets.placesIcons.myPictures ?? assets.folderIcon,
    },
    {
      id: 'music',
      label: isRu ? 'Музыка' : 'Music',
      path: MUSIC_PATH,
      icon: assets.placesIcons.myMusic ?? assets.folderIcon,
    },
    {
      id: 'computer',
      label: isRu ? 'Компьютер' : 'Computer',
      appId: 'my-computer',
      icon: assets.computerIcon,
    },
    {
      id: 'control-panel',
      label: isRu ? 'Панель управления' : 'Control Panel',
      appId: 'control-panel',
      icon: assets.controlPanelIcon,
    },
    {
      id: 'default-programs',
      label: isRu ? 'Программы по умолчанию' : 'Default Programs',
      disabled: true,
    },
    {
      id: 'help',
      label: isRu ? 'Справка и поддержка' : 'Help and Support',
      disabled: true,
    },
  ];

  const activate = (entry: Win7MenuEntry) => {
    if (entry.disabled) return;
    if (entry.appId) onLaunchApp?.(entry.appId);
    if (entry.path) onOpenPath?.(entry.path);
    onClose();
  };

  return (
    <section className="win7-start-menu start-menu-modern os-panel" aria-label={isRu ? 'Меню Пуск' : 'Start menu'}>
      <div className="win7-start-menu__glass" aria-hidden="true" />

      <div className="win7-start-menu__main">
        <div className="win7-start-menu__left">
          <div className="win7-start-menu__programs" role="menu">
            {filteredPrograms.map((entry) => (
              <button
                key={entry.id}
                type="button"
                className="win7-start-menu__program"
                onClick={() => activate(entry)}
                onMouseEnter={onHover}
                role="menuitem"
              >
                <span className="win7-start-menu__program-icon">
                  {entry.icon ? <img src={entry.icon} alt="" /> : null}
                </span>
                <span>{entry.label}</span>
              </button>
            ))}
            {filteredPrograms.length === 0 && (
              <div className="win7-start-menu__empty">
                {isRu ? 'Программы не найдены' : 'No programs found'}
              </div>
            )}
          </div>

          <button
            type="button"
            className="win7-start-menu__all-programs"
            onClick={() => {
              onLaunchApp?.('all-programs');
              onClose();
            }}
            onMouseEnter={onHover}
          >
            <ChevronRight size={13} aria-hidden="true" />
            <span>{isRu ? 'Все программы' : 'All Programs'}</span>
          </button>

          <label className="win7-start-menu__search">
            <input
              value={query}
              onChange={(event) => setQuery(event.currentTarget.value)}
              placeholder={isRu ? 'Найти программы и файлы' : 'Search programs and files'}
              aria-label={isRu ? 'Поиск программ и файлов' : 'Search programs and files'}
            />
            <Search size={15} aria-hidden="true" />
          </label>
        </div>

        <aside className="win7-start-menu__right">
          <div className="win7-start-menu__user-frame">
            {assets.userAvatar ? <img src={assets.userAvatar} alt="" /> : null}
          </div>
          <div className="win7-start-menu__username">C4m1r</div>

          <div className="win7-start-menu__places" role="menu">
            {places.map((entry, index) => (
              <button
                key={entry.id}
                type="button"
                className={`win7-start-menu__place ${entry.disabled ? 'is-disabled' : ''} ${index === 3 || index === 4 ? 'has-separator' : ''}`}
                onClick={() => activate(entry)}
                onMouseEnter={entry.disabled ? undefined : onHover}
                disabled={entry.disabled}
                role="menuitem"
              >
                {entry.icon ? <img src={entry.icon} alt="" /> : null}
                <span>{entry.label}</span>
              </button>
            ))}
          </div>
        </aside>
      </div>

      <footer className="win7-start-menu__footer">
        <button
          type="button"
          className="win7-start-menu__shutdown"
          onClick={() => {
            onSystemCommand?.('shutdown');
            onClose();
          }}
        >
          {isRu ? 'Завершение работы' : 'Shut down'}
        </button>
        <button
          type="button"
          className="win7-start-menu__shutdown-arrow"
          title={isRu ? 'Выйти из системы' : 'Log off'}
          aria-label={isRu ? 'Выйти из системы' : 'Log off'}
          onClick={() => {
            onSystemCommand?.('logoff');
            onClose();
          }}
        >
          ▸
        </button>
      </footer>
    </section>
  );
}
