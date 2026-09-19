import { Fragment, useEffect, useRef, useState, type CSSProperties } from 'react';
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
  onQuitApp?: (appId: string) => void;
  magnificationEnabled?: boolean;
  showRunningIndicators?: boolean;
  transientItems?: readonly AppleDockAsset[];
}


export function AppleDock({
  theme,
  launcherOpen,
  onLauncherToggle,
  onLaunchApp,
  openWindowIds,
  onQuitApp,
  magnificationEnabled = true,
  showRunningIndicators = true,
  transientItems = [],
}: AppleDockProps) {
  const isMac = theme === 'macos-26';
  const isIos = theme.startsWith('ios-');
  const dockRef = useRef<HTMLDivElement | null>(null);
  const [pointerX, setPointerX] = useState<number | null>(null);
  const [contextItem, setContextItem] = useState<{ item: AppleDockAsset; x: number } | null>(null);

  useEffect(() => {
    if (!contextItem) return;
    const close = () => setContextItem(null);
    window.addEventListener('pointerdown', close);
    window.addEventListener('blur', close);
    return () => {
      window.removeEventListener('pointerdown', close);
      window.removeEventListener('blur', close);
    };
  }, [contextItem]);

  const items: readonly AppleDockAsset[] = isMac
    ? [...MACOS_DOCK_ITEMS, ...transientItems]
    : getIosDockItems(theme);
  const magnification = new Map<string, number>();

  if (isMac && magnificationEnabled && pointerX !== null && dockRef.current) {
    const buttons = Array.from(dockRef.current.querySelectorAll<HTMLButtonElement>('.apple-dock__item'));
    buttons.forEach((button, index) => {
      const rect = button.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      const distance = Math.abs(pointerX - center);
      const radius = 92;
      const t = Math.max(0, 1 - distance / radius);
      const eased = t * t * (3 - 2 * t);
      magnification.set(items[index]?.id ?? String(index), 1 + eased * 0.48);
    });
  }

  if (!isMac && !isIos) return null;

  return (
    <div
      ref={dockRef}
      className={isMac ? 'apple-dock apple-macos-dock' : 'apple-dock apple-ios-dock'}
      role="toolbar"
      aria-label={isMac ? 'Dock' : 'iOS Dock'}
      onPointerMove={(event) => {
        if (isMac && magnificationEnabled) setPointerX(event.clientX);
      }}
      onPointerLeave={() => setPointerX(null)}
    >
      {items.map((item, itemIndex) => {
        const active = item.launcher
          ? launcherOpen
          : Boolean(item.appId && openWindowIds.some((id) => {
              if (item.appId === 'my-computer') return id === 'explorer:My Computer';
              return id === `app:${item.appId}` || id.startsWith(`app:${item.appId}-`);
            }));
        return (
          <Fragment key={item.id}>
            {isMac && transientItems.length > 0 && itemIndex === MACOS_DOCK_ITEMS.length && (
              <span className="apple-dock__separator" aria-hidden="true" />
            )}
            <button
            key={item.id}
            type="button"
            className={`apple-dock__item ${active ? 'is-active' : ''}`}
            style={isMac ? { '--dock-scale': magnification.get(item.id) ?? 1 } as CSSProperties : undefined}
            title={item.title}
            aria-label={item.title}
            onClick={(event) => {
              event.stopPropagation();
              setContextItem(null);
              if (item.launcher) {
                onLauncherToggle();
                return;
              }
              if (item.appId) onLaunchApp(item.appId);
            }}
            onContextMenu={(event) => {
              if (!isMac) return;
              event.preventDefault();
              event.stopPropagation();
              setPointerX(null);
              setContextItem({ item, x: event.clientX });
            }}
          >
            <span className="apple-dock__tooltip">{item.title}</span>
            <span className="apple-dock__icon">
              {item.src ? <img src={item.src} alt="" draggable={false} /> : <span>{item.glyph}</span>}
            </span>
            {isMac && showRunningIndicators && item.appId && active && (
              <span className="apple-dock__running-dot" aria-hidden="true" />
            )}
            </button>
          </Fragment>
        );
      })}

      {isMac && contextItem && (
        <div
          className="apple-dock-context-menu"
          role="menu"
          style={{ left: contextItem.x }}
          onPointerDown={(event) => event.stopPropagation()}
          onContextMenu={(event) => event.preventDefault()}
        >
          <strong>{contextItem.item.title}</strong>
          <div className="apple-dock-context-menu__separator" />
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setContextItem(null);
              if (contextItem.item.launcher) onLauncherToggle();
              else if (contextItem.item.appId) onLaunchApp(contextItem.item.appId);
            }}
          >
            Open
          </button>
          {contextItem.item.appId && openWindowIds.some((id) => {
            if (contextItem.item.appId === 'my-computer') return id === 'explorer:My Computer';
            return id === `app:${contextItem.item.appId}` || id.startsWith(`app:${contextItem.item.appId}-`);
          }) && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                const appId = contextItem.item.appId;
                setContextItem(null);
                if (appId) onQuitApp?.(appId);
              }}
            >
              Quit
            </button>
          )}
        </div>
      )}
    </div>
  );
}
