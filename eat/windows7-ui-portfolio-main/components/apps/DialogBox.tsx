/* eslint-disable @next/next/no-img-element */
"use client";

import { useDesktopStore } from "@/store/useDesktopStore";


export default function DialogBox({ windowId, message, type = "info" }: { windowId: string, message: string, type?: "info" | "error" | "warning" }) {
  const { closeWindow } = useDesktopStore();

  let iconSrc = "/win7/Filetypes, Devices, Miscellaneous/imageres_104.ico"; // Info icon
  if (type === "error") iconSrc = "/win7/Filetypes, Devices, Miscellaneous/imageres_94.ico"; // Error icon
  if (type === "warning") iconSrc = "/win7/Filetypes, Devices, Miscellaneous/imageres_84.ico"; // Warning icon

  return (
    <div style={{ 
      display: 'flex', flexDirection: 'column', height: '100%', 
      background: '#f0f0f0', userSelect: 'none', 
      fontFamily: '"Segoe UI", Tahoma, sans-serif' 
    }}>
      <div style={{ display: 'flex', padding: '20px', gap: '15px', flex: 1, alignItems: 'flex-start', background: '#fff' }}>
        <img src={iconSrc} alt={type} style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
        <div style={{ fontSize: '12px', color: '#333', marginTop: '6px', lineHeight: '1.5' }}>
          {message}
        </div>
      </div>
      <div style={{ 
        background: '#f0f0f0', padding: '12px 20px', display: 'flex', justifyContent: 'flex-end', 
        borderTop: '1px solid #dfdfdf' 
      }}>
        <button 
          onClick={() => closeWindow(windowId)}
          style={{
            minWidth: '75px', padding: '4px 16px', fontSize: '12px',
            background: 'linear-gradient(to bottom, #f2f2f2, #e0e0e0)',
            border: '1px solid #707070', borderRadius: '3px',
            boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.8), 0 1px 2px rgba(0,0,0,0.1)',
            cursor: 'pointer'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'linear-gradient(to bottom, #eaf6fd, #c4e1f4)';
            e.currentTarget.style.borderColor = '#3c7fb1';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'linear-gradient(to bottom, #f2f2f2, #e0e0e0)';
            e.currentTarget.style.borderColor = '#707070';
          }}
        >
          OK
        </button>
      </div>
    </div>
  );
}
