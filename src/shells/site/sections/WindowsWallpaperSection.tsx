import { useApp } from '../../../contexts/useApp';
import { useGallery } from '../../../domain/gallery/useGallery';
import { WINDOWS_WALLPAPER_OS } from '../../../domain/gallery/windowsWallpapers';
import { windowsWallpaperText } from '../../../i18n/windowsWallpaperStrings';

/**
 * Windows wallpapers grouped by Windows version (the tag set by the gallery loader), in release order.
 * Each image opens at full size in a new tab.
 */
export function WindowsWallpaperSection() {
  const { wallpapers, loading } = useGallery();
  const { language } = useApp();

  if (loading) return null;

  const groups = Object.values(WINDOWS_WALLPAPER_OS)
    .map((label) => ({
      label,
      items: wallpapers.filter((item) => item.tags?.includes(label)),
    }))
    .filter((group) => group.items.length > 0);

  if (groups.length === 0) return null;

  return (
    <section className="container mx-auto px-6 py-16" aria-labelledby="windows-wallpaper-heading">
      <div className="mb-10">
        <h2 id="windows-wallpaper-heading" className="text-3xl md:text-4xl font-bold mb-2">
          {windowsWallpaperText(language, 'heading')}
        </h2>
        <p className="text-muted-foreground">{windowsWallpaperText(language, 'subtitle')}</p>
      </div>

      {groups.map((group) => (
        <div key={group.label} className="mb-12">
          <h3 className="text-xl font-semibold mb-4">
            {group.label} <span className="text-muted-foreground font-normal">({group.items.length})</span>
          </h3>
          <ul className="grid grid-cols-2 md:grid-cols-4 gap-4 list-none p-0">
            {group.items.map((item) => (
              <li key={item.id}>
                <a
                  href={item.imagePath}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-2xl overflow-hidden neu bg-card"
                  aria-label={`${item.title} — ${windowsWallpaperText(language, 'openImage')}`}
                >
                  <img
                    src={item.thumbnailPath}
                    alt={item.title}
                    loading="lazy"
                    className="w-full aspect-video object-cover"
                  />
                  <span className="block p-2 text-sm truncate">{item.title}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
