import { type ContentItem } from '../content/types';

/**
 * A single project entry.
 * Extends ContentItem for ContentGraph compatibility (kind: 'projects').
 */
export interface Project extends ContentItem {
  kind: 'projects';

  /** Preview image or video URL */
  preview?: string;

  /** Project tags / technologies */
  tags?: string[];

  /** High-level category (e.g. "game", "tool", "web") */
  category?: string;

  author?: string;
  updatedAt?: string;

  /** Canonical web path, e.g. "/projects/hexcraft" */
  projectPath: string;
}
