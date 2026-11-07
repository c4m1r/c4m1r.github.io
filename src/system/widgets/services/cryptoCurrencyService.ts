export interface CurrencyItem {
  id: 'BTC' | 'USD' | 'RUB' | 'GOLD';
  nameRu: string;
  nameEn: string;
  symbol: string;
  priceFormatted: string;
  change24h: number; // percentage, e.g. +1.45 or -0.25
  unitRu: string;
  unitEn: string;
  sparkline: number[];
  color: string;
}

export interface MarketRatesData {
  items: CurrencyItem[];
  updatedAt: string;
}

const STORAGE_KEY = 'webos_market_rates_cache_v1';

function generateSparkline(basePrice: number, changePercent: number): number[] {
  const points = 12;
  const result: number[] = [];
  const startPrice = basePrice / (1 + changePercent / 100);
  let current = startPrice;
  const trendStep = (basePrice - startPrice) / points;

  for (let i = 0; i < points - 1; i++) {
    const jitter = (Math.random() - 0.5) * (basePrice * 0.008);
    current += trendStep + jitter;
    result.push(Number(current.toFixed(2)));
  }
  result.push(basePrice);
  return result;
}

export async function fetchMarketRates(): Promise<MarketRatesData> {
  // Check cache (10 min freshness)
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const cached = JSON.parse(raw) as MarketRatesData;
        const diff = Date.now() - new Date(cached.updatedAt).getTime();
        if (diff < 10 * 60 * 1000) {
          return cached;
        }
      } catch {
        // Continue
      }
    }
  }

  // 1. Fetch BTC/USDT from Binance
  let btcPrice = 75930;
  let btcChange = 0.22;
  try {
    const res = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT');
    if (res.ok) {
      const data = await res.json();
      btcPrice = parseFloat(data.lastPrice);
      btcChange = parseFloat(data.priceChangePercent);
    }
  } catch {
    // Keep baseline
  }

  // 2. Fetch Fiat currency rates (USD -> KZT, RUB -> KZT)
  let usdToKzt = 448.25;
  let rubToKzt = 5.48;
  try {
    const res = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json');
    if (res.ok) {
      const data = await res.json();
      if (data.usd?.kzt) {
        usdToKzt = parseFloat(data.usd.kzt);
      }
      if (data.usd?.rub && data.usd?.kzt) {
        rubToKzt = parseFloat(data.usd.kzt) / parseFloat(data.usd.rub);
      }
    }
  } catch {
    try {
      const alt = await fetch('https://open.er-api.com/v6/latest/USD');
      if (alt.ok) {
        const data = await alt.json();
        if (data.rates?.KZT) usdToKzt = data.rates.KZT;
        if (data.rates?.KZT && data.rates?.RUB) rubToKzt = data.rates.KZT / data.rates.RUB;
      }
    } catch {
      // Keep defaults
    }
  }

  // 3. Fetch Gold (XAU) -> KZT
  // 1 troy ounce = 31.1034768 grams
  let goldKztPerGram = 58597;
  const goldChange = 0.35;
  try {
    const res = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/xau.json');
    if (res.ok) {
      const data = await res.json();
      if (data.xau?.kzt) {
        const xauKzt = parseFloat(data.xau.kzt);
        goldKztPerGram = Math.round(xauKzt / 31.1034768);
      }
    }
  } catch {
    // Keep fallback
  }

  const items: CurrencyItem[] = [
    {
      id: 'BTC',
      nameRu: 'Биткоин',
      nameEn: 'Bitcoin',
      symbol: 'BTC/USD',
      priceFormatted: `$${btcPrice.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
      change24h: btcChange,
      unitRu: 'USDT',
      unitEn: 'USDT',
      sparkline: generateSparkline(btcPrice, btcChange),
      color: '#f59e0b',
    },
    {
      id: 'USD',
      nameRu: 'Доллар США',
      nameEn: 'US Dollar',
      symbol: 'USD/KZT',
      priceFormatted: `₸${usdToKzt.toFixed(2)}`,
      change24h: 0.15,
      unitRu: 'KZT',
      unitEn: 'KZT',
      sparkline: generateSparkline(usdToKzt, 0.15),
      color: '#10b981',
    },
    {
      id: 'RUB',
      nameRu: 'Российский рубль',
      nameEn: 'Russian Ruble',
      symbol: 'RUB/KZT',
      priceFormatted: `₸${rubToKzt.toFixed(2)}`,
      change24h: -0.28,
      unitRu: 'KZT',
      unitEn: 'KZT',
      sparkline: generateSparkline(rubToKzt, -0.28),
      color: '#3b82f6',
    },
    {
      id: 'GOLD',
      nameRu: 'Золото (XAU)',
      nameEn: 'Gold (XAU)',
      symbol: 'XAU/KZT',
      priceFormatted: `₸${goldKztPerGram.toLocaleString('ru-RU')}`,
      change24h: goldChange,
      unitRu: 'KZT / г',
      unitEn: 'KZT / g',
      sparkline: generateSparkline(goldKztPerGram, goldChange),
      color: '#fbbf24',
    },
  ];

  const result: MarketRatesData = {
    items,
    updatedAt: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
    } catch {
      // Ignore
    }
  }

  return result;
}
