/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronUp, Volume2, VolumeX, ShieldCheck, Wifi, Battery, Bluetooth, Monitor } from "lucide-react";

// Custom Windows 7 Volume Slider
function VolumeSlider({ volume, setVolume }: { volume: number; setVolume: (v: number) => void }) {
  const trackRef = useRef<HTMLDivElement>(null);

  const handlePointer = (e: React.PointerEvent | PointerEvent) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    let percent = 1 - (e.clientY - rect.top) / rect.height;
    percent = Math.max(0, Math.min(1, percent));
    setVolume(Math.round(percent * 100));
  };

  return (
    <div 
      style={{ width: '30px', height: '110px', position: 'relative', cursor: 'pointer', display: 'flex', justifyContent: 'center' }}
      onPointerDown={(e) => {
        handlePointer(e);
        const onMove = (ev: PointerEvent) => handlePointer(ev);
        const onUp = () => {
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener('pointerup', onUp);
        };
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
      }}
    >
      {/* Background track */}
      <div ref={trackRef} style={{ width: '6px', height: '100%', background: 'linear-gradient(to right, #d9d9d9, #efefef)', borderRadius: '3px', border: '1px solid #a0a0a0', overflow: 'hidden', position: 'relative', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)' }}>
        {/* Fill */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: `${volume}%`, background: 'linear-gradient(to right, #3da1d1, #2376a5)' }} />
      </div>
      {/* Thumb */}
      <div style={{
        position: 'absolute',
        left: '50%',
        bottom: `${volume}%`,
        transform: 'translate(-50%, 50%)',
        width: '18px',
        height: '9px',
        background: 'linear-gradient(to bottom, #f9f9f9, #d0d0d0)',
        border: '1px solid #777',
        borderRadius: '2px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.4), inset 0 1px 0 #fff',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
         <div style={{ width: '10px', height: '1px', background: '#888' }} />
      </div>
    </div>
  );
}

export default function SystemTray() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  
  // Track which flyout is active
  const [activeFlyout, setActiveFlyout] = useState<"hidden" | "network" | "volume" | null>(null);
  const [volume, setVolume] = useState(65);

  const trayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }));
      setDate(now.toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close flyouts on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (trayRef.current && !trayRef.current.contains(e.target as Node)) {
        setActiveFlyout(null);
      }
    };
    if (activeFlyout) {
      window.addEventListener("mousedown", handleClickOutside);
    }
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [activeFlyout]);

  const toggleFlyout = (flyout: "hidden" | "network" | "volume") => {
    setActiveFlyout(prev => prev === flyout ? null : flyout);
  };

  return (
    <div className="win7-systray" ref={trayRef} style={{ position: 'relative' }}>
      
      {/* Hidden icons chevron */}
      <div 
        className={`win7-systray-icon ${activeFlyout === 'hidden' ? 'active-tray-icon' : ''}`}
        title="Show hidden icons"
        onClick={() => toggleFlyout("hidden")}
        style={{
          background: activeFlyout === 'hidden' ? 'rgba(255,255,255,0.2)' : '',
          boxShadow: activeFlyout === 'hidden' ? 'inset 0 0 2px rgba(255,255,255,0.5)' : ''
        }}
      >
        <ChevronUp size={12} color="rgba(255,255,255,0.85)" />
      </div>

      {/* Separator */}
      <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.12)', margin: '0 2px' }} />

      {/* Tray Icons */}
      <div className="win7-systray-icon" title="Windows Defender: No action needed">
        <ShieldCheck size={15} color="#facc15" />
      </div>
      <div 
        className={`win7-systray-icon ${activeFlyout === 'network' ? 'active-tray-icon' : ''}`}
        title="Network: Internet access"
        onClick={() => toggleFlyout("network")}
        style={{
          background: activeFlyout === 'network' ? 'rgba(255,255,255,0.2)' : '',
          boxShadow: activeFlyout === 'network' ? 'inset 0 0 2px rgba(255,255,255,0.5)' : ''
        }}
      >
        <Wifi size={15} color="rgba(255,255,255,0.9)" />
      </div>
      <div 
        className={`win7-systray-icon ${activeFlyout === 'volume' ? 'active-tray-icon' : ''}`}
        title={`Speakers: ${volume}%`}
        onClick={() => toggleFlyout("volume")}
        style={{
          background: activeFlyout === 'volume' ? 'rgba(255,255,255,0.2)' : '',
          boxShadow: activeFlyout === 'volume' ? 'inset 0 0 2px rgba(255,255,255,0.5)' : ''
        }}
      >
        <Volume2 size={15} color="rgba(255,255,255,0.9)" />
      </div>

      {/* Separator */}
      <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.12)', margin: '0 2px' }} />

      {/* Clock & Date */}
      <div
        className="win7-systray-clock"
        title={new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        onDoubleClick={() => {
          import("@/store/useDesktopStore").then(({ useDesktopStore }) => {
            useDesktopStore.getState().openWindow({
              id: "datetime",
              title: "Date and Time Properties",
              componentId: "datetime",
              defaultWidth: 500,
              defaultHeight: 420,
              isResizable: false,
            });
          });
        }}
      >
        <span>{time}</span>
        <span>{date}</span>
      </div>

      {/* ── FLYOUT MENUS ── */}

      {/* Hidden Icons Flyout */}
      {activeFlyout === "hidden" && (
        <div style={{
          position: 'fixed',
          bottom: '40px',
          right: '90px',
          background: 'linear-gradient(135deg, rgba(230, 240, 255, 0.95), rgba(210, 225, 245, 0.98))',
          border: '1px solid #7a9ea5',
          borderRadius: '4px 4px 0 0',
          padding: '8px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px',
          boxShadow: '0 -2px 10px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.8)',
          zIndex: 10000,
          borderBottom: 'none'
        }}>
          <div className="flyout-icon" title="Bluetooth Devices"><Bluetooth size={16} color="#005599" /></div>
          <div className="flyout-icon" title="Battery: 100%"><Battery size={16} color="#005599" /></div>
          <div className="flyout-icon" title="Display settings"><Monitor size={16} color="#005599" /></div>
          <div className="flyout-icon" title="Windows Update"><img src="/win7/Control Panel/powercpl_512.ico" style={{width: 16, height: 16}} alt="" /></div>
          <style>{`
            .flyout-icon { width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; border-radius: 3px; cursor: pointer; }
            .flyout-icon:hover { background: rgba(255,255,255,0.6); box-shadow: 0 0 2px rgba(0,0,0,0.2); }
          `}</style>
        </div>
      )}

      {/* Network Flyout */}
      {activeFlyout === "network" && (
        <div style={{
          position: 'fixed',
          bottom: '40px',
          right: '40px',
          width: '280px',
          background: '#fff',
          border: '1px solid #7a9ea5',
          borderRadius: '4px 4px 0 0',
          boxShadow: '0 -2px 10px rgba(0,0,0,0.3)',
          zIndex: 10000,
          display: 'flex',
          flexDirection: 'column',
          fontSize: '12px',
          fontFamily: '"Segoe UI", Tahoma, sans-serif'
        }}>
          {/* Header */}
          <div style={{ padding: '12px 16px', background: '#f5f8fa', borderBottom: '1px solid #d9d9d9', borderTopLeftRadius: '3px', borderTopRightRadius: '3px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#003399' }}>Currently connected to:</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
              <Monitor size={24} color="#555" />
              <div>
                <div style={{ fontWeight: 'bold' }}>Home Network</div>
                <div style={{ color: '#666' }}>Internet access</div>
              </div>
            </div>
          </div>
          
          {/* Networks list */}
          <div style={{ padding: '12px 0', borderBottom: '1px solid #d9d9d9', background: '#fff' }}>
            <div style={{ padding: '0 16px 8px', fontWeight: 'bold', color: '#003399' }}>Wireless Network Connection</div>
            
            {['Home Network', 'Guest_Wi-Fi', 'CoffeeShop_5G'].map((net, i) => (
              <div key={net} className="network-item" style={{ 
                padding: '6px 16px', display: 'flex', justifyContent: 'space-between', cursor: 'pointer',
                background: i === 0 ? '#e5f3fb' : 'transparent', border: i === 0 ? '1px solid #d9ebf9' : '1px solid transparent'
              }}>
                <div>
                  <div style={{ fontWeight: i === 0 ? 'bold' : 'normal' }}>{net}</div>
                  {i === 0 && <div style={{ color: '#666' }}>Connected</div>}
                </div>
                <Wifi size={18} color={i === 0 ? "#0066cc" : "#666"} />
              </div>
            ))}
          </div>
          <style>{`
            .network-item:hover { background: #e5f3fb !important; border-color: #d9ebf9 !important; }
          `}</style>
          
          {/* Footer */}
          <div style={{ padding: '8px 16px', background: '#f0f0f0', color: '#003399', cursor: 'pointer' }} className="network-footer">
            Open Network and Sharing Center
          </div>
          <style>{`.network-footer:hover { text-decoration: underline; }`}</style>
        </div>
      )}

      {/* Volume Flyout */}
      {activeFlyout === "volume" && (
        <div style={{
          position: 'fixed',
          bottom: '40px',
          right: '30px',
          width: '90px',
          background: '#f9f9f9',
          border: '1px solid #7a9ea5',
          borderRadius: '4px 4px 0 0',
          boxShadow: '0 -2px 10px rgba(0,0,0,0.3)',
          zIndex: 10000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          fontFamily: '"Segoe UI", Tahoma, sans-serif'
        }}>
          {/* Header */}
          <div style={{ padding: '8px 0', borderBottom: '1px solid #e0e0e0', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Monitor size={20} color="#005599" />
            <div style={{ fontSize: '11px', color: '#333', marginTop: '2px' }}>Speakers</div>
          </div>
          
          {/* Slider */}
          <div style={{ padding: '16px 0', display: 'flex', justifyContent: 'center', background: '#fff', width: '100%', flex: 1 }}>
            <VolumeSlider volume={volume} setVolume={setVolume} />
          </div>
          
          {/* Footer */}
          <div style={{ 
            padding: '8px 0', width: '100%', borderTop: '1px solid #e0e0e0', 
            background: '#f0f0f0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' 
          }}>
            <div 
              style={{ width: '32px', height: '32px', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid transparent', cursor: 'pointer' }}
              className="vol-btn"
              onClick={() => setVolume(volume === 0 ? 65 : 0)}
            >
              {volume === 0 ? <VolumeX size={18} color="#999" /> : <Volume2 size={18} color="#005599" />}
            </div>
            <div className="mixer-link" style={{ fontSize: '11px', color: '#003399', cursor: 'pointer' }}>Mixer</div>
          </div>
          <style>{`
            .vol-btn:hover { background: #e5f3fb; border-color: #d9ebf9; }
            .mixer-link:hover { text-decoration: underline; }
          `}</style>
        </div>
      )}

    </div>
  );
}
