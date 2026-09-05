# Global Actions End-to-End Hardening Report

## Overview
This report details the end-to-end event bridge wiring and safety guarantees for global system actions in `c4m1r.github.io`.

## Global Actions Matrix & Listener Status

| Action ID | Listener Location | Execution Path | Safety Fallback |
| :--- | :--- | :--- | :--- |
| `settings.open` | `useDesktopSystemActionBridge.ts` | Dispatches `open-system-settings` event -> opens `control-panel` app via `launchApp` | No crash if app already open; safe window focus |
| `about.open` | `useDesktopSystemActionBridge.ts` | Dispatches `open-system-about` event -> opens `about` app via `launchApp` | Safe fallback if app definition absent |
| `effects.fireworks` | `WeatherEffects.tsx` | Dispatches `trigger-system-effect` or `trigger-global-effect` with detail `'fireworks'` -> calls `setEffect('fireworks')` | Direct canvas particle burst if weather state is inactive |
| `language.toggle` | `systemActions.ts` | Updates `AppContext` language (`ru` <-> `en`) and persists to `localStorage` | Works across Site, Terminal, and OS shells |
| `effects.toggleFireworks` | `systemActions.ts` | Updates `effects.fireworksEnabled` flag in `settingsStore` | Preserves non-effect settings |
| `settings.reset` | `systemActions.ts` | Calls `resetSystemSettings()`, resets language to default (`ru`) | Resets ONLY system settings keys; does NOT bypass GRUB or clear content/media |

## Detailed Behavior Verification

### 1. `settings.open` & `about.open`
- Dispatched from `SystemActionMenu` (`⚡` menu), `ControlPanel` sidebar, or taskbar shortcuts.
- Verified custom event listeners (`open-system-settings`, `open-system-about`) trigger app launches directly in `useWindowManagerState`.

### 2. `effects.fireworks` Bridge
- Wired directly to `WeatherEffects.tsx` via `trigger-system-effect` and `trigger-global-effect` custom event listeners.
- Invoking the action instantly activates canvas fireworks without extra heavy libraries or asset dependencies.

### 3. `settings.reset` Security
- `resetSystemSettings()` targets strictly `system-settings-v1` key in `localStorage`.
- Content cache, user markdown files, media assets, and GRUB default entry configuration remain completely untouched.
