import { type MutableRefObject, type MouseEvent } from 'react';
import { type ThemeId } from '../../../contexts/appContextTypes';
import { type DesktopIcon } from '../desktopTypes';
import { getDesktopIconZIndex } from '../runtime/zIndex';

export interface DesktopIconGridProps {
  desktopIcons: DesktopIcon[];
  selectedIcons: string[];
  draggingIcon: string | null;
  iconRefs: MutableRefObject<Record<string, HTMLDivElement | null>>;
  isXpFamily: boolean;
  themeKey: ThemeId;
  onIconMouseDown: (e: MouseEvent, iconId: string) => void;
  onIconDoubleClick: (icon: DesktopIcon) => void;
  onIconContextMenu: (e: MouseEvent, icon: DesktopIcon) => void;
}

export function DesktopIconGrid({
  desktopIcons,
  selectedIcons,
  draggingIcon,
  iconRefs,
  isXpFamily,
  themeKey,
  onIconMouseDown,
  onIconDoubleClick,
  onIconContextMenu,
}: DesktopIconGridProps) {
  return (
    <div
      className="desktop-icon-grid absolute inset-0 pointer-events-none"
      data-os-theme={themeKey}
    >
      {desktopIcons.map((icon) => {
        const isSelected = selectedIcons.includes(icon.id);
        const isDragging = draggingIcon === icon.id;

        return (
          <div
            key={icon.id}
            className="absolute cursor-pointer group pointer-events-auto os-desktop-icon"
            style={{
              left: `${icon.x}px`,
              top: `${icon.y}px`,
              width: '96px',
              zIndex: getDesktopIconZIndex(icon.id, draggingIcon),
            }}
            ref={(element) => {
              iconRefs.current[icon.id] = element;
            }}
            data-icon-id={icon.id}
            data-selected={isSelected ? 'true' : 'false'}
            data-dragging={isDragging ? 'true' : 'false'}
            onMouseDown={(e) => onIconMouseDown(e, icon.id)}
            onDoubleClick={() => onIconDoubleClick(icon)}
            onContextMenu={(e) => onIconContextMenu(e, icon)}
          >
            <div
              className={`p-2 rounded flex flex-col items-center justify-center ${
                isXpFamily
                  ? isSelected
                    ? 'bg-blue-600/40'
                    : 'group-hover:bg-blue-500/30'
                  : isSelected
                    ? 'bg-blue-800/40 border border-gray-200'
                    : 'group-hover:bg-blue-800/50 border border-transparent group-hover:border-gray-300'
              } transition-colors ${isDragging ? 'opacity-80' : ''}`}
            >
              <div
                className={`flex items-center justify-center ${!isXpFamily ? 'opacity-90' : ''}`}
                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.7)' }}
              >
                {icon.icon}
              </div>
              <div
                className={`text-white text-[11px] text-center mt-1 w-full break-words ${
                  isXpFamily ? 'drop-shadow-lg font-semibold' : ''
                }`}
                style={{
                  textShadow: '0 1px 3px rgba(0,0,0,0.85), 0 0 6px rgba(0,0,0,0.6)',
                  lineHeight: '1.2',
                }}
              >
                {icon.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
