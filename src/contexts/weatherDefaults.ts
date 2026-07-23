import { type WeatherEffect, type WeatherOption } from './weatherTypes';

export const weatherOptions: WeatherOption[] = [
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
