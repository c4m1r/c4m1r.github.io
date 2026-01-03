/**
 * Утилиты для динамической загрузки контента из content/
 * Поддерживает: blog posts, projects, wiki, images
 */

export interface ContentItem {
  id: string;
  title: string;
  content: string;
  date?: string;
  category?: string;
  tags?: string[];
  author?: string;
  updatedAt?: string;
  relativePath?: string;
  pathSegments?: string[];
  preview?: string;
}

export interface ImageItem {
  id: string;
  name: string;
  path: string;
  thumbnail?: string;
  size?: string;
  date?: string;
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
    const modules = import.meta.glob('../content/blog/*.md', { as: 'raw' });
    
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
          preview: metadata.preview || defaultPreview,
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
            preview: metadata.preview || defaultPreview,
          });
        }
      } 
      // Файл без суффикса и без языковых блоков
      else {
        processedIds.add(baseId);
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
          preview: metadata.preview || defaultPreview,
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
    const modules = import.meta.glob('/src/content/projects/*.{md,txt}', { as: 'raw' });
    
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
    const modules = import.meta.glob('../content/about/projects/**/*.md', { as: 'raw' });
    
    for (const path in modules) {
      const content = await modules[path]() as string;
      const filename = path.split('/').pop()?.replace('.md', '') || '';
      const relativePath = path.split('../content/about/projects/')[1] || filename;
      const segments = relativePath.split('/').filter(Boolean);
      const category = segments[0] || 'Other'; // IT, Gamedev, Design
      
      // Парсим с учётом языка
      const { metadata, body } = parseFrontmatter(content, language);
      const updatedAt = metadata.updatedAt || metadata.updated || metadata.date || '';
      
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
        preview: metadata.preview || new URL('../content/blog/preview.webm', import.meta.url).href,
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

/**
 * Загружает wiki статьи
 */
export async function loadWikiArticles(category?: string, language: string = 'en'): Promise<ContentItem[]> {
  const articles: ContentItem[] = [];
  
  try {
    const modules = import.meta.glob('../content/wiki/**/*.md', { as: 'raw' });
    
    for (const path in modules) {
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
      as: 'url',
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
      as: 'url',
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

/**
 * Извлекает контент для конкретного языка из языковых блоков
 */
function parseLanguageBlocks(content: string, language: string): string {
  // Паттерн для поиска языкового блока: <!-- lang:CODE -->content<!-- /lang:CODE -->
  const langPattern = new RegExp(
    `<!--\\s*lang:${language}\\s*-->([\\s\\S]*?)<!--\\s*/lang:${language}\\s*-->`,
    'i'
  );
  const match = content.match(langPattern);
  
  if (match && match[1]) {
    return match[1].trim();
  }
  
  // Fallback на английский, если запрошенный язык не найден
  if (language !== 'en') {
    const enPattern = /<!--\s*lang:en\s*-->([\s\S]*?)<!--\s*\/lang:en\s*-->/i;
    const enMatch = content.match(enPattern);
    if (enMatch && enMatch[1]) {
      return enMatch[1].trim();
    }
  }
  
  // Если языковых блоков нет, возвращаем весь контент
  return content;
}

/**
 * Парсит frontmatter из markdown и извлекает контент для языка
 */
function parseFrontmatter(content: string, language?: string): { metadata: Record<string, any>; body: string } {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    const body = language ? parseLanguageBlocks(content, language) : content;
    return { metadata: {}, body };
  }
  
  const [, frontmatter, rawBody] = match;
  const metadata: Record<string, any> = {};
  
  // Простой парсинг YAML-like frontmatter
  frontmatter.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) return;
    
    const key = line.slice(0, colonIndex).trim();
    let value: any = line.slice(colonIndex + 1).trim();
    
    // Парсим массивы
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value
        .slice(1, -1)
        .split(',')
        .map((v: string) => v.trim().replace(/^["']|["']$/g, ''));
    }
    
    // Удаляем кавычки
    if (typeof value === 'string' && ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))) {
      value = value.slice(1, -1);
    }
    
    metadata[key] = value;
  });
  
  // Обрабатываем переводы заголовков (title_en, title_ru и т.д.)
  if (language && metadata[`title_${language}`]) {
    metadata.title = metadata[`title_${language}`];
  } else if (language && language !== 'en' && metadata.title_en) {
    // Fallback на английский заголовок
    metadata.title = metadata.title_en;
  }
  
  // Извлекаем контент для конкретного языка, если указан
  const body = language ? parseLanguageBlocks(rawBody, language) : rawBody;
  
  return { metadata, body };
}

/**
 * Загружает конкретный файл контента
 */
export async function loadContentFile(path: string): Promise<string | null> {
  try {
    const modules = import.meta.glob('/src/content/**/*', { as: 'raw' });
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
    const modules = import.meta.glob('../content/about/c4m1r*.md', { as: 'raw' });
    
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
    const modules = import.meta.glob('../content/about/legal-notice*.md', { as: 'raw' });
    
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

