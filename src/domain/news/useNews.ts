import { useState, useEffect } from 'react';
import { type NewsItem } from './news.types';
import { loadNewsItems } from './news.loader';
import { useApp } from '../../contexts/useApp';

/**
 * Hook to retrieve and reactively update news items based on the active UI language.
 */
export function useNews() {
  const { language } = useApp();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    
    loadNewsItems(language)
      .then((items) => {
        if (active) {
          setNews(items);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('[useNews] Failed to retrieve news items:', err);
        if (active) {
          setLoading(false);
        }
      });
      
    return () => {
      active = false;
    };
  }, [language]);

  return { news, loading };
}
