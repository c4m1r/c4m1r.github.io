/**
 * Утилиты для динамической загрузки контента из content/
 * Поддерживает: blog posts, projects, wiki, images
 */

import { type ContentItem } from '../domain/content/types';
import { parseFrontmatter } from '../domain/content/frontmatter';

export type { ContentItem };

export interface ImageItem {
  id: string;
  name: string;
  path: string;
  thumbnail?: string;
  size?: string;
  date?: string;
}

export type AppCategoryId = 'ready' | 'prototype' | 'webos-emulation';

export interface AppEntry extends ContentItem {
  url?: string;
  iframeTitle?: string;
  badges?: string[];
  platforms?: string[];
  technologies?: string[];
  category?: AppCategoryId;
  description?: string;
}

// Загружаем все изображения EAGER (при сборке)
const imageModules = import.meta.glob('/src/content/pictures/**/*.{jpg,jpeg,png,gif,webp}', { 
  query: '?url',
  import: 'default',
  eager: true 
});

/**
 * Резолвит путь к изображению из markdown в правильный URL для Vite
 */
export function resolveImagePath(imagePath: string): string {
  if (!imagePath) return '';
  
  // Если путь уже обработан (начинается с blob: или http или /assets/), возвращаем как есть
  if (imagePath.startsWith('blob:') || imagePath.startsWith('http') || imagePath.startsWith('/assets/')) {
    return imagePath;
  }
  
  try {
    // Извлекаем имя файла из пути
    const filename = imagePath.split('/').pop();
    if (!filename) return imagePath;
    
    // Ищем файл по имени в загруженных модулях
    for (const modulePath in imageModules) {
      if (modulePath.endsWith(filename)) {
        const resolvedUrl = imageModules[modulePath] as string;
        console.log(`✅ Resolved image: ${imagePath} -> ${resolvedUrl}`);
        return resolvedUrl;
      }
    }
    
    console.warn(`⚠️ Image not found in modules: ${imagePath} (looking for: ${filename})`);
  } catch (error) {
    console.error('❌ Failed to resolve image path:', imagePath, error);
  }
  
  // Если не нашли, возвращаем исходный путь
  return imagePath;
}

/**
 * Загружает markdown файлы из content/blog
 */
export async function loadBlogPosts(language: string = 'en'): Promise<ContentItem[]> {
  const posts: ContentItem[] = [];
  const defaultPreview = new URL('../content/blog/preview.webm', import.meta.url).href;
  const processedIds = new Set<string>();
  
  try {
    // Динамический импорт всех markdown файлов из blog
    const modules = import.meta.glob('../content/blog/*.md', { query: '?raw', import: 'default' });
    
    for (const path in modules) {
      const content = await modules[path]() as string;
      const filename = path.split('/').pop()?.replace('.md', '') || '';
      const relativePath = path.split('../content/blog/')[1] || filename;
      
      // Проверяем язык файла (например, welcome-en.md) - старый формат
      const langMatch = filename.match(/-([a-z]{2})$/);
      const fileLang = langMatch ? langMatch[1] : null;
      const baseId = langMatch ? filename.replace(/-[a-z]{2}$/, '') : filename;
      
      // Пропускаем, если уже обработали этот ID
      if (processedIds.has(baseId)) {
        continue;
      }
      
      // Парсим frontmatter с учётом языка
      const { metadata, body } = parseFrontmatter(content, language);
      const updatedAt = metadata.updatedAt || metadata.updated || metadata.date || '';
      
      // Проверяем, есть ли языковые блоки в контенте
      const hasLanguageBlocks = content.includes('<!-- lang:');
      
      // Если файл содержит языковые блоки, используем его
      if (hasLanguageBlocks) {
        processedIds.add(baseId);
        const resolvedPreview = metadata.preview ? resolveImagePath(metadata.preview) : defaultPreview;
        posts.push({
          id: baseId,
          title: metadata.title || filename,
          content: body,
          date: metadata.date,
          category: metadata.category,
          tags: metadata.tags,
          author: metadata.author,
          updatedAt,
          relativePath,
          preview: resolvedPreview,
        });
      } 
      // Старый формат с отдельными файлами (обратная совместимость)
      else if (fileLang) {
        // Ищем базовый файл без суффикса
        const baseFilePath = path.replace(`-${fileLang}.md`, '.md');
        if (modules[baseFilePath]) {
          // Если есть базовый файл, пропускаем файл с суффиксом
          continue;
        }
        
        // Если это файл нужного языка или английский
        if (fileLang === language || fileLang === 'en') {
          processedIds.add(baseId);
          const resolvedPreview = metadata.preview ? resolveImagePath(metadata.preview) : defaultPreview;
          posts.push({
            id: baseId,
            title: metadata.title || filename,
            content: body,
            date: metadata.date,
            category: metadata.category,
            tags: metadata.tags,
            author: metadata.author,
            updatedAt,
            relativePath,
            preview: resolvedPreview,
          });
        }
      } 
      // Файл без суффикса и без языковых блоков
      else {
        processedIds.add(baseId);
        const resolvedPreview = metadata.preview ? resolveImagePath(metadata.preview) : defaultPreview;
        posts.push({
          id: baseId,
          title: metadata.title || filename,
          content: body,
          date: metadata.date,
          category: metadata.category,
          tags: metadata.tags,
          author: metadata.author,
          updatedAt,
          relativePath,
          preview: resolvedPreview,
        });
      }
    }
  } catch (error) {
    console.error('Failed to load blog posts:', error);
  }
  
  return posts.sort((a, b) => {
    const dateA = Date.parse(a.updatedAt || a.date || '');
    const dateB = Date.parse(b.updatedAt || b.date || '');
    if (!isNaN(dateA) && !isNaN(dateB)) return dateB - dateA;
    if (!isNaN(dateA)) return -1;
    if (!isNaN(dateB)) return 1;
    return b.id.localeCompare(a.id);
  });
}

/**
 * Загружает projects
 */
export async function loadProjects(): Promise<ContentItem[]> {
  const projects: ContentItem[] = [];
  
  try {
    const modules = import.meta.glob('/src/content/projects/*.{md,txt}', { query: '?raw', import: 'default' });
    
    for (const path in modules) {
      const content = await modules[path]() as string;
      const filename = path.split('/').pop()?.replace(/\.(md|txt)$/, '') || '';
      
      const { metadata, body } = parseFrontmatter(content);
      
      projects.push({
        id: filename,
        title: metadata.title || filename,
        content: body,
        category: metadata.category,
        tags: metadata.tags,
      });
    }
  } catch (error) {
    console.error('Failed to load projects:', error);
  }
  
  return projects;
}

/**
 * Загружает проекты из content/about/projects с категориями IT/GameDev/Design
 */
export async function loadAboutProjects(language: string = 'en'): Promise<ContentItem[]> {
  const projects: ContentItem[] = [];
  
  try {
    const modules = import.meta.glob('../content/about/projects/**/*.md', { query: '?raw', import: 'default' });
    
    for (const path in modules) {
      const content = await modules[path]() as string;
      const filename = path.split('/').pop()?.replace('.md', '') || '';
      const relativePath = path.split('../content/about/projects/')[1] || filename;
      const segments = relativePath.split('/').filter(Boolean);
      const category = segments[0] || 'Other'; // IT, Gamedev, Design
      
      // Парсим с учётом языка
      const { metadata, body } = parseFrontmatter(content, language);
      const updatedAt = metadata.updatedAt || metadata.updated || metadata.date || '';
      const defaultPreview = new URL('../content/blog/preview.webm', import.meta.url).href;
      const resolvedPreview = metadata.preview ? resolveImagePath(metadata.preview) : defaultPreview;
      
      projects.push({
        id: filename,
        title: metadata.title || filename,
        content: body,
        date: metadata.date,
        category: category,
        tags: metadata.tags,
        author: metadata.author,
        updatedAt,
        relativePath,
        pathSegments: segments,
        preview: resolvedPreview,
      });
    }
  } catch (error) {
    console.error('Failed to load about projects:', error);
  }
  
  return projects.sort((a, b) => {
    const dateA = Date.parse(a.updatedAt || a.date || '');
    const dateB = Date.parse(b.updatedAt || b.date || '');
    if (!isNaN(dateA) && !isNaN(dateB)) return dateB - dateA;
    if (!isNaN(dateA)) return -1;
    if (!isNaN(dateB)) return 1;
    return b.id.localeCompare(a.id);
  });
}

export async function loadAppEntries(language: string = 'en'): Promise<AppEntry[]> {
  const apps: AppEntry[] = [];

  try {
    const modules = import.meta.glob('../content/apps/*.{md,txt}', { query: '?raw', import: 'default' });

    for (const path in modules) {
      const content = await modules[path]() as string;
      const filename = path.split('/').pop()?.replace(/\.(md|txt)$/, '') || '';
      const { metadata, body } = parseFrontmatter(content, language);
      const rawBadges = Array.isArray(metadata.badges)
        ? metadata.badges
        : metadata.badges
        ? [metadata.badges]
        : [];
      const badges = Array.from(new Set([...rawBadges, 'WEB']));
      const platforms = Array.isArray(metadata.platforms)
        ? metadata.platforms
        : metadata.platforms
        ? [metadata.platforms]
        : [];

      const technologies = Array.isArray(metadata.technologies)
        ? metadata.technologies
        : metadata.technologies
        ? [metadata.technologies]
        : [];

      apps.push({
        id: filename,
        title: metadata.title || filename,
        content: body.trim(),
        description: metadata.description || body.trim(),
        date: metadata.date,
        category: metadata.category,
        tags: metadata.tags,
        url: metadata.url,
        iframeTitle: metadata.iframeTitle,
        badges,
        platforms,
        technologies,
      });
    }
  } catch (error) {
    console.error('Failed to load app entries:', error);
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

/**
 * Загружает index.md файл для категории wiki
 */
export async function loadWikiCategoryIndex(categoryPath: string, language: string = 'en'): Promise<ContentItem | null> {
  try {
    const modules = import.meta.glob('../content/wiki/**/*.md', { query: '?raw', import: 'default' });
    
    // Ищем index.md в указанной категории
    const indexPath = `../content/wiki/${categoryPath}/index.md`;
    
    if (indexPath in modules) {
      const content = await modules[indexPath]() as string;
      const { metadata, body } = parseFrontmatter(content, language);
      
      return {
        id: 'index',
        title: metadata.title || 'Index',
        content: body,
        category: categoryPath,
        pathSegments: categoryPath.split('/').filter(Boolean),
      };
    }
  } catch (error) {
    console.error('Failed to load category index:', error);
  }
  
  return null;
}

/**
 * Загружает wiki статьи (исключая index.md файлы)
 */
export async function loadWikiArticles(category?: string, language: string = 'en'): Promise<ContentItem[]> {
  const articles: ContentItem[] = [];
  
  try {
    const modules = import.meta.glob('../content/wiki/**/*.md', { query: '?raw', import: 'default' });
    
    for (const path in modules) {
      // Пропускаем index.md файлы
      if (path.endsWith('/index.md')) continue;
      
      if (category && !path.includes(`../content/wiki/${category}/`)) continue;
      
      const content = await modules[path]() as string;
      const filename = path.split('/').pop()?.replace('.md', '') || '';
      const relativePath = path.split('../content/wiki/')[1] || filename;
      const segments = relativePath.split('/').filter(Boolean);
      const directories = segments.slice(0, -1);
      const pathCategory = directories[0] || '';
      
      // Парсим с учётом языка
      const { metadata, body } = parseFrontmatter(content, language);
      const updatedAt = metadata.updatedAt || metadata.updated || metadata.date || '';
      
      articles.push({
        id: filename,
        title: metadata.title || filename,
        content: body,
        category: pathCategory,
        tags: metadata.tags,
        date: metadata.date,
        updatedAt,
        relativePath,
        pathSegments: directories,
      });
    }
  } catch (error) {
    console.error('Failed to load wiki articles:', error);
  }
  
  return articles;
}

/**
 * Загружает изображения из content/pictures
 */
export async function loadPictures(): Promise<ImageItem[]> {
  const pictures: ImageItem[] = [];
  
  try {
    // Загружаем все изображения из content/pictures
    const modules = import.meta.glob('/src/content/pictures/**/*.{jpg,jpeg,png,gif,webp}', { 
      query: '?url',
      import: 'default',
      eager: false 
    });
    
    for (const path in modules) {
      const url = await modules[path]() as string;
      const filename = path.split('/').pop() || '';
      const name = filename.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');
      
      pictures.push({
        id: filename,
        name: name,
        path: url,
        thumbnail: url, // В будущем можно добавить генерацию thumbnails
      });
    }
  } catch (error) {
    console.error('Failed to load pictures:', error);
  }
  
  return pictures;
}

/**
 * Загружает обои из content/pictures/wallpapers
 */
export async function loadWallpapers(): Promise<ImageItem[]> {
  const wallpapers: ImageItem[] = [];
  
  try {
    const modules = import.meta.glob('/src/content/pictures/wallpapers/*.{jpg,jpeg,png,webp}', { 
      query: '?url',
      import: 'default',
      eager: false 
    });
    
    for (const path in modules) {
      const url = await modules[path]() as string;
      const filename = path.split('/').pop() || '';
      const name = filename.replace(/\.(jpg|jpeg|png|webp)$/i, '');
      
      wallpapers.push({
        id: filename,
        name: name,
        path: url,
        thumbnail: url,
      });
    }
  } catch (error) {
    console.error('Failed to load wallpapers:', error);
  }
  
  return wallpapers;
}

// Вспомогательные функции парсинга frontmatter и языковых блоков вынесены в src/domain/content/frontmatter.ts


/**
 * Загружает конкретный файл контента
 */
export async function loadContentFile(path: string): Promise<string | null> {
  try {
    const modules = import.meta.glob('/src/content/**/*', { query: '?raw', import: 'default' });
    const fullPath = `/src/content/${path}`;
    
    if (modules[fullPath]) {
      return await modules[fullPath]() as string;
    }
    
    return null;
  } catch (error) {
    console.error(`Failed to load content file: ${path}`, error);
    return null;
  }
}

/**
 * Загружает markdown файл по пути
 */
export async function loadMarkdownContent(path: string): Promise<string> {
  try {
    // Remove .md extension if present
    const cleanPath = path.replace(/\.md$/, '');
    const response = await fetch(`/src/content/${cleanPath}.md`);
    if (!response.ok) {
      throw new Error(`Failed to load ${path}`);
    }
    return await response.text();
  } catch (error) {
    console.error('Error loading markdown:', error);
    throw error;
  }
}

/**
 * Загружает About me контент
 */
export async function loadAboutMe(language: string = 'en'): Promise<ContentItem | null> {
  try {
    const modules = import.meta.glob('../content/about/c4m1r*.md', { query: '?raw', import: 'default' });
    
    // Сначала проверяем базовый файл с языковыми блоками
    const defaultFile = '../content/about/c4m1r.md';
    
    if (modules[defaultFile]) {
      const content = await modules[defaultFile]() as string;
      
      // Проверяем наличие языковых блоков
      if (content.includes('<!-- lang:')) {
        const { metadata, body } = parseFrontmatter(content, language);
        
        return {
          id: 'c4m1r',
          title: metadata.title || 'C4m1r',
          content: body,
          tags: metadata.tags,
        };
      }
    }
    
    // Fallback на старый формат с отдельными файлами
    const langFile = `../content/about/c4m1r-${language}.md`;
    const targetPath = modules[langFile] ? langFile : defaultFile;
    
    if (modules[targetPath]) {
      const content = await modules[targetPath]() as string;
      const { metadata, body } = parseFrontmatter(content);
      
      return {
        id: 'c4m1r',
        title: metadata.title || 'C4m1r',
        content: body,
        tags: metadata.tags,
      };
    }
  } catch (error) {
    console.error('Failed to load about me:', error);
  }
  
  return null;
}

/**
 * Загружает Legal Notice
 */
export async function loadLegalNotice(language: string = 'en'): Promise<ContentItem | null> {
  try {
    const modules = import.meta.glob('../content/about/legal-notice*.md', { query: '?raw', import: 'default' });
    
    // Сначала проверяем базовый файл с языковыми блоками
    const defaultFile = '../content/about/legal-notice.md';
    
    if (modules[defaultFile]) {
      const content = await modules[defaultFile]() as string;
      
      // Проверяем наличие языковых блоков
      if (content.includes('<!-- lang:')) {
        const { metadata, body } = parseFrontmatter(content, language);
        
        return {
          id: 'legal-notice',
          title: metadata.title || 'Legal Notice',
          content: body,
          date: metadata.date,
          updatedAt: metadata.updatedAt || metadata.updated || metadata.date || '',
        };
      }
    }
    
    // Fallback на старый формат с отдельными файлами
    const langFile = `../content/about/legal-notice-${language}.md`;
    const targetPath = modules[langFile] ? langFile : defaultFile;
    
    if (modules[targetPath]) {
      const content = await modules[targetPath]() as string;
      const { metadata, body } = parseFrontmatter(content);
      
      return {
        id: 'legal-notice',
        title: metadata.title || 'Legal Notice',
        content: body,
        date: metadata.date,
        updatedAt: metadata.updatedAt || metadata.updated || metadata.date || '',
      };
    }
  } catch (error) {
    console.error('Failed to load legal notice:', error);
  }
  
  return null;
}

