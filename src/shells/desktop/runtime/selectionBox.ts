import { type DesktopPosition, type DesktopSelectionBox } from '../desktopTypes';

export function normalizeSelectionBox(
  start: DesktopPosition,
  current: DesktopPosition,
): DesktopSelectionBox {
  return {
    left: Math.min(start.x, current.x),
    top: Math.min(start.y, current.y),
    width: Math.abs(current.x - start.x),
    height: Math.abs(current.y - start.y),
  };
}

export function isPointInsideSelectionBox(
  point: DesktopPosition,
  box: DesktopSelectionBox,
): boolean {
  return (
    point.x >= box.left &&
    point.x <= box.left + box.width &&
    point.y >= box.top &&
    point.y <= box.top + box.height
  );
}
