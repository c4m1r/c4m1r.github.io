import { getActiveBootProfileId } from '../bootProfile';
import computerIcon from './assets/icons/computer.png';
import recycleEmptyIcon from './assets/icons/recycle-empty.png';
import recycleFullIcon from './assets/icons/recycle-full.png';
import folderIcon from './assets/icons/folder.png';
import documentsIcon from './assets/icons/documents.png';
import runIcon from './assets/icons/run.png';
import notepadIcon from './assets/icons/notepad.png';
import minesweeperIcon from './assets/icons/minesweeper.png';
import internetExplorerIcon from './assets/icons/internet-explorer.png';
import taskManagerIcon from './assets/icons/task-manager.png';
import controlPanelIcon from './assets/icons/control-panel.png';

/**
 * Windows 95 shell icons, from the Windows 95 reference set in eat/wins95Portfolio-main
 * (exported to 32 px PNG). Windows 95 shares the Windows 98 theme, so these only replace
 * the matching roles when the active boot profile is Windows 95.
 */
export const WIN95_ICON_ASSETS = {
  computerIcon,
  recycleIcon: recycleEmptyIcon,
  recycleFullIcon: recycleFullIcon,
  folderIcon,
  gamesIcon: minesweeperIcon,
  richTextIcon: notepadIcon,
  placesIcons: {
    myComputer: computerIcon,
    myDocuments: documentsIcon,
    controlPanel: controlPanelIcon,
    run: runIcon,
  },
  startMenuIcons: {
    internetExplorer: internetExplorerIcon,
    minesweeper: minesweeperIcon,
    games: minesweeperIcon,
    taskManager: taskManagerIcon,
    run: runIcon,
  },
} as const;

/** True when the Windows 98 theme is running as Windows 95 (the profile chosen in GRUB). */
export function isWin95Shell(theme: string): boolean {
  return theme === 'win-98' && getActiveBootProfileId() === 'win95';
}

/** Windows 98 theme assets with the Windows 95 icon roles on top. */
export function win95ThemeAssets<T extends object>(base: T): T {
  const merged = {
    ...base,
    ...WIN95_ICON_ASSETS,
    placesIcons: { ...(base as { placesIcons?: object }).placesIcons, ...WIN95_ICON_ASSETS.placesIcons },
    startMenuIcons: { ...(base as { startMenuIcons?: object }).startMenuIcons, ...WIN95_ICON_ASSETS.startMenuIcons },
  };
  return merged as T;
}
