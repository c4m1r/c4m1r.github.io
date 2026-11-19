# AI Agent Engineering & Operation Guide: `c4m1r.github.io`

> **Scope**: Master specification and instructions for AI agents and automated assistants developing, maintaining, and enhancing the `c4m1r.github.io` multi-OS simulation ecosystem.

---

## 1. Project Philosophy & System Overview

`c4m1r.github.io` is an interactive multi-operating system simulation environment, retro computing showcase, and portfolio built with **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS**.

### Key Tenets
1. **Zero External Build Dependencies**: The production build must never depend on external repositories or `/eat/`. All assets (audio, icons, fonts, stylesheets) are copied directly into `src/`.
2. **Authenticity Over Mockery**: Retro OS skins (Windows XP Luna, Windows 98 Classic, Windows 7 Aero Glass, Apple Aqua/macOS, iOS, Ubuntu) must recreate genuine animations, bevels, typography, audio cues, and layout behaviors.
3. **Non-Commercial Nostalgia Scope**: All retro operating system emulations, themes, sound effects, and icons are fan/historical demonstrations. No compliance checks or legal disclaimer modifications are needed beyond preserving the author's portfolio metadata.
4. **Strict Verification Gates**: No task is complete without passing all 5 gates:
   - `npm run verify` (Context boundary & identity integrity)
   - `npm run typecheck` (`tsc --noEmit -p tsconfig.app.json` with 0 errors)
   - `npm run lint` (`eslint .` with 0 errors)
   - `npm run build` (`vite build` production compilation)
   - `git diff --check` (Zero trailing whitespace or merge residue)

---

## 2. Architecture & File System Map

```
c4m1r-github/
├── docs/                        # Engineering specifications, audits, task logs
│   ├── agents.md               # This agent operational guide
│   ├── architecture.md         # System architecture & lifecycle map
│   ├── donor-absorption-audit.md # Verification matrix for /eat/ donor repos
│   ├── tasks.md                # Master backlog & progress tracking
│   └── os-skin-visual-checklist.md # Visual fidelity criteria per OS
├── src/
│   ├── apps/                   # Self-contained desktop applications
│   │   ├── winamp/             # Winamp 2.x player, EQ, playlist, audio analyzer
│   │   ├── loops/              # 0chan loop visualizer, reactive cells & chpok sound
│   │   ├── mediaplayer/        # WMP classic audio player & 57-track playlist
│   │   ├── explorer/           # My Computer, file navigator, drives
│   │   ├── terminal/           # Interactive bash-like CLI shell
│   │   ├── outlook/            # Outlook Express client
│   │   └── blog/               # Markdown-powered blog viewer
│   ├── domain/                 # Domain logic & services
│   │   ├── auth/               # Credential verification & XOR/SHA-256 tokens
│   │   ├── assets/             # Asset resolvers and path utilities
│   │   ├── search/             # Global system search engine
│   │   └── resume/             # Multilingual curriculum vitae data
│   ├── contexts/               # React Context Providers
│   │   ├── AppContext.tsx      # System mode (grub|webos|blog|terminal), theme, language
│   │   └── WeatherContext.tsx  # Dynamic weather simulation & particle effects
│   ├── shells/                 # Shell renderers & desktop managers
│   │   ├── desktop/            # DesktopShell, WindowManager, taskbar, start menu
│   │   └── os/                 # OS skin classifiers, class names, and registry
│   ├── styles/                 # Global styles & theme stylesheets
│   │   └── os/themes/          # Dedicated CSS per OS (win7, classic, ubuntu, macos)
│   ├── themes/                 # Full OS theme packages
│   │   ├── winxp/              # Windows XP Luna: boot, login, welcome, sounds, css
│   │   ├── win7/               # Windows 7 Aero: glowing boot orb, login, glass css
│   │   ├── webos/              # WebOS container: boots, login, welcome, transitions
│   │   └── apple/              # macOS / iOS lock screens & session screens
│   └── i18n/                   # Multilingual translation dictionaries (ru, en, etc.)
```

---

## 3. Operating System Themes & Lifecycles

Every full desktop OS in `src/themes/` operates via a multi-phase state machine:

```
[Grub Menu / Boot Picker]
        │
        ▼ (setMode('webos') + setTheme(themeId))
  [BootScreen] ──── (onComplete after progress / animation) ───┐
                                                                │
                                                                ▼
                                                          [LoginScreen]
                                                                │
                                                   (User authenticates account)
                                                                ▼
                                                         [WelcomeScreen]
                                                                │
                                                   (onComplete after sound/chime)
                                                                ▼
                                                        [DesktopShell]
                                                       (Windows, Apps, Tray)
                                                                │
                                   ┌────────────────────────────┴───────────────────────────┐
                                   ▼                                                        ▼
                        [SystemTransitionScreen: logoff]                 [SystemTransitionScreen: shutdown]
                                   │                                                        │
                                   ▼                                                        ▼
                             [LoginScreen]                                             [Grub Menu]
```

### OS Theme Registry:
- **`win-xp`**: Windows XP Professional (Luna Blue theme, authentic sound synthesis, Start menu with pinned/recent programs, Explorer task pane).
- **`webos`**: Standard WebOS suite with modular boot, login, and desktop launcher, featuring the `loops` application.
- **`win-98`**: Classic teal (`#008080`) desktop, 3D beveled windows, Start Menu with retro icons, classic login dialog.
- **`win7`**: Windows 7 Aero Glass, glowing four-color orb boot screen, blur taskbar, glass window headers.
- **`macos` / `apple`**: Aqua / Ventura styling, Apple system top bar, dock with bouncing icons, blurred notification center.
- **`ubuntu` / `arch`**: Linux styling with Yaru dark theme / terminal-centric desktop.

---

## 4. Authentication & Security Engine

Credentials and account authorization are managed by `src/domain/auth/credentials.ts`:
- Authentication implementation is in `src/domain/auth/credentials.ts`.
- Never copy credential tokens, hashes, salts, password material or account-specific secrets into documentation, commit messages, issues or logs.
- Client-side obfuscation is not a security boundary. Do not describe browser-bundled credentials as secure against a determined user; treat this as a demo gate, not production authentication.

---

## 5. Standard Operating Rules for AI Agents

1. **Do Not Poll**: When running background commands or timers, allow reactive notification wakeups. Do not poll in busy loops.
2. **Never Import from `/eat/`**:
   - `eat/` is gitignored and contains reference donor repos.
   - When absorbing assets, copy them to `src/themes/<theme>/assets/` or `src/apps/<app>/assets/` and import them locally.
3. **Preserve Comments & Docstrings**: Never strip existing Russian or English explanatory comments in unaffected regions.
4. **TypeScript Strictness**:
   - No implicit `any`.
   - Never suppress type errors with `@ts-ignore` unless unavoidable third-party library limitations require `@ts-expect-error` with rationale.
5. **Vite Asset Resolution**:
   - Audio files: `import soundUrl from './assets/sound.mp3'` (resolves to Vite static URL).
   - Icons: `.png`, `.svg`, and `.ico` can be imported directly and assigned to `img.src`.
   - Vertical sliders: Avoid `orient="vertical"` attribute (unsupported by React HTML input typing). Use CSS `appearance: slider-vertical; -webkit-appearance: slider-vertical;`.
6. **Task Tracking**:
   - Document all completed tasks in `docs/tasks.md` using the canonical task schema (`TASK-XXX-YY`).

---

## 6. Testing & Quality Assurance Commands

Always execute the complete gate verification prior to completing any agent session:

```bash
# 1. Typecheck the entire TypeScript codebase
npm run typecheck

# 2. Run ESLint across all source files
npm run lint

# 3. Compile the production bundle via Vite
npm run build

# 4. Clean up dist artifacts
npm run clean

# 5. Verify Context boundaries
npm run verify

# 6. Check for git whitespace residue
git diff --check
```


---

## 7. Current project handoff — 2026-11-19

### Canonical documentation locations
- Active task registry: [tasks.md](./tasks.md). Do not create or maintain a root-level `tasks.md`.
- Historical task snapshots and superseded plans: [history.md](./history.md).
- Operational handoff, research notes and source cache: this file.
- System architecture: [architecture.md](./architecture.md).
- OS-specific visual acceptance: [os-skin-visual-checklist.md](./os-skin-visual-checklist.md).
- Donor source and licence audit: [donor-absorption-audit.md](./donor-absorption-audit.md) — note that parts of this document contain stale/overstated completion claims and must be corrected against the current repository tree.

### Verified repository baseline
- Branch: `main`.
- Inspected head before documentation consolidation: `617b2ee75baef787b331965b79bcee6fa637c66f`.
- Documentation consolidation commits: `6a857d268494103103bbeff3d3a7f5d4cd5763ab` (history), `738962164069edbc98e635ef197f3a4c6f62f34a` (tasks), `c9417d7ba3c03634dd558525e75a06e3a5506cd7` (agents).
- DOOM launch UX hardening commit: `b0d989789ff06c688be78270aca3b2c3ceea7cc8`.
- Games catalogue correction commit: `811ea2862e65aa7344247a428d30175851ed7937`.
- No root `tasks.md` exists. The canonical file is `docs/tasks.md`.
- `/eat/` is present in the Git tree. Do not repeat historical claims that all donor folders were removed.
- Runtime stack from `package.json`: React 18, TypeScript, Vite 7, Tailwind 3.4. No Next.js runtime should be introduced to absorb donor components.
- Available scripts: `npm run verify`, `npm run typecheck`, `npm run lint`, `npm run build`, `npm run clean`, `npm run build:clean`.

### Verified code entry points
- App registry: `src/shells/desktop/appRegistry.tsx`.
- Desktop shortcuts: `src/shells/desktop/shortcutsRegistry.ts`.
- OS skin rules and app naming/visibility: `src/shells/os/osSkins.ts`.
- Doom player: `src/apps/doom/DoomPlayer.tsx`.
- Doom variants and Emupedia URLs: `src/apps/doom/config.ts`.
- Games folder surface: `src/apps/games/GamesFolder.tsx`.
- Native games: `src/apps/games/SnakeGame.tsx`, `src/apps/games/MemoryGame.tsx`, `src/apps/minesweeper/`.
- Existing chess audio assets: `src/assets/audio/chess/`.

### Source and donor cache
- `eat/alanagoyal-main`: MIT licence was found in prior audit. Candidate Chess/Solo Games source uses chess.js and includes Supabase-backed functionality. Reuse only isolated client-side logic after exact import/asset review; do not bring in API routes, Supabase or multiplayer backend. Audit sound and image assets separately.
- `eat/windows7-ui-portfolio-main`: MIT licence was found in prior audit. Candidate `components/apps/Chess.tsx`, `Solitaire.tsx`; inspect exact imports, CSS, assets and dependencies before adaptation. Extract components, not the Next/React/Tailwind application.
- `eat/Personal-Portfolio-main`: Memory/Snake donor files exist; no root licence was found in prior audit. Native implementations in `src/` remain canonical.
- `eat/wins95Portfolio-main`: Minesweeper donor exists; native Minesweeper remains canonical. Check source and asset terms before reuse.
- `eat/98.portfolio-main`: custom Three.js game branded 98.DOOM; not id Software DOOM. No root licence was found in prior audit. Do not port code/art without permission.
- The earlier task registry contains a source audit snapshot; see [history.md](./history.md). Audit findings are leads, not legal clearance.

### DOOM integration warning
- Current `DoomPlayer` embeds remote Emupedia pages. An iframe `load` event only means navigation completed; it does not prove the engine initialized or gameplay works. `onError` does not reliably report remote HTTP errors, CSP/X-Frame-Options blocking or in-page failures.
- Do not use iframe load state as a playable-success signal. Show the direct external launch path and explicitly communicate that embedded availability is unverified.
- Doom 3 is WIP and must remain unavailable/unverified until manual gameplay verification.
- Manual verification checklist: gameplay starts; keyboard/mouse input; pointer lock acquire/release; sound; resize; restart; failure recovery; tested browser/device and selected build.

### Multi-OS design implementation rule
Build one application contract and share state/behavior, but render through OS-specific presentation layers. For each surface, check:
1. Window chrome/titlebar and controls.
2. Toolbar/address/navigation/sidebar conventions.
3. Typography, font metrics, spacing and density.
4. Native iconography and file/folder affordances.
5. Menus, context menus, selection and focus behavior.
6. Loading, empty, error and disabled states.
7. Responsive constraints and keyboard/touch input.

Do not solve cross-OS styling by applying one generic frame. Keep explicit visual acceptance per Windows XP, Windows 98/2000, Windows 7, macOS, Ubuntu/Arch and WebOS. Refer to `os-skin-visual-checklist.md`.

### Work sequence / handoff
1. Keep the active registry in `docs/tasks.md` aligned with user requirements.
2. Repair DOOM launch truthfulness and error/recovery UX before adding another unverified engine.
3. Review Chess/Solitaire donor components and licenses, then integrate the smallest suitable self-contained game.
4. Make Games a normal virtual folder with active OS Explorer rendering.
5. Complete My Documents and My Pictures/Viewer around canonical shared inventories.
6. Complete Control Panel and Widgets shortcuts, then run the full OS visual matrix.
7. Run all repository quality gates; record exact results and commit SHA here and in the active registry.

### Research/cache hygiene
- Record only verified findings. For each external/donor source include URL/path, retrieval date, licence file and copyright holder, files actually reused, dependencies, and unresolved questions.
- Re-check URLs and remote host behavior before relying on them; do not treat old cache entries as current availability.
- Never cache credentials, personal secrets, access tokens or raw user data in this file.


### Latest implementation note — DOOM embed status
- File changed: `src/apps/doom/DoomPlayer.tsx`.
- The UI now distinguishes iframe navigation from actual game startup. A completed iframe load is explicitly described as unverified; a direct link to the selected build is always available.
- Embedded navigation failure copy no longer promises that direct launch will necessarily work; it says the external route still needs checking.
- This is a UX truthfulness/recovery improvement, **not** a verified playable DOOM implementation. Keep GAME-01 at 30% until actual gameplay is manually tested.
- No local typecheck/lint/build/browser test was run in this connector-only pass.


### Latest implementation note — Games folder truthfulness
- File changed: `src/utils/FileSystem.ts`.
- Removed the `DOOM 3` WIP item from the normal Program Files/Games folder. The app's WIP config remains in source, but the folder no longer advertises it alongside the playable titles.
- No replacement title was added in this pass. Chess/Solitaire donor review found the Windows 7 Solitaire component has an unused donor store import, a hard minimum board width of 700px and mouse-only interactions; it is not safe to copy wholesale. Its donor repo has an MIT licence, but component assets/imports and adaptation still need review.
- Chess donor component requires `chess.js`, which is not in this repository's `package.json`; do not add the donor framework or assume the dependency is present.


### Latest implementation note — Explorer OS presentation pass
- Game folder icon in `src/utils/FileSystem.ts` now imports `src/themes/winxp/assets/icons/My Games.png` instead of the generic `folder_program.png`. This is a dedicated XP My Games asset already present in the repository.
- `src/apps/explorer/MyComputer.tsx` shared Legacy Explorer root now exposes `data-os-theme={theme}` and stable `file-explorer` classes. Existing XP selectors remain compatible because the original utility classes are retained.
- `src/styles/os/themes/winxp-explorer-fidelity.css` now includes first-pass direct theme styles for `win-98` (classic grey, beveled controls, compact Tahoma) and `webos` (dark neutral modern surface).
- `src/apps/explorer/ExplorerSurface.tsx` currently routes Windows 7 to its dedicated Explorer and macOS/iOS to its Finder-like branch in `MyComputer`; other profiles use the shared Legacy Explorer.
- Known limitation: Windows 98 first-pass skin still reuses XP toolbar image assets imported by `MyComputer.tsx`; its chrome is differentiated but iconography/toolbars are not yet fully native. The generic Legacy Explorer is still used for Linux profiles; do not count full OS fidelity complete.
- Do not increase OS-specific Explorer progress percentage yet. The new styling is a first pass and needs runtime review at desktop/mobile widths and across each OS profile.
- Relevant commits: `4e485592d880f37ca8cb4ad133b7b46d237e5e99` (XP My Games icon), `a022c4f396bbac75475d2ff4fca3f5801af4b7a0` (Explorer theme metadata), `906eef11a5491b3f6c82aa46ce6e530f75c3de1c` (Win98/WebOS Explorer skin pass).


### Latest implementation note — shared Explorer skin adapters
- Reused the existing `ExplorerSurface` routing and `data-os-theme` root attribute; no new skin registry or duplicate Explorer component was introduced.
- `src/apps/explorer/MyComputer.tsx` now resolves folder/drive/address icons for Win98 and Windows 2000 from the site's existing `src/themes/win98/assets/icons/` collection. XP retains its XP toolbar assets; classic profiles use classic controls rather than XP bitmap toolbar images.
- Added `src/styles/os/themes/explorer-os-adapters.css` and imported it from `src/styles/os/index.css`. It defines separate presentation adapters for Win98, Windows 2000, Ubuntu, Arch and WebOS. Navigation, file operations and selection remain shared.
- Removed the earlier Win98/WebOS adapter block from `winxp-explorer-fidelity.css` so that file is again XP-specific.
- Important limitation: the shared Legacy Explorer still does not implement a Linux tree/sidebar or a fully native Nautilus/Thunar interaction model; the current Linux work is a theme adapter, not full parity. Win98/2000 toolbar icons are still vector controls rather than a complete historical bitmap toolbar.
- No runtime, typecheck, lint or build verification was performed in this connector-only change. Keep task progress conservative until browser checks cover all OS profiles and narrow layouts.


### Latest implementation note — Explorer search and path correction
- `src/apps/explorer/MyComputer.tsx`: Search toolbar action toggles a current-folder filter row. It filters the same virtual filesystem items in icon/thumbnail/details modes; it does not mutate data. Escape closes search.
- Canonical C: root is normalized to `C:\\`; navigating into a child from a drive root now inserts the path separator. Up navigation returns from C: root to My Computer and from a first-level C: folder to C:\\.
- Address lookup now compares path keys/names case-insensitively. Adjacent duplicate navigation history entries are suppressed.
- This pass did not implement the shared folder tree yet. Do not claim tree/sidebar completion. Search is current-folder-only, not recursive/global.
- No tests/build/browser verification were run. Next agent should inspect the final diff and run quality gates before extending the Explorer tree.


### Explorer folder-tree follow-up
- Added a collapsible tree in `src/apps/explorer/MyComputer.tsx` for non-XP/non-Apple Legacy Explorer profiles. It recursively renders only folder/drive nodes from `initialFileSystem['My Computer']`; no duplicate tree data is maintained.
- Tree labels navigate through the same `navigateToPath` callback. Disclosure controls only affect local expansion state. The existing Folders toolbar toggle shows/hides this tree in non-XP Legacy profiles.
- Tree visual skin still needs per-OS refinement and narrow-screen validation. XP retains its established task pane; Apple remains on its Finder sidebar.
- Do not count this as fully verified until click paths, deep nested folders, collapsed/expanded state and responsive behavior are browser-tested.


### Explorer sidebar skin note
- `src/styles/os/themes/explorer-os-adapters.css` now styles the new shared folder tree separately for Win98/2000, Ubuntu, Arch and WebOS.
- Updated body selectors to target the stable `.flex-1` body wrapper instead of relying on its child index, because the optional Search row adds a sibling before the body and otherwise breaks theme selectors when search is open.


### Session handoff — 2026-11-19 Explorer follow-through
- Current branch remains `main`; no feature branch created.
- Latest verified HEAD before this handoff update: `2f14fb64405977f09e09a609b54842144f3cc09a`.
- Work in this pass: current-folder search; C: root normalization and child-path separator fix; case-insensitive address path resolution; duplicate adjacent history suppression; recursive virtual folder tree for non-XP/non-Apple Legacy Explorer; per-profile tree sidebar CSS for Win98/2000, Ubuntu, Arch and WebOS.
- Relevant implementation files: `src/apps/explorer/MyComputer.tsx`, `src/styles/os/themes/explorer-os-adapters.css`; task tracking in `docs/tasks.md`.
- The folder tree reads the existing `initialFileSystem` and does not maintain a parallel filesystem. Search filters only the current folder. Apple Finder and XP task-pane paths remain separate.
- CSS selectors for the Explorer body now target its stable `.flex-1` wrapper rather than positional child index; the optional search row otherwise shifts body position and can break skin targeting.
- Remaining gaps: no recursive/global search; XP does not yet expose a classic left folder tree; tree/sidebar needs visual and mobile-width review; full Win98/2000 toolbar bitmap fidelity remains incomplete; Linux interaction model is not full Nautilus/Thunar parity.
- Verification: GitHub combined status returned `statuses: []`; no local npm scripts or browser session were available/run. Do not infer CI success. Run `npm run verify`, `npm run typecheck`, `npm run lint`, `npm run build` and `git diff --check` before declaring this work verified.


### User-reported desktop / Start Menu / Pictures regression pass — 2026-11-19
- Branch: main; no feature branch.
- Source baseline inspected: 0fc60199c127ae52b06e2b65c499f22ca24a5b91. Latest implementation commit at the end of the first fix pass: f6bc699452ad794102637e0ae3f254b40800021d. Subsequent Windows 7 Explorer and desktop-shortcut follow-through is committed at fe600bcde840f3efe09ade1b04e87d0fee2f8449.
- Widget defaults:
  - src/system/widgets/types.ts: DEFAULT_WIDGETS_VISIBILITY is now all false; WEBOS_DEFAULT_WIDGETS_VISIBILITY is all true and is used only by the WebOS widget canvas/storage reader.
  - src/shells/desktop/DesktopShellContainer.tsx: Apple/non-WebOS widget visibility moved from storage key desktop-apple-widget-visibility-v1 to v2. This intentionally ignores old v1 values left by the prior behavior; all non-WebOS widgets start off unless explicitly enabled under v2.
  - WebOS continues to render its own widget canvas with the eight enabled defaults. The Widget Gallery remains the shared settings surface.
- Start Menu:
  - src/shells/desktop/components/start-menu/StartMenu98.tsx previously accepted only close/system callbacks; all ordinary entries were inert. It now routes Programs/Favorites/Documents/Settings/Find/Help/Run/Computer/My Pictures through the existing onOpenPath and onLaunchApp callbacks.
  - XP and Windows 7 Start Menu Pictures paths were aligned with the canonical folder location described below.
- My Documents:
  - src/shells/desktop/DesktopShellContainer.tsx now includes a desktop My Documents shortcut and handles its double-click by opening the shared Explorer at the canonical profile path.
  - The desktop shortcut path was inspected after correcting source escaping; it is a normal Windows path literal, not a path containing doubled runtime separators.
- My Pictures / Picture Viewer:
  - src/utils/FileSystem.ts: My Pictures is now nested inside My Documents, matching the Windows XP profile layout. My Music was added because the existing XP/7 Start Menu shortcuts referenced it but the folder was absent.
  - StartMenuXP.tsx, StartMenu7.tsx and StartMenu98.tsx route My Pictures to the nested canonical profile path C:\\Documents and Settings\\C4m1r\\My Documents\\My Pictures.
  - Folder display name is Мои рисунки; MyComputer.tsx recognizes both English and Russian path text and switches the folder to thumbnails mode. This is still the same canonical filesystem, not a parallel gallery.
  - appRegistry.tsx: app id pictures now displays as Picture Viewer / Просмотр изображений, while the actual folder remains My Pictures / Мои рисунки.
  - PictureViewer.tsx: if an image opened from Explorer is not in the gallery hook result, it is prepended to the active viewer list so the requested image can still be displayed.
- Important review notes:
  - Start Menu XP/7 and classic callbacks are source-wired, but no browser interaction test was available; do not claim verified behavior.
  - Verify desktop My Documents icon placement in every supported shell. macOS Finder already has a Documents sidebar item; this desktop shortcut is added to non-macOS profiles.
  - Verify that the Picture Viewer gallery hook and content/pictures glob cover the same intended inventory. The fallback only ensures the specifically opened image appears; it does not prove inventory parity.
  - Check that the current image selected from the Explorer thumbnail view opens in the expected viewer window and that Back/Forward and slideshow remain coherent.
- Verification: no local npm run verify, npm run typecheck, npm run lint, npm run build, or browser/manual OS matrix was run in this connector-only pass. GitHub combined status was not queried for the final commit. Do not claim CI success.
- Next work: continue Explorer behavior/fidelity (especially XP task pane and classic folder tree), then complete Picture Viewer inventory parity and appearance integration; continue Control Panel and widget shortcut unification. Keep docs/tasks.md and this handoff updated after each meaningful pass.


### Follow-through — Windows 7 Pictures and desktop shortcut cleanup — 2026-11-19
- Windows 7 has its own Explorer implementation, so changing the shared XP-era Start Menu path was not sufficient. src/apps/explorer/Windows7Explorer.tsx had a separate PATHS.pictures value pointing to the old sibling folder. It now points to My Documents/My Pictures, matching the canonical virtual filesystem.
- Windows 7 Explorer now recognizes English and Russian My Pictures path text and enters a thumbnail view. The view control cycles Icons → Thumbnails → Details; styles are in src/styles/os/themes/windows-shell-fidelity-final.css.
- Desktop shortcuts: src/shells/desktop/shortcutsRegistry.ts no longer places Projects, Wiki, Notepad or About as standalone desktop app shortcuts because these entries already live inside My Documents. Blog remains a desktop app shortcut because it is separate from the My Documents canonical set. The app registry and Start Menu routes remain intact.
- These are source-level changes only. Confirm click navigation, thumbnail loading, file opening and Windows 7 responsive layout in a browser before increasing task completion estimates.


### XP Explorer Pictures navigation follow-through — 2026-11-19
- src/apps/explorer/MyComputer.tsx now includes My Pictures / Мои рисунки in the Windows XP task pane's Other Places group, using the same canonical nested path under My Documents.
- The XP Picture Tasks filter now includes WebP as well as PNG/JPEG/GIF. The image file association already supports WebP in DesktopShellContainer.
- At this handoff point, the XP task-pane slideshow action was still opening only the first matching image; see the subsequent slideshow wiring note below.
- Latest source implementation commit before slideshow wiring: 3b28ee4d60c6f84222f93dde4b4a75a000d34560. No local build/typecheck/lint/browser tests were run.


### Picture Viewer slideshow wiring — 2026-11-19
- src/apps/pictureview/PictureViewer.tsx now accepts startSlideshow and initializes its existing slideshow state from that prop.
- src/apps/explorer/MyComputer.tsx exposes onOpenSlideshow and passes all current-folder image files (PNG/JPEG/GIF/WebP with resolved content URLs) to the callback from the XP Picture Tasks action.
- src/shells/desktop/DesktopShellContainer.tsx creates a normal resizable Picture Viewer window with the folder image list and startSlideshow enabled. The action now starts the existing 3-second slideshow timer; it does not create a second viewer implementation.
- Latest source implementation commit: 8e1f8cb0ff6594ea6b2a8fa169e9d99e0720de05. No local typecheck/lint/build/browser tests were run; manually verify pause/resume, next/previous, closing the slideshow window and a one-image folder.


### Explorer folder-title localization — 2026-11-19
- src/shells/desktop/DesktopShellContainer.tsx now resolves Russian window titles for My Documents, My Pictures and My Music when Start Menu paths use the canonical English filesystem keys. The underlying paths remain unchanged; this is display-only localization.
- Latest source implementation commit: 688e3d5d7d5e249b9c5e1e6c3584deb38e6ddbd4. The subsequent docs-only commit updates this handoff. No local typecheck/lint/build/browser verification was run.


### Final source consistency note — 2026-11-19
- src/shells/desktop/DesktopShellContainer.tsx now includes themeKey in openExplorerWindow dependencies. The callback chooses Windows7Explorer vs shared MyComputer using themeKey; keeping it in the dependency list prevents a stale shell renderer after an in-place theme change.
- Latest source implementation commit: 0bdc4711d984243e7e8593a6d91facb48c7c884d. Docs-only follow-up commits may advance main afterward.
- The source tree was reviewed for the canonical nested My Pictures path across XP, Windows 7 and Windows 98/2000 entry points. GitHub code-search excerpts can lag; direct main-branch file fetches are the source of truth.
- Verification remains source-only: no local typecheck, lint, build, verify or browser/manual test was run.


### Latest implementation handoff — Unified Calendar Center audit (2026-11-19)
- User requested that the three calendar entry points become one shared center without losing their current features or visual identity: desktop widget, taskbar clock flyout and full Calendar app.
- Source inspection on `main`: `src/apps/calendar/CalendarApp.tsx` currently loads locale-specific bundled ICS data and renders a read-only month grid; it owns local month/year state. `src/shells/desktop/components/AppleDesktopWidgets.tsx` independently builds a month grid and clock/calendar combination without shared event/date state. `src/shells/desktop/components/TaskbarSystemArea.tsx` independently implements `ClockCalendarPopup`, including analog/digital clock, month cursor and compact grid.
- This is a confirmed architectural duplication. No shared Calendar Core or synchronized date/event state was found in the inspected entry points. The calendar app's current white/XP-like toolbar is not yet a sufficient OS adapter for all profiles.
- Active implementation specification is `CALENDAR-01` in `docs/tasks.md`. Keep the three surfaces as distinct native views over one domain service; preserve each surface's useful UI. Do not import donor code from `/eat/` or claim runtime/test completion without running the gates.
- Calendar refactor has not yet been implemented or runtime-verified in this audit pass. Next code pass should map all launch callbacks and theme CSS before introducing the shared store, then wire all three surfaces and add migration-safe persistence.


### Calendar Center implementation pass 1 — 2026-11-19
- Implemented on `main`; no feature branch. The shared service is `src/apps/calendar/calendarCenter.ts`. It owns selected date, visible month, locale-loaded ICS events, loading/error state and React subscriptions via `useSyncExternalStore`. Selected date persists in local storage key `calendar-center-selected-date-v1`; unavailable storage does not break the in-session calendar.
- `src/apps/calendar/CalendarApp.tsx` now reads shared date/month/events and provides month navigation, Today, date selection, event labels/location, selected-day summary and loading/error/retry states. The existing read-only ICS behavior remains; no event CRUD or remote sync was invented.
- `src/shells/desktop/components/TaskbarSystemArea.tsx` now uses the shared month and selected date, loads the same ICS source and opens Calendar from the flyout/date selection. `DesktopShellContainer.tsx` wires this to `launchApp('calendar')`; the window manager reuses the existing stable window ID, avoiding duplicate Calendar windows.
- `src/shells/desktop/components/AppleDesktopWidgets.tsx` and `src/system/widgets/components/ClockCalendarWidget.tsx` now use the same selected date/month and ICS event source. The WebOS widget keeps its analog clock and glass layout, adds shared month navigation, date selection and event indicators. Both widget launch paths open the same Calendar app.
- Added `src/styles/os/themes/calendar-os-adapters.css` and imported it from `src/styles/os/index.css`. It adds initial Calendar app and taskbar-flyout presentation for XP, classic 98/2000, Win7-family, Ubuntu, Arch and WebOS. Existing macOS calendar styling was adjusted to support interactive button cells. Treat this as a source-level first pass, not completed visual fidelity.
- Locale loading uses the existing EN/RU ICS assets and retains English fallback for other locales. Concurrent locale requests are guarded so an obsolete fetch cannot overwrite the currently selected locale. The existing parser's date interpretation and future-event filtering were intentionally left unchanged in this pass.
- Main implementation commits include `25f731ee` (Calendar Core), `9fd597cd` (Calendar app), `b3c39e6f` (taskbar flyout), `69857e77` / `57281294` (desktop widget), `03b00122` / `8ba981f3` (WebOS widget), and `c401f35d` / `4d09e614` / `17214914` / `b332a1b2` (OS adapters and styling). See `docs/tasks.md` under CALENDAR-01 for the active specification and remaining acceptance.
- Remaining work: richer app views (week/day/list), event detail and local CRUD backed by a defined model, multi-day event handling if desired, DST/timezone audit, small-screen layout and visual checks across every shell. Keep existing ICS events and locale fallback intact.
- Verification limitation: no local repository checkout or npm environment was available; `git clone` could not resolve GitHub from the runtime. Latest combined commit status returned an empty statuses array and no workflow runs. Do not report typecheck/lint/build/verify or browser/manual acceptance as passing.


### Calendar Center implementation pass 2 — 2026-11-19
- Expanded `CalendarApp.tsx` with month/week/day/list modes, event details, and a local event editor. User-owned events support create/edit/delete and persist separately from bundled ICS data in `calendar-center-local-events-v1`; imported ICS events remain read-only.
- Added shared range queries for week/day/month views and multi-day events. Local events use inclusive date ranges; RFC 5545 all-day `DTEND` remains exclusive.
- Improved `icsParser.ts`: unfolded continuation lines, escaped text decoding, UID identity, UTC timestamps, local floating date-times and TZID-aware conversion. Removed the old future-only event filter; past events are now available when navigating historical dates. Existing EN/RU ICS files are preserved.
- Added responsive view/editor/event-detail styling in `calendar-os-adapters.css`, including compact mobile layout and initial classic/Windows/WebOS variants.
- Remaining known format gap: recurring `RRULE` instances are not expanded. Calendar source visibility/colour management and an all-day editor toggle are not yet implemented. DST edge cases and actual visual acceptance across every OS still need testing.
- Verification limitation unchanged: container could not resolve `github.com`, so no npm install, typecheck, lint, build, verify or browser tests were run. Treat all source changes as unverified until those gates pass.

- Follow-up polish: all-day imported events are labelled as “All day” / “Весь день” rather than showing a misleading midnight time. Latest code commit: `38c7898b0774d6b8333febae162e73a13b48b612`.
- CI status queried for that code commit: no status entries and no associated workflow runs were returned; this is not a passing build.


### National calendars implementation pass — 2026-11-19
- Added `src/apps/calendar/nationalCalendars.ts` with country metadata and recurring Gregorian holiday rules for RU/KZ/BY/CN/JP/KR/GB, computed UK Easter/bank-holiday dates, Japan weekday/equinox rules, and limited 2026–2027 lunar-holiday entries for China/Korea.
- Added a persistent, reactive multi-country labour-calendar selection. Calendar app, taskbar flyout and WebOS clock widget share the selection and show selected-country weekend styling; national holiday markers remain visible regardless of selection.
- Added country flag SVG assets and extended the language switcher so EN/FR/RU/ES/ZH/JA/KO all show same-size flag images. Calendar country picker and holiday chips use the same compact flag dimensions.
- Localized country names and holiday names for Russian, English and French where the dataset has a translation.
- **Data caveat:** annual official transfer days, substitute days and make-up working Saturdays are not yet encoded. China/Korea lunar holidays currently have dates only for 2026 and 2027; these dates/ranges need authoritative year-by-year verification. This first pass is not a payroll/legal production calendar.
- **Verification:** no local checkout/build was available in this connector session. Typecheck, lint, build, verify, browser rendering and cross-OS visual checks have not been run. Review the latest GitHub Actions results before treating this as accepted.


### Calendar completion pass — 2026-11-19
- Implemented local all-day event editing and recurring event series in the shared Calendar Center. The editor supports no repeat / daily / weekly / monthly / yearly, interval, optional occurrence count or inclusive end date. Local event recurrence metadata persists in localStorage. Generated occurrences preserve master IDs so series edits/deletes target the stored series.
- ICS parser now reads the supported RFC 5545 RRULE subset: FREQ, INTERVAL, COUNT, UNTIL, BYDAY weekday tokens and BYMONTHDAY. Date-only UNTIL is inclusive through the final day. Recurrence expansion uses local calendar-day arithmetic and preserves wall-clock time across DST boundaries for generated occurrences. RDATE/EXDATE, BYSETPOS, ordinal BYDAY and full VTIMEZONE definitions remain unsupported.
- National calendar data expanded and corrected for 2026–2027:
  - Russia: 2026/2027 transfer dates.
  - Kazakhstan: 2026 five-day work calendar, Nauryz/May/October transfers, Qurban Ait, and the new Constitution Day on 15 March following the 2026 constitutional referendum; 2027 official transfer schedule not found in checked official sources.
  - Belarus: 2026 Radunitsa and 20 April → 25 April workday transfer; 2027 10 May → 8 May transfer, with 9–11 May rest days.
  - China: State Council 2026/2027 holiday ranges and explicit make-up workdays.
  - Japan: Cabinet Office 2026/2027 holidays including substitute/citizen holidays; memorial dates remain separately visible.
  - South Korea: 2026/2027 lunar holidays, substitute days, Labour Day and Constitution Day.
  - UK: England/Wales bank holiday baseline for 2026/2027; regional Scotland/Northern Ireland calendars are not yet selectable.
- Labour calendar status now distinguishes ordinary days off from transferred working days. Full Calendar month/week/day/list views show both; taskbar and WebOS clock tooltips include selected-country rest-day labels and national holiday flags.
- Weather widget catalogue now has two cities per seven requested countries, plus Paris/Marseille and Madrid/Barcelona to satisfy French/Spanish language-country defaults. Current defaults are EN London, RU Almaty, FR Paris, ES Madrid, ZH Beijing, JA Tokyo, KO Seoul. City names show flags; manual choices persist per language; switching language resets the default. Weather cache is locale-specific and stale request results are ignored.
- Source references used:
  - Russia 2026 transfer decree: https://static.government.ru/media/files/4jeB8hNKm69ggOa9yDiYOli6YoAyM21i.pdf
  - Russia 2027 transfer decree: https://publication.pravo.gov.ru/document/0001202609180037
  - Kazakhstan 2026 production calendar: https://www.gov.kz/article/16887?lang=ru
  - Kazakhstan 2026 constitutional change / 15 March holiday: https://www.gov.kz/org/maslihat-zhambyl/press/news/details/1183102?lang=ru; https://www.gov.kz/article/16887?lang=ru
  - Belarus 2026 transfer: https://otdelkadrov.by/number/2025/8/Novosti_zakonodatelstva_082025/
  - Belarus 2027 transfer: https://normativka.by/lib/news/73260 (Resolution No. 499, 10 May → 8 May transfer; Ministry of Labour notice)
  - China 2026: https://en.bjhd.gov.cn/workinginhaidian/supportingservices/publicholidays/202512/t20251211_4797062.shtml
  - China 2027: https://www.gov.cn/zhengce/content/202611/content_7085101.htm (State Council notice with make-up workdays); https://english.www.gov.cn/policies/latestreleases/202611/06/content_WS6aed74dcc6d00ca5f9a0e22e.html (English holiday summary)
  - Japan 2026/2027: https://www8.cao.go.jp/chosei/shukujitsu/gaiyou.html
  - South Korea 2026: https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=140038
  - South Korea 2027 lunar/observed dates cross-checked against KASA 2027 calendar guidelines: https://www.kasa.go.kr/prog/plcyBrf/brief/kor/sub01_01_04/view.do?plcyBrfNo=431
  - UK bank holidays: https://www.gov.uk/bank-holidays
  - City population references: UN World Cities 2025 data (https://population.un.org/wup/assets/Publications/undesa_pd_2025_wup2025_summary_of_results_final.pdf), UN Demographic Yearbook city table (https://unstats.un.org/unsd/demographic-social/products/dyb/documents/DYB2025/table08.pdf), and national statistical sources; city pairs use city-proper population where available rather than metro-area ranking.
- **Verification remains outstanding:** connector writes are not equivalent to a build. No local checkout or browser runtime was available in this pass; typecheck/lint/build/verify, automated date tests and visual cross-OS checks are not confirmed. The annual labour data should not be presented as payroll/legal advice.


### Calendar follow-up — source controls and annual-rule review — 2026-11-19
- Added persistent source visibility switches for imported ICS calendars and personal events. National holidays/memorial dates are deliberately not hidden by these switches, preserving the always-visible country holiday requirement.
- Added independent source color selectors (ICS and personal events) with local persistence and palette styling.
- Added day-off and make-up workday entries to list view; taskbar and WebOS clock calendar tooltips now show flags, day-off text and make-up-work text.
- Added generic substitute-day derivation for future Russian statutory holidays (excluding 1–8 January, which require the annual government schedule), Japanese Sunday national holidays, UK bank-holiday substitutes, and Kazakhstan public holidays under the next-working-day rule. These are statutory-rule fallbacks only; annual decrees still take precedence when published.
- Corrected France weather pair to Paris/Marseille; Spain remains Madrid/Barcelona.
- **Current limitation:** UK calendar is still England/Wales baseline; Scotland and Northern Ireland have distinct regional bank holidays. Kazakhstan 2027 Qurban Ait date and any annual transfer schedule should be refreshed from official sources when issued.
