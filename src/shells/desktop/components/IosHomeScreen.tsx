import { useMemo, useRef, useState, type MouseEvent } from 'react';
import { type DesktopIcon } from '../desktopTypes';

interface IosHomeScreenProps {
  desktopIcons: DesktopIcon[];
  selectedIcons: string[];
  onIconDoubleClick: (icon: DesktopIcon) => void;
  onIconContextMenu: (e: MouseEvent, icon: DesktopIcon) => void;
}

const PAGE_SIZE = 20;

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
  const startXRef = useRef<number | null>(null);
  const pointerIdRef = useRef<number | null>(null);

  const clampPage = (value: number) => Math.max(0, Math.min(pages.length - 1, value));

  const finishSwipe = (deltaX: number) => {
    const threshold = Math.min(90, Math.max(42, window.innerWidth * 0.12));
    if (Math.abs(deltaX) >= threshold) {
      setPage((current) => clampPage(current + (deltaX < 0 ? 1 : -1)));
    }
    startXRef.current = null;
    pointerIdRef.current = null;
    setDragOffset(0);
  };

  return (
    <div className="ios-home-screen" data-page={page}>
      <div
        className="ios-home-screen__viewport"
        onPointerDown={(event) => {
          if (event.pointerType === 'mouse' && event.button !== 0) return;
          startXRef.current = event.clientX;
          pointerIdRef.current = event.pointerId;
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
                      onIconDoubleClick(icon);
                    }}
                    onContextMenu={(event) => onIconContextMenu(event, icon)}
                  >
                    <span className="ios-home-icon__glyph">{icon.icon}</span>
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
