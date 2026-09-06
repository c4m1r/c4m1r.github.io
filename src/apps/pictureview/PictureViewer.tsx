import { useState, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  Printer,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Play,
  Pause,
  Download
} from 'lucide-react';

export interface PictureViewerImage {
  src: string;
  name?: string;
}

export interface PictureViewerProps {
  initialImage?: string;
  images?: PictureViewerImage[];
  initialIndex?: number;
  onClose?: () => void;
}

export function PictureViewer({ initialImage, images = [], initialIndex = 0 }: PictureViewerProps) {
  const imageList: PictureViewerImage[] =
    images.length > 0
      ? images
      : initialImage
      ? [{ src: initialImage, name: 'Image' }]
      : [];

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isPlayingSlideshow, setIsPlayingSlideshow] = useState(false);

  const currentImage = imageList[currentIndex]?.src || initialImage;

  useEffect(() => {
    let interval: number | undefined;
    if (isPlayingSlideshow && imageList.length > 1) {
      interval = window.setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % imageList.length);
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlayingSlideshow, imageList.length]);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 4));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.25));
  const handleFit = () => setZoom(1);
  const handleRotateCw = () => setRotation((prev) => (prev + 90) % 360);
  const handleRotateCcw = () => setRotation((prev) => (prev - 90 + 360) % 360);

  const handlePrev = () => {
    if (imageList.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + imageList.length) % imageList.length);
    setZoom(1);
    setRotation(0);
  };

  const handleNext = () => {
    if (imageList.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % imageList.length);
    setZoom(1);
    setRotation(0);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!currentImage) return;
    const a = document.createElement('a');
    a.href = currentImage;
    a.download = imageList[currentIndex]?.name || 'picture.jpg';
    a.click();
  };

  return (
    <div className="flex flex-col h-full bg-[#ece9d8] select-none os-panel">
      {/* Main Image Viewport */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-[#f1f4fa] border-b border-[#aca899] relative">
        {currentImage ? (
          <img
            src={currentImage}
            alt={imageList[currentIndex]?.name || 'Picture'}
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transition: 'transform 150ms ease-out',
              maxWidth: '90%',
              maxHeight: '90%',
              objectFit: 'contain',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
              border: '1px solid rgba(0, 0, 0, 0.1)',
            }}
          />
        ) : (
          <div className="text-gray-500 font-tahoma text-xs">No image to display</div>
        )}
      </div>

      {/* Windows Picture and Fax Viewer Bottom Toolbar (XP style) */}
      <div className="h-12 bg-[#ece9d8] flex items-center justify-center px-4 gap-1 border-t border-[#aca899] shadow-inner">
        {/* Navigation Controls */}
        <div className="flex items-center gap-1 border-r border-[#aca899] pr-2 mr-1">
          <button
            onClick={handlePrev}
            disabled={imageList.length <= 1}
            className="p-1.5 hover:bg-[#ffe7a2] border border-transparent hover:border-[#003c74] rounded disabled:opacity-40 bg-transparent text-[#003c74] cursor-pointer"
            title="Previous Image (Left Arrow)"
          >
            <ChevronLeft size={16} className="text-[#003c74]" />
          </button>
          <button
            onClick={handleNext}
            disabled={imageList.length <= 1}
            className="p-1.5 hover:bg-[#ffe7a2] border border-transparent hover:border-[#003c74] rounded disabled:opacity-40 bg-transparent text-[#003c74] cursor-pointer"
            title="Next Image (Right Arrow)"
          >
            <ChevronRight size={16} className="text-[#003c74]" />
          </button>
        </div>

        {/* View & Zoom Controls */}
        <div className="flex items-center gap-1 border-r border-[#aca899] pr-2 mr-1">
          <button
            onClick={handleFit}
            className="p-1.5 hover:bg-[#ffe7a2] border border-transparent hover:border-[#003c74] rounded bg-transparent text-[#003c74] cursor-pointer"
            title="Best Fit (1:1)"
          >
            <Maximize2 size={16} className="text-[#003c74]" />
          </button>
          <button
            onClick={() => setIsPlayingSlideshow((prev) => !prev)}
            disabled={imageList.length <= 1}
            className={`p-1.5 border rounded disabled:opacity-40 cursor-pointer ${
              isPlayingSlideshow
                ? 'bg-[#ffe7a2] border-[#003c74]'
                : 'bg-transparent hover:bg-[#ffe7a2] border-transparent hover:border-[#003c74]'
            }`}
            title={isPlayingSlideshow ? 'Pause Slideshow' : 'Start Slideshow (F5)'}
          >
            {isPlayingSlideshow ? (
              <Pause size={16} className="text-[#003c74]" />
            ) : (
              <Play size={16} className="text-[#003c74]" />
            )}
          </button>
          <button
            onClick={handleZoomIn}
            className="p-1.5 hover:bg-[#ffe7a2] border border-transparent hover:border-[#003c74] rounded bg-transparent text-[#003c74] cursor-pointer"
            title="Zoom In (+)"
          >
            <ZoomIn size={16} className="text-[#003c74]" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 hover:bg-[#ffe7a2] border border-transparent hover:border-[#003c74] rounded bg-transparent text-[#003c74] cursor-pointer"
            title="Zoom Out (-)"
          >
            <ZoomOut size={16} className="text-[#003c74]" />
          </button>
        </div>

        {/* Rotate Controls */}
        <div className="flex items-center gap-1 border-r border-[#aca899] pr-2 mr-1">
          <button
            onClick={handleRotateCcw}
            className="p-1.5 hover:bg-[#ffe7a2] border border-transparent hover:border-[#003c74] rounded bg-transparent text-[#003c74] cursor-pointer"
            title="Rotate Counter-Clockwise"
          >
            <RotateCcw size={16} className="text-[#003c74]" />
          </button>
          <button
            onClick={handleRotateCw}
            className="p-1.5 hover:bg-[#ffe7a2] border border-transparent hover:border-[#003c74] rounded bg-transparent text-[#003c74] cursor-pointer"
            title="Rotate Clockwise"
          >
            <RotateCw size={16} className="text-[#003c74]" />
          </button>
        </div>

        {/* Action Controls (Delete, Print, Save) */}
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrint}
            className="p-1.5 hover:bg-[#ffe7a2] border border-transparent hover:border-[#003c74] rounded bg-transparent text-[#003c74] cursor-pointer"
            title="Print Picture"
          >
            <Printer size={16} className="text-[#003c74]" />
          </button>
          <button
            onClick={handleDownload}
            className="p-1.5 hover:bg-[#ffe7a2] border border-transparent hover:border-[#003c74] rounded bg-transparent text-[#003c74] cursor-pointer"
            title="Save Copy As"
          >
            <Download size={16} className="text-[#003c74]" />
          </button>
          <button
            className="p-1.5 opacity-40 cursor-not-allowed border border-transparent rounded bg-transparent text-[#003c74]"
            title="Delete (Disabled)"
            disabled
          >
            <Trash2 size={16} className="text-[#003c74]" />
          </button>
        </div>
      </div>
    </div>
  );
}
