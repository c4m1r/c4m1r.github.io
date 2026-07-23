import { BookOpen, Briefcase, FileText, Image as ImageIcon, Newspaper, Search, Tag } from 'lucide-react';
import { type SearchResult } from '../../../domain/search/useGlobalSearch';
import { stripMarkdown } from '../../../domain/content/markdown';
import { type ContentItem } from '../../../domain/content/types';

interface SearchSectionLabels {
  title: string;
  subtitle: string;
  placeholder: string;
  allContent: string;
  results: string;
  nothing: string;
  loading: string;
  tags: string;
  blog: string;
  wiki: string;
  news: string;
  gallery: string;
  projects: string;
}

interface SearchSectionProps {
  labels: SearchSectionLabels;
  query: string;
  setQuery: (query: string) => void;
  results: SearchResult[];
  loading: boolean;
  allTags: string[];
  getTagCount: (tag: string) => number;
  onTagClick: (tag: string) => void;
  onOpenResult: (result: SearchResult) => void;
}

const kindLabels: Record<SearchResult['kind'], string> = {
  articles: 'Article',
  wiki: 'Wiki',
  news: 'News',
  projects: 'Project',
  gallery: 'Gallery',
  apps: 'App',
  resume: 'Resume',
  about: 'About',
};

const kindIcons: Partial<Record<SearchResult['kind'], typeof BookOpen>> = {
  articles: BookOpen,
  wiki: FileText,
  news: Newspaper,
  projects: Briefcase,
  gallery: ImageIcon,
};

interface SearchDisplayItem extends ContentItem {
  excerpt?: string;
  description?: string;
  thumbnailPath?: string;
  imagePath?: string;
}

function getResultExcerpt(result: SearchResult): string {
  const item = result.item as SearchDisplayItem;
  return item.excerpt || item.description || stripMarkdown(item.content || '').slice(0, 150);
}

function getResultPreview(result: SearchResult): string | undefined {
  const item = result.item as SearchDisplayItem;
  return item.thumbnailPath || item.preview || item.imagePath;
}

export function SearchSection({
  labels,
  query,
  setQuery,
  results,
  loading,
  allTags,
  getTagCount,
  onTagClick,
  onOpenResult,
}: SearchSectionProps) {
  const trimmedQuery = query.trim();
  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, result) => {
    const key = result.kind;
    acc[key] = acc[key] || [];
    acc[key].push(result);
    return acc;
  }, {});

  const groupOrder: SearchResult['kind'][] = ['articles', 'wiki', 'news', 'gallery', 'projects', 'apps', 'about', 'resume'];

  const groupTitles: Partial<Record<SearchResult['kind'], string>> = {
    articles: labels.blog,
    wiki: labels.wiki,
    news: labels.news,
    gallery: labels.gallery,
    projects: labels.projects,
  };

  return (
    <main className="pt-32 pb-24">
      <div className="container mx-auto px-6">
        <section className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
            <span className="gradient-text">{labels.title}</span>
          </h1>
          <p className="text-xl text-muted-foreground animate-fade-in animation-delay-100">
            {labels.subtitle}
          </p>
        </section>

        <section className="max-w-4xl mx-auto mb-12">
          <div className="glass rounded-3xl p-6 md:p-8 neu-sm fade-in-up">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
              <input
                type="text"
                placeholder={labels.placeholder}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full pl-14 pr-4 py-4 text-lg rounded-2xl bg-card border border-border focus:border-primary focus:outline-none transition-colors"
              />
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto">
          {!trimmedQuery ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">{labels.allContent}</p>
            </div>
          ) : loading ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">{labels.loading}</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">{labels.nothing}</p>
            </div>
          ) : (
            <div className="space-y-12">
              <div className="text-center mb-8">
                <p className="text-muted-foreground">
                  {results.length} {labels.results}
                </p>
              </div>

              {groupOrder.map((kind) => {
                const group = grouped[kind] || [];
                if (group.length === 0) return null;
                const Icon = kindIcons[kind] || FileText;

                return (
                  <div key={kind}>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                      <Icon className="w-6 h-6" />
                      {groupTitles[kind] || kindLabels[kind]} ({group.length})
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {group.map((result) => {
                        const preview = getResultPreview(result);
                        const excerpt = getResultExcerpt(result);
                        return (
                          <article
                            key={`${result.kind}-${result.item.id}`}
                            className="neu rounded-2xl overflow-hidden bg-card card-hover cursor-pointer"
                            onClick={() => onOpenResult(result)}
                          >
                            <div className="aspect-video bg-gradient-hero relative overflow-hidden">
                              {preview ? (
                                preview.endsWith('.webm') || preview.endsWith('.mp4') ? (
                                  <video src={preview} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                                ) : (
                                  <img src={preview} alt={result.item.title} className="w-full h-full object-cover" loading="lazy" />
                                )
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Icon className="w-12 h-12 text-primary-foreground/50" />
                                </div>
                              )}
                              <span className="absolute left-4 top-4 px-3 py-1 text-xs font-bold rounded-full bg-primary text-primary-foreground shadow-lg">
                                {kindLabels[result.kind]}
                              </span>
                            </div>
                            <div className="p-4">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                {result.item.category && <span>{result.item.category}</span>}
                                {result.item.date && <span>{result.item.date}</span>}
                              </div>
                              <h3 className="text-lg font-bold mb-2">{result.item.title}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">{excerpt}</p>
                              {result.matchedTags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-4">
                                  {result.matchedTags.slice(0, 3).map((tag) => (
                                    <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg bg-primary/10 text-primary">
                                      <Tag className="w-3 h-3" />
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="max-w-6xl mx-auto mt-24">
          <div className="glass rounded-3xl p-8 neu-sm">
            <h2 className="text-2xl font-bold mb-6 text-center">{labels.tags}</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => onTagClick(tag)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-muted hover:bg-primary hover:text-primary-foreground transition-colors text-sm font-medium"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                  <span className="text-xs opacity-70">({getTagCount(tag)})</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
