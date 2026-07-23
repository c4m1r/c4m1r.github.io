import { parseFrontmatter } from '../content/frontmatter';
import { type WikiArticle, type WikiIndex } from './wiki.types';
import { routes } from '../../shells/site/siteRoutes';

// All wiki markdown files discovered at build time
const wikiModules = import.meta.glob('/src/content/wiki/**/*.md', {
  query: '?raw',
  import: 'default',
});

/**
 * Derives a stable article id.
 * e.g. ["IT", "1C"] + "installation" → "wiki/IT/1C/installation"
 */
function makeWikiId(dirs: string[], slug: string): string {
  return ['wiki', ...dirs, slug].join('/');
}

/**
 * Derives the canonical web path for a wiki article.
 * e.g. "/wiki/IT/1C/installation"
 */
function makeWikiPath(dirs: string[], slug: string): string {
  return routes.wiki([...dirs, slug].join('/'));
}

/**
 * Derives the OS URI for the desktop shell.
 * e.g. "wiki://IT/1C/installation"
 */
function makeOsUri(dirs: string[], slug: string): string {
  return `wiki://${[...dirs, slug].join('/')}`;
}

/**
 * Loads all wiki articles (excluding index.md files).
 * Returns normalized WikiArticle objects ready for ContentGraph.
 */
export async function loadWikiArticles(
  category?: string,
  language: string = 'en',
): Promise<WikiArticle[]> {
  const articles: WikiArticle[] = [];

  try {
    for (const path in wikiModules) {
      // Skip category index pages
      if (path.endsWith('/index.md')) continue;

      // Optional category filter (top-level dir only)
      if (category && !path.includes(`/wiki/${category}/`)) continue;

      const raw = (await wikiModules[path]()) as string;
      const filename = path.split('/').pop()?.replace('.md', '') || '';

      // Relative path inside wiki/, e.g. "IT/1C/installation.md"
      const relativePath = path.split('/src/content/wiki/')[1] ?? filename + '.md';
      const segments = relativePath.split('/').filter(Boolean);
      const dirs = segments.slice(0, -1); // directory segments
      const slug = segments[segments.length - 1].replace('.md', '');

      const { metadata, body } = parseFrontmatter(raw, language);
      const updatedAt = metadata.updatedAt || metadata.updated || metadata.date || '';
      const categoryPath = dirs.join('/');
      const topCategory = dirs[0] || 'Wiki';

      const tags: string[] = Array.isArray(metadata.tags) ? metadata.tags : [];
      const wikiPath = makeWikiPath(dirs, slug);
      const osUri = makeOsUri(dirs, slug);

      articles.push({
        // ContentItem base fields
        id: makeWikiId(dirs, slug),
        kind: 'wiki',
        title: metadata.title || slug,
        content: body,
        category: categoryPath,
        tags,
        date: metadata.date,
        author: metadata.author,
        updatedAt,
        relativePath,
        pathSegments: dirs,
        // ContentRouteInfo-compatible route (satisfies ContentItem.route type)
        route: { path: wikiPath, sitePath: wikiPath, osUri, appId: 'wiki' },

        // Wiki-specific fields
        categoryPath,
        topCategory,
        slug,
        wikiPath,
        related: Array.isArray(metadata.related) ? metadata.related : [],
      });
    }
  } catch (error) {
    console.error('[WikiLoader] Failed to load wiki articles:', error);
  }

  return articles.sort((a, b) => a.title.localeCompare(b.title));
}

/**
 * Loads category index pages (index.md files only).
 * Returns a map keyed by categoryPath (e.g. "IT/1C").
 */
export async function loadWikiIndexes(
  language: string = 'en',
): Promise<Map<string, WikiIndex>> {
  const indexes = new Map<string, WikiIndex>();

  try {
    for (const path in wikiModules) {
      if (!path.endsWith('/index.md')) continue;

      const raw = (await wikiModules[path]()) as string;
      const { metadata, body } = parseFrontmatter(raw, language);

      // Derive the category path from the file path
      const relativePath = path.split('/src/content/wiki/')[1] ?? 'index.md';
      const segments = relativePath.split('/').filter(Boolean);
      const dirs = segments.slice(0, -1); // exclude "index.md"
      const categoryPath = dirs.join('/');

      indexes.set(categoryPath, {
        id: `wiki-index/${categoryPath}`,
        kind: 'wiki' as const,
        categoryPath,
        title: metadata.title || dirs[dirs.length - 1] || 'Wiki',
        description: metadata.description,
        content: body,
        tags: Array.isArray(metadata.tags) ? metadata.tags : [],
        updatedAt: metadata.updatedAt || metadata.date || '',
      });
    }
  } catch (error) {
    console.error('[WikiLoader] Failed to load wiki indexes:', error);
  }

  return indexes;
}

/**
 * Loads a specific category index page.
 */
export async function loadWikiCategoryIndex(
  categoryPath: string,
  language: string = 'en',
): Promise<WikiIndex | null> {
  const indexes = await loadWikiIndexes(language);
  return indexes.get(categoryPath) || null;
}

