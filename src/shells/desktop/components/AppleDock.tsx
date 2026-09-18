import { useMemo, useRef, useState } from 'react';
import { type ThemeId } from '../../../contexts/appContextTypes';
import {
  MACOS_DOCK_ITEMS,
  getIosDockItems,
  type AppleDockAsset,
} from '../appleIconAssets';

interface AppleDockProps {
  theme: ThemeId;
  launcherOpen: boolean;
  onLauncherToggle: () => void;
  onLaunchApp: (appId: string) => void;
  openWindowIds: string[];
}


export function AppleDock({
  theme,
  launcherOpen,
  onLauncherToggle,
  onLaunchApp,
  openWindowIds,
}: AppleDockProps) {
  const isMac = theme === 'macos-26';
  const isIos = theme.startsWith('ios-');
  const dockRef = useRef<HTMLDivElement | null>(null);
  const [pointerX, setPointerX] = useState<number | null>(null);

  if (!isMac && !isIos) return null;

  const items: readonly AppleDockAsset[] = isMac ? MACOS_DOCK_ITEMS : getIosDockItems(theme);

  const magnification = useMemo(() => {
    if (!isMac || pointerX === null || !dockRef.current) return new Map<string, number>();
    const map = new Map<string, number>();
    const buttons = Array.from(dockRef.current.querySelectorAll<HTMLButtonElement>('.apple-dock__item'));
    buttons.forEach((button, index) => {
      const rect = button.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      const distance = Math.abs(pointerX - center);
      const radius = 92;
      const t = Math.max(0, 1 - distance / radius);
      const eased = t * t * (3 - 2 * t);
      map.set(items[index]?.id ?? String(index), 1 + eased * 0.48);
    });
    return map;
  }, [isMac, items, pointerX]);

  return (
    <div
      ref={dockRef}
      className={isMac ? 'apple-dock apple-macos-dock' : 'apple-dock apple-ios-dock'}
      role="toolbar"
      aria-label={isMac ? 'Dock' : 'iOS Dock'}
      onPointerMove={(event) => {
        if (isMac) setPointerX(event.clientX);
      }}
      onPointerLeave={() => setPointerX(null)}
    >
      {items.map((item) => {
        const active = item.launcher
          ? launcherOpen
          : Boolean(item.appId && openWindowIds.some((id) => {
              if (item.appId === 'my-computer') return id === 'explorer:My Computer';
              return id === `app:${item.appId}` || id.startsWith(`app:${item.appId}-`);
            }));
        return (
          <button
            key={item.id}
            type="button"
            className={`apple-dock__item ${active ? 'is-active' : ''}`}
            style={isMac ? { '--dock-scale': magnification.get(item.id) ?? 1 } as React.CSSProperties : undefined}
            title={item.title}
            aria-label={item.title}
            onClick={(event) => {
              event.stopPropagation();
              if (item.launcher) {
                onLauncherToggle();
                return;
              }
              if (item.appId) onLaunchApp(item.appId);
            }}
          >
            <span className="apple-dock__tooltip">{item.title}</span>
            <span className="apple-dock__icon">
              {item.src ? <img src={item.src} alt="" draggable={false} /> : <span>{item.glyph}</span>}
            </span>
            {isMac && item.appId && active && (
              <span className="apple-dock__running-dot" aria-hidden="true" />
            )}
          </button>
        );
      })}
    </div>
  );
}
