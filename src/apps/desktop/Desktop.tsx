/**
 * Универсальный Desktop компонент
 * Используется всеми темами
 */

import { useApp } from '../../contexts/useApp';

export function Desktop() {
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

