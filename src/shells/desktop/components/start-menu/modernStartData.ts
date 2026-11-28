import { useMemo } from 'react';
import { THEME_ASSETS } from '../../../../themes/webos/themeAssets';
import type { Language } from '../../../../i18n/translations';
import { searchFileSystem, type StartSearchHit } from '../../../../utils/fileSearch';
import { buildWin7StartMenuLists, type Win7MenuEntry } from './startMenuWin7Lists';
import { startMenuFolderNodes, startMenuProgramsPath, type StartMenuNode } from './startMenuModel';

/**
 * Data shared by the Windows 10 and Windows 11 Start menus: the pinned programs, one alphabetical
 * list of every program, the places and file search. The lists come from the same model as the
 * Windows 7 menu, so every skin offers the same applications.
 */

export interface ModernStartData {
  pinned: Win7MenuEntry[];
  allApps: Win7MenuEntry[];
  places: Win7MenuEntry[];
  byId: Map<string, Win7MenuEntry>;
}

function flattenLeaves(entries: Win7MenuEntry[]): Win7MenuEntry[] {
  return entries.flatMap((entry) => {
    if (entry.submenu) return flattenLeaves(entry.submenu);
    return entry.appId || entry.path ? [entry] : [];
  });
}

function toEntry(node: StartMenuNode, folderIcon: string | undefined): Win7MenuEntry {
  return {
    id: `user:${node.path ?? node.appId ?? node.label}`,
    label: node.label,
    appId: node.appId,
    path: node.submenu ? undefined : node.path,
    icon: node.iconSrc ?? folderIcon,
    submenu: node.submenu?.map((child) => toEntry(child, folderIcon)),
  };
}

export function buildModernStartData({ isRu, language, account }: { isRu: boolean; language: Language; account: string }): ModernStartData {
  const folderIcon = THEME_ASSETS.win7.folderIcon;
  const lists = buildWin7StartMenuLists({ isRu, language, vista: false, account });
  const userPrograms = startMenuFolderNodes(startMenuProgramsPath(account), () => null).map((node) => toEntry(node, folderIcon));

  const seen = new Set<string>();
  const allApps = flattenLeaves([...lists.allPrograms, ...userPrograms])
    .filter((entry) => {
      const key = entry.label.toLocaleLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => a.label.localeCompare(b.label, language, { sensitivity: 'base' }));

  const byId = new Map<string, Win7MenuEntry>();
  for (const entry of [...lists.programs, ...allApps]) if (!byId.has(entry.id)) byId.set(entry.id, entry);

  return { pinned: lists.programs, allApps, places: lists.places, byId };
}

/** Entries grouped under their first letter; anything that is not a letter goes under "#" first. */
export function groupByLetter(apps: Win7MenuEntry[]): Array<{ letter: string; items: Win7MenuEntry[] }> {
  const groups = new Map<string, Win7MenuEntry[]>();
  for (const app of apps) {
    const first = app.label.trim().charAt(0);
    const letter = /\p{L}/u.test(first) ? first.toLocaleUpperCase() : '#';
    groups.set(letter, [...(groups.get(letter) ?? []), app]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => (a === '#' ? -1 : b === '#' ? 1 : a.localeCompare(b)))
    .map(([letter, items]) => ({ letter, items }));
}

/** Programs and files that match a query: every program, plus the profile and Program Files. */
export function useModernSearch(query: string, language: Language, apps: Win7MenuEntry[], account: string): { appHits: Win7MenuEntry[]; fileHits: StartSearchHit[] } {
  const needle = query.trim().toLocaleLowerCase(language);
  return useMemo(() => {
    if (!needle) return { appHits: [], fileHits: [] };
    return {
      appHits: apps.filter((app) => app.label.toLocaleLowerCase(language).includes(needle)),
      fileHits: searchFileSystem(query, [`C:\\Documents and Settings\\${account}`, 'C:\\Program Files']),
    };
  }, [needle, query, language, apps, account]);
}

export interface StartActionProps {
  onClose: () => void;
  onLaunchApp?: (appId: string) => void;
  onOpenPath?: (path: string) => void;
  onSystemCommand?: (command: 'logoff' | 'shutdown') => void;
  onHover?: () => void;
}

/** Launch, open and close actions that every Start entry uses. */
export function startActions({ onClose, onLaunchApp, onOpenPath }: StartActionProps) {
  return {
    activate(entry: Win7MenuEntry) {
      if (entry.disabled) return;
      if (entry.appId) onLaunchApp?.(entry.appId);
      if (entry.path) onOpenPath?.(entry.path);
      onClose();
    },
    // A file with an application opens in it; any other file opens its folder in Explorer.
    openHit(hit: StartSearchHit) {
      if (hit.appId) onLaunchApp?.(hit.appId);
      else onOpenPath?.(hit.kind === 'folder' ? hit.path : hit.parentPath);
      onClose();
    },
  };
}
