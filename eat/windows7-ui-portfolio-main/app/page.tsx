"use client";

import { useState } from "react";
import LoadingScreen from "@/components/desktop/LoadingScreen";
import Taskbar from "@/components/desktop/Taskbar";
import StartMenu from "@/components/desktop/StartMenu";
import ContextMenu from "@/components/desktop/ContextMenu";
import WindowManager from "@/components/desktop/WindowManager";
import DesktopIcon from "@/components/desktop/DesktopIcon";
import { useDesktopStore } from "@/store/useDesktopStore";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const { closeStartMenu, openContextMenu, closeContextMenu } = useDesktopStore();

  const handleDesktopContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    openContextMenu(e.clientX, e.clientY, 'desktop');
  };

  const handleDesktopClick = () => {
    closeStartMenu();
    closeContextMenu();
  };

  return (
    <main className="w-full h-screen overflow-hidden select-none">
      {isLoading ? (
        <LoadingScreen onComplete={() => setIsLoading(false)} />
      ) : (
        <div 
          className="w-full h-full bg-[#0055e5] flex flex-col relative bg-[url('/bliss.jpg')] bg-cover bg-center"
          onClick={handleDesktopClick}
          onContextMenu={handleDesktopContextMenu}
        >
          {/* Desktop Icons Area Placeholder */}
          <div className="flex-1 p-2 flex flex-col flex-wrap gap-4 content-start">
            <DesktopIcon 
              id="mycomputer" 
              label="My Computer" 
              iconSrc="/win7/Shell32.dll/imageres_109.ico" 
              componentId="mycomputer" 
              defaultWidth={850}
              defaultHeight={600}
            />
            <DesktopIcon 
              id="mydocs" 
              label="My Documents" 
              iconSrc="/win7/Special Folders/imageres_112.ico" 
              componentId="resume" 
              defaultWidth={800}
              defaultHeight={600}
            />
            <DesktopIcon 
              id="recycle" 
              label="Recycle Bin" 
              iconSrc="/win7/Shell32.dll/imageres_55.ico" 
              componentId="dialog-not-implemented" 
              defaultWidth={450}
              defaultHeight={200}
            />
            <DesktopIcon 
              id="ie" 
              label="Internet Explorer" 
              iconSrc="/win7/Internet Explorer/iexplore_32528.ico" 
              componentId="ie" 
              defaultWidth={900}
              defaultHeight={650}
            />
            <DesktopIcon 
              id="projects" 
              label="My Projects" 
              iconSrc="/win7/Standard Folders/imageres_3.ico" 
              componentId="projects" 
              defaultWidth={850}
              defaultHeight={600}
            />
            <DesktopIcon 
              id="contact" 
              label="Contact Me" 
              iconSrc="/win7/Shell32.dll/imageres_20.ico" 
              componentId="contact" 
              defaultWidth={600}
              defaultHeight={450}
            />
          </div>
          
          <div className="absolute top-0 left-0 w-full h-[calc(100%-40px)] pointer-events-none z-10">
            <WindowManager />
          </div>
          
          <ContextMenu />
          <StartMenu />
          <Taskbar />
        </div>
      )}
    </main>
  );
}
