import { useState, useEffect } from 'react';
import { WeatherWidget } from './WeatherWidget';
import { ClockCalendarWidget } from './ClockCalendarWidget';
import { WinampWidget } from './WinampWidget';
import { QuotesWidget } from './QuotesWidget';
import { CurrencyWidget } from './CurrencyWidget';
import { SystemMonitorWidget } from './SystemMonitorWidget';
import { NewsWidget } from './NewsWidget';
import { GalleryWidget } from './GalleryWidget';
import {
  type DesktopWidgetsVisibility,
  getStoredWidgetsVisibility,
} from '../types';
import '../widgets.css';

interface WebosDesktopWidgetsProps {
  onOpenFeed?: () => void;
  onOpenGalleryImage?: (path: string) => void;
}

export function WebosDesktopWidgets({ onOpenFeed, onOpenGalleryImage }: WebosDesktopWidgetsProps) {
  const [visibility, setVisibility] = useState<DesktopWidgetsVisibility>(getStoredWidgetsVisibility);

  useEffect(() => {
    const handleVisChange = (e: Event) => {
      const custom = e as CustomEvent<DesktopWidgetsVisibility>;
      if (custom.detail) {
        setVisibility(custom.detail);
      }
    };
    window.addEventListener('desktop-widgets-visibility-changed', handleVisChange);
    return () => window.removeEventListener('desktop-widgets-visibility-changed', handleVisChange);
  }, []);

  const hasTopRow = visibility.weather || visibility.clock;
  const hasMiddleRow = visibility.winamp || visibility.quotes;
  const hasThirdRow = visibility.currency || visibility.monitor;
  const hasBottomRow = visibility.news || visibility.gallery;

  return (
    <aside className="webos-widgets-container" aria-label="Desktop Widgets">
      {/* Row 1: Weather + Clock & Calendar */}
      {hasTopRow && (
        <div className="widgets-row">
          {visibility.weather && <WeatherWidget />}
          {visibility.clock && <ClockCalendarWidget />}
        </div>
      )}

      {/* Row 2: Winamp Now Playing + Quotes */}
      {hasMiddleRow && (
        <div className="widgets-row">
          {visibility.winamp && <WinampWidget />}
          {visibility.quotes && <QuotesWidget />}
        </div>
      )}

      {/* Row 3: Currency / Crypto + System Monitor */}
      {hasThirdRow && (
        <div className="widgets-row">
          {visibility.currency && <CurrencyWidget />}
          {visibility.monitor && <SystemMonitorWidget />}
        </div>
      )}

      {/* Row 4: News RSS + Gallery */}
      {hasBottomRow && (
        <div className="widgets-row">
          {visibility.news && <NewsWidget onOpenFeed={onOpenFeed} />}
          {visibility.gallery && <GalleryWidget onOpenOriginal={onOpenGalleryImage} />}
        </div>
      )}
    </aside>
  );
}
