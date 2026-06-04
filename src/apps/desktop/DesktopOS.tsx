import { useState } from 'react';
import type { ThemeId } from '../../contexts/AppContext';

type OSState = 'boot' | 'login' | 'welcome' | 'desktop' | 'logoff' | 'shutdown';

interface DesktopOSProps {
  theme: ThemeId;
}

export function DesktopOS({ theme }: DesktopOSProps) {
  const [state] = useState<OSState>('boot');

  return (
    <div className="desktop-os">
      <div>DesktopOS - Theme: {theme} - State: {state}</div>
    </div>
  );
}

