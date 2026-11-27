import computerIcon from './assets/icons/computer.png';
import recycleIcon from './assets/icons/recycle.png';
import recycleFullIcon from './assets/icons/recycle-full.png';
import folderIcon from './assets/icons/folder.png';
import picturesIcon from './assets/icons/pictures.png';
import driveIcon from './assets/icons/drive.png';
import floppyDriveIcon from './assets/icons/floppy.png';
import cdDriveIcon from './assets/icons/cd.png';
import searchIcon from './assets/icons/search.png';
import helpIcon from './assets/icons/help.png';
import controlPanelIcon from './assets/icons/control-panel.png';
import internetExplorerIcon from './assets/icons/internet-explorer.png';
import type { OsEdition } from '../../shells/os/osEditions';

/**
 * Windows 8.1 system icons: the Windows 8.1 Flat Colors pack (48 px). Only the roles the pack has are listed;
 * every other role keeps the regular Windows 8 set, as the Windows 8.1 notes ask.
 */
export const WIN81_ICON_ASSETS = {
  computerIcon,
  recycleIcon,
  recycleFullIcon,
  folderIcon,
  picturesIcon,
  driveIcon,
  floppyDriveIcon,
  cdDriveIcon,
  searchIcon,
  helpIcon,
  controlPanelIcon,
  internetExplorerIcon,
};

/** Editions of the Windows 8 profile that are Windows 8.1 (their ids start with `v81-`). */
export function isWindows81Edition(edition: OsEdition | undefined): boolean {
  return Boolean(edition?.id.startsWith('v81-'));
}

export function win81ThemeAssets<T extends object>(base: T): T {
  return { ...base, ...WIN81_ICON_ASSETS } as T;
}
