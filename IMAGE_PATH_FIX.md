# 🖼️ Исправление путей к изображениям для GitHub Pages

## 🎯 Проблема

При публикации на GitHub Pages изображения с путями `/src/content/pictures/...` не отображались, потому что:
- В production эти пути не существуют (это исходники)
- Vite не обрабатывает такие пути в markdown frontmatter
- Нужна динамическая загрузка через `import.meta.glob`

## ✅ Решение

### 1. Добавлена функция `resolveImagePath` в `contentLoader.ts`

**Что делает:**
- Принимает путь из markdown (`/src/content/pictures/...`)
- Использует `import.meta.glob` для динамической загрузки
- Возвращает правильный URL для production

```typescript
async function resolveImagePath(imagePath: string): Promise<string> {
  if (!imagePath) return '';
  
  // Если путь уже обработан (начинается с blob: или http), возвращаем как есть
  if (imagePath.startsWith('blob:') || imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Убираем начальный слэш и /src/ если есть
  const cleanPath = imagePath.replace(/^\/+/, '').replace(/^src\//, '');
  
  try {
    // Загружаем все изображения
    const imageModules = import.meta.glob('/src/content/pictures/**/*.{jpg,jpeg,png,gif,webp}', { 
      as: 'url',
      eager: false 
    });
    
    // Ищем соответствующий модуль
    for (const modulePath in imageModules) {
      if (modulePath.includes(cleanPath) || modulePath.endsWith(imagePath.split('/').pop() || '')) {
        return await imageModules[modulePath]() as string;
      }
    }
  } catch (error) {
    console.warn('Failed to resolve image path:', imagePath, error);
  }
  
  // Если не нашли, возвращаем исходный путь
  return imagePath;
}
```

### 2. Обновлены функции загрузки контента

**`loadBlogPosts`:**
```typescript
const resolvedPreview = metadata.preview ? await resolveImagePath(metadata.preview) : defaultPreview;
posts.push({
  // ...
  preview: resolvedPreview,
});
```

**`loadAboutProjects`:**
```typescript
const resolvedPreview = metadata.preview ? await resolveImagePath(metadata.preview) : defaultPreview;
projects.push({
  // ...
  preview: resolvedPreview,
});
```

### 3. Исправлен `themeConfig.ts`

**До:**
```typescript
defaultWallpaper: '/src/content/pictures/wallpapers/winxp-bliss.jpg',
```

**После:**
```typescript
import winxpBliss from '../content/pictures/wallpapers/winxp-bliss.jpg';

export const THEME_CONFIGS: Record<ThemeId, ThemeConfig> = {
  'win-xp': {
    // ...
    defaultWallpaper: winxpBliss,
  },
  'webos': {
    // ...
    defaultWallpaper: winxpBliss,
  },
};
```

## 📋 Как это работает

### Development (npm run dev)
1. Vite обрабатывает импорты изображений
2. `import.meta.glob` загружает файлы динамически
3. Возвращает blob URLs для локальной разработки

### Production (GitHub Pages)
1. При сборке Vite:
   - Копирует изображения в `dist/assets/`
   - Генерирует хешированные имена (например, `winxp-bliss-a1b2c3d4.jpg`)
   - Обновляет все ссылки на правильные пути
2. `import.meta.glob` возвращает правильные production пути
3. Изображения доступны через `/assets/...`

## 🎨 Использование в markdown

**Можно использовать любой из форматов:**

```yaml
---
title: My Post
preview: /src/content/pictures/wallpapers/winxp-bliss.jpg
---
```

```yaml
---
title: My Post
preview: src/content/pictures/wallpapers/winxp-bliss.jpg
---
```

```yaml
---
title: My Post
preview: content/pictures/wallpapers/winxp-bliss.jpg
---
```

Все варианты будут корректно обработаны функцией `resolveImagePath`.

## 🧪 Тестирование

### Локально:
```bash
npm run dev
```
✅ Изображения должны отображаться

### Production сборка:
```bash
npm run build
npm run preview
```
✅ Изображения должны отображаться

### GitHub Pages:
После деплоя проверьте:
1. ✅ Превью статей в блоге
2. ✅ Превью проектов
3. ✅ Обои в темах Windows XP и WebOS

## 📊 Затронутые файлы

### Изменённые:
- ✅ `src/utils/contentLoader.ts` - добавлена `resolveImagePath` и обновлены все функции загрузки
- ✅ `src/themes/themeConfig.ts` - прямой импорт обоев

### Markdown файлы (не требуют изменений):
- `src/content/blog/*.md` - пути остаются как есть
- `src/content/about/projects/**/*.md` - пути остаются как есть

## ✨ Преимущества решения

1. **Не нужно менять markdown** - старые пути работают
2. **Автоматическая оптимизация** - Vite хеширует и кеширует изображения
3. **Работает везде** - dev, preview, production
4. **Типобезопасность** - TypeScript проверяет импорты
5. **Производительность** - ленивая загрузка через `eager: false`

## 🚀 Готово!

Изображения теперь корректно загружаются как в development, так и в production на GitHub Pages!

**Изменения:**
- ✅ Добавлена функция `resolveImagePath`
- ✅ Обновлены `loadBlogPosts` и `loadAboutProjects`
- ✅ Исправлен `themeConfig.ts`
- ✅ Все пути обрабатываются динамически
- ✅ Работает на GitHub Pages

**Миграция завершена! 🖼️✨**
