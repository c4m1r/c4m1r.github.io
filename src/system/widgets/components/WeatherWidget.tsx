import { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../../../contexts/useApp';
import {
  type WeatherData,
  CITIES,
  DEFAULT_CITY_BY_LANGUAGE,
  fetchWeather,
} from '../services/weatherService';
import { Wind, Droplets, MapPin, ChevronDown, RefreshCw } from 'lucide-react';

export function WeatherWidget() {
  const { language } = useApp();
  const isRu = language === 'ru';
  const languageCode = language.split('-')[0];
  const defaultCity = DEFAULT_CITY_BY_LANGUAGE[languageCode] ?? 'london';
  const [cityId, setCityId] = useState<string>(() => {
    if (typeof window === 'undefined') return defaultCity;
    try {
      const saved = JSON.parse(localStorage.getItem('webos_weather_selected_city_v2') || 'null');
      return saved?.language === languageCode && CITIES.some((city) => city.id === saved.cityId) ? saved.cityId : defaultCity;
    } catch { return defaultCity; }
  });
  const previousLanguage = useRef(languageCode);
  const weatherRequest = useRef(0);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCityPicker, setShowCityPicker] = useState<boolean>(false);

  const loadData = useCallback(async (targetCity: string) => {
    const requestId = ++weatherRequest.current;
    setLoading(true);
    try {
      const data = await fetchWeather(targetCity, language);
      if (requestId === weatherRequest.current) setWeather(data);
    } catch {
      // Keep the last successful reading.
    } finally {
      if (requestId === weatherRequest.current) setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    if (previousLanguage.current !== languageCode) {
      previousLanguage.current = languageCode;
      setCityId(defaultCity);
      try { localStorage.setItem('webos_weather_selected_city_v2', JSON.stringify({ language: languageCode, cityId: defaultCity })); } catch { /* Keep session state. */ }
    }
  }, [languageCode, defaultCity]);

  useEffect(() => {
    loadData(cityId);
  }, [cityId, loadData]);

  const activeCity = CITIES.find((c) => c.id === cityId) ?? CITIES[0];

  return (
    <div className="glass-widget p-4 flex flex-col justify-between w-full sm:w-[330px] min-h-[220px]">
      <div className="glass-widget__ambient" />

      {/* Header */}
      <div className="flex items-center justify-between z-10">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowCityPicker((prev) => !prev)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/15 text-xs font-semibold tracking-wide transition-colors cursor-pointer"
          >
            <MapPin size={12} className="text-blue-400" />
            <span>{activeCity.flag} {isRu ? activeCity.nameRu : activeCity.nameEn}</span>
            <ChevronDown size={11} className="opacity-70" />
          </button>

          {showCityPicker && (
            <div className="absolute top-8 left-0 z-30 w-44 bg-gray-900/95 border border-white/15 rounded-xl shadow-2xl p-1 backdrop-blur-xl">
              {CITIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setCityId(c.id);
                    try { localStorage.setItem('webos_weather_selected_city_v2', JSON.stringify({ language: languageCode, cityId: c.id })); } catch { /* Keep session state. */ }
                    setShowCityPicker(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-between ${
                    c.id === cityId ? 'bg-blue-600 text-white font-medium' : 'text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <span className="flex items-center gap-1.5"><span aria-hidden="true">{c.flag}</span>{isRu ? c.nameRu : c.nameEn}</span>
                  {c.id === cityId && <span className="text-[10px]">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={() => loadData(cityId)}
          className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
          title={isRu ? 'Обновить погоду' : 'Refresh weather'}
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Main Condition */}
      <div className="flex items-center justify-between my-2 z-10">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black tracking-tight">
              {weather ? `${weather.temperature > 0 ? '+' : ''}${weather.temperature}°` : '--°'}
            </span>
            <span className="text-xs text-gray-400">
              {weather ? `${weather.tempMin}° / ${weather.tempMax}°` : ''}
            </span>
          </div>
          <div className="text-xs font-medium text-blue-200/90 mt-0.5">
            {weather ? (isRu ? weather.conditionRu : weather.conditionEn) : '...'}
          </div>
          <div className="text-[10px] text-gray-400">
            {isRu ? 'Ощущается как ' : 'Feels like '}
            {weather ? `${weather.apparentTemperature > 0 ? '+' : ''}${weather.apparentTemperature}°` : '--°'}
          </div>
        </div>

        <div className="text-5xl filter drop-shadow-md pr-1">
          {weather?.icon ?? '⛅'}
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 gap-2 py-2 px-3 rounded-xl bg-white/5 border border-white/5 text-[11px] z-10">
        <div className="flex items-center gap-1.5 text-gray-300">
          <Wind size={13} className="text-cyan-400 shrink-0" />
          <span>{weather ? `${weather.windSpeed} ${isRu ? 'м/с' : 'm/s'}` : '--'}</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-300">
          <Droplets size={13} className="text-blue-400 shrink-0" />
          <span>
            {weather ? `${weather.humidity}%` : '--'}
            {weather && weather.rainProbability > 0 ? ` • ${weather.rainProbability}%` : ''}
          </span>
        </div>
      </div>

      {/* Hourly row */}
      {weather?.hourly && weather.hourly.length > 0 && (
        <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[10px] text-gray-300 z-10">
          {weather.hourly.map((h, i) => (
            <div key={i} className="flex flex-col items-center gap-0.5">
              <span className="opacity-60 text-[9px]">{h.time}</span>
              <span className="text-xs my-0.5">{h.icon}</span>
              <span className="font-semibold">{h.temp > 0 ? `+${h.temp}` : h.temp}°</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
