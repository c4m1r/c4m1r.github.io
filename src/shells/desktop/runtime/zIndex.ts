import { DESKTOP_DRAG_Z_INDEX } from '../desktopConstants';

export function getDesktopIconZIndex(iconId: string, draggingIcon: string | null): number {
  return draggingIcon === iconId ? DESKTOP_DRAG_Z_INDEX : 1;
}
