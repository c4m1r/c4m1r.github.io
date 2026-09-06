"use client";

import { useDesktopStore } from "@/store/useDesktopStore";

const categories = [
  {
    title: "System and Security",
    icon: "/win7/Control Panel/imageres_78.ico", // Shield icon usually
    links: [
      "Review your computer's status",
      "Back up your computer",
      "Find and fix problems"
    ]
  },
  {
    title: "User Accounts and Family Safety",
    icon: "/win7/Shell32.dll/shell32_268.ico",
    links: [
      "Add or remove user accounts",
      "Set up parental controls for any user"
    ]
  },
  {
    title: "Network and Internet",
    icon: "/win7/Filetypes, Devices, Miscellaneous/imageres_25.ico",
    links: [
      "View network status and tasks",
      "Choose homegroup and sharing options"
    ]
  },
  {
    title: "Appearance and Personalization",
    icon: "/win7/Control Panel/imageres_27.ico",
    links: [
      "Change the theme",
      "Change desktop background",
      "Adjust screen resolution"
    ]
  },
  {
    title: "Hardware and Sound",
    icon: "/win7/Shell32.dll/imageres_109.ico",
    links: [
      "View devices and printers",
      "Add a device"
    ]
  },
  {
    title: "Clock, Language, and Region",
    icon: "/win7/Control Panel/imageres_87.ico",
    links: [
      "Change keyboards or other input methods",
      "Change display language"
    ]
  },
  {
    title: "Programs",
    icon: "/win7/Filetypes, Devices, Miscellaneous/appwiz_1507.ico",
    links: [
      "Uninstall a program"
    ]
  },
  {
    title: "Ease of Access",
    icon: "/win7/Filetypes, Devices, Miscellaneous/imageres_86.ico",
    links: [
      "Let Windows suggest settings",
      "Optimize visual display"
    ]
  }
];

export default function ControlPanel() {
  const { openWindow } = useDesktopStore();

  const handleLinkClick = (link: string) => {
    if (link === "Review your computer's status" || link === "System and Security") {
      openWindow({ id: "sysprops", title: "System Properties", componentId: "sysprops", defaultWidth: 700, defaultHeight: 550 });
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
            <img src="/win7/Control Panel/powercpl_512.ico" alt="" style={{ width: 14, height: 14 }} />
            <span style={{ fontSize: '10px', color: '#666', margin: '0 2px' }}>▶</span>
            <span style={{ padding: '0 4px', cursor: 'default', borderRadius: '2px' }}
              onMouseEnter={e => (e.currentTarget as HTMLSpanElement).style.background = '#e5f3fb'}
              onMouseLeave={e => (e.currentTarget as HTMLSpanElement).style.background = ''}
            >Control Panel</span>
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
              placeholder="Search Control Panel"
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: '12px', color: '#555', background: 'transparent', fontStyle: 'italic' }}
            />
            <span style={{ fontSize: '14px', color: '#103063' }}>⌕</span>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        
        {/* Left pane */}
        <div style={{
          width: '200px', background: 'linear-gradient(to right, #f0f4f8, #e8eef6)',
          borderRight: '1px solid #d9d9d9',
          padding: '20px 15px',
          display: 'flex', flexDirection: 'column', gap: '15px'
        }}>
          <div>
            <div style={{ fontWeight: 'bold', color: '#003399', marginBottom: '8px' }}>Control Panel Home</div>
          </div>
        </div>

        {/* Right content pane */}
        <div style={{ flex: 1, background: '#fff', overflowY: 'auto', padding: '20px 30px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h1 style={{ color: '#003399', fontSize: '16px', fontWeight: 'normal', margin: 0 }}>Adjust your computer&apos;s settings</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ color: '#666' }}>View by:</span>
              <span style={{ color: '#003399', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}>
                Category <span style={{ fontSize: '8px' }}>▼</span>
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', paddingRight: '20px' }}>
            {categories.map((category, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '10px' }}>
                <img src={category.icon} alt="" style={{ width: 32, height: 32, objectFit: 'contain' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div 
                    onClick={() => handleLinkClick(category.title)}
                    style={{ color: '#006600', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                    onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
                  >
                    {category.title}
                  </div>
                  {category.links.map((link, i) => (
                    <div 
                      key={i} 
                      onClick={() => handleLinkClick(link)}
                      style={{ color: '#003399', cursor: 'pointer', lineHeight: '1.4' }}
                      onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                      onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
                    >
                      {link}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
