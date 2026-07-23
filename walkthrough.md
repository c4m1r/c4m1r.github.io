# Pre-effect stabilization pass

## Mojibake cleanup
- `BlogSite.tsx` keeps the restored theme emoji set: default `🌿`, vaporwave `🌴`, cyberpunk `⚡`, skeuomorphism `📱`, pcb `🔌`.
- No new visual effects or design changes were added during stabilization.

## Route consistency
- Browser-facing site URLs are centralized behind `siteUrlConfig` and `siteRoutes`.
- `BlogSite.tsx` browser history updates use site route helpers instead of relative route literals.
- Existing `/site/blog`, `/site/wiki`, and `/site/news` entry points remain supported.

## Remaining search integration
- `src/domain/search/useGlobalSearch.ts` exists, but the search UI has not yet been migrated to it.
- This pass intentionally leaves the hook disconnected so search integration can be handled separately from URL stabilization.

## Static URL readiness
- Canonical site URLs are defined only for the site shell under `/site/`.
- Desktop/WebOS/XP/Win7/Ubuntu shells keep runtime pseudo URLs in content route metadata through `osUri` and app ids.
- GitHub Pages direct links are covered by `public/404.html`, which preserves the requested path and redirects back to the SPA entry point.
- `AppContext` restores `/site/` redirect targets and starts the site shell only for canonical site paths; other paths keep the GRUB-first flow.

# Canonical route contract pass

## Canonical site URLs
- `src/shells/site/siteUrlConfig.ts` is the route contract and single source for `/site/` canonical path templates.
- `src/shells/site/siteRoutes.ts` consumes that config for route helpers and parsing.

## OS pseudo URLs
- `ContentRouteInfo.sitePath` is reserved for canonical browser paths.
- `ContentRouteInfo.osUri` is reserved for desktop/app pseudo URLs.
- `ContentRouteInfo.appId` points to the app registry target used by OS shells.
- `content-reader` is registered as a hidden desktop app id for article route metadata without adding a desktop/start-menu shortcut.

## Loaders updated
- News, articles, wiki, projects, and gallery loaders populate `route.sitePath`, `route.osUri`, and `route.appId`.
- `route.path` remains as a temporary compatibility alias for existing consumers.

## Static fallback
- `public/404.html` provides a minimal GitHub Pages SPA fallback without duplicating another fallback file.

## Checks
- `npm run typecheck` passed.
- `npm run lint` still stops before linting due to the existing ESLint `@typescript-eslint/no-unused-expressions` / `allowShortCircuit` rule-load error.
- `npm run build` passed with existing Vite/Browserslist/chunk warnings.

# Global search hook integration

## Search hook integration
- `BlogSite.tsx` now uses `useGlobalSearch` as the single search source for the site search page instead of manually aggregating posts, wiki, projects, gallery, and news in render.
- `SearchSection.tsx` owns the search page rendering and keeps UI-specific result cards outside the domain hook.

## URL query support
- Tag clicks now route to `/site/search?q=<tag>` via `routes.search(tag)`.
- Manual search input updates the `q` query parameter through a debounced `replaceState`, avoiding browser history writes for every keystroke.

## Result routing
- Search results route by kind: articles to blog posts, wiki to wiki articles, news to news detail, projects to project detail, gallery to the gallery item URL/lightbox state, and apps to app detail when present in search results.

## Checks
- `npm run typecheck` passed.
- `npm run lint` is still blocked by the existing ESLint rule-load error.
- `npm run build` passed with existing Vite/Browserslist/chunk warnings.
- Screenshot capture was attempted with Playwright but blocked because browser download from the Playwright CDN returned 403 in this environment.

# Emergency build repair

- GitHub Pages build failed after `edffc135 ver.0.6.6`.
- Root cause: duplicate and malformed `syncFromLocation` in `BlogSite.tsx` left a duplicate symbol and unbalanced component structure.
- Secondary check: Terminal route and pseudo command declarations were verified and restored at module scope.
- Build restored after this emergency repair pass.
