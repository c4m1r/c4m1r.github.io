import type { ReactNode } from 'react';
import { getItemsFromPath, type FileSystemItem } from '../../../../utils/FileSystem';

/**
 * One data model for every Start menu. A node is a launchable entry (appId or path), a system
 * command (action), a separator, or a submenu. Renderers decide how to draw it:
 *  - classic menus (98, 2000) use `icon` (ReactNode) and submenus;
 *  - XP and 7 use `iconSrc` (URL) and flat lists, where a folder opens in Explorer through `path`.
 *
 * User-installed entries come from the profile's `Start Menu\Programs` folder: folders become
 * submenus (and also carry `path`), shortcuts with an appId become items.
 */

export type StartMenuAction = 'logoff' | 'shutdown';
export type StartMenuIconKind = 'folder' | 'file';

export interface StartMenuNode {
  label: string;
  icon: ReactNode;
  /** Icon URL when the file system item has one; used by the flat (XP and 7) renderers. */
  iconSrc?: string;
  appId?: string;
  path?: string;
  action?: StartMenuAction;
  submenu?: StartMenuNode[];
  separator?: boolean;
}

/** Turns an icon URL into the renderer's icon. Each menu supplies its own sizing. */
export type StartMenuIconRenderer = (src: string | undefined, kind: StartMenuIconKind) => ReactNode;

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

/** Menu nodes for the items of a file-system folder, folders first, then by name. */
export function startMenuFolderNodes(path: string, render: StartMenuIconRenderer, depth = 0): StartMenuNode[] {
  if (depth >= MAX_DEPTH) return [];
  return getItemsFromPath(path)
    .slice()
    .sort(compareItems)
    .flatMap((item): StartMenuNode[] => {
      const iconSrc = typeof item.icon === 'string' ? item.icon : undefined;
      if (item.type === 'folder') {
        const folderPath = `${path}\\${item.name}`;
        const children = startMenuFolderNodes(folderPath, render, depth + 1);
        const node: StartMenuNode = {
          label: item.name,
          icon: render(iconSrc, 'folder'),
          iconSrc,
          path: folderPath,
        };
        // An empty folder opens in Explorer instead of showing an empty flyout.
        if (children.length > 0) node.submenu = children;
        return [node];
      }
      if (item.type === 'file' && item.appId) {
        return [{ label: item.name, icon: render(iconSrc, 'file'), iconSrc, appId: item.appId }];
      }
      return [];
    });
}
