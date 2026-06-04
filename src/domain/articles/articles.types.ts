import { type ContentItem } from '../content/types';

/**
 * A single blog article / post.
 * Extends ContentItem so it fits directly into ContentGraph with kind: 'articles'.
 */
export interface Article extends ContentItem {
  kind: 'articles';

  /** Slug-style id, e.g. "hello-world" */
  id: string;

  /** Resolved preview image / video URL */
  preview?: string;

  /** Reading time estimate in minutes */
  readingTime?: number;

  author?: string;
  updatedAt?: string;
  tags?: string[];
  category?: string;

  /** Relative markdown file path, e.g. "hello-world.md" */
  relativePath?: string;

  /** Canonical web path, e.g. "/blog/hello-world" */
  articlePath: string;

  /** Brief description / summary of the article */
  summary?: string;

  /** Related references */
  related?: string[];
}
