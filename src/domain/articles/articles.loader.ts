import { parseFrontmatter } from '../content/frontmatter';
import { resolveImagePath } from '../assets/assetResolver';
import { type Article } from './articles.types';
import { sitePathBuilders } from '../content/sitePathBuilders';

// Discover all blog markdown files at build time
const blogModules = import.meta.glob('/src/content/blog/*.md', {
  query: '?raw',
  import: 'default',
});

/**
 * Loads all blog articles directly from markdown files, normalising them
 * into typed domain Article objects. Completely independent of contentLoader.
 */
export async function loadArticles(language: string = 'en'): Promise<Article[]> {
  const posts: Article[] = [];
  const defaultPreview = new URL('../../content/blog/preview.webm', import.meta.url).href;
  const processedIds = new Set<string>();

  try {
    for (const path in blogModules) {
      const content = (await blogModules[path]()) as string;
      const filename = path.split('/').pop()?.replace('.md', '') || '';
      const relativePath = path.split('/src/content/blog/')[1] || filename + '.md';

      // Check language suffix (e.g. welcome-ru.md) for backwards compatibility
      const langMatch = filename.match(/-([a-z]{2})$/);
      const fileLang = langMatch ? langMatch[1] : null;
      const baseId = langMatch ? filename.replace(/-[a-z]{2}$/, '') : filename;

      // Skip if we already processed this article ID
      if (processedIds.has(baseId)) {
        continue;
      }

      // Parse frontmatter considering selected language
      const { metadata, body } = parseFrontmatter(content, language);
      const updatedAt = metadata.updatedAt || metadata.updated || metadata.date || '';

      const hasLanguageBlocks = content.includes('<!-- lang:');

      const processPost = (resolvedPreview: string) => {
        processedIds.add(baseId);
        const words = body.split(/\s+/).filter(Boolean).length;
        const readingTime = Math.max(1, Math.round(words / 200));
        const articlePath = sitePathBuilders.blog(baseId);
        const osUri = `reader://article/${baseId}`;

        posts.push({
          id: baseId,
          kind: 'articles',
          title: metadata.title || filename,
          content: body,
          date: metadata.date,
          category: metadata.category,
          tags: Array.isArray(metadata.tags) ? metadata.tags : [],
          author: metadata.author,
          updatedAt,
          relativePath,
          preview: resolvedPreview,
          articlePath,
          readingTime,
          summary: metadata.summary || metadata.excerpt || metadata.description || '',
          related: Array.isArray(metadata.related) ? metadata.related : [],
          route: {
            path: articlePath,
            sitePath: articlePath,
            osUri,
            appId: 'content-reader',
          },
        });
      };

      if (hasLanguageBlocks) {
        const resolvedPreview = metadata.preview ? resolveImagePath(metadata.preview) : defaultPreview;
        processPost(resolvedPreview);
      } else if (fileLang) {
        const baseFilePath = path.replace(`-${fileLang}.md`, '.md');
        if (blogModules[baseFilePath]) {
          // Skip file with lang suffix if base file exists
          continue;
        }

        if (fileLang === language || fileLang === 'en') {
          const resolvedPreview = metadata.preview ? resolveImagePath(metadata.preview) : defaultPreview;
          processPost(resolvedPreview);
        }
      } else {
        const resolvedPreview = metadata.preview ? resolveImagePath(metadata.preview) : defaultPreview;
        processPost(resolvedPreview);
      }
    }
  } catch (error) {
    console.error('[ArticlesLoader] Failed to load blog posts:', error);
  }

  // Sort by date descending (newest first)
  return posts.sort((a, b) => {
    const dateA = Date.parse(a.updatedAt || a.date || '');
    const dateB = Date.parse(b.updatedAt || b.date || '');
    if (!isNaN(dateA) && !isNaN(dateB)) return dateB - dateA;
    if (!isNaN(dateA)) return -1;
    if (!isNaN(dateB)) return 1;
    return b.id.localeCompare(a.id);
  });
}
