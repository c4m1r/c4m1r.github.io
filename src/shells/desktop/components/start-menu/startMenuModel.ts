import type { ReactNode } from 'react';
import { getItemsFromPath, type FileSystemItem } from '../../../../utils/FileSystem';

/**
 * One data model for the classic Start menus (Windows 98 and 2000). A node is either a launchable
 * entry (appId or path), a system command (action), a separator, or a submenu.
 *
 * Entries that come from the user's file system are read from the profile's
 * `Start Menu\Programs` folder: folders become submenus, shortcuts with an appId become items.
 * This is the single source for user-installed entries, so the StartUp folder works without
 * any menu-specific code.
 */

export type StartMenuAction = 'logoff' | 'shutdown';

export interface StartMenuNode {
  label: string;
  icon: ReactNode;
  appId?: string;
  path?: string;
  action?: StartMenuAction;
  submenu?: StartMenuNode[];
  separator?: boolean;
}

export interface StartMenuIconSet {
  folder: ReactNode;
  file: ReactNode;
  /** Wraps an icon URL in the markup the menu uses for its 16 px art. */
  image: (src: string) => ReactNode;
}

const MAX_DEPTH = 4;

/** Path of the Programs folder for a profile, e.g. `C:\Documents and Settings\User\Start Menu\Programs`. */
export function startMenuProgramsPath(account: string): string {
  return `C:\\Documents and Settings\\${account}\\Start Menu\\Programs`;
}

function compareItems(a: FileSystemItem, b: FileSystemItem): number {
  const aFolder = a.type === 'folder' ? 0 : 1;
  const bFolder = b.type === 'folder' ? 0 : 1;
  if (aFolder !== bFolder) return aFolder - bFolder;
  return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
}

function iconOf(item: FileSystemItem, icons: StartMenuIconSet, fallback: ReactNode): ReactNode {
  if (typeof item.icon === 'string') return icons.image(item.icon);
  if (item.icon) return item.icon;
  return fallback;
}

/** Menu nodes for the items of a file-system folder, folders first, then by name. */
export function startMenuFolderNodes(path: string, icons: StartMenuIconSet, depth = 0): StartMenuNode[] {
  if (depth >= MAX_DEPTH) return [];
  return getItemsFromPath(path)
    .slice()
    .sort(compareItems)
    .flatMap((item): StartMenuNode[] => {
      if (item.type === 'folder') {
        const folderPath = `${path}\\${item.name}`;
        const children = startMenuFolderNodes(folderPath, icons, depth + 1);
        // An empty folder opens in Explorer instead of showing an empty flyout.
        if (children.length === 0) return [{ label: item.name, icon: icons.folder, path: folderPath }];
        return [{ label: item.name, icon: icons.folder, submenu: children }];
      }
      if (item.type === 'file' && item.appId) {
        return [{ label: item.name, icon: iconOf(item, icons, icons.file), appId: item.appId }];
      }
      return [];
    });
}
