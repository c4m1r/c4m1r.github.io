import { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../contexts/useApp';
import { loadArticles } from './articles.loader';
import { type Article } from './articles.types';

export interface UseArticlesResult {
  articles: Article[];
  loading: boolean;
  /** Articles grouped by lower-cased tag */
  byTag: Map<string, Article[]>;
  /** Articles grouped by lower-cased category */
  byCategory: Map<string, Article[]>;
}

/**
 * Hook to retrieve blog articles, language-reactive via AppContext.
 */
export function useArticles(): UseArticlesResult {
  const { language } = useApp();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    loadArticles(language)
      .then((items) => {
        if (!active) return;
        setArticles(items);
        setLoading(false);
      })
      .catch((err) => {
        console.error('[useArticles] Failed to load articles:', err);
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [language]);

  const byTag = useMemo<Map<string, Article[]>>(() => {
    const map = new Map<string, Article[]>();
    for (const a of articles) {
      for (const tag of a.tags ?? []) {
        const key = tag.toLowerCase();
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(a);
      }
    }
    return map;
  }, [articles]);

  const byCategory = useMemo<Map<string, Article[]>>(() => {
    const map = new Map<string, Article[]>();
    for (const a of articles) {
      if (!a.category) continue;
      const key = a.category.toLowerCase();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(a);
    }
    return map;
  }, [articles]);

  return { articles, loading, byTag, byCategory };
}
