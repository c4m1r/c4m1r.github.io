import { useState } from 'react';
import { ChevronDown, ChevronRight, FileText, Folder, Home } from 'lucide-react';
import { useWiki } from '../../domain/wiki/useWiki';
import { markdownToHtml } from '../../domain/content/markdown';
import { type WikiArticle, type WikiCategory } from '../../domain/wiki/wiki.types';
import { useApp } from '../../contexts/AppContext';

export function WikiApp() {
  const { categories, loading } = useWiki();
  const { language } = useApp();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selectedArticle, setSelectedArticle] = useState<WikiArticle | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<WikiCategory | null>(null);
  const [initialised, setInitialised] = useState(false);

  // Auto-select first category on load
  if (!loading && !initialised && categories.length > 0) {
    const firstCat = categories[0].children.length > 0 ? categories[0].children[0] : categories[0];
    setExpanded(new Set(categories.map((c) => c.id)));
    setSelectedCategory(firstCat);
    setInitialised(true);
  }

  const toggleCategory = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleCategoryClick = (cat: WikiCategory, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedArticle(null);
    setSelectedCategory(cat);
    if (!expanded.has(cat.id)) toggleCategory(cat.id);
  };

  const countArticles = (cat: WikiCategory): number =>
    cat.articles.length + cat.children.reduce((n, c) => n + countArticles(c), 0);

  const getAllArticles = (cat: WikiCategory): WikiArticle[] =>
    [...cat.articles, ...cat.children.flatMap(getAllArticles)];

  // Breadcrumb segments from pathSegments
  const breadcrumbs = selectedArticle
    ? [...(selectedArticle.pathSegments ?? []), selectedArticle.title]
    : selectedCategory
    ? selectedCategory.pathSegments
    : [];

  const renderCategory = (cat: WikiCategory, level = 0) => {
    const isExpanded = expanded.has(cat.id);
    const isSelected = selectedCategory?.id === cat.id;
    const count = countArticles(cat);
    const hasChildren = cat.children.length > 0;

    return (
      <div key={cat.id} className="wiki-app__category">
        <button
          className={`os-list-item wiki-app__category-btn ${isSelected ? 'selected os-list-item--selected' : ''}`}
          style={{ paddingLeft: `${level * 14 + 8}px` }}
          onClick={(e) => handleCategoryClick(cat, e)}
        >
          {hasChildren ? (
            <span
              className="wiki-app__chevron"
              onClick={(e) => { e.stopPropagation(); toggleCategory(cat.id); }}
            >
              {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </span>
          ) : (
            <span className="wiki-app__chevron-placeholder" />
          )}
          <Folder size={13} className="wiki-app__folder-icon" />
          <span className="wiki-app__category-name">{cat.name}</span>
          {count > 0 && (
            <span className="wiki-app__badge">{count}</span>
          )}
        </button>
        {isExpanded && hasChildren && (
          <div className="wiki-app__children">
            {cat.children.map((child) => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="wiki-app wiki-app--loading os-window-body">
        <span>{language === 'ru' ? 'Загрузка Wiki...' : 'Loading Wiki...'}</span>
      </div>
    );
  }

  return (
    <div className="wiki-app os-window-body">
      {/* Sidebar */}
      <aside className="wiki-app__sidebar os-sidebar">
        <div className="wiki-app__sidebar-header os-toolbar">
          <h2 className="wiki-app__sidebar-title">Wiki</h2>
          <span className="wiki-app__sidebar-sub">
            {language === 'ru' ? 'База знаний' : 'Knowledge Base'}
          </span>
        </div>
        <div className="wiki-app__list os-list">
          {categories.length === 0 ? (
            <div className="wiki-app__empty">
              {language === 'ru' ? 'Wiki пуст' : 'No wiki articles'}
            </div>
          ) : (
            categories.map((cat) => renderCategory(cat))
          )}
        </div>
      </aside>

      {/* Main panel */}
      <section className="wiki-app__reader os-panel">
        {/* Breadcrumb toolbar */}
        {breadcrumbs.length > 0 && (
          <div className="wiki-app__breadcrumbs os-toolbar">
            <Home size={12} className="wiki-app__breadcrumb-home" />
            {breadcrumbs.map((seg, i) => (
              <span key={i} className="wiki-app__breadcrumb-segment">
                <span className="wiki-app__breadcrumb-sep">/</span>
                <span className={i === breadcrumbs.length - 1 ? 'wiki-app__breadcrumb-current' : ''}>
                  {seg}
                </span>
              </span>
            ))}
          </div>
        )}

        {selectedArticle ? (
          <div className="wiki-app__article-view">
            {/* Article meta */}
            <div className="wiki-app__meta">
              <h2 className="wiki-app__article-title">{selectedArticle.title}</h2>
              <div className="wiki-app__meta-row">
                {selectedArticle.updatedAt && (
                  <span className="wiki-app__meta-date">
                    {language === 'ru' ? 'Обновлено: ' : 'Updated: '}
                    {selectedArticle.updatedAt}
                  </span>
                )}
                {selectedArticle.author && (
                  <span className="wiki-app__meta-author">{selectedArticle.author}</span>
                )}
              </div>
              {/* Tags */}
              {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                <div className="wiki-app__related">
                  {selectedArticle.tags.map((tag) => (
                    <span key={tag} className="wiki-app__tag">{tag}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Markdown content */}
            <article
              className="wiki-app__content prose"
              dangerouslySetInnerHTML={{ __html: markdownToHtml(selectedArticle.content) }}
            />
          </div>
        ) : selectedCategory ? (
          <div className="wiki-app__category-view">
            {/* Category index (if index.md exists) */}
            {selectedCategory.index && (
              <div className="wiki-app__index-view">
                <div className="wiki-app__meta">
                  <h2 className="wiki-app__article-title">{selectedCategory.index.title}</h2>
                </div>
                <article
                  className="wiki-app__content wiki-app__index-content prose"
                  dangerouslySetInnerHTML={{ __html: markdownToHtml(selectedCategory.index.content) }}
                />
                <div className="wiki-app__divider" />
              </div>
            )}

            {/* Article list */}
            <div className="wiki-app__category-header wiki-app__meta">
              <h2 className="wiki-app__article-title">{selectedCategory.name}</h2>
              <p className="wiki-app__meta-count">
                {countArticles(selectedCategory)}{' '}
                {language === 'ru' ? 'статей' : 'articles'}
              </p>
            </div>

            {(() => {
              const articles = getAllArticles(selectedCategory);
              return articles.length > 0 ? (
                <ul className="wiki-app__article-list os-list">
                  {articles.map((art) => (
                    <li
                      key={art.id}
                      className="wiki-app__article-item os-list-item"
                      onClick={() => setSelectedArticle(art)}
                    >
                      <FileText size={14} className="wiki-app__file-icon" />
                      <div className="wiki-app__article-info">
                        <span className="wiki-app__article-name">{art.title}</span>
                        {art.updatedAt && (
                          <span className="wiki-app__article-date">{art.updatedAt}</span>
                        )}
                        {art.tags && art.tags.length > 0 && (
                          <span className="wiki-app__tag-list">
                            {art.tags.map((t) => (
                              <span key={t} className="wiki-app__tag">{t}</span>
                            ))}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="wiki-app__empty-cat">
                  <FileText size={40} className="wiki-app__empty-icon" />
                  <p>{language === 'ru' ? 'Нет статей в этой категории' : 'No articles in this category'}</p>
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="wiki-app__welcome">
            <Folder size={40} className="wiki-app__welcome-icon" />
            <p>{language === 'ru' ? 'Выберите категорию слева' : 'Select a category from the sidebar'}</p>
          </div>
        )}
      </section>
    </div>
  );
}
