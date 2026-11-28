import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Power, Search } from 'lucide-react';
import { useApp } from '../../../../contexts/useApp';
import { THEME_ASSETS } from '../../../../themes/webos/themeAssets';
import { getSessionAccount } from '../../../../domain/auth/session';
import { modernStartText } from '../../../../i18n/modernStartStrings';
import { buildModernStartData, startActions, useModernSearch, type StartActionProps } from './modernStartData';
import { AlphaList, PowerPopup, SearchResults } from './ModernStartParts';
import type { Win7MenuEntry } from './startMenuWin7Lists';
import '../../../../styles/os/themes/modern-start.css';

/**
 * Windows 11 Start menu: search box on top, a grid of pinned apps, the Recommended list and the
 * account and power bar. "All apps" swaps the grid for the alphabetical list.
 */

const PINNED_EXTRA = ['minesweeper', 'snake', 'memory', 'doom1', 'doom2', 'terminal', 'calendar', 'wiki'];
const RECOMMENDED_PLACES = ['documents', 'pictures', 'music'];
const RECOMMENDED_APPS = ['help', 'alarm', 'task-manager'];

export function StartMenu11(props: StartActionProps) {
  const { onClose, onSystemCommand, onHover } = props;
  const { language } = useApp();
  const isRu = language === 'ru';
  const account = getSessionAccount();
  const assets = THEME_ASSETS.win7;
  const data = useMemo(() => buildModernStartData({ isRu, language, account }), [isRu, language, account]);
  const { activate, openHit } = startActions(props);

  const [query, setQuery] = useState('');
  const [view, setView] = useState<'start' | 'all'>('start');
  const [powerOpen, setPowerOpen] = useState(false);
  const { appHits, fileHits } = useModernSearch(query, language, data.allApps, account);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (powerOpen) setPowerOpen(false);
      else if (query) setQuery('');
      else if (view === 'all') setView('start');
      else onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [powerOpen, query, view, onClose]);

  const pinned: Win7MenuEntry[] = useMemo(() => {
    const seen = new Set<string>();
    return [...data.pinned, ...PINNED_EXTRA.map((id) => data.byId.get(id))]
      .filter((entry): entry is Win7MenuEntry => Boolean(entry))
      .filter((entry) => (seen.has(entry.id) ? false : (seen.add(entry.id), true)))
      .slice(0, 18);
  }, [data]);

  const recommended = useMemo(() => {
    const folders = RECOMMENDED_PLACES.map((id) => data.places.find((entry) => entry.id === id)).filter((entry): entry is Win7MenuEntry => Boolean(entry))
      .map((entry) => ({ entry, sub: modernStartText(language, 'folder') }));
    const apps = RECOMMENDED_APPS.map((id) => data.byId.get(id)).filter((entry): entry is Win7MenuEntry => Boolean(entry))
      .map((entry) => ({ entry, sub: modernStartText(language, 'recentlyAdded') }));
    return [...folders, ...apps].slice(0, 6);
  }, [data, language]);

  const run = (command: 'logoff' | 'shutdown') => { onSystemCommand?.(command); onClose(); };
  const searching = query.trim().length > 0;

  return (
    <section
      className="win11-start ms-root"
      aria-label={modernStartText(language, 'start')}
      onMouseDown={(event) => { if (!(event.target as HTMLElement).closest('.ms-popup, .ms-popup-anchor')) setPowerOpen(false); }}
    >
      <label className="ms-search11">
        <Search size={16} aria-hidden="true" />
        <input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
          placeholder={modernStartText(language, 'typeToSearch')}
          aria-label={modernStartText(language, 'typeToSearch')}
        />
      </label>

      <div className="ms-body">
        {searching ? (
          <div className="ms-results" role="menu">
            <SearchResults language={language} apps={appHits} files={fileHits} onActivate={activate} onOpenHit={openHit} onHover={onHover} />
          </div>
        ) : view === 'all' ? (
          <>
            <div className="ms-head">
              <button type="button" className="ms-pill" onClick={() => setView('start')}><ChevronLeft size={14} />{modernStartText(language, 'back')}</button>
              <strong>{modernStartText(language, 'allApps')}</strong>
            </div>
            <div className="ms-alllist" role="menu">
              <AlphaList apps={data.allApps} onActivate={activate} onHover={onHover} />
            </div>
          </>
        ) : (
          <>
            <div className="ms-head">
              <strong>{modernStartText(language, 'pinned')}</strong>
              <button type="button" className="ms-pill" onClick={() => setView('all')}>{modernStartText(language, 'allApps')}<ChevronRight size={14} /></button>
            </div>
            <div className="ms-pingrid" role="menu">
              {pinned.map((entry) => (
                <button key={entry.id} type="button" className="ms-pin" role="menuitem" onClick={() => activate(entry)} onMouseEnter={onHover}>
                  {entry.icon ? <img src={entry.icon} alt="" /> : null}
                  <span>{entry.label}</span>
                </button>
              ))}
            </div>
            <div className="ms-head"><strong>{modernStartText(language, 'recommended')}</strong></div>
            <div className="ms-reco" role="menu">
              {recommended.map(({ entry, sub }) => (
                <button key={entry.id} type="button" className="ms-row ms-row--reco" role="menuitem" onClick={() => activate(entry)} onMouseEnter={onHover}>
                  <span className="ms-row__icon">{entry.icon ? <img src={entry.icon} alt="" /> : null}</span>
                  <span className="ms-row__text">
                    <span className="ms-row__label">{entry.label}</span>
                    <span className="ms-row__sub">{sub}</span>
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <footer className="ms-foot">
        <button type="button" className="ms-user" title={account} onClick={() => run('logoff')}>
          {assets.userAvatar ? <img className="ms-avatar" src={assets.userAvatar} alt="" /> : null}
          <span>{account}</span>
        </button>
        <div className="ms-popup-anchor">
          <button type="button" className="ms-power" title={modernStartText(language, 'power')} aria-label={modernStartText(language, 'power')} onClick={() => setPowerOpen((open) => !open)}>
            <Power size={16} />
          </button>
          {powerOpen && <PowerPopup language={language} withShutdown onCommand={run} />}
        </div>
      </footer>
    </section>
  );
}
