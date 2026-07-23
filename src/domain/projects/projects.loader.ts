import { parseFrontmatter } from '../content/frontmatter';
import { resolveImagePath } from '../assets/assetResolver';
import { type ContentItem } from '../content/types';
import { type Project } from './projects.types';
import { routes } from '../../shells/site/siteRoutes';

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
      projectPath: routes.project(item.id),
      route: {
        path: routes.project(item.id),
        sitePath: routes.project(item.id),
        osUri: `projects://${item.id}`,
        appId: 'projects-grid',
      },
    }));
}
