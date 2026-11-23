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


### 2026-11-19 — Explorer icon scale, Minesweeper sprites and ICS recurrence sets
- Explorer's normal large-icon view now gives app icons an explicit 64×64 rendered box with `object-contain`; this fixes the case where `max-width`/`max-height` only constrained native-size assets and left small application icons visually tiny. Desktop shortcut images and system glyphs were raised to 64px while preserving the existing desktop grid spacing.
- Minesweeper now pins cell/digit/smiley sprite dimensions and background sizing so global OS theme CSS cannot collapse or rescale the sprite sheets. On loss, all mines are revealed and incorrectly placed flags use the existing wrong-flag sprite.
- Calendar ICS parser now reads repeated/comma-separated RDATE and EXDATE date values, including TZID parameters. Recurrence expansion merges explicit RDATE instances with RRULE instances, deduplicates by start timestamp, and filters EXDATE matches. RDATE PERIOD values remain unsupported rather than assigning an invented duration.
- Verification for these latest commits is pending; inspect the latest GitHub Actions run and manually verify Explorer large icons, Minesweeper sprite states, and ICS recurrence fixtures before acceptance.


### 2026-11-19 — Appearance gallery filters and wallpaper placement
- Appearance & Themes now uses the shared `useGallery()` inventory and provides All / Wallpapers / Pictures filters with visible result counts. The selected image preview reflects the current placement mode and offers explicit Apply and Cancel actions.
- Added persistent desktop wallpaper placement preferences: Fill (`cover`), Fit (`contain`), Stretch (`100% 100%`), Tile (`repeat`) and Center (`auto`, centered). Control Panel emits a dedicated fit-change event; DesktopShellContainer applies the selected mode without duplicating wallpaper state. Storage reads are guarded for restricted environments.
- DOOM II header now displays `Doom II` with the smaller `Hell on Earth` subtitle, keeping the description and right-aligned build/external controls on the same compact row.
- Richer image folder/tag grouping and cross-OS/reload visual acceptance remain open. Latest CI for the final code/docs commit must be checked before calling this verified.


### 2026-11-19 — Automated verification checkpoint
- GitHub Actions build job for code commit `c5c6bd39deb5179063e551228423f50ef43bc36c` passed context-boundary verification, TypeScript, ESLint, Vite build and build-output verification.
- The Pages deploy job was queued after the successful build at the time of this note; verify its final result separately. No browser/manual OS acceptance was run.


### 2026-11-19 — Widget entry points, gallery night mode, wallpaper layout and Explorer shortcuts
- Windows no longer receives a generic desktop Widgets icon. Windows 7 exposes the canonical **Gadgets** command in the desktop context menu; macOS retains **Edit Widgets…** in its context menu. Non-Windows/non-macOS desktop shells keep a dedicated Widgets entry point. Vista Sidebar itself is not a separate theme in this repository.
- The shared Widget Gallery now has a persisted night palette and localized labels/descriptions for all nine supported locales: English, Russian, French, Spanish, Chinese, Japanese, Korean, Belarusian and Kazakh. OS-specific presentation remains shared through the existing shell classes.
- Appearance & Themes wallpaper picker now defaults to three columns. Its gear control offers 3-column and 2-column layouts, persisted locally. Selected-image preview is wider and taller (4:3 rather than 16:9). Gallery filters, counts, empty/loading states, placement modes and actions have locale strings for all nine supported languages.
- Desktop Games/Programs aliases now retain their canonical Program Files target paths while exposing a flat view of launchable shortcut files in Explorer. Publisher folders remain in the canonical Program Files trees; the desktop aliases no longer expose only those publisher folders.
- App icon resolution now uses specific assets for Picture Viewer, Calendar, RSS, currency, Help, Task Manager, Terminal and Winamp in addition to existing game/browser/media icons. Generic file fallbacks no longer override an appId-specific icon.
- Minesweeper's revealed zero-neighbour cells now render as genuinely blank cells. Number sprites 1–8 remain the boundary hints around cleared regions; the zero sprite is not displayed.
- Verification: source edits were committed directly to main; latest workflow run must be checked after all commits. No browser-level visual/gameplay acceptance was performed. Widget Gallery night mode is scoped to the gallery surface; a system-wide dark appearance mode is not claimed as implemented.


### 2026-11-19 — Canonical gadget picker, locale coverage and CI verification
- Windows 7's shared widget manager now presents as a tiled Aero-style Desktop Gadget Gallery rather than a generic vertical settings list. Its title and entry-point labels are localized; the Windows 7 entry is the desktop context-menu Gadgets command. Vista Sidebar remains a documented platform reference because this repository has no separate Windows Vista shell.
- Widget Gallery night-mode control and all widget titles/descriptions/preset labels are localized across en/ru/fr/es/zh/ja/ko/be/kk. Wallpaper picker uses three columns by default, a gear menu for 3/2 columns, and a larger 4:3 preview; its gallery and placement UI also has all nine locale variants.
- Desktop widget entry labels are localized across all supported languages. Windows themes do not receive a generic desktop Widgets shortcut; macOS uses its native Edit Widgets context menu; non-Windows/non-macOS desktop shells retain a Widgets desktop entry point.
- Program Files app icon registry now covers every appId referenced by FileSystem.ts, including About. Desktop Games/Programs aliases flatten publisher-organized entries into launchable shortcuts while preserving their canonical target paths and Program Files trees.
- Minesweeper zero-neighbour cells are blank; only positive adjacent-mine counts render number sprites. No gameplay/browser visual acceptance was performed.
- GitHub Actions run 44524708630 for source commit 26784410a66354080cd7d7524d5d37f3ad4466e6 passed context-boundary verification, TypeScript, ESLint, Vite build, build-output verification and GitHub Pages deploy. This is automated verification only; manual OS and gameplay checks remain open.
- Widget Gallery night mode is scoped to the gallery surface. No system-wide dark appearance mode is claimed.

## Moved from tasks.md — 2026-11-23

Completed records moved verbatim from the active registry on 2026-11-23: the recent change log, dated implementation updates, STYLE-02, REF-02 round 2, ARCH-01 steps, typecheck and the 2026-11-23 loading, boot, sound and cursor work. Open follow-ups inside those records are listed in the active registry under "Remaining 1:1 OS design tasks".

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

### WINAMP-02 — Shared DSP and equalizer presets
- One singleton `winampController` owns the audio element, Web Audio graph, ten peaking EQ filters, preamp, stereo panner and analyser. UI components must not create parallel media elements or processing graphs.
- Full player band/preamp/balance controls route through the shared controller. EQ bypass neutralizes both the ten filters and preamp while preserving slider values.
- Named presets available in the full player: Flat, Rock, Pop, Jazz, Classical, Bass Boost and Vocal.
- EQ enabled state, ten band gains, preamp and stereo balance now persist in local storage under a versioned key; the preset selector resolves the active named preset from restored values. Built-in Flat/Rock/Pop/Jazz/Classical/Bass Boost/Vocal profiles remain separate from up to 30 user presets; custom profiles support save/update by name, selection, deletion and versioned local persistence. Winamp `.eqf` and multi-preset `.q1` libraries can be imported (all records, merging by preset name); the current EQ curve exports as `.eqf`, while built-in and custom profiles export together as a native `winamp.q1` library. EQF values use Winamp's native 0–63 reversed slider encoding and fixed 257-byte name records. Preset controls use a dedicated compact row below the EQ curve so the classic header does not overflow. Remaining: expose shared EQ state in compact widget controls; verify audible filter response, bypass level, EQF round-trip against Winamp/Webamp fixtures and state continuity between full player/widget.
- Skins must remain presentation-only and must not fork playback, queue or DSP state.

### WINAMP-04 — Keyboard transport and navigation
- The full player registers shortcuts only while its component is mounted; listener cleanup is required on close/unmount. Do not add a second playback state or audio engine.
- Transport mapping follows classic Webamp/Winamp conventions: Z previous, X play, C pause, V stop, B next; R toggles repeat; S toggles shuffle; L opens the local audio picker.
- Arrow Left/Right seek by 5 seconds; Arrow Up/Down adjust volume by 5 percentage points. Clamp seeking and volume to valid ranges.
- Ignore shortcuts while focus is in an input, textarea, select, editable region or textbox so playlist selection, EQ controls and sliders retain normal keyboard behavior. Do not intercept modified or repeated key events.
- Main transport buttons expose their matching shortcut through tooltip and `aria-keyshortcuts`.
- Acceptance: verify every shortcut while the player is open, verify no action after close, test focus guards on EQ sliders/preset controls and playlist interactions, and confirm arrows do not scroll the page when used as player shortcuts.

### WINAMP-03 — Editable shared playlist
- The controller owns a mutable queue initialized from the shared project media catalogue. All player/widget commands continue to use the same current track and queue.
- Playlist supports adding local audio files through the browser file picker, multi-selection (Ctrl/Cmd-click), select-all, removal of selected entries, and current-track preservation when other entries are removed.
- Drag-and-drop reordering is handled by the shared controller; the active track is located by stable track ID after a move, so its playback position is not accidentally reassigned to another song. Audio files can also be dropped onto the playlist surface.
- Local file metadata is read asynchronously to populate track duration labels. A dedicated `winamp:playlist-changed` event keeps queue rendering synchronized without forcing playlist rebuilds on every playback time update.
- Local object URLs are revoked when their queue entries are removed; unknown local-file durations are excluded from the total-duration calculation.
- M3U import/export now supports `#EXTM3U` and `#EXTINF` metadata, absolute HTTP(S) track URLs, and explicit skipped-entry reporting. Relative paths and `file://` entries are skipped because a browser file picker does not expose the playlist's parent directory; HLS `#EXT-X-*` manifests are rejected rather than misread as track lists. Export writes portable web URLs and excludes transient `blob:` local-file URLs.
- Remaining: persistent local-file storage, folder drop where browser permissions allow, list options menu, keyboard navigation and browser acceptance.


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

## STYLE-02 — XP stylesheet split (2026-11-22)
- `src/themes/winxp/xp.css` is removed. Its rules are split by theme class and loaded per OS set:
  - `base/xp-root.css`: CSS variables, always global.
  - `themes/xp-shared.css`: unscoped rules (start-button parts, tray, welcome and transition screens); loaded by every OS set.
  - `themes/xp-98.css`, `themes/xp-winxp.css`, `themes/xp-webos.css`: rules scoped to `.theme-98`, `.theme-win-xp` and `.theme-webos`. Rules that match several themes are copied into each relevant file.
- Main CSS bundle: 200 KB -> 162 KB. The first OS-split step took it from 573 KB to 200 KB.
- Verified against the HEAD build (pre-split), pixel for pixel: Win 98 and 2000 with Start open, XP login and XP desktop with Start open, Win 7, Ubuntu, macOS, WebOS, Halloween. Remaining differences are the clock and login-card animation only.

### REF-02 follow-up — Start menu round 2 (2026-11-22)
- Windows 98 top-level icons are 32 px at a 33 px row pitch, as in the reference.
- Windows 98 Programs: Accessories (with Entertainment and Games inside), MS-DOS Prompt (opens the terminal app), Windows Explorer (opens My Computer). Internet Explorer and Outlook Express are removed from the 98 list, as in the reference. Windows 2000 keeps its list.
- 98lite is excluded by decision (not canonical for Windows 98). StartUp is covered by ARCH-01 below.
- Windows 2000 Start menu sits flush to the left edge (no 4 px inset), as in the reference.
- Start menu for Windows 98 and 2000 sits directly on the taskbar (bottom offset equals the 28 px taskbar height). Before, there was a 4 px gap.
- Suspend (Windows 98) now returns to the sign-in screen, the closest existing state for a machine that waits for the user. It keeps its place in the menu as in the reference.

## ARCH-01 — Unified Start menu model, step 1 (2026-11-22)
- New `src/shells/desktop/components/start-menu/startMenuModel.ts`: one node type (`StartMenuNode`) and one builder that reads the profile's `Start Menu\Programs` folder from the file system. Folders become submenus (empty folders open in Explorer), shortcuts with an appId become items.
- `FileSystem.ts`: both profiles (C4m1r, User) get `Start Menu\Programs\StartUp`. The path follows the signed-in account.
- Windows 98 and 2000 read their user entries from this model. StartUp appears in Programs (98: after Accessories, as in the reference; 2000: at the end). Clicking it opens Explorer on the folder.
- Shortcuts without their own icon take the icon of their application (`getFileIcon` by `appId`). The classic 98/2000 menu uses its own icon set for the known apps (Calculator, Notepad, Paint, Minesweeper, Media Player, Winamp, Control Panel) and falls back to the file-system icon for the rest.
- Step 2 (done): Windows XP and Windows 7 read the same folder through the same model and append its entries to All Programs. The default menus are unchanged; a pixel check against the previous build differs only by the clock.
- Flyouts (step 2b, 2026-11-22): in XP and 7 a folder with content opens a flyout panel to its right, and deeper folders stack. Shared logic is in `startMenuFlyout.ts` (chain state) and `StartMenuFlyoutPanel.tsx` (portal panel, so the slide-in transform does not move it). Empty folders stay rows that open Explorer. Verified with sample shortcuts in a temporary build (not committed): both menus show the flyout; the default menus are unchanged.
- Open for flyouts: shortcuts without their own icon use the folder icon. Real shortcuts should carry app icons.
- Step 3 (open): move the hardcoded lists (pinned, frequent, All Programs) of XP and 7 into shared builders. Each step needs a pixel check.

## ARCH-01 step 3 — Windows XP fixed lists (2026-11-22)
- The XP fixed lists (pinned, All Programs, frequently used, places) moved from `StartMenuXP.tsx` to `startMenuXpLists.ts` as `buildXpStartMenuLists(...)`. Text and values are unchanged; the component only renders them. `MenuItem` is exported from the new module.
- Default XP menu checked against the previous build: differs only in the taskbar clock. All Programs still lists StartUp.
- Windows 7 fixed lists (`StartMenu7.tsx`) are the next part of step 3.

## Typecheck (2026-11-22)
- `npx tsc --noEmit -p .` checks nothing: the root `tsconfig.json` only references the app and node configs. Use `npx tsc --noEmit -p tsconfig.app.json`. Earlier "TSC_OK" results in this log were not valid. The real check found 34 errors (action literal typing, unused XP imports, missing translations in the new builder, flyout generic typing, and an unused `cssFile` field in `themeConfig.ts`). All are fixed; the app config reports 0.

## ARCH-01 step 3b — Windows 7 fixed lists (2026-11-22)
- The Windows 7 lists (default programs, All Programs, places) and their path constants moved from `StartMenu7.tsx` to `startMenuWin7Lists.ts` (`buildWin7StartMenuLists`). The component memoises them and keeps search, flyouts and launching.
- Checks: default menu differs from the previous build only in the taskbar clock; All Programs rows differ only by the added StartUp row.
- Step 3 is complete for XP and 7. Next: the classic menus (98, 2000) already read their lists from the model and keep their own builders in `StartMenu98.tsx`; moving those into a shared builder is the remaining cleanup.

## ARCH-01 step 4 — Windows 98 and 2000 list builder (2026-11-22)
- The classic list (Windows Update, Programs with Accessories, Entertainment, Games, Favorites-free Windows 98 variant, Documents, Settings, Find, Help, Run, Suspend, Shut Down) and its icon choice per skin moved from `StartMenu98.tsx` to `startMenuClassicLists.tsx` (`buildClassicStartMenu`). The component renders the list and keeps the banner, activation and the 98/2000 geometry.
- Checked against the previous build: Windows 98 and 2000, main menu and Programs, differ only in the taskbar clock.
- Step 4 completes the planned architecture move: every Windows Start menu (98, 2000, XP, 7) now reads its user entries from `Start Menu\Programs` through `startMenuModel.ts`, and each has its fixed list in a builder module.

## Loading screens (2026-11-23)
- Windows 98 and Windows 95: full-screen animated splash (the supplied GIFs), shown for one play and until the site's boot resources have loaded. Windows 95 has its own GIF; it shares the 98 theme, so GRUB passes the chosen profile id to the boot screen (`src/themes/bootProfile.ts`).
- Windows 2000: the base splash (Professional, 640×480 frame, fitted to the window at 4:3). The progress bar is drawn over the box the splash already has, and fills with the site's real loading (boot images and fonts), with a minimum of 1.5 s.
- Windows Vista: the supplied black splash with its small animated bar, played three times, and until the boot resources have loaded.
- Shared code: `src/themes/classicBoot/ClassicBootScreen.tsx` and `useBootProgress.ts`. The old placeholder boots for 98 and 2000 in `themes/webos/BootScreen.tsx` are gone.
- Verified in the browser at 800×600: Windows 2000 (progress bar fills), Windows 98 and Vista (splash shows). Windows 95 is not confirmed in the browser: the GRUB autoboot selects the site before the click in the test harness, so the 95 path was not exercised. Check it by hand.


### Windows 2000 boot GIFs (2026-11-23)
- Reference GIFs stored in `eat/screens/oc/win2000/`: `windows2000_professional_loading.gif` (640x480, 160 frames, boot splash with an empty progress box) and `windows2000_example_startup-desktop.gif` (640x480, 1 frame, first screen after boot).
- Boot: the 2000 splash plays `windows2000_professional_loading.gif` (copied to `src/themes/win2000/assets/boot/`). The site fills the GIF's own progress box (x≈273–437, y≈436–445 of 640x480) with real loading progress. The old still `splash-professional.png` was removed.
- Post-boot: `Windows2000StartupScreen` (in `ClassicBootScreen.tsx`) shows the startup GIF for 2.5 s, or until a click or key press, then logon. `WebOS` routes boot → startup → login only for `win2000`.
- Letterbox: all classic boot screens use an inline black background, so side bars never show the system background.

### Windows 2000 taskbar tile (2026-11-23)
- The 2000 taskbar paints from `src/themes/win2000/assets/taskbar.png` (116x28, repeats horizontally) via the inline style set in `DesktopShellContainer.tsx`, only when the theme is `win2000`. The tile carries the native colour `#c0c7c8` and the white top highlight.

### Windows 2000 Server boot, pacing and Start corner (2026-11-23)
- Server Family splash: `windows2000_server_family_loading.gif` (also in `eat/screens/oc/win2000/`). It plays when the GRUB edition chosen with E is Server, Advanced Server or Datacenter (`BootScreen.tsx` reads the edition for `win2000`). Professional stays the default.
- Windows 2000 boot bar is paced over 9 s (`WIN2000_BOOT_MS`) and never jumps to full, even when loading is instant. Post-boot GIF holds 4 s (`WIN2000_STARTUP_MS`).
- Start corner: the shared taskbar padding is removed for Windows 2000 (`classic.css`), so Start sits at x≈2 like the reference.
- Windows 95 and 98 splashes and the 2000 splashes all draw on a black letterbox (inline `LETTERBOX`).

### Windows 98 Start banner colours (2026-11-23)
- Banner text follows the 640x480 reference: "Windows" in bold #c0c0c0, "98" in regular Arial (not the heavy banner face). Second Edition keeps its "SE" tag.

### Windows 2000 post-startup window (2026-11-23)
- Startup GIF "Please wait" window, measured on the 640x480 frame: x 108–527 (420 px wide), y 112–255, navy title bar y 115–131 (#00009a), face grey, background teal (#54a6a6).
- The logon window ("Log On to Windows") takes that window's place: 420 px wide, top-left at 16.875% x / 23.33% y of the 4:3 frame, so the hand-over does not jump. Fields: User name (profiles User / C4m1r), Password, Log on to (this computer), OK / Cancel / Shut Down.
- Open point: logon background is the 2000 desktop blue (#3a6ea5), while the startup GIF is teal. Not changed.
- Logon background for Windows 2000 is now the startup GIF teal `#54a6a6` (sampled from the frame), so the hand-over from "Please wait" keeps the same colour.
- Canonical check: Windows 95 and 98 use `#008080` for desktop, logon and the transition screen (unchanged). Windows 2000 desktop stays `#3a6ea5`, as in the 2000 Server reference screenshot.

### Startup sound and Start corner for 95, 98, 2000 (2026-11-23)
- The Windows startup sound plays only when the user actually logs on: the desktop plays it when it appears after the logon screen. No boot screen (GRUB click, classic, XP, 7, webos) plays it any more; `bootPreload.ts` only preloads images and video.
- Start corner: 98 and 95 (`theme-98`) now drop the shared taskbar padding like 2000, so Start sits at x≈2. Measured on 98 (was x≈12).
- Open point: the XP-style loader (`src/themes/winxp/BootScreen.tsx`) is shown by `App.tsx` whenever mode is `webos` and theme is still the default `win-xp`. It did not appear on the GRUB click path in tests; the exact action that shows it is not yet reproduced.

### Media preload on the logon screen (2026-11-23)
- `preloadThemeAssets(theme)` in `bootPreload.ts` collects every image and sound URL in the active theme's assets (wallpaper, desktop and start menu icons, sounds) and loads them into the browser cache. It starts on the logon screen (`LoginScreen`), so media loads while the user picks an account.
- `WelcomeScreen` finishes only after 3 s and after the same preload promise, capped at 10 s, so the desktop opens with its media already in the cache.
- Measured on Windows 98: 15 media files fetched before the logon click, 1 after it.
- Not covered yet: the boot video (warmed at the GRUB click only) and cursor images referenced from CSS.

### Windows 95 / 98 cursors (2026-11-23)
- Canonical cursor set for 95 and 98 from `src/themes/win98/assets/cursors/` (arrow, hand, I-beam, hourglass) in `classic.css` under `.theme-98` / `.os-win-98`. Vite inlines the 32x32 `.cur` files as data URIs. The 98 login screen is tagged `theme-98` so the cursor applies there too.
- Verified on the Windows 98 desktop: the root cursor is the 98 arrow.
- Open: Windows 2000 has no cursor files in the repo, so it keeps the system cursor. Needs the Windows 2000 scheme (.cur) before it can be canonical.
