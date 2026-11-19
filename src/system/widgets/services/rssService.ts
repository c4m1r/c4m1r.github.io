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
  guid?: string;
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
const RSS_REFRESH_META_KEY = 'webos_rss_refresh_meta_v1';

export interface RssRefreshMetadata {
  status: 'never' | 'refreshing' | 'success' | 'partial' | 'failed' | 'disabled';
  lastAttemptAt: number;
  lastSuccessAt: number;
  succeededSources: number;
  failedSources: number;
}

const EMPTY_RSS_REFRESH_META: RssRefreshMetadata = {
  status: 'never',
  lastAttemptAt: 0,
  lastSuccessAt: 0,
  succeededSources: 0,
  failedSources: 0,
};

export function getRssRefreshMetadata(): RssRefreshMetadata {
  if (typeof localStorage === 'undefined') return EMPTY_RSS_REFRESH_META;
  try {
    const parsed = JSON.parse(localStorage.getItem(RSS_REFRESH_META_KEY) || 'null') as Partial<RssRefreshMetadata> | null;
    if (!parsed) return EMPTY_RSS_REFRESH_META;
    const allowed = ['never', 'refreshing', 'success', 'partial', 'failed', 'disabled'] as const;
    return {
      status: allowed.includes(parsed.status as typeof allowed[number]) ? parsed.status as RssRefreshMetadata['status'] : 'never',
      lastAttemptAt: Number.isFinite(parsed.lastAttemptAt) ? Number(parsed.lastAttemptAt) : 0,
      lastSuccessAt: Number.isFinite(parsed.lastSuccessAt) ? Number(parsed.lastSuccessAt) : 0,
      succeededSources: Number.isFinite(parsed.succeededSources) ? Number(parsed.succeededSources) : 0,
      failedSources: Number.isFinite(parsed.failedSources) ? Number(parsed.failedSources) : 0,
    };
  } catch {
    return EMPTY_RSS_REFRESH_META;
  }
}

function saveRssRefreshMetadata(metadata: RssRefreshMetadata): void {
  if (typeof localStorage === 'undefined') return;
  try { localStorage.setItem(RSS_REFRESH_META_KEY, JSON.stringify(metadata)); } catch { /* storage unavailable */ }
}
const RSS_CACHE_TTL_MS = 15 * 60 * 1000;
const RSS_PARTIAL_RETRY_MS = 2 * 60 * 1000;
const RSS_REQUEST_TIMEOUT_MS = 7000;

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
  // null = transport/parser failure; [] = a valid feed with no current entries.
  try {
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(source.url)}`;
    const { response, data } = await fetchJsonWithTimeout<Rss2JsonPayload>(apiUrl);
    if (response.ok && data?.status === 'ok' && Array.isArray(data.items)) {
      return data.items.map((item) => {
        const rawContent = item.content || item.content_encoded || item['content:encoded'] || item.description || '';
        const rawDescription = item.description || rawContent;
        const image = item.thumbnail || item.enclosure?.link || extractImage(rawContent) || extractImage(rawDescription);
        const link = resolveFeedUrl(item.link, source.url) || source.url;
        return {
          id: `${source.id}:${link}`,
          guid: item.guid?.trim() || undefined,
          title: item.title || 'Новость',
          description: cleanHtml(rawDescription).slice(0, 320),
          link,
          pubDate: normalizePublicationDate(item.pubDate || item.isoDate || item.date_published),
          category: source.category,
          sourceTitle: source.title,
          sourceUrl: source.url,
          imageUrl: resolveFeedUrl(image, source.url),
          content: typeof rawContent === 'string' ? rawContent : '',
        };
      });
    }
  } catch {
    // Continue to the XML proxy.
  }

  try {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(source.url)}`;
    const { response, data } = await fetchJsonWithTimeout<AllOriginsPayload>(proxyUrl);
    if (!response.ok || typeof data?.contents !== 'string' || !data.contents.trim()) return null;

    const xml = new DOMParser().parseFromString(data.contents, 'text/xml');
    if (xml.querySelector('parsererror')) return null;
    const rootName = xml.documentElement?.localName?.toLowerCase() ?? '';
    const isFeedDocument = rootName === 'rss' || rootName === 'feed' || rootName === 'rdf' || Boolean(xml.querySelector('channel'));
    if (!isFeedDocument) return null;

    const items = Array.from(xml.querySelectorAll('item, entry'));
    return items.map((element) => {
      const title = element.querySelector('title')?.textContent?.trim() || 'Без названия';
      const rawLink =
        element.querySelector('link[rel="alternate"]')?.getAttribute('href') ||
        element.querySelector('link')?.getAttribute('href') ||
        element.querySelector('link')?.textContent ||
        source.url;
      const guid = element.querySelector('guid')?.textContent?.trim() ||
        element.querySelector('id')?.textContent?.trim() || undefined;
      const encodedContent = element.getElementsByTagNameNS('*', 'encoded')[0]?.textContent || '';
      const contentElement = element.getElementsByTagNameNS('*', 'content')[0];
      const fullContent = encodedContent || contentElement?.textContent || '';
      const rawDescription =
        element.querySelector('description')?.textContent ||
        element.querySelector('summary')?.textContent ||
        fullContent ||
        '';
      const publicationDate =
        element.getElementsByTagName('pubDate')[0]?.textContent ||
        element.getElementsByTagNameNS('*', 'published')[0]?.textContent ||
        element.getElementsByTagNameNS('*', 'date')[0]?.textContent ||
        element.getElementsByTagNameNS('*', 'updated')[0]?.textContent ||
        '';
      const image =
        element.querySelector('enclosure[type^="image"]')?.getAttribute('url') ||
        element.querySelector('media\\:content, content')?.getAttribute('url') ||
        element.querySelector('media\\:thumbnail, thumbnail')?.getAttribute('url') ||
        extractImage(rawDescription);
      const link = resolveFeedUrl(rawLink, source.url) || source.url;
      return {
        id: `${source.id}:${link}`,
        guid,
        title,
        description: cleanHtml(rawDescription).slice(0, 320),
        link,
        pubDate: normalizePublicationDate(publicationDate),
        category: source.category,
        sourceTitle: source.title,
        sourceUrl: source.url,
        imageUrl: resolveFeedUrl(image, source.url),
        content: fullContent || rawDescription,
      };
    });
  } catch {
    return null;
  }
}

function canonicalArticleLink(value: string): string {
  try { const url = new URL(value); url.hash = ''; for (const key of Array.from(url.searchParams.keys())) { if (/^(utm_.+|fbclid|gclid|yclid|_ga)$/i.test(key)) url.searchParams.delete(key); } return url.href; }
  catch { return value.trim(); }
}
function articleIdentity(article: RssArticle): string {
  const link = canonicalArticleLink(article.link);
  if (link !== canonicalArticleLink(article.sourceUrl)) return `url:${link}`;
  const guid = article.guid?.trim();
  if (guid) {
    try {
      const parsedGuid = new URL(guid);
      if (parsedGuid.protocol === 'http:' || parsedGuid.protocol === 'https:') return `guid:${canonicalArticleLink(parsedGuid.href)}`;
    } catch {
      // Opaque RSS GUIDs are identifiers, not relative URLs.
    }
    return `guid:${guid.toLocaleLowerCase()}`;
  }
  return `source:${canonicalArticleLink(article.sourceUrl)}|${article.title.trim().toLocaleLowerCase()}`;
}
function newerArticle(a: RssArticle, b: RssArticle): RssArticle {
  const aTime = new Date(a.pubDate).getTime(), bTime = new Date(b.pubDate).getTime();
  return (Number.isFinite(aTime) ? aTime : 0) >= (Number.isFinite(bTime) ? bTime : 0) ? a : b;
}
/** Merge current feed entries into historical cache; never erase stories omitted from a short feed window. */
export async function saveArticlesToDatabase(articles: RssArticle[]): Promise<void> {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_ARTICLES, 'readwrite'), store = tx.objectStore(STORE_ARTICLES), existingRequest = store.getAll();
    existingRequest.onsuccess = () => {
      const byIdentity = new Map<string, RssArticle>();
      for (const existing of (existingRequest.result || []) as RssArticle[]) {
        const identity = articleIdentity(existing), previous = byIdentity.get(identity);
        if (!previous) byIdentity.set(identity, existing);
        else { const keep = newerArticle(previous, existing); store.delete((keep === previous ? existing : previous).id); byIdentity.set(identity, keep); }
      }
      for (const article of articles) {
        const identity = articleIdentity(article), previous = byIdentity.get(identity);
        if (previous && previous.id !== article.id) store.delete(previous.id);
        const newest = previous ? newerArticle(previous, article) : article;
        const merged = { ...newest, id: article.id, title: article.title || newest.title, description: article.description || newest.description, content: article.content || newest.content, imageUrl: article.imageUrl || newest.imageUrl };
        store.put(merged); byIdentity.set(identity, merged);
      }
      const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
      store.index('pubDate').openCursor(IDBKeyRange.upperBound(cutoff)).onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) { if ((cursor.value as RssArticle).pubDate !== UNKNOWN_PUBLICATION_DATE) cursor.delete(); cursor.continue(); }
      };
    };
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error ?? new Error('RSS cache merge failed')); };
    tx.onabort = () => { db.close(); reject(tx.error ?? new Error('RSS cache merge aborted')); };
  });
}
export async function getCachedArticlesFromDatabase(category?: string): Promise<RssArticle[]> {
  try {
    const db = await openDatabase();
    return await new Promise((resolve) => {
      const tx = db.transaction(STORE_ARTICLES, 'readonly');
      const req = tx.objectStore(STORE_ARTICLES).getAll();
      req.onsuccess = () => {
        const enabledUrls = new Set(getRssSources().filter((source) => source.enabled).map((source) => source.url));
        const rawList: RssArticle[] = (req.result || []).filter((item: RssArticle) => enabledUrls.has(item.sourceUrl));
        const unique = new Map<string, RssArticle>();
        for (const item of rawList) {
          const identity = articleIdentity(item), previous = unique.get(identity);
          unique.set(identity, previous ? newerArticle(previous, item) : item);
        }
        let list: RssArticle[] = Array.from(unique.values());
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
  if (!sources.length) {
    const previous = getRssRefreshMetadata();
    saveRssRefreshMetadata({ ...previous, status: 'disabled', lastAttemptAt: Date.now(), succeededSources: 0, failedSources: 0 });
    return [];
  }

  if (!forceRefresh) {
    const cached = await getCachedArticlesFromDatabase();
    const lastRefresh = Number(typeof localStorage !== 'undefined' ? localStorage.getItem(RSS_LAST_REFRESH_KEY) : 0);
    const cacheAge = Date.now() - lastRefresh;
    if (cached.length > 0 && Number.isFinite(lastRefresh) && lastRefresh > 0 && cacheAge >= 0 && cacheAge < RSS_CACHE_TTL_MS) {
      return cached;
    }
  }

  const previousMeta = getRssRefreshMetadata();
  saveRssRefreshMetadata({
    ...previousMeta,
    status: 'refreshing',
    lastAttemptAt: Date.now(),
    succeededSources: 0,
    failedSources: 0,
  });

  let succeeded = 0;
  const chunkSize = 10;
  for (let i = 0; i < sources.length; i += chunkSize) {
    const chunk = sources.slice(i, i + chunkSize);
    const results = await Promise.allSettled(chunk.map(async (source) => ({
      source,
      articles: await fetchFeedArticles(source),
    })));

    for (const result of results) {
      if (result.status !== 'fulfilled' || result.value.articles === null) continue;
      try {
        await saveArticlesToDatabase(result.value.articles);
        succeeded += 1;
      } catch {
        // Preserve the last good cache if IndexedDB replacement fails.
      }
    }
  }

  const failed = sources.length - succeeded;
  const status: RssRefreshMetadata['status'] = succeeded === 0
    ? 'failed'
    : succeeded < sources.length
      ? 'partial'
      : 'success';
  const lastSuccessAt = succeeded > 0 ? Date.now() : previousMeta.lastSuccessAt;
  saveRssRefreshMetadata({
    status,
    lastAttemptAt: Date.now(),
    lastSuccessAt,
    succeededSources: succeeded,
    failedSources: failed,
  });

  if (typeof localStorage !== 'undefined') {
    try {
      // Partial or total failures retry soon; only a complete refresh gets the full TTL.
      const needsRetry = succeeded < sources.length;
      localStorage.setItem(RSS_LAST_REFRESH_KEY, String(Date.now() - (needsRetry ? RSS_CACHE_TTL_MS - RSS_PARTIAL_RETRY_MS : 0)));
    } catch { /* storage can be unavailable */ }
  }

  return getCachedArticlesFromDatabase();
}
