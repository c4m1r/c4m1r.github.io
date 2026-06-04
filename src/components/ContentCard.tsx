import { Calendar, Clock, Tag } from 'lucide-react';
import type { ContentItem } from '../domain/content/types';

interface ContentCardProps {
  item: ContentItem & { excerpt?: string; readingTime?: string };
  onClick: () => void;
  index?: number;
  animationClass?: string;
}

export function ContentCard({
  item,
  onClick,
  index = 0,
  animationClass = 'fade-in-up',
}: ContentCardProps) {
  // Use relative path for fallbacks or construct standard preview
  const defaultPreview = new URL('../content/blog/preview.webm', import.meta.url).href;
  const preview = item.preview || defaultPreview;

  return (
    <article
      className={`neu rounded-3xl overflow-hidden bg-card card-hover cursor-pointer ${animationClass}`}
      style={{ animationDelay: `${index * 100}ms` }}
      onClick={onClick}
    >
      {/* Thumbnail / Video */}
      <div className="aspect-video bg-gradient-hero relative overflow-hidden group">
        {preview ? (
          preview.endsWith('.webm') || preview.endsWith('.mp4') ? (
            <video
              src={preview}
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
            />
          ) : (
            <img
              src={preview}
              alt={item.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          )
        ) : (
          <div className="w-full h-full bg-gradient-hero" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <span className="inline-block px-3 py-1 text-xs font-medium rounded-full glass text-foreground">
            {item.category || 'General'}
          </span>
        </div>
      </div>

      {/* Content body */}
      <div className="p-6">
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {item.date || '—'}
          </span>
          {item.readingTime && (
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {item.readingTime}
            </span>
          )}
        </div>

        <h3 className="text-xl font-bold mb-3 text-foreground hover:text-primary transition-colors line-clamp-2">
          {item.title}
        </h3>

        {item.excerpt && (
          <p className="text-muted-foreground line-clamp-2 mb-4 text-sm leading-relaxed">
            {item.excerpt}
          </p>
        )}

        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {item.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg bg-muted text-muted-foreground"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
