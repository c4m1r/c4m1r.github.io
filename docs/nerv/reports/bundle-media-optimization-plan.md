# Bundle and media optimization plan

## Scope

This is an audit-only plan. No assets were deleted, recompressed, renamed, or visually changed in this pass.

## Top source media assets

| Rank | Asset | Size | Current role | Recommendation |
| --- | --- | ---: | --- | --- |
| 1 | `src/themes/winxp/assets/user.gif` | ~3.0 MB | XP/user visual asset | Deduplicate with avatar copies if they are byte-identical; review animation quality before converting. |
| 2 | `src/themes/winxp/assets/avatars/profile.gif` | ~3.0 MB | XP profile/avatar asset | Confirm whether it duplicates `user.gif`; if yes, share one module or generated public asset. |
| 3 | `src/themes/ios6/assets/user.gif` | ~3.0 MB | iOS-style user asset | Keep optional to theme chunk; evaluate WebP/AVIF only after visual QA. |
| 4 | `src/themes/ios6/assets/avatars/profile.gif` | ~3.0 MB | iOS-style avatar asset | Confirm duplication with the theme user GIF before changing. |
| 5 | `src/content/blog/preview.webm` | ~1.6 MB | Blog article preview media | Keep lazy with BlogSite/content chunk; consider poster + lower bitrate encode. |
| 6 | `src/content/pictures/wallpapers/ios/ios6-background-1.png` | ~1.0 MB | Gallery/wallpaper content | Convert gallery variants to WebP/AVIF candidates after screenshot comparison. |
| 7 | `src/themes/win7/assets/boot/boot-windows-logo.gif` | ~945 KB | Win7 boot animation | Required only for Win7 boot flow; keep in optional OS chunk. |
| 8 | `src/content/pictures/wallpapers/ios/ios6-background-4.png` | ~862 KB | Gallery/wallpaper content | WebP/AVIF candidate, not boot-critical. |
| 9 | `src/themes/winxp/assets/icons/Connection Status.png` | ~796 KB | XP icon asset | Audit icon dimensions; likely compressible PNG. |
| 10 | `src/themes/winxp/assets/icons/IE Media.png` | ~761 KB | XP icon asset | Audit icon dimensions; likely compressible PNG. |

## Boot-critical vs optional

- Boot-critical: GRUB UI, minimal App shell, and the currently selected boot/login surface.
- Optional OS chunk: XP/Win7/Ubuntu/WebOS desktop assets, theme icons, boot animations, wallpapers, and heavy app media.
- Optional site/content chunk: BlogSite, article preview media, gallery images, screenshots, and markdown-driven preview assets.

## Lazy-load candidates

- Keep BlogSite, Terminal, WindowsXP, and WebOS behind `React.lazy` boundaries.
- Keep large wallpapers and gallery images content-driven; avoid importing them into GRUB or shared shell code.
- Move any future OS app-specific media behind appRegistry/lazy app boundaries rather than shared runtime imports.

## Requires visual review before changing

- Animated GIFs used as profile/boot visuals.
- iOS/XP/Win7 wallpaper and icon PNGs because compression can alter nostalgic theme fidelity.
- Blog preview video because bitrate/poster changes affect perceived article quality.

## Build notes from this pass

- Production build succeeds.
- Remaining non-blocking warnings are from stale Browserslist data and unresolved legacy WinXP CSS URLs for `restore.png` / `restore_hover.png`.
- CSS and DesktopShell chunks remain large enough to justify a follow-up CSS/theme split, but not a risky rewrite in this pass.
