import { startSearchText } from '../../../../i18n/startSearchStrings';
import { modernStartText } from '../../../../i18n/modernStartStrings';
import type { Language } from '../../../../i18n/translations';
import type { StartSearchHit } from '../../../../utils/fileSearch';
import { groupByLetter } from './modernStartData';
import type { Win7MenuEntry } from './startMenuWin7Lists';

/** Pieces shared by the Windows 10 and Windows 11 Start menus. Styles are in `modern-start.css`. */

export function AppRow({ entry, onActivate, onHover }: { entry: Win7MenuEntry; onActivate: (entry: Win7MenuEntry) => void; onHover?: () => void }) {
  return (
    <button type="button" className="ms-row" role="menuitem" onClick={() => onActivate(entry)} onMouseEnter={onHover}>
      <span className="ms-row__icon">{entry.icon ? <img src={entry.icon} alt="" /> : null}</span>
      <span className="ms-row__label">{entry.label}</span>
    </button>
  );
}

/** Every program, grouped under its first letter. */
export function AlphaList({ apps, onActivate, onHover }: { apps: Win7MenuEntry[]; onActivate: (entry: Win7MenuEntry) => void; onHover?: () => void }) {
  return (
    <>
      {groupByLetter(apps).map((group) => (
        <div key={group.letter} className="ms-group">
          <div className="ms-letter">{group.letter}</div>
          {group.items.map((entry) => <AppRow key={entry.id} entry={entry} onActivate={onActivate} onHover={onHover} />)}
        </div>
      ))}
    </>
  );
}

/** Search results: programs first, then files and folders. */
export function SearchResults({
  language,
  apps,
  files,
  onActivate,
  onOpenHit,
  onHover,
}: {
  language: Language;
  apps: Win7MenuEntry[];
  files: StartSearchHit[];
  onActivate: (entry: Win7MenuEntry) => void;
  onOpenHit: (hit: StartSearchHit) => void;
  onHover?: () => void;
}) {
  if (apps.length === 0 && files.length === 0) {
    return <div className="ms-empty">{startSearchText(language, 'noResults')}</div>;
  }
  return (
    <>
      {apps.length > 0 && (
        <div className="ms-group">
          <div className="ms-section">{startSearchText(language, 'programs')}</div>
          {apps.map((entry) => <AppRow key={entry.id} entry={entry} onActivate={onActivate} onHover={onHover} />)}
        </div>
      )}
      {files.length > 0 && (
        <div className="ms-group">
          <div className="ms-section">{startSearchText(language, 'files')}</div>
          {files.map((hit) => (
            <button key={hit.id} type="button" className="ms-row ms-row--file" role="menuitem" title={hit.path} onClick={() => onOpenHit(hit)} onMouseEnter={onHover}>
              <span className="ms-row__icon">{hit.icon ? <img src={hit.icon} alt="" /> : null}</span>
              <span className="ms-row__text">
                <span className="ms-row__label">{hit.name}</span>
                <span className="ms-row__sub">{hit.parentPath}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </>
  );
}

/** Small menu opened by the power and user buttons. */
export function PowerPopup({
  language,
  withShutdown,
  onCommand,
}: {
  language: Language;
  withShutdown: boolean;
  onCommand: (command: 'logoff' | 'shutdown') => void;
}) {
  return (
    <div className="ms-popup" role="menu">
      <button type="button" role="menuitem" onClick={() => onCommand('logoff')}>{modernStartText(language, 'signOut')}</button>
      {withShutdown && <button type="button" role="menuitem" onClick={() => onCommand('shutdown')}>{modernStartText(language, 'shutDown')}</button>}
    </div>
  );
}
