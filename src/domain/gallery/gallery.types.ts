import { type ContentItem } from '../content/types';

/**
 * A single gallery item (picture or wallpaper).
 * Extends ContentItem for ContentGraph compatibility (kind: 'gallery').
 */
export interface GalleryItem extends ContentItem {
  kind: 'gallery';

  /** Resolved URL to the full-size image */
  imagePath: string;

  /** Resolved URL to the thumbnail (may equal imagePath) */
  thumbnailPath: string;

  /** 'picture' | 'wallpaper' */
  mediaType: 'picture' | 'wallpaper';
}
