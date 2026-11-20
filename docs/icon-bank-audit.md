# OS Icon Bank — Inventory, Quality Audit & Adoption Plan

> Updated: 2026-11-20  
> Scope: production assets under `src/` and donor references under `/eat/`.  
> Status: source-tree inventory completed; pixel-dimension, visual, provenance and runtime mapping audits remain in progress.

## Operating rules

- Keep production imports self-contained under `src/`; never import from `/eat/`.
- Pick icons by OS family **and generation**, not by generic platform label. Windows 98, Windows 2000, XP and 7 must not silently share a modern generic glyph; macOS and each iOS generation need their own icon language.
- Prefer original vector or high-resolution source artwork and native multi-resolution formats (ICO/ICNS) where available. Preserve aspect ratio and transparency. Do not upscale small raster art and describe it as high-resolution.
- For each adopted asset, record donor path, production path, target OS/version, intrinsic pixel dimensions, format, provenance/licence status and intended role. Keep a canonical copy; avoid duplicate near-identical files.
- Use semantic aliases in code (e.g. `computerIcon`, `folderIcon`) rather than relying on opaque numbered filenames at call sites.
- Byte size is not pixel resolution. Git tree metadata exposes file byte size, not image dimensions; dimensions must be measured from the actual image before quality claims or replacement decisions.

## Current production inventory (Git tree snapshot)

The following counts are file counts under the named asset roots, not counts of unique visual designs.

| OS / family | Current production bank | Inventory finding | Initial assessment |
|---|---|---:|---|
| Windows 98 | `src/themes/win98/assets/icons/` | 1,758 PNG files | Broad named library; many filenames use `-0`, `-1` suffixes, likely alternate frames/states. Tiny file byte sizes (roughly 274–1,928 bytes in the sampled tree) mean visual inspection and pixel-dimension checks are essential. |
| Windows XP | `src/themes/winxp/assets/icons/` | 877 PNG/WebP files | Broadest legacy shell bank. Explicit multi-size filename variants exist, e.g. `111(32x32).png`, `111(48x48).png`, `119(16x16).png`, and `318(16x16/32x32/48x48).png`. Also includes descriptive names such as `My Computer.png`. Preserve the actual native size variants. |
| Windows 2000 | `src/themes/win2000/assets/` | 2 files at the theme asset root | No dedicated icon directory was found at this path. This is a likely coverage gap; inspect classic Windows 2000 donor references and shared classic assets before adding a bank. |
| Windows 7 | `src/themes/win7/assets/icons/` | 541 PNG files | Large bank with 001–142-style numeric names plus descriptive aliases such as `computer.png`, `internet-explorer.png`, `mail.png`, `folder.png`, `volume.png`. Numeric names are difficult to maintain without a documented semantic manifest. |
| macOS | `src/themes/apple/assets/icons/` | 13 files | Small focused PNG/WebP/SVG set for Finder, Launchpad, Safari, Photos, Mail, Music, Notes, Calendar, Calculator, Settings, Terminal, Trash and folders. Some artwork is substantial in byte size, but actual dimensions and era match need inspection. |
| iOS 9 / legacy shell | `src/themes/apple/assets/ios9/` | 5 primary app icons in the referenced icon map | Separate legacy visual set exists; maintain generation-specific identity. |
| iOS modern | `src/themes/apple/assets/ios/` | 9 PNG app icons in the referenced icon map | Separate modern set exists; verify all mapped app IDs and missing icon fallbacks. |
| iOS 5/6 shell | `src/themes/ios6/assets/icons/` | 113 files | Includes apps, file types, toolbar, user and widget/system assets. The app set includes modern third-party brands alongside older system artwork; audit historical consistency and replace mismatched entries where appropriate. |
| Ubuntu / Arch | No dedicated `src/themes/ubuntu/assets/icons/` or `src/themes/arch/assets/icons/` root found in this inventory | 0 at those exact roots | Do not infer there are no icons elsewhere. Trace actual shell mappings; likely opportunity to add curated Yaru and Arch/Papirus-style native assets rather than generic glyphs. |
| WebOS | `src/themes/webos/` | 9 files total, no dedicated icon folder in this snapshot | Inspect shell-level shared mappings and establish a dedicated WebOS identity set only where it improves fidelity. |

### Runtime icon-resolution defect found during source tracing (2026-11-20)

- `src/utils/FileSystem.ts` imports Windows XP artwork directly and defines a single global `APP_ICON_URLS` map from app IDs to `WINXP_ASSETS` (plus a few generic SVGs). `getFileIcon(item)` therefore returns XP artwork independent of the active OS.
- `src/apps/explorer/MyComputer.tsx` calls this resolver for normal Explorer files and app shortcuts. It has explicit Windows 98/2000 folder and drive overrides, but the remaining app/file icons still fall through to the XP-global resolver. Its Apple app shortcut path also calls `getFileIcon(item)`.
- `src/apps/explorer/Windows7Explorer.tsx` calls the same global resolver for both details and icon/thumbnail views.
- Consequence: Explorer does not yet consistently honor the active OS icon family. The fact that some desktop icons or theme chrome are OS-specific does not prove Explorer file icons are OS-specific.
- This is a concrete implementation priority, not a visual acceptance claim. Refactor toward a theme-aware icon resolver (or a shared semantic icon descriptor resolved by the active skin) without making the virtual filesystem itself depend on UI theme assets. Preserve file association identity and explicit file-type/folder/drive handling. Add tests for representative app IDs and file types across Windows 98/2000, XP, Windows 7, macOS/iOS, Ubuntu/Arch and WebOS.
- Avoid a quick fix that only changes folder icons: app shortcuts, files, drives, thumbnails, tree navigation and address-bar icons must all use a coherent theme-aware contract.

### Theme asset registry findings (2026-11-20)

- `src/themes/webos/themeAssets.ts` defines `sharedWebosAssets` by importing the bulk of its system/app icons from `../winxp/assets/icons/`. The source comment explicitly says WebOS uses XP theme assets. This may be an intentional compatibility/placeholder choice, but it means the current WebOS icon identity is not an independently curated icon bank.
- `win7ThemeAssets` spreads `sharedWebosAssets` first and overrides only a subset (folder, computer, Start orb, wallpaper/avatar, IE, Mail, volume and a few menu/place icons). Other inherited fields such as Media Player, Winamp, games, calculator, Paint, Control Panel, Notepad, calendar, terminal and several system places remain XP artwork unless overridden elsewhere.
- The `win-98` theme entry also spreads `sharedWebosAssets`, then clears Start Menu and Places icon sets; this is a deliberate/partial state but does not provide a complete independent Windows 98 semantic icon registry.
- The `win2000` theme entry currently contains sound/UI metadata and empty Start Menu/Places sets, without a complete icon asset set.
- Windows 7 Explorer imports `THEME_ASSETS.win7` but uses the global `getFileIcon(item)` for listed files. Therefore merely improving `THEME_ASSETS.win7` does not fix its per-file icons.
- `appleIconAssets.ts` already contains explicit macOS, modern iOS and iOS 9 app maps, but `MyComputer.tsx` uses the XP-global `getFileIcon` for Apple app shortcuts rather than consistently consulting the Apple maps. iOS 5 currently uses glyphs for its dock rather than a complete app icon map.

These findings confirm that the next source change should introduce one theme-aware presentation icon contract and wire each Explorer surface to it. Do not duplicate app logic or put theme-specific image URLs into the virtual filesystem model.

### Existing mapping observations

- `src/themes/winxp/themeAssets.ts` already centralizes key XP assets: folder, My Computer, Recycle Bin, Internet Explorer, Outlook, Media Player, Pinball, Calculator, Paint, Control Panel, Notepad, volume and notification icons. It currently points Minesweeper at the app's shared sprite/icon asset.
- `src/themes/win7/assets.ts` explicitly imports named computer, Internet Explorer, mail, folder and volume icons from the Windows 7 bank. The same folder also contains hundreds of numeric files; add a semantic index before expanding their use.
- `src/shells/desktop/appleIconAssets.ts` separates macOS, modern iOS and iOS 9 icon sources. Keep those generation mappings distinct.
- `src/shells/desktop/appRegistry.tsx` uses semantic icon keys, while `src/shells/os/osSkins.ts` owns OS-specific labels/skin rules. Preserve this shared-app + OS-specific-asset approach.
- `src/domain/assets/assetResolver.ts` is a content-image resolver, not a general OS icon registry. Do not overload it with theme icon semantics.

## Donor reference findings under /eat/

The current Git tree contains 8,040 entries under `eat/`; it is therefore incorrect to describe the donor library as removed or fully absorbed.

| Donor reference | Observed material | Use in research | Caveat |
|---|---|---|---|
| `eat/98.portfolio-main/public/icons/` | Descriptive Windows 98-era icon names: Control Panel, date/time, display, file, Internet Explorer, Kodak image, multimedia, Notepad, Paint, system, Winamp, etc. | Visual comparison and candidate reference set for Windows 98/Classic surfaces. | Prior audit says no root licence was found; do not copy donor artwork into production until provenance/rights are resolved. |
| `eat/macOS-Portfolio-main 2/public/img/icons/` | PNG and ICNS assets, including Finder, folders, Safari, Mail, Calendar, Music, Photos, Settings, Tahoe-era icon assets and SF Symbols. | Compare native Apple icon formats, sizes and era-specific presentation; inspect ICNS variants. | Audit exact donor provenance/licence and whether each asset matches the target macOS generation before adoption. |
| `eat/Eshwar-win7-master/public/assets/images/` | Windows 7 logo, boot, start button and other image references. | Windows 7 shell visual reference. | Not yet a verified icon source; inspect individual asset and licence before reuse. |

The donor inventory is a research lead, not an adoption or licence approval. The project must remain independent of `/eat/` at build/runtime.

## Known gaps and decisions

1. **No verified pixel-dimension report yet.** The present counts and byte sizes came from Git tree metadata. They do not establish actual image resolution, sharpness or suitability for 16/24/32/48/64/128/256px presentation.
2. **Windows 7 numeric catalogue needs a manifest.** Before using more numbered assets, create a mapping from numeric filename to semantic name, pixel dimensions, visual preview and intended OS role.
3. **Windows 98 variants need grouping.** Suffix families such as `calendar-0.png`… and `appwizard-0.png`… should be classified as alternate states/frames, not blindly deduplicated.
4. **Windows 2000 coverage is weak at the theme root.** Audit the actual current shell icon resolution and Windows 2000 donor references before deciding whether to share a carefully selected Windows 98 classic set or add distinct assets.
5. **Linux iconography requires a trace of runtime resolution.** The absence of dedicated Ubuntu/Arch theme asset roots does not prove missing icons, but it does mean their actual source and style consistency must be documented.
6. **macOS/iOS visual era separation is already present in code.** Validate it at rendered sizes and fill missing semantic mappings without cross-generation fallbacks.
7. **Licensing and provenance are separate from visual quality.** A visually excellent donor asset is not production-ready until its source and rights are documented.

## Next audit sequence

- [ ] Trace actual icon resolution for desktop, Start Menu, Explorer, file types, widgets and app launchers across every supported OS.
- [ ] Produce pixel-dimension/format/alpha inventory for the current production banks; identify icons displayed larger than their intrinsic resolution.
- [ ] Build a semantic Windows 7 numeric icon manifest with visual contact sheets.
- [ ] Group Windows 98/XP icon variants and identify the best native resolution for each target size.
- [ ] Inspect Windows 2000, Ubuntu, Arch and WebOS actual runtime icon sources; record coverage gaps.
- [ ] Inspect donor assets visually and check exact licences/provenance before selective adoption.
- [ ] Replace low-quality/generic fallbacks only when a better verified asset is available; update mappings and visual acceptance notes.
- [ ] Run `npm run verify`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check`, then browser visual checks. Do not claim visual acceptance from CI alone.


## Theme-aware resolver implementation — 2026-11-20

A first integration pass has been committed:

- New `src/themes/iconResolver.ts` resolves a `FileSystemItem` for a supplied active `ThemeId` at the presentation layer. The filesystem model remains the input contract; theme-specific URLs are not added to the domain model.
- Shared Explorer (`MyComputer.tsx`), Windows 7 Explorer (`Windows7Explorer.tsx`) and desktop icon rendering (`DesktopShellContainer.tsx`) now use `resolveFileIcon(item, theme)` rather than the XP-global `getFileIcon` helper.
- macOS and iOS mappings reuse the existing Apple icon registries. Windows-family/WebOS resolution uses the current `THEME_ASSETS` contract. System, drive and folder roles are distinguished; content-backed image files retain their content URL, and music tracks use the active theme's Winamp/Media Player artwork.
- The old `getFileIcon` export remains in `FileSystem.ts` for compatibility, but these three primary surfaces no longer consume it. Search for additional consumers before removal.

### Limitations after the first integration

- This is a routing correction, not a completed icon-bank rebuild. The theme registries themselves still have coverage gaps.
- Windows 2000 has no complete independent icon registry and currently uses the shared WebOS/XP base fallback. Windows 98 also inherits the shared base outside its explicit Explorer overrides.
- Windows 7 overrides only selected semantic roles; many app roles still inherit the XP base. WebOS remains substantially XP-derived.
- Ubuntu, Arch and Halloween themes currently route through the WebOS base registry. iOS 5 has no complete dedicated icon map.
- The current resolver uses the existing theme asset contract; it does not yet expose a complete per-file-extension association catalogue or a semantic manifest for the Windows 7 numeric icon bank.
- No browser visual review or pixel-dimension inventory was performed as part of this pass. CI must be checked separately; a successful build does not prove visual fidelity.

### Next implementation sequence

1. Complete semantic per-theme icon registries, starting with Windows 98/2000 and Windows 7, without importing unlicensed donor assets.
2. Add explicit app IDs for missing roles (Picture Viewer, file manager/system tools, widgets and game shortcuts) and ensure no generic rich-text icon is used as a misleading substitute.
3. Add a dedicated file-type/association resolver and tests for folders, drives, system nodes, text, images, audio, video, archives and unknown files.
4. Inventory actual pixel dimensions, alpha and format for production banks; generate contact sheets for numeric Windows 7 and Windows 98 variant families.
5. Verify Linux icon sources and add Ubuntu/Arch registries; keep macOS and iOS generation maps separate.
6. Run required quality gates and browser visual checks for every OS family.


## Follow-up implementation — semantic file associations (2026-11-20)

- Added `src/themes/fileAssociations.ts` with a centralized extension catalogue covering text, documents, web, structured data, source code, images, audio, video, archives and fonts. Each entry records extensions, category, MIME family, optional existing default app ID and a semantic theme asset role.
- `src/themes/iconResolver.ts` now resolves ordinary file icons through this catalogue after app shortcuts, folders, drives, system nodes, media tracks and content-backed image thumbnails. macOS and supported iOS generations first consult their own app icon maps for associated viewer/player roles; other themes resolve the semantic asset key against the active theme registry.
- This is a first association catalogue, not a claim of complete OS-level open/launch behavior. The app ID is descriptive metadata; a separate launch/open dispatch still needs to consume the association contract if automatic file opening is required.
- Known limitation: theme registries remain incomplete and several themes still fall back to WebOS/XP assets. The new catalogue improves consistency but does not itself create native icons or prove visual fidelity.
- Verification pending: typecheck, lint, build and browser checks across each theme. Add tests for multi-dot filenames, uppercase extensions, unknown extensions, content-backed images, media tracks, and all listed association categories.

## Windows 98 semantic bank — 2026-11-20

- Added `src/themes/win98/iconAssets.ts` and routed the Win98 theme through its own imported asset roles in `src/themes/webos/themeAssets.ts`.
- Roles currently mapped from the existing Win98 icon directory: computer, folder/navigation, HTML/browser placeholder, mail, media player, calculator, calendar, Kodak Imaging, Control Panel, Help, MS-DOS, Minesweeper, document/text, network, volume/sound and Paint.
- The Win98 shell now overrides Start-menu, Places and Control Panel icon roles instead of inheriting those role mappings unchanged from the XP-derived shared set.
- This is a first semantic pass, not a completed native Win98 inventory. Browser now uses the explicitly named `msie1` asset family; Recycle Bin empty/full variants were found and mapped. Generic file-type roles and visual matching still need contact-sheet review.
- Windows 2000 remains without its own icon directory/semantic bank; only its two existing shell assets were present in the inspected `src/themes/win2000/assets` directory.

- Win98 Start button role was switched to the local period-specific `95icon.png`. A GitHub Actions TypeScript failure in the prior file-thumbnail resolver commit was identified and fixed by narrowing `item.icon` to string before returning it; latest workflow is pending.


## Windows 98 follow-up and Windows 2000 donor audit — 2026-11-20

- Fixed an accidental duplicate-property override in the Win98 theme object: the trailing empty `startMenuIcons` and `placesIcons` maps had been overriding the newly curated maps. The maps now survive object construction.
- The Win2000 donor `eat/windows2000-main` was inspected. It contains a 200+ item numbered `.ico` bank under `src/assets/ICON`, plus Start-menu references in `StartMenu.tsx`: Shutdown=151, Run=135, Help=129, Search=123, Settings=115, Documents=109, Programs=104, Accessories=102, Windows Update=228. These are donor project IDs, not yet verified semantic image labels.
- Donor assets were not copied into production: individual image licensing/provenance is not confirmed, and numbered ICOs need visual identification before assignment. This is now a concrete source for the Win2000 contact-sheet and role-mapping pass.
- The donor Start-menu source is only a visual reference; its menu rows use local click-state and do not supply a production-ready interaction model.
- CI for the prior commit `f2e5486` failed due duplicate `startMenuIcons` / `placesIcons` keys. The duplicate keys were removed in `63ca2f4`; its workflow is currently running.


### File-open association follow-up — 2026-11-20

- `DesktopShellContainer.handleOpenFile` now reads `getFileAssociation(item.name)` from the shared catalogue. Text, code and structured-data extensions open through the existing Notepad surface; image-category extensions route to the shared Picture Viewer when the virtual file has a string content URL. Project Markdown keeps its frontmatter/article rendering path and takes precedence over the generic text handler.
- This connects the association catalogue to real file-open behavior for the supported viewer categories. Audio/video/archive and rich-document associations remain icon/metadata only: the current app-launch event does not carry a selected file payload, so blindly dispatching `defaultAppId` would open an app without loading the file. Add a typed launch context before enabling those associations.
- No local TypeScript/lint/build/browser run was available through the GitHub connector. Check Actions for commit `a391adc1d9b6faf6784c252418d9ecdaa892dea5`; verify .rtf/.ini/.json/code, uppercase/multi-dot names, all image extensions supported by the browser/runtime, missing image content and project Markdown.


### Windows 98 icon resolution / alpha inventory — 2026-11-20

- Corrected the semantic bank using the named Win98 shell assets: My Computer `computer_2_cool`, closed folder `directory_closed`, Internet Explorer `msie1`, Recycle Bin empty/full `recycle_bin_empty` / `recycle_bin_full`, My Documents `directory_open_file_mydocs`, Find `search_computer`, Paint `paint_old`, plus the existing mail/media/calculator/calendar/Kodak/Control Panel/Help/MS-DOS/Minesweeper/network/sound roles.
- Chosen high-resolution variants use the largest inspected transparent PNGs where available: `computer_2_cool-3.png` 48×48; `directory_closed-4.png` 48×48; `msie1-2.png` 48×48; `recycle_bin_empty-4.png` 48×48; `recycle_bin_full-2.png` 48×48. PNG transparency was verified via `tRNS` palette chunks (these are indexed PNGs, so the IHDR color type alone does not reveal transparency). `start98.png` is 32×32 with palette transparency.
- A 16px `computer_explorer` variant was rejected for the desktop role in favor of the 48px `computer_2_cool` image; the Explorer-specific 16px icon remains in MyComputer's compact navigation UI.
- This is a metadata/header inspection, not a visual contact-sheet review. 48px native artwork is preferable to the 16px variants but is not vector/high-DPI artwork; do not upscale it and call it high resolution. Continue checking larger variants/other OS banks and inspect rendered results at actual desktop scale.
- Production source changes: `src/themes/win98/iconAssets.ts`, `src/themes/webos/themeAssets.ts`; the Win98 Start button now references the semantically named `assets/icons/start98.png`.
