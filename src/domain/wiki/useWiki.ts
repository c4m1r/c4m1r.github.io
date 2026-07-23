import { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../contexts/useApp';
import { loadWikiArticles, loadWikiIndexes } from './wiki.loader';
import { buildWikiCategoryTree } from './wikiGraph';
import { type WikiArticle, type WikiCategory, type WikiById, type WikiByTag } from './wiki.types';

export interface UseWikiResult {
  /** Flat list of all wiki articles */
  articles: WikiArticle[];
  /** Hierarchical category tree */
  categories: WikiCategory[];
  /** Articles indexed by id */
  byId: WikiById;
  /** Articles grouped by lower-cased tag */
  byTag: WikiByTag;
  /** True while loading */
  loading: boolean;
}

/**
 * Retrieves wiki articles and builds a category tree.
 * Reacts to language changes from AppContext.
 */
export function useWiki(): UseWikiResult {
  const { language } = useApp();
  const [articles, setArticles] = useState<WikiArticle[]>([]);
  const [categories, setCategories] = useState<WikiCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    Promise.all([
      loadWikiArticles(undefined, language),
      loadWikiIndexes(language),
    ])
      .then(([items, indexes]) => {
        if (!active) return;
        setArticles(items);
        setCategories(buildWikiCategoryTree(items, indexes));
        setLoading(false);
      })
      .catch((err) => {
        console.error('[useWiki] Failed to load wiki:', err);
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [language]);

  const byId = useMemo<WikiById>(() => {
    const map = new Map<string, WikiArticle>();
    for (const a of articles) map.set(a.id, a);
    return map;
  }, [articles]);

  const byTag = useMemo<WikiByTag>(() => {
    const map = new Map<string, WikiArticle[]>();
    for (const a of articles) {
      for (const tag of a.tags ?? []) {
        const key = tag.toLowerCase();
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(a);
      }
    }
    return map;
  }, [articles]);

  return { articles, categories, byId, byTag, loading };
}
