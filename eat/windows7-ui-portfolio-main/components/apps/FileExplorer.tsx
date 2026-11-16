/* eslint-disable @next/next/no-img-element */
"use client";

import { useDesktopStore } from "@/store/useDesktopStore";
import { useState } from "react";

const Btn = ({ children, className = "", onClick, disabled = false, title = "", icon }: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
  icon?: string;
}) => (
  <div
    onClick={disabled ? undefined : onClick}
    title={title}
    style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '2px 6px', borderRadius: '3px', cursor: disabled ? 'default' : 'pointer',
      opacity: disabled ? 0.5 : 1, userSelect: 'none', fontSize: '12px',
      color: '#103063', transition: 'background 0.1s', border: '1px solid transparent'
    }}
    className={className}
    onMouseEnter={e => !disabled && ((e.currentTarget as HTMLDivElement).style.background = 'linear-gradient(to bottom, #eaf6fd, #c4e1f4)', (e.currentTarget as HTMLDivElement).style.borderColor = '#98c1df')}
    onMouseLeave={e => (!disabled && ((e.currentTarget as HTMLDivElement).style.background = ''), (e.currentTarget as HTMLDivElement).style.borderColor = 'transparent')}
  >
    {icon && <img src={icon} alt="" style={{ width: 14, height: 14, objectFit: 'contain' }} />}
    {children}
  </div>
);

export default function FileExplorer() {
  const { openWindow } = useDesktopStore();
  
  const drives = [
    { id: "c", name: "Local Disk (C:)", total: "256 GB", free: "128 GB free", pct: 50, icon: "/win7/Filetypes, Devices, Miscellaneous/imageres_32.ico" },
    { id: "d", name: "Projects (D:)", total: "500 GB", free: "320 GB free", pct: 36, icon: "/win7/Filetypes, Devices, Miscellaneous/imageres_32.ico" },
  ];

  const handleDriveDoubleClick = (driveId: string) => {
    if (driveId === "d") {
      openWindow({ id: "projects", title: "Projects (D:)", componentId: "projects", defaultWidth: 800, defaultHeight: 600 });
    } else if (driveId === "c") {
      openWindow({ id: "c-drive", title: "Local Disk (C:)", componentId: "mycomputer", defaultWidth: 800, defaultHeight: 550 });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', color: '#000', fontSize: '12px', fontFamily: '"Segoe UI", Tahoma, sans-serif', userSelect: 'none' }}>
      
      {/* Top toolbar */}
      <div style={{ display: 'flex', flexDirection: 'column', borderBottom: '1px solid #d9d9d9', background: 'linear-gradient(to bottom, #f0f4f8, #e0e8f0)' }}>
        
        {/* Address bar row */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '6px 8px', gap: '6px' }}>
          {/* Back/Forward */}
          <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
            <div style={{ 
              width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(to bottom, #e2eaf4, #c9d8ea)', 
              border: '1px solid #99aabf', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8)'
            }}>
              <span style={{ fontSize: '16px', color: '#103063', fontWeight: 'bold' }}>←</span>
            </div>
            <div style={{ 
              width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(to bottom, #e2eaf4, #c9d8ea)', 
              border: '1px solid #99aabf', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              opacity: 0.5
            }}>
              <span style={{ fontSize: '14px', color: '#103063', fontWeight: 'bold' }}>→</span>
            </div>
          </div>

          {/* Breadcrumb address */}
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center',
            background: '#fff', border: '1px solid #b9c8d6',
            height: '24px', borderRadius: '3px',
            padding: '0 4px', gap: '2px',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
          }}>
            <img src="/win7/Shell32.dll/imageres_109.ico" alt="" style={{ width: 14, height: 14 }} />
            <span style={{ fontSize: '10px', color: '#666', margin: '0 2px' }}>▶</span>
            <span style={{ padding: '0 4px', cursor: 'default', borderRadius: '2px' }}
              onMouseEnter={e => (e.currentTarget as HTMLSpanElement).style.background = '#e5f3fb'}
              onMouseLeave={e => (e.currentTarget as HTMLSpanElement).style.background = ''}
            >Computer</span>
            <span style={{ fontSize: '10px', color: '#666', margin: '0 2px' }}>▶</span>
          </div>

          {/* Search box */}
          <div style={{
            width: '200px', display: 'flex', alignItems: 'center',
            background: '#fff', border: '1px solid #b9c8d6',
            height: '24px', borderRadius: '3px',
            padding: '0 8px', gap: '4px',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
          }}>
            <input
              type="text"
              placeholder="Search Computer"
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: '12px', color: '#555', background: 'transparent', fontStyle: 'italic' }}
            />
            <span style={{ fontSize: '14px', color: '#103063' }}>⌕</span>
          </div>
        </div>

        {/* Command toolbar row */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '2px 8px 4px', gap: '4px', borderTop: '1px solid rgba(255,255,255,0.6)' }}>
          <Btn>Organize <span style={{ fontSize: '8px', marginLeft: '2px' }}>▼</span></Btn>
          <Btn onClick={() => openWindow({ id: "sysprops", title: "System Properties", componentId: "sysprops", defaultWidth: 700, defaultHeight: 550 })}>System properties</Btn>
          <Btn>Uninstall or change a program</Btn>
          <Btn>Map network drive</Btn>
          <Btn icon="/win7/Control Panel/powercpl_512.ico">Open Control Panel</Btn>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '2px' }}>
            <Btn title="Change view"><img src="/win7/Standard Folders/imageres_3.ico" alt="" style={{ width: 14, height: 14 }} /></Btn>
            <Btn title="Help"><img src="/win7/Filetypes, Devices, Miscellaneous/imageres_104.ico" alt="" style={{ width: 14, height: 14 }} /></Btn>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        
        {/* Left nav pane */}
        <div style={{
          width: '200px', background: '#fff',
          borderRight: '1px solid #d9d9d9',
          overflowY: 'auto', padding: '8px 2px',
          display: 'flex', flexDirection: 'column', gap: '2px',
        }}>
          {/* Favorites */}
          <NavGroup label="Favorites" icon="/win7/Standard Folders/imageres_178.ico" expanded>
            <NavItem icon="/win7/Shell32.dll/imageres_109.ico" label="Desktop" />
            <NavItem icon="/win7/Standard Folders/imageres_3.ico" label="Downloads" />
            <NavItem icon="/win7/Standard Folders/imageres_3.ico" label="Recent Places" />
          </NavGroup>

          {/* Libraries */}
          <NavGroup label="Libraries" icon="/win7/Standard Folders/imageres_3.ico" expanded={false} />

          {/* Computer */}
          <NavGroup label="Computer" icon="/win7/Shell32.dll/imageres_109.ico" expanded active>
            <NavItem icon="/win7/Filetypes, Devices, Miscellaneous/imageres_32.ico" label="Local Disk (C:)" />
            <NavItem icon="/win7/Filetypes, Devices, Miscellaneous/imageres_32.ico" label="Projects (D:)" />
          </NavGroup>

          {/* Network */}
          <NavGroup label="Network" icon="/win7/Standard Folders/imageres_9.ico" expanded={false} />
        </div>

        {/* Right content pane */}
        <div style={{ flex: 1, background: '#fff', overflowY: 'auto', padding: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #e0e0e0', paddingBottom: '6px', marginBottom: '15px' }}>
            <span style={{ color: '#003399', fontWeight: 'bold', fontSize: '13px' }}>Hard Disk Drives (2)</span>
            <div style={{ height: '1px', background: 'linear-gradient(to right, #e0e0e0, transparent)', flex: 1, marginLeft: '10px' }} />
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
            {drives.map((drive) => (
              <div
                key={drive.id}
                onDoubleClick={() => handleDriveDoubleClick(drive.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '5px', width: '280px', cursor: 'pointer',
                  borderRadius: '3px', border: '1px solid transparent',
                  transition: 'background 0.1s, border-color 0.1s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.background = 'linear-gradient(to bottom, #f2f8fc, #eaf2f9)';
                  (e.currentTarget as HTMLDivElement).style.borderColor = '#c6def0';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.background = '';
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'transparent';
                }}
              >
                <img src={drive.icon} alt={drive.name} style={{ width: 48, height: 48 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 600, fontSize: '13px', color: '#000' }}>{drive.name}</span>
                  <div style={{ width: '100%', height: '12px', background: '#e6e6e6', border: '1px solid #ccc', margin: '3px 0 1px' }}>
                    <div style={{ width: `${drive.pct}%`, height: '100%', background: 'linear-gradient(to bottom, #5cb8e6, #1f8ac9)' }} />
                  </div>
                  <span style={{ fontSize: '11px', color: '#666' }}>{drive.free} of {drive.total}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div style={{
        height: '40px', borderTop: '1px solid #b9c8d6',
        background: 'linear-gradient(to right, #ebf3fc, #d5e6f6)',
        display: 'flex', alignItems: 'center', padding: '0 12px', gap: '10px',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8)',
      }}>
        <img src="/win7/Shell32.dll/imageres_109.ico" alt="" style={{ width: 24, height: 24 }} />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 'normal', fontSize: '13px', color: '#003399' }}>Computer</span>
          <span style={{ fontSize: '11px', color: '#333' }}>2 items</span>
        </div>
      </div>
    </div>
  );
}

function NavGroup({ label, icon, expanded, active, children }: {
  label: string; icon: string; expanded: boolean; active?: boolean; children?: React.ReactNode;
}) {
  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '5px',
        padding: '3px 4px', borderRadius: '3px', cursor: 'pointer', fontSize: '12px',
        color: '#000',
        background: active ? 'linear-gradient(to bottom, #eaf6fd, #c4e1f4)' : undefined,
        border: active ? '1px solid #98c1df' : '1px solid transparent',
      }}
      onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLDivElement).style.background = '#e5f3fb'; (e.currentTarget as HTMLDivElement).style.borderColor = '#d9ebf9'; } }}
      onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLDivElement).style.background = ''; (e.currentTarget as HTMLDivElement).style.borderColor = 'transparent'; } }}
      >
        <span style={{ fontSize: '10px', color: '#666', width: '10px' }}>{expanded ? '▼' : '▶'}</span>
        <img src={icon} alt="" style={{ width: 16, height: 16 }} />
        {label}
      </div>
      {expanded && children && (
        <div style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '1px' }}>
          {children}
        </div>
      )}
    </div>
  );
}

function NavItem({ icon, label }: { icon: string; label: string }) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: '5px',
        padding: '3px 4px', borderRadius: '3px', cursor: 'pointer',
        fontSize: '12px', color: '#000', border: '1px solid transparent'
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'linear-gradient(to bottom, #eaf6fd, #c4e1f4)'; (e.currentTarget as HTMLDivElement).style.borderColor = '#98c1df'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = ''; (e.currentTarget as HTMLDivElement).style.borderColor = 'transparent'; }}
    >
      <span style={{ width: '10px' }}></span>
      <img src={icon} alt="" style={{ width: 16, height: 16 }} />
      {label}
    </div>
  );
}
