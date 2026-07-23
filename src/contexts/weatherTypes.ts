export type WeatherEffect = 'none' | 'snow' | 'fireworks' | 'halloween' | 'rain' | 'heat' | 'spring';

export interface WeatherOption {
  id: WeatherEffect;
  name: string;
  emoji: string;
  months: number[];
}

export interface WeatherContextType {
  effect: WeatherEffect;
  setEffect: (effect: WeatherEffect) => void;
  suggestedEffect: WeatherEffect;
  effects: WeatherOption[];
}
