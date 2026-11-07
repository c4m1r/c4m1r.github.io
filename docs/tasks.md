# Repository Consolidation & OS Engineering Master Task Registry

## Executive Summary: Repository Consolidation, Absorption & Technical Debt
По результатам детального сквозного аудита репозитория `c4m1r.github.io` и 25 внешних донорских репозиториев в каталоге `/eat/` (суммарным объёмом ~660 МБ), проект достиг ключевой вехи: **полная автономность сборки (0 runtime-зависимостей от `/eat/`)**. Ранее 47 критических медиа-ресурсов (обои, системные иконки SF Pro, иконки приложений iOS/macOS) импортировались напрямую через относительные пути вида `../../../eat/`. Все 47 ассетов были канонизированы и перемещены в `src/themes/apple/assets/`. Степень фактического поглощения доноров варьируется от глубокой (100% логики и стилей для `winxpsite-main`, `98.portfolio-main`, `playground-macos-main`) до селективной (заимствование отдельных иконок/обоев из `Eshwar-win7-master`, `homescreen-main`). Все 25 доноров подлежат сохранению в режиме read-only archive (удаление категорически запрещено без отдельного аудита правообладателей и лицензий). Текущий технический долг сосредоточен на дальнейшей полировке аутентичности системных оконных диалогов, углублении респонсивности мобильных версий и расширении набора нативных pseudo-OS утилит.

---

## 1. Repository Consolidation Tasks

### TASK-CONSOL-01: Canonicalization of External Apple/iOS Media Assets
- **Priority**: P0
- **Status**: COMPLETED
- **Problem**: 47 UI/wallpaper assets in `appleIconAssets.ts`, `appleSettingsAssets.ts`, `AppleLockScreen.tsx`, and stylesheets imported files directly from `eat/playground-macos-main`, `eat/homescreen-main`, and `eat/macOS-Portfolio-main 2`, creating a fragile build dependency.
- **Expected result**: All donor assets permanently copied to canonical project paths inside `src/themes/apple/assets/`.
- **Acceptance criteria**: Zero runtime or compile-time file imports point to `/eat/`. Vite builds cleanly when `/eat/` is moved or offline.
- **Dependencies**: None.
- **Files**: `src/apps/explorer/MyComputer.tsx`, `src/shells/desktop/appleIconAssets.ts`, `src/shells/desktop/appleSettingsAssets.ts`, `src/shells/desktop/components/AppleLockScreen.tsx`, `src/shells/desktop/components/AppleSystemBar.tsx`, `src/themes/apple/AppleSessionScreens.tsx`, `src/styles/os/themes/ios.css`, `src/styles/os/themes/macos.css`.
- **Verification method**: `grep -rn "eat/" src/` confirms only documentation comments remain; `npm run build` succeeds.
- **Source**: Repository Consolidation Audit.

### TASK-CONSOL-02: Donor Provenance and Asset License Registry
- **Priority**: P1
- **Status**: IN_PROGRESS
- **Problem**: Codebase incorporates visual concepts, assets, and styling patterns from 25 external repositories without a unified centralized provenance registry.
- **Expected result**: Markdown provenance catalog mapping every integrated asset and pattern to its original donor repository, author, and license.
- **Acceptance criteria**: `docs/tasks.md` and `docs/nerv/reports/` document provenance of Windows, Apple, Ubuntu, and Linux assets.
- **Dependencies**: TASK-CONSOL-01.
- **Files**: `docs/tasks.md`, `README.md`, `docs/nerv/reports/repository-consolidation-and-os-fidelity.md`.
- **Verification method**: Review documentation files.
- **Source**: Compliance and Audit requirements.

### TASK-CONSOL-03: Read-Only Archive Protection for `/eat/`
- **Priority**: P2
- **Status**: COMPLETED
- **Problem**: Risk of accidental deletion or modification of external reference repositories during workspace cleanup.
- **Expected result**: Explicit repository policy forbidding deletion or modification of `/eat/` without formal review.
- **Acceptance criteria**: Policy codified in documentation and verification guidelines.
- **Dependencies**: None.
- **Files**: `docs/tasks.md`, `docs/nerv/reports/repository-consolidation-and-os-fidelity.md`.
- **Verification method**: Manual verification of project guidelines.
- **Source**: Repository Consolidation Guidelines.

---

## 2. OS Themes Visual Fidelity Tasks

### TASK-THEME-01: Windows 98 Classic Bevel and Dither Overhaul
- **Priority**: P0
- **Status**: COMPLETED
- **Problem**: Windows 98 classic theme (`.os-classic`) lacked authentic 3D sunken/raised borders, 16x14px window caption buttons, dithered active taskbar buttons, and recessed system tray.
- **Expected result**: Pixel-perfect Windows 98 UI recreation with authentic border-style combinations, `#c0c0c0` background, high-contrast titlebar gradient (`#000080` to `#1084d0`), and dotted button focus indicators.
- **Acceptance criteria**: Window frames exhibit 2px 3D beveled borders; active taskbar buttons use 50% dither background; minimize/maximize/close buttons render authentic monospace glyphs.
- **Dependencies**: None.
- **Files**: `src/styles/os/themes/classic.css`.
- **Verification method**: Visual inspection in browser; CSS syntax check.
- **Source**: Windows 98 UI Specification / `98.portfolio-main`.

### TASK-THEME-02: WebOS Theme Decoupling from Windows XP Luna
- **Priority**: P0
- **Status**: COMPLETED
- **Problem**: `OS_CLASS_MAP` in `osClassNames.ts` mapped `webos` to `winxp`, causing WebOS to erroneously inherit Windows XP royal blue Luna taskbar, green start button, and XP window chrome.
- **Expected result**: Independent `.os-webos` CSS namespace with frosted glass taskbar, dark pill start button, cyan accents, and distinct window header styling.
- **Acceptance criteria**: WebOS has its own `src/styles/os/themes/webos.css`; `osClassNames.ts` maps `webos` to `'webos'`.
- **Dependencies**: None.
- **Files**: `src/shells/os/osClassNames.ts`, `src/styles/os/themes/webos.css`, `src/styles/os/index.css`, `src/themes/themeConfig.ts`.
- **Verification method**: Launch WebOS profile; verify absence of Luna blue styling.
- **Source**: OS Isolation Architecture.

### TASK-THEME-03: Arch Linux Dark Slate Theme Implementation
- **Priority**: P1
- **Status**: COMPLETED
- **Problem**: Arch Linux lacked a dedicated stylesheet, falling back to unstyled base desktop.
- **Expected result**: Dedicated Arch Linux theme (`.os-arch`) with dark slate panel (`#1e222b`), Arch cyan accents (`#1793d1`), minimalist circular window controls, and modern dark window chrome.
- **Acceptance criteria**: `src/styles/os/themes/arch.css` created and imported; `DesktopShellContainer` supplies `#1e222b` canvas color.
- **Dependencies**: None.
- **Files**: `src/styles/os/themes/arch.css`, `src/styles/os/index.css`, `src/shells/desktop/DesktopShellContainer.tsx`.
- **Verification method**: Switch to Arch Linux theme; confirm panel and window styling.
- **Source**: Arch Linux Brand Guidelines.

### TASK-THEME-04: Halloween Edition Midnight/Pumpkin Glow Styling
- **Priority**: P1
- **Status**: COMPLETED
- **Problem**: Halloween theme lacked distinctive seasonal visuals and window styling.
- **Expected result**: Dedicated Halloween theme (`.os-spooky`) featuring midnight purple canvas (`#12041d`), neon pumpkin orange borders and highlights (`#ff7518`), glowing titlebars, and spooky taskbar accents.
- **Acceptance criteria**: `src/styles/os/themes/halloween.css` created and imported; `DesktopShellContainer` provides dark purple fallback.
- **Dependencies**: None.
- **Files**: `src/styles/os/themes/halloween.css`, `src/styles/os/index.css`, `src/shells/desktop/DesktopShellContainer.tsx`.
- **Verification method**: Switch to Halloween theme; verify purple and orange palette.
- **Source**: Seasonal themes backlog.

### TASK-THEME-05: Desktop Background Fallback Theme-Adaptivity
- **Priority**: P1
- **Status**: COMPLETED
- **Problem**: `DesktopShellContainer.tsx` contained an inline fallback `backgroundColor: isXpFamily ? 'transparent' : '#008080'`, forcing Win98 teal on Arch, Ubuntu, Halloween, and WebOS desktops.
- **Expected result**: Exhaustive theme-adaptive background color mapping matching each OS identity.
- **Acceptance criteria**: Arch gets `#1e222b`, Ubuntu gets `#2c001e`, Halloween gets `#12041d`, WebOS gets `#0f172a`, Classic gets `#008080`.
- **Dependencies**: None.
- **Files**: `src/shells/desktop/DesktopShellContainer.tsx`.
- **Verification method**: Inspect element styling across desktop themes.
- **Source**: Code Review Audit.

---

## 3. OS Functionality / UX Tasks

### TASK-UX-01: Responsive Breakpoints and Mobile Touch Optimization
- **Priority**: P1
- **Status**: COMPLETED
- **Problem**: Desktop taskbars, start menus, and window caption buttons were fixed-width and overflowed viewport on screens `< 640px` and touch devices.
- **Expected result**: Fluid media queries adapting taskbar height, caption button tap target sizes (`min-height: 28px`), and max-width capping on Start menus.
- **Acceptance criteria**: `@media (max-width: 640px)` and `@media (pointer: coarse)` rules in `os-base.css` enforce responsive scaling without breaking desktop layouts.
- **Dependencies**: None.
- **Files**: `src/styles/os/base/os-base.css`.
- **Verification method**: Test viewport resizing to 375px and 414px; verify touch target usability.
- **Source**: Mobile UX guidelines.

### TASK-UX-02: Window Geometry and Multi-Window Clamping
- **Priority**: P2
- **Status**: IN_PROGRESS
- **Problem**: Opening windows on smaller screens can position titlebars outside visible viewport bounds.
- **Expected result**: Dynamic window clamping utility ensuring caption bar remains accessible on viewport resize.
- **Acceptance criteria**: Windows opened or resized never exceed `window.innerWidth` or `window.innerHeight - taskbarHeight`.
- **Dependencies**: None.
- **Files**: `src/shells/desktop/runtime/windowGeometry.ts`.
- **Verification method**: Open multiple windows and reduce viewport dimensions.
- **Source**: Desktop window manager usability.

---

## 4. Architecture Tasks

### TASK-ARCH-01: Preservation of Single Unified DesktopShell
- **Priority**: P0
- **Status**: COMPLETED
- **Problem**: Risk of architectural regression into fragmented desktop implementations (`Win98Desktop`, `MacDesktop`, etc.).
- **Expected result**: Single `DesktopShell` component managing state, windows, dock, and taskbar across all 13 OS themes.
- **Acceptance criteria**: No forked desktop shells exist; themes only supply CSS tokens, assets, and config overrides.
- **Dependencies**: None.
- **Files**: `src/shells/desktop/DesktopShell.tsx`, `src/shells/desktop/DesktopShellContainer.tsx`.
- **Verification method**: `grep -rn "function.*Desktop(" src/shells/` shows single shell.
- **Source**: Architecture Principles.

### TASK-ARCH-02: Centralized App Registry and Portfolio App Protection
- **Priority**: P0
- **Status**: COMPLETED
- **Problem**: System skin renamings could accidentally rename portfolio apps (`my-cv`, `projects-grid`, `blog`, `wiki`, `about`).
- **Expected result**: Protected app rules in `osSkins.ts` guarantee portfolio content identity across all OS skins.
- **Acceptance criteria**: Portfolio apps retain their canonical titles and icons regardless of active OS theme.
- **Dependencies**: None.
- **Files**: `src/shells/desktop/appRegistry.tsx`, `src/shells/os/osSkins.ts`.
- **Verification method**: `npm run verify` passes with strict boundary validation.
- **Source**: Architectural Invariants.

---

## 5. Performance Tasks

### TASK-PERF-01: Vite Static Media Bundling Optimization
- **Priority**: P1
- **Status**: COMPLETED
- **Problem**: Direct unmanaged asset paths bypassed Vite asset hash hashing and optimization pipeline.
- **Expected result**: All images imported via ESM import statements, enabling Vite chunking and hash fingerprints.
- **Acceptance criteria**: Production build produces fingerprinted assets in `dist/assets/` without duplicate bundles.
- **Dependencies**: TASK-CONSOL-01.
- **Files**: `src/shells/desktop/appleIconAssets.ts`, `src/shells/desktop/appleSettingsAssets.ts`.
- **Verification method**: Inspect `npm run build` output bundle size and asset manifest.
- **Source**: Vite Asset Optimization Guidelines.

### TASK-PERF-02: CSS Theme Dynamic Lazy Ingestion
- **Priority**: P2
- **Status**: BACKLOG
- **Problem**: All OS stylesheets are bundled together in `src/styles/os/index.css`, slightly increasing global CSS footprint.
- **Expected result**: Dynamic CSS imports when switching OS profiles, keeping initial bundle minimal.
- **Acceptance criteria**: OS CSS files loaded on demand upon OS theme activation.
- **Dependencies**: TASK-THEME-01, TASK-THEME-02, TASK-THEME-03.
- **Files**: `src/themes/themeConfig.ts`, `src/styles/os/index.css`.
- **Verification method**: Measure initial CSS chunk transfer size.
- **Source**: Performance Profiling.

---

## 6. CSS / Asset Optimization Tasks

### TASK-ASSET-01: Elimination of Style Leaks across OS Themes
- **Priority**: P0
- **Status**: COMPLETED
- **Problem**: Global `.window`, `.taskbar`, and `.start-button` CSS rules without OS scoping caused visual bleed between themes.
- **Expected result**: Strict scoping under `.os-winxp`, `.os-classic`, `.os-win7`, `.os-ubuntu`, `.os-arch`, `.os-webos`, `.os-spooky`.
- **Acceptance criteria**: No unscoped global desktop overrides remain in theme stylesheets.
- **Dependencies**: None.
- **Files**: `src/styles/os/themes/*.css`.
- **Verification method**: Automated linter and manual theme-switching smoke test.
- **Source**: CSS Isolation Audit.

---

## 7. Testing / QA Tasks

### TASK-QA-01: Unified Verification Pipeline Automation
- **Priority**: P0
- **Status**: COMPLETED
- **Problem**: Multiple disparate check commands made pre-commit verification prone to missed errors.
- **Expected result**: Unified sequence: `npm run verify` -> `npm run typecheck` -> `npm run lint` -> `npm run build` -> `git diff --check`.
- **Acceptance criteria**: All 5 checks pass with 0 errors.
- **Dependencies**: None.
- **Files**: `package.json`.
- **Verification method**: Execute full test suite in CI and local terminal.
- **Source**: Project QA Standards.

---

## 8. Documentation Tasks

### TASK-DOC-01: Update Visual Checklist and Guidelines
- **Priority**: P1
- **Status**: COMPLETED
- **Problem**: `docs/os-skin-visual-checklist.md` lacked specifications for Arch Linux, Halloween, and WebOS.
- **Expected result**: Detailed visual criteria and color palettes for all active themes added to the checklist.
- **Acceptance criteria**: Document covers Windows 98, XP, 7, Ubuntu, Arch, Halloween, WebOS, and Apple iOS/macOS.
- **Dependencies**: TASK-THEME-01, TASK-THEME-02, TASK-THEME-03, TASK-THEME-04.
- **Files**: `docs/os-skin-visual-checklist.md`.
- **Verification method**: Review document contents.
- **Source**: Documentation Guidelines.

### TASK-DOC-02: Comprehensive Repository Consolidation Report
- **Priority**: P1
- **Status**: COMPLETED
- **Problem**: Lack of formal report detailing the audit of all 25 donor repositories in `/eat/` and asset migration.
- **Expected result**: Full technical report in `docs/nerv/reports/repository-consolidation-and-os-fidelity.md`.
- **Acceptance criteria**: Report outlines every donor, absorption percentage, license status, and zero-dependency proof.
- **Dependencies**: TASK-CONSOL-01.
- **Files**: `docs/nerv/reports/repository-consolidation-and-os-fidelity.md`.
- **Verification method**: Review generated report.
- **Source**: NERV Reporting Framework.

---

## 9. Release Preparation Tasks

### TASK-REL-01: Clean Working Tree and Generated Output Protection
- **Priority**: P0
- **Status**: COMPLETED
- **Problem**: Generated build artifacts (`dist/`) must never be committed or treated as source of truth.
- **Expected result**: `dist/` is gitignored; working tree is clean and builds deterministically from source.
- **Acceptance criteria**: `git status` shows no untracked build artifacts.
- **Dependencies**: None.
- **Files**: `.gitignore`.
- **Verification method**: `npm run clean && git status`.
- **Source**: Release Engineering Standards.
