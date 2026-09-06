import { type ThemeId } from '../../../contexts/appContextTypes';
import { ContextMenu, type ContextMenuItem } from '../../../apps/desktop/components/ContextMenu';

export interface DesktopContextMenuSurfaceProps {
  contextMenu: { x: number; y: number; items: ContextMenuItem[] } | null;
  onClose: () => void;
  themeKey?: ThemeId;
}

export function DesktopContextMenuSurface({
  contextMenu,
  onClose,
  themeKey,
}: DesktopContextMenuSurfaceProps) {
  if (!contextMenu) {
    return null;
  }

  return (
    <div
      className="desktop-context-menu-surface os-context-menu-surface"
      data-os-theme={themeKey}
    >
      <ContextMenu
        x={contextMenu.x}
        y={contextMenu.y}
        items={contextMenu.items}
        onClose={onClose}
      />
    </div>
  );
}
