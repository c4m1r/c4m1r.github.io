# Desktop runtime extraction pass 2

## Moved
- Added `src/shells/desktop/runtime/selectionBox.ts` for pure selection-box normalization and point-in-box checks.
- Added `src/shells/desktop/runtime/iconHitTesting.ts` for pure relative icon-rectangle conversion and selection intersection checks.
- Added `src/shells/desktop/runtime/appLaunch.ts` for pure app-registry lookup.
- Kept `src/shells/desktop/runtime/windowGeometry.ts` compatible by re-exporting `normalizeSelectionBox` as the existing `createSelectionBox` helper.
- Updated `themes/webos/Desktop.tsx` to use these helpers for selection hit-testing and app lookup without changing JSX structure, event signatures, window manager state, icon z-index behavior, or ASCII gating.

## Left legacy
- `themes/webos/Desktop.tsx` still owns stateful window manager orchestration, icon drag state, selection state, context menu state, taskbar/start menu interactions, app launch branching, wallpaper events, sounds, fullscreen, notifications, and shutdown/logoff flows.
- `DesktopRuntime.tsx` remains the only transitional adapter to the legacy desktop implementation.

## Risk intentionally avoided
- Window drag/resize/maximize/restore/minimize/close orchestration was not moved.
- Start menu state, taskbar click behavior, context menu actions, sounds, shutdown/logoff, and wallpaper event listeners were not moved.
- Icon drag handlers and persisted icon positions were not changed beyond using existing z-index and new selection helper boundaries.

## Import boundary
- `rg "themes/webos/Desktop" src -n` reports the only code import in `src/shells/desktop/DesktopRuntime.tsx`; README mentions are documentation only.
- `rg "from ['\"].*themes/" src/shells/desktop -n` reports only `DesktopRuntime.tsx`, as expected for the transitional adapter.
- `rg "from ['\"].*shells/site" src/shells/desktop -n` returns no matches.
- New `src/shells/desktop/runtime/*` helpers do not import React, DOM APIs, localStorage, site shell files, or `themes/*`.
- `themes/webos/Desktop.tsx` imports runtime helpers from `shells/desktop/runtime` for selection hit-testing and app lookup.

## Manual checks
- Desktop icon single-click selection.
- Selection box drag and multi-icon selection.
- Icon double-click app launch.
- Start menu app launch.
- Unknown app/error behavior.
- Existing window drag/resize/maximize/restore/minimize/close behavior.
- XP/Win98/Win7/Ubuntu/WebOS boot and desktop smoke matrix from `desktop-runtime-manual-checklist.md`.
