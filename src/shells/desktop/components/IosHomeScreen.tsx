import { useMemo, useRef, useState, type MouseEvent } from 'react';
import { type ThemeId } from '../../../contexts/appContextTypes';
import { type DesktopIcon } from '../desktopTypes';
import iosSafariIcon from '../../../../eat/homescreen-main/public/images/Icon=Safari.png';
import iosMailIcon from '../../../../eat/homescreen-main/public/images/Icon=Mail.png';
import iosMusicIcon from '../../../../eat/homescreen-main/public/images/Icon=Music.png';
import iosFilesIcon from '../../../../eat/homescreen-main/public/images/Icon=Files.png';
import iosCalculatorIcon from '../../../../eat/homescreen-main/public/images/Icon=Calculator.png';
import iosSettingsIcon from '../../../../eat/homescreen-main/public/images/Icon=Settings.png';
import iosPhotosIcon from '../../../../eat/homescreen-main/public/images/Icon=Photos.png';
import iosNewsIcon from '../../../../eat/homescreen-main/public/images/Icon=News.png';
import iosNotesIcon from '../../../../eat/homescreen-main/public/images/Icon=Notes.png';
import ios9SafariIcon from '../../../../eat/Iphone-7-Html-Css-Js-main/assets/images/safari.png';
import ios9SettingsIcon from '../../../../eat/Iphone-7-Html-Css-Js-main/assets/images/settings.png';
import ios9PhotosIcon from '../../../../eat/Iphone-7-Html-Css-Js-main/assets/images/gallery.png';
import ios9MusicIcon from '../../../../eat/Iphone-7-Html-Css-Js-main/assets/images/itunes.png';
import ios9CalendarIcon from '../../../../eat/Iphone-7-Html-Css-Js-main/assets/images/iconcal.png';

interface IosHomeScreenProps {
  theme: ThemeId;
  desktopIcons: DesktopIcon[];
  selectedIcons: string[];
  onIconDoubleClick: (icon: DesktopIcon) => void;
  onIconContextMenu: (e: MouseEvent, icon: DesktopIcon) => void;
}

const PAGE_SIZE = 20;

const MODERN_IOS_ICON_BY_ID: Record<string, string> = {
  'internet-explorer': iosSafariIcon,
  outlook: iosMailIcon,
  'windows-media-player': iosMusicIcon,
  winamp: iosMusicIcon,
  'projects-grid': iosFilesIcon,
  calculator: iosCalculatorIcon,
  'control-panel': iosSettingsIcon,
  pictures: iosPhotosIcon,
  blog: iosNewsIcon,
  news: iosNewsIcon,
  notepad: iosNotesIcon,
};

const IOS9_ICON_BY_ID: Record<string, string> = {
  'internet-explorer': ios9SafariIcon,
  'windows-media-player': ios9MusicIcon,
  winamp: ios9MusicIcon,
  'control-panel': ios9SettingsIcon,
  pictures: ios9PhotosIcon,
  calendar: ios9CalendarIcon,
};

function getIosIconMap(theme: ThemeId): Record<string, string> {
  if (theme === 'ios-9') return IOS9_ICON_BY_ID;
  if (theme === 'ios-16' || theme === 'ios-26') return MODERN_IOS_ICON_BY_ID;
  return {};
}

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
  const homePages = useMemo(() => chunkIcons(desktopIcons, PAGE_SIZE), [desktopIcons]);
  const showAppLibrary = theme === 'ios-16' || theme === 'ios-26';
  const iconMap = getIosIconMap(theme);
  const totalPages = homePages.length + (showAppLibrary ? 1 : 0);
  const appLibraryPage = showAppLibrary ? totalPages - 1 : -1;
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState('');
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef<number | null>(null);
  const pointerIdRef = useRef<number | null>(null);
  const suppressClickRef = useRef(false);

  const filteredApps = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return desktopIcons;
    return desktopIcons.filter((icon) => icon.label.toLowerCase().includes(normalized));
  }, [desktopIcons, query]);

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
    if (suppressClickRef.current) return;

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
        className={`ios-home-icon ${compact ? 'ios-app-library__app' : ''} ${selected ? 'is-selected' : ''}`}
        onClick={(event) => launchIcon(event, icon)}
        onContextMenu={(event) => onIconContextMenu(event, icon)}
      >
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
      className="ios-home-screen"
      data-page={page}
      data-app-library={page === appLibraryPage ? 'true' : 'false'}
      data-dragging={isDragging ? 'true' : 'false'}
    >
      <div
        className="ios-home-screen__viewport"
        onPointerDown={(event) => {
          if (event.pointerType === 'mouse' && event.button !== 0) return;
          startXRef.current = event.clientX;
          pointerIdRef.current = event.pointerId;
          setIsDragging(true);
          event.currentTarget.setPointerCapture?.(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (startXRef.current === null || pointerIdRef.current !== event.pointerId) return;
          setDragOffset(event.clientX - startXRef.current);
        }}
        onPointerUp={(event) => {
          if (startXRef.current === null || pointerIdRef.current !== event.pointerId) return;
          finishSwipe(event.clientX - startXRef.current);
        }}
        onPointerCancel={() => {
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
              className="ios-home-screen__page"
              style={{ width: `${100 / totalPages}%` }}
              aria-hidden={pageIndex !== page}
            >
              {icons.map((icon) => renderIcon(icon))}
            </div>
          ))}

          {showAppLibrary && (
            <div
              className="ios-home-screen__page ios-app-library"
              style={{ width: `${100 / totalPages}%` }}
              aria-hidden={page !== appLibraryPage}
            >
              <div
                className="ios-app-library__content"
                onPointerDown={(event) => event.stopPropagation()}
                onPointerMove={(event) => event.stopPropagation()}
                onPointerUp={(event) => event.stopPropagation()}
              >
                <h2>App Library</h2>
                <label className="ios-app-library__search">
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
