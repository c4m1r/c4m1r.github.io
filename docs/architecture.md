# System Architecture & Technical Specification

## 1. High-Level System Architecture

`c4m1r.github.io` implements a layered pseudo-operating system runtime in pure browser technologies.

```
┌─────────────────────────────────────────────────────────────┐
│                       Index.html / Entry                    │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                        App.tsx                              │
│  - Mode Router (grub | webos | blog | terminal)            │
│  - Theme Dispatcher (win-xp | win7 | webos/classic/apple)   │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
┌──────────────▼─────────────┐   ┌─────────────▼──────────────┐
│      AppContext            │   │      WeatherContext        │
│  - mode, theme, language   │   │  - condition, temperature  │
│  - window state, sounds    │   │  - rain/snow canvas effect │
└──────────────┬─────────────┘   └────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────────┐
│                    Desktop Shell Layer                      │
│  - DesktopShellContainer: Desktop grid, wallpaper, canvas   │
│  - WindowManager: Drag, resize, minimize, maximize, zIndex │
│  - Taskbar & Start Menu: Quick launch, tray, clock         │
└──────────────┬──────────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────────┐
│                    Application Registry                     │
│  - Winamp 2.x Player       - loops (0chan visualizer)       │
│  - Explorer / My Computer  - Outlook Express                │
│  - Windows Media Player    - Terminal CLI                   │
│  - Picture Viewer / Paint  - Control Panel / Settings       │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Window Management Subsystem

The window management subsystem is located in `src/shells/desktop/`:
- **State Model**: Windows are tracked in `AppContext` and `DesktopShellContainer` with:
  - `id`: Unique identifier (string).
  - `title`: Localized window title.
  - `icon`: Icon reference or key.
  - `isMinimized`: Boolean flag hiding window from view while retaining tray tab.
  - `isMaximized`: Expands window to fill desktop workspace bounds above taskbar.
  - `position`: Coordinates `{ x, y, width, height }`.
  - `zIndex`: Dynamic stack ordering calculated via `src/shells/desktop/runtime/zIndex.ts`.
- **Focus Management**: Clicking any area of a window brings it to the top z-index and marks its titlebar active.
- **Snapping & Bounds**: Windows respect desktop boundaries and preserve pre-maximize coordinates when restored.

---

## 3. Audio Subsystem & Web Audio Visualizers

The audio pipeline consists of two distinct components:
1. **System Acoustic Feedback**:
   - Synthesized / PCM acoustic cues via HTML5 Audio and Web Audio API.
   - Handled by `src/themes/winxp/xpSoundService.ts` and UI event listeners.
   - Authentic sounds: Bill Brown Startup Chime, Logon 3-note chime, Logoff 4-note motif, Shutdown orchestral chord, Navigation click (15ms), Error chord (`error.wav`).
2. **Real-Time Music & Visualizer Engine**:
   - Built on `AudioContext`, `AnalyserNode`, and `createMediaElementSource`.
   - **Winamp 2.x** (`src/apps/winamp/WinampPlayer.tsx`): 16-band spectrum visualizer with gravity-decayed peak dots, 10-band graphic equalizer curve, and Fisher-Yates non-repeating shuffle with historical back-stack.
   - **loops App** (`src/apps/loops/LoopsApp.tsx`): Interactive 2D matrix of reactive cells pulsating in sync with frequency thresholds, time-domain oscilloscope, and acoustic feedback (`chpok.mp3`) on pointer interaction.

---

## 4. Theme & Skin Adaptation Engine

Themes are defined as first-class citizens in `src/themes/themeConfig.ts` and `src/shells/os/`:
- **CSS Architecture**: Scoped per theme using CSS classes applied to `.os-shell`:
  - `.os-winxp`: Windows XP Luna Blue, silver gradients, 3D borders.
  - `.os-win7`: Windows 7 Aero Glass, `backdrop-filter: blur`, specular highlights.
  - `.os-classic`: Windows 98 / 95 `#c0c0c0` 2px beveled borders, `#008080` teal background.
  - `.os-apple` / `.os-macos`: macOS Aqua / Cupertino rounded cards, soft drop shadows.
  - `.os-ubuntu`: Yaru dark palette, orange accent `#e95420`.
- **Dynamic Skin Switching**: The system switches themes dynamically without page reload through `AppContext.setTheme()`, preserving running application states.

---

## 5. Security & Authentication Architecture

User credentials are governed by `src/domain/auth/credentials.ts`:
- Credentials protect the primary account `c4m1r`.
- Passwords are verified against an obfuscated XOR cipher token (`0x65` mask) and SHA-256 cryptographic digest.
- Prevents raw-string exposure in client bundles while providing instant feedback upon login.
