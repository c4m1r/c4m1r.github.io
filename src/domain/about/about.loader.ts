import { parseFrontmatter } from '../content/frontmatter';
import { type AboutContentItem } from './about.types';

const aboutModules = import.meta.glob('/src/content/about/c4m1r*.md', {
  query: '?raw',
  import: 'default',
});

const legalModules = import.meta.glob('/src/content/about/legal-notice*.md', {
  query: '?raw',
  import: 'default',
});

const getString = (value: unknown): string | undefined => typeof value === 'string' ? value : undefined;
const toStringArray = (value: unknown): string[] | undefined => {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string');
  return typeof value === 'string' ? [value] : undefined;
};

export async function loadAboutMe(language: string = 'en'): Promise<AboutContentItem | null> {
  try {
    const defaultFile = '/src/content/about/c4m1r.md';

    if (aboutModules[defaultFile]) {
      const content = await aboutModules[defaultFile]() as string;

      if (content.includes('<!-- lang:')) {
        const { metadata, body } = parseFrontmatter(content, language);

        return {
          id: 'c4m1r',
          title: getString(metadata.title) || 'C4m1r',
          content: body,
          tags: toStringArray(metadata.tags),
        };
      }
    }

    const langFile = `/src/content/about/c4m1r-${language}.md`;
    const targetPath = aboutModules[langFile] ? langFile : defaultFile;

    if (aboutModules[targetPath]) {
      const content = await aboutModules[targetPath]() as string;
      const { metadata, body } = parseFrontmatter(content);

      return {
        id: 'c4m1r',
        title: getString(metadata.title) || 'C4m1r',
        content: body,
        tags: toStringArray(metadata.tags),
      };
    }
  } catch (error) {
    console.error('[AboutLoader] Failed to load about me:', error);
  }

  return null;
}

export async function loadLegalNotice(language: string = 'en'): Promise<AboutContentItem | null> {
  try {
    const defaultFile = '/src/content/about/legal-notice.md';

    if (legalModules[defaultFile]) {
      const content = await legalModules[defaultFile]() as string;

      if (content.includes('<!-- lang:')) {
        const { metadata, body } = parseFrontmatter(content, language);
        const updatedAt = getString(metadata.updatedAt) || getString(metadata.updated) || getString(metadata.date) || '';

        return {
          id: 'legal-notice',
          title: getString(metadata.title) || 'Legal Notice',
          content: body,
          date: getString(metadata.date),
          updatedAt,
        };
      }
    }

    const langFile = `/src/content/about/legal-notice-${language}.md`;
    const targetPath = legalModules[langFile] ? langFile : defaultFile;

    if (legalModules[targetPath]) {
      const content = await legalModules[targetPath]() as string;
      const { metadata, body } = parseFrontmatter(content);
      const updatedAt = getString(metadata.updatedAt) || getString(metadata.updated) || getString(metadata.date) || '';

      return {
        id: 'legal-notice',
        title: getString(metadata.title) || 'Legal Notice',
        content: body,
        date: getString(metadata.date),
        updatedAt,
      };
    }
  } catch (error) {
    console.error('[AboutLoader] Failed to load legal notice:', error);
  }

  return null;
}
