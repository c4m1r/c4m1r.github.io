# Visual Polish Pass

## Scope
Small visual/runtime polish only. No loader, route helper, desktop runtime extraction, dependency, or architecture changes were made.

## Patch summary
- Fixed `.webm` preview rendering where project cards and desktop project cards still used `<img>` for video previews.
- Updated markdown rendering so image syntax pointing to `.webm` / `.mp4` emits a muted looping `<video>` instead of a broken `<img>`.
- Added small Hero readability classes and theme-scoped polish for Frutiger Aero, Vaporwave, Cyberpunk, and PCB.
- Lowered Ubuntu/WebOS desktop ambient ASCII opacity without changing ASCII scope or renderer logic.
- Added minimal terminal pseudo-commands (`htop`, `mc`) and section shortcuts (`news`, `wiki`, `projects`, `gallery`, `apps`, `search`) that navigate to existing canonical site routes.
- Added conservative focus-visible styling inside glass/neumorphic surfaces and a page-level horizontal overflow guard.

## WebM display
- Site project cards now render `.webm` / `.mp4` previews with `<video autoplay loop muted playsInline>`.
- Desktop ProjectsGrid cards now render `.webm` / `.mp4` previews with `<video autoplay loop muted playsInline>`.
- Markdown image syntax now maps video URLs to `<video>` markup.

## Theme polish
- Frutiger Aero: added subtle glass/bubble overlay and warmer translucent highlights in Hero.
- Vaporwave: added neon text glow for Hero/Footer gradient text and a light grid overlay.
- Cyberpunk: added neon title glow and a faint industrial/scanline Hero texture.
- PCB/circuit: increased card/glass contrast slightly and added a reduced-motion-safe signal wave overlay in Hero; ASCII renderer was not changed.
- Default/skeuomorphism: no new ASCII or major visual redesign.

## Desktop / ASCII scope
- Ubuntu desktop ambient ASCII opacity changed from `0.18` to `0.14`.
- WebOS desktop ambient ASCII opacity changed from `0.14` to `0.12`.
- XP, Win98, and Win7 still do not render desktop ASCII.
- Blog Hero / Terminal / Ubuntu desktop / WebOS desktop remain the only ASCII surfaces.

## Mobile / focus
- Added `max-width: 100%` and `overflow-x: hidden` on `html, body` to prevent accidental mobile horizontal scrollbars.
- Added scoped focus-visible ring for controls inside `.glass`, `.neu`, and Hero scroll button surfaces.
- Hero title/subtitle use balanced text wrapping and theme-aware text shadows for readability.

## Terminal
- `help` now lists `htop`, `mc`, and site section shortcuts.
- `htop` prints a pseudo runtime process view.
- `mc` prints a two-column pseudo file browser with site material shortcuts.
- `news`, `wiki`, `projects`, `gallery`, `apps`, `search`, `/news`, `/wiki`, `/projects`, `/gallery`, `/apps`, `/search`, `blog`, and `site` navigate to existing canonical `/site` routes.

## Checks
- `npm run typecheck` passed.
- `npm run lint` passed with 0 errors and 0 warnings.
- `npm run build` passed; the environment still prints the stale Browserslist/caniuse-lite advisory, but the production build succeeds.
- `npm audit` passed with 0 vulnerabilities.
- `git diff --check` passed.

## Risks
- Browser visual smoke is still recommended for theme subjective polish: Frutiger Aero glass/bubbles, Vaporwave/Cyberpunk neon readability, PCB signal overlay, and mobile overflow.
- Terminal navigation uses full-page navigation to existing canonical site paths; no React Router or route contract changes were introduced.

# Emergency build repair

- GitHub Pages build failed after `edffc135 ver.0.6.6`.
- Root cause: duplicate and malformed `syncFromLocation` in `BlogSite.tsx` left a duplicate symbol and unbalanced component structure.
- Secondary check: Terminal route and pseudo command declarations were verified and restored at module scope.
- Build restored after this emergency repair pass.
