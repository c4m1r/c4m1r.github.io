export interface CityConfig {
  id: string;
  countryCode: string;
  flag: string;
  nameRu: string;
  nameEn: string;
  lat: number;
  lon: number;
}

export const CITIES: CityConfig[] = [
  // Russia
  { id: 'moscow', countryCode: 'RU', flag: '🇷🇺', nameRu: 'Москва', nameEn: 'Moscow', lat: 55.7558, lon: 37.6173 },
  { id: 'spb', countryCode: 'RU', flag: '🇷🇺', nameRu: 'Санкт-Петербург', nameEn: 'Saint Petersburg', lat: 59.9343, lon: 30.3351 },
  // Kazakhstan
  { id: 'astana', countryCode: 'KZ', flag: '🇰🇿', nameRu: 'Астана', nameEn: 'Astana', lat: 51.1694, lon: 71.4491 },
  { id: 'almaty', countryCode: 'KZ', flag: '🇰🇿', nameRu: 'Алматы', nameEn: 'Almaty', lat: 43.2220, lon: 76.8512 },
  // Belarus
  { id: 'minsk', countryCode: 'BY', flag: '🇧🇾', nameRu: 'Минск', nameEn: 'Minsk', lat: 53.9006, lon: 27.5590 },
  { id: 'gomel', countryCode: 'BY', flag: '🇧🇾', nameRu: 'Гомель', nameEn: 'Gomel', lat: 52.4345, lon: 30.9754 },
  // China
  { id: 'beijing', countryCode: 'CN', flag: '🇨🇳', nameRu: 'Пекин', nameEn: 'Beijing', lat: 39.9042, lon: 116.4074 },
  { id: 'shanghai', countryCode: 'CN', flag: '🇨🇳', nameRu: 'Шанхай', nameEn: 'Shanghai', lat: 31.2304, lon: 121.4737 },
  // Japan
  { id: 'tokyo', countryCode: 'JP', flag: '🇯🇵', nameRu: 'Токио', nameEn: 'Tokyo', lat: 35.6762, lon: 139.6503 },
  { id: 'yokohama', countryCode: 'JP', flag: '🇯🇵', nameRu: 'Йокогама', nameEn: 'Yokohama', lat: 35.4437, lon: 139.6380 },
  // South Korea
  { id: 'seoul', countryCode: 'KR', flag: '🇰🇷', nameRu: 'Сеул', nameEn: 'Seoul', lat: 37.5665, lon: 126.9780 },
  { id: 'busan', countryCode: 'KR', flag: '🇰🇷', nameRu: 'Пусан', nameEn: 'Busan', lat: 35.1796, lon: 129.0756 },
  // United Kingdom
  { id: 'london', countryCode: 'GB', flag: '🇬🇧', nameRu: 'Лондон', nameEn: 'London', lat: 51.5074, lon: -0.1278 },
  { id: 'birmingham', countryCode: 'GB', flag: '🇬🇧', nameRu: 'Бирмингем', nameEn: 'Birmingham', lat: 52.4862, lon: -1.8904 },
  // Additional language defaults for Français and Español
  { id: 'paris', countryCode: 'FR', flag: '🇫🇷', nameRu: 'Париж', nameEn: 'Paris', lat: 48.8566, lon: 2.3522 },
  { id: 'lyon', countryCode: 'FR', flag: '🇫🇷', nameRu: 'Лион', nameEn: 'Lyon', lat: 45.7640, lon: 4.8357 },
  { id: 'madrid', countryCode: 'ES', flag: '🇪🇸', nameRu: 'Мадрид', nameEn: 'Madrid', lat: 40.4168, lon: -3.7038 },
  { id: 'barcelona', countryCode: 'ES', flag: '🇪🇸', nameRu: 'Барселона', nameEn: 'Barcelona', lat: 41.3874, lon: 2.1686 },
];

export const DEFAULT_CITY_BY_LANGUAGE: Record<string, string> = {
  en: 'london',
  ru: 'almaty',
  fr: 'paris',
  es: 'madrid',
  zh: 'beijing',
  ja: 'tokyo',
  ko: 'seoul',
};

export interface WeatherData {
  cityId: string;
  cityName: string;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  weatherCode: number;
  conditionRu: string;
  conditionEn: string;
  icon: string;
  tempMax: number;
  tempMin: number;
  rainProbability: number;
  hourly: Array<{
    time: string;
    temp: number;
    icon: string;
  }>;
  updatedAt: string;
}

export function getWeatherCondition(code: number): { ru: string; en: string; icon: string } {
  if (code === 0) return { ru: 'Ясно', en: 'Clear', icon: '☀️' };
  if (code === 1) return { ru: 'В основном ясно', en: 'Mainly clear', icon: '🌤️' };
  if (code === 2) return { ru: 'Переменная облачность', en: 'Partly cloudy', icon: '⛅' };
  if (code === 3) return { ru: 'Пасмурно', en: 'Overcast', icon: '☁️' };
  if (code >= 45 && code <= 48) return { ru: 'Туман', en: 'Fog', icon: '🌫️' };
  if (code >= 51 && code <= 55) return { ru: 'Морось', en: 'Drizzle', icon: '🌦️' };
  if (code >= 61 && code <= 65) return { ru: 'Дождь', en: 'Rain', icon: '🌧️' };
  if (code >= 71 && code <= 77) return { ru: 'Снегопад', en: 'Snow', icon: '🌨️' };
  if (code >= 80 && code <= 82) return { ru: 'Ливень', en: 'Heavy rain', icon: '🌧️' };
  if (code >= 85 && code <= 86) return { ru: 'Метель', en: 'Snow showers', icon: '❄️' };
  if (code >= 95) return { ru: 'Гроза', en: 'Thunderstorm', icon: '⛈️' };
  return { ru: 'Облачно', en: 'Cloudy', icon: '☁️' };
}

const WEATHER_CACHE_KEY_PREFIX = 'webos_weather_';

export async function fetchWeather(cityId = 'almaty', language = 'ru'): Promise<WeatherData> {
  const city = CITIES.find((c) => c.id === cityId) ?? CITIES[0];

  // Try cached data if fresh (< 20 mins)
  const cacheKey = `${WEATHER_CACHE_KEY_PREFIX}${city.id}`;
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(cacheKey);
    if (raw) {
      try {
        const cached = JSON.parse(raw) as WeatherData;
        const diff = Date.now() - new Date(cached.updatedAt).getTime();
        if (diff < 20 * 60 * 1000) {
          return cached;
        }
      } catch {
        // Continue to fresh fetch
      }
    }
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&hourly=temperature_2m,weather_code&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Open-Meteo HTTP error: ${res.status}`);
  }

  const json = await res.json();
  const current = json.current;
  const daily = json.daily;
  const cond = getWeatherCondition(current.weather_code);

  const locale = language === 'ru' ? 'ru-RU' : language === 'fr' ? 'fr-FR' : language === 'es' ? 'es-ES' : language === 'zh' ? 'zh-CN' : language === 'ja' ? 'ja-JP' : language === 'ko' ? 'ko-KR' : 'en-GB';
  const hourly = (json.hourly?.time || []).slice(0, 6).map((timeStr: string, idx: number) => {
    const date = new Date(timeStr);
    const code = json.hourly?.weather_code?.[idx] ?? 0;
    return {
      time: date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }),
      temp: Math.round(json.hourly?.temperature_2m?.[idx] ?? 0),
      icon: getWeatherCondition(code).icon,
    };
  });

  const weatherData: WeatherData = {
    cityId: city.id,
    cityName: `${city.flag} ${language === 'ru' ? city.nameRu : city.nameEn}`,
    temperature: Math.round(current.temperature_2m),
    apparentTemperature: Math.round(current.apparent_temperature),
    humidity: Math.round(current.relative_humidity_2m),
    windSpeed: Math.round(current.wind_speed_10m * 10) / 10,
    precipitation: current.precipitation ?? 0,
    weatherCode: current.weather_code,
    conditionRu: cond.ru,
    conditionEn: cond.en,
    icon: cond.icon,
    tempMax: Math.round(daily.temperature_2m_max?.[0] ?? current.temperature_2m),
    tempMin: Math.round(daily.temperature_2m_min?.[0] ?? current.temperature_2m),
    rainProbability: daily.precipitation_probability_max?.[0] ?? 0,
    hourly,
    updatedAt: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(cacheKey, JSON.stringify(weatherData));
    } catch {
      // Storage unavailable
    }
  }

  return weatherData;
}
