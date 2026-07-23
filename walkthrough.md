# Final hardening pass after a610aed

## Dependency/tooling status
- Repository baseline was clean before this pass; the latest visible history contains the prior site-shell refactor as `2ab6302`, which includes the earlier `a610aed` work from the previous pass.
- ESLint stack is normalized on a compatible ESLint 9 line: `eslint` 9.39.5, `@eslint/js` 9.39.1, `typescript-eslint` 8.65.0, and `eslint-plugin-react-hooks` 7.1.1.
- `npm ci` now installs the lockfile cleanly with the normalized dependency set.
- `npm audit` was run after a non-forced `npm audit fix`; it now reports `found 0 vulnerabilities`.

## Lint status
- `npm run lint` now completes with 0 errors.
- Warnings were reduced from 58 to 36 by fixing safe issues: useless regex escapes, prefer-const, no-empty-pattern, empty `ContentItem` interface, and obvious `any` in newer section files.
- Remaining warnings are intentionally left because they are legacy typing/hook-dependency cleanup in older site/OS components and would require behaviour-sensitive rewrites.
- Remaining warning categories: legacy `any`, older hook dependency warnings, and Fast Refresh export-shape warnings.

## App lazy loading
- `App.tsx` lazy-loads `BlogSite`, `Terminal`, `WindowsXP`, and `WebOS` with a neutral `Suspense` fallback.
- `GrubMenu` remains statically imported for a fast boot menu.
- Build output contains separate chunks for BlogSite, Terminal, Desktop/WebOS, WindowsXP/theme code, and AsciiAurora assets.

## Direct URL hydration
- `/site/` and `/site/blog` open site/blog mode through `AppContext` and `BlogSite` routing.
- `/site/blog/:id` hydrates `activeSection === 'blog'` and opens the matching post.
- `/site/news/:id` has a post-load news effect so `activeNews` is restored after async news data is available.
- `/site/wiki/:slug` hydrates the matching wiki article after wiki data is available.
- `/site/projects/:id` hydrates project detail when projects are loaded.
- `/site/gallery/:id` stores `selectedPictureId` for the gallery page lightbox handoff.
- `/site/apps/:id` has a post-load apps effect so `selectedApp` is restored after app metadata is available.
- `/site/search?q=test` hydrates the search page and controlled query state.

## Import boundary audit
- `src/domain/*` has no imports from `src/shells/*`, `src/components/*`, `src/themes/*`, or styles.
- `src/shells/site/*` has no imports from desktop shell or theme implementation directories.
- `src/shells/desktop/*` has no imports from site sections.
- `BlogSite`, `contentRegistry`, new site sections, and site hooks avoid direct `utils/contentLoader` imports where safe.
- Old OS apps may still import `utils/contentLoader`; that file remains a legacy compatibility layer.

## ASCII scope
- ASCII is still enabled only in Blog Hero, Terminal, Desktop `theme === 'ubuntu'`, and Desktop `theme === 'webos'`.
- ASCII remains disabled for XP, Win98, Win7 and non-Hero site sections.
- `AsciiAurora` still uses direct `pre.textContent`, throttled RAF, reduced-motion static frame, `IntersectionObserver`, `document.hidden`, and cleanup on unmount.

## DesktopShell boundary
- `DesktopShell` remains the transitional single desktop runtime entrypoint.
- `themes/webos/index.tsx` and `themes/winxp/index.tsx` now render `DesktopShell` while boot/login/welcome screens remain owned by their theme folders.
- The next focused desktop pass should move runtime/window manager/icon/start-menu orchestration into `shells/desktop`, while assets/boot/login/styles stay under `themes`.

## Checks
- `npm ci` passed.
- `npm run typecheck` passed.
- `npm run lint` passed with 0 errors and 36 warnings.
- `npm run build` passed.
- `git diff --check` passed.
- `npm audit` passed with 0 vulnerabilities.

# Final architecture optimization audit

## Architecture verdict
- The site shell is ready for release audit as a route-driven composer: canonical URL parsing, direct hydration, search, Apps/CV extraction, and AsciiAurora scoping are in place.
- Transitional areas remain intentionally bounded rather than rewritten: the desktop runtime implementation still lives in the legacy WebOS Desktop file, and several domain wrappers still delegate old glob scanners through the compatibility loader.

## Lint warnings
- Baseline at the start of this pass: 36 warnings, 0 errors.
- Current status after safe cleanup: 18 warnings, 0 errors.
- Fixed categories: obvious `no-explicit-any` in newer site sections, BlogSite compatibility casts, gallery/wiki section props, and readonly theme option typing.
- Remaining categories: behavior-sensitive hook dependency warnings in older runtime/app code, Fast Refresh export-shape warnings, and a small number of legacy `any` types in parser/desktop compatibility surfaces.

## DesktopShell boundary
- `DesktopShell` remains the public entrypoint used by the theme wrappers.
- `DesktopRuntime` now centralizes the single transitional import of `themes/webos/Desktop` and documents the next extraction boundary.
- Remaining TODO: move runtime/window manager/icons/start-menu orchestration into `shells/desktop`, while keeping theme assets/boot/login/styles in `themes`.

## contentLoader boundary
- `BlogSite`, `contentRegistry`, and new site sections do not import `utils/contentLoader` directly.
- `utils/contentLoader.ts` remains a legacy compatibility layer for old OS/app consumers and for a few domain wrappers that still delegate existing glob scanners.
- Remaining TODO: move gallery/project/about/app glob scanners fully into their domain slices before deleting the compatibility layer.

## Bundle/media plan
- See `docs/nerv/reports/bundle-media-optimization-plan.md` for the top large media assets, boot-critical vs optional asset notes, lazy-load candidates, and visual-review constraints.

## CSS split plan
- See `docs/nerv/reports/css-split-plan.md` for the target CSS structure, scoped selector audit findings, and safe next steps.

## ASCII status
- Confirmed enabled surfaces: Blog Hero, Terminal, Desktop Ubuntu, and Desktop WebOS.
- Confirmed disabled surfaces: XP, Win98, Win7, and non-Hero site sections.
- Performance contract remains intact: no React state per frame, RAF cleanup, visibility cleanup, IntersectionObserver cleanup, reduced-motion static frame, and pointer-events disabled.

## Checks
- `npm run typecheck` passed.
- `npm run lint` passed with 0 errors and 18 warnings.
- `npm run build` passed with non-blocking Browserslist and legacy WinXP CSS asset warnings.
- `npm audit` passed with 0 vulnerabilities.
- `git diff --check` passed.

# contentLoader retirement pass

## Moved loaders
- `domain/assets/assetResolver.ts` now owns the eager picture asset glob, `findAssetByFilename`, `getPictureAssetEntries`, and `resolveImagePath`.
- `domain/gallery/gallery.loader.ts` now owns `loadPictures`, `loadWallpapers`, `loadGalleryItems`, `loadPictureItems`, and `loadWallpaperItems` without importing `utils/contentLoader`.
- `domain/projects/projects.loader.ts` now owns standard project scanning, about-project scanning, frontmatter parsing, language-aware project content, dedupe, and `loadAllProjects` route metadata.
- `domain/about/about.loader.ts` now owns `loadAboutMe` and `loadLegalNotice` markdown discovery and language fallback logic.
- `domain/apps/apps.loader.ts` now owns app markdown scanning, metadata parsing, app category typing, and app route metadata.

## contentLoader status
- `utils/contentLoader.ts` has been reduced to a legacy compatibility shim.
- It no longer owns asset globs, gallery scanners, project scanners, about/legal scanners, or app scanners.
- Blog/wiki compatibility exports also delegate to existing domain article/wiki loaders.

## Compatibility exports
- Kept old exports for `resolveImagePath`, `loadBlogPosts`, `loadProjects`, `loadAboutProjects`, `loadAppEntries`, `loadWikiCategoryIndex`, `loadWikiArticles`, `loadPictures`, `loadWallpapers`, `loadMarkdownContent`, `loadAboutMe`, and `loadLegalNotice` so old OS apps and legacy call-sites keep working.
- Kept compatibility types for `ContentItem`, `AppCategoryId`, `AppEntry`, and `ImageItem`.

## Import boundary
- `rg "utils/contentLoader" src/domain src/apps/BlogSite.tsx src/shells/site src/domain/content/contentRegistry.ts` returned no matches after the move.
- Domain loaders, BlogSite, site sections, and contentRegistry no longer import the compatibility layer.

## Build warning status
- Production build still succeeds.
- The previous duplicated static/dynamic import warnings did not appear in this pass.
- Remaining non-blocking warnings are unchanged in category: stale Browserslist data and legacy WinXP CSS asset URL warnings for `restore.png` and `restore_hover.png`.

## Checks
- `npm run typecheck` passed.
- `npm run lint` passed with 0 errors and 18 warnings.
- `npm run build` passed.
- `npm audit` passed with 0 vulnerabilities.
- `git diff --check` passed.

# Safe lint/build warnings pass after contentLoader retirement

## Baseline
- Lint baseline: 0 errors, 18 warnings.
- Build baseline: stale Browserslist/caniuse-lite warning plus WinXP `restore.png` and `restore_hover.png` CSS asset resolution warnings.
- Baseline top chunks/assets included DesktopShell around 238 KB, app index around 185 KB, BlogSite around 125 KB, plus large media assets such as `user.gif` and `preview.webm`.

## Fixed lint warnings
- Replaced frontmatter parser `any` usage with lightweight `FrontmatterPrimitive`, `FrontmatterValue`, and `FrontmatterMetadata` types.
- Replaced desktop app registry `React.ComponentType<any>` with `React.ComponentType<Record<string, unknown>>`.
- Wrapped DOOM build selection in `useMemo` as recommended by the hook linter.
- Removed the unnecessary media player `progress` dependency by formatting audio time directly during render.
- Removed the unnecessary Desktop `fallbackAssets.gamesIcon` hook dependency.
- Replaced the WebOS `ContextMenu` star export with an explicit component export.

## Left intentionally
- BlogSite `syncFromLocation` hook dependency warnings are left because changing them touches route hydration behavior.
- GrubMenu keyboard/boot hook dependency warnings are left because changing them risks boot-navigation behavior.
- Desktop Window mousemove/mouseup dependency warnings are left because changing them risks drag/resize behavior.
- AppContext and WeatherContext Fast Refresh warnings are left because moving public context exports requires a broader API/file split.

## Build warnings
- Updated Browserslist data with `npx update-browserslist-db@latest`; production build no longer prints the stale caniuse-lite warning.
- Fixed WinXP restore button CSS URLs by pointing both restore states to the existing `Restore.png` asset; production build no longer prints restore icon resolution warnings.
- Remaining build warning status: no build warnings observed in the final run.

## Checks
- `npm run typecheck` passed.
- `npm run lint` passed with 0 errors and 9 warnings.
- `npm run build` passed with no build warnings observed.
- `npm audit` passed with 0 vulnerabilities.
- `git diff --check` passed.

# Behavior-aware lint cleanup pass

## Baseline
- Baseline lint: 0 errors, 9 warnings.
- Baseline typecheck: clean.
- Baseline build: successful; Browserslist warning appeared until local node_modules was refreshed from the updated lockfile.

## Fixed warnings
- AppContext: split context types/defaults/core/useApp into separate files so `AppContext.tsx` only exports the `AppProvider` component.
- WeatherContext: split weather types/defaults/core/useWeather into separate files so `WeatherContext.tsx` only exports the `WeatherProvider` component.
- BlogSite: wrapped `syncFromLocation` in `useCallback` and wired route-sync effects to the stable callback while preserving direct URL hydration inputs.
- GrubMenu: memoized boot options and wrapped `handleBoot` in `useCallback` so countdown, keyboard navigation, Enter boot, and mouse click boot share stable dependencies.
- Window: wrapped drag/resize mouse handlers in `useCallback`, moved saved restore position/size into refs, and kept listener effects dependent on stable handlers.

## Left intentionally
- No lint warnings remain after this pass.
- No behavior-sensitive lint suppressions were added.

## Manual behavior checklist
- Direct site URLs to verify in browser smoke testing: `/site/`, `/site/blog`, `/site/blog/:id`, `/site/news/:id`, `/site/wiki/:slug`, `/site/projects/:id`, `/site/gallery/:id`, `/site/apps/:id`, `/site/search?q=test`.
- Browser back/forward should continue to use BlogSite route sync.
- GRUB keyboard boot paths to verify: ArrowUp/ArrowDown/W/S selection, Enter boot, mouse click boot, and countdown autoboot.
- Desktop/window interactions to verify: drag, resize, maximize, restore, close, minimize, multiple windows, and XP/Win7/Ubuntu/WebOS theme wrappers.

## Checks
- `npm run typecheck` passed.
- `npm run lint` passed with 0 errors and 0 warnings.
- `npm run build` passed.
- `npm audit` passed with 0 vulnerabilities.
- `git diff --check` passed.

# Desktop runtime extraction pass 1

## What moved
- Added `src/shells/desktop/desktopTypes.ts` for desktop runtime contracts: system commands, shell props, geometry structs, selection box, and icon shape.
- Added `src/shells/desktop/desktopConstants.ts` for runtime-level constants: desktop path, Minesweeper window id, custom wallpaper storage key, default viewport, drag z-index, XP-family theme ids, and OS CSS class map.
- Added pure runtime helpers under `src/shells/desktop/runtime/`: viewport/selection geometry, custom wallpaper storage, OS class/theme-family helpers, and icon z-index.
- Updated the legacy Desktop implementation to consume those contracts/helpers without moving stateful runtime logic.

## What stayed legacy
- `themes/webos/Desktop.tsx` still owns window-manager orchestration, icon drag, selection state, context menu state, taskbar interactions, start menu/run/task-manager coordination, custom wallpaper events, fullscreen/volume/notification UI, and app launch callbacks.
- These areas stayed legacy because they are behavior-sensitive and need browser/manual verification before stateful extraction.

## Boundary
- Runtime ownership target: `src/shells/desktop` and `src/shells/desktop/runtime`.
- Theme ownership target: boot/login/welcome, theme assets, theme CSS, theme sounds, and visual theme configuration.
- `DesktopShell` remains the public entrypoint.
- `DesktopRuntime` remains the only allowed direct adapter to legacy `themes/webos/Desktop.tsx`.
- New runtime helpers/types should be added under `shells/desktop`; theme files must not receive new window-manager logic.

## Import audit
- `rg "themes/webos/Desktop" src -n` returns only `src/shells/desktop/DesktopRuntime.tsx`.
- `rg "DesktopRuntime" src -n` confirms the adapter is only used by `DesktopShell` and documented in its own file.
- `rg "DesktopShell" src -n` confirms `themes/webos/index.tsx` and `themes/winxp/index.tsx` render the public shell entrypoint.
- ASCII scope was rechecked by import search: only Hero, Terminal, and WebOS Desktop import/render `AsciiAurora`, with Desktop gated to Ubuntu/WebOS.

## Manual checklist
- See `docs/nerv/reports/desktop-runtime-manual-checklist.md`.

## Checks
- `npm run typecheck` passed.
- `npm run lint` passed with 0 errors and 0 warnings.
- `npm run build` passed; the environment still prints the stale Browserslist advisory from local caniuse-lite data, but the production build succeeds.
- `npm audit` passed with 0 vulnerabilities.
- `git diff --check` passed.

## Next
- Move window manager hook.
- Move icon selection hook.
- Move context menu orchestration.
- Move start menu orchestration.

# CSS split pass 1

## What moved
- Created the target CSS structure under `src/styles/site`, `src/styles/markdown`, `src/styles/effects`, `src/styles/os/base`, `src/styles/os/themes`, and `src/styles/os/apps`.
- Moved OS tokens and base runtime styles into `src/styles/os/base`.
- Moved OS wrapper theme styles into `src/styles/os/themes`.
- Moved default CV app OS styles into `src/styles/os/apps/cv.css` while keeping theme overrides under OS-root selectors.
- Kept `AsciiAurora.css` component-scoped.

## Scoping
- `src/styles/os/index.css` now imports base tokens, base runtime styles, app defaults, and theme overrides in that order.
- WinXP CSS asset URLs were updated for the new `src/styles/os/themes/winxp.css` location.
- The global `pre` font selector in `src/index.css` was narrowed to `.prose pre` and `.markdown-body pre`.
- No broad OS theme rewrite was performed.

## Left intentionally
- `src/index.css` still contains site and markdown blocks pending a visual-regression pass.
- `src/themes/winxp/xp.css` remains legacy because boot/login/welcome surfaces import it directly.
- Theme-specific Minesweeper overrides remain in OS theme files because they are already OS-root scoped and need visual review before moving.

## Report
- See `docs/nerv/reports/css-split-results.md`.

## Checks
- `npm run typecheck` passed.
- `npm run lint` passed with 0 errors and 0 warnings.
- `npm run build` passed; the environment still prints the stale Browserslist/caniuse-lite advisory, but the production build succeeds.
- `npm audit` passed with 0 vulnerabilities.
- `git diff --check` passed.

## Next
- Move markdown typography into `src/styles/markdown`.
- Move site-only selectors into `src/styles/site`.
- Split legacy theme CSS after visual smoke testing.
- Move remaining OS app overrides after per-app visual review.

# Non-media post-release pass

## Desktop runtime extraction pass 2
- Added pure desktop runtime helpers for selection-box normalization, icon hit-testing, and app-registry lookup under `src/shells/desktop/runtime/`.
- Updated legacy `themes/webos/Desktop.tsx` to consume those helpers for selection intersection and app lookup while leaving window manager state, drag/resize, taskbar, start menu, sounds, wallpaper events, and ASCII gating untouched.

## CSS split pass 2
- Moved markdown/prose typography from `src/index.css` into `src/styles/markdown/markdown.css`, aggregated by `src/styles/markdown/index.css`.
- Moved site Hero visual-polish selectors and PCB signal keyframes from `src/index.css` into `src/styles/site/site.css`, aggregated by `src/styles/site/index.css`.
- Left shared globals, theme tokens, glass/neumorphic utilities, weather utilities, and OS CSS in their existing files to avoid visual or runtime regressions.

## Visual polish verification
- Verified by code that `.webm` / `.mp4` markdown and project previews still render as video while image previews stay images.
- Verified Terminal pseudo commands and section shortcuts use existing canonical `/site` routes without adding React Router or changing the route contract.
- Verified ASCII scope remains Blog Hero, Terminal, Ubuntu desktop, and WebOS desktop only.
- Verified mobile overflow guard remains conservative and desktop drag/resize code was not changed.

## Import audits
- `rg "themes/webos/Desktop" src -n`: only `DesktopRuntime.tsx` imports the legacy Desktop implementation; README references are documentation.
- `rg "from ['\"].*themes/" src/shells/desktop -n`: only the transitional `DesktopRuntime.tsx` adapter imports from themes.
- `rg "from ['\"].*shells/site" src/shells/desktop -n`: no matches.
- `rg "AsciiAurora" src -n`: allowed occurrences only in Hero, Terminal, the effect component/lib/index, documentation, and WebOS Desktop guarded to Ubuntu/WebOS.
- `rg "utils/contentLoader" src/apps/BlogSite.tsx src/shells/site src/domain/content/contentRegistry.ts -n || true`: no matches.

## Checks
- `npm run typecheck` passed.
- `npm run lint` passed.
- `npm run build` passed; the environment still prints the stale Browserslist/caniuse-lite advisory, but the production build succeeds.
- `npm audit` passed with 0 vulnerabilities.
- `git diff --check` passed.

## Next
- Manual desktop interaction smoke.
- Desktop runtime extraction pass 3: window manager hook planning only after manual desktop verification.
- CSS split pass 3: XP/theme CSS after visual review.
- Media optimization remains manually handled by the user and was not performed here.
