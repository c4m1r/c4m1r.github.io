import { useState, useEffect } from 'react';
import { WeatherWidget } from './WeatherWidget';
import { ClockCalendarWidget } from './ClockCalendarWidget';
import { WinampWidget } from './WinampWidget';
import { QuotesWidget } from './QuotesWidget';
import { CurrencyWidget } from './CurrencyWidget';
import { SystemMonitorWidget } from './SystemMonitorWidget';
import { NewsWidget } from './NewsWidget';
import { GalleryWidget } from './GalleryWidget';
import { DesktopWidgetCanvas, type DesktopWidgetItem } from './DesktopWidgetCanvas';
import { type DesktopWidgetsVisibility, getStoredWidgetsVisibility } from '../types';
import '../widgets.css';

interface WebosDesktopWidgetsProps {
  onOpenFeed?: () => void;
  onOpenGalleryImage?: (path: string) => void;
}

const presets = (compact: [number, number], standard: [number, number], wide: [number, number]) => [
  { id: 'compact', label: 'Компактный', width: compact[0], height: compact[1] },
  { id: 'standard', label: 'Стандартный', width: standard[0], height: standard[1] },
  { id: 'wide', label: 'Широкий', width: wide[0], height: wide[1] },
];

export function WebosDesktopWidgets({ onOpenFeed, onOpenGalleryImage }: WebosDesktopWidgetsProps) {
  const [visibility, setVisibility] = useState<DesktopWidgetsVisibility>(getStoredWidgetsVisibility);

  useEffect(() => {
    const handleVisChange = (event: Event) => {
      const custom = event as CustomEvent<DesktopWidgetsVisibility>;
      if (custom.detail) setVisibility(custom.detail);
    };
    window.addEventListener('desktop-widgets-visibility-changed', handleVisChange);
    return () => window.removeEventListener('desktop-widgets-visibility-changed', handleVisChange);
  }, []);

  const items: DesktopWidgetItem[] = [
    ...(visibility.weather ? [{ id: 'weather', title: 'Погода', content: <WeatherWidget />, presets: presets([250, 150], [280, 190], [360, 210]), defaultPreset: 'standard' }] : []),
    ...(visibility.clock ? [{ id: 'clockCalendar', title: 'Часы и календарь', content: <ClockCalendarWidget />, presets: presets([260, 190], [290, 230], [370, 240]), defaultPreset: 'standard' }] : []),
    ...(visibility.winamp ? [{ id: 'winamp', title: 'Winamp', content: <WinampWidget />, presets: presets([230, 105], [280, 130], [360, 145]), defaultPreset: 'standard' }] : []),
    ...(visibility.quotes ? [{ id: 'quotes', title: 'Цитаты', content: <QuotesWidget />, presets: presets([230, 110], [280, 145], [360, 160]), defaultPreset: 'standard' }] : []),
    ...(visibility.currency ? [{ id: 'currency', title: 'Курсы валют', content: <CurrencyWidget />, presets: presets([250, 150], [280, 190], [360, 220]), defaultPreset: 'standard' }] : []),
    ...(visibility.monitor ? [{ id: 'monitor', title: 'Монитор системы', content: <SystemMonitorWidget />, presets: presets([250, 130], [280, 170], [360, 190]), defaultPreset: 'standard' }] : []),
    ...(visibility.news ? [{ id: 'news', title: 'Новости RSS', content: <NewsWidget onOpenFeed={onOpenFeed} />, presets: presets([250, 150], [280, 190], [360, 230]), defaultPreset: 'standard' }] : []),
    ...(visibility.gallery ? [{ id: 'gallery', title: 'Галерея', content: <GalleryWidget onOpenOriginal={onOpenGalleryImage} />, presets: presets([250, 180], [280, 230], [360, 260]), defaultPreset: 'standard' }] : []),
  ];

  return <DesktopWidgetCanvas themeKey="webos" items={items} />;
}
