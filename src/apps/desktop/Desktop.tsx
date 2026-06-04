/**
 * Универсальный Desktop компонент
 * Используется всеми темами
 */

import { useApp } from '../../contexts/AppContext';

interface DesktopProps {
  onSystemCommand?: (command: 'logoff' | 'shutdown') => void;
}

export function Desktop({}: DesktopProps) {
  const { theme } = useApp();

  return (
    <div className={`desktop theme-${theme}`}>
      <div className="desktop-content">
        <h1>Desktop - Theme: {theme}</h1>
        <p>Универсальный Desktop компонент для всех тем</p>
      </div>
    </div>
  );
}

