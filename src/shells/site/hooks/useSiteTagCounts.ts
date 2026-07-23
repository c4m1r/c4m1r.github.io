import { useMemo } from 'react';
import { type ContentItem } from '../../../domain/content/types';

export function useSiteTagCounts(
  posts: ContentItem[],
  wiki: ContentItem[],
  projects: ContentItem[]
): Record<string, number> {
  return useMemo(() => {
    const counts: Record<string, number> = {};

    [posts, wiki, projects].forEach((items) => {
      items.forEach((item) => {
        item.tags?.forEach((tag) => {
          counts[tag] = (counts[tag] || 0) + 1;
        });
      });
    });

    return counts;
  }, [posts, wiki, projects]);
}
