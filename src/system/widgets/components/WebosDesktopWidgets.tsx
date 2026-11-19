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
import { createDesktopWidgetPresets } from '../types';
import { type DesktopWidgetsVisibility, getStoredWidgetsVisibility, WEBOS_DEFAULT_WIDGETS_VISIBILITY, WIDGETS_STORAGE_KEY } from '../types';
import '../widgets.css';

interface WebosDesktopWidgetsProps {
  onOpenFeed?: () => void;
  onOpenGalleryImage?: (path: string) => void;
  onOpenCalendar?: () => void;
}

const presets = createDesktopWidgetPresets;

export function WebosDesktopWidgets({ onOpenFeed, onOpenGalleryImage, onOpenCalendar }: WebosDesktopWidgetsProps) {
  const [visibility, setVisibility] = useState<DesktopWidgetsVisibility>(() => getStoredWidgetsVisibility(WIDGETS_STORAGE_KEY, WEBOS_DEFAULT_WIDGETS_VISIBILITY));

  useEffect(() => {
    const handleVisChange = (event: Event) => {
      const custom = event as CustomEvent<DesktopWidgetsVisibility>;
      if (custom.detail) setVisibility(custom.detail);
    };
    window.addEventListener('desktop-widgets-visibility-changed', handleVisChange);
    return () => window.removeEventListener('desktop-widgets-visibility-changed', handleVisChange);
  }, []);

  const items: DesktopWidgetItem[] = [
    ...(visibility.weather ? [{ id: 'weather', title: 'Погода', content: <WeatherWidget />, presets: presets(), defaultPreset: 'standard' }] : []),
    ...(visibility.clock ? [{ id: 'clockCalendar', title: 'Часы и календарь', content: <ClockCalendarWidget onOpenCalendar={onOpenCalendar} />, presets: presets(), defaultPreset: 'standard' }] : []),
    ...(visibility.winamp ? [{ id: 'winamp', title: 'Winamp', content: <WinampWidget />, presets: presets(), defaultPreset: 'standard' }] : []),
    ...(visibility.quotes ? [{ id: 'quotes', title: 'Цитаты', content: <QuotesWidget />, presets: presets(), defaultPreset: 'standard' }] : []),
    ...(visibility.currency ? [{ id: 'currency', title: 'Курсы валют', content: <CurrencyWidget />, presets: presets(), defaultPreset: 'standard' }] : []),
    ...(visibility.monitor ? [{ id: 'monitor', title: 'Монитор системы', content: <SystemMonitorWidget />, presets: presets(), defaultPreset: 'standard' }] : []),
    ...(visibility.news ? [{ id: 'news', title: 'Новости RSS', content: <NewsWidget onOpenFeed={onOpenFeed} />, presets: presets(), defaultPreset: 'standard' }] : []),
    ...(visibility.gallery ? [{ id: 'gallery', title: 'Галерея', content: <GalleryWidget onOpenOriginal={onOpenGalleryImage} />, presets: presets(), defaultPreset: 'standard' }] : []),
  ];

  return <DesktopWidgetCanvas themeKey="webos" items={items} />;
}
