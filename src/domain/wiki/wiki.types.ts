import { type ContentItem } from '../content/types';

/**
 * A single wiki article (one .md file, not index.md).
 * Extends ContentItem so it can be inserted into ContentGraph directly.
 *
 * NOTE: The base ContentItem.route is of type ContentRouteInfo (object).
 * We populate it with { path, osUri, appId } for ContentGraph compatibility.
 * For convenience, wikiPath mirrors route.path as a plain string.
 */
export interface WikiArticle extends ContentItem {
  kind: 'wiki';

  /** e.g. "IT/1C" – the full slash-joined directory path relative to wiki root */
  categoryPath: string;

  /** First path segment, e.g. "IT" */
  topCategory: string;

  /** Full path segments array, e.g. ["IT", "1C"] */
  pathSegments: string[];

  /** Slug derived from filename, e.g. "installation" */
  slug: string;

  /**
   * Canonical web path string, e.g. "/wiki/IT/1C/installation".
   * Mirrors route.path for convenient access without destructuring.
   */
  wikiPath: string;

  author?: string;
  updatedAt?: string;
  tags?: string[];
}

/**
 * A wiki category node, built from the directory hierarchy.
 * May have an optional index article (index.md) attached.
 */
export interface WikiCategory {
  /** Slash-joined path, e.g. "IT/1C" */
  id: string;

  /** Human-readable name derived from the last segment, e.g. "1C" */
  name: string;

  /** Full path segments, e.g. ["IT", "1C"] */
  pathSegments: string[];

  /** Direct articles (non-index) in this category */
  articles: WikiArticle[];

  /** Optional parsed index.md content for this category */
  index?: WikiIndex;

  /** Nested sub-categories */
  children: WikiCategory[];
}

/**
 * Parsed category index page (index.md).
 */
export interface WikiIndex extends ContentItem {
  id: string;
  kind?: 'wiki';
  categoryPath: string;
  title: string;
  description?: string;
  content: string;
  tags?: string[];
  updatedAt?: string;
}

/**
 * Flat map of all wiki articles indexed by id.
 */
export type WikiById = Map<string, WikiArticle>;

/**
 * Articles grouped by top-level category key.
 */
export type WikiByCategory = Map<string, WikiArticle[]>;

/**
 * Articles grouped by lower-cased tag.
 */
export type WikiByTag = Map<string, WikiArticle[]>;
