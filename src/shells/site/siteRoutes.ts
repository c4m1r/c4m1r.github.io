/**
 * siteRoutes.ts
 *
 * Routing helper functions and path parsing for the site shell.
 * Decouples routing logic from BlogSite UI component.
 */

import { Section } from './siteTypes';

export const basePath = '/site/';

export interface ParsedRoute {
  section: Section;
  postId: string | null;
  wikiSlug: string | null;
  newsId: string | null;
}

/**
 * Maps a Section key to its canonical path.
 */
export function sectionToPath(section: Section): string {
  switch (section) {
    case 'home':
      return basePath;
    case 'blog':
      return `${basePath}blog`;
    case 'about':
      return `${basePath}about`;
    case 'wiki':
      return `${basePath}wiki`;
    case 'cv':
      return `${basePath}cv`;
    case 'gallery':
      return `${basePath}gallery`;
    case 'search':
      return `${basePath}search`;
    case 'apps':
      return `${basePath}apps`;
    case 'news':
      return `${basePath}news`;
    case 'project':
      return `${basePath}about/projects`;
    default:
      return basePath;
  }
}

/**
 * Formats route URL helpers for specific resources.
 */
export const routes = {
  home: () => basePath,
  about: () => `${basePath}about`,
  projects: () => `${basePath}about/projects`,
  cv: () => `${basePath}cv`,
  gallery: () => `${basePath}gallery`,
  apps: () => `${basePath}apps`,
  search: () => `${basePath}search`,
  news: (id?: string) => (id ? `${basePath}news/${id}` : `${basePath}news`),
  blog: (id?: string) => (id ? `${basePath}blog/${id}.md` : `${basePath}blog`),
  wiki: (slug?: string) => (slug ? `${basePath}wiki/${slug}` : `${basePath}wiki`),
};

/**
 * Parses a pathname into a structured route descriptor.
 */
export function parsePath(pathname: string): ParsedRoute {
  const rest = pathname.replace(basePath, '').replace(/^\/+/, '');

  const route: ParsedRoute = {
    section: 'home',
    postId: null,
    wikiSlug: null,
    newsId: null,
  };

  if (!rest) {
    return route;
  }

  if (rest === 'blog') {
    route.section = 'blog';
    return route;
  }
  if (rest === 'about') {
    route.section = 'about';
    return route;
  }
  if (rest === 'wiki') {
    route.section = 'wiki';
    return route;
  }
  if (rest === 'cv') {
    route.section = 'about'; // Keep cv mapping to about for backwards compatibility
    return route;
  }
  if (rest === 'gallery') {
    route.section = 'gallery';
    return route;
  }
  if (rest === 'apps') {
    route.section = 'apps';
    return route;
  }
  if (rest === 'search') {
    route.section = 'search';
    return route;
  }
  if (rest === 'news') {
    route.section = 'news';
    return route;
  }

  if (rest.startsWith('news/')) {
    route.section = 'news';
    route.newsId = decodeURIComponent(rest.replace(/^news\//, '').replace(/\.md$/, ''));
    return route;
  }

  if (rest.startsWith('wiki/')) {
    route.section = 'wiki';
    route.wikiSlug = decodeURIComponent(rest.replace(/^wiki\//, '').replace(/\.md$/, ''));
    return route;
  }

  // Handle post match slug fallback
  const cleaned = rest.startsWith('blog/') ? rest.replace(/^blog\//, '') : rest;
  const slug = cleaned.replace(/\.md$/, '');
  route.section = 'home';
  route.postId = slug;
  return route;
}
