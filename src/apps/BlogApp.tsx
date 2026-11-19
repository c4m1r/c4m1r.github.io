import { useEffect, useMemo, useState } from 'react';
import { BookOpen, ChevronDown, ChevronRight, FileText, Home, Search } from 'lucide-react';
import { loadAllContent } from '../domain/content/contentRegistry';
import { type ContentItem } from '../domain/content/types';
import { useWiki } from '../domain/wiki/useWiki';
import type { WikiCategory } from '../domain/wiki/wiki.types';
import { markdownToHtml } from '../domain/content/markdown';
import { useApp } from '../contexts/useApp';

type HelpDocument = {
  id: string;
  title: string;
  content: string;
  category: string;
  source: 'blog' | 'wiki' | 'category';
  date?: string;
};

function collectWikiDocuments(categories: WikiCategory[]): HelpDocument[] {
  return categories.flatMap((category) => {
    const categoryDocument: HelpDocument[] = category.index ? [{
      id: category.index.id,
      title: category.index.title,
      content: category.index.content,
      category: category.pathSegments.join(' / '),
      source: 'category',
      date: category.index.updatedAt,
    }] : [];
    const directArticles = category.articles.map((article) => ({
      id: article.id,
      title: article.title,
      content: article.content,
      category: article.categoryPath || 'Wiki',
      source: 'wiki' as const,
      date: article.updatedAt || article.date,
    }));
    return [...categoryDocument, ...directArticles, ...collectWikiDocuments(category.children)];
  });
}

function WikiCategoryTree({
  categories,
  selectedId,
  onSelect,
}: {
  categories: WikiCategory[];
  selectedId: string | null;
  onSelect: (document: HelpDocument) => void;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  return (
    <div className="space-y-0.5">
      {categories.map((category) => {
        const categoryDoc: HelpDocument | null = category.index ? {
          id: category.index.id,
          title: category.index.title,
          content: category.index.content,
          category: category.pathSegments.join(' / '),
          source: 'category',
          date: category.index.updatedAt,
        } : null;
        const isExpanded = expanded[category.id] ?? true;
        return (
          <div key={category.id}>
            <div className="flex items-center min-w-0">
              <button
                type="button"
                className="w-5 h-6 shrink-0 flex items-center justify-center text-current/65"
                aria-label={isExpanded ? 'Collapse category' : 'Expand category'}
                onClick={() => setExpanded((current) => ({ ...current, [category.id]: !isExpanded }))}
              >
                {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
              </button>
              <button
                type="button"
                className={`min-w-0 flex-1 text-left truncate rounded px-1.5 py-1 text-[12px] font-semibold hover:bg-black/5 ${categoryDoc?.id === selectedId ? 'is-selected bg-blue-100 text-blue-900' : ''}`}
                onClick={() => categoryDoc && onSelect(categoryDoc)}
                title={category.name}
              >
                {category.name}
              </button>
            </div>
            {isExpanded && (
              <div className="ml-4 border-l border-current/10 pl-1">
                {category.articles.map((article) => (
                  <button
                    key={article.id}
                    type="button"
                    className={`w-full flex items-center gap-1.5 rounded px-1.5 py-1 text-left text-[12px] hover:bg-black/5 ${selectedId === article.id ? 'is-selected bg-blue-100 text-blue-900' : ''}`}
                    onClick={() => onSelect({
                      id: article.id,
                      title: article.title,
                      content: article.content,
                      category: article.categoryPath || 'Wiki',
                      source: 'wiki',
                      date: article.updatedAt || article.date,
                    })}
                  >
                    <FileText size={12} className="shrink-0 opacity-60" />
                    <span className="truncate">{article.title}</span>
                  </button>
                ))}
                <WikiCategoryTree categories={category.children} selectedId={selectedId} onSelect={onSelect} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function BlogApp() {
  const { language, theme } = useApp();
  const { categories, loading: wikiLoading } = useWiki();
  const [posts, setPosts] = useState<ContentItem[]>([]);
  const [sitePages, setSitePages] = useState<ContentItem[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [selected, setSelected] = useState<HelpDocument | null>(null);
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'contents' | 'search'>('contents');
  const isRu = language === 'ru';
  const isWindows = theme.startsWith('win');

  useEffect(() => {
    let active = true;
    setLoadingPosts(true);
    loadAllContent(language).then((items) => {
      if (!active) return;
      setPosts(items.filter((item) => item.kind === 'articles'));
      setSitePages(items.filter((item) => ['news', 'projects', 'about', 'apps'].includes(item.kind ?? '')));
      setLoadingPosts(false);
    });
    return () => { active = false; };
  }, [language]);

  const blogDocuments = useMemo<HelpDocument[]>(() => posts.map((post) => ({
    id: `blog:${post.id}`,
    title: post.title,
    content: post.content,
    category: post.category || (isRu ? 'Общее' : 'General'),
    source: 'blog',
    date: post.updatedAt || post.date,
  })), [isRu, posts]);

  const siteDocuments = useMemo<HelpDocument[]>(() => sitePages.map((item) => {
    const sourceLabel = item.kind === 'apps'
      ? (isRu ? 'Приложения' : 'Apps')
      : item.kind === 'projects'
        ? (isRu ? 'Проекты' : 'Projects')
        : item.kind === 'news'
          ? (isRu ? 'Новости' : 'News')
          : (isRu ? 'О сайте' : 'About');
    return {
      id: `site:${item.kind ?? 'page'}:${item.id}`,
      title: item.title,
      content: item.content,
      category: `${sourceLabel} / ${item.category || (isRu ? 'Общее' : 'General')}`,
      source: 'site',
      date: item.updatedAt || item.date,
    };
  }), [isRu, sitePages]);
  const wikiDocuments = useMemo(() => collectWikiDocuments(categories), [categories]);
  const allDocuments = useMemo(() => [...wikiDocuments, ...blogDocuments, ...siteDocuments], [blogDocuments, siteDocuments, wikiDocuments]);
  const filteredDocuments = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase(language);
    if (!needle) return allDocuments;
    return allDocuments.filter((document) =>
      `${document.title} ${document.category} ${document.content}`.toLocaleLowerCase(language).includes(needle)
    );
  }, [allDocuments, language, query]);

  const blogGroups = useMemo(() => {
    const groups = new Map<string, HelpDocument[]>();
    blogDocuments.forEach((document) => {
      const key = document.category;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(document);
    });
    return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [blogDocuments]);

  const siteGroups = useMemo(() => {
    const groups = new Map<string, HelpDocument[]>();
    siteDocuments.forEach((document) => {
      if (!groups.has(document.category)) groups.set(document.category, []);
      groups.get(document.category)!.push(document);
    });
    return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [siteDocuments]);

  const selectDocument = (document: HelpDocument) => {
    setSelected(document);
    setActiveTab('contents');
  };

  const heading = isWindows ? (isRu ? 'Блог.chm — Справка и статьи' : 'Blog.chm — Help and Articles') : (isRu ? 'Блог и документация' : 'Blog & Documentation');

  if (wikiLoading || loadingPosts) {
    return <div className="flex h-full items-center justify-center bg-[#f4f4f4] text-sm text-gray-600">{isRu ? 'Загрузка справки и статей…' : 'Loading help and articles…'}</div>;
  }

  return (
    <div className={`chm-help-viewer flex h-full min-h-0 flex-col overflow-hidden ${isWindows ? 'chm-help-viewer--windows' : ''}`}>
      <header className="chm-help-viewer__toolbar flex shrink-0 items-center gap-2 border-b px-3 py-2">
        <div className="flex items-center gap-2 min-w-0 mr-auto">
          <BookOpen size={18} />
          <strong className="truncate text-sm">{heading}</strong>
        </div>
        <button type="button" className="chm-help-viewer__tool" onClick={() => setSelected(null)} title={isRu ? 'Домой' : 'Home'}><Home size={15} /></button>
        <button type="button" className="chm-help-viewer__tool" onClick={() => setActiveTab('contents')} title={isRu ? 'Содержание' : 'Contents'}>{isRu ? 'Содержание' : 'Contents'}</button>
        <label className="chm-help-viewer__search flex items-center gap-1.5">
          <Search size={14} />
          <input value={query} onChange={(event) => { setQuery(event.currentTarget.value); setActiveTab('search'); }} placeholder={isRu ? 'Найти в справке…' : 'Search help…'} />
        </label>
      </header>

      <div className="flex flex-1 min-h-0">
        <aside className="chm-help-viewer__sidebar w-[290px] min-w-[230px] shrink-0 overflow-y-auto border-r">
          <div className="flex border-b">
            <button type="button" className={`flex-1 px-3 py-2 text-xs font-semibold ${activeTab === 'contents' ? 'is-active' : ''}`} onClick={() => setActiveTab('contents')}>{isRu ? 'Содержание' : 'Contents'}</button>
            <button type="button" className={`flex-1 px-3 py-2 text-xs font-semibold ${activeTab === 'search' ? 'is-active' : ''}`} onClick={() => setActiveTab('search')}>{isRu ? 'Поиск' : 'Search'}</button>
          </div>
          {activeTab === 'search' ? (
            <div className="p-2 space-y-1">
              <div className="px-2 py-1 text-[11px] opacity-60">{filteredDocuments.length} {isRu ? 'результатов' : 'results'}</div>
              {filteredDocuments.map((document) => (
                <button key={document.id} type="button" onClick={() => selectDocument(document)} className={`w-full rounded px-2 py-2 text-left hover:bg-black/5 ${selected?.id === document.id ? 'is-selected' : ''}`}>
                  <div className="truncate text-xs font-semibold">{document.title}</div>
                  <div className="truncate text-[10px] opacity-60">{document.category}</div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-2">
              <div className="mb-2 flex items-center gap-1 px-1 text-xs font-bold"><BookOpen size={13} /> {isRu ? 'База знаний' : 'Knowledge Base'}</div>
              <WikiCategoryTree categories={categories} selectedId={selected?.id ?? null} onSelect={selectDocument} />
              <div className="mt-4 border-t pt-3">
                <div className="mb-2 px-1 text-xs font-bold">{isRu ? 'Блог' : 'Blog'}</div>
                {blogGroups.map(([category, documents]) => (
                  <details key={category} open>
                    <summary className="cursor-pointer rounded px-2 py-1 text-xs font-semibold hover:bg-black/5">{category}</summary>
                    <div className="ml-3 border-l border-current/10 pl-1">
                      {documents.map((document) => (
                        <button key={document.id} type="button" onClick={() => selectDocument(document)} className={`w-full rounded px-2 py-1.5 text-left text-xs hover:bg-black/5 ${selected?.id === document.id ? 'is-selected' : ''}`}>
                          <span className="block truncate">{document.title}</span>
                        </button>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
              {siteGroups.length > 0 && (
                <div className="mt-4 border-t pt-3">
                  <div className="mb-2 px-1 text-xs font-bold">{isRu ? 'Страницы сайта' : 'Site Pages'}</div>
                  {siteGroups.map(([category, documents]) => (
                    <details key={category}>
                      <summary className="cursor-pointer rounded px-2 py-1 text-xs font-semibold hover:bg-black/5">{category}</summary>
                      <div className="ml-3 border-l border-current/10 pl-1">
                        {documents.map((document) => (
                          <button key={document.id} type="button" onClick={() => selectDocument(document)} className={`w-full rounded px-2 py-1.5 text-left text-xs hover:bg-black/5 ${selected?.id === document.id ? 'is-selected' : ''}`}>
                            <span className="block truncate">{document.title}</span>
                          </button>
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
              )}
            </div>
          )}
        </aside>

        <main className="chm-help-viewer__reader min-w-0 flex-1 overflow-y-auto">
          {selected ? (
            <article className="mx-auto max-w-4xl p-6 lg:p-9">
              <div className="mb-2 text-[11px] opacity-55">{selected.category} {selected.date ? `· ${new Date(selected.date).toLocaleDateString(language)}` : ''}</div>
              <h1 className="mb-5 border-b pb-3 text-2xl font-semibold">{selected.title}</h1>
              <div className="chm-help-viewer__article prose max-w-none" dangerouslySetInnerHTML={{ __html: markdownToHtml(selected.content) }} />
            </article>
          ) : (
            <div className="mx-auto max-w-4xl p-6 lg:p-10">
              <h1 className="mb-2 text-2xl font-semibold">{isRu ? 'Справка и документация' : 'Help and Documentation'}</h1>
              <p className="mb-6 text-sm opacity-70">{isRu ? 'Выберите категорию или статью слева. Здесь собраны страницы Wiki и публикации блога из Markdown-файлов сайта.' : 'Choose a category or article on the left. This library includes the site Wiki pages and blog posts sourced from Markdown files.'}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded border p-4"><div className="text-2xl font-semibold">{wikiDocuments.length}</div><div className="text-xs opacity-65">{isRu ? 'страниц базы знаний' : 'knowledge-base pages'}</div></div>
                <div className="rounded border p-4"><div className="text-2xl font-semibold">{blogDocuments.length + siteDocuments.length}</div><div className="text-xs opacity-65">{isRu ? 'статей и страниц сайта' : 'blog and site pages'}</div></div>
              </div>
            </div>
          )}
        </main>
      </div>
      <footer className="chm-help-viewer__statusbar flex shrink-0 items-center justify-between border-t px-3 py-1 text-[10px]">
        <span>{selected?.title ?? heading}</span>
        <span>{allDocuments.length} {isRu ? 'документов' : 'documents'}</span>
      </footer>
    </div>
  );
}
