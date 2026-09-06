import { type ContentItem } from '../content/types';

/**
 * A single project entry.
 * Extends ContentItem for ContentGraph compatibility (kind: 'projects').
 */
export interface Project extends ContentItem {
  kind: 'projects';

  /** Preview image or video URL */
  preview?: string;

  /** Project tags / keywords */
  tags?: string[];

  /** High-level category (e.g. "IT", "Gamedev", "Design", "Web", "Mobile") */
  category?: string;

  author?: string;
  updatedAt?: string;

  /** Optional metadata fields for rich project experience */
  featured?: boolean;
  status?: string;
  year?: string;
  technologies?: string[];
  repositoryUrl?: string;
  demoUrl?: string;

  /** Canonical web path, e.g. "/projects/hexcraft" */
  projectPath: string;
}
