"use client";

import { useDesktopStore } from "@/store/useDesktopStore";
import { Monitor } from "lucide-react";

export default function QuickLaunch() {
  const { minimizeAllWindows } = useDesktopStore();

  return (
    <div className="flex items-center h-full px-1 border-r border-[#10427a] shadow-[1px_0_0_rgba(255,255,255,0.2)]">
      <button 
        onClick={minimizeAllWindows}
        title="Show Desktop"
        className="w-6 h-6 flex items-center justify-center rounded-[2px] border border-transparent hover:border-white/50 hover:bg-white/10 active:border-black/30 active:bg-black/10 transition-colors"
      >
        <Monitor size={16} className="text-[#3f8cf3] fill-blue-200 drop-shadow-sm" />
      </button>
    </div>
  );
}
