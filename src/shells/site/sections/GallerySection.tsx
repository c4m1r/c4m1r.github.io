/**
 * GallerySection — site-shell widget for the home page.
 *
 * Reads pictures from domain via useGallery() hook.
 * Displays up to `limit` pictures as a masonry-style grid.
 * Language-aware. No OS wrapper classes — this is the site-shell view.
 */

import { Image as ImageIcon, ArrowRight, ZoomIn } from 'lucide-react';
import { useState } from 'react';
import { useGallery } from '../../../domain/gallery/useGallery';
import { useApp } from '../../../contexts/useApp';
import { type GalleryItem } from '../../../domain/gallery/gallery.types';

interface GallerySectionProps {
  /** Max pictures to show. Default 8. */
  limit?: number;
  /** Called when user clicks "View All". Optional. */
  onViewAll?: () => void;
}

export function GallerySection({ limit = 8, onViewAll }: GallerySectionProps) {
  const { pictures, loading } = useGallery();
  const { language } = useApp();
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);

  const headingText = language === 'ru' ? 'Галерея' : 'Gallery';
  const subtitleText =
    language === 'ru'
      ? 'Скриншоты, арты и визуальные эксперименты'
      : 'Screenshots, art, and visual experiments';
  const viewAllText = language === 'ru' ? 'Все изображения' : 'View all';
  const loadingText = language === 'ru' ? 'Загрузка...' : 'Loading…';

  const items = pictures.slice(0, limit);

  if (loading) {
    return (
      <section className="container mx-auto px-6 py-16">
        <p className="text-muted-foreground text-sm">{loadingText}</p>
      </section>
    );
  }

  if (items.length === 0) return null;

  return (
    <>
      <section
        className="container mx-auto px-6 py-16"
        aria-labelledby="gallery-section-heading"
      >
        {/* Section Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2
              id="gallery-section-heading"
              className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3"
            >
              <ImageIcon className="w-8 h-8 text-primary" aria-hidden="true" />
              {headingText}
            </h2>
            <p className="text-muted-foreground">{subtitleText}</p>
          </div>
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="flex items-center gap-2 text-primary hover:gap-4 transition-all font-medium"
              aria-label={viewAllText}
            >
              {viewAllText} <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item, index) => (
            <button
              key={item.id}
              className="group relative rounded-2xl overflow-hidden aspect-square bg-muted neu card-hover fade-in-up focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => setLightbox(item)}
              aria-label={item.title}
            >
              <img
                src={item.thumbnailPath}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center">
                <ZoomIn
                  className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 drop-shadow"
                  aria-hidden="true"
                />
              </div>
              {/* Title overlay at bottom */}
              <div className="absolute bottom-0 inset-x-0 px-3 py-2 bg-gradient-to-t from-black/60 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                <p className="text-white text-xs font-medium truncate">{item.title}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.title}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightbox.imagePath}
              alt={lightbox.title}
              className="max-h-[80vh] max-w-full rounded-2xl shadow-2xl object-contain"
            />
            <p className="text-white text-sm font-medium">{lightbox.title}</p>
            <button
              onClick={() => setLightbox(null)}
              className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}
