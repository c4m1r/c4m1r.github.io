import { useState, useEffect } from 'react';
import { useApp } from '../../../contexts/useApp';
import { LOCAL_QUOTES, type QuoteItem } from '../services/quotesData';
import { MessageSquareQuote, Shuffle } from 'lucide-react';

export function QuotesWidget() {
  const { language } = useApp();
  const isRu = language === 'ru';

  const [index, setIndex] = useState(() => Math.floor(Math.random() * LOCAL_QUOTES.length));
  const [fade, setFade] = useState(true);

  const nextQuote = () => {
    setFade(false);
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % LOCAL_QUOTES.length);
      setFade(true);
    }, 200);
  };

  useEffect(() => {
    // Auto-advance every 30 seconds
    const timer = setInterval(nextQuote, 30000);
    return () => clearInterval(timer);
  }, []);

  const quote: QuoteItem = LOCAL_QUOTES[index] ?? LOCAL_QUOTES[0];
  const text = isRu ? quote.textRu : quote.textEn;
  const author = isRu ? quote.authorRu : quote.authorEn;

  return (
    <div className="glass-widget p-3 flex flex-col justify-between w-full sm:w-[280px] min-h-[140px]">
      <div className="glass-widget__ambient" />

      {/* Header */}
      <div className="flex items-center justify-between text-[10px] font-bold tracking-wider text-gray-400 z-10 mb-1">
        <span className="flex items-center gap-1.5 text-orange-300">
          <MessageSquareQuote size={12} />
          {isRu ? 'ЦИТАТА' : 'QUOTE'}
        </span>
        <button
          type="button"
          onClick={nextQuote}
          className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
          title={isRu ? 'Следующая цитата' : 'Next quote'}
        >
          <Shuffle size={11} />
        </button>
      </div>

      {/* Quote Body */}
      <div
        onClick={nextQuote}
        className={`flex-1 flex flex-col justify-center my-1 cursor-pointer transition-opacity duration-200 z-10 ${
          fade ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <p className="text-xs font-serif italic text-gray-100 leading-snug line-clamp-3">
          «{text}»
        </p>
        <div className="flex items-center justify-between mt-2 text-[10px]">
          <span className="text-gray-400 font-sans truncate">
            — {author}
          </span>
          {quote.source && (
            <span className="text-gray-500 text-[9px] px-1.5 py-0.5 rounded bg-white/5 truncate shrink-0 ml-1">
              {quote.source}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
