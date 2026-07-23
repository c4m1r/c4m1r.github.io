# Desktop Runtime Extraction Map

## Current owner
- `src/themes/webos/Desktop.tsx` still owns most stateful desktop runtime behavior: window orchestration, icon placement/dragging, selection box, context menu opening, taskbar interactions, custom wallpaper event handling, sound playback, app launch routing, and start/run/task-manager orchestration.
- `src/themes/webos/*` still owns boot, login, welcome, transition screens, theme assets, theme styles, and theme-specific UI surfaces.
- `src/shells/desktop/DesktopShell.tsx` is the public entrypoint used by theme wrappers.
- `src/shells/desktop/DesktopRuntime.tsx` is the only direct adapter to the legacy WebOS Desktop implementation.
- `src/shells/desktop/appRegistry.tsx` owns desktop app definitions.
- `src/shells/desktop/shortcutsRegistry.ts` owns desktop shortcut ids.

## Target owner
- `src/shells/desktop` owns runtime/window manager contracts, runtime constants, icon/selection/context-menu orchestration, taskbar/start-menu orchestration, and app-launch coordination.
- `src/shells/desktop/runtime` owns small pure helpers first, then gradually receives stateful hooks in later passes.
- `src/themes/*` owns boot/login/welcome screens, theme assets, theme CSS, sound assets, wallpaper assets, and theme-specific visual configuration.
- Legacy `themes/webos/Desktop.tsx` should shrink until it becomes either a compatibility adapter or disappears behind `DesktopRuntime`.

## Moved in pass 1
- Runtime contracts moved to `src/shells/desktop/desktopTypes.ts`.
- Runtime constants moved to `src/shells/desktop/desktopConstants.ts`.
- Pure viewport/selection geometry helpers moved to `src/shells/desktop/runtime/windowGeometry.ts`.
- Pure custom wallpaper storage helper moved to `src/shells/desktop/runtime/desktopStorage.ts`.
- Pure OS class/theme family helpers moved to `src/shells/desktop/runtime/shortcutFilters.ts`.
- Pure icon z-index helper moved to `src/shells/desktop/runtime/zIndex.ts`.
- `DesktopRuntime.tsx` now documents the boundary contract.
- `themes/webos/Desktop.tsx` now documents that new runtime logic must go under `shells/desktop`.

## Safe move order
1. Keep `DesktopShell` as the public entrypoint and keep theme wrappers importing it.
2. Move pure helpers/constants/types only.
3. Extract a read-only `useDesktopViewport` hook after geometry helpers are stable.
4. Extract icon selection/box math into a hook with browser smoke testing.
5. Extract icon drag orchestration with XP/Win7/Ubuntu/WebOS manual verification.
6. Extract context menu orchestration after icon selection/drag is stable.
7. Extract taskbar/start-menu orchestration last because it touches launch, focus, minimize/restore, and system commands.
8. Replace `DesktopRuntime` legacy import only after the stateful runtime is fully owned by `shells/desktop`.

## Risky areas
- Window drag/resize/maximize/restore/minimize/close behavior.
- Icon dragging and persisted icon positions.
- Selection box hit testing.
- Context menu positioning and menu item actions.
- Taskbar focus/minimize/restore behavior.
- Start menu launch paths and hover/click sounds.
- Custom wallpaper storage and `wallpaper-changed` event behavior.
- Fullscreen, volume, notifications, shutdown/logoff flows.
- ASCII ambient layer z-index and theme gating.

## Manual checks required
Use `docs/nerv/reports/desktop-runtime-manual-checklist.md` after each extraction step. The minimum required matrix is XP, Win98, Win7, Ubuntu, and WebOS with app open, drag, resize, maximize, restore, minimize, close, focus/z-index, taskbar click, context menu, custom wallpaper, and ASCII scope checks.
