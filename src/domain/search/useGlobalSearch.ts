/**
 * useGlobalSearch — aggregates all domain slices into a single
 * unified search result set.
 *
 * Usage:
 *   const { results, query, setQuery } = useGlobalSearch();
 *
 * Each result carries its domain kind so callers can route/display accordingly.
 */

import { useEffect, useMemo, useState } from 'react';
import { useProjects } from '../projects/useProjects';
import { useGallery } from '../gallery/useGallery';
import { useNews } from '../news/useNews';
import { useArticles } from '../articles/useArticles';
import { useWiki } from '../wiki/useWiki';
import { loadAppEntries } from '../apps/apps.loader';
import { loadAboutMe, loadLegalNotice } from '../about/about.loader';
import { loadCvLocale } from '../resume/resume.loader';
import { useApp } from '../../contexts/useApp';
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

export function useGlobalSearch(initialQuery: string = ''): UseGlobalSearchResult {
  const { language } = useApp();
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const { projects, loading: projectsLoading } = useProjects();
  const { items: galleryItems, loading: galleryLoading } = useGallery();
  const { news, loading: newsLoading } = useNews();
  const { articles, loading: articlesLoading } = useArticles();
  const { articles: wikiArticles, loading: wikiLoading } = useWiki();
  const [extraItems, setExtraItems] = useState<ContentItem[]>([]);
  const [extraLoading, setExtraLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    Promise.all([loadAppEntries(language), loadAboutMe(language), loadLegalNotice(language)])
      .then(([apps, aboutMe, legalNotice]) => {
        if (!mounted) return;

        const cv = loadCvLocale(language);
        const resumeContent = Object.values(cv)
          .flat()
          .map((entry) => [entry.title, entry.subtitle, entry.year, ...(entry.details || [])].filter(Boolean).join(' '))
          .join('\n');

        setExtraItems([
          ...apps.map((app): ContentItem => ({ ...app, kind: 'apps' })),
          ...(aboutMe ? [{ ...aboutMe, kind: 'about' as const }] : []),
          ...(legalNotice ? [{ ...legalNotice, kind: 'about' as const }] : []),
          {
            id: 'resume',
            kind: 'resume',
            title: 'Resume',
            content: resumeContent,
            category: 'CV',
            tags: ['resume', 'cv', 'experience', 'education'],
          },
        ]);
      })
      .finally(() => {
        if (mounted) setExtraLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [language]);

  const loading =
    projectsLoading ||
    galleryLoading ||
    newsLoading ||
    articlesLoading ||
    wikiLoading ||
    extraLoading;

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

    // Apps/About/Resume
    for (const item of extraItems) {
      const matchedTags = matchesQuery(item, q);
      if (matchedTags.length > 0 || titleMatches(item, q)) {
        out.push({ item, kind: item.kind || 'about', matchedTags });
      }
    }

    return out;
  }, [query, projects, galleryItems, news, articles, wikiArticles, extraItems]);

  return { query, setQuery, results, loading };
}
