# Desktop Runtime Extraction Map

## Final Architecture Status (Completed)

- **Desktop Shell**: `src/shells/desktop` now fully owns the desktop runtime environment.
  - `DesktopShell.tsx`: Public entrypoint for OS theme wrappers.
  - `DesktopShellContainer.tsx`: Canonical desktop workspace rendering surfaces, taskbar, start menu, window stack, icon grid, context menu, run dialog, and error surfaces.
  - `runtime/windowManager.ts`: Canonical window manager state engine.
  - `components/`: Shared desktop surfaces (`DesktopStartMenuSurface`, `DesktopContextMenuSurface`, `DesktopIconGrid`, `DesktopSelectionBox`, `TaskbarSystemArea`, `RunDialog`, `DesktopErrorBox`).
  - `components/start-menu/`: Start menu presentation components (`StartMenu`, `StartMenuXP`, `StartMenu98`).

- **OS Themes**: `src/themes/*` now exclusively owns boot, login, welcome, and transition screens, along with visual stylesheets and theme assets.
  - `src/themes/webos/Desktop.tsx` and legacy compatibility wrappers (`Window.tsx`, `Notepad.tsx`, `PictureViewer.tsx`, `ContextMenu.tsx`, `ErrorDialog.tsx`) are completely **DELETED**.

- **Content Domain**: `src/domain/*` owns all content parsing and glob loading.
  - `src/utils/contentLoader.ts` is completely **DELETED**.
  - `loadMarkdownContent` extracted to `src/domain/content/loadMarkdownContent.ts`.
  - `loadGalleryItems`, `loadPictureItems`, `loadWallpaperItems` owned by `src/domain/gallery/gallery.loader.ts`.
  - `loadAllProjects` owned by `src/domain/projects/projects.loader.ts`.

- **Applications**: `src/apps/*` owns application components.
  - `MyComputer` moved to `src/apps/explorer/MyComputer.tsx`.

## Historical Extraction Timeline

1. **Pass 1**: Runtime contracts, constants, pure geometry, storage, and z-index helpers extracted to `src/shells/desktop/`.
2. **Pass 2**: Taskbar system area and action bridge extracted (`TaskbarSystemArea.tsx`, `useDesktopSystemActionBridge.ts`, `desktopOsAttributes.ts`).
3. **Pass 3**: Start menu surface extracted (`DesktopStartMenuSurface.tsx`, `startMenuSurface.ts`, `windowChromeSkin.ts`).
4. **Pass 4**: Workspace surface extracted (`DesktopIconGrid.tsx`, `DesktopSelectionBox.tsx`, `DesktopContextMenuSurface.tsx`).
5. **Pass 5**: Desktop shell consolidation under `DesktopShellContainer.tsx`.
6. **Pass 6 (FINAL PASS)**: Total deletion of legacy wrappers (`Desktop.tsx`, `windowManager.ts`, `MyComputer.tsx`, `StartMenu.tsx`, `contentLoader.ts`), state engine finalization under `src/shells/desktop/runtime/windowManager.ts`, domain loader finalization, and CSS optimization.
