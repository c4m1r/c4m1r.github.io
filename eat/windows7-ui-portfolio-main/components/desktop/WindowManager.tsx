"use client";

import { useDesktopStore } from "@/store/useDesktopStore";
import Window from "./Window";

import DateTimeProperties from "../apps/DateTimeProperties";
import InternetExplorer from "../apps/InternetExplorer";
import FileExplorer from "../apps/FileExplorer";
import DialogBox from "../apps/DialogBox";
import Resume from "../apps/Resume";
import Projects from "../apps/Projects";
import Contact from "../apps/Contact";

import TaskMgr from "../apps/TaskMgr";
import RecycleBin from "../apps/RecycleBin";

import SystemProperties from "../apps/SystemProperties";

import ControlPanel from "../apps/ControlPanel";
import WindowsDefender from "../apps/WindowsDefender";
import Paint from "../apps/Paint";
import Chess from "../apps/Chess";
import Solitaire from "../apps/Solitaire";

// Here we can map string componentIds to actual React components later
const renderContent = (componentId?: string, windowId: string = "") => {
  switch (componentId) {
    case "resume":
      return <Resume />;
    case "projects":
      return <Projects />;
    case "contact":
      return <Contact />;
    case "mycomputer":
      return <FileExplorer />;
    case "controlpanel":
      return <ControlPanel />;
    case "defender":
      return <WindowsDefender />;
    case "paint":
      return <Paint />;
    case "chess":
      return <Chess />;
    case "solitaire":
      return <Solitaire />;
    case "ie":
      return <InternetExplorer />;
    case "sysprops":
      return <SystemProperties />;
    case "dialog-not-implemented":
      return <DialogBox windowId={windowId} type="info" message="This feature is not available in the web version of this portfolio." />;
    case "dialog-games":
      return <DialogBox windowId={windowId} type="info" message="Games have arrived! Check out Chess Titans and Solitaire in the All Programs menu." />;
    case "datetime":
      return <DateTimeProperties windowId={windowId} />;
    case "taskmgr":
      return <TaskMgr />;
    case "recycle":
      return <RecycleBin />;
    default:
      return <div className="p-4">Welcome to Windows XP!</div>;
  }
};

export default function WindowManager() {
  const { openWindows } = useDesktopStore();

  return (
    <>
      {openWindows.map((window) => (
        <Window key={window.id} window={window}>
          {renderContent(window.componentId, window.id)}
        </Window>
      ))}
    </>
  );
}
