import { useEffect, useMemo, useState } from 'react';
import {
  Grid3x3,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  Filter,
  Search,
  Image as ImageIcon,
  Tag,
  User,
  FileText,
  Briefcase,
  Layers,
  Play,
  X,
  Scale,
  Folder,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import {
  loadAppEntries,
  loadAboutMe,
  loadLegalNotice,
  type AppCategoryId,
  type AppEntry,
  type ContentItem,
  type ImageItem,
} from '../utils/contentLoader';
import { loadPictureItems } from '../domain/gallery/gallery.loader';
import { loadArticles } from '../domain/articles/articles.loader';
import { loadWikiArticles, loadWikiCategoryIndex } from '../domain/wiki/wiki.loader';
import { loadAllProjects } from '../domain/projects/projects.loader';
import { type Language } from '../i18n/translations';
import { useApp } from '../contexts/AppContext';
import { stripMarkdown, markdownToHtml } from '../domain/content/markdown';
import { loadCvLocale } from '../domain/resume/resume.loader';
import { Navigation } from '../components/Navigation';
import { SectionCard } from '../components/SectionCard';
import { ContentCard } from '../components/ContentCard';
import { ContentReader } from '../components/ContentReader';
import { Footer } from '../components/Footer';
import { Hero } from '../components/Hero';
import { NewsSection } from '../shells/site/sections/NewsSection';
import { ProjectsSection } from '../shells/site/sections/ProjectsSection';
import { GallerySection } from '../shells/site/sections/GallerySection';
import { useProjects } from '../domain/projects/useProjects';
import { useGallery } from '../domain/gallery/useGallery';
import { useNews } from '../domain/news/useNews';
import { type NewsItem } from '../domain/news/news.types';
import { markdownToHtml as _markdownToHtml } from '../domain/content/markdown';

type Section = 'home' | 'about' | 'wiki' | 'cv' | 'gallery' | 'blog' | 'search' | 'project' | 'apps' | 'news';
type NavSection = 'home' | 'about' | 'wiki' | 'gallery' | 'blog' | 'search' | 'apps' | 'news';

interface BlogPostView extends ContentItem {
  excerpt: string;
  readingTime: string;
  html: string;
}

interface WikiView extends ContentItem {
  excerpt: string;
  html: string;
  categoryPath: string;
}

type SectionNav = 'home' | 'about' | 'wiki' | 'cv' | 'gallery' | 'blog' | 'search' | 'apps' | 'news';

type UiText = {
  nav: Record<SectionNav, string> & { legal: string };
  heroTitle: string;
  heroSubtitle: string;
  searchPlaceholder: string;
  categories: string;
  tags: string;
  loading: string;
  nothing: string;
  back: string;
  nowReading: string;
  galleryTitle: string;
  wikiTitle: string;
  cvTitle: string;
  aboutTitle: string;
  projectsTitle: string;
  sections: {
    explore: string;
    exploreSubtitle: string;
  };
  apps: {
    title: string;
    subtitle: string;
    selectPrompt: string;
    descriptionLabel: string;
    platformsLabel: string;
    technologiesLabel: string;
    badgesLabel: string;
    dateLabel: string;
    openFullLabel: string;
    categories: Record<AppCategoryId, string>;
  };
  latestPosts: {
    title: string;
    subtitle: string;
    viewAll: string;
  };
  cta: {
    letsCreate: string;
    together: string;
    description: string;
    getInTouch: string;
  };
  blog: {
    title: string;
    subtitle: string;
    description: string;
  };
  wiki: {
    description: string;
  };
  cv: {
    experience: string;
    education: string;
    prototypes: string;
    rewards: string;
    print: string;
    downloadPdf: string;
    viewDemo: string;
  };
  about: {
    description: string;
  };
  gallery: {
    description: string;
    allAlbums: string;
  };
  search: {
    title: string;
    subtitle: string;
    placeholder: string;
    allContent: string;
    results: string;
  };
  stats: {
    blogPosts: string;
    wikiArticles: string;
    galleryImages: string;
    projects: string;
  };
};

const basePath = '/site/';
const APP_CATEGORIES: AppCategoryId[] = ['ready', 'prototype', 'webos-emulation'];

const uiTexts: Record<Language, UiText> = {
  en: {
    nav: { home: 'Home', about: 'About', wiki: 'Wiki', cv: 'CV', gallery: 'Gallery', blog: 'Blog', apps: 'Apps', search: 'Search', news: 'News', legal: 'Legal Notice' },
    heroTitle: 'IT Engineer',
    heroSubtitle: 'Building beautiful digital experiences with code, creativity, and passion. Explore my work, thoughts, and knowledge base.',
    searchPlaceholder: 'Search articles...',
    categories: 'Categories',
    tags: 'Tags',
    loading: 'Loading...',
    nothing: 'Nothing found.',
    back: 'Back',
    nowReading: 'Reading now',
    galleryTitle: 'Gallery',
    wikiTitle: 'Wiki',
    cvTitle: 'CV (Резюме:)',
    aboutTitle: 'About me',
    projectsTitle: 'Projects:',
    sections: {
      explore: 'Explore My World',
      exploreSubtitle: 'Dive into different aspects of my work and interests',
    },
    apps: {
      title: 'Apps',
      subtitle: 'Demonstration of my projects',
      selectPrompt: 'Select an app to load it in the center window.',
      descriptionLabel: 'Description',
      platformsLabel: 'Platforms',
      technologiesLabel: 'Technologies',
      badgesLabel: 'Tags',
      dateLabel: 'Date',
      openFullLabel: 'Open Full',
      categories: {
        ready: 'Ready applications',
        prototype: 'Prototype experiments',
        'webos-emulation': 'WebOS Emulation',
      },
    },
    latestPosts: {
      title: 'Latest Posts',
      subtitle: 'Fresh thoughts and insights',
      viewAll: 'View All',
    },
    cta: {
      letsCreate: "Let's",
      together: 'Create Together',
      description: 'Whether you have a project in mind or just want to connect, I\'d love to hear from you.',
      getInTouch: 'Get in Touch',
    },
    blog: {
      title: 'Blog',
      subtitle: 'Thoughts, tutorials, and insights on development, design, and technology.',
      description: 'Thoughts, tutorials, and insights on development, design, and technology.',
    },
    wiki: {
      description: 'A curated knowledge base of concepts, tools, and techniques I use daily.',
    },
    cv: {
      experience: 'Experience',
      education: 'Education',
      prototypes: 'Prototypes',
      rewards: 'Rewards',
      print: 'Print',
      downloadPdf: 'Download PDF',
      viewDemo: 'View Demo',
    },
    about: {
      description: 'Learn about my journey, skills, and what drives my passion for creating.',
    },
    gallery: {
      description: 'A visual journey through projects, photography, and creative explorations.',
      allAlbums: 'All Albums',
    },
    search: {
      title: 'Search',
      subtitle: 'Find anything across blog posts, wiki articles, and gallery',
      placeholder: 'Search across all content...',
      allContent: 'All Content',
      results: 'results',
    },
    stats: {
      blogPosts: 'Blog Posts',
      wikiArticles: 'Wiki Articles',
      galleryImages: 'Gallery Images',
      projects: 'Projects',
    },
  },
  ru: {
    nav: { home: 'Главная', about: 'Обо мне', wiki: 'Вики', cv: 'Резюме', gallery: 'Галерея', blog: 'Блог', apps: 'Приложения', search: 'Поиск', news: 'Новости', legal: 'Правовая информация' },
    heroTitle: 'IT инженер',
    heroSubtitle: 'Создаю красивые цифровые решения с помощью кода, креативности и страсти. Изучайте мои работы, мысли и базу знаний.',
    searchPlaceholder: 'Поиск по статьям...',
    categories: 'Категории',
    tags: 'Теги',
    loading: 'Загрузка...',
    nothing: 'Ничего не найдено.',
    back: 'Назад',
    nowReading: 'Читаю сейчас',
    galleryTitle: 'Галерея',
    wikiTitle: 'Вики',
    cvTitle: 'CV (Резюме:)',
    aboutTitle: 'Обо мне',
    projectsTitle: 'Проекты:',
    sections: {
      explore: 'Исследуйте мой мир',
      exploreSubtitle: 'Погрузитесь в различные аспекты моей работы и интересов',
    },
    apps: {
      title: 'Приложения',
      subtitle: 'Демонстрация моих проектов',
      selectPrompt: 'Выберите приложение, чтобы загрузить его в центре.',
      descriptionLabel: 'Описание',
      platformsLabel: 'Платформы',
      technologiesLabel: 'Технологии',
      badgesLabel: 'Метки',
      dateLabel: 'Дата',
      openFullLabel: 'Открыть полностью',
      categories: {
        ready: 'Готовые приложения',
        prototype: 'Прототипы',
        'webos-emulation': 'WebOS Эмуляция',
      },
    },
    latestPosts: {
      title: 'Последние посты',
      subtitle: 'Свежие мысли и идеи',
      viewAll: 'Все посты',
    },
    cta: {
      letsCreate: 'Давайте',
      together: 'Создадим вместе',
      description: 'Есть проект или просто хотите связаться? Буду рад услышать от вас.',
      getInTouch: 'Связаться',
    },
    blog: {
      title: 'Блог',
      subtitle: 'Мысли, туториалы и идеи о разработке, дизайне и технологиях.',
      description: 'Мысли, туториалы и идеи о разработке, дизайне и технологиях.',
    },
    wiki: {
      description: 'Кураторская база знаний концепций, инструментов и техник, которые я использую ежедневно.',
    },
    cv: {
      experience: 'Опыт',
      education: 'Образование',
      prototypes: 'Прототипы',
      rewards: 'Награды',
      print: 'Печать',
      downloadPdf: 'Скачать PDF',
      viewDemo: 'Посмотреть демо',
    },
    about: {
      description: 'Узнайте о моем пути, навыках и том, что движет моей страстью к созиданию.',
    },
    gallery: {
      description: 'Визуальное путешествие через проекты, фотографию и креативные исследования.',
      allAlbums: 'Все альбомы',
    },
    search: {
      title: 'Поиск',
      subtitle: 'Найдите что угодно в блоге, вики и галерее',
      placeholder: 'Поиск по всему контенту...',
      allContent: 'Весь контент',
      results: 'результатов',
    },
    stats: {
      blogPosts: 'Посты блога',
      wikiArticles: 'Статьи вики',
      galleryImages: 'Изображения',
      projects: 'Проекты',
    },
  },
  fr: {
    nav: { home: 'Accueil', about: 'À propos', wiki: 'Wiki', cv: 'CV', gallery: 'Galerie', blog: 'Blog', apps: 'Applications', search: 'Recherche', news: 'Actualités', legal: 'Mentions légales' },
    heroTitle: 'Développeur créatif',
    heroSubtitle: 'Créer de belles expériences numériques avec code, créativité et passion. Explorez mon travail, mes pensées et ma base de connaissances.',
    searchPlaceholder: 'Rechercher...',
    categories: 'Catégories',
    tags: 'Tags',
    loading: 'Chargement...',
    nothing: 'Rien trouvé.',
    back: 'Retour',
    nowReading: 'En lecture',
    galleryTitle: 'Galerie',
    wikiTitle: 'Wiki',
    cvTitle: 'CV (Résumé:)',
    aboutTitle: 'À propos',
    projectsTitle: 'Projets:',
    sections: { explore: 'Explorez mon monde', exploreSubtitle: 'Plongez dans différents aspects de mon travail et de mes intérêts' },
    apps: {
      title: 'Applications',
      subtitle: 'Démonstration de mes projets',
      selectPrompt: 'Choisissez une application pour l\'ouvrir au centre.',
      descriptionLabel: 'Description',
      platformsLabel: 'Plateformes',
      technologiesLabel: 'Technologies',
      badgesLabel: 'Étiquettes',
      dateLabel: 'Date',
      openFullLabel: 'Ouvrir complet',
      categories: {
        ready: 'Applications prêtes',
        prototype: 'Prototypes',
        'webos-emulation': 'Émulation WebOS',
      },
    },
    latestPosts: { title: 'Derniers articles', subtitle: 'Nouvelles pensées et idées', viewAll: 'Voir tout' },
    cta: { letsCreate: 'Créons', together: 'Ensemble', description: 'Que vous ayez un projet en tête ou que vous souhaitiez simplement vous connecter, j\'aimerais vous entendre.', getInTouch: 'Contactez-moi' },
    blog: { title: 'Blog', subtitle: 'Pensées, tutoriels et idées sur le développement, le design et la technologie.', description: 'Pensées, tutoriels et idées sur le développement, le design et la technologie.' },
    wiki: { description: 'Une base de connaissances organisée de concepts, d\'outils et de techniques que j\'utilise quotidiennement.' },
    cv: { experience: 'Expérience', education: 'Éducation', prototypes: 'Prototypes', rewards: 'Récompenses', print: 'Imprimer', downloadPdf: 'Télécharger PDF', viewDemo: 'Voir la démo' },
    about: { description: 'Découvrez mon parcours, mes compétences et ce qui alimente ma passion pour la création.' },
    gallery: { description: 'Un voyage visuel à travers des projets, de la photographie et des explorations créatives.', allAlbums: 'Tous les albums' },
    search: { title: 'Recherche', subtitle: 'Trouvez n\'importe quoi dans les articles de blog, les articles wiki et la galerie', placeholder: 'Rechercher dans tout le contenu...', allContent: 'Tout le contenu', results: 'résultats' },
    stats: { blogPosts: 'Articles de blog', wikiArticles: 'Articles wiki', galleryImages: 'Images', projects: 'Projets' },
  },
  es: {
    nav: { home: 'Inicio', about: 'Sobre mí', wiki: 'Wiki', cv: 'CV', gallery: 'Galería', blog: 'Blog', apps: 'Aplicaciones', search: 'Buscar', news: 'Noticias', legal: 'Aviso legal' },
    heroTitle: 'Desarrollador creativo',
    heroSubtitle: 'Construyendo hermosas experiencias digitales con código, creatividad y pasión. Explora mi trabajo, pensamientos y base de conocimientos.',
    searchPlaceholder: 'Buscar...',
    categories: 'Categorías',
    tags: 'Etiquetas',
    loading: 'Cargando...',
    nothing: 'Nada encontrado.',
    back: 'Atrás',
    nowReading: 'Leyendo',
    galleryTitle: 'Galería',
    wikiTitle: 'Wiki',
    cvTitle: 'CV (Currículum:)',
    aboutTitle: 'Sobre mí',
    projectsTitle: 'Proyectos:',
    sections: { explore: 'Explora mi mundo', exploreSubtitle: 'Sumérgete en diferentes aspectos de mi trabajo e intereses' },
    apps: {
      title: 'Aplicaciones',
      subtitle: 'Demostración de mis proyectos',
      selectPrompt: 'Selecciona una aplicación para verla en el centro.',
      descriptionLabel: 'Descripción',
      platformsLabel: 'Plataformas',
      technologiesLabel: 'Tecnologías',
      badgesLabel: 'Etiquetas',
      dateLabel: 'Fecha',
      openFullLabel: 'Abrir completo',
      categories: {
        ready: 'Aplicaciones listas',
        prototype: 'Prototipos',
        'webos-emulation': 'Emulación WebOS',
      },
    },
    latestPosts: { title: 'Últimas publicaciones', subtitle: 'Pensamientos e ideas frescas', viewAll: 'Ver todo' },
    cta: { letsCreate: 'Vamos a', together: 'Crear juntos', description: 'Ya sea que tengas un proyecto en mente o simplemente quieras conectarte, me encantaría saber de ti.', getInTouch: 'Ponte en contacto' },
    blog: { title: 'Blog', subtitle: 'Pensamientos, tutoriales e ideas sobre desarrollo, diseño y tecnología.', description: 'Pensamientos, tutoriales e ideas sobre desarrollo, diseño y tecnología.' },
    wiki: { description: 'Una base de conocimientos curada de conceptos, herramientas y técnicas que uso a diario.' },
    cv: { experience: 'Experiencia', education: 'Educación', prototypes: 'Prototipos', rewards: 'Premios', print: 'Imprimir', downloadPdf: 'Descargar PDF', viewDemo: 'Ver demo' },
    about: { description: 'Conoce mi trayectoria, habilidades y lo que impulsa mi pasión por crear.' },
    gallery: { description: 'Un viaje visual a través de proyectos, fotografía y exploraciones creativas.', allAlbums: 'Todos los álbumes' },
    search: { title: 'Buscar', subtitle: 'Encuentra cualquier cosa en publicaciones de blog, artículos wiki y galería', placeholder: 'Buscar en todo el contenido...', allContent: 'Todo el contenido', results: 'resultados' },
    stats: { blogPosts: 'Publicaciones', wikiArticles: 'Artículos wiki', galleryImages: 'Imágenes', projects: 'Proyectos' },
  },
  zh: {
    nav: { home: '首页', about: '关于', wiki: '维基', cv: '简历', gallery: '画廊', blog: '博客', apps: '应用', search: '搜索', news: '新闻', legal: '法律声明' },
    heroTitle: '创意开发者',
    heroSubtitle: '用代码、创意和热情构建美丽的数字体验。探索我的作品、思想和知识库。',
    searchPlaceholder: '搜索...',
    categories: '分类',
    tags: '标签',
    loading: '加载中...',
    nothing: '未找到内容。',
    back: '返回',
    nowReading: '正在阅读',
    galleryTitle: '画廊',
    wikiTitle: '维基',
    cvTitle: 'CV (简历:)',
    aboutTitle: '关于',
    projectsTitle: '项目：',
    sections: { explore: '探索我的世界', exploreSubtitle: '深入了解我的工作和兴趣的不同方面' },
    apps: {
      title: '应用',
      subtitle: '我的项目演示',
      selectPrompt: '选择一个应用，在中央窗口打开。',
      descriptionLabel: '说明',
      platformsLabel: '平台',
      technologiesLabel: '技术',
      badgesLabel: '标签',
      dateLabel: '日期',
      openFullLabel: '完整打开',
      categories: {
        ready: '现成应用',
        prototype: '原型',
        'webos-emulation': 'WebOS模拟',
      },
    },
    latestPosts: { title: '最新文章', subtitle: '新鲜的想法和见解', viewAll: '查看全部' },
    cta: { letsCreate: '让我们', together: '一起创造', description: '无论您有项目想法还是只是想联系，我都很乐意听到您的声音。', getInTouch: '联系我' },
    blog: { title: '博客', subtitle: '关于开发、设计和技术的想法、教程和见解。', description: '关于开发、设计和技术的想法、教程和见解。' },
    wiki: { description: '我每天使用的概念、工具和技术的精选知识库。' },
    cv: { experience: '经验', education: '教育', prototypes: '原型', rewards: '奖励', print: '打印', downloadPdf: '下载PDF', viewDemo: '查看演示' },
    about: { description: '了解我的旅程、技能以及推动我创作热情的动力。' },
    gallery: { description: '通过项目、摄影和创意探索的视觉之旅。', allAlbums: '所有相册' },
    search: { title: '搜索', subtitle: '在博客文章、维基文章和画廊中查找任何内容', placeholder: '搜索所有内容...', allContent: '所有内容', results: '结果' },
    stats: { blogPosts: '博客文章', wikiArticles: '维基文章', galleryImages: '图片', projects: '项目' },
  },
  ja: {
    nav: { home: 'ホーム', about: '概要', wiki: 'ウィキ', cv: '履歴書', gallery: 'ギャラリー', blog: 'ブログ', apps: 'アプリ', search: '検索', news: 'ニュース', legal: '法的通知' },
    heroTitle: 'クリエイティブ開発者',
    heroSubtitle: 'コード、創造性、情熱で美しいデジタル体験を構築。私の作品、思考、知識ベースを探索してください。',
    searchPlaceholder: '検索...',
    categories: 'カテゴリ',
    tags: 'タグ',
    loading: '読み込み中...',
    nothing: '見つかりません。',
    back: '戻る',
    nowReading: '閲覧中',
    galleryTitle: 'ギャラリー',
    wikiTitle: 'ウィキ',
    cvTitle: 'CV (履歴書:)',
    aboutTitle: '概要',
    projectsTitle: 'プロジェクト：',
    apps: {
      title: 'アプリ',
      subtitle: '私のプロジェクトのデモンストレーション',
      selectPrompt: 'アプリを選ぶと中央に表示されます。',
      descriptionLabel: '説明',
      platformsLabel: 'プラットフォーム',
      technologiesLabel: '技術',
      badgesLabel: 'タグ',
      dateLabel: '日付',
      openFullLabel: 'フル表示',
      categories: {
        ready: '完成アプリ',
        prototype: 'プロトタイプ',
        'webos-emulation': 'WebOSエミュレーション',
      },
    },
    sections: { explore: '私の世界を探索', exploreSubtitle: '私の仕事と興味のさまざまな側面に飛び込む' },
    latestPosts: { title: '最新の投稿', subtitle: '新鮮な考えと洞察', viewAll: 'すべて表示' },
    cta: { letsCreate: '一緒に', together: '作成しましょう', description: 'プロジェクトのアイデアがある場合でも、単につながりたい場合でも、ぜひお聞かせください。', getInTouch: 'お問い合わせ' },
    blog: { title: 'ブログ', subtitle: '開発、デザイン、テクノロジーに関する考え、チュートリアル、洞察。', description: '開発、デザイン、テクノロジーに関する考え、チュートリアル、洞察。' },
    wiki: { description: '私が毎日使用する概念、ツール、テクニックのキュレートされた知識ベース。' },
    cv: { experience: '経験', education: '学歴', prototypes: 'プロトタイプ', rewards: '賞', print: '印刷', downloadPdf: 'PDFダウンロード', viewDemo: 'デモを見る' },
    about: { description: '私の旅、スキル、そして創造への情熱を駆り立てるものについて学んでください。' },
    gallery: { description: 'プロジェクト、写真、クリエイティブな探求を通じた視覚的な旅。', allAlbums: 'すべてのアルバム' },
    search: { title: '検索', subtitle: 'ブログ投稿、ウィキ記事、ギャラリー全体で何でも検索', placeholder: 'すべてのコンテンツを検索...', allContent: 'すべてのコンテンツ', results: '結果' },
    stats: { blogPosts: 'ブログ投稿', wikiArticles: 'ウィキ記事', galleryImages: '画像', projects: 'プロジェクト' },
  },
  ko: {
    nav: { home: '홈', about: '소개', wiki: '위키', cv: '이력서', gallery: '갤러리', blog: '블로그', apps: '앱', search: '검색', news: '뉴스', legal: '법적 고지' },
    heroTitle: '크리에이티브 개발자',
    heroSubtitle: '코드, 창의성, 열정으로 아름다운 디지털 경험을 구축합니다. 제 작업, 생각, 지식 기반을 탐색하세요.',
    searchPlaceholder: '검색...',
    categories: '카테고리',
    tags: '태그',
    loading: '로드 중...',
    nothing: '검색 결과 없음.',
    back: '뒤로',
    nowReading: '읽는 중',
    galleryTitle: '갤러리',
    wikiTitle: '위키',
    cvTitle: 'CV (이력서:)',
    aboutTitle: '소개',
    projectsTitle: '프로젝트:',
    sections: { explore: '내 세계 탐험', exploreSubtitle: '내 작업과 관심사의 다양한 측면에 빠져보세요' },
    apps: {
      title: '앱',
      subtitle: '내 프로젝트 시연',
      selectPrompt: '앱을 선택하면 중앙에서 열립니다.',
      descriptionLabel: '설명',
      platformsLabel: '플랫폼',
      technologiesLabel: '기술',
      badgesLabel: '태그',
      dateLabel: '날짜',
      openFullLabel: '전체 열기',
      categories: {
        ready: '완성된 앱',
        prototype: '프로토타입',
        'webos-emulation': 'WebOS 에뮬레이션',
      },
    },
    latestPosts: { title: '최신 게시물', subtitle: '신선한 생각과 통찰', viewAll: '모두 보기' },
    cta: { letsCreate: '함께', together: '만들어요', description: '프로젝트 아이디어가 있거나 단순히 연결하고 싶다면 연락 주세요.', getInTouch: '연락하기' },
    blog: { title: '블로그', subtitle: '개발, 디자인, 기술에 대한 생각, 튜토리얼, 통찰.', description: '개발, 디자인, 기술에 대한 생각, 튜토리얼, 통찰.' },
    wiki: { description: '매일 사용하는 개념, 도구, 기술의 큐레이션된 지식 기반.' },
    cv: { experience: '경력', education: '교육', prototypes: '프로토타입', rewards: '상', print: '인쇄', downloadPdf: 'PDF 다운로드', viewDemo: '데모 보기' },
    about: { description: '내 여정, 기술, 창작에 대한 열정을 알아보세요.' },
    gallery: { description: '프로젝트, 사진, 창의적 탐험을 통한 시각적 여정.', allAlbums: '모든 앨범' },
    search: { title: '검색', subtitle: '블로그 게시물, 위키 문서, 갤러리 전체에서 무엇이든 찾기', placeholder: '모든 콘텐츠 검색...', allContent: '모든 콘텐츠', results: '결과' },
    stats: { blogPosts: '블로그 게시물', wikiArticles: '위키 문서', galleryImages: '이미지', projects: '프로젝트' },
  },
};

const themeOptions = [
  { id: 'default', name: 'Frutiger Aero', icon: '🌿' },
  { id: 'vaporwave', name: 'Vaporwave', icon: '🌴' },
  { id: 'cyberpunk', name: 'Cyberpunk', icon: '⚡' },
  { id: 'skeuomorphism', name: 'Skeuomorphism', icon: '📱' },
  { id: 'pcb', name: 'PCB Circuit', icon: '🔌' },
] as const;


function buildView(post: ContentItem): BlogPostView {
  const plain = stripMarkdown(post.content);
  const excerpt = (post as any).excerpt || plain.slice(0, 180) + (plain.length > 180 ? '…' : '');
  const words = plain.split(/\s+/).filter(Boolean).length;
  const readingTime = `${Math.max(1, Math.round(words / 180))} min read`;

  return {
    ...post,
    excerpt,
    readingTime,
    html: markdownToHtml(post.content),
  };
}

function sectionToPath(section: Section): string {
  switch (section) {
    case 'home':
      return `${basePath}`;
    case 'blog':
      return `${basePath}blog`;
    case 'about':
      return `${basePath}about`;
    case 'wiki':
      return `${basePath}wiki`;
    case 'cv':
      return `${basePath}cv`;
    case 'gallery':
      return `${basePath}gallery`;
    case 'search':
      return `${basePath}search`;
    case 'apps':
      return `${basePath}apps`;
    case 'news':
      return `${basePath}news`;
    case 'project':
      return `${basePath}about/projects`;
    default:
      return basePath;
  }
}

export function BlogSite() {
  const { language, setLanguage } = useApp();
  const ui = uiTexts[language] || uiTexts.en;

  const { byTag: projectsByTag } = useProjects();
  const { byTag: galleryByTag } = useGallery();
  const { news: newsItems } = useNews();

  const [theme, setTheme] = useState<string>(() => localStorage.getItem('site-theme') || 'default');
  const [posts, setPosts] = useState<BlogPostView[]>([]);
  const [wiki, setWiki] = useState<WikiView[]>([]);
  const [pictures, setPictures] = useState<ImageItem[]>([]);
  const [projects, setProjects] = useState<ContentItem[]>([]);
  const [aboutMe, setAboutMe] = useState<ContentItem | null>(null);
  const [legalNotice, setLegalNotice] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTag] = useState<string | null>(null);
  const [activePost, setActivePost] = useState<BlogPostView | null>(null);
  const [activeSection, setActiveSection] = useState<Section>('home');
  const [activeWiki, setActiveWiki] = useState<WikiView | null>(null);
  const [activeNews, setActiveNews] = useState<NewsItem | null>(null);
  const [activeProject, setActiveProject] = useState<ContentItem | null>(null);
  const [wikiCategory, setWikiCategory] = useState<string>('All');
  const [wikiSearch, setWikiSearch] = useState('');
  const [wikiCategoryIndex, setWikiCategoryIndex] = useState<ContentItem | null>(null);
  const [heroKey, setHeroKey] = useState(0);
  const [mainAboutTab, setMainAboutTab] = useState<'about' | 'cv' | 'projects' | 'legal'>('about');
  const [activeCvTab, setActiveCvTab] = useState<'it' | 'education' | 'gamedev' | 'rewards'>('it');
  const [lightbox, setLightbox] = useState<{ id: string; idx: number } | null>(null);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [blogPage, setBlogPage] = useState(1);
  const [wikiPage, setWikiPage] = useState(1);
  const [galleryPage, setGalleryPage] = useState(1);
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [apps, setApps] = useState<AppEntry[]>([]);
  const [selectedApp, setSelectedApp] = useState<AppEntry | null>(null);
  const [iframeHeight, setIframeHeight] = useState(500);
  const [isResizing, setIsResizing] = useState(false);
  const [expandedWikiCategories, setExpandedWikiCategories] = useState<Set<string>>(new Set());
  const [expandedGalleryAlbums, setExpandedGalleryAlbums] = useState<Set<string>>(new Set());
  const itemsPerPage = 12;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('site-theme', theme);
    setHeroKey((k) => k + 1); // перезапуск анимаций при смене темы
  }, [theme]);

  // Обработка изменения размера iframe
  // Загрузка index файла категории при изменении wikiCategory
  useEffect(() => {
    if (wikiCategory === 'All') {
      setWikiCategoryIndex(null);
      return;
    }

    loadWikiCategoryIndex(wikiCategory, language)
      .then(index => setWikiCategoryIndex(index))
      .catch(err => console.error('Failed to load category index:', err));
  }, [wikiCategory, language]);

  // Обработка кликов по внутренним ссылкам в markdown
  useEffect(() => {
    const handleWikiLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('[data-wiki-link]') as HTMLElement;
      
      if (link) {
        e.preventDefault();
        const wikiLink = link.getAttribute('data-wiki-link');
        
        if (wikiLink) {
          // Находим статью по относительному пути
          const targetArticle = wiki.find(article => {
            // Проверяем различные варианты совпадения
            const fileName = wikiLink.replace('.md', '');
            return article.id === fileName || 
                   article.relativePath?.endsWith(wikiLink) ||
                   article.relativePath?.endsWith(fileName + '.md');
          });

          if (targetArticle) {
            handleOpenWiki(targetArticle);
          } else {
            console.warn('Wiki article not found:', wikiLink);
          }
        }
      }
    };

    document.addEventListener('click', handleWikiLinkClick);
    return () => document.removeEventListener('click', handleWikiLinkClick);
  }, [wiki]);

  useEffect(() => {
    if (!isResizing) {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return; // Double check
      
      // Вычисляем высоту относительно позиции мыши
      const iframe = document.querySelector('[data-iframe-container]');
      if (!iframe) return;
      
      const rect = iframe.getBoundingClientRect();
      const newHeight = Math.max(400, e.clientY - rect.top);
      setIframeHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);


  useEffect(() => {
    let mounted = true;
    Promise.all([
      loadArticles(language),
      loadWikiArticles(undefined, language),
      // Domain-layer gallery loader (replaces legacy loadPictures)
      loadPictureItems(),
      loadAllProjects(language),
      loadAboutMe(language),
      loadLegalNotice(language),
    ]).then(([loadedPosts, loadedWiki, loadedGalleryItems, loadedProjects, loadedAboutMe, loadedLegalNotice]) => {
      // Map GalleryItem[] → ImageItem[] shape for downstream picture state
      const loadedPics: ImageItem[] = (loadedGalleryItems as any[]).map((g) => ({
        id: g.id,
        name: g.title,
        path: g.imagePath ?? g.content,
        thumbnail: g.thumbnailPath,
        date: g.date,
      }));
      if (!mounted) return;
      const mapped = loadedPosts.map(buildView);
      const mappedWiki = loadedWiki.map((item) => ({
        ...item,
        excerpt: stripMarkdown(item.content).slice(0, 200) + (item.content.length > 200 ? '…' : ''),
        html: markdownToHtml(item.content),
        categoryPath: item.category || item.pathSegments?.join('/') || 'wiki',
      }));
      
      setPosts(mapped);
      setWiki(mappedWiki);
      setPictures(loadedPics.slice(0, 12));
      setProjects(loadedProjects);
      setAboutMe(loadedAboutMe);
      setLegalNotice(loadedLegalNotice);
      setLoading(false);
      
      // Обновляем активный пост, если он открыт
      setActivePost(prev => {
        if (!prev) return null;
        const updated = mapped.find(p => p.id === prev.id);
        // Создаём новый объект, чтобы React гарантированно увидел изменения
        return updated ? { ...updated } : null;
      });
      
      // Обновляем активную wiki страницу, если она открыта
      setActiveWiki(prev => {
        if (!prev) return null;
        const updated = mappedWiki.find(w => w.id === prev.id);
        // Создаём новый объект, чтобы React гарантированно увидел изменения
        return updated ? { ...updated } : null;
      });
      
      // Обновляем активный проект, если он открыт
      setActiveProject(prev => {
        if (!prev) return null;
        const updated = loadedProjects.find(p => p.id === prev.id);
        // Создаём новый объект, чтобы React гарантированно увидел изменения
        return updated ? { ...updated } : null;
      });
      
      syncFromLocation(window.location.pathname, mapped, mappedWiki);
    });
    return () => {
      mounted = false;
    };
  }, [language]); // Перезагружаем при смене языка

  useEffect(() => {
    syncFromLocation(window.location.pathname, posts, wiki);
  }, [posts, wiki]);

  useEffect(() => {
    let mounted = true;
    loadAppEntries(language).then((loaded) => {
      if (!mounted) return;
      setApps(loaded);
      setSelectedApp((prev) => {
        if (prev) {
          const match = loaded.find((app) => app.id === prev.id);
          return match ?? loaded[0] ?? null;
        }
        return loaded[0] ?? null;
      });
    });
    return () => {
      mounted = false;
    };
  }, [language]);

  const categories = useMemo(() => {
    const unique = new Set<string>();
    posts.forEach((p) => p.category && unique.add(p.category));
    return ['All', ...Array.from(unique)];
  }, [posts]);


  const allTags = useMemo(() => {
    const unique = new Set<string>();
    posts.forEach((p) => p.tags?.forEach((tag) => unique.add(tag)));
    wiki.forEach((w) => w.tags?.forEach((tag) => unique.add(tag)));
    return Array.from(unique).sort();
  }, [posts, wiki]);

  const appsByCategory = useMemo(() => {
    const mapping: Record<AppCategoryId, AppEntry[]> = {
      ready: [],
      prototype: [],
      'webos-emulation': [],
    };
    apps.forEach((app) => {
      const category = (app.category || 'ready') as AppCategoryId;
      if (!mapping[category]) {
        mapping[category] = [];
      }
      mapping[category].push(app);
    });
    return mapping;
  }, [apps]);

  // Построение дерева категорий Wiki
  const wikiCategoryTree = useMemo(() => {
    interface CategoryNode {
      name: string;
      fullPath: string;
      children: Map<string, CategoryNode>;
      count: number;
    }

    const root = new Map<string, CategoryNode>();

    wiki.forEach((w) => {
      const segments = w.pathSegments || (w.categoryPath ? w.categoryPath.split('/') : []);
      if (segments.length === 0) return;

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
  }, [wiki]);

  const wikiCategories = useMemo(() => {
    return ['All', ...Array.from(wikiCategoryTree.keys())];
  }, [wikiCategoryTree]);

  const wikiCategoryStats = useMemo(() => {
    const counts: Record<string, number> = {};
    wikiCategoryTree.forEach((node, key) => {
      counts[key] = node.count;
    });
    return counts;
  }, [wikiCategoryTree]);

  const filtered = useMemo(() => {
    return posts.filter((post) => {
      const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
      const matchesTag = !selectedTag || post.tags?.includes(selectedTag);
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        !query ||
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        stripMarkdown(post.content).toLowerCase().includes(query);
      return matchesCategory && matchesTag && matchesSearch;
    });
  }, [posts, selectedCategory, selectedTag, searchQuery]);

  const filteredWiki = useMemo(() => {
    return wiki.filter((item) => {
      const itemPath = item.pathSegments ? item.pathSegments.join('/') : item.categoryPath;
      const matchesCategory = wikiCategory === 'All' || itemPath.startsWith(wikiCategory);
      const q = wikiSearch.toLowerCase();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        stripMarkdown(item.content).toLowerCase().includes(q) ||
        itemPath.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [wiki, wikiCategory, wikiSearch]);

  // Построение дерева альбомов Gallery (аналогично Wiki)
  const galleryAlbumTree = useMemo(() => {
    interface AlbumNode {
      name: string;
      fullPath: string;
      children: Map<string, AlbumNode>;
      count: number;
    }

    const root = new Map<string, AlbumNode>();

    pictures.forEach((pic) => {
      // Извлекаем путь к папке из URL изображения
      // Формат: /assets/picture-hash.jpg или подобный, нужно использовать pic.id или другое поле
      const pathParts = pic.path.split('/');
      const picturesIndex = pathParts.findIndex(part => part === 'pictures');
      
      if (picturesIndex === -1 || picturesIndex === pathParts.length - 1) {
        // Нет структуры папок, помещаем в General
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

      // Получаем сегменты пути после pictures/
      const segments = pathParts.slice(picturesIndex + 1, -1); // Убираем имя файла
      
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
      const pathParts = pic.path.split('/');
      const picturesIndex = pathParts.findIndex(part => part === 'pictures');
      
      if (picturesIndex === -1) return false;
      
      const segments = pathParts.slice(picturesIndex + 1, -1);
      const picPath = segments.join('/');
      
      // Проверяем точное совпадение или начало пути
      return picPath === selectedAlbum || picPath.startsWith(selectedAlbum + '/');
    });
  }, [pictures, selectedAlbum]);

  const paginatedBlog = useMemo(() => {
    const start = (blogPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, blogPage, itemsPerPage]);

  const paginatedWiki = useMemo(() => {
    const start = (wikiPage - 1) * itemsPerPage;
    return filteredWiki.slice(start, start + itemsPerPage);
  }, [filteredWiki, wikiPage, itemsPerPage]);

  const paginatedGallery = useMemo(() => {
    const start = (galleryPage - 1) * itemsPerPage;
    return filteredGalleryImages.slice(start, start + itemsPerPage);
  }, [filteredGalleryImages, galleryPage, itemsPerPage]);

  const totalBlogPages = Math.ceil(filtered.length / itemsPerPage);
  const totalWikiPages = Math.ceil(filteredWiki.length / itemsPerPage);
  const totalGalleryPages = Math.ceil(filteredGalleryImages.length / itemsPerPage);

  const latestPosts = posts.slice(0, 3);
  const statCards = [
    { label: 'Статей', value: posts.length, icon: BookOpen, accent: 'bg-aero-sky/30' },
    { label: 'Wiki заметок', value: wiki.length, icon: FileText, accent: 'bg-aero-sun/30' },
    { label: 'Изображений', value: pictures.length, icon: ImageIcon, accent: 'bg-aero-water/30' },
  ];


  function syncFromLocation(pathname: string, postsList: BlogPostView[], wikiList: WikiView[]) {
    const rest = pathname.replace(basePath, '').replace(/^\/+/, '');
    if (!rest) {
      setActiveSection('home');
      setActivePost(null);
      setActiveWiki(null);
      setActiveNews(null);
      return;
    }
    if (rest === 'blog') {
      setActiveSection('blog');
      setActivePost(null);
      setActiveWiki(null);
      setActiveNews(null);
      return;
    }
    if (rest === 'about') {
      setActiveSection('about');
      setActivePost(null);
      setActiveWiki(null);
      setActiveNews(null);
      return;
    }
    if (rest === 'wiki') {
      setActiveSection('wiki');
      setActivePost(null);
      setActiveWiki(null);
      setActiveNews(null);
      return;
    }
    if (rest === 'cv') {
      setActiveSection('about');
      setActivePost(null);
      setActiveWiki(null);
      setActiveNews(null);
      return;
    }
    if (rest === 'gallery') {
      setActiveSection('gallery');
      setActivePost(null);
      setActiveWiki(null);
      setActiveNews(null);
      return;
    }
    if (rest === 'apps') {
      setActiveSection('apps');
      setActivePost(null);
      setActiveWiki(null);
      setActiveNews(null);
      return;
    }
    if (rest === 'search') {
      setActiveSection('search');
      setActivePost(null);
      setActiveWiki(null);
      setActiveNews(null);
      return;
    }
    if (rest === 'news') {
      setActiveSection('news');
      setActivePost(null);
      setActiveWiki(null);
      setActiveNews(null);
      return;
    }
    if (rest.startsWith('news/')) {
      const newsId = decodeURIComponent(rest.replace(/^news\//, '').replace(/\.md$/, ''));
      setActiveSection('news');
      setActivePost(null);
      setActiveWiki(null);
      // activeNews will be set by handleOpenNews once newsItems are loaded
      // Store id in history state so we can restore it
      if (newsItems.length > 0) {
        const matchNews = newsItems.find((n) => n.id === newsId);
        setActiveNews(matchNews ?? null);
      }
      return;
    }
    if (rest.startsWith('wiki/')) {
      const wikiSlug = decodeURIComponent(rest.replace(/^wiki\//, '').replace(/\.md$/, ''));
      const matchWiki = wikiList.find((w) => w.relativePath?.replace(/\.md$/, '') === wikiSlug);
      if (matchWiki) {
        setActiveSection('wiki');
        setActiveWiki(matchWiki);
        setActivePost(null);
        setActiveNews(null);
        return;
      }
    }
    const cleaned = rest.startsWith('blog/') ? rest.replace(/^blog\//, '') : rest;
    const slug = cleaned.replace(/\.md$/, '');
    const maybePost = postsList.find((p) => p.id === slug);
    if (maybePost) {
      setActiveSection('home');
      setActivePost(maybePost);
      setActiveWiki(null);
      setActiveNews(null);
    }
  }

  const handleOpenPost = (post: BlogPostView) => {
    setActivePost(post);
    setActiveWiki(null);
    setActiveNews(null);
    window.history.pushState({}, '', `${basePath}blog/${post.id}.md`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateSection = (section: NavSection) => {
    setActiveSection(section);
    setActivePost(null);
    setActiveWiki(null);
    setActiveNews(null);
    window.history.pushState({}, '', sectionToPath(section));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenWiki = (item: WikiView) => {
    setActiveSection('wiki');
    setActiveWiki(item);
    setActiveNews(null);
    window.history.pushState({}, '', `${basePath}wiki/${item.relativePath?.replace(/\.md$/, '')}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenNews = (item: NewsItem) => {
    setActiveSection('news');
    setActiveNews(item);
    setActivePost(null);
    setActiveWiki(null);
    window.history.pushState({}, '', `${basePath}news/${item.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenPicture = (idx: number, id: string) => {
    setLightbox({ idx, id });
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightbox(null);
    document.body.style.overflow = '';
  };

  const Pagination = ({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (page: number) => void }) => {
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
  };

  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (!lightbox) return;
    const count = pictures.length;
    if (count === 0) return;
    const nextIdx = direction === 'next' ? (lightbox.idx + 1) % count : (lightbox.idx - 1 + count) % count;
    setLightbox({ idx: nextIdx, id: pictures[nextIdx].id });
  };

  const cv = loadCvLocale(language);

  return (
    <div className="min-h-screen text-foreground">
      <Navigation
        activeSection={(activeSection === 'cv' || activeSection === 'project') ? 'about' : activeSection as NavSection}
        onNavigate={navigateSection}
        theme={theme}
        setTheme={setTheme}
        language={language}
        setLanguage={setLanguage}
        themeOptions={themeOptions as any}
        navLabels={ui.nav}
      />

      {activeSection === 'home' && (
        <Hero key={heroKey} title={ui.heroTitle} subtitle={ui.heroSubtitle} />
      )}

      {activeSection === 'home' && !activePost && (
        <>
          {/* Explore My World Section */}
          <section className="container mx-auto px-6 py-24">
            <div className="text-center mb-16 animate-fade-in">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="gradient-text">{ui.sections.explore}</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                {ui.sections.exploreSubtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { key: 'about', title: ui.nav.about, description: ui.about.description, icon: User, gradient: 'bg-aero-sky' },
                { key: 'blog', title: ui.nav.blog, description: ui.blog.description, icon: BookOpen, gradient: 'bg-aero-grass' },
                { key: 'wiki', title: ui.nav.wiki, description: ui.wiki.description, icon: FileText, gradient: 'bg-aero-sun' },
                { key: 'gallery', title: ui.nav.gallery, description: ui.gallery.description, icon: ImageIcon, gradient: 'bg-aero-water' },
                { key: 'apps', title: ui.nav.apps, description: ui.apps?.subtitle || '', icon: Grid3x3, gradient: 'bg-aero-cloud' },
              ].map((section, index) => (
                <div
                  key={section.key}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <SectionCard
                    title={section.title}
                    description={section.description}
                    icon={section.icon}
                    gradient={section.gradient}
                    onClick={() => navigateSection(section.key as NavSection)}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Latest Blog Posts */}
          {latestPosts.length > 0 && (
            <section className="container mx-auto px-6 py-24">
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-2">{ui.latestPosts.title}</h2>
                  <p className="text-muted-foreground">{ui.latestPosts.subtitle}</p>
                </div>
                <button
                  onClick={() => navigateSection('blog')}
                  className="flex items-center gap-2 text-primary hover:gap-4 transition-all font-medium"
                >
                  {ui.latestPosts.viewAll} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {latestPosts.map((post, index) => (
                  <ContentCard
                    key={post.id}
                    item={post}
                    onClick={() => handleOpenPost(post)}
                    index={index}
                    animationClass="fade-in-up"
                  />
                ))}
              </div>
            </section>
          )}

          {/* Latest News — vertical slice from src/content/news */}
          <NewsSection
            limit={3}
            onOpenNews={(item) => handleOpenNews(item as NewsItem)}
            onViewAll={() => navigateSection('news')}
          />

          {/* Selected Projects */}
          <ProjectsSection
            limit={3}
            onViewAll={() => {
              setActiveSection('about');
              setMainAboutTab('projects');
              window.history.pushState({}, '', `${basePath}about/projects`);
            }}
          />

          {/* Gallery Preview */}
          <GallerySection
            limit={4}
            onViewAll={() => {
              setActiveSection('gallery');
              setGalleryPage(1);
              window.history.pushState({}, '', `${basePath}gallery`);
            }}
          />

          {/* CTA Section */}
          <section className="container mx-auto px-6 py-24">
            <div className="glass rounded-3xl p-12 md:p-16 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-64 h-64 bg-aero-sky/30 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-aero-grass/20 rounded-full blur-3xl" />
              
              <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-bold mb-6">
                  {ui.cta.letsCreate} <span className="gradient-text">{ui.cta.together}</span>
                </h2>
                <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                  {ui.cta.description}
                </p>
                <button
                  onClick={() => navigateSection('about')}
                  className="inline-flex items-center gap-2 neu px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-semibold hover:scale-105 transition-transform"
                >
                  {ui.cta.getInTouch} <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </section>
        </>
      )}

      {activeSection === 'blog' && !activePost && (
        <main className="pt-32 pb-24">
          <div className="container mx-auto px-6">
            {/* Header */}
            <section className="max-w-4xl mx-auto text-center mb-16">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
                <span className="gradient-text">{ui.blog.title}</span>
              </h1>
              <p className="text-xl text-muted-foreground animate-fade-in animation-delay-100">
                {ui.blog.subtitle}
              </p>
            </section>

            {/* Filters */}
            <section className="max-w-4xl mx-auto mb-12 animate-fade-in animation-delay-200">
              <div className="glass rounded-2xl p-6 flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={ui.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-card border border-border focus:border-primary focus:outline-none transition-colors"
                  />
                </div>

                {/* Categories */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                  <Filter className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                        selectedCategory === category
                          ? 'neu-sm bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Posts Grid */}
            <section className="max-w-6xl mx-auto">
              {loading ? (
                <div className="text-center py-16">
                  <p className="text-muted-foreground text-lg">{ui.loading}</p>
                </div>
              ) : paginatedBlog.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-muted-foreground text-lg">{ui.nothing}</p>
                </div>
              ) : (
                <>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {paginatedBlog.map((post, index) => (
                      <ContentCard
                        key={post.id}
                        item={post}
                        onClick={() => handleOpenPost(post)}
                        index={index}
                        animationClass="animate-fade-in"
                      />
                    ))}
                  </div>
                  <Pagination currentPage={blogPage} totalPages={totalBlogPages} onPageChange={setBlogPage} />
                </>
              )}
            </section>
          </div>
        </main>
      )}

      {/* Blog Post Detail View */}
      {(activeSection === 'home' || activeSection === 'blog') && activePost && (
        <main className="pt-32 pb-24" key={`post-${activePost.id}-${language}`}>
          <div className="container mx-auto px-6">
            <section className="max-w-4xl mx-auto">
              <ContentReader
                  title={activePost.title}
                  html={activePost.html}
                  excerpt={activePost.excerpt}
                  preview={activePost.preview}
                  category={activePost.category}
                  date={activePost.date}
                  readingTime={activePost.readingTime}
                  tags={activePost.tags}
                  tagsLabel={ui.tags}
                  onTagClick={(tag) => {
                    setActivePost(null);
                    setActiveSection('search');
                    setGlobalSearchQuery(tag);
                    window.history.pushState({}, '', `${basePath}search`);
                  }}
                  tagCounts={
                    activePost.tags
                      ? Object.fromEntries(
                          activePost.tags.map((tag) => [
                            tag,
                            posts.filter((p) => p.tags?.includes(tag)).length +
                              wiki.filter((w) => w.tags?.includes(tag)).length +
                              projects.filter((pr) => pr.tags?.includes(tag)).length,
                          ])
                        )
                      : {}
                  }
                  headerMeta={
                    <>
                      <button
                        onClick={() => {
                          setActivePost(null);
                          window.history.pushState({}, '', activeSection === 'blog' ? `${basePath}blog` : basePath);
                        }}
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        {ui.back}
                      </button>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <BookOpen className="w-4 h-4" />
                        <span className="font-medium text-foreground">{ui.nav.blog}</span>
                        <ArrowRight className="w-4 h-4 opacity-60" />
                        <span className="text-foreground">{activePost.title}</span>
                      </div>
                    </>
                  }
                />
              </section>
          </div>
        </main>
      )}

      {/* Project Detail View */}
      {activeSection === 'project' && activeProject && (
        <main className="pt-32 pb-24" key={`project-${activeProject.id}-${language}`}>
          <div className="container mx-auto px-6">
            <section className="max-w-4xl mx-auto">
              <div className="glass rounded-3xl p-6 md:p-10 neu-sm animate-fade-in">
                <button
                  onClick={() => {
                    setActiveProject(null);
                    setActiveSection('about');
                    setMainAboutTab('projects');
                    window.history.pushState({}, '', `${basePath}about`);
                  }}
                  className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {ui.back}
                </button>

                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <Briefcase className="w-4 h-4" />
                  <span className="font-medium text-foreground">{ui.projectsTitle}</span>
                  <ArrowRight className="w-4 h-4 opacity-60" />
                  <span className="text-foreground">{activeProject.title}</span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
                  {activeProject.date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {activeProject.date}
                    </span>
                  )}
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                    {activeProject.category || 'Other'}
                  </span>
                </div>

                <h2 className="text-3xl md:text-4xl font-bold mb-8">{activeProject.title}</h2>

                {activeProject.preview && (
                  <div className="mb-8 rounded-2xl overflow-hidden neu-sm">
                    {activeProject.preview.endsWith('.webm') || activeProject.preview.endsWith('.mp4') ? (
                      <video 
                        src={activeProject.preview} 
                        className="w-full h-auto"
                        autoPlay
                        loop
                        muted
                        playsInline
                      />
                    ) : (
                      <img 
                        src={activeProject.preview} 
                        alt={activeProject.title}
                        className="w-full h-auto"
                      />
                    )}
                  </div>
                )}

                <div
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: markdownToHtml(activeProject.content) }}
                />

                {activeProject.tags && activeProject.tags.length > 0 && (
                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <span className="text-muted-foreground font-medium">{ui.tags}:</span>
                    {activeProject.tags.map((tag) => {
                      const tagCount = posts.filter((p) => p.tags?.includes(tag)).length + 
                                       wiki.filter((w) => w.tags?.includes(tag)).length +
                                       projects.filter((pr) => pr.tags?.includes(tag)).length;
                      return (
                        <button
                          key={tag}
                          onClick={() => {
                            setActiveProject(null);
                            setActiveSection('search');
                            setGlobalSearchQuery(tag);
                            window.history.pushState({}, '', `${basePath}search`);
                          }}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted hover:bg-primary hover:text-primary-foreground transition-colors text-sm font-medium"
                        >
                          <Tag className="w-3 h-3" />
                          {tag}
                          <span className="text-xs opacity-70">
                            ({tagCount})
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>
      )}

      {activeSection === 'about' && (
        <section className="max-w-6xl mx-auto px-6 py-12 space-y-6">
          <div className="grid sm:grid-cols-3 gap-4">
            {statCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className="glass rounded-2xl p-4 flex items-center gap-3 neu-sm fade-in-up"
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  <div className={`w-12 h-12 rounded-xl ${card.accent} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">{card.label}</div>
                    <div className="text-2xl font-bold text-foreground">{card.value}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="relative overflow-hidden glass rounded-3xl p-8 neu-sm fade-in-up">
            <div className="absolute inset-0 noise-overlay pointer-events-none" />
            <div className="relative z-10">
              <div className="flex flex-wrap gap-2 mb-4 items-center">
                <button
                  onClick={() => setMainAboutTab('about')}
                  className={`inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm ${
                    mainAboutTab === 'about' ? 'bg-primary/20 text-primary' : 'text-foreground/80 hover:bg-card/60'
                  }`}
                >
                  About me
                </button>
                <button
                  onClick={() => setMainAboutTab('projects')}
                  className={`inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm ${
                    mainAboutTab === 'projects' ? 'bg-primary/20 text-primary' : 'text-foreground/80 hover:bg-card/60'
                  }`}
                >
                  <Folder className="w-4 h-4" />
                  {ui.projectsTitle.replace(':', '')}
                </button>
                <span className="text-muted-foreground text-sm">CV (Резюме):</span>
                {(['it', 'education', 'gamedev', 'rewards'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setMainAboutTab('cv');
                      setActiveCvTab(tab);
                    }}
                    className={`inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm ${
                      mainAboutTab === 'cv' && activeCvTab === tab ? 'bg-primary/20 text-primary' : 'text-foreground/80 hover:bg-card/60'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
                <button
                  onClick={() => setMainAboutTab('legal')}
                  className={`inline-flex items-center gap-2 glass px-3 py-2 rounded-full text-sm ${
                    mainAboutTab === 'legal' ? 'bg-primary/20 text-primary' : 'text-foreground/80 hover:bg-card/60'
                  }`}
                  title={ui.nav.legal}
                >
                  <Scale className="w-4 h-4" />
                </button>
              </div>

              {mainAboutTab === 'about' && aboutMe && (
                <div 
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: markdownToHtml(aboutMe.content) }}
                />
              )}

              {mainAboutTab === 'cv' && (
                <>
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    {(cv?.[activeCvTab] || []).map((item: any, idx: number) => (
                      <div key={idx} className="bg-card rounded-2xl p-4 border border-border card-hover">
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-2">
                          <span className="font-semibold text-foreground">{item.title}</span>
                          {item.year && <span>{item.year}</span>}
                          {item.subtitle && <span>· {item.subtitle}</span>}
                        </div>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                          {item.details?.map((d: string, di: number) => {
                            // Парсим технологии в формате ^category^tech^
                            const parts: (string | JSX.Element)[] = [];
                            let lastIndex = 0;
                            const regex = /\^([^\^]+)\^([^\^]+)\^/g;
                            let match;
                            
                            while ((match = regex.exec(d)) !== null) {
                              // Добавляем текст перед совпадением
                              if (match.index > lastIndex) {
                                parts.push(d.substring(lastIndex, match.index));
                              }
                              
                              const category = match[1];
                              const tech = match[2];
                              
                              // Добавляем кликабельный бадж с подсказкой категории
                              parts.push(
                                <span
                                  key={`${di}-${match.index}`}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors mx-0.5"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveSection('search');
                                    setGlobalSearchQuery(tech);
                                    window.history.pushState({}, '', `${basePath}search`);
                                  }}
                                  title={`Category: ${category}`}
                                >
                                  <span className="text-[10px] opacity-70">{category}</span>
                                  <span className="font-medium">{tech}</span>
                                </span>
                              );
                              
                              lastIndex = match.index + match[0].length;
                            }
                            
                            // Добавляем оставшийся текст
                            if (lastIndex < d.length) {
                              parts.push(d.substring(lastIndex));
                            }
                            
                            return <li key={di}>{parts.length > 0 ? parts : d}</li>;
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {activeCvTab === 'gamedev' && (cv as any)?.prototypes && (
                    <div className="mt-6">
                      <h3 className="text-2xl font-bold mb-4">Game Prototypes</h3>
                      <div className="grid md:grid-cols-3 gap-6">
                        {(cv as any).prototypes.map((proto: any, index: number) => (
                          <div
                            key={proto.title || index}
                            className="neu rounded-3xl overflow-hidden bg-card card-hover"
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
                            <div className="aspect-video bg-gradient-hero relative flex items-center justify-center">
                              <Play className="w-10 h-10 text-primary-foreground/50" />
                            </div>
                            <div className="p-6">
                              <h4 className="text-xl font-bold mb-2">{proto.title || 'Prototype'}</h4>
                              <p className="text-muted-foreground text-sm mb-4">{proto.description || 'Demo'}</p>
                              <div className="flex flex-wrap gap-2 mb-4">
                                {(proto.tech || []).map((t: string) => (
                                  <span key={t} className="px-2 py-1 text-xs font-medium rounded-lg bg-muted text-muted-foreground">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {mainAboutTab === 'projects' && (
                <div className="mt-4">
                  <h3 className="text-3xl font-bold mb-6 gradient-text">{ui.projectsTitle}</h3>
                  
                  {projects.length === 0 ? (
                    <div className="text-center py-16">
                      <p className="text-muted-foreground text-lg">{ui.loading}</p>
                    </div>
                  ) : (
                    <>
                  
                  {/* Category Tabs */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {['All', 'IT', 'Gamedev', 'Design'].map((cat) => {
                      const count = cat === 'All' ? projects.length : projects.filter(p => p.category === cat).length;
                      return (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm ${
                            selectedCategory === cat ? 'bg-primary/20 text-primary' : 'text-foreground/80 hover:bg-card/60'
                          }`}
                        >
                          {cat} ({count})
                        </button>
                      );
                    })}
                  </div>

                  {/* Projects Grid */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects
                      .filter(p => selectedCategory === 'All' || p.category === selectedCategory)
                      .map((project, index) => (
                        <article
                          key={project.id}
                          className="neu rounded-3xl overflow-hidden bg-card card-hover fade-in-up cursor-pointer"
                          style={{ animationDelay: `${index * 80}ms` }}
                          onClick={() => {
                            setActiveProject(project);
                            setActiveSection('project');
                            window.history.pushState({}, '', `/site/about/projects/${project.id}`);
                          }}
                        >
                          <div className="aspect-video bg-gradient-hero relative overflow-hidden">
                            {project.preview ? (
                              project.preview.endsWith('.webm') || project.preview.endsWith('.mp4') ? (
                                <video 
                                  src={project.preview} 
                                  className="w-full h-full object-cover"
                                  autoPlay
                                  loop
                                  muted
                                  playsInline
                                />
                              ) : (
                                <img 
                                  src={project.preview} 
                                  alt={project.title}
                                  className="w-full h-full object-cover"
                                />
                              )
                            ) : (
                              <div className="w-full h-full bg-gradient-hero flex items-center justify-center">
                                <Briefcase className="w-10 h-10 text-primary-foreground/50" />
                              </div>
                            )}
                          </div>
                          <div className="p-6">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                              <span className="px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                                {project.category}
                              </span>
                              {project.date && <span>· {project.date}</span>}
                            </div>
                            <h4 className="text-xl font-bold mb-2 text-foreground">{project.title}</h4>
                            <p className="text-muted-foreground text-sm line-clamp-3">
                              {stripMarkdown(project.content).slice(0, 150)}...
                            </p>
                            {project.tags && project.tags.length > 0 && (
                              <div className="mt-4 flex flex-wrap gap-2">
                                {project.tags.slice(0, 3).map((tag) => {
                                  const tagCount = posts.filter((p) => p.tags?.includes(tag)).length + 
                                                   wiki.filter((w) => w.tags?.includes(tag)).length +
                                                   projects.filter((pr) => pr.tags?.includes(tag)).length;
                                  return (
                                    <button
                                      key={tag}
                                      onClick={() => {
                                        setActiveSection('search');
                                        setGlobalSearchQuery(tag);
                                      }}
                                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted hover:bg-primary hover:text-primary-foreground transition-colors text-xs font-medium"
                                    >
                                      <Tag className="w-3 h-3" />
                                      {tag}
                                      <span className="text-xs opacity-70">
                                        ({tagCount})
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </article>
                      ))}
                  </div>
                  </>
                  )}
                </div>
              )}

              {mainAboutTab === 'legal' && legalNotice && (
                <div className="mt-4">
                  <h2 className="text-3xl font-bold mb-6">{legalNotice.title}</h2>
                  {legalNotice.updatedAt && (
                    <p className="text-sm text-muted-foreground mb-6">
                      Last Updated: {legalNotice.updatedAt}
                    </p>
                  )}
                  <div
                    className="prose prose-lg max-w-none text-foreground markdown-body"
                    dangerouslySetInnerHTML={{ __html: markdownToHtml(legalNotice.content) }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Skills & Technologies Radar Chart */}
          {mainAboutTab === 'cv' && cv && (() => {
            // Собираем статистику по категориям из ВСЕГО резюме
            const categoryCounts: Record<string, Record<string, number>> = {};
            
            Object.keys(cv).forEach(section => {
              const sectionData = (cv as Record<string, unknown>)[section];
              if (Array.isArray(sectionData)) {
                sectionData.forEach((item: any) => {
                  if (!item.details) return;
                  
                  item.details.forEach((detail: string) => {
                    const matches = detail.match(/\^([^\^]+)\^([^\^]+)\^/g);
                    if (matches) {
                      matches.forEach(match => {
                        const parts = match.split('^').filter(Boolean);
                        if (parts.length >= 2) {
                          const [category, tech] = parts;
                          if (!categoryCounts[category]) {
                            categoryCounts[category] = {};
                          }
                          categoryCounts[category][tech] = (categoryCounts[category][tech] || 0) + 1;
                        }
                      });
                    }
                  });
                });
              }
            });
            
            // Обработка категории Business - добавляем управленческие термины
            Object.keys(categoryCounts).forEach(cat => {
              if (cat.toLowerCase().includes('management') || cat.toLowerCase().includes('leadership')) {
                // Если есть отдельная категория Management/Leadership - переносим в Business
                if (cat !== 'Business') {
                  if (!categoryCounts['Business']) {
                    categoryCounts['Business'] = {};
                  }
                  Object.entries(categoryCounts[cat]).forEach(([tech, count]) => {
                    categoryCounts['Business'][tech] = (categoryCounts['Business'][tech] || 0) + count;
                  });
                  delete categoryCounts[cat];
                }
              }
            });
            
            // Подсчитываем общее количество для каждой категории
            const categoryTotals = Object.entries(categoryCounts).map(([category, techs]) => ({
              category,
              total: Object.values(techs).reduce((sum, count) => sum + count, 0),
              techs
            })).sort((a, b) => a.category.localeCompare(b.category)); // Сортировка по алфавиту
            
            if (categoryTotals.length === 0) return null;
            
            const maxValue = Math.max(...categoryTotals.map(c => c.total));
            const numCategories = categoryTotals.length;
            
            // Параметры radar chart
            const centerX = 250;
            const centerY = 250;
            const maxRadius = 180;
            const levels = 5;
            
            // Функция для расчета точек многоугольника
            const getPoint = (index: number, value: number) => {
              const angle = (Math.PI * 2 * index) / numCategories - Math.PI / 2;
              const radius = (value / maxValue) * maxRadius;
              return {
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle)
              };
            };
            
            // Функция для расчета точек осей (labels)
            const getLabelPoint = (index: number, distance: number) => {
              const angle = (Math.PI * 2 * index) / numCategories - Math.PI / 2;
              return {
                x: centerX + distance * Math.cos(angle),
                y: centerY + distance * Math.sin(angle)
              };
            };
            
            return (
              <div className="relative overflow-hidden glass rounded-3xl p-8 neu-sm fade-in-up mb-6">
                <div className="absolute inset-0 noise-overlay pointer-events-none" />
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-6 text-center">
                    {language === 'en' && 'Skills & Technologies Overview'}
                    {language === 'ru' && 'Обзор навыков и технологий'}
                    {language === 'fr' && 'Aperçu des compétences et technologies'}
                  </h3>
                  
                  <div className="flex justify-center items-center">
                    <div className="relative group">
                      <svg width="550" height="550" viewBox="0 0 500 500" className="max-w-full">
                        {/* Концентрические многоугольники (уровни) */}
                        {Array.from({ length: levels }, (_, i) => {
                          const radius = ((i + 1) / levels) * maxRadius;
                          const value = Math.round((maxValue / levels) * (i + 1));
                          const levelNumber = i + 1;
                          
                          // Определяем, является ли этот уровень "жирным" (только уровни 4, 7, 11, 14, 18)
                          const thickLevels = [4, 7, 11, 14, 18];
                          const isThickLevel = thickLevels.includes(levelNumber);
                          
                          // Строим точки многоугольника для этого уровня
                          const polygonPoints = categoryTotals
                            .map((_cat, index) => {
                              const angle = (Math.PI * 2 * index) / numCategories - Math.PI / 2;
                              const x = centerX + radius * Math.cos(angle);
                              const y = centerY + radius * Math.sin(angle);
                              return `${x},${y}`;
                            })
                            .join(' ');
                          
                          return (
                            <g key={i}>
                              {/* Многоугольник уровня */}
                              <polygon
                                points={polygonPoints}
                                fill="none"
                                stroke="hsl(var(--foreground))"
                                strokeWidth={isThickLevel ? "2.5" : "1"}
                                opacity={isThickLevel ? "0.7" : "0.25"}
                              />
                              {/* Подписи уровней для всех линий */}
                              <text
                                x={centerX + 5}
                                y={centerY - radius}
                                className={isThickLevel ? "text-xs fill-foreground font-semibold" : "text-xs fill-muted-foreground"}
                                opacity={isThickLevel ? "0.8" : "0.5"}
                              >
                                {value}
                              </text>
                            </g>
                          );
                        })}
                        
                        {/* Оси от центра к каждой категории */}
                        {categoryTotals.map((cat, index) => {
                          const point = getLabelPoint(index, maxRadius);
                          return (
                            <line
                              key={`axis-${cat.category}`}
                              x1={centerX}
                              y1={centerY}
                              x2={point.x}
                              y2={point.y}
                              stroke="hsl(var(--foreground))"
                              strokeWidth="1.5"
                              opacity="0.4"
                            />
                          );
                        })}
                        
                        {/* Заливка области данных */}
                        <polygon
                          points={categoryTotals
                            .map((cat, index) => {
                              const point = getPoint(index, cat.total);
                              return `${point.x},${point.y}`;
                            })
                            .join(' ')}
                          fill="hsl(var(--primary))"
                          opacity="0.2"
                          stroke="hsl(var(--primary))"
                          strokeWidth="2"
                        />
                        
                        {/* Точки данных с интерактивностью */}
                        {categoryTotals.map((cat, index) => {
                          const point = getPoint(index, cat.total);
                          const techList = Object.entries(cat.techs)
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 10)
                            .map(([tech, count]) => `${tech}: ${count}`)
                            .join('\n');
                          
                          return (
                            <g key={`point-${cat.category}`}>
                              <circle
                                cx={point.x}
                                cy={point.y}
                                r="8"
                                fill="hsl(var(--primary))"
                                className="cursor-pointer transition-all hover:scale-125"
                                style={{ transformOrigin: `${point.x}px ${point.y}px` }}
                              >
                                <title>{`${cat.category} (Total: ${cat.total})\n\n${techList}${Object.keys(cat.techs).length > 10 ? `\n\n+${Object.keys(cat.techs).length - 10} more technologies` : ''}`}</title>
                              </circle>
                            </g>
                          );
                        })}
                        
                        {/* Подписи категорий */}
                        {categoryTotals.map((cat, index) => {
                          const labelPoint = getLabelPoint(index, maxRadius + 45);
                          return (
                            <text
                              key={`label-${cat.category}`}
                              x={labelPoint.x}
                              y={labelPoint.y}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              className="text-xs font-bold fill-current cursor-pointer hover:fill-primary transition-colors"
                              onClick={() => {
                                // При клике на категорию - показываем первую технологию из неё
                                const topTech = Object.entries(cat.techs).sort((a, b) => b[1] - a[1])[0][0];
                                setActiveSection('search');
                                setGlobalSearchQuery(topTech);
                                window.history.pushState({}, '', `${basePath}search`);
                              }}
                            >
                              {cat.category}
                            </text>
                          );
                        })}
                        
                        {/* Центральная точка */}
                        <circle
                          cx={centerX}
                          cy={centerY}
                          r="5"
                          fill="hsl(var(--muted-foreground))"
                          opacity="0.5"
                        />
                      </svg>
                      
                    </div>
                  </div>
                  
                  {/* Легенда */}
                  <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                    {categoryTotals.slice(0, 8).map((cat) => (
                      <div key={cat.category} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                        <div className="w-3 h-3 rounded-full bg-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{cat.category}</div>
                          <div className="text-xs text-muted-foreground">
                            {cat.total} {language === 'ru' ? 'упоминаний' : language === 'fr' ? 'mentions' : 'mentions'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Tags Pie Chart */}
          <div className="relative overflow-hidden glass rounded-3xl p-8 neu-sm fade-in-up">
            <div className="absolute inset-0 noise-overlay pointer-events-none" />
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-6 text-center">{ui.tags}</h3>
              
              {(() => {
                // Собираем статистику по тегам
                const tagCounts: Record<string, number> = {};
                posts.forEach(p => p.tags?.forEach(tag => {
                  tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                }));
                wiki.forEach(w => w.tags?.forEach(tag => {
                  tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                }));
                projects.forEach(pr => pr.tags?.forEach(tag => {
                  tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                }));
                
                const sortedTags = Object.entries(tagCounts)
                  .sort((a, b) => b[1] - a[1]);
                
                const topTags = sortedTags.slice(0, 27);
                const hasMore = sortedTags.length > 27;
                // Считаем totalCount ТОЛЬКО для отображаемых тегов (топ-27)
                const totalCount = topTags.reduce((sum, [, count]) => sum + count, 0);
                
                // Генерируем цвета для каждого тега
                const colors = [
                  'hsl(200, 90%, 55%)', 'hsl(160, 80%, 52%)', 'hsl(45, 98%, 62%)',
                  'hsl(280, 70%, 62%)', 'hsl(340, 75%, 58%)', 'hsl(120, 65%, 50%)',
                  'hsl(60, 90%, 55%)', 'hsl(180, 75%, 45%)', 'hsl(300, 80%, 60%)',
                  'hsl(30, 85%, 55%)', 'hsl(210, 85%, 60%)', 'hsl(150, 70%, 50%)',
                  'hsl(270, 75%, 65%)', 'hsl(0, 80%, 60%)', 'hsl(90, 70%, 50%)',
                  'hsl(240, 70%, 60%)', 'hsl(330, 75%, 60%)', 'hsl(75, 80%, 55%)',
                  'hsl(195, 85%, 50%)', 'hsl(315, 70%, 60%)', 'hsl(45, 90%, 60%)',
                  'hsl(165, 75%, 48%)', 'hsl(255, 75%, 62%)', 'hsl(15, 80%, 58%)',
                  'hsl(135, 70%, 52%)', 'hsl(285, 75%, 60%)', 'hsl(225, 80%, 58%)',
                ];
                
                // Генерируем SVG круговую диаграмму
                const radius = 120;
                const centerX = 150;
                const centerY = 150;
                
                // Предварительно рассчитываем углы для каждого сегмента
                const segments = topTags.map(([tag, count]) => {
                  const percentage = count / totalCount;
                  return {
                    tag,
                    count,
                    percentage,
                    angle: percentage * 360
                  };
                });
                
                // Накапливаем углы
                let accumulatedAngle = 0;
                const segmentsWithAngles = segments.map(seg => {
                  const startAngle = accumulatedAngle;
                  const endAngle = accumulatedAngle + seg.angle;
                  accumulatedAngle = endAngle;
                  return { ...seg, startAngle, endAngle };
                });
                
                return (
                  <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
                    {/* Круговая диаграмма */}
                    <div className="relative">
                      <svg width="300" height="300" viewBox="0 0 300 300" className="transform -rotate-90">
                        {segmentsWithAngles.map((seg, index) => {
                          const x1 = centerX + radius * Math.cos((seg.startAngle * Math.PI) / 180);
                          const y1 = centerY + radius * Math.sin((seg.startAngle * Math.PI) / 180);
                          const x2 = centerX + radius * Math.cos((seg.endAngle * Math.PI) / 180);
                          const y2 = centerY + radius * Math.sin((seg.endAngle * Math.PI) / 180);
                          
                          const largeArc = seg.angle > 180 ? 1 : 0;
                          
                          const pathData = [
                            `M ${centerX} ${centerY}`,
                            `L ${x1} ${y1}`,
                            `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
                            'Z'
                          ].join(' ');
                          
                          return (
                            <g key={seg.tag}>
                              <path
                                d={pathData}
                                fill={colors[index % colors.length]}
                                opacity="0.9"
                                className="hover:opacity-100 transition-opacity cursor-pointer"
                                onClick={() => {
                                  setActiveSection('search');
                                  setGlobalSearchQuery(seg.tag);
                                  window.history.pushState({}, '', `${basePath}search`);
                                }}
                              >
                                <title>{seg.tag}: {seg.count} ({(seg.percentage * 100).toFixed(1)}%)</title>
                              </path>
                              {/* Показываем процент если сегмент достаточно большой */}
                              {seg.percentage > 0.05 && (() => {
                                const midAngle = (seg.startAngle + seg.endAngle) / 2;
                                const labelRadius = radius * 0.7;
                                const labelX = centerX + labelRadius * Math.cos((midAngle * Math.PI) / 180);
                                const labelY = centerY + labelRadius * Math.sin((midAngle * Math.PI) / 180);
                                
                                return (
                                  <text
                                    x={labelX}
                                    y={labelY}
                                    className="text-xs font-bold pointer-events-none transform rotate-90"
                                    fill="white"
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    style={{ 
                                      paintOrder: 'stroke',
                                      stroke: 'rgba(0,0,0,0.5)',
                                      strokeWidth: '2px'
                                    }}
                                  >
                                    {(seg.percentage * 100).toFixed(0)}%
                                  </text>
                                );
                              })()}
                            </g>
                          );
                        })}
                        {/* Центральный круг для красоты */}
                        <circle
                          cx={centerX}
                          cy={centerY}
                          r="40"
                          fill="hsl(var(--background))"
                          className="opacity-95"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                          <div className="text-3xl font-bold">{sortedTags.length}</div>
                          <div className="text-xs text-muted-foreground uppercase tracking-wider">Tags</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Легенда */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl">
                      {topTags.map(([tag, count], index) => (
                        <button
                          key={tag}
                          onClick={() => {
                            setActiveSection('search');
                            setGlobalSearchQuery(tag);
                            window.history.pushState({}, '', `${basePath}search`);
                          }}
                          className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors text-left"
                        >
                          <div 
                            className="w-4 h-4 rounded flex-shrink-0"
                            style={{ backgroundColor: colors[index % colors.length] }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{tag}</div>
                            <div className="text-xs text-muted-foreground">{count} {count === 1 ? 'item' : 'items'}</div>
                          </div>
                        </button>
                      ))}
                      {hasMore && (
                        <div className="flex items-center gap-2 p-2 text-muted-foreground">
                          <div className="w-4 h-4 rounded bg-muted flex-shrink-0" />
                          <div className="text-sm">... and {sortedTags.length - 27} more</div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </section>
      )}

      {activeSection === 'apps' && ui.apps && (
        <section className="w-full px-6 py-12 space-y-8">
          <div className="max-w-6xl mx-auto space-y-2">
            <div className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              {ui.apps.subtitle}
            </div>
            <h2 className="text-4xl font-bold">{ui.apps.title}</h2>
            <p className="text-lg text-muted-foreground max-w-3xl">{ui.apps.selectPrompt}</p>
          </div>

          <div className="space-y-6">
            {/* Iframe на всю ширину экрана */}
            <div className="w-full">
              <div className="glass rounded-3xl border border-border neu-sm overflow-hidden" data-iframe-container>
                {selectedApp ? (
                  <>
                    <div className="relative w-full overflow-hidden bg-background" style={{ height: `${iframeHeight}px` }}>
                      {selectedApp.url ? (
                        <iframe
                          title={selectedApp.iframeTitle ?? selectedApp.title}
                          src={selectedApp.url}
                          className="absolute inset-0 h-full w-full border-0"
                          loading="lazy"
                          sandbox="allow-modals allow-forms allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                          No preview available
                        </div>
                      )}
                      <div className="absolute top-4 right-4 flex flex-wrap items-center gap-2 z-10">
                        {(selectedApp.badges || []).map((badge) => (
                          <span
                            key={badge}
                            className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.3em] rounded-full bg-primary text-primary-foreground shadow-lg"
                          >
                            {badge}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Resize handle */}
                    <div 
                      className="relative h-10 bg-gradient-to-b from-border/20 via-border/40 to-border/60 cursor-ns-resize hover:bg-primary/20 transition-all group select-none"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setIsResizing(true);
                      }}
                      title="Потяните для изменения высоты"
                    >
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="flex flex-col items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          <div className="text-[10px] uppercase tracking-[0.3em] text-foreground font-bold">
                            Изменить размер
                          </div>
                          <div className="flex gap-1.5">
                            <div className="w-10 h-1 rounded-full bg-foreground/60"></div>
                            <div className="w-10 h-1 rounded-full bg-foreground/60"></div>
                            <div className="w-10 h-1 rounded-full bg-foreground/60"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-96 text-muted-foreground">Loading apps...</div>
                )}
              </div>
            </div>

            {/* Описание и списки ниже - ограничены по ширине */}
            <div className="max-w-6xl mx-auto">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,300px)_1fr]">
                {/* Списки категорий слева */}
                <div className="space-y-4">
                {APP_CATEGORIES.map((category) => {
                  const items = appsByCategory[category] || [];
                  const label = (ui.apps?.categories as any)?.[category] || category;
                  return (
                    <div key={category} className="glass rounded-2xl border border-border p-4 neu-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold">{label}</h3>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-[0.3em]">{items.length}</span>
                      </div>
                      {items.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic">Soon.</p>
                      ) : (
                        <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
                          {items.map((app) => {
                            const isActive = selectedApp?.id === app.id;
                            return (
                              <button
                                key={app.id}
                                type="button"
                                className={`w-full text-left rounded-xl border transition-all duration-200 px-3 py-2 ${
                                  isActive
                                    ? 'border-primary bg-primary/10 text-primary shadow-sm'
                                    : 'border-border/60 bg-card/50 hover:border-primary/60 hover:bg-card'
                                }`}
                                onClick={() => setSelectedApp(app)}
                              >
                                <div className="font-semibold text-sm">{app.title}</div>
                                <div className="text-[10px] text-muted-foreground mt-0.5">{app.date || '—'}</div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Описание справа */}
              {selectedApp && (
                <div className="glass rounded-3xl border border-border p-6 neu-sm space-y-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <h3 className="text-2xl font-bold text-foreground">{selectedApp.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {selectedApp.description || selectedApp.content || 'Description is missing.'}
                      </p>
                    </div>
                    {selectedApp.url && (
                      <button
                        type="button"
                        onClick={() => window.open(selectedApp.url, '_blank', 'noreferrer')}
                        className="neu px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:scale-105 transition-transform whitespace-nowrap"
                      >
                        {language === 'ru' ? 'Открыть' : 'Open Full'}
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-3 border-t border-border/50">
                    <div className="space-y-1.5">
                      <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-semibold">
                        {ui.apps?.dateLabel || 'Date'}
                      </div>
                      <div className="text-sm font-semibold text-foreground">{selectedApp.date || '—'}</div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-semibold">
                        {ui.apps?.platformsLabel || 'Platforms'}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(!selectedApp.platforms || selectedApp.platforms.length === 0) ? (
                          <span className="text-sm text-muted-foreground">—</span>
                        ) : (
                          selectedApp.platforms.map((platform) => (
                            <span key={platform} className="px-2.5 py-1 rounded-lg bg-muted text-xs font-semibold">
                              {platform}
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-semibold">
                        {language === 'ru' ? 'Технологии' : 'Technologies'}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(!selectedApp.technologies || selectedApp.technologies.length === 0) ? (
                          <span className="text-sm text-muted-foreground">—</span>
                        ) : (
                          selectedApp.technologies.map((tech) => (
                            <span key={tech} className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                              {tech}
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-semibold">
                        {ui.apps?.badgesLabel || 'Tags'}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(!selectedApp.badges || selectedApp.badges.length === 0) ? (
                          <span className="text-sm text-muted-foreground">—</span>
                        ) : (
                          selectedApp.badges.map((badge) => (
                            <span key={badge} className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-semibold">
                              {badge}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              </div>
            </div>
          </div>
        </section>
      )}

      {activeSection === 'wiki' && (
        <section className="max-w-6xl mx-auto px-6 py-12 space-y-8">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-foreground/80">
              <Layers className="w-4 h-4" />
              <span>{ui.wikiTitle}</span>
            </div>
            <div className="text-muted-foreground">Знания и заметки</div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Layers className="w-4 h-4" />
              <span>{ui.categories}</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {wikiCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveWiki(null);
                    setWikiCategory(cat);
                  }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    wikiCategory === cat ? 'neu-sm bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {`${cat}${cat !== 'All' && wikiCategoryStats[cat] ? ` (${wikiCategoryStats[cat]})` : ''}`}
                </button>
              ))}
            </div>
            <div className="relative w-full md:w-80 ml-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={wikiSearch}
                onChange={(e) => setWikiSearch(e.target.value)}
                placeholder={ui.searchPlaceholder}
                className="w-full pl-10 pr-3 py-2 rounded-xl bg-card border border-border focus:border-primary outline-none"
              />
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr_2fr] gap-6">
            <aside className="glass rounded-2xl p-4 neu-sm self-start">
              <div className="flex items-center gap-2 text-sm font-semibold mb-3">
                <Layers className="w-4 h-4 text-primary" />
                <span>{ui.categories}</span>
              </div>
              <div className="space-y-2">
                {wikiCategories.map((cat) => {
                  const categoryNode = wikiCategoryTree.get(cat);
                  const subcategories = categoryNode ? Array.from(categoryNode.children.entries()) : [];
                  const hasSubcategories = cat !== 'All' && subcategories.length > 0;
                  const isExpanded = expandedWikiCategories.has(cat);
                  
                  // Рекурсивный рендер подкатегорий
                  const renderSubcategories = (subcats: [string, any][], level: number = 1): JSX.Element => {
                    return (
                      <>
                        {subcats.map(([subName, subNode]) => {
                          const subPath = subNode.fullPath;
                          const hasChildren = subNode.children && subNode.children.size > 0;
                          const isSubExpanded = expandedWikiCategories.has(subPath);
                          
                          return (
                            <div key={subPath} className="space-y-1">
                              <div className="flex items-center gap-1" style={{ paddingLeft: `${level * 8}px` }}>
                                {hasChildren && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const newExpanded = new Set(expandedWikiCategories);
                                      if (isSubExpanded) {
                                        newExpanded.delete(subPath);
                                      } else {
                                        newExpanded.add(subPath);
                                      }
                                      setExpandedWikiCategories(newExpanded);
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
                                    setActiveWiki(null);
                                    setWikiCategory(subPath);
                                  }}
                                  className={`flex-1 flex items-center justify-between px-2 py-1 rounded-lg text-xs transition-all ${
                                    wikiCategory === subPath ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                  } ${!hasChildren ? 'ml-4' : ''}`}
                                >
                                  <span>{subName}</span>
                                  <span className="text-xs opacity-60">{subNode.count}</span>
                                </button>
                              </div>
                              {hasChildren && isSubExpanded && (
                                <div className="space-y-1">
                                  {renderSubcategories(Array.from(subNode.children.entries()), level + 1)}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </>
                    );
                  };
                  
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex items-center gap-1">
                        {hasSubcategories && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const newExpanded = new Set(expandedWikiCategories);
                              if (isExpanded) {
                                newExpanded.delete(cat);
                              } else {
                                newExpanded.add(cat);
                              }
                              setExpandedWikiCategories(newExpanded);
                            }}
                            className="p-1 hover:bg-muted rounded transition-colors"
                            aria-label={isExpanded ? 'Свернуть' : 'Развернуть'}
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
                            setActiveWiki(null);
                            setWikiCategory(cat);
                          }}
                          className={`flex-1 flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                            wikiCategory === cat ? 'neu-sm bg-primary/10 text-primary' : 'hover:bg-muted text-foreground'
                          } ${!hasSubcategories ? 'ml-5' : ''}`}
                        >
                          <span>{cat}</span>
                          {cat !== 'All' && wikiCategoryStats[cat] ? (
                            <span className="text-xs text-muted-foreground">{wikiCategoryStats[cat]}</span>
                          ) : null}
                        </button>
                      </div>
                      {hasSubcategories && isExpanded && (
                        <div className="ml-4 space-y-1">
                          {renderSubcategories(subcategories)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </aside>

            <div className="space-y-6">
              {activeWiki && (
                <ContentReader
                  title={activeWiki.title}
                  html={activeWiki.html}
                  date={activeWiki.updatedAt}
                  category={activeWiki.pathSegments ? activeWiki.pathSegments.join(' / ') : (activeWiki.categoryPath || 'wiki')}
                  tags={activeWiki.tags}
                  tagsLabel={ui.tags}
                  onTagClick={(tag) => {
                    setActiveWiki(null);
                    setActiveSection('search');
                    setGlobalSearchQuery(tag);
                    window.history.pushState({}, '', `${basePath}search`);
                  }}
                  tagCounts={
                    activeWiki.tags
                      ? Object.fromEntries(
                          activeWiki.tags.map((tag) => [
                            tag,
                            posts.filter((p) => p.tags?.includes(tag)).length +
                              wiki.filter((w) => w.tags?.includes(tag)).length +
                              projects.filter((pr) => pr.tags?.includes(tag)).length,
                          ])
                        )
                      : {}
                  }
                  headerMeta={
                    <>
                      <button
                        onClick={() => {
                          setActiveWiki(null);
                          window.history.pushState({}, '', `${basePath}wiki`);
                        }}
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        {ui.back}
                      </button>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-3">
                        <span className="inline-flex items-center gap-1">
                          <Layers className="w-4 h-4" />
                          {activeWiki.pathSegments ? activeWiki.pathSegments.join(' / ') : (activeWiki.categoryPath || 'wiki')}
                        </span>
                        <ArrowRight className="w-4 h-4 opacity-60" />
                        <span className="font-medium text-foreground">{activeWiki.title}</span>
                      </div>
                    </>
                  }
                />
              )}
              {!activeWiki && (
                <>
                  {/* Отображение index категории если есть */}
                  {wikiCategoryIndex && wikiCategory !== 'All' && (
                    <div className="glass rounded-3xl p-6 md:p-8 neu-sm fade-in-up mb-6">
                      <h3 className="text-2xl font-bold mb-4">{wikiCategoryIndex.title}</h3>
                      <div className="prose prose-lg max-w-none text-foreground markdown-body" dangerouslySetInnerHTML={{ __html: markdownToHtml(wikiCategoryIndex.content) }} />
                    </div>
                  )}

                  {paginatedWiki.length === 0 ? (
                    <div className="text-muted-foreground">{ui.nothing}</div>
                  ) : (
                    <>
                      <div className="grid md:grid-cols-2 gap-6">
                        {paginatedWiki.map((item) => (
                        <article
                          key={item.relativePath}
                          className="glass rounded-2xl p-4 neu-sm hover:cursor-pointer hover:-translate-y-1 transition-transform"
                          onClick={() => handleOpenWiki(item)}
                        >
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                            <FileText className="w-4 h-4" />
                            <span>{item.categoryPath || 'wiki'}</span>
                            {item.updatedAt && <span>· {item.updatedAt}</span>}
                          </div>
                          <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-3">{item.excerpt}</p>
                        </article>
                      ))}
                    </div>
                    <Pagination currentPage={wikiPage} totalPages={totalWikiPages} onPageChange={setWikiPage} />
                  </>
                  )}
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {activeSection === 'cv' && (
        <section className="max-w-6xl mx-auto px-6 py-12 space-y-8">
          <h2 className="text-3xl font-bold">{ui.cvTitle}</h2>
          <div className="flex flex-wrap gap-3 items-center">
            {(['it', 'education', 'gamedev', 'rewards'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveCvTab(tab)}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  activeCvTab === tab ? 'neu-sm bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
            <div className="flex gap-2 ml-auto">
              <button
                onClick={() => window.print()}
                className="neu px-4 py-2 rounded-xl bg-card hover:bg-primary/10 transition-colors flex items-center gap-2"
              >
                <span>Print</span>
              </button>
              <button
                onClick={() => {
                  const blob = new Blob([JSON.stringify(cv, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'cv.json';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="neu px-4 py-2 rounded-xl bg-primary text-primary-foreground flex items-center gap-2"
              >
                <span>Download JSON</span>
              </button>
            </div>
          </div>

          <div className="glass rounded-3xl p-6 neu-sm fade-in-up">
            <h3 className="text-2xl font-semibold mb-4 capitalize">{activeCvTab}</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {(cv?.[activeCvTab] || []).map((item: any, idx: number) => (
                <div key={idx} className="bg-card rounded-2xl p-4 border border-border card-hover">
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-2">
                    <span className="font-semibold text-foreground">{item.title}</span>
                    {item.year && <span>{item.year}</span>}
                    {item.subtitle && <span>· {item.subtitle}</span>}
                  </div>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {item.details?.map((d: string, di: number) => {
                      // Парсим технологии в формате ^category^tech^
                      const parts: (string | JSX.Element)[] = [];
                      let lastIndex = 0;
                      const regex = /\^([^\^]+)\^([^\^]+)\^/g;
                      let match;
                      
                      while ((match = regex.exec(d)) !== null) {
                        // Добавляем текст перед совпадением
                        if (match.index > lastIndex) {
                          parts.push(d.substring(lastIndex, match.index));
                        }
                        
                        const category = match[1];
                        const tech = match[2];
                        
                        // Добавляем кликабельный бадж
                        parts.push(
                          <span
                            key={`${di}-${match.index}`}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors mx-0.5"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveSection('search');
                              setGlobalSearchQuery(tech);
                              window.history.pushState({}, '', `${basePath}search`);
                            }}
                          >
                            <span className="text-[10px] opacity-70">{category}</span>
                            <span className="font-medium">{tech}</span>
                          </span>
                        );
                        
                        lastIndex = match.index + match[0].length;
                      }
                      
                      // Добавляем оставшийся текст
                      if (lastIndex < d.length) {
                        parts.push(d.substring(lastIndex));
                      }
                      
                      return <li key={di}>{parts.length > 0 ? parts : d}</li>;
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {activeCvTab === 'gamedev' && (cv as any)?.prototypes && (
            <div className="max-w-6xl mx-auto">
              <h3 className="text-2xl font-bold mb-6">Game Prototypes</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {(cv as any).prototypes.map((proto: any, index: number) => (
                  <div
                    key={proto.title || index}
                    className="neu rounded-3xl overflow-hidden bg-card card-hover"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="aspect-video bg-gradient-hero relative flex items-center justify-center">
                      <Play className="w-10 h-10 text-primary-foreground/50" />
                    </div>
                    <div className="p-6">
                      <h4 className="text-xl font-bold mb-2">{proto.title || 'Prototype'}</h4>
                      <p className="text-muted-foreground text-sm mb-4">{proto.description || 'Demo'}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {(proto.tech || []).map((t: string) => (
                          <span key={t} className="px-2 py-1 text-xs font-medium rounded-lg bg-muted text-muted-foreground">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {activeSection === 'gallery' && (
        <section className="max-w-6xl mx-auto px-6 py-12">
          <h2 className="text-3xl font-bold mb-6">{ui.galleryTitle}</h2>
          {pictures.length === 0 ? (
            <div className="text-muted-foreground">{ui.loading}</div>
          ) : (
            <div className="grid lg:grid-cols-[1fr_3fr] gap-6">
              {/* Боковая панель навигации */}
              <aside className="glass rounded-2xl p-4 neu-sm self-start">
                <div className="flex items-center gap-2 text-sm font-semibold mb-3">
                  <Folder className="w-4 h-4 text-primary" />
                  <span>{language === 'ru' ? 'Альбомы' : 'Albums'}</span>
                </div>
                <div className="space-y-2">
                  {/* Кнопка "Все альбомы" */}
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

                  {/* Список альбомов с рекурсией */}
                  {galleryAlbums.map((albumName) => {
                    const albumNode = galleryAlbumTree.get(albumName);
                    if (!albumNode) return null;
                    
                    const subalbums = Array.from(albumNode.children.entries());
                    const hasSubalbums = subalbums.length > 0;
                    const isExpanded = expandedGalleryAlbums.has(albumName);
                    
                    // Рекурсивный рендер подальбомов
                    const renderSubalbums = (subalbs: [string, any][], level: number = 1): JSX.Element => {
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

              {/* Основной контент */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {paginatedGallery.map((pic) => (
                    <button
                      key={pic.id}
                      className="relative overflow-hidden rounded-2xl neu card-hover aspect-square"
                      onClick={() => handleOpenPicture(filteredGalleryImages.indexOf(pic), pic.id)}
                    >
                      <img src={pic.path} alt={pic.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity p-3 text-white text-xs flex items-end">
                        <div className="font-medium">{pic.name}</div>
                      </div>
                    </button>
                  ))}
                </div>

                <Pagination currentPage={galleryPage} totalPages={totalGalleryPages} onPageChange={setGalleryPage} />
              </div>
            </div>
          )}
        </section>
      )}

      {/* News Full Section */}
      {activeSection === 'news' && (
        <main className="pt-32 pb-24">
          <div className="container mx-auto px-6">
            {activeNews ? (
              /* Detail view */
              <section className="max-w-4xl mx-auto">
                <ContentReader
                  title={
                    (language === 'ru' ? activeNews.title_ru : activeNews.title_en) ??
                    activeNews.title
                  }
                  html={markdownToHtml(activeNews.content)}
                  category={activeNews.category}
                  date={
                    activeNews.date
                      ? new Date(activeNews.date).toLocaleDateString(
                          language === 'ru' ? 'ru-RU' : 'en-US',
                          { year: 'numeric', month: 'long', day: 'numeric' }
                        )
                      : undefined
                  }
                  tags={activeNews.tags}
                  tagsLabel={ui.tags}
                  onTagClick={(tag) => {
                    setActiveNews(null);
                    setActiveSection('search');
                    setGlobalSearchQuery(tag);
                    window.history.pushState({}, '', `${basePath}search`);
                  }}
                  headerMeta={
                    <>
                      <button
                        onClick={() => {
                          setActiveNews(null);
                          window.history.pushState({}, '', `${basePath}news`);
                        }}
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        {ui.back}
                      </button>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <FileText className="w-4 h-4" />
                        <span className="font-medium text-foreground">{ui.nav.news}</span>
                        <ArrowRight className="w-4 h-4 opacity-60" />
                        <span className="text-foreground">
                          {(language === 'ru' ? activeNews.title_ru : activeNews.title_en) ??
                            activeNews.title}
                        </span>
                      </div>
                    </>
                  }
                />
              </section>
            ) : (
              /* List view */
              <section className="max-w-4xl mx-auto">
                <div className="text-center mb-12 animate-fade-in">
                  <h1 className="text-4xl md:text-6xl font-bold mb-6">
                    <span className="gradient-text">{ui.nav.news}</span>
                  </h1>
                </div>
                <NewsSection
                  limit={99}
                  onOpenNews={(item) => handleOpenNews(item as NewsItem)}
                />
              </section>
            )}
          </div>
        </main>
      )}

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
            <ArrowLeft className="w-6 h-6" />
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
                src={pictures[lightbox.idx].path}
                alt={pictures[lightbox.idx].name}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="mt-3 text-center text-muted-foreground">{pictures[lightbox.idx].name}</div>
          </div>
        </div>
      )}

      {/* Search Page */}
      {activeSection === 'search' && (
        <main className="pt-32 pb-24">
          <div className="container mx-auto px-6">
            {/* Header */}
            <section className="max-w-4xl mx-auto text-center mb-16">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
                <span className="gradient-text">{ui.search.title}</span>
              </h1>
              <p className="text-xl text-muted-foreground animate-fade-in animation-delay-100">
                {ui.search.subtitle}
              </p>
            </section>

            {/* Search Input */}
            <section className="max-w-4xl mx-auto mb-12">
              <div className="glass rounded-3xl p-6 md:p-8 neu-sm fade-in-up">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={ui.search.placeholder}
                    value={globalSearchQuery}
                    onChange={(e) => setGlobalSearchQuery(e.target.value)}
                    className="w-full pl-14 pr-4 py-4 text-lg rounded-2xl bg-card border border-border focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </section>

            {/* Search Results */}
            <section className="max-w-6xl mx-auto">
              {(() => {
                const query = globalSearchQuery.toLowerCase().trim();
                if (!query) {
                  return (
                    <div className="text-center py-16">
                      <p className="text-muted-foreground text-lg">{ui.search.allContent}</p>
                    </div>
                  );
                }

                const blogResults = posts.filter(
                  (p) =>
                    p.title.toLowerCase().includes(query) ||
                    p.excerpt.toLowerCase().includes(query) ||
                    p.tags?.some((t) => t.toLowerCase().includes(query))
                );
                const wikiResults = wiki.filter(
                  (w) =>
                    w.title.toLowerCase().includes(query) ||
                    w.excerpt.toLowerCase().includes(query)
                );
                const galleryResults = (() => {
                  const tagMatches = galleryByTag.get(query);
                  if (tagMatches && tagMatches.length > 0) {
                    const matchIds = new Set(tagMatches.map((item) => item.id.replace('picture__', '')));
                    return pictures.filter((pic) => matchIds.has(pic.id));
                  }
                  return pictures.filter(
                    (pic) => pic.name.toLowerCase().includes(query)
                  );
                })();
                const projectResults = (() => {
                  const tagMatches = projectsByTag.get(query);
                  if (tagMatches && tagMatches.length > 0) {
                    const matchIds = new Set(tagMatches.map((p) => p.id));
                    return projects.filter((p) => matchIds.has(p.id));
                  }
                  return projects.filter(
                    (pr) =>
                      pr.title.toLowerCase().includes(query) ||
                      pr.content.toLowerCase().includes(query) ||
                      pr.tags?.some((t) => t.toLowerCase().includes(query))
                  );
                })();

                const totalResults = blogResults.length + wikiResults.length + galleryResults.length + projectResults.length;

                if (totalResults === 0) {
                  return (
                    <div className="text-center py-16">
                      <p className="text-muted-foreground text-lg">{ui.nothing}</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-12">
                    <div className="text-center mb-8">
                      <p className="text-muted-foreground">
                        {totalResults} {ui.search.results}
                      </p>
                    </div>

                    {/* Blog Results */}
                    {blogResults.length > 0 && (
                      <div>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                          <BookOpen className="w-6 h-6" />
                          {ui.nav.blog} ({blogResults.length})
                        </h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {blogResults.map((post) => (
                            <article
                              key={post.id}
                              className="neu rounded-2xl overflow-hidden bg-card card-hover cursor-pointer"
                              onClick={() => {
                                setActivePost(post);
                                setActiveSection('blog');
                                window.history.pushState({}, '', `${basePath}blog/${post.id}.md`);
                              }}
                            >
                              <div className="aspect-video bg-gradient-hero relative">
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <BookOpen className="w-12 h-12 text-primary-foreground/50" />
                                </div>
                              </div>
                              <div className="p-4">
                                <h3 className="text-lg font-bold mb-2">{post.title}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                              </div>
                            </article>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Wiki Results */}
                    {wikiResults.length > 0 && (
                      <div>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                          <FileText className="w-6 h-6" />
                          {ui.nav.wiki} ({wikiResults.length})
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                          {wikiResults.map((item) => (
                            <article
                              key={item.relativePath}
                              className="glass rounded-2xl p-4 neu-sm hover:cursor-pointer hover:-translate-y-1 transition-transform"
                              onClick={() => {
                                setActiveWiki(item);
                                setActiveSection('wiki');
                                window.history.pushState({}, '', `${basePath}wiki/${item.relativePath!.replace(/\.md$/, '')}`);
                              }}
                            >
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                <FileText className="w-4 h-4" />
                                <span>{item.categoryPath || 'wiki'}</span>
                              </div>
                              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">{item.excerpt}</p>
                            </article>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Gallery Results */}
                    {galleryResults.length > 0 && (
                      <div>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                          <ImageIcon className="w-6 h-6" />
                          {ui.nav.gallery} ({galleryResults.length})
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {galleryResults.map((pic) => (
                            <button
                              key={pic.id}
                              className="relative overflow-hidden rounded-xl neu card-hover aspect-square"
                              onClick={() => handleOpenPicture(pictures.indexOf(pic), pic.id)}
                            >
                              <img src={pic.path} alt={pic.name} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Project Results */}
                    {projectResults.length > 0 && (
                      <div>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                          <Briefcase className="w-6 h-6" />
                          {ui.projectsTitle} ({projectResults.length})
                        </h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {projectResults.map((project) => (
                            <article
                              key={project.id}
                              className="neu rounded-2xl overflow-hidden bg-card card-hover cursor-pointer"
                              onClick={() => {
                                setActiveProject(project);
                                setActiveSection('project');
                                window.history.pushState({}, '', `/site/about/projects/${project.id}`);
                              }}
                            >
                              <div className="aspect-video bg-gradient-hero relative overflow-hidden">
                                {project.preview ? (
                                  project.preview.endsWith('.webm') || project.preview.endsWith('.mp4') ? (
                                    <video 
                                      src={project.preview} 
                                      className="w-full h-full object-cover"
                                      autoPlay
                                      loop
                                      muted
                                      playsInline
                                    />
                                  ) : (
                                    <img 
                                      src={project.preview} 
                                      alt={project.title}
                                      className="w-full h-full object-cover"
                                    />
                                  )
                                ) : (
                                  <div className="w-full h-full bg-gradient-hero flex items-center justify-center">
                                    <Briefcase className="w-10 h-10 text-primary-foreground/50" />
                                  </div>
                                )}
                              </div>
                              <div className="p-6">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                  <span className="px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                                    {project.category}
                                  </span>
                                  {project.date && <span>· {project.date}</span>}
                                </div>
                                <h3 className="text-xl font-bold mb-2 text-foreground">{project.title}</h3>
                                <p className="text-muted-foreground text-sm line-clamp-3">
                                  {stripMarkdown(project.content).slice(0, 150)}...
                                </p>
                              </div>
                            </article>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </section>

            {/* Tags Cloud */}
            <section className="max-w-6xl mx-auto mt-24">
              <div className="glass rounded-3xl p-8 neu-sm">
                <h2 className="text-2xl font-bold mb-6 text-center">{ui.tags}</h2>
                <div className="flex flex-wrap justify-center gap-3">
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setGlobalSearchQuery(tag)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-muted hover:bg-primary hover:text-primary-foreground transition-colors text-sm font-medium"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                      <span className="text-xs opacity-70">
                        ({posts.filter((p) => p.tags?.includes(tag)).length + wiki.filter((w) => w.tags?.includes(tag)).length})
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </main>
      )}

      <Footer />
    </div>
  );
}
