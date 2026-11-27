import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Power, Search } from 'lucide-react';
import { useApp } from '../../../../contexts/useApp';
import { THEME_ASSETS } from '../../../../themes/webos/themeAssets';
import { getSessionAccount } from '../../../../domain/auth/session';
import { win8Text } from '../../../../i18n/win8Strings';
import { startMenuFolderNodes, startMenuProgramsPath, type StartMenuNode } from './startMenuModel';
import { buildWin7StartMenuLists, type Win7MenuEntry } from './startMenuWin7Lists';
import '../../../../styles/os/themes/win8-start-screen.css';

export interface StartScreen8Props {
  onClose: () => void;
  onLaunchApp?: (appId: string) => void;
  onOpenPath?: (path: string) => void;
  onSystemCommand?: (command: 'logoff' | 'shutdown') => void;
  onHover?: () => void;
}

// Windows 8 tile colours, cycled over the pinned tiles.
const TILE_COLOURS = ['#00aba9', '#a200ff', '#00a300', '#e51400', '#f09609', '#2d89ef', '#603cba', '#da532c', '#1ba1e2'];

// Leaves of a menu tree: submenus are flattened so the all-apps page lists every program.
function flattenEntries(entries: Win7MenuEntry[]): Win7MenuEntry[] {
  return entries.flatMap((entry) => (entry.submenu ? flattenEntries(entry.submenu) : [entry]));
}

/**
 * Windows 8 Start screen. It takes the place of the Start menu: the pinned programs become tiles, the places
 * become wide tiles, and "All apps" lists every program. It uses the same entries and actions as the Start menu.
 */
export function StartScreen8({ onClose, onLaunchApp, onOpenPath, onSystemCommand, onHover }: StartScreen8Props) {
  const { language } = useApp();
  const isRu = language === 'ru';
  const account = getSessionAccount();
  const assets = THEME_ASSETS.win7;
  const [query, setQuery] = useState('');
  const [showAllApps, setShowAllApps] = useState(false);

  const { programs, allPrograms, places } = useMemo(
    () => buildWin7StartMenuLists({ isRu, language, vista: false, account }),
    [isRu, language, account],
  );

  // User entries from Start Menu\Programs, shown after the built-in list on the all-apps page.
  const toUserEntry = (node: StartMenuNode): Win7MenuEntry => ({
    id: `user:${node.path ?? node.appId ?? node.label}`,
    label: node.label,
    appId: node.appId,
    path: node.submenu ? undefined : node.path,
    icon: node.iconSrc ?? assets.folderIcon,
    submenu: node.submenu?.map(toUserEntry),
  });
  const userPrograms: Win7MenuEntry[] = startMenuFolderNodes(startMenuProgramsPath(account), () => null).map(toUserEntry);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const needle = query.trim().toLocaleLowerCase(language);
  const matches = (entry: { label: string }) => entry.label.toLocaleLowerCase(language).includes(needle);

  const tiles = programs.filter(matches);
  const placeTiles = places.filter((entry) => !entry.disabled && matches(entry));
  const appEntries = flattenEntries([...allPrograms, ...userPrograms]).filter(matches);
  const showDesktopTile = needle === '' || matches({ label: win8Text(language, 'desktop') });

  const activate = (entry: Win7MenuEntry) => {
    if (entry.disabled) return;
    if (entry.appId) onLaunchApp?.(entry.appId);
    if (entry.path) onOpenPath?.(entry.path);
    onClose();
  };

  const renderIcon = (src?: string) => (src ? <img src={src} alt="" /> : null);

  return (
    <section className="win8-start" aria-label={win8Text(language, 'start')}>
      <header className="win8-start__header">
        <h1 className="win8-start__title">{win8Text(language, 'start')}</h1>
        <label className="win8-start__search">
          <Search size={16} aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder={win8Text(language, 'search')}
            aria-label={win8Text(language, 'search')}
          />
        </label>
        <button
          type="button"
          className="win8-start__user"
          title={win8Text(language, 'logOff')}
          aria-label={win8Text(language, 'logOff')}
          onClick={() => {
            onSystemCommand?.('logoff');
            onClose();
          }}
        >
          <span>{account}</span>
          {renderIcon(assets.userAvatar)}
        </button>
        <button
          type="button"
          className="win8-start__power"
          title={win8Text(language, 'shutDown')}
          aria-label={win8Text(language, 'shutDown')}
          onClick={() => {
            onSystemCommand?.('shutdown');
            onClose();
          }}
        >
          <Power size={18} aria-hidden="true" />
        </button>
      </header>

      {showAllApps ? (
        <>
          <div className="win8-start__apps" role="menu">
            {appEntries.map((entry) => (
              <button
                key={entry.id}
                type="button"
                className="win8-start__row"
                role="menuitem"
                onClick={() => activate(entry)}
                onMouseEnter={onHover}
              >
                {renderIcon(entry.icon)}
                <span>{entry.label}</span>
              </button>
            ))}
          </div>
          {appEntries.length === 0 && <div className="win8-start__empty">{win8Text(language, 'noResults')}</div>}
          <button type="button" className="win8-start__toggle" onClick={() => setShowAllApps(false)}>
            <ChevronDown size={16} aria-hidden="true" style={{ transform: 'rotate(90deg)' }} />
            <span>{win8Text(language, 'back')}</span>
          </button>
        </>
      ) : (
        <>
          <div className="win8-start__tiles" role="menu">
            {showDesktopTile && (
              <button
                type="button"
                className="win8-start__tile win8-start__tile--wide win8-start__tile--wallpaper"
                style={{ background: '#2d89ef' }}
                onClick={onClose}
                onMouseEnter={onHover}
                role="menuitem"
              >
                {THEME_ASSETS.win8.wallpaper ? <img src={THEME_ASSETS.win8.wallpaper} alt="" /> : null}
                <span>{win8Text(language, 'desktop')}</span>
              </button>
            )}
            {tiles.map((entry, index) => (
              <button
                key={entry.id}
                type="button"
                className="win8-start__tile"
                style={{ background: TILE_COLOURS[index % TILE_COLOURS.length] }}
                onClick={() => activate(entry)}
                onMouseEnter={onHover}
                role="menuitem"
              >
                {renderIcon(entry.icon)}
                <span>{entry.label}</span>
              </button>
            ))}
            {placeTiles.map((entry, index) => (
              <button
                key={entry.id}
                type="button"
                className="win8-start__tile win8-start__tile--wide"
                style={{ background: TILE_COLOURS[(tiles.length + index) % TILE_COLOURS.length] }}
                onClick={() => activate(entry)}
                onMouseEnter={onHover}
                role="menuitem"
              >
                {renderIcon(entry.icon)}
                <span>{entry.label}</span>
              </button>
            ))}
          </div>
          {tiles.length === 0 && placeTiles.length === 0 && !showDesktopTile && (
            <div className="win8-start__empty">{win8Text(language, 'noResults')}</div>
          )}
          <button type="button" className="win8-start__toggle" onClick={() => setShowAllApps(true)}>
            <ChevronDown size={16} aria-hidden="true" />
            <span>{win8Text(language, 'allApps')}</span>
          </button>
        </>
      )}
    </section>
  );
}
