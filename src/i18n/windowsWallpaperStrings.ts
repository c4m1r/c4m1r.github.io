import type { Language } from './translations';

/**
 * Strings of the site's Windows wallpaper gallery section. Every key has all nine interface languages;
 * the lookup falls back to English.
 */
const WINDOWS_WALLPAPER_STRINGS = {
  heading: {
    en: 'Windows wallpapers', ru: 'Обои Windows', fr: 'Fonds d’écran Windows', es: 'Fondos de pantalla de Windows', zh: 'Windows 壁纸',
    ja: 'Windows の壁紙', ko: 'Windows 배경화면', be: 'Шпалеры Windows', kk: 'Windows тұсқағаздары',
  },
  subtitle: {
    en: 'Desktop wallpapers and backgrounds from each Windows version, grouped by version. Open an image to see it at full size.',
    ru: 'Фоновые рисунки рабочего стола каждой версии Windows, сгруппированные по версии. Откройте изображение, чтобы увидеть его в полном размере.',
    fr: 'Fonds d’écran du bureau et arrière-plans de chaque version de Windows, regroupés par version. Ouvrez une image pour la voir en taille réelle.',
    es: 'Fondos de escritorio y fondos de cada versión de Windows, agrupados por versión. Abra una imagen para verla a tamaño completo.',
    zh: '各版本 Windows 的桌面壁纸和背景，按版本分组。打开图片可查看完整尺寸。',
    ja: '各バージョンの Windows のデスクトップ壁紙と背景です。バージョンごとにまとめています。画像を開くと原寸で表示されます。',
    ko: '각 Windows 버전의 바탕 화면 배경화면과 배경 이미지입니다. 버전별로 묶여 있습니다. 이미지를 열면 원래 크기로 볼 수 있습니다.',
    be: 'Фонавыя малюнкі працоўнага стала кожнай версіі Windows, згрупаваныя па версіі. Адкрыйце малюнак, каб убачыць яго ў поўным памеры.',
    kk: 'Әр Windows нұсқасының жұмыс үстелі фондық суреттері, нұсқа бойынша топтастырылған. Суретті ашып, толық өлшемде қараңыз.',
  },
  openImage: {
    en: 'Open full size', ru: 'Открыть в полном размере', fr: 'Ouvrir en taille réelle', es: 'Abrir a tamaño completo', zh: '以完整尺寸打开',
    ja: '原寸で開く', ko: '원래 크기로 열기', be: 'Адкрыць у поўным памеры', kk: 'Толық өлшемде ашу',
  },
} as const;

/** Names of the tags written under each wallpaper. The English tag is the key used in the catalogue. */
const WINDOWS_WALLPAPER_TAG_NAMES: Record<string, Record<string, string>> = {
  default: {
    en: 'default', ru: 'по умолчанию', fr: 'par défaut', es: 'predeterminado', zh: '默认', ja: '標準', ko: '기본', be: 'стандартны', kk: 'әдепкі',
  },
  'theme background': {
    en: 'theme background', ru: 'фон темы', fr: 'arrière-plan du thème', es: 'fondo del tema', zh: '主题背景', ja: 'テーマの背景', ko: '테마 배경', be: 'фон тэмы', kk: 'тақырып фоны',
  },
  logon: {
    en: 'logon', ru: 'вход в систему', fr: 'ouverture de session', es: 'inicio de sesión', zh: '登录', ja: 'ログオン', ko: '로그온', be: 'уваход у сістэму', kk: 'жүйеге кіру',
  },
  'lock screen': {
    en: 'lock screen', ru: 'экран блокировки', fr: 'écran de verrouillage', es: 'pantalla de bloqueo', zh: '锁屏', ja: 'ロック画面', ko: '잠금 화면', be: 'экран блакіроўкі', kk: 'құлып экраны',
  },
};

export function windowsWallpaperTagText(language: Language | string, tag: string): string {
  const entry = WINDOWS_WALLPAPER_TAG_NAMES[tag];
  if (!entry) return tag;
  const code = language.split('-')[0];
  return entry[code] ?? entry.en;
}

export type WindowsWallpaperStringKey = keyof typeof WINDOWS_WALLPAPER_STRINGS;

export function windowsWallpaperText(language: Language | string, key: WindowsWallpaperStringKey): string {
  const entry: Record<string, string> = WINDOWS_WALLPAPER_STRINGS[key];
  const code = language.split('-')[0];
  return entry[code] ?? entry.en;
}
