# WebOS / Multi-OS project history

> Archive policy: this file preserves prior task registries, retired plans, replaced implementation notes and research snapshots. Nothing is silently discarded. The active source of truth is [tasks.md](./tasks.md); agent operating notes are in [agents.md](./agents.md).

## 2026-11-19 — Previous master task registry snapshot

The previous `docs/tasks.md` was moved here as a verbatim historical snapshot before the active registry was consolidated. Its original task IDs, descriptions, completion claims, estimates, acceptance criteria and audit notes are retained below for traceability. Some statements were later found to be inaccurate or contradicted by current source inspection; consult the active registry and agent notes before relying on any archived claim.

---

# Repository Consolidation & OS Engineering Master Task Registry

## Executive Summary: Retro OS Reconstruction, Absorption & Fidelity Roadmap
Проект `c4m1r.github.io` разрабатывается как некоммерческая, фанатская интерактивная ретро-среда для восстановления эстетики и ностальгии по культовым операционным системам прошлого. Все графические материалы, звуки, стили и фрагменты кода из донорских репозиториев `/eat/` используются исключительно в демонстрационных и образовательно-ностальгических целях для достижения максимального визуального и функционального соответствия оригинальным ОС (Windows XP, Windows 98, Windows 7, Ubuntu, Arch Linux, WebOS, macOS, iOS). Сборка не должна иметь runtime-зависимостей от /eat/, однако донорские исходники всё ещё присутствуют для аудита и выборочного переноса. Нельзя считать /eat/ пустой или удалять оставшиеся материалы до проверки исходников, лицензий и зависимостей. Текущий этап сфокусирован на последовательной глубокой проработке каждой системы: аутентичные звуковые схемы, высокоточные эмуляции классических программ (Winamp 2.x, 0chan Loop, Outlook, Explorer, Media Player), реактивная анимация элементов управления и визуализаторов, и адаптивный UX.

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

### TASK-BIOS-POST-01: Award BIOS POST Hardware & Driver Initialization
- **Priority**: P0
- **Status**: COMPLETED
- **Problem**: The system lacked authentic cold-boot hardware self-test (POST) and driver probing before launching GRUB/OS shells.
- **Expected result**: Realistic `BiosPostScreen` component featuring Energy Star badge, Award Modular BIOS v4.51PG header, dynamic RAM counter (131072K OK), Web Audio 850Hz square-wave POST beep, vintage hard drive spin-up/seek audio (`vintage-hard-drive.mp3`), IDE/PCI device discovery, and real DOS/ACPI driver probing sequence. Hotkeys DEL/ESC/Space immediately skip to GRUB.
- **Acceptance criteria**: Initial page visit starts in BIOS POST; memory tests and beeps; drivers stream; transitions to GRUB cleanly.
- **Files**: `src/apps/bios/BiosPostScreen.tsx`, `src/assets/audio/vintage-hard-drive.mp3`, `src/App.tsx`, `src/contexts/appContextDefaults.ts`.

### TASK-POWER-01: Full-Loop Shutdown & Restart Power State System
- **Priority**: P0
- **Status**: COMPLETED
- **Problem**: Shutting down from OS themes simply dropped back to GRUB without a realistic power-down state, and restart lacked a path back to hardware cold boot.
- **Expected result**: Complete machine power lifecycle with `PowerOffScreen` ("It's now safe to turn off your computer", clickable power button to reboot) and reboot transitions routing back to `BiosPostScreen`.
- **Acceptance criteria**: Shutdown in all shells reaches PowerOffScreen; restarting re-runs POST; power button restarts PC.
- **Files**: `src/apps/bios/PowerOffScreen.tsx`, `src/themes/winxp/index.tsx`, `src/themes/win7/index.tsx`, `src/themes/webos/index.tsx`.

### TASK-TERM-02: Terminal Shutdown Command, Timers & Auto-Scroll Engine
- **Priority**: P0
- **Status**: COMPLETED
- **Problem**: Terminal lacked `shutdown` command capabilities (including countdown timer), suffered from missing auto-scroll when typing and pressing Enter, and lacked pure full-screen background isolation when booted from GRUB.
- **Expected result**: Comprehensive terminal enhancements:
  1. Full `shutdown` suite (`shutdown -h/-s`, `shutdown -r`, `shutdown -t <sec>`, `shutdown -a` abort).
  2. Automatic scrolling to bottom on every keystroke, input change, command execution, and countdown tick.
  3. Solid `#000000` background isolation preventing portfolio site bleeding.
- **Acceptance criteria**: `shutdown -s -t 5` counts down and powers off; `shutdown -a` cancels; typing and pressing Enter auto-scrolls down.
- **Files**: `src/apps/Terminal.tsx`.

### TASK-WIN2000-01: Windows 2000 Theme & Complete Donor Consolidation
- **Priority**: P0
- **Status**: COMPLETED
- **Problem**: Windows 2000 was absent from OS profiles, GRUB boot choices, and theme registries. Donors `eat/windows2000-main` and `eat/windows2000-portfolio-website-main` remained unconsolidated on disk.
- **Expected result**:
  1. Add `win2000` to `ThemeId`, `OsProfileId`, `osProfiles.ts`, `osEditions.ts`, `osClassNames.ts`, `themeConfig.ts`, and `themeStyles.ts`.
  2. Implement authentic Windows 2000 boot screen (white background, Windows 2000 Professional logo banner, segmented loading progress bar, "Built on NT Technology").
  3. Implement authentic Windows 2000 logon dialog ("Log On to Windows", user selection `C4m1r` / `User`, password validation, classic 3D beveled chrome, solid `#3a6ea5` desktop backdrop).
  4. Integrate classic Windows 2000 Start Menu sidebar and taskbar styling.
  5. 100% absorption and removal of `eat/windows2000-main/` and `eat/windows2000-portfolio-website-main/`.
- **Acceptance criteria**: Windows 2000 boots cleanly from GRUB; Space key skips boot screen; logon validates `c4m1r` password; desktop runs with `#3a6ea5` background and classic Start Menu; donor directories removed from disk.
- **Files**: `src/contexts/appContextTypes.ts`, `src/shells/os/osProfiles.ts`, `src/shells/os/osEditions.ts`, `src/shells/os/osClassNames.ts`, `src/themes/themeConfig.ts`, `src/themes/webos/BootScreen.tsx`, `src/themes/webos/LoginScreen.tsx`, `src/shells/desktop/DesktopShellContainer.tsx`, `src/shells/desktop/components/start-menu/StartMenu98.tsx`, `src/styles/os/themes/classic.css`, `docs/donor-absorption-audit.md`.

### TASK-BOOT-SKIP-01: Global Spacebar Boot Sequence Fast-Forward
- **Priority**: P1
- **Status**: COMPLETED
- **Problem**: Cold boot (BIOS POST) and OS theme boot screens required waiting through timers without a quick keyboard skip mechanism.
- **Expected result**: Enable `Space` key (in addition to Enter, Escape, and mouse click) across all boot screens (BIOS POST, Windows XP, Windows 7, Apple macOS/iOS, Windows 98, Windows 2000, WebOS) to skip immediately to desktop/logon.
- **Acceptance criteria**: Pressing Spacebar instantly fast-forwards through BIOS POST to GRUB, and through any OS boot animation directly to login or desktop.
- **Files**: `src/apps/bios/BiosPostScreen.tsx`, `src/themes/winxp/BootScreen.tsx`, `src/themes/win7/BootScreen.tsx`, `src/themes/apple/AppleSessionScreens.tsx`, `src/themes/webos/BootScreen.tsx`.

### TASK-WIN-EDITIONS-01: Windows Multi-Edition Suite, Dynamic Wallpapers & Build Badges
- **Priority**: P0
- **Status**: COMPLETED
- **Problem**: Windows operating systems lacked multi-edition parameter selection, authentic edition-specific wallpapers, and dynamic display of editions and build watermarks across the desktop, Start Menu, Control Panel, and About dialogs. Donors `eat/windows7-ui-portfolio-main` and `eat/Eshwar-win7-master` remained unconsolidated on disk.
- **Expected result**:
  1. Define full edition matrices with labels, descriptions, build numbers, and associated wallpapers in `src/shells/os/osEditions.ts` for all Windows systems (`win-98`, `win2000`, `win-xp`, `win7`, `win8`, `win81`).
  2. Implement reactive edition selection engine with `getActiveEdition`, `setSelectedEditionId`, and `os-edition-changed` event bus.
  3. Dynamic desktop background switching: automatically binds edition wallpapers (`win98-clouds.jpg`, `win7-home.jpg`, `winxp-bliss.jpg`, `desktop-wallpaper.jpg`) or background colors (`#008080`, `#3a6ea5`, `#1c3f6e`, `#152238`, `#1b58b8`).
  4. Display of active edition across system UI: Start Menu headers (XP / 7 / 2000 / 98 SE), Desktop build watermark (`data-build-watermark`), Control Panel interactive edition switcher, and authentic About Windows (`winver`) dialog.
  5. 100% absorption and removal of `eat/windows7-ui-portfolio-main/` and `eat/Eshwar-win7-master/`.
- **Acceptance criteria**: GRUB allows selecting editions for all Windows systems via `E` key; changing editions updates wallpaper, watermark, and Start Menu immediately; Control Panel allows live edition switching; `winver` command opens About Windows; donors removed.
- **Files**: `src/shells/os/osEditions.ts`, `src/shells/os/osBootOptions.ts`, `src/shells/desktop/runtime/desktopOsAttributes.ts`, `src/shells/desktop/DesktopShellContainer.tsx`, `src/shells/desktop/components/start-menu/StartMenu98.tsx`, `src/shells/desktop/components/start-menu/StartMenuXP.tsx`, `src/shells/desktop/components/start-menu/StartMenu7.tsx`, `src/apps/ControlPanel.tsx`, `src/apps/AboutApp.tsx`, `src/apps/GrubMenu.tsx`, `docs/donor-absorption-audit.md`.

### TASK-WIDGETS-01: WebOS & macOS Glassmorphism Desktop Widget Suite
- **Priority**: P0
- **Status**: COMPLETED
- **Problem**: WebOS lacked interactive desktop glassmorphic widgets. Winamp required a unified audio controller so desktop widgets and the full player could coexist without duplicate audio or out-of-sync playback. Real market data, Open-Meteo weather forecasts, and dynamic RSS feeds with IndexedDB caching and customizable sources were missing.
- **Expected result**:
  1. **Winamp Audio Controller**: Created `src/system/audio/winampController.ts` singleton event bridge and unified playback manager (`play`, `pause`, `stop`, `next`, `prev`, `seek`, `setTrack`, `setVolume`, `setRepeat`, `getWebAudio`), ensuring zero duplicate audio between `WinampWidget` and `WinampPlayer`.
  2. **News RSS Feed System & Window**: Built `src/system/widgets/services/rssService.ts` with IndexedDB persistent cache (`webos_rss_db_v1`), automated 14-day record pruning, multi-category support (`#Игры`, `#Ивенты`, `#Железо`, `#Разработка`, `#Аниме`, `#Экономика`, `#Конкуренты`), CORS proxy fallback, and full-featured `NewsRssFeedWindow.tsx` modal viewer with settings management.
  3. **Weather Widget**: Built `src/system/widgets/services/weatherService.ts` using Open-Meteo live API for Moscow, Astana, Almaty, St. Petersburg, Tokyo, and London, rendering WMO weather codes, dynamic icons, humidity, wind speed, precipitation, and hourly forecasts.
  4. **Crypto & Currency Rates**: Created `src/system/widgets/services/cryptoCurrencyService.ts` fetching live BTC/USDT (Binance), USD/KZT, RUB/KZT, and Gold in KZT per gram (fawazahmed0 currency API converted via 31.1034768g troy ounce) with 24h delta percentages and SVG sparkline charts.
  5. **Quotes & Gallery Widgets**: Implemented local bundle of 15 iconic gaming and philosophical quotes with smooth fade transitions, and dynamic art frame widget drawing from `useGallery`.
  6. **System Monitor & Clock/Calendar**: Live CPU, waveform, RAM, and Disk C monitor, alongside analog ticking clock and interactive mini calendar.
  7. **macOS & Generic OS Integration**: Expanded `AppleWidgetGallery.tsx` and `AppleDesktopWidgets.tsx` with toggleable visibility for all widgets, desktop context menu integration, and responsive layout matching the reference design.
- **Acceptance criteria**: WebOS desktop displays glassmorphic widgets arranged per layout reference; Weather widget displays live Open-Meteo data for chosen cities; Winamp widget synchronizes seamlessly with full Winamp player with zero duplicate audio; Currency widget shows live KZT rates for BTC, USD, RUB, and Gold/g; News RSS feed window allows viewing and configuring feeds; widget gallery enables toggling widgets in macOS and other OSes; build and typecheck pass cleanly.
- **Files**: `src/system/audio/winampController.ts`, `src/system/widgets/*`, `src/apps/news/NewsRssFeedWindow.tsx`, `src/apps/winamp/WinampPlayer.tsx`, `src/shells/desktop/DesktopShellContainer.tsx`, `src/shells/desktop/components/AppleDesktopWidgets.tsx`, `src/shells/desktop/components/AppleWidgetGallery.tsx`, `src/shells/desktop/appRegistry.tsx`.

### TASK-WIDGETS-APPS-02: Universal News RSS & Market Rates Apps, Video Wallpaper & Expanded Quotes
- **Priority**: P0
- **Status**: COMPLETED
- **Problem**: News and Currency needed to exist as standalone launchable applications with standard RSS and dollar icons across all operating systems, retaining native OS window chrome. WebOS required setting `Ascii_Blossom.mp4` as an animated desktop wallpaper. The quotes bundle was limited to 15 entries and needed a wider selection of gaming and wisdom quotes.
- **Expected result**:
  1. **News App & RSS Icon**: Created canonical RSS SVG icon `src/assets/icons/rss-icon.svg`. Registered News app globally across WebOS, Windows XP, Windows 7, Windows 98/2000, macOS, and iOS with typical RSS broadcast styling.
  2. **Currency App & Dollar Icon**: Created `src/apps/currency/CurrencyWindow.tsx` and dollar coin SVG `src/assets/icons/currency-dollar-icon.svg`. Registered `currency` app globally with live quotes (BTC, USD, RUB, Gold/g in KZT), instant converter calculator, and refresh tools.
  3. **Native Window Framing**: Both applications launch within `<Window />` with native OS styling and borders across every system (Luna chrome for XP, Aero for Win7, 3D beveled classic for Win98/2000, traffic lights for macOS, dark glass for WebOS).
  4. **WebOS Animated MP4 Wallpaper**: Bound `/src/themes/webos/assets/Ascii_Blossom.mp4` as looping background video in `DesktopShellContainer.tsx` for `webos` theme with subtle overlay.
  5. **Expanded Quotes Collection**: Expanded `src/system/widgets/services/quotesData.ts` to 50 iconic bilingual quotes (Gaming: Mass Effect, Dark Souls, MGS, Skyrim, RDR2, Disco Elysium, DOOM, Deus Ex, STALKER; Wisdom: Turing, Sagan, Einstein, Jobs, Torvalds, Clarke, Asimov, Aurelius, Kant).
- **Acceptance criteria**: News and Currency applications appear on desktops, start menus, launchers, and dock in all OS themes with RSS and $ icons; opening them renders within native OS window frames; WebOS plays `Ascii_Blossom.mp4` in background; quotes widget cycles through 50 quotes; all verification tests pass.
- **Files**: `src/apps/currency/CurrencyWindow.tsx`, `src/assets/icons/rss-icon.svg`, `src/assets/icons/currency-dollar-icon.svg`, `src/system/widgets/services/quotesData.ts`, `src/system/widgets/services/cryptoCurrencyService.ts`, `src/system/widgets/components/CurrencyWidget.tsx`, `src/shells/desktop/DesktopShellContainer.tsx`, `src/shells/desktop/appRegistry.tsx`, `src/shells/desktop/appleIconAssets.ts`, `src/shells/desktop/components/AppleLauncherSurface.tsx`, `src/shells/desktop/components/start-menu/StartMenu7.tsx`, `src/shells/desktop/components/start-menu/StartMenuXP.tsx`, `src/shells/desktop/runtime/desktopAppLauncher.ts`, `src/shells/desktop/shortcutsRegistry.ts`, `src/themes/webos/themeAssets.ts`.

### TASK-CONSOL-03: Complete 100% Absorption and Elimination of the /eat/ Store
- **Priority**: P0
- **Status**: COMPLETED
- **Problem**: 18 donor repositories remained in `/eat/` containing classic Windows 98/95 audio/cursors/icons, Windows 10 Hero wallpapers, Apple iOS/macOS sounds and assets, and portfolio artifacts.
- **Expected result**:
  1. **Windows 98/95 Suite**: Extracted authentic startup sound `windows-98-startup.mp3` into `src/themes/win98/assets/audio/`, retro cursors (`w98-arrow.cur`, `w98-hourglass.cur`, `w98-ibeam.cur`, `w98-pointer.cur`), Clippy animations, Windows 95 branding sidebar (`sidebar95.png`), and classic start buttons. Removed `98.portfolio-main`, `windows-98-portfolio-main`, `wins95Portfolio-main`.
  2. **Windows 10 Suite**: Extracted official Windows 10 Hero wallpaper (`win10-hero.jpg`), Spotlight lock screen (`win10-lockscreen.jpg`), and nature wallpaper (`win10-nature.jpg`) into `src/content/pictures/wallpapers/windows/`. Removed `windows10-portfolio-main` and `kenMaina-windows10-portfolio-main`.
  3. **Apple iOS/macOS Suite**: Canonicalized iOS lock sound (`ios-lock.mp3`), Siri chime (`siri.mp3`), and dock assets. Removed `Iphone-7-Html-Css-Js-main`, `iPhone-12-Clone-main`, `iphone-simulator-main`, `homescreen-main`, `macOS-Portfolio-main 2`, `macos-portfolio-main`, and `playground-macos-main`.
  4. **Portfolio & Typography Suite**: Extracted authentic `MS_Sans.ttf` font into `src/assets/fonts/`, chess sound effects into `src/assets/audio/chess/`, and wave video wallpaper into `src/content/pictures/wallpapers/wave.mp4`. Removed `portfolio-main`, `portfolio-main 2`, `Personal-Portfolio-main`, `alanagoyal-main`, `portfolio2025-master`, and `vovacodes-master`.
  5. **Total Clean**: Zero donor repositories remain in `/eat/`. All 24 donor codebases are 100% absorbed into `c4m1r.github.io`.
- **Acceptance criteria**: `/eat/` is completely cleared from disk; zero external file imports; `npm run typecheck`, `npm run lint`, and `npm run build` pass cleanly; 100% absorption confirmed in `docs/donor-absorption-audit.md`.
- **Files**: `src/themes/win98/assets/*`, `src/content/pictures/wallpapers/*`, `src/assets/fonts/*`, `src/assets/audio/*`, `src/themes/webos/themeAssets.ts`, `docs/donor-absorption-audit.md`.

---

## 5. Quality Verification Pipeline

- **Check Suite**: `npm run verify` && `npm run typecheck` && `npm run lint` && `npm run build` && `git diff --check`.
- **Status**: ALL GATES PASSING.

---

# 6. Current User-Requested Workstream — Desktop, Explorer, Games & Widgets

> **Progress convention:** percentages estimate implementation coverage visible in the repository, not QA confidence. Anything requiring browser interaction or user acceptance remains unverified until tested. This section supersedes older blanket statements above where current inspection shows unfinished work.

## Live progress overview

| ID | Workstream | Progress | Current state |
|---|---|---:|---|
| WEBOS-DESKTOP-01 | WebOS desktop identity and shell fidelity | 60% | Requirements retained: pure black desktop, Arch Linux identity instead of Windows branding, Russian UI, one clock only and Linux-like bottom panel. Existing theme/shell implementation needs a complete visual audit and final polish. |\n| WIDGET-01 | Widget startup policy and WebOS placement | 75% | Code updated: only WebOS defaults to all widgets enabled; other OS widget visibility defaults off; WebOS initial layout is compact, right-aligned, two columns. Browser verification pending. |
| WIDGET-02 | Unified widget size system and adaptive contents | 70% | Three shared dimensions now replace per-widget dimensions; canvas no longer reserves a permanent title bar; responsive sizing and Winamp controls updated. Remaining widget-specific overflow/layout polish and QA. |
| WIDGET-03 | Hover-only widget controls | 75% | Name, drag handle and size selector are now an overlay revealed on hover/focus instead of consuming permanent widget space. Accessibility and touch behavior still require QA. |
| WINAMP-02 | Responsive Winamp modules and accessible controls | 45% | Added narrow-window layout rules, focus-visible outlines and pressed-state semantics for EQ/playlist/shuffle/repeat toggles. Playback controls, module chrome and cross-OS visual behavior still need functional/browser QA. |
| WINAMP-03 | Shared audio DSP pipeline and functional equalizer | 45% | Centralized ten EQ filters, preamp and stereo balance in the singleton `winampController`; the player now uses this shared graph and includes Flat, Rock, Pop, Jazz, Classical, Bass Boost and Vocal presets. Preset persistence, compact-widget controls and browser/audio QA remain. |
| RSS-01 | Restore historical IndexedDB cache | 65% | Refresh now merges/upserts new entries instead of deleting all records from a source; old entries remain inside the existing 14-day retention window. Cache TTL optimization retained. |
| RSS-02 | RSS duplicate prevention and chronological sorting | 60% | Stable article-link IDs, tracking-parameter normalization and cross-source URL deduplication added; publication-date sorting remains. Needs live-feed validation. |
| RSS-03 | RSS collection, category drawer and article reader | 65% | Feed parser, category controls and article reader exist; proxy availability and publisher-specific extraction still need validation. |
| GAME-01 | Repair and replace the non-working DOOM launch path | 30% | Current implementation still depends on Emupedia iframe URLs; iframe onError cannot reliably detect HTTP failures or X-Frame-Options/CSP blocking, so recovery is not dependable. Doom 3 is upstream WIP. /eat/98.portfolio-main contains a separate Three.js survival/FPS game branded 98.DOOM, not original id Software DOOM; license/ownership and assets/dependencies remain unaudited. A reliable playable path is not delivered. |
| GAME-02 | Audit /eat/ and add other working games | 40% | Native Snake and Memory exist alongside Minesweeper. /eat/ still contains game donors, including 98.portfolio-main and its custom 98.DOOM project; a complete inventory, source/license/dependency matrix and selection of additional lightweight games remain pending. Do not copy donor source/assets until provenance, license and dependency compatibility are established. |
| GAME-03 | Minesweeper gameplay fidelity and interaction | 45% | Opening-click mine relocation and correct timer start-on-first-reveal are implemented. Next: chord reveal, keyboard/touch flag controls, difficulty presets, responsive board sizing and visual QA. |
| EXPLORER-01 | Game folder as a native folder with Windows XP tree icon | 55% | Games opens the real Program Files/Games directory in the active OS Explorer, not a custom launcher window. The current folder_program.png mapping must be checked against the intended Windows XP tree/favorites folder icon and corrected if it is not the actual tree icon. Ensure icon, navigation and file launch behavior are consistent in every OS skin. |
| DOCS-01 | Create “Мои документы” and reorganize personal apps | 45% | Virtual filesystem already contains Мои документы with Вики, Мой блок, Обо мне and Мои проекты; verify there are no duplicate standalone desktop items or orphaned app entries and each opens existing content/app in the active OS Explorer. |
| PICTURES-01 | Create “Мои изображения” and expose gallery media as files | 40% | Virtual filesystem enumerates repository images as individual files and adds Bliss.jpg to Мои изображения; verify inventory parity with the full gallery, nested folders, supported formats and absence of the old desktop Bliss shortcut. |
| PICTURES-02 | Merge Picture Viewer and gallery browsing | 55% | Picture Viewer now has a small gallery-mode button in both Apple and Windows chrome; its library grid uses the shared gallery inventory, and the My Pictures app is now a compatibility entry point into that same viewer. Browser polish and validation remain. |
| CONTROL-01 | Control Panel desktop shortcut and native categories | 45% | Control Panel desktop shortcut already exists. Added Task Manager to the System/Performance category and Classic View, plus a Widget Gallery entry that opens the existing widget manager. Task Manager's duplicate desktop shortcut is hidden. |
| CONTROL-02 | Restore authentic Explorer and Control Panel styling per OS | 35% | Windows 7 uses its dedicated Explorer surface and Windows XP retains XP-styled Explorer. Restore original OS-specific Explorer/Control Panel visual language for every supported system (Windows 98/2000/XP/7, WebOS, Arch, Ubuntu, macOS, iOS and other registered profiles), not one generic Windows layout. |
| CONTROL-03 | Desktop shortcut to Widgets and remaining system settings | 20% | Widget Gallery is reachable from Control Panel. Add/verify a dedicated desktop shortcut to the existing widget manager and ensure Control Panel, context menu and widget gallery use the same underlying manager. |
| THEMES-01 | Add all gallery images to Appearance & Themes | 45% | Appearance and Themes now reads the complete shared gallery inventory rather than only the wallpaper subset, making gallery pictures available as wallpaper choices. Need verify previews and selection persistence across themes. |
| DOCS-02 | Maintain an accurate task register | 90% | This active workstream and implementation percentages are now documented. Keep percentages synchronized with actual commits and do not mark browser-only behavior complete before user verification. |

## Detailed requirements and acceptance criteria

### WEBOS-DESKTOP-01 — WebOS desktop identity
- Keep the WebOS desktop background completely black.
- Use the Arch Linux identity/icon instead of Windows branding on the WebOS desktop.
- Keep desktop labels and shell controls in Russian.
- Render exactly one clock; do not duplicate the clock in both the desktop widget and system panel.
- Keep the Linux-like bottom panel and preserve the WebOS-specific widget area on the right.
- Do not enable the desktop widgets by default in other OS themes.

### WIDGET-01 — Widget defaults and WebOS layout
- Only WebOS starts with widgets enabled by default.
- WebOS starts with all available widgets visible, arranged at the right side of the desktop in exactly two columns on desktop-sized screens.
- Other operating systems start with all widgets disabled; users explicitly enable them through the widget gallery.
- Preserve each user's manual arrangement after the initial layout.
- On narrow screens, degrade gracefully to one column rather than clipping widgets off-screen.

### WIDGET-02 — One size scale for all widgets
- Every widget uses the same three preset dimensions: Compact, Standard and Wide.
- Widget internals must adapt to the actual available width and height; no hard-coded minimum width/height may force overflow.
- Winamp Compact must show previous, play/pause and next controls, as well as its progress control.
- Verify Clock/Calendar, Weather, Quotes, Currency, System Monitor, News, Gallery and Winamp at all three sizes.

### WIDGET-03 — Invisible chrome until interaction
- Widget title, drag grip and size selector must not occupy permanent layout space.
- Show these controls as an overlay only while hovering or focusing the widget.
- Keep the current visual style intact when controls are hidden.
- Touch users must still have a discoverable way to reveal and operate widget controls.

### RSS-03 — News RSS Feed interaction
- Keep the category filter as a left-side slide-out panel inside the News RSS Feed window, not as a separate desktop widget.
- Each article's “Подробнее” action expands the reader across the available window width and keeps the title/toolbar usable while the article body scrolls.
- Display article images and the full content actually available from the feed or a readable publisher page.
- Distinguish a complete RSS article from a short excerpt; never label an excerpt as a full publisher article.
- Preserve the original article link as a fallback when publisher CORS, paywalls or proxy restrictions prevent full-page extraction.

### RSS-01/02 — Historical cache and deduplication
- Preserve the existing IndexedDB-based cache and 15-minute freshness window; do not replace it with a full source wipe on refresh.
- New publications are merged into the historical cache. A shorter feed response must never delete older still-valid cached stories.
- Keep the existing rolling 14-day retention policy unless explicitly changed later.
- Deduplicate by canonical article URL across feeds, removing tracking parameters and fragments; use a safe title/source fallback only when a feed item has no article URL.
- Both RSS parser paths must generate the same stable identity for the same article.
- Always sort by original publication date descending; unknown dates belong at the end.
- The compact News widget must display the cached list immediately and still trigger a TTL-aware refresh so stale caches do not remain indefinitely.
- Failed feeds must not erase cached records; partial failures must not block successful feeds.
- A successful empty feed response does not erase historical entries.

### WINAMP-03 — One shared audio processing pipeline
- Keep a single audio element and processing graph in `src/system/audio/winampController.ts`; widgets and full player must never create parallel playback or independent DSP graphs.
- Route playback through ten peaking EQ filters, preamp, stereo balance/panner and analyser in a stable order; expose state-changing methods from the controller rather than keeping audio nodes inside the React view.
- EQ bypass must neutralize both band filters and preamp without resetting the user's saved slider values.
- The full player and compact Winamp widget must read/write the same EQ and balance state.
- Added named presets (Flat, Rock, Pop, Jazz, Classical, Bass Boost and Vocal); preset selection updates the same controller values as manual slider changes. Next: user preset save/restore and persistence.
- Skin system target: keep playback/DSP independent from presentation. Support multiple Winamp layouts/skins without cloning audio logic; preserve OS-native window chrome where the application is hosted inside a system window.
- Verification: check that changes are audible across all bands, preamp and left/right balance; EQ bypass is level-neutral; switching views does not reset audio or create a second source; test browser autoplay and context resume behavior.

### GAME-03 — Minesweeper gameplay and presentation
- Winamp visual/interaction reference: [captbaritone/webamp](https://github.com/captbaritone/webamp). Use it to compare module behavior, playlist interaction, transport controls and responsive layout; retain the current shared `winampController` and local audio pipeline.
- Use the current native React implementation and existing sprite assets as the canonical baseline; avoid importing a second game engine.
- Keep the opening move safe by relocating a mine when the first revealed cell would otherwise explode, then recompute all adjacent-mine counts.
- Start the timer on the first reveal, never when placing a flag.
- Next implementation targets: number chording (open adjacent covered cells when the surrounding flag count matches), accessible keyboard controls, touch-friendly flag mode, difficulty presets with validated board dimensions, and responsive board sizing.
- Keep the classic Windows Minesweeper visual language while ensuring the app remains usable inside each OS window size.
- Reference projects for UI/interaction study only: [captbaritone/webamp](https://github.com/captbaritone/webamp) and [1j01/jspaint](https://github.com/1j01/jspaint). Do not copy their code wholesale or add unnecessary runtime dependencies.

### GAME-01/02 — Games and DOOM
- Audit actual source code and assets under /eat/; do not assume /eat/ has already been cleared.
- Emupedia URLs now use the current live root routes for Doom 1 and Doom 2 rather than the obsolete /beta/emuos/ prefix. The iframe declares gamepad, pointer-lock, autoplay and fullscreen permissions, has no restrictive sandbox, and offers a direct-launch fallback. Doom 3 is upstream WIP and must be presented as such. The donor's 98.DOOM is a custom Three.js survival game, not the original id Software DOOM engine; no LICENSE file was found in that donor. Do not copy its source until its license/ownership is established.
- Prefer self-contained implementations already present in /eat/ over external iframe links.
- Added original native Snake and Memory implementations; the Games directory now contains launch entries for DOOM 1/2/3, Minesweeper, Snake and Memory. Audit candidate Breakout and 2048 implementations under /eat/; add only after license, asset and dependency checks.
- Document donor source, license status, copied assets, runtime dependencies and selected integration path for every added game.

### EXPLORER-01 / DOCS-01 — Native folder structure
- Game folder is now a normal filesystem folder opened by the current OS Explorer, not the old custom DOOM-card window. The current directory contains Minesweeper; populate it with DOOM and other integrated games after their implementations are ready.
- Use the Windows XP tree/folder icon for the Game folder in the XP theme, with appropriate theme-specific icon fallback elsewhere.
- Added “Мои документы” as a real folder in the virtual filesystem.
- Added Wiki, “Мой блок” (Notepad), “Обо мне” and “Мои проекты” entries inside “Мои документы” and removed their standalone desktop shortcuts.
- Opening those entries must launch the existing native content/application surfaces through the current OS Explorer.

### PICTURES-01/02 — Unified picture library
- Added “Мои изображения” as a real folder.
- The repository picture collection is now enumerated into individual file entries, retaining its folder hierarchy.
- Added a Bliss.jpg file entry inside “Мои изображения” and removed its standalone desktop file shortcut.
- Picture Viewer now has a small toolbar toggle to switch between image viewing and a gallery/grid view of the shared image inventory.
- The My Pictures application now opens the gallery mode of Picture Viewer; both modes share one image inventory and selection state rather than maintaining two separate pseudo-applications.

### CONTROL-01/02/03 — Control Panel
- Add a desktop shortcut to Control Panel in each relevant OS.
- Windows 7 now uses the dedicated Windows 7 Explorer surface; Windows XP keeps the XP-styled Explorer. Complete and refine the native Explorer view for Windows 98 and the other supported OS themes.
- Organize settings into recognizable categories (e.g. System and Security, Appearance and Personalization, Network and Internet, Hardware and Sound, Programs, User Accounts, Accessibility); adapt names/layout to the active OS rather than forcing one Windows version everywhere.
- Task Manager is now exposed from the System/Performance category and Classic View, and its app registry no longer maps it to Control Panel. Keep its standalone desktop shortcut hidden to avoid duplication.
- Added a Widget Gallery entry to the Appearance category and Classic View; it opens the existing widget manager through a shell event. Add any remaining system-setting shortcuts as their underlying surfaces are completed.

### THEMES-01 — Appearance and Themes
- Appearance and Themes now uses the complete gallery item collection (not just the dedicated wallpaper subset) as available desktop background/theme imagery.
- Preserve grouping, preview thumbnails, current wallpaper selection and per-OS visual styling.
- Do not add broken or remote-only image paths; all selected media must resolve from repository assets.

## Audit correction: /eat/ status
An earlier section in this document claims that /eat/ was completely cleared and that all donor repositories had been removed. That statement is stale and is **not currently accurate**: the current repository tree still contains /eat/98.portfolio-main/, including src/components/programs/DOOM/ engine/source files (doom.tsx, doom-game.tsx, game-engine.ts, constants.ts, textures.ts, sprite-data.ts, chunks.ts, audio.ts, rng.ts, types.ts). Do not delete this donor until the selected DOOM implementation and any required assets have been audited and integrated. Re-run the full donor inventory before claiming /eat/ is empty.

## Verification status
- Code-level edits in the widget and RSS workstreams are committed only after review of the resulting diffs.
- No browser interaction, manual gameplay, live RSS publisher verification or visual QA is represented as complete by the percentages above.
- CI status must be reported per exact commit SHA; a prior successful workflow does not prove later commits pass.

## Refinement pass — 2026-11-19 (user-confirmed scope)

Percentages are repository implementation estimates, not QA confidence. User reports that current DOOM implementations do not work; a URL, iframe or launch button is not a playable game until gameplay is actually verified.

### GAME-01 — DOOM: root-cause repair and reliable playable build
- Re-audit src/apps/doom and all launch routes. Current DoomPlayer loads Emupedia in an iframe. Its onError handler cannot reliably detect remote HTTP errors, blocked framing (X-Frame-Options/CSP), missing game data/WADs or runtime boot failures. Replace optimistic loading with explicit, testable loading/error/recovery states.
- Recheck upstream URLs, build directories, required data files, browser compatibility, iframe policy and input/audio/pointer-lock behavior. Do not label a remote page playable merely because the host responds.
- Inspect /eat/98.portfolio-main/src/components/programs/DOOM/ fully: doom-game.tsx, game-engine.ts, constants.ts, textures.ts, sprite-data.ts, chunks.ts, audio.ts, rng.ts, types.ts, manifests, public assets and imports. This is a custom Three.js first-person survival game branded 98.DOOM, not original id Software DOOM. Establish code and asset provenance/license before copying. No license has been verified; absence of a LICENSE file is not permission.
- Prefer a genuinely local/self-contained playable build when legally usable source and required game data are available. Otherwise provide a transparent external launch route with verified host compatibility and useful fallback; never present a broken iframe as finished.
- Keep Doom 3 marked WIP/unavailable unless independently verified playable.
- Acceptance: test every advertised build inside the actual app window; verify gameplay, keyboard/mouse, pointer lock acquire/release, sound, resize, restart and error recovery. Record browser/device and exact build. Count a game complete only after gameplay is confirmed.

### GAME-02 — /eat/ game inventory and additional titles
- Inventory every game-related donor folder/source in /eat/. Record title, donor path, entry point, assets, runtime/build dependencies, license/provenance, compatibility, bundle impact and integration decision.
- Inspect candidate games for complete source/assets; reject demos dependent on unavailable APIs, remote services, missing binaries or unlicensed media.
- Add several suitable games as independent entries in the real Program Files/Games virtual folder. Prefer lightweight self-contained implementations and reusable game-shell/input/fullscreen patterns; avoid duplicate engines/libraries where existing code suffices.
- Keep game identity, icon, description, controls and status (Playable / WIP / External) explicit. Launch through normal file associations/app registry and active OS Explorer.
- Acceptance: every Playable title starts and is playable; no dead buttons, missing assets or unverified claims. Update donor audit and license notes.

### EXPLORER-01 — Games folder as a normal folder
- Keep Games as an ordinary virtual-filesystem directory. Opening it uses the current OS Explorer and shows files/shortcuts with normal file associations; do not replace it with a custom DOOM collection card app.
- Use the recognizable Windows XP tree/favorites folder icon (tree-bearing folder, not generic plain/program folder) for XP Games and theme-appropriate icon variants elsewhere. Confirm the exact source asset before changing imports.
- Game file entries must launch real app IDs, with names/icons/status consistent with the game catalog.

### DOCS-01 — My Documents structure and cleanup
- Мои документы is the canonical parent for Вики, Мой блок, Обо мне and Мои проекты. Preserve existing app IDs/content and open each item through active OS Explorer.
- Remove duplicate standalone desktop shortcuts for these entries where they should live in My Documents; do not remove apps from registry, Start Menu or other intentional navigation surfaces.
- Verify folder placement/open behavior across OS themes, including navigation and reopening windows.

### PICTURES-01/02 — One image library and two viewer modes
- Мои изображения is a normal folder under the user profile. Expose every image present in the site's gallery as an individual file entry, preserving useful subfolders and extensions. Include bliss.jpg here and remove its separate desktop shortcut; retain the source image for gallery/wallpaper use.
- Unify Picture Viewer and the former Мои изображения pseudo-app: one shared gallery inventory, current-image state and viewer surface. A small toolbar button in Picture Viewer toggles single-image mode and a thumbnail grid of all gallery images. Opening Мои изображения opens that same app directly in grid mode, not a second viewer.
- Opening an image file in Explorer opens shared Picture Viewer on that exact image. Grid selection switches to single-image mode; navigation/reopen must not create stale duplicated state.
- Acceptance: inventory count matches site gallery; every thumbnail/file association resolves; supported formats open; no duplicate viewer implementations or desktop Bliss file remain.

### CONTROL-01/02/03 — Control Panel, widgets and OS-native styling
- Add/keep a desktop shortcut to Control Panel and a separate desktop shortcut to the existing Widgets/Widget Gallery manager. Both open the same canonical surfaces used by shell/context menu.
- Rebuild Control Panel as category navigation with active OS visual conventions. Include appropriate categories for System/Performance, Appearance & Themes/Personalization, Network & Internet, Hardware & Sound, Programs/Applications, User Accounts and Accessibility; adapt names/order to the emulated OS.
- Place Task Manager inside System/Performance and retain access through Classic View. Avoid duplicate Task Manager desktop icons unless explicitly requested.
- Restore original Explorer and Control Panel styling per OS, not one generic Windows frame. Preserve theme-specific title bars, toolbars/address/navigation, icons, typography, spacing, menus, category layout and responsive behavior.
- Acceptance: Control Panel and Explorer look recognizably native for each supported OS; category entries open working settings/apps; widget shortcut opens the same manager; no dead placeholder categories.

### THEMES-01 — Complete gallery in Appearance & Themes
- Include every image from the site's shared gallery, not only wallpaper subset, in Appearance & Themes. Use local repository assets and the same inventory as My Pictures/Picture Viewer.
- Keep thumbnails, grouping, preview, fit/fill positioning and apply/cancel coherent. Verify wallpaper selection persists after switching OS profiles and reload.

### DOCS-02 — Task registry maintenance
- Keep docs/tasks.md as the single master registry for the active WebOS/desktop workstream. Update status/percentage only after inspecting implementation; distinguish implemented, partial, blocked by provenance/license and manually verified.
- Preserve completed task history. Do not mark 100% because a shortcut/component/config exists; use acceptance criteria and runtime checks.

### /eat/ game-source audit snapshot — 2026-11-19

Repository tree search identified these concrete candidates (this is a source inventory, not a license clearance or gameplay test):
- eat/alanagoyal-main: Chess and Solo Games modules, chess.js-based logic, sound assets, tests and Supabase-backed multiplayer/API/migrations. LICENSE.md is MIT (Copyright 2024 Alana Goyal). Prefer only isolated self-contained solo-game logic; do not port server/matchmaking/Supabase features into this static site. Audit every asset separately.
- eat/windows7-ui-portfolio-main: Chess.tsx, Solitaire.tsx and Windows 7 game icon assets (Chess, Checkers, FreeCell, Hearts, Mahjong, Minesweeper, Solitaire, Spider Solitaire, Purble Place). Repository LICENSE is MIT (Copyright 2026 Gividu Elladeniya). The project uses a newer React/Next/Tailwind stack; extract/adapt individual components only after dependency and asset provenance review. Do not copy the whole application or its framework dependencies.
- eat/Personal-Portfolio-main: SnakeGame.tsx and MemoryGame.tsx are present, but no LICENSE/LICENCE/COPYING file was found at repository root. Existing native Snake/Memory in src remain canonical; do not replace them with this donor source without permission.
- eat/wins95Portfolio-main: MineSweeper.jsx and CSS/assets are present; repository LICENSE exists. Existing native Minesweeper remains canonical; use this donor for reference only unless a specific missing feature is identified and provenance/assets are checked.
- eat/98.portfolio-main: custom 98.DOOM Three.js game files and Three.js dependency are present; no root LICENSE/LICENCE/COPYING file was found. README identifies it as a Windows 98 portfolio demo. Do not port its code or artwork until rights are established. It is not a classic DOOM engine.
- Other matches in the tree include game UI/icon references in macOS/iOS/Windows donor folders; a filename match alone is not evidence of a complete playable game.

Next source-review priority: inspect the MIT Chess/Solitaire components and their exact imports/assets, identify which solo games are self-contained, then choose additions that do not require Supabase, API routes, remote services or an extra game engine. Keep attribution/license notices with every reused code fragment and independently verify third-party fonts, sounds, sprites and icons.

## 2026-11-19 — Consolidation decision

- No `tasks.md` exists in the repository root; the canonical registry remains `docs/tasks.md`.
- The former master registry is preserved above rather than deleted.
- Newer implementation requirements and corrected progress assessments are maintained in the active registry.
- Historical completion labels are not proof of current runtime behavior. Re-verify against source and acceptance criteria.


### 2026-11-19 — Widget Gallery, Start Menu, profile filesystem and locales
- Added explicit OS-family presentation to the shared Widget Gallery, replaced emoji glyphs with Lucide icons and added distinct styles for classic Windows, XP, Windows 7, Windows 10/11, Ubuntu, Arch, macOS and WebOS. The CSS is loaded through the global OS stylesheet; runtime visual acceptance remains pending.
- Restored Explorer app icons by resolving `FileSystemItem.appId` before generic document icons, using existing XP asset keys.
- Routed XP/Windows 98/2000 Search/Find to Explorer search mode, fixed All Programs to open `Program Files\\Programs`, and made unsupported XP Start Menu entries inert/disabled instead of dispatching fake unavailable apps.
- Added a shared profile alias for `C:\\Users\\C4m1r` and modern folder aliases while retaining the legacy `C:\\Documents and Settings\\C4m1r` paths. Windows 7 Start Menu and Explorer now use the modern paths.
- Organized `Program Files\\Games` and `Program Files\\Programs` by publisher/author folders (id Software, Microsoft, Nullsoft, C4m1r).
- Added Belarusian (`be`) and Kazakh (`kk`) locale selection, detection and persistence. Core shell/navigation labels are translated; long-form translation coverage is still partial and uses Russian fallback.
- All changes were committed directly to `main`. No local verification commands or browser acceptance were run in this pass; check the latest GitHub Actions deployment workflow before treating the build as green.


### 2026-11-19 — Start Menu event propagation, DOOM surface and game sprites
- Fixed the Start Menu dead-click root cause: desktop mousedown handling was closing/unmounting the menu before child click handlers fired. Start Menu wrapper now stops mousedown and click propagation.
- Added Network Neighborhood to the virtual filesystem and classic/XP/Windows 7 Start Menu navigation.
- Implemented expanding All Programs lists in XP and Windows 7 and a cascading Programs submenu in Windows 98/2000. IE and Outlook Express now share the normal XP pinned-row sizing without special tags.
- Corrected the canonical Programs path to `C:\\Program Files\\Programs`.
- Removed DOOM's Emupedia/wasm-doom footer, warning tip and duplicate iframe-loaded status overlay. Retained header external launch and error-only fallback. No gameplay verification implied.
- Corrected Minesweeper's sprite-sheet CSS after inspecting PNG dimensions: all three source sheets are vertical, while prior CSS expected horizontal strips. Updated cell, digit and smiley offsets.
- Restored Explorer icons for games/programs through appId-specific asset mapping; added Snake and Memory SVG icons and mapped DOOM/Minesweeper to dedicated artwork.
- Automated and manual acceptance remain pending for the latest commit; do not mark these workstreams complete until CI and browser tests pass.


### 2026-11-19 — RSS empty feeds, GUID identity and refresh health
- Corrected RSS fetch semantics: rss2json `status: ok` with an empty `items` array is a successful empty feed; XML fallback validates RSS/RDF/Atom documents and returns an empty list for valid feeds without entries rather than a false transport failure.
- Persisted GUID/Atom ID in article records. Dedup identity prefers canonical URL after removing fragments/tracking parameters, then absolute or opaque GUID, and finally source+title fallback.
- Preserved additive IndexedDB history merge. A successful empty feed does not delete cached records; short feeds and failed feeds cannot wipe the cache.
- Added persisted refresh metadata for attempt/success times, success/failure counts and success/partial/failed/disabled status. Partial and total failures use a short retry window; a complete refresh receives the normal TTL.
- News RSS Feed paints cached articles before refresh completes, displays last successful update time, reports partial source failures and stale-cache fallback, and retains its in-app category drawer.
- Automated CI for commit `1b204318f798ad90f73f0539c4027f9c2a5d1296` passed verify, typecheck, lint, build and build-output verification; GitHub Pages deployment succeeded. Follow-up retry-window and documentation commits require their own latest-main CI run. Live feed reachability and browser behavior remain unverified.


### 2026-11-19 — DOOM chrome, desktop shortcuts, music associations and project articles
- Compact DOOM/DOOM II player header: game title, reduced subtitle, truncated one-line description and build/external-launch controls share one horizontal row. The player retains only the error fallback; no success tip, Emupedia footer or duplicate iframe-loaded overlay is rendered. This is a layout change, not gameplay verification.
- Desktop Games and Programs are represented by shortcut folders under the C4m1r Desktop profile. Their `targetPath` aliases resolve to the canonical Program Files Games/Programs nodes; the desktop does not duplicate the installed folder trees.
- Added a second `User` profile visible through both legacy `Documents and Settings` and modern `Users` paths, with standard profile folders and shared media/project folder structure.
- Populated My Music with the 58 existing Winamp playlist entries as virtual `.mp3` files. Double-click selects the matching shared playlist index, starts playback and launches/focuses Winamp.
- Explorer icon view now renders app icons at the full 64px icon cell size; thumbnail images fill their thumbnail frame. Winamp receives its own icon asset mapping.
- Project folder generation now parses frontmatter titles, uses stable slug-based IDs, sorts source paths and suppresses duplicate project slugs. Project `.md` files open in a rendered Markdown article surface rather than the raw Notepad editor.
- Classic Windows Start Menu uses the theme's native Internet Explorer, Outlook Express, Media Player and Winamp artwork. XP All Programs is a visible keyboard-addressable fly-out; Network Neighborhood paths are normalized to the shared My Computer folder.
- Minesweeper sprite elements now have explicit display/flex dimensions and pixelated rendering for cell, flag, bomb, digit and smiley sheets.
- Verification remains pending. Earlier CI caught a JSX nesting issue in the new DOOM header; the closing tag was corrected in commit `6875f22f`. Check the latest-main workflow and complete manual interaction checks before accepting.


### 2026-11-19 — Control Panel navigation and lazy project articles
- Added a shared `explorer:open-path` event bridge so Control Panel categories can open the same Explorer windows and virtual filesystem used elsewhere.
- Category cards and classic applets now route Programs to `C:\\Program Files\\Programs`, User Accounts to `C:\\Users`, Network to My Computer/Network Neighborhood, Date & Time to the Calendar app, Task Manager to its registered window, and Widgets to the existing Widget Gallery. Apple routes remain in Apple settings surfaces; hardware/sound and non-Apple accessibility still use the System & Device Info surface and need deeper dedicated controls.
- My Projects now indexes the same two sources and filename-ID precedence as `loadAllProjects()`: root standard projects first, then nested `content/about/projects` entries not already represented. The folder stores lightweight paths rather than eager Markdown bodies; article contents and localized frontmatter are loaded only on double-click.
- The previous eager Markdown import was removed to avoid duplicating large project text in the initial bundle. The article reader uses the shared Markdown renderer.
- Verification: latest source workflow is pending; earlier snapshot `7f50b5ef` passed Typecheck, Lint, Build and Deploy. Do not infer the newer Control Panel and lazy project changes are green until their own latest-main run completes.


### 2026-11-19 — Shared picture and wallpaper inventory
- Updated `gallery.loader.ts` so `loadPictures()` excludes the wallpaper subtree and `loadWallpapers()` includes nested wallpaper folders. The two media types no longer duplicate the same direct wallpaper files in the shared gallery.
- Gallery IDs now use relative paths under `content/pictures` / `content/pictures/wallpapers`, avoiding collisions when different subfolders contain files with the same basename.
- My Pictures continues to index the complete picture tree, including wallpapers; the shared gallery and wallpaper picker now expose the same assets with distinct picture/wallpaper media types.
- Manual inventory acceptance (gallery, wallpaper picker, Explorer, Picture Viewer) remains pending.
