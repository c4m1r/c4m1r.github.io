"use client";

import { useDesktopStore, WindowData } from "@/store/useDesktopStore";
import Image from "next/image";

export default function TaskbarButton({ window }: { window: WindowData }) {
  const { toggleMinimize } = useDesktopStore();

  const getIcon = () => {
    switch (window.componentId) {
      case "mycomputer": return <Image src="/win7/Shell32.dll/imageres_109.ico" alt="Computer" fill sizes="24px" className="object-contain" />;
      case "ie":        return <Image src="/win7/Internet Explorer/iexplore_32528.ico" alt="IE" fill sizes="24px" className="object-contain" />;
      case "resume":    return <Image src="/win7/Special Folders/imageres_112.ico" alt="Resume" fill sizes="24px" className="object-contain" />;
      case "projects":  return <Image src="/win7/Standard Folders/imageres_3.ico" alt="Projects" fill sizes="24px" className="object-contain" />;
      case "contact":   return <Image src="/win7/Shell32.dll/imageres_20.ico" alt="Contact" fill sizes="24px" className="object-contain" />;
      default:          return <Image src="/win7/Standard Folders/imageres_3.ico" alt="App" fill sizes="24px" className="object-contain" />;
    }
  };

  return (
    <div 
      onClick={() => toggleMinimize(window.id)}
      className={`win7-taskbar-btn ${window.isActive ? 'active' : ''}`}
    >
      <div className="relative w-[24px] h-[24px] shrink-0">{getIcon()}</div>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
        {window.title}
      </span>
    </div>
  );
}
