# CSS Split Results

## Baseline audit
- CSS entrypoints remain `src/main.tsx` importing `src/index.css` and `src/themes/index.css`.
- `src/themes/index.css` continues to aggregate legacy theme CSS and the OS wrapper stylesheet.
- `AsciiAurora.css` remains component-scoped and imported by `AsciiAurora.tsx` directly.
- App-local CSS remains app-local for Calculator and Minesweeper.

## Target structure created
```text
src/styles/
  site/
  markdown/
  effects/
  os/
    base/
    themes/
    apps/
```

## Moved blocks
- Moved OS tokens from `src/styles/os/tokens.css` to `src/styles/os/base/tokens.css`.
- Moved OS runtime primitives from `src/styles/os/os-base.css` to `src/styles/os/base/os-base.css`.
- Moved OS theme wrappers from `src/styles/os/{classic,winxp,win7,ubuntu}.css` to `src/styles/os/themes/`.
- Moved default CV app OS styling from `src/styles/os/base/os-base.css` to `src/styles/os/apps/cv.css`.
- Updated `src/styles/os/index.css` to preserve import order: base tokens, base runtime, app defaults, then theme overrides.
- Updated WinXP CSS asset URLs after moving `winxp.css` one directory deeper.

## Scoping audit
- OS wrapper files remain scoped by `.os-win-98`, `.os-winxp`, `.os-win7`, `.os-ubuntu`, or OS component classes.
- Theme-specific CV/Minesweeper overrides remain under their OS roots.
- No site selectors were moved into OS CSS.
- `AsciiAurora.css` remains scoped to `.ascii-aurora` and `.ascii-aurora__pre`.
- The previous global `pre` font selector in `src/index.css` was narrowed to `.prose pre` and `.markdown-body pre` to avoid leaking into OS/app/effect surfaces.

## Left intentionally
- `src/index.css` still owns site and markdown blocks because a full extraction would require visual regression testing across BlogSite and reader apps.
- `src/themes/winxp/xp.css` remains legacy theme CSS because it is directly imported by boot/login/welcome surfaces and contains behavior-sensitive retro theme selectors.
- Theme-level app overrides for Minesweeper remain in theme files because they are already OS-root scoped and moving them would require manual visual comparison.
- Calculator and Minesweeper app-local CSS imports were not moved because they are already app-owned and not part of the shared OS wrapper stylesheet.

## Build result
- `npm run typecheck` passed.
- `npm run lint` passed with 0 errors and 0 warnings.
- `npm run build` passed; the environment still prints the stale Browserslist/caniuse-lite advisory, but the production build succeeds.
- `npm audit` passed with 0 vulnerabilities.
- `git diff --check` passed.

## Next
- Extract `.prose` / `.markdown-body` blocks from `src/index.css` into `src/styles/markdown/` after visual regression testing.
- Extract site-only layout/section styles from `src/index.css` into `src/styles/site/`.
- Split legacy `src/themes/winxp/xp.css` into boot/login/theme files only after XP/Win98/WebOS visual smoke testing.
- Move remaining OS-root-scoped app overrides into `src/styles/os/apps/` only after per-app visual review.
