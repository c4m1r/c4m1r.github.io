import { type ContentItem, type ContentGraph } from './types';
import { buildContentGraph } from './contentGraph';
import {
  loadAppEntries,
  loadAboutMe,
  loadLegalNotice,
} from '../../utils/contentLoader';
import { loadNewsItems } from '../news/news.loader';
import { loadWikiArticles } from '../wiki/wiki.loader';
import { loadArticles } from '../articles/articles.loader';
import { loadAllProjects } from '../projects/projects.loader';
import { loadGalleryItems } from '../gallery/gallery.loader';

/**
 * Loads all system content items asynchronously and tags them with their corresponding ContentKind.
 */
export async function loadAllContent(language: string = 'en'): Promise<ContentItem[]> {
  const allItems: ContentItem[] = [];

  try {
    // 0. News
    const newsItems = await loadNewsItems(language);
    allItems.push(...newsItems.map(item => ({ ...item, kind: 'news' as const })));

    // 1. Articles (Blog)
    const articles = await loadArticles(language);
    allItems.push(...articles);

    // 2. Projects (Standard & About Projects)
    const projects = await loadAllProjects(language);
    allItems.push(...projects);


    // 3. Apps
    const apps = await loadAppEntries(language);
    allItems.push(...apps.map(item => ({ ...item, kind: 'apps' as const })));

    // 4. Wiki
    const wikiArticles = await loadWikiArticles(undefined, language);
    allItems.push(...wikiArticles.map(item => ({ ...item, kind: 'wiki' as const })));

    // 5. About (About Me & Legal Notice)
    const aboutMe = await loadAboutMe(language);
    if (aboutMe) {
      allItems.push({ ...aboutMe, kind: 'about' as const });
    }

    const legalNotice = await loadLegalNotice(language);
    if (legalNotice) {
      allItems.push({ ...legalNotice, kind: 'about' as const });
    }

    // 6. Gallery (Pictures & Wallpapers) — via domain layer
    const galleryItems = await loadGalleryItems();
    allItems.push(...galleryItems);

  } catch (error) {
    console.error('[ContentRegistry] Error loading content items:', error);
  }

  return allItems;
}

/**
 * Loads all content items and builds a unified ContentGraph
 */
export async function buildRegistryGraph(language: string = 'en'): Promise<ContentGraph> {
  const items = await loadAllContent(language);
  return buildContentGraph(items);
}
