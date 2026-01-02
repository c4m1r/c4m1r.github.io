import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
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
} from 'lucide-react';
import {
  loadBlogPosts,
  loadWikiArticles,
  loadPictures,
  loadAboutProjects,
  loadAboutMe,
  loadLegalNotice,
  type ContentItem,
  type ImageItem,
} from '../utils/contentLoader';
import { type Language } from '../i18n/translations';
import { useApp } from '../contexts/AppContext';
import cvRaw from '../content/cv/cv-data.json';
import { aboutContent } from '../content/projects/projects';
import { Navigation } from '../components/Navigation';
import { SectionCard } from '../components/SectionCard';
import { Footer } from '../components/Footer';
import { Hero } from '../components/Hero';

type Section = 'home' | 'about' | 'wiki' | 'cv' | 'gallery' | 'blog' | 'search';
type NavSection = Section;

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
  nav: Record<NavSection, string> & { legal: string };
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

const uiTexts: Record<Language, UiText> = {
  en: {
    nav: { home: 'Home', about: 'About', wiki: 'Wiki', cv: 'CV', gallery: 'Gallery', blog: 'Blog', search: 'Search', legal: 'Legal Notice' },
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
    nav: { home: 'Главная', about: 'Обо мне', wiki: 'Вики', cv: 'Резюме', gallery: 'Галерея', blog: 'Блог', search: 'Поиск', legal: 'Правовая информация' },
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
    nav: { home: 'Accueil', about: 'À propos', wiki: 'Wiki', cv: 'CV', gallery: 'Galerie', blog: 'Blog', search: 'Recherche', legal: 'Mentions légales' },
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
    nav: { home: 'Inicio', about: 'Sobre mí', wiki: 'Wiki', cv: 'CV', gallery: 'Galería', blog: 'Blog', search: 'Buscar', legal: 'Aviso legal' },
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
    nav: { home: '首页', about: '关于', wiki: '维基', cv: '简历', gallery: '画廊', blog: '博客', search: '搜索', legal: '法律声明' },
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
    nav: { home: 'ホーム', about: '概要', wiki: 'ウィキ', cv: '履歴書', gallery: 'ギャラリー', blog: 'ブログ', search: '検索', legal: '法的通知' },
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
    nav: { home: '홈', about: '소개', wiki: '위키', cv: '이력서', gallery: '갤러리', blog: '블로그', search: '검색', legal: '법적 고지' },
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

function stripMarkdown(raw: string): string {
  return raw
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*]\([^)]+\)/g, '')
    .replace(/\[[^\]]+]\(([^)]+)\)/g, '$1')
    .replace(/[#>*_`~\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function markdownToHtml(md: string): string {
  const escapeHtml = (text: string) =>
    text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const fenced = md.replace(/```([\s\S]*?)```/g, (_, code) => {
    const safe = escapeHtml(code.trim());
    return `<pre class="bg-muted rounded-xl p-4 overflow-auto text-sm"><code>${safe}</code></pre>`;
  });

  const lines = fenced
    .split('\n')
    .map((line) => {
      if (/^#{3}\s+/.test(line)) {
        return `<h3 class="text-xl font-semibold mb-3 mt-6">${line.replace(/^#{3}\s+/, '')}</h3>`;
      }
      if (/^#{2}\s+/.test(line)) {
        return `<h2 class="text-2xl font-bold mb-4 mt-8">${line.replace(/^#{2}\s+/, '')}</h2>`;
      }
      if (/^#\s+/.test(line)) {
        return `<h1 class="text-3xl font-bold mb-4 mt-10">${line.replace(/^#\s+/, '')}</h1>`;
      }
      if (/^\s*[-*+]\s+/.test(line)) {
        return `<li class="mb-2">${line.replace(/^\s*[-*+]\s+/, '')}</li>`;
      }
      return `<p class="mb-4 text-muted-foreground leading-relaxed">${line}</p>`;
    })
    .join('\n');

  const inline = lines
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-muted text-sm">$1</code>')
    .replace(/!\[([^\]]*)]\(([^)]+)\)/g, '<img alt="$1" src="$2" class="my-4 rounded-xl" />')
    .replace(/\[([^\]]+)]\(([^)]+)\)/g, '<a class="wiki-link" href="$2" target="_blank" rel="noreferrer">$1</a>');

  return inline.replace(/(<li[\s\S]*?<\/li>)/g, '<ul class="list-disc list-inside text-muted-foreground mb-4">$1</ul>');
}

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

function sectionToPath(section: NavSection): string {
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
    default:
      return basePath;
  }
}

export function BlogSite() {
  const { language, setLanguage } = useApp();
  const ui = uiTexts[language] || uiTexts.en;

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
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [activePost, setActivePost] = useState<BlogPostView | null>(null);
  const [activeSection, setActiveSection] = useState<NavSection>('home');
  const [activeWiki, setActiveWiki] = useState<WikiView | null>(null);
  const [wikiCategory, setWikiCategory] = useState<string>('All');
  const [wikiSearch, setWikiSearch] = useState('');
  const [heroKey, setHeroKey] = useState(0);
  const [mainAboutTab, setMainAboutTab] = useState<'about' | 'cv' | 'projects' | 'legal'>('about');
  const [activeCvTab, setActiveCvTab] = useState<'it' | 'education' | 'gamedev' | 'rewards'>('it');
  const [lightbox, setLightbox] = useState<{ id: string; idx: number } | null>(null);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [blogPage, setBlogPage] = useState(1);
  const [wikiPage, setWikiPage] = useState(1);
  const [galleryPage, setGalleryPage] = useState(1);
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const itemsPerPage = 12;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('site-theme', theme);
    setHeroKey((k) => k + 1); // перезапуск анимаций при смене темы
  }, [theme]);


  useEffect(() => {
    let mounted = true;
    Promise.all([
      loadBlogPosts(language),
      loadWikiArticles(undefined, language),
      loadPictures(),
      loadAboutProjects(),
      loadAboutMe(language),
      loadLegalNotice(language),
    ]).then(([loadedPosts, loadedWiki, loadedPics, loadedProjects, loadedAboutMe, loadedLegalNotice]) => {
      if (!mounted) return;
      const mapped = loadedPosts.map(buildView);
      const mappedWiki = loadedWiki.map((item) => ({
        ...item,
        excerpt: stripMarkdown(item.content).slice(0, 200) + (item.content.length > 200 ? '…' : ''),
        html: markdownToHtml(item.content),
        categoryPath: item.category || item.pathSegments?.join('/') || 'wiki',
      }));
      setPosts(mapped);
      setActivePost(null);
      setWiki(mappedWiki);
      setPictures(loadedPics.slice(0, 12));
      setProjects(loadedProjects);
      setAboutMe(loadedAboutMe);
      setLegalNotice(loadedLegalNotice);
      setLoading(false);
      syncFromLocation(window.location.pathname, mapped, mappedWiki);
    });
    return () => {
      mounted = false;
    };
  }, [language]); // Перезагружаем при смене языка

  useEffect(() => {
    syncFromLocation(window.location.pathname, posts, wiki);
  }, [posts, wiki]);

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

  const wikiCategories = useMemo(() => {
    const unique = new Set<string>();
    wiki.forEach((w) => {
      if (w.categoryPath) {
        const parts = w.categoryPath.split('/');
        if (parts[0]) unique.add(parts[0]);
      }
    });
    return ['All', ...Array.from(unique)];
  }, [wiki]);

  const wikiCategoryStats = useMemo(() => {
    const counts: Record<string, number> = {};
    wiki.forEach((w) => {
      const cat = w.categoryPath?.split('/')[0] || 'wiki';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [wiki]);

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
      const matchesCategory = wikiCategory === 'All' || item.categoryPath.startsWith(wikiCategory);
      const q = wikiSearch.toLowerCase();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        stripMarkdown(item.content).toLowerCase().includes(q) ||
        item.categoryPath.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [wiki, wikiCategory, wikiSearch]);

  const galleryAlbums = useMemo(() => {
    const albumMap = new Map<string, number>();
    pictures.forEach((pic) => {
      const album = (pic.path.split('/content/pictures/')[1] || pic.id).split('/')[0] || 'General';
      albumMap.set(album, (albumMap.get(album) || 0) + 1);
    });
    return Array.from(albumMap.entries()).map(([name, count]) => ({ id: name, name, count }));
  }, [pictures]);

  const filteredGalleryImages = useMemo(() => {
    if (!selectedAlbum) return pictures;
    return pictures.filter((pic) => {
      const album = (pic.path.split('/content/pictures/')[1] || pic.id).split('/')[0] || 'General';
      return album === selectedAlbum;
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
      return;
    }
    if (rest === 'blog') {
      setActiveSection('blog');
      setActivePost(null);
      setActiveWiki(null);
      return;
    }
    if (rest === 'about') {
      setActiveSection('about');
      setActivePost(null);
      setActiveWiki(null);
      return;
    }
    if (rest === 'wiki') {
      setActiveSection('wiki');
      setActivePost(null);
      setActiveWiki(null);
      return;
    }
    if (rest === 'cv') {
      setActiveSection('about');
      setActivePost(null);
      setActiveWiki(null);
      return;
    }
    if (rest === 'gallery') {
      setActiveSection('gallery');
      setActivePost(null);
      setActiveWiki(null);
      return;
    }
    if (rest === 'search') {
      setActiveSection('search');
      setActivePost(null);
      setActiveWiki(null);
      return;
    }
    if (rest.startsWith('wiki/')) {
      const wikiSlug = decodeURIComponent(rest.replace(/^wiki\//, '').replace(/\.md$/, ''));
      const matchWiki = wikiList.find((w) => w.relativePath?.replace(/\.md$/, '') === wikiSlug);
      if (matchWiki) {
        setActiveSection('wiki');
        setActiveWiki(matchWiki);
        setActivePost(null);
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
    }
  }

  const handleOpenPost = (post: BlogPostView) => {
    setActivePost(post);
    setActiveWiki(null);
    window.history.pushState({}, '', `${basePath}blog/${post.id}.md`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateSection = (section: NavSection) => {
    setActiveSection(section);
    setActivePost(null);
    setActiveWiki(null);
    window.history.pushState({}, '', sectionToPath(section));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenWiki = (item: WikiView) => {
    setActiveSection('wiki');
    setActiveWiki(item);
    window.history.pushState({}, '', `${basePath}wiki/${item.relativePath}`);
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

  const cv = (cvRaw as any)[language] || (cvRaw as any).en;
  const about = aboutContent[language] || aboutContent.en;
  
  // Парсим aboutMe контент
  const aboutMeData = aboutMe ? {
    name: aboutMe.title || 'C4m1r',
    title: 'IT Engineer',
    bio: aboutMe.content.split('\n\n')[0] || about.bio,
    description: aboutMe.content.split('\n\n').slice(1).join('\n\n') || about.description,
  } : about;

  return (
    <div className="min-h-screen text-foreground">
      <Navigation
        activeSection={activeSection === 'cv' ? 'about' : activeSection}
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
                  <article
                    key={post.id}
                    className="neu rounded-3xl overflow-hidden bg-card card-hover fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => handleOpenPost(post)}
                  >
                    <div className="aspect-video bg-gradient-hero relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 text-sm text-foreground">
                        <span className="inline-block px-3 py-1 text-xs font-medium rounded-full glass">
                          {post.category || 'General'}
                        </span>
                        <span className="flex items-center gap-1 text-xs">
                          <Calendar className="w-4 h-4" />
                          {post.date || '—'}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2 text-foreground hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground line-clamp-2">{post.excerpt}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {post.readingTime}
                        </span>
                        {post.tags?.slice(0, 2).map((tag) => (
                          <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-muted">
                            <Tag className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

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
                    <article
                      key={post.id}
                      className="neu rounded-3xl overflow-hidden bg-card card-hover animate-fade-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                      onClick={() => handleOpenPost(post)}
                    >
                      {/* Thumbnail */}
                      <div className="aspect-video bg-gradient-hero relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <span className="inline-block px-3 py-1 text-xs font-medium rounded-full glass text-foreground">
                            {post.category || 'General'}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {post.date || '—'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {post.readingTime}
                          </span>
                        </div>

                        <h2 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
                          {post.title}
                        </h2>

                        <p className="text-muted-foreground line-clamp-2 mb-4">
                          {post.excerpt}
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {post.tags?.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg bg-muted text-muted-foreground"
                            >
                              <Tag className="w-3 h-3" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </article>
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
        <main className="pt-32 pb-24">
          <div className="container mx-auto px-6">
            <section className="max-w-4xl mx-auto">
              <div className="glass rounded-3xl p-6 md:p-10 neu-sm animate-fade-in">
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

                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {activePost.date || '—'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {activePost.readingTime}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                    {activePost.category || 'General'}
                  </span>
                </div>

                <h2 className="text-3xl md:text-4xl font-bold mb-4">{activePost.title}</h2>
                <p className="text-lg text-muted-foreground mb-8">{activePost.excerpt}</p>

                <div
                  className="prose prose-lg max-w-none text-foreground markdown-body"
                  dangerouslySetInnerHTML={{ __html: activePost.html }}
                />

                {activePost.tags && activePost.tags.length > 0 && (
                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <span className="text-muted-foreground font-medium">{ui.tags}:</span>
                    {activePost.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-muted text-muted-foreground"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
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
                  onClick={() => setMainAboutTab('projects')}
                  className={`inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm ${
                    mainAboutTab === 'projects' ? 'bg-primary/20 text-primary' : 'text-foreground/80 hover:bg-card/60'
                  }`}
                >
                  <Folder className="w-4 h-4" />
                  {ui.projectsTitle.replace(':', '')}
                </button>
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

              {mainAboutTab === 'about' && (
                <>
                  <h2 className="text-4xl font-bold mb-3 gradient-text">{aboutMeData.name}</h2>
                  <p className="text-lg text-primary font-semibold mb-4">{aboutMeData.title}</p>
                  <p className="text-muted-foreground leading-relaxed mb-3">{aboutMeData.bio}</p>
                  <p className="text-muted-foreground leading-relaxed">{aboutMeData.description}</p>
                </>
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
                          {item.details?.map((d: string, di: number) => (
                            <li key={di}>{d}</li>
                          ))}
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

              {mainAboutTab === 'projects' && projects.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-3xl font-bold mb-6 gradient-text">{ui.projectsTitle}</h3>
                  
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
                          className="neu rounded-3xl overflow-hidden bg-card card-hover fade-in-up"
                          style={{ animationDelay: `${index * 80}ms` }}
                        >
                          <div className="aspect-video bg-gradient-hero relative flex items-center justify-center">
                            <Briefcase className="w-10 h-10 text-primary-foreground/50" />
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
                                {project.tags.slice(0, 3).map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-2 py-1 text-xs font-medium rounded-lg bg-muted text-muted-foreground"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </article>
                      ))}
                  </div>
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

          {/* Tags Cloud */}
          <div className="relative overflow-hidden glass rounded-3xl p-8 neu-sm fade-in-up">
            <div className="absolute inset-0 noise-overlay pointer-events-none" />
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-4">{ui.tags}</h3>
              <div className="flex flex-wrap gap-2">
                {Array.from(
                  new Set<string>([
                    ...posts.flatMap((p) => p.tags || []),
                    ...wiki.flatMap((w) => w.tags || []),
                  ]),
                ).map((tag) => (
                  <span key={tag} className="px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-sm">
                    #{tag}
                  </span>
                ))}
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
                  onClick={() => setWikiCategory(cat)}
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
                  const subItems = wiki.filter((w) => w.categoryPath?.startsWith(cat) && cat !== 'All');
                  return (
                    <div key={cat} className="space-y-1">
                      <button
                        onClick={() => setWikiCategory(cat)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                          wikiCategory === cat ? 'neu-sm bg-primary/10 text-primary' : 'hover:bg-muted text-foreground'
                        }`}
                      >
                        <span>{cat}</span>
                        {cat !== 'All' && wikiCategoryStats[cat] ? (
                          <span className="text-xs text-muted-foreground">{wikiCategoryStats[cat]}</span>
                        ) : null}
                      </button>
                      {cat !== 'All' && subItems.length > 0 && (
                        <div className="ml-4 space-y-1">
                          {subItems.slice(0, 4).map((item) => (
                            <button
                              key={item.relativePath}
                              onClick={() => handleOpenWiki(item as WikiView)}
                              className="w-full text-left px-2 py-1 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted"
                            >
                              {item.title}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </aside>

            <div className="space-y-6">
              {activeWiki && (
                <div className="glass rounded-3xl p-6 md:p-10 neu-sm fade-in-up">
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
                      {activeWiki.categoryPath || 'wiki'}
                    </span>
                    <ArrowRight className="w-4 h-4 opacity-60" />
                    <span className="font-medium text-foreground">{activeWiki.title}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
                    <FileText className="w-4 h-4" />
                    <span>{activeWiki.categoryPath || 'wiki'}</span>
                    {activeWiki.updatedAt && <span>· {activeWiki.updatedAt}</span>}
                  </div>
                  <h3 className="text-3xl font-bold mb-4">{activeWiki.title}</h3>
                  <div className="prose prose-lg max-w-none text-foreground markdown-body" dangerouslySetInnerHTML={{ __html: activeWiki.html }} />
                </div>
              )}

              {!activeWiki && (
                <>
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
                    {item.details?.map((d: string, di: number) => (
                      <li key={di}>{d}</li>
                    ))}
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
            <>
              {/* Album/Category Filter */}
              <div className="flex items-center gap-4 mb-8 flex-wrap">
                <button
                  onClick={() => {
                    setSelectedAlbum(null);
                    setGalleryPage(1);
                  }}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                    !selectedAlbum
                      ? 'neu-sm bg-primary text-primary-foreground'
                      : 'glass hover:bg-muted'
                  }`}
                >
                  {ui.gallery.allAlbums}
                </button>
                {galleryAlbums.map((album) => (
                  <button
                    key={album.id}
                    onClick={() => {
                      setSelectedAlbum(album.id);
                      setGalleryPage(1);
                    }}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                      selectedAlbum === album.id
                        ? 'neu-sm bg-primary text-primary-foreground'
                        : 'glass hover:bg-muted'
                    }`}
                  >
                    {album.name}
                    <span className="text-xs opacity-70">({album.count})</span>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
            </>
          )}
        </section>
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
                const galleryResults = pictures.filter(
                  (pic) => pic.name.toLowerCase().includes(query)
                );

                const totalResults = blogResults.length + wikiResults.length + galleryResults.length;

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
                                const slug = encodeURIComponent(item.relativePath!.replace(/\.md$/, ''));
                                window.history.pushState({}, '', `${basePath}wiki/${slug}`);
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
