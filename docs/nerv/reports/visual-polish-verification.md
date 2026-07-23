# Visual polish verification

## Video previews
- `markdownToHtml` still maps `.webm` / `.mp4` image syntax to muted looping `<video>` markup and keeps non-video URLs as lazy `<img>` markup.
- `ProjectsSection` and `ProjectsGrid` both use extension guards so `.webm` / `.mp4` previews render as `<video>` while image previews remain `<img>`.
- No media files were changed, converted, compressed, or deleted.

## Terminal commands
- Terminal `help`, `clear`, empty input, and unknown command handling remain intact.
- `htop` and `mc` are pseudo-output commands only.
- `site`, `blog`, `news`, `wiki`, `projects`, `gallery`, `apps`, `search`, and their slash-prefixed variants map to existing canonical `/site` route helpers.
- Full-page navigation continues to use existing canonical paths and does not introduce React Router or change the route contract.

## ASCII scope
- Allowed ASCII render sites remain: Blog Hero, Terminal, Desktop `theme === 'ubuntu'`, and Desktop `theme === 'webos'`.
- Desktop ASCII remains absent for XP, Win98, and Win7 because the render guards in `themes/webos/Desktop.tsx` only match Ubuntu/WebOS.
- No non-Hero site section imports or renders `AsciiAurora`.

## Mobile overflow
- The horizontal overflow guard remains limited to `html, body` max-width/overflow-x safeguards in `src/index.css`.
- Desktop window dragging/resize logic was not changed in this verification pass.
- CSS split moved site Hero selectors without adding new global overflow or transform behavior.

## Checks to repeat manually
- Browser route smoke for Terminal shortcuts into `/site` sections.
- Hero visual smoke across default, Frutiger Aero, Vaporwave, Cyberpunk, PCB, and skeuomorphism.
- Desktop smoke for XP/Win98/Win7/Ubuntu/WebOS with special attention to icon selection box and app launch.

# Emergency build repair

- GitHub Pages build failed after `edffc135 ver.0.6.6`.
- Root cause: duplicate and malformed `syncFromLocation` in `BlogSite.tsx` left a duplicate symbol and unbalanced component structure.
- Secondary check: Terminal route and pseudo command declarations were verified and restored at module scope.
- Build restored after this emergency repair pass.
