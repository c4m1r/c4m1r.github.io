export interface RssSource {
  id: string;
  url: string;
  category: string;
  title: string;
  enabled: boolean;
}

export interface RssArticle {
  id: string;
  title: string;
  description: string;
  link: string;
  pubDate: string; // ISO date string
  category: string;
  sourceTitle: string;
  sourceUrl: string;
  imageUrl?: string;
  /** Full HTML/text payload supplied by the feed, when available. */
  content?: string;
}

export const DEFAULT_RSS_SOURCES: Array<{ category: string; url: string; title: string }> = [
  // #Игры
  { category: 'Игры', url: 'https://rss.stopgame.ru/rss_news.xml', title: 'StopGame Новости' },
  { category: 'Игры', url: 'http://www.playground.ru/rss/news.xml', title: 'PlayGround Новости' },
  { category: 'Игры', url: 'http://www.playground.ru/rss/articles.xml', title: 'PlayGround Статьи' },
  { category: 'Игры', url: 'https://cubiq.ru/news/feed/', title: 'Cubiq Новости' },
  { category: 'Игры', url: 'https://www.goha.ru/rss/news', title: 'GoHa.Ru Новости' },
  { category: 'Игры', url: 'https://www.goha.ru/rss/articles', title: 'GoHa.Ru Статьи' },
  { category: 'Игры', url: 'https://3dnews.ru/games/rss/', title: '3DNews Игры' },

  // #Ивенты
  { category: 'Ивенты', url: 'https://www.goha.ru/rss/:Warframe', title: 'GoHa Warframe' },

  // #Железо
  { category: 'Железо', url: 'https://3dnews.ru/hardware-news/rss', title: '3DNews Железо' },
  { category: 'Железо', url: 'https://overclockers.ru/rss/lab.rss', title: 'Overclockers Лаборатория' },
  { category: 'Железо', url: 'https://www.goha.ru/rss/hardware', title: 'GoHa Железо' },

  // #Разработка
  { category: 'Разработка', url: 'https://3dnews.ru/software-news/rss/', title: '3DNews Софт и Разработка' },

  // #Аниме
  { category: 'Аниме', url: 'https://www.goha.ru/rss/anime', title: 'GoHa Аниме' },
  { category: 'Аниме', url: 'https://www.goha.ru/rss/:ГоХаниме', title: 'ГоХаниме' },

  // #Экономика
  { category: 'Экономика', url: 'https://www.goha.ru/rss/:NVIDIA', title: 'GoHa NVIDIA' },
  { category: 'Экономика', url: 'https://nationalbank.kz/rss_news_russian.xml', title: 'Нацбанк Казахстана' },
  { category: 'Экономика', url: 'https://sadaq.kz/ru/rss/category/novosti', title: 'Sadaq Новости' },
  { category: 'Экономика', url: 'https://sadaq.kz/ru/rss/category/ekonomika', title: 'Sadaq Экономика' },
  { category: 'Экономика', url: 'https://sadaq.kz/ru/rss/category/mir', title: 'Sadaq Мир' },
  { category: 'Экономика', url: 'https://ru.tradingview.com/feed/', title: 'TradingView Feed' },

  // #Конкуренты
  { category: 'Конкуренты', url: 'https://www.goha.ru/rss/:Epic%20Games', title: 'Epic Games' },
  { category: 'Конкуренты', url: 'https://www.goha.ru/rss/:Microsoft', title: 'Microsoft' },
  { category: 'Конкуренты', url: 'https://www.goha.ru/rss/industry', title: 'Индустрия игр' },
];

const DB_NAME = 'webos_rss_db_v1';
const STORE_ARTICLES = 'articles';
const STORE_SOURCES = 'sources';
const SOURCES_STORAGE_KEY = 'webos_rss_sources_config_v1';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_ARTICLES)) {
        const articleStore = db.createObjectStore(STORE_ARTICLES, { keyPath: 'id' });
        articleStore.createIndex('category', 'category', { unique: false });
        articleStore.createIndex('pubDate', 'pubDate', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_SOURCES)) {
        db.createObjectStore(STORE_SOURCES, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function getRssSources(): RssSource[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SOURCES_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as RssSource[];
    }
  } catch {
    // Return defaults
  }
  const initial = DEFAULT_RSS_SOURCES.map((s, idx) => ({
    id: `src_${idx}_${encodeURIComponent(s.url.slice(-15))}`,
    url: s.url,
    category: s.category,
    title: s.title,
    enabled: true,
  }));
  try {
    localStorage.setItem(SOURCES_STORAGE_KEY, JSON.stringify(initial));
  } catch {
    // Ignore
  }
  return initial;
}

export function saveRssSources(sources: RssSource[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SOURCES_STORAGE_KEY, JSON.stringify(sources));
    window.dispatchEvent(new CustomEvent('rss:sources-updated'));
  } catch {
    // Ignore
  }
}

export function parseRawTextSources(text: string): RssSource[] {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  let currentCategory = 'Игры';
  const result: RssSource[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('#')) {
      currentCategory = line.slice(1).trim() || 'Общее';
    } else if (line.startsWith('http://') || line.startsWith('https://')) {
      const url = line;
      let title = url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
      try {
        const u = new URL(url);
        title = u.hostname.replace('www.', '') + (u.pathname.length > 1 ? u.pathname : '');
      } catch {
        // keep fallback
      }
      result.push({
        id: `custom_${i}_${Date.now()}`,
        url,
        category: currentCategory,
        title,
        enabled: true,
      });
    }
  }
  return result;
}

export function formatSourcesToText(sources: RssSource[]): string {
  const byCategory = new Map<string, RssSource[]>();
  for (const s of sources) {
    const cat = s.category || 'Общее';
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(s);
  }

  const chunks: string[] = [];
  for (const [cat, list] of byCategory.entries()) {
    chunks.push(`#${cat}`);
    for (const item of list) {
      chunks.push(item.url);
    }
    chunks.push('');
  }
  return chunks.join('\n');
}

const UNKNOWN_PUBLICATION_DATE = new Date(0).toISOString();

function normalizePublicationDate(value: unknown): string {
  if (typeof value !== 'string' && typeof value !== 'number' && !(value instanceof Date)) {
    return UNKNOWN_PUBLICATION_DATE;
  }
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : UNKNOWN_PUBLICATION_DATE;
}

function extractImage(htmlString: string): string | undefined {
  if (!htmlString) return undefined;
  const match = htmlString.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1];
}

function cleanHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#8217;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
}

export async function fetchFeedArticles(source: RssSource): Promise<RssArticle[]> {
  const articles: RssArticle[] = [];

  // Method 1: Try rss2json API
  try {
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(source.url)}`;
    const res = await fetch(apiUrl);
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'ok' && Array.isArray(data.items)) {
        for (const item of data.items) {
          const rawContent = item.content || item.content_encoded || item['content:encoded'] || item.description || '';
          const rawDesc = item.description || rawContent;
          const img = item.thumbnail || item.enclosure?.link || extractImage(rawContent) || extractImage(rawDesc);
          const cleanDesc = cleanHtml(rawDesc).slice(0, 320);

          articles.push({
            id: item.guid || item.link || `${source.id}_${Math.random()}`,
            title: item.title || 'Новость',
            description: cleanDesc,
            link: item.link || source.url,
            pubDate: normalizePublicationDate(item.pubDate || item.isoDate || item.date_published),
            category: source.category,
            sourceTitle: source.title,
            sourceUrl: source.url,
            imageUrl: img,
            content: typeof rawContent === 'string' ? rawContent : '',
          });
        }
        if (articles.length > 0) return articles;
      }
    }
  } catch {
    // Continue to AllOrigins proxy
  }

  // Method 2: Try AllOrigins proxy
  try {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(source.url)}`;
    const res = await fetch(proxyUrl);
    if (res.ok) {
      const wrapper = await res.json();
      if (wrapper.contents) {
        const parser = new DOMParser();
        const xml = parser.parseFromString(wrapper.contents, 'text/xml');
        const items = xml.querySelectorAll('item, entry');

        items.forEach((elem) => {
          const title = elem.querySelector('title')?.textContent || 'Без названия';
          const link =
            elem.querySelector('link')?.getAttribute('href') ||
            elem.querySelector('link')?.textContent ||
            source.url;
          const encodedContent = elem.getElementsByTagNameNS('*', 'encoded')[0]?.textContent || '';
          const contentElement = elem.getElementsByTagNameNS('*', 'content')[0];
          const fullContent = encodedContent || contentElement?.textContent || '';
          const descRaw =
            elem.querySelector('description')?.textContent ||
            elem.querySelector('summary')?.textContent ||
            fullContent ||
            '';
          const pubDate =
            elem.querySelector('pubDate')?.textContent ||
            elem.querySelector('published')?.textContent ||
            elem.querySelector('dc\\:date, date')?.textContent ||
            elem.querySelector('updated')?.textContent ||
            '';

          const img =
            elem.querySelector('enclosure[type^="image"]')?.getAttribute('url') ||
            elem.querySelector('media\\:content, content')?.getAttribute('url') ||
            elem.querySelector('media\\:thumbnail, thumbnail')?.getAttribute('url') ||
            extractImage(descRaw);

          articles.push({
            id: link || `${source.id}_${Math.random()}`,
            title,
            description: cleanHtml(descRaw).slice(0, 320),
            link,
            pubDate: normalizePublicationDate(pubDate),
            category: source.category,
            sourceTitle: source.title,
            sourceUrl: source.url,
            imageUrl: img,
            content: fullContent || descRaw,
          });
        });
      }
    }
  } catch {
    // Feed fetch failed
  }

  return articles;
}

async function replaceSourceArticles(sourceUrl: string, articles: RssArticle[]): Promise<void> {
  if (!articles.length) return;
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_ARTICLES, 'readwrite');
    const store = tx.objectStore(STORE_ARTICLES);
    const request = store.openCursor();
    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor) return;
      if ((cursor.value as RssArticle).sourceUrl === sourceUrl) cursor.delete();
      cursor.continue();
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
  await saveArticlesToDatabase(articles);
}

export async function saveArticlesToDatabase(articles: RssArticle[]): Promise<void> {
  if (!articles.length) return;
  try {
    const db = await openDatabase();
    const tx = db.transaction(STORE_ARTICLES, 'readwrite');
    const store = tx.objectStore(STORE_ARTICLES);

    for (const art of articles) {
      store.put(art);
    }

    // Prune articles older than 14 days
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
    const index = store.index('pubDate');
    const range = IDBKeyRange.upperBound(fourteenDaysAgo);
    index.openCursor(range).onsuccess = (e) => {
      const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };
  } catch {
    // Storage unavailable
  }
}

export async function getCachedArticlesFromDatabase(category?: string): Promise<RssArticle[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_ARTICLES, 'readonly');
      const store = tx.objectStore(STORE_ARTICLES);
      const req = store.getAll();

      req.onsuccess = () => {
        let list: RssArticle[] = req.result || [];
        if (category && category !== 'Все' && category !== '#Все') {
          const target = category.replace('#', '');
          list = list.filter((item) => item.category === target);
        }
        list.sort((a, b) => normalizePublicationDate(b.pubDate).localeCompare(normalizePublicationDate(a.pubDate)));
        resolve(list);
      };
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function fetchAllRssFeeds(forceRefresh = false): Promise<RssArticle[]> {
  const sources = getRssSources().filter((s) => s.enabled);
  if (!sources.length) return [];

  if (!forceRefresh) {
    const cached = await getCachedArticlesFromDatabase();
    if (cached.length > 0) {
      return cached;
    }
  }

  // Refresh each source independently. Replace stale rows only when that source
  // returned usable articles; a failed feed must not erase its last good cache.
  const allArticles: RssArticle[] = [];
  const chunkSize = 5;
  for (let i = 0; i < sources.length; i += chunkSize) {
    const chunk = sources.slice(i, i + chunkSize);
    const results = await Promise.allSettled(chunk.map(async (source) => ({
      source,
      articles: await fetchFeedArticles(source),
    })));
    for (const result of results) {
      if (result.status !== 'fulfilled' || result.value.articles.length === 0) continue;
      allArticles.push(...result.value.articles);
      try {
        await replaceSourceArticles(result.value.source.url, result.value.articles);
      } catch {
        // Keep the previous cache if IndexedDB replacement fails.
      }
    }
  }

  const seen = new Set<string>();
  const uniqueArticles: RssArticle[] = [];
  for (const article of allArticles) {
    const key = article.link || article.id;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueArticles.push(article);
    }
  }
  uniqueArticles.sort((a, b) => normalizePublicationDate(b.pubDate).localeCompare(normalizePublicationDate(a.pubDate)));

  return uniqueArticles.length > 0 ? uniqueArticles : await getCachedArticlesFromDatabase();
}
