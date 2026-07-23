import { parseFrontmatter } from '../content/frontmatter';
import { type NewsItem } from './news.types';
import { routes } from '../../shells/site/siteRoutes';

/**
 * Loads all markdown files from src/content/news and parses them into NewsItem objects
 */
export async function loadNewsItems(language: string = 'en'): Promise<NewsItem[]> {
  const news: NewsItem[] = [];
  
  try {
    // Import all news markdown files from src/content/news
    const modules = import.meta.glob('/src/content/news/*.md', { query: '?raw', import: 'default' });
    
    for (const path in modules) {
      const content = await modules[path]() as string;
      const filename = path.split('/').pop()?.replace('.md', '') || '';
      
      const { metadata, body } = parseFrontmatter(content, language);
      const id = metadata.id || filename;
      const sitePath = routes.news(id);
      
      news.push({
        id,
        kind: 'news',
        title: metadata.title || filename,
        title_ru: metadata.title_ru,
        title_en: metadata.title_en,
        content: body,
        date: metadata.date || '',
        category: metadata.category || 'general',
        tags: metadata.tags || [],
        visibility: metadata.visibility,
        display: metadata.display,
        route: {
          ...metadata.route,
          path: metadata.route?.path ?? sitePath,
          sitePath: metadata.route?.sitePath ?? sitePath,
          osUri: metadata.route?.osUri ?? `news://${id}`,
          appId: metadata.route?.appId ?? 'news',
        },
      });
    }
  } catch (error) {
    console.error('[NewsLoader] Failed to load news items:', error);
  }
  
  // Sort descending by date
  return news.sort((a, b) => {
    const timeA = Date.parse(a.date);
    const timeB = Date.parse(b.date);
    return timeB - timeA;
  });
}
