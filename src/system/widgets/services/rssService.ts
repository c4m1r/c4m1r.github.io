export interface RssSource {
  id: string;
  url: string;
  category: string;
  title: string;
  enabled: boolean;
}

interface Rss2JsonItem {
  guid?: string;
  title?: string;
  link?: string;
  content?: string;
  content_encoded?: string;
  'content:encoded'?: string;
  description?: string;
  thumbnail?: string;
  enclosure?: { link?: string };
  pubDate?: string | number;
  isoDate?: string | number;
  date_published?: string | number;
}

interface Rss2JsonPayload {
  status?: string;
  items?: Rss2JsonItem[];
}

interface AllOriginsPayload {
  contents?: string;
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
const RSS_LAST_REFRESH_KEY = 'webos_rss_last_refresh_v1';
const RSS_CACHE_TTL_MS = 15 * 60 * 1000;
const RSS_PARTIAL_RETRY_MS = 2 * 60 * 1000;
const RSS_REQUEST_TIMEOUT_MS = 8000;

async function fetchJsonWithTimeout<T>(url: string): Promise<{ response: Response; data: T | null }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), RSS_REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal });
    const data = response.ok ? await response.json() as T : null;
    return { response, data };
  } finally {
    clearTimeout(timeout);
  }
}

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
  const timestamp = typeof value === 'number'
    ? (Math.abs(value) < 1_000_000_000_000 ? value * 1000 : value)
    : new Date(value).getTime();
  return Number.isFinite(timestamp) && timestamp > 0
    ? new Date(timestamp).toISOString()
    : UNKNOWN_PUBLICATION_DATE;
}

function resolveFeedUrl(value: unknown, baseUrl: string): string | undefined {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  try {
    const resolved = new URL(value.trim(), baseUrl);
    return resolved.protocol === 'http:' || resolved.protocol === 'https:' ? resolved.href : undefined;
  } catch {
    return undefined;
  }
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

export async function fetchFeedArticles(source: RssSource): Promise<RssArticle[] | null> {
  const articles: RssArticle[] = [];

  // Method 1: Try rss2json API
  try {
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(source.url)}`;
    const { response: res, data } = await fetchJsonWithTimeout<Rss2JsonPayload>(apiUrl);
    if (res.ok && data) {
      if (data.status === 'ok' && Array.isArray(data.items)) {
        for (const item of data.items) {
          const rawContent = item.content || item.content_encoded || item['content:encoded'] || item.description || '';
          const rawDesc = item.description || rawContent;
          const img = item.thumbnail || item.enclosure?.link || extractImage(rawContent) || extractImage(rawDesc);
          const cleanDesc = cleanHtml(rawDesc).slice(0, 320);

          const itemLink = resolveFeedUrl(item.link, source.url) || source.url;
          const itemImage = resolveFeedUrl(img, source.url);
          articles.push({
            id: `${source.id}:${item.guid || itemLink || item.title || Math.random()}`,
            title: item.title || 'Новость',
            description: cleanDesc,
            link: itemLink,
            pubDate: normalizePublicationDate(item.pubDate || item.isoDate || item.date_published),
            category: source.category,
            sourceTitle: source.title,
            sourceUrl: source.url,
            imageUrl: itemImage,
            content: typeof rawContent === 'string' ? rawContent : '',
          });
        }
        return articles;
      }
    }
  } catch {
    // Continue to AllOrigins proxy
  }

  // Method 2: Try AllOrigins proxy
  try {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(source.url)}`;
    const { response: res, data: wrapper } = await fetchJsonWithTimeout<AllOriginsPayload>(proxyUrl);
    if (res.ok && wrapper) {
      if (typeof wrapper.contents === 'string' && wrapper.contents.trim()) {
        const parser = new DOMParser();
        const xml = parser.parseFromString(wrapper.contents, 'text/xml');
        if (xml.querySelector('parsererror')) throw new Error('Invalid RSS XML');
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
            elem.getElementsByTagName('pubDate')[0]?.textContent ||
            elem.getElementsByTagNameNS('*', 'published')[0]?.textContent ||
            elem.getElementsByTagNameNS('*', 'date')[0]?.textContent ||
            elem.getElementsByTagNameNS('*', 'updated')[0]?.textContent ||
            '';

          const img =
            elem.querySelector('enclosure[type^="image"]')?.getAttribute('url') ||
            elem.querySelector('media\\:content, content')?.getAttribute('url') ||
            elem.querySelector('media\\:thumbnail, thumbnail')?.getAttribute('url') ||
            extractImage(descRaw);

          const absoluteLink = resolveFeedUrl(link, source.url) || source.url;
          const absoluteImage = resolveFeedUrl(img, source.url);
          articles.push({
            id: `${source.id}:${absoluteLink || Math.random()}`,
            title,
            description: cleanHtml(descRaw).slice(0, 320),
            link: absoluteLink,
            pubDate: normalizePublicationDate(pubDate),
            category: source.category,
            sourceTitle: source.title,
            sourceUrl: source.url,
            imageUrl: absoluteImage,
            content: fullContent || descRaw,
          });
        });
      }
    }
  } catch {
    // Feed fetch failed
  }

  // null means both transport/parser paths failed; [] is a valid empty feed.
  return null;
}

async function replaceSourceArticles(sourceUrl: string, articles: RssArticle[]): Promise<void> {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_ARTICLES, 'readwrite');
    const store = tx.objectStore(STORE_ARTICLES);
    const request = store.openCursor();

    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor) {
        if ((cursor.value as RssArticle).sourceUrl === sourceUrl) cursor.delete();
        cursor.continue();
        return;
      }

      // Delete + insert happen in one IndexedDB transaction. If any write fails,
      // the browser rolls the transaction back and the previous cache survives.
      for (const article of articles) store.put(article);

      const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
      store.index('pubDate').openCursor(IDBKeyRange.upperBound(cutoff)).onsuccess = (event) => {
        const oldRecord = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (oldRecord) {
          if ((oldRecord.value as RssArticle).pubDate !== UNKNOWN_PUBLICATION_DATE) oldRecord.delete();
          oldRecord.continue();
        }
      };
    };

    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error ?? new Error('RSS cache transaction failed')); };
    tx.onabort = () => { db.close(); reject(tx.error ?? new Error('RSS cache transaction aborted')); };
  });
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
        if ((cursor.value as RssArticle).pubDate !== UNKNOWN_PUBLICATION_DATE) cursor.delete();
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
    return await new Promise((resolve) => {
      const tx = db.transaction(STORE_ARTICLES, 'readonly');
      const req = tx.objectStore(STORE_ARTICLES).getAll();
      req.onsuccess = () => {
        const enabledUrls = new Set(getRssSources().filter((source) => source.enabled).map((source) => source.url));
        let list: RssArticle[] = (req.result || []).filter((item: RssArticle) => enabledUrls.has(item.sourceUrl));
        if (category && category !== 'Все' && category !== '#Все') {
          const target = category.replace(/^#/, '');
          list = list.filter((item) => item.category === target);
        }
        list.sort((a, b) => {
          const aTime = new Date(a.pubDate).getTime();
          const bTime = new Date(b.pubDate).getTime();
          const safeA = Number.isFinite(aTime) && aTime > 0 ? aTime : 0;
          const safeB = Number.isFinite(bTime) && bTime > 0 ? bTime : 0;
          return safeB - safeA;
        });
        resolve(list);
      };
      req.onerror = () => resolve([]);
      tx.oncomplete = () => db.close();
      tx.onerror = () => { db.close(); resolve([]); };
    });
  } catch {
    return [];
  }
}

export async function fetchAllRssFeeds(forceRefresh = false): Promise<RssArticle[]> {
  const sources = getRssSources().filter((source) => source.enabled);
  if (!sources.length) return [];

  if (!forceRefresh) {
    const cached = await getCachedArticlesFromDatabase();
    const lastRefresh = Number(typeof localStorage !== 'undefined' ? localStorage.getItem(RSS_LAST_REFRESH_KEY) : 0);
    const cacheAge = Date.now() - lastRefresh;
    if (cached.length > 0 && Number.isFinite(lastRefresh) && lastRefresh > 0 && cacheAge >= 0 && cacheAge < RSS_CACHE_TTL_MS) {
      return cached;
    }
  }

  let succeeded = 0;
  const chunkSize = 5;
  for (let i = 0; i < sources.length; i += chunkSize) {
    const chunk = sources.slice(i, i + chunkSize);
    const results = await Promise.allSettled(chunk.map(async (source) => ({
      source,
      articles: await fetchFeedArticles(source),
    })));

    for (const result of results) {
      if (result.status !== 'fulfilled' || result.value.articles === null) continue;
      try {
        await replaceSourceArticles(result.value.source.url, result.value.articles);
        succeeded += 1;
      } catch {
        // Preserve the last good cache if IndexedDB replacement fails.
      }
    }
  }

  if (succeeded > 0 && typeof localStorage !== 'undefined') {
    try {
      // Partial failures retry soon; a complete refresh uses the normal cache TTL.
      const partial = succeeded < sources.length;
      localStorage.setItem(RSS_LAST_REFRESH_KEY, String(Date.now() - (partial ? RSS_CACHE_TTL_MS - RSS_PARTIAL_RETRY_MS : 0)));
    } catch { /* storage can be unavailable */ }
  }

  return getCachedArticlesFromDatabase();
}

