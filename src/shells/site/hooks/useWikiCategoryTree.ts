import { useMemo } from 'react';

export interface WikiCategoryTreeItem {
  pathSegments?: string[];
  categoryPath?: string;
}

export interface WikiCategoryNode {
  name: string;
  fullPath: string;
  children: Map<string, WikiCategoryNode>;
  count: number;
}

export function useWikiCategoryTree(wiki: WikiCategoryTreeItem[]) {
  const tree = useMemo(() => {
    const root = new Map<string, WikiCategoryNode>();

    wiki.forEach((item) => {
      const segments = item.pathSegments || (item.categoryPath ? item.categoryPath.split('/') : []);
      if (segments.length === 0) return;

      let currentMap = root;
      let currentPath = '';

      segments.forEach((segment) => {
        currentPath = currentPath ? `${currentPath}/${segment}` : segment;

        if (!currentMap.has(segment)) {
          currentMap.set(segment, {
            name: segment,
            fullPath: currentPath,
            children: new Map(),
            count: 0,
          });
        }

        const node = currentMap.get(segment)!;
        node.count += 1;
        currentMap = node.children;
      });
    });

    return root;
  }, [wiki]);

  const stats = useMemo(() => {
    const counts: Record<string, number> = {};
    tree.forEach((node, key) => {
      counts[key] = node.count;
    });
    return counts;
  }, [tree]);

  const categories = useMemo(() => ['All', ...Array.from(tree.keys())], [tree]);

  return { tree, stats, categories };
}
