/**
 * useGlobalSearch — aggregates all domain slices into a single
 * unified search result set.
 *
 * Usage:
 *   const { results, query, setQuery } = useGlobalSearch();
 *
 * Each result carries its domain kind so callers can route/display accordingly.
 */

import { useMemo, useState } from 'react';
import { useProjects } from '../projects/useProjects';
import { useGallery } from '../gallery/useGallery';
import { useNews } from '../news/useNews';
import { useArticles } from '../articles/useArticles';
import { useWiki } from '../wiki/useWiki';
import { type ContentItem, type ContentKind } from '../content/types';

export interface SearchResult {
  item: ContentItem;
  kind: ContentKind;
  /** Which tags matched the query (may be empty for title-match) */
  matchedTags: string[];
}

export interface UseGlobalSearchResult {
  query: string;
  setQuery: (q: string) => void;
  results: SearchResult[];
  loading: boolean;
}

/**
 * Minimal text-match helper — checks title, tags, category, content excerpt.
 */
function matchesQuery(item: ContentItem, q: string): string[] {
  const lower = q.toLowerCase();
  const matched: string[] = [];
  for (const tag of item.tags ?? []) {
    if (tag.toLowerCase().includes(lower)) matched.push(tag);
  }
  return matched;
}

function titleMatches(item: ContentItem, q: string): boolean {
  const lower = q.toLowerCase();
  return (
    item.title.toLowerCase().includes(lower) ||
    (item.category?.toLowerCase().includes(lower) ?? false) ||
    item.content?.toLowerCase().slice(0, 500).includes(lower)
  );
}

export function useGlobalSearch(): UseGlobalSearchResult {
  const [query, setQuery] = useState('');

  const { projects, loading: projectsLoading } = useProjects();
  const { items: galleryItems, loading: galleryLoading } = useGallery();
  const { news, loading: newsLoading } = useNews();
  const { articles, loading: articlesLoading } = useArticles();
  const { articles: wikiArticles, loading: wikiLoading } = useWiki();

  const loading =
    projectsLoading ||
    galleryLoading ||
    newsLoading ||
    articlesLoading ||
    wikiLoading;

  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim();
    if (q.length < 2) return [];

    const out: SearchResult[] = [];

    // Projects
    for (const project of projects) {
      const matchedTags = matchesQuery(project, q);
      if (matchedTags.length > 0 || titleMatches(project, q)) {
        out.push({ item: project, kind: 'projects', matchedTags });
      }
    }

    // Gallery Items
    for (const item of galleryItems) {
      const matchedTags = matchesQuery(item, q);
      if (matchedTags.length > 0 || titleMatches(item, q)) {
        out.push({ item, kind: 'gallery', matchedTags });
      }
    }

    // News
    for (const item of news) {
      const matchedTags = matchesQuery(item, q);
      if (matchedTags.length > 0 || titleMatches(item, q)) {
        out.push({ item: { ...item, kind: 'news' }, kind: 'news', matchedTags });
      }
    }

    // Blog Articles
    for (const item of articles) {
      const matchedTags = matchesQuery(item, q);
      if (matchedTags.length > 0 || titleMatches(item, q)) {
        out.push({ item, kind: 'articles', matchedTags });
      }
    }

    // Wiki Articles
    for (const item of wikiArticles) {
      const matchedTags = matchesQuery(item, q);
      if (matchedTags.length > 0 || titleMatches(item, q)) {
        out.push({ item, kind: 'wiki', matchedTags });
      }
    }

    return out;
  }, [query, projects, galleryItems, news, articles, wikiArticles]);

  return { query, setQuery, results, loading };
}
