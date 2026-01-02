import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type WeatherEffect = 'none' | 'snow' | 'fireworks' | 'halloween' | 'rain' | 'heat' | 'spring';

export interface WeatherOption {
  id: WeatherEffect;
  name: string;
  emoji: string;
  months: number[];
}

interface WeatherContextType {
  effect: WeatherEffect;
  setEffect: (effect: WeatherEffect) => void;
  suggestedEffect: WeatherEffect;
  effects: WeatherOption[];
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

const weatherOptions: WeatherOption[] = [
  { id: 'none', name: 'None', emoji: '✨', months: [] },
  { id: 'snow', name: 'Snow', emoji: '❄️', months: [0, 1, 11] },
  { id: 'spring', name: 'Spring Flowers', emoji: '🌸', months: [2, 3] },
  { id: 'fireworks', name: 'Fireworks', emoji: '🎆', months: [4] },
  { id: 'heat', name: 'Summer Heat', emoji: '☀️', months: [5, 6, 7] },
  { id: 'rain', name: 'Autumn Rain', emoji: '🌧️', months: [8, 9, 10] },
  { id: 'halloween', name: 'Halloween', emoji: '🎃', months: [9] },
];

export function getSuggestedEffect(date = new Date()): WeatherEffect {
  const month = date.getMonth();
  if (month === 9) return 'halloween';
  const match = weatherOptions.find((option) => option.id !== 'none' && option.months.includes(month));
  return match?.id || 'none';
}

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

export function useWeather() {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error('useWeather must be used within WeatherProvider');
  }
  return context;
}
