/* eslint-disable @next/next/no-img-element */
"use client";

export default function SystemProperties() {
  return (
    <div style={{ display: 'flex', height: '100%', background: '#fff', fontFamily: '"Segoe UI", Tahoma, sans-serif', fontSize: '12px', userSelect: 'none' }}>
      
      {/* Left Sidebar */}
      <div style={{ width: '200px', background: 'linear-gradient(to right, #f0f4f8, #e8eef6)', borderRight: '1px solid #d9d9d9', padding: '15px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <SidebarLink icon="/win7/Control Panel/powercpl_512.ico" text="Control Panel Home" />
          <div style={{ height: '1px', background: '#d9d9d9', margin: '5px 0' }} />
          <SidebarLink icon="/win7/Shell32.dll/imageres_109.ico" text="Device Manager" />
          <SidebarLink icon="/win7/Filetypes, Devices, Miscellaneous/imageres_100.ico" text="Remote settings" />
          <SidebarLink icon="/win7/Filetypes, Devices, Miscellaneous/imageres_114.ico" text="System protection" />
          <SidebarLink icon="/win7/Filetypes, Devices, Miscellaneous/imageres_114.ico" text="Advanced system settings" />
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '20px 30px', overflowY: 'auto' }}>
        <h1 style={{ color: '#003399', fontSize: '16px', fontWeight: 'normal', margin: '0 0 20px 0' }}>
          View basic information about your computer
        </h1>

        {/* Windows Edition */}
        <Section title="Windows edition">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '2px' }}>Windows 7 Ultimate</div>
              <div style={{ color: '#333' }}>Copyright © 2009 Microsoft Corporation. All rights reserved.</div>
              <div style={{ color: '#333', marginTop: '4px' }}>Service Pack 1</div>
            </div>
            {/* Fake logo placeholder */}
            <div style={{ width: '80px', height: '80px', background: 'url("/win7/Control Panel/powercpl_512.ico") no-repeat center/contain', opacity: 0.8 }} />
          </div>
        </Section>

        {/* System */}
        <Section title="System">
          <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '6px' }}>
            <Label>Rating:</Label>
            <div style={{ color: '#0066cc', cursor: 'pointer' }}>5.9 Windows Experience Index</div>
            
            <Label>Processor:</Label>
            <div>Intel(R) Core(TM) i7-11700K CPU @ 3.60GHz  3.60 GHz</div>
            
            <Label>Installed memory (RAM):</Label>
            <div>16.0 GB (15.8 GB usable)</div>
            
            <Label>System type:</Label>
            <div>64-bit Operating System</div>
            
            <Label>Pen and Touch:</Label>
            <div>No Pen or Touch Input is available for this Display</div>
          </div>
        </Section>

        {/* Computer Name */}
        <Section title="Computer name, domain, and workgroup settings">
          <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '6px', position: 'relative' }}>
            <Label>Computer name:</Label>
            <div>Gividu-PC</div>
            
            <Label>Full computer name:</Label>
            <div>Gividu-PC</div>
            
            <Label>Computer description:</Label>
            <div></div>
            
            <Label>Workgroup:</Label>
            <div>WORKGROUP</div>

            <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <img src="/win7/Filetypes, Devices, Miscellaneous/imageres_114.ico" alt="" style={{ width: 16, height: 16 }} />
              <span style={{ color: '#0066cc', cursor: 'pointer' }}>Change settings</span>
            </div>
          </div>
        </Section>

        {/* Windows Activation */}
        <Section title="Windows activation">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div>Windows is activated</div>
            </div>
            <div style={{ color: '#0066cc', cursor: 'pointer' }}>Change product key</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              <Label>Product ID:</Label>
              <span>00426-OEM-8992662-00000</span>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '25px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#003399', whiteSpace: 'nowrap' }}>{title}</div>
        <div style={{ height: '1px', background: 'linear-gradient(to right, #a0a0a0, transparent)', flex: 1, marginTop: '2px' }} />
      </div>
      <div style={{ paddingLeft: '15px', color: '#333' }}>
        {children}
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div style={{ color: '#666' }}>{children}</div>;
}

function SidebarLink({ icon, text }: { icon: string, text: string }) {
  return (
    <div 
      style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#003399', cursor: 'pointer' }}
      onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
      onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
    >
      <img src={icon} alt="" style={{ width: '16px', height: '16px' }} />
      <span>{text}</span>
    </div>
  );
}
