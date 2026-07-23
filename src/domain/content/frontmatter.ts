import { type ContentDisplay, type ContentRouteInfo, type ContentVisibility } from './types';

/**
 * Извлекает контент для конкретного языка из языковых блоков
 */
export function parseLanguageBlocks(content: string, language: string): string {
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

type FrontmatterPrimitive = string | boolean | number;
type FrontmatterList = string[];
type FrontmatterObject = Record<string, unknown>;
export type FrontmatterValue = FrontmatterPrimitive | FrontmatterList | FrontmatterObject;

export interface FrontmatterMetadata extends Record<string, FrontmatterValue | ContentVisibility | ContentDisplay | ContentRouteInfo | undefined> {
  id?: string;
  title?: string;
  title_ru?: string;
  title_en?: string;
  date?: string;
  category?: string;
  author?: string;
  updatedAt?: string;
  updated?: string;
  preview?: string;
  summary?: string;
  excerpt?: string;
  description?: string;
  url?: string;
  iframeTitle?: string;
  tags?: string[];
  related?: string[];
  badges?: string[] | string;
  platforms?: string[] | string;
  technologies?: string[] | string;
  visibility?: ContentVisibility;
  display?: ContentDisplay;
  route?: ContentRouteInfo;
}

function parseValue(val: string): FrontmatterPrimitive | FrontmatterList {
  const v = val.trim();
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  // inline arrays [one, two]
  if (v.startsWith('[') && v.endsWith(']')) {
    return v
      .slice(1, -1)
      .split(',')
      .map((item) => {
        const trimmed = item.trim();
        return trimmed.replace(/^["']|["']$/g, '');
      });
  }
  // Remove surrounding quotes if any
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.slice(1, -1);
  }
  return v;
}

const isFrontmatterObject = (value: FrontmatterValue | ContentVisibility | ContentDisplay | ContentRouteInfo | undefined): value is FrontmatterObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Парсит frontmatter из markdown и извлекает контент для языка
 */
export function parseFrontmatter(content: string, language?: string): { metadata: FrontmatterMetadata; body: string } {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    const body = language ? parseLanguageBlocks(content, language) : content;
    return { metadata: {}, body };
  }

  const [, frontmatter, rawBody] = match;
  const metadata: FrontmatterMetadata = {};

  const lines = frontmatter.split('\n');
  let currentParentKey: string | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    // Calculate indentation level
    const leadingSpaces = line.length - line.trimStart().length;
    const trimmedLine = line.trim();

    // Check if it's a list item
    if (trimmedLine.startsWith('- ')) {
      if (currentParentKey) {
        const itemVal = parseValue(trimmedLine.substring(2));
        if (!Array.isArray(metadata[currentParentKey])) {
          metadata[currentParentKey] = [];
        }
        const targetList = metadata[currentParentKey];
        if (Array.isArray(targetList)) {
          if (Array.isArray(itemVal)) {
            targetList.push(...itemVal);
          } else {
            targetList.push(String(itemVal));
          }
        }
      }
      continue;
    }

    // Regular key-value or parent key
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const key = line.slice(0, colonIndex).trim();
    const rawValue = line.slice(colonIndex + 1).trim();

    if (leadingSpaces === 0) {
      currentParentKey = key;
      if (!rawValue) {
        // Parent key starting a nested block (or array)
        metadata[key] = {};
      } else {
        metadata[key] = parseValue(rawValue);
      }
    } else {
      // Indented block under current parent
      if (currentParentKey) {
        // Ensure parent is an object
        if (!isFrontmatterObject(metadata[currentParentKey])) {
          metadata[currentParentKey] = {};
        }
        const targetObject = metadata[currentParentKey];
        if (isFrontmatterObject(targetObject)) {
          targetObject[key] = parseValue(rawValue);
        }
      }
    }
  }

  // Обрабатываем переводы заголовков (title_en, title_ru и т.д.)
  const localizedTitle = language ? metadata[`title_${language}`] : undefined;
  if (typeof localizedTitle === 'string') {
    metadata.title = localizedTitle;
  } else if (language && language !== 'en' && typeof metadata.title_en === 'string') {
    // Fallback на английский заголовок
    metadata.title = metadata.title_en;
  }

  // Обрабатываем переводы описаний
  const localizedDescription = language ? metadata[`description_${language}`] : undefined;
  if (typeof localizedDescription === 'string') {
    metadata.description = localizedDescription;
  } else if (language && language !== 'en' && typeof metadata.description_en === 'string') {
    metadata.description = metadata.description_en;
  }

  const body = language ? parseLanguageBlocks(rawBody, language) : rawBody;

  return { metadata, body: body.trim() };
}
