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
