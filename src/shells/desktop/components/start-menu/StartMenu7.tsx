import { useEffect, useMemo, useState } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import { useApp } from '../../../../contexts/useApp';
import { THEME_ASSETS } from '../../../../themes/webos/themeAssets';
import { getSessionAccount } from '../../../../domain/auth/session';
import { startMenuFolderNodes, startMenuProgramsPath, type StartMenuNode } from './startMenuModel';
import { buildWin7StartMenuLists, type Win7MenuEntry } from './startMenuWin7Lists';
import { useFlyoutChain } from './startMenuFlyout';
import { FlyoutPanel } from './StartMenuFlyoutPanel';
import { vistaText } from '../../../../i18n/vistaStrings';
import { startSearchText } from '../../../../i18n/startSearchStrings';
import { searchStartFiles, type StartSearchHit } from './startMenuSearch';

export interface StartMenu7Props {
  onClose: () => void;
  onLaunchApp?: (appId: string) => void;
  onOpenPath?: (path: string) => void;
  onSystemCommand?: (command: 'logoff' | 'shutdown') => void;
  onHover?: () => void;
  /** Windows Vista variant: pinned two-line entries and the Vista places column. */
  variant?: 'win7' | 'vista';
}


// The UI presents Windows 7 library names, while the shared virtual filesystem
// still stores the user's content under its historical XP-era paths. Keeping the
// adapter here preserves all existing files without duplicating or migrating data.

/** Every launchable program or folder in a list of entries, with submenus flattened. */
function flattenProgramLeaves(entries: Win7MenuEntry[]): Win7MenuEntry[] {
  return entries.flatMap((entry) => {
    if (entry.submenu) return flattenProgramLeaves(entry.submenu);
    return entry.appId || entry.path ? [entry] : [];
  });
}

export function StartMenu7({
  onClose,
  onLaunchApp,
  onOpenPath,
  onSystemCommand,
  onHover,
  variant = 'win7',
}: StartMenu7Props) {
  const { language } = useApp();
  const isRu = language === 'ru';
  const assets = THEME_ASSETS.win7;
  const [query, setQuery] = useState('');
  const [showAllPrograms, setShowAllPrograms] = useState(false);
  const isVista = variant === 'vista';
  const { programs, allPrograms, places, separatorAfter: separatorIds } = useMemo(
    () => buildWin7StartMenuLists({ isRu, language, vista: isVista, account: getSessionAccount() }),
    [isRu, language, isVista],
  );


  const renderProgramRow = (entry: Win7MenuEntry, depth: number) => (
    <button
      key={entry.id}
      type="button"
      className="win7-start-menu__program"
      onClick={() => {
        if (entry.submenu) return;
        activate(entry);
      }}
      onMouseEnter={(event) => {
        onHover?.();
        flyout.hover(depth, entry, event.currentTarget.getBoundingClientRect());
      }}
      role="menuitem"
      aria-haspopup={entry.submenu ? 'menu' : undefined}
    >
      <span className="win7-start-menu__program-icon">
        {entry.icon ? <img src={entry.icon} alt="" /> : null}
      </span>
      {entry.subtitle ? (
        <span className="flex-1 win7-start-menu__program-text">
          <strong>{entry.label}</strong>
          <small>{entry.subtitle}</small>
        </span>
      ) : (
        <span className="flex-1">{entry.label}</span>
      )}
      {entry.submenu ? <ChevronRight size={12} aria-hidden="true" /> : null}
    </button>
  );

  // User entries from Start Menu\Programs (StartUp included), shown after the built-in list.
  // A folder row opens the folder in Explorer.
  const toUserEntry = (node: StartMenuNode): Win7MenuEntry => ({
    id: `user:${node.path ?? node.appId ?? node.label}`,
    label: node.label,
    appId: node.appId,
    path: node.submenu ? undefined : node.path,
    icon: node.iconSrc ?? assets.folderIcon,
    submenu: node.submenu?.map(toUserEntry),
  });
  const userPrograms: Win7MenuEntry[] = startMenuFolderNodes(startMenuProgramsPath(getSessionAccount()), () => null)
    .map(toUserEntry);
  const flyout = useFlyoutChain<Win7MenuEntry>();
  const resetFlyout = flyout.reset;
  useEffect(() => {
    if (!showAllPrograms) resetFlyout();
  }, [showAllPrograms, resetFlyout]);
  // Search covers every program (not only the pinned list) and the files of the profile and Program Files.
  const searchText = query.trim().toLocaleLowerCase(language);
  const isSearching = searchText.length > 0;
  const searchRoots = useMemo(() => [`C:\\Documents and Settings\\${getSessionAccount()}`, 'C:\\Program Files'], []);
  const fileHits: StartSearchHit[] = useMemo(
    () => (isSearching ? searchStartFiles(query, searchRoots) : []),
    [isSearching, query, searchRoots],
  );
  const filteredPrograms = isSearching
    ? flattenProgramLeaves([...allPrograms, ...userPrograms]).filter((program) =>
      program.label.toLocaleLowerCase(language).includes(searchText),
    )
    : (showAllPrograms ? [...allPrograms, ...userPrograms] : programs);
  useEffect(() => {
    if (isSearching) resetFlyout();
  }, [isSearching, resetFlyout]);

  // Default Windows 7 right column: libraries, Games, Computer, then the system
  // entries. Separators follow the default grouping (libraries | Games | system).
  const separatorAfter = new Set(separatorIds);

  const activate = (entry: Win7MenuEntry) => {
    if (entry.disabled) return;
    if (entry.appId) onLaunchApp?.(entry.appId);
    if (entry.path) onOpenPath?.(entry.path);
    onClose();
  };

  // A file with an application opens in it; any other file opens its folder in Explorer.
  const openHit = (hit: StartSearchHit) => {
    if (hit.appId) onLaunchApp?.(hit.appId);
    else onOpenPath?.(hit.kind === 'folder' ? hit.path : hit.parentPath);
    onClose();
  };

  return (
    <section className={`win7-start-menu start-menu-modern os-panel${isVista ? ' vista-start-menu' : ''}`} aria-label={isRu ? 'Меню Пуск' : 'Start menu'}>
      <div className="win7-start-menu__glass" aria-hidden="true" />

      <div className="win7-start-menu__main">
        <div className="win7-start-menu__left">
          <div className="win7-start-menu__programs" role="menu">
            {isSearching && filteredPrograms.length > 0 && (
              <div className="px-3 pt-2 pb-1 text-[11px] font-semibold text-[#3c5a8a]">{startSearchText(language, 'programs')}</div>
            )}
            {filteredPrograms.map((entry) => renderProgramRow(entry, 0))}
            {isSearching && fileHits.length > 0 && (
              <>
                <div className="px-3 pt-2 pb-1 text-[11px] font-semibold text-[#3c5a8a]">{startSearchText(language, 'files')}</div>
                {fileHits.map((hit) => (
                  <button
                    key={hit.id}
                    type="button"
                    className="win7-start-menu__program"
                    role="menuitem"
                    title={hit.path}
                    onClick={() => openHit(hit)}
                    onMouseEnter={onHover}
                  >
                    <span className="win7-start-menu__program-icon">
                      {hit.icon ? <img src={hit.icon} alt="" /> : null}
                    </span>
                    <span className="flex-1 win7-start-menu__program-text">
                      <strong className="block truncate">{hit.name}</strong>
                      <small className="block truncate text-[11px] font-normal text-[#5a6a80]">{hit.parentPath}</small>
                    </span>
                  </button>
                ))}
              </>
            )}
            {flyout.chain.map((level, index) => (
              <FlyoutPanel
                key={index}
                level={level}
                className="win7-start-menu__flyout min-w-[220px] max-h-[60vh] overflow-y-auto border border-[#7f9db9] bg-white py-1 text-[#111] shadow-xl"
              >
                {level.items.map((entry) => renderProgramRow(entry as Win7MenuEntry, index + 1))}
              </FlyoutPanel>
            ))}
            {filteredPrograms.length === 0 && fileHits.length === 0 && (
              <div className="win7-start-menu__empty">
                {isSearching ? startSearchText(language, 'noResults') : (isRu ? 'Программы не найдены' : 'No programs found')}
              </div>
            )}
          </div>

          <button
            type="button"
            className="win7-start-menu__all-programs"
            aria-expanded={showAllPrograms}
            onClick={() => setShowAllPrograms((open) => !open)}
            onMouseEnter={onHover}
          >
            <ChevronRight size={13} aria-hidden="true" />
            <span>{showAllPrograms ? (isRu ? 'Назад' : 'Back') : (isRu ? 'Все программы' : 'All Programs')}</span>
          </button>

          <label className="win7-start-menu__search">
            <input
              value={query}
              onChange={(event) => setQuery(event.currentTarget.value)}
              placeholder={isVista ? vistaText(language, 'startSearch') : (isRu ? 'Найти программы и файлы' : 'Search programs and files')}
              aria-label={isRu ? 'Поиск программ и файлов' : 'Search programs and files'}
            />
            <Search size={15} aria-hidden="true" />
          </label>
        </div>

        <aside className="win7-start-menu__right">
          <div className="win7-start-menu__user-frame">
            {assets.userAvatar ? <img src={assets.userAvatar} alt="" /> : null}
          </div>
          <div className="win7-start-menu__username">
            {getSessionAccount()}
          </div>

          <div className="win7-start-menu__places" role="menu">
            {places.map((entry, index) => (
              <button
                key={entry.id}
                type="button"
                className={`win7-start-menu__place ${entry.disabled ? 'is-disabled' : ''} ${separatorAfter.has(places[index - 1]?.id ?? '') ? 'has-separator' : ''}`}
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