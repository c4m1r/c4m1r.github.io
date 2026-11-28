import { useEffect, useMemo, useState } from 'react';
import { FileText, Image as ImageIcon, Menu, Power, Search, Settings } from 'lucide-react';
import { useApp } from '../../../../contexts/useApp';
import { THEME_ASSETS } from '../../../../themes/webos/themeAssets';
import { getSessionAccount } from '../../../../domain/auth/session';
import { modernStartText } from '../../../../i18n/modernStartStrings';
import { startSearchText } from '../../../../i18n/startSearchStrings';
import { buildModernStartData, startActions, useModernSearch, type StartActionProps } from './modernStartData';
import { AlphaList, AppRow, PowerPopup, SearchResults } from './ModernStartParts';
import type { Win7MenuEntry } from './startMenuWin7Lists';
import '../../../../styles/os/themes/modern-start.css';

/**
 * Windows 10 Start menu: a narrow rail (menu, account, Documents, Pictures, Settings, Power), the
 * alphabetical app list and the tile area. Typing anywhere opens search, as in Windows 10.
 */

const LIFE_TILES = ['internet-explorer', 'outlook', 'windows-media-player', 'winamp', 'projects-grid'];
const PLAY_TILES = ['minesweeper', 'snake', 'memory', 'doom1', 'doom2', 'terminal', 'paint', 'calculator'];

export function StartMenu10(props: StartActionProps) {
  const { onClose, onSystemCommand, onLaunchApp, onHover } = props;
  const { language } = useApp();
  const isRu = language === 'ru';
  const account = getSessionAccount();
  const assets = THEME_ASSETS.win7;
  const data = useMemo(() => buildModernStartData({ isRu, language, account }), [isRu, language, account]);
  const { activate, openHit } = startActions(props);

  const [expanded, setExpanded] = useState(false);
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');
  const [popup, setPopup] = useState<'power' | 'user' | null>(null);
  const { appHits, fileHits } = useModernSearch(query, language, data.allApps, account);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (popup) setPopup(null);
        else if (searching) { setSearching(false); setQuery(''); }
        else onClose();
        return;
      }
      if (searching || event.ctrlKey || event.metaKey || event.altKey || event.key.length !== 1 || event.key === ' ') return;
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA)$/.test(target.tagName)) return;
      setSearching(true);
      setQuery(event.key);
      event.preventDefault();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [popup, searching, onClose]);

  const place = (id: string) => data.places.find((entry) => entry.id === id);
  const resolve = (ids: string[]): Win7MenuEntry[] => ids.map((id) => data.byId.get(id)).filter((entry): entry is Win7MenuEntry => Boolean(entry));
  const run = (command: 'logoff' | 'shutdown') => { onSystemCommand?.(command); onClose(); };

  const railButtons: Array<{ key: string; label: string; icon: JSX.Element; onClick: () => void }> = [
    { key: 'documents', label: modernStartText(language, 'documents'), icon: <FileText size={18} />, onClick: () => { const entry = place('documents'); if (entry) activate(entry); } },
    { key: 'pictures', label: modernStartText(language, 'pictures'), icon: <ImageIcon size={18} />, onClick: () => { const entry = place('pictures'); if (entry) activate(entry); } },
    { key: 'settings', label: modernStartText(language, 'settings'), icon: <Settings size={18} />, onClick: () => { onLaunchApp?.('control-panel'); onClose(); } },
  ];

  const renderTiles = (entries: Win7MenuEntry[]) => (
    <div className="ms-tilegrid">
      {entries.map((entry, index) => (
        <button
          key={entry.id}
          type="button"
          className={`ms-tile${index === 0 ? ' ms-tile--wide' : ''}`}
          title={entry.label}
          onClick={() => activate(entry)}
          onMouseEnter={onHover}
        >
          {entry.icon ? <img src={entry.icon} alt="" /> : null}
          <span>{entry.label}</span>
        </button>
      ))}
    </div>
  );

  return (
    <section
      className={`win10-start ms-root${expanded ? ' is-expanded' : ''}`}
      aria-label={modernStartText(language, 'start')}
      onMouseDown={(event) => { if (!(event.target as HTMLElement).closest('.ms-popup, .ms-popup-anchor')) setPopup(null); }}
    >
      <nav className="ms-rail">
        <button type="button" className="ms-rail__btn" title={modernStartText(language, 'start')} aria-expanded={expanded} onClick={() => setExpanded((open) => !open)}>
          <Menu size={18} /><span>{modernStartText(language, 'start')}</span>
        </button>
        <div className="ms-rail__bottom">
          <div className="ms-popup-anchor">
            <button type="button" className="ms-rail__btn" title={account} onClick={() => setPopup(popup === 'user' ? null : 'user')}>
              {assets.userAvatar ? <img className="ms-avatar" src={assets.userAvatar} alt="" /> : null}<span>{account}</span>
            </button>
            {popup === 'user' && <PowerPopup language={language} withShutdown={false} onCommand={run} />}
          </div>
          {railButtons.map((button) => (
            <button key={button.key} type="button" className="ms-rail__btn" title={button.label} onClick={button.onClick}>
              {button.icon}<span>{button.label}</span>
            </button>
          ))}
          <div className="ms-popup-anchor">
            <button type="button" className="ms-rail__btn" title={modernStartText(language, 'power')} onClick={() => setPopup(popup === 'power' ? null : 'power')}>
              <Power size={18} /><span>{modernStartText(language, 'power')}</span>
            </button>
            {popup === 'power' && <PowerPopup language={language} withShutdown onCommand={run} />}
          </div>
        </div>
      </nav>

      {searching ? (
        <div className="ms-searchpane">
          <div className="ms-results" role="menu">
            <SearchResults language={language} apps={appHits} files={fileHits} onActivate={activate} onOpenHit={openHit} onHover={onHover} />
          </div>
          <label className="ms-searchbar">
            <Search size={16} aria-hidden="true" />
            <input
              autoFocus
              value={query}
              onChange={(event) => { setQuery(event.currentTarget.value); if (!event.currentTarget.value) setSearching(false); }}
              placeholder={modernStartText(language, 'typeToSearch')}
              aria-label={startSearchText(language, 'findPlaceholder')}
            />
          </label>
        </div>
      ) : (
        <>
          <div className="ms-list" role="menu">
            <div className="ms-section">{modernStartText(language, 'mostUsed')}</div>
            {data.pinned.slice(0, 5).map((entry) => <AppRow key={entry.id} entry={entry} onActivate={activate} onHover={onHover} />)}
            <AlphaList apps={data.allApps} onActivate={activate} onHover={onHover} />
          </div>
          <div className="ms-tiles">
            <div className="ms-section">{modernStartText(language, 'lifeAtAGlance')}</div>
            {renderTiles(resolve(LIFE_TILES))}
            <div className="ms-section">{modernStartText(language, 'playAndExplore')}</div>
            {renderTiles(resolve(PLAY_TILES))}
          </div>
        </>
      )}
    </section>
  );
}
