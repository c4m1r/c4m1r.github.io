import { useMemo, useRef, useState, type MouseEvent } from 'react';
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

interface IosHomeScreenProps {
  desktopIcons: DesktopIcon[];
  selectedIcons: string[];
  onIconDoubleClick: (icon: DesktopIcon) => void;
  onIconContextMenu: (e: MouseEvent, icon: DesktopIcon) => void;
}

const PAGE_SIZE = 20;

const IOS_ICON_BY_ID: Record<string, string> = {
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

function chunkIcons(items: DesktopIcon[], size: number): DesktopIcon[][] {
  const pages: DesktopIcon[][] = [];
  for (let index = 0; index < items.length; index += size) {
    pages.push(items.slice(index, index + size));
  }
  return pages.length ? pages : [[]];
}

export function IosHomeScreen({
  desktopIcons,
  selectedIcons,
  onIconDoubleClick,
  onIconContextMenu,
}: IosHomeScreenProps) {
  const pages = useMemo(() => chunkIcons(desktopIcons, PAGE_SIZE), [desktopIcons]);
  const [page, setPage] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef<number | null>(null);
  const pointerIdRef = useRef<number | null>(null);
  const suppressClickRef = useRef(false);

  const clampPage = (value: number) => Math.max(0, Math.min(pages.length - 1, value));

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

  return (
    <div className="ios-home-screen" data-page={page} data-dragging={isDragging ? "true" : "false"}>
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
            width: `${pages.length * 100}%`,
            transform: `translateX(calc(${(-page * 100) / pages.length}% + ${dragOffset}px))`,
          }}
        >
          {pages.map((icons, pageIndex) => (
            <div
              key={pageIndex}
              className="ios-home-screen__page"
              style={{ width: `${100 / pages.length}%` }}
              aria-hidden={pageIndex !== page}
            >
              {icons.map((icon) => {
                const selected = selectedIcons.includes(icon.id);
                return (
                  <button
                    key={icon.id}
                    type="button"
                    className={`ios-home-icon ${selected ? 'is-selected' : ''}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      if (suppressClickRef.current) return;
                      onIconDoubleClick(icon);
                    }}
                    onContextMenu={(event) => onIconContextMenu(event, icon)}
                  >
                    <span className="ios-home-icon__glyph">
                      {IOS_ICON_BY_ID[icon.id]
                        ? <img src={IOS_ICON_BY_ID[icon.id]} alt="" draggable={false} />
                        : icon.icon}
                    </span>
                    <span className="ios-home-icon__label">{icon.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {pages.length > 1 && (
        <div className="ios-home-screen__pager" aria-label="Home screen pages">
          {pages.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`ios-home-screen__dot ${index === page ? 'is-active' : ''}`}
              aria-label={`Page ${index + 1}`}
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
