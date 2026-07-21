/**
 * WikiSection — site-shell view for the wiki section.
 *
 * Pure presentation: receives all state/handlers from BlogSite via props.
 * No local state (except for recursive tree rendering state if needed, but here it's passed via props).
 */

import { Layers, Search, ChevronDown, ChevronRight, ArrowLeft, ArrowRight, FileText } from 'lucide-react';
import { ContentReader } from '../../../components/ContentReader';
import { routes } from '../siteRoutes';
import { type Language } from '../../../i18n/translations';
import { markdownToHtml } from '../../../domain/content/markdown';

export interface CategoryNode {
  name: string;
  fullPath: string;
  children: Map<string, CategoryNode>;
  count: number;
}

export interface WikiViewItem {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  html?: string;
  categoryPath?: string;
  relativePath?: string;
  pathSegments?: string[];
  tags?: string[];
  updatedAt?: string;
}

interface SectionPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function SectionPagination({ currentPage, totalPages, onPageChange }: SectionPaginationProps) {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="neu px-4 py-2 rounded-xl bg-card disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
      >
        ←
      </button>
      {pages.map((page, idx) => (
        page === '...' ? (
          <span key={`ellipsis-${idx}`} className="px-2">...</span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page as number)}
            className={`px-4 py-2 rounded-xl transition-colors ${
              currentPage === page
                ? 'neu-sm bg-primary text-primary-foreground'
                : 'neu bg-card hover:bg-muted'
            }`}
          >
            {page}
          </button>
        )
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="neu px-4 py-2 rounded-xl bg-card disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
      >
        →
      </button>
    </div>
  );
}

export interface WikiSectionProps {
  ui: any;
  language: Language;
  wikiCategories: string[];
  wikiCategoryStats: Record<string, number>;
  wikiCategoryTree: Map<string, CategoryNode>;
  expandedWikiCategories: Set<string>;
  setExpandedWikiCategories: (categories: Set<string>) => void;
  wikiCategory: string;
  setWikiCategory: (category: string) => void;
  wikiSearch: string;
  setWikiSearch: (search: string) => void;
  activeWiki: WikiViewItem | null;
  setActiveWiki: (wiki: WikiViewItem | null) => void;
  wikiCategoryIndex: { title: string; content: string } | null;
  paginatedWiki: WikiViewItem[];
  wikiPage: number;
  totalWikiPages: number;
  setWikiPage: (page: number) => void;
  getTagCount: (tag: string) => number;
  handleOpenWiki: (item: WikiViewItem) => void;
  setActiveSection: (section: any) => void;
  setGlobalSearchQuery: (query: string) => void;
}

export function WikiSection({
  ui,
  language,
  wikiCategories,
  wikiCategoryStats,
  wikiCategoryTree,
  expandedWikiCategories,
  setExpandedWikiCategories,
  wikiCategory,
  setWikiCategory,
  wikiSearch,
  setWikiSearch,
  activeWiki,
  setActiveWiki,
  wikiCategoryIndex,
  paginatedWiki,
  wikiPage,
  totalWikiPages,
  setWikiPage,
  getTagCount,
  handleOpenWiki,
  setActiveSection,
  setGlobalSearchQuery,
}: WikiSectionProps) {
  return (
    <section className="max-w-6xl mx-auto px-6 py-12 space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-foreground/80">
          <Layers className="w-4 h-4" />
          <span>{ui.wikiTitle}</span>
        </div>
        <div className="text-muted-foreground">
          {language === 'ru' ? 'Знания и заметки' : language === 'fr' ? 'Connaissances et notes' : language === 'es' ? 'Conocimientos y notas' : language === 'zh' ? '知识和笔记' : language === 'ja' ? '知识とメモ' : language === 'ko' ? '지식 및 메모' : 'Knowledge and notes'}
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Layers className="w-4 h-4" />
          <span>{ui.categories}</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {wikiCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveWiki(null);
                setWikiCategory(cat);
              }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                wikiCategory === cat ? 'neu-sm bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {`${cat}${cat !== 'All' && wikiCategoryStats[cat] ? ` (${wikiCategoryStats[cat]})` : ''}`}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-80 ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={wikiSearch}
            onChange={(e) => setWikiSearch(e.target.value)}
            placeholder={ui.searchPlaceholder}
            className="w-full pl-10 pr-3 py-2 rounded-xl bg-card border border-border focus:border-primary outline-none"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_2fr] gap-6">
        <aside className="glass rounded-2xl p-4 neu-sm self-start">
          <div className="flex items-center gap-2 text-sm font-semibold mb-3">
            <Layers className="w-4 h-4 text-primary" />
            <span>{ui.categories}</span>
          </div>
          <div className="space-y-2">
            {wikiCategories.map((cat) => {
              const categoryNode = wikiCategoryTree.get(cat);
              const subcategories = categoryNode ? Array.from(categoryNode.children.entries()) : [];
              const hasSubcategories = cat !== 'All' && subcategories.length > 0;
              const isExpanded = expandedWikiCategories.has(cat);
              
              // Рекурсивный рендер подкатегорий
              const renderSubcategories = (subcats: [string, CategoryNode][], level: number = 1): JSX.Element => {
                return (
                  <>
                    {subcats.map(([subName, subNode]) => {
                      const subPath = subNode.fullPath;
                      const hasChildren = subNode.children && subNode.children.size > 0;
                      const isSubExpanded = expandedWikiCategories.has(subPath);
                      
                      return (
                        <div key={subPath} className="space-y-1">
                          <div className="flex items-center gap-1" style={{ paddingLeft: `${level * 8}px` }}>
                            {hasChildren && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const newExpanded = new Set(expandedWikiCategories);
                                  if (isSubExpanded) {
                                    newExpanded.delete(subPath);
                                  } else {
                                    newExpanded.add(subPath);
                                  }
                                  setExpandedWikiCategories(newExpanded);
                                }}
                                className="p-1 hover:bg-muted rounded transition-colors flex-shrink-0"
                              >
                                {isSubExpanded ? (
                                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                                ) : (
                                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                                )}
                              </button>
                            )}
                            <button
                              onClick={() => {
                                  setActiveWiki(null);
                                  setWikiCategory(subPath);
                              }}
                              className={`flex-1 flex items-center justify-between px-2 py-1 rounded-lg text-xs transition-all ${
                                wikiCategory === subPath ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                              } ${!hasChildren ? 'ml-4' : ''}`}
                            >
                              <span>{subName}</span>
                              <span className="text-xs opacity-60">{subNode.count}</span>
                            </button>
                          </div>
                          {hasChildren && isSubExpanded && (
                            <div className="space-y-1">
                              {renderSubcategories(Array.from(subNode.children.entries()), level + 1)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </>
                );
              };
              
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center gap-1">
                    {hasSubcategories && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const newExpanded = new Set(expandedWikiCategories);
                          if (isExpanded) {
                            newExpanded.delete(cat);
                          } else {
                            newExpanded.add(cat);
                          }
                          setExpandedWikiCategories(newExpanded);
                        }}
                        className="p-1 hover:bg-muted rounded transition-colors"
                        aria-label={isExpanded ? 'Свернуть' : 'Развернуть'}
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setActiveWiki(null);
                        setWikiCategory(cat);
                      }}
                      className={`flex-1 flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                        wikiCategory === cat ? 'neu-sm bg-primary/10 text-primary' : 'hover:bg-muted text-foreground'
                      } ${!hasSubcategories ? 'ml-5' : ''}`}
                    >
                      <span>{cat}</span>
                      {cat !== 'All' && wikiCategoryStats[cat] ? (
                        <span className="text-xs text-muted-foreground">{wikiCategoryStats[cat]}</span>
                      ) : null}
                    </button>
                  </div>
                  {hasSubcategories && isExpanded && (
                    <div className="ml-4 space-y-1">
                      {renderSubcategories(subcategories)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        <div className="space-y-6">
          {activeWiki && (
            <ContentReader
              title={activeWiki.title}
              html={activeWiki.html || ''}
              date={activeWiki.updatedAt}
              category={activeWiki.pathSegments ? activeWiki.pathSegments.join(' / ') : (activeWiki.categoryPath || 'wiki')}
              tags={activeWiki.tags}
              tagsLabel={ui.tags}
              onTagClick={(tag) => {
                setActiveWiki(null);
                setActiveSection('search');
                setGlobalSearchQuery(tag);
                window.history.pushState({}, '', routes.search(tag));
              }}
              tagCounts={
                activeWiki.tags
                  ? Object.fromEntries(
                      activeWiki.tags.map((tag) => [
                        tag,
                        getTagCount(tag),
                      ])
                    )
                  : {}
              }
              headerMeta={
                <>
                  <button
                    onClick={() => {
                      setActiveWiki(null);
                      window.history.pushState({}, '', routes.wiki());
                    }}
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {ui.back}
                  </button>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-3">
                    <span className="inline-flex items-center gap-1">
                      <Layers className="w-4 h-4" />
                      {activeWiki.pathSegments ? activeWiki.pathSegments.join(' / ') : (activeWiki.categoryPath || 'wiki')}
                    </span>
                    <ArrowRight className="w-4 h-4 opacity-60" />
                    <span className="font-medium text-foreground">{activeWiki.title}</span>
                  </div>
                </>
              }
            />
          )}
          {!activeWiki && (
            <>
              {/* Отображение index категории если есть */}
              {wikiCategoryIndex && wikiCategory !== 'All' && (
                <div className="glass rounded-3xl p-6 md:p-8 neu-sm fade-in-up mb-6">
                  <h3 className="text-2xl font-bold mb-4">{wikiCategoryIndex.title}</h3>
                  <div className="prose prose-lg max-w-none text-foreground markdown-body" dangerouslySetInnerHTML={{ __html: markdownToHtml(wikiCategoryIndex.content) }} />
                </div>
              )}

              {paginatedWiki.length === 0 ? (
                <div className="text-muted-foreground">{ui.nothing}</div>
              ) : (
                <>
                  <div className="grid md:grid-cols-2 gap-6">
                    {paginatedWiki.map((item) => (
                      <article
                        key={item.relativePath}
                        className="glass rounded-2xl p-4 neu-sm hover:cursor-pointer hover:-translate-y-1 transition-transform"
                        onClick={() => handleOpenWiki(item)}
                      >
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                          <FileText className="w-4 h-4" />
                          <span>{item.categoryPath || 'wiki'}</span>
                          {item.updatedAt && <span>· {item.updatedAt}</span>}
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-3">{item.excerpt}</p>
                      </article>
                    ))}
                  </div>
                  <SectionPagination currentPage={wikiPage} totalPages={totalWikiPages} onPageChange={setWikiPage} />
                </>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
