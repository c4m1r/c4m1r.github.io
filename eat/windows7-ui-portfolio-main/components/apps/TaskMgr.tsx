"use client";

import { useEffect, useState } from "react";

const processes = [
  { id: 1, name: "explorer.exe", user: "Gividu", cpu: "00", mem: "45,212 K", desc: "Windows Explorer" },
  { id: 2, name: "dwm.exe", user: "Gividu", cpu: "01", mem: "22,144 K", desc: "Desktop Window Manager" },
  { id: 3, name: "System", user: "SYSTEM", cpu: "00", mem: "128 K", desc: "NT Kernel & System" },
  { id: 4, name: "chrome.exe", user: "Gividu", cpu: "12", mem: "1,204,500 K", desc: "Google Chrome" },
  { id: 5, name: "svchost.exe", user: "SYSTEM", cpu: "00", mem: "14,800 K", desc: "Host Process for Windows Services" },
  { id: 6, name: "services.exe", user: "SYSTEM", cpu: "00", mem: "6,200 K", desc: "Services and Controller app" },
  { id: 7, name: "taskmgr.exe", user: "Gividu", cpu: "02", mem: "18,432 K", desc: "Windows Task Manager" },
];

export default function TaskMgr() {
  const [activeTab, setActiveTab] = useState("processes");
  const [cpuUsage, setCpuUsage] = useState(15);
  const [memUsage, setMemUsage] = useState(42);
  const [selectedPid, setSelectedPid] = useState<number | null>(7);

  // Simulate dynamic usage
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(Math.floor(Math.random() * 20) + 10);
      setMemUsage(Math.floor(Math.random() * 5) + 40);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const menuItems = ["File", "Options", "View", "Help"];
  const tabs = ["Applications", "Processes", "Services", "Performance", "Networking", "Users"];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f0f0f0', fontFamily: '"Segoe UI", Tahoma, sans-serif', fontSize: '12px', userSelect: 'none' }}>
      
      {/* Menu bar */}
      <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #d9d9d9', padding: '0 4px', background: '#f0f0f0', height: '20px' }}>
        {menuItems.map(item => (
          <span
            key={item}
            style={{ padding: '1px 6px', cursor: 'default', borderRadius: '3px', fontSize: '11px' }}
            onMouseEnter={e => { (e.currentTarget as HTMLSpanElement).style.background = '#e5f3fb'; (e.currentTarget as HTMLSpanElement).style.border = '1px solid #70c0e7'; (e.currentTarget as HTMLSpanElement).style.padding = '0 5px'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLSpanElement).style.background = ''; (e.currentTarget as HTMLSpanElement).style.border = '1px solid transparent'; (e.currentTarget as HTMLSpanElement).style.padding = '1px 6px'; }}
          >{item}</span>
        ))}
      </div>

      <div style={{ flex: 1, padding: '8px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #898c95', paddingLeft: '2px', position: 'relative', zIndex: 1 }}>
          {tabs.map(tab => {
            const isActive = activeTab === tab.toLowerCase();
            return (
              <div
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                style={{
                  padding: '3px 8px',
                  background: isActive ? '#fff' : '#f0f0f0',
                  border: '1px solid #898c95',
                  borderBottom: isActive ? '1px solid #fff' : '1px solid #898c95',
                  borderTopLeftRadius: '3px',
                  borderTopRightRadius: '3px',
                  marginRight: '1px',
                  marginBottom: '-1px',
                  cursor: 'default',
                  zIndex: isActive ? 2 : 1,
                  position: 'relative'
                }}
                onMouseEnter={e => !isActive && ((e.currentTarget as HTMLDivElement).style.background = '#eaf6fd')}
                onMouseLeave={e => !isActive && ((e.currentTarget as HTMLDivElement).style.background = '#f0f0f0')}
              >
                {tab}
              </div>
            );
          })}
        </div>

        {/* Tab Content Panel */}
        <div style={{ flex: 1, background: '#fff', border: '1px solid #898c95', borderTop: 'none', display: 'flex', flexDirection: 'column', padding: '10px' }}>
          
          {activeTab === 'processes' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', border: '1px solid #828790' }}>
              <div style={{ display: 'flex', background: '#f0f0f0', borderBottom: '1px solid #828790' }}>
                <div style={{ flex: 2, padding: '2px 4px', borderRight: '1px solid #d9d9d9' }}>Image Name</div>
                <div style={{ flex: 1.5, padding: '2px 4px', borderRight: '1px solid #d9d9d9' }}>User Name</div>
                <div style={{ flex: 0.5, padding: '2px 4px', borderRight: '1px solid #d9d9d9', textAlign: 'right' }}>CPU</div>
                <div style={{ flex: 1.5, padding: '2px 4px', borderRight: '1px solid #d9d9d9', textAlign: 'right' }}>Memory (Priva...</div>
                <div style={{ flex: 2.5, padding: '2px 4px' }}>Description</div>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', background: '#fff' }}>
                {processes.map(proc => {
                  const isSelected = proc.id === selectedPid;
                  return (
                    <div 
                      key={proc.id} 
                      onClick={() => setSelectedPid(proc.id)}
                      style={{ 
                        display: 'flex', 
                        background: isSelected ? '#3399ff' : 'transparent',
                        color: isSelected ? '#fff' : '#000',
                        cursor: 'default'
                      }}
                    >
                      <div style={{ flex: 2, padding: '2px 4px' }}>{proc.name}</div>
                      <div style={{ flex: 1.5, padding: '2px 4px' }}>{proc.user}</div>
                      <div style={{ flex: 0.5, padding: '2px 4px', textAlign: 'right' }}>{proc.cpu}</div>
                      <div style={{ flex: 1.5, padding: '2px 4px', textAlign: 'right' }}>{proc.mem}</div>
                      <div style={{ flex: 2.5, padding: '2px 4px' }}>{proc.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', gap: '10px', flex: 1 }}>
                <div style={{ flex: 1, border: '1px solid #828790', padding: '5px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ marginBottom: '5px' }}>CPU Usage</div>
                  <div style={{ flex: 1, background: '#000', position: 'relative', border: '1px solid #828790' }}>
                    <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: `${cpuUsage}%`, background: 'rgba(57, 181, 74, 0.5)', borderTop: '1px solid #39b54a' }} />
                  </div>
                  <div style={{ textAlign: 'center', marginTop: '2px', color: '#39b54a', fontWeight: 'bold' }}>{cpuUsage} %</div>
                </div>
                <div style={{ flex: 1, border: '1px solid #828790', padding: '5px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ marginBottom: '5px' }}>Memory</div>
                  <div style={{ flex: 1, background: '#000', position: 'relative', border: '1px solid #828790' }}>
                    <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: `${memUsage}%`, background: 'rgba(57, 181, 74, 0.5)', borderTop: '1px solid #39b54a' }} />
                  </div>
                  <div style={{ textAlign: 'center', marginTop: '2px', color: '#39b54a', fontWeight: 'bold' }}>2.14 GB</div>
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'processes' && activeTab !== 'performance' && (
             <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
               There are no items to show in this view.
             </div>
          )}

          {/* Bottom actions within tab */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <input type="checkbox" id="showAll" />
              <label htmlFor="showAll">Show processes from all users</label>
            </div>
            <button 
              disabled={!selectedPid || activeTab !== 'processes'}
              style={{
                padding: '4px 12px', minWidth: '90px',
                background: 'linear-gradient(to bottom, #f2f2f2, #e0e0e0)',
                border: '1px solid #707070', borderRadius: '3px',
                boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.8)',
                cursor: (!selectedPid || activeTab !== 'processes') ? 'default' : 'pointer',
                opacity: (!selectedPid || activeTab !== 'processes') ? 0.6 : 1
              }}
            >
              End Process
            </button>
          </div>
        </div>

      </div>

      {/* Status Bar */}
      <div style={{ 
        display: 'flex', borderTop: '1px solid #d9d9d9', height: '22px', 
        background: '#f0f0f0', padding: '0 4px', alignItems: 'center', gap: '15px' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', borderRight: '1px solid #d9d9d9', paddingRight: '15px', height: '14px' }}>
          Processes: {processes.length}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', borderRight: '1px solid #d9d9d9', paddingRight: '15px', height: '14px' }}>
          CPU Usage: {cpuUsage}%
        </div>
        <div style={{ display: 'flex', alignItems: 'center', height: '14px' }}>
          Physical Memory: {memUsage}%
        </div>
      </div>

    </div>
  );
}
