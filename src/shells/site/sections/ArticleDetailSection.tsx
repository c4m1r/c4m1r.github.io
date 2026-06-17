/**
 * ArticleDetailSection — site-shell view for reading a single blog article.
 *
 * Pure presentation: receives all data/handlers from BlogSite via props.
 * No local state. No domain hooks.
 */

import { ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';
import { ContentReader } from '../../../components/ContentReader';

export interface ArticleDetailItem {
  id: string;
  title: string;
  html: string;
  excerpt?: string;
  preview?: string;
  category?: string;
  date?: string;
  readingTime?: string;
  tags?: string[];
}

export interface ArticleDetailSectionProps {
  activePost: ArticleDetailItem;
  /** Language key so the key prop forces remount on language change */
  language: string;
  labels: {
    back: string;
    tags: string;
    blogLabel: string;
  };
  onBack: () => void;
  onTagClick: (tag: string) => void;
  tagCounts: Record<string, number>;
}

export function ArticleDetailSection({
  activePost,
  language,
  labels,
  onBack,
  onTagClick,
  tagCounts,
}: ArticleDetailSectionProps) {
  return (
    <main className="pt-32 pb-24" key={`post-${activePost.id}-${language}`}>
      <div className="container mx-auto px-6">
        <section className="max-w-4xl mx-auto">
          <ContentReader
            title={activePost.title}
            html={activePost.html}
            excerpt={activePost.excerpt}
            preview={activePost.preview}
            category={activePost.category}
            date={activePost.date}
            readingTime={activePost.readingTime}
            tags={activePost.tags}
            tagsLabel={labels.tags}
            onTagClick={onTagClick}
            tagCounts={tagCounts}
            headerMeta={
              <>
                <button
                  onClick={onBack}
                  className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {labels.back}
                </button>

                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <BookOpen className="w-4 h-4" />
                  <span className="font-medium text-foreground">{labels.blogLabel}</span>
                  <ArrowRight className="w-4 h-4 opacity-60" />
                  <span className="text-foreground">{activePost.title}</span>
                </div>
              </>
            }
          />
        </section>
      </div>
    </main>
  );
}
