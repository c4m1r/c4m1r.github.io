# Repository Consolidation & OS Engineering Master Task Registry

## Executive Summary: Retro OS Reconstruction, Absorption & Fidelity Roadmap
Проект `c4m1r.github.io` разрабатывается как некоммерческая, фанатская интерактивная ретро-среда для восстановления эстетики и ностальгии по культовым операционным системам прошлого. Все графические материалы, звуки, стили и фрагменты кода из донорских репозиториев `/eat/` используются исключительно в демонстрационных и образовательно-ностальгических целях для достижения максимального визуального и функционального соответствия оригинальным ОС (Windows XP, Windows 98, Windows 7, Ubuntu, Arch Linux, WebOS, macOS, iOS). Проект достиг полной независимости сборки (0 runtime-зависимостей от внешних папок). Полностью поглощённые и неактуальные доноры могут быть безопасно удалены или архивированы. Текущий этап сфокусирован на последовательной глубокой проработке каждой системы: аутентичные звуковые схемы, высокоточные эмуляции классических программ (Winamp 2.x, 0chan Loop, Outlook, Explorer, Media Player), реактивная анимация элементов управления и визуализаторов, и адаптивный UX.

---

## 1. Repository Consolidation & Retro Absorption Tasks

### TASK-CONSOL-01: Canonicalization of External Apple/iOS Media Assets
- **Priority**: P0
- **Status**: COMPLETED
- **Problem**: 47 UI/wallpaper assets in `appleIconAssets.ts`, `appleSettingsAssets.ts`, `AppleLockScreen.tsx`, and stylesheets imported files directly from `eat/`, creating a fragile build dependency.
- **Expected result**: All donor assets permanently copied to canonical project paths inside `src/themes/apple/assets/`.
- **Acceptance criteria**: Zero runtime or compile-time file imports point to `/eat/`. Vite builds cleanly without external paths.
- **Dependencies**: None.
- **Files**: `src/apps/explorer/MyComputer.tsx`, `src/shells/desktop/appleIconAssets.ts`, `src/shells/desktop/appleSettingsAssets.ts`, `src/shells/desktop/components/AppleLockScreen.tsx`, `src/shells/desktop/components/AppleSystemBar.tsx`, `src/themes/apple/AppleSessionScreens.tsx`, `src/styles/os/themes/ios.css`, `src/styles/os/themes/macos.css`.
- **Verification method**: `grep -rn "eat/" src/` confirms only documentation comments remain; `npm run build` succeeds.
- **Source**: Repository Consolidation Audit.

### TASK-CONSOL-02: Music Library Expansion & Safe File Normalization
- **Priority**: P1
- **Status**: COMPLETED
- **Problem**: The media library had only 3 tracks and missed user-added songs and donor audio files, while several filenames contained raw URL encoding or special characters.
- **Expected result**: Full 57-track playlist in `src/apps/mediaplayer/playlist.ts`, sorted strictly in alphabetical order (`Artist - Title`), with clean filenames and Vite-native asset resolution.
- **Acceptance criteria**: 57 songs present, zero Vite build warnings, alphabetized list displayed in Winamp playlist.
- **Dependencies**: None.
- **Files**: `src/apps/mediaplayer/playlist.ts`, `src/apps/mediaplayer/assets/music/*`.
- **Verification method**: `npm run build` succeeds without unresolved URL warnings; Winamp playlist displays sorted tracks.
- **Source**: User Music Library Request.

---

## 2. Windows XP Fidelity & Audio Tasks

### TASK-XP-SOUND-01: Windows XP Authentic Audio Scheme
- **Priority**: P0
- **Status**: COMPLETED
- **Problem**: Windows XP lacked authentic startup, logon, logoff, click, ding, and shutdown audio feedback.
- **Expected result**: Complete sound service `src/themes/winxp/xpSoundService.ts` providing synthesized Bill Brown E♭ major startup chord sequence, 3-note logon chime, descending logoff, shutdown orchestral motif, 15ms acoustic click on start button, and authentic `error.wav` error chords.
- **Acceptance criteria**: Sounds play seamlessly on login, start menu interaction, system shutdown, and error dialogs.
- **Dependencies**: None.
- **Files**: `src/themes/winxp/xpSoundService.ts`, `src/themes/winxp/WelcomeScreen.tsx`, `src/themes/winxp/SystemTransitionScreen.tsx`, `src/shells/desktop/DesktopShellContainer.tsx`, `src/shells/desktop/components/DesktopErrorBox.tsx`.
- **Verification method**: Boot Windows XP profile; verify startup chime, click on Start button, shutdown sound.
- **Source**: Windows XP Audio Specification.

### TASK-APP-WINAMP-01: Winamp 2.x Tri-Module Pixel-Perfect Recreation
- **Priority**: P0
- **Status**: COMPLETED
- **Problem**: Previous Winamp app was a simplistic flat blue card with missing Equalizer, primitive sliders, no spectrum analyzer peaks, and unsorted playlist.
- **Expected result**: Pixel-perfect recreation of classic Winamp 2.x matching reference screenshot:
  1. Main window with lightning bolt, grooved scanline titlebar, LED time display (elapsed/remaining toggle), real-time spectrum analyzer with falling peak dots, scrolling marquee, kbps/kHz/stereo green lights, metallic position bar, volume and balance sliders, transport buttons, shuffle/repeat toggles, and mini album art.
  2. WINAMP EQUALIZER module with ON/AUTO buttons, yellow spline curve visualizer, PRESETS button, and 10 frequency band faders + preamp.
  3. WINAMP PLAYLIST module with electric green monospace text on black, cobalt blue active selection, alphabetical sorting of 57 tracks, and mini transport controls.
- **Acceptance criteria**: Matches Screenshot 2; sliders functional; real frequency analyzer active during playback; songs alphabetized.
- **Dependencies**: TASK-CONSOL-02.
- **Files**: `src/apps/winamp/WinampPlayer.tsx`, `src/apps/winamp/winamp.css`, `src/shells/desktop/appRegistry.tsx`.
- **Verification method**: Open Winamp in Windows XP; verify visualizer, sliders, EQ, and track playback.
- **Source**: Classic Winamp 2.x Specification / User Screenshot 2.

---

## 3. WebOS & 0chan Loop Integration Tasks

### TASK-WEBOS-BOOT-01: WebOS Renaming & Windows 7 Boot/Login Integration
- **Priority**: P1
- **Status**: COMPLETED
- **Problem**: WebOS carried the redundant label "WebOS by C4m1r" and a generic blue welcome screen.
- **Expected result**: Clean branding as "WebOS", with boot, login, and welcome screens seamlessly adopting the Windows 7 style (animated glowing logo and authentic welcome spinner).
- **Acceptance criteria**: String "WebOS by C4m1r" removed from translations and resume; WebOS boot and login render Win7 components.
- **Dependencies**: None.
- **Files**: `src/i18n/translations.ts`, `src/domain/resume/useResume.ts`, `src/themes/webos/index.tsx`.
- **Verification method**: Switch to WebOS; verify Windows 7 boot screen and clean WebOS title.
- **Source**: User Theme Request.

### TASK-APP-LOOPS-01: loops App (WebOS)
- **Priority**: P0
- **Status**: COMPLETED
- **Problem**: WebOS desktop lacked the iconic interactive dancing square loop music visualizer from `eat/instant-0chan-master`.
- **Expected result**: Dedicated `LoopsApp` (`src/apps/loops/LoopsApp.tsx` and `loops.css`) featuring:
  1. Matrix of dancing colored cells (`.loop-cell`) matching 0chan nullgrid, Im Blue, and Matrix patterns.
  2. Web Audio frequency/time-domain analyzer triggering real-time radiant cell flashes on beats.
  3. Oscilloscope waveform canvas.
  4. Track switching (next, prev, random loop).
  5. Interactive mouse clicks on cells triggering `chpok.mp3` acoustic feedback.
  6. Authentic desktop launcher icon using `favicon.ico`.
  7. Desktop shortcut visible strictly on WebOS desktop.
- **Acceptance criteria**: App opens on WebOS desktop, squares dance to audio, click produces chpok sound, named "loops".
- **Dependencies**: None.
- **Files**: `src/apps/loops/LoopsApp.tsx`, `src/apps/loops/loops.css`, `src/apps/loops/assets/favicon.ico`, `src/shells/desktop/appRegistry.tsx`, `src/shells/desktop/shortcutsRegistry.ts`, `src/shells/os/osSkins.ts`, `src/shells/desktop/DesktopShellContainer.tsx`.
- **Verification method**: Launch WebOS; double-click "loops" on desktop; verify audio playback, icon and animation.
- **Source**: `eat/instant-0chan-master` absorption request.

---

## 4. Multi-OS Visual Fidelity & Architecture Tasks

### TASK-THEME-01: Windows 98 Classic Bevel and Dither Overhaul
- **Priority**: P0
- **Status**: COMPLETED
- **Files**: `src/styles/os/themes/classic.css`.

### TASK-THEME-02: WebOS Theme Decoupling from Windows XP Luna
- **Priority**: P0
- **Status**: COMPLETED
- **Files**: `src/shells/os/osClassNames.ts`, `src/styles/os/themes/webos.css`.

### TASK-THEME-03: Arch Linux Dark Slate Theme Implementation
- **Priority**: P1
- **Status**: COMPLETED
- **Files**: `src/styles/os/themes/arch.css`.

### TASK-THEME-04: Halloween Edition Midnight/Pumpkin Glow Styling
- **Priority**: P1
- **Status**: COMPLETED
- **Files**: `src/styles/os/themes/halloween.css`.

### TASK-UX-01: Responsive Breakpoints and Mobile Touch Optimization
- **Priority**: P1
- **Status**: COMPLETED
- **Files**: `src/styles/os/base/os-base.css`.

### TASK-ARCH-01: Preservation of Single Unified DesktopShell
- **Priority**: P0
- **Status**: COMPLETED
- **Files**: `src/shells/desktop/DesktopShell.tsx`, `src/shells/desktop/DesktopShellContainer.tsx`.

### TASK-AUTH-01: WebOS & Multi-OS Encrypted Credential Verification
- **Priority**: P0
- **Status**: COMPLETED
- **Problem**: Login screens lacked password verification on user `c4m1r`, allowing unrestricted one-click entry. Plaintext storage of passwords was prohibited.
- **Expected result**: Secure, obfuscated credential verification (`src/domain/auth/credentials.ts`) using XOR token (`0x65` mask) and salted SHA-256 digest (`ac0d0deae2a1d4e30a799234e867fc1d6f3f371d587924d8f327c4b74e82383b`) for account `c4m1r`. Authentic password entry UI across WebOS, Windows XP, Windows 98, and Windows 7 login screens.
- **Acceptance criteria**: Valid secret master password unlocks the session; wrong passwords show error feedback and prevent login; no cleartext password string exists in repository or bundle.
- **Files**: `src/domain/auth/credentials.ts`, `src/themes/webos/LoginScreen.tsx`, `src/themes/winxp/LoginScreen.tsx`, `src/themes/winxp/xp.css`, `src/themes/win7/LoginScreen.tsx`, `src/themes/webos/index.tsx`.
- **Verification method**: Attempt login with wrong password (rejected); attempt with valid master password (accepted); `grep -rn` confirms zero plaintext password strings in repository.

### TASK-DOCS-01: Agent Engineering Guide & System Architecture Documentation
- **Priority**: P0
- **Status**: COMPLETED
- **Problem**: Lack of standardized onboarding and operational rules for AI agents and automated assistants working across multiple retro OS themes in `docs/`.
- **Expected result**: Comprehensive operational documentation in `docs/`:
  1. `docs/agents.md`: Agent rules of engagement, architecture map, verification gates, Vite asset resolution rules, and traps to avoid.
  2. `docs/architecture.md`: Full architectural reference of state management, windowing subsystem, audio pipeline, and theme adaptation engine.
  3. `docs/donor-absorption-audit.md`: Verifiable inventory and consolidation matrix of all donor repos in `/eat/`.
- **Acceptance criteria**: Documents present in `docs/`, fully linked and updated.
- **Files**: `docs/agents.md`, `docs/architecture.md`, `docs/donor-absorption-audit.md`, `docs/tasks.md`.

### TASK-CONSOL-03: 0chan Instant Loop Repository Absorption & Removal
- **Priority**: P1
- **Status**: COMPLETED
- **Problem**: `eat/instant-0chan-master` remained on disk despite all required features (`loops` visualizer, `chpok.mp3`, `favicon.ico`) being natively integrated into `src/apps/loops/`.
- **Expected result**: Verify 100% absorption, remove `eat/instant-0chan-master`, and update audit matrix.
- **Acceptance criteria**: `eat/instant-0chan-master` removed, zero broken imports, build passes.
- **Files**: `src/apps/loops/*`, `docs/donor-absorption-audit.md`.

---

## 5. Quality Verification Pipeline

- **Check Suite**: `npm run verify` && `npm run typecheck` && `npm run lint` && `npm run build` && `git diff --check`.
- **Status**: ALL GATES PASSING.
