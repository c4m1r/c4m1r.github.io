import React, { createContext, ReactElement, useState } from 'react';
import { WindowModel } from '../models/WindowModel';

type WindowManagerContextType = {
  windows: WindowModel[];
  setWindows: React.Dispatch<React.SetStateAction<WindowModel[]>>;
  addWindow: (newWindow: WindowModel) => void;
  updateWindow: (
    windowToFind: WindowModel,
    updater: (a: WindowModel) => WindowModel
  ) => void;
};

export const WindowManagerContext = createContext<WindowManagerContextType>({
  windows: [],
  setWindows: () => {},
  addWindow: () => {},
  updateWindow: () => {} 
});


export function WindowManagerContextProvider({ children }: { children: ReactElement }) {
  const [windows, setWindows] = useState<WindowModel[]>([]);

  function addWindow(newWindow:WindowModel){
    setWindows(prev=>[newWindow,...prev])
  }

  function updateWindow(windowToFind:WindowModel,updater:(oldWindow:WindowModel)=>WindowModel){
    setWindows(prevWindows=>{
      const prevWindowIndex = prevWindows.findIndex(window => window === windowToFind);
      if (prevWindowIndex === -1) {
        return prevWindows; // Window not found, return the previous state
      }

      const prevWindow = prevWindows[prevWindowIndex];
      const newWindow = updater(prevWindow);

      const newWindows = [...prevWindows];
      newWindows[prevWindowIndex] = newWindow;

      return newWindows;
    })
  }

  return (
    <WindowManagerContext.Provider value={{ windows, setWindows,addWindow,updateWindow }}>
      {children}
    </WindowManagerContext.Provider>
  );
}