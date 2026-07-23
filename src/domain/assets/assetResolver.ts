const imageModules = import.meta.glob('/src/content/pictures/**/*.{jpg,jpeg,png,gif,webp}', {
  query: '?url',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export function findAssetByFilename(filename: string): string | null {
  for (const modulePath in imageModules) {
    if (modulePath.endsWith(filename)) {
      return imageModules[modulePath];
    }
  }

  return null;
}

export function getPictureAssetEntries(): [string, string][] {
  return Object.entries(imageModules);
}

/**
 * Resolves a markdown image path to the Vite asset URL registered for the file.
 */
export function resolveImagePath(imagePath: string): string {
  if (!imagePath) return '';

  if (imagePath.startsWith('blob:') || imagePath.startsWith('http') || imagePath.startsWith('/assets/')) {
    return imagePath;
  }

  try {
    const filename = imagePath.split('/').pop();
    if (!filename) return imagePath;

    const resolvedUrl = findAssetByFilename(filename);
    if (resolvedUrl) {
      console.log(`✅ Resolved image: ${imagePath} -> ${resolvedUrl}`);
      return resolvedUrl;
    }

    console.warn(`⚠️ Image not found in modules: ${imagePath} (looking for: ${filename})`);
  } catch (error) {
    console.error('❌ Failed to resolve image path:', imagePath, error);
  }

  return imagePath;
}
