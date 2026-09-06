import { type ThemeId } from '../../../contexts/appContextTypes';
import { type DesktopSelectionBox as SelectionBoxType } from '../desktopTypes';

export interface DesktopSelectionBoxProps {
  selectionBox: SelectionBoxType | null;
  themeKey?: ThemeId;
}

export function DesktopSelectionBox({
  selectionBox,
  themeKey,
}: DesktopSelectionBoxProps) {
  if (!selectionBox) {
    return null;
  }

  return (
    <div
      className="desktop-selection-box absolute border border-[#1d5fbf] bg-[#75a9ff55] pointer-events-none os-selection-box"
      data-os-theme={themeKey}
      style={{
        left: `${selectionBox.left}px`,
        top: `${selectionBox.top}px`,
        width: `${selectionBox.width}px`,
        height: `${selectionBox.height}px`,
      }}
    />
  );
}
