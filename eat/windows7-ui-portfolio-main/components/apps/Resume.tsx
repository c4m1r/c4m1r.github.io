/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */
"use client";

import { Save, FileText, Undo, Redo, Type, AlignLeft, AlignCenter, AlignRight, AlignJustify, List, Image as ImageIcon, PaintBucket } from "lucide-react";

const RibbonBtn = ({ children, disabled = false, active = false }: { children: React.ReactNode, disabled?: boolean, active?: boolean }) => (
  <div 
    style={{
      display: 'inline-flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '4px', borderRadius: '3px', cursor: disabled ? 'default' : 'pointer',
      opacity: disabled ? 0.4 : 1, minWidth: '40px', gap: '2px', border: active ? '1px solid #ffb700' : '1px solid transparent',
      background: active ? 'linear-gradient(to bottom, #ffe8a1, #ffd05c)' : 'transparent',
    }}
    onMouseEnter={e => !disabled && !active && ((e.currentTarget as HTMLDivElement).style.background = 'linear-gradient(to bottom, #f2f8fc, #d5e5f5)', (e.currentTarget as HTMLDivElement).style.borderColor = '#b6cae0')}
    onMouseLeave={e => !disabled && !active && ((e.currentTarget as HTMLDivElement).style.background = 'transparent', (e.currentTarget as HTMLDivElement).style.borderColor = 'transparent')}
  >
    {children}
  </div>
);

const RibbonSmallBtn = ({ children, disabled = false, active = false }: { children: React.ReactNode, disabled?: boolean, active?: boolean }) => (
  <div 
    style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      padding: '2px 4px', borderRadius: '2px', cursor: disabled ? 'default' : 'pointer',
      opacity: disabled ? 0.4 : 1, border: active ? '1px solid #ffb700' : '1px solid transparent',
      background: active ? 'linear-gradient(to bottom, #ffe8a1, #ffd05c)' : 'transparent',
    }}
    onMouseEnter={e => !disabled && !active && ((e.currentTarget as HTMLDivElement).style.background = 'linear-gradient(to bottom, #f2f8fc, #d5e5f5)', (e.currentTarget as HTMLDivElement).style.borderColor = '#b6cae0')}
    onMouseLeave={e => !disabled && !active && ((e.currentTarget as HTMLDivElement).style.background = 'transparent', (e.currentTarget as HTMLDivElement).style.borderColor = 'transparent')}
  >
    {children}
  </div>
);

export default function Resume() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', fontFamily: '"Segoe UI", Tahoma, sans-serif', userSelect: 'none' }}>
      
      {/* ── RIBBON AREA ── */}
      <div style={{ background: '#f5f6f7', borderBottom: '1px solid #b6cae0', display: 'flex', flexDirection: 'column' }}>
        
        {/* Quick Access Toolbar & Tabs */}
        <div style={{ display: 'flex', alignItems: 'flex-end', padding: '0 4px', background: 'linear-gradient(to bottom, #e4eff8, #c9dff0)' }}>
          {/* Quick Access */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', padding: '2px 8px', marginBottom: '4px' }}>
            <img src="/win7/Wordpad/wordpad_128.ico" alt="Wordpad" style={{ width: 16, height: 16, marginRight: 8 }} />
            <Save size={14} color="#1a5fa8" style={{ cursor: 'pointer' }} />
            <Undo size={14} color="#1a5fa8" style={{ cursor: 'pointer', opacity: 0.5 }} />
            <Redo size={14} color="#1a5fa8" style={{ cursor: 'pointer', opacity: 0.5 }} />
          </div>
          
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '2px' }}>
            <div style={{ 
              padding: '4px 16px', background: '#f5f6f7', border: '1px solid #b6cae0', 
              borderBottom: 'none', borderRadius: '3px 3px 0 0', fontSize: '12px', 
              position: 'relative', top: '1px', zIndex: 10, color: '#1a5fa8' 
            }}>
              Home
            </div>
            <div style={{ 
              padding: '4px 16px', fontSize: '12px', color: '#1a5fa8', cursor: 'pointer' 
            }}>
              View
            </div>
          </div>
        </div>

        {/* Ribbon Content */}
        <div style={{ display: 'flex', padding: '4px 2px', gap: '2px', height: '90px' }}>
          
          {/* Clipboard Group */}
          <div style={{ display: 'flex', padding: '0 8px', borderRight: '1px solid #d9d9d9', gap: '4px' }}>
            <RibbonBtn>
              <FileText size={32} color="#cca300" strokeWidth={1} />
              <span style={{ fontSize: '11px', color: '#333' }}>Paste</span>
            </RibbonBtn>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', justifyContent: 'center' }}>
              <RibbonSmallBtn disabled><span style={{ fontSize: '11px', color: '#333' }}>✂ Cut</span></RibbonSmallBtn>
              <RibbonSmallBtn disabled><span style={{ fontSize: '11px', color: '#333' }}>📄 Copy</span></RibbonSmallBtn>
            </div>
          </div>

          {/* Font Group */}
          <div style={{ display: 'flex', flexDirection: 'column', padding: '0 8px', borderRight: '1px solid #d9d9d9', gap: '4px' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              <select style={{ border: '1px solid #b6cae0', padding: '2px', fontSize: '11px', width: '120px', outline: 'none' }} defaultValue="Calibri">
                <option>Calibri</option>
                <option>Arial</option>
                <option>Times New Roman</option>
              </select>
              <select style={{ border: '1px solid #b6cae0', padding: '2px', fontSize: '11px', width: '40px', outline: 'none' }} defaultValue="11">
                <option>10</option>
                <option>11</option>
                <option>12</option>
                <option>14</option>
                <option>16</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
              <RibbonSmallBtn><span style={{ fontWeight: 'bold', fontFamily: 'serif' }}>B</span></RibbonSmallBtn>
              <RibbonSmallBtn><span style={{ fontStyle: 'italic', fontFamily: 'serif' }}>I</span></RibbonSmallBtn>
              <RibbonSmallBtn><span style={{ textDecoration: 'underline', fontFamily: 'serif' }}>U</span></RibbonSmallBtn>
              <RibbonSmallBtn><span style={{ textDecoration: 'line-through', fontFamily: 'serif' }}>abc</span></RibbonSmallBtn>
              <div style={{ width: '1px', height: '16px', background: '#ccc', margin: '0 4px' }} />
              <RibbonSmallBtn><PaintBucket size={14} color="#333" /></RibbonSmallBtn>
              <RibbonSmallBtn><Type size={14} color="#cc0000" /></RibbonSmallBtn>
            </div>
            <div style={{ fontSize: '10px', color: '#999', textAlign: 'center', marginTop: 'auto' }}>Font</div>
          </div>

          {/* Paragraph Group */}
          <div style={{ display: 'flex', flexDirection: 'column', padding: '0 8px', borderRight: '1px solid #d9d9d9' }}>
            <div style={{ display: 'flex', gap: '2px' }}>
              <RibbonSmallBtn><List size={14} /></RibbonSmallBtn>
              <div style={{ width: '1px', height: '16px', background: '#ccc', margin: '0 4px' }} />
              <RibbonSmallBtn active><AlignLeft size={14} /></RibbonSmallBtn>
              <RibbonSmallBtn><AlignCenter size={14} /></RibbonSmallBtn>
              <RibbonSmallBtn><AlignRight size={14} /></RibbonSmallBtn>
              <RibbonSmallBtn><AlignJustify size={14} /></RibbonSmallBtn>
            </div>
            <div style={{ fontSize: '10px', color: '#999', textAlign: 'center', marginTop: 'auto' }}>Paragraph</div>
          </div>

          {/* Insert Group */}
          <div style={{ display: 'flex', padding: '0 8px', borderRight: '1px solid #d9d9d9', gap: '4px' }}>
            <RibbonBtn>
              <ImageIcon size={32} color="#1a5fa8" strokeWidth={1} />
              <span style={{ fontSize: '11px', color: '#333' }}>Picture</span>
            </RibbonBtn>
            <RibbonBtn>
              <div style={{ fontSize: '24px', lineHeight: '32px' }}>🎨</div>
              <span style={{ fontSize: '11px', color: '#333' }}>Paint drawing</span>
            </RibbonBtn>
          </div>
          
        </div>
      </div>

      {/* ── DOCUMENT AREA ── */}
      <div style={{ flex: 1, background: '#d4dceb', overflowY: 'auto', padding: '30px 0', boxShadow: 'inset 0 4px 6px rgba(0,0,0,0.05)' }}>
        
        {/* The "Paper" */}
        <div style={{ 
          width: '750px', minHeight: '1000px', margin: '0 auto', background: '#fff', 
          boxShadow: '0 0 10px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.1)', 
          padding: '80px', fontFamily: 'Calibri, sans-serif', color: '#000', cursor: 'text', userSelect: 'text'
        }}>
          
          <div style={{ borderBottom: '2px solid #1a5fa8', paddingBottom: '10px', marginBottom: '20px' }}>
            <h1 style={{ fontSize: '36px', fontWeight: 'normal', margin: 0, color: '#1a5fa8' }}>Gividu Elladeniya</h1>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#555', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <strong>Full-Stack Developer</strong> <span>|</span> Colombo, Sri Lanka <span>|</span> <a href="https://www.linkedin.com/in/gividuelladeniya" target="_blank" style={{ color: '#1a5fa8', textDecoration: 'none' }}>LinkedIn</a>
            </p>
          </div>

          <h2 style={{ fontSize: '18px', color: '#1a5fa8', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '10px', textTransform: 'uppercase' }}>Professional Summary</h2>
          <p style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '25px', marginTop: 0 }}>
            Dedicated and detail-oriented Full-Stack Developer and Information Technology undergraduate with hands-on experience building scalable, secure, and user-focused web applications. Proficient in modern frameworks across the MERN stack, Java Spring Boot, and Next.js. Demonstrated ability to deliver impactful solutions, from modernizing government web portals to architecting specialized collaboration platforms, with a strong focus on clean code, database optimization, and intuitive UI/UX design.
          </p>

          <h2 style={{ fontSize: '18px', color: '#1a5fa8', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '10px', textTransform: 'uppercase' }}>Technical Skills</h2>
          <table style={{ width: '100%', fontSize: '14px', lineHeight: '1.8', marginBottom: '25px' }}>
            <tbody>
              <tr>
                <td style={{ width: '25%', fontWeight: 'bold', verticalAlign: 'top' }}>Languages:</td>
                <td>JavaScript, Java, Python, Kotlin, PHP, HTML5, CSS3</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold', verticalAlign: 'top' }}>Frontend:</td>
                <td>React.js, Next.js, Vue.js, Vite, Astro, Tailwind CSS, Material UI (MUI)</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold', verticalAlign: 'top' }}>Backend:</td>
                <td>Node.js, Express.js, Spring Boot</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold', verticalAlign: 'top' }}>Databases:</td>
                <td>MongoDB, PostgreSQL, Microsoft SQL Server, MySQL</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold', verticalAlign: 'top' }}>Tools & Operations:</td>
                <td>Docker, Postman, Git/GitHub, Vercel, REST APIs, Visual Studio, Android Studio</td>
              </tr>
            </tbody>
          </table>

          <h2 style={{ fontSize: '18px', color: '#1a5fa8', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '15px', textTransform: 'uppercase' }}>Experience</h2>
          
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <h3 style={{ fontSize: '16px', margin: '0 0 5px 0' }}>Full Stack Developer Intern <span style={{ fontWeight: 'normal', color: '#666' }}>— Ministry of Finance, Sri Lanka</span></h3>
              <span style={{ fontSize: '14px', color: '#666' }}>Oct 2025 – Apr 2026</span>
            </div>
            <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px', lineHeight: '1.6' }}>
              <li>Engineered and maintained the web portal for the Department of State Accounts, utilizing Java, Spring Boot, React, and Next.js to deliver a highly responsive and secure user experience.</li>
              <li>Refactored database entity structures within the internal project codebase to optimize data management and improve system performance.</li>
              <li>Designed complex, modern widescreen hero banner layouts and transparent vector overlays to elevate the visual identity of the department's public-facing portal.</li>
              <li>Collaborated in an on-site environment to troubleshoot deployment issues and ensure seamless integration of backend APIs with frontend interfaces.</li>
            </ul>
          </div>

          <div style={{ marginBottom: '25px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <h3 style={{ fontSize: '16px', margin: '0 0 5px 0' }}>Undergraduate <span style={{ fontWeight: 'normal', color: '#666' }}>— SLIIT</span></h3>
              <span style={{ fontSize: '14px', color: '#666' }}>Aug 2022 – Present</span>
            </div>
            <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px', lineHeight: '1.6' }}>
              <li>Engaged in full-time, rigorous coursework focusing on software engineering, database management, and full-stack development methodologies.</li>
            </ul>
          </div>

          <h2 style={{ fontSize: '18px', color: '#1a5fa8', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '15px', textTransform: 'uppercase' }}>Projects</h2>
          
          <div style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <h3 style={{ fontSize: '16px', margin: '0 0 2px 0' }}>Academic Scheduler – TeamSync Module</h3>
              <span style={{ fontSize: '14px', color: '#666' }}>Apr 2025 – Present</span>
            </div>
            <p style={{ margin: '0 0 5px 0', fontSize: '13px', fontStyle: 'italic', color: '#555' }}>React (Vite), Node.js, Express, MongoDB, MUI, Tailwind CSS</p>
            <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px', lineHeight: '1.6' }}>
              <li>Developed a full MERN stack team collaboration feature designed to optimize academic productivity for student groups.</li>
              <li>Built a comprehensive Team Dashboard featuring smart deadline visualization, task management, and a notification center that auto-clears upon completion.</li>
            </ul>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <h3 style={{ fontSize: '16px', margin: '0 0 2px 0' }}>Facebook Activity Cleaner – Chrome Extension</h3>
              <span style={{ fontSize: '14px', color: '#666' }}>Apr 2026</span>
            </div>
            <p style={{ margin: '0 0 5px 0', fontSize: '13px', fontStyle: 'italic', color: '#555' }}>JavaScript, HTML5, DOM API</p>
            <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px', lineHeight: '1.6' }}>
              <li>Engineered a privacy-focused Chrome Extension to automate the bulk deletion of Facebook Activity Log entries (posts, likes, comments).</li>
              <li>Designed intelligent DOM analysis and human-like interaction scripts to safely bypass rate limits and navigate dynamic UIs without utilizing external APIs.</li>
            </ul>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <h3 style={{ fontSize: '16px', margin: '0 0 2px 0' }}>HarmoniX: Specialized Music Marketplace</h3>
              <span style={{ fontSize: '14px', color: '#666' }}>Apr 2025 – Aug 2025</span>
            </div>
            <p style={{ margin: '0 0 5px 0', fontSize: '13px', fontStyle: 'italic', color: '#555' }}>React, Vite, Tailwind CSS, Spring Boot, Docker</p>
            <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px', lineHeight: '1.6' }}>
              <li>Architected a centralized digital marketplace for the music industry, enabling producers and vocalists to connect, hire talent, and manage end-to-end production workflows.</li>
              <li>Engineered a targeted job marketplace for specialized audio requirements and a real-time collaboration workspace with live messaging.</li>
            </ul>
          </div>

          <div style={{ marginBottom: '25px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <h3 style={{ fontSize: '16px', margin: '0 0 2px 0' }}>Inventory Management System for Distribution</h3>
              <span style={{ fontSize: '14px', color: '#666' }}>Aug 2024 – Oct 2024</span>
            </div>
            <p style={{ margin: '0 0 5px 0', fontSize: '13px', fontStyle: 'italic', color: '#555' }}>MongoDB, Express.js, React, Node.js, Tailwind CSS, Chart.js</p>
            <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px', lineHeight: '1.6' }}>
              <li>Built a comprehensive web-based inventory solution to streamline manual stock adjustments and tracking for distribution managers.</li>
              <li>Implemented automated low-stock visual alerts and dynamic bar charts using Chart.js to provide intuitive insights into inventory status.</li>
            </ul>
          </div>

          <h2 style={{ fontSize: '18px', color: '#1a5fa8', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '15px', textTransform: 'uppercase' }}>Education</h2>
          
          <div style={{ marginBottom: '15px' }}>
            <h3 style={{ fontSize: '16px', margin: '0 0 2px 0' }}>BSc (Hons) in Information Technology</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: '14px', color: '#333' }}>Sri Lanka Institute of Information Technology (SLIIT)</span>
              <span style={{ fontSize: '14px', color: '#666' }}>Feb 2022 – Feb 2027</span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', lineHeight: '1.6', color: '#444' }}>Activities: SLIIT Leo Club, SLIIT Gaming Community</p>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <h3 style={{ fontSize: '16px', margin: '0 0 2px 0' }}>Diploma in IT & Diploma in English</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: '14px', color: '#333' }}>ESOFT Metro Campus</span>
              <span style={{ fontSize: '14px', color: '#666' }}>Jan 2019 – Jul 2019</span>
            </div>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <h3 style={{ fontSize: '16px', margin: '0 0 2px 0' }}>G.C.E. Advanced Level (A/L) & Ordinary Level (O/L)</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: '14px', color: '#333' }}>Central College Piliyandala</span>
              <span style={{ fontSize: '14px', color: '#666' }}>Jul 2012 – Feb 2022</span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', lineHeight: '1.6', color: '#444' }}>Activities: Swimming Team Member, Member of Buddhist Club, Media Unit Member</p>
          </div>

        </div>
      </div>
      
      {/* Status Bar */}
      <div style={{ height: '22px', background: '#f0f0f0', borderTop: '1px solid #d9d9d9', display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '11px', color: '#555', justifyContent: 'space-between' }}>
        <span>For Help, press F1</span>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span>100%</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: 12, height: 12, background: 'linear-gradient(to bottom, #fff, #e0e0e0)', border: '1px solid #ccc' }} /> 
            <div style={{ width: 12, height: 12, background: 'linear-gradient(to bottom, #fff, #e0e0e0)', border: '1px solid #ccc' }} />
          </span>
        </div>
      </div>
    </div>
  );
}
