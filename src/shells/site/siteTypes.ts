/**
 * siteTypes.ts
 *
 * Unified type definitions for the c4m1r.github.io site shell.
 * Shares route/section types between BlogSite container, Navigation,
 * and page components.
 */

export type Section =
  | 'home'
  | 'about'
  | 'wiki'
  | 'cv'
  | 'gallery'
  | 'blog'
  | 'search'
  | 'project'
  | 'apps'
  | 'news';

export type NavSection =
  | 'home'
  | 'about'
  | 'wiki'
  | 'gallery'
  | 'blog'
  | 'search'
  | 'apps'
  | 'news';

// Navigation component visible sections
export type SectionNav =
  | 'home'
  | 'about'
  | 'wiki'
  | 'gallery'
  | 'blog'
  | 'search'
  | 'apps'
  | 'news';

// Translation keys for navigation labels
export type TranslationSectionNav =
  | 'home'
  | 'about'
  | 'wiki'
  | 'cv'
  | 'gallery'
  | 'blog'
  | 'search'
  | 'apps'
  | 'news';
