"use client";

import { useDesktopStore } from "@/store/useDesktopStore";
import Image from "next/image";
import { useState, useEffect } from "react";

const FONT = '"Segoe UI", Tahoma, sans-serif';

const ALL_SEARCHABLE_ITEMS = [
  { id: 'ie', title: 'Internet Explorer', icon: '/win7/Internet Explorer/iexplore_32528.ico', componentId: 'ie' },
  { id: 'resume', title: 'My Resume', icon: '/win7/Special Folders/imageres_112.ico', componentId: 'resume' },
  { id: 'projects', title: 'My Projects', icon: '/win7/Standard Folders/imageres_3.ico', componentId: 'projects' },
  { id: 'contact', title: 'Contact Me', icon: '/win7/Shell32.dll/imageres_20.ico', componentId: 'contact' },
  { id: 'wmp', title: 'Windows Media Player', icon: '/win7/Windows Media Player/player.ico', componentId: 'dialog-not-implemented' },
  { id: 'update', title: 'Windows Update', icon: '/win7/Control Panel/powercpl_512.ico', componentId: 'dialog-not-implemented' },
  { id: 'defender', title: 'Windows Defender', icon: '/win7/Windows Defender/MsMpRes_103.ico', componentId: 'defender' },
  { id: 'calc', title: 'Calculator', icon: '/win7/Filetypes, Devices, Miscellaneous/dsuiext_4112.ico', componentId: 'ie' },
  { id: 'cmd', title: 'Command Prompt', icon: '/win7/Shell32.dll/imageres_20.ico', componentId: 'ie' },
  { id: 'notepad', title: 'Notepad', icon: '/win7/Wordpad/wordpad_128.ico', componentId: 'resume' },
  { id: 'paint', title: 'Paint', icon: '/win7/Default Programs/mspaint_2.ico', componentId: 'paint' },
  { id: 'snipping', title: 'Snipping Tool', icon: '/win7/Filetypes, Devices, Miscellaneous/imageres_86.ico', componentId: 'ie' },
  { id: 'wordpad', title: 'WordPad', icon: '/win7/Wordpad/wordpad_128.ico', componentId: 'resume' },
  { id: 'solitaire', title: 'Solitaire', icon: '/win7/Games/Solitaire_108.ico', componentId: 'solitaire' },
  { id: 'chess', title: 'Chess Titans', icon: '/win7/Games/Chess_128.ico', componentId: 'chess' },
  { id: 'minesweeper', title: 'Minesweeper', icon: '/win7/Games/MineSweeper_111.ico', componentId: 'projects' },
  { id: 'help', title: 'Help and Support', icon: '/win7/Filetypes, Devices, Miscellaneous/imageres_99.ico', componentId: 'ie' },
  { id: 'cpanel', title: 'Control Panel', icon: '/win7/Control Panel/imageres_27.ico', componentId: 'controlpanel' }
];

export default function StartMenu() {
  const { startMenuOpen, openWindow, closeStartMenu } = useDesktopStore();
  const [showAllPrograms, setShowAllPrograms] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!startMenuOpen) {
      const timeout = setTimeout(() => {
        setShowAllPrograms(false);
        setSearchQuery("");
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [startMenuOpen]);

  if (!startMenuOpen) return null;

  const open = (id: string, title: string, componentId: string, opts?: object) => {
    openWindow({ id, title, componentId, defaultWidth: 800, defaultHeight: 550, ...opts });
    closeStartMenu();
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '40px',
      left: '0',
      zIndex: 10000,
    }}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '420px',
          height: '500px',
          userSelect: 'none',
          fontFamily: FONT,
          animation: 'sm-in 0.15s cubic-bezier(0.1, 0.9, 0.2, 1)',
          filter: 'drop-shadow(2px -2px 10px rgba(0,0,0,0.4))',
          position: 'relative',
        }}
      >
        {/* User profile avatar */}
        <div style={{
          position: 'absolute',
          top: '-24px',
          right: '24px',
          width: '64px',
          height: '64px',
          borderRadius: '5px',
          border: '2px solid rgba(255,255,255,0.7)',
          background: 'rgba(255,255,255,0.2)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,255,255,0.8)',
          overflow: 'hidden',
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{ position: 'relative', width: '56px', height: '56px', borderRadius: '3px', overflow: 'hidden' }}>
            <Image src="/icons/profile.avif" alt="User" fill sizes="56px" style={{ objectFit: 'cover' }} />
          </div>
        </div>

        {/* Outer glass container */}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '8px 8px 0 0',
          overflow: 'hidden',
          borderTop: '1px solid rgba(255,255,255,0.4)',
          borderLeft: '1px solid rgba(255,255,255,0.4)',
          borderRight: '1px solid rgba(255,255,255,0.4)',
          borderBottom: 'none',
          display: 'flex',
          flexDirection: 'column',
          // True Aero glass effect
          background: 'linear-gradient(135deg, rgba(16, 42, 82, 0.65) 0%, rgba(8, 20, 45, 0.8) 100%)',
          backdropFilter: 'blur(15px) saturate(1.2)',
          WebkitBackdropFilter: 'blur(15px) saturate(1.2)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), inset 1px 0 0 rgba(255,255,255,0.2), inset -1px 0 0 rgba(255,255,255,0.2)',
        }}>
          
          {/* Main two-column area */}
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden', padding: '8px 8px 10px 8px', gap: '6px', position: 'relative', zIndex: 1 }}>

            {/* ── LEFT COLUMN ── */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, gap: '6px' }}>
              
              {/* White Area (Apps) */}
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                background: '#fff',
                borderRadius: '4px',
                overflow: 'hidden',
                border: '1px solid #7591b6',
                boxShadow: 'inset 0 0 3px rgba(0,0,0,0.1)',
              }}>
                {/* App list - Hide scrollbar but allow scroll */}
                <div 
                  style={{ flex: 1, overflowY: 'auto', padding: '4px' }}
                  className="start-menu-list"
                >
                  <style>{`
                    .start-menu-list::-webkit-scrollbar { width: 0px; background: transparent; }
                    .start-menu-list { scrollbar-width: none; }
                  `}</style>
                  {!searchQuery ? (
                    !showAllPrograms ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                        {[
                          // Pinned apps
                          { id: 'ie', title: 'Internet Explorer', icon: '/win7/Internet Explorer/iexplore_32528.ico', componentId: 'ie' },
                          { id: 'resume', title: 'My Resume', icon: '/win7/Special Folders/imageres_112.ico', componentId: 'resume' },
                          { id: 'projects', title: 'My Projects', icon: '/win7/Standard Folders/imageres_3.ico', componentId: 'projects' },
                          { id: 'contact', title: 'Contact Me', icon: '/win7/Shell32.dll/imageres_20.ico', componentId: 'contact' },
                        ].map((app) => (
                          <LeftAppItem key={app.id} icon={app.icon} label={app.title} onClick={() => open(app.id, app.title, app.componentId)} pinned />
                        ))}
                        
                        <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, #d9d9d9 10%, #d9d9d9 90%, transparent)', margin: '4px 8px' }} />

                        {[
                          // Standard Windows 7 apps
                          { id: 'paint', title: 'Paint', icon: '/win7/Default Programs/mspaint_2.ico', componentId: 'paint' },
                          { id: 'wmp', title: 'Windows Media Player', icon: '/win7/Windows Media Player/player.ico', componentId: 'dialog-not-implemented' },
                          { id: 'wordpad', title: 'WordPad', icon: '/win7/Wordpad/wordpad_128.ico', componentId: 'dialog-not-implemented' },
                          { id: 'solitaire', title: 'Solitaire', icon: '/win7/Games/Solitaire_108.ico', componentId: 'solitaire' },
                          { id: 'defender', title: 'Windows Defender', icon: '/win7/Windows Defender/MsMpRes_103.ico', componentId: 'defender' },
                        ].map((app) => (
                          <LeftAppItem key={app.id} icon={app.icon} label={app.title} onClick={() => open(app.id, app.title, app.componentId)} />
                        ))}
                      </div>
                    ) : (
                      <AllProgramsList open={open} />
                    )
                  ) : (
                    <SearchResultsList 
                      results={ALL_SEARCHABLE_ITEMS.filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()))} 
                      open={open} 
                    />
                  )}
                </div>

                {/* All Programs row */}
                <div style={{ borderTop: '1px solid #e0e0e0', background: '#f5f5f5' }}>
                  <AllProgramsRow 
                    isBack={showAllPrograms} 
                    onClick={() => setShowAllPrograms(!showAllPrograms)} 
                  />
                </div>
              </div>

              {/* ── SEARCH BAR ── */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                height: '30px',
                background: '#fff',
                border: '1px solid #5a7d9f',
                borderRadius: '4px',
                padding: '0 8px',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.15)',
                flexShrink: 0,
              }}>
                <input
                  type="text"
                  placeholder="Search programs and files"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    flex: 1, border: 'none', outline: 'none',
                    fontSize: '13px', color: '#333', fontStyle: searchQuery ? 'normal' : 'italic',
                    background: 'transparent', fontFamily: FONT,
                    minWidth: 0,
                  }}
                />
                {searchQuery ? (
                  <svg onClick={() => setSearchQuery("")} style={{ cursor: 'pointer' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2b5b84" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2b5b84" strokeWidth="2.5" strokeLinecap="round">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                )}
              </div>
            </div>

            {/* ── RIGHT PANE (glass transparent) ── */}
            <div style={{
              width: '150px',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              // Subtle dark tint to distinguish from left side, but keep aero glass
              background: 'rgba(0, 0, 0, 0.15)',
              borderRadius: '4px',
              padding: '44px 4px 4px',
              borderLeft: '1px solid rgba(255,255,255,0.1)'
            }}>
              <RightLink label="Gividu Elladeniya" bold onClick={() => {}} />

              <Divider />

              {[
                { label: 'Documents', action: () => open('documents', 'My Documents', 'resume') },
                { label: 'Pictures', action: () => open('pictures', 'My Projects', 'projects') },
                { label: 'Music', action: () => open('music', 'Music', 'dialog-not-implemented') },
              ].map(l => <RightLink key={l.label} label={l.label} onClick={l.action} />)}

              <Divider />

              {[
                { label: 'Games', action: () => open('games', 'Games', 'dialog-games') },
                { label: 'Computer', action: () => open('mycomputer', 'Computer', 'mycomputer') },
              ].map(l => <RightLink key={l.label} label={l.label} onClick={l.action} />)}

              <Divider />

              {[
                { label: 'Control Panel', action: () => open('cpanel', 'Control Panel', 'controlpanel') },
                { label: 'Devices and Printers', action: () => open('devices', 'Devices and Printers', 'dialog-not-implemented') },
                { label: 'Default Programs', action: () => open('defprogs', 'Default Programs', 'dialog-not-implemented') },
                { label: 'Help and Support', action: () => open('help', 'Help and Support', 'dialog-not-implemented') },
              ].map(l => <RightLink key={l.label} label={l.label} onClick={l.action} />)}

              {/* Shut down */}
              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end', padding: '4px' }}>
                <ShutdownButton />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────

function LeftAppItem({ icon, label, onClick, pinned }: { icon: string; label: string; onClick: () => void; pinned?: boolean }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '0 8px', height: '40px', cursor: 'pointer',
        borderRadius: '3px', border: '1px solid transparent',
        transition: 'none', fontFamily: FONT,
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.background = 'linear-gradient(to bottom, #edf4fc, #cce0f5)';
        el.style.borderColor = '#96bce0';
        el.style.boxShadow = 'inset 0 0 0 1px rgba(255,255,255,0.5)';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.background = '';
        el.style.borderColor = 'transparent';
        el.style.boxShadow = 'none';
      }}
    >
      <div style={{ position: 'relative', width: '28px', height: '28px', flexShrink: 0 }}>
        <Image src={icon} alt={label} fill sizes="28px" style={{ objectFit: 'contain' }} />
      </div>
      <span style={{ fontSize: '12px', color: '#000', fontWeight: pinned ? 600 : 400 }}>{label}</span>
    </div>
  );
}

function AllProgramsRow({ isBack, onClick }: { isBack?: boolean, onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '8px 12px', cursor: 'pointer',
        fontFamily: FONT, fontSize: '12px', fontWeight: 'bold', color: '#333',
        borderBottomLeftRadius: '3px', borderBottomRightRadius: '3px',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.background = 'linear-gradient(to bottom, #edf4fc, #cce0f5)';
        el.style.color = '#000';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.background = 'transparent';
        el.style.color = '#333';
      }}
    >
      {isBack && (
        <div style={{
          width: '18px', height: '18px', borderRadius: '50%',
          background: 'linear-gradient(to bottom, #d9ebf9, #6a8fb8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 1px 2px rgba(0,0,0,0.3)', border: '1px solid #fff'
        }}>
          <span style={{ fontSize: '10px', color: '#fff', textShadow: '0 1px 1px rgba(0,0,0,0.5)', transform: 'scaleX(-1)' }}>▶</span>
        </div>
      )}
      <span>{isBack ? "Back" : "All Programs"}</span>
      {!isBack && <span style={{ fontSize: '9px', marginLeft: '2px', color: '#00cc00' }}>▶</span>}
    </div>
  );
}

interface ProgramItem {
  id: string;
  title: string;
  icon: string;
  componentId?: string;
  type?: string;
  disabled?: boolean;
  children?: ProgramItem[];
}

function AllProgramsList({ open }: { open: (id: string, title: string, comp: string) => void }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const FOLDER_ICON = '/win7/Standard Folders/imageres_3.ico';

  const items: ProgramItem[] = [
    { id: 'ie', title: 'Internet Explorer', icon: '/win7/Internet Explorer/iexplore_32528.ico', componentId: 'ie' },
    { id: 'wmp', title: 'Windows Media Player', icon: '/win7/Windows Media Player/player.ico', componentId: 'dialog-not-implemented' },
    { id: 'update', title: 'Windows Update', icon: '/win7/Control Panel/powercpl_512.ico', componentId: 'dialog-not-implemented' },
    { id: 'defender', title: 'Windows Defender', icon: '/win7/Windows Defender/MsMpRes_103.ico', componentId: 'defender' },
    {
      id: 'accessories', title: 'Accessories', icon: FOLDER_ICON, type: 'folder', children: [
        { id: 'calc', title: 'Calculator', icon: '/win7/Filetypes, Devices, Miscellaneous/dsuiext_4112.ico', componentId: 'ie' },
        { id: 'cmd', title: 'Command Prompt', icon: '/win7/Shell32.dll/imageres_20.ico', componentId: 'ie' },
        { id: 'notepad', title: 'Notepad', icon: '/win7/Wordpad/wordpad_128.ico', componentId: 'resume' },
        { id: 'paint', title: 'Paint', icon: '/win7/Default Programs/mspaint_2.ico', componentId: 'paint' },
        { id: 'snipping', title: 'Snipping Tool', icon: '/win7/Filetypes, Devices, Miscellaneous/imageres_86.ico', componentId: 'ie' },
        { id: 'wordpad', title: 'WordPad', icon: '/win7/Wordpad/wordpad_128.ico', componentId: 'resume' }
      ]
    },
    {
      id: 'games', title: 'Games', icon: FOLDER_ICON, type: 'folder', children: [
        { id: 'chess', title: 'Chess Titans', icon: '/win7/Games/Chess_128.ico', componentId: 'chess' },
        { id: 'freecell', title: 'FreeCell', icon: '/win7/Games/FreeCell_121.ico', componentId: 'projects' },
        { id: 'hearts', title: 'Hearts', icon: '/win7/Games/Hearts_108.ico', componentId: 'projects' },
        { id: 'mahjong', title: 'Mahjong Titans', icon: '/win7/Games/Mahjong_102.ico', componentId: 'projects' },
        { id: 'minesweeper', title: 'Minesweeper', icon: '/win7/Games/MineSweeper_111.ico', componentId: 'projects' },
        { id: 'purble', title: 'Purble Place', icon: '/win7/Games/PurblePlace_102.ico', componentId: 'projects' },
        { id: 'solitaire', title: 'Solitaire', icon: '/win7/Games/Solitaire_108.ico', componentId: 'projects' },
        { id: 'spider', title: 'Spider Solitaire', icon: '/win7/Games/SpiderSolitaire_108.ico', componentId: 'projects' }
      ]
    },
    {
      id: 'maintenance', title: 'Maintenance', icon: FOLDER_ICON, type: 'folder', children: [
        { id: 'help', title: 'Help and Support', icon: '/win7/Filetypes, Devices, Miscellaneous/imageres_99.ico', componentId: 'ie' }
      ]
    },
    {
      id: 'startup', title: 'Startup', icon: FOLDER_ICON, type: 'folder', children: [
        { id: 'empty', title: '(Empty)', icon: FOLDER_ICON, componentId: 'ie', disabled: true }
      ]
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {items.map(item => (
        <div key={item.id}>
          <div
            onClick={() => {
              if (item.type === 'folder') {
                setExpanded(expanded === item.id ? null : item.id);
              } else if (!item.disabled) {
                open(item.id, item.title, item.componentId!);
              }
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '6px 8px', cursor: 'pointer',
              fontFamily: FONT, transition: 'none',
              background: expanded === item.id && item.type === 'folder' ? '#e5f3fb' : 'transparent',
              border: expanded === item.id && item.type === 'folder' ? '1px solid #d9ebf9' : '1px solid transparent',
              borderRadius: '2px',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLDivElement;
              if (expanded !== item.id) {
                el.style.background = '#e5f3fb';
                el.style.borderColor = '#d9ebf9';
              }
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLDivElement;
              if (expanded !== item.id) {
                el.style.background = 'transparent';
                el.style.borderColor = 'transparent';
              }
            }}
          >
            <div style={{ position: 'relative', width: '20px', height: '20px', flexShrink: 0 }}>
              <Image src={item.icon} alt={item.title} fill sizes="20px" style={{ objectFit: 'contain' }} />
            </div>
            <span style={{ fontSize: '12px', color: '#000' }}>{item.title}</span>
          </div>

          {/* Children items */}
          {item.type === 'folder' && expanded === item.id && (
            <div style={{ paddingLeft: '28px', borderLeft: '1px dotted #ccc', marginLeft: '18px', margin: '2px 0 4px 18px', display: 'flex', flexDirection: 'column', gap: '1px' }}>
              {item.children?.map((child: ProgramItem) => (
                <div
                  key={child.id}
                  onClick={() => !child.disabled && open(child.id, child.title, child.componentId!)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '4px 8px', cursor: child.disabled ? 'default' : 'pointer',
                    fontFamily: FONT, opacity: child.disabled ? 0.6 : 1,
                    borderRadius: '2px', border: '1px solid transparent',
                  }}
                  onMouseEnter={e => {
                    if (!child.disabled) {
                      (e.currentTarget as HTMLDivElement).style.background = '#e5f3fb';
                      (e.currentTarget as HTMLDivElement).style.borderColor = '#d9ebf9';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!child.disabled) {
                      (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                      (e.currentTarget as HTMLDivElement).style.borderColor = 'transparent';
                    }
                  }}
                >
                  <div style={{ position: 'relative', width: '16px', height: '16px', flexShrink: 0 }}>
                    <Image src={child.icon} alt={child.title} fill sizes="16px" style={{ objectFit: 'contain' }} />
                  </div>
                  <span style={{ fontSize: '12px', color: '#000' }}>{child.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function RightLink({ label, bold, onClick }: { label: string; bold?: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '5px 10px', fontSize: '12px', fontWeight: bold ? 'bold' : 'normal',
        color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.8)',
        cursor: 'pointer', borderRadius: '4px', border: '1px solid transparent',
        fontFamily: FONT, transition: 'none', margin: '0 4px'
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.background = 'rgba(255,255,255,0.15)';
        el.style.borderColor = 'rgba(255,255,255,0.2)';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.background = '';
        el.style.borderColor = 'transparent';
      }}
    >
      {label}
    </div>
  );
}

function Divider() {
  return (
    <div style={{
      height: '1px',
      background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.3) 20%, rgba(255,255,255,0.3) 80%, transparent)',
      margin: '4px 10px',
      boxShadow: '0 1px 0 rgba(0,0,0,0.2)',
    }} />
  );
}

function ShutdownButton() {
  return (
    <div style={{
      display: 'flex', height: '28px', borderRadius: '4px',
      overflow: 'hidden', border: '1px solid rgba(0,0,0,0.4)',
      boxShadow: '0 1px 2px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
    }}>
      <div
        style={{
          display: 'flex', alignItems: 'center', padding: '0 14px',
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.2), rgba(0,0,0,0.2))',
          fontSize: '12px', color: '#fff', fontWeight: 'bold',
          textShadow: '0 1px 2px rgba(0,0,0,0.8)',
          fontFamily: FONT, cursor: 'pointer',
          borderRight: '1px solid rgba(0,0,0,0.3)',
        }}
        onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.background = 'linear-gradient(to bottom, rgba(255,255,255,0.3), rgba(0,0,0,0.1))')}
        onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.background = 'linear-gradient(to bottom, rgba(255,255,255,0.2), rgba(0,0,0,0.2))')}
      >
        Shut down
      </div>
      <div
        style={{
          display: 'flex', alignItems: 'center', padding: '0 10px',
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.2), rgba(0,0,0,0.2))',
          cursor: 'pointer', fontSize: '9px', color: '#fff',
        }}
        onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.background = 'linear-gradient(to bottom, rgba(255,255,255,0.3), rgba(0,0,0,0.1))')}
        onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.background = 'linear-gradient(to bottom, rgba(255,255,255,0.2), rgba(0,0,0,0.2))')}
      >▶</div>
    </div>
  );
}

function SearchResultsList({ results, open }: { results: { id: string, title: string, icon: string, componentId?: string }[], open: (id: string, title: string, componentId: string, opts?: object) => void }) {
  if (results.length === 0) {
    return (
      <div style={{ padding: '24px 16px', color: '#666', textAlign: 'center', fontSize: '12px', fontFamily: FONT }}>
        No items match your search.
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
      <div style={{ 
        padding: '6px 8px 4px', fontSize: '12px', color: '#1a5fa8', 
        borderBottom: '1px solid #d9d9d9', marginBottom: '4px', fontFamily: FONT 
      }}>
        Programs ({results.length})
      </div>
      {results.map(app => (
        <LeftAppItem key={app.id} icon={app.icon} label={app.title} onClick={() => open(app.id, app.title, app.componentId || 'dialog-not-implemented')} />
      ))}
    </div>
  );
}
