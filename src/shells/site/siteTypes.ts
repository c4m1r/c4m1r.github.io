/**
 * siteTypes.ts
 *
 * Single source of truth for site-shell section and navigation types.
 * Shared between BlogSite, Navigation, siteRoutes, and section components.
 *
 * Type hierarchy:
 *   Section        — every possible app state (includes 'cv' and 'project')
 *   NavSection     — sections reachable via top-nav (excludes 'cv', 'project')
 *   SectionNav     — alias for NavSection; used by Navigation component props
 *   TranslationSectionNav — i18n label keys (includes 'cv' for the dict entry)
 */

/**
 * All possible application sections.
 * 'cv' and 'project' are internal states not surfaced as top-level nav items.
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

/**
 * Sections that can be reached via the Navigation component.
 * 'news' IS a first-class nav item displayed in the nav bar.
 */
export type NavSection =
  | 'home'
  | 'about'
  | 'wiki'
  | 'gallery'
  | 'blog'
  | 'search'
  | 'apps'
  | 'news';

/**
 * Alias for NavSection — used by Navigation.tsx props so existing
 * import `type SectionNav` continues to work without renaming.
 */
export type SectionNav = NavSection;

/**
 * i18n translation key set for nav labels in uiTexts.nav.
 * Includes 'cv' because the translation dictionary carries a cv label,
 * even though 'cv' is not a standalone NavSection.
 */
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

export type SiteRouteKind =
  | 'home'
  | 'blog'
  | 'article'
  | 'news'
  | 'newsItem'
  | 'wiki'
  | 'wikiItem'
  | 'gallery'
  | 'galleryItem'
  | 'about'
  | 'projects'
  | 'projectItem'
  | 'apps'
  | 'appItem'
  | 'search';

export type SiteCanonicalPath = `/site/${string}`;

export interface SiteRouteTarget {
  kind: SiteRouteKind;
  path: SiteCanonicalPath;
}
