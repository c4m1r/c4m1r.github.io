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

## Recent change log
- 2026-11-19: Consolidated active WebOS/multi-OS tasks, retained previous registry in history, corrected DOOM status to 30%, and promoted OS-native styling to explicit acceptance criteria.
- 2026-11-19: Updated `DoomPlayer` to distinguish iframe navigation from verified gameplay and keep a direct external launch path visible. Runtime gameplay and browser verification remain pending.
- 2026-11-19: Removed the DOOM 3 WIP entry from the normal Games folder so it is no longer presented as a playable installed title. The WIP configuration remains documented for later verification.
- 2026-11-19: Replaced the generic XP program-folder image with the dedicated Windows XP `My Games.png` icon. Added OS theme metadata to the shared Explorer root and first-pass distinct Windows 98 classic and WebOS dark Explorer styling; full native toolbar/icon parity remains open.


### EXPLORER-02 — Theme-native Legacy Explorer adapters
- Reuse the existing `osSkinRules` profiles and shared `ExplorerSurface` routing; do not create a parallel skin registry or duplicate Explorer implementation.
- Shared navigation, address resolution, selection, virtual filesystem and file opening remain in `MyComputer`. Presentation adapters are selected by the active theme.
- Windows 98/2000 use the site's existing Win98 icon library and classic controls; XP keeps its XP toolbar and task pane; Windows 7 and macOS retain their dedicated surfaces.
- Ubuntu, Arch and WebOS receive distinct file-browser chrome and surfaces through the shared Explorer root's `data-os-theme` attribute.
- Acceptance still requires manual checks of all interactions and responsive behavior; CSS/source changes alone do not complete EXPLORER-01 or OS-FIDELITY-01.

- 2026-11-19: Added theme-specific toolbar/item icon routing for the shared Legacy Explorer and moved its Win98/2000/Linux/WebOS presentation into a dedicated OS adapter stylesheet. Runtime verification remains pending.


### EXPLORER-03 — Current-folder search and path normalization
- Search toolbar action now exposes a filter scoped to the current folder. It filters the existing visible collection without changing virtual filesystem data.
- Normalize the C: root as `C:\\`, repair joining child paths from drive root, make address lookup case-insensitive and suppress adjacent duplicate history entries.
- Manual acceptance remains pending: Back/Forward/Up, address submit, search/clear/empty results, and responsive behavior across profiles.
- 2026-11-19: Implemented source pass; runtime and quality gates not yet run.


- 2026-11-19: Added a collapsible Legacy Explorer folder tree for non-XP/non-Apple profiles. It reads the canonical virtual filesystem; tree labels navigate and disclosure controls expand/collapse. XP retains its task pane and Apple keeps Finder sidebar.

- 2026-11-19: Added per-profile folder-tree sidebar treatments to the shared Explorer adapter stylesheet; changed body selectors to target the flex body by class so the optional search row does not shift CSS targeting.


### 2026-11-19 — User-reported desktop and Pictures regressions
- Fixed widget defaults: all non-WebOS widgets are off by default; WebOS keeps its eight enabled defaults. Apple/non-WebOS widget visibility now uses a v2 storage key, ignoring stale v1 values that could preserve the old unwanted enabled state.
- Fixed Windows 98/2000 Start Menu: Programs, Favorites, Documents, Settings, Find, Help, Run, Computer and My Pictures now route through the existing shared app/Explorer callbacks. Previously most menu entries only closed the menu.
- Added a My Documents desktop icon and explicit double-click route to the canonical virtual folder.
- Corrected the user-profile hierarchy: My Pictures is nested inside My Documents. Start Menu XP/7/classic paths now target that same location; My Music is also represented so its existing shortcut no longer points to a missing folder.
- Renamed the gallery application to Picture Viewer / Просмотр изображений while preserving My Pictures / Мои рисунки as the folder name.
- Explorer now recognizes both English and Russian My Pictures path names and switches to thumbnail view. Picture Viewer also adds an Explorer-opened image to its active image list if it is absent from the gallery hook result.
- Source changes are committed on main; runtime acceptance and all quality gates remain pending.

- 2026-11-19: Removed desktop duplicates for Projects, Wiki, Notepad and About while retaining Blog; fixed Windows 7 Explorer's Pictures library path and added a thumbnail presentation for that folder.

- 2026-11-19: Added My Pictures to the Windows XP Explorer Other Places pane and included WebP in the Picture Tasks image filter. The Picture Tasks slideshow action now launches the shared Picture Viewer with autoplay enabled; manual playback acceptance remains open.

- 2026-11-19: Wired the Windows XP Picture Tasks slideshow action to the shared Picture Viewer with autoplay enabled, rather than opening only the first image.

- 2026-11-19: Localized Explorer window titles for My Documents, My Pictures and My Music in Russian UI so Start Menu navigation and Explorer folder labels agree.
- 2026-11-19: Added OS-native Widget Gallery styling, application icon resolution in virtual folders, Start Menu Programs/Search routing, shared legacy/modern Windows profile aliases, publisher-based Program Files folders and initial Belarusian/Kazakh locale support. Automated and manual verification remain pending.
- 2026-11-19: Explorer large-icon view now gives application shortcuts explicit 64px image dimensions instead of only max-size constraints; desktop shortcut artwork is also 64px. Minesweeper now forces sprite sheet sizing against theme overrides and reveals all mines/incorrect flags after loss.
- 2026-11-19: Windows 7 Explorer Up navigation now treats the root of Pictures/Music/Videos/Downloads as a modern Libraries alias and returns to the profile's Documents library. Up from nested folders still follows the actual parent path. This is source-level only; manual acceptance for all four libraries and nested folders remains pending.
- Windows 7 Explorer address-bar Enter now opens a resolved file through the shared `onOpenItem` association callback instead of treating its file path as a folder navigation target. Manual acceptance for image, audio, and application shortcuts remains pending.
- 2026-11-19: ICS import now parses RDATE and EXDATE recurrence-set values and expands additional instances while suppressing excluded instances. RDATE PERIOD, BYSETPOS, ordinal BYDAY and full VTIMEZONE support remain open.
- 2026-11-19: Appearance & Themes now filters the shared image inventory by all/wallpapers/pictures, previews fit mode, supports Apply/Cancel and persists Fill/Fit/Stretch/Tile/Center placement. Desktop shell applies the selected mode to the active custom wallpaper.
- 2026-11-19: DOOM II header now separates `Doom II` and the smaller `Hell on Earth` subtitle to match the compact DOOM hierarchy.

- 2026-11-19: Explorer launcher now includes the active OS theme in its callback dependencies, preventing a stale Explorer surface when the active theme changes without remounting.

- Gallery inventory follow-up: picture and wallpaper types are now disjoint; nested wallpapers are included and stable IDs use relative paths. Manual cross-app image inventory acceptance remains pending.


### WEBOS-02 — Widget canvas interaction and overflow regression (P0)
- Keep one shared DesktopWidgetCanvas implementation; do not fork widget behavior per OS.
- Widget cards must retain their full preset height. The canvas is the scroll/viewport boundary; a card must not silently shrink its content to the currently visible canvas height.
- Canvas Grip is the compact affordance: visible on hover/focus, directly draggable, and toggles the persistent per-widget controls row (title + size selector) on click. A second click collapses the controls without changing widget content or placement.
- Preserve pointer capture, keyboard movement, collision avoidance and viewport clamping. Dragging must work from the grip, not be blocked by its button semantics.
- Canvas must not clip the widget vertically or block pointer movement due to an overflow/stacking ancestor. Recheck after Compact → another size → Compact and after viewport resize.
- Dropdown/popover menus inside widgets must render above adjacent cards and outside card clipping, with a restrained translucent glass surface and backdrop blur. Keep menus usable by pointer and keyboard.
- Acceptance: verify Weather city selector with all entries visible; verify every widget dropdown, Winamp controls and media interactions; test mouse/touch/keyboard and compact-mode round trips.
- 2026-11-19 source pass: widget preset height is no longer reduced to canvas client height; Canvas Grip toggles persistent controls and remains a drag handle. Weather city picker now renders through a viewport-level React portal with a translucent blurred surface, viewport-aware placement, outside-click/Escape dismissal, listbox ARIA semantics and arrow/Home/End keyboard navigation, so it escapes card/canvas clipping. The canvas/card scroll boundaries were restored after this portal change. Source audit found no other native widget dropdowns; Winamp uses direct transport buttons and Currency uses inline asset tabs. Remaining: verify drag/scroll/compact round trips and Weather menu placement in a browser. Runtime/typecheck/lint/build/browser acceptance is still pending.

### WINDOWS-01 — Desktop icon tile and night palette
- Start with WebOS as the reference implementation, then share the palette contract with Windows desktop skins.
- Windows light mode: icon tile/selection backing uses the familiar light surface without obscuring the icon. Night mode: switch the same surface and text/selection contrast to dark values; do not leave a white rectangle behind the icon.
- Scope styles to desktop icon tiles and selection/focus states; do not alter application icon artwork, Explorer file icons or unrelated buttons.
- Keep wallpaper contrast, hover, selected, focus-visible and disabled states accessible. Verify Windows 10/11 light/dark and WebOS before extending to XP/7/classic profiles.
- WebOS first styling pass: shared desktop icon tile hook is in place; dark glass tile backing, cyan hover/selection edge, label contrast and focus outline are scoped to `.os-webos`. A canonical per-OS `colorScheme` setting (`light` / `dark`) now persists through `SystemSettings`; Control Panel exposes the choice in Appearance & Themes, and DesktopShellContainer applies `data-color-scheme` to WebOS. The light palette uses a clean light tile and dark label; dark remains the default.
- Acceptance: wire the canonical palette state, switch themes repeatedly without stale inline styles; inspect transparent PNG/SVG icons over light and dark wallpapers; confirm selection rectangle remains legible.

### DOCS-03 — Single Wiki / Blog help library
- Wiki and Blog are two content sources in one documentation application, not separate products or launch destinations.
- Continue the shared BlogApp HTML Help viewer. Windows presents it as Блог.chm / Blog.chm; WebOS and other shells use a single Help/Documentation entry point.
- Keep one global search, one reader pane, a hierarchical Wiki contents tree and article/blog/site content grouped within the same library. Avoid duplicate desktop/start-menu shortcuts and parallel navigation systems.
- Acceptance: search across Wiki, Blog, app catalogue, projects, news and site pages; open every source in the same reader; verify Windows CHM-like chrome and WebOS presentation.


- 2026-11-19: Weather city selector moved to a viewport-level glass portal to avoid widget/canvas clipping; WebOS desktop icon tiles received their first dark-surface styling pass. Automated and browser verification remain pending.

- 2026-11-19 source pass: WebOS light/dark desktop icon scheme is now connected to the shared per-OS settings store and Appearance & Themes UI. Browser contrast and persistence acceptance remain pending.

### WINAMP-01 — Independent classic player windows and widget entry point (P0)
- Winamp is no longer wrapped by the operating-system Explorer-style window chrome. The desktop window manager keeps the app lifecycle/close route, while the player renders its own classic Winamp surfaces.
- Main player, equalizer and playlist have independent viewport coordinates, titlebar drag handles, viewport clamping and active-window stacking. Windowshade controls remain local to each surface.
- The existing Widget Gallery entry remains the canonical visibility control for the compact “Winamp Now Playing” desktop widget; it is not the same surface as the full classic player.
- Current source work: `Window.tsx` bypasses OS chrome for `app:winamp`; `WinampPlayer.tsx` owns drag/stack/close behavior; `winamp.css` renders floating windows over the desktop.
- Still required: browser test dragging each window by its titlebar, overlap/bring-to-front, windowshade, close/reopen, mobile touch, viewport edges, playback/EQ/playlist, and verify that the full player does not cover the taskbar or block desktop interaction outside its surfaces. Webamp is a behavior reference, not a bundled dependency. Do not claim full Webamp feature parity until skins, file drop, EQ presets persistence and media metadata are verified.

- 2026-11-19 source pass: Windows 7 Explorer now receives the shared slideshow callback, offers a Slide show action when the current folder contains multiple supported images, and uses actual image URLs in thumbnail view. This reuses the shared PictureViewer slideshow instead of creating a second viewer. Runtime acceptance remains pending.
- 2026-11-19 follow-up: shared Picture Viewer now supports Left/Right image navigation, +/- zoom shortcuts and Escape to stop slideshow and invoke its optional close callback. Zoom and rotation reset when the active image changes, including slideshow advances. Browser/keyboard acceptance remains pending.
- Explorer address-bar file activation in the shared legacy Explorer now resolves the final filename case-insensitively, matching the virtual filesystem's case-insensitive path resolver. Validate mixed-case file paths and associations in browser acceptance.

- 2026-11-19 source pass: Desktop icons now follow the agreed shell layout: My Computer, My Documents, Games and Programs; per-application shortcuts have been removed from the desktop and remain available through Start / Programs. The WebOS widget-gallery desktop entry remains non-Windows only. Browser navigation acceptance remains pending.

- 2026-11-19 follow-up: deduplicated Games/Programs desktop icons (the FileSystem keeps targetPath aliases for compatibility, but the shell no longer renders those aliases beside canonical system icons). Windows 7 slideshow now passes both the image collection and current directory path. Winamp titlebar and stacking interactions now use Pointer Events consistently for mouse/touch/pen. CI logs from the earlier attempt exposed these typing/import issues; fixes are in main and awaiting a fresh full run.

- 2026-11-19: Widget Gallery now exposes the **Classic Winamp** player as a separate on/off entry from the compact **Winamp Now Playing** widget. The entry reflects whether `app:winamp` is open and toggles that window directly; it intentionally has no desktop-widget size preset because it is a draggable multi-window application, not a canvas widget. Verify open/close synchronization and touch dragging in browser acceptance.

- 2026-11-19 validation: GitHub Actions run `44544169344` completed successfully for commit `f345649d9b2922573f72e9202be45790c148bcf1` (build and deploy jobs both successful). This validates that source changes through that commit typecheck, lint, build and deploy. The separate Classic Winamp Gallery toggle was added after the previous validation and must be included in a subsequent run.

- 2026-11-19: Windows 7 Start Menu > All Programs had a duplicate Notepad entry because Notepad was already included in the pinned/programs base list and was appended a second time. Removed the redundant entry; browser verification of Start Menu navigation and app launches remains pending.

- 2026-11-19: Fixed Windows 7 Start Menu library targets. The menu previously pointed to `C:\Users\C4m1r\Documents`, `Pictures`, and `Music`, but the shared virtual filesystem exposes the profile's canonical `My Documents\My Pictures` and `My Documents\My Music` children. Start Menu shortcuts now target those actual shared nodes; this prevents navigation to empty/nonexistent paths. Validate all three links in-browser.
- 2026-11-19: Added direct **My Videos / Мои видеозаписи** navigation to the Windows 7, XP and 98/2000 Start Menu places lists. All three entries resolve to the existing shared `My Videos` folder under the C4m1r profile; no media files or folder data are duplicated. Verify navigation and video-file opening in browser acceptance.
- 2026-11-19: Fixed a widget-preference default leak: the shared visibility loader previously fell back to WebOS's all-enabled defaults regardless of the active OS. Non-WebOS shells now start with every desktop widget disabled, WebOS retains its all-enabled initial layout, and saved visibility is isolated per OS. Switching OS themes reloads that OS's saved state. Browser acceptance is still required, especially fresh-storage defaults, theme switching, and gallery toggles.


- 2026-11-20 implementation handoff: theme-aware icon resolution is now wired into `MyComputer.tsx`, `Windows7Explorer.tsx` and `DesktopShellContainer.tsx`. This is a first integration pass, not completion of ICONBANK-01: Windows 98/2000 still rely on incomplete/shared theme registries, Windows 7 inherits XP assets for unmapped app roles, WebOS is still XP-derived, Linux themes currently fall back to the WebOS registry, and iOS 5 has no complete dedicated map. The resolver deliberately keeps virtual filesystem records as the input contract and does not import donor files from `/eat/`. CI was triggered for the latest source commit; inspect its result before recording build/type/lint success. Browser visual acceptance and image-dimension inventory remain outstanding.


## Latest implementation update — 2026-11-20

### ICONBANK-01 follow-up: semantic file association catalogue

- [x] Add a shared extension/category/MIME/default-app/semantic-icon catalogue in `src/themes/fileAssociations.ts`.
- [x] Route ordinary Explorer file icons through the active theme's semantic asset role in `src/themes/iconResolver.ts`, preserving app shortcut, folder, drive, system, media-track and content-thumbnail precedence.
- [x] Use the shared association catalogue in `DesktopShellContainer.handleOpenFile` for supported text/code/data files (Notepad) and image formats (Picture Viewer), retaining the project-Markdown special case and content-backed image requirement.
- [ ] Extend launch-context support for audio/video/archive/document types only when the target app can consume a selected file; do not dispatch an app ID without passing usable file context.
- [ ] Complete independent native registries for Windows 98, Windows 2000, Windows 7, WebOS, Ubuntu, Arch and iOS 5; eliminate unintended XP inheritance.
- [ ] Finish generation-specific iOS icon coverage and validate macOS/iOS icon roles at rendered sizes.
- [x] Add a dependency-free `npm run audit:icons` scanner for theme image dimensions, alpha/transparency metadata, ICO variants, file hashes and exact duplicates.
- [ ] Run the inventory locally and review the report; GitHub connector cannot execute the script against the checkout. Generate contact sheets for Win98 variants and Win7 numeric assets.
- [ ] Complete the per-OS visual matrix and run `verify`, typecheck, lint, build and browser checks.
- Verification status: source edits are committed, but no local test/build/browser run was performed in this connector-only pass. Do not mark acceptance complete until CI and manual visual checks pass.

## Icon bank continuation — 2026-11-20

- [x] Create a dedicated Win98 semantic icon module and wire core shell / Start / Places / Control Panel roles to it (first pass).
- [ ] Visually validate the selected Win98 artwork against contact sheets and finish generic file-type role mapping. Browser and Recycle Bin semantic assets are mapped; dimensions/alpha have been sampled for the selected bank, but visual acceptance remains pending.
- [x] Add a partial Win2000 shell registry using explicitly named `_2k` computer, My Documents and Recycle Bin assets (all 48×48 with transparency).
- [ ] Complete the Win2000 bank: identify the remaining roles, generic folder and app icons; review numbered donor ICOs and their provenance before importing.
- [x] Create and wire a dedicated Win7 semantic registry for the five clearly named shell assets (Computer, Folder, IE, Mail, Volume) and Start/Places roles.
- [ ] Generate a contact sheet for the 535-or-so numeric Win7 image entries, identify them visually, and expand app/file role coverage; then remove XP-derived fallbacks where native assets exist.
- [ ] Remove XP-derived icon role inheritance from WebOS; build native WebOS role mapping.
- [ ] Create independent Ubuntu and Arch semantic banks; those theme folders are not currently present under `src/themes`.
- [ ] Complete iOS 5 generation-specific icon coverage (current dock uses glyph placeholders and `getIosIconMap('ios-5')` returns an empty map).
- [x] Shared file-association catalogue and theme-aware icon lookup are implemented; Notepad and Picture Viewer open paths consume the catalogue. File-context launch support for audio/video/archive/rich documents remains outstanding.
- [ ] Inventory image dimensions, formats, alpha and duplicates; produce per-OS contact sheets and visual acceptance matrix.
- Verification: no local typecheck/lint/build or browser checks were run during this GitHub-only pass. Check Actions for latest main commits.

- [x] Fix TypeScript narrowing in content-backed image icon resolution; add explicit string guard. Latest CI run for the fix is pending.


## Windows icon-bank audit follow-up — 2026-11-20

- [x] Remove duplicate empty Win98 Start-menu / Places maps that silently overrode the curated icon roles.
- [x] Locate a concrete Windows 2000 donor bank: 200+ numbered ICOs and Start-menu role references found in `eat/windows2000-main`.
- [ ] Generate a contact sheet and visually identify the numbered Win2000 ICOs before importing/assigning them.
- [ ] Confirm license/provenance for donor images before copying them into production assets.
- CI: duplicate Win98 object-key failure was fixed in `63ca2f4`; workflow `44782276753` completed successfully.

- 2026-11-20 Win7 icon follow-up: named source assets are mapped in `src/themes/win7/iconAssets.ts`; numeric assets remain intentionally unmapped until visual identification. Latest source commit `ad2033c` integrates the registry. Workflow `44792794149` for preceding registry module `16d3594` completed Typecheck, Lint, Build and Verify build output successfully; integration commit still needs a fresh completed CI run and visual rendering.

## Windows icon collection (canonical multi-size set) — 2026-11-20

- [x] Build a single canonical Windows icon collection under `src/themes/windows-icons/` (families: win98, win2000, winxp, win7; 61 roles) with per-role PNGs at 16/24/32/48/64/128/256 and multi-size `icon.ico`, plus `manifest.json` (role → app → source → produced/skipped sizes).
- [x] Generator `scripts/build-windows-icons.py` is downscale-only: sizes above a source's longest edge are recorded as skipped instead of upscaled.
- [x] Fix opaque white background in the Win7 volume source (edge-connected near-white knockout) and verify transparency on a contact sheet.
- [x] Gates: `verify`, `typecheck`, `lint` (0 errors), `build` pass.
- [ ] Wire the collection into the Windows theme registries (currently the registries still point at the original source files).
- [ ] Identify the 530+ numeric Win7 assets and add their app roles to the manifest.
- [ ] Browser visual check of each Windows skin at native desktop scale.

## Windows icon collection v2 (native-first matching) — 2026-11-20

- [x] Replace the downscale-only v1 method. Each role/size now prefers native artwork from the same icon family (same base name, e.g. `computer_2_cool-0..5`), chosen by visual match to the reference. Downscaling is used only when no native size exists, and every file is tagged `native`, `reference` or `derived` in `manifest.json`.
- [x] Per-OS size sets follow what each generation shipped: Windows 98, 2000 and XP use 16/32/48 px; Windows 7 uses 16–256 px.
- [x] Contact-sheet review of Windows 98 and 2000 role sizes.
- [ ] Review Windows XP sizes: the named 1024 px sources are still downscaled where no 16/32 px native exists; the numbered XP bank (`winxp/assets/icons/NNN(16x16|32x32|48x48).png`) needs a visual role mapping.
- [ ] Windows 98 Computer, Help, MS-DOS: no native 16 px variant matched the reference within the threshold; the 16 px files are derived and should be reviewed.

## Windows 7 icon bank standardization — 2026-11-21

- [x] Visually reviewed all 533 numeric Windows 7 icons on labelled contact sheets and assigned each a `category/name` in `scripts/data/win7-icon-names.txt`.
- [x] `scripts/organize-win7-icons.py` moves them to `src/themes/win7/icons/<category>/<name>.png`, collapses 27 byte-identical duplicates (aliases kept in `manifest.json`) and removes the numeric originals. Result: 508 unique icons.
- [x] Random 48-icon sample checked against the map: names match artwork.
- [x] Hand-named Windows 7 files (`computer.png`, `folder.png`, `internet-explorer.png`, `mail.png`, `volume.png`, `vista-orb.ico`) are unchanged because code imports them.
- [ ] Apply the same category/name standard to the Windows XP (`NNN(WxW).png`, 93 numbered variants) and Windows 98 (`*-N.png` families) banks.
- [ ] Point runtime theme registries at `src/themes/win7/icons/` where a role should use the standardized name.

## Windows 7 role wiring to standardized icons — 2026-11-21

- [x] Wire 18 Windows 7 roles to `src/themes/win7/icons/` (Calculator, Paint, Notepad, Media Player, Terminal, Minesweeper, Calendar, Help, Control Panel, Recycle Bin empty/full, Pictures, Performance Monitor, Search, Games, Printers) and their Start Menu/Places slots. Each was checked on a labelled contact sheet before assignment.
- [x] Users icon removed from Programs role: no visually matching asset yet.
- [ ] Browser check of the Windows 7 desktop, Start menu and Explorer: blocked, because the Windows 7 login requires a password.
- [ ] Same category/name standard for Windows XP (`NNN(WxW).png`) and Windows 98 (`*-N.png` families, 587 base names); requires updating import paths in `win98/iconAssets.ts`, `winxp/themeAssets.ts`, `webos/themeAssets.ts` and `win2000/iconAssets.ts`.

## Windows 98 icon bank standardization — 2026-11-21

- [x] `scripts/organize-win98-icons.py` moves all 1758 Windows 98 icons to `src/themes/win98/icons/<category>/<name>/<WxH>-<N>.png` (kebab-case names, intrinsic size and original variant index in the file name). Categories are assigned by whole-word rules; the full mapping is in `src/themes/win98/icons/manifest.json`.
- [x] Import paths updated in `win98/iconAssets.ts`, `win2000/iconAssets.ts`, `webos/themeAssets.ts`, `MyComputer.tsx` and `StartMenu98.tsx`. Original `assets/icons` folder removed.
- [x] `typecheck`, `build`, `lint` (0 errors) and `verify` pass.
- [x] Removed the superseded derived collection `src/themes/windows-icons/` and its builder `scripts/build-windows-icons.py`. Nothing imported them; the curated XP table is preserved in git history (commit `9018057`).
- [ ] Category rules are heuristic: review `manifest.json` and correct any misfiled names by editing the rules.
- [ ] Apply the same standard to the Windows XP numbered bank (`NNN(WxW).png`).

## Login defaults: passwordless User first — 2026-11-21

- [x] Login screens list the passwordless `User` account first and select it by default: WebOS-family dropdown (Win98, Win2000, WebOS), Windows XP and Windows 7 tiles.
- [x] `C4m1r` is the second account and keeps its existing password check (`verifyAccountPassword`, unchanged).
- [x] Verified in headless Chrome: Win98 default login reaches the desktop without a password; C4m1r with the correct password reaches the desktop; a wrong password is rejected.
- [ ] Apple/iOS login screens have no account selection in this change.

## Default profile picture for User — 2026-11-21

- [x] Windows XP login: the User tile uses the XP built-in picture `winxp/assets/avatars/user4.png` (blue butterfly). Previously both tiles showed `user.gif`, which is an animated trophy, not an account picture. Verified on the rendered login screen.
- [x] Windows 7 login: the User tile keeps the Win7 default picture (`win7/assets/images/user-avatar.png`); the C4m1r tile uses the same picture.
- [ ] C4m1r tile on XP still shows the trophy animation `user.gif`; to change this a picture must be chosen for the C4m1r account.
- [ ] Windows 98/2000 login dialogs and the WebOS login card have no account picture for User; Apple login has no User account.

## Desktop icon fidelity pass (Win98, 2000, 7) — 2026-11-21

- [x] Desktop icons for Win98, Win2000 and Win7 now come from their theme image registries instead of the Lucide fallback (`WINDOWS_IMAGE_ICON_THEMES` in `desktopConstants.ts`). XP and WebOS keep their existing rendering.
- [x] Icon sizes follow the generation: Win98 and Win2000 use 32 px, Win7 uses 48 px.
- [x] Win7 folder roles use the standardized Win7 folder set: plain folder for generic folders, folder with documents for My Documents, folder with pictures for Pictures. The previous named `folder.png` did not match the original Win7 folder.
- [x] Win98 and Win7 My Documents desktop icon uses its dedicated picture.
- [x] Verified by screenshots after login as User: Win7 and Win98 desktops.
- [x] Win7 taskbar pinned programs (Internet Explorer, Explorer, Media Player) and the two-line clock with date — done 2026-11-21, verified by screenshot.
- [x] Recycle Bin desktop icon added for XP, Win98, Win2000 and Win7 (native icon per theme); double-click opens an Explorer window titled "Recycle Bin" in the empty state (no deletion model exists yet). Verified by screenshots. See the 2026-11-21 Recycle Bin section.
- [ ] Games/Programs desktop folders are custom on XP; decide whether to keep them.
- [ ] Win98 taskbar, start menu and Explorer windows have not been compared with period screenshots yet.

## Windows 2000 native icon roles and Recycle Bin — 2026-11-21

- [x] Win2000 folder, network, Internet Explorer, printers, control panel, help, search, fonts and security roles now come from the native Windows 2000 ICO set in `eat/windows2000-main/src/assets/ICON`, extracted at native size into `src/themes/win2000/icons/` (no upscaling). Provenance: the user confirmed `/eat/` assets may be used for this demo project; the donor-licence rule in this file still applies to any future redistribution review.
- [x] Recycle Bin: `recycle-bin` desktop icon now appears on XP, Win98, Win2000 and Win7 (bottom-right corner anchored as before). Opening it shows an Explorer window titled "Recycle Bin" / "Корзина", address reads "Recycle Bin", state is empty. Other themes keep the previous behaviour.
- [ ] Recycle Bin contents: there is no deletion/trash model in the file system yet, so the bin is always empty. Needs a design decision before adding trash behaviour.
- [ ] Win2000 roles still unidentified (calculator, notepad, paint, media player, Outlook, games, Run, sound) — current contact sheets are in the scratchpad and should be annotated before wiring.
- [ ] Win2000 Explorer, taskbar and start menu not yet compared against period screenshots.

## Windows 98 window chrome and Explorer comparison — 2026-11-21

- [x] Win98 title bar minimize / maximize / restore / close buttons were blank: the theme had no glyph artwork. Added 1–2 px black stroke glyphs for `.theme-98 .win98-control-button--*` in `src/themes/winxp/xp.css`, sized to the 16×14 control. Verified by a control-strip screenshot.
- [x] Win98 My Computer content now uses the Windows 98 flat grid: 3½ Floppy (A:), Local Disk (C:), CD-ROM Drive (D:), Control Panel (opens the Control Panel app), Printers, Dial-Up Networking, Scheduled Tasks, Web Folders, all with native 32 px Win98 icons; status shows 8 objects. Remaining: the folder tree still lists Network Neighborhood under My Computer (Win98 places it on the desktop); Printers, Dial-Up, Scheduled Tasks and Web Folders are display-only. Previous finding: Win98 My Computer content does not match Windows 98: it shows the Windows 2000/XP-style "Files Stored on This Computer" heading and only Network Neighborhood plus Local Disk (C:). Windows 98 lists the drive icons (3½ Floppy, C:, CD-ROM) and system items (Control Panel, Printers, Dial-Up Networking, Scheduled Tasks, Web Folders). Needs a Win98-specific content layout in `MyComputer.tsx`.
- [ ] Win98 Start menu did not open reliably in automated capture; re-check the menu's stacking order against the open Explorer window.
- [ ] Win98 Explorer toolbar, address bar and tree pane are close to the classic layout; compare icon sizes and status bar text with a period screenshot before closing this item.

## Win98 Start menu and Explorer tree — 2026-11-21

- [x] Start menu sidebar was 200 px wide: the global `.os-sidebar` rule (file-explorer sidebars) overrode the classic 32 px strip and squeezed the item list to a sliver. Fixed inline in `StartMenu98.tsx`; the list sizes to its items and no longer scrolls its top entries out of view.
- [x] Win98 Start menu follows the default Windows 98 structure: Programs (Internet Explorer, Outlook Express, Accessories, Entertainment, Games), Favorites, Documents, Settings, Find, Help, Run..., separator, Log Off..., Shut Down... Nested flyouts work to three levels. Icons are native Win98 16 px artwork. Row height matches the classic ~22 px.
- [x] Win98 Explorer tree no longer lists Network Neighborhood under My Computer; the path `My Computer\Network Neighborhood` still resolves for Start menu and Control Panel links.
- [x] Windows 2000 shares `StartMenu98.tsx`; it keeps the Search label, the gradient sidebar and no Favorites entry. Verified by screenshot.
- [ ] Per-OS adaptation of the shared XP Explorer and Start menu (`StartMenuXP.tsx`, `MyComputer.tsx`, `Windows7Explorer.tsx`): continue moving theme-specific layout into branches of the shared components, without forking app logic. Next candidates: Windows 2000 My Computer content, Windows 7 Start menu, XP tree root.
- [ ] Win98 Start menu items that are display-only: Printers under Settings, Favorites folder contents, Documents submenu (currently opens the folder).

## Per-OS Explorer and Start menu adaptation — 2026-11-21

- [x] Windows 2000 My Computer uses its own flat grid: 3½ Floppy (A:), Local Disk (C:), CD-ROM Drive (D:), Control Panel, Printers, Scheduled Tasks, Web Folders, with native Windows 2000 32 px icons extracted from the 2000 ICO set (`src/themes/win2000/icons/`). Status reads 7 objects; Network Neighborhood is not listed under My Computer in the tree.
- [x] Windows 2000 icons still unverified: Scheduled Tasks (ICON 335) is the closest native match found, not a confirmed original; Web Folders (ICON 381) is a close match. Re-check against a period screenshot.
- [x] Windows 7 Start menu header showed the hard-coded name "C4m1r" while the session was logged in as User. The account chosen on the login screen is now recorded in `src/domain/auth/session.ts` and shown in the Start menu. Avatar unchanged.
- [x] Windows 7 Start menu: the edition line overlapped the first place entry; the places list now clears the header.
- [ ] Windows XP Explorer has no folder tree (the sidebar is XP-specific); XP Start menu user name and avatar still use the shared identity. Check against the account from `session.ts` and the XP tree/task pane.
- [ ] Win2000 Start menu and Explorer toolbars not yet compared with period screenshots at native scale.

## Windows XP Explorer and Start menu identity — 2026-11-21

- [x] XP Start menu header shows the account chosen at login (User or C4m1r) instead of a fixed name; User gets its default picture (`avatars/user4.png`, same as the login tile), C4m1r keeps the animated `user.gif`. The XP login screen records the account via `src/domain/auth/session.ts`.
- [x] XP My Computer matches Windows XP's grouping: "Hard Disk Drives" (Local Disk C:) and "Devices with Removable Storage" (3½ Floppy A:, CD Drive D:). Network Neighborhood is no longer listed under My Computer; it stays reachable through the Start menu and Places.
- [x] XP status bar counts 3 objects. Floppy and CD icons are downscaled (LANCZOS, no upscale) from the 1024 px XP sources into `src/themes/winxp/icons/devices/`; a native 32 px variant would be better if one is found.
- [x] Drives now resolve to their own theme icon (`driveIcon`) instead of the computer icon: XP uses the XP hard-disk icon, Win98 the Win98 hard-disk icon, Win2000 its 2000 drive icon.
- [x] XP Explorer has no folder tree by design (XP uses the task pane); the earlier "tree root" item is closed as not applicable.
- [ ] Windows 7 drives still use the computer icon: Win7 has no `driveIcon` registry entry yet; add one from the Win7 bank.
- [ ] Windows XP Explorer detail/list views and the XP toolbar still need a comparison with a period screenshot at native scale.

## Windows 7 drives and Computer view — 2026-11-21

- [x] Windows 7 drives use the standardized bank: Local Disk (C:) with the Windows-logo system drive, DVD drive for removable storage (`src/themes/win7/icons/devices/`, 256 px sources shown at 48 px, no copies made). Registered as `driveIcon`, `floppyDriveIcon`, `cdDriveIcon` in `win7/iconAssets.ts`.
- [x] Windows 7 Computer: window title "Computer" (not "My Computer"); Network Neighborhood no longer listed under Computer; drives are grouped under "Hard Disk Drives" and "Devices with Removable Storage" as in Windows 7. The DVD RW entry is a static item (no filesystem backing), like the Win98/2000/XP grids.
- [x] Item count wording fixed ("1 item" / "2 items").
- [x] The DVD RW Drive (D:) entry opens the Windows 7 "Drive is not ready" prompt ("Please insert a disc into DVD RW Drive (D:).") instead of doing nothing. It still has no filesystem backing.
- [ ] Windows 7 Start menu: program list and places compared against the Windows 7 default layout; site-specific entries (Wiki, Terminal, Loops, DOOM) remain as product content. A period screenshot comparison at native scale is still pending.

## Windows 7 Start menu right column — 2026-11-21

- [x] Right column follows the default Windows 7 order: Documents, Pictures, Music, Games, Computer, Control Panel, Devices and Printers, Default Programs, Help and Support, with separators after Music, Games and Devices and Printers. Videos and Network are removed; the edition subtitle is removed.
- [x] The user picture sits fully inside the panel in the top-right corner and the account name is left-aligned at the top of the column (`desktop-fidelity.css`); the places list clears the header.
- [ ] Full-scale comparison against a Windows 7 period screenshot still pending for the program list and the search row.

## Windows 2000 Start menu — 2026-11-21

- [x] Windows 2000 Start menu uses its own native shell icons from the 2000 ICO set (Programs, Accessories, Documents, Settings, Search, Help, Run, Shut Down, Windows Update, Internet Explorer), downscaled to 16 px (`src/themes/win2000/icons/start-menu/`). Win98 artwork remains only for roles not yet identified (Outlook, Calculator, Notepad, Paint, Media Player, Minesweeper, DOOM).
- [x] "Windows Update" is the first item, followed by a separator, as in Windows 2000 Professional. It has no action yet.
- [x] Log off reads "Log Off <account>..." with the account chosen at login.
- [x] Sidebar label "Windows 2000 Professional" is vertical text and fits the strip.
- [ ] Windows 2000 Start menu still needs identification of the remaining Win98 roles and a comparison with a period screenshot at native scale.

## Windows 2000 Start menu icon search — 2026-11-21

- [x] Contact sheets of the full native Windows 2000 ICO set (431 files, `eat/windows2000-main/src/assets/ICON/`) were checked for Calculator, Notepad, Paint, Outlook, Minesweeper and Media Player. The candidates in the ranges that look like app or accessory icons (104–131, 166–177, 292–311, 352–361) are folder, recycle-bin, help-book, printer or control-panel art, not those applications. The set has no confident match, so those roles keep the Windows 98 fallback. Do not assign them by eye without a period screenshot.
- [ ] Find a period screenshot or the Windows 2000 app icon set (Calculator, Notepad, Paint, Outlook Express, Windows Media Player, Minesweeper) to replace the Windows 98 fallback in the Start menu.

## Windows 2000 Start menu application icons from WinClassic — 2026-11-21

- [x] Notepad (`w2k_notepad_1`), Paint (`w2k_paint_2`) and Media Player (`w2k_mplayer32_1`, identified by eye) use native Windows 2000 16 px bitmaps from `Source Icons/w2k` in https://github.com/matthewmx86/WinClassic_icons. Stored in `src/themes/win2000/icons/start-menu/` with a README listing sources.
- [x] The WinClassic repo publishes no SVG for these roles (its SVG set is the Linux Redmond97 theme). PNG is the stored format, as the task allows.
- [ ] Calculator, Outlook Express and Minesweeper have no authentic Windows 2000 source in the repos checked (eat/, WinClassic, ClassicOS-2000-Icons, W-ICO). They keep Windows 98 artwork.
- [ ] Confirm the Media Player icon against a Windows 2000 screenshot.

## Boot screens, original system sounds and preloading — 2026-11-21

- [x] System sounds are the original Windows files: XP startup, shutdown and logoff; Windows 2000 logon (startup) and logoff (shutdown); Windows 98 startup and exit. They live in each theme's `assets/audio/`. The old `/sounds/system/*` paths pointed to files that were never in the repository, so those sounds did not play.
- [x] One boot layer (`src/themes/bootPreload.ts`) is used by every Windows-family theme. Choosing an OS in GRUB primes the wallpaper, boot logo, progress art and the Windows 7 boot video, and starts the startup sound inside the click or key press, so it plays before the boot screen appears, even with a cold cache.
- [x] If the browser blocks autoplay (autoboot without a gesture), the sound is retried on the first pointer or key press.
- [x] The desktop no longer plays the startup sound when the boot screen already did, so each boot plays it once. Checked: XP path through login and welcome plays one startup sound; Windows 98, 2000 and 7 each play their own.
- [x] Windows 7 startup, shutdown and logoff use the original default-scheme files from the Windows 7 set.
- [x] UI sounds use original files only where a matching event exists in that OS: XP (menu open, launch, minimize, restore, error), Windows 7 (menu open, minimize, restore, error). Windows 98 and 2000 have no matching UI sounds in the reference set, so those events stay silent. Missing tones are no longer synthesized in place of an original.
- [x] Non-original sound files (previous Windows 7 and 98 startup mp3) moved to `eat/original/`, outside the app.
- [ ] Verify the UI event mapping by ear against the Windows XP and Windows 7 sound schemes (launch and error names are the closest match).

## Shared sound store for all Windows-family OSes — 2026-11-21

- [x] Core original sounds for every OS are in `src/assets/os-sounds/<os>/` with one index (`index.ts`) that the theme registries read from. The set covers startup, shutdown, logon, logoff, navigation start, menu command, launch (XP), minimize, restore, error, critical stop, exclamation, notify, recycle and balloon. Rare sounds (speech, alarms, media, ring, proximity) are not kept.
- [x] Windows XP, 7, Vista, 10 and 11 have their full core set; Windows 2000 and 98 have only the sounds their reference sets provide (startup, shutdown, logoff on 98, recycle, notify).
- [x] Windows Vista, 10 and 11 are stored for future themes; they are not yet bundled, because no theme imports them (Vite tree-shakes unused asset imports).
- [ ] Windows 98 and 2000 UI events (menu, minimize, restore, error) still have no matching original sounds in their reference sets; they remain silent.
- [ ] Recycle and notify sounds are stored but not yet wired to desktop events (empty recycle bin, balloon notifications).

## Windows 2000 Start menu application icons — status — 2026-11-21

- [x] Searched the remaining sources for authentic Windows 2000 Calculator, Outlook Express and Minesweeper icons. None found: the Windows 2000 bitmaps in the sound and icon repositories checked do not include them, and the only Calculator/Outlook icon pack found is Windows 11 (wrong era, not used).
- [ ] These three keep Windows 98 artwork until a Windows 2000 screenshot or icon file is supplied.

## Program Files, desktop shortcuts, Win2000 fallback, Alarm (latest round)

- [x] Program Files: only canonical publisher folders with .exe apps (idtech, microsoft, nullsoft, c4m1r); no games/programs paths.
- [x] Desktop Игры / Программы: flat shortcut folders to doom.exe, doom2.exe, winamp.exe and the other pseudo-executables.
- [x] DOOM icons regenerated at 32/48 px from the 256 px original.
- [x] Windows 2000 icon set falls back to the Windows 98 set, not XP.
- [x] Alarm: one canonical app (appId `alarm`) for all OSes; icon per OS via `alarmIcon` (XP glyph base, Win7 window icon, Win98 generic application icon; Win2000 inherits Win98).
- [ ] Alarm icons for Win98 / Win7 / XP still need visual check against the user's screenshots.
- [x] Winamp icon for `nullsoft/winamp.exe`: `appId: 'winamp'` resolves to `winampIcon` (verify in screenshots).
- [x] snake.exe and memory.exe icons: game artwork `snakeIcon` / `memoryIcon` (theme-neutral SVG; no OS-native originals exist for them).
- [ ] Calculator, Outlook Express, Minesweeper native Win2000 icons (currently Win98 art).
- [ ] Screenshot verification: user will place references in `eat/screens/oc/<os>/` (list in `eat/screens/README.md`); each one is a check of the existing build, differences go here.
- [ ] Branch cleanup on the remote is blocked by the proxy (403); needs manual deletion or permission.

## Alarm tones

- [x] Alarm tone selection (chime, digital, siren, classic bell) per alarm and for new alarms, with preview; the chosen tone loops while an alarm rings.
- [x] Tones are generated in-house by `scripts/gen-alarm-sounds.py` (no third-party samples, so no licence obligations). Freesound/CC0 samples were not used: the shell cannot download them from this environment.

## Classic games (sketches, temporary)

- [x] Inventory of games bundled with Windows by version: `docs/classic-games.md`.
- [x] Klondike Solitaire sketch (`src/apps/games/solitaire`), registered as `solitaire` with per-OS icons; Program Files `microsoft/sol.exe`.
- [x] FreeCell sketch (`src/apps/games/freecell`), registered as `freecell` with per-OS icons; Program Files `microsoft/freecell.exe`.
- [ ] Hearts, Spider Solitaire, 3D Pinball, Reversi, Chess Titans, Internet Backgammon, Purble Place, Mahjong: not started.
- [ ] Win7 has no native FreeCell icon (XP art is used for now).

- [x] Hearts sketch (`src/apps/games/hearts`): passing, rules, computer players, round and game scoring; registered as `hearts` with per-OS icons; Program Files `microsoft/mshearts.exe`.
- [ ] Spider Solitaire, 3D Pinball, Reversi, Chess Titans, Internet Backgammon, Purble Place, Mahjong: not started.

- [x] Spider Solitaire sketch (`src/apps/games/spider`): 104 cards, same-suit runs, stock deals; registered as `spider` (XP art; Win98 `game-spider`; Win7 Solitaire stand-in); Program Files `microsoft/spider.exe` (name not verified against the original).
- [ ] 3D Pinball, Reversi, Chess Titans, Internet Backgammon, Purble Place, Mahjong: not started.

- [x] 3D Pinball sketch (`src/apps/games/pinball`): canvas physics, flippers, bumpers, plunger; registered as `pinball`; Program Files `pinball.exe` (name not verified). Icon is XP art on all OSes until 2000-specific art is sourced.
- [ ] Reversi, Chess Titans, Internet Backgammon, Purble Place, Mahjong: not started.

## Control Panel: canonical Windows 98 applet list

- [x] Win98 classic view now lists only Windows 98 applets (Accessibility Options, Add New Hardware, Add/Remove Programs, Date/Time, Desktop Themes, Display, Fonts, Game Controllers, Infrared, Internet, Keyboard, Modems, Mouse, Multimedia, Network, Passwords, Power Management, Printers, Regional Settings, Scanners and Cameras, Sounds, System, Telephony, Users). Source: Microsoft KB 149648 and the Win98 applet reference.
- [ ] Win98 applet mapping to the closest existing category is a stand-in: dedicated views (Fonts, Desktop Themes, Modems) still need their own pages.
- [ ] XP classic view still shows site extras (Task Manager, Desktop Widgets) and XP names not yet checked against a primary source.

## Explorer: menu bar per OS

- [x] Menu bar colours follow the OS: Win98 `#c0c0c0` with `#000080` selection; Win2000 `#d4d0c8` with `#0a246a` selection; XP keeps Luna beige and blue. Checked in the browser on Windows 98 (`rgb(192,192,192)`).
- [x] Win2000 menu labels confirmed against a primary-style source: File, Edit, View, Favorites, Tools, Help (no Go menu; Go To sits under View).
- [ ] Win98 menu labels are still File, Edit, View, Favorites, Tools, Help. Win98 probably has a Go menu instead of Tools; not confirmed. Check against the Win98 Explorer screenshot (`eat/screens/oc/win98/`).

## Explorer: Views menu (Win98, Win2000)

- [x] Views opens a menu (Large Icons, List, Details) on Win98 and Win2000 instead of cycling view modes; the current mode is shown in bold. Checked in the browser on Windows 98. XP and other OSes keep the cycle until their Views menus are confirmed.
- [ ] Small Icons (Win98 and Win2000 Views menu) is not modelled: the explorer has only icons, list and details modes.

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
- Not changed yet: per the rule, these differences are recorded first; the next Backgammon change follows this list.
