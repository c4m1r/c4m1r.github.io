/**
 * NewsPageSection — site-shell view for the news list and detail pages.
 *
 * Pure presentation: receives state/handlers from BlogSite via props.
 */

import { ArrowLeft, ArrowRight, FileText } from 'lucide-react';
import { ContentReader } from '../../../components/ContentReader';
import { NewsSection } from './NewsSection';
import { type Language } from '../../../i18n/translations';
import { type NewsItem } from '../../../domain/news/news.types';
import { markdownToHtml } from '../../../domain/content/markdown';
import { type Section } from '../siteTypes';
import { routes } from '../siteRoutes';

export interface NewsPageSectionProps {
  ui: { tags: string; back: string; nav: { news: string } };
  language: Language;
  activeNews: NewsItem | null;
  setActiveNews: (news: NewsItem | null) => void;
  setActiveSection: (section: Section) => void;
  setGlobalSearchQuery: (query: string) => void;
  handleOpenNews: (item: NewsItem) => void;
}

export function NewsPageSection({
  ui,
  language,
  activeNews,
  setActiveNews,
  setActiveSection,
  setGlobalSearchQuery,
  handleOpenNews,
}: NewsPageSectionProps) {
  return (
    <main className="pt-32 pb-24">
      <div className="container mx-auto px-6">
        {activeNews ? (
          /* Detail view */
          <section className="max-w-4xl mx-auto">
            <ContentReader
              title={
                (language === 'ru' ? activeNews.title_ru : activeNews.title_en) ??
                activeNews.title
              }
              html={markdownToHtml(activeNews.content)}
              category={activeNews.category}
              date={
                activeNews.date
                  ? new Date(activeNews.date).toLocaleDateString(
                      language === 'ru' ? 'ru-RU' : 'en-US',
                      { year: 'numeric', month: 'long', day: 'numeric' }
                    )
                  : undefined
              }
              tags={activeNews.tags}
              tagsLabel={ui.tags}
              onTagClick={(tag) => {
                setActiveNews(null);
                setActiveSection('search');
                setGlobalSearchQuery(tag);
                window.history.pushState({}, '', routes.search(tag));
              }}
              headerMeta={
                <>
                  <button
                    onClick={() => {
                      setActiveNews(null);
                      window.history.pushState({}, '', routes.news());
                    }}
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {ui.back}
                  </button>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <FileText className="w-4 h-4" />
                    <span className="font-medium text-foreground">{ui.nav.news}</span>
                    <ArrowRight className="w-4 h-4 opacity-60" />
                    <span className="text-foreground">
                      {(language === 'ru' ? activeNews.title_ru : activeNews.title_en) ??
                        activeNews.title}
                    </span>
                  </div>
                </>
              }
            />
          </section>
        ) : (
          /* List view */
          <section className="max-w-4xl mx-auto">
            <div className="text-center mb-12 animate-fade-in">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                <span className="gradient-text">{ui.nav.news}</span>
              </h1>
            </div>
            <NewsSection
              limit={99}
              onOpenNews={(item) => handleOpenNews(item as NewsItem)}
            />
          </section>
        )}
      </div>
    </main>
  );
}
