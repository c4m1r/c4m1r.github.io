import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../../contexts/useApp';
import { fetchMarketRates, type MarketRatesData, type CurrencyItem } from '../services/cryptoCurrencyService';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

function SparklineSvg({ points, color }: { points: number[]; color: string }) {
  if (!points || points.length < 2) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const width = 64;
  const height = 22;

  const path = points
    .map((val, idx) => {
      const x = (idx / (points.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 4) - 2;
      return `${idx === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible shrink-0">
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CurrencyWidget() {
  const { language } = useApp();
  const isRu = language === 'ru';

  const [data, setData] = useState<MarketRatesData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeAssetId, setActiveAssetId] = useState<'BTC' | 'USD' | 'RUB' | 'GOLD'>('BTC');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchMarketRates();
      setData(res);
    } catch {
      // Keep previous
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000); // 1 min auto-update
    return () => clearInterval(interval);
  }, [loadData]);

  const activeItem: CurrencyItem =
    data?.items.find((i) => i.id === activeAssetId) ??
    data?.items[0] ?? {
      id: 'BTC',
      nameRu: 'Биткоин',
      nameEn: 'Bitcoin',
      symbol: 'BTC/USD',
      priceFormatted: '$75,930',
      change24h: 0.22,
      unitRu: 'USDT',
      unitEn: 'USDT',
      sparkline: [75200, 75400, 75300, 75600, 75800, 75930],
      color: '#f59e0b',
    };

  const isPositive = activeItem.change24h >= 0;

  return (
    <div className="glass-widget p-3 flex flex-col justify-between w-full sm:w-[280px] min-h-[160px]">
      <div className="glass-widget__ambient" />

      {/* Header & Tabs */}
      <div className="flex items-center justify-between text-[10px] font-bold z-10 mb-1">
        <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/10">
          {(['BTC', 'USD', 'RUB', 'GOLD'] as const).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveAssetId(id)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                activeAssetId === id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {id === 'GOLD' ? (isRu ? 'ЗОЛОТО' : 'GOLD') : id}
            </button>
          ))}
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={loadData}
          className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
          title={isRu ? 'Обновить котировки' : 'Refresh rates'}
        >
          <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Hero Asset Highlight */}
      <div className="flex items-center justify-between z-10 my-1">
        <div>
          <div className="text-[11px] font-medium text-gray-300">
            {activeItem.symbol}
          </div>
          <div className="text-xl font-black text-white tracking-tight mt-0.5">
            {activeItem.priceFormatted}
          </div>
          <div className="flex items-center gap-1 text-[10px] font-semibold mt-0.5">
            {isPositive ? (
              <TrendingUp size={11} className="text-emerald-400" />
            ) : (
              <TrendingDown size={11} className="text-rose-400" />
            )}
            <span className={isPositive ? 'text-emerald-400' : 'text-rose-400'}>
              {isPositive ? '+' : ''}
              {activeItem.change24h.toFixed(2)}%
            </span>
            <span className="text-gray-400 text-[9px] font-normal ml-1">24ч</span>
          </div>
        </div>

        {/* Mini Sparkline Chart */}
        <div className="flex flex-col items-end">
          <SparklineSvg
            points={activeItem.sparkline}
            color={isPositive ? '#34d399' : '#f87171'}
          />
          <span className="text-[9px] text-gray-400 font-mono mt-1">
            {isRu ? activeItem.unitRu : activeItem.unitEn}
          </span>
        </div>
      </div>

      {/* Mini 3-asset bottom row */}
      <div className="grid grid-cols-3 gap-1 pt-2 border-t border-white/10 text-[9px] z-10">
        {data?.items
          .filter((item) => item.id !== activeAssetId)
          .map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveAssetId(item.id)}
              className="flex flex-col text-left p-1 rounded hover:bg-white/5 transition-colors cursor-pointer"
            >
              <span className="text-gray-400 font-semibold">{item.id}</span>
              <span className="font-bold text-gray-200 truncate">{item.priceFormatted}</span>
              <span className={item.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {item.change24h >= 0 ? '+' : ''}{item.change24h.toFixed(1)}%
              </span>
            </button>
          ))}
      </div>
    </div>
  );
}
