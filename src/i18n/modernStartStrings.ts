import type { Language } from './translations';

/**
 * Strings of the Windows 10 and Windows 11 Start menus. Every key has all nine interface languages;
 * the lookup falls back to English.
 */
const MODERN_START_STRINGS = {
  start: {
    en: 'Start', ru: 'Пуск', fr: 'Démarrer', es: 'Inicio', zh: '开始', ja: 'スタート', ko: '시작', be: 'Пуск', kk: 'Бастау',
  },
  mostUsed: {
    en: 'Most used', ru: 'Часто используемые', fr: 'Les plus utilisées', es: 'Más usadas', zh: '最常用',
    ja: 'よく使うアプリ', ko: '가장 많이 사용', be: 'Часта выкарыстоўваюцца', kk: 'Жиі қолданылатындар',
  },
  allApps: {
    en: 'All apps', ru: 'Все приложения', fr: 'Toutes les applications', es: 'Todas las aplicaciones', zh: '所有应用',
    ja: 'すべてのアプリ', ko: '모든 앱', be: 'Усе праграмы', kk: 'Барлық қолданбалар',
  },
  pinned: {
    en: 'Pinned', ru: 'Закреплено', fr: 'Épinglé', es: 'Anclado', zh: '已固定', ja: 'ピン留め済み', ko: '고정됨', be: 'Замацавана', kk: 'Бекітілген',
  },
  recommended: {
    en: 'Recommended', ru: 'Рекомендуем', fr: 'Recommandé', es: 'Recomendado', zh: '推荐的项目',
    ja: 'おすすめ', ko: '추천', be: 'Рэкамендуем', kk: 'Ұсынылған',
  },
  folder: {
    en: 'Folder', ru: 'Папка', fr: 'Dossier', es: 'Carpeta', zh: '文件夹', ja: 'フォルダー', ko: '폴더', be: 'Папка', kk: 'Қалта',
  },
  recentlyAdded: {
    en: 'Recently added', ru: 'Недавно добавлено', fr: 'Récemment ajouté', es: 'Agregado recientemente', zh: '最近添加',
    ja: '最近追加', ko: '최근에 추가됨', be: 'Нядаўна дададзена', kk: 'Жақында қосылған',
  },
  back: {
    en: 'Back', ru: 'Назад', fr: 'Retour', es: 'Atrás', zh: '返回', ja: '戻る', ko: '뒤로', be: 'Назад', kk: 'Артқа',
  },
  lifeAtAGlance: {
    en: 'Life at a glance', ru: 'События и повседневные дела', fr: 'La vie en un coup d’œil', es: 'Vida de un vistazo', zh: '生活动态',
    ja: '一目でわかる', ko: '한눈에 보기', be: 'Жыццё ў двух словах', kk: 'Бір қарағанда',
  },
  playAndExplore: {
    en: 'Play and explore', ru: 'Игры и развлечения', fr: 'Jouer et explorer', es: 'Juego y exploración', zh: '播放和浏览',
    ja: 'ゲームと探索', ko: '게임 및 탐색', be: 'Гульні і агляд', kk: 'Ойын және зерттеу',
  },
  documents: {
    en: 'Documents', ru: 'Документы', fr: 'Documents', es: 'Documentos', zh: '文档', ja: 'ドキュメント', ko: '문서', be: 'Дакументы', kk: 'Құжаттар',
  },
  pictures: {
    en: 'Pictures', ru: 'Изображения', fr: 'Images', es: 'Imágenes', zh: '图片', ja: 'ピクチャ', ko: '사진', be: 'Малюнкі', kk: 'Суреттер',
  },
  settings: {
    en: 'Settings', ru: 'Параметры', fr: 'Paramètres', es: 'Configuración', zh: '设置', ja: '設定', ko: '설정', be: 'Налады', kk: 'Параметрлер',
  },
  power: {
    en: 'Power', ru: 'Выключение', fr: 'Alimentation', es: 'Inicio/apagado', zh: '电源', ja: '電源', ko: '전원', be: 'Выключэнне', kk: 'Қуат',
  },
  signOut: {
    en: 'Sign out', ru: 'Выход', fr: 'Se déconnecter', es: 'Cerrar sesión', zh: '注销', ja: 'サインアウト', ko: '로그아웃', be: 'Выйсці', kk: 'Шығу',
  },
  shutDown: {
    en: 'Shut down', ru: 'Завершение работы', fr: 'Arrêter', es: 'Apagar', zh: '关机', ja: 'シャットダウン', ko: '시스템 종료', be: 'Завяршэнне працы', kk: 'Өшіру',
  },
  typeToSearch: {
    en: 'Type here to search', ru: 'Введите здесь для поиска', fr: 'Taper ici pour rechercher', es: 'Escribe aquí para buscar', zh: '在此键入以搜索',
    ja: 'ここに入力して検索', ko: '여기에 입력하여 검색', be: 'Увядзіце тут для пошуку', kk: 'Іздеу үшін осында теріңіз',
  },
} as const;

export type ModernStartStringKey = keyof typeof MODERN_START_STRINGS;

export function modernStartText(language: Language | string, key: ModernStartStringKey): string {
  const entry: Record<string, string> = MODERN_START_STRINGS[key];
  const code = language.split('-')[0];
  return entry[code] ?? entry.en;
}
