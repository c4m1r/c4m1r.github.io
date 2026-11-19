import { useState, useEffect } from 'react';
import { useApp } from '../../../contexts/useApp';
import { getCachedArticlesFromDatabase, fetchAllRssFeeds, type RssArticle } from '../services/rssService';
import { Newspaper, ChevronRight } from 'lucide-react';

function formatRelativeTime(isoString: string, isRu: boolean): string {
  try {
    const timestamp = new Date(isoString).getTime();
    if (!Number.isFinite(timestamp) || timestamp <= 0) return isRu ? 'дата неизвестна' : 'date unknown';
    const diffMs = Date.now() - timestamp;
    if (diffMs < -60_000) return isRu ? 'в будущем' : 'in the future';
    const diffMin = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMin < 2) return isRu ? 'только что' : 'just now';
    if (diffMin < 60) return isRu ? `${diffMin} мин. назад` : `${diffMin}m ago`;
    if (diffHours < 24) return isRu ? `${diffHours} ч. назад` : `${diffHours}h ago`;
    if (diffDays === 1) return isRu ? 'вчера' : 'yesterday';
    return isRu ? `${diffDays} дн. назад` : `${diffDays}d ago`;
  } catch {
    return '';
  }
}

interface NewsWidgetProps {
  onOpenFeed?: () => void;
}

export function NewsWidget({ onOpenFeed }: NewsWidgetProps) {
  const { language } = useApp();
  const isRu = language === 'ru';

  const [articles, setArticles] = useState<RssArticle[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let active = true;
    getCachedArticlesFromDatabase().then((cached) => {
      if (active && cached.length > 0) {
        setArticles(cached);
      } else {
        fetchAllRssFeeds(false).then((fetched) => {
          if (active && fetched.length > 0) setArticles(fetched);
        });
      }
    });

    return () => {
      active = false;
    };
  }, []);

  // Auto-advance news ticker every 8s
  useEffect(() => {
    if (articles.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % Math.min(articles.length, 6));
    }, 8000);
    return () => clearInterval(timer);
  }, [articles.length]);

  const current = articles[index] ?? {
    id: 'placeholder',
    title: isRu ? 'Новый трейлер и свежие детали обновлений индустрии' : 'Latest gaming and tech industry announcements',
    description: '',
    link: '#',
    pubDate: new Date().toISOString(),
    category: 'Игры',
    sourceTitle: 'News Feed',
    sourceUrl: '#',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=60',
  };

  const handleLaunch = () => {
    if (onOpenFeed) {
      onOpenFeed();
    } else if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app:launch', { detail: { appId: 'news' } }));
    }
  };

  const maxDots = Math.min(articles.length || 5, 5);

  return (
    <div
      onClick={handleLaunch}
      className="glass-widget p-3 flex flex-col justify-between w-full sm:w-[330px] min-h-[140px] cursor-pointer group"
    >
      <div className="glass-widget__ambient" />

      {/* Header */}
      <div className="flex items-center justify-between text-[10px] font-bold z-10 mb-1">
        <span className="flex items-center gap-1.5 text-blue-300">
          <Newspaper size={12} />
          {isRu ? 'НОВОСТИ' : 'NEWS RSS'}
          {current.category && (
            <span className="text-[9px] font-semibold text-gray-400 bg-white/5 px-1.5 py-0.5 rounded ml-1">
              #{current.category}
            </span>
          )}
        </span>
        <span className="text-gray-400 text-[10px] font-normal flex items-center gap-0.5 group-hover:text-white transition-colors">
          {formatRelativeTime(current.pubDate, isRu)}
          <ChevronRight size={11} className="opacity-60 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>

      {/* Body: Thumbnail + Headline */}
      <div className="flex items-center gap-3 z-10 my-1">
        {current.imageUrl && (
          <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-900 border border-white/10 shadow">
            <img
              src={current.imageUrl}
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-gray-100 group-hover:text-blue-300 transition-colors line-clamp-2 leading-snug">
            {current.title}
          </h4>
          <p className="text-[10px] text-gray-400 line-clamp-1 mt-1">
            {current.sourceTitle}
          </p>
        </div>
      </div>

      {/* Pagination dots */}
      <div className="flex items-center justify-center gap-1 z-10 mt-1">
        {Array.from({ length: maxDots }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIndex(i);
            }}
            className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
              index === i ? 'bg-blue-400 w-3' : 'bg-white/20 hover:bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
