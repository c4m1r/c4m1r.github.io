/**
 * siteRoutes.ts
 *
 * Routing helper functions and path parsing for the site shell.
 * Decouples routing logic from BlogSite UI component.
 */

import { Section, type SiteCanonicalPath, type SiteRouteKind, type SiteRouteTarget } from './siteTypes';
import { siteUrlConfig } from './siteUrlConfig';

export const basePath = siteUrlConfig.basePath;

export interface ParsedRoute {
  section: Section;
  postId: string | null;
  wikiSlug: string | null;
  newsId: string | null;
  projectId: string | null;
  galleryItemId: string | null;
  appId: string | null;
  searchQuery: string | null;
}

/**
 * Maps a Section key to its canonical path.
 */
export function sectionToPath(section: Section): string {
  switch (section) {
    case 'home':
      return basePath;
    case 'blog':
      return siteUrlConfig.routes.blog;
    case 'about':
      return siteUrlConfig.routes.about;
    case 'wiki':
      return siteUrlConfig.routes.wiki;
    case 'cv':
      return siteUrlConfig.routes.about;
    case 'gallery':
      return siteUrlConfig.routes.gallery;
    case 'search':
      return siteUrlConfig.routes.search;
    case 'apps':
      return siteUrlConfig.routes.apps;
    case 'news':
      return siteUrlConfig.routes.news;
    case 'project':
      return siteUrlConfig.routes.projects;
    default:
      return basePath;
  }
}

/**
 * Replaces a single route template parameter with an encoded value.
 */
const fillRouteParam = (template: string, param: string, value: string): SiteCanonicalPath =>
  template.replace(param, encodeURIComponent(value)) as SiteCanonicalPath;

/**
 * Formats route URL helpers for specific resources.
 */
export const routes = {
  home: (): SiteCanonicalPath => siteUrlConfig.routes.home,
  about: (): SiteCanonicalPath => siteUrlConfig.routes.about,
  projects: (): SiteCanonicalPath => siteUrlConfig.routes.projects,
  project: (id: string): SiteCanonicalPath => fillRouteParam(siteUrlConfig.routes.projectItem, ':id', id),
  cv: (): SiteCanonicalPath => siteUrlConfig.routes.about,
  gallery: (): SiteCanonicalPath => siteUrlConfig.routes.gallery,
  galleryItem: (id: string): SiteCanonicalPath => fillRouteParam(siteUrlConfig.routes.galleryItem, ':id', id),
  apps: (): SiteCanonicalPath => siteUrlConfig.routes.apps,
  app: (id: string): SiteCanonicalPath => fillRouteParam(siteUrlConfig.routes.appItem, ':id', id),
  search: (query?: string): SiteCanonicalPath => (query ? `${siteUrlConfig.routes.search}?q=${encodeURIComponent(query)}` : siteUrlConfig.routes.search),
  news: (id?: string): SiteCanonicalPath => (id ? fillRouteParam(siteUrlConfig.routes.newsItem, ':id', id) : siteUrlConfig.routes.news),
  blog: (id?: string): SiteCanonicalPath => (id ? fillRouteParam(siteUrlConfig.routes.article, ':id', id) : siteUrlConfig.routes.blog),
  wiki: (slug?: string): SiteCanonicalPath => (slug ? fillRouteParam(siteUrlConfig.routes.wikiItem, ':slug', slug) : siteUrlConfig.routes.wiki),
};

export function makeSiteRouteTarget(kind: SiteRouteKind, path: SiteCanonicalPath): SiteRouteTarget {
  return { kind, path };
}

/**
 * Parses a pathname into a structured route descriptor.
 */
export function parsePath(pathname: string): ParsedRoute {
  const [pathOnly, queryString = ''] = pathname.split('?');
  const rest = pathOnly.replace(basePath, '').replace(/^\/+/, '');

  const route: ParsedRoute = {
    section: 'home',
    postId: null,
    wikiSlug: null,
    newsId: null,
    projectId: null,
    galleryItemId: null,
    appId: null,
    searchQuery: null,
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
  if (rest === 'about/projects' || rest === 'projects') {
    route.section = 'about';
    return route;
  }
  if (rest === 'search') {
    route.section = 'search';
    route.searchQuery = new URLSearchParams(queryString).get('q');
    return route;
  }
  if (rest === 'news') {
    route.section = 'news';
    return route;
  }


  if (rest.startsWith('projects/')) {
    route.section = 'project';
    route.projectId = decodeURIComponent(rest.replace(/^projects\//, ''));
    return route;
  }

  if (rest.startsWith('gallery/')) {
    route.section = 'gallery';
    route.galleryItemId = decodeURIComponent(rest.replace(/^gallery\//, ''));
    return route;
  }

  if (rest.startsWith('apps/')) {
    route.section = 'apps';
    route.appId = decodeURIComponent(rest.replace(/^apps\//, ''));
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

  if (rest.startsWith('blog/')) {
    route.section = 'blog';
    route.postId = decodeURIComponent(rest.replace(/^blog\//, '').replace(/\.md$/, ''));
    return route;
  }

  // Handle legacy bare post slug fallback
  const slug = rest.replace(/\.md$/, '');
  route.section = 'home';
  route.postId = decodeURIComponent(slug);
  return route;
}
