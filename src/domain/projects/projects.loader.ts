import { loadProjects, loadAboutProjects } from '../../utils/contentLoader';
import { type Project } from './projects.types';
import { routes } from '../../shells/site/siteRoutes';

/**
 * Loads all project content items (standard + about projects) and
 * normalises them into domain Project objects with kind: 'projects' and route metadata.
 *
 * Delegates to contentLoader functions to preserve existing parsing logic.
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
