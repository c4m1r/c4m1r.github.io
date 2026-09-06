# Desktop Runtime Extraction Phase 2 Report

## Overview
Phase 2 of the desktop runtime extraction further modularized legacy `src/themes/webos/Desktop.tsx` without disrupting core desktop functionality, app launching logic, window management, drag-and-drop, shortcut handling, or audio playback.

## Extracted Components and Runtime Helpers

### 1. `DesktopStartMenuSurface`
- **Location**: `src/shells/desktop/components/DesktopStartMenuSurface.tsx`
- **Helper**: `src/shells/desktop/runtime/startMenuSurface.ts`
- **Purpose**: Wraps `<StartMenu />` with OS-aware metadata (`data-os-theme`, `data-os-class`, `data-start-variant`, `data-os-family`) and scoped styling classes (`start-menu-surface start-menu-${variant}`).
- **Key Guarantee**: Preserves original `StartMenu` app launching, navigation, and shutdown callbacks without creating per-OS app or runtime forks.

### 2. `windowChromeSkin`
- **Location**: `src/shells/desktop/runtime/windowChromeSkin.ts`
- **Purpose**: Generates OS-specific window chrome metadata (`data-os-theme`, `data-window-skin`) and class names (`window-skin-${skinName}`) attached to `Window` root elements.
- **Key Guarantee**: Zero changes to window manager drag, resize, maximize, minimize, or focus state logic.

### 3. `TaskbarSystemArea` & Desktop Root Attributes
- **TaskbarSystemArea**: Retains modularized system tray area with typed callbacks for volume, notification panel, system action menu, and language switcher.
- **Desktop Root Attributes**: `getDesktopOsAttributes(themeKey)` continuously decorates the root desktop element with string attributes (`data-os-theme`, `data-os-class`, `data-os-version`, `data-design-era`, `data-device-family`, `data-representative-device`, `data-support-cycle`, `data-form-factor`).

## Current Status of `Desktop.tsx`
- `Desktop.tsx` lines reduced and streamlined.
- Serves as the orchestration container consuming pure runtime helpers from `src/shells/desktop/runtime/` and reusable surface components from `src/shells/desktop/components/`.

## Risks & Next Extraction Targets
- Next planned extraction targets: StartMenu inner columns, desktop icon layout grid engine, and contextual menu handlers.

> [!NOTE]
> Extraction continued in Phase 3 with `DesktopIconGrid.tsx`, `DesktopSelectionBox.tsx`, and `DesktopContextMenuSurface.tsx`. See [desktop-runtime-extraction-phase-3.md](file:///Users/admin/Documents/_git/c4m1r-github/docs/nerv/reports/desktop-runtime-extraction-phase-3.md).
