# WebOS & Multi-OS Engineering — Active Task Registry

> **Single source of truth for active work.** Keep this file current; move completed, superseded, obsolete or inactive task detail to [history.md](./history.md), never discard it. Agent handoff, verified paths, source/licence notes and research cache: [agents.md](./agents.md).

## Working rules

- Work directly on `main`; do not create a feature branch unless explicitly requested.
- One shared application/domain implementation where possible; adapt presentation through OS-specific skins and shell integrations. Do not fork app logic just to change appearance.
- Authentic OS identity is a requirement, not decorative polish: window chrome, typography, spacing, icons, menus, toolbars, taskbar/dock/panel, focus/hover/disabled states and navigation must match the active OS.
- Before implementing or restyling an OS-specific surface, inspect the closest matching references under `/eat/` and the existing OS skin checklist; compare the actual target OS/version rather than borrowing a generic look. Treat `/eat/` as a visual/technical donor library, not a production import path.
- Maintain and improve a curated OS icon bank: choose the most authentic icon for the active OS/version and role; prefer original high-resolution/vector or multi-resolution ICO/ICNS/PNG assets over small raster or generic glyph substitutes. Record source path, dimensions/variants, target OS/version and provenance/licence; inspect image dimensions and visual quality before adoption, avoid duplicates, and keep per-OS mappings explicit. Never upscale a tiny icon and call it high resolution.
- Never claim a game is playable because an iframe or route loads. Verify actual gameplay.
- Never import from `/eat/` into production. Donor code/assets require independent provenance and licence review; absence of a licence is not permission.
- Update progress only after inspecting source and distinguishing implemented, partial, blocked and manually verified work.
- Required quality gates are documented in [agents.md](./agents.md). If a gate cannot be run, report it explicitly.

## Current verified baseline — 2026-11-19

Repository source baseline inspected before this pass: `0fc60199c127ae52b06e2b65c499f22ca24a5b91`.

| Workstream | Progress | Current assessment |
|---|---:|---|
| Core desktop / shared shell | 60% | Unified shell exists; cross-OS visual and runtime consistency still needs systematic verification |
| Widgets + 3 size classes | 70–75% | Existing widgets need fixed size contracts, responsive adaptation and final placement checks |
| RSS | 70% | Historical merge, URL/GUID identity, valid empty-feed handling and refresh health/freshness UI implemented; runtime/feed-outage acceptance remains |
| DOOM | 35% | Presentation cleaned; remote iframe remains unverified for actual gameplay |
| Other games | 45% | Minesweeper vertical sprite mapping and per-game Explorer icons corrected in source; runtime acceptance pending |
| Explorer / Games folder | 60% | Per-game app icon resolution restored; OS-native presentation and launch acceptance remain |
| My Documents | 45% | Canonical virtual folder exists; duplicate shortcuts and navigation need cleanup/verification |
| My Pictures | 40% | Gallery mapping is partial; complete file inventory and normal folder behavior remain |
| Picture Viewer | 55% | Shared viewer direction exists; grid/single-image parity and file associations need completion |
| Control Panel | 45% | Entry points exist; categories, settings navigation and OS-native presentation remain |
| OS-specific Explorer / Control Panel | 35% | Dedicated styles exist for some systems; others still need authentic native layouts |
| Widgets desktop entry point | 60% | Non-Windows desktop shortcut, Windows 7 Gadgets context-menu entry and macOS Edit Widgets context-menu route open the shared manager; exact icon and visual acceptance remain |
| Appearance & Themes | 45% | Shared image inventory and persistence/preview need verification |

Percentages are working estimates, not test results. The previous task registry and audit snapshot are preserved in [history.md](./history.md).

### ICONBANK-01 — OS-native icon bank quality and provenance (P0)
- Maintain a curated icon bank per OS family and generation. Use authentic Windows 98/2000/XP/7, macOS/iOS generations, Ubuntu, Arch and WebOS assets rather than generic cross-platform substitutes where native iconography is available.
- Consult `docs/icon-bank-audit.md` for the production inventory, donor reference findings, known gaps and next audit sequence. Keep this document updated with findings, mappings, dimensions, provenance/licence decisions and implementation outcomes.
- Measure actual intrinsic pixel dimensions and alpha/format; Git file byte size alone is not a resolution metric. Never upscale small artwork as a quality fix.
- Replace opaque numeric icon references with semantic mappings where practical; preserve native size variants and state/frame families.
- Audit runtime icon resolution across desktop, Start Menu, Explorer, file types, widgets and app launchers. Confirm each OS uses the intended generation-specific artwork.
- Implementation pass 2026-11-20: added `src/themes/iconResolver.ts` as a presentation-layer resolver. Shared Explorer, Windows 7 Explorer and desktop icon rendering now request icons using the active `ThemeId`; app IDs resolve through theme assets, macOS app/system maps or generation-specific iOS maps. Folder, drive and system nodes have separate handling, and image-content thumbnails remain content-driven. The legacy XP-global `getFileIcon` remains in `FileSystem.ts` for compatibility but is no longer used by these three production presentation surfaces; audit and remove remaining compatibility use before deleting it.
- Follow-up source trace: WebOS currently inherits most XP artwork; Windows 7 overrides only a subset of the inherited XP icon set; Windows 98/2000 theme asset registries do not yet expose complete independent icon sets. Apple app maps exist but Explorer does not consistently use them. See the detailed source-path notes in `docs/icon-bank-audit.md`.
- Donor assets in `/eat/` are reference-only until exact provenance/licence is checked. Never import from `/eat/` or introduce it as a runtime/build dependency.
- Acceptance: dimension/format inventory, semantic mapping, source/provenance record, no unintended duplicates, no low-resolution upscaling, cross-OS visual review, and all required quality gates.

## P0 — Current implementation priorities

### CALENDAR-01 — Unified Calendar Center (P0)
- Canonical domain/service: `src/apps/calendar/calendarCenter.ts`. Desktop calendar widget, taskbar clock flyout, WebOS clock widget and full Calendar app retain distinct OS-native UI surfaces while sharing selected date, visible month, imported events, local events and labour-calendar country selection.
- Full Calendar app supports month/week/day/list views, event details, local event create/edit/delete, multi-day events, all-day event editing and local-first persistence. Bundled ICS events remain read-only.
- ICS parser supports folded lines, escaped text, UID identity, UTC/floating/TZID date-times and a documented recurrence subset: DAILY/WEEKLY/MONTHLY/YEARLY, INTERVAL, COUNT, UNTIL, BYDAY (weekday tokens only) and BYMONTHDAY. Recurrence expansion is shared by date/range queries; editing/deleting a generated local occurrence targets its master series.
- RDATE and EXDATE are parsed as explicit recurrence additions/exclusions, including multiple property lines and TZID-aware values. RDATE PERIOD values are deliberately skipped because their per-instance duration needs separate modelling.
- **Known recurrence limits:** BYSETPOS, ordinal BYDAY (e.g. -1MO), complex VTIMEZONE definitions and other RFC 5545 edge cases remain unsupported. These are intentionally not silently approximated.
- National calendar dataset covers Russia, Kazakhstan, Belarus, China, Japan, South Korea and the United Kingdom. Public holidays, memorial/cultural dates and transfer-day markers are independent of the selected labour calendars and always remain visible with country flags. Country names, holiday titles and new calendar controls are localized across all seven supported interface languages.
- Annual labour-calendar data is explicitly encoded for 2026 and 2027 where published: Russian government transfer schedule; Kazakhstan 2026 five-day production calendar and constitutional holiday update; Belarus 2026/2027 transfer schedules; China State Council holidays and make-up workdays; Japan Cabinet Office national holidays; South Korea 2026/2027 calendar dates/substitute days; UK England/Wales bank holidays. Weekend and holiday shading uses selected countries; make-up working Saturdays/Sundays are separately marked as working days.
- **Scope notes:** UK labour dates currently use England and Wales as the baseline; Scotland and Northern Ireland have regional differences. Kazakhstan's 2027 transfer schedule was not yet published in the checked official sources; future years fall back to statutory holidays/weekend rules and Kazakhstan's next-working-day transfer rule. Annual schedules must be added when governments publish them. This is an offline calendar, not a payroll/legal compliance system.
- Weather widget now has the two requested cities for each of the seven calendar countries: Moscow/Saint Petersburg, Astana/Almaty, Minsk/Gomel, Beijing/Shanghai, Tokyo/Yokohama, Seoul/Busan, London/Birmingham. Paris/Marseille and Madrid/Barcelona are also included so Français/Español language defaults can select their own capitals. Every city is flag-prefixed. Language defaults: EN→London, RU→Almaty, FR→Paris, ES→Madrid, ZH→Beijing, JA→Tokyo, KO→Seoul. Manual city selection persists per language; switching language resets to that language's default.
- Clock activation is now OS-adapted: classic Windows/XP/7 retain their familiar compact flyout patterns; Windows 10/11 use a modern dark date/time flyout; Ubuntu/Arch use compact GNOME/GTK-like calendar panels; WebOS uses its glass panel; macOS menu-bar clock opens Notification Center with its interactive calendar; iOS Notification Center uses the same shared calendar when opened by the native gesture/control. All surfaces read/write the shared selected date/month/events and can launch/focus the single Calendar app.
- **Still open for acceptance:** complete recurrence exception support (RDATE/EXDATE/BYSETPOS/ordinal BYDAY/full VTIMEZONE); regional UK selector; future-year labour schedules as officially published; automated unit tests for date/recurrence/DST edge cases; runtime and visual acceptance across all OS skins and mobile breakpoints.
- **Verification status:** GitHub connector source writes succeeded, but local `npm run typecheck`, `npm run lint`, `npm run build`, `npm run verify` and browser tests have not yet been run. Do not mark the task complete until those checks and the cross-OS acceptance matrix pass.

### WEBOS-01 — Desktop and widget placement contract
- WebOS is the only OS where widgets are enabled by default. All other OS profiles start with widgets disabled; users may enable them deliberately.
- WebOS initially displays the agreed set of 8 widgets on the right side in 2 columns.
- Define exactly 3 supported widget size classes (small/medium/large) with shared dimensions, spacing and breakpoint rules.
- Every widget must adapt its internal layout to the selected size. No clipped controls, overflow beyond viewport, hidden playback controls or inaccessible resize/drag handles. Winamp is a mandatory regression case.
- Keep placement, visibility and size settings coherent across reloads and OS changes; do not unexpectedly enable widgets in another OS.
- Source fix now separates defaults: non-WebOS visibility defaults are all false; the WebOS widget canvas retains its eight-widget enabled default. Apple/non-WebOS widget persistence moved to a v2 key so stale v1 values from the previous faulty behavior cannot re-enable widgets. Runtime acceptance is still pending.
- WebOS first-launch initializer now explicitly supplies `WEBOS_DEFAULT_WIDGETS_VISIBILITY` and the WebOS storage key. The previous no-argument call inherited the global all-false defaults, contradicting the required eight-widget WebOS initial layout. Existing explicit saved visibility remains respected.
- Acceptance: desktop and mobile-width checks; all 8 widgets fit; 3 size classes are consistent; Winamp remains fully usable in every supported size.
- Keyboard repositioning now uses the same responsive/scrollable layout bounds as pointer dragging, including WebOS's extended two-column widget canvas.
- Widget layout state now reloads from the destination OS's own storage key when the active theme changes; the first persistence pass is skipped so the previous OS's coordinates cannot overwrite the destination layout.
- Responsive canvas follow-up (2026-11-19): the resize normalization equality check now includes the selected preset, so a viewport-driven compact fallback is committed to state instead of being discarded when x/y remain unchanged. Fixed-height non-WebOS canvases now render the same clamped height used by placement calculations; WebOS retains its intentionally scrollable vertical layout. This is source-level hardening only; verify viewport resizing, orientation changes, all three sizes and all eight WebOS widgets in-browser.

### RSS-01 — Durable RSS cache and feed controls
- Preserve accumulated cached articles across refreshes; deduplicate by stable article identity (canonical URL/GUID with safe fallback).
- Sort newest-first; do not erase older cached entries when a feed temporarily returns fewer items or fails.
- Category filter lives inside the News RSS Feed application, not as a detached desktop widget/control.
- Valid empty feeds are distinct from transport/parser failures; XML feed roots are validated before returning an empty result.
- Deduplicate by canonical URL (tracking parameters/fragments removed), falling back to RSS GUID/Atom ID and then source+title only when no usable link/GUID exists.
- Refresh metadata records last attempt/success, succeeded/failed source counts and success/partial/failure/disabled state. Partial and total failures retry after a short delay rather than remaining cached for the full TTL.
- News RSS Feed shows last successful update time, partial-source counts, stale-cache messaging and empty states. Category filtering remains inside the app.
- Acceptance: repeated refresh, duplicate feeds, partial feed outage, empty feed, disabled sources and category filtering do not destroy cached history; manually confirm the stale-cache and retry states.

### STARTMENU-02 — Start Menu interaction and complete navigation (P0)
- Root cause found for the reported dead menu items: the desktop-level `onMouseDown` handler closed the Start Menu on every bubbled left-button press, unmounting it before the item's `onClick` could execute. The Start Menu surface now stops `mousedown` propagation as well as `click` propagation.
- Route menu destinations through the shared launcher / Explorer callbacks. Canonical user paths: My Documents, My Pictures, My Music and the shared `C:\\Users\\C4m1r` / `C:\\Documents and Settings\\C4m1r` profile. My Computer and Control Panel use their registered system routes.
- Network Neighborhood now exists as a virtual folder under My Computer and has routes in classic, XP and Windows 7 Start Menus; the path resolver also accepts the legacy standalone alias.
- The Start Menu host now stops desktop mousedown bubbling at the Start Menu host (without blocking target focus/click handlers) without blocking target click handlers. XP All Programs is a keyboard-addressable fly-out. Manual click-through acceptance remains required.
- XP All Programs now expands an in-menu application list; Windows 7 All Programs toggles the complete program list; Windows 98/2000 Programs opens a classic cascading submenu. IE and Outlook Express now use the same row/icon sizing as the other XP pinned entries; special E-mail/Internet tags and oversized treatment were removed.
- Desktop Games and Programs are shortcut folders in the user Desktop node; their target aliases resolve to the canonical `C:\\Program Files\\Games` and `C:\\Program Files\\Programs` folders. The alias view now flattens publisher subfolders into the actual launchable game/program shortcut files while preserving the publisher-organized Program Files trees. Non-Windows shells have a desktop entry point to the shared Widget Gallery; Windows uses its OS-native entry point instead.
- Desktop Programs shortcut and Start Menu folder references must resolve to `C:\\Program Files\\Programs` (not the localized display name).
- Acceptance: test every item by mouse and keyboard on Windows 98/2000, XP, 7 and WebOS; verify folder paths resolve to populated folders and each app opens/focuses its window. Verify menu does not close on mousedown before click.

### GAME-03 — Minesweeper sprite sheets and game/program icons (P0)
- Audited the actual PNG pixels, not just IHDR dimensions: `cells.png` is a 16×256 vertical sheet whose frames are ordered as covered, flag, question, exploded mine, wrong-flag mine, mine, question-on-revealed, then 8→1. CSS now maps logical number classes 1–8 to frames 14→7 and maps mine/flag/question states to their actual frames. The earlier sequential offset mapping was incorrect and is superseded by this explicit mapping.
- `MinesweeperSimple.tsx` now stops the right-click event after cycling flag → question → clear; left-click opens a question-marked cell as in classic Minesweeper. `Window.tsx` prevents browser/desktop context menus inside all application windows, while the desktop shell has a defensive `.os-window` boundary guard. The OS context menu remains available on the desktop surface and desktop icons.
- Explorer icon resolution maps app IDs to actual assets before generic file fallbacks. DOOM uses its game icon, Minesweeper its dedicated icon, and Snake/Memory have dedicated lightweight SVG icons. Program Files app entries retain their own app icons.
- Sprite elements retain fixed dimensions, vertical background sizing and pixelated rendering. Revealed zero-neighbour cells remain blank; logical neighbor counts and flood-fill need browser play-test. Acceptance: verify all number mappings 1–8, blank flood-fill, mine/exploded/wrong-flag/flag/question states, smiley states, both counters, PC-click flag cycle and desktop-only context menus. Verify game/program icons in every Explorer view and OS skin; ensure missing assets do not silently hide icons.
- Source changes are committed; typecheck/lint/build and browser/gameplay acceptance are still pending.

### GAME-01 follow-up — DOOM / DOOM II clean game surface
- Removed the Emupedia/wasm-doom footer, the warning tip and the duplicate iframe-loaded status/link overlay. The selected build's external-launch action remains in the header, and an error-only fallback remains if iframe navigation fails.
- An iframe load is still not proof of playable gameplay. Keyboard, mouse, pointer lock, audio, resize, restart and browser compatibility require manual acceptance for both DOOM and DOOM II.

### GAME-01 — DOOM: repair the launch experience and verify actual gameplay
- Audit `src/apps/doom/`, app registration and launch routes. Current `DoomPlayer` embeds Emupedia URLs; iframe navigation/error events cannot establish that the game engine booted or that gameplay is available.
- Separate states: selecting a build, iframe navigation/load event, actual gameplay verification (manual only), remote unavailable/blocked, and external launch fallback.
- Do not label Emupedia builds as locally hosted or guaranteed playable. Doom 3 remains WIP and must not be presented as a confirmed playable game.
- Review candidate local engine/source/data and legal provenance before considering a bundled build. `eat/98.portfolio-main` contains a distinct custom Three.js game branded 98.DOOM, not id Software DOOM; no root licence was found in the audit. Do not port it without permission.
- Acceptance: manually verify actual gameplay, keyboard/mouse, pointer lock acquire/release, audio, resize, restart and recovery; record browser/device/build. If no verified route exists, present an honest external launch and fallback rather than a broken embedded game.

### GAME-02 — Game catalogue and additional playable titles
- Inventory all game donors in `/eat/`: title, exact path, entry point, dependencies, assets, licence/provenance, compatibility, bundle cost and decision.
- Inspect MIT Chess/Solitaire candidates as isolated components only; do not bring their frameworks, APIs, Supabase or multiplayer backend into this Vite app.
- Existing native Snake, Memory and Minesweeper remain canonical until a specific improvement justifies change.
- Add suitable lightweight games as separate real app entries with reusable game-shell, keyboard/touch input, pause/restart and fullscreen behavior.
- Acceptance: games appear as ordinary files/shortcuts in Program Files/Games and launch through the normal registry; only genuinely playable entries receive Playable status.

### EXPLORER-01 — Games folder and OS-native Explorer
- Games is a normal virtual filesystem folder. It opens in the active OS Explorer, not a bespoke DOOM collection screen.
- Verify and use the recognizable Windows XP tree/favorites folder icon for XP; use theme-appropriate icon mappings for other OSes.
- Restore native Explorer identity per OS: XP task pane/address/navigation, Windows 98/2000 classic toolbar and bevels, Windows 7 command bar/Aero, macOS Finder toolbar/sidebar, Linux file-manager conventions, WebOS native file browser.
- Acceptance: navigation, folder tree, address/location controls, file associations, selection, context menus and window chrome are coherent for each supported OS.

### EXPLORER-02 — Desktop and Programs folder contract
- Desktop should contain only the agreed system entry points: My Computer, My Documents, Games, Programs, Calculator, Control Panel, Terminal and Blog. Do not duplicate every installed application as a desktop icon.
- All other application shortcuts live in the canonical `C:\\Program Files\\Programs` virtual folder; games remain in `C:\\Program Files\\Games`. Both are ordinary folders opened by the active OS Explorer.
- My Documents is the canonical user folder and exposes the standard user folders (My Music, My Pictures, My Videos and Downloads) plus existing personal shortcuts. Keep folder identity distinct from viewer applications.
- Windows Blog shortcut is presented as `Блог.chm` / `Blog.chm`; non-Windows shells retain the Blog label. The shared Blog app behaves as a CHM/HTML Help-style viewer with category tree, article list, search and in-app Markdown rendering.
- The help library aggregates all Wiki Markdown pages (including category index pages), Blog articles and Markdown-backed site pages from news, projects, about/legal and app catalogue content. Preserve Wiki hierarchy and group other sources by their content category; do not load only the Operating Systems subset.
- Acceptance: double-click every desktop item; open Programs/Games and launch representative entries; verify user folders and all media associations; search and open articles from multiple Wiki categories and Blog categories without leaving the help window.

- Games is a normal virtual filesystem folder. It opens in the active OS Explorer, not a bespoke DOOM collection screen.
- Verify and use the recognizable Windows XP tree/favorites folder icon for XP; use theme-appropriate icon mappings for other OSes.
- Restore native Explorer identity per OS: XP task pane/address/navigation, Windows 98/2000 classic toolbar and bevels, Windows 7 command bar/Aero, macOS Finder toolbar/sidebar, Linux file-manager conventions, WebOS native file browser.
- Acceptance: navigation, folder tree, address/location controls, file associations, selection, context menus and window chrome are coherent for each supported OS.

### DOCS-01 — My Documents canonical structure
- `Мои документы` is the canonical parent for `Вики`, `Мой блок`, `Обо мне` and `Мои проекты`.
- Preserve app IDs and content; open entries through the active OS Explorer.
- A dedicated My Documents desktop icon now opens the canonical folder; the XP/7/classic Start Menu entries route to the same virtual path. Windows 98/2000 Start Menu entries now call the shared launch/path handlers instead of merely closing the menu.
- Remove duplicate standalone desktop shortcuts where those entries should live in My Documents, without removing intentional Start Menu/registry navigation. Source pass now removes Projects/Wiki/Notepad/About standalone desktop entries; the Blog shortcut remains because it is separate from the My Documents content.
- Acceptance: folder tree and open/reopen behavior verified across OS profiles. Windows 7 Explorer's Pictures library path now resolves to the same nested folder and enters a dedicated thumbnail view.

### PICTURES-01 — My Pictures as a real virtual folder
- `Мои рисунки` is a normal user-profile folder nested under `Мои документы` (the Windows XP profile layout), containing every image in the site's shared gallery inventory, preserving useful subfolders and extensions.
- Include `Bliss.jpg` in the folder and remove its separate desktop shortcut; retain the source asset for wallpaper/gallery use.
- Opening My Pictures from Start Menu resolves to the nested canonical folder; Explorer recognizes both the English path key and localized Russian folder name and enters thumbnail mode. The separate desktop/start-menu application is named Picture Viewer / Просмотр изображений and opens the shared viewer in grid mode. Opening an image file ensures that image is included and focused in the same viewer session.
- Acceptance: every gallery asset resolves to a file entry and opens; no duplicate viewer/gallery implementation.

### PICTURES-02 — Unified Picture Viewer modes
- One shared image inventory and viewer state, with toolbar toggle between single-image and thumbnail-grid modes.
- Grid selection opens the selected image; navigation and reopening must not create stale duplicate state.
- Support all actual image formats in the inventory with clear fallback for unsupported formats.
- Share the same inventory with Appearance & Themes.
- Selection state now follows changing image inventories: an explicitly requested image is focused when present; otherwise the current index is clamped to the new list length (or reset to zero for an empty list). This prevents a blank viewer after switching to a shorter folder. Browser acceptance remains pending.

### CONTROL-01 — Control Panel category architecture
- Provide OS-appropriate categories: System/Performance, Appearance & Themes/Personalization, Network & Internet, Hardware & Sound, Programs/Applications, User Accounts and Accessibility. Adapt names, grouping and layout to each OS rather than forcing a modern generic panel.
- Task Manager belongs under System/Performance and remains accessible in Classic View.
- Category cards and classic applets now route Programs to the canonical Program Files folder, User Accounts to the Users profile root, Network to Network Neighborhood, Date/Time to Calendar, Task Manager to its registered window and Widgets to the existing gallery. Hardware/Sound/Windows Accessibility currently fall back to System & Device Info; dedicated settings surfaces remain open.
- Categories must navigate to functioning settings/apps; no dead placeholder cards.

### CONTROL-02 — Desktop shortcuts and canonical settings surfaces
- Provide a desktop shortcut to Control Panel. Widget entry points are OS-native rather than universal: Windows 7 uses the desktop context-menu item `Gadgets` (no desktop icon), macOS uses `Edit Widgets…`, and non-Windows/non-macOS desktop shells expose the shared Widgets shortcut.
- All entry points open the same canonical manager and shared visibility/preset state; no duplicate manager or divergent settings state.

### CONTROL-03 — OS-native Explorer and Control Panel fidelity
- Restore authentic OS-specific window chrome, typography, icons, toolbar/address/navigation, menus, category layouts, spacing and responsive behavior.
- Validate Windows XP, Windows 98/2000, Windows 7, macOS, Ubuntu/Arch and WebOS independently. Shared functionality must not flatten their visual identities.

### THEMES-01 — Complete Appearance & Themes image inventory
- Expose every image in the site's shared gallery in Appearance & Themes, not only the wallpaper subset.
- Shared Appearance gallery now exposes All / Wallpapers / Pictures filters, image counts, a fit-aware preview, Apply and Cancel selection actions, and persistent Fill/Fit/Stretch/Tile/Center placement modes.
- The picker now defaults to 3 columns; its gear menu persists 3-column / 2-column selection. Selected-image preview is wider and taller (4:3). Filters, counts, empty/loading states, placement labels and actions are localized for en/ru/fr/es/zh/ja/ko/be/kk.
- Remaining: add richer folder/tag grouping, verify the wallpaper and placement survive reload and OS profile switching, and inspect each mode on all desktop OS skins.
- Reuse the same canonical inventory as My Pictures/Picture Viewer.

### WIDGET-GALLERY-02 — Canonical OS-native Widget Gallery
- Shared widget catalogue, visibility toggles and size presets remain one implementation; presentation is adapted to Windows 98/2000, XP, 7, 10/11, Ubuntu, Arch, macOS and WebOS.
- Entry points follow OS conventions: Windows 7 Gadgets via desktop context menu; macOS Edit Widgets via desktop context menu; non-Windows/non-macOS desktop shells expose a Widgets shortcut. Windows Vista Sidebar behavior is documented as a platform reference but no Vista theme exists yet.
- Widget Gallery has a persisted night palette and nine-locale widget/control copy (en/ru/fr/es/zh/ja/ko/be/kk). Windows 7 now uses a tiled Aero Gadget Gallery picker with the canonical Desktop Gadget Gallery title; existing OS-family skins remain in the globally imported src/styles/os/themes/macos.css.
- The non-Windows desktop shortcut currently uses a generic vector glyph; exact native icon fidelity remains open. Acceptance: verify visual identity, contrast, focus/keyboard behavior, scroll containment, narrow viewport layout and toggle/preset/night-mode persistence on every OS family.

### APP-ICONS-02 — Restore application icons in virtual folders
- Explorer file entries with an `appId` resolve the application icon before falling back to the generic file/document icon.
- App mappings now use specific existing assets for Picture Viewer, Calendar, RSS, currency, Help, Task Manager, Terminal, Winamp and game entries. Desktop folder aliases expose flattened launchable shortcuts; publisher-organized Program Files trees remain canonical. Confirm every icon in Programs/Games and review per-OS icon fidelity; do not duplicate app metadata in the filesystem.

### STARTMENU-01 — Functional Start Menu navigation and actions
- XP and Windows 7 All Programs expand their in-menu application lists; Windows 98/2000 Programs opens a cascading submenu. The desktop Programs shortcut and the Explorer folder route resolve to `C:\\Program Files\\Programs`.
- XP Search and Windows 98/2000 Find open a dedicated Explorer window with the current-folder search row focused. Unsupported XP shell destinations are genuinely disabled and no longer launch fake `unavailable:` error requests.
- Existing app launch, folder navigation, Run, Help, Control Panel, My Computer, Documents, Pictures, logoff and shutdown routes must be manually exercised for each Start Menu variant. Windows 7 search currently filters its program list; full filesystem search remains a separate acceptance item.

### PROFILE-FS-01 — One user profile across legacy and modern Windows paths
- The same profile object is visible through both `C:\\Documents and Settings\\C4m1r` and `C:\\Users\\C4m1r`; the `Users` directory is an alias, not a copied profile.
- Modern profile names `Documents`, `Pictures`, `Music`, `Videos` and `Downloads` resolve to the same canonical user folders as their legacy `My ...` names. Windows 7 Start Menu and Explorer use the modern paths; classic/XP shells retain legacy paths.
- Program Files now groups installed applications by publisher/author (Microsoft Corporation, Nullsoft, C4m1r); Games groups titles under id Software, Microsoft and C4m1r.
- Acceptance remains open: navigate both profile paths, create/resolve each shortcut target, verify Back/Forward/Up and folder tree, then double-click every publisher/game entry.
- Windows 7 Explorer Up navigation now respects the modern Libraries alias contract: Pictures, Music, Videos and Downloads return to the profile's Documents library instead of jumping to the profile root. Nested media subfolders retain ordinary parent navigation.
- Acceptance: click Up from each modern library and at least one nested media subfolder; verify Documents and the canonical legacy folder contents are shown.

### I18N-01 — Belarusian and Kazakh system locales
- Added `be` and `kk` to the language type, language selector, browser-language detection and supported-language persistence. Legacy settings migration now preserves both values.
- Added Belarusian and Kazakh translations for core shell, Start Menu, GRUB, terminal and site navigation labels. Untranslated long-form sections currently inherit Russian, and application names without explicit locale entries fall back to English; full translation coverage is not yet complete.
- Acceptance: select each language, reload, switch OS profiles, test saved settings migration and audit every user-visible string for missing/fallback text.

## P1 — Quality, integration and regression

### OS-FIDELITY-01 — Cross-OS visual acceptance matrix
- For every app used across OS profiles, define shared functional contract plus OS-specific presentation adapters.
- Verify window frame, titlebar controls, toolbar, menus, typography, spacing, icons, selected/hover/focus/disabled states, scrolling, empty/error/loading states and responsive behavior.
- No app should inherit a Windows XP/98 frame or generic white card in macOS/Linux/WebOS unless intentionally part of that OS.
- Maintain visual checklist in [os-skin-visual-checklist.md](./os-skin-visual-checklist.md).

### GAME-03 — DOOM compact game chrome
- DOOM and DOOM II keep title, smaller subtitle (Ultimate Doom / Hell on Earth), one-line project description and build/external-launch controls on a single compact header row. Controls stay right-aligned; the iframe receives the remaining window height.
- The old Emupedia/wasm-doom footer, success tip and duplicate iframe-loaded overlay are not part of the player. An error-only fallback may remain. Actual gameplay still requires manual verification.

### EXPLORER-04 — Desktop shortcuts and application sizing
- Desktop Games and Programs are shortcut folders only; their targets resolve to the canonical `C:\\Program Files\\Games` and `C:\\Program Files\\Programs` folders. Do not maintain duplicate app trees.
- Explorer icon view must scale app shortcuts to fill the selected icon size; thumbnails and other view modes retain their own size contracts. Use appId icon mappings before generic document icons.
- Program Files remains the only canonical installed-program/game directory, grouped by publisher/author.

### PROFILE-FS-02 — User account and media associations
- Expose both `C:\\Documents and Settings\\User` and `C:\\Users\\User` as the same second profile, alongside C4m1r.
- My Music exposes all 58 existing Winamp playlist tracks as real `.mp3` virtual files with Winamp artwork. Double-click selects that track in the shared Winamp controller, starts playback from the user gesture, and opens/focuses Winamp.
- My Projects mirrors the canonical project loader: standard projects take precedence, About/Projects articles fill remaining filename IDs, and file bodies are loaded lazily only when opened. Double-click renders the localized frontmatter body as an article.
- Both `C:\\Documents and Settings\\User` and `C:\\Users\\User` resolve to the second User profile; C4m1r remains the default profile.

### APP-UNIFY-01 — Reusable application surfaces
- Consolidate duplicate galleries, file viewers, settings managers and launch flows into canonical implementations.
- Keep domain logic and state shared; skin presentation via theme tokens/components. Avoid duplicate code paths and per-OS forks.
- Document exceptions where a truly different OS interaction model is required.

### DOCS-02 — Documentation and task lifecycle
- Keep active tasks here; archive completed/superseded/obsolete task detail in `docs/history.md`.
- Keep agent handoff notes, verified paths, source/licence audit, commands, test results and cache/research links in `docs/agents.md`.
- Preserve previous task IDs and context when consolidating. Never silently drop a task or user requirement.
- Progress percentages change only with evidence; distinguish source-inspected from manually tested.

## Verification ledger

| Gate | Last known result | Notes |
|---|---|---|
| `npm run verify` | Passed in GitHub Actions at code commit `c5c6bd39` | Context-boundary verification step passed |
| `npm run typecheck` | Passed in GitHub Actions at `c5c6bd39` | TypeScript check passed |
| `npm run lint` | Passed in GitHub Actions at `c5c6bd39` | ESLint passed |
| `npm run build` | Passed in GitHub Actions at `c5c6bd39` | Vite build and build-output verification passed |
| `git diff --check` | Not run | Connector-only edits were committed through GitHub API |
| Browser/manual OS matrix | Pending | Verify Start Menu click-through, Explorer icon sizing, Minesweeper sprites, DOOM/DOOM II gameplay and wallpaper modes across OS skins |
| GitHub Pages deploy | Queued for code commit `c5c6bd39` | Build job succeeded; deploy result must be checked separately |

### EXPLORER-03 — Views model and Small Icons
- Canonical view modes live in `src/apps/explorer/explorerViews.ts`: `thumbnails`, `tiles`, `icons` (Large Icons), `small` (Small Icons), `list`, `details`. The Views menu entries come from `viewMenuEntries()` and are shown for Windows 98, 2000 and the Vista/8/10/11 drafts (`usesViewsMenu`). XP and other skins keep the cycle (`nextCycledViewMode`).
- Small Icons renders 16px icons with names in rows. On My Computer for Windows 98 and 2000 it shows the same system items as Large Icons (`classicSystemEntries`).
- Verified in the browser: Windows 98 Views menu lists Large Icons, Small Icons, List, Details; selecting Small Icons renders the system items.
- Not yet verified: the Windows 10 draft Views menu. Its login asks for a password, which the test run does not have.
- Open: Windows 98/2000 Small Icons flows items row-wise; the native layout fills columns top to bottom. Confirm against `eat/screens/oc/win98/` once screenshots arrive.
- Tiles: 32px icon with name and type line, offered in the Views menu for Vista, 8, 10 and 11 (not Win98/2000).

### BOOT-02 — Boot menu groups, Windows order and accounts
- GRUB top level: My Site, Windows ▸, Unix ▸, MacOS ▸, Mobile ▸, Halloween Edition, Terminal, WebOS (WebOS stays semi-hidden, black text). Each submenu opens its own list with a Back row at the bottom; Esc, Backspace or A also go back.
- Windows order follows the release sequence: 95, 98, 2000, Server 2003, XP, Vista, Server 2008, 7, 8, Server 2012, 10, Server 2016, Server 2019, 11. Server and 95 entries are drafts that reuse the closest client skin until their own skin exists.
- Accounts: the generic desktop login lists User (default, no password) and C4m1r (password 123123). Classic 98/2000 logins already defaulted to User. Chosen account is recorded for the session.
- Open: Halloween Edition sits at the top level; the request did not name a group for it.

### GAMES-02 — Classic card look for the new card games
- Cards: one classic size (62×86 on screen), white face with corner indices and centre suit, navy hatched back, dark outline empty slot. Pile spacing: 22 px for face-up cards, 12 px for face-down cards (`pileStep` in `cards/cards.ts`).
- Table: classic green `#008000` on Solitaire, FreeCell, Spider and Hearts.
- Menu bar: classic `GameMenuBar` (`src/apps/games/GameMenuBar.tsx`) on Solitaire, FreeCell, Hearts (Game > New Game) and Spider (Game > New Game; Options > One/Two/Four Suits, which starts a new deal).
- Done since: F2 starts a new game on all four (`useNewGameShortcut`). Solitaire has Options > Draw One / Draw Three with a fanned waste pile, standard scoring and a m:ss clock. FreeCell shows a clock. Spider shows score (500 start, −1 per move, +100 per suit) and a clock.
- Not 1:1 yet: no Hearts score/clock line beyond its own scoreboard, no Win animation, face-card art is letter-only, face-card art is letter-only, card back is an approximation. No reference screenshots exist in `eat/screens/oc/` yet, so pixel comparison is pending.

### REF-01 — Reference screenshots received 2026-11-22 and Backgammon differences
- Saved to `eat/screens/oc/`: `win2000/01-internet-backgammon.png` (Internet Backgammon; the user wrote 98/2000, filed under 2000, to confirm), `winxp/01-…`, `win2000/02-…`, `win98/01-…`, `vista/01-window-chrome-styles.png` (Aero/Vista/Basic/Standard search-bar styles), `vista/02-explorer-about-windows.png`, `server2003/01-desktop-start-menu.jpg`, `win8/01-start-screen.png`.
- Backgammon, reference vs our build (`src/apps/games/backgammon`), recorded before any change:
  - Board: reference has a bevelled wooden frame, dark board with cream and brown points, a raised bar divider and point numbers 1–12 along the top and bottom edges. Ours is a flat brown frame with no numbers.
  - Checkers: reference has shaded, glossy discs with a rim. Ours are flat circles.
  - Dice: reference shows two 3D cubes between the boards. Ours are numbered tiles in a row above the board.
  - Side panel: reference has player names, Pips and Score for each side, Match Points, Double and Resign buttons, and a cube/score display. Ours has none of these; the Roll button is in the top bar.
  - Chat: reference has a chat log, message picker and an on/off radio. Ours has no chat.
  - Window: reference has the classic title bar with menus Game and Help. Ours has the Game menu only.
  - Rules: reference supports a doubling cube and match play. Ours has neither, and the status line has a different wording.
- Applied (2026-11-22): wooden frame and bevel, point numbers 1–24 on all points, glossy checkers, pip-dot dice, side panel with Pips/Score/Off for both sides, match points (3), cube with Double (the computer takes it when its pip count is within 20% of yours), Resign, chat log with on/off, and a Help menu item; menu bar now has Game (New Match, Next Game, Resign) and Help.
- Second pass (2026-11-22): dice are bevelled cubes with lit and shaded edges; chat has the canned-message picker (`(Select a message to send)`) that posts your line and a short computer reply.
- Still different from the reference: checker shading is an approximation; the computer never doubles; no gammons; no free-text chat; the title bar comes from the OS window frame, not the reference's Windows 98/2000 window.

### REF-02 — Start menu differences, Windows 98 and 2000 (recorded before the change, 2026-11-22)
Reference: `eat/screens/oc/win98/01-desktop-programs-menu-system-properties.png` and `eat/screens/oc/win2000/02-desktop-my-computer-getting-started.png`.
- Taskbar Start button: reference has a flag logo (about 16 px) and a bold "Start" label on a raised grey button about 22 px tall. Ours draws a fake red/yellow gradient square; it must go.
- Banner, Windows 98: navy strip with "Windows" bold and "98" regular, large (about 20 px) and reading bottom to top. Ours is 18 px with tracking.
- Banner, Windows 2000: black-to-blue vertical band with "Windows 2000" bold and "Professional" regular. Ours is a plain blue gradient with a small "2000" suffix.
- Top-level items: reference rows are about 32 px tall with 24 px icons. Ours are about 22 px rows with 16 px icons.
- Submenu items: reference rows are about 22 px with 16 px icons. Ours match in height; check spacing after the change.
- Bottom rows, Windows 98: reference has Suspend and Shut Down; no Log Off. Ours has Log Off and Shut Down. Suspend has no handler yet, so it closes the menu only (known gap).
- Bottom rows, Windows 2000: reference has only Shut Down; no Log Off. Ours has Log Off too.
- Favorites: absent from the 98 reference menu; ours shows it. Removed from the top level.
- Windows 2000 top row: Windows Update with its icon, then a separator. Matches already.
- Panel: reference Windows 2000 menu sits flush to the left edge above the taskbar; ours has a 4 px inset.
- Not yet covered: exact icon art (the reference uses the Windows 98 and 2000 shell icons), the bevelled submenu border, and the 98 Programs submenu contents (98lite, StartUp, MS-DOS Prompt, Windows Explorer). These stay as later items.
- Applied (2026-11-22): the taskbar Start button shows the flag (`win98StartIcon`, now also set for Windows 2000) at 16 px with a bold "Start" in mixed case; the fake gradient square is gone. Banners: Windows 98 is navy with bold "Windows" and regular "98" at 22 px; Windows 2000 is black fading to blue with bold "Windows 2000" and regular "Professional". Top-level rows are 32 px tall with 24 px icons; submenus stay 22 px with 16 px icons. Favorites is removed from both menus. Windows 98 ends with Suspend and Shut Down; Windows 2000 ends with Shut Down only. Suspend has no handler yet and only closes the menu.
- Verified in the browser at 800×600 (GRUB → Windows 98 / Windows 2000 → User → Start).
- Row geometry (2026-11-22, measured in the browser at 640×480 against `eat/screens/oc/win98/01-…png`): the classic rows had a 2 px button border from `os-button`, which made top-level rows 34 px and submenu rows 24 px. The border is now off for these rows: top level 32 px pitch, submenu 22 px pitch, both as in the reference. The root panel bottom sits on the taskbar edge (y 452), as in the reference.
- Still open: the root panel top is about 4 px higher than the reference (182 vs ~186), because the reference list has no spare bottom space; the bevelled submenu border is close but not compared pixel by pixel; the Programs submenu contents (98lite excluded by decision; StartUp empty).
- Not verified: Windows 2000 in the browser after the border change. The GRUB path to 2000 did not open in the check script, so re-check the 2000 Start menu before relying on it.
- Log Off was removed from both menus, so Log Off is reachable only through Shut Down.

### REF-02 pixel pass — icons, placement (2026-11-23)
- Icons are drawn at the size of their own file and never scaled (`image-rendering: pixelated`). Before, 16 px art was stretched to 32 px (98) or 24 px (2000), which made it soft.
- Windows 98 top level uses the 32 px shell icons that match the reference: Programs (`apps/program-manager`), Documents (`mydocs-small`), Settings (`settings-gear`), Find (`search-file-2`), Help (`help-book-small`), Run (`application-hourglass-small`), Suspend (`standby-monitor-moon`), Shut Down (`shut-down-normal`). Run used to be the MS-DOS icon.
- Windows 98 geometry against the reference at 640×480: menu 160 px wide (was 208), submenu 138 px, sidebar about 22 px, icon-to-label gap 4 px on the top level, row pitch 32 px (top level) and 22 px (submenu), flat rows (no shared button bevel), separator 9 px, menu bottom on the taskbar edge (menu ends at y 453, taskbar at 454), list shifted to match the reference rows (within about 1 px).
- Windows 2000 (verified in the browser at 800×600, GRUB → Windows 2000 → User → Start): top-level rows 25 px pitch and separator 6 px as on the reference (row text centres within 1–2 px); menu 136 px wide; banner text 16 px so the menu height matches the reference; menu sits on the taskbar edge (y 580); taskbar 20 px tall with a 16 px Start button; menu body #d4d0c8 as on the reference.
- Pixel rendering: all images in the classic skins use `image-rendering: pixelated` (classic.css, `.os-classic img`), so nothing is smoothed.
- Windows 2000 native chrome (2026-11-23): the banner, separator and submenu arrow are the 2000 pixel art from the reference set (`src/themes/win2000/assets/`), used at their native sizes. The banner art carries its own lettering.
- Scale check: the 800×600 reference screenshot is scaled by about 0.78 (its 32 px icons show at about 25 px, its taskbar at about 20 px). Native 2000 values are therefore a 28 px taskbar, 22 px Start button, 32 px top-level rows, 32 px top-level icons (the Windows 98 32 px art lineage, as in the reference), a 21 px banner, and an auto width. The 25 px pitch and 20 px taskbar from the earlier pass were measured on the scaled screenshot and are withdrawn.
- Width: the Windows 2000 menu grows to its longest label, so "Shut Down..." and the Russian names are never clipped (`min-width` 174 px, `width: max-content`).
- Windows Update keeps its 16 px art: the set has no 32 px version of it.
- Still different from the reference (no matching art in the repo): MS-DOS Prompt shows the blue DOS box (reference: red MS-DOS logo, 32 px art only); Accessories and StartUp show the plain folder (reference: folder with a program window; no 16 px art for it); Windows Explorer uses `directory-explorer/16x16-3`, which is the closest match.

## STYLE-01 — Per-OS stylesheets (2026-11-22)
- Global CSS fell from 573 KB to 200 KB in the main bundle. OS-specific files now load per OS from `src/styles/os/osStyleSheets.ts` as separate chunks: classic (98/2000), XP, Win 7, Ubuntu, Arch, macOS, iOS, WebOS, Halloween.
- Halloween is a child of Windows XP: it loads the full XP set and then `halloween.css` on top.
- `src/styles/os/index.css` keeps only the shared layer: tokens, os-base, cv, system-actions, desktop-workspace, explorer adapters and the Apple session/widget files with no OS selectors.
- `App.tsx` waits for the OS set before rendering WebOS, so no unstyled frame shows.
- Verified against the HEAD build: Win 98, Win 2000, XP, Win 7, Ubuntu, macOS, WebOS and GRUB match pixel for pixel. Halloween differs by a few shadow pixels on the login card.
- Not done yet (next steps): `webos.css` as a master for generic selectors. In practice the generic layer is `os-base.css`, which already loads globally; `webos.css` holds rules scoped to `.os-webos` and would leak into other OSes if it were the master. Also `src/themes/winxp/xp.css` (47 KB, classes `.theme-98`, `.theme-webos`, `.theme-win-xp`) still loads globally and should move to its own sets.

## Deferred during CSS migration
- Do not modify Explorer, Games or other broad application styling/layout surfaces while Claude's CSS extraction/optimization migration is in progress. Resume the previously planned Explorer/Games work only after the migration is complete and its resulting CSS ownership/import boundaries are stable. Continue isolated Winamp logic and non-conflicting application functionality in the meantime.

## Start menu — deferred, with reasons (2026-11-22)
- **98lite entry in Programs** (reference `eat/screens/oc/win98/01-…png`): decided 2026-11-22. 98lite is not part of the canonical Windows 98 set, so it is not added and is not planned. This closes the item; it is not a deferred task.
- **StartUp submenu** — done in ARCH-01 below.
- **Unified Start menu architecture** (needed for StartUp and for the rest of the menus): today the Windows 98/2000 menu is a hardcoded list in `StartMenu98.tsx`, while XP and 7 have their own lists in `StartMenuXP.tsx` and `StartMenu7.tsx`. The plan is one data source built from the file system's `Start Menu` folder and a single renderer per visual skin. This changes the menu for every Windows skin, so it is a separate, reviewed step and not part of the visual pass.
- **Log Off** is not in the 98 or 2000 menus (per reference). Its function is reachable through Shut Down only. This is a deliberate choice, recorded here so it is not treated as a regression.

## Remaining 1:1 OS design tasks — as of 2026-11-23

Reference source: `eat/screens/oc/<os>/` (win98 and win2000 screenshots, Internet Backgammon). Completed items are in [history.md](./history.md), section "Moved from tasks.md — 2026-11-23".

### Windows 95 / 98
- Start button text and classic UI font: done (2026-11-24). `classic.css` now declares `Pixelated MS Sans Serif` (regular and bold woff2 from `eat/windows-98-portfolio-main/src/fonts`, copied to `src/assets/fonts`); there was no `@font-face` before, so classic skins rendered a fallback. The face is designed for 11 px: Start menu rows use 11 px. Other classic components that hard-code 12 px or `Tahoma` should be reviewed against it.
- Accelerator underlines on menu items: not visible in the reference screenshot; confirm against an Alt-key capture before changing.
- Start menu rows and banner metrics: re-measure against `01-desktop-programs-menu-system-properties.png` after the banner fix (banner now matches; row spacing not re-checked).
- Windows 95 cursor set: uses the 98 set for now; confirm the 95 scheme separately if a 95 reference appears.
- Logon ("Welcome to Windows") window: compare with a reference capture (none in `eat/screens/oc/win98/` yet).

### Windows 2000
- Cursors: no Windows 2000 `.cur` set in the repo. Needs the 2000 scheme before it can be canonical; the 98 set must not be reused.
- Start menu top-level icons: 32 px shell art is approximate (98 lineage). Needs a 2000 Start-menu reference capture.
- Logon window: teal background, position and the "Log on to" row behind Options >> / << Options are done (2026-11-23; OK, Cancel, Shut Down... and Options >> fit the 420 px window at 640x480). Remaining 2000 logon details need a reference.
- Desktop default colour: kept at `#3a6ea5` to match the Windows 2000 Server reference; confirm if the canonical default should be teal.
- Boot: Professional and Server Family GIFs in place with paced progress; Advanced Server and Datacenter currently use the Server Family splash. Confirm whether they need their own splash.
- Taskbar: tile wired. Face colour fixed to the 2000 window face #d4d0c8 (`.os-classic .taskbar.theme-win2000` in `classic.css`; the shared `.taskbar-98` grey was winning). The language flag was a taskbar-body item between the task buttons and the tray; it now sits at the left edge of the tray, before the other tray icons and the speaker (`TaskbarSystemArea` `languageSlot`), as in the Windows tray. Verified at 640x480 on Windows 2000 (flag left of the tray icons, clock unchanged). Windows XP checked in the browser (2026-11-24): flag sits at the left of the tray icons, desktop and labels render on the shipped Tahoma, and the XP flow still runs login → XP welcome → desktop (it has its own state machine in `src/themes/winxp`; only the shared `WebOS` skips the welcome). Not yet checked visually: Windows 7 tray. Quick launch (2026-11-24): Show Desktop, Internet Explorer and Outlook Express after Start (Show Desktop is ICO 316 from `eat/windows2000-main`; Outlook Express keeps the 98 art until a native bitmap is found). Windows 2000 top-level Start rows now use the native 32 px bitmaps (ICO 104, 110, 116, 122, 128, 134, 139). Start size (22 px, native) and 28 px taskbar are kept: the reference is scaled about 0.78, so its pixel sizes are not native.

### Boot, logon and sound (all Windows-family OSes)
- Startup sound plays only on logon (desktop mount). Confirmed by the audio trace; Safari and Firefox not tested.
- Preloading: on the logon screen, images and sounds of the theme are cached (15 files before logon, 1 after, on Windows 98). Not yet covered: the boot video (warmed at the GRUB click only) and cursor images referenced from CSS outside the 98 set.
- XP-style loader: a generic boot screen (`src/themes/winxp/BootScreen.tsx`) is shown by `App.tsx` whenever the mode is `webos` and the theme is still the default `win-xp`. The trigger is not reproduced; needs the user's exact steps.

### Games and applications (open records in this file)
- Backgammon: remaining differences from the reference (checker shading approximation, no computer doubling, no gammons, no free-text chat, title bar from the OS frame). See REF-01 above.
- Card games: face-card art, win animation and card back are not 1:1 (GAMES-02 above).
- Explorer Small Icons on Windows 98 and 2000: flows row-wise; the native layout fills columns top to bottom (EXPLORER-03 above).
- GRUB grouping: Halloween Edition placement at the top level awaits a decision (BOOT-02 above).

### Visual-fidelity and product P0/P1 items still open
- See P0 and P1 above (STARTMENU-01/02, PROFILE-FS, DOCS, PICTURES, CONTROL, THEMES-01, OS-FIDELITY-01 and the rest). Those are product items; the list above covers only design fidelity.


- 1:1 visual reconstruction is tracked separately in `docs/winamp-classic-1to1-gap-analysis.md`; use the user-supplied original Winamp 2.x screenshot as the faceplate reference and keep project-specific actions in menus rather than permanent rows.

## Winamp — classic geometry and local audio
- Preserve the separate draggable main, equalizer and playlist modules. Base window width remains 275 px, matching Winamp 2/Webamp; retain the original titlebar, transport, display, fader and playlist density. Reference layout places main at (0,0), EQ at (0,116), and Playlist at (0,232); a small desktop offset is acceptable, but do not turn the modules into one modern resizable player.
- Do not expand main/EQ to accommodate import tools. EQF/Q1 and M3U actions stay secondary and compact; the original controls keep visual priority. Narrow-viewport width reduction is only a fallback.
- Local audio files are stored as Blob records in IndexedDB, never as persisted `blob:` URLs. On restore, create fresh object URLs and append records to the single shared controller queue. Persist duration metadata; removing a local track deletes its stored record and lets the controller revoke its session URL.
- If IndexedDB is unavailable or quota is exceeded, the selected audio remains playable for the current session and the UI reports that it was not saved. Remote M3U tracks remain separate.
- The local audio picker belongs to the Winamp shell, not the Playlist body, so the classic `L` shortcut and ADD action work while Playlist is hidden.
- Reopening the full player must compare persisted IDs against the live controller queue before creating object URLs, avoiding duplicate queue entries and leaked URLs when the singleton outlives the window. Keep local-library and M3U feedback in one existing Playlist status row so the feature does not add another permanent row to the classic window.
- Acceptance: reload with saved audio and confirm tracks restore/play; remove a saved track and confirm it stays removed after reload; verify storage-failure fallback; compare all three modules with the Webamp reference at native 275 px width. Browser QA remains required.


- Equalizer layout correction (2026-11-24): moved `Q1 OUT` from the lower preset-action rail into the top header row beside the preset dropdown (including `Flat`), so it no longer occupies a dedicated line. Its existing export handler and Q1 library contents are unchanged; the lower rail retains preset-name, SAVE/DEL and EQF IN/OUT actions. The control is styled only for `.wa-shell--webamp-classic`; Dev Alpha and imported `.wsz` layouts are unchanged. Source-level verification only; browser visual QA remains required.
- Main visual precision pass (2026-11-24): the classic transport bank now uses the original adjacent 23 px button rhythm (22 px Eject), with compact mode toggles and tighter status/slider alignment. Stereo/mono labels have a restrained LED-like hierarchy; their source state remains the existing static UI value, not a live channel detector. The displayed 128 kbps / 44 kHz values also remain placeholders, not stream metadata. CSS is scoped to `.wa-shell--webamp-classic`; handlers, playback, imported `.wsz`, and Dev Alpha are unchanged. Responsive wrapping remains enabled below 440 px. Source-level change only; browser visual QA and CI are not yet confirmed.

### WINAMP-SKIN-01 — Classic .wsz archive ingestion (P0)
- Added `src/system/audio/winampSkin.ts` as a presentation-only archive parser. It reads the ZIP central directory, extracts supported bitmap/config entries, and does not import or instantiate the Webamp runtime or a second audio engine.
- Safety limits: 24 MB archive, 64 MB expanded payload, 16 MB per entry, 512 entries. ZIP validation now checks EOCD/comment and central-directory boundaries, validates each local header against its central-directory entry (name, flags and compression), prevents entry data from overlapping the central directory, rejects unsupported/encrypted/ZIP64/multi-volume entries and unsafe paths, and verifies CRC-32 plus declared expanded size after extraction. Supports stored and DEFLATE entries through the browser's native `DecompressionStream`.
- Recognizes classic sprite/config assets, parses `pledit.txt` playlist colors/font, `viscolor.txt` visualizer palette and preserves `region.txt` for the later clipping stage.
- **Current status: parser + atlas + first Main integration slice.** `src/system/audio/winampSkinAtlas.ts` defines native Winamp 2.x sprite rectangles and a canvas cropper. `src/system/audio/winampSkinLibrary.ts` stores the active `.wsz` archive in a dedicated IndexedDB database. `WinampPlayer.tsx` now exposes SKIN IN / RESET, validates and previews a selected archive by applying its native `main.bmp` (or `main.png`) sheet and active titlebar crop to the Main window, restores the selected skin after reload, and revokes generated object URLs when replaced/unmounted. The Main window now also renders imported native sprite states for Previous/Play/Pause/Stop/Next/Eject, Shuffle/Repeat and EQ/Playlist toggles; pressed states swap to their corresponding sprite crops. Sprite batches decode each source sheet once and render at native pixel dimensions. The Main position bar now uses the native 248×10 track and normal/pressed 29×10 thumb; volume and balance use their native 68×420 / 38×420 frame strips with 14×11 normal/pressed thumbs, retaining real HTML range interaction and controller synchronization. Playback state uses the native play/pause/stop indicator sprites. The time display now supports the classic 9×13 bitmap glyphs from `numbers.bmp` (the actual classic archive filename), with `nums_ex.bmp` retained as a compatibility fallback; skins without either sheet retain the original text display. Equalizer integration has started: the native `eqmain.bmp` panel and active titlebar are applied, and ON/AUTO controls use native skin button sprites while preserving their original handlers. EQ fader tracks/thumbs, preset tools and Playlist still need full native rendering. The existing project renderer is **Dev Alpha**; it is not the Webamp Classic skin. Player Settings now exposes three separate appearance choices: Dev Alpha, **Classic Winamp (Webamp Classic)**, and an imported `.wsz` skin. Webamp Classic currently has its own isolated CSS appearance layer in `winamp.css`; it changes presentation only and leaves all existing controls, playback, playlist, EQ and controller behavior intact. A second CSS pass tightens the 275 px window chassis, main display/transport spacing, EQ header/fader density, and 275×232 Playlist proportions while keeping narrow-viewport fallback rules. A third pass gives the EQ sliders custom vertical metallic thumbs/tracks, restores the black/green/blue-selection playlist palette, removes the non-native album-art tile from this renderer, and tightens titlebar/button chrome.  The latest isolated EQ visual pass compresses the preset/EQF/Q1 tool strip into a single compact horizontal row, reduces its control typography/heights, keeps overflow reachable on narrow screens, and restores more vertical room to the native-style graph and fader bank. All preset/import/export controls remain present and wired to their existing handlers; this is presentation-only. The latest Playlist-only pass restores a fixed 275×232 outer window with a 14 px titlebar, a flexible black/green track list, compact 13 px rows, and a denser footer hierarchy. The original playlist actions, M3U import/export, SKIN IN/RESET, status/time display, mini transport and LIST OPTS remain present; narrow screens keep overflow reachable rather than hiding controls. This is CSS-only and does not alter playlist handlers or controller behavior. A follow-up interaction-state pass adds classic beveled hover/disabled button states, visible keyboard focus, a matching narrow scrollbar, and clearer current/selected track contrast; no playlist event handlers or controller calls changed.  A shared-chrome pass now normalizes the Main, Equalizer and Playlist outer frame, 14 px titlebar bevel, body surface gradient, compact control bevels and pressed states under the Webamp Classic scope only; the three windows retain their own content geometry and behavior. A Main LCD interaction pass adds three clickable visualizer views in Webamp Classic: Spectrum (frequency bars with peak markers), Oscilloscope (time-domain waveform from the existing analyser, with a lightweight animated fallback), and Peak meter. Clicking the central LED analyzer cycles the views; it does not alter playback, EQ settings or controller state. The control exposes its current mode through its accessible label and title. A follow-up Main hardware-detail pass tightens the LCD's three-column proportions, indicator spacing, green numeric display and marquee hierarchy; refines the spectrum bar palette and scanline treatment; and gives the seek, volume and balance controls visible compact metallic range thumbs with keyboard focus and pressed states. Transport controls receive a more consistent raised/pressed bevel. All range inputs remain real interactive HTML controls and continue to call the existing seek/volume/balance handlers; no controller or playback logic changed. This remains a CSS approximation rather than a bitmap-exact skin; the next fidelity step is to use the official sprite atlas for Webamp Classic instead of gradients and text glyphs. The current renderer preference is stored in localStorage (legacy `built-in` values migrate to `dev-alpha`); unknown/empty values safely fall back to Dev Alpha. Importing/resetting a `.wsz` does not delete either built-in appearance. The Webamp Classic CSS pass is an initial visual approximation, not yet pixel-accurate: native bitmap integration and exact main/EQ/Playlist geometry remain follow-up work. Do not relabel Dev Alpha or treat an arbitrary imported `.wsz` as the bundled Webamp Classic skin. Future visual migrations must keep prior implementations available as opt-in alternatives until replacements pass browser acceptance. Keep the existing controller as the only playback/DSP owner. Do not describe .wsz skin support as complete until all three modules and browser acceptance are done.
- Reference architecture: official Webamp MIT project documents .wsz as ZIP archives containing BMP sprite sheets and config files; its parser slices sprite sheets and applies playlist/visualizer settings. We are porting the relevant format concepts into the existing Winamp presentation layer rather than embedding Webamp. See https://github.com/captbaritone/webamp and its `packages/webamp/docs/architecture.md`.
- Next: connect remaining Main status fields (including stereo/mono and technical metadata); finish EQ fader tracks/thumbs and preset controls; then skin Playlist chrome, apply `pledit.txt` palette/config, and complete browser QA with default and third-party `.wsz` archives. Keep the built-in renderer selectable in Player Settings throughout and after each migration. Preserve native 275 px width and separate modules. Atlas coordinates are sourced from Webamp's MIT classic skin XML definitions; no Webamp runtime is embedded. The original `base-2.91.wsz` bitmap sheets in Webamp's repository are Nullsoft/Winamp artwork, not covered by Webamp's MIT code licence; do not bundle or redistribute them in this project without a separate permission/licence. Keep the built-in Webamp Classic renderer distinct from imported `.wsz`; an independently licensed or original replacement bitmap set is required for a bundled bitmap-exact skin.


### Winamp — classic .wsz skin support (planned implementation)
- Reference implementation: captbaritone/webamp (MIT). Port the classic skin format and visual behavior into the existing Winamp components; do not mount Webamp or create a second audio/player runtime.
- .wsz is a ZIP archive. The importer must validate the ZIP central directory before extraction: reject encrypted/unsupported entries, ZIP64 unless deliberately supported, path traversal, excessive entry count, oversized individual files and excessive total uncompressed size. Do not trust compressed file size alone.
- Resolve skin assets case-insensitively and allow archive subdirectories. Core classic sheets include MAIN.bmp, TITLEBAR.bmp, CBUTTONS.bmp, POSBAR.bmp, VOLUME.bmp, BALANCE.bmp, SHUFREP.bmp, EQMAIN.bmp, PLEDIT.bmp, NUMBERS.bmp, PLAYPAUS.bmp, MONOSTER.bmp, and TEXT.bmp; optional palette/config files include PLEDIT.txt, VISCOLOR.txt, and REGION.txt.
- Rendering must use the real sprite coordinates and states from the Webamp skin atlas, not stretch an entire sheet as a background. Buttons, titlebar controls, seek/volume/balance faders, EQ graph/sliders, numeric display, and playlist chrome should be mapped to their corresponding sprites.
- Preserve classic native geometry: main window 275×116; EQ starts at y=116; Playlist starts at y=232; retain separate draggable/shaded modules. Existing extra controls (EQF/M3U/local-library) must remain secondary and must not displace classic controls or increase the native main/EQ dimensions.
- Keep the existing winampController as the sole playback/DSP/playlist state owner. Skin state is presentation-only and must not recreate audio nodes or reset playback.
- Skin selection should support import, preview/name, reset to built-in skin, persistence across reload, and clean revocation of generated object URLs when a skin is replaced. Invalid archives must leave the current skin untouched and show an accessible error.
- Stage order: (1) safe ZIP/asset parser and fixtures; (2) sprite atlas metadata and CSS/image renderer; (3) main-window transport/display; (4) EQ; (5) Playlist; (6) palette/config and persistence; (7) browser QA against at least the default Winamp 2.x skin plus one third-party .wsz.
- Acceptance: import representative .wsz files with upper/lowercase names and nested paths; reject malformed/oversized archives without freezing the page; verify sprite states and all three modules at native size; verify playback, EQ, playlist operations and local audio remain unchanged when skins are switched. Do not mark skin support Verified until this browser QA is completed.

- Fonts (2026-11-24): Tahoma (regular from `eat/windows2000-main`, bold from `eat/winxpsite-main`) is declared in `xp-shared.css` and drives the Windows 2000 UI text (`.os-classic.os-win2000`); the classic tray clock is regular weight. The Start button keeps MS Sans Serif bold. Not yet reviewed: XP and Windows 7 text against Tahoma/Segoe metrics, and classic components with hard-coded 12 px.

- Windows 2000 window palette (2026-11-24): face `#d4d0c8`, active caption gradient `#0a246a → #a6caf0`, inactive `#808080 → #c0c0c0` (`.os-classic.os-win2000` variables in `classic.css`), per `eat/screens/oc/win2000/02-desktop-my-computer-getting-started.png`. Windows 2000 reference desktop icons (left column: My Documents, My Computer, My Network Places, Recycle Bin, Internet Explorer, Connect to the Internet) are not reproduced yet; our 2000 desktop still shows the shared set.

- Windows 95/98/2000 desktop layout (2026-11-24): one column from the top-left on a 75 px grid, wrapping to a second column at the taskbar; the Recycle Bin flows with the other icons and can be dragged (`classicLayout` in `useDesktopIconGridState`). Windows 2000 lists My Documents, My Computer, Recycle Bin, Internet Explorer (ICO 431), then the site's Games and Programs. Still missing against the reference: My Network Places and Connect to the Internet (no targets exist). XP, 7 and the other skins keep the shared two-column grid with the Recycle Bin pinned bottom-right.

## New requests — 2026-11-24 (from the owner)
- **My Network Places (Windows 2000 desktop, also usable on 95/98 as Network Neighborhood).** Purpose: browse a few well-known, safe public FTP archives (candidates: ftp.gnu.org, ftp.debian.org, ftp.kernel.org, ftp.mozilla.org). Constraints to design around: browsers cannot speak FTP, so it needs either the sites' HTTPS mirrors parsed from directory listings (CORS permitting) or a small proxy we control; entries must be read-only, listed in a fixed allowlist, with downloads opened as normal links. Open question: proxy or HTTPS-listing approach.
- **Connect to the Internet (Windows 2000 desktop).** The connection is always shown as active and displays the visitor's real network details (public IP and what the lookup returns, e.g. country and provider). Needs a lookup source (a public IP API, or a Cloudflare trace endpoint) and a visible note that the address is fetched from it. Open question: which provider, and whether to cache the result for the session.
- **Windows 2000 Explorer toolbar.** Replace the XP-style toolbar in `MyComputer` for the 2000 skin with the native one: Back, Forward, Up | Search, Folders, History | Move To, Copy To, Delete, Undo | Views; plus the Address bar. Done (2026-11-24): native layout (icon above label, flat buttons raised on hover, etched separators, sunken Address field, flat Go button; `fx-*` hooks in `MyComputer.tsx`, styles at the end of `classic.css`) for Windows 98 and 2000, plus the 2000-only History, Move To, Copy To, Delete and Undo buttons (disabled, no handlers yet), and the window now fits a 640×480 screen. Still approximate: the Back/Forward/Up glyphs are Lucide chevrons and the disabled-button glyphs are placeholder boxes, because no native Explorer toolbar bitmaps exist in the repo or `eat/`. Windows 98 should also get its own button set (Cut, Copy, Paste, Undo, Delete, Properties, Views) instead of the shared one.

- Windows 2000 My Computer web-view pane (2026-11-24): the window opens with the white left pane (64 px folder icon, bold title, blue rule, "Select an item to view its description.") instead of the folder tree; the Folders button swaps the tree back in (`fx-webview` in `MyComputer.tsx` and `classic.css`, reference `eat/screens/oc/win2000/02-desktop-my-computer-getting-started.png`). Status bar done (sunken panels: object count, selection size, location with icon; `fx-status`). Bug fixed on the way: classic windows built on the `xp-window` markup had a `display:block` frame taller than the window, so the Explorer's bottom (status bar, last icon row) sat below the frame; `classic.css` now makes the frame a full-height column. Still to do: per-item descriptions beyond the drive and system-folder kinds, the "See also" links, and Windows 98's own button set. Details view (2026-11-24): native raised column headers (Name, Type, Total Size, Free Space at My Computer; Name, Type, Size in folders), 16 px icons, navy selection (`fx-details`); drive sizes and free space stay blank because the virtual disks have no real values, and a Modified column needs timestamps on the file system items. Small Icons already existed. The classic window surface is now `overflow: hidden` (it was clipping anyway) and the Explorer toolbar clips instead of scrolling; a chevron overflow menu like the native one is still missing.


### Winamp — Webamp Classic Main LCD precision pass (2026-11-24)
- Built-in Classic renderer: refined the Main LCD presentation within the Webamp Classic scope only. Tightened time-display proportions and condensed/tabular digit treatment; gave the analyzer a dark inset LED surface, scanline treatment, clearer spectrum peaks and a restrained waveform glow; tightened the technical readout and Mono/Stereo indicator hierarchy; refined seek/volume/balance labels and inset tracks.
- Kept the existing three-mode analyzer interaction (Spectrum / Oscilloscope / Peak meter), all playback/controller handlers, Dev Alpha and imported .wsz rendering unchanged.
- Bitrate and sample-rate readouts (128 kbps, 44 kHz) remain static presentation values, not measured stream metadata. Mono/Stereo currently remains a visual state, not channel-count detection.
- This is still a CSS approximation, not a bitmap-exact reconstruction. Original Nullsoft bitmap artwork is not bundled; the Webamp MIT code licence does not automatically license those assets.
- Verification: source update succeeded; browser visual QA, build/typecheck and CI checks have not yet been run. Do not mark this pass Verified until the relevant checks and narrow/mobile visual review are complete.


### Winamp — Webamp Classic Main native chassis geometry (2026-11-24)
- CSS-only geometry pass for the built-in Classic renderer: Main is constrained to the atlas reference size of 275 × 116 px, with a 14 px title strip and 100 px content area. The LCD/display, seek + volume/balance row and transport row receive explicit compact dimensions and spacing so the native window height is respected.
- Transport controls retain their native 23 × 18 px footprint (Eject 22 × 18 px in this approximation). Narrow-screen width handling remains scoped to Webamp Classic.
- No TSX markup, playback/controller handlers, audio state, Dev Alpha or imported .wsz styles were changed.
- Verification: CSS source structure and scoped selector checks performed after update; browser screenshot/layout QA, build/typecheck and CI have not been run. Treat the exact 275 × 116 layout as an authored CSS target, not browser-verified pixel parity.

### Winamp — Webamp Classic Main pixel-detail pass (2026-11-24)
- Added a narrowly scoped CSS pass for the built-in Webamp Classic Main window: compact pixel-like PLAY/PAUSE indicators, sharper green LCD digits and colon, boxed Mono/Stereo readouts, and more tactile transport/slider bevels with focus treatment.
- Existing time toggle, playback handlers, visualizer modes, slider inputs, imported .wsz skins and Dev Alpha are unchanged. No original Nullsoft bitmap assets were copied or embedded; this is an original CSS approximation.
- Preserved the authored Main target geometry (275 × 116 px; 14 px title strip; 44 px display; 18 px transport row).
- Verification still required: build/typecheck, browser visual review at desktop and narrow widths, and interaction QA. CI status is checked separately; no browser QA is claimed by this source-only pass.

### Winamp — Webamp Classic Main LCD hierarchy pass (2026-11-24)
- Refined the Main display's three-column hierarchy: subtle divider beside the time readout, tighter LCD inset, low-contrast analyzer grid, compact marquee surface and aligned technical readouts. Mono/Stereo badges were tightened to fit the right-hand information column.
- Responsive column proportions remain explicitly scoped to Webamp Classic. The 275 × 116 px Main target, 14 px title strip, existing time toggle, analyzer click-to-cycle behavior and playback/control handlers remain unchanged.
- CSS-only presentation change; no original Nullsoft artwork or external assets added. Dev Alpha and imported .wsz styling are untouched.
- Verification: source structure/scope and CSS brace balance to be checked after update. Browser visual QA, build/typecheck and CI remain separate requirements; do not mark Verified before they run.

### Winamp — Webamp Classic Main titlebar and chassis pass (2026-11-24)
- Refined only the built-in Webamp Classic Main window's top chrome: metallic title strip with restrained brushed highlights, stronger outer edge/bevel, compact title mark and more legible title typography.
- Minimize, windowshade, settings and close controls now have clearer raised, hover, pressed and keyboard-focus states; the close control receives a restrained red treatment.
- Styling is scoped to `.wa-shell--webamp-classic .wa-main`. Existing button markup, drag handling, windowshade/settings/close handlers, Main dimensions, Equalizer, Playlist, Dev Alpha and imported `.wsz` skins are unchanged.
- Verification: CSS brace balance and selector-scope checks performed on the resulting source. Browser visual QA, build/typecheck and CI remain unconfirmed; this is not a pixel-exact bitmap reconstruction.

### Winamp — Webamp Classic Equalizer faceplate refinement (2026-11-24)
- Reworked the built-in Classic EQ's metal faceplate, title strip, ON/AUTO buttons and LEDs, graph grid/glow, preset selector, preset action rail, dB scale, ten frequency faders, preamp fader, slider caps, frequency labels and focus states.
- Added dedicated WebKit and Firefox range-thumb styling while retaining native range controls and their existing handlers.
- CSS-only, scoped to `.wa-shell--webamp-classic`; no EQ values, preset data/operations, EQF/Q1 import/export, DSP, Main, Playlist, Dev Alpha or imported `.wsz` skin behavior changed.
- Verification: CSS braces balanced and all new selectors scoped to Webamp Classic. Browser visual/interaction QA not available in this run; CI will be checked after the docs commit.

### Winamp — Webamp Classic Equalizer faceplate pass (2026-11-24)
- Refined the built-in Classic Equalizer's title strip, metal frame, compact ON/AUTO toggles, response-curve display, fader wells, slider caps and frequency labels.
- Added restrained graph grid and curve glow, clearer active LED treatment, tactile raised/pressed window controls and visible keyboard focus states.
- Presentation-only CSS scoped to `.wa-shell--webamp-classic .wa-equalizer` and its descendants. EQ band values, preamp, preset selection/save/delete, EQF/Q1 import/export, DSP calls, windowshade/close handlers, Main, Playlist, Dev Alpha and imported `.wsz` rendering were not changed.
- Verification: CSS brace balance and new-selector scope checked after update. Browser visual/interaction QA, build/typecheck and CI remain unconfirmed; the faceplate remains an original CSS approximation rather than a bitmap-exact Nullsoft skin.



### Winamp — Webamp Classic Equalizer band geometry pass (2026-11-24)
- Refined the ten-band fader bank spacing and fixed-width dB scale gutter within the built-in Webamp Classic scope. PREAMP remains a distinct first band with a slightly stronger visual allocation; the separator retains a clear gap before the ten frequency bands.
- Aligned the +12 / 0 / −12 dB scale baseline with the fader travel and added a restrained center reference line to each track. Frequency labels now use a consistent compact baseline; narrow layouts receive a smaller scale gutter while retaining all eleven controls.
- CSS-only presentation change. No JSX, slider ranges/values, preset handlers, EQ/DSP logic, controller behavior, Dev Alpha or imported .wsz styling changed.
- Verification: source update committed; browser visual QA, build/typecheck and interaction QA have not been run. Treat the zero line and spacing as authored CSS targets, not visually verified pixel parity.


### Winamp — Webamp Classic Equalizer response graph pass (2026-11-24)
- Refined the response graph's dark green grid, added a restrained horizontal 0 dB reference through the center of the 24-unit SVG viewBox, and tightened the yellow response trace treatment.
- The graph continues to plot the ten frequency-band values only; PREAMP remains a separate gain control. No JSX, curve data mapping, slider values, DSP, preset handling, playback/controller behavior, Dev Alpha or imported .wsz rendering changed.
- CSS-only presentation pass scoped to the built-in Webamp Classic renderer. Verification: source update committed; browser visual QA, build/typecheck and interaction QA have not been run. The grid-to-band alignment is an authored visual approximation, not verified pixel parity.


### Winamp — Webamp Classic Equalizer fader cap and dB reference pass (2026-11-24)
- Refined the eleven vertical fader caps with a compact metallic bevel, distinct hover/pressed states and keyboard-focus visibility. Track wells now have a clearer center reference and restrained tick treatment.
- Kept the range orientation explicit: with `writing-mode: vertical-lr` and `direction: rtl`, positive gain is at the top, 0 dB at the midpoint and negative gain at the bottom. Existing `min=-12`, `max=12`, `step=0.5`, values, SVG response mapping and EQ handlers are unchanged.
- CSS-only and scoped to `.wa-shell--webamp-classic`. No JSX, audio/DSP logic, presets, Dev Alpha or imported `.wsz` styling changed.
- Verification: source update committed. Browser-specific thumb orientation, endpoint alignment and touch/keyboard interaction still require visual QA; build/typecheck and CI have not been confirmed.


### Winamp — Webamp Classic Equalizer response graph calibration (2026-11-24)
- Refined the graph's dB guides: a stronger 0 dB centerline and quieter ±6 dB guides improve reading without changing the response display's dimensions.
- Confirmed the existing vertical grid origin/interval was already aligned to the ten SVG sample positions: x=2..98 with 10.6667% spacing. Kept that mapping rather than changing it and introducing drift from the existing curve.
- Smoothed the response trace caps/joins and refined its restrained yellow-green glow. The ten frequency-band values remain the only plotted values; PREAMP remains separate.
- CSS-only, scoped to .wa-shell--webamp-classic; no TSX, EQ values, slider handlers, presets, DSP/audio logic, Dev Alpha or imported .wsz rendering changed.
- Verification: source and documentation committed; CSS brace/scope checks performed. Browser visual QA, build/typecheck and CI remain unconfirmed.


### Winamp — Webamp Classic Equalizer ON/AUTO switch detail (2026-11-24)
- Refined the built-in Classic EQ ON/AUTO controls as compact recessed hardware switches, with distinct raised, hover, pressed and keyboard-focus states.
- The ON indicator uses a green LED when active; AUTO uses a separate warm amber LED so the two states are visually distinguishable. Inactive LEDs remain dark and inset.
- CSS-only, scoped to `.wa-shell--webamp-classic`. Existing button markup, `eqOn`/`eqAuto` state, click handlers, DSP/controller behavior, presets, faders, Dev Alpha and imported .wsz rendering are unchanged.
- Verification: source CSS structure and selector scope checked after update. Browser visual/interaction QA, build/typecheck and CI are not confirmed.


### Winamp — Webamp Classic EQ upper display frame (2026-11-24)
- Refined the top EQ strip proportions: the ON/AUTO switch bank has a stable 59px footprint and the response graph uses the remaining width without shrinking below its container.
- Added a clearer recessed display bezel with asymmetric light/dark edges and tightened SVG clipping/stroke treatment for a compact LCD-like response display.
- Kept the existing ten-band response coordinates, grid calibration, 0 dB reference, EQ controls and all handlers unchanged. CSS-only and scoped to `.wa-shell--webamp-classic`.
- Verification: CSS brace balance and new selector scope checked. Browser visual QA, build/typecheck and CI are not confirmed.


### Winamp — Webamp Classic Equalizer PREAMP and frequency label separation (2026-11-24)
- Gave the PREAMP column a fixed compact footprint and a restrained warm accent so it reads as a separate gain control rather than an eleventh frequency band.
- Increased the visual break before the ten frequency bands and normalized their compact numeric labels with tabular figures; retained the existing narrow-screen reduction.
- CSS-only, scoped to `.wa-shell--webamp-classic`. No JSX, frequency constants, slider values/ranges, EQ graph mapping, presets, DSP/controller behavior, Dev Alpha or imported .wsz rendering changed.
- Verification: CSS brace balance and scope of the new selectors checked. Browser visual/interaction QA, build/typecheck and CI remain unconfirmed.


### Winamp — Webamp Classic Equalizer dB scale alignment (2026-11-24)
- Tightened the vertical dB scale geometry: +12 dB and −12 dB labels now sit closer to the actual slider-thumb travel endpoints, while 0 dB remains centered on the track midpoint.
- Added short etched tick marks beside the three reference labels, with a slightly stronger center tick. Kept the existing 63 px fader travel and the current range values/orientation unchanged.
- CSS-only, scoped to `.wa-shell--webamp-classic`; no JSX, EQ values, presets, DSP/controller logic, Dev Alpha or imported .wsz rendering changed.
- Verification: CSS brace balance and new-selector scope checked. Browser-specific range-thumb alignment, browser visual QA, build/typecheck and CI remain unconfirmed.


### Winamp — Webamp Classic EQ cross-browser range normalization (2026-11-24)
- Added an explicit unstyled native range baseline for the built-in Classic EQ sliders, then retained the custom metallic thumb and track presentation through the existing WebKit and Gecko pseudo-elements.
- Harmonized track/progress transparency, removed Firefox's outer focus decoration, and added matching keyboard-focus and disabled-state treatment for both engines.
- CSS-only, scoped to `.wa-shell--webamp-classic`. Slider orientation, min/max/step, values, event handlers, PREAMP separation, graph mapping, DSP/controller behavior, Dev Alpha and imported .wsz styles remain unchanged.
- Verification: CSS brace balance and selector scope checked. Actual Chrome/Firefox thumb geometry, touch, keyboard, browser visual QA, build/typecheck and CI still require runtime validation.


### Winamp — Webamp Classic EQ lower baseline and label alignment (2026-11-24)
- Unified the eleven fader columns on a shared lower baseline: 63 px track wells, consistent label row height, and a controlled gap between the metal faders and their frequency captions.
- Tightened PREAMP caption sizing separately from the ten frequency labels; retained tabular frequency figures and the narrow-screen label reduction. The dB scale and divider remain aligned to the fader travel.
- CSS-only, scoped to `.wa-shell--webamp-classic`. No JSX, frequency mapping, slider ranges/values, EQ handlers, DSP/controller behavior, Dev Alpha or imported .wsz styles changed.
- Verification: CSS brace balance (588/588) and selector scope checked. Browser visual review at desktop/narrow widths, Chrome/Firefox endpoint checks, build/typecheck and CI remain unconfirmed.


### Winamp — Webamp Classic EQ lower faceplate rail (2026-11-24)
- Added a recessed lower fader-bank well with a dark inner edge, restrained metallic outer bevel and subtle top highlight, visually tying the EQ control area to the Main/Playlist chassis language.
- Refined the fader wells, bottom caption rail, dB scale contrast and PREAMP separator without changing the established 63 px slider travel or shared label baseline.
- CSS-only and scoped to `.wa-shell--webamp-classic`. No JSX, EQ values/ranges/handlers, DSP/controller logic, Main/Playlist behavior, Dev Alpha or imported .wsz styling changed.
- Verification: CSS brace balance (599/599) and selector scope checked. Browser visual comparison against Main/Playlist, narrow-width review, build/typecheck and CI remain unconfirmed.


### Winamp — Webamp Classic EQ proportions and faceplate hierarchy (2026-11-24)
- Reworked the Equalizer window chassis dimensions and titlebar sizing around the shared 275 px classic-window width, including the metallic top/side bevel, title truncation safety and compact native-style controls.
- Rebalanced the upper strip: fixed ON/AUTO hardware-switch bay, flexible recessed response graph, and consistent vertical alignment.
- Rebuilt the project-specific preset/EQF toolbar as a compact recessed control rail. Preset selection, naming, save/delete and EQF/Q1 actions remain available; horizontal overflow is contained rather than forcing the window wider.
- Rebalanced the fader-bank faceplate and inner clearance so the 63 px control travel and 74 px band/label stack fit without clipping. Refined the disabled-control and status readouts, plus narrow-viewport insets.
- CSS-only. No TSX, slider values/ranges/steps/handlers, frequency mapping, controller/DSP, playback behavior, Main/Playlist, Dev Alpha or imported .wsz renderer changed.
- Verification: CSS brace balance (626/626) and all newly added selectors scoped to .wa-shell--webamp-classic. Build/typecheck, browser visual QA (including 440 px and narrower), and CI remain unconfirmed.


### Winamp — Webamp Classic three-window hardware chrome (2026-11-24)
- Согласовал внешний корпус Main, Equalizer и Playlist: одинаковая ширина 275 px, металлический верхний/боковой bevel, нижняя тёмная грань и единая внешняя тень.
- Унифицировал 14 px titlebar: brushed-metal градиент, тонкую внутреннюю подсветку, типографику, выравнивание системных кнопок, hover/pressed/focus и красный close-state. Для Main, EQ и Playlist используется одна визуальная система без изменения JSX и обработчиков.
- Подтянул швы и металлическую поверхность Main/Playlist body, усилил inset у Playlist list и разделителя footer. EQ сохраняет собственную откалиброванную faceplate, график и фейдерную секцию — общий проход не перезаписывает их специализированные поверхности.
- Сохранены размеры и позиционирование окон, window drag/shade/close, контроллер, аудио, визуализатор, playlist actions, Dev Alpha и импортированные .wsz. Только CSS в winamp.css.
- Проверка исходника: скобки CSS сбалансированы (644/644); все новые селекторы ограничены .wa-shell--webamp-classic. Browser visual QA, build/typecheck и реальная проверка взаимодействий не запускались; CI для коммита нужно проверять отдельно. Не считать проход Verified до визуальной проверки трёх окон вместе и на узком экране.


### Winamp — Webamp Classic Main hardware controls and fader caps (2026-11-24)
- Refined the built-in Main seek rail with a recessed dark track, clearer green progress and a small metallic position cap that follows the existing progress width.
- Replaced the invisible built-in VOL/BAL range controls with visible metallic slider thumbs using the existing native range inputs. The thumb position remains driven by the existing volume/balance values; min/max/step, state updates and handlers are unchanged. Added matching WebKit and Gecko track/thumb styling and keyboard focus treatment.
- Reworked the six transport buttons as a tighter inset hardware bank with consistent bevel, hover and pressed states; preserved the existing glyphs, button order, 23 × 18 px targets and all click handlers.
- CSS-only, scoped to `.wa-shell--webamp-classic .wa-main`. Imported `.wsz` skin tracks/sprites and Dev Alpha are not targeted. No player/controller/audio behavior or JSX changed.
- Verification: source update and CSS brace/scope checks only. Browser QA is still required for range-thumb alignment and touch/keyboard behavior in Chromium/Firefox; build/typecheck and CI must be checked separately. Not marked Verified.


### Winamp — Webamp Classic Main lower control deck (2026-11-24)
- Rebuilt the lower Main control strip as a recessed metal deck with a defined upper seam and compact, consistent spacing.
- Refined built-in EQ/PL toggles and Shuffle/Repeat/NEXT mode buttons: compact etched labels, beveled button faces, hover/pressed/active states and green LED indicators. NEXT retains its own existing action and state; no new playback semantics were introduced.
- Reframed the mini artwork preview as a small inset display with a metal inner rim, dark badge plate and pixel-scale typography. Existing artwork/icon/accent content remains data-driven.
- Explicitly excluded imported-skin button classes from the new built-in button face styling; imported .wsz sprite visuals remain in control. All rules are scoped to .wa-shell--webamp-classic .wa-main.
- CSS-only: no JSX, handlers, state, keyboard shortcuts, audio/controller behavior, window positioning or Dev Alpha changes. The existing six transport buttons, sliders and controls remain intact.
- Verification: CSS brace balance and selector scope checked after update. Browser visual QA (desktop/narrow viewport), touch/keyboard checks, build/typecheck and CI are not yet confirmed. Not marked Verified.

### Winamp — Webamp Classic Main LCD and analyzer glass pass (2026-11-24)
- Refined the built-in Main display within its existing compact 44 px target: tighter recessed LCD bezel, separate time-readout bay, restrained phosphor-green segmented-style typography and clearer PLAY/PAUSE indicator contrast.
- Reworked the three-mode analyzer surface as a dark, gridded inset with crisp green spectrum columns/peaks and a restrained waveform trace. The existing visualizer button remains clickable and continues to cycle spectrum → oscilloscope → peak meter; no mode state or waveform/bar calculations changed.
- Tightened the track marquee and technical readouts (bitrate, sample rate, Mono/Stereo) with compact pixel-scale typography, tabular numeric figures and improved alignment. Existing marquee animation and readout content remain in place; this is presentation only, not a change to metadata sourcing or audio-format detection.
- CSS-only, scoped to .wa-shell--webamp-classic .wa-main__body. No JSX, playback/controller/audio logic, visualizer handlers, window geometry, Dev Alpha or imported .wsz skin rendering changed. Existing skin digit sprites retain pixel rendering.
- Verification: CSS brace balance is 0 and all 36 newly introduced selector lines are scoped to Webamp Classic. Browser visual QA, mobile/touch interaction QA, build/typecheck and CI still require separate confirmation; do not mark this pass Verified.

### Winamp — Webamp Classic Main transport glyph and switch-legend pass (2026-11-24)
- Replaced the built-in transport row's bare text glyphs with presentation-only icon spans for Previous, Play, Pause, Stop, Next and Eject. Tuned each symbol's size, optical alignment, pressed offset and hover contrast so the six controls read as a coherent hardware key bank.
- Refined the transport bank's recessed tray, button spacing and fixed 23 × 18 px key geometry. Shuffle and Repeat now use separate compact glyph/label elements instead of an emoji-heavy text legend; their existing LED, active state, title, keyboard shortcut and handlers are unchanged.
- Imported skin sprite branches remain image-based; new glyph spans are rendered only by the built-in branches. CSS targets remain inside `.wa-shell--webamp-classic .wa-main__body`; no audio/controller behavior, action semantics, playlist logic, window geometry or Dev Alpha styling changed.
- Verification: TSX substitutions were checked for one occurrence each; CSS braces are balanced and all 21 new selector lines are scoped to Webamp Classic. Browser glyph fallback/visual QA, touch and keyboard interaction QA, build/typecheck and CI remain unconfirmed. Not marked Verified.

### Winamp — Webamp Classic Main seek and fader rail calibration (2026-11-24)
- Tightened the seek rail into a slimmer recessed track with subtle calibration ticks, a clearer green progress line and a smaller metal position cap. The cap remains tied to the existing progress-width element; seek range, value and handler are unchanged.
- Rebalanced VOL/BAL as two flexible, aligned control groups so the sliders use available Main width rather than relying on fixed track widths. Added compact etched labels, a subtle center reference on BAL, finer track ticks and consistent metallic thumb proportions.
- Kept the EQ/PL toggle bank compact at the right edge and retained native range inputs, existing keyboard/touch interaction, slider values and controller calls. CSS-only, scoped to `.wa-shell--webamp-classic .wa-main__body`; no imported `.wsz`, Dev Alpha, JSX, playback or audio behavior changed.
- Verification: CSS braces balanced and all 20 newly introduced selector lines scoped to Webamp Classic. Actual browser thumb geometry, narrow-screen visual QA, touch/keyboard interaction QA, build/typecheck and CI remain unconfirmed. Not marked Verified.

### WINAMP-CLASSIC — Main faceplate and side-rail refinement (2026-11-24)
- Refined the built-in Webamp Classic Main chassis with narrow metallic side rails, darker inner seams, a brushed-metal title strip and layered faceplate surface. The display bezel, middle control bay and lower transport deck now read as separate recessed sections rather than one flat panel.
- Added etched VOL/BAL legends, a separated EQ/PL switch bay, more tactile ON-state switch faces, and consistent edge treatment for Shuffle/Repeat/NEXT and the mini artwork frame.
- Presentation-only CSS in `src/apps/winamp/winamp.css`, scoped to `.wa-shell--webamp-classic` and Main descendants. No JSX, controller, audio, playback, slider values/handlers, visualizer mode cycling, window geometry, Dev Alpha or imported `.wsz` skin rendering changed. Classic Main remains 275 × 116 px.
- Source checks: CSS braces balanced; all 19 new selector/media lines remain within the Webamp Classic scope. Browser visual QA, touch/keyboard interaction QA, build/typecheck and CI remain unconfirmed. This is a CSS-authored faceplate approximation, not bitmap-exact Nullsoft artwork.

### WINAMP-CLASSIC — Main optical alignment and hardware micro-detail (2026-11-24)
- Completed a broad CSS-only calibration pass across the Main title strip, titlebar controls, LCD bezel, indicators, analyzer glass, marquee/technical readouts, seek rail, VOL/BAL rails, EQ/PL switches, transport bank, Shuffle/Repeat/NEXT controls and mini-art frame.
- Tightened optical spacing and glyph sizing, clarified the recessed display/control/deck boundaries, adjusted metallic edge contrast, and reduced small-screen control dimensions while retaining the 275 × 116 px desktop chassis.
- All rules are appended in `src/apps/winamp/winamp.css` and scoped to `.wa-shell--webamp-classic` Main descendants. No TSX, audio/controller logic, native range handlers, visualizer click-to-cycle behaviour, Dev Alpha renderer or imported `.wsz` sprite path was changed.
- Source checks: CSS brace balance is zero; all 61 new selector/media lines are Webamp Classic-scoped. This is a CSS-authored visual approximation, not original Nullsoft bitmap artwork. Browser rendering, responsive device QA, keyboard/touch QA, build/typecheck and CI are not confirmed.


### Winamp — Webamp Classic three-window metal finish alignment (2026-11-24)
- Согласовал Main, Equalizer и Playlist как три самостоятельных окна одной аппаратной серии: унифицированы оттенок оливково-серого металла, контраст боковых граней, нижний тёмный шов и характер внешнего bevel.
- Привёл titlebar EQ/Playlist к уже откалиброванному Main: одинаковые 14 px высоты, металлический градиент, тонкая внутренняя кромка, компактная типографика и 9 px системные кнопки с hover/pressed/focus состояниями.
- Поверхности EQ и Playlist получили согласованный металлический фон и внутренние кромки; индивидуальные детали EQ-графика/фейдеров и Playlist-списка/панели действий сохранены. Кнопки Playlist получили тот же визуальный язык raised/pressed, без изменения их действий.
- CSS-only в `src/apps/winamp/winamp.css`, 30 новых selector lines; все ограничены `.wa-shell--webamp-classic`. TSX, размеры/позиционирование окон, drag/shade/close, EQ значения и DSP, playlist state/actions, аудио/controller, Dev Alpha и импортированные .wsz не менялись.
- Проверка исходника: CSS braces balanced (0), scope violations — 0. Browser visual QA трёх окон вместе, narrow viewport, build/typecheck и keyboard/touch QA не запускались. CI проверяется отдельно; проход не помечен Verified.

### Winamp — Webamp Classic Playlist track-row and footer detail pass (2026-11-24)
- Проработал список композиций: более точная моноширинная типографика, ровная высота строк, оптические отступы, отдельная колонка длительности с табличными цифрами, спокойная чересполосица и аккуратное усечение длинных названий.
- Разделил визуальные состояния hover, текущего трека и мультивыделения. Текущий трек получает приглушённую зелёную подсветку, выделение — классическую синюю полосу; сочетание current + selected имеет отдельный контрастный вариант. Существующие классы и выбор треков не менялись.
- Доработал scrollbar: металлический thumb, тёмный канал и hover-состояние. Нижняя панель получила более чёткое разделение команд, компактные raised/pressed кнопки, отдельный мини-транспорт, вдавленную статусную строку с выравниванием времени и аккуратное отображение import-status. Disabled/focus состояния сохранены и уточнены.
- CSS-only, 42 новых selector lines, все строго scoped .wa-shell--webamp-classic .wa-playlist. Сохранены размеры окна 275 × 232 px, текущая JSX-разметка, обработчики выбора/перетаскивания/импорта/экспорта, управление воспроизведением, Dev Alpha и импортированные .wsz.
- Source checks: CSS brace balance 0, scope violations 0. Browser visual QA, narrow-device/touch/keyboard QA, build/typecheck и CI ещё не подтверждены; проход не помечен Verified.
### Winamp — Webamp Classic Playlist Editor composition pass (2026-11-24)
- Перестроил нижнюю часть Playlist Editor в компактную трёхуровневую композицию: M3U/skin-команды, строка статуса/длительности, мини-транспорт и LIST OPTS. Верхний ряд ADD/REM/SEL/CLR SEL оставлен отдельной группой.
- Нижний блок переведён на CSS Grid с фиксированной иерархией и предсказуемым размещением элементов; список композиций получает оставшуюся высоту окна вместо искусственного min-height, который мог вытеснять footer.
- Сохранены габариты окна 275 × 232 px, все существующие кнопки, импорт/экспорт M3U, импорт/сброс .wsz, статус сообщений, выделение, сортировка/перетаскивание и mini-transport. TSX, обработчики, состояние и audio/controller не менялись.
- CSS-only, все новые правила ограничены `.wa-shell--webamp-classic .wa-playlist`; скобки CSS сбалансированы. Browser visual QA, проверка узкой ширины, клавиатуры/касания, build/typecheck и CI ещё не подтверждены. Не помечать проход Verified до проверки в браузере.
### Winamp — Webamp Classic Playlist optical density pass (2026-11-24)
- Уточнил ритм строк Playlist до 13 px, приблизив плотность списка к классическому Winamp 2.x; выровнял строку длительности и сократил лишние горизонтальные отступы.
- Уплотнил footer без удаления функций: уменьшены высоты командных кнопок, межстрочные интервалы и высота status/mini-transport; M3U/skin-команды, ADD/REM/SEL/CLR SEL и LIST OPTS остаются доступными.
- Сохранены фиксированная геометрия окна 275 × 232 px, прокрутка списка, текущий трек/выделение, import-status, обработчики и все ветви Dev Alpha/.wsz. Изменения только CSS и строго scoped к `.wa-shell--webamp-classic .wa-playlist`.
- CSS brace balance 0, новые селекторы проверены на scope. Реальную высоту списка, переполнение footer и scrollbar-gutter необходимо подтвердить в браузере; build/typecheck/browser QA не запускались, проход не помечен Verified.


### Winamp — Webamp Classic Playlist empty state and footer legibility (2026-11-24)
- Added a restrained empty-playlist prompt inside the existing list surface. It does not add a new control or intercept pointer input; the list remains the same drag-and-drop target and the existing + ADD action remains unchanged.
- Clarified the footer command rail, import-status clipping and status display contrast; kept the compact mini-transport keys at a stable 16 px width.
- CSS-only in `src/apps/winamp/winamp.css`, scoped to `.wa-shell--webamp-classic .wa-playlist`. No TSX, handlers, playlist state, M3U/skin import-export, audio/controller, Dev Alpha or imported .wsz behavior changed. The 275 × 232 px Playlist chassis and 13 px row rhythm are retained.
- Source checks: CSS brace balance 0; all 9 added selectors scoped to Webamp Classic Playlist. Browser rendering, empty/drop-state interaction, narrow-device QA, build/typecheck and CI remain unconfirmed. Do not mark Verified.


### Winamp — Webamp Classic three-window titlebar alignment (2026-11-24)
- Выполнена финальная оптическая калибровка верхней системной панели Main, Equalizer и Playlist: одинаковая геометрия контейнера системных кнопок, 9 × 9 px footprint, центрирование символов и равномерный 2 px интервал.
- Заголовки окон и их индивидуальная типографика сохранены; правила ограничены titlebar конкретных трёх окон внутри `.wa-shell--webamp-classic`. Imported-skin inline backgrounds и Dev Alpha не затрагиваются.
- CSS-only: TSX, действия minimize/shade/close/settings, drag, playback, EQ/DSP, playlist и размеры окон не менялись.
- Source checks: CSS brace balance 0; все 12 новых selector lines scoped to Webamp Classic windows. Совместное browser QA, narrow viewport, клавиатура/касания, build/typecheck и CI остаются неподтверждёнными. Не помечать Verified.

### Winamp — Webamp Classic shared titlebar baseline calibration (2026-11-24)
- Завершена следующая часть согласования Main, Equalizer и Playlist: единый 14 px baseline titlebar, общий внутренний отступ 4 px, нижний металлический шов и единая вертикальная оптика заголовков.
- Для Main сохранена отдельная левая группа логотипа/названия; заголовки ограничены доступной шириной с безопасным ellipsis, системные кнопки остаются отдельной фиксированной группой.
- CSS-only, 10 новых selector lines в .wa-shell--webamp-classic; TSX, размеры окон, позиции/drag, shade/close/settings, EQ, playlist и playback не менялись. Dev Alpha и imported .wsz не затрагивались.
- Source checks: CSS brace balance 0, scope violations 0. Browser comparison of all three windows, narrow viewport, keyboard/touch, build/typecheck and CI are not confirmed. Not marked Verified.
### Winamp — Webamp Classic linked window dragging and Playlist width range (2026-11-24)
- Добавлено групповое перетаскивание видимых окон Main / Equalizer / Playlist: при касании по вертикальной или горизонтальной кромке (с небольшим допуском) окна объединяются в цепочку по фактическому перекрытию. Перемещение любого участника двигает всю связанную цепочку с сохранением взаимных расстояний; если Playlist касается Equalizer, а Equalizer касается Main, перемещаются все три.
- Скрытые/закрытые окна не участвуют в цепочке. Границы перемещения рассчитываются для всей группы, чтобы связка не разъезжалась при упоре в край экрана. Перетаскивание по-прежнему начинается за titlebar; кнопки управления не перехватываются.
- Для встроенного Webamp Classic Playlist разрешено горизонтальное изменение ширины от 275 до 550 px (до двух базовых ширин списка треков); высота остаётся 232 px. Внутренние список, статус и footer используют доступную ширину. Ограничение дополнительно учитывает ширину viewport.
- Изменены TSX drag coordinator и изолированный CSS Playlist; аудио, playlist state/actions, порядок треков, EQ/DSP, imported .wsz и Dev Alpha не менялись. CSS brace balance 0, новые CSS селекторы scoped к .wa-shell--webamp-classic.
- Browser QA ещё необходим: проверить цепочки из двух/трёх окон при касании, разрыв цепочки при отодвигании, перетаскивание от каждого titlebar, крайние границы экрана, горизонтальный resize Playlist и поведение на узком viewport. Build/typecheck и CI пока не подтверждены; не помечать Verified.

### Winamp — Webamp Classic Playlist two-axis resize and oversized-group drag safety (2026-11-24)
- Расширено изменение размера Playlist: теперь доступны обе оси, базовый размер 275 × 232 px сохраняется как минимум; максимальный размер — до 550 × 464 px с ограничением ширины/высоты текущим viewport.
- При увеличении высоты Playlist внутренний список получает больше вертикального пространства; при увеличении ширины — больше горизонтального. Resize остаётся ограничен встроенным Webamp Classic и не меняет Dev Alpha или imported .wsz.
- Групповой drag по-прежнему рассчитывает геометрию по фактическим DOM-размерам окон. Добавлен безопасный fallback для связанной группы, которая целиком не помещается в viewport: при невозможности ограничить всю группу в пределах экрана удерживается в границах окно, за titlebar которого начато перетаскивание, без инвертированного clamp.
- Аудио/controller, playlist actions/state, EQ/DSP и логика воспроизведения не менялись.
- Source review выполнен; CSS brace balance и scope, TypeScript build/typecheck, реальный browser resize/drag QA и CI требуют отдельного подтверждения. Не помечать Verified.

- Дополнительная source-аудит-корректировка: снят прежний `max-height: 220px` у списка треков только в Classic Playlist, поэтому он действительно занимает добавленную высоту окна; внутренний body/list допускают сжатие flex-контентом без переполнения. Внешняя оболочка использует `overflow: hidden`, чтобы не создавать второй набор прокруток поверх собственного scrollbar списка.
- Windowshade Playlist отдельно фиксируется на 20 px и отключает resize в свёрнутом состоянии; базовые и максимальные размеры развернутого окна не мешают штатному shade.

- Финальная механика resize переведена с нативного CSS-resize на собственный pointer-handle в Classic renderer: ширина и высота контролируются React state, размеры ограничиваются текущим свободным пространством справа/снизу от позиции Playlist и диапазоном 275–550 × 232–464 px. При изменении viewport размер автоматически уменьшается, если прежний размер перестаёт помещаться. Handle не добавляется в Dev Alpha и imported .wsz.
- Перетаскивание handle останавливает всплытие pointer event и не запускает drag окна; resize использует отдельный pointer lifecycle и не затрагивает плейлист/аудио.
- Resize handle привязан к pointerId активного указателя: параллельный второй touch/pointer не меняет размер и не завершает чужую resize-сессию.
- Для нижнего правого resize-grip зарезервировано место в строке инструментов Playlist, чтобы ручка не перекрывала кнопку LIST OPTS и соседние элементы.

- Webamp Classic Equalizer compact layout: preset selector перенесён в верхнюю строку рядом с ON/AUTO и графиком; поле имени пресета и SAVE/DEL/EQF IN/EQF OUT/Q1 OUT собраны в одну фиксированную строку без переноса. Высота промежутков уменьшена, высота фейдеров и логика управления EQ не менялись. Для Dev Alpha и imported .wsz сохранено прежнее расположение селектора и controls.
- Ориентир по геометрии верхней части — оригинальный Webamp Equalizer: 14 px titlebar, компактный верхний control rail и близко расположенная банка фейдеров; дополнительные функции проекта сохранены в отдельной тонкой toolbar-строке.
- Финальная геометрия EQ сохранена в исходном габарите Winamp Classic 275 × 116 px: верхний rail 14 px, одна строка управления пресетами 10 px, банка фейдеров 68 px; высота самих фейдеров 55 px вместо 63 px, подписи выровнены по нижней кромке. Так Equalizer не наезжает на Playlist в исходной вертикальной раскладке.
- Стартовая раскладка Webamp Classic теперь автоматически собирает Main → Equalizer → Playlist в одну вертикальную колонну с общей левой кромкой и нулевыми зазорами: высоты 116 + 116 + 232 px, координаты соседних окон вычисляются как top + 116 и top + 232. При первом запуске с сохранённым Classic и при переключении на Classic раскладка сразу подготавливает все три окна к групповому drag; ручное пододвигание больше не требуется. Начальная точка адаптируется к доступному viewport, а ручное перемещение после запуска сохраняется.
- Нижняя панель Playlist в Webamp Classic сведена в одну непрерывную строку кнопок: +ADD / -REM / SEL / CLR SEL / M3U IN / M3U OUT / SKIN IN / RESET (если доступен) / LIST OPT. Две JSX-группы действий объединены в общий flex-ряд; кнопки немного уменьшены и равномерно распределяют доступную ширину, чтобы убрать пустой участок справа и сохранить LIST OPT последней кнопкой. Строка статуса расположена отдельно ниже. Отдельная мини-панель транспортных кнопок Play/Pause/Stop/Prev/Next удалена из Playlist: управление воспроизведением остаётся на основном модуле.


### Winamp Classic — detachable fourth window (2026-11-24)
- [x] Add fourth Video / Visualization window with independent visibility and a Main-titlebar VIS toggle.
- [x] Add visualizer mode switch: Spectrum / Oscilloscope / Peak Meter; reuse the player's current visualizer data.
- [x] Add local video file picker and native video playback in the fourth window.
- [x] Add per-window attach/detach controls for Main, Equalizer, Playlist and Video / Visualization.
- [x] Add magnetic edge alignment for attached windows on release.
- [x] Keep hidden video windows out of group drag calculations and initialize the fourth window on renderer changes.
- [x] Double-click / double-tap the existing fourth stage to promote it to fullscreen without creating another window.
- [x] Add translucent fullscreen transport panel: -5s / +5s, previous / next Winamp playlist track, play / pause, MODE and exit.
- [x] Reveal fullscreen controls on mouse movement or a single touch; auto-hide after 3 seconds when the pointer is outside the panel.
- [x] Add fullscreen keyboard controls: Left / Right seek, Up / Down previous / next track, Space play / pause, M mode switch, Escape exit. Add F to open the fourth stage fullscreen while a Winamp window is active.
- [x] Prefer the browser Fullscreen API and retain a viewport-fixed fallback; preserve the existing local video element and object URL.
- [ ] Browser QA: verify touch/pointer dragging, re-docking, mobile viewport layout and video playback. **Deferred by owner** to the later browser-QA pass.
- [ ] Future integration: optionally support video entries from playlists and explicit audio/video synchronization; current video source is independent of the audio playlist.


### Winamp — canonical visualization modes in the existing fourth window
- [x] Keep the existing fourth square Video / Visualization window and its current dimensions; no extra windows or enlarged layouts.
- [x] Keep Main LCD's Spectrum / Oscilloscope / Peak Meter selection independent from the fourth-window mode.
- [x] Add grouped mode navigation in the existing toolbar: Winamp Classic, WMP core, WMP Legacy, AVS-inspired and MilkDrop-inspired.
- [x] Implement WMP core renderers: Alchemy, Bars and Waves, Battery; Alchemy now has layered frequency-shaped ribbons, orbital rings and a waveform core.
- [x] Implement WMP legacy renderers: Ambience, Particle, Plenoptic, Spikes, Musical Colors; Plenoptic now has a perspective tunnel, depth layers and frequency spokes.
- [x] Implement original AVS-inspired and MilkDrop-inspired procedural scenes; no plugin binary/preset compatibility is claimed.
- [x] Add random mode action (random within a multi-mode family; across all modes for singleton families).
- [x] Add four named AVS-inspired and four procedural MilkDrop-inspired variants with compact PSET control; add separate genuine MilkDrop (Butterchurn) mode with a local preset pack, preset cycling and transitions. Distinct procedural scene geometry is selected per preset; Ambience has layered audio-shaped color fields and Particle has a frequency-reactive orbital field.
- [x] Respect prefers-reduced-motion for the added CSS scene animation.
- [x] Add optional AUTO mode cycling every 15 seconds (off by default; pauses when the fourth window is hidden/shaded, Video is active or the tab is backgrounded).
- [ ] Verify hidden-window lifecycle / performance in browser. **Deferred by owner** to the later browser-QA pass.
- [x] Preserve local video stage, object-URL cleanup and existing window geometry in the implementation pass.
- [ ] Browser acceptance: visual distinction, mobile fit, drag/attach, playback/EQ/playlist and video regressions. **Deferred by owner** to the later browser-QA pass.
- Design contract and progress: `docs/winamp-visualization-modes.md`. All 14 modes, grouped picker, named presets, Butterchurn integration and reduced-motion CSS are implemented; browser acceptance is deferred by owner.
## Windows Vista skin — started 2026-11-25
- Before: the Vista profile was a draft that rendered the generic webos hybrid (XP-blue taskbar, Lucide icons, no wallpaper, unstyled login) because `os-vista` had no stylesheet set and `vista` shared the Windows 7 asset object.
- Now: Vista is its own skin on the Windows 7 base. The shell carries `os-win7 os-vista` (`osClassNames.ts`, `osSkins.ts`); `osStyleSheets.ts` has an `os-vista` set (the Windows 7 files plus `vista.css`); `themeAssets.ts` has `vistaThemeAssets` (Windows 7 icons and sounds, Vista wallpaper and orb); `themeStyles.ts` has a `vista` entry.
- Art in `src/themes/vista/assets/`: `wallpaper.jpg` (default Vista wallpaper, from `eat/technometer.github.io-master`), `wallpaper-aero.jpg` (blue Aero wallpaper), `start-orb.png`, `taskbar-sprite.png`, `logon-logo.png`, `user-frame.png` (from `eat/snowlizard.github.io-main`). Segoe UI Variable (`src/assets/fonts`, from `eat/vovacodes-master`) is declared as "Segoe UI" in `vista.css`.
- Done (desktop only): 30 px glass taskbar from the sprite, orb overlapping the top edge with hover/open glow, labelled glass task buttons, plain tray clock, wallpaper, 48 px Windows 7 icons.
- References: `eat/screens/oc/vista/01-window-chrome-styles.png` (Aero, Standard, Basic window styles) and `02-explorer-about-windows.png` (Explorer, About Windows, Sidebar gadgets, taskbar).
- To do, in order: (1) Aero window chrome (glass frame, red close button, rounded corners, title glow) and the Basic/Standard fallbacks; (2) [done 2026-11-26: reuses StartMenu7 with `vista-startmenu.css`, extracted from the Windows 7 fidelity file; Vista labels (Network, Connect To) still to do] Vista Start menu (white left pane with programs, blue-glass right pane with Documents, Pictures, Music, Computer, Control Panel; search box; power buttons); (3) [logon screen done 2026-11-26: Aero backdrop, glass user tiles, logo, power button; boot splash already the Vista GIF; Welcome screen done in `src/themes/vista/WelcomeScreen.tsx`, routed from `webos/index.tsx`, generic blue loading page skipped for Vista] boot screen, logon and welcome screens with their own `src/themes/vista` flow (the draft still uses the generic WebOS login); (4) [done 2026-11-26: address bar with round Back/Forward and a Search box, light command bar, Favorite Links above the folder tree, via `vista-explorer.css`; breadcrumb address (click a crumb to go up, click the bar to type) and the bottom details pane (name, type, workgroup) also done 2026-11-27; Organize menu done 2026-11-27: Vista's command bar now reads Organize and Views (Up, Search and Folders removed for Vista; search lives in the address bar, folders in the navigation pane). The menu lists Cut ... Close in Vista's group order (`src/apps/explorer/organizeMenu.ts`); its items stay disabled until the Explorer has clipboard, rename and layout actions] Explorer (address breadcrumbs with round Back/Forward, search box, Organize/Views toolbar, Favorite Links pane, folder tree, details pane with the computer name); (5) [done 2026-11-26: `VistaSidebar.tsx` is the default gadget surface on Vista (clock, calendar, CPU/RAM meters, headlines); the gadget gallery has a Sidebar/alternative skin switch (`vista-sidebar-skin` in localStorage), the old widget set is the alternative] Sidebar with gadgets (clock, calendar, CPU meter, notes) replacing the Widgets desktop icon; (6) [done 2026-11-26: Computer, Documents, Recycle Bin labels; Recycle Bin kept in the icon column (`flowRecycleBin`) because the Sidebar covers the bottom-right corner] desktop labels and defaults (Computer, Documents, Recycle Bin, Control Panel); (7) [quick launch (Show Desktop, Internet Explorer, Media Player, Windows Mail) and darker glass done 2026-11-27; the language flag stays in the tray; window previews on hover done 2026-11-27 as a schematic: after a 400 ms hover a glass frame with the window icon, title and close button appears above the task button (`VistaTaskbarPreview.tsx`); no live capture of the window's contents] taskbar tuning (quick-launch icons, thumbnail previews, language indicator in the tray, darker glass).


### Winamp — Webamp parity follow-up (2026-11-25)
- [x] Raise analyser publication to 60 FPS for high-resolution/high-refresh displays; keep the existing shared Web Audio analyser and avoid synthetic fake signal.
- [x] Make `.wsz` sprite extraction tolerant of missing/corrupt optional sheets and out-of-bounds optional sprites; require the Main sheet.
- [x] Apply imported `pledit.txt` Playlist colors/font and `viscolor.txt` Main analyzer palette.
- [x] Read local MP3 ID3v2.2/v2.3/v2.4 and ID3v1 title/artist/album/track number; persist tags with the IndexedDB library.
- [x] Add HTML Playlist export for HTTP(S) tracks; do not emit ephemeral `blob:` URLs as portable links.
- [x] Expand local metadata parsing to FLAC Vorbis comments, Ogg Vorbis/OpusTags and WAV INFO.
- [x] Add MP4/M4A ilst atom metadata parsing.
- [x] Add fixtures for supported ID3v1/v2.2/v2.3/v2.4, FLAC Vorbis comments, Ogg Vorbis/OpusTags, WAV INFO and MP4/M4A metadata paths; rare container variants remain a follow-up.
- [x] Add M3U import/export regression tests for BOM/Unicode, fractional durations, strict `MM:SS` export validation (malformed/overflow/unknown values become `-1`), relative and blob URL rejection, HLS rejection, metadata line-break sanitization and round-trip.
- [x] Add multi-file local video queue navigation to the existing fourth window; fullscreen previous / next and end-of-file advance the selected video queue, while visualization mode retains Winamp audio playlist navigation.
- [x] Add direct selection of any item in the current video queue inside the existing fourth-window toolbar; report unsupported codecs and browser-blocked playback in an accessible status overlay, and restart the first queued video on Previous.
- [x] Add visible previous / next video transport controls to the fourth-window toolbar outside fullscreen; Previous restarts the first item at queue start, Next disables at the final item, and the existing fullscreen controls keep the same queue navigation semantics.
- [x] Defer revocation of replaced video object URLs until the replacement source emits `loadstart`; retain both active and pending URLs for unmount cleanup.
- [ ] Browser acceptance for mixed video formats, queue replacement during playback, previous/next boundaries, end-of-file advance, and object-URL cleanup. **Deferred by owner** to the later browser-QA pass.
- [x] Implement a portable local-library export/import contract through the versioned `.wampack` archive (M3U cannot reference transient object URLs).
- [x] Apply `pledit.txt` menu foreground/background colors to Playlist menus.
- [x] Parse and apply validated `region.txt` masks to Main/Equalizer normal and WindowShade via SVG clipPath.
- [x] Isolate the 60 FPS visualizer render state in a shared external frame store; only the two visualizer surfaces subscribe.
- [x] Pause the shared visualizer RAF loop while the document is backgrounded; resume one loop on visibility return and keep one controller/visibility subscription across both visualizer surfaces.
- [x] Scope fourth-window SVG gradient IDs to the mounted visualizer instance to prevent cross-instance resource collisions.
- [x] Treat closing the fourth Video / Visualization module as a full unload: detach and reset the media element, revoke active and pending local video object URLs, clear the local queue and filename, stop auto-cycle, and unmount the visualizer subtree; reopening starts idle without retaining media resources.
- [x] Integrate genuine MilkDrop via Butterchurn as an optional WebGL2 mode; keep all existing custom AVS/MilkDrop-inspired and WMP modes. **Source implementation complete; browser acceptance and performance profiling deferred by owner.**
- [ ] Browser acceptance: import real-world `.wsz` variants (including incomplete archives), metadata encodings, Playlist exports, 60 FPS high-DPI performance profiling, reduced motion and all playback/window regressions. **Deferred by owner** to the later browser-QA pass.
- Audit and parity notes: `docs/winamp-vs-webamp-audit.md`.

### Winamp — portable local-library backup and genuine MilkDrop implementation notes (2026-11-25)

#### Portable local-library archive contract
- [x] Implement a self-contained `.wampack` ZIP archive; do not serialize object URLs or machine-specific absolute paths.
- [x] Archive layout:
  - `manifest.json`: schema version, export timestamp, ordered playlist entries, stable archive-relative asset paths, title/artist/album/track number/duration and original filename/MIME type/size.
  - `audio/000001.ext`, `audio/000002.ext`, …: original audio bytes, stored without transcoding or quality loss.
  - Optional `settings/eq-presets.json`: user-created EQ presets only; do not silently export unrelated browser settings.
- [x] Export source bytes from IndexedDB records, not from `blob:` URLs. Preserve playlist order and duplicate appearances in the manifest while storing each local asset once.
- [x] Import validates archive signature, central-directory bounds, entry count, expanded size, path traversal, duplicate paths, manifest schema/version, filename/archive-extension agreement and per-file CRC before writing anything to IndexedDB. MIME syntax is checked; byte-level MIME sniffing remains out of scope.
- [x] Set conservative import limits and report oversized archives before allocation; do not trust manifest-provided filenames as filesystem paths.
- [x] Import validates the entire archive before saving; the IndexedDB read-write transaction aborts atomically on a failed write. Playlist entries are appended only after the transaction completes.
- [x] Rebuild fresh object URLs from restored Blobs; revoke them on removal/unmount using the existing lifecycle. Never persist object URLs.
- [x] M3U remains a separate interoperable format for HTTP(S) URLs. Local files are portable only through the archive contract; do not claim relative M3U portability until a folder-root mapping flow exists.
- [x] UI: add Backup / Restore actions to the existing Playlist MISC menu (not another window); show archive size, track count, skipped entries and success/failure status.
- [x] Add round-trip fixtures for empty library, mixed remote/local playlist, duplicate local tracks, Unicode filenames/tags, malformed ZIP, traversal paths, CRC mismatch, truncated archive and oversized manifest.

#### Butterchurn upstream source inspection (2026-11-25)

- Stable release source was inspected at the exact 2.6.7 release commit (`d90f271be02969d8f16a3ed6b6960c971da6eff9`): `createVisualizer(audioContext, canvas, opts)`, `connectAudio(audioNode)`, `disconnectAudio(audioNode)`, `loadPreset(preset, blendTime)`, `setRendererSize(width, height, opts)` and `render()`; WebGL2 is required. The stable API does not expose `loseGLContext()`; teardown uses `WEBGL_lose_context` on the WebGL2 context obtained from the supplied canvas. References: [stable package README](https://www.npmjs.com/package/butterchurn), [2.6.7 visualizer source](https://github.com/jberg/butterchurn/blob/d90f271be02969d8f16a3ed6b6960c971da6eff9/src/visualizer.js), [2.6.7 audio processor](https://github.com/jberg/butterchurn/blob/d90f271be02969d8f16a3ed6b6960c971da6eff9/src/audio/audioProcessor.js).
- In the exact stable 2.6.7 source, `connectAudio` connects the supplied node to Butterchurn's internal DelayNode; that node feeds Butterchurn's own analysers and channel splitter. The branch is not connected to `AudioContext.destination`; `disconnectAudio` removes only that analysis branch. The existing shared playback route therefore remains the only audible route.
- The existing controller's post-EQ point is its `pannerNode` immediately before the shared analyser/destination. Added `getVisualizerAudioNode()` as a read-only accessor returning that shared node; it initializes/reuses the existing graph and never constructs another media source or AudioContext.
- `butterchurn@2.6.7` and `butterchurn-presets@2.4.7` are pinned exactly in `package.json` and `package-lock.json` (both packages declare MIT). The runtime and preset pack are imported only when the separate genuine mode is selected.

#### Butterchurn integration — hard audio-graph acceptance
- [x] Pin compatible `butterchurn@2.6.7` and `butterchurn-presets@2.4.7` and update package manifest + lockfile together; no CDN or runtime network fetch.
- [x] Load renderer and preset bundle only after selecting the separate `MilkDrop (Butterchurn)` mode. Existing `MilkDrop` remains the procedural project mode.
- [x] Mount one canvas inside the existing fourth 275×275 Video / Visualization scene; reuse it in fullscreen. No new player/window.
- [x] Use the controller's existing AudioContext and post-EQ signal. Do not create another HTMLAudioElement or AudioContext, and do not route a second audible copy to destination.
- [x] Verify Butterchurn 2.6.7's `connectAudio` contract against the exact release source: it connects the supplied node to an internal DelayNode feeding only Butterchurn analysers, not `AudioContext.destination`; `disconnectAudio` detaches only that branch.
- [x] Add a read-only controller accessor for the shared post-EQ/post-balance `pannerNode`; the renderer can attach its analysis branch there without creating another media source. The accessor itself creates no extra nodes.
- [x] Handle WebGL2 unavailable, lazy-import failure, resize, mode switch, fullscreen exit and component unmount without breaking playback or existing modes. The stable renderer's WebGL2 context is explicitly released with `WEBGL_lose_context`.
- [x] Pause the Butterchurn render RAF while the browser tab is hidden; resume one loop on visibility return and stop on WebGL context loss.
- [x] Keep preset data local; support preset cycling and transition; avoid eagerly loading the full preset bundle on initial Winamp render. PSET cycles through the locally bundled preset list.
- [ ] Profile GPU/CPU and memory at 60 FPS on high-DPI displays. If Butterchurn cannot sustain the target, throttle only that renderer without changing the 60 FPS publication rate of existing visualizers. **Deferred by owner:** move browser profiling to the later QA pass; do not treat this as an implementation blocker.
### Winamp — .wampack portable local-library archive (2026-11-25)
- [x] Add a versioned ZIP-based .wampack manifest with ordered playlist metadata and archive-relative audio asset references.
- [x] Export local audio bytes from IndexedDB records, not ephemeral blob URLs; repeated references to the same local track reuse one archive asset.
- [x] Include HTTP(S) playlist entries as URL references; do not embed or fetch remote media.
- [x] Add ZIP writer with UTF-8 filenames, CRC32 and uncompressed STORE entries; no compression dependency or CDN.
- [x] Add bounded archive reader: entry-count/expanded-size limits, manifest limit, path traversal rejection, duplicate-path rejection, encrypted/unsupported compression rejection, CRC validation and missing/unreferenced asset checks.
- [x] Validate the entire archive before IndexedDB writes; insert imported audio assets in one IndexedDB read-write transaction.
- [x] Recreate object URLs from restored Blobs and expose Backup / Restore actions in the existing Playlist MISC menu.
- [ ] Browser round-trip QA with real audio files, large archives, duplicate playlist references and malformed ZIP fixtures. **Deferred by owner** to the later browser-QA pass.
- [x] Automated regression tests cover CRC, central-directory parsing, manifest validation, duplicate paths, unreferenced payloads, unsupported compression, filename/extension disagreement and truncation (27 Winamp tests passed in CI).
- [ ] Add a browser/fake-IDB test for IndexedDB transaction rollback. **Deferred by owner** to the later test pass.
- [ ] Consider optional DEFLATE support only if needed; current .wampack writer emits STORE entries and the importer intentionally accepts STORE only.

Implementation files: src/system/audio/winampArchive.ts, src/system/audio/winampLocalLibrary.ts, src/apps/winamp/WinampPlayer.tsx.

### Winamp — Playlist feature completion (2026-11-25)
- [x] Add Reverse playlist to the existing Classic Playlist MISC menu; preserve the currently playing track by identity rather than by its old numeric index.
- [x] Add Crop to selection to retain only selected Playlist entries; if the playing track is excluded, switch the existing controller to the first retained entry without creating another audio graph.
- [x] Add an optional compact Playlist mini visualizer, disabled by default and controlled from LIST OPT; it subscribes to the shared 60 FPS frame store and does not rerender the player/window manager.
- [x] Add local Butterchurn preset JSON import to the genuine MilkDrop mode; imported presets are added to the in-memory preset list and can be selected immediately with NEXT PRESET or cycled with PSET. The imported format is Butterchurn preset JSON, not raw legacy .milk text.
- [ ] Browser acceptance for playlist crop/reverse, imported JSON preset loading, mini visualizer layout and audio/lifecycle behavior. Deferred by owner to the later browser-QA pass.


### Winamp — video queue usability follow-up (2026-11-25)
- [x] Expose Previous / Next directly in the existing Video toolbar, not only in fullscreen. Previous steps backward or restarts the first item; Next is disabled at the end of the queue. Accessible names, titles, focus outline and disabled styling are included.
- [ ] Browser acceptance for pointer/touch operation and narrow-toolbar fit remains deferred with the agreed browser-QA pass.


### 2026-11-25 — Mixed media queue and restore rollback

- [x] Fourth-window selector combines the current audio playlist and video queue. Previous/Next and automatic end-of-track navigation traverse the combined list while dispatching to the correct media element.
- [x] Audio and video playback are mutually exclusive. Video remains outside the Web Audio graph; the existing audio controller and analyser remain unchanged.
- [x] `.wampack` restore uses one IndexedDB write transaction and rolls back imported records plus temporary Blob URLs if playlist publication fails after storage commit.
- [x] Replaced scalar-only `.milk` import with a Butterchurn 2.6.7-compatible adapter: the MIT `milkdrop-eel-parser@0.0.4` converts EEL2 init/frame/per-pixel and custom wave/shape equations into the JavaScript `*_eqs_str` fields expected by this pinned runtime. Known scalar aliases and legacy `wavecode_`/`shapecode_` fields are mapped. MilkDrop 2 HLSL warp/composite shaders still fall back to Butterchurn's default feedback shaders with an explicit warning.


### 2026-11-25 — Winamp mixed queue editing and MilkDrop importer tests

- [x] Mixed audio/video queue order can now be edited from the fourth-window toolbar using Move Up / Move Down. The selected item remains selected by stable media key when the list changes.
- [x] Shuffle advances to a random different item in the mixed queue; Repeat and Auto Advance settings now apply to video end-of-playback as well as audio.
- [x] Earlier scalar-only importer tests were superseded by tests for EEL2-to-JavaScript conversion, custom waves/shapes, field aliases, warning paths, seed isolation and malformed/oversized input.
- [ ] MilkDrop 2 custom HLSL warp/composite shader translation remains open. EEL2, custom waves and custom shapes now emit Butterchurn 2.x JavaScript equation strings; real-preset browser validation is still required.
- [ ] Browser acceptance of mixed queue reorder, shuffle/repeat, autoplay, touch and narrow toolbar remains open.


### Winamp — remaining integration and acceptance work (2026-11-25)

- [ ] MilkDrop 2 HLSL warp/composite shader support: current importer uses the default Butterchurn GLSL feedback shaders and warns when a source `.milk` contains custom HLSL. Keep this explicit until a compatible converter is proven.
- [x] Persist the edited mixed audio/video queue order across reloads and fourth-window close/reopen using stable media keys and guarded localStorage access. Toolbar Move Up/Down and the in-window drag-reorder list are available.
- [x] Extend `.wampack` restore tests with asynchronous quota failure, synchronous object-store failure, atomic transaction abort and post-commit rollback of IndexedDB records plus temporary Blob URLs. Optional DEFLATE import remains unimplemented (writer currently uses STORE).
- [ ] Browser acceptance on desktop and mobile: mixed audio/video selection, reorder, shuffle, repeat, auto-advance, Media Session keys, keyboard shortcuts, autoplay restrictions, fullscreen, touch gestures, narrow toolbar, codec errors, and close/reopen resource release.
- [ ] Profile Butterchurn CPU/GPU/memory on high-DPI displays and verify WebGL context cleanup and renderer reinitialization after repeated mode changes.
- [x] GitHub Actions passed TypeScript, Winamp archive tests, ESLint, production build, artifact verification and GitHub Pages deployment for commit `e53db050`. The subsequent source hardening commits are listed below and are checked independently.


### 2026-11-25 — Persistent mixed queue order

- [x] Save and restore the mixed audio/video queue order in versioned localStorage state. Normalize against current media keys, discard stale/duplicate entries, append newly added media, and recover safely from malformed or unavailable storage.
- [x] Add regression tests for normalization, reorder direction, immutable updates, storage round-trip, malformed JSON and storage exceptions.
- [x] GitHub Actions passed Typecheck, Winamp archive test suite (including the new media queue tests), ESLint, production Build, output verification and GitHub Pages deployment for commit `d9fa6879`.
- [x] Add a collapsible mixed-media queue editor inside the existing fourth window with HTML drag-and-drop, active-item indication and click-to-play; no new window or audio graph is created.
- [ ] Verify pointer/touch drag behavior on real mobile browsers; Move Up/Down controls remain available as a non-drag fallback.
- [x] Integrated the focused MIT `milkdrop-eel-parser@0.0.4` package only (no old Babel/Webpack converter tree or native shader addon). It emits JavaScript equation strings matching Butterchurn 2.6.7; shader conversion remains separate.


### 2026-11-26 — Mixed queue drag editing and Butterchurn lifecycle hardening

- [x] Add a collapsible queue editor inside the existing fourth Video / Visualization window. Audio and video entries render together; drag-and-drop reorders the mixed list, selecting a row plays it, and the active entry is highlighted. Existing toolbar selector and Move Up/Down controls remain as fallbacks.
- [x] Add a pure reorder-by-key helper and regression tests for arbitrary drop positions, invalid indices and non-mutating behavior.
- [x] Harden Butterchurn teardown against async preset-import races: mark runtime disposed before releasing it; after file reads and preset loads, ignore results if the visualizer has already been unmounted or replaced.
- [x] On renderer exceptions, stop RAF and release the audio analysis branch, preset references, WebGL context and canvas backing store rather than leaving a failed renderer resident.
- [x] Ignore rejected asynchronous preset switches/advances after runtime teardown, so late failures cannot update a closed visualizer.
- [x] Limit local preset imports before reading/parsing: 2 MB for legacy `.milk`, 8 MB for Butterchurn JSON.
- [x] Extract `.wampack` rollback into a reusable helper and test record deletion plus revocation of all temporary Blob URLs after a post-commit failure.
- [x] EEL2 conversion is now integrated through the MIT `milkdrop-eel-parser@0.0.4` package and emits JavaScript strings for pinned Butterchurn 2.6.7. MilkDrop 2 custom HLSL warp/composite shader conversion and real-preset browser acceptance remain open.
- [ ] Mobile drag acceptance, real-browser repeated open/close and WebGL memory profiling remain open.
- [x] GitHub Actions passed TypeScript, Winamp archive tests (including quota/abort and post-commit rollback tests), ESLint, production build, artifact verification and GitHub Pages deployment for `e53db050`.


### 2026-11-26 — Winamp restore rollback and preset-import hardening

- [x] Verify atomic IndexedDB import rollback for both asynchronous quota failure and synchronous object-store failure; the failed transaction never commits partial records.
- [x] Verify post-commit rollback removes imported local records and revokes every temporary Blob URL when playlist publication fails.
- [x] Guard late Butterchurn preset-switch/advance rejections after teardown and enforce 2 MB `.milk` / 8 MB Butterchurn JSON import limits before reading files.
- [x] CI and GitHub Pages deployment passed for `e53db050` (TypeScript, Winamp archive tests, ESLint, production build and artifact verification).
- [ ] MilkDrop 2 custom HLSL warp/composite shaders are not converted. EEL2 equations and custom waves/shapes are transpiled to Butterchurn 2.x JavaScript strings; validate representative real-world presets in a browser before marking compatibility complete.
- [ ] Real browser acceptance and GPU/CPU/memory profiling remain owner-deferred; source changes and CI do not substitute for desktop/mobile browser testing.


### 2026-11-26 — MilkDrop EEL2 and custom-object adapter

- [x] Replace scalar-only `.milk` import with a local adapter that maps known MilkDrop scalar aliases and transpiles numbered EEL2 init/frame/per-pixel programs to Butterchurn 2.6.7 `*_eqs_str` JavaScript strings using the MIT `milkdrop-eel-parser@0.0.4` package.
- [x] Map legacy zero-based wave/wavecode and one-based shape/shapecode slots to Butterchurn arrays, including scalar fields and init/frame/per-point equations.
- [x] Report unsupported/unmapped fields and MilkDrop 2 custom warp/composite shaders instead of silently dropping them. HLSL shader parity is not implemented.
- [x] Add regression coverage for scalar aliases, EEL2-to-JavaScript output, custom wave/shape slot conversion, shader/unmapped warnings, seed-value isolation, missing sections, incomplete base presets and size limits.
- [ ] Run representative real `.milk` samples through Butterchurn 2.6.7 in a browser and visually compare; CI parser tests do not prove renderer compatibility.
- [ ] MilkDrop 2 HLSL warp/composite shader support remains open.


### 2026-11-26 — Butterchurn 2.6.7 EEL compatibility correction

- [x] Confirmed the pinned Butterchurn 2.6.7 runtime compiles `*_eqs_str` JavaScript with `new Function`; the newer `*_eqs_eel` WASM path belongs to a later Butterchurn release and is not used here.
- [x] Switched the adapter to the MIT `milkdrop-eel-parser@0.0.4` parser/emitter, loaded lazily on `.milk` import. It produces the JS equation strings expected by the current Butterchurn version without bringing in the legacy converter's Babel/Webpack stack.
- [x] Use canonical Butterchurn fallback GLSL shaders when source HLSL cannot be converted; report custom shader presence rather than silently implying shader parity.
- [x] Latest verified CI run `45689480441` passed typecheck, Winamp archive tests, ESLint, production build, artifact verification and GitHub Pages deployment for commit `0ad49c11`.
- [ ] Real-world `.milk` browser acceptance and custom HLSL warp/composite conversion remain open.

- Widgets/Gadgets entry: the desktop "Widgets" icon is removed on every skin; a "Виджеты" shortcut (appId `widget-gallery`) lives in the desktop Программы folder (`FileSystem.ts`), and `launchApp('widget-gallery')` opens the gallery. 2026-11-26.
- Memory: see "Memory budget" in `docs/reference-cache.md` (avatar GIF 1080px -> 160px, preload by fetch only). 2026-11-26.

- Vista editions (GRUB, E): Starter, Home Basic, Home Premium, Business, Enterprise, Ultimate in `osEditions.ts` (Build 6002: Service Pack 2). Starter and Home Basic add `vista-basic` to the shell and load `vista-basic.css` (opaque Vista Basic frames and taskbar, no glass), as in `eat/screens/oc/vista/01-window-chrome-styles.png`. Extra reference saved: `eat/screens/oc/vista/03-start-menu-welcome-center.png` (Start menu, Welcome Center, Sidebar). 2026-11-26.
- Note: another session edits the Vista start menu, logon, orb (40 px) and Welcome sound in the same working tree; commit by file, not `git add -A`.

- i18n for Vista UI strings: `src/i18n/vistaStrings.ts` holds all 23 Vista-only strings (Sidebar, Welcome, Start menu entries, Explorer navigation and favorites, widget gallery toggle) in all nine languages (en, ru, fr, es, zh, ja, ko, be, kk). Use `vistaText(language, key)`; do not add new `isRu ? … : …` pairs for Vista. Vista edition names and descriptions now have all nine languages (`translations` in `src/shells/os/osEditions.ts`; use `editionLabel` / `editionDescription`). Other OS editions still use the `labelRu`/`descriptionRu` pair, and the About and Control Panel views show the Russian text to every language for them; that pass is open. 2026-11-27.

- eat/ resource integration (2026-11-27):
  - [x] Windows 11 icon set (from GitHub, not from eat/): 16 icons in `src/themes/win11/assets/icons/`.
  - [x] Windows 10 icon set from `eat/windows10-portfolio-main`: 10 icons in `src/themes/win10/assets/icons/`, registered as `WIN10_ICON_ASSETS` and in the `win10` theme assets. Not visible yet: Windows 10 is still a `(draft)` in GRUB.
  - [ ] Windows 7 icon set (`eat/windows7-ui-portfolio-main/public/win7`, 528 `.ico`): check against `src/themes/win7` (may already be PNG) before wiring.
  - [x] Windows 2000: the ICON set was already in use as PNG (`src/themes/win2000/icons`). Native window control glyphs and title-bar gradients were added (`win2000-chrome.css`). The Start menu matches the reference.
  - [x] Windows 95 first pass (2026-11-27): the Windows 95 profile keeps the Windows 98 theme, but when GRUB boots `win95` the shell adds `os-win95` and swaps in the Windows 95 icon roles from `eat/wins95Portfolio-main` (`src/themes/win95`, 11 icons at 32 px: My Computer, recycle bin empty/full, folder, My Documents, Run, Notepad, Minesweeper, Internet Explorer, Task Manager, Control Panel). `win95.css` gives the teal desktop and plain navy/grey title bars. Windows 98 is unaffected (checked: no `os-win95` class on its desktop). Explorer 'My Computer' list for Windows 95 now omits Scheduled Tasks and Web Folders (added with Windows 98 and IE 4). Start menu for 95 (`StartMenu98` + `startMenuClassicLists`): "Windows95" banner, 32 px Documents/Settings/Run icons from `WIN95_START_ICONS`, no Suspend. Explorer toolbar for 95 hides Search and Folders and shows a disabled Cut/Copy/Paste/Undo/Delete/Properties row (strings in `src/i18n/classicEditStrings.ts`, nine languages). Windows 95 sounds are not in eat/ (its MP3s are music), so none are used.
  - [x] Draft marker removed from every Windows entry in the GRUB menu (2026-11-27); the `draft` flag is gone from `osTypes.ts`, `osProfiles.ts`, `GrubMenu.tsx` and the translations.
  - [x] Windows 10 first pass (2026-11-27): own style set `os-win10` (Windows 7 base + Start menu layout + `win10.css`), dark taskbar, four-square Start button, dark Start menu, flat window frames with Windows 10 caption buttons, the official Windows 10 wallpaper and the eat/ Windows 10 icons. Still open: the white search box at the bottom of the Start menu, the Explorer look, and notification details.
  - [x] Windows 10 leftovers (2026-11-27): dark Start search box, Explorer in Windows 10 colours, title row aligned.
  - [x] Windows 11 first pass (2026-11-27): own style set `os-win11` (`win11.css`), light translucent taskbar with blue Start logo, light rounded Start menu, rounded window frames, Windows 11 icon set (`WIN11_ICON_ASSETS`). Explorer checked on screen (light, shares the Windows 10 palette via `file-explorer--win11`). Open: no Windows 11 wallpaper exists in `eat/` (the Windows 7 wallpaper is used). Tray notifications done 2026-11-27 for Windows 10 and 11: the notification button opens an Action Center panel (`ModernActionCenter` in `TaskbarSystemArea.tsx`) with Wi-Fi, Sound and Airplane mode tiles that toggle their state, and the empty notification list. Source: `eat/kenMaina-windows10-portfolio-main/src/components/actionCenter` (tiles and layout). The tiles do not drive a network or audio stack, and Windows 11 uses its quick settings and notification centre as two panels; this shell shows one panel with the Windows 10 wording on both. The clock flyout already uses the modern dark flyout (no change).
  - [x] Server entries decided (2026-11-27). Server 2003: the reference screenshot (`eat/screens/oc/server2003/01-desktop-start-menu.jpg`) shows the Windows XP shell (Luna taskbar, XP Start menu), so 2003 keeps the XP skin; the only differences are the wallpaper and Start menu entries (Manage Your Server, Administrator). The wallpaper exists only inside that screenshot with a "Demonstration" watermark, so it is not used. Server 2008, 2012, 2016 and 2019: no screenshot, wallpaper or icon source in `eat/`, and the search found no donor; they keep their closest client skin until files are supplied. Open: Server 2003 wallpaper and Start menu entries; 2008–2019 sources.
