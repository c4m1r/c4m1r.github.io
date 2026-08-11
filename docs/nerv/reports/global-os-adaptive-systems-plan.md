# Global OS Adaptive System Services Plan

This report documents the architectural design and implementation details for the Global OS Adaptive System Services layer in `c4m1r.github.io`.

---

## Architectural Hierarchy

The project follows a bottom-up global system architecture:

```
[ content/materials ]
       ↓
[ shared domain apps ]
       ↓
[ global system services ]
  - Persistent Settings Store (localStorage + NervaWeb ready adapter)
  - Typed Global System Action Registry (language.toggle, effects.fireworks, settings.reset)
  - Shared Settings & About Section Model (active + frozen OS placeholders)
       ↓
[ shell affordance adapters & touch metadata ]
  - Shell Integration Rules (action placements for site-navbar, tray, panel, dock, control-center)
  - Touch Affordance Metadata (pointerMode, hit targets, long press/swipe rules)
       ↓
[ presentation shells ]
  - Site Shell
  - Desktop / OS Shell (Single DesktopShell runtime)
  - Terminal Shell
  - iOS / Tablet Shell (Presentation skin over DesktopShell)
```

---

## Key Principles & Guarantees

1. **Global Language & Settings**: Interface language (`en` / `ru`) is stored in `SystemSettingsStore` (using `localStorage` with `BrowserLocalStorageSettingsAdapter`) and synchronized reactively across all presentation shells (Site, Desktop OS, Terminal, iOS).
2. **GRUB Bootloader Priority**: `rememberLastOs` is maintained strictly as a metadata setting. Autoboot is intentionally inactive so the GRUB bootloader remains the default entry screen.
3. **Global System Actions**:
   - `language.toggle`: Switches global language between EN and RU.
   - `effects.fireworks`: Triggers the system visual fireworks effect via custom event dispatch (`trigger-system-effect`).
   - `effects.toggleFireworks`: Toggles fireworks enabled state in settings.
   - `settings.open`: Dispatches open settings event.
   - `settings.reset`: Wipes `c4m1r-system-settings` and `webos-language` from `localStorage` and restores defaults.
   - `about.open`: Dispatches open about event.
4. **Frozen OS Settings Placeholders**: OS-native settings placeholders (e.g. Windows XP Display/Audio, Ubuntu GNOME/Privacy, iOS Wi-Fi/Bluetooth/Accessibility) are exposed as read-only disabled rows with visual placeholder labels.
5. **Touchscreen Support Metadata**: iOS profiles (`ios-26`, `ios-16`, `ios-9`, `ios-5`) include `TouchAffordanceMetadata` (`pointerMode: touch`, `minHitTargetPx: 44`, `supportsLongPress: true`).
6. **Zero Runtime / App Forks**: No separate `XpSettingsRuntime`, `UbuntuSettingsRuntime`, or `IosSettingsRuntime` components were created.
7. **Asset Preservation**: 100% of media and asset files (`.mp3`, `.gif`, `.webm`, `.png`) are preserved. Zero binary files were deleted.
8. **Feature Flag Priority**: `features.news = false` in `src/config/features.ts` maintains absolute precedence.

---

## Storage Adapter Note (NervaWeb Future Compatibility)

`SystemSettingsStore` uses the `SettingsStorageAdapter` interface:
```ts
export interface SettingsStorageAdapter {
  read(): SystemSettings | null;
  write(settings: SystemSettings): void;
  reset(): void;
}
```
Currently implemented by `BrowserLocalStorageSettingsAdapter`. In future NervaWeb releases, this can be swapped with a Tauri / SQLite / IndexedDB adapter with 0 breaking changes to presentation shells.
