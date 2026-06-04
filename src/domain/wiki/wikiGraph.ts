import { type WikiArticle, type WikiCategory, type WikiIndex, type WikiByCategory, type WikiByTag, type WikiById } from './wiki.types';
import { type ContentGraph } from '../content/types';
import { buildContentGraph } from '../content/contentGraph';

/**
 * Builds a hierarchical WikiCategory tree from a flat list of wiki articles.
 *
 * Directory structure example:
 *   IT/1C/installation  → category "IT" → subcategory "1C" → article "installation"
 *   Design/morphisms    → category "Design" → article "morphisms"
 */
export function buildWikiCategoryTree(
  articles: WikiArticle[],
  indexes: Map<string, WikiIndex> = new Map(),
): WikiCategory[] {
  // Internal node type for building the tree
  interface Node {
    id: string;
    name: string;
    pathSegments: string[];
    articles: WikiArticle[];
    index?: WikiIndex;
    childrenMap: Map<string, Node>;
  }

  const rootMap = new Map<string, Node>();

  const ensureNode = (map: Map<string, Node>, id: string, name: string, segments: string[]): Node => {
    if (!map.has(id)) {
      map.set(id, {
        id,
        name,
        pathSegments: segments,
        articles: [],
        index: indexes.get(id),
        childrenMap: new Map(),
      });
    }
    return map.get(id)!;
  };

  for (const article of articles) {
    const dirs = article.pathSegments ?? [];
    if (dirs.length === 0) {
      // Uncategorised — place under synthetic "Wiki" root
      const root = ensureNode(rootMap, 'Wiki', 'Wiki', ['Wiki']);
      root.articles.push(article);
      continue;
    }

    let currentMap = rootMap;
    let currentNode: Node | null = null;

    for (let i = 0; i < dirs.length; i++) {
      const seg = dirs[i];
      const id = dirs.slice(0, i + 1).join('/');
      const node = ensureNode(currentMap, id, seg, dirs.slice(0, i + 1));
      currentNode = node;
      currentMap = node.childrenMap;
    }

    currentNode!.articles.push(article);
  }

  // Recursively serialize Node → WikiCategory, sorting by name
  const toCategory = (node: Node): WikiCategory => ({
    id: node.id,
    name: node.name,
    pathSegments: node.pathSegments,
    articles: node.articles.sort((a, b) => a.title.localeCompare(b.title)),
    index: node.index,
    children: Array.from(node.childrenMap.values())
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(toCategory),
  });

  return Array.from(rootMap.values())
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(toCategory);
}

/**
 * Builds a ContentGraph that contains only wiki nodes.
 * The full registry graph already includes these; use this for isolated wiki queries.
 */
export function buildWikiGraph(articles: WikiArticle[]): ContentGraph {
  return buildContentGraph(articles);
}

/**
 * Groups wiki articles by their top-level category path.
 */
export function buildWikiByCategory(articles: WikiArticle[]): WikiByCategory {
  const map = new Map<string, WikiArticle[]>();
  for (const a of articles) {
    const key = a.categoryPath || 'wiki';
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(a);
  }
  return map;
}

/**
 * Groups wiki articles by lower-cased tag.
 */
export function buildWikiByTag(articles: WikiArticle[]): WikiByTag {
  const map = new Map<string, WikiArticle[]>();
  for (const a of articles) {
    for (const tag of a.tags ?? []) {
      const key = tag.toLowerCase();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(a);
    }
  }
  return map;
}

/**
 * Indexes wiki articles by id.
 */
export function buildWikiById(articles: WikiArticle[]): WikiById {
  const map = new Map<string, WikiArticle>();
  for (const a of articles) map.set(a.id, a);
  return map;
}

/**
 * Flattens a WikiCategory tree into a simple list of all articles
 * (including articles nested in sub-categories).
 */
export function flattenCategories(categories: WikiCategory[]): WikiArticle[] {
  const result: WikiArticle[] = [];
  const visit = (cat: WikiCategory) => {
    result.push(...cat.articles);
    for (const child of cat.children) visit(child);
  };
  for (const cat of categories) visit(cat);
  return result;
}
