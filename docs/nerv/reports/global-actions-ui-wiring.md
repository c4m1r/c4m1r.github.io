# Global Actions UI Wiring Report

This report documents the UI entry points wired to global system actions across presentation shells in `c4m1r.github.io`.

---

## Wired Action Entry Points

1. **Taskbar Tray / Panel Indicator (`⚡`)**:
   - Available across all desktop & iOS skins (`Windows XP`, `Windows 98`, `Windows 7`, `Ubuntu`, `WebOS`, `iOS 26.6.1`, `iOS 16.7.16`, `iOS 9.3.6`, `iOS 5.1.1`).
   - Toggles floating `SystemActionMenu` popover.
   - Touch-friendly on iOS profiles (`minHitTargetPx: 44`, tap-activatable, zero hover-only dependency).

2. **Control Panel / System Info**:
   - Sidebar shortcuts: `🌐 Language (EN/RU)`, `🔄 Reset System Settings`.
   - `System & Device Info` tab displays active setting items with inline action buttons (`Execute`), as well as disabled native OS frozen placeholders.

3. **Custom Event Listeners**:
   - `open-system-settings`: Triggers `openApp('control-panel')`.
   - `open-system-about`: Triggers `openApp('about')`.
   - `trigger-system-effect`: Triggers visual fireworks system effect.

---

## Callable Global System Actions

- **`language.toggle`**: Toggles interface language (`en` / `ru`) globally across Site, Desktop OS, Terminal, and iOS skins. Persisted in `localStorage`.
- **`effects.fireworks`**: Dispatches `trigger-system-effect` event to trigger visual fireworks effect.
- **`effects.toggleFireworks`**: Toggles fireworks setting in `SystemSettingsStore`.
- **`settings.open`**: Dispatches `open-system-settings` event to bring up Control Panel.
- **`about.open`**: Dispatches `open-system-about` event to bring up About app.
- **`settings.reset`**: Clears `c4m1r-system-settings` and `webos-language` from `localStorage` and restores system defaults.

---

## Safety Guarantees

- **No OS-Specific Action Engine**: Single global system actions registry used everywhere; zero `XpSettingsRuntime`, `UbuntuSettingsRuntime`, or `IosSettingsRuntime` components created.
- **GRUB Priority**: `rememberLastOs` remains a reserved setting; GRUB bootloader remains the default entry screen.
- **Media Asset Preservation**: 100% of media and asset files (`.mp3`, `.gif`, `.webm`, `.png`) are preserved. Zero binary files deleted.
- **Feature Flag Priority**: `features.news = false` in `src/config/features.ts` maintains absolute precedence.
