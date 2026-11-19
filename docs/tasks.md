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
| RSS | 60–65% | Cumulative cache/deduplication and refresh/filter behavior still need runtime proof |
| DOOM | 30% | Current iframe integration cannot detect many remote failures; no verified local playable build |
| Other games | 40% | Native Snake/Memory/Minesweeper exist; inventory and new games remain |
| Explorer / Games folder | 55% | Games folder is routed through Explorer, but native OS presentation and XP folder icon need checking |
| My Documents | 45% | Canonical virtual folder exists; duplicate shortcuts and navigation need cleanup/verification |
| My Pictures | 40% | Gallery mapping is partial; complete file inventory and normal folder behavior remain |
| Picture Viewer | 55% | Shared viewer direction exists; grid/single-image parity and file associations need completion |
| Control Panel | 45% | Entry points exist; categories, settings navigation and OS-native presentation remain |
| OS-specific Explorer / Control Panel | 35% | Dedicated styles exist for some systems; others still need authentic native layouts |
| Widgets desktop shortcut | 20% | Widget Gallery is reachable elsewhere; dedicated shortcut must open the same canonical manager |
| Appearance & Themes | 45% | Shared image inventory and persistence/preview need verification |

Percentages are working estimates, not test results. The previous task registry and audit snapshot are preserved in [history.md](./history.md).

## P0 — Current implementation priorities

### WEBOS-01 — Desktop and widget placement contract
- WebOS is the only OS where widgets are enabled by default. All other OS profiles start with widgets disabled; users may enable them deliberately.
- WebOS initially displays the agreed set of 8 widgets on the right side in 2 columns.
- Define exactly 3 supported widget size classes (small/medium/large) with shared dimensions, spacing and breakpoint rules.
- Every widget must adapt its internal layout to the selected size. No clipped controls, overflow beyond viewport, hidden playback controls or inaccessible resize/drag handles. Winamp is a mandatory regression case.
- Keep placement, visibility and size settings coherent across reloads and OS changes; do not unexpectedly enable widgets in another OS.
- Source fix now separates defaults: non-WebOS visibility defaults are all false; the WebOS widget canvas retains its eight-widget enabled default. Apple/non-WebOS widget persistence moved to a v2 key so stale v1 values from the previous faulty behavior cannot re-enable widgets. Runtime acceptance is still pending.
- Acceptance: desktop and mobile-width checks; all 8 widgets fit; 3 size classes are consistent; Winamp remains fully usable in every supported size.

### RSS-01 — Durable RSS cache and feed controls
- Preserve accumulated cached articles across refreshes; deduplicate by stable article identity (canonical URL/GUID with safe fallback).
- Sort newest-first; do not erase older cached entries when a feed temporarily returns fewer items or fails.
- Category filter lives inside the News RSS Feed application, not as a detached desktop widget/control.
- Provide clear loading, stale-cache, refresh success/failure and empty states; show cache freshness and source errors honestly.
- Acceptance: repeated refresh, duplicate feeds, partial feed outage, empty feed and category filtering do not destroy cached history.

### GAME-01 — DOOM: repair the launch experience and verify actual gameplay
- Audit `src/apps/doom/`, app registration and launch routes. Current `DoomPlayer` embeds Emupedia URLs; iframe `onLoad`/ `onError` cannot establish that the game engine booted or that gameplay is available.
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

### CONTROL-01 — Control Panel category architecture
- Provide OS-appropriate categories: System/Performance, Appearance & Themes/Personalization, Network & Internet, Hardware & Sound, Programs/Applications, User Accounts and Accessibility. Adapt names, grouping and layout to each OS rather than forcing a modern generic panel.
- Task Manager belongs under System/Performance and remains accessible in Classic View.
- Categories must navigate to functioning settings/apps; no dead placeholder cards.

### CONTROL-02 — Desktop shortcuts and canonical settings surfaces
- Provide a desktop shortcut to Control Panel and a separate shortcut to the existing Widgets/Widget Gallery manager.
- Both shortcuts must open the same canonical surfaces used by Start Menu/context menus; no duplicate managers or divergent settings state.

### CONTROL-03 — OS-native Explorer and Control Panel fidelity
- Restore authentic OS-specific window chrome, typography, icons, toolbar/address/navigation, menus, category layouts, spacing and responsive behavior.
- Validate Windows XP, Windows 98/2000, Windows 7, macOS, Ubuntu/Arch and WebOS independently. Shared functionality must not flatten their visual identities.

### THEMES-01 — Complete Appearance & Themes image inventory
- Expose every image in the site's shared gallery in Appearance & Themes, not only the wallpaper subset.
- Provide previews, grouping, fit/fill positioning, apply/cancel and persistence across OS profile switch/reload.
- Reuse the same canonical inventory as My Pictures/Picture Viewer.

## P1 — Quality, integration and regression

### OS-FIDELITY-01 — Cross-OS visual acceptance matrix
- For every app used across OS profiles, define shared functional contract plus OS-specific presentation adapters.
- Verify window frame, titlebar controls, toolbar, menus, typography, spacing, icons, selected/hover/focus/disabled states, scrolling, empty/error/loading states and responsive behavior.
- No app should inherit a Windows XP/98 frame or generic white card in macOS/Linux/WebOS unless intentionally part of that OS.
- Maintain visual checklist in [os-skin-visual-checklist.md](./os-skin-visual-checklist.md).

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
| `npm run verify` | Not run in this documentation pass | Must run after code changes |
| `npm run typecheck` | Not run in this documentation pass | Must run after code changes |
| `npm run lint` | Not run in this documentation pass | Must run after code changes |
| `npm run build` | Not run in this documentation pass | Must run after code changes |
| `git diff --check` | Not run in this documentation pass | Must run after code changes |
| Browser/manual OS matrix | Not run | Requires real runtime review |

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
