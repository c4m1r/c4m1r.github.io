import { create } from 'zustand';

export type WindowData = {
  id: string;
  title: string;
  icon?: string;
  componentId?: string; // Which component to render inside
  defaultWidth?: number;
  defaultHeight?: number;
  isResizable?: boolean;
  isMinimized: boolean;
  isMaximized?: boolean;
  isActive: boolean;
  zIndex: number;
};

interface DesktopState {
  openWindows: WindowData[];
  startMenuOpen: boolean;
  highestZIndex: number;
  
  // Actions
  toggleStartMenu: () => void;
  closeStartMenu: () => void;
  openWindow: (window: Omit<WindowData, 'isMinimized' | 'isActive' | 'zIndex'>) => void;
  closeWindow: (id: string) => void;
  toggleMinimize: (id: string) => void;
  toggleMaximize: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeAllWindows: () => void;
  
  // Context Menu
  contextMenu: { isOpen: boolean; x: number; y: number; type: 'desktop' | 'taskbar' | 'window' };
  openContextMenu: (x: number, y: number, type: 'desktop' | 'taskbar' | 'window') => void;
  closeContextMenu: () => void;
}

export const useDesktopStore = create<DesktopState>((set) => ({
  openWindows: [],
  startMenuOpen: false,
  highestZIndex: 10,

  toggleStartMenu: () => set((state) => ({ startMenuOpen: !state.startMenuOpen })),
  
  closeStartMenu: () => set({ startMenuOpen: false }),

  openWindow: (newWindow) => set((state) => {
    // If it's already open, just focus it
    if (state.openWindows.find(w => w.id === newWindow.id)) {
      const newZ = state.highestZIndex + 1;
      return {
        highestZIndex: newZ,
        openWindows: state.openWindows.map(w => ({
          ...w,
          isActive: w.id === newWindow.id,
          isMinimized: w.id === newWindow.id ? false : w.isMinimized,
          zIndex: w.id === newWindow.id ? newZ : w.zIndex
        }))
      };
    }
    
    const newZ = state.highestZIndex + 1;
    return {
      highestZIndex: newZ,
      openWindows: [
        ...state.openWindows.map(w => ({ ...w, isActive: false })),
        { ...newWindow, isMinimized: false, isMaximized: false, isActive: true, zIndex: newZ }
      ]
    };
  }),

  closeWindow: (id) => set((state) => {
    const remainingWindows = state.openWindows.filter(w => w.id !== id);
    return {
      openWindows: remainingWindows,
      highestZIndex: remainingWindows.length === 0 ? 10 : state.highestZIndex
    };
  }),

  toggleMinimize: (id) => set((state) => {
    return {
      openWindows: state.openWindows.map(w => {
        if (w.id === id) {
          return { ...w, isMinimized: !w.isMinimized, isActive: w.isMinimized };
        }
        if (w.isActive && state.openWindows.find(win => win.id === id)?.isMinimized) {
          return { ...w, isActive: false };
        }
        return w;
      })
    };
  }),

  toggleMaximize: (id) => set((state) => {
    return {
      openWindows: state.openWindows.map(w => {
        if (w.id === id) {
          return { ...w, isMaximized: !w.isMaximized };
        }
        return w;
      })
    };
  }),

  focusWindow: (id) => set((state) => {
    const newZ = state.highestZIndex + 1;
    return {
      highestZIndex: newZ,
      openWindows: state.openWindows.map(w => ({
        ...w,
        isActive: w.id === id,
        isMinimized: w.id === id ? false : w.isMinimized,
        zIndex: w.id === id ? newZ : w.zIndex
      })),
      startMenuOpen: false
    };
  }),

  minimizeAllWindows: () => set((state) => ({
    openWindows: state.openWindows.map(w => ({ ...w, isMinimized: true, isActive: false })),
    startMenuOpen: false,
    contextMenu: { ...state.contextMenu, isOpen: false }
  })),

  // Context Menu State
  contextMenu: { isOpen: false, x: 0, y: 0, type: 'desktop' },
  
  openContextMenu: (x, y, type) => set({
    contextMenu: { isOpen: true, x, y, type },
    startMenuOpen: false
  }),
  
  closeContextMenu: () => set((state) => ({
    contextMenu: { ...state.contextMenu, isOpen: false }
  }))
}));
