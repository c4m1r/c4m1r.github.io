import { useState } from 'react';
import { useWeather } from '../contexts/WeatherContext';
import { Cloud } from 'lucide-react';

export function WeatherSwitcher() {
  const { effect, setEffect, suggestedEffect, effects } = useWeather();
  const [open, setOpen] = useState(false);
  const current = effects.find((option) => option.id === effect);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="neu p-3 rounded-xl bg-card hover:scale-105 transition-transform duration-200"
        aria-label="Change weather effect"
        title="Weather"
      >
        <span className="text-lg" aria-hidden>
          {current?.emoji || '✨'}
        </span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-2 z-50 glass rounded-xl p-2 min-w-[220px] animate-scale-in">
            <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Cloud className="w-4 h-4" />
              <span>Weather effects</span>
            </div>
            {effects.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  setEffect(option.id);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  effect === option.id ? 'bg-primary/20 text-primary' : 'hover:bg-muted text-foreground'
                }`}
              >
                <span className="text-lg">{option.emoji}</span>
                <span className="font-medium flex-1 text-left">{option.name}</span>
                {option.id === suggestedEffect && option.id !== 'none' && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/20 text-secondary">Now</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
