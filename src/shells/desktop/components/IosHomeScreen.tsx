import { useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import { Search } from 'lucide-react';
import { type ThemeId } from '../../../contexts/appContextTypes';
import { type DesktopIcon } from '../desktopTypes';
import { getIosIconMap } from '../appleIconAssets';
import { useDeviceBattery } from '../hooks/useDeviceBattery';

interface IosHomeScreenProps {
  theme: ThemeId;
  desktopIcons: DesktopIcon[];
  selectedIcons: string[];
  onIconDoubleClick: (icon: DesktopIcon) => void;
  onIconContextMenu: (e: MouseEvent, icon: DesktopIcon) => void;
}

const LEGACY_PAGE_SIZE = 20;
const MODERN_PAGE_SIZE = 12;

function chunkIcons(items: DesktopIcon[], size: number): DesktopIcon[][] {
  const pages: DesktopIcon[][] = [];
  for (let index = 0; index < items.length; index += size) {
    pages.push(items.slice(index, index + size));
  }
  return pages.length ? pages : [[]];
}

export function IosHomeScreen({
  theme,
  desktopIcons,
  selectedIcons,
  onIconDoubleClick,
  onIconContextMenu,
}: IosHomeScreenProps) {
  const modernHome = theme === 'ios-16' || theme === 'ios-26';
  const [hiddenHomeIconIds, setHiddenHomeIconIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem('ios-hidden-home-icons');
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.filter((value) => typeof value === 'string') : [];
    } catch {
      return [];
    }
  });
  const homeDesktopIcons = useMemo(
    () => desktopIcons.filter((icon) => !hiddenHomeIconIds.includes(icon.id)),
    [desktopIcons, hiddenHomeIconIds]
  );
  const pageSize = modernHome ? MODERN_PAGE_SIZE : LEGACY_PAGE_SIZE;
  const homePages = useMemo(() => chunkIcons(homeDesktopIcons, pageSize), [homeDesktopIcons, pageSize]);
  const showAppLibrary = modernHome;
  const iconMap = getIosIconMap(theme);
  const totalPages = homePages.length + (showAppLibrary ? 1 : 0);
  const appLibraryPage = showAppLibrary ? totalPages - 1 : -1;
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef<number | null>(null);
  const pointerIdRef = useRef<number | null>(null);
  const suppressClickRef = useRef(false);
  const editLongPressRef = useRef<number | null>(null);
  const editPressStartRef = useRef<{ x: number; y: number } | null>(null);


  useEffect(() => {
    const enterEditMode = () => {
      setIsSearchOpen(false);
      setEditMode(true);
    };

    window.addEventListener('ios-home-edit', enterEditMode);
    return () => window.removeEventListener('ios-home-edit', enterEditMode);
  }, []);

  useEffect(() => {
    const removeFromHome = (event: Event) => {
      const customEvent = event as CustomEvent<{ iconId?: string }>;
      const iconId = customEvent.detail?.iconId;
      if (!iconId) return;

      setHiddenHomeIconIds((current) => {
        if (current.includes(iconId)) return current;
        const next = [...current, iconId];
        localStorage.setItem('ios-hidden-home-icons', JSON.stringify(next));
        return next;
      });
      setEditMode(false);
    };

    window.addEventListener('ios-home-remove', removeFromHome);
    return () => window.removeEventListener('ios-home-remove', removeFromHome);
  }, []);

  useEffect(() => {
    const resetHomeLayout = () => {
      setHiddenHomeIconIds([]);
      setPage(0);
      setEditMode(false);
    };

    window.addEventListener('ios-home-layout-reset', resetHomeLayout);
    return () => window.removeEventListener('ios-home-layout-reset', resetHomeLayout);
  }, []);





  useEffect(() => {
    if (!modernHome) return;
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, [modernHome]);

  const { level: batteryLevel, charging: batteryCharging } = useDeviceBattery(modernHome);

  const calendarIcon = desktopIcons.find((icon) => icon.id === 'calendar');

  const filteredApps = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return desktopIcons;
    return desktopIcons.filter((icon) => icon.label.toLowerCase().includes(normalized));
  }, [desktopIcons, query]);

  const spotlightApps = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    if (!normalized) return desktopIcons.slice(0, 8);
    return desktopIcons
      .filter((icon) => icon.label.toLowerCase().includes(normalized))
      .slice(0, 20);
  }, [desktopIcons, searchQuery]);

  const clampPage = (value: number) => Math.max(0, Math.min(totalPages - 1, value));

  const finishSwipe = (deltaX: number) => {
    const threshold = Math.min(90, Math.max(42, window.innerWidth * 0.12));
    const didSwipe = Math.abs(deltaX) >= threshold;
    if (didSwipe) {
      suppressClickRef.current = true;
      setPage((current) => clampPage(current + (deltaX < 0 ? 1 : -1)));
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 80);
    }
    startXRef.current = null;
    pointerIdRef.current = null;
    setDragOffset(0);
    setIsDragging(false);
  };

  const launchIcon = (event: MouseEvent<HTMLButtonElement>, icon: DesktopIcon) => {
    event.stopPropagation();
    if (suppressClickRef.current || editMode) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const shell = event.currentTarget.closest('.os-ios') as HTMLElement | null;
    if (shell) {
      shell.style.setProperty('--ios-launch-x', `${rect.left + rect.width / 2}px`);
      shell.style.setProperty('--ios-launch-y', `${rect.top + rect.height / 2}px`);
      shell.style.setProperty('--ios-launch-size', `${Math.max(rect.width, rect.height)}px`);
    }

    onIconDoubleClick(icon);
  };

  const renderIcon = (icon: DesktopIcon, compact = false) => {
    const selected = selectedIcons.includes(icon.id);
    return (
      <button
        key={icon.id}
        type="button"
        className={`ios-home-icon ${compact ? 'ios-app-library__app' : ''} ${selected ? 'is-selected' : ''} ${editMode && !compact ? 'is-editing' : ''}`}
        onClick={(event) => launchIcon(event, icon)}
        onContextMenu={(event) => onIconContextMenu(event, icon)}
      >
        {editMode && !compact && (
          <span className="ios-home-icon__remove" aria-hidden="true">−</span>
        )}
        <span className="ios-home-icon__glyph">
          {iconMap[icon.id]
            ? <img src={iconMap[icon.id]} alt="" draggable={false} />
            : icon.icon}
        </span>
        <span className="ios-home-icon__label">{icon.label}</span>
      </button>
    );
  };

  return (
    <div
      className={`ios-home-screen ${editMode ? 'is-editing' : ''}`}
      data-page={page}
      data-app-library={page === appLibraryPage ? 'true' : 'false'}
      data-dragging={isDragging ? 'true' : 'false'}
    >
      {editMode && (
        <button
          type="button"
          className="ios-home-edit-done"
          onClick={(event) => {
            event.stopPropagation();
            setEditMode(false);
          }}
        >
          Done
        </button>
      )}
      <div
        className="ios-home-screen__viewport"
        onPointerDown={(event) => {
          if (event.pointerType === 'mouse' && event.button !== 0) return;
          startXRef.current = event.clientX;
          pointerIdRef.current = event.pointerId;
          setIsDragging(true);
          event.currentTarget.setPointerCapture?.(event.pointerId);

          const target = event.target as HTMLElement;
          const interactive = target.closest(
            '.ios-home-icon, .ios-home-widget, .ios-home-search-pill, .ios-app-library__search, .ios-home-edit-done, input, button'
          );
          if (!interactive && !editMode) {
            editPressStartRef.current = { x: event.clientX, y: event.clientY };
            editLongPressRef.current = window.setTimeout(() => {
              editLongPressRef.current = null;
              suppressClickRef.current = true;
              setIsSearchOpen(false);
              setEditMode(true);
              window.setTimeout(() => {
                suppressClickRef.current = false;
              }, 90);
            }, 650);
          }
        }}
        onPointerMove={(event) => {
          if (startXRef.current === null || pointerIdRef.current !== event.pointerId) return;
          setDragOffset(event.clientX - startXRef.current);

          const pressStart = editPressStartRef.current;
          if (
            pressStart &&
            (Math.abs(event.clientX - pressStart.x) > 8 || Math.abs(event.clientY - pressStart.y) > 8)
          ) {
            if (editLongPressRef.current !== null) {
              window.clearTimeout(editLongPressRef.current);
              editLongPressRef.current = null;
            }
            editPressStartRef.current = null;
          }
        }}
        onPointerUp={(event) => {
          if (editLongPressRef.current !== null) {
            window.clearTimeout(editLongPressRef.current);
            editLongPressRef.current = null;
          }
          editPressStartRef.current = null;
          if (startXRef.current === null || pointerIdRef.current !== event.pointerId) return;
          finishSwipe(event.clientX - startXRef.current);
        }}
        onPointerCancel={() => {
          if (editLongPressRef.current !== null) {
            window.clearTimeout(editLongPressRef.current);
            editLongPressRef.current = null;
          }
          editPressStartRef.current = null;
          startXRef.current = null;
          pointerIdRef.current = null;
          setDragOffset(0);
          setIsDragging(false);
        }}
      >
        <div
          className="ios-home-screen__track"
          style={{
            width: `${totalPages * 100}%`,
            transform: `translateX(calc(${(-page * 100) / totalPages}% + ${dragOffset}px))`,
          }}
        >
          {homePages.map((icons, pageIndex) => (
            <div
              key={pageIndex}
              className={`ios-home-screen__page ${modernHome ? 'ios-home-screen__page--modern' : ''}`}
              style={{ width: `${100 / totalPages}%` }}
              aria-hidden={pageIndex !== page}
            >
              {modernHome && pageIndex === 0 && (
                <div className="ios-home-widgets">
                  <div className="ios-home-widget ios-home-widget--clock">
                    <small>{now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</small>
                    <strong>{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                  </div>

                  <div className="ios-home-widget ios-home-widget--battery">
                    <div className="ios-home-widget__eyebrow">Batteries</div>
                    <div className="ios-home-widget__battery-ring" style={{ '--battery-level': batteryLevel ?? 88 } as CSSProperties}>
                      <span>{batteryLevel ?? 88}%</span>
                    </div>
                    <small>{batteryCharging ? 'Charging' : batteryLevel === null ? 'Estimated' : 'This device'}</small>
                  </div>

                  <button
                    type="button"
                    className="ios-home-widget ios-home-widget--calendar"
                    onClick={(event) => {
                      event.stopPropagation();
                      if (calendarIcon) launchIcon(event, calendarIcon);
                    }}
                    disabled={!calendarIcon}
                  >
                    <span className="ios-home-widget__calendar-day">
                      {now.toLocaleDateString([], { weekday: 'short' }).toUpperCase()}
                    </span>
                    <strong>{now.getDate()}</strong>
                    <small>Calendar</small>
                  </button>
                </div>
              )}

              <div className={modernHome && pageIndex === 0 ? 'ios-home-icons ios-home-icons--with-widgets' : 'ios-home-icons'}>
                {icons.map((icon) => renderIcon(icon))}
              </div>
            </div>
          ))}

          {showAppLibrary && (
            <div
              className="ios-home-screen__page ios-app-library"
              style={{ width: `${100 / totalPages}%` }}
              aria-hidden={page !== appLibraryPage}
            >
              <div className="ios-app-library__content">
                <h2>App Library</h2>
                <label
                  className="ios-app-library__search"
                  onPointerDown={(event) => event.stopPropagation()}
                  onPointerMove={(event) => event.stopPropagation()}
                  onPointerUp={(event) => event.stopPropagation()}
                >
                  <span aria-hidden="true">⌕</span>
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="App Library"
                    aria-label="Search App Library"
                  />
                </label>
                <div className="ios-app-library__grid">
                  {filteredApps.map((icon) => renderIcon(icon, true))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {modernHome && page !== appLibraryPage && (
        <button
          type="button"
          className="ios-home-search-pill"
          onClick={(event) => {
            event.stopPropagation();
            setIsSearchOpen(true);
          }}
        >
          <Search size={12} strokeWidth={2.6} aria-hidden="true" />
          <span>Search</span>
        </button>
      )}

      {modernHome && isSearchOpen && (
        <div
          className="ios-spotlight"
          onPointerDown={(event) => event.stopPropagation()}
          onPointerMove={(event) => event.stopPropagation()}
          onPointerUp={(event) => event.stopPropagation()}
        >
          <div className="ios-spotlight__header">
            <label className="ios-spotlight__field">
              <Search size={16} aria-hidden="true" />
              <input
                autoFocus
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search"
                aria-label="Search apps"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="ios-spotlight__clear"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </label>
            <button
              type="button"
              className="ios-spotlight__cancel"
              onClick={() => {
                setIsSearchOpen(false);
                setSearchQuery('');
              }}
            >
              Cancel
            </button>
          </div>

          <div className="ios-spotlight__results">
            <small>{searchQuery.trim() ? 'Applications' : 'Suggestions'}</small>
            <div className="ios-spotlight__grid">
              {spotlightApps.map((icon) => renderIcon(icon, true))}
            </div>
            {searchQuery.trim() && spotlightApps.length === 0 && (
              <div className="ios-spotlight__empty">No Results</div>
            )}
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="ios-home-screen__pager" aria-label="Home screen pages">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              type="button"
              className={`ios-home-screen__dot ${index === page ? 'is-active' : ''} ${index === appLibraryPage ? 'is-library' : ''}`}
              aria-label={index === appLibraryPage ? 'App Library' : `Page ${index + 1}`}
              onClick={(event) => {
                event.stopPropagation();
                setPage(index);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
