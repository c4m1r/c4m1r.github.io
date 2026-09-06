import { useCallback } from 'react';
import {
  useWindowManagerState,
  type ManagedWindow,
  type WindowManagerState,
} from '../../../apps/desktop/windowManager';

export interface UseDesktopWindowManagerOptions {
  playCloseWindowSound?: () => void;
  playMinimizeSound?: () => void;
  playRestoreSound?: () => void;
}

export interface UseDesktopWindowManagerReturn extends WindowManagerState {
  handleCloseWindow: (id: string) => void;
  handleMinimizeWindow: (id: string) => void;
  handleMaximizeWindow: (id: string) => void;
  handleRestoreWindow: (id: string) => void;
  handleFocusWindow: (id: string) => void;
  handleTaskbarWindowClick: (window: ManagedWindow) => void;
}

export function useDesktopWindowManager(
  options: UseDesktopWindowManagerOptions = {}
): UseDesktopWindowManagerReturn {
  const { playCloseWindowSound, playMinimizeSound, playRestoreSound } = options;
  const windowManager = useWindowManagerState();

  const handleCloseWindow = useCallback(
    (id: string) => {
      playCloseWindowSound?.();
      windowManager.closeWindow(id);
    },
    [playCloseWindowSound, windowManager]
  );

  const handleMinimizeWindow = useCallback(
    (id: string) => {
      playMinimizeSound?.();
      windowManager.minimizeWindow(id);
    },
    [playMinimizeSound, windowManager]
  );

  const handleMaximizeWindow = useCallback(
    (id: string) => {
      windowManager.maximizeWindow(id);
    },
    [windowManager]
  );

  const handleRestoreWindow = useCallback(
    (id: string) => {
      playRestoreSound?.();
      windowManager.restoreWindow(id);
    },
    [playRestoreSound, windowManager]
  );

  const handleFocusWindow = useCallback(
    (id: string) => {
      windowManager.focusWindow(id);
    },
    [windowManager]
  );

  const handleTaskbarWindowClick = useCallback(
    (window: ManagedWindow) => {
      if (window.focused) {
        handleMinimizeWindow(window.id);
      } else if (window.minimized) {
        handleRestoreWindow(window.id);
      } else {
        handleFocusWindow(window.id);
      }
    },
    [handleFocusWindow, handleMinimizeWindow, handleRestoreWindow]
  );

  return {
    ...windowManager,
    handleCloseWindow,
    handleMinimizeWindow,
    handleMaximizeWindow,
    handleRestoreWindow,
    handleFocusWindow,
    handleTaskbarWindowClick,
  };
}
