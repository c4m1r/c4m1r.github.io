# WebOS & Multi-OS Engineering — Active Task Registry

> **Single source of truth for active work.** Keep this file current; move completed, superseded, obsolete or inactive task detail to [history.md](./history.md), never discard it. Agent handoff, verified paths, source/licence notes and research cache: [agents.md](./agents.md).

## Working rules

- Work directly on `main`; do not create a feature branch unless explicitly requested.
- One shared application/domain implementation where possible; adapt presentation through OS-specific skins and shell integrations. Do not fork app logic just to change appearance.
- Authentic OS identity is a requirement, not decorative polish: window chrome, typography, spacing, icons, menus, toolbars, taskbar/dock/panel, focus/hover/disabled states and navigation must match the active OS.
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

- 2026-11-19 source pass: Desktop icons now follow the agreed shell layout: My Computer, My Documents, Games and Programs; per-application shortcuts have been removed from the desktop and remain available through Start / Programs. The WebOS widget-gallery desktop entry remains non-Windows only. Browser navigation acceptance remains pending.

- 2026-11-19 follow-up: deduplicated Games/Programs desktop icons (the FileSystem keeps targetPath aliases for compatibility, but the shell no longer renders those aliases beside canonical system icons). Windows 7 slideshow now passes both the image collection and current directory path. Winamp titlebar and stacking interactions now use Pointer Events consistently for mouse/touch/pen. CI logs from the earlier attempt exposed these typing/import issues; fixes are in main and awaiting a fresh full run.

- 2026-11-19: Widget Gallery now exposes the **Classic Winamp** player as a separate on/off entry from the compact **Winamp Now Playing** widget. The entry reflects whether `app:winamp` is open and toggles that window directly; it intentionally has no desktop-widget size preset because it is a draggable multi-window application, not a canvas widget. Verify open/close synchronization and touch dragging in browser acceptance.

- 2026-11-19 validation: GitHub Actions run `44544169344` completed successfully for commit `f345649d9b2922573f72e9202be45790c148bcf1` (build and deploy jobs both successful). This validates that source changes through that commit typecheck, lint, build and deploy. The separate Classic Winamp Gallery toggle was added after the previous validation and must be included in a subsequent run.

- 2026-11-19: Windows 7 Start Menu > All Programs had a duplicate Notepad entry because Notepad was already included in the pinned/programs base list and was appended a second time. Removed the redundant entry; browser verification of Start Menu navigation and app launches remains pending.

- 2026-11-19: Fixed Windows 7 Start Menu library targets. The menu previously pointed to `C:\Users\C4m1r\Documents`, `Pictures`, and `Music`, but the shared virtual filesystem exposes the profile's canonical `My Documents\My Pictures` and `My Documents\My Music` children. Start Menu shortcuts now target those actual shared nodes; this prevents navigation to empty/nonexistent paths. Validate all three links in-browser.
- 2026-11-19: Added direct **My Videos / Мои видеозаписи** navigation to the Windows 7, XP and 98/2000 Start Menu places lists. All three entries resolve to the existing shared `My Videos` folder under the C4m1r profile; no media files or folder data are duplicated. Verify navigation and video-file opening in browser acceptance.
- 2026-11-19: Fixed a widget-preference default leak: the shared visibility loader previously fell back to WebOS's all-enabled defaults regardless of the active OS. Non-WebOS shells now start with every desktop widget disabled, WebOS retains its all-enabled initial layout, and saved visibility is isolated per OS. Switching OS themes reloads that OS's saved state. Browser acceptance is still required, especially fresh-storage defaults, theme switching, and gallery toggles.
