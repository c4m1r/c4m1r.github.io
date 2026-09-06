"use client";

import { useDesktopStore } from "@/store/useDesktopStore";
import { useState } from "react";

export default function StartButton() {
  const { startMenuOpen, toggleStartMenu } = useDesktopStore();
  const [isHovered, setIsHovered] = useState(false);

  // You can easily swap this path with 'WindowsStartButtonLarge' or 'WindowsStartButtonSmall' if needed
  const orbImage = "/icons/winorb/WindowsStartButtonMedium (Thin taskbar at bottom).png";
  
  // The sprite sheet has 3 states stacked vertically: normal, hover, pressed.
  const bgSize = "100% 300%";

  return (
    <div
      onClick={(e) => { e.stopPropagation(); toggleStartMenu(); }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title="Start"
      style={{
        position: 'relative',
        width: '54px',
        height: '54px',
        cursor: 'pointer',
        flexShrink: 0,
        marginLeft: '2px',
        zIndex: 10000,
      }}
    >
      {/* Normal State */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `url('${orbImage}')`,
        backgroundSize: bgSize,
        backgroundPosition: '0% 0%',
        transition: 'opacity 0.2s ease-in-out',
        opacity: startMenuOpen ? 0 : 1, // hidden if menu is open
        zIndex: 1,
      }} />

      {/* Hover State */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `url('${orbImage}')`,
        backgroundSize: bgSize,
        backgroundPosition: '0% 50%',
        transition: 'opacity 0.2s ease-in-out',
        opacity: isHovered && !startMenuOpen ? 1 : 0, // show only on hover, hide if open
        zIndex: 2,
      }} />

      {/* Pressed/Active State */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `url('${orbImage}')`,
        backgroundSize: bgSize,
        backgroundPosition: '0% 100%',
        transition: 'opacity 0.2s ease-in-out',
        opacity: startMenuOpen ? 1 : 0, // show when menu is open
        zIndex: 3,
      }} />
    </div>
  );
}
