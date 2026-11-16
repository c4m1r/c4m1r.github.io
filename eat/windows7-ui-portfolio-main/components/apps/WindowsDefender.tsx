/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";

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

export default function WindowsDefender() {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (scanning) {
      const interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            setScanning(false);
            return 100;
          }
          return p + 5;
        });
      }, 200);
      return () => clearInterval(interval);
    }
  }, [scanning]);

  const handleStartScan = () => {
    setProgress(0);
    setScanning(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', color: '#000', fontSize: '12px', fontFamily: '"Segoe UI", Tahoma, sans-serif', userSelect: 'none' }}>
      
      {/* Top toolbar */}
      <div style={{ display: 'flex', flexDirection: 'column', borderBottom: '1px solid #d9d9d9', background: 'linear-gradient(to bottom, #f0f4f8, #e0e8f0)' }}>
        
        {/* Command toolbar row */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '6px 8px', gap: '4px' }}>
          <Btn icon="/win7/Windows Defender/MsMpRes_103.ico">Home</Btn>
          <Btn onClick={handleStartScan}>Scan <span style={{ fontSize: '8px', marginLeft: '2px' }}>▼</span></Btn>
          <Btn>History</Btn>
          <Btn>Tools</Btn>
          <Btn>Help <span style={{ fontSize: '8px', marginLeft: '2px' }}>▼</span></Btn>
        </div>
      </div>

      {/* Main content area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Banner area */}
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: '15px', padding: '20px', 
          background: 'linear-gradient(to right, #e2f4df, #f3fcf2)', 
          borderBottom: '1px solid #c9e9c5' 
        }}>
          <div style={{ width: '48px', height: '48px', position: 'relative' }}>
            <img src="/win7/Windows Defender/MsMpRes_103.ico" alt="Defender" style={{ width: '100%', height: '100%' }} />
            <div style={{ 
              position: 'absolute', bottom: -5, right: -5, 
              width: 20, height: 20, borderRadius: '50%', 
              background: '#00b050', border: '2px solid #fff', 
              display: 'flex', alignItems: 'center', justifyContent: 'center' 
            }}>
              <span style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>✓</span>
            </div>
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '18px', color: '#006600', fontWeight: 'normal' }}>
              Your computer is running normally.
            </h1>
            <p style={{ margin: '4px 0 0', color: '#333' }}>
              Windows Defender is actively protecting your computer.
            </p>
          </div>
        </div>

        {/* Content details */}
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '500px' }}>
            {scanning ? (
              <div style={{ padding: '15px', border: '1px solid #d9d9d9', borderRadius: '4px', background: '#f9f9f9' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Scanning your computer...</div>
                <div style={{ width: '100%', height: '14px', background: '#e6e6e6', border: '1px solid #ccc', borderRadius: '2px' }}>
                  <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(to bottom, #5cb8e6, #1f8ac9)', transition: 'width 0.2s ease-out' }} />
                </div>
                <div style={{ marginTop: '8px', color: '#666', fontSize: '11px' }}>
                  Files scanned: {Math.floor(progress * 142.3)}
                </div>
              </div>
            ) : (
              <div style={{ padding: '15px', border: '1px solid #d9d9d9', borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '10px' }}>
                  <div style={{ color: '#666' }}>Real-time protection:</div>
                  <div style={{ fontWeight: 'bold' }}>On</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '10px' }}>
                  <div style={{ color: '#666' }}>Definitions version:</div>
                  <div>1.192.3021.0</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '10px' }}>
                  <div style={{ color: '#666' }}>Last scan:</div>
                  <div>Today, 08:30 AM (Quick Scan)</div>
                </div>
              </div>
            )}
            
            {!scanning && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <div 
                  style={{
                    padding: '6px 12px', background: 'linear-gradient(to bottom, #f2f2f2, #e0e0e0)',
                    border: '1px solid #999', borderRadius: '3px', cursor: 'pointer',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8)'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'linear-gradient(to bottom, #eaf6fd, #c4e1f4)', e.currentTarget.style.borderColor = '#3399ff')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'linear-gradient(to bottom, #f2f2f2, #e0e0e0)', e.currentTarget.style.borderColor = '#999')}
                  onClick={handleStartScan}
                >
                  Scan now
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Status bar */}
      <div style={{
        height: '30px', borderTop: '1px solid #d9d9d9',
        background: '#f0f0f0', display: 'flex', alignItems: 'center', padding: '0 12px', gap: '10px',
      }}>
        <img src="/win7/Windows Defender/MsMpRes_103.ico" alt="" style={{ width: 16, height: 16 }} />
        <span style={{ fontSize: '11px', color: '#555' }}>Windows Defender</span>
      </div>
    </div>
  );
}
