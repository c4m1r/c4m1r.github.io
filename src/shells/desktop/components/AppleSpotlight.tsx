import { useEffect, useMemo, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { useApp } from '../../../contexts/useApp';
import { useGlobalSearch } from '../../../domain/search/useGlobalSearch';
import { appRegistry } from '../appRegistry';
import { MACOS_APP_ICON_BY_ID } from '../appleIconAssets';
import { getOsAppTitle } from '../../os/osSkins';

interface AppleSpotlightProps {
  open: boolean;
  onClose: () => void;
  onLaunchApp: (appId: string) => void;
}

const SPOTLIGHT_APP_IDS = [
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

export function AppleSpotlight({ open, onClose, onLaunchApp }: AppleSpotlightProps) {
  const { theme, language } = useApp();
  const { query, setQuery, results, loading } = useGlobalSearch();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const apps = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle.length < 1) return [];

    return SPOTLIGHT_APP_IDS
      .map((id) => {
        const app = appRegistry[id];
        if (!app) return null;
        return {
          id,
          title: getOsAppTitle(id, app.title, theme, language),
          icon: MACOS_APP_ICON_BY_ID[id],
        };
      })
      .filter((app): app is NonNullable<typeof app> => Boolean(app))
      .filter((app) => app.title.toLowerCase().includes(needle));
  }, [language, query, theme]);

  const visibleResults = useMemo(
    () => [
      ...apps.map((app) => ({ type: 'app' as const, key: `app:${app.id}`, app })),
      ...results.slice(0, 12).map((result) => ({
        type: 'content' as const,
        key: `${result.kind}:${result.item.id}`,
        result,
      })),
    ],
    [apps, results]
  );

  useEffect(() => {
    if (!open) {
      setQuery('');
      setSelectedIndex(0);
      return;
    }
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }, [open, setQuery]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const openResult = (index: number) => {
    const entry = visibleResults[index];
    if (!entry) return;

    if (entry.type === 'app') {
      onLaunchApp(entry.app.id);
      onClose();
      return;
    }

    const target =
      entry.result.item.route?.sitePath ??
      entry.result.item.route?.path;

    if (target) {
      window.location.href = target;
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="apple-spotlight-layer" role="presentation">
      <button
        type="button"
        className="apple-spotlight__backdrop"
        aria-label="Close Spotlight"
        onClick={onClose}
      />

      <div
        className="apple-spotlight"
        role="dialog"
        aria-label="Spotlight Search"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="apple-spotlight__search">
          <Search size={24} aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                onClose();
                return;
              }
              if (event.key === 'ArrowDown') {
                event.preventDefault();
                setSelectedIndex((value) => Math.min(value + 1, Math.max(0, visibleResults.length - 1)));
                return;
              }
              if (event.key === 'ArrowUp') {
                event.preventDefault();
                setSelectedIndex((value) => Math.max(0, value - 1));
                return;
              }
              if (event.key === 'Enter') {
                event.preventDefault();
                openResult(selectedIndex);
              }
            }}
            placeholder="Spotlight Search"
            aria-label="Spotlight Search"
          />
        </div>

        {query.trim().length > 0 && (
          <div className="apple-spotlight__results">
            {loading && visibleResults.length === 0 && (
              <div className="apple-spotlight__empty">Searching…</div>
            )}

            {!loading && visibleResults.length === 0 && query.trim().length >= 2 && (
              <div className="apple-spotlight__empty">No Results</div>
            )}

            {visibleResults.map((entry, index) => {
              if (entry.type === 'app') {
                return (
                  <button
                    type="button"
                    key={entry.key}
                    className={`apple-spotlight__result ${selectedIndex === index ? 'is-selected' : ''}`}
                    onMouseEnter={() => setSelectedIndex(index)}
                    onClick={() => openResult(index)}
                  >
                    <span className="apple-spotlight__result-icon">
                      {entry.app.icon ? <img src={entry.app.icon} alt="" /> : <span>●</span>}
                    </span>
                    <span className="apple-spotlight__result-copy">
                      <strong>{entry.app.title}</strong>
                      <small>Application</small>
                    </span>
                  </button>
                );
              }

              return (
                <button
                  type="button"
                  key={entry.key}
                  className={`apple-spotlight__result ${selectedIndex === index ? 'is-selected' : ''}`}
                  onMouseEnter={() => setSelectedIndex(index)}
                  onClick={() => openResult(index)}
                >
                  <span className="apple-spotlight__result-kind">
                    {entry.result.kind.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="apple-spotlight__result-copy">
                    <strong>{entry.result.item.title}</strong>
                    <small>{entry.result.kind}</small>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
