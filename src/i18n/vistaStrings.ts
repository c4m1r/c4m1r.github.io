import type { Language } from './translations';

/**
 * UI strings added with the Windows Vista skin (Sidebar, Welcome screen, Start menu, Explorer).
 * Every key has all nine interface languages; the lookup falls back to English.
 */
const VISTA_STRINGS = {
  addGadgets: {
    en: 'Add gadgets', ru: 'Добавить гаджеты', fr: 'Ajouter des gadgets', es: 'Agregar gadgets', zh: '添加小工具',
    ja: 'ガジェットを追加', ko: '가젯 추가', be: 'Дадаць гаджэты', kk: 'Гаджеттер қосу',
  },
  headlines: {
    en: 'View headlines', ru: 'Заголовки новостей', fr: 'Voir les titres', es: 'Ver titulares', zh: '查看头条',
    ja: '見出しを表示', ko: '헤드라인 보기', be: 'Загалоўкі навін', kk: 'Жаңалық тақырыптары',
  },
  welcome: {
    en: 'Welcome', ru: 'Добро пожаловать', fr: 'Bienvenue', es: 'Bienvenido', zh: '欢迎',
    ja: 'ようこそ', ko: '환영합니다', be: 'Сардэчна запрашаем', kk: 'Қош келдіңіз',
  },
  sidebar: {
    en: 'Windows Sidebar', ru: 'Боковая панель Windows', fr: 'Barre latérale Windows', es: 'Barra lateral de Windows', zh: 'Windows 边栏',
    ja: 'Windows サイドバー', ko: 'Windows 사이드바', be: 'Бакавая панэль Windows', kk: 'Windows бүйір панелі',
  },
  sidebarToggle: {
    en: 'Windows Vista Sidebar', ru: 'Боковая панель Windows Vista', fr: 'Barre latérale de Windows Vista', es: 'Barra lateral de Windows Vista', zh: 'Windows Vista 边栏',
    ja: 'Windows Vista サイドバー', ko: 'Windows Vista 사이드바', be: 'Бакавая панэль Windows Vista', kk: 'Windows Vista бүйір панелі',
  },
  sidebarToggleHint: {
    en: 'Off switches to the alternative widget skin below', ru: 'Выкл. — альтернативный скин виджетов ниже',
    fr: 'Désactiver affiche le thème de widgets alternatif ci-dessous', es: 'Desactivar cambia al estilo alternativo de widgets de abajo',
    zh: '关闭则切换到下方的备用小组件样式', ja: 'オフにすると下の代替ウィジェットスキンに切り替わります',
    ko: '끄면 아래의 대체 위젯 스킨으로 전환됩니다', be: 'Выключэнне пераключае на альтэрнатыўны скін віджэтаў ніжэй',
    kk: 'Өшірсе, төмендегі балама виджет скиніне ауысады',
  },
  startSearch: {
    en: 'Start Search', ru: 'Начать поиск', fr: 'Rechercher', es: 'Iniciar búsqueda', zh: '开始搜索',
    ja: 'スタートの検索', ko: '시작 검색', be: 'Пачаць пошук', kk: 'Іздеуді бастау',
  },
  internet: {
    en: 'Internet', ru: 'Интернет', fr: 'Internet', es: 'Internet', zh: '互联网',
    ja: 'インターネット', ko: '인터넷', be: 'Інтэрнэт', kk: 'Интернет',
  },
  email: {
    en: 'E-mail', ru: 'Электронная почта', fr: 'Messagerie', es: 'Correo', zh: '电子邮件',
    ja: 'メール', ko: '이메일', be: 'Электронная пошта', kk: 'Электрондық пошта',
  },
  windowsMail: {
    en: 'Windows Mail', ru: 'Почта Windows', fr: 'Courrier Windows', es: 'Correo de Windows', zh: 'Windows 邮件',
    ja: 'Windows メール', ko: 'Windows 메일', be: 'Пошта Windows', kk: 'Windows поштасы',
  },
  recentItems: {
    en: 'Recent Items', ru: 'Недавние документы', fr: 'Éléments récents', es: 'Elementos recientes', zh: '最近使用的项目',
    ja: '最近使った項目', ko: '최근 항목', be: 'Нядаўнія дакументы', kk: 'Соңғы элементтер',
  },
  network: {
    en: 'Network', ru: 'Сеть', fr: 'Réseau', es: 'Red', zh: '网络',
    ja: 'ネットワーク', ko: '네트워크', be: 'Сетка', kk: 'Желі',
  },
  connectTo: {
    en: 'Connect To', ru: 'Подключение', fr: 'Se connecter à', es: 'Conectar a', zh: '连接到',
    ja: '接続先', ko: '연결 대상', be: 'Падключэнне', kk: 'Қосылу',
  },
  navigation: {
    en: 'Navigation', ru: 'Навигация', fr: 'Navigation', es: 'Navegación', zh: '导航',
    ja: 'ナビゲーション', ko: '탐색', be: 'Навігацыя', kk: 'Шарлау',
  },
  back: {
    en: 'Back', ru: 'Назад', fr: 'Précédent', es: 'Atrás', zh: '后退',
    ja: '戻る', ko: '뒤로', be: 'Назад', kk: 'Артқа',
  },
  forward: {
    en: 'Forward', ru: 'Вперёд', fr: 'Suivant', es: 'Adelante', zh: '前进',
    ja: '進む', ko: '앞으로', be: 'Наперад', kk: 'Алға',
  },
  search: {
    en: 'Search', ru: 'Поиск', fr: 'Rechercher', es: 'Buscar', zh: '搜索',
    ja: '検索', ko: '검색', be: 'Пошук', kk: 'Іздеу',
  },
  searchFolder: {
    en: 'Search this folder', ru: 'Поиск в текущей папке', fr: 'Rechercher dans ce dossier', es: 'Buscar en esta carpeta', zh: '在此文件夹中搜索',
    ja: 'このフォルダー内を検索', ko: '이 폴더에서 검색', be: 'Пошук у гэтай папцы', kk: 'Осы қалтада іздеу',
  },
  favoriteLinks: {
    en: 'Favorite Links', ru: 'Избранные ссылки', fr: 'Liens favoris', es: 'Vínculos favoritos', zh: '收藏链接',
    ja: 'お気に入りリンク', ko: '즐겨찾기 링크', be: 'Абраныя спасылкі', kk: 'Таңдаулы сілтемелер',
  },
  documents: {
    en: 'Documents', ru: 'Документы', fr: 'Documents', es: 'Documentos', zh: '文档',
    ja: 'ドキュメント', ko: '문서', be: 'Дакументы', kk: 'Құжаттар',
  },
  pictures: {
    en: 'Pictures', ru: 'Изображения', fr: 'Images', es: 'Imágenes', zh: '图片',
    ja: 'ピクチャ', ko: '사진', be: 'Выявы', kk: 'Суреттер',
  },
  music: {
    en: 'Music', ru: 'Музыка', fr: 'Musique', es: 'Música', zh: '音乐',
    ja: 'ミュージック', ko: '음악', be: 'Музыка', kk: 'Музыка',
  },
  computer: {
    en: 'Computer', ru: 'Компьютер', fr: 'Ordinateur', es: 'Equipo', zh: '计算机',
    ja: 'コンピューター', ko: '컴퓨터', be: 'Камп’ютар', kk: 'Компьютер',
  },
} as const;

export type VistaStringKey = keyof typeof VISTA_STRINGS;

/** Returns the Vista UI string for the language, falling back to English. */
export function vistaText(language: Language | string, key: VistaStringKey): string {
  const entry: Record<string, string> = VISTA_STRINGS[key];
  const code = language.split('-')[0];
  return entry[code] ?? entry.en;
}
