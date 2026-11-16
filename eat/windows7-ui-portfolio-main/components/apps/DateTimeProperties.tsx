"use client";

import { useState, useEffect } from "react";
import { useDesktopStore } from "@/store/useDesktopStore";
import { Globe, Clock } from "lucide-react";

export default function DateTimeProperties({ windowId }: { windowId: string }) {
  const [activeTab, setActiveTab] = useState(0);
  const [time, setTime] = useState(new Date());
  
  // For calendar navigation
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  
  const { closeWindow } = useDesktopStore();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const tabs = ["Date and Time", "Additional Clocks", "Internet Time"];

  // Calendar logic
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  // Get timezone string
  const timeZoneString = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <div className="flex flex-col h-full bg-[#f0f0f0] p-2 text-[12px]" style={{ fontFamily: "'Segoe UI', Tahoma, sans-serif", userSelect: 'none' }}>
      
      {/* 7.css Tabs */}
      <section className="tabs" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <menu role="tablist">
          {tabs.map((tab, index) => (
            <button 
              key={tab} 
              role="tab" 
              aria-selected={activeTab === index}
              onClick={() => setActiveTab(index)}
              style={{ fontSize: '12px' }}
            >
              {tab}
            </button>
          ))}
        </menu>

        {/* Tab Content Area */}
        <article role="tabpanel" style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', border: '1px solid #8e8f8f', padding: '16px' }}>
          {activeTab === 0 && (
            <div className="flex flex-col h-full gap-4">
              
              <div className="flex gap-4 flex-1 items-stretch">
                {/* Date Group */}
                <fieldset className="flex-1 flex flex-col" style={{ padding: '8px', border: '1px solid #d9d9d9', borderRadius: '2px' }}>
                  <legend style={{ color: '#003399' }}>Date</legend>
                  
                  {/* Calendar Navigation */}
                  <div className="flex justify-between items-center mb-2 px-2">
                    <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>{monthNames[viewMonth]} {viewYear}</span>
                    <div className="flex gap-1">
                      <button onClick={handlePrevMonth} style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ccc', background: 'linear-gradient(to bottom, #fcfcfc, #e6e6e6)' }}>◀</button>
                      <button onClick={handleNextMonth} style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ccc', background: 'linear-gradient(to bottom, #fcfcfc, #e6e6e6)' }}>▶</button>
                    </div>
                  </div>
                  
                  {/* Calendar Grid */}
                  <div className="w-full flex flex-col mb-1 flex-1 justify-end">
                    <div className="grid grid-cols-7 text-center font-bold border-b border-[#ccc] pb-1 mb-1 text-[#333]">
                      <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
                    </div>
                    <div className="grid grid-cols-7 text-center gap-y-1">
                      {/* Empty slots for days before 1st of month */}
                      {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                        <div key={`empty-${i}`} />
                      ))}
                      {/* Actual days */}
                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const isToday = day === time.getDate() && viewMonth === time.getMonth() && viewYear === time.getFullYear();
                        return (
                          <div key={day} className="flex justify-center items-center">
                            <div className={`w-[22px] h-[22px] flex items-center justify-center cursor-default
                              ${isToday ? "bg-gradient-to-b from-[#e3effd] to-[#a2c5ed] border border-[#6b9dce] rounded-[3px] text-[#000]" : "text-[#000] hover:bg-[#e5f3fb] hover:border hover:border-[#d9ebf9]"}
                            `}>
                              {day}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </fieldset>

                {/* Time Group */}
                <fieldset className="w-[160px] flex flex-col items-center justify-between" style={{ padding: '8px', border: '1px solid #d9d9d9', borderRadius: '2px' }}>
                  <legend style={{ color: '#003399' }}>Time</legend>
                  
                  {/* Analog Clock (Windows 7 Style) */}
                  <div className="w-[110px] h-[110px] rounded-full mb-4 relative shadow-[0_2px_10px_rgba(0,0,0,0.3)] mt-2" 
                       style={{ background: 'radial-gradient(circle at 30% 30%, #e6f3ff 0%, #a2cdec 50%, #5b9bd5 100%)', border: '3px solid #fcfcfc' }}>
                    
                    {/* Clock marks */}
                    {[...Array(12)].map((_, i) => (
                      <div key={i} className="absolute w-[2px] h-[6px] bg-[#1a4a75]" 
                           style={{ 
                             top: '2px', left: 'calc(50% - 1px)', 
                             transformOrigin: '50% 50px', transform: `rotate(${i * 30}deg)` 
                           }} 
                      />
                    ))}

                    {/* Center Dot */}
                    <div className="w-3 h-3 rounded-full bg-gradient-to-b from-[#f0f0f0] to-[#a0a0a0] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 border border-[#666]"></div>
                    
                    {/* Hour Hand */}
                    <div className="w-[4px] h-[30px] absolute bottom-1/2 left-1/2 origin-bottom -translate-x-1/2 z-10" 
                         style={{ transform: `rotate(${((time.getHours() % 12) + time.getMinutes() / 60) * 30}deg)`, background: 'linear-gradient(to right, #2a2a2a, #4a4a4a)' }}>
                      <div className="w-0 h-0 border-l-[2px] border-r-[2px] border-b-[6px] border-l-transparent border-r-transparent border-b-[#2a2a2a] absolute -top-[6px]" />
                    </div>
                    
                    {/* Minute Hand */}
                    <div className="w-[3px] h-[42px] absolute bottom-1/2 left-1/2 origin-bottom -translate-x-1/2 z-10" 
                         style={{ transform: `rotate(${time.getMinutes() * 6}deg)`, background: 'linear-gradient(to right, #2a2a2a, #4a4a4a)' }}>
                      <div className="w-0 h-0 border-l-[1.5px] border-r-[1.5px] border-b-[6px] border-l-transparent border-r-transparent border-b-[#2a2a2a] absolute -top-[6px]" />
                    </div>
                    
                    {/* Second Hand */}
                    <div className="w-[1.5px] h-[48px] bg-[#d93b3b] absolute bottom-1/2 left-1/2 origin-bottom -translate-x-1/2 z-15" 
                         style={{ transform: `rotate(${time.getSeconds() * 6}deg)` }}>
                      <div className="w-0 h-0 border-l-[1px] border-r-[1px] border-b-[4px] border-l-transparent border-r-transparent border-b-[#d93b3b] absolute -top-[4px]" />
                      <div className="w-[1.5px] h-[10px] bg-[#d93b3b] absolute top-[48px]" /> {/* Tail */}
                    </div>
                  </div>

                  {/* Digital Time Input */}
                  <div className="flex items-center gap-1 w-full justify-center">
                    <input type="text" readOnly value={time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} 
                           className="w-[100px] text-center border-none bg-transparent p-[2px] font-mono text-[11px] outline-none" />
                  </div>
                </fieldset>
              </div>

              {/* Timezone Info */}
              <div className="border-t border-[#d9d9d9] pt-3 flex gap-2 items-start mt-2">
                <Globe size={16} color="#003399" className="mt-[2px]" />
                <div className="flex flex-col">
                  <span style={{ fontWeight: 'bold', color: '#003399' }}>Time zone</span>
                  <span>{timeZoneString}</span>
                </div>
              </div>
            </div>
          )}
          
          {activeTab !== 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-2">
              <Clock size={32} color="#999" />
              Content not available in replica.
            </div>
          )}
        </article>
      </section>

      {/* Footer Buttons */}
      <div className="flex justify-end gap-2 mt-3 pt-2">
        <button onClick={() => closeWindow(windowId)} style={{ minWidth: '75px', padding: '3px 10px' }}>OK</button>
        <button onClick={() => closeWindow(windowId)} style={{ minWidth: '75px', padding: '3px 10px' }}>Cancel</button>
        <button disabled style={{ minWidth: '75px', padding: '3px 10px' }}>Apply</button>
      </div>

    </div>
  );
}
