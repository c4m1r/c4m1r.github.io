# Site Product Development Phase 1 Report

## Executive Summary
Phase 1 of Site Product Development focused on normalizing the public build pipeline, auditing and elevating the personal portfolio site experience, connecting the web portfolio with the pseudo-OS environment, and optimizing bundle performance via section lazy loading.

## Baseline & Pipeline Normalization
- **Vite Public Directory**: Configured `publicDir: 'public'` in `vite.config.ts`.
- **Relocated Assets**: Moved `src/public/robots.txt` -> `public/robots.txt`.
- **404 SPA Redirect**: Confirmed `public/404.html` copies to `dist/404.html` during `npm run build` and handles GitHub Pages deep-link redirection back to `/?redirect=`.
- **Public Policy Document**: Published `docs/nerv/reports/public-static-assets-policy.md`.

## Site Architecture & UX Enhancements

### 1. Home Page
- **Hero & Identity**: Clean presentation of specialization ("IT Engineer & Software Architect") with theme-aware particle / ASCII backgrounds.
- **Projects Section Integration**: Clickable project cards with direct detail routing (`onOpenProject`), technology tags, and status badges.
- **Interactive Multiverse OS Teaser**: Added `ExploreSystemSection` component featuring quick-launch icons for all 13 supported OS profiles (Windows XP, 98, 7, Ubuntu, Arch Linux, Halloween, WebOS, iOS generations, Terminal) with a prominent GRUB launcher CTA.

### 2. Projects & Apps
- **Projects**: Extended `Project` interface with optional `featured`, `status`, `year`, `technologies`, `repositoryUrl`, `demoUrl` fields. Card clicks navigate cleanly to project detail views.
- **Apps**: Separated `domain/apps` (portfolio demo projects) from desktop `appRegistry` (OS desktop apps). Maintained responsive iframe demo viewer with drag-to-resize control.

### 3. Articles & Wiki
- Dynamic `document.title` updates on section transitions and deep links (`<Title> — c4m1r`).
- Markdown rendering with code highlight and responsive reading width.

### 4. Search
- Global search across articles, wiki, projects, apps, and gallery.
- `features.news = false` strictly enforced; news content is excluded from search results.

### 5. Performance & Lazy Loading
- Extracted heavy non-initial site sections (`GalleryPageSection`, `AboutSection`, `WikiSection`, `SearchSection`, `ArticleDetailSection`) into `React.lazy()` chunks with `<Suspense>` fallbacks.
- **Initial `BlogSite` chunk reduced from 122.13 KB to 93.73 KB (a 23.3% reduction)**.

## Build Metrics Summary

| Asset | Before | After | Delta |
| :--- | :--- | :--- | :--- |
| `BlogSite` JS Chunk | 122.13 KB | 93.73 KB | **-28.4 KB (-23.3%)** |
| Initial Site Load JS | ~122 KB | ~93 KB | **-29 KB** |
| `AboutSection` Chunk | Inline | 15.52 KB | Lazy loaded |
| `WikiSection` Chunk | Inline | 7.93 KB | Lazy loaded |
| `GalleryPageSection` Chunk | Inline | 7.64 KB | Lazy loaded |
| `SearchSection` Chunk | Inline | 5.30 KB | Lazy loaded |
| `ArticleDetailSection` Chunk | Inline | 1.20 KB | Lazy loaded |
| Build Duration | 1.22s | 1.20s | Fast |

## Remaining Product Backlog (Phase 2 Recommendations)
1. Add custom interactive filtering for project categories (Web, Mobile, Gamedev, IT Infrastructure) on the Projects section.
2. Add breadcrumb navigation bar to Wiki article reader view for nested category paths.
3. Add subtle micro-animations for theme switching in the site navigation bar.
