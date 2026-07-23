import { DEFAULT_DESKTOP_VIEWPORT } from '../desktopConstants';
import { type DesktopSize } from '../desktopTypes';
export { normalizeSelectionBox as createSelectionBox } from './selectionBox';

export function getViewportSize(): DesktopSize {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_DESKTOP_VIEWPORT };
  }
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}
