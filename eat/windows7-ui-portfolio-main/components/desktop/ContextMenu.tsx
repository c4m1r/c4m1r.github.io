"use client";

import { useDesktopStore } from "@/store/useDesktopStore";
import { useEffect, useRef } from "react";
import { ChevronRight } from "lucide-react";

// Simple item component for reuse
const MenuItem = ({ label, disabled = false, hasChildren = false, bold = false, onClick, closeContextMenu }: { label: string, disabled?: boolean, hasChildren?: boolean, bold?: boolean, onClick?: () => void, closeContextMenu?: () => void }) => (
  <div 
    style={{
      padding: '3px 16px', fontSize: '12px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      userSelect: 'none', cursor: disabled ? 'default' : 'pointer',
      color: disabled ? '#aaa' : '#000',
      fontWeight: bold ? 700 : 400,
      fontFamily: '"Segoe UI", Tahoma, sans-serif',
    }}
    onMouseEnter={e => { if (!disabled) { (e.currentTarget as HTMLDivElement).style.background = '#2f6fce'; (e.currentTarget as HTMLDivElement).style.color = '#fff'; } }}
    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = ''; (e.currentTarget as HTMLDivElement).style.color = disabled ? '#aaa' : ''; }}
    onClick={() => {
      if (disabled) return;
      if (onClick) onClick();
      if (!hasChildren) closeContextMenu?.();
    }}
  >
    <span>{label}</span>
    {hasChildren && <ChevronRight size={14} className={disabled ? "text-[#ACA899]" : ""} />}
  </div>
);

const Separator = () => (
  <div style={{ height: '1px', background: 'rgba(0,0,0,0.1)', margin: '3px 4px', boxShadow: '0 1px 0 rgba(255,255,255,0.8)' }} />
);

export default function ContextMenu() {
  const { contextMenu, closeContextMenu } = useDesktopStore();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeContextMenu();
      }
    };
    
    if (contextMenu.isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [contextMenu.isOpen, closeContextMenu]);

  if (!contextMenu.isOpen) return null;

  let finalLeft = contextMenu.x;
  let finalTop = contextMenu.y;

  if (typeof window !== 'undefined') {
    const MENU_WIDTH = 180; // Approximate max width
    const MENU_HEIGHT = 180; // Approximate max height
    
    if (finalLeft + MENU_WIDTH > window.innerWidth) {
      finalLeft = Math.max(0, window.innerWidth - MENU_WIDTH - 5);
    }
    if (contextMenu.type === 'desktop' && finalTop + MENU_HEIGHT > window.innerHeight - 40) {
      finalTop = Math.max(0, window.innerHeight - 40 - MENU_HEIGHT - 5);
    }
  }

  return (
    <div
      ref={menuRef}
      style={{
        position: 'absolute',
        background: '#f0f0f0',
        border: '1px solid #999',
        boxShadow: '2px 2px 8px rgba(0,0,0,0.3)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        padding: '3px 0',
        minWidth: '170px',
        fontFamily: '"Segoe UI", Tahoma, sans-serif',
        ...(contextMenu.type === 'taskbar'
          ? { left: `${finalLeft}px`, bottom: '40px' }
          : { left: `${finalLeft}px`, top: `${finalTop}px` }),
      }}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {contextMenu.type === 'desktop' && (
        <>
          <MenuItem label="Arrange Icons By" hasChildren={true} closeContextMenu={closeContextMenu} />
          <MenuItem label="Refresh" closeContextMenu={closeContextMenu} />
          <Separator />
          <MenuItem label="Paste" disabled={true} closeContextMenu={closeContextMenu} />
          <MenuItem label="Paste Shortcut" disabled={true} closeContextMenu={closeContextMenu} />
          <Separator />
          <MenuItem label="New" hasChildren={true} closeContextMenu={closeContextMenu} />
          <Separator />
          <MenuItem 
            label="Properties" 
            onClick={() => useDesktopStore.getState().openWindow({
              id: "sysprops",
              title: "System Properties",
              componentId: "sysprops",
              defaultWidth: 700,
              defaultHeight: 550,
            })}
            closeContextMenu={closeContextMenu} 
          />
        </>
      )}
      {contextMenu.type === 'taskbar' && (
        <>
          <MenuItem label="Toolbars" hasChildren={true} closeContextMenu={closeContextMenu} />
          <Separator />
          <MenuItem label="Cascade Windows" disabled={true} closeContextMenu={closeContextMenu} />
          <MenuItem label="Tile Windows Horizontally" disabled={true} closeContextMenu={closeContextMenu} />
          <MenuItem label="Tile Windows Vertically" disabled={true} closeContextMenu={closeContextMenu} />
          <MenuItem 
            label="Show the Desktop" 
            onClick={() => useDesktopStore.getState().minimizeAllWindows()} 
            closeContextMenu={closeContextMenu}
          />
          <Separator />
          <MenuItem 
            label="Task Manager" 
            onClick={() => useDesktopStore.getState().openWindow({
              id: "taskmgr",
              title: "Windows Task Manager",
              componentId: "taskmgr"
            })}
            closeContextMenu={closeContextMenu}
          />
          <Separator />
          <MenuItem label="Properties" disabled={true} closeContextMenu={closeContextMenu} />
        </>
      )}
    </div>
  );
}
