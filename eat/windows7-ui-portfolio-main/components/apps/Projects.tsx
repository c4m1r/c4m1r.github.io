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
      padding: '4px 8px', borderRadius: '3px', cursor: disabled ? 'default' : 'pointer',
      opacity: disabled ? 0.5 : 1, userSelect: 'none', fontSize: '12px',
      color: '#103063', transition: 'background 0.1s', border: '1px solid transparent'
    }}
    className={className}
    onMouseEnter={e => !disabled && ((e.currentTarget as HTMLDivElement).style.background = 'linear-gradient(to bottom, #eaf6fd, #c4e1f4)', (e.currentTarget as HTMLDivElement).style.borderColor = '#98c1df')}
    onMouseLeave={e => (!disabled && ((e.currentTarget as HTMLDivElement).style.background = ''), (e.currentTarget as HTMLDivElement).style.borderColor = 'transparent')}
  >
    {icon && <img src={icon} alt="" style={{ width: 16, height: 16, objectFit: 'contain' }} />}
    {children}
  </div>
);

const projects = [
  {
    id: 1,
    title: "Windows 7 OS Web Portfolio",
    type: "Web Application",
    date: "7/17/2026 10:20 AM",
    size: "15.4 MB",
    description: "A nostalgic, pixel-perfect recreation of the Windows 7 operating system built entirely in the browser using React and Next.js.",
    tech: "Next.js, React, Tailwind CSS",
    icon: "/win7/Standard Folders/imageres_3.ico",
    link: "#",
    github: "#"
  },
  {
    id: 2,
    title: "Academic Scheduler - TeamSync",
    type: "MERN Stack App",
    date: "4/15/2025 09:30 AM",
    size: "24.1 MB",
    description: "A full MERN stack team collaboration feature designed to optimize academic productivity for student groups.",
    tech: "React, Node.js, MongoDB, Tailwind",
    icon: "/win7/Standard Folders/imageres_3.ico",
    link: "#",
    github: "#"
  },
  {
    id: 3,
    title: "Facebook Activity Cleaner",
    type: "Chrome Extension",
    date: "4/02/2026 11:15 AM",
    size: "2.1 MB",
    description: "A privacy-focused Chrome Extension to automate the bulk deletion of Facebook Activity Log entries.",
    tech: "JavaScript, HTML5, DOM API",
    icon: "/win7/Standard Folders/imageres_3.ico",
    link: "#",
    github: "#"
  },
  {
    id: 4,
    title: "HarmoniX Music Marketplace",
    type: "Full Stack App",
    date: "8/20/2025 03:45 PM",
    size: "42.5 MB",
    description: "A centralized digital marketplace for the music industry, enabling producers and vocalists to connect and collaborate.",
    tech: "React, Spring Boot, Docker",
    icon: "/win7/Standard Folders/imageres_3.ico",
    link: "#",
    github: "#"
  },
  {
    id: 5,
    title: "Inventory Management System",
    type: "Web Dashboard",
    date: "10/10/2024 01:20 PM",
    size: "18.3 MB",
    description: "A comprehensive web-based inventory solution with automated low-stock alerts and dynamic charting.",
    tech: "React, Node.js, Chart.js",
    icon: "/win7/Standard Folders/imageres_3.ico",
    link: "#",
    github: "#"
  },
  {
    id: 6,
    title: "Order Management System",
    type: "PHP Web App",
    date: "5/28/2024 10:05 AM",
    size: "11.2 MB",
    description: "A workflow-driven application to help retail teams coordinate inventory and orders via approval-based structures.",
    tech: "PHP 8, MySQL, Docker",
    icon: "/win7/Standard Folders/imageres_3.ico",
    link: "#",
    github: "#"
  },
  {
    id: 7,
    title: "Task Manager App",
    type: "Android App",
    date: "9/15/2024 04:30 PM",
    size: "34.8 MB",
    description: "A native Android application allowing users to track daily tasks and manage productivity efficiently with custom alarms.",
    tech: "Kotlin, Android Studio",
    icon: "/win7/Standard Folders/imageres_3.ico",
    link: "#",
    github: "#"
  }
];

export default function Projects() {
  const { openWindow } = useDesktopStore();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  
  const selectedProject = projects.find(p => p.id === selectedId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', color: '#000', fontSize: '12px', fontFamily: '"Segoe UI", Tahoma, sans-serif' }}>
      
      {/* Top Aero command bar (Address + Search) */}
      <div style={{ 
        display: 'flex', alignItems: 'center', padding: '6px 8px', gap: '8px', 
        background: 'linear-gradient(to bottom, #eff5fc, #d5e5f5)', 
        borderBottom: '1px solid #b6cae0' 
      }}>
        {/* Navigation arrows */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #7db3ea, #3373c4)', border: '1px solid #143869', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.5)' }}>
            <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '16px', marginTop: '-2px', textShadow: '0 1px 1px rgba(0,0,0,0.5)' }}>←</span>
          </div>
          <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg, #e4eff8, #b8d2eb)', border: '1px solid #8ba4bd', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
            <span style={{ color: '#555', fontWeight: 'bold', fontSize: '14px', marginTop: '-2px' }}>→</span>
          </div>
        </div>

        {/* Address Bar */}
        <div style={{ 
          flex: 1, display: 'flex', alignItems: 'center', background: '#fff', 
          border: '1px solid #999', borderRadius: '2px', height: '24px', padding: '0 4px',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
        }}>
          <img src="/win7/Standard Folders/imageres_3.ico" alt="" style={{ width: 14, height: 14, marginRight: 6 }} />
          <span style={{ color: '#555' }}>Libraries</span>
          <span style={{ margin: '0 4px', color: '#999', fontSize: '10px' }}>▶</span>
          <span style={{ color: '#555' }}>Documents</span>
          <span style={{ margin: '0 4px', color: '#999', fontSize: '10px' }}>▶</span>
          <span style={{ color: '#000' }}>My Projects</span>
        </div>

        {/* Search Bar */}
        <div style={{ 
          width: '200px', display: 'flex', alignItems: 'center', background: '#fff', 
          border: '1px solid #999', borderRadius: '2px', height: '24px', padding: '0 6px',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
        }}>
          <span style={{ flex: 1, color: '#999', fontStyle: 'italic' }}>Search My Projects</span>
          <span style={{ color: '#1a5fa8', fontSize: '14px', transform: 'rotate(-45deg)' }}>⚲</span>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ 
        display: 'flex', alignItems: 'center', padding: '4px 8px', gap: '1px', 
        background: 'linear-gradient(to bottom, #f0f4f8, #e0e8f0)', 
        borderBottom: '1px solid #d9d9d9' 
      }}>
        <Btn>Organize <span style={{ fontSize: '8px', marginLeft: '2px' }}>▼</span></Btn>
        <Btn>Share with <span style={{ fontSize: '8px', marginLeft: '2px' }}>▼</span></Btn>
        <Btn>Burn</Btn>
        <Btn>New folder</Btn>
        <div style={{ flex: 1 }} />
        <Btn icon="/win7/Control Panel/imageres_78.ico">View on GitHub</Btn>
        <Btn><span style={{ fontSize: '14px', color: '#555' }}>≡</span> <span style={{ fontSize: '8px', marginLeft: '2px' }}>▼</span></Btn>
        <Btn><span style={{ fontSize: '14px', color: '#1a5fa8' }}>?</span></Btn>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        
        {/* Left Nav Pane */}
        <div style={{
          width: '200px', background: '#fff', borderRight: '1px solid #d9d9d9',
          overflowY: 'auto', padding: '8px 2px', display: 'flex', flexDirection: 'column', gap: '2px'
        }}>
          {[
            { label: 'Favorites', icon: '/win7/Standard Folders/imageres_183.ico', expanded: true, children: [
              { label: 'Desktop', icon: '/win7/Special Folders/imageres_115.ico' },
              { label: 'Downloads', icon: '/win7/Special Folders/imageres_184.ico' },
              { label: 'Recent Places', icon: '/win7/Special Folders/imageres_123.ico' }
            ]},
            { label: 'Libraries', icon: '/win7/Standard Folders/imageres_10.ico', expanded: true, children: [
              { label: 'Documents', icon: '/win7/Special Folders/imageres_112.ico', active: true, children: [
                  { label: 'My Projects', icon: '/win7/Standard Folders/imageres_3.ico', active: true, isChildOfActive: true }
              ] },
              { label: 'Music', icon: '/win7/Special Folders/imageres_108.ico' },
              { label: 'Pictures', icon: '/win7/Special Folders/imageres_113.ico' },
              { label: 'Videos', icon: '/win7/Special Folders/imageres_189.ico' }
            ]},
            { label: 'Computer', icon: '/win7/Shell32.dll/imageres_109.ico', expanded: false },
            { label: 'Network', icon: '/win7/Standard Folders/imageres_143.ico', expanded: false }
          ].map((item, idx) => (
            <div key={idx}>
              <div style={{ display: 'flex', alignItems: 'center', padding: '4px 6px', gap: '4px', cursor: 'pointer' }}
                   onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.05)')}
                   onMouseLeave={e => (e.currentTarget.style.background = '')}>
                <span style={{ fontSize: '8px', opacity: 0.5, width: '10px' }}>{item.expanded ? '▼' : '▶'}</span>
                <img src={item.icon} alt="" style={{ width: 16, height: 16 }} />
                <span>{item.label}</span>
              </div>
              {item.expanded && item.children?.map((child, cIdx) => (
                <div key={cIdx}>
                  <div style={{ 
                    display: 'flex', alignItems: 'center', padding: '4px 6px 4px 24px', gap: '6px', cursor: 'pointer',
                    background: child.active && !child.children ? '#e5f3fb' : 'transparent',
                    color: child.active ? '#003399' : '#000',
                  }}
                  onMouseEnter={e => !child.active && (e.currentTarget.style.background = 'rgba(0,0,0,0.05)')}
                  onMouseLeave={e => !child.active && (e.currentTarget.style.background = '')}>
                    {child.children ? (
                      <span style={{ fontSize: '8px', opacity: 0.5, width: '10px', marginLeft: '-14px' }}>▼</span>
                    ) : (
                      <span style={{ width: '10px', marginLeft: '-14px' }} />
                    )}
                    <img src={child.icon} alt="" style={{ width: 16, height: 16 }} />
                    <span>{child.label}</span>
                  </div>
                  
                  {/* Nested children (My Projects) */}
                  {child.children?.map((sub, sIdx) => (
                    <div key={sIdx} style={{ 
                      display: 'flex', alignItems: 'center', padding: '4px 6px 4px 44px', gap: '6px', cursor: 'pointer',
                      background: sub.active ? '#e5f3fb' : 'transparent', border: sub.active ? '1px solid #d9ebf9' : '1px solid transparent',
                      color: '#003399', fontWeight: 'bold'
                    }}>
                      <img src={sub.icon} alt="" style={{ width: 16, height: 16 }} />
                      <span>{sub.label}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Right Content Area (Files) */}
        <div style={{ flex: 1, background: '#fff', overflowY: 'auto', display: 'flex', flexDirection: 'column' }} onClick={() => setSelectedId(null)}>
          
          <div style={{ display: 'flex', alignItems: 'center', padding: '4px 0', borderBottom: '1px solid #f0f0f0', color: '#666', overflow: 'hidden' }}>
            <div style={{ width: '30px', flexShrink: 0 }} />
            <div style={{ flex: 2, minWidth: '100px', paddingLeft: '4px', borderRight: '1px solid #f0f0f0', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} className="hover:bg-slate-100">Name</div>
            <div style={{ flex: 1.5, minWidth: '110px', paddingLeft: '8px', borderRight: '1px solid #f0f0f0', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} className="hover:bg-slate-100">Date modified</div>
            <div style={{ flex: 1.2, minWidth: '90px', paddingLeft: '8px', borderRight: '1px solid #f0f0f0', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} className="hover:bg-slate-100">Type</div>
            <div style={{ flex: 1, minWidth: '70px', paddingLeft: '8px', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} className="hover:bg-slate-100">Size</div>
          </div>

          <div style={{ padding: '8px' }}>
            {projects.map((project) => (
              <div 
                key={project.id}
                onClick={(e) => { e.stopPropagation(); setSelectedId(project.id); }}
                onDoubleClick={() => openWindow({ id: `proj_${project.id}`, title: project.title, componentId: 'dialog-not-implemented' })}
                style={{ 
                  display: 'flex', alignItems: 'center', padding: '4px 0', cursor: 'default',
                  background: selectedId === project.id ? '#cce8ff' : 'transparent',
                  border: selectedId === project.id ? '1px solid #99d1ff' : '1px solid transparent',
                  borderRadius: '2px'
                }}
                onMouseEnter={e => {
                  if (selectedId !== project.id) {
                    e.currentTarget.style.background = '#e5f3fb';
                    e.currentTarget.style.border = '1px solid #d9ebf9';
                  }
                }}
                onMouseLeave={e => {
                  if (selectedId !== project.id) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.border = '1px solid transparent';
                  }
                }}
              >
                <div style={{ width: '30px', flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
                  <img src={project.icon} alt="" style={{ width: 16, height: 16 }} />
                </div>
                <div style={{ flex: 2, minWidth: '100px', paddingLeft: '4px', color: '#000', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {project.title}
                </div>
                <div style={{ flex: 1.5, minWidth: '110px', paddingLeft: '8px', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{project.date}</div>
                <div style={{ flex: 1.2, minWidth: '90px', paddingLeft: '8px', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{project.type}</div>
                <div style={{ flex: 1, minWidth: '70px', paddingLeft: '8px', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{project.size}</div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Details Pane (Bottom) */}
      <div style={{ 
        height: '60px', borderTop: '1px solid #b6cae0', 
        background: 'linear-gradient(to right, #d4e7f8, #e5f1fb)', 
        display: 'flex', alignItems: 'center', padding: '0 16px', gap: '16px', flexShrink: 0 
      }}>
        <img 
          src={selectedProject ? selectedProject.icon : "/win7/Standard Folders/imageres_3.ico"} 
          alt="" 
          style={{ width: 32, height: 32 }} 
        />
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#1a5fa8', display: 'flex', gap: '8px', alignItems: 'center' }}>
            {selectedProject ? selectedProject.title : "3 items"}
            {selectedProject && (
               <a href={selectedProject.github} style={{ color: '#0066cc', fontSize: '11px', textDecoration: 'none', background: 'rgba(255,255,255,0.5)', padding: '2px 6px', borderRadius: '2px', border: '1px solid #b6cae0' }}>View on GitHub</a>
            )}
          </div>
          <div style={{ color: '#333', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {selectedProject ? selectedProject.description : "My Projects Library"}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', color: '#555', borderLeft: '1px solid #b6cae0', paddingLeft: '16px', minWidth: '260px', overflow: 'hidden' }}>
          {selectedProject ? (
            <>
              <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={selectedProject.tech}><span style={{ color: '#888' }}>Tech:</span> {selectedProject.tech}</div>
              <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}><span style={{ color: '#888' }}>Date modified:</span> {selectedProject.date}</div>
            </>
          ) : (
            <div><span style={{ color: '#888' }}>State:</span> Shared</div>
          )}
        </div>
      </div>
    </div>
  );
}
