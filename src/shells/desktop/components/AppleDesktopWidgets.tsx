import { useMemo } from 'react';
import { useDeviceBattery } from '../hooks/useDeviceBattery';
import { type Language } from '../../../i18n/translations';
import { WeatherWidget } from '../../../system/widgets/components/WeatherWidget';
import { WinampWidget } from '../../../system/widgets/components/WinampWidget';
import { QuotesWidget } from '../../../system/widgets/components/QuotesWidget';
import { CurrencyWidget } from '../../../system/widgets/components/CurrencyWidget';
import { SystemMonitorWidget } from '../../../system/widgets/components/SystemMonitorWidget';
import { NewsWidget } from '../../../system/widgets/components/NewsWidget';
import { GalleryWidget } from '../../../system/widgets/components/GalleryWidget';
import { DesktopWidgetCanvas, type DesktopWidgetItem } from '../../../system/widgets/components/DesktopWidgetCanvas';
import '../../../system/widgets/widgets.css';

export interface AppleWidgetVisibility {
  clock: boolean;
  battery: boolean;
  calendar: boolean;
  weather?: boolean;
  winamp?: boolean;
  quotes?: boolean;
  currency?: boolean;
  monitor?: boolean;
  news?: boolean;
  gallery?: boolean;
}

interface AppleDesktopWidgetsProps {
  time: Date;
  language: Language;
  visibility: AppleWidgetVisibility;
  onOpenNews?: () => void;
  onOpenGalleryImage?: () => void;
  themeKey?: string;
}

const presets = (compact: [number, number], standard: [number, number], wide: [number, number]) => [
  { id: 'compact', label: 'Компактный', width: compact[0], height: compact[1] },
  { id: 'standard', label: 'Стандартный', width: standard[0], height: standard[1] },
  { id: 'wide', label: 'Широкий', width: wide[0], height: wide[1] },
];

export function AppleDesktopWidgets({
  time, language, visibility, onOpenNews, onOpenGalleryImage, themeKey = 'desktop',
}: AppleDesktopWidgetsProps) {
  const { level, charging } = useDeviceBattery(true);
  const calendarDays = useMemo(() => {
    const year = time.getFullYear();
    const month = time.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const start = new Date(first);
    start.setDate(first.getDate() - first.getDay());
    const end = new Date(last);
    end.setDate(last.getDate() + (6 - last.getDay()));
    const days: Date[] = [];
    const cursor = new Date(start);
    while (cursor <= end) { days.push(new Date(cursor)); cursor.setDate(cursor.getDate() + 1); }
    return days;
  }, [time]);
  const weekdayLabels = useMemo(
    () => Array.from({ length: 7 }, (_, index) => new Intl.DateTimeFormat(language, { weekday: 'narrow' }).format(new Date(2026, 7, 2 + index))),
    [language]
  );
  const pct = level ?? 85;
  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours() % 12;
  const secDeg = seconds * 6;
  const minDeg = minutes * 6 + seconds * 0.1;
  const hrDeg = hours * 30 + minutes * 0.5;

  const clock = (
    <section className="apple-widget apple-widget--clock">
      <svg viewBox="0 0 54 54" width="54" height="54" fill="none" aria-hidden="true">
        <circle cx="27" cy="27" r="26" className="apple-widget-clock__face" />
        {Array.from({ length: 12 }, (_, index) => {
          const angle = (index * 30 * Math.PI) / 180;
          return <line key={index} x1={27 + 22 * Math.sin(angle)} y1={27 - 22 * Math.cos(angle)} x2={27 + 24 * Math.sin(angle)} y2={27 - 24 * Math.cos(angle)} className="apple-widget-clock__tick" />;
        })}
        <line x1="27" y1="27" x2={27 + 13 * Math.sin((hrDeg * Math.PI) / 180)} y2={27 - 13 * Math.cos((hrDeg * Math.PI) / 180)} className="apple-widget-clock__hour" />
        <line x1="27" y1="27" x2={27 + 18 * Math.sin((minDeg * Math.PI) / 180)} y2={27 - 18 * Math.cos((minDeg * Math.PI) / 180)} className="apple-widget-clock__minute" />
        <line x1="27" y1="27" x2={27 + 20 * Math.sin((secDeg * Math.PI) / 180)} y2={27 - 20 * Math.cos((secDeg * Math.PI) / 180)} className="apple-widget-clock__second" />
        <circle cx="27" cy="27" r="2" className="apple-widget-clock__pin" />
      </svg>
      <div><strong>{time.toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' })}<small>{time.toLocaleTimeString(language, { second: '2-digit' })}</small></strong><span>{time.toLocaleDateString(language, { weekday: 'long', month: 'long', day: 'numeric' })}</span></div>
    </section>
  );
  const calendar = (
    <section className="apple-widget apple-widget--calendar">
      <header>{time.toLocaleDateString(language, { month: 'long', year: 'numeric' })}</header>
      <div className="apple-widget-calendar__weekdays">{weekdayLabels.map((label, index) => <span key={`${label}-${index}`}>{label}</span>)}</div>
      <div className="apple-widget-calendar__days">{calendarDays.map((day) => {
        const isToday = day.getFullYear() === time.getFullYear() && day.getMonth() === time.getMonth() && day.getDate() === time.getDate();
        const inMonth = day.getMonth() === time.getMonth();
        return <span key={day.toISOString()} className={`${isToday ? 'is-today' : ''} ${!inMonth ? 'is-outside' : ''}`}>{day.getDate()}</span>;
      })}</div>
    </section>
  );
  const battery = (
    <section className="apple-widget apple-widget--battery">
      <div className="apple-widget-battery__icon" aria-hidden="true"><div className="apple-widget-battery__body"><span style={{ width: `${pct}%` }} className={pct <= 20 ? 'is-low' : charging ? 'is-charging' : ''} /></div><i /></div>
      <div><strong>{pct}%{charging ? ' ⚡' : ''}</strong><span>{charging ? 'Charging' : level === null ? 'Estimated' : pct <= 20 ? 'Low Battery' : 'Normal'}</span></div>
    </section>
  );

  const items: DesktopWidgetItem[] = [
    ...(visibility.clock && visibility.calendar
      ? [{ id: 'clockCalendar', title: 'Часы и календарь', content: <div className="apple-clock-calendar-combo">{clock}{calendar}</div>, presets: presets([270, 160], [320, 205], [420, 230]), defaultPreset: 'standard' }]
      : [
          ...(visibility.clock ? [{ id: 'clock', title: 'Часы', content: clock, presets: presets([220, 88], [250, 100], [320, 110]), defaultPreset: 'standard' }] : []),
          ...(visibility.calendar ? [{ id: 'calendar', title: 'Календарь', content: calendar, presets: presets([220, 180], [250, 210], [320, 230]), defaultPreset: 'standard' }] : []),
        ]),
    ...(visibility.battery ? [{ id: 'battery', title: 'Батарея', content: battery, presets: presets([180, 70], [210, 82], [280, 90]), defaultPreset: 'standard' }] : []),
    ...(visibility.weather ? [{ id: 'weather', title: 'Погода', content: <WeatherWidget />, presets: presets([250, 150], [280, 190], [360, 210]), defaultPreset: 'standard' }] : []),
    ...(visibility.winamp ? [{ id: 'winamp', title: 'Winamp', content: <WinampWidget />, presets: presets([230, 105], [280, 130], [360, 145]), defaultPreset: 'standard' }] : []),
    ...(visibility.quotes ? [{ id: 'quotes', title: 'Цитаты', content: <QuotesWidget />, presets: presets([230, 110], [280, 145], [360, 160]), defaultPreset: 'standard' }] : []),
    ...(visibility.currency ? [{ id: 'currency', title: 'Курсы валют', content: <CurrencyWidget />, presets: presets([250, 150], [280, 190], [360, 220]), defaultPreset: 'standard' }] : []),
    ...(visibility.monitor ? [{ id: 'monitor', title: 'Монитор системы', content: <SystemMonitorWidget />, presets: presets([250, 130], [280, 170], [360, 190]), defaultPreset: 'standard' }] : []),
    ...(visibility.news ? [{ id: 'news', title: 'Новости RSS', content: <NewsWidget onOpenFeed={onOpenNews} />, presets: presets([250, 150], [280, 190], [360, 230]), defaultPreset: 'standard' }] : []),
    ...(visibility.gallery ? [{ id: 'gallery', title: 'Галерея', content: <GalleryWidget onOpenOriginal={onOpenGalleryImage} />, presets: presets([250, 180], [280, 230], [360, 260]), defaultPreset: 'standard' }] : []),
  ];

  return <DesktopWidgetCanvas themeKey={themeKey} items={items} />;
}
