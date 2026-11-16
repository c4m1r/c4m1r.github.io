"use client";

import React, { useState } from "react";
import { Rnd } from "react-rnd";
import { useDesktopStore, WindowData } from "@/store/useDesktopStore";

interface WindowProps {
  window: WindowData;
  children?: React.ReactNode;
}

export default function Window({ window, children }: WindowProps) {
  const { closeWindow, toggleMinimize, toggleMaximize, focusWindow } = useDesktopStore();

  // Initialize size and position
  const [size, setSize] = useState({ 
    width: window.defaultWidth || 750, 
    height: window.defaultHeight || 550 
  });
  
  const [position, setPosition] = useState(() => ({ 
    x: 50 + Math.random() * 50, 
    y: 50 + Math.random() * 50 
  }));

  if (window.isMinimized) {
    return null;
  }

  const isMaximized = window.isMaximized || false;

  return (
    <Rnd
      size={isMaximized ? { width: '100%', height: '100%' } : size}
      position={isMaximized ? { x: 0, y: 0 } : position}
      onDragStop={(e, d) => {
        if (!isMaximized) setPosition({ x: d.x, y: d.y });
      }}
      onResizeStop={(e, direction, ref, delta, pos) => {
        if (!isMaximized) {
          setSize({ width: parseInt(ref.style.width, 10), height: parseInt(ref.style.height, 10) });
          setPosition(pos);
        }
      }}
      disableDragging={isMaximized}
      enableResizing={!isMaximized && window.isResizable !== false}
      dragHandleClassName="title-bar"
      bounds="parent"
      className={`win7-window absolute pointer-events-auto window ${window.isActive ? 'active' : ''} glass flex flex-col`}
      style={{ 
        zIndex: window.zIndex,
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseDown={() => focusWindow(window.id)}
      minWidth={250}
      minHeight={150}
    >
      {/* Title Bar - 7.css uses .title-bar */}
      <div
        className="title-bar"
        onDoubleClick={() => {
          if (window.isResizable !== false) {
            toggleMaximize(window.id);
          }
        }}
      >
        {/* Title */}
        <div className="title-bar-text">
          {window.title}
        </div>

        {/* Controls - 7.css uses native aria-labels for buttons */}
        <div className="title-bar-controls">
          <button
            aria-label="Minimize"
            onClick={(e) => {
              e.stopPropagation();
              toggleMinimize(window.id);
            }}
          ></button>
          <button 
            aria-label={isMaximized ? "Restore" : "Maximize"}
            onClick={(e) => {
              e.stopPropagation();
              if (window.isResizable !== false) {
                toggleMaximize(window.id);
              }
            }}
            disabled={window.isResizable === false}
          ></button>
          <button
            aria-label="Close"
            onClick={(e) => {
              e.stopPropagation();
              closeWindow(window.id);
            }}
          ></button>
        </div>
      </div>

      {/* Content Area - 7.css uses .window-body */}
      <div 
        className="window-body m-0 p-0 flex flex-col overflow-hidden" 
        style={{ flex: 1, backgroundColor: '#fff' }}
      >
        {children}
      </div>
    </Rnd>
  );
}
