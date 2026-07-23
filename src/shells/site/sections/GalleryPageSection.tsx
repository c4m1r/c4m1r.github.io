/**
 * GalleryPageSection — site-shell view for the full gallery page.
 *
 * Uses useGallery() domain hook directly to fetch pictures.
 * Encapsulates albums filtering, pagination, rendering grid, and the lightbox.
 */

import { useState, useEffect, useMemo } from 'react';
import { Folder, ChevronDown, ChevronRight, X, ArrowRight } from 'lucide-react';
import { useGallery } from '../../../domain/gallery/useGallery';

interface GallerySectionUi {
  galleryTitle: string;
  loading: string;
  gallery: { allAlbums: string };
}

interface AlbumNode {
  name: string;
  fullPath: string;
  children: Map<string, AlbumNode>;
  count: number;
}

// Simple pagination matching BlogSite style
interface SectionPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function SectionPagination({ currentPage, totalPages, onPageChange }: SectionPaginationProps) {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="neu px-4 py-2 rounded-xl bg-card disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
      >
        ←
      </button>
      {pages.map((page, idx) => (
        page === '...' ? (
          <span key={`ellipsis-${idx}`} className="px-2">...</span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page as number)}
            className={`px-4 py-2 rounded-xl transition-colors ${
              currentPage === page
                ? 'neu-sm bg-primary text-primary-foreground'
                : 'neu bg-card hover:bg-muted'
            }`}
          >
            {page}
          </button>
        )
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="neu px-4 py-2 rounded-xl bg-card disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
      >
        →
      </button>
    </div>
  );
}

export interface GalleryPageSectionProps {
  ui: GallerySectionUi;
  language: string;
  initialPictureId?: string | null;
  onClearInitialPicture?: () => void;
}

export function GalleryPageSection({
  ui,
  language,
  initialPictureId,
  onClearInitialPicture,
}: GalleryPageSectionProps) {
  const { pictures, loading } = useGallery();
  
  // Local state for selected album, pagination, lightbox, etc.
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [galleryPage, setGalleryPage] = useState(1);
  const [expandedGalleryAlbums, setExpandedGalleryAlbums] = useState<Set<string>>(new Set());
  const [lightbox, setLightbox] = useState<{ id: string; idx: number } | null>(null);
  
  const itemsPerPage = 12;

  // Album tree structure parser
  const galleryAlbumTree = useMemo(() => {
    const root = new Map<string, AlbumNode>();

    pictures.forEach((pic) => {
      const pathParts = pic.imagePath.split('/');
      const picturesIndex = pathParts.findIndex(part => part === 'pictures');
      
      if (picturesIndex === -1 || picturesIndex === pathParts.length - 1) {
        if (!root.has('General')) {
          root.set('General', {
            name: 'General',
            fullPath: 'General',
            children: new Map(),
            count: 0,
          });
        }
        root.get('General')!.count++;
        return;
      }

      const segments = pathParts.slice(picturesIndex + 1, -1);
      
      if (segments.length === 0) {
        if (!root.has('General')) {
          root.set('General', {
            name: 'General',
            fullPath: 'General',
            children: new Map(),
            count: 0,
          });
        }
        root.get('General')!.count++;
        return;
      }

      let currentMap = root;
      let currentPath = '';

      segments.forEach((segment) => {
        currentPath = currentPath ? `${currentPath}/${segment}` : segment;
        
        if (!currentMap.has(segment)) {
          currentMap.set(segment, {
            name: segment,
            fullPath: currentPath,
            children: new Map(),
            count: 0,
          });
        }

        const node = currentMap.get(segment)!;
        node.count++;
        currentMap = node.children;
      });
    });

    return root;
  }, [pictures]);

  const galleryAlbums = useMemo(() => {
    return Array.from(galleryAlbumTree.keys());
  }, [galleryAlbumTree]);

  const filteredGalleryImages = useMemo(() => {
    if (!selectedAlbum) return pictures;
    
    return pictures.filter((pic) => {
      const pathParts = pic.imagePath.split('/');
      const picturesIndex = pathParts.findIndex(part => part === 'pictures');
      
      if (picturesIndex === -1) return false;
      
      const segments = pathParts.slice(picturesIndex + 1, -1);
      const picPath = segments.join('/');
      
      return picPath === selectedAlbum || picPath.startsWith(selectedAlbum + '/');
    });
  }, [pictures, selectedAlbum]);

  const paginatedGallery = useMemo(() => {
    const start = (galleryPage - 1) * itemsPerPage;
    return filteredGalleryImages.slice(start, start + itemsPerPage);
  }, [filteredGalleryImages, galleryPage]);

  const totalGalleryPages = Math.ceil(filteredGalleryImages.length / itemsPerPage);

  // Sync initial picture ID from search or other pages
  useEffect(() => {
    if (initialPictureId) {
      setSelectedAlbum(null); // Clear folder filter so item is accessible in navigation
      const idx = pictures.findIndex((p) => p.id === initialPictureId);
      if (idx !== -1) {
        setLightbox({ idx, id: initialPictureId });
        document.body.style.overflow = 'hidden';
      }
      onClearInitialPicture?.();
    }
  }, [initialPictureId, pictures, onClearInitialPicture]);

  const handleOpenPicture = (idx: number, id: string) => {
    setLightbox({ idx, id });
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightbox(null);
    document.body.style.overflow = '';
  };

  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (!lightbox) return;
    
    // Navigate within the currently filtered list of images
    const count = filteredGalleryImages.length;
    if (count === 0) return;
    
    const currentFilteredIdx = filteredGalleryImages.findIndex((p) => p.id === lightbox.id);
    if (currentFilteredIdx === -1) return;
    
    const nextFilteredIdx = direction === 'next' 
      ? (currentFilteredIdx + 1) % count 
      : (currentFilteredIdx - 1 + count) % count;
      
    const nextPic = filteredGalleryImages[nextFilteredIdx];
    
    const globalIdx = pictures.findIndex((p) => p.id === nextPic.id);
    
    setLightbox({ idx: globalIdx === -1 ? 0 : globalIdx, id: nextPic.id });
  };

  return (
    <>
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold mb-6">{ui.galleryTitle}</h2>
        {loading || pictures.length === 0 ? (
          <div className="text-muted-foreground">{ui.loading}</div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_3fr] gap-6">
            {/* Sidebar with Albums */}
            <aside className="glass rounded-2xl p-4 neu-sm self-start">
              <div className="flex items-center gap-2 text-sm font-semibold mb-3">
                <Folder className="w-4 h-4 text-primary" />
                <span>{language === 'ru' ? 'Альбомы' : 'Albums'}</span>
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setSelectedAlbum(null);
                    setGalleryPage(1);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                    !selectedAlbum
                      ? 'neu-sm bg-primary/10 text-primary'
                      : 'hover:bg-muted text-foreground'
                  }`}
                >
                  <span>{ui.gallery.allAlbums}</span>
                  <span className="text-xs text-muted-foreground">{pictures.length}</span>
                </button>

                {galleryAlbums.map((albumName) => {
                  const albumNode = galleryAlbumTree.get(albumName);
                  if (!albumNode) return null;
                  
                  const subalbums = Array.from(albumNode.children.entries());
                  const hasSubalbums = subalbums.length > 0;
                  const isExpanded = expandedGalleryAlbums.has(albumName);
                  
                  const renderSubalbums = (subalbs: [string, AlbumNode][], level: number = 1): JSX.Element => {
                    return (
                      <>
                        {subalbs.map(([subName, subNode]) => {
                          const subPath = subNode.fullPath;
                          const hasChildren = subNode.children && subNode.children.size > 0;
                          const isSubExpanded = expandedGalleryAlbums.has(subPath);
                          
                          return (
                            <div key={subPath} className="space-y-1">
                              <div className="flex items-center gap-1" style={{ paddingLeft: `${level * 8}px` }}>
                                {hasChildren && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const newExpanded = new Set(expandedGalleryAlbums);
                                      if (isSubExpanded) {
                                        newExpanded.delete(subPath);
                                      } else {
                                        newExpanded.add(subPath);
                                      }
                                      setExpandedGalleryAlbums(newExpanded);
                                    }}
                                    className="p-1 hover:bg-muted rounded transition-colors flex-shrink-0"
                                  >
                                    {isSubExpanded ? (
                                      <ChevronDown className="w-3 h-3 text-muted-foreground" />
                                    ) : (
                                      <ChevronRight className="w-3 h-3 text-muted-foreground" />
                                    )}
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    setSelectedAlbum(subPath);
                                    setGalleryPage(1);
                                  }}
                                  className={`flex-1 flex items-center justify-between px-2 py-1 rounded-lg text-xs transition-all ${
                                    selectedAlbum === subPath ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                  } ${!hasChildren ? 'ml-4' : ''}`}
                                >
                                  <span>{subName}</span>
                                  <span className="text-xs opacity-60">{subNode.count}</span>
                                </button>
                              </div>
                              {hasChildren && isSubExpanded && (
                                <div className="space-y-1">
                                  {renderSubalbums(Array.from(subNode.children.entries()), level + 1)}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </>
                    );
                  };
                  
                  return (
                    <div key={albumName} className="space-y-1">
                      <div className="flex items-center gap-1">
                        {hasSubalbums && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const newExpanded = new Set(expandedGalleryAlbums);
                              if (isExpanded) {
                                  newExpanded.delete(albumName);
                              } else {
                                  newExpanded.add(albumName);
                              }
                              setExpandedGalleryAlbums(newExpanded);
                            }}
                            className="p-1 hover:bg-muted rounded transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedAlbum(albumNode.fullPath);
                            setGalleryPage(1);
                          }}
                          className={`flex-1 flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                            selectedAlbum === albumNode.fullPath
                              ? 'neu-sm bg-primary/10 text-primary'
                              : 'hover:bg-muted text-foreground'
                          } ${!hasSubalbums ? 'ml-5' : ''}`}
                        >
                          <span>{albumName}</span>
                          <span className="text-xs text-muted-foreground">{albumNode.count}</span>
                        </button>
                      </div>
                      {hasSubalbums && isExpanded && (
                        <div className="ml-4 space-y-1">
                          {renderSubalbums(subalbums)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </aside>

            {/* Gallery Grid */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {paginatedGallery.map((pic) => (
                  <button
                    key={pic.id}
                    className="relative overflow-hidden rounded-2xl neu card-hover aspect-square"
                    onClick={() => handleOpenPicture(pictures.indexOf(pic), pic.id)}
                  >
                    <img src={pic.thumbnailPath || pic.imagePath} alt={pic.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity p-3 text-white text-xs flex items-end">
                      <div className="font-medium">{pic.title}</div>
                    </div>
                  </button>
                ))}
              </div>

              <SectionPagination currentPage={galleryPage} totalPages={totalGalleryPages} onPageChange={setGalleryPage} />
            </div>
          </div>
        )}
      </section>

      {/* Lightbox Modal */}
      {lightbox && pictures[lightbox.idx] && (
        <div
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex items-center justify-center animate-fade-in"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 neu p-3 rounded-xl bg-card z-10"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigateLightbox('prev');
            }}
            className="absolute left-6 top-1/2 -translate-y-1/2 neu p-3 rounded-xl bg-card z-10"
            aria-label="Previous"
          >
            <X className="w-6 h-6 rotate-180" /> {/* substitute for ArrowLeft */}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigateLightbox('next');
            }}
            className="absolute right-6 top-1/2 -translate-y-1/2 neu p-3 rounded-xl bg-card z-10"
            aria-label="Next"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
          <div
            className="max-w-5xl max-h-[80vh] w-full mx-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-video bg-gradient-hero rounded-3xl neu flex items-center justify-center overflow-hidden">
              <img
                src={pictures[lightbox.idx].imagePath}
                alt={pictures[lightbox.idx].title}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="mt-3 text-center text-muted-foreground">{pictures[lightbox.idx].title}</div>
          </div>
        </div>
      )}
    </>
  );
}
