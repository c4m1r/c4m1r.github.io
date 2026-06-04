/**
 * PicturesGallery — desktop app component.
 * Migrated to domain layer: uses useGallery() instead of loadPictures() directly.
 * OS visual skin applied via .os-{theme} CSS wrappers.
 */

import { useState } from 'react';
import { useGallery } from '../../domain/gallery/useGallery';
import { type GalleryItem } from '../../domain/gallery/gallery.types';
import { Grid, List } from 'lucide-react';

interface PicturesGalleryProps {
  onOpenImage?: (imagePath: string) => void;
}

export function PicturesGallery({ onOpenImage }: PicturesGalleryProps) {
  const { pictures, loading } = useGallery();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleClick = (item: GalleryItem) => setSelectedId(item.id);
  const handleDoubleClick = (item: GalleryItem) => {
    onOpenImage?.(item.imagePath);
  };

  if (loading) {
    return (
      <div className="gallery-app gallery-app--loading flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-lg mb-2">Loading images…</div>
          <div className="text-sm opacity-60">Please wait</div>
        </div>
      </div>
    );
  }

  if (pictures.length === 0) {
    return (
      <div className="gallery-app gallery-app--empty flex items-center justify-center h-full">
        <div className="text-center opacity-60">
          <div className="text-lg mb-2">No images</div>
          <div className="text-sm">Add images to content/pictures/</div>
        </div>
      </div>
    );
  }

  return (
    <div className="gallery-app flex flex-col h-full bg-white">
      {/* Toolbar */}
      <div className="gallery-app__toolbar os-toolbar flex items-center justify-between p-2 border-b">
        <div className="flex gap-2">
          <button
            className={`gallery-app__view-btn p-1 rounded ${viewMode === 'grid' ? 'bg-white border border-gray-400' : 'hover:bg-white/50'}`}
            onClick={() => setViewMode('grid')}
            title="Grid View"
          >
            <Grid size={20} />
          </button>
          <button
            className={`gallery-app__view-btn p-1 rounded ${viewMode === 'list' ? 'bg-white border border-gray-400' : 'hover:bg-white/50'}`}
            onClick={() => setViewMode('list')}
            title="List View"
          >
            <List size={20} />
          </button>
        </div>
        <div className="gallery-app__count text-sm text-gray-600">
          {pictures.length} {pictures.length === 1 ? 'image' : 'images'}
        </div>
      </div>

      {/* Gallery content */}
      <div className="gallery-app__content flex-1 overflow-auto p-4">
        {viewMode === 'grid' ? (
          <div className="gallery-app__grid grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-4">
            {pictures.map((item) => (
              <div
                key={item.id}
                className={`gallery-app__item flex flex-col items-center cursor-pointer border-2 p-2 rounded ${
                  selectedId === item.id
                    ? 'border-[#316ac5] bg-[#316ac5]/10'
                    : 'border-transparent hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => handleClick(item)}
                onDoubleClick={() => handleDoubleClick(item)}
              >
                <div className="gallery-app__thumb w-full aspect-square mb-2 flex items-center justify-center bg-gray-100 rounded overflow-hidden">
                  <img
                    src={item.thumbnailPath}
                    alt={item.title}
                    className="max-w-full max-h-full object-contain"
                    loading="lazy"
                  />
                </div>
                <div
                  className={`gallery-app__item-label text-xs text-center break-words w-full ${
                    selectedId === item.id ? 'bg-[#316ac5] text-white px-1 rounded' : ''
                  }`}
                >
                  {item.title}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <table className="gallery-app__list-table w-full text-sm border-collapse">
            <thead className="gallery-app__list-head">
              <tr>
                <th className="text-left px-3 py-2 font-semibold">Name</th>
                <th className="text-left px-3 py-2 font-semibold w-40">Date</th>
              </tr>
            </thead>
            <tbody>
              {pictures.map((item) => (
                <tr
                  key={item.id}
                  className={`gallery-app__list-row cursor-pointer ${
                    selectedId === item.id
                      ? 'bg-[#316ac5] text-white'
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={() => handleClick(item)}
                  onDoubleClick={() => handleDoubleClick(item)}
                >
                  <td className="px-3 py-2 flex items-center gap-2">
                    <div className="w-8 h-8 flex-shrink-0">
                      <img
                        src={item.thumbnailPath}
                        alt={item.title}
                        className="w-full h-full object-cover rounded"
                        loading="lazy"
                      />
                    </div>
                    <span>{item.title}</span>
                  </td>
                  <td className="px-3 py-2">{item.date ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
