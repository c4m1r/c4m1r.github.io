import { useState } from 'react';

interface IosDynamicIslandProps {
  activeAppTitle?: string;
  batteryLevel: number | null;
  batteryCharging: boolean;
}

export function IosDynamicIsland({
  activeAppTitle,
  batteryLevel,
  batteryCharging,
}: IosDynamicIslandProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <button
      type="button"
      className={`ios-dynamic-island ${expanded ? 'is-expanded' : ''}`}
      aria-label={expanded ? 'Collapse Dynamic Island' : 'Expand Dynamic Island'}
      aria-expanded={expanded}
      onClick={(event) => {
        event.stopPropagation();
        setExpanded((value) => !value);
      }}
      onMouseDown={(event) => event.stopPropagation()}
    >
      {expanded ? (
        <span className="ios-dynamic-island__expanded">
          <span className="ios-dynamic-island__app">
            <small>{activeAppTitle ? 'Active App' : 'System'}</small>
            <strong>{activeAppTitle || 'Home'}</strong>
          </span>
          <span className="ios-dynamic-island__battery">
            <span className={batteryCharging ? 'is-charging' : ''} />
            <strong>{batteryLevel ?? 75}%</strong>
          </span>
        </span>
      ) : (
        <span className="ios-dynamic-island__compact" aria-hidden="true">
          <span className="ios-dynamic-island__sensor" />
          <span className="ios-dynamic-island__camera">
            <i />
          </span>
        </span>
      )}
    </button>
  );
}
