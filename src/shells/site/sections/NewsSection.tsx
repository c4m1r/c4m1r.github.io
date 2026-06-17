/**
 * NewsSection — site-shell widget for the home page.
 *
 * Reads news from src/content/news/*.md via useNews() hook.
 * Displays up to 3 latest items. Language-aware.
 * No OS wrapper classes here — this is the site-shell view.
 */

import { Calendar, ArrowRight } from 'lucide-react';
import { useNews } from '../../../domain/news/useNews';
import { useApp } from '../../../contexts/AppContext';

interface NewsSectionProps {
  /** Max items to show. Default 3. */
  limit?: number;
  /** Callback when user clicks on a news card */
  onOpenNews?: (item: any) => void;
  /** Callback when user clicks "View All". Optional. */
  onViewAll?: () => void;
}

export function NewsSection({ limit = 3, onOpenNews, onViewAll }: NewsSectionProps) {
  const { news, loading } = useNews();
  const { language } = useApp();

  const headingText = language === 'ru' ? 'Последние новости' : 'Latest News';
  const subtitleText =
    language === 'ru'
      ? 'Обновления и анонсы проекта'
      : 'Project updates and announcements';
  const loadingText = language === 'ru' ? 'Загрузка...' : 'Loading...';

  const items = news.slice(0, limit);

  if (loading) {
    return (
      <section className="container mx-auto px-6 py-16">
        <p className="text-muted-foreground text-sm">{loadingText}</p>
      </section>
    );
  }

  if (items.length === 0) {
    return null; // skip section entirely if no content
  }

  return (
    <section className="container mx-auto px-6 py-16">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold mb-2">{headingText}</h2>
          <p className="text-muted-foreground">{subtitleText}</p>
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="flex items-center gap-2 text-primary hover:gap-4 transition-all font-medium"
            aria-label={language === 'ru' ? 'Все новости' : 'View all'}
          >
            {language === 'ru' ? 'Все новости' : 'View all'} <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* News card list */}
      <div className="flex flex-col gap-6">
        {items.map((item, index) => {
          const title =
            language === 'ru'
              ? item.title_ru ?? item.title
              : item.title_en ?? item.title;

          const formattedDate = item.date
            ? new Date(item.date).toLocaleDateString(
                language === 'ru' ? 'ru-RU' : 'en-US',
                { year: 'numeric', month: 'long', day: 'numeric' }
              )
            : '';

          // Render a short excerpt — first paragraph of content
          const excerptLength = 220;
          const plainText = item.content.replace(/<!--.*?-->/gs, '').replace(/[#*`>_~\-]/g, '').trim();
          const excerpt =
            plainText.slice(0, excerptLength) +
            (plainText.length > excerptLength ? '…' : '');

          return (
            <article
              key={item.id}
              className={`neu rounded-3xl overflow-hidden bg-card card-hover fade-in-up p-6 flex flex-col gap-3 ${onOpenNews ? 'cursor-pointer' : ''}`}
              style={{ animationDelay: `${index * 80}ms` }}
              aria-labelledby={`news-title-${item.id}`}
              onClick={() => onOpenNews?.(item)}
            >
              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                {formattedDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formattedDate}
                  </span>
                )}
                {item.category && (
                  <span className="inline-block px-3 py-1 text-xs font-medium rounded-full glass capitalize">
                    {item.category}
                  </span>
                )}
              </div>

              {/* Title */}
              <h3
                id={`news-title-${item.id}`}
                className="text-xl font-bold text-foreground hover:text-primary transition-colors"
              >
                {title}
              </h3>

              {/* Excerpt */}
              <p className="text-muted-foreground line-clamp-3 text-sm">{excerpt}</p>

              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {item.tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="inline-block px-2 py-1 text-xs rounded-lg bg-muted text-muted-foreground"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
