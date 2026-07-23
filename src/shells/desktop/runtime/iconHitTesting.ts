import { type DesktopSelectionBox } from '../desktopTypes';

export interface DesktopRuntimeRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export function getRelativeRect(
  rect: DesktopRuntimeRect,
  origin: DesktopRuntimeRect,
): DesktopRuntimeRect {
  return {
    left: rect.left - origin.left,
    top: rect.top - origin.top,
    right: rect.right - origin.left,
    bottom: rect.bottom - origin.top,
  };
}

export function isIconInsideSelectionBox(
  iconRect: DesktopRuntimeRect,
  selectionBox: DesktopSelectionBox,
): boolean {
  const selectionRight = selectionBox.left + selectionBox.width;
  const selectionBottom = selectionBox.top + selectionBox.height;

  return (
    iconRect.left < selectionRight &&
    iconRect.right > selectionBox.left &&
    iconRect.top < selectionBottom &&
    iconRect.bottom > selectionBox.top
  );
}
