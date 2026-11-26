import { useEffect, useMemo, useState } from 'react';
import './vista-sidebar.css';
import { vistaText } from '../../../i18n/vistaStrings';

interface VistaSidebarProps {
  time: Date;
  language: string;
  onOpenGallery: () => void;
  onOpenNews: () => void;
  onOpenCalendar: () => void;
}

const ROMAN_FREE_NUMBERS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

function polar(angleDeg: number, radius: number): [number, number] {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return [64 + radius * Math.cos(rad), 64 + radius * Math.sin(rad)];
}

function AnalogClock({ time }: { time: Date }) {
  const seconds = time.getSeconds();
  const minutes = time.getMinutes() + seconds / 60;
  const hours = (time.getHours() % 12) + minutes / 60;
  const hand = (angle: number, length: number, width: number, color: string) => {
    const [x, y] = polar(angle, length);
    const [tx, ty] = polar(angle + 180, 9);
    return <line x1={tx} y1={ty} x2={x} y2={y} stroke={color} strokeWidth={width} strokeLinecap="round" />;
  };
  return (
    <svg className="vista-gadget__clock" viewBox="0 0 128 128" role="img" aria-label={time.toLocaleTimeString()}>
      <defs>
        <radialGradient id="vs-face" cx="50%" cy="38%" r="70%">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.75" stopColor="#ece8dc" />
          <stop offset="1" stopColor="#c9c3b2" />
        </radialGradient>
        <linearGradient id="vs-rim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f2f2f2" />
          <stop offset="0.5" stopColor="#8d8d8d" />
          <stop offset="1" stopColor="#3b3b3b" />
        </linearGradient>
      </defs>
      <circle cx="64" cy="66" r="60" fill="rgba(0,0,0,0.35)" />
      <circle cx="64" cy="64" r="60" fill="url(#vs-rim)" />
      <circle cx="64" cy="64" r="54" fill="url(#vs-face)" />
      {ROMAN_FREE_NUMBERS.map((n, i) => {
        const [x, y] = polar(i * 30, 41);
        return (
          <text key={n} x={x} y={y + 4} textAnchor="middle" fontSize="12" fontFamily="Georgia, serif" fill="#2a2a2a">{n}</text>
        );
      })}
      {hand(hours * 30, 28, 4.5, '#1c1c1c')}
      {hand(minutes * 6, 40, 3.2, '#1c1c1c')}
      {hand(seconds * 6, 44, 1.2, '#b3261e')}
      <circle cx="64" cy="64" r="3.2" fill="#b3261e" />
      <ellipse cx="64" cy="30" rx="40" ry="22" fill="rgba(255,255,255,0.22)" />
    </svg>
  );
}

function CalendarGadget({ time, language, onOpen }: { time: Date; language: string; onOpen: () => void }) {
  const weekStart = ['ru', 'fr', 'es'].includes(language.split('-')[0].toLowerCase()) ? 1 : 0;
  const cells = useMemo(() => {
    const first = new Date(time.getFullYear(), time.getMonth(), 1);
    const offset = (first.getDay() - weekStart + 7) % 7;
    const days = new Date(time.getFullYear(), time.getMonth() + 1, 0).getDate();
    return [...Array.from({ length: offset }, () => 0), ...Array.from({ length: days }, (_, i) => i + 1)];
  }, [time, weekStart]);
  const labels = useMemo(
    () => Array.from({ length: 7 }, (_, i) => new Intl.DateTimeFormat(language, { weekday: 'narrow' }).format(new Date(2024, 0, 7 + ((weekStart + i) % 7)))),
    [language, weekStart],
  );
  const month = new Intl.DateTimeFormat(language, { month: 'long', year: 'numeric' }).format(time);
  return (
    <button type="button" className="vista-gadget vista-gadget--calendar" onClick={onOpen} aria-label={month}>
      <span className="vista-gadget__rings" aria-hidden="true" />
      <span className="vista-gadget__month">{month}</span>
      <span className="vista-gadget__grid">
        {labels.map((label, i) => <b key={`l${i}`}>{label}</b>)}
        {cells.map((day, i) => (
          <i key={i} className={day === time.getDate() ? 'is-today' : ''}>{day || ''}</i>
        ))}
      </span>
    </button>
  );
}

function Gauge({ value, label }: { value: number; label: string }) {
  const angle = -120 + Math.max(0, Math.min(100, value)) * 2.4;
  const [x, y] = polar(angle, 30);
  return (
    <svg viewBox="0 0 128 128" className="vista-gadget__gauge" role="img" aria-label={`${label} ${Math.round(value)}%`}>
      <circle cx="64" cy="64" r="58" fill="#1e2226" stroke="#7d8790" strokeWidth="3" />
      <path d={`M ${polar(-120, 48)[0]} ${polar(-120, 48)[1]} A 48 48 0 1 1 ${polar(120, 48)[0]} ${polar(120, 48)[1]}`} fill="none" stroke="#3a444c" strokeWidth="9" />
      <path d={`M ${polar(-120, 48)[0]} ${polar(-120, 48)[1]} A 48 48 0 ${value > 50 ? 1 : 0} 1 ${polar(angle, 48)[0]} ${polar(angle, 48)[1]}`} fill="none" stroke={value > 80 ? '#e0502d' : '#3db36a'} strokeWidth="9" strokeLinecap="round" />
      <line x1="64" y1="64" x2={x} y2={y} stroke="#f2f2f2" strokeWidth="3" strokeLinecap="round" />
      <circle cx="64" cy="64" r="5" fill="#f2f2f2" />
      <text x="64" y="104" textAnchor="middle" fontSize="15" fill="#dfe6ea" fontFamily="Segoe UI, sans-serif">{label} {Math.round(value)}%</text>
    </svg>
  );
}

function CpuGadget() {
  const [cpu, setCpu] = useState(12);
  const [mem, setMem] = useState(38);
  useEffect(() => {
    const id = window.setInterval(() => {
      setCpu((value) => Math.max(2, Math.min(96, value + (Math.random() - 0.5) * 22)));
      const heap = (performance as Performance & { memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
      setMem(heap ? (heap.usedJSHeapSize / heap.jsHeapSizeLimit) * 100 + 30 : 38 + Math.random() * 4);
    }, 1500);
    return () => window.clearInterval(id);
  }, []);
  return (
    <div className="vista-gadget vista-gadget--cpu">
      <Gauge value={cpu} label="CPU" />
      <Gauge value={mem} label="RAM" />
    </div>
  );
}

/**
 * Windows Vista Sidebar: the default gadget surface on the Vista skin (clock, calendar, CPU meter, headlines).
 * The older widget set stays available as the alternative skin from the gadget gallery.
 */
export function VistaSidebar({ time, language, onOpenGallery, onOpenNews, onOpenCalendar }: VistaSidebarProps) {
  return (
    <aside className="vista-sidebar" aria-label={vistaText(language, 'sidebar')} onContextMenu={(event) => event.stopPropagation()}>
      <div className="vista-sidebar__bar">
        <button type="button" className="vista-sidebar__plus" onClick={onOpenGallery} aria-label={vistaText(language, 'addGadgets')}>+</button>
      </div>
      <div className="vista-sidebar__gadgets">
        <AnalogClock time={time} />
        <CalendarGadget time={time} language={language} onOpen={onOpenCalendar} />
        <CpuGadget />
        <button type="button" className="vista-gadget vista-gadget--feed" onClick={onOpenNews}>
          <span className="vista-gadget__rss" aria-hidden="true">RSS</span>
          <span>{vistaText(language, 'headlines')}</span>
        </button>
      </div>
    </aside>
  );
}
