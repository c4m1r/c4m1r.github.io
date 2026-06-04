import React from 'react';
import { Calendar, Clock, Tag } from 'lucide-react';

interface ContentReaderProps {
  title: string;
  html: string;
  excerpt?: string;
  preview?: string;
  category?: string;
  date?: string;
  readingTime?: string;
  tags?: string[];
  tagsLabel?: string;
  onTagClick?: (tag: string) => void;
  tagCounts?: Record<string, number>;
  headerMeta?: React.ReactNode;
}

export function ContentReader({
  title,
  html,
  excerpt,
  preview,
  category,
  date,
  readingTime,
  tags,
  tagsLabel = 'Tags',
  onTagClick,
  tagCounts = {},
  headerMeta,
}: ContentReaderProps) {
  return (
    <div className="glass rounded-3xl p-6 md:p-10 neu-sm animate-fade-in">
      {/* Optional Breadcrumbs / Category details / Back buttons */}
      {headerMeta && <div className="mb-4">{headerMeta}</div>}

      <div className="flex flex-col">
        {/* Header Metadata */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
          {category && (
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
              {category}
            </span>
          )}
          {date && (
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {date}
            </span>
          )}
          {readingTime && (
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {readingTime}
            </span>
          )}
        </div>

        {/* Title & Excerpt */}
        <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
        {excerpt && <p className="text-lg text-muted-foreground mb-8 leading-relaxed">{excerpt}</p>}

        {/* Preview Image/Video */}
        {preview && (
          <div className="mb-8 rounded-2xl overflow-hidden neu-sm">
            {preview.endsWith('.webm') || preview.endsWith('.mp4') ? (
              <video
                src={preview}
                className="w-full h-auto"
                autoPlay
                loop
                muted
                playsInline
              />
            ) : (
              <img src={preview} alt={title} className="w-full h-auto object-cover" />
            )}
          </div>
        )}

        {/* Main rendered body */}
        <article
          className="prose prose-lg max-w-none text-foreground markdown-body"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-border/40 pt-6">
            <span className="text-muted-foreground font-medium text-sm">{tagsLabel}:</span>
            {tags.map((tag) => {
              const count = tagCounts[tag] || 0;
              return (
                <button
                  key={tag}
                  onClick={() => onTagClick?.(tag)}
                  disabled={!onTagClick}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted hover:bg-primary hover:text-primary-foreground transition-colors text-sm font-medium disabled:pointer-events-none"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                  {count > 0 && <span className="text-xs opacity-70">({count})</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
