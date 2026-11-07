import { useState, useMemo } from 'react';
import { useApp } from '../../../contexts/useApp';
import { useGallery } from '../../../domain/gallery/useGallery';
import { Image, Shuffle, ExternalLink } from 'lucide-react';

interface GalleryWidgetProps {
  onOpenOriginal?: (imagePath: string) => void;
}

export function GalleryWidget({ onOpenOriginal }: GalleryWidgetProps) {
  const { language } = useApp();
  const isRu = language === 'ru';
  const { items } = useGallery();

  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  const validItems = useMemo(() => {
    return items.filter((i) => Boolean(i.imagePath));
  }, [items]);

  const currentItem = validItems[index % (validItems.length || 1)] ?? {
    id: 'placeholder',
    title: 'Digital Artwork',
    imagePath: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=500&auto=format&fit=crop&q=80',
    tags: ['art'],
    mediaType: 'picture',
  };

  const nextImage = () => {
    if (validItems.length <= 1) return;
    setFade(false);
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % validItems.length);
      setFade(true);
    }, 200);
  };

  const handleOpen = () => {
    if (onOpenOriginal) {
      onOpenOriginal(currentItem.imagePath);
    } else if (typeof window !== 'undefined') {
      window.open(currentItem.imagePath, '_blank');
    }
  };

  return (
    <div className="glass-widget p-2.5 flex flex-col justify-between w-full sm:w-[280px] min-h-[160px] overflow-hidden group">
      <div className="glass-widget__ambient" />

      {/* Image Display */}
      <div className="relative w-full h-28 rounded-xl overflow-hidden bg-black/40 border border-white/10 z-10 shadow-inner">
        <img
          src={currentItem.imagePath}
          alt={currentItem.title}
          onClick={handleOpen}
          className={`w-full h-full object-cover cursor-pointer transition-all duration-300 group-hover:scale-105 ${
            fade ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=500&auto=format&fit=crop&q=80';
          }}
        />

        {/* Ambient Dark Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

        {/* Floating Quick Action Buttons */}
        <div className="absolute top-2 right-2 flex items-center gap-1 z-20">
          <button
            type="button"
            onClick={nextImage}
            className="p-1 rounded-full bg-black/60 hover:bg-black/80 text-white/80 hover:text-white backdrop-blur-md transition-colors cursor-pointer"
            title={isRu ? 'Следующее изображение' : 'Next image'}
          >
            <Shuffle size={11} />
          </button>
          <button
            type="button"
            onClick={handleOpen}
            className="p-1 rounded-full bg-black/60 hover:bg-black/80 text-white/80 hover:text-white backdrop-blur-md transition-colors cursor-pointer"
            title={isRu ? 'Открыть оригинал' : 'Open original'}
          >
            <ExternalLink size={11} />
          </button>
        </div>

        {/* Title over image bottom */}
        <div className="absolute bottom-1.5 left-2.5 right-2.5 z-20 text-[10px] text-white/90 truncate font-semibold">
          {currentItem.title}
        </div>
      </div>

      {/* Footer Tag */}
      <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium pt-2 px-1 z-10">
        <span className="flex items-center gap-1 text-purple-300">
          <Image size={11} />
          {isRu ? 'ГАЛЕРЕЯ' : 'GALLERY'}
        </span>
        <button
          type="button"
          onClick={handleOpen}
          className="text-blue-400 hover:text-blue-300 text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>{isRu ? 'Открыть оригинал' : 'View original'}</span>
        </button>
      </div>
    </div>
  );
}
