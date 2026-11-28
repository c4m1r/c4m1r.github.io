import { getFileIcon, getItemsFromPath, type FileSystemItem } from '../../../../utils/FileSystem';

/**
 * File search for the Start menu. It walks the given folders of the virtual file system and keeps the
 * items whose name contains the query. Both the depth and the number of hits are capped, so a search
 * stays fast on the whole profile and Program Files.
 */

export interface StartSearchHit {
  id: string;
  name: string;
  /** Full path of the item. */
  path: string;
  /** Folder that contains the item; a file without an application opens here. */
  parentPath: string;
  kind: 'folder' | 'file';
  /** Application that opens a file shortcut, when the item has one. */
  appId?: string;
  icon?: string;
}

const MAX_DEPTH = 6;
const MAX_HITS = 40;

function toHit(item: FileSystemItem, parentPath: string, path: string): StartSearchHit {
  const kind: StartSearchHit['kind'] = item.type === 'folder' ? 'folder' : 'file';
  const explicitIcon = typeof item.icon === 'string' ? item.icon : undefined;
  const appId = kind === 'file' ? item.appId : undefined;
  return {
    id: path,
    name: item.name,
    path,
    parentPath,
    kind,
    appId,
    icon: explicitIcon ?? (appId ? getFileIcon(item) : undefined),
  };
}

/** Files and folders under `roots` whose name contains `query` (case-insensitive). */
export function searchStartFiles(query: string, roots: string[]): StartSearchHit[] {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) return [];
  const hits: StartSearchHit[] = [];

  const visit = (folder: string, depth: number) => {
    if (depth > MAX_DEPTH) return;
    for (const item of getItemsFromPath(folder)) {
      if (hits.length >= MAX_HITS) return;
      if (item.type !== 'folder' && item.type !== 'file') continue;
      const path = `${folder}\\${item.name}`;
      if (item.name.toLocaleLowerCase().includes(needle)) hits.push(toHit(item, folder, path));
      if (item.type === 'folder') visit(path, depth + 1);
    }
  };

  for (const root of roots) visit(root, 0);
  return hits;
}
