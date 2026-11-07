import { useState, useEffect, useMemo, useCallback } from 'react';
import { useApp } from '../../contexts/useApp';
import {
  type RssArticle,
  type RssSource,
  getRssSources,
  saveRssSources,
  fetchAllRssFeeds,
  getCachedArticlesFromDatabase,
  parseRawTextSources,
  formatSourcesToText,
  DEFAULT_RSS_SOURCES,
} from '../../system/widgets/services/rssService';
import { RefreshCw, Settings, ExternalLink, Filter, X, Check, Globe } from 'lucide-react';

function formatRelativeTime(isoString: string, isRu: boolean): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
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

export function NewsRssFeedWindow() {
  const { language } = useApp();
  const isRu = language === 'ru';

  const [articles, setArticles] = useState<RssArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [showSettings, setShowSettings] = useState(false);
  const [settingsText, setSettingsText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load articles
  const loadArticles = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await fetchAllRssFeeds(forceRefresh);
      setArticles(data);
    } catch {
      setErrorMsg(isRu ? 'Ошибка загрузки RSS-ленты' : 'Failed to fetch RSS feeds');
      const cached = await getCachedArticlesFromDatabase();
      setArticles(cached);
    } finally {
      setLoading(false);
    }
  }, [isRu]);

  useEffect(() => {
    loadArticles(false);
  }, [loadArticles]);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const a of articles) {
      if (a.category) set.add(a.category);
    }
    return ['Все', ...Array.from(set)];
  }, [articles]);

  const filteredArticles = useMemo(() => {
    if (selectedCategory === 'Все' || selectedCategory === '#Все') {
      return articles;
    }
    const cat = selectedCategory.replace('#', '');
    return articles.filter((a) => a.category === cat);
  }, [articles, selectedCategory]);

  const handleOpenSettings = () => {
    const sources = getRssSources();
    setSettingsText(formatSourcesToText(sources));
    setShowSettings(true);
  };

  const handleSaveSettings = async () => {
    const parsed = parseRawTextSources(settingsText);
    saveRssSources(parsed);
    setShowSettings(false);
    await loadArticles(true);
  };

  const handleResetSettings = async () => {
    const initial: RssSource[] = DEFAULT_RSS_SOURCES.map((s, idx) => ({
      id: `src_${idx}_${encodeURIComponent(s.url.slice(-15))}`,
      url: s.url,
      category: s.category,
      title: s.title,
      enabled: true,
    }));
    saveRssSources(initial);
    setSettingsText(formatSourcesToText(initial));
    setShowSettings(false);
    await loadArticles(true);
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 text-gray-100 font-sans select-none overflow-hidden relative">
      {/* Top Bar */}
      <header className="px-4 py-3 bg-gray-800/90 border-b border-gray-700/60 backdrop-blur flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
            <Globe size={16} />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-wide">News RSS Feed</h1>
            <p className="text-[10px] text-gray-400">
              {loading
                ? (isRu ? 'Обновление каналов...' : 'Updating channels...')
                : `${filteredArticles.length} ${isRu ? 'публикаций в кэше' : 'cached articles'}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => loadArticles(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gray-700/80 hover:bg-gray-600 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
            title={isRu ? 'Обновить ленту новостей' : 'Refresh feeds'}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>{isRu ? 'Обновить' : 'Refresh'}</span>
          </button>

          <button
            type="button"
            onClick={handleOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600/80 hover:bg-blue-500 text-xs font-medium text-white transition-colors cursor-pointer"
            title={isRu ? 'Настройки источников RSS' : 'RSS Source Settings'}
          >
            <Settings size={13} />
            <span>{isRu ? 'Настройки' : 'Settings'}</span>
          </button>
        </div>
      </header>

      {/* Category Pills Bar */}
      <nav className="px-4 py-2 bg-gray-800/40 border-b border-gray-700/40 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
        <span className="text-gray-400 text-xs flex items-center gap-1 mr-1">
          <Filter size={11} />
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-2.5 py-1 rounded-full text-xs transition-colors cursor-pointer shrink-0 font-medium ${
              selectedCategory === cat
                ? 'bg-blue-500 text-white shadow-sm'
                : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            #{cat}
          </button>
        ))}
      </nav>

      {/* Content Feed */}
      <main className="flex-1 overflow-y-auto p-4 space-y-3">
        {errorMsg && (
          <div className="p-3 bg-red-950/60 border border-red-700/50 rounded-lg text-red-200 text-xs flex items-center justify-between">
            <span>{errorMsg}</span>
            <button type="button" onClick={() => loadArticles(true)} className="underline ml-2 cursor-pointer">
              {isRu ? 'Повторить' : 'Retry'}
            </button>
          </div>
        )}

        {filteredArticles.length === 0 && !loading && (
          <div className="h-64 flex flex-col items-center justify-center text-gray-400 text-sm gap-2">
            <Globe size={32} className="opacity-40" />
            <p>{isRu ? 'Нет новостей в выбранной категории' : 'No articles in this category'}</p>
            <button
              type="button"
              onClick={() => loadArticles(true)}
              className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs text-blue-400 cursor-pointer"
            >
              {isRu ? 'Обновить каналы' : 'Fetch Feeds'}
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredArticles.map((art) => (
            <article
              key={art.id}
              className="bg-gray-800/60 hover:bg-gray-800/90 border border-gray-700/50 rounded-xl p-3 flex flex-col justify-between transition-all duration-150 group shadow-md"
            >
              <div className="flex gap-3">
                {art.imageUrl && (
                  <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0 bg-gray-950 border border-gray-700/40">
                    <img
                      src={art.imageUrl}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-500/20 text-blue-300">
                      #{art.category}
                    </span>
                    <span className="text-[10px] text-gray-400 truncate">
                      {art.sourceTitle}
                    </span>
                    <span className="text-[10px] text-gray-500 ml-auto shrink-0">
                      {formatRelativeTime(art.pubDate, isRu)}
                    </span>
                  </div>
                  <h2 className="text-xs font-bold text-gray-100 line-clamp-2 leading-snug group-hover:text-blue-300 transition-colors">
                    {art.title}
                  </h2>
                  <p className="text-[11px] text-gray-400 line-clamp-2 mt-1 leading-relaxed">
                    {art.description}
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-gray-700/40 flex items-center justify-between text-[11px]">
                <span className="text-gray-500 text-[10px]">
                  {new Date(art.pubDate).toLocaleDateString(isRu ? 'ru-RU' : 'en-US')}
                </span>
                <a
                  href={art.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
                >
                  <span>{isRu ? 'Читать оригинал' : 'Read original'}</span>
                  <ExternalLink size={11} />
                </a>
              </div>
            </article>
          ))}
        </div>
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <header className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">
                  {isRu ? 'Настройки источников RSS' : 'RSS Source Settings'}
                </h3>
                <p className="text-[11px] text-gray-400">
                  {isRu
                    ? 'Задавайте категории в формате #Категория и URL потоков под ними'
                    : 'Specify categories as #Category followed by feed URLs'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="p-1 rounded text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </header>

            <div className="p-4 flex-1 overflow-hidden flex flex-col">
              <label className="text-xs text-gray-300 font-medium mb-1.5">
                {isRu ? 'Список источников:' : 'Feed Sources List:'}
              </label>
              <textarea
                value={settingsText}
                onChange={(e) => setSettingsText(e.target.value)}
                className="w-full flex-1 min-h-[220px] p-3 font-mono text-xs bg-gray-950 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
                placeholder="#Игры&#10;https://rss.stopgame.ru/rss_news.xml"
              />
            </div>

            <footer className="px-4 py-3 bg-gray-900 border-t border-gray-700 flex items-center justify-between">
              <button
                type="button"
                onClick={handleResetSettings}
                className="px-3 py-1.5 rounded text-xs text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                {isRu ? 'Сбросить к исходным' : 'Reset to defaults'}
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="px-3 py-1.5 rounded text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors"
                >
                  {isRu ? 'Отмена' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  className="px-4 py-1.5 rounded text-xs bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Check size={13} />
                  <span>{isRu ? 'Сохранить и обновить' : 'Save & Refresh'}</span>
                </button>
              </div>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
