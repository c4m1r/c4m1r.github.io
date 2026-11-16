"use client";

import StartButton from "./StartButton";
import SystemTray from "./SystemTray";
import TaskbarButton from "./TaskbarButton";
import { useDesktopStore } from "@/store/useDesktopStore";

export default function Taskbar() {
  const { openWindows } = useDesktopStore();

  return (
    <div
      className="win7-taskbar"
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        useDesktopStore.getState().openContextMenu(e.clientX, e.clientY, "taskbar");
      }}
    >
      {/* Start Orb */}
      <StartButton />

      {/* Thin separator line */}
      <div style={{ width: "1px", height: "26px", background: "rgba(255,255,255,0.14)", margin: "0 3px", flexShrink: 0 }} />

      {/* Open app buttons */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "2px", overflow: "hidden", height: "40px", padding: "0 2px" }}>
        {openWindows.map((win) => (
          <TaskbarButton key={win.id} window={win} />
        ))}
      </div>

      {/* System Tray */}
      <SystemTray />

      {/* Show Desktop sliver */}
      <div className="win7-show-desktop" title="Show Desktop" />
    </div>
  );
}
