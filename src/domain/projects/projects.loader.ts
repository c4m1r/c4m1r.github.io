import { parseFrontmatter } from '../content/frontmatter';
import { resolveImagePath } from '../assets/assetResolver';
import { type ContentItem } from '../content/types';
import { type Project } from './projects.types';
import { sitePathBuilders } from '../content/sitePathBuilders';

const projectModules = import.meta.glob('/src/content/projects/*.{md,txt}', {
  query: '?raw',
  import: 'default',
});

const aboutProjectModules = import.meta.glob('/src/content/about/projects/**/*.md', {
  query: '?raw',
  import: 'default',
});

const defaultPreview = new URL('../../content/blog/preview.webm', import.meta.url).href;

const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string');
  return typeof value === 'string' ? [value] : [];
};

const getString = (value: unknown): string | undefined => typeof value === 'string' ? value : undefined;

const sortByDateThenId = (a: ContentItem, b: ContentItem) => {
  const dateA = Date.parse(a.updatedAt || a.date || '');
  const dateB = Date.parse(b.updatedAt || b.date || '');
  if (!isNaN(dateA) && !isNaN(dateB)) return dateB - dateA;
  if (!isNaN(dateA)) return -1;
  if (!isNaN(dateB)) return 1;
  return b.id.localeCompare(a.id);
};

export async function loadProjects(): Promise<ContentItem[]> {
  const projects: ContentItem[] = [];

  try {
    for (const path in projectModules) {
      const content = await projectModules[path]() as string;
      const filename = path.split('/').pop()?.replace(/\.(md|txt)$/, '') || '';
      const { metadata, body } = parseFrontmatter(content);

      projects.push({
        id: filename,
        title: getString(metadata.title) || filename,
        content: body,
        category: getString(metadata.category),
        tags: toStringArray(metadata.tags),
      });
    }
  } catch (error) {
    console.error('[ProjectsLoader] Failed to load projects:', error);
  }

  return projects;
}

export async function loadAboutProjects(language: string = 'en'): Promise<ContentItem[]> {
  const projects: ContentItem[] = [];

  try {
    for (const path in aboutProjectModules) {
      const content = await aboutProjectModules[path]() as string;
      const filename = path.split('/').pop()?.replace('.md', '') || '';
      const relativePath = path.split('/src/content/about/projects/')[1] || filename;
      const segments = relativePath.split('/').filter(Boolean);
      const category = segments[0] || 'Other';
      const { metadata, body } = parseFrontmatter(content, language);
      const updatedAt = getString(metadata.updatedAt) || getString(metadata.updated) || getString(metadata.date) || '';
      const resolvedPreview = metadata.preview ? resolveImagePath(String(metadata.preview)) : defaultPreview;

      projects.push({
        id: filename,
        title: getString(metadata.title) || filename,
        content: body,
        date: getString(metadata.date),
        category,
        tags: toStringArray(metadata.tags),
        author: getString(metadata.author),
        updatedAt,
        relativePath,
        pathSegments: segments,
        preview: resolvedPreview,
      });
    }
  } catch (error) {
    console.error('[ProjectsLoader] Failed to load about projects:', error);
  }

  return projects.sort(sortByDateThenId);
}

/**
 * Loads all project content items (standard + about projects) and
 * normalises them into domain Project objects with kind: 'projects' and route metadata.
 */
export async function loadAllProjects(language: string = 'en'): Promise<Project[]> {
  const [standard, about] = await Promise.all([
    loadProjects(),
    loadAboutProjects(language),
  ]);

  const all = [...standard, ...about];
  const seen = new Set<string>();

  return all
    .filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    })
    .map((item) => ({
      ...item,
      kind: 'projects' as const,
      projectPath: sitePathBuilders.project(item.id),
      route: {
        path: sitePathBuilders.project(item.id),
        sitePath: sitePathBuilders.project(item.id),
        osUri: `projects://${item.id}`,
        appId: 'projects-grid',
      },
    }));
}
