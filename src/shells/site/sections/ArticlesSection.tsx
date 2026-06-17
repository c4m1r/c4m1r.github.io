/**
 * ArticlesSection — site-shell view for the blog list page.
 *
 * Pure presentation: receives all state/handlers from BlogSite via props.
 * No local state. No domain hooks.
 */

import { Search, Filter } from 'lucide-react';
import { ContentCard } from '../../../components/ContentCard';

/** Minimal subset of BlogPostView required by this section. */
export interface ArticleItem {
  id: string;
  title: string;
  excerpt?: string;
  readingTime?: string;
  preview?: string;
  date?: string;
  category?: string;
  tags?: string[];
  content: string;
}

interface SectionPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function SectionPagination({ currentPage, totalPages, onPageChange }: SectionPaginationProps) {
  if (totalPages <= 1) return null;
  const pages: number[] = [];
  for (let i = 1; i <= totalPages; i++) pages.push(i);
  return (
    <div className="flex justify-center items-center gap-2 mt-12">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 disabled:opacity-40 transition-colors text-sm font-medium"
      >
        ←
      </button>
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            page === currentPage
              ? 'neu-sm bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80 text-muted-foreground'
          }`}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 disabled:opacity-40 transition-colors text-sm font-medium"
      >
        →
      </button>
    </div>
  );
}

export interface ArticlesSectionProps {
  labels: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    loading: string;
    nothing: string;
  };
  loading: boolean;
  paginatedPosts: ArticleItem[];
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onOpenPost: (post: ArticleItem) => void;
}

export function ArticlesSection({
  labels,
  loading,
  paginatedPosts,
  categories,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  currentPage,
  totalPages,
  onPageChange,
  onOpenPost,
}: ArticlesSectionProps) {
  return (
    <main className="pt-32 pb-24">
      <div className="container mx-auto px-6">
        {/* Header */}
        <section className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
            <span className="gradient-text">{labels.title}</span>
          </h1>
          <p className="text-xl text-muted-foreground animate-fade-in animation-delay-100">
            {labels.subtitle}
          </p>
        </section>

        {/* Filters */}
        <section className="max-w-4xl mx-auto mb-12 animate-fade-in animation-delay-200">
          <div className="glass rounded-2xl p-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder={labels.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-card border border-border focus:border-primary focus:outline-none transition-colors"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
              <Filter className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCategory === category
                      ? 'neu-sm bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Posts Grid */}
        <section className="max-w-6xl mx-auto">
          {loading ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">{labels.loading}</p>
            </div>
          ) : paginatedPosts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">{labels.nothing}</p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {paginatedPosts.map((post, index) => (
                  <ContentCard
                    key={post.id}
                    item={post}
                    onClick={() => onOpenPost(post)}
                    index={index}
                    animationClass="animate-fade-in"
                  />
                ))}
              </div>
              <SectionPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
              />
            </>
          )}
        </section>
      </div>
    </main>
  );
}
