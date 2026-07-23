import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Grid3x3,
  ArrowRight,
  BookOpen,
  Calendar,
  Image as ImageIcon,
  User,
  FileText,
} from 'lucide-react';
import {
  type AppCategoryId,
  type AppEntry,
} from '../domain/apps/apps.types';
import { type ContentItem } from '../domain/content/types';
import { loadArticles } from '../domain/articles/articles.loader';
import { loadAboutMe, loadLegalNotice } from '../domain/about/about.loader';
import { loadAppEntries } from '../domain/apps/apps.loader';
import { loadWikiArticles, loadWikiCategoryIndex } from '../domain/wiki/wiki.loader';
import { loadAllProjects } from '../domain/projects/projects.loader';
import { type Language } from '../i18n/translations';
import { useApp } from '../contexts/useApp';
import { stripMarkdown, markdownToHtml } from '../domain/content/markdown';
import { loadCvLocale } from '../domain/resume/resume.loader';
import { Navigation } from '../components/Navigation';
import { SectionCard } from '../components/SectionCard';
import { ContentCard } from '../components/ContentCard';
import { Footer } from '../components/Footer';
import { Hero } from '../components/Hero';
import { NewsSection } from '../shells/site/sections/NewsSection';
import { NewsPageSection } from '../shells/site/sections/NewsPageSection';
import { ProjectsSection } from '../shells/site/sections/ProjectsSection';
import { GallerySection } from '../shells/site/sections/GallerySection';
import { GalleryPageSection } from '../shells/site/sections/GalleryPageSection';
import { ArticlesSection, type ArticleItem } from '../shells/site/sections/ArticlesSection';
import { ArticleDetailSection } from '../shells/site/sections/ArticleDetailSection';
import { WikiSection } from '../shells/site/sections/WikiSection';
import { AboutSection } from '../shells/site/sections/AboutSection';
import { SearchSection } from '../shells/site/sections/SearchSection';
import { useNews } from '../domain/news/useNews';
import { useGlobalSearch, type SearchResult } from '../domain/search/useGlobalSearch';
import { type NewsItem } from '../domain/news/news.types';
import { type Section, type NavSection, type TranslationSectionNav } from '../shells/site/siteTypes';
import { sectionToPath, parsePath, routes } from '../shells/site/siteRoutes';


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


type UiText = {
  nav: Record<TranslationSectionNav, string> & { legal: string };
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
    nav: { home: 'Главная', about: 'Обо мне', wiki: 'Вики', cv: 'N/A', gallery: 'Галерея', blog: 'Блог', apps: 'Приложения', search: 'Поиск', news: 'Новости', legal: 'Правовая информация' },
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
    nav: { home: '首页', about: '关于我', wiki: '维基', cv: '简历', gallery: '画廊', blog: '博客', apps: '应用', search: '搜索', news: '新闻', legal: '法律声明' },
    heroTitle: '创意开发者',
    heroSubtitle: '用代码、创造力和热情打造美丽的数字体验。探索我的作品、想法和知识库。',
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
    aboutTitle: '关于我',
    projectsTitle: '项目:',
    sections: { explore: '探索我的世界', exploreSubtitle: '深入了解我的工作和兴趣的不同方面' },
    apps: {
      title: '应用',
      subtitle: '我的项目展示',
      selectPrompt: '选择一个应用在中心查看。',
      descriptionLabel: '描述',
      platformsLabel: '平台',
      technologiesLabel: '技术',
      badgesLabel: '徽章',
      dateLabel: '日期',
      openFullLabel: '完整打开',
      categories: {
        ready: '就绪应用',
        prototype: '原型',
        'webos-emulation': 'WebOS 模拟',
      },
    },
    latestPosts: { title: '最新文章', subtitle: '新鲜想法和观点', viewAll: '查看全部' },
    cta: { letsCreate: '让我们', together: '一起创造', description: '无论你有一个项目想法，还是只是想联系，我都很乐意听到你的消息。', getInTouch: '联系我' },
    blog: { title: '博客', subtitle: '关于开发、设计和技术的想法、教程和观点。', description: '关于开发、设计和技术的想法、教程和观点。' },
    wiki: { description: '我日常使用的概念、工具和技术的精选知识库。' },
    cv: { experience: '经验', education: '教育', prototypes: '原型', rewards: '奖励', print: '打印', downloadPdf: '下载 PDF', viewDemo: '查看演示' },
    about: { description: '了解我的经历、技能以及驱动我创造热情的动力。' },
    gallery: { description: '穿越项目、摄影和创意探索的视觉旅程。', allAlbums: '所有相册' },
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


export function BlogSite() {
  const { language, setLanguage } = useApp();
  const ui = uiTexts[language] || uiTexts.en;

  const { news: newsItems } = useNews();
  const {
    query: globalSearchQuery,
    setQuery: setGlobalSearchQuery,
    results: globalSearchResults,
    loading: globalSearchLoading,
  } = useGlobalSearch();

  const [theme, setTheme] = useState<string>(() => localStorage.getItem('site-theme') || 'default');
  const [posts, setPosts] = useState<BlogPostView[]>([]);
  const [wiki, setWiki] = useState<WikiView[]>([]);
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
  const [blogPage, setBlogPage] = useState(1);
  const [wikiPage, setWikiPage] = useState(1);
  const [selectedPictureId, setSelectedPictureId] = useState<string | null>(null);
  const [apps, setApps] = useState<AppEntry[]>([]);
  const [selectedApp, setSelectedApp] = useState<AppEntry | null>(null);
  const [iframeHeight, setIframeHeight] = useState(500);
  const [isResizing, setIsResizing] = useState(false);
  const [expandedWikiCategories, setExpandedWikiCategories] = useState<Set<string>>(new Set());
  const itemsPerPage = 12;

  const syncFromLocation = useCallback((
    pathname: string,
    postsList: BlogPostView[],
    wikiList: WikiView[],
    projectList: ContentItem[],
  ) => {
    const route = parsePath(pathname);

    setActivePost(null);
    setActiveWiki(null);
    setActiveNews(null);
    setActiveProject(null);
    setActiveSection(route.section);

    if (route.newsId && newsItems.length > 0) {
      const matchNews = newsItems.find((n) => n.id === route.newsId);
      setActiveNews(matchNews ?? null);
    }

    if (route.searchQuery) {
      setGlobalSearchQuery(route.searchQuery);
    }

    if (route.projectId) {
      const matchProject = projectList.find((p) => p.id === route.projectId);
      if (matchProject) {
        setActiveSection('project');
        setActiveProject(matchProject);
      }
      return;
    }

    if (route.galleryItemId) {
      setSelectedPictureId(route.galleryItemId);
    }

    if (route.wikiSlug) {
      const matchWiki = wikiList.find(
        (w) => w.relativePath?.replace(/\.md$/, '') === route.wikiSlug
      );
      if (matchWiki) {
        setActiveSection('wiki');
        setActiveWiki(matchWiki);
      }
      return;
    }

    if (route.postId) {
      const maybePost = postsList.find((p) => p.id === route.postId);
      if (maybePost) {
        setActiveSection(route.section === 'blog' ? 'blog' : 'home');
        setActivePost(maybePost);
      }
    }
  }, [newsItems, setGlobalSearchQuery]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('site-theme', theme);
    setHeroKey((k) => k + 1);
  }, [theme]);
  useEffect(() => {
    if (wikiCategory === 'All') {
      setWikiCategoryIndex(null);
      return;
    }

    loadWikiCategoryIndex(wikiCategory, language)
      .then(index => setWikiCategoryIndex(index))
      .catch(err => console.error('Failed to load category index:', err));
  }, [wikiCategory, language]);
  useEffect(() => {
    const handleWikiLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('[data-wiki-link]') as HTMLElement;
      
      if (link) {
        e.preventDefault();
        const wikiLink = link.getAttribute('data-wiki-link');
        
        if (wikiLink) {
          const targetArticle = wiki.find(article => {
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
      loadAllProjects(language),
      loadAboutMe(language),
      loadLegalNotice(language),
    ]).then(([loadedPosts, loadedWiki, loadedProjects, loadedAboutMe, loadedLegalNotice]) => {
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
      setProjects(loadedProjects);
      setAboutMe(loadedAboutMe);
      setLegalNotice(loadedLegalNotice);
      setLoading(false);
      setActivePost(prev => {
        if (!prev) return null;
        const updated = mapped.find(p => p.id === prev.id);
        return updated ? { ...updated } : null;
      });
      setActiveWiki(prev => {
        if (!prev) return null;
        const updated = mappedWiki.find(w => w.id === prev.id);
        return updated ? { ...updated } : null;
      });
      setActiveProject(prev => {
        if (!prev) return null;
        const updated = loadedProjects.find(p => p.id === prev.id);
        return updated ? { ...updated } : null;
      });
      
      syncFromLocation(window.location.pathname + window.location.search, mapped, mappedWiki, loadedProjects);
    });
    return () => {
      mounted = false;
    };
  }, [language]);

  useEffect(() => {
    syncFromLocation(window.location.pathname + window.location.search, posts, wiki, projects);
  }, [posts, wiki, projects]);

  useEffect(() => {
    if (activeSection !== 'search') return;

    const timeout = window.setTimeout(() => {
      const nextPath = globalSearchQuery.trim() ? routes.search(globalSearchQuery.trim()) : routes.search();
      if (window.location.pathname + window.location.search !== nextPath) {
        window.history.replaceState({}, '', nextPath);
      }
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [activeSection, globalSearchQuery]);

  useEffect(() => {
    let mounted = true;
    loadAppEntries(language).then((loaded) => {
      if (!mounted) return;
      setApps(loaded);
      const route = parsePath(window.location.pathname + window.location.search);
      setSelectedApp((prev) => {
        if (route.appId) {
          return loaded.find((app) => app.id === route.appId) ?? loaded[0] ?? null;
        }
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
    projects.forEach((project) => project.tags?.forEach((tag) => unique.add(tag)));
    return Array.from(unique).sort();
  }, [posts, wiki, projects]);

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
  const paginatedBlog = useMemo(() => {
    const start = (blogPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, blogPage, itemsPerPage]);

  const paginatedWiki = useMemo(() => {
    const start = (wikiPage - 1) * itemsPerPage;
    return filteredWiki.slice(start, start + itemsPerPage);
  }, [filteredWiki, wikiPage, itemsPerPage]);

  const totalBlogPages = Math.ceil(filtered.length / itemsPerPage);
  const totalWikiPages = Math.ceil(filteredWiki.length / itemsPerPage);

  const latestPosts = posts.slice(0, 3);


  function syncFromLocation(pathname: string, postsList: BlogPostView[], wikiList: WikiView[], projectList = projects) {
    const route = parsePath(pathname);

    setActivePost(null);
    setActiveWiki(null);
    setActiveNews(null);
    setActiveProject(null);
    setActiveSection(route.section);

    if (route.newsId && newsItems.length > 0) {
      const matchNews = newsItems.find((n) => n.id === route.newsId);
      setActiveNews(matchNews ?? null);
    }

    if (route.searchQuery) {
      setGlobalSearchQuery(route.searchQuery);
    }

    if (route.projectId) {
      const matchProject = projectList.find((p) => p.id === route.projectId);
      if (matchProject) {
        setActiveSection('project');
        setActiveProject(matchProject);
      }
      return;
    }

    if (route.galleryItemId) {
      setSelectedPictureId(route.galleryItemId);
    }

    if (route.wikiSlug) {
      const matchWiki = wikiList.find(
        (w) => w.relativePath?.replace(/\.md$/, '') === route.wikiSlug
      );
      if (matchWiki) {
        setActiveSection('wiki');
        setActiveWiki(matchWiki);
      }
      return;
    }

  useEffect(() => {
    const route = parsePath(window.location.pathname + window.location.search);
    if (!route.appId) return;
    setActiveSection('apps');
    setSelectedApp(apps.find((app) => app.id === route.appId) ?? null);
  }, [apps]);

  const handleOpenPost = (post: ArticleItem) => {
    const fullPost = posts.find((p) => p.id === post.id);
    if (fullPost) {
      setActivePost(fullPost);
      setActiveWiki(null);
      setActiveNews(null);
      window.history.pushState({}, '', routes.blog(fullPost.id));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
    window.history.pushState({}, '', routes.wiki(item.relativePath?.replace(/\.md$/, '')));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenNews = (item: NewsItem) => {
    setActiveSection('news');
    setActiveNews(item);
    setActivePost(null);
    setActiveWiki(null);
    window.history.pushState({}, '', routes.news(item.id));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  const openSearchForQuery = (query: string) => {
    setActivePost(null);
    setActiveWiki(null);
    setActiveNews(null);
    setActiveProject(null);
    setActiveSection('search');
    setGlobalSearchQuery(query);
    window.history.pushState({}, '', routes.search(query));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getGlobalTagCount = (tag: string) =>
    posts.filter((p) => p.tags?.includes(tag)).length +
    wiki.filter((w) => w.tags?.includes(tag)).length +
    projects.filter((project) => project.tags?.includes(tag)).length;

  const handleOpenSearchResult = (result: SearchResult) => {
    const { item, kind } = result;

    if (kind === 'articles') {
      handleOpenPost(item as ArticleItem);
      return;
    }

    if (kind === 'wiki') {
      const wikiItem = wiki.find((entry) => entry.id === item.id) || (item as WikiView);
      handleOpenWiki(wikiItem);
      return;
    }

    if (kind === 'news') {
      handleOpenNews(item as NewsItem);
      return;
    }

    if (kind === 'projects') {
      const project = projects.find((entry) => entry.id === item.id) || item;
      setActiveProject(project);
      setActivePost(null);
      setActiveWiki(null);
      setActiveNews(null);
      setActiveSection('project');
      window.history.pushState({}, '', routes.project(project.id));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (kind === 'gallery') {
      setSelectedPictureId(item.id);
      setActivePost(null);
      setActiveWiki(null);
      setActiveNews(null);
      setActiveProject(null);
      setActiveSection('gallery');
      window.history.pushState({}, '', routes.galleryItem(item.id));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (kind === 'apps') {
      const app = apps.find((entry) => entry.id === item.id);
      setSelectedApp(app ?? null);
      setActiveSection('apps');
      window.history.pushState({}, '', routes.app(item.id));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
        themeOptions={themeOptions}
        navLabels={ui.nav}
      />

      {activeSection === 'home' && (
        <Hero key={heroKey} title={ui.heroTitle} subtitle={ui.heroSubtitle} theme={theme} />
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
              window.history.pushState({}, '', routes.projects());
            }}
          />

          {/* Gallery Preview */}
          <GallerySection
            limit={4}
            onViewAll={() => {
              setActiveSection('gallery');
              window.history.pushState({}, '', routes.gallery());
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
        <ArticlesSection
          labels={{
            title: ui.blog.title,
            subtitle: ui.blog.subtitle,
            searchPlaceholder: ui.searchPlaceholder,
            loading: ui.loading,
            nothing: ui.nothing,
          }}
          loading={loading}
          paginatedPosts={paginatedBlog}
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          currentPage={blogPage}
          totalPages={totalBlogPages}
          onPageChange={setBlogPage}
          onOpenPost={handleOpenPost}
        />
      )}

      {/* Blog Post Detail View */}
      {(activeSection === 'home' || activeSection === 'blog') && activePost && (
        <ArticleDetailSection
          activePost={activePost}
          language={language}
          labels={{
            back: ui.back,
            tags: ui.tags,
            blogLabel: ui.nav.blog,
          }}
          onBack={() => {
            setActivePost(null);
            window.history.pushState({}, '', activeSection === 'blog' ? routes.blog() : routes.home());
          }}
          onTagClick={(tag) => {
            setActivePost(null);
            setActiveSection('search');
            setGlobalSearchQuery(tag);
            window.history.pushState({}, '', routes.search(tag));
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
        />
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
                    window.history.pushState({}, '', routes.about());
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
                            window.history.pushState({}, '', routes.search(tag));
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
        <AboutSection
          ui={ui}
          language={language}
          aboutMe={aboutMe}
          legalNotice={legalNotice}
          projects={projects}
          posts={posts}
          wiki={wiki}
          mainAboutTab={mainAboutTab}
          setMainAboutTab={setMainAboutTab}
          activeCvTab={activeCvTab}
          setActiveCvTab={setActiveCvTab}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          setActiveProject={setActiveProject}
          setActiveSection={setActiveSection}
          setGlobalSearchQuery={setGlobalSearchQuery}
        />
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
                      title="Drag to resize"
                    >
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="flex flex-col items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          <div className="text-[10px] uppercase tracking-[0.3em] text-foreground font-bold">Resize</div>
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
            <div className="max-w-6xl mx-auto">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,300px)_1fr]">
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
                                <div className="text-[10px] text-muted-foreground mt-0.5">{app.date || 'N/A'}</div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
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
                      <div className="text-sm font-semibold text-foreground">{selectedApp.date || 'N/A'}</div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-semibold">
                        {ui.apps?.platformsLabel || 'Platforms'}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(!selectedApp.platforms || selectedApp.platforms.length === 0) ? (
                          <span className="text-sm text-muted-foreground">N/A</span>
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
                          <span className="text-sm text-muted-foreground">N/A</span>
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
                          <span className="text-sm text-muted-foreground">N/A</span>
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
        <WikiSection
          ui={ui}
          language={language}
          wikiCategories={wikiCategories}
          wikiCategoryStats={wikiCategoryStats}
          wikiCategoryTree={wikiCategoryTree}
          expandedWikiCategories={expandedWikiCategories}
          setExpandedWikiCategories={setExpandedWikiCategories}
          wikiCategory={wikiCategory}
          setWikiCategory={setWikiCategory}
          wikiSearch={wikiSearch}
          setWikiSearch={setWikiSearch}
          activeWiki={activeWiki}
          setActiveWiki={(w) => setActiveWiki(w as WikiView | null)}
          wikiCategoryIndex={wikiCategoryIndex}
          paginatedWiki={paginatedWiki}
          wikiPage={wikiPage}
          totalWikiPages={totalWikiPages}
          setWikiPage={setWikiPage}
          getTagCount={getGlobalTagCount}
          handleOpenWiki={(item) => handleOpenWiki(item as WikiView)}
          setActiveSection={setActiveSection}
          setGlobalSearchQuery={setGlobalSearchQuery}
        />
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
                    {item.subtitle && <span>• {item.subtitle}</span>}
                  </div>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {item.details?.map((d: string, di: number) => {
                      const parts: (string | JSX.Element)[] = [];
                      let lastIndex = 0;
                      const regex = /\^([^\^]+)\^([^\^]+)\^/g;
                      let match;
                      
                      while ((match = regex.exec(d)) !== null) {
                        if (match.index > lastIndex) {
                          parts.push(d.substring(lastIndex, match.index));
                        }
                        
                        const category = match[1];
                        const tech = match[2];
                        parts.push(
                          <span
                            key={`${di}-${match.index}`}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors mx-0.5"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveSection('search');
                              setGlobalSearchQuery(tech);
                              window.history.pushState({}, '', routes.search(tech));
                            }}
                          >
                            <span className="text-[10px] opacity-70">{category}</span>
                            <span className="font-medium">{tech}</span>
                          </span>
                        );
                        
                        lastIndex = match.index + match[0].length;
                      }
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
        <GalleryPageSection
          ui={ui}
          language={language}
          initialPictureId={selectedPictureId}
          onClearInitialPicture={() => setSelectedPictureId(null)}
        />
      )}

      {/* News Full Section */}
      {activeSection === 'news' && (
        <NewsPageSection
          ui={ui}
          language={language}
          activeNews={activeNews}
          setActiveNews={setActiveNews}
          setActiveSection={setActiveSection}
          setGlobalSearchQuery={setGlobalSearchQuery}
          handleOpenNews={handleOpenNews}
        />
      )}


      {/* Search Page */}
      {activeSection === 'search' && (
        <SearchSection
          labels={{
            title: ui.search.title,
            subtitle: ui.search.subtitle,
            placeholder: ui.search.placeholder,
            allContent: ui.search.allContent,
            results: ui.search.results,
            nothing: ui.nothing,
            loading: ui.loading,
            tags: ui.tags,
            blog: ui.nav.blog,
            wiki: ui.nav.wiki,
            news: ui.nav.news,
            gallery: ui.nav.gallery,
            projects: ui.projectsTitle,
          }}
          query={globalSearchQuery}
          setQuery={setGlobalSearchQuery}
          results={globalSearchResults}
          loading={globalSearchLoading}
          allTags={allTags}
          getTagCount={getGlobalTagCount}
          onTagClick={openSearchForQuery}
          onOpenResult={handleOpenSearchResult}
        />
      )}

      <Footer />
    </div>
  );
}
