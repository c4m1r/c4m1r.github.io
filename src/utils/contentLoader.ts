/**
 * @legacy-adapter
 *
 * contentLoader.ts — Legacy compatibility shim.
 *
 * New domain and site-shell code should import from src/domain/* or src/lib/*.
 * This file only preserves old OS/app call-sites while content loading is
 * retired into domain slices.
 */

import { type ContentItem } from '../domain/content/types';
import { loadArticles } from '../domain/articles/articles.loader';
import {
  loadAllProjects,
  loadAboutProjects as loadDomainAboutProjects,
  loadProjects as loadDomainProjects,
} from '../domain/projects/projects.loader';
import { loadAppEntries as loadDomainAppEntries } from '../domain/apps/apps.loader';
import { type AppCategoryId, type AppEntry } from '../domain/apps/apps.types';
import { loadWikiArticles as loadDomainWikiArticles, loadWikiCategoryIndex as loadDomainWikiCategoryIndex } from '../domain/wiki/wiki.loader';
import { loadPictures as loadDomainPictures, loadWallpapers as loadDomainWallpapers, type ImageItem } from '../domain/gallery/gallery.loader';
import { loadAboutMe as loadDomainAboutMe, loadLegalNotice as loadDomainLegalNotice } from '../domain/about/about.loader';
import { loadMarkdownContent as loadDomainMarkdownContent } from '../lib/loadMarkdownContent';

export type { ContentItem };
export type { AppCategoryId, AppEntry, ImageItem };
export { resolveImagePath } from '../domain/assets/assetResolver';


export async function loadMarkdownContent(path: string): Promise<string> {
  return loadDomainMarkdownContent(path);
}

export async function loadBlogPosts(language: string = 'en'): Promise<ContentItem[]> {
  return loadArticles(language);
}

export async function loadProjects(): Promise<ContentItem[]> {
  return loadDomainProjects();
}

export async function loadAboutProjects(language: string = 'en'): Promise<ContentItem[]> {
  return loadDomainAboutProjects(language);
}

export async function loadAllProjectEntries(language: string = 'en'): Promise<ContentItem[]> {
  return loadAllProjects(language);
}

export async function loadAppEntries(language: string = 'en'): Promise<AppEntry[]> {
  return loadDomainAppEntries(language);
}

export async function loadWikiCategoryIndex(categoryPath: string, language: string = 'en'): Promise<ContentItem | null> {
  return loadDomainWikiCategoryIndex(categoryPath, language);
}

export async function loadWikiArticles(category?: string, language: string = 'en'): Promise<ContentItem[]> {
  return loadDomainWikiArticles(category, language);
}

export async function loadPictures(): Promise<ImageItem[]> {
  return loadDomainPictures();
}

export async function loadWallpapers(): Promise<ImageItem[]> {
  return loadDomainWallpapers();
}

export async function loadAboutMe(language: string = 'en'): Promise<ContentItem | null> {
  return loadDomainAboutMe(language);
}

export async function loadLegalNotice(language: string = 'en'): Promise<ContentItem | null> {
  return loadDomainLegalNotice(language);
}
