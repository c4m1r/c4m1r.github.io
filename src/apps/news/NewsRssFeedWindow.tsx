import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
import { RefreshCw, Settings, ExternalLink, Filter, X, Check, Globe, ChevronLeft, BookOpen } from 'lucide-react';

function formatRelativeTime(isoString: string, isRu: boolean): string {
  const timestamp = new Date(isoString).getTime();
  if (!Number.isFinite(timestamp) || timestamp <= 0) return isRu ? 'дата неизвестна' : 'date unknown';
  const diffMs = Date.now() - timestamp;
  if (diffMs < -60_000) return isRu ? 'в будущем' : 'in the future';
  const diffMin = Math.max(0, Math.floor(diffMs / 60000));
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMin < 2) return isRu ? 'только что' : 'just now';
  if (diffMin < 60) return isRu ? `${diffMin} мин. назад` : `${diffMin}m ago`;
  if (diffHours < 24) return isRu ? `${diffHours} ч. назад` : `${diffHours}h ago`;
  if (diffDays === 1) return isRu ? 'вчера' : 'yesterday';
  return isRu ? `${diffDays} дн. назад` : `${diffDays}d ago`;
}

async function fetchArticleWithTimeout<T>(url: string, readResponse: (response: Response) => Promise<T>): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(url, { signal: controller.signal });
    return await readResponse(response);
  } finally {
    clearTimeout(timeout);
  }
}

function sanitizeArticleHtml(html: string, baseUrl?: string): string {
  if (typeof DOMParser === 'undefined') return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('script,style,iframe,object,embed,form,button,input,meta,link,svg,canvas,video,audio,source').forEach((node) => node.remove());
  doc.body.querySelectorAll('*').forEach((node) => {
    if (node instanceof HTMLImageElement && !node.getAttribute('src')) {
      const lazySource = node.getAttribute('data-src') || node.getAttribute('data-original') || node.getAttribute('data-lazy-src');
      if (lazySource) node.setAttribute('src', lazySource);
    }
    Array.from(node.attributes).forEach((attr) => {
      const name = attr.name.toLowerCase();
      const value = attr.value.trim();
      if (name.startsWith('on') || name === 'srcdoc' || name === 'srcset' || name === 'style' || ((name === 'href' || name === 'src') && /^\s*(javascript|vbscript|data):/i.test(value))) {
        node.removeAttribute(attr.name);
      } else if (baseUrl && (name === 'href' || name === 'src') && value) {
        try {
          const absolute = new URL(value, baseUrl);
          if (absolute.protocol === 'http:' || absolute.protocol === 'https:') node.setAttribute(attr.name, absolute.href);
          else node.removeAttribute(attr.name);
        } catch { node.removeAttribute(attr.name); }
      }
    });
    if (node instanceof HTMLAnchorElement) {
      node.setAttribute('target', '_blank');
      node.setAttribute('rel', 'noopener noreferrer');
    }
  });
  return doc.body.innerHTML;
}

function markdownArticleToHtml(markdown: string): string {
  const escapeHtml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const blocks = markdown.replace(/\r/g, '').split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean);
  return blocks.map((block) => {
    const heading = block.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      return `<h${level}>${escapeHtml(heading[2])}</h${level}>`;
    }
    const lines = block.split('\n').map((line) => escapeHtml(line)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/!\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g, '<img src="$2" alt="$1">')
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2">$1</a>'));
    return `<p>${lines.join('<br>')}</p>`;
  }).join('');
}

export function NewsRssFeedWindow() {
  const { language } = useApp();
  const isRu = language === 'ru';
  const [articles, setArticles] = useState<RssArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [showCategories, setShowCategories] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<RssArticle | null>(null);
  const [pageContent, setPageContent] = useState<string | null>(null);
  const [articleLoading, setArticleLoading] = useState(false);
  const [articleFetchFailed, setArticleFetchFailed] = useState(false);
  const activeArticleId = useRef<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsText, setSettingsText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadArticles = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      setArticles(await fetchAllRssFeeds(forceRefresh));
    } catch {
      setErrorMsg(isRu ? 'Ошибка загрузки RSS-ленты. Показан последний доступный кеш.' : 'RSS refresh failed. Showing the last available cache.');
      setArticles(await getCachedArticlesFromDatabase());
    } finally {
      setLoading(false);
    }
  }, [isRu]);

  useEffect(() => { loadArticles(false); }, [loadArticles]);

  const categories = useMemo(() => ['Все', ...Array.from(new Set(articles.map((a) => a.category).filter(Boolean)))], [articles]);
  const filteredArticles = useMemo(
    () => selectedCategory === 'Все' ? articles : articles.filter((a) => a.category === selectedCategory),
    [articles, selectedCategory]
  );

  const openArticle = async (article: RssArticle) => {
    activeArticleId.current = article.id;
    setSelectedArticle(article);
    setPageContent(null);
    setArticleFetchFailed(false);
    setArticleLoading(true);
    try {
      const articleUrl = new URL(article.link);
      if (articleUrl.protocol !== 'http:' && articleUrl.protocol !== 'https:') throw new Error('Unsupported article URL');
      let safeHtml = '';
      try {
        const wrapper = await fetchArticleWithTimeout('https://api.allorigins.win/get?url=' + encodeURIComponent(articleUrl.href), async (response) => {
          if (!response.ok) throw new Error('Article proxy request failed');
          return await response.json() as { contents?: string };
        });
        if (!wrapper.contents) throw new Error('Article page is unavailable');
        const document = new DOMParser().parseFromString(wrapper.contents, 'text/html');
        const candidates = Array.from(document.querySelectorAll('[itemprop="articleBody"], article, .article-content, .post-content, .entry-content, main'))
          .filter((element) => (element.textContent ?? '').trim().length > 180)
          .sort((a, b) => (b.textContent ?? '').length - (a.textContent ?? '').length);
        const source = candidates[0] ?? document.body;
        const extracted = source.cloneNode(true) as HTMLElement;
        extracted.querySelectorAll('script,style,iframe,object,embed,form,button,nav,header,footer,aside').forEach((node) => node.remove());
        if ((extracted.textContent ?? '').trim().length < 160) throw new Error('No readable article body found');
        safeHtml = sanitizeArticleHtml(extracted.innerHTML, articleUrl.href);
      } catch {
        const readerUrl = `https://r.jina.ai/${articleUrl.protocol}//${articleUrl.host}${articleUrl.pathname}${articleUrl.search}`;
        const markdownText = await fetchArticleWithTimeout(readerUrl, async (response) => {
          if (!response.ok) throw new Error('Reader proxy request failed');
          return await response.text();
        });
        if (markdownText.trim().length < 180) throw new Error('No readable article body found');
        safeHtml = sanitizeArticleHtml(markdownArticleToHtml(markdownText), articleUrl.href);
      }
      if (activeArticleId.current === article.id) setPageContent(safeHtml);
    } catch {
      if (activeArticleId.current === article.id) setArticleFetchFailed(true);
    } finally {
      if (activeArticleId.current === article.id) setArticleLoading(false);
    }
  };
  const handleOpenSettings = () => {
    setSettingsText(formatSourcesToText(getRssSources()));
    setShowSettings(true);
  };
  const handleSaveSettings = async () => {
    saveRssSources(parseRawTextSources(settingsText));
    setShowSettings(false);
    activeArticleId.current = null;
    setSelectedArticle(null);
    setPageContent(null);
    await loadArticles(true);
  };
  const handleResetSettings = async () => {
    const initial: RssSource[] = DEFAULT_RSS_SOURCES.map((source, idx) => ({
      id: `src_${idx}_${encodeURIComponent(source.url.slice(-15))}`,
      url: source.url, category: source.category, title: source.title, enabled: true,
    }));
    saveRssSources(initial);
    setSettingsText(formatSourcesToText(initial));
    setShowSettings(false);
    await loadArticles(true);
  };

  const safeContent = pageContent ?? (selectedArticle?.content
    ? sanitizeArticleHtml(selectedArticle.content, selectedArticle.link)
    : selectedArticle?.description || '');

  return (
    <div className="h-full flex flex-col bg-gray-950 text-gray-100 font-sans overflow-hidden relative">
      <header className="px-4 py-3 bg-gray-900/95 border-b border-gray-700/70 backdrop-blur flex items-center justify-between gap-3 shrink-0 z-20">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0"><Globe size={17} /></div>
          <div className="min-w-0">
            <h1 className="font-bold text-sm tracking-wide">News RSS Feed</h1>
            <p className="text-[10px] text-gray-400 truncate">
              {loading ? (isRu ? 'Обновление источников…' : 'Refreshing feeds…') : `${filteredArticles.length} ${isRu ? 'публикаций' : 'articles'}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button type="button" onClick={() => setShowCategories((v) => !v)} className={`p-2 rounded-lg border transition-colors ${showCategories ? 'bg-blue-600 border-blue-400 text-white' : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'}`} title={isRu ? 'Категории' : 'Categories'} aria-expanded={showCategories}><Filter size={15} /></button>
          <button type="button" disabled={loading} onClick={() => loadArticles(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-xs disabled:opacity-50"><RefreshCw size={13} className={loading ? 'animate-spin' : ''}/><span>{isRu ? 'Обновить' : 'Refresh'}</span></button>
          <button type="button" onClick={handleOpenSettings} className="p-2 rounded-lg bg-blue-600/90 hover:bg-blue-500 text-white" title={isRu ? 'Настройки источников' : 'Feed settings'}><Settings size={15}/></button>
        </div>
      </header>

      <div className="flex-1 min-h-0 flex relative">
        <aside className={`absolute left-0 top-0 bottom-0 z-10 w-52 bg-gray-900 border-r border-gray-700/70 shadow-2xl transition-transform duration-200 ${showCategories ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="px-3 py-3 border-b border-gray-700/70 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-200">{isRu ? 'Категории' : 'Categories'}</span>
            <button type="button" onClick={() => setShowCategories(false)} className="p-1 text-gray-400 hover:text-white" aria-label={isRu ? 'Закрыть категории' : 'Close categories'}><X size={14}/></button>
          </div>
          <nav className="p-2 space-y-1 overflow-y-auto max-h-[calc(100%-48px)]">
            {categories.map((category) => (
              <button key={category} type="button" onClick={() => { setSelectedCategory(category); activeArticleId.current = null; setSelectedArticle(null); setPageContent(null); setShowCategories(false); }} className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${selectedCategory === category ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}>
                {category === 'Все' ? (isRu ? 'Все новости' : 'All news') : `#${category}`}
                <span className="float-right opacity-60">{category === 'Все' ? articles.length : articles.filter((a) => a.category === category).length}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 min-w-0 overflow-y-auto p-3 sm:p-4">
          {errorMsg && <div className="mb-3 p-3 bg-amber-950/50 border border-amber-700/50 rounded-lg text-amber-200 text-xs">{errorMsg}</div>}
          {selectedArticle ? (
            <article className="w-full max-w-none">
              <div className="sticky top-0 z-10 -mx-1 px-1 py-2 mb-3 bg-gray-950/90 backdrop-blur flex items-center justify-between border-b border-gray-800">
                <button type="button" onClick={() => { activeArticleId.current = null; setSelectedArticle(null); setPageContent(null); }} className="flex items-center gap-1.5 text-xs text-blue-300 hover:text-white"><ChevronLeft size={15}/>{isRu ? 'К ленте' : 'Back to feed'}</button>
                <a href={selectedArticle.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-300 hover:text-white">{isRu ? 'Оригинал' : 'Original'}<ExternalLink size={12}/></a>
              </div>
              <div className="text-[10px] uppercase tracking-wider text-blue-300 mb-2">#{selectedArticle.category} · {selectedArticle.sourceTitle} · {formatRelativeTime(selectedArticle.pubDate, isRu)}</div>
              <h2 className="text-xl sm:text-2xl font-bold leading-tight mb-4">{selectedArticle.title}</h2>
              {selectedArticle.imageUrl && <img src={selectedArticle.imageUrl} alt="" className="w-full max-h-80 object-cover rounded-xl mb-5 bg-gray-900" onError={(e) => { e.currentTarget.style.display = 'none'; }}/>}
              {articleLoading && <p className="mb-3 text-xs text-blue-300">{isRu ? 'Загружаю полную страницу публикации…' : 'Loading the full article page…'}</p>}
              {articleFetchFailed && <p className="mb-3 text-xs text-amber-300">{isRu ? 'Сайт не отдал полную статью через прокси. Показано доступное содержимое RSS.' : 'The publisher page could not be retrieved through the proxy. Showing the available RSS content.'}</p>}
              <div className="rss-article-content text-sm leading-7 text-gray-200 break-words" dangerouslySetInnerHTML={{ __html: safeContent }} />
              <p className="mt-6 pt-3 border-t border-gray-800 text-[11px] text-gray-500">{pageContent ? (isRu ? 'Загружено содержимое страницы издателя.' : 'Publisher page content loaded.') : (isRu ? 'Показано содержимое, предоставленное RSS-источником.' : 'Showing content supplied by the RSS feed.')}</p>
            </article>
          ) : (
            <>
              {filteredArticles.length === 0 && !loading && <div className="h-64 flex flex-col items-center justify-center text-gray-400 text-sm gap-3"><Globe size={34} className="opacity-40"/><p>{isRu ? 'Нет новостей в выбранной категории' : 'No articles in this category'}</p><button type="button" onClick={() => loadArticles(true)} className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs text-blue-300">{isRu ? 'Обновить каналы' : 'Refresh feeds'}</button></div>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredArticles.map((article) => (
                  <article key={article.id} className="bg-gray-900/80 hover:bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl overflow-hidden flex flex-col transition-colors">
                    {article.imageUrl && <img src={article.imageUrl} alt="" className="w-full h-36 object-cover bg-gray-800" onError={(e) => { e.currentTarget.style.display = 'none'; }}/>}
                    <div className="p-3 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-2 min-w-0"><span className="px-2 py-1 rounded-md text-[10px] font-semibold bg-blue-500/15 text-blue-300 shrink-0">#{article.category}</span><span className="text-[10px] text-gray-500 truncate">{article.sourceTitle}</span><span className="text-[10px] text-gray-500 ml-auto shrink-0">{formatRelativeTime(article.pubDate, isRu)}</span></div>
                      <h2 className="text-sm font-bold text-gray-100 leading-snug line-clamp-3">{article.title}</h2>
                      <p className="text-xs text-gray-400 line-clamp-3 mt-2 leading-relaxed">{article.description}</p>
                      <div className="mt-auto pt-3 flex items-center justify-between gap-2">
                        <span className="text-[10px] text-gray-600">{Number.isFinite(new Date(article.pubDate).getTime()) && new Date(article.pubDate).getTime() > 0 ? new Date(article.pubDate).toLocaleDateString(isRu ? 'ru-RU' : 'en-US') : (isRu ? 'Дата не указана' : 'Date unavailable')}</span>
                        <div className="flex items-center gap-3">
                          <button type="button" onClick={() => openArticle(article)} className="flex items-center gap-1 text-xs font-semibold text-blue-300 hover:text-blue-200"><BookOpen size={13}/>{isRu ? 'Подробнее' : 'Details'}</button>
                          <a href={article.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-white"><ExternalLink size={12}/>{isRu ? 'Оригинал' : 'Original'}</a>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </main>
      </div>

      {showSettings && <div className="absolute inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-xl max-h-[90%] flex flex-col shadow-2xl overflow-hidden">
          <header className="px-4 py-3 border-b border-gray-700 flex items-center justify-between"><div><h3 className="font-bold text-sm">{isRu ? 'Настройки источников RSS' : 'RSS Source Settings'}</h3><p className="text-[11px] text-gray-400">{isRu ? 'Категории задаются строкой #Категория перед URL' : 'Use #Category lines before feed URLs'}</p></div><button type="button" onClick={() => setShowSettings(false)} className="p-1 text-gray-400 hover:text-white"><X size={16}/></button></header>
          <div className="p-4 flex-1 min-h-0 flex flex-col"><label className="text-xs text-gray-300 font-medium mb-2">{isRu ? 'Список источников:' : 'Feed sources:'}</label><textarea value={settingsText} onChange={(e) => setSettingsText(e.target.value)} className="w-full flex-1 min-h-52 p-3 font-mono text-xs bg-gray-950 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:border-blue-500 resize-none leading-relaxed" placeholder="#Игры&#10;https://rss.stopgame.ru/rss_news.xml"/></div>
          <footer className="px-4 py-3 bg-gray-950 border-t border-gray-700 flex items-center justify-between"><button type="button" onClick={handleResetSettings} className="px-3 py-2 rounded text-xs text-gray-400 hover:text-white hover:bg-gray-800">{isRu ? 'Сбросить' : 'Reset'}</button><div className="flex gap-2"><button type="button" onClick={() => setShowSettings(false)} className="px-3 py-2 rounded text-xs bg-gray-800 text-gray-200">{isRu ? 'Отмена' : 'Cancel'}</button><button type="button" onClick={handleSaveSettings} className="px-3 py-2 rounded text-xs bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center gap-1.5"><Check size={13}/>{isRu ? 'Сохранить и обновить' : 'Save & Refresh'}</button></div></footer>
        </div>
      </div>}
    </div>
  );
}
