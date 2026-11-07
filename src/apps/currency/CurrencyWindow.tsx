import { useState, useEffect, useMemo, useCallback } from 'react';
import { useApp } from '../../contexts/useApp';
import {
  fetchMarketRates,
  type MarketRatesData,
} from '../../system/widgets/services/cryptoCurrencyService';
import { RefreshCw, TrendingUp, TrendingDown, DollarSign, Calculator, ArrowRightLeft } from 'lucide-react';

export function CurrencyWindow() {
  const { language } = useApp();
  const isRu = language === 'ru';

  const [data, setData] = useState<MarketRatesData | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Converter state
  const [convertFrom, setConvertFrom] = useState<'USD' | 'RUB' | 'BTC' | 'GOLD' | 'KZT'>('USD');
  const [convertTo, setConvertTo] = useState<'USD' | 'RUB' | 'BTC' | 'GOLD' | 'KZT'>('KZT');
  const [amount, setAmount] = useState<string>('100');

  const btcItem = useMemo(() => data?.items.find((i) => i.id === 'BTC'), [data]);
  const usdItem = useMemo(() => data?.items.find((i) => i.id === 'USD'), [data]);
  const rubItem = useMemo(() => data?.items.find((i) => i.id === 'RUB'), [data]);
  const goldItem = useMemo(() => data?.items.find((i) => i.id === 'GOLD'), [data]);

  const loadRates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchMarketRates();
      setData(res);
      setLastUpdated(new Date().toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (e) {
      console.error('Failed to load rates', e);
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    void loadRates();
    const interval = setInterval(() => void loadRates(), 60000);
    return () => clearInterval(interval);
  }, [loadRates]);

  // Conversion calculations
  const convertedValue = useMemo(() => {
    const num = parseFloat(amount);
    if (!Number.isFinite(num) || num <= 0 || !usdItem || !rubItem || !btcItem || !goldItem) return '0.00';

    const usdPrice = usdItem.numericPrice;
    const rubPrice = rubItem.numericPrice;
    const btcPrice = btcItem.numericPrice;
    const goldPrice = goldItem.numericPrice;

    // Base value in KZT
    let inKzt = 0;
    if (convertFrom === 'KZT') inKzt = num;
    else if (convertFrom === 'USD') inKzt = num * usdPrice;
    else if (convertFrom === 'RUB') inKzt = num * rubPrice;
    else if (convertFrom === 'BTC') inKzt = num * btcPrice * usdPrice;
    else if (convertFrom === 'GOLD') inKzt = num * goldPrice;

    // Convert from KZT to target
    if (convertTo === 'KZT') return inKzt.toLocaleString('ru-RU', { maximumFractionDigits: 2 });
    if (convertTo === 'USD') return (inKzt / usdPrice).toLocaleString('en-US', { maximumFractionDigits: 2 });
    if (convertTo === 'RUB') return (inKzt / rubPrice).toLocaleString('ru-RU', { maximumFractionDigits: 2 });
    if (convertTo === 'BTC') return (inKzt / (btcPrice * usdPrice)).toFixed(6);
    if (convertTo === 'GOLD') return (inKzt / goldPrice).toFixed(3);

    return '0.00';
  }, [amount, convertFrom, convertTo, usdItem, rubItem, btcItem, goldItem]);

  return (
    <div className="w-full h-full flex flex-col bg-slate-900 text-gray-100 font-sans select-none overflow-y-auto">
      {/* Top Header / Toolbar */}
      <header className="flex items-center justify-between px-4 py-3 bg-slate-800/80 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
            <DollarSign size={18} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide">
              {isRu ? 'Курсы валют и котировки' : 'Currency & Market Rates'}
            </h1>
            <p className="text-[11px] text-gray-400">
              {isRu ? 'Реальные котировки к казахстанскому тенге (KZT)' : 'Live financial quotes to Kazakhstani Tenge (KZT)'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-[11px] text-gray-400 font-mono hidden sm:inline">
              {isRu ? 'Обновлено:' : 'Updated:'} {lastUpdated}
            </span>
          )}
          <button
            type="button"
            onClick={() => void loadRates()}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-xs text-white transition-all disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>{isRu ? 'Обновить' : 'Refresh'}</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 flex-1 space-y-4">
        {/* Rates Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* BTC */}
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-white/10 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span className="font-bold text-amber-400">Bitcoin</span>
              <span className="text-[10px] font-mono">BTC/USDT</span>
            </div>
            <div className="text-xl font-extrabold text-white font-mono">
              {btcItem?.priceFormatted ?? '—'}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-xs font-mono">
              <span className="text-gray-400">
                ≈ {btcItem && usdItem ? (btcItem.numericPrice * usdItem.numericPrice).toLocaleString('ru-RU', { maximumFractionDigits: 0 }) : '—'} ₸
              </span>
              <span className={`flex items-center gap-0.5 ${(btcItem?.change24h ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {(btcItem?.change24h ?? 0) >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {btcItem ? `${btcItem.change24h > 0 ? '+' : ''}${btcItem.change24h.toFixed(2)}%` : '+0.0%'}
              </span>
            </div>
          </div>

          {/* USD */}
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-white/10 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span className="font-bold text-emerald-400">{isRu ? 'Доллар США' : 'US Dollar'}</span>
              <span className="text-[10px] font-mono">USD/KZT</span>
            </div>
            <div className="text-xl font-extrabold text-white font-mono">
              {usdItem?.priceFormatted ?? '—'}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-xs font-mono">
              <span className="text-gray-400">1 USD = {usdItem?.numericPrice.toFixed(2) ?? '—'} ₸</span>
              <span className={`flex items-center gap-0.5 ${(usdItem?.change24h ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {(usdItem?.change24h ?? 0) >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {usdItem ? `${usdItem.change24h > 0 ? '+' : ''}${usdItem.change24h.toFixed(2)}%` : '+0.0%'}
              </span>
            </div>
          </div>

          {/* RUB */}
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-white/10 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span className="font-bold text-blue-400">{isRu ? 'Российский рубль' : 'Russian Ruble'}</span>
              <span className="text-[10px] font-mono">RUB/KZT</span>
            </div>
            <div className="text-xl font-extrabold text-white font-mono">
              {rubItem?.priceFormatted ?? '—'}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-xs font-mono">
              <span className="text-gray-400">1 RUB = {rubItem?.numericPrice.toFixed(2) ?? '—'} ₸</span>
              <span className={`flex items-center gap-0.5 ${(rubItem?.change24h ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {(rubItem?.change24h ?? 0) >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {rubItem ? `${rubItem.change24h > 0 ? '+' : ''}${rubItem.change24h.toFixed(2)}%` : '+0.0%'}
              </span>
            </div>
          </div>

          {/* Gold */}
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-white/10 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span className="font-bold text-yellow-400">{isRu ? 'Золото' : 'Gold (XAU)'}</span>
              <span className="text-[10px] font-mono">KZT / г</span>
            </div>
            <div className="text-xl font-extrabold text-white font-mono">
              {goldItem?.priceFormatted ?? '—'}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-xs font-mono">
              <span className="text-gray-400">{isRu ? 'Тройская унция (31.1г)' : 'Troy oz (31.1g)'}</span>
              <span className="text-emerald-400 flex items-center gap-0.5">
                <TrendingUp size={12} />
                +0.35%
              </span>
            </div>
          </div>
        </div>

        {/* Currency Converter / Calculator */}
        <section className="p-4 rounded-xl bg-slate-800/50 border border-white/10 shadow-lg">
          <div className="flex items-center gap-2 mb-3 text-sm font-bold text-white">
            <Calculator size={16} className="text-cyan-400" />
            <span>{isRu ? 'Быстрый конвертер валют' : 'Quick Currency Converter'}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
            {/* Amount & From */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-[11px] text-gray-400 font-medium">
                {isRu ? 'Отдаю:' : 'You pay:'}
              </label>
              <div className="flex rounded-lg overflow-hidden border border-white/20 bg-slate-900">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex-1 bg-transparent px-3 py-2 text-white font-mono text-sm focus:outline-none"
                  placeholder="0.00"
                />
                <select
                  value={convertFrom}
                  onChange={(e) => setConvertFrom(e.target.value as typeof convertFrom)}
                  className="bg-slate-800 px-3 py-2 text-xs font-bold text-cyan-300 border-l border-white/10 focus:outline-none cursor-pointer"
                >
                  <option value="USD">USD ($)</option>
                  <option value="RUB">RUB (₽)</option>
                  <option value="KZT">KZT (₸)</option>
                  <option value="BTC">BTC (₿)</option>
                  <option value="GOLD">{isRu ? 'Золото (г)' : 'Gold (g)'}</option>
                </select>
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center md:pt-4">
              <button
                type="button"
                onClick={() => {
                  setConvertFrom(convertTo);
                  setConvertTo(convertFrom);
                }}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-cyan-300 transition-all active:scale-90"
                title={isRu ? 'Поменять местами' : 'Swap'}
              >
                <ArrowRightLeft size={16} />
              </button>
            </div>

            {/* Converted Value & To */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-[11px] text-gray-400 font-medium">
                {isRu ? 'Получаю:' : 'You receive:'}
              </label>
              <div className="flex rounded-lg overflow-hidden border border-white/20 bg-slate-900">
                <div className="flex-1 bg-transparent px-3 py-2 text-emerald-400 font-mono text-sm font-bold truncate">
                  {convertedValue}
                </div>
                <select
                  value={convertTo}
                  onChange={(e) => setConvertTo(e.target.value as typeof convertTo)}
                  className="bg-slate-800 px-3 py-2 text-xs font-bold text-emerald-300 border-l border-white/10 focus:outline-none cursor-pointer"
                >
                  <option value="KZT">KZT (₸)</option>
                  <option value="USD">USD ($)</option>
                  <option value="RUB">RUB (₽)</option>
                  <option value="BTC">BTC (₿)</option>
                  <option value="GOLD">{isRu ? 'Золото (г)' : 'Gold (g)'}</option>
                </select>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}