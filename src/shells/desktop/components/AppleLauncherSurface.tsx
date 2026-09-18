import { useMemo, useState } from 'react';
import { useApp } from '../../../contexts/useApp';
import { getOsAppTitle } from '../../os/osSkins';
import { type Language } from '../../../i18n/translations';
import { MACOS_APP_ICON_BY_ID } from '../appleIconAssets';

interface AppleLauncherSurfaceProps {
  onClose: () => void;
  onLaunchApp?: (appId: string) => void;
}

const APP_IDS = [
  'internet-explorer',
  'outlook',
  'windows-media-player',
  'pictures',
  'calendar',
  'calculator',
  'control-panel',
  'notepad',
  'terminal',
  'my-cv',
  'projects-grid',
  'blog',
  'wiki',
  'about',
] as const;

const localizedTitle = (en: string, ru: string): Record<Language, string> => ({
  en,
  ru,
  fr: en,
  es: en,
  zh: en,
  ja: en,
  ko: en,
});

const DEFAULT_TITLES: Record<(typeof APP_IDS)[number], Record<Language, string>> = {
  'internet-explorer': localizedTitle('Safari', 'Safari'),
  outlook: localizedTitle('Mail', 'Почта'),
  'windows-media-player': localizedTitle('Music', 'Музыка'),
  pictures: localizedTitle('Photos', 'Фото'),
  calendar: localizedTitle('Calendar', 'Календарь'),
  calculator: localizedTitle('Calculator', 'Калькулятор'),
  'control-panel': localizedTitle('Settings', 'Настройки'),
  notepad: localizedTitle('Notes', 'Заметки'),
  terminal: localizedTitle('Terminal', 'Терминал'),
  'my-cv': localizedTitle('My CV', 'Моё резюме'),
  'projects-grid': localizedTitle('Projects', 'Проекты'),
  blog: localizedTitle('Blog', 'Блог'),
  wiki: localizedTitle('Wiki', 'Wiki'),
  about: localizedTitle('About', 'Обо мне'),
};

const GLYPHS: Record<string, string> = {
  'internet-explorer': '◉',
  outlook: '✉',
  'windows-media-player': '♪',
  pictures: '✿',
  calendar: '17',
  calculator: '＋',
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
      title: getOsAppTitle(id, DEFAULT_TITLES[id], theme, language),
      glyph: GLYPHS[id] ?? '•',
      icon: isMac ? MACOS_APP_ICON_BY_ID[id] : undefined,
    })).filter((app) => app.title.toLowerCase().includes(query.trim().toLowerCase()));
  }, [isMac, language, query, theme]);

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
              <span className="apple-launcher__icon" aria-hidden="true">
                {app.icon ? <img src={app.icon} alt="" draggable={false} /> : app.glyph}
              </span>
              <span className="apple-launcher__label">{app.title}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
