import { parseFrontmatter } from '../content/frontmatter';
import { sitePathBuilders } from '../content/sitePathBuilders';
import { type AppCategoryId, type AppEntry } from './apps.types';

const appModules = import.meta.glob('/src/content/apps/*.{md,txt}', {
  query: '?raw',
  import: 'default',
});

const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string');
  return typeof value === 'string' ? [value] : [];
};

const isAppCategory = (value: unknown): value is AppCategoryId =>
  value === 'ready' || value === 'prototype' || value === 'webos-emulation';

export async function loadAppEntries(language: string = 'en'): Promise<AppEntry[]> {
  const apps: AppEntry[] = [];

  try {
    for (const path in appModules) {
      const content = await appModules[path]() as string;
      const filename = path.split('/').pop()?.replace(/\.(md|txt)$/, '') || '';
      const { metadata, body } = parseFrontmatter(content, language);
      const rawBadges = toStringArray(metadata.badges);
      const badges = Array.from(new Set([...rawBadges, 'WEB']));
      const platforms = toStringArray(metadata.platforms);
      const technologies = toStringArray(metadata.technologies);
      const appPath = sitePathBuilders.app(filename);

      apps.push({
        id: filename,
        kind: 'apps',
        title: typeof metadata.title === 'string' ? metadata.title : filename,
        content: body.trim(),
        description: typeof metadata.description === 'string' ? metadata.description : body.trim(),
        date: typeof metadata.date === 'string' ? metadata.date : undefined,
        category: isAppCategory(metadata.category) ? metadata.category : undefined,
        tags: toStringArray(metadata.tags),
        url: typeof metadata.url === 'string' ? metadata.url : undefined,
        iframeTitle: typeof metadata.iframeTitle === 'string' ? metadata.iframeTitle : undefined,
        badges,
        platforms,
        technologies,
        route: {
          path: appPath,
          sitePath: appPath,
          osUri: `apps://${filename}`,
          appId: filename,
        },
      });
    }
  } catch (error) {
    console.error('[AppsLoader] Failed to load app entries:', error);
  }

  return apps.sort((a, b) => {
    const dateA = Date.parse(a.date || '');
    const dateB = Date.parse(b.date || '');
    if (!isNaN(dateA) && !isNaN(dateB)) return dateB - dateA;
    if (!isNaN(dateA)) return -1;
    if (!isNaN(dateB)) return 1;
    return b.id.localeCompare(a.id);
  });
}
