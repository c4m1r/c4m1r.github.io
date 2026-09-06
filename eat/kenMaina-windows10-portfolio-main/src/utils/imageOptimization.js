/**
 * Image Optimization Utility
 * Provides lazy loading, responsive images, and image compression strategies
 */

/**
 * Lazy load image with intersection observer
 * @param {string} src - Image source URL
 * @param {string} placeholder - Placeholder image or color
 * @returns {object} - Object with loading state
 */
export const lazyLoadImage = (src, placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3C/svg%3E') => {
  return {
    src,
    placeholder,
    loading: 'lazy'
  };
};

/**
 * Generate responsive image srcset for different screen sizes
 * @param {string} imagePath - Base image path without extension
 * @param {string} ext - File extension (jpg, png, webp, etc)
 * @returns {string} - srcset string for img tag
 */
export const generateSrcSet = (imagePath, ext = 'jpg') => {
  return `${imagePath}-small.${ext} 480w, ${imagePath}-medium.${ext} 768w, ${imagePath}-large.${ext} 1200w`;
};

/**
 * Create optimized image URL with compression parameters
 * Useful for external images or CDN integration
 * @param {string} imageUrl - Original image URL
 * @param {number} quality - Quality from 1-100 (default 80)
 * @param {number} width - Optional width for resizing
 * @returns {string} - Optimized image URL
 */
export const optimizeImageUrl = (imageUrl, quality = 80, width = null) => {
  // For Netlify CDN image transformation
  if (imageUrl && imageUrl.includes('netlify')) {
    const params = [`q=${quality}`];
    if (width) params.push(`w=${width}`);
    return `${imageUrl}?${params.join('&')}`;
  }
  return imageUrl;
};

/**
 * Preload critical images
 * Call this for above-the-fold images
 * @param {array} imageSources - Array of image URLs to preload
 */
export const preloadImages = (imageSources) => {
  if (typeof window !== 'undefined') {
    imageSources.forEach((src) => {
      if (src) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
      }
    });
  }
};

/**
 * Progressive image loading with blur-up effect
 * Loads low-quality placeholder first, then full quality
 * @param {string} lowQualitySrc - Low quality/blurred image src
 * @param {string} highQualitySrc - High quality image src
 * @returns {object} - Object with both sources
 */
export const progressiveImage = (lowQualitySrc, highQualitySrc) => {
  return {
    blur: lowQualitySrc,
    full: highQualitySrc
  };
};

/**
 * Cache buster for improved cache control
 * Appends version hash to prevent stale cache
 * @param {string} imageUrl - Image URL
 * @param {string} version - Version hash (e.g., from package.json or git hash)
 * @returns {string} - URL with cache buster
 */
export const addCacheBuster = (imageUrl, version = 'v1') => {
  const separator = imageUrl.includes('?') ? '&' : '?';
  return `${imageUrl}${separator}${version}`;
};

/**
 * Convert image to WebP format with fallback
 * @param {string} originalSrc - Original image source
 * @param {string} webpSrc - WebP version source
 * @returns {object} - Object with both formats
 */
export const webpFallback = (originalSrc, webpSrc) => {
  return {
    webp: webpSrc,
    original: originalSrc
  };
};
