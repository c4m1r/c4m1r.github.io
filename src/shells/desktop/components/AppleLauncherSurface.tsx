import { useMemo, useState } from 'react';
import { useApp } from '../../../contexts/useApp';
import { getOsAppTitle } from '../../os/osSkins';

interface AppleLauncherSurfaceProps {
  onClose: () => void;
  onLaunchApp?: (appId: string) => void;
}

const APP_IDS = [
  'internet-explorer',
  'pictures',
  'control-panel',
  'notepad',
  'terminal',
  'my-cv',
  'projects-grid',
  'blog',
  'wiki',
  'about',
] as const;

const GLYPHS: Record<string, string> = {
  'internet-explorer': '◉',
  pictures: '✿',
  'control-panel': '⚙',
  notepad: '▤',
  terminal: '>_',
  'my-cv': 'CV',
  'projects-grid': '▦',
  blog: '✎',
  wiki: 'W',
  about: 'i',
};

export function AppleLauncherSurface({ onClose, onLaunchApp }: AppleLauncherSurfaceProps) {
  const { theme, language } = useApp();
  const [query, setQuery] = useState('');
  const isMac = theme === 'macos-26';

  const apps = useMemo(() => {
    return APP_IDS.map((id) => ({
      id,
      title: getOsAppTitle(id, id, theme, language),
      glyph: GLYPHS[id] ?? '•',
    })).filter((app) => app.title.toLowerCase().includes(query.trim().toLowerCase()));
  }, [language, query, theme]);

  const launch = (id: string) => {
    onLaunchApp?.(id);
    onClose();
  };

  return (
    <div
      className={isMac ? 'apple-launcher apple-launchpad' : 'apple-launcher apple-app-library'}
      role="dialog"
      aria-label={isMac ? 'Launchpad' : 'App Library'}
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      <div className="apple-launcher__scrim" onClick={onClose} />
      <div className="apple-launcher__content">
        <label className="apple-launcher__search">
          <span aria-hidden="true">⌕</span>
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={isMac ? 'Search' : 'App Library'}
            aria-label="Search apps"
          />
        </label>

        <div className="apple-launcher__grid">
          {apps.map((app) => (
            <button
              type="button"
              key={app.id}
              className="apple-launcher__app"
              onClick={() => launch(app.id)}
            >
              <span className="apple-launcher__icon" aria-hidden="true">{app.glyph}</span>
              <span className="apple-launcher__label">{app.title}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
