import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { WeatherContext } from './weatherContextCore';
import { getSuggestedEffect, weatherOptions } from './weatherDefaults';
import { type WeatherEffect, type WeatherContextType } from './weatherTypes';

export function WeatherProvider({ children }: { children: ReactNode }) {
  const suggestedEffect = useMemo(() => getSuggestedEffect(), []);
  const [effect, setEffect] = useState<WeatherEffect>(() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem('weather-effect') : null;
    if (saved && weatherOptions.some((option) => option.id === saved)) {
      return saved as WeatherEffect;
    }
    return suggestedEffect;
  });

  useEffect(() => {
    window.localStorage.setItem('weather-effect', effect);
  }, [effect]);

  const value: WeatherContextType = {
    effect,
    setEffect,
    suggestedEffect,
    effects: weatherOptions,
  };

  return <WeatherContext.Provider value={value}>{children}</WeatherContext.Provider>;
}
