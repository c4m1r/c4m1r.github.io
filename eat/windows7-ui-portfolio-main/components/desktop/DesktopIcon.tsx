/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useDesktopStore } from "@/store/useDesktopStore";

interface DesktopIconProps {
  id: string;
  label: string;
  iconSrc: string;
  componentId: string;
  defaultWidth?: number;
  defaultHeight?: number;
}

export default function DesktopIcon({ id, label, iconSrc, componentId, defaultWidth, defaultHeight }: DesktopIconProps) {
  const [isSelected, setIsSelected] = useState(false);
  const { openWindow } = useDesktopStore();

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent bubbling to desktop background which might close menus
    openWindow({ id, title: label, componentId, defaultWidth, defaultHeight });
    setIsSelected(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSelected(true);
    // Note: We'd need global state or a click listener on the main desktop to unselect,
    // but for now local state is a fine approximation, or we just rely on standard CSS hover/active.
  };

  return (
    <div 
      className="flex flex-col items-center justify-start w-[75px] mb-6 cursor-pointer select-none group"
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      <div className={`p-1 ${isSelected ? 'brightness-50 opacity-75' : ''}`}>
        <img 
          src={iconSrc} 
          alt={label} 
          className="w-8 h-8 object-contain drop-shadow-md"
        />
      </div>
      
      <div className={`
        text-white text-center text-[11px] leading-tight px-1 py-[2px] mt-1 rounded-[2px] border border-transparent line-clamp-2 text-wrap wrap-break-word max-w-full
        drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] font-sans
        ${isSelected ? 'bg-[#0b58d6] drop-shadow-none! border-dotted border-white/40' : 'group-hover:bg-white/20'}
      `}>
        {label}
      </div>
    </div>
  );
}
