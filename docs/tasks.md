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
