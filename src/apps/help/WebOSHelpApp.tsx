import { useMemo, useState } from 'react';
import { BookOpen, ChevronRight, Monitor } from 'lucide-react';
import { useApp } from '../../contexts/useApp';
import { markdownToHtml } from '../../domain/content/markdown';
import { useWiki } from '../../domain/wiki/useWiki';
import type { WikiArticle, WikiCategory } from '../../domain/wiki/wiki.types';

function collectArticles(category: WikiCategory): WikiArticle[] {
  return [
    ...category.articles,
    ...category.children.flatMap((child) => collectArticles(child)),
  ];
}

function findCategory(categories: WikiCategory[], id: string): WikiCategory | null {
  for (const category of categories) {
    if (category.id === id) return category;
    const nested = findCategory(category.children, id);
    if (nested) return nested;
  }
  return null;
}

export function WebOSHelpApp() {
  const { language } = useApp();
  const { categories, loading } = useWiki();
  const isRu = language === 'ru';
  const rootCategory = useMemo(
    () => findCategory(categories, 'OperatingSystems'),
    [categories],
  );
  const articles = useMemo(
    () => rootCategory ? collectArticles(rootCategory) : [],
    [rootCategory],
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedArticle = articles.find((article) => article.id === selectedId) ?? null;

  if (loading) {
    return (
      <div className="webos-help-app os-window-body flex h-full items-center justify-center">
        {isRu ? 'Загрузка справки...' : 'Loading Help...'}
      </div>
    );
  }

  return (
    <div className="webos-help-app os-window-body flex h-full min-h-0 bg-white text-black">
      <aside className="webos-help-app__sidebar os-sidebar w-[230px] min-w-[190px] overflow-y-auto border-r border-black/15">
        <div className="webos-help-app__heading p-4 border-b border-black/10">
          <div className="flex items-center gap-2 font-semibold">
            <BookOpen size={18} />
            <span>{isRu ? 'Справка о WebOS' : 'WebOS Help'}</span>
          </div>
          <div className="mt-1 text-xs opacity-65">
            {isRu ? 'Операционные системы и редакции' : 'Operating systems and editions'}
          </div>
        </div>

        <button
          type="button"
          className={`webos-help-app__nav w-full px-3 py-2 text-left flex items-center gap-2 ${selectedArticle ? '' : 'is-selected'}`}
          onClick={() => setSelectedId(null)}
        >
          <Monitor size={15} />
          <span>{isRu ? 'Обзор систем' : 'Systems overview'}</span>
        </button>

        {articles.map((article) => (
          <button
            key={article.id}
            type="button"
            className={`webos-help-app__nav w-full px-3 py-2 text-left flex items-center gap-2 ${selectedArticle?.id === article.id ? 'is-selected' : ''}`}
            onClick={() => setSelectedId(article.id)}
          >
            <ChevronRight size={13} className="shrink-0 opacity-65" />
            <span className="truncate">{article.title}</span>
          </button>
        ))}
      </aside>

      <main className="webos-help-app__reader flex-1 min-w-0 overflow-y-auto p-6">
        {selectedArticle ? (
          <>
            <h1 className="text-2xl font-semibold mb-4">{selectedArticle.title}</h1>
            <article
              className="prose max-w-none webos-help-app__content"
              dangerouslySetInnerHTML={{ __html: markdownToHtml(selectedArticle.content) }}
            />
          </>
        ) : rootCategory ? (
          <>
            <h1 className="text-2xl font-semibold mb-3">
              {rootCategory.index?.title ?? (isRu ? 'Операционные системы' : 'Operating Systems')}
            </h1>
            {rootCategory.index?.content && (
              <article
                className="prose max-w-none webos-help-app__content"
                dangerouslySetInnerHTML={{ __html: markdownToHtml(rootCategory.index.content) }}
              />
            )}
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              {articles.map((article) => (
                <button
                  key={article.id}
                  type="button"
                  onClick={() => setSelectedId(article.id)}
                  className="webos-help-app__article-card text-left border border-black/15 p-3 hover:bg-black/5"
                >
                  <div className="font-semibold">{article.title}</div>
                  <div className="text-xs opacity-60 mt-1">{article.categoryPath}</div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="opacity-65">
            {isRu ? 'Категория «Операционные системы» пока пуста.' : 'The Operating Systems category is empty.'}
          </div>
        )}
      </main>
    </div>
  );
}
